// src/pages/OrderManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import OrderTable from '../components/OrderTable';
import Pagination from '../components/Pagination';
import Toast from '../components/Toast';
import { Button, Card, Input } from '../components/ui';
import AdminLayout from '../layouts/AdminLayout';
import authService from '../services/authService';
import axios from 'axios';

const OrderManagementPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // State quản lý danh sách đơn hàng
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho dashboard statistics
  const [dashboardStats, setDashboardStats] = useState({
    tongSanPham: 0,
    donHangMoi: 0,
    nguoiDung: 0,
    doanhThu: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

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

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const token = authService.getToken();
      
      if (!token) {
        return;
      }

      const response = await axios.get('http://localhost:5000/api/admin/statistics/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      if (error.response?.status === 401) {
        showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại', 'error');
        setTimeout(() => {
          logout();
          navigate('/admin/login');
        }, 2000);
      }
    } finally {
      setStatsLoading(false);
    }
  }, [logout, navigate]);

  // Load đơn hàng khi component mount
  useEffect(() => {
    fetchOrders(1, selectedStatus, searchTerm);
    fetchDashboardStats();
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
    <AdminLayout>
      {/* Page Title & Statistics */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left: Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-3xl">🛒</span>
              Quản lý đơn hàng
            </h2>
            <p className="text-gray-600 mt-1">Xem và cập nhật trạng thái đơn hàng</p>
          </div>

          {/* Right: Statistics */}
          <div className="flex items-center gap-12">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-800">{orderStats.total}</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Tổng doanh thu</p>
              <p className="text-xl font-bold text-gray-800">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(orderStats.totalRevenue)}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Sản phẩm đã bán</p>
              <p className="text-2xl font-bold text-gray-800">{orderStats.totalProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6 bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 rounded-2xl p-5 shadow-sm border border-pink-100">
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

        {/* Search - 1 dòng: ô tìm kiếm | nút tìm */}
        <form onSubmit={handleSearch} className="flex gap-3 items-stretch">
          {/* 🔍 Ô tìm kiếm */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Tìm kiếm theo mã đơn hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border-2 border-pink-200 rounded-xl 
                       text-gray-700 font-medium text-sm placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400
                       hover:border-pink-300 transition-all duration-200 shadow-sm h-[42px]"
            />
          </div>

          {/* 🔍 Nút tìm kiếm */}
          <button
            type="submit"
            className="px-6 bg-gradient-to-r from-pink-400 to-rose-400 
                     text-white font-semibold text-sm rounded-xl
                     hover:from-pink-500 hover:to-rose-500
                     focus:outline-none focus:ring-2 focus:ring-pink-300
                     transition-all duration-200 shadow-md hover:shadow-lg
                     flex items-center gap-2 whitespace-nowrap h-[42px]"
          >
            <span className="text-lg">🔍</span>
            Tìm kiếm
          </button>
        </form>
      </div>

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
    </AdminLayout>
  );
};

export default OrderManagementPage;
