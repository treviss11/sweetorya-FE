import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        // Gunakan URL manual atau import dari env
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

        try {
            const res = await axios.post(`${API_URL}/auth/login`, { username, password });
            
            // Simpan token di LocalStorage
            localStorage.setItem('token', res.data.token);
            
            // Redirect ke halaman utama
            window.location.href = '/'; 
        } catch (err) {
            setError(err.response?.data?.msg || 'Login gagal. Periksa koneksi.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Login</h2>
                
                {error && <div className="bg-red-500/20 text-red-200 p-3 rounded mb-4 text-sm border border-red-500/50">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Username</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                            placeholder="Masukkan username"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                            placeholder="Masukkan password"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition duration-200">
                        LOGIN
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;