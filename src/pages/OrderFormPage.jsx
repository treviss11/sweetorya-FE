import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNewOrder } from '../services/api';

const HARGA_BOX = { '6pcs': 37800, '9pcs': 55800 };
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

function OrderFormPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nama_pemesan: '', telp_pemesan: '', tipe_box: '', jumlah_box: '',
        nama_penerima: '', telp_penerima: '', alamat_pengiriman: '',
        ucapan_untuk: '', ucapan_isi: '', ucapan_dari: ''
    });
    const [totalHarga, setTotalHarga] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Calculate total price when tipe_box or jumlah_box changes
        const tipe = formData.tipe_box;
        const jumlah = parseInt(formData.jumlah_box, 10);
        if (HARGA_BOX[tipe] && jumlah > 0) {
            setTotalHarga(HARGA_BOX[tipe] * jumlah);
        } else {
            setTotalHarga(0);
        }
    }, [formData.tipe_box, formData.jumlah_box]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        // Simple frontend validation
        if (!formData.tipe_box || !formData.jumlah_box || formData.jumlah_box < 1) {
            setError('Tipe box dan Jumlah box wajib diisi dengan benar.');
            setSubmitting(false);
            return;
        }
        if (!formData.nama_pemesan || !formData.telp_pemesan || !formData.nama_penerima || !formData.telp_penerima || !formData.alamat_pengiriman) {
             setError('Data pemesan dan penerima wajib diisi.');
            setSubmitting(false);
            return;
        }


        try {
            await createNewOrder(formData);
            alert('Pesanan berhasil dibuat!');
            navigate('/'); // Redirect to Rekap page after success
        } catch (err) {
            console.error("Error creating order:", err);
            setError(err.response?.data?.msg || 'Gagal membuat pesanan. Coba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Form Pemesanan Baru</h2>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit}>
                <h4 className="text-lg font-semibold mb-3 border-b pb-2">Data Pemesan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemesan</label>
                        <input type="text" name="nama_pemesan" value={formData.nama_pemesan} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">No. Telp Pemesan</label>
                        <input type="text" name="telp_pemesan" value={formData.telp_pemesan} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
                    </div>
                </div>

                <h4 className="text-lg font-semibold mb-3 border-b pb-2">Detail Pesanan</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Box</label>
                        <select name="tipe_box" value={formData.tipe_box} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 bg-white" required>
                            <option value="">Pilih Tipe...</option>
                            <option value="6pcs">6pcs ({formatCurrency(HARGA_BOX['6pcs'])})</option>
                            <option value="9pcs">9pcs ({formatCurrency(HARGA_BOX['9pcs'])})</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Box</label>
                        <input type="number" name="jumlah_box" value={formData.jumlah_box} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" required min="1" />
                    </div>
                 </div>
                 <div className="mb-6">
                    <h4 className="text-xl font-bold text-blue-600">Total Estimasi: {formatCurrency(totalHarga)}</h4>
                 </div>

                <h4 className="text-lg font-semibold mb-3 border-b pb-2">Data Penerima & Pengiriman</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penerima</label>
                        <input type="text" name="nama_penerima" value={formData.nama_penerima} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">No. Telp Penerima</label>
                        <input type="text" name="telp_penerima" value={formData.telp_penerima} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
                    </div>
                 </div>
                 <div className="mb-4">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Pengiriman</label>
                    <textarea name="alamat_pengiriman" value={formData.alamat_pengiriman} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" rows="3" required></textarea>
                 </div>

                <h4 className="text-lg font-semibold mb-3 border-b pb-2">Kartu Ucapan (Opsional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Untuk:</label>
                        <input type="text" name="ucapan_untuk" value={formData.ucapan_untuk} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Isi Ucapan:</label>
                        <textarea name="ucapan_isi" value={formData.ucapan_isi} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" rows="1"></textarea>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dari:</label>
                        <input type="text" name="ucapan_dari" value={formData.ucapan_dari} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                    {submitting ? 'Menyimpan...' : 'Simpan Pesanan'}
                </button>
            </form>
        </div>
    );
}

export default OrderFormPage;