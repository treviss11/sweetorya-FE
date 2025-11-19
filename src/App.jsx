import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar';
import RekapPage from './pages/RekapPage';
import OrderFormPage from './pages/OrderFormPage';
import BahanPage from './pages/BahanPage';
import PackagingPage from './pages/Packaging';
import InventarisPage from './pages/InventarisPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto p-4 pt-20"> {/* pt-20 untuk memberi ruang di bawah navbar fixed */}
        <Routes>
          <Route path="/" element={<RekapPage />} />
          <Route path="/pesan" element={<OrderFormPage />} />
          <Route path="/bahan" element={<BahanPage />} />
          <Route path="/packaging" element={<PackagingPage />} />
          <Route path="/inventaris" element={<InventarisPage />} />
          {/* Tambahkan rute lain jika perlu */}
        </Routes>
      </main>
    </div>
  );
}

export default App
