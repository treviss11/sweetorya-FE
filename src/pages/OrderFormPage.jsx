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

    const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-3xl mx-auto border dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Form Pemesanan Baru</h2>
            {error && <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit}>
                <h4 className="text-lg font-semibold mb-3 border-b dark:border-gray-700 pb-2 text-gray-800 dark:text-gray-200">Data Pemesan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className={labelClass}>Nama Pemesan</label>
                        <input type="text" name="nama_pemesan" value={formData.nama_pemesan} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label className={labelClass}>No. Telp Pemesan</label>
                        <input type="tel" name="telp_pemesan" value={formData.telp_pemesan} onChange={handleChange} className={inputClass} required />
                    </div>
                </div>

                <h4 className="text-lg font-semibold mb-3 border-b dark:border-gray-700 pb-2 text-gray-800 dark:text-gray-200">Detail Pesanan</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className={labelClass}>Tipe Box</label>
                        <select name="tipe_box" value={formData.tipe_box} onChange={handleChange} className={inputClass} required>
                            <option value="">Pilih Tipe...</option>
                            <option value="6pcs">6pcs ({formatCurrency(HARGA_BOX['6pcs'])})</option>
                            <option value="9pcs">9pcs ({formatCurrency(HARGA_BOX['9pcs'])})</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Jumlah Box</label>
                        <input type="number" name="jumlah_box" value={formData.jumlah_box} onChange={handleChange} className={inputClass} required min="1" />
                    </div>
                 </div>
                 <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/30 rounded">
                    <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400">Total: {formatCurrency(totalHarga)}</h4>
                 </div>

                <h4 className="text-lg font-semibold mb-3 border-b dark:border-gray-700 pb-2 text-gray-800 dark:text-gray-200">Pengiriman</h4>
                 <div className="mb-4">
                    <label className={labelClass}>Nama Penerima</label>
                    <input type="text" name="nama_penerima" value={formData.nama_penerima} onChange={handleChange} className={inputClass} required />
                 </div>
                 <div className="mb-4">
                     <label className={labelClass}>No. Telp Penerima</label>
                     <input type="tel" name="telp_penerima" value={formData.telp_penerima} onChange={handleChange} className={inputClass} required />
                 </div>
                 <div className="mb-4">
                     <label className={labelClass}>Alamat Pengiriman</label>
                    <textarea name="alamat_pengiriman" value={formData.alamat_pengiriman} onChange={handleChange} className={inputClass} rows="3" required></textarea>
                 </div>

                <h4 className="text-lg font-semibold mb-3 border-b dark:border-gray-700 pb-2 text-gray-800 dark:text-gray-200">Kartu Ucapan (Opsional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                     <div className="md:col-span-3">
                        <label className={labelClass}>Untuk:</label>
                        <input type="text" name="ucapan_untuk" value={formData.ucapan_untuk} onChange={handleChange} className={inputClass} />
                    </div>
                     <div className="md:col-span-3">
                        <label className={labelClass}>Isi Ucapan:</label>
                        <textarea name="ucapan_isi" value={formData.ucapan_isi} onChange={handleChange} className={inputClass} rows="2"></textarea>
                    </div>
                     <div className="md:col-span-3">
                        <label className={labelClass}>Dari:</label>
                        <input type="text" name="ucapan_dari" value={formData.ucapan_dari} onChange={handleChange} className={inputClass} />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded shadow-lg disabled:opacity-50 transition duration-200"
                >
                    {submitting ? 'Menyimpan...' : 'Simpan Pesanan'}
                </button>
            </form>
        </div>
    );
}

export default OrderFormPage;