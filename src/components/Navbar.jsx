import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Label diperpendek sedikit agar muat rapi di HP
  const navItems = [
    { path: '/', label: 'Rekap', icon: '📊' },
    { path: '/pesan', label: 'Pesan', icon: '🛒' },
    { path: '/bahan', label: 'Bahan', icon: '📦' },
    { path: '/packaging', label: 'Pack', icon: '🛍️' },
    { path: '/inventaris', label: 'Aset', icon: '🛠️' },
  ];

  const handleLogout = () => {
    if(window.confirm("Yakin ingin keluar?")) {
        localStorage.removeItem('token'); // Hapus kunci
        navigate('/login'); // Tendang ke login
    }
  };

  return (
    <nav className="bg-gray-800 dark:bg-black text-white p-3 fixed top-0 left-0 right-0 z-50 shadow-md border-b border-gray-700 transition-colors duration-200">
      <div className="container mx-auto flex justify-between items-center overflow-hidden">
        
        {/* Logo / Judul */}
        <Link to="/" className="text-lg md:text-xl font-bold mr-4 whitespace-nowrap text-white">
          Sweetorya Admin
        </Link>

        {/* Menu Items - Horizontal Scroll di HP */}
        <ul className="flex space-x-2 overflow-x-auto no-scrollbar items-center py-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap text-sm md:text-base
                    ${isActive 
                      ? 'bg-gray-900 dark:bg-gray-800 text-yellow-400 font-bold border border-gray-600' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  {/* Di HP label tetap muncul biar jelas, kalau mau icon saja hapus baris ini */}
                  <span className="hidden sm:inline">{item.label}</span> 
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center ml-2 space-x-2">
            {/* TOMBOL LOGOUT BARU */}
            <button 
                onClick={handleLogout}
                className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 px-3 rounded border border-gray-500"
            >
                🚪 Logout
            </button>
        </div>  

      </div>
    </nav>
  );
}

export default Navbar;