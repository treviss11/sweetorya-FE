import React, { useState, useEffect } from 'react';
import { fetchOrders, fetchSummary, updateOrderStatusApi, updateOrderTestimonialApi, downloadExcelReport } from '../services/api';
import { Link } from 'react-router-dom';

// Helper function to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

function RekapPage() {
    const [summary, setSummary] = useState(null);
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [testimonialLinks, setTestimonialLinks] = useState({}); 

    const loadData = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const [summaryRes, ordersRes] = await Promise.all([
                fetchSummary(),
                fetchOrders(page)
            ]);
            setSummary(summaryRes.data);
            setOrders(ordersRes.data.orders);
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
        loadData(currentPage);
    }, [currentPage]); 

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

    // Loading & Error States dengan Dark Mode Support
    if (loading) return <div className="text-center p-10 text-gray-600 dark:text-gray-300">Loading data...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
    if (!summary) return <div className="text-center p-10 text-gray-600 dark:text-gray-300">Data tidak ditemukan.</div>; 

    // Class styles untuk input kecil di dalam tabel
    const tableInputClass = "border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs w-32 md:w-40 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500";

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Rekapitulasi Pesanan & Keuangan</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-600 dark:bg-green-700 text-white p-4 rounded-lg shadow-md">
                    <h5 className="font-bold text-green-100 text-sm uppercase">Total Pendapatan Lunas</h5>
                    <h3 className="text-2xl font-bold mt-1">{formatCurrency(summary.total_pendapatan)}</h3>
                </div>
                 <div className="bg-red-600 dark:bg-red-700 text-white p-4 rounded-lg shadow-md">
                    <h5 className="font-bold text-red-100 text-sm uppercase">Total Pengeluaran (Modal)</h5>
                    <h3 className="text-2xl font-bold mt-1">{formatCurrency(summary.total_pengeluaran)}</h3>
                </div>
                 <div className={`${summary.keuntungan_bersih >= 0 ? 'bg-blue-600 dark:bg-blue-700' : 'bg-yellow-500 dark:bg-yellow-600'} text-white p-4 rounded-lg shadow-md`}>
                    <h5 className="font-bold text-blue-100 text-sm uppercase">Keuntungan Bersih</h5>
                    <h3 className="text-2xl font-bold mt-1">{formatCurrency(summary.keuntungan_bersih)}</h3>
                </div>
                 <div className="bg-cyan-600 dark:bg-cyan-700 text-white p-4 rounded-lg shadow-md">
                    <h5 className="font-bold text-cyan-100 text-sm uppercase">Pesanan Selesai</h5>
                    <h3 className="text-2xl font-bold mt-1">{summary.jumlah_pesanan_selesai} Pesanan</h3>
                </div>
            </div>

            {/* Rincian Pengeluaran Box */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border dark:border-gray-700 mb-6 transition-colors duration-200">
                <h4 className="font-bold mb-3 text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">Rincian Total Pengeluaran (Modal)</h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex justify-between">
                        <span>Modal Bahan:</span> 
                        <span className="font-mono font-semibold">{formatCurrency(summary.total_modal_bahan)}</span>
                    </li>
                    <li className="flex justify-between">
                        <span>Modal Packaging:</span> 
                        <span className="font-mono font-semibold">{formatCurrency(summary.total_modal_packaging)}</span>
                    </li>
                    <li className="flex justify-between">
                        <span>Modal Inventaris:</span> 
                        <span className="font-mono font-semibold">{formatCurrency(summary.total_modal_aset)}</span>
                    </li>
                    <li className="flex justify-between pt-2 border-t dark:border-gray-700 font-bold text-red-600 dark:text-red-400 text-base">
                        <span>Total:</span> 
                        <span>{formatCurrency(summary.total_pengeluaran)}</span>
                    </li>
                </ul>
            </div>

            {/* Action Buttons */}
            <div className="mb-6 flex flex-wrap gap-2">
                <button 
                    onClick={handleDownload}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow transition-colors"
                >
                    ⬇️ Download Excel
                </button>
                
                <Link to="/pesan" className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold py-2 px-4 rounded shadow transition-colors">
                    ➕ Pesanan Baru
                </Link>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-700 dark:bg-gray-900 text-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Pemesan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Detail</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Pengiriman</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Testimoni</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    #{order._id.slice(-6)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    <div className="font-medium">{order.nama_pemesan}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{order.telp_pemesan}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    <div>{order.jumlah_box} box @ {order.tipe_box}</div>
                                    <div className="font-medium text-gray-600 dark:text-gray-300">{formatCurrency(order.harga_total)}</div>
                                </td>
                                <td className="px-6 py-4 text-sm max-w-xs text-gray-900 dark:text-white">
                                    <div><strong>Penerima:</strong> {order.nama_penerima}</div>
                                    <div className="text-gray-500 dark:text-gray-400 text-xs truncate" title={order.alamat_pengiriman}>
                                        {order.alamat_pengiriman}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {order.link_testimoni ? (
                                        <a href={order.link_testimoni} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                            Lihat Testi
                                        </a>
                                    ) : (
                                        <div className="flex flex-col space-y-1">
                                            <input
                                                type="url"
                                                value={testimonialLinks[order._id] || ''}
                                                onChange={(e) => handleTestimonialChange(order._id, e.target.value)}
                                                placeholder="URL Story..."
                                                className={tableInputClass}
                                            />
                                            <button
                                                onClick={() => handleTestimonialSubmit(order._id)}
                                                className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 w-fit"
                                            >
                                                Simpan
                                            </button>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm space-y-1">
                                    <div>
                                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status_pesanan === 'Selesai' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                                            {order.status_pesanan}
                                        </span>
                                    </div>
                                    <div>
                                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status_pembayaran === 'Lunas' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                            {order.status_pembayaran}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-1">
                                    {order.status_pesanan === 'Belum Selesai' && (
                                        <button
                                            onClick={() => handleStatusUpdate(order._id, { status_pesanan: 'Selesai' })}
                                            className="bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-xs w-full"
                                        >
                                            Selesai
                                        </button>
                                    )}
                                    {order.status_pembayaran === 'Belum Lunas' && (
                                         <button
                                            onClick={() => handleStatusUpdate(order._id, { status_pembayaran: 'Lunas' })}
                                            className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs w-full"
                                        >
                                            Lunas
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-6 space-x-2 mb-10">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-700 dark:text-white rounded disabled:opacity-50 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                >
                    Previous
                </button>
                <span className="text-gray-700 dark:text-gray-300">Page {currentPage} of {totalPages}</span>
                 <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || loading}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-700 dark:text-white rounded disabled:opacity-50 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default RekapPage;