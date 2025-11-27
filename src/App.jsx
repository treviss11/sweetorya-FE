import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import RekapPage from './pages/RekapPage';
import OrderFormPage from './pages/OrderFormPage';
import OrderDetailPage from './pages/OrderDetailPage';
import BahanPage from './pages/BahanPage';
import PackagingPage from './pages/PackagingPage';
import InventarisPage from './pages/InventarisPage';
import LoginPage from './pages/LoginPage'; // Import Login
import ProtectedRoute from './components/ProtectedRoute'; // Import Penjaga

function App() {
  const location = useLocation();
  // Sembunyikan Navbar jika di halaman login
  const showNavbar = location.pathname !== '/login';

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
      {showNavbar && <Navbar />}
      
      <main className={showNavbar ? "container mx-auto p-4 pt-20" : ""}>
        <Routes>
          {/* Halaman Publik */}
          <Route path="/login" element={<LoginPage />} />

          {/* Halaman Terkunci (Protected) */}
          <Route path="/" element={<ProtectedRoute><RekapPage /></ProtectedRoute>} />
          <Route path="/pesan" element={<ProtectedRoute><OrderFormPage /></ProtectedRoute>} />
          <Route path="/pesan/edit/:id" element={<ProtectedRoute><OrderFormPage /></ProtectedRoute>} />
          <Route path="/pesan/detail/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/bahan" element={<ProtectedRoute><BahanPage /></ProtectedRoute>} />
          <Route path="/packaging" element={<ProtectedRoute><PackagingPage /></ProtectedRoute>} />
          <Route path="/inventaris" element={<ProtectedRoute><InventarisPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;