import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleBackToStore = () => {
    navigate('/');
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-left">
            <button className="btn-back-to-store" onClick={handleBackToStore}>
              🏪 Quay lại Store
            </button>
            <h1>🎮 Admin Dashboard - ToyStore</h1>
          </div>
          <div className="admin-info">
            <span className="welcome-text">Xin chào, <strong>{user?.hoTen || 'Admin'}</strong></span>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Đăng xuất
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h2>Đăng nhập thành công!</h2>
            <p>Bạn đã đăng nhập với quyền <strong>Admin</strong></p>
            <p className="user-role">Role: {user?.role}</p>
          </div>

          <div className="stats-grid">
            <div 
              className="stat-card clickable" 
              onClick={() => navigate('/admin/categories')}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon">📂</div>
              <div className="stat-info">
                <h3>Quản lý danh mục</h3>
                <p>Thêm, sửa, xóa danh mục sản phẩm</p>
              </div>
            </div>

            <div 
              className="stat-card clickable" 
              onClick={() => navigate('/admin/products')}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h3>Quản lý sản phẩm</h3>
                <p>Thêm, sửa, xóa sản phẩm</p>
              </div>
            </div>

            <div 
              className="stat-card clickable" 
              onClick={() => navigate('/admin/orders')}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon">🛒</div>
              <div className="stat-info">
                <h3>Quản lý đơn hàng</h3>
                <p>Xem và cập nhật đơn hàng</p>
              </div>
            </div>

            <div 
              className="stat-card clickable" 
              onClick={() => navigate('/admin/users')}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>Quản lý người dùng</h3>
                <p>Quản lý tài khoản khách hàng</p>
              </div>
            </div>

            <div 
              className="stat-card clickable" 
              onClick={() => navigate('/admin/statistics')}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <h3>Thống kê báo cáo</h3>
                <p>Xem báo cáo doanh thu</p>
              </div>
            </div>
          </div>

          <div className="info-box">
            <p><strong>ℹ️ Thông tin:</strong> Click vào các thẻ để truy cập các chức năng quản lý.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
