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
    const [testimonialLinks, setTestimonialLinks] = useState({}); // State for testimonial inputs

    const loadData = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            // Fetch both summary and orders concurrently
            const [summaryRes, ordersRes] = await Promise.all([
                fetchSummary(),
                fetchOrders(page)
            ]);
            setSummary(summaryRes.data);
            setOrders(ordersRes.data.orders);
            setCurrentPage(ordersRes.data.currentPage);
            setTotalPages(ordersRes.data.totalPages);

             // Initialize testimonialLinks state based on fetched orders
            const initialLinks = {};
            ordersRes.data.orders.forEach(order => {
                initialLinks[order._id] = ''; // Initialize input for each order
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
    }, [currentPage]); // Reload when currentPage changes

    const handleStatusUpdate = async (orderId, updateData) => {
        try {
            await updateOrderStatusApi(orderId, updateData);
            // Reload data on the current page after update
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
            loadData(currentPage); // Reload data
            alert('Link testimoni berhasil disimpan!');
        } catch (err) {
            console.error("Error saving testimonial:", err);
            alert('Gagal menyimpan link testimoni.');
        }
    };

    const handleDownload = async () => {
        try {
            const response = await downloadExcelReport();
            
            // Membuat link virtual untuk mendownload file blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Set nama file (bisa disamakan dengan backend atau custom)
            link.setAttribute('download', `Laporan_Sweetorya_${new Date().toISOString().split('T')[0]}.xlsx`);
            
            document.body.appendChild(link);
            link.click();
            
            // Bersihkan
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download error:", err);
            alert('Gagal mendownload laporan.');
        }
    };

    if (loading) return <div className="text-center p-10">Loading...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
    if (!summary) return <div className="text-center p-10">Data tidak ditemukan.</div>; // Initial state

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Rekapitulasi Pesanan & Keuangan</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-500 text-white p-4 rounded-lg shadow">
                    <h5 className="font-bold">Total Pendapatan Lunas</h5>
                    <h3 className="text-2xl">{formatCurrency(summary.total_pendapatan)}</h3>
                </div>
                 <div className="bg-red-500 text-white p-4 rounded-lg shadow">
                    <h5 className="font-bold">Total Pengeluaran (Modal)</h5>
                    <h3 className="text-2xl">{formatCurrency(summary.total_pengeluaran)}</h3>
                </div>
                 <div className={`${summary.keuntungan_bersih >= 0 ? 'bg-blue-500' : 'bg-yellow-500'} text-white p-4 rounded-lg shadow`}>
                    <h5 className="font-bold">Keuntungan Bersih</h5>
                    <h3 className="text-2xl">{formatCurrency(summary.keuntungan_bersih)}</h3>
                </div>
                 <div className="bg-cyan-500 text-white p-4 rounded-lg shadow">
                    <h5 className="font-bold">Pesanan Selesai</h5>
                    <h3 className="text-2xl">{summary.jumlah_pesanan_selesai} Pesanan</h3>
                </div>
            </div>

            {/* Rincian Pengeluaran */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h4 className="font-bold mb-2">Rincian Total Pengeluaran (Modal)</h4>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Modal Bahan: <span className="font-semibold">{formatCurrency(summary.total_modal_bahan)}</span></li>
                    <li>Modal Packaging: <span className="font-semibold">{formatCurrency(summary.total_modal_packaging)}</span></li>
                    <li>Modal Inventaris: <span className="font-semibold">{formatCurrency(summary.total_modal_aset)}</span></li>
                    <li className="font-bold text-red-600">Total: <span className="text-lg">{formatCurrency(summary.total_pengeluaran)}</span></li>
                </ul>
            </div>

            <div className="mb-4 space-x-2">
                {/* GANTI TOMBOL LAMA DENGAN INI */}
                <button 
                    onClick={handleDownload}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    ⬇️ Download Excel Lengkap
                </button>
                
                <Link to="/pesan" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                    ➕ Buat Pesanan Baru
                </Link>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-700 text-white">
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
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order._id.slice(-6)}</td> {/* Short ID */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="font-medium">{order.nama_pemesan}</div>
                                    <div className="text-gray-500">{order.telp_pemesan}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div>{order.jumlah_box} box @ {order.tipe_box}</div>
                                    <div className="font-medium">{formatCurrency(order.harga_total)}</div>
                                </td>
                                <td className="px-6 py-4 text-sm max-w-xs"> {/* max-w-xs for address */}
                                    <div><strong>Penerima:</strong> {order.nama_penerima}</div>
                                    <div className="text-gray-500 truncate" title={order.alamat_pengiriman}> {/* Truncate + title */}
                                        <strong>Alamat:</strong> {order.alamat_pengiriman}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {order.link_testimoni ? (
                                        <a href={order.link_testimoni} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            Lihat Testi
                                        </a>
                                    ) : (
                                        <div className="flex items-center space-x-1">
                                            <input
                                                type="url"
                                                value={testimonialLinks[order._id] || ''}
                                                onChange={(e) => handleTestimonialChange(order._id, e.target.value)}
                                                placeholder="Paste URL IG Story"
                                                className="border rounded px-2 py-1 text-xs w-40" // Smaller input
                                            />
                                            <button
                                                onClick={() => handleTestimonialSubmit(order._id)}
                                                className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                                            >
                                                Simpan
                                            </button>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status_pesanan === 'Selesai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {order.status_pesanan}
                                    </span>
                                    <br />
                                     <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status_pembayaran === 'Lunas' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {order.status_pembayaran}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                                    {order.status_pesanan === 'Belum Selesai' && (
                                        <button
                                            onClick={() => handleStatusUpdate(order._id, { status_pesanan: 'Selesai' })}
                                            className="bg-green-500 hover:bg-green-700 text-white py-1 px-2 rounded text-xs"
                                        >
                                            Selesai
                                        </button>
                                    )}
                                    {order.status_pembayaran === 'Belum Lunas' && (
                                         <button
                                            onClick={() => handleStatusUpdate(order._id, { status_pembayaran: 'Lunas' })}
                                            className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs"
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
            <div className="flex justify-center items-center mt-6 space-x-2">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                 <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || loading}
                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default RekapPage;