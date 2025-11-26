import React, { useState, useEffect } from 'react';
import { fetchAssets, createNewAsset, updateAssetKondisiApi, deleteAssetApi, updateAssetFullApi } from '../services/api';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const KONDISI_OPTIONS = ['Baik', 'Rusak', 'Hilang'];

function InventarisPage() {
    const [assetList, setAssetList] = useState([]);
    const [form, setForm] = useState({ 
        nama_barang: '', jumlah: '', harga_satuan: '', total_harga: '', tgl_pembelian: '', kondisi: 'Baik' 
    });
    
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');

    const loadAssets = async (search = '') => {
        setLoading(true); setError('');
        try {
            const res = await fetchAssets(search);
            setAssetList(res.data);
        } catch (err) { setError('Gagal memuat data inventaris.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadAssets(activeSearch); }, [activeSearch]);

    const handleSearch = (e) => { e.preventDefault(); setActiveSearch(searchKeyword); };
    const handleResetSearch = () => { setSearchKeyword(''); setActiveSearch(''); };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'jumlah' || name === 'harga_satuan') {
                const qty = name === 'jumlah' ? value : prev.jumlah;
                const price = name === 'harga_satuan' ? value : prev.harga_satuan;
                if (qty && price) updated.total_harga = qty * price;
            }
            return updated;
        });
    };

    const startEdit = (item) => {
        setForm({
            nama_barang: item.nama_barang,
            jumlah: item.jumlah,
            harga_satuan: item.harga_satuan,
            total_harga: item.total_harga,
            tgl_pembelian: item.tgl_pembelian ? item.tgl_pembelian.split('T')[0] : '',
            kondisi: item.kondisi
        });
        setEditId(item._id);
        setIsEditing(true);
        setFormError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setForm({ nama_barang: '', jumlah: '', harga_satuan: '', total_harga: '', tgl_pembelian: '', kondisi: 'Baik' });
        setIsEditing(false);
        setEditId(null);
        setFormError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setFormError('');
        if (!form.nama_barang || !form.jumlah || !form.harga_satuan || !form.tgl_pembelian) {
            setFormError('Semua field wajib diisi.'); return;
        }

        try {
            if (isEditing) {
                await updateAssetFullApi(editId, form);
                alert('Data berhasil diperbarui.');
                cancelEdit(); 
            } else {
                await createNewAsset(form);
                alert('Inventaris baru berhasil ditambahkan.');
                setForm({ nama_barang: '', jumlah: '', harga_satuan: '', total_harga: '', tgl_pembelian: '', kondisi: 'Baik' });
            }
            loadAssets(activeSearch);
        } catch (err) {
            setFormError(err.response?.data?.msg || 'Gagal menyimpan data.');
        }
    };

    const handleUpdateKondisi = async (itemId, newKondisi) => {
        try {
            await updateAssetKondisiApi(itemId, { kondisi_baru: newKondisi });
            loadAssets(activeSearch);
        } catch (err) { alert('Gagal update kondisi.'); }
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm('Yakin hapus permanen?')) return;
        try {
            await deleteAssetApi(itemId);
            loadAssets(activeSearch);
        } catch (err) { alert('Gagal hapus.'); }
    };

    const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm";
    const labelClass = "block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase";

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700 transition-colors duration-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Manajemen Aset</h2>
            <div className={`border dark:border-gray-700 rounded p-5 mb-8 ${isEditing ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200' : 'bg-gray-50 dark:bg-gray-700/30'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {isEditing ? '✏️ Edit Data Aset' : '➕ Tambah Aset Baru'}
                    </h3>
                    {isEditing && (
                        <button onClick={cancelEdit} className="text-sm text-red-500 hover:underline">Batal Edit</button>
                    )}
                </div>
                
                {formError && <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 p-2 rounded mb-4 text-sm">{formError}</div>}
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                        <label className={labelClass}>Nama Barang</label>
                        <input type="text" name="nama_barang" value={form.nama_barang} onChange={handleFormChange} className={inputClass} placeholder="Contoh: Oven Kirin" required />
                    </div>
                    
                    <div className="md:col-span-1">
                        <label className={labelClass}>Tgl Beli</label>
                        <input type="date" name="tgl_pembelian" value={form.tgl_pembelian} onChange={handleFormChange} className={inputClass} required />
                    </div>

                    <div className="md:col-span-1">
                        <label className={labelClass}>Jumlah</label>
                        <input type="number" name="jumlah" value={form.jumlah} onChange={handleFormChange} className={inputClass} placeholder="0" required min="1" />
                    </div>

                    <div className="md:col-span-1">
                        <label className={labelClass}>Harga Satuan</label>
                        <input type="number" name="harga_satuan" value={form.harga_satuan} onChange={handleFormChange} className={inputClass} placeholder="Rp 0" required />
                    </div>

                    <div className="md:col-span-1">
                        <label className={labelClass}>Total (Auto)</label>
                        <input type="number" value={form.total_harga} disabled className={`${inputClass} bg-gray-100 dark:bg-gray-600 cursor-not-allowed`} placeholder="Rp 0" />
                    </div>

                    <div className="md:col-span-1">
                        <label className={labelClass}>Kondisi</label>
                        <select name="kondisi" value={form.kondisi} onChange={handleFormChange} className={inputClass}>
                            {KONDISI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>

                    <div className="md:col-span-5 flex items-end">
                        <button type="submit" className={`w-full py-2 px-4 rounded font-bold text-white shadow ${isEditing ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {isEditing ? 'Update Data' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Daftar Aset</h3>
                <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                    <input type="text" placeholder="Cari nama aset..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm w-full md:w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                    <button type="submit" className="bg-gray-700 text-white px-4 py-1 rounded text-sm">Cari</button>
                    {activeSearch && <button type="button" onClick={handleResetSearch} className="bg-red-500 text-white px-3 py-1 rounded text-sm">✖</button>}
                </form>
            </div>

            {loading && <div className="text-center py-4 text-gray-500">Loading...</div>}
            
            {!loading && (
                 <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-700 dark:bg-gray-900 text-white">
                            <tr>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase">Tgl Beli</th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase">Nama Barang</th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase">Qty</th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase">@ Harga</th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase">Total</th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase">Kondisi</th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {assetList.map(item => (
                                <tr key={item._id} className={`text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${item.kondisi !== 'Baik' ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                        {item.tgl_pembelian ? new Date(item.tgl_pembelian).toLocaleDateString('id-ID') : '-'}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.nama_barang}</td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.jumlah}</td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatCurrency(item.harga_satuan || 0)}</td>
                                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(item.total_harga || item.modal_dikeluarkan)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.kondisi === 'Baik' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {item.kondisi}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center space-x-2 whitespace-nowrap">
                                        <button onClick={() => startEdit(item)} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs">
                                            ✏️ Edit
                                        </button>
                                        <button onClick={() => handleDelete(item._id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs">
                                            🗑️ Hapus
                                        </button>
                                        {item.kondisi === 'Baik' && (
                                            <button onClick={() => handleUpdateKondisi(item._id, 'Rusak')} className="text-xs text-yellow-600 hover:underline ml-2">
                                                    Rusak
                                            </button>
                                        )}
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

export default InventarisPage;