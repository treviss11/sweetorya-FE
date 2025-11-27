import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createNewOrder, fetchSuggestions, fetchOrderById, updateOrderApi } from '../services/api';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

function OrderFormPage() {
    const navigate = useNavigate();
    const { id } = useParams(); // Ambil ID jika mode edit
    const isEditMode = !!id;

    // State Data Form
    const [formData, setFormData] = useState({
        nama_pemesan: '', telp_pemesan: '',
        nama_penerima: '', telp_penerima: '', alamat_pengiriman: '',
        ucapan_untuk: '', ucapan_isi: '', ucapan_dari: '',
        tgl_pesan: new Date().toISOString().split('T')[0], // Default hari ini
        tgl_kirim: '', jam_kirim: '', catatan: ''
    });

    const [cartItems, setCartItems] = useState([]);
    const [currentItem, setCurrentItem] = useState({ nama_varian: '', jumlah: '', harga_satuan: '' });
    
    // State Suggestions (Rekomendasi)
    const [customerSuggestions, setCustomerSuggestions] = useState([]);
    const [variantSuggestions, setVariantSuggestions] = useState([]);

    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load Suggestions & Data (Jika Edit)
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                // 1. Ambil Saran
                const suggRes = await fetchSuggestions();
                setCustomerSuggestions(suggRes.data.customers);
                setVariantSuggestions(suggRes.data.variants);

                // 2. Jika Edit Mode, ambil data pesanan
                if (isEditMode) {
                    const orderRes = await fetchOrderById(id);
                    const data = orderRes.data;
                    setFormData({
                        nama_pemesan: data.nama_pemesan,
                        telp_pemesan: data.telp_pemesan,
                        nama_penerima: data.nama_penerima,
                        telp_penerima: data.telp_penerima,
                        alamat_pengiriman: data.alamat_pengiriman,
                        ucapan_untuk: data.ucapan_untuk || '',
                        ucapan_isi: data.ucapan_isi || '',
                        ucapan_dari: data.ucapan_dari || '',
                        tgl_pesan: data.tgl_pesan ? data.tgl_pesan.split('T')[0] : '',
                        tgl_kirim: data.tgl_kirim ? data.tgl_kirim.split('T')[0] : '',
                        jam_kirim: data.jam_kirim || '',
                        catatan: data.catatan || ''
                    });
                    setCartItems(data.items);
                }
            } catch (err) {
                console.error(err);
                setError('Gagal memuat data.');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id, isEditMode]);

    // Handler Input Pelanggan (dengan Autofill)
    const handleCustomerChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Logika Autofill No Telp jika nama dipilih dari saran
        if (name === 'nama_pemesan') {
            const found = customerSuggestions.find(c => c.nama === value);
            if (found) {
                setFormData(prev => ({ ...prev, nama_pemesan: value, telp_pemesan: found.telp }));
            }
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleItemChange = (e) => setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });

    const addItemToCart = () => {
        if (!currentItem.nama_varian || !currentItem.jumlah || !currentItem.harga_satuan) {
            alert("Lengkapi data barang."); return;
        }
        const newItem = {
            nama_varian: currentItem.nama_varian,
            jumlah: parseInt(currentItem.jumlah),
            harga_satuan: parseFloat(currentItem.harga_satuan),
            subtotal: parseInt(currentItem.jumlah) * parseFloat(currentItem.harga_satuan)
        };
        setCartItems([...cartItems, newItem]);
        setCurrentItem({ nama_varian: '', jumlah: '', harga_satuan: '' });
    };

    const removeItemFromCart = (index) => setCartItems(cartItems.filter((_, i) => i !== index));
    const grandTotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSubmitting(true);

        if (cartItems.length === 0) { setError('Tambahkan minimal satu barang.'); setSubmitting(false); return; }

        const payload = { ...formData, items: cartItems };

        try {
            if (isEditMode) {
                await updateOrderApi(id, payload);
                alert('Pesanan berhasil diupdate!');
            } else {
                await createNewOrder(payload);
                alert('Pesanan berhasil dibuat!');
            }
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.msg || 'Gagal menyimpan.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-center dark:text-white">Loading Form...</div>;

    const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm";
    const labelClass = "block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase";

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-4xl mx-auto border dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                {isEditMode ? 'Edit Pesanan' : 'Buat Pesanan Baru'}
            </h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit}>
                {/* --- BAGIAN 1: INFO PESANAN --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 border-b dark:border-gray-700 pb-4">
                    <div>
                        <label className={labelClass}>Tgl Pesan</label>
                        <input type="date" name="tgl_pesan" value={formData.tgl_pesan} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label className={labelClass}>Tgl Kirim</label>
                        <input type="date" name="tgl_kirim" value={formData.tgl_kirim} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label className={labelClass}>Jam Kirim</label>
                        <input type="time" name="jam_kirim" value={formData.jam_kirim} onChange={handleChange} className={inputClass} required />
                    </div>
                </div>

                {/* --- BAGIAN 2: PEMESAN (Autocomplete) --- */}
                <h4 className="font-bold mb-3 text-blue-600 dark:text-blue-400">Data Pemesan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className={labelClass}>Nama Pemesan (Ketik utk cari)</label>
                        <input 
                            type="text" name="nama_pemesan" list="customerList"
                            value={formData.nama_pemesan} onChange={handleCustomerChange} 
                            className={inputClass} required autoComplete="off"
                        />
                        <datalist id="customerList">
                            {customerSuggestions.map((c, i) => <option key={i} value={c.nama}>{c.telp}</option>)}
                        </datalist>
                    </div>
                    <div>
                        <label className={labelClass}>No. Telp</label>
                        <input type="tel" name="telp_pemesan" value={formData.telp_pemesan} onChange={handleChange} className={inputClass} required />
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded mb-6 border dark:border-gray-600">
                    <h4 className="font-bold mb-3 text-gray-800 dark:text-white">Input Item</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div className="md:col-span-2">
                            <label className={labelClass}>Nama Varian (Rekomendasi)</label>
                            <input 
                                type="text" name="nama_varian" list="variantList"
                                value={currentItem.nama_varian} onChange={handleItemChange} 
                                className={inputClass} placeholder="Ketik nama barang..."
                            />
                            <datalist id="variantList">
                                {variantSuggestions.map((v, i) => <option key={i} value={v} />)}
                            </datalist>
                        </div>
                        <div>
                            <label className={labelClass}>Harga @</label>
                            <input type="number" name="harga_satuan" value={currentItem.harga_satuan} onChange={handleItemChange} className={inputClass} placeholder="Rp" />
                        </div>
                        <div className="flex gap-2">
                            <div className="w-20">
                                <label className={labelClass}>Qty</label>
                                <input type="number" name="jumlah" value={currentItem.jumlah} onChange={handleItemChange} className={inputClass} placeholder="1" />
                            </div>
                            <button type="button" onClick={addItemToCart} className="bg-green-600 text-white px-3 rounded hover:bg-green-700 h-[38px] mt-auto font-bold">+</button>
                        </div>
                    </div>
                </div>

                {cartItems.length > 0 && (
                    <div className="mb-6 overflow-x-auto border dark:border-gray-700 rounded">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="px-4 py-2">Barang</th>
                                    <th className="px-4 py-2">Harga</th>
                                    <th className="px-4 py-2">Qty</th>
                                    <th className="px-4 py-2">Subtotal</th>
                                    <th className="px-4 py-2 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item, idx) => (
                                    <tr key={idx} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                        <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{item.nama_varian}</td>
                                        <td className="px-4 py-2">{formatCurrency(item.harga_satuan)}</td>
                                        <td className="px-4 py-2">{item.jumlah}</td>
                                        <td className="px-4 py-2 font-bold text-gray-900 dark:text-white">{formatCurrency(item.subtotal)}</td>
                                        <td className="px-4 py-2 text-center">
                                            <button type="button" onClick={() => removeItemFromCart(idx)} className="text-red-500 hover:underline">Hapus</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-white">
                                <tr>
                                    <td colSpan="3" className="px-4 py-3 text-right font-bold">Total:</td>
                                    <td colSpan="2" className="px-4 py-3 font-bold text-lg text-blue-600 dark:text-blue-400">{formatCurrency(grandTotal)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h4 className="font-bold mb-3 text-gray-800 dark:text-white">Penerima</h4>
                        <div className="space-y-3">
                            <div><label className={labelClass}>Nama Penerima</label><input type="text" name="nama_penerima" value={formData.nama_penerima} onChange={handleChange} className={inputClass} required /></div>
                            <div><label className={labelClass}>No. Telp</label><input type="tel" name="telp_penerima" value={formData.telp_penerima} onChange={handleChange} className={inputClass} required /></div>
                            <div><label className={labelClass}>Alamat</label><textarea name="alamat_pengiriman" value={formData.alamat_pengiriman} onChange={handleChange} className={inputClass} rows="2" required></textarea></div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold mb-3 text-gray-800 dark:text-white">Lain-lain</h4>
                        <div className="space-y-3">
                            <div><label className={labelClass}>Kartu Ucapan (Untuk)</label><input type="text" name="ucapan_untuk" value={formData.ucapan_untuk} onChange={handleChange} className={inputClass} /></div>
                            <div><label className={labelClass}>Isi Ucapan</label><textarea name="ucapan_isi" value={formData.ucapan_isi} onChange={handleChange} className={inputClass} rows="2"></textarea></div>
                            <div><label className={labelClass}>Dari</label><input type="text" name="ucapan_dari" value={formData.ucapan_dari} onChange={handleChange} className={inputClass} /></div>
                            <div><label className={labelClass}>Catatan Pesanan</label><textarea name="catatan" value={formData.catatan} onChange={handleChange} className={inputClass} rows="2" placeholder="Contoh: Jangan pakai selotip..."></textarea></div>
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded shadow-lg disabled:opacity-50 text-lg">
                    {submitting ? 'Menyimpan...' : (isEditMode ? 'Update Pesanan' : 'Buat Pesanan')}
                </button>
            </form>
        </div>
    );
}

export default OrderFormPage;