// src/pages/OrderManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import OrderTable from '../components/OrderTable';
import Pagination from '../components/Pagination';
import Toast from '../components/Toast';
import { Button, Card, Input } from '../components/ui';
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
    { value: '', label: 'Tất cả đơn hàng', icon: '📦', color: 'gray' },
    { value: 'Chờ xử lý', label: 'Chờ xử lý', icon: '⏳', color: 'yellow' },
    { value: 'Đang giao', label: 'Đang giao', icon: '🚚', color: 'blue' },
    { value: 'Đã giao', label: 'Đã giao', icon: '📦', color: 'green' },
    { value: 'Hoàn thành', label: 'Hoàn thành', icon: '✅', color: 'green' },
    { value: 'Đã hủy', label: 'Đã hủy', icon: '❌', color: 'red' }
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
      {/* Header */}
      <Card className="mb-6 border-primary-200" padding="md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
              icon="⬅️"
            >
              Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary-400 to-primary-500 rounded-cute text-white">
                🛒
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Quản lý đơn hàng
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Xin chào,</p>
              <p className="font-semibold text-primary-600">{user?.hoTen || 'Admin'}</p>
            </div>
            <Button
              variant="danger"
              onClick={handleLogout}
              icon="🚪"
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card padding="md" className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-cute text-white text-xl">📦</div>
            <div>
              <p className="text-sm text-blue-600">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-blue-700">{orderStats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card padding="md" className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-cute text-white text-xl">💰</div>
            <div>
              <p className="text-sm text-green-600">Tổng doanh thu</p>
              <p className="text-xl font-bold text-green-700">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(orderStats.totalRevenue)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card padding="md" className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500 rounded-cute text-white text-xl">📊</div>
            <div>
              <p className="text-sm text-purple-600">Sản phẩm đã bán</p>
              <p className="text-2xl font-bold text-purple-700">{orderStats.totalProducts}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Section */}
      <Card className="mb-6" padding="md">
        {/* Status Filters */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Lọc theo trạng thái:</h3>
          <div className="flex flex-wrap gap-2">
            {statusList.map((status) => (
              <Button
                key={status.value}
                variant={selectedStatus === status.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange(status.value)}
                icon={status.icon}
              >
                {status.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch}>
          <Input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="🔍"
          />
          <Button type="submit" className="mt-2" fullWidth>
            🔍 Tìm kiếm
          </Button>
        </form>
      </Card>

      {/* Order Table */}
      <Card padding="none" className="mb-6">
        <OrderTable
          orders={orders}
          onUpdateStatus={handleUpdateStatus}
          loading={loading}
        />
      </Card>

      {/* Pagination */}
      {!loading && orders.length > 0 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

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
