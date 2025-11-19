import React, { useState, useEffect } from 'react';
import { fetchBahan, createNewBahan, updateBahanStockApi } from '../services/api';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const SATUAN_BAHAN = ['ltr', 'kg', 'gr', 'cc', 'ml', 'pack', 'biji', 'pcs', 'lembar'];

function BahanPage() {
    const [bahanList, setBahanList] = useState([]);
    const [newItem, setNewItem] = useState({ nama_bahan: '', stok: '', satuan: '', total_harga: '' });
    const [updateJumlah, setUpdateJumlah] = useState({}); // { itemId: jumlahKeluar }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');

    const loadBahan = async () => {
        setLoading(true); setError('');
        try {
            const res = await fetchBahan();
            setBahanList(res.data);
            // Reset updateJumlah state for new list
            const initialUpdates = {};
            res.data.forEach(item => { initialUpdates[item._id] = '' });
            setUpdateJumlah(initialUpdates);
        } catch (err) { setError('Gagal memuat data bahan.'); console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadBahan(); }, []);

    const handleNewItemChange = (e) => setNewItem({ ...newItem, [e.target.name]: e.target.value });
    const handleUpdateJumlahChange = (itemId, value) => setUpdateJumlah({ ...updateJumlah, [itemId]: value });

    const handleAddItem = async (e) => {
        e.preventDefault(); setFormError('');
        if (!newItem.nama_bahan || !newItem.stok || !newItem.satuan || !newItem.total_harga) {
            setFormError('Semua field wajib diisi.'); return;
        }
        try {
            await createNewBahan(newItem);
            setNewItem({ nama_bahan: '', stok: '', satuan: '', total_harga: '' }); // Reset form
            loadBahan(); // Reload list
            alert('Bahan baru berhasil ditambahkan.');
        } catch (err) {
            setFormError(err.response?.data?.msg || 'Gagal menambahkan bahan.'); console.error(err);
        }
    };

    const handleUpdateStock = async (itemId) => {
        const jumlahKeluar = updateJumlah[itemId];
        if (!jumlahKeluar || jumlahKeluar <= 0) {
            alert('Masukkan jumlah keluar yang valid.'); return;
        }
        try {
            await updateBahanStockApi(itemId, { jumlah_keluar: parseFloat(jumlahKeluar) });
            loadBahan(); // Reload list
            alert('Stok berhasil dikurangi.');
        } catch (err) {
            alert(err.response?.data?.msg || 'Gagal mengurangi stok.'); console.error(err);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Manajemen Stok Bahan</h2>

            {/* Form Tambah Baru */}
            <div className="border rounded p-4 mb-6">
                 <h3 className="text-lg font-semibold mb-3">Tambah Bahan Baru</h3>
                 {formError && <p className="text-red-500 text-sm mb-2">{formError}</p>}
                <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <input type="text" name="nama_bahan" value={newItem.nama_bahan} onChange={handleNewItemChange} placeholder="Nama Bahan" className="border rounded px-3 py-2 md:col-span-1" required />
                    <input type="number" step="0.01" name="stok" value={newItem.stok} onChange={handleNewItemChange} placeholder="Stok Awal" className="border rounded px-3 py-2" required />
                    <select name="satuan" value={newItem.satuan} onChange={handleNewItemChange} className="border rounded px-3 py-2 bg-white" required>
                        <option value="">Pilih Satuan...</option>
                        {SATUAN_BAHAN.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                     <input type="number" name="total_harga" value={newItem.total_harga} onChange={handleNewItemChange} placeholder="Total Harga (Rp)" className="border rounded px-3 py-2" required />
                    <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Simpan</button>
                </form>
            </div>

            {/* Daftar Bahan */}
            <h3 className="text-lg font-semibold mb-3">Daftar Stok Bahan</h3>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-700 text-white">
                            <tr>
                                <th className="px-4 py-2 text-left">Nama Bahan</th>
                                <th className="px-4 py-2 text-left">Sisa Stok</th>
                                <th className="px-4 py-2 text-left">Total Modal</th>
                                <th className="px-4 py-2 text-left">Kurangi Stok</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {bahanList.map(item => (
                                <tr key={item._id}>
                                    <td className="px-4 py-2">{item.nama_bahan}</td>
                                    <td className="px-4 py-2">{item.stok} {item.satuan}</td>
                                    <td className="px-4 py-2">{formatCurrency(item.modal_dikeluarkan)}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={updateJumlah[item._id] || ''}
                                                onChange={(e) => handleUpdateJumlahChange(item._id, e.target.value)}
                                                placeholder="Jumlah Keluar"
                                                className="border rounded px-2 py-1 w-28 text-sm"
                                            />
                                            <button
                                                onClick={() => handleUpdateStock(item._id)}
                                                className="bg-red-500 text-white py-1 px-2 rounded text-xs hover:bg-red-600"
                                            >
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