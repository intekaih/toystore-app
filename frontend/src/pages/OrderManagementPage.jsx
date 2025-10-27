// src/pages/OrderManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import OrderTable from '../components/OrderTable';
import Pagination from '../components/Pagination';
import Toast from '../components/Toast';
import authService from '../services/authService';
import axios from 'axios';
import '../styles/OrderManagementPage.css';

const OrderManagementPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // State quản lý danh sách đơn hàng
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho filter
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // State cho pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    ordersPerPage: 10
  });

  // State cho toast notification
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  // Danh sách trạng thái
  const statusList = [
    { value: '', label: 'Tất cả đơn hàng' },
    { value: 'Chờ xử lý', label: '⏳ Chờ xử lý' },
    { value: 'Đang giao', label: '🚚 Đang giao' },
    { value: 'Đã giao', label: '📦 Đã giao' },
    { value: 'Hoàn thành', label: '✅ Hoàn thành' },
    { value: 'Đã hủy', label: '❌ Đã hủy' }
  ];

  // Hiển thị toast
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  // Fetch danh sách đơn hàng
  const fetchOrders = useCallback(async (page = 1, status = '', search = '') => {
    try {
      setLoading(true);

      // Lấy token từ authService
      const token = authService.getToken();
      
      if (!token) {
        showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại', 'error');
        setTimeout(() => {
          logout();
          navigate('/admin/login');
        }, 2000);
        return;
      }

      const params = {
        page: page,
        limit: pagination.ordersPerPage
      };

      if (status) {
        params.trangThai = status;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await axios.get('http://localhost:5000/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: params
      });

      if (response.data.success) {
        setOrders(response.data.data.orders);
        setPagination({
          currentPage: response.data.data.pagination.currentPage,
          totalPages: response.data.data.pagination.totalPages,
          totalOrders: response.data.data.pagination.totalOrders,
          ordersPerPage: response.data.data.pagination.ordersPerPage
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);

      if (error.response?.status === 401) {
        showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại', 'error');
        setTimeout(() => {
          logout();
          navigate('/admin/login');
        }, 2000);
      } else {
        showToast(error.response?.data?.message || 'Lỗi khi tải danh sách đơn hàng', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [pagination.ordersPerPage, logout, navigate]);

  // Load đơn hàng khi component mount
  useEffect(() => {
    fetchOrders(1, selectedStatus, searchTerm);
  }, []);

  // Xử lý thay đổi filter trạng thái
  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    fetchOrders(1, status, searchTerm);
  };

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders(1, selectedStatus, searchTerm);
  };

  // Xử lý chuyển trang
  const handlePageChange = (page) => {
    fetchOrders(page, selectedStatus, searchTerm);
  };

  // Xử lý cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      // Lấy token từ authService
      const token = authService.getToken();
      
      if (!token) {
        showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại', 'error');
        setTimeout(() => {
          logout();
          navigate('/admin/login');
        }, 2000);
        return;
      }

      const response = await axios.patch(
        `http://localhost:5000/api/admin/orders/${orderId}/status`,
        { trangThai: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        showToast(response.data.message || 'Cập nhật trạng thái thành công', 'success');
        fetchOrders(pagination.currentPage, selectedStatus, searchTerm);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái đơn hàng', 'error');
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Thống kê đơn hàng
  const orderStats = {
    total: pagination.totalOrders,
    totalRevenue: orders.reduce((sum, order) => sum + order.tongTien, 0),
    totalProducts: orders.reduce((sum, order) => sum + order.tongSoLuongSanPham, 0)
  };

  return (
    <div className="order-management-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>
              ⬅️ Dashboard
            </button>
            <h1>🛒 Quản lý đơn hàng</h1>
          </div>
          <div className="header-right">
            <span className="welcome-text">Xin chào, <strong>{user?.hoTen || 'Admin'}</strong></span>
            <button className="btn-logout" onClick={handleLogout}>
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Statistics Bar */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <span className="stat-label">Tổng đơn hàng</span>
              <span className="stat-value">{orderStats.total}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <span className="stat-label">Tổng doanh thu</span>
              <span className="stat-value">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(orderStats.totalRevenue)}
              </span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <span className="stat-label">Sản phẩm đã bán</span>
              <span className="stat-value">{orderStats.totalProducts}</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-section">
            <label>Lọc theo trạng thái:</label>
            <div className="status-filters">
              {statusList.map((status) => (
                <button
                  key={status.value}
                  className={`filter-btn ${selectedStatus === status.value ? 'active' : ''}`}
                  onClick={() => handleStatusChange(status.value)}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          <form className="search-section" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn-search">
              🔍 Tìm kiếm
            </button>
          </form>
        </div>

        {/* Order Table */}
        <OrderTable
          orders={orders}
          onUpdateStatus={handleUpdateStatus}
          loading={loading}
        />

        {/* Pagination */}
        {!loading && orders.length > 0 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default OrderManagementPage;
