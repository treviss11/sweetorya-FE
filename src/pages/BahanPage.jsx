import React, { useState, useEffect } from 'react';
import { fetchBahan, createNewBahan, updateBahanStockApi } from '../services/api';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const SATUAN_BAHAN = ['ltr', 'kg', 'gr', 'cc', 'ml', 'pack', 'biji', 'pcs', 'lembar'];

function BahanPage() {
    const [bahanList, setBahanList] = useState([]);
    const [newItem, setNewItem] = useState({ 
        nama_bahan: '', stok: '', satuan: '', total_harga: '', 
        tgl_beli: '', supplier: '' 
    });
    
    const [updateJumlah, setUpdateJumlah] = useState({});
    const [searchKeyword, setSearchKeyword] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

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

    const handleAddItem = async (e) => {
        e.preventDefault(); setFormError(''); setSuccessMsg('');
        
        if (!newItem.nama_bahan || !newItem.stok || !newItem.satuan || !newItem.total_harga || !newItem.tgl_beli) {
            setFormError('Nama, stok, satuan, harga, dan tgl beli wajib diisi.'); return;
        }
        try {
            const res = await createNewBahan(newItem);
            setNewItem({ nama_bahan: '', stok: '', satuan: '', total_harga: '', tgl_beli: '', supplier: '' });
            loadBahan(activeSearch);
            alert(res.data.msg || 'Berhasil disimpan.');
        } catch (err) {
            setFormError(err.response?.data?.msg || 'Gagal menyimpan bahan.');
        }
    };

    const handleUpdateStock = async (itemId) => {
        const jumlahKeluar = updateJumlah[itemId];
        if (!jumlahKeluar || jumlahKeluar <= 0) { alert('Masukkan jumlah keluar yang valid.'); return; }
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

            <div className="border dark:border-gray-700 rounded p-4 mb-8 bg-gray-50 dark:bg-gray-700/30">
                 <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Input Bahan (Baru / Restock)</h3>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Jika nama bahan sudah ada, stok dan harga akan <b>ditambahkan</b> ke data lama (Restock).
                 </p>
                 
                 {formError && <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 p-2 rounded mb-3 text-sm">{formError}</div>}
                 
                <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                        <label className={labelClass}>Nama Bahan</label>
                        <input type="text" name="nama_bahan" value={newItem.nama_bahan} onChange={handleNewItemChange} placeholder="Contoh: Tepung Terigu" className={inputClass} required />
                    </div>
                    
                    <div className="md:col-span-1">
                        <label className={labelClass}>Tgl Beli</label>
                        <input type="date" name="tgl_beli" value={newItem.tgl_beli} onChange={handleNewItemChange} className={inputClass} required />
                    </div>

                    <div className="md:col-span-1">
                        <label className={labelClass}>Stok Masuk</label>
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
                        <label className={labelClass}>Supplier (Opsional)</label>
                        <input type="text" name="supplier" value={newItem.supplier} onChange={handleNewItemChange} placeholder="Nama Toko" className={inputClass} />
                    </div>

                    <div className="md:col-span-4 flex items-end">
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow font-bold">
                            Simpan / Restock
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
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Tgl Beli</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Supplier</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Nama Bahan</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Sisa Stok</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Total Modal</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Kurangi Stok</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {bahanList.map(item => (
                                <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                        {item.tgl_beli ? new Date(item.tgl_beli).toLocaleDateString('id-ID') : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                                        {item.supplier || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{item.nama_bahan}</td>
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
                                                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-20 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                                            />
                                            <button onClick={() => handleUpdateStock(item._id)} className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-xs shadow-sm">
                                                Kurangi
                                            </button>
                                        </div>
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