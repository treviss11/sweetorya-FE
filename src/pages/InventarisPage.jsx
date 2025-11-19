import React, { useState, useEffect } from 'react';
import { fetchAssets, createNewAsset, updateAssetKondisiApi, deleteAssetApi } from '../services/api';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const KONDISI_OPTIONS = ['Baik', 'Rusak', 'Hilang'];

function InventarisPage() {
    const [assetList, setAssetList] = useState([]);
    const [newItem, setNewItem] = useState({ nama_barang: '', jumlah: '', kondisi: 'Baik', total_harga: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');

    const loadAssets = async () => {
        setLoading(true); setError('');
        try {
            const res = await fetchAssets();
            setAssetList(res.data);
        } catch (err) { setError('Gagal memuat data inventaris.'); console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadAssets(); }, []);

    const handleNewItemChange = (e) => setNewItem({ ...newItem, [e.target.name]: e.target.value });

    const handleAddItem = async (e) => {
        e.preventDefault(); setFormError('');
        if (!newItem.nama_barang || !newItem.jumlah || !newItem.total_harga) {
            setFormError('Nama barang, jumlah, dan total harga wajib diisi.'); return;
        }
        try {
            await createNewAsset(newItem);
            setNewItem({ nama_barang: '', jumlah: '', kondisi: 'Baik', total_harga: '' });
            loadAssets();
            alert('Inventaris baru berhasil ditambahkan.');
        } catch (err) {
            setFormError(err.response?.data?.msg || 'Gagal menambahkan inventaris.'); console.error(err);
        }
    };

    const handleUpdateKondisi = async (itemId, newKondisi) => {
        try {
            await updateAssetKondisiApi(itemId, { kondisi_baru: newKondisi });
            loadAssets();
            alert('Kondisi berhasil diperbarui.');
        } catch (err) {
            alert(err.response?.data?.msg || 'Gagal memperbarui kondisi.'); console.error(err);
        }
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm('HANYA GUNAKAN JIKA SALAH INPUT. Yakin hapus permanen?')) return;
        try {
            await deleteAssetApi(itemId);
            loadAssets();
            alert('Inventaris berhasil dihapus.');
        } catch (err) {
            alert(err.response?.data?.msg || 'Gagal menghapus inventaris.'); console.error(err);
        }
    };

    // Style Class Konsisten
    const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500";

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700 transition-colors duration-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Manajemen Inventaris (Aset Tetap)</h2>

            {/* --- Form Tambah Baru --- */}
            <div className="border dark:border-gray-700 rounded p-4 mb-6 bg-gray-50 dark:bg-gray-700/30">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Tambah Inventaris Baru</h3>
                
                {formError && <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 p-2 rounded mb-3 text-sm border border-red-200 dark:border-red-800">{formError}</div>}
                
                <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div className="md:col-span-1">
                        <input type="text" name="nama_barang" value={newItem.nama_barang} onChange={handleNewItemChange} placeholder="Nama Barang" className={inputClass} required />
                    </div>
                    <div>
                        <input type="number" name="jumlah" value={newItem.jumlah} onChange={handleNewItemChange} placeholder="Jumlah" className={inputClass} required />
                    </div>
                    <div>
                        <select name="kondisi" value={newItem.kondisi} onChange={handleNewItemChange} className={inputClass} required>
                            {KONDISI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                    <div>
                        <input type="number" name="total_harga" value={newItem.total_harga} onChange={handleNewItemChange} placeholder="Total Harga (Rp)" className={inputClass} required />
                    </div>
                    <div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors duration-200 shadow">
                            Simpan
                        </button>
                    </div>
                </form>
            </div>

            {/* --- Daftar Inventaris --- */}
            <h3 className="text-lg font-semibold mb-3 border-b dark:border-gray-700 pb-2 text-gray-800 dark:text-gray-200">Daftar Inventaris</h3>
            
            {loading && <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading data...</div>}
            {error && <div className="text-red-500 text-center py-4">{error}</div>}

            {!loading && !error && (
                 <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-700 dark:bg-gray-900 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama Barang</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Jumlah</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Total Modal</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Kondisi</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {assetList.map(item => (
                                <tr 
                                    key={item._id} 
                                    className={`
                                        transition-colors duration-150
                                        ${item.kondisi !== 'Baik' ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                                    `}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{item.nama_barang}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.jumlah}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{formatCurrency(item.modal_dikeluarkan)}</td>
                                     <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            item.kondisi === 'Baik' 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {item.kondisi}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm space-x-1 whitespace-nowrap font-medium">
                                        {item.kondisi === 'Baik' ? (
                                             <button
                                                onClick={() => handleUpdateKondisi(item._id, 'Rusak')}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded text-xs transition-colors shadow-sm"
                                            >
                                                Rusak?
                                            </button>
                                        ) : (
                                             <button
                                                onClick={() => handleUpdateKondisi(item._id, 'Baik')}
                                                className="bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-xs transition-colors shadow-sm"
                                            >
                                                Baik?
                                            </button>
                                        )}
                                          <button
                                            onClick={() => handleDelete(item._id)}
                                            className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded text-xs transition-colors shadow-sm ml-2"
                                        >
                                            Delete
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

export default InventarisPage;