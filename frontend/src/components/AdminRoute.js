import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * AdminRoute - Protected route chỉ dành cho Admin
 * Kiểm tra xem user có role 'admin' không
 * Nếu không phải admin -> redirect về trang đăng nhập admin
 */
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Đang load thông tin user
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập hoặc không phải admin
  // Kiểm tra cả user.role và user.vaiTro để tương thích
  if (!user || (user.role !== 'admin' && user.vaiTro !== 'admin')) {
    console.log('❌ AdminRoute: User is not admin', user);
    return <Navigate to="/admin/login" replace />;
  }

  console.log('✅ AdminRoute: User is admin, allowing access', user);
  // Là admin -> cho phép truy cập
  return children;
};

export default AdminRoute;
