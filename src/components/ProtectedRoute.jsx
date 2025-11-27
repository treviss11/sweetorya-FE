import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        // Jika tidak ada token, lempar ke halaman login
        return <Navigate to="/login" replace />;
    }

    // Jika ada token, izinkan masuk
    return children;
};

export default ProtectedRoute;