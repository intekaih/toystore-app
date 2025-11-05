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

  // ✨ THÊM: State cho auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [previousOrderCount, setPreviousOrderCount] = useState(0);

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
  const fetchOrders = useCallback(async (page = 1, status = '', search = '', silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

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
        const newOrders = response.data.data.orders;
        const newOrderCount = response.data.data.pagination.totalOrders;
        
        // ✨ THÊM: Kiểm tra có đơn hàng mới không
        if (!silent && previousOrderCount > 0 && newOrderCount > previousOrderCount) {
          const newOrdersAdded = newOrderCount - previousOrderCount;
          showToast(`🎉 Có ${newOrdersAdded} đơn hàng mới!`, 'success');
          
          // Phát âm thanh thông báo (optional)
          if (typeof Audio !== 'undefined') {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eafTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgc7y2Yk2CBlou+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgsry2Yk2CBlou+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgsry2Yk2CBlou+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgsry2Yk2CBloP+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgsry2Yk2CBloP+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgsry2Yk2CBloP+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgsry2Yk2CBloP+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgsry2Yk2CBloP+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAA==');
            audio.play().catch(() => {}); // Bỏ qua lỗi nếu không phát được
          }
        }
        
        setOrders(newOrders);
        setPreviousOrderCount(newOrderCount);
        setPagination({
          currentPage: response.data.data.pagination.currentPage,
          totalPages: response.data.data.pagination.totalPages,
          totalOrders: response.data.data.pagination.totalOrders,
          ordersPerPage: response.data.data.pagination.ordersPerPage
        });
        
        // ✨ THÊM: Cập nhật thời gian refresh
        setLastRefreshTime(new Date());
      }
    } catch (error) {
      console.error('Error fetching orders:', error);

      if (error.response?.status === 401) {
        showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại', 'error');
        setTimeout(() => {
          logout();
          navigate('/admin/login');
        }, 2000);
      } else if (!silent) {
        showToast(error.response?.data?.message || 'Lỗi khi tải danh sách đơn hàng', 'error');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [pagination.ordersPerPage, previousOrderCount, logout, navigate]);

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

  // ✨ THÊM: Auto-refresh mỗi 30 giây
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing orders...');
      fetchOrders(pagination.currentPage, selectedStatus, searchTerm, true); // silent mode
    }, 30000); // 30 giây

    return () => clearInterval(interval);
  }, [autoRefresh, pagination.currentPage, selectedStatus, searchTerm, fetchOrders]);

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

  // ✨ THÊM: Hàm format thời gian refresh
  const formatLastRefreshTime = () => {
    const now = new Date();
    const diff = Math.floor((now - lastRefreshTime) / 1000); // seconds
    
    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    return lastRefreshTime.toLocaleTimeString('vi-VN');
  };

  // ✨ THÊM: Hàm refresh thủ công
  const handleManualRefresh = () => {
    showToast('🔄 Đang làm mới...', 'info');
    fetchOrders(pagination.currentPage, selectedStatus, searchTerm);
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

      {/* ✨ THÊM: Auto-refresh Controls */}
      <div className="mb-4 flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          {/* Toggle Auto-refresh */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-pink-500 rounded focus:ring-pink-400"
            />
            <span className="text-sm font-medium text-gray-700">
              Tự động làm mới (30s)
            </span>
          </label>
          
          {/* Last Refresh Time */}
          <span className="text-xs text-gray-500">
            Cập nhật lần cuối: {formatLastRefreshTime()}
          </span>
        </div>
        
        {/* Manual Refresh Button */}
        <button
          onClick={handleManualRefresh}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 
                   text-white text-sm font-semibold rounded-lg
                   hover:from-blue-500 hover:to-blue-600
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 shadow-md hover:shadow-lg
                   flex items-center gap-2"
        >
          <span className={loading ? 'animate-spin' : ''}>🔄</span>
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
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
