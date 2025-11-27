import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchOrderById, deleteOrderApi } from '../services/api';

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
                alert('Gagal memuat detail.');
            } finally { setLoading(false); }
        };
        load();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm("Yakin hapus pesanan ini secara permanen?")) return;
        try {
            await deleteOrderApi(id);
            alert('Terhapus.');
            navigate('/');
        } catch (err) { alert('Gagal hapus.'); }
    };

    if (loading) return <div className="p-10 text-center dark:text-white">Loading...</div>;
    if (!order) return <div className="p-10 text-center dark:text-white">Pesanan tidak ditemukan.</div>;

    return (
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
            <div className="flex justify-between items-start mb-6 border-b dark:border-gray-700 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Detail Pesanan</h2>
                    <p className="text-sm text-gray-500">ID: #{order._id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="space-x-2">
                    <Link to={`/pesan/edit/${id}`} className="bg-yellow-500 text-white px-4 py-2 rounded text-sm font-bold hover:bg-yellow-600">Edit</Link>
                    <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700">Hapus</button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 uppercase text-xs mb-2">Info Jadwal</h3>
                    <p className="dark:text-white">Tgl Pesan: {new Date(order.tgl_pesan).toLocaleDateString('id-ID')}</p>
                    <p className="dark:text-white font-semibold text-blue-600">Kirim: {new Date(order.tgl_kirim).toLocaleDateString('id-ID')} ({order.jam_kirim})</p>
                </div>
                <div>
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 uppercase text-xs mb-2">Status</h3>
                    <p className="dark:text-white">Pesanan: <span className="font-bold">{order.status_pesanan}</span></p>
                    <p className="dark:text-white">Bayar: <span className="font-bold">{order.status_pembayaran}</span></p>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 uppercase text-xs mb-2">Item Pesanan</h3>
                <table className="w-full text-sm dark:text-white border dark:border-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="px-3 py-2 text-left">Barang</th>
                            <th className="px-3 py-2 text-right">Jml</th>
                            <th className="px-3 py-2 text-right">Harga</th>
                            <th className="px-3 py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item, i) => (
                            <tr key={i} className="border-b dark:border-gray-700">
                                <td className="px-3 py-2">{item.nama_varian}</td>
                                <td className="px-3 py-2 text-right">{item.jumlah}</td>
                                <td className="px-3 py-2 text-right">{formatCurrency(item.harga_satuan)}</td>
                                <td className="px-3 py-2 text-right font-bold">{formatCurrency(item.subtotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="3" className="px-3 py-2 text-right font-bold">Total Akhir:</td>
                            <td className="px-3 py-2 text-right font-bold text-lg text-blue-600">{formatCurrency(order.harga_total)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="grid grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-700/30 p-4 rounded mb-4">
                <div>
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 uppercase text-xs mb-2">Pemesan</h3>
                    <p className="dark:text-white font-bold">{order.nama_pemesan}</p>
                    <p className="dark:text-gray-300">{order.telp_pemesan}</p>
                </div>
                <div>
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 uppercase text-xs mb-2">Penerima</h3>
                    <p className="dark:text-white font-bold">{order.nama_penerima}</p>
                    <p className="dark:text-gray-300">{order.telp_penerima}</p>
                    <p className="dark:text-gray-300 text-xs mt-1">{order.alamat_pengiriman}</p>
                </div>
            </div>

            {order.catatan && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm">
                    <span className="font-bold text-yellow-800 dark:text-yellow-200">Catatan:</span> <span className="dark:text-gray-200">{order.catatan}</span>
                </div>
            )}

            <div className="mt-6">
                <Link to="/" className="text-blue-600 hover:underline">← Kembali ke Rekap</Link>
            </div>
        </div>
    );
}

export default OrderDetailPage;