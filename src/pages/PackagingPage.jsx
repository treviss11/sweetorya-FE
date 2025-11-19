import React, { useState, useEffect } from 'react';
import { fetchPackaging, createNewPackaging, updatePackagingStockApi } from '../services/api';

// Helper format rupiah
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const SATUAN_PACKAGING = ['pcs', 'lembar', 'biji'];

function PackagingPage() {
    const [packagingList, setPackagingList] = useState([]);
    const [newItem, setNewItem] = useState({ nama_packaging: '', stok: '', satuan: '', total_harga: '' });
    const [updateJumlah, setUpdateJumlah] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [activeSearch, setActiveSearch] = useState('');

    const loadPackaging = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetchPackaging();
            setPackagingList(res.data);
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

    useEffect(() => { loadPackaging(activeSearch); }, [activeSearch]);

    const handleSearch = (e) => { e.preventDefault(); setActiveSearch(searchKeyword); };
    const handleResetSearch = () => { setSearchKeyword(''); setActiveSearch(''); };

    const handleNewItemChange = (e) => {
        setNewItem({ ...newItem, [e.target.name]: e.target.value });
    };

    const handleUpdateJumlahChange = (itemId, value) => {
        setUpdateJumlah({ ...updateJumlah, [itemId]: value });
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!newItem.nama_packaging || !newItem.stok || !newItem.satuan || !newItem.total_harga) {
            setFormError('Semua field wajib diisi.');
            return;
        }
        try {
            await createNewPackaging(newItem);
            setNewItem({ nama_packaging: '', stok: '', satuan: '', total_harga: '' });
            loadPackaging();
            alert('Packaging baru berhasil ditambahkan.');
        } catch (err) {
            console.error(err);
            setFormError(err.response?.data?.msg || 'Gagal menambahkan packaging.');
        }
    };

    const handleUpdateStock = async (itemId) => {
        const jumlahKeluar = updateJumlah[itemId];
        if (!jumlahKeluar || jumlahKeluar <= 0) {
            alert('Masukkan jumlah keluar yang valid.');
            return;
        }
        try {
            await updatePackagingStockApi(itemId, { jumlah_keluar: parseFloat(jumlahKeluar) });
            loadPackaging();
            alert('Stok berhasil dikurangi.');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Gagal mengurangi stok.');
        }
    };

    // Style Class Konsisten untuk Input
    const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500";

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700 transition-colors duration-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Manajemen Stok Packaging</h2>

            {/* --- Form Tambah Baru --- */}
            <div className="border dark:border-gray-700 rounded p-4 mb-6 bg-gray-50 dark:bg-gray-700/30">
                 <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Tambah Packaging Baru</h3>
                 
                 {formError && <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 p-2 rounded mb-3 text-sm border border-red-200 dark:border-red-800">{formError}</div>}
                 
                <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div className="md:col-span-1">
                        <input type="text" name="nama_packaging" value={newItem.nama_packaging} onChange={handleNewItemChange} placeholder="Nama Packaging" className={inputClass} required />
                    </div>
                    <div>
                        <input type="number" name="stok" value={newItem.stok} onChange={handleNewItemChange} placeholder="Stok Awal" className={inputClass} required />
                    </div>
                    <div>
                        <select name="satuan" value={newItem.satuan} onChange={handleNewItemChange} className={inputClass} required>
                            <option value="">Pilih Satuan...</option>
                            {SATUAN_PACKAGING.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                         <input type="number" name="total_harga" value={newItem.total_harga} onChange={handleNewItemChange} placeholder="Total Modal (Rp)" className={inputClass} required />
                    </div>
                    <div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors duration-200 shadow">
                            Simpan
                        </button>
                    </div>
                </form>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 border-b dark:border-gray-700 pb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Daftar Stok Packaging</h3>
                <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                    <input type="text" placeholder="Cari packaging..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm w-full md:w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                    <button type="submit" className="bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 text-white px-4 py-1 rounded text-sm">Cari</button>
                    {activeSearch && <button type="button" onClick={handleResetSearch} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">✖</button>}
                </form>
            </div>

            {loading && <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading data...</div>}
            {error && <div className="text-red-500 text-center py-4">{error}</div>}

            {!loading && !error && (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-700 dark:bg-gray-900 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama Packaging</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Sisa Stok</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Total Modal</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Kurangi Stok (Pemakaian)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {packagingList.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">Belum ada data packaging.</td>
                                </tr>
                            ) : (
                                packagingList.map(item => (
                                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{item.nama_packaging}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {item.stok} <span className="text-gray-500 dark:text-gray-400 text-xs">{item.satuan}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{formatCurrency(item.modal_dikeluarkan)}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="number"
                                                    value={updateJumlah[item._id] || ''}
                                                    onChange={(e) => handleUpdateJumlahChange(item._id, e.target.value)}
                                                    placeholder="Jml Keluar"
                                                    className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-24 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                                                />
                                                <button
                                                    onClick={() => handleUpdateStock(item._id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-xs transition-colors duration-200 shadow-sm"
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