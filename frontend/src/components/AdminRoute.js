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
          <p>Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!user) {
    console.log('❌ AdminRoute: Chưa đăng nhập, redirect to /admin/login');
    return <Navigate to="/admin/login" replace />;
  }

  // Kiểm tra role - hỗ trợ nhiều format khác nhau
  const userRole = (user.role || user.vaiTro || user.VaiTro || '').toString().toLowerCase();
  const isAdmin = userRole === 'admin' || userRole === 'administrator';

  console.log('🔍 AdminRoute check:', {
    user: user.tenDangNhap || user.email,
    role: user.role,
    vaiTro: user.vaiTro,
    VaiTro: user.VaiTro,
    normalizedRole: userRole,
    isAdmin
  });

  // Không phải admin
  if (!isAdmin) {
    console.log('❌ AdminRoute: User không phải admin, redirect to /admin/login');
    return <Navigate to="/admin/login" replace />;
  }

  console.log('✅ AdminRoute: User là admin, cho phép truy cập');
  // Là admin -> cho phép truy cập
  return children;
};

export default AdminRoute;
