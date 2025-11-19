import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '📊 Rekap Pesanan', icon: '📊' },
    { path: '/pesan', label: '🛒 Form Pembelian', icon: '🛒' },
    { path: '/bahan', label: '📦 Form Bahan', icon: '📦' },
    { path: '/packaging', label: '🛍️ Form Packaging', icon: '🛍️' },
    { path: '/inventaris', label: '🛠️ Form Inventaris', icon: '🛠️' },
  ];

  return (
    <nav className="bg-gray-800 text-white p-4 fixed top-0 left-0 right-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Pembukuan Toko</Link>
        <button
          className="md:hidden block text-white focus:outline-none"
          onClick={() => {
            // Logika simple toggle menu mobile jika diperlukan nanti
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
          }}
        >
          ☰ {/* Hamburger Icon */}
        </button>
        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-4">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`hover:bg-gray-700 px-3 py-2 rounded ${
                  location.pathname === item.path ? 'bg-gray-900' : ''
                }`}
              >
                {/* Tampilkan icon di layar kecil, label di layar besar */}
                 <span className="sm:hidden">{item.icon}</span>
                 <span className="hidden sm:inline">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
       {/* Mobile Menu (Hidden by default) */}
       <div id="mobile-menu" className="md:hidden hidden mt-2">
         <ul className="flex flex-col space-y-1">
             {navItems.map((item) => (
               <li key={item.path}>
                 <Link
                   to={item.path}
                   className={`block hover:bg-gray-700 px-3 py-2 rounded ${
                     location.pathname === item.path ? 'bg-gray-900' : ''
                   }`}
                   onClick={() => document.getElementById('mobile-menu').classList.add('hidden')} // Hide after click
                 >
                   {item.label}
                 </Link>
               </li>
             ))}
           </ul>
       </div>
    </nav>
  );
}

export default Navbar;