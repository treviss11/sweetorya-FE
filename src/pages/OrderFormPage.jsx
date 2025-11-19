// src/pages/OrderFormPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNewOrder } from '../services/api';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

function OrderFormPage() {
    const navigate = useNavigate();
    
    // State data utama
    const [formData, setFormData] = useState({
        nama_pemesan: '', telp_pemesan: '',
        nama_penerima: '', telp_penerima: '', alamat_pengiriman: '',
        ucapan_untuk: '', ucapan_isi: '', ucapan_dari: ''
    });

    // State untuk daftar item yang sedang diinput
    const [cartItems, setCartItems] = useState([]);
    
    // State untuk input item sementara (sebelum di-add)
    const [currentItem, setCurrentItem] = useState({
        nama_varian: '',
        jumlah: '',
        harga_satuan: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Handle perubahan input data pemesan/penerima
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle perubahan input item sementara
    const handleItemChange = (e) => {
        setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });
    };

    // Fungsi Tambah Item ke Keranjang Sementara
    const addItemToCart = () => {
        if (!currentItem.nama_varian || !currentItem.jumlah || !currentItem.harga_satuan) {
            alert("Mohon lengkapi data barang (Nama, Jumlah, Harga).");
            return;
        }
        
        const newItem = {
            nama_varian: currentItem.nama_varian,
            jumlah: parseInt(currentItem.jumlah),
            harga_satuan: parseFloat(currentItem.harga_satuan),
            subtotal: parseInt(currentItem.jumlah) * parseFloat(currentItem.harga_satuan)
        };

        setCartItems([...cartItems, newItem]);
        // Reset input item
        setCurrentItem({ nama_varian: '', jumlah: '', harga_satuan: '' });
    };

    // Fungsi Hapus Item dari Keranjang
    const removeItemFromCart = (index) => {
        const newCart = cartItems.filter((_, i) => i !== index);
        setCartItems(newCart);
    };

    // Hitung Grand Total
    const grandTotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);

    // Submit ke Backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        if (cartItems.length === 0) {
            setError('Harap tambahkan minimal satu barang pesanan.');
            setSubmitting(false);
            return;
        }

        const payload = {
            ...formData,
            items: cartItems, // Kirim array item
            // harga_total dihitung ulang di backend, tapi bisa dikirim juga kalau mau
        };

        try {
            await createNewOrder(payload);
            alert('Pesanan berhasil dibuat!');
            navigate('/'); 
        } catch (err) {
            console.error("Error creating order:", err);
            setError(err.response?.data?.msg || 'Gagal membuat pesanan. Coba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    // Styles
    const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-4xl mx-auto border dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Form Pemesanan Fleksibel</h2>
            
            {error && <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit}>
                
                {/* 1. Data Pemesan */}
                <h4 className="text-lg font-semibold mb-3 border-b dark:border-gray-700 pb-2 text-gray-800 dark:text-gray-200">Data Pemesan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className={labelClass}>Nama Pemesan</label>
                        <input type="text" name="nama_pemesan" value={formData.nama_pemesan} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label className={labelClass}>No. Telp Pemesan</label>
                        <input type="tel" name="telp_pemesan" value={formData.telp_pemesan} onChange={handleChange} className={inputClass} required />
                    </div>
                </div>

                {/* 2. Input Barang (Fleksibel) */}
                <h4 className="text-lg font-semibold mb-3 border-b dark:border-gray-700 pb-2 text-gray-800 dark:text-gray-200">Input Barang Pesanan</h4>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded mb-4 border dark:border-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div className="md:col-span-2">
                            <label className={labelClass}>Nama Varian / Barang</label>
                            <input 
                                type="text" 
                                name="nama_varian" 
                                value={currentItem.nama_varian} 
                                onChange={handleItemChange} 
                                placeholder="Contoh: Box 6pcs + Topper" 
                                className={inputClass} 
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Harga Satuan (Rp)</label>
                            <input 
                                type="number" 
                                name="harga_satuan" 
                                value={currentItem.harga_satuan} 
                                onChange={handleItemChange} 
                                placeholder="0" 
                                className={inputClass} 
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="w-20">
                                <label className={labelClass}>Jml</label>
                                <input 
                                    type="number" 
                                    name="jumlah" 
                                    value={currentItem.jumlah} 
                                    onChange={handleItemChange} 
                                    placeholder="1" 
                                    className={inputClass} 
                                />
                            </div>
                            <button 
                                type="button" 
                                onClick={addItemToCart}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded mt-auto h-[42px]"
                            >
                                + Add
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Tabel Daftar Barang yang Dipesan */}
                {cartItems.length > 0 ? (
                    <div className="mb-6 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border dark:border-gray-700">
                            <thead className="bg-gray-100 dark:bg-gray-900">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Barang</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Harga @</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Qty</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Subtotal</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Hapus</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {cartItems.map((item, index) => (
                                    <tr key={index} className="bg-white dark:bg-gray-800">
                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.nama_varian}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{formatCurrency(item.harga_satuan)}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.jumlah}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white font-semibold">{formatCurrency(item.subtotal)}</td>
                                        <td className="px-4 py-2 text-center">
                                            <button 
                                                type="button" 
                                                onClick={() => removeItemFromCart(index)}
                                                className="text-red-500 hover:text-red-700 font-bold"
                                            >
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-blue-50 dark:bg-blue-900/20">
                                <tr>
                                    <td colSpan="3" className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">Total Harga:</td>
                                    <td colSpan="2" className="px-4 py-3 font-bold text-xl text-blue-600 dark:text-blue-400">{formatCurrency(grandTotal)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    <div className="text-center p-4 mb-6 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded">
                        Belum ada barang yang ditambahkan.
                    </div>
                )}

                {/* 4. Pengiriman */}
                <h4 className="text-lg font-semibold mb-3 border-b dark:border-gray-700 pb-2 text-gray-800 dark:text-gray-200">Pengiriman</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className={labelClass}>Nama Penerima</label>
                        <input type="text" name="nama_penerima" value={formData.nama_penerima} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label className={labelClass}>No. Telp Penerima</label>
                        <input type="tel" name="telp_penerima" value={formData.telp_penerima} onChange={handleChange} className={inputClass} required />
                    </div>
                </div>
                <div className="mb-6">
                    <label className={labelClass}>Alamat Pengiriman</label>
                    <textarea name="alamat_pengiriman" value={formData.alamat_pengiriman} onChange={handleChange} className={inputClass} rows="2" required></textarea>
                </div>

                {/* 5. Kartu Ucapan */}
                <h4 className="text-lg font-semibold mb-3 border-b dark:border-gray-700 pb-2 text-gray-800 dark:text-gray-200">Kartu Ucapan (Opsional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded shadow-lg disabled:opacity-50 transition duration-200 text-lg"
                >
                    {submitting ? 'Menyimpan...' : `Simpan Pesanan (${formatCurrency(grandTotal)})`}
                </button>
            </form>
        </div>
    );
}

export default OrderFormPage;