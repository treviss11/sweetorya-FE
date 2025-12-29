import React, { useState, useEffect } from 'react';
import { fetchOrders, fetchSummary, updateOrderStatusApi, updateOrderTestimonialApi, downloadExcelReport } from '../services/api';
import { Link } from 'react-router-dom';

// Helper format rupiah
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

function RekapPage() {
    const [summary, setSummary] = useState(null);
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState(''); 
    const [activeSearch, setActiveSearch] = useState('');   
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [testimonialLinks, setTestimonialLinks] = useState({}); 

    const loadData = async (page, search = '') => {
        setLoading(true);
        setError(null);
        try {
            const summaryRes = await fetchSummary(); 
            const ordersRes = await fetchOrders(page, 20, search); 

            setSummary(summaryRes.data);
            
            // --- LOGIKA SORTING (BARU) ---
            // Pisahkan logika: Belum Selesai di atas, Selesai di bawah.
            // Jika status sama, urutkan berdasarkan tanggal terbaru.
            const sortedOrders = ordersRes.data.orders.sort((a, b) => {
                const isFinishedA = a.status_pesanan === 'Selesai';
                const isFinishedB = b.status_pesanan === 'Selesai';

                if (isFinishedA !== isFinishedB) {
                    // Jika A belum selesai (false) dan B selesai (true), A harus di atas (-1)
                    return isFinishedA ? 1 : -1;
                }
                // Jika status sama, urutkan tanggal (descending / terbaru diatas)
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            setOrders(sortedOrders);
            setCurrentPage(ordersRes.data.currentPage);
            setTotalPages(ordersRes.data.totalPages);

            const initialLinks = {};
            ordersRes.data.orders.forEach(order => {
                initialLinks[order._id] = ''; 
            });
            setTestimonialLinks(initialLinks);
        } catch (err) {
            console.error("Error loading data:", err);
            setError('Gagal memuat data. Coba refresh halaman.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(currentPage, activeSearch);
    }, [currentPage, activeSearch]); 

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1); 
        setActiveSearch(searchKeyword); 
    };

    const handleResetSearch = () => {
        setSearchKeyword('');
        setActiveSearch('');
        setCurrentPage(1);
    };

    const handleStatusUpdate = async (orderId, updateData) => {
        try {
            await updateOrderStatusApi(orderId, updateData);
            loadData(currentPage);
            alert('Status berhasil diperbarui!');
        } catch (err) {
            console.error("Error updating status:", err);
            alert('Gagal memperbarui status.');
        }
    };

    const handleTestimonialChange = (orderId, value) => {
        setTestimonialLinks(prev => ({ ...prev, [orderId]: value }));
    };

    const handleTestimonialSubmit = async (orderId) => {
        const link = testimonialLinks[orderId];
        if (!link || !link.startsWith('http')) {
            alert('Masukkan URL testimoni yang valid (dimulai dengan http/https).');
            return;
        }
        try {
            await updateOrderTestimonialApi(orderId, { link_testimoni: link });
            loadData(currentPage);
            alert('Link testimoni berhasil disimpan!');
        } catch (err) {
            console.error("Error saving testimonial:", err);
            alert('Gagal menyimpan link testimoni.');
        }
    };

    const handleDownload = async () => {
        try {
            const response = await downloadExcelReport();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Laporan_Sweetorya_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download error:", err);
            alert('Gagal mendownload laporan.');
        }
    };

    if (loading) return <div className="text-center p-20 text-xl text-gray-500 dark:text-gray-400 animate-pulse">Sedang memuat data...</div>;
    if (error) return <div className="text-center p-20 text-red-500 font-bold">{error}</div>;
    if (!summary) return <div className="text-center p-20 text-gray-500">Data tidak ditemukan.</div>; 

    const tableInputClass = "border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors";

    return (
        <div className="w-full max-w-[100%] mx-auto px-2 md:px-4 pb-20">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                    Rekapitulasi Pesanan & Keuangan
                </h2>
                <div className="flex gap-3">
                     <button 
                        onClick={handleDownload}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
                    >
                        <span>📥</span> Download Excel
                    </button>
                    <Link to="/pesan" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg flex items-center gap-2 transition-transform hover:scale-105">
                        <span>➕</span> Pesanan Baru
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Card 1 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border-l-4 border-green-500 flex flex-col justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pendapatan Lunas</p>
                        <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(summary.total_pendapatan)}</h3>
                    </div>
                    <div className="text-right mt-2 text-2xl opacity-20 text-green-600">💰</div>
                </div>
                {/* Card 2 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border-l-4 border-red-500 flex flex-col justify-between">
                     <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Pengeluaran</p>
                        <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{formatCurrency(summary.total_pengeluaran)}</h3>
                    </div>
                    <div className="text-right mt-2 text-2xl opacity-20 text-red-600">📉</div>
                </div>
                {/* Card 3 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border-l-4 border-blue-500 flex flex-col justify-between">
                     <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Keuntungan Bersih</p>
                        <h3 className={`text-2xl font-bold mt-1 ${summary.keuntungan_bersih >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-yellow-500'}`}>
                            {formatCurrency(summary.keuntungan_bersih)}
                        </h3>
                    </div>
                     <div className="text-right mt-2 text-2xl opacity-20 text-blue-600">📊</div>
                </div>
                {/* Card 4 */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border-l-4 border-cyan-500 flex flex-col justify-between">
                     <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pesanan Selesai</p>
                        <h3 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">{summary.jumlah_pesanan_selesai} <span className="text-sm text-gray-500 font-normal">Pesanan</span></h3>
                    </div>
                    <div className="text-right mt-2 text-2xl opacity-20 text-cyan-600">📦</div>
                </div>
            </div>

            {/* Rincian Pengeluaran */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 mb-8 overflow-hidden">
                <div className="px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <h4 className="font-bold text-gray-700 dark:text-gray-200">Rincian Modal & Pengeluaran</h4>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div className="flex justify-between border-b dark:border-gray-700 pb-2">
                        <span className="text-gray-600 dark:text-gray-400">Bahan Baku</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">{formatCurrency(summary.pengeluaran.bahan)}</span>
                    </div>
                    <div className="flex justify-between border-b dark:border-gray-700 pb-2">
                        <span className="text-gray-600 dark:text-gray-400">Packaging</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">{formatCurrency(summary.pengeluaran.packaging)}</span>
                    </div>
                    <div className="flex justify-between border-b dark:border-gray-700 pb-2">
                        <span className="text-gray-600 dark:text-gray-400">Aset / Inventaris</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">{formatCurrency(summary.pengeluaran.aset)}</span>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-2">
                    <input
                        type="text"
                        placeholder="Cari nama pemesan, penerima, atau status..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                        🔍 Cari
                    </button>
                    {activeSearch && (
                        <button type="button" onClick={handleResetSearch} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                            ✖ Reset
                        </button>
                    )}
                </form>
                {activeSearch && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Menampilkan hasil pencarian untuk: <span className="font-bold text-blue-500">"{activeSearch}"</span>
                    </p>
                )}
            </div>

            {/* TABEL UTAMA */}
            <div className="overflow-hidden rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider w-24">ID</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider w-48">Pemesan</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider min-w-[250px]">Detail Item</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider min-w-[200px]">Pengiriman</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider w-48">Testimoni</th>
                                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider w-32">Status</th>
                                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider w-32">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {orders.map((order) => (
                                <tr 
                                    key={order._id} 
                                    // --- LOGIKA BACKGROUND WARNA DI SINI ---
                                    // Jika belum selesai, warna pink. Jika sudah selesai, warna default (putih/gelap).
                                    className={`transition-colors border-b dark:border-gray-700 ${
                                        order.status_pesanan !== 'Selesai' 
                                        ? 'bg-pink-50 dark:bg-red-900/20 hover:bg-pink-100 dark:hover:bg-red-900/30' 
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }`}
                                >
                                    
                                    {/* ID */}
                                    <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 align-top">
                                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </span>
                                        <div className="mt-1 text-[10px] text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString('id-ID')}
                                        </div>
                                    </td>

                                    {/* Pemesan */}
                                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white align-top">
                                        <div className="font-bold text-base">{order.nama_pemesan}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                            📞 {order.telp_pemesan}
                                        </div>
                                    </td>
                                    
                                    {/* Detail Item */}
                                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white align-top">
                                        <div className="space-y-2">
                                            {order.items && order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-start text-sm border-b border-dashed border-gray-200 dark:border-gray-700 pb-1 last:border-0">
                                                    <span>
                                                        <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">{item.jumlah}x</span> 
                                                        {item.nama_varian}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Total</span>
                                            <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                                                {formatCurrency(order.harga_total)}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Pengiriman */}
                                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 align-top">
                                        <div className="font-semibold text-gray-900 dark:text-white mb-1">
                                            Penerima: {order.nama_penerima}
                                        </div>
                                        <div className="text-xs leading-relaxed bg-white/50 dark:bg-gray-700/50 p-2 rounded border border-gray-100 dark:border-gray-600">
                                            {order.alamat_pengiriman}
                                        </div>
                                    </td>

                                    {/* Testimoni */}
                                    <td className="px-4 py-4 text-sm align-top">
                                        {order.link_testimoni ? (
                                            <a 
                                                href={order.link_testimoni} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full"
                                            >
                                                🔗 Lihat Story
                                            </a>
                                        ) : (
                                            <div className="flex flex-col space-y-2">
                                                <input
                                                    type="url"
                                                    value={testimonialLinks[order._id] || ''}
                                                    onChange={(e) => handleTestimonialChange(order._id, e.target.value)}
                                                    placeholder="URL Story..."
                                                    className={tableInputClass}
                                                />
                                                <button
                                                    onClick={() => handleTestimonialSubmit(order._id)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs w-full shadow-sm"
                                                >
                                                    Simpan
                                                </button>
                                            </div>
                                        )}
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-4 text-center align-top space-y-2">
                                        <div>
                                            <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full shadow-sm ${
                                                order.status_pesanan === 'Selesai' 
                                                ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800' 
                                                : 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800'
                                            }`}>
                                                {order.status_pesanan}
                                            </span>
                                        </div>
                                        <div>
                                            <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full shadow-sm ${
                                                order.status_pembayaran === 'Lunas' 
                                                ? 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800' 
                                                : 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800'
                                            }`}>
                                                {order.status_pembayaran}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Aksi */}
                                    <td className="px-4 py-4 text-center align-top space-y-2">
                                        {order.status_pesanan === 'Belum Selesai' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, { status_pesanan: 'Selesai' })}
                                                className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-xs w-full shadow-sm transition-colors"
                                            >
                                                ✅ Selesai
                                            </button>
                                        )}
                                        {order.status_pembayaran === 'Belum Lunas' && (
                                             <button
                                                onClick={() => handleStatusUpdate(order._id, { status_pembayaran: 'Lunas' })}
                                                className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-xs w-full shadow-sm transition-colors"
                                            >
                                                💰 Lunas
                                            </button>
                                        )}
                                        <Link to={`/pesan/detail/${order._id}`} className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 py-1 px-2 rounded text-xs w-full block text-center mt-1 shadow-sm">
                                            📄 Detail
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-8 space-x-4">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    className="px-5 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors text-gray-700 dark:text-gray-200"
                >
                    ← Previous
                </button>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Page {currentPage} of {totalPages}</span>
                 <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || loading}
                    className="px-5 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors text-gray-700 dark:text-gray-200"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}

export default RekapPage;