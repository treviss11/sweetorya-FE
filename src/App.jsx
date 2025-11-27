import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar';
import RekapPage from './pages/RekapPage';
import OrderFormPage from './pages/OrderFormPage';
import BahanPage from './pages/BahanPage';
import PackagingPage from './pages/PackagingPage';
import InventarisPage from './pages/InventarisPage';
import OrderDetailPage from './pages/OrderDetailPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Navbar />
      <main className="container mx-auto p-4 pt-20"> 
        <Routes>
          <Route path="/" element={<RekapPage />} />
          <Route path="/pesan" element={<OrderFormPage />} />
          <Route path="/bahan" element={<BahanPage />} />
          <Route path="/packaging" element={<PackagingPage />} />
          <Route path="/inventaris" element={<InventarisPage />} />
          <Route path="/pesan/edit/:id" element={<OrderFormPage />} /> 
          <Route path="/pesan/detail/:id" element={<OrderDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App
