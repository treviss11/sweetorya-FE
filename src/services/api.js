import axios from 'axios';

// Ambil base URL dari environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Order API Calls ---
export const fetchOrders = (page = 1, limit = 20, search = '') => {
    return api.get(`/orders?page=${page}&limit=${limit}&search=${search}`);
};
export const createNewOrder = (orderData) => api.post('/orders', orderData);
export const updateOrderStatusApi = (orderId, statusData) => api.patch(`/orders/${orderId}/status`, statusData);
export const updateOrderTestimonialApi = (orderId, testimonialData) => api.patch(`/orders/${orderId}/testimonial`, testimonialData);
export const fetchSummary = () => api.get('/orders/summary');

// --- Bahan API Calls ---
export const fetchBahan = (search = '') => api.get(`/bahan?search=${search}`);
export const createNewBahan = (bahanData) => api.post('/bahan', bahanData);
export const updateBahanStockApi = (bahanId, stockData) => api.patch(`/bahan/${bahanId}/stock`, stockData);
export const updateBahanApi = (id, data) => api.put(`/bahan/${id}`, data);
export const deleteBahanApi = (id) => api.delete(`/bahan/${id}`);

// --- Packaging API Calls ---
export const fetchPackaging = (search = '') => api.get(`/packaging?search=${search}`);
export const createNewPackaging = (packagingData) => api.post('/packaging', packagingData);
export const updatePackagingStockApi = (packagingId, stockData) => api.patch(`/packaging/${packagingId}/stock`, stockData);
export const updatePackagingApi = (id, data) => api.put(`/packaging/${id}`, data);
export const deletePackagingApi = (id) => api.delete(`/packaging/${id}`);

// --- Asset (Inventaris) API Calls ---
export const fetchAssets = (search = '') => api.get(`/inventaris?search=${search}`);
export const createNewAsset = (assetData) => api.post('/inventaris', assetData);
export const updateAssetFullApi = (id, data) => api.put(`/inventaris/${id}`, data);
export const updateAssetKondisiApi = (assetId, kondisiData) => api.patch(`/inventaris/${assetId}/kondisi`, kondisiData);
export const deleteAssetApi = (assetId) => api.delete(`/inventaris/${assetId}`);

export const downloadExcelReport = () => {
    return api.get('/reports/download', {
        responseType: 'blob', // PENTING: Agar dianggap sebagai file
    });
};

export default api; // Bisa juga tidak diexport default jika hanya memakai fungsi di atas