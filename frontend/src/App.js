import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import các pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ProductList from './pages/Products/ProductList';
import ProductDetail from './pages/Products/ProductDetail';

import './index.css';
import './App.css';

// Import service để kiểm tra authentication
import authService from './services/authService';

/**
 * Component để protect routes yêu cầu đăng nhập
 */
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = authService.isLoggedIn();
  console.log('🔒 ProtectedRoute - isLoggedIn:', isLoggedIn);
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

/**
 * Component để redirect đã đăng nhập khỏi login/register
 */
const PublicRoute = ({ children }) => {
  const isLoggedIn = authService.isLoggedIn();
  console.log('🔓 PublicRoute - isLoggedIn:', isLoggedIn);
  return isLoggedIn ? <Navigate to="/profile" replace /> : children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route mặc định - chuyển hướng dựa trên trạng thái đăng nhập */}
          <Route path="/" element={
            authService.isLoggedIn() ? 
              <Navigate to="/profile" replace /> : 
              <Navigate to="/login" replace />
          } />

          {/* Public routes - chỉ truy cập khi chưa đăng nhập */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />

          {/* Protected routes - chỉ truy cập khi đã đăng nhập */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/edit-profile" element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          } />

          {/* Product routes (ai cũng có thể xem) */}
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* Fallback route cho các đường dẫn không tồn tại */}
          <Route path="*" element={
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              backgroundColor: '#f8f9fa',
              textAlign: 'center'
            }}>
              <h1>404 - Trang không tồn tại</h1>
              <p>Trang bạn đang tìm kiếm không tồn tại.</p>
              <button 
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                🏠 Về trang chủ
              </button>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
