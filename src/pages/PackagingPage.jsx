import React, { useState, useEffect } from 'react';
import { fetchPackaging, createNewPackaging, updatePackagingStockApi } from '../services/api';

// Helper untuk format rupiah
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

// Opsi satuan khusus untuk Packaging (sesuai skema backend)
const SATUAN_PACKAGING = ['pcs', 'lembar', 'biji'];

function PackagingPage() {
    // State untuk daftar data
    const [packagingList, setPackagingList] = useState([]);
    
    // State untuk form tambah baru
    const [newItem, setNewItem] = useState({ 
        nama_packaging: '', 
        stok: '', 
        satuan: '', 
        total_harga: '' 
    });

    // State untuk input pengurangan stok per item { id_item: jumlah }
    const [updateJumlah, setUpdateJumlah] = useState({}); 

    // State untuk UI (loading & error)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');

    // Fungsi memuat data dari API
    const loadPackaging = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetchPackaging();
            setPackagingList(res.data);
            
            // Reset state input pengurangan stok
            const initialUpdates = {};
            res.data.forEach(item => { initialUpdates[item._id] = '' });
            setUpdateJumlah(initialUpdates);

        } catch (err) {
            setError('Gagal memuat data packaging.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Jalankan saat halaman pertama kali dibuka
    useEffect(() => {
        loadPackaging();
    }, []);

    // Handle perubahan input form tambah baru
    const handleNewItemChange = (e) => {
        setNewItem({ ...newItem, [e.target.name]: e.target.value });
    };

    // Handle perubahan input "Jumlah Keluar" di tabel
    const handleUpdateJumlahChange = (itemId, value) => {
        setUpdateJumlah({ ...updateJumlah, [itemId]: value });
    };

    // Submit Form Tambah Baru
    const handleAddItem = async (e) => {
        e.preventDefault();
        setFormError('');

        // Validasi sederhana
        if (!newItem.nama_packaging || !newItem.stok || !newItem.satuan || !newItem.total_harga) {
            setFormError('Semua field wajib diisi.');
            return;
        }

        try {
            await createNewPackaging(newItem);
            // Reset form jika sukses
            setNewItem({ nama_packaging: '', stok: '', satuan: '', total_harga: '' });
            // Reload data tabel
            loadPackaging();
            alert('Packaging baru berhasil ditambahkan.');
        } catch (err) {
            console.error(err);
            setFormError(err.response?.data?.msg || 'Gagal menambahkan packaging.');
        }
    };

    // Submit Update Stok (Kurangi)
    const handleUpdateStock = async (itemId) => {
        const jumlahKeluar = updateJumlah[itemId];

        if (!jumlahKeluar || jumlahKeluar <= 0) {
            alert('Masukkan jumlah keluar yang valid.');
            return;
        }

        try {
            await updatePackagingStockApi(itemId, { jumlah_keluar: parseFloat(jumlahKeluar) });
            loadPackaging(); // Reload data untuk melihat stok terbaru
            alert('Stok berhasil dikurangi.');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Gagal mengurangi stok.');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Manajemen Stok Packaging</h2>

            {/* --- Bagian Form Tambah Baru --- */}
            <div className="border rounded p-4 mb-6 bg-gray-50">
                 <h3 className="text-lg font-semibold mb-3">Tambah Packaging Baru</h3>
                 
                 {formError && <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">{formError}</div>}
                 
                <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    {/* Input Nama */}
                    <div className="md:col-span-1">
                        <input 
                            type="text" 
                            name="nama_packaging" 
                            value={newItem.nama_packaging} 
                            onChange={handleNewItemChange} 
                            placeholder="Nama Packaging" 
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" 
                            required 
                        />
                    </div>

                    {/* Input Stok Awal */}
                    <div>
                        <input 
                            type="number" 
                            name="stok" 
                            value={newItem.stok} 
                            onChange={handleNewItemChange} 
                            placeholder="Stok Awal" 
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" 
                            required 
                        />
                    </div>

                    {/* Select Satuan */}
                    <div>
                        <select 
                            name="satuan" 
                            value={newItem.satuan} 
                            onChange={handleNewItemChange} 
                            className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-blue-500" 
                            required
                        >
                            <option value="">Pilih Satuan...</option>
                            {SATUAN_PACKAGING.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Input Harga Beli */}
                    <div>
                         <input 
                            type="number" 
                            name="total_harga" 
                            value={newItem.total_harga} 
                            onChange={handleNewItemChange} 
                            placeholder="Total Modal (Rp)" 
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" 
                            required 
                        />
                    </div>

                    {/* Tombol Simpan */}
                    <div>
                        <button 
                            type="submit" 
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </div>

            {/* --- Bagian Tabel Daftar Data --- */}
            <h3 className="text-lg font-semibold mb-3 border-b pb-2">Daftar Stok Packaging</h3>
            
            {loading && <div className="text-center py-4">Loading data...</div>}
            {error && <div className="text-red-500 text-center py-4">{error}</div>}

            {!loading && !error && (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-700 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama Packaging</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Sisa Stok</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Total Modal</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Kurangi Stok (Pemakaian)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {packagingList.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-4 py-4 text-center text-gray-500">Belum ada data packaging.</td>
                                </tr>
                            ) : (
                                packagingList.map(item => (
                                    <tr key={item._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.nama_packaging}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {item.stok} <span className="text-gray-500 text-xs">{item.satuan}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(item.modal_dikeluarkan)}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="number"
                                                    value={updateJumlah[item._id] || ''}
                                                    onChange={(e) => handleUpdateJumlahChange(item._id, e.target.value)}
                                                    placeholder="Jml Keluar"
                                                    className="border border-gray-300 rounded px-2 py-1 w-24 text-sm focus:outline-none focus:border-red-500"
                                                />
                                                <button
                                                    onClick={() => handleUpdateStock(item._id)}
                                                    className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600 transition duration-200"
                                                >
                                                    Kurangi
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default PackagingPage;