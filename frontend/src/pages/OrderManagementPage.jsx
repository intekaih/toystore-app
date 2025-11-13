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
import config from '../config';

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
  const fetchOrders = useCallback(async (page = 1, status = '', search = '', silent = false, isRefresh = false) => {
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

      const response = await axios.get(config.endpoints.admin.orders, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: params
      });

      if (response.data.success) {
        const newOrders = response.data.data.orders;
        const newOrderCount = response.data.data.pagination.totalOrders;
        
        // ✨ CHỈ hiển thị thông báo khi đang refresh (auto hoặc thủ công), KHÔNG hiển thị khi lọc/tìm kiếm
        if (isRefresh && !silent && previousOrderCount > 0 && newOrderCount > previousOrderCount) {
          const newOrdersAdded = newOrderCount - previousOrderCount;
          showToast(`🎉 Có ${newOrdersAdded} đơn hàng mới!`, 'success');
          
          // Phát âm thanh thông báo (optional)
          if (typeof Audio !== 'undefined') {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eafTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgc7y2Yk2CBlou+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgc7y2Yk2CBlou+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgc7y2Yk2CBlou+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgc7y2Yk2CBloP+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgc7y2Yk2CBloP+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgsry2Yk2CBlou+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgsry2Yk2CBloP+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgsry2Yk2CBloP+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAA==');
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

      const response = await axios.get(config.endpoints.admin.statistics.dashboard, {
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
      fetchOrders(pagination.currentPage, selectedStatus, searchTerm, true, true); // silent mode
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
        `${config.endpoints.admin.orders}/${orderId}/status`,
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
    fetchOrders(pagination.currentPage, selectedStatus, searchTerm, false, true);
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
      {/* 📋 Simple Header - No Card */}
      <div className="mb-3 flex items-center justify-between">
        {/* Left: Title */}
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">🛒</span>
          Quản lý đơn hàng
        </h2>
        
        {/* Right: Manual Refresh Button Only */}
        <button
          onClick={handleManualRefresh}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 
                   text-white text-sm font-semibold rounded-lg
                   hover:from-blue-500 hover:to-blue-600
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 shadow-sm hover:shadow-md
                   flex items-center gap-2"
        >
          <span className={loading ? 'animate-spin' : ''}>🔄</span>
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {/* 🎯 Compact Filter Section */}
      <div className="mb-4 bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 rounded-xl p-3 shadow-sm border border-pink-100">
        {/* Status Filters - Compact */}
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Lọc theo trạng thái:</h3>
          <div className="flex flex-wrap gap-2">
            {statusList.map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                className={`
                  px-3 py-1.5 text-xs font-semibold rounded-lg
                  transition-all duration-200 shadow-sm
                  flex items-center gap-1.5
                  ${selectedStatus === status.value
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-pink-300 hover:shadow-md'
                  }
                `}
              >
                <span className="text-sm">{status.icon}</span>
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search - Compact */}
        <form onSubmit={handleSearch} className="flex gap-2 items-stretch">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo mã đơn hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 bg-white border-2 border-pink-200 rounded-lg 
                     text-gray-700 font-medium text-sm placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400
                     hover:border-pink-300 transition-all duration-200 shadow-sm"
          />

          <button
            type="submit"
            className="px-4 bg-gradient-to-r from-pink-400 to-rose-400 
                     text-white font-semibold text-sm rounded-lg
                     hover:from-pink-500 hover:to-rose-500
                     focus:outline-none focus:ring-2 focus:ring-pink-300
                     transition-all duration-200 shadow-md hover:shadow-lg
                     flex items-center gap-2 whitespace-nowrap"
          >
            <span className="text-base">🔍</span>
            <span className="hidden sm:inline">Tìm kiếm</span>
          </button>
        </form>
      </div>

      {/* 📊 Order Table - Focus Area */}
      <Card padding="none" className="mb-4">
        <OrderTable
          orders={orders}
          onUpdateStatus={handleUpdateStatus}
          loading={loading}
        />
      </Card>

      {/* 📄 Pagination */}
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
