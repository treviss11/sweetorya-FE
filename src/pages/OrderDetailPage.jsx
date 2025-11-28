import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchOrderById, deleteOrderApi } from '../services/api';

// Helper format rupiah
const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

function OrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchOrderById(id);
                setOrder(res.data);
            } catch (err) {
                alert('Gagal memuat detail pesanan.');
            } finally { setLoading(false); }
        };
        load();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm("Yakin hapus pesanan ini secara permanen?")) return;
        try {
            await deleteOrderApi(id);
            alert('Pesanan berhasil dihapus.');
            navigate('/');
        } catch (err) { alert('Gagal menghapus data.'); }
    };

    if (loading) return <div className="p-10 text-center text-gray-500 dark:text-gray-400 animate-pulse">Sedang memuat detail...</div>;
    if (!order) return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Pesanan tidak ditemukan.</div>;

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            
            {/* --- HEADER: Judul & Tombol Aksi --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b dark:border-gray-700 pb-5 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Detail Pesanan</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded text-sm font-mono">
                            #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            | Dibuat: {new Date(order.createdAt).toLocaleDateString('id-ID')}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link to={`/pesan/edit/${id}`} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow transition-transform hover:scale-105">
                        ✏️ Edit
                    </Link>
                    <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow transition-transform hover:scale-105">
                        🗑️ Hapus
                    </button>
                </div>
            </div>

            {/* --- INFO STATUS & JADWAL --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                    <h3 className="font-bold text-gray-500 dark:text-gray-400 uppercase text-xs mb-3 tracking-wider">Jadwal Pengiriman</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Tgl Pesan:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{new Date(order.tgl_pesan).toLocaleDateString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Tgl Kirim:</span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                {new Date(order.tgl_kirim).toLocaleDateString('id-ID')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Jam Kirim:</span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{order.jam_kirim} WIB</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                    <h3 className="font-bold text-gray-500 dark:text-gray-400 uppercase text-xs mb-3 tracking-wider">Status Pesanan</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Progress:</span>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                order.status_pesanan === 'Selesai' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            } border`}>
                                {order.status_pesanan}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Pembayaran:</span>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                order.status_pembayaran === 'Lunas' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                            } border`}>
                                {order.status_pembayaran}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- ITEM PESANAN --- */}
            <div className="mb-8">
                <h3 className="font-bold text-gray-800 dark:text-white uppercase text-sm mb-3 flex items-center gap-2">
                    📦 Item Pesanan
                </h3>
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Barang</th>
                                <th className="px-4 py-3 text-right">Harga @</th>
                                <th className="px-4 py-3 text-center">Qty</th>
                                <th className="px-4 py-3 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                            {order.items.map((item, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.nama_varian}</td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatCurrency(item.harga_satuan)}</td>
                                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{item.jumlah}</td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(item.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <td colSpan="3" className="px-4 py-3 text-right font-bold text-gray-700 dark:text-gray-200">TOTAL AKHIR:</td>
                                <td className="px-4 py-3 text-right font-bold text-lg text-blue-600 dark:text-blue-400 border-t-2 border-gray-300 dark:border-gray-500">
                                    {formatCurrency(order.harga_total)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* --- DATA PELANGGAN --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Pemesan */}
                <div className="border dark:border-gray-700 rounded-lg p-5 bg-white dark:bg-gray-800">
                    <h3 className="font-bold text-gray-500 dark:text-gray-400 uppercase text-xs mb-3 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
                        👤 Data Pemesan
                    </h3>
                    <div className="space-y-2">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Nama</p>
                            <p className="font-bold text-gray-900 dark:text-white text-lg">{order.nama_pemesan}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">No. Telepon</p>
                            <p className="text-gray-700 dark:text-gray-300 font-mono">{order.telp_pemesan}</p>
                        </div>
                    </div>
                </div>

                {/* Penerima */}
                <div className="border dark:border-gray-700 rounded-lg p-5 bg-white dark:bg-gray-800">
                    <h3 className="font-bold text-gray-500 dark:text-gray-400 uppercase text-xs mb-3 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
                        📍 Data Pengiriman
                    </h3>
                    <div className="space-y-2">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Penerima</p>
                            <p className="font-bold text-gray-900 dark:text-white">{order.nama_penerima}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">No. Telepon</p>
                            <p className="text-gray-700 dark:text-gray-300 font-mono">{order.telp_penerima}</p>
                        </div>
                        <div className="pt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Alamat Lengkap</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-2 rounded mt-1 border border-gray-100 dark:border-gray-700">
                                {order.alamat_pengiriman}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- KARTU UCAPAN (Hanya Tampil jika ada) --- */}
            {(order.ucapan_untuk || order.ucapan_isi || order.ucapan_dari) && (
                <div className="mb-8 p-5 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl shadow-sm">
                    <h3 className="font-bold text-pink-700 dark:text-pink-300 uppercase text-sm mb-4 flex items-center gap-2">
                        💌 Detail Kartu Ucapan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="mb-3">
                                <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase block mb-1">Untuk:</span>
                                <p className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-3 py-2 rounded border border-pink-100 dark:border-pink-900">
                                    {order.ucapan_untuk || '-'}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase block mb-1">Dari:</span>
                                <p className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-3 py-2 rounded border border-pink-100 dark:border-pink-900">
                                    {order.ucapan_dari || '-'}
                                </p>
                            </div>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase block mb-1">Isi Ucapan:</span>
                            <div className="h-full p-4 bg-white dark:bg-gray-800 rounded border border-pink-100 dark:border-pink-900 text-gray-700 dark:text-gray-200 italic font-serif relative">
                                <span className="absolute top-2 left-2 text-pink-200 text-4xl">"</span>
                                <p className="relative z-10 px-2">{order.ucapan_isi || '-'}</p>
                                <span className="absolute bottom-[-10px] right-2 text-pink-200 text-4xl">"</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- CATATAN TAMBAHAN (Hanya Tampil jika ada) --- */}
            {order.catatan && (
                <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg flex gap-3 items-start">
                    <div className="text-2xl mt-0.5">📝</div>
                    <div className="w-full">
                        <h3 className="font-bold text-yellow-800 dark:text-yellow-400 text-sm mb-1">Catatan Pesanan</h3>
                        <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-line">
                            {order.catatan}
                        </p>
                    </div>
                </div>
            )}

            <div className="mt-8 pt-6 border-t dark:border-gray-700">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                    ← Kembali ke Rekapitulasi
                </Link>
            </div>
        </div>
    );
}

export default OrderDetailPage;