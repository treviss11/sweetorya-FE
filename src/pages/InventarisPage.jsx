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
            setNewItem({ nama_barang: '', jumlah: '', kondisi: 'Baik', total_harga: '' }); // Reset form
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

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Manajemen Inventaris (Aset Tetap)</h2>

            {/* Form Tambah Baru */}
             <div className="border rounded p-4 mb-6">
                 <h3 className="text-lg font-semibold mb-3">Tambah Inventaris Baru</h3>
                 {formError && <p className="text-red-500 text-sm mb-2">{formError}</p>}
                <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <input type="text" name="nama_barang" value={newItem.nama_barang} onChange={handleNewItemChange} placeholder="Nama Barang" className="border rounded px-3 py-2 md:col-span-1" required />
                    <input type="number" name="jumlah" value={newItem.jumlah} onChange={handleNewItemChange} placeholder="Jumlah" className="border rounded px-3 py-2" required />
                    <select name="kondisi" value={newItem.kondisi} onChange={handleNewItemChange} className="border rounded px-3 py-2 bg-white" required>
                        {KONDISI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                     <input type="number" name="total_harga" value={newItem.total_harga} onChange={handleNewItemChange} placeholder="Total Harga (Rp)" className="border rounded px-3 py-2" required />
                    <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Simpan</button>
                </form>
            </div>

            {/* Daftar Inventaris */}
            <h3 className="text-lg font-semibold mb-3">Daftar Inventaris</h3>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-700 text-white">
                            <tr>
                                <th className="px-4 py-2 text-left">Nama Barang</th>
                                <th className="px-4 py-2 text-left">Jumlah</th>
                                <th className="px-4 py-2 text-left">Total Modal</th>
                                <th className="px-4 py-2 text-left">Kondisi</th>
                                <th className="px-4 py-2 text-left">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {assetList.map(item => (
                                <tr key={item._id} className={`${item.kondisi !== 'Baik' ? 'bg-gray-100' : ''}`}>
                                    <td className="px-4 py-2">{item.nama_barang}</td>
                                    <td className="px-4 py-2">{item.jumlah}</td>
                                    <td className="px-4 py-2">{formatCurrency(item.modal_dikeluarkan)}</td>
                                     <td className="px-4 py-2">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            item.kondisi === 'Baik' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {item.kondisi}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 space-x-1 whitespace-nowrap">
                                        {item.kondisi === 'Baik' ? (
                                             <button
                                                onClick={() => handleUpdateKondisi(item._id, 'Rusak')}
                                                className="bg-yellow-500 text-white py-1 px-2 rounded text-xs hover:bg-yellow-600"
                                            >
                                                Rusak?
                                            </button>
                                        ) : (
                                             <button
                                                onClick={() => handleUpdateKondisi(item._id, 'Baik')}
                                                className="bg-green-500 text-white py-1 px-2 rounded text-xs hover:bg-green-600"
                                            >
                                                Baik?
                                            </button>
                                        )}
                                          <button
                                            onClick={() => handleDelete(item._id)}
                                            className="bg-red-500 text-white py-1 px-2 rounded text-xs hover:bg-red-600"
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