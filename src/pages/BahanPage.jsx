import React, { useState, useEffect } from 'react';
import { fetchBahan, createNewBahan, updateBahanStockApi, updateBahanApi, deleteBahanApi } from '../services/api';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const SATUAN_BAHAN = ['ltr', 'kg', 'gr', 'cc', 'ml', 'pack', 'biji', 'pcs', 'lembar', 'botol', 'kotak'];

function BahanPage() {
    const [bahanList, setBahanList] = useState([]);
    const [newItem, setNewItem] = useState({ 
        nama_bahan: '', stok: '', satuan: '', total_harga: '', 
        tgl_beli: '', supplier: '' 
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const [updateJumlah, setUpdateJumlah] = useState({});
    const [searchKeyword, setSearchKeyword] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');

    const loadBahan = async (search = '') => {
        setLoading(true); setError('');
        try {
            const res = await fetchBahan(search);
            setBahanList(res.data);
            const initialUpdates = {};
            res.data.forEach(item => { initialUpdates[item._id] = '' });
            setUpdateJumlah(initialUpdates);
        } catch (err) { setError('Gagal memuat data bahan.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadBahan(activeSearch); }, [activeSearch]);

    const handleSearch = (e) => { e.preventDefault(); setActiveSearch(searchKeyword); };
    const handleResetSearch = () => { setSearchKeyword(''); setActiveSearch(''); };
    const handleNewItemChange = (e) => setNewItem({ ...newItem, [e.target.name]: e.target.value });
    const handleUpdateJumlahChange = (itemId, value) => setUpdateJumlah({ ...updateJumlah, [itemId]: value });

    const handleEditClick = (item) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsEditing(true);
        setEditId(item._id);
        setNewItem({
            nama_bahan: item.nama_bahan,
            stok: item.stok,
            satuan: item.satuan,
            total_harga: item.modal_dikeluarkan,
            tgl_beli: item.tgl_beli ? item.tgl_beli.split('T')[0] : '',
            supplier: item.supplier
        });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        setNewItem({ nama_bahan: '', stok: '', satuan: '', total_harga: '', tgl_beli: '', supplier: '' });
        setFormError('');
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault(); setFormError('');
        
        if (!newItem.nama_bahan || !newItem.stok || !newItem.satuan || !newItem.total_harga || !newItem.tgl_beli) {
            setFormError('Semua field bertanda wajib diisi.'); return;
        }

        try {
            if (isEditing) {
                await updateBahanApi(editId, newItem);
                alert('Data bahan berhasil diperbarui.');
                handleCancelEdit();
            } else {
                await createNewBahan(newItem);
                alert('Bahan baru berhasil dicatat.');
                setNewItem({ nama_bahan: '', stok: '', satuan: '', total_harga: '', tgl_beli: '', supplier: '' });
            }
            loadBahan(activeSearch);
        } catch (err) {
            setFormError(err.response?.data?.msg || 'Gagal menyimpan data.');
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Yakin hapus data ini? Data yang dihapus tidak bisa dikembalikan.")) return;
        try {
            await deleteBahanApi(id);
            loadBahan(activeSearch);
        } catch (err) {
            alert('Gagal menghapus data.');
        }
    }

    const handleUpdateStock = async (itemId) => {
        const jumlahKeluar = updateJumlah[itemId];
        if (!jumlahKeluar || jumlahKeluar <= 0) { alert('Jumlah valid diperlukan.'); return; }
        try {
            await updateBahanStockApi(itemId, { jumlah_keluar: parseFloat(jumlahKeluar) });
            loadBahan(activeSearch);
            alert('Stok berhasil dikurangi.');
        } catch (err) { alert(err.response?.data?.msg || 'Gagal mengurangi stok.'); }
    };

    const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm";
    const labelClass = "block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase";

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700 transition-colors duration-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Manajemen Stok Bahan</h2>

            <div className={`border dark:border-gray-700 rounded p-4 mb-8 ${isEditing ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200' : 'bg-gray-50 dark:bg-gray-700/30'}`}>
                 <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {isEditing ? '✏️ Edit Data Bahan' : '➕ Input Bahan Baru'}
                    </h3>
                    {isEditing && (
                        <button onClick={handleCancelEdit} className="text-sm text-red-500 hover:underline">Batal Edit</button>
                    )}
                 </div>
                 
                 {formError && <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 p-2 rounded mb-3 text-sm">{formError}</div>}
                 
                <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                        <label className={labelClass}>Nama Bahan</label>
                        <input type="text" name="nama_bahan" value={newItem.nama_bahan} onChange={handleNewItemChange} placeholder="Contoh: Tepung Terigu" className={inputClass} required />
                    </div>
                    
                    <div className="md:col-span-1">
                        <label className={labelClass}>Tgl Beli</label>
                        <input type="date" name="tgl_beli" value={newItem.tgl_beli} onChange={handleNewItemChange} className={inputClass} required />
                    </div>

                    <div className="md:col-span-1">
                        <label className={labelClass}>{isEditing ? 'Stok (Total)' : 'Stok Masuk'}</label>
                        <input type="number" step="0.01" name="stok" value={newItem.stok} onChange={handleNewItemChange} placeholder="0" className={inputClass} required />
                    </div>
                    
                    <div className="md:col-span-1">
                        <label className={labelClass}>Satuan</label>
                        <select name="satuan" value={newItem.satuan} onChange={handleNewItemChange} className={inputClass} required>
                            <option value="">Pilih...</option>
                            {SATUAN_BAHAN.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="md:col-span-1">
                        <label className={labelClass}>Harga Beli</label>
                        <input type="number" name="total_harga" value={newItem.total_harga} onChange={handleNewItemChange} placeholder="Rp" className={inputClass} required />
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClass}>Supplier</label>
                        <input type="text" name="supplier" value={newItem.supplier} onChange={handleNewItemChange} placeholder="Nama Toko" className={inputClass} />
                    </div>

                    <div className="md:col-span-4 flex items-end">
                        <button type="submit" className={`w-full py-2 px-4 rounded shadow font-bold text-white ${isEditing ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {isEditing ? 'Update Data' : 'Simpan Data'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 border-b dark:border-gray-700 pb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Daftar Stok Bahan</h3>
                <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                    <input type="text" placeholder="Cari bahan..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm w-full md:w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                    <button type="submit" className="bg-gray-700 text-white px-4 py-1 rounded text-sm">Cari</button>
                    {activeSearch && <button type="button" onClick={handleResetSearch} className="bg-red-500 text-white px-3 py-1 rounded text-sm">✖</button>}
                </form>
            </div>

            {loading && <div className="text-center py-4 text-gray-500">Loading...</div>}
            
            {!loading && !error && (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-700 dark:bg-gray-900 text-white">
                            <tr>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase">Tgl</th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase">Barang</th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase">Stok</th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase">Modal</th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase">Kurangi Stok</th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {bahanList.map(item => (
                                <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                        {item.tgl_beli ? new Date(item.tgl_beli).toLocaleDateString('id-ID') : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                        {item.nama_bahan}
                                        <div className="text-xs text-gray-500 font-normal">{item.supplier}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                        {item.stok} <span className="text-gray-500 text-xs">{item.satuan}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{formatCurrency(item.modal_dikeluarkan)}</td>
                                    
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number" step="0.01"
                                                value={updateJumlah[item._id] || ''}
                                                onChange={(e) => handleUpdateJumlahChange(item._id, e.target.value)}
                                                placeholder="Keluar"
                                                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-16 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                            <button onClick={() => handleUpdateStock(item._id)} className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded text-xs">
                                                Go
                                            </button>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-center space-x-2 whitespace-nowrap">
                                        <button onClick={() => handleEditClick(item)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 px-2 py-1 rounded">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs font-bold border border-red-200 dark:border-red-800 px-2 py-1 rounded">
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default BahanPage;