// src/pages/OrderManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ShoppingCart,
  RefreshCw,
  Search,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  PartyPopper
} from 'lucide-react';
import { adminService, statisticsService } from '../services';
import staffService from '../services/staffService';
import OrderTable from '../components/OrderTable';
import Pagination from '../components/Pagination';
import Toast from '../components/Toast';
import { Button, Card, Input } from '../components/ui';
import AdminLayout from '../layouts/AdminLayout';

const OrderManagementPage = ({ isStaffView = false }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({
    tongSanPham: 0,
    donHangMoi: 0,
    nguoiDung: 0,
    doanhThu: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    ordersPerPage: 10
  });
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  const [statusCounts, setStatusCounts] = useState({
    tatCa: 0,
    choXuLy: 0,
    dangGiao: 0,
    daGiao: 0,
    hoanThanh: 0,
    daHuy: 0
  });

  const statusList = [
    { value: '', label: 'Tất cả đơn hàng', icon: Package, color: 'gray', countKey: 'tatCa' },
    { value: 'Chờ xử lý', label: 'Chờ xử lý', icon: Clock, color: 'yellow', countKey: 'choXuLy' },
    { value: 'Đang giao', label: 'Đang giao', icon: Truck, color: 'blue', countKey: 'dangGiao' },
    { value: 'Đã giao', label: 'Đã giao', icon: Package, color: 'green', countKey: 'daGiao' },
    { value: 'Hoàn thành', label: 'Hoàn thành', icon: CheckCircle, color: 'green', countKey: 'hoanThanh' },
    { value: 'Đã hủy', label: 'Đã hủy', icon: XCircle, color: 'red', countKey: 'daHuy' }
  ];

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const fetchOrderCounts = useCallback(async () => {
    try {
      // Staff không có API riêng cho order counts, bỏ qua
      if (isStaffView) {
        return;
      }
      const response = await adminService.getOrderCountsByStatus();
      if (response.success) {
        setStatusCounts(response.data);
      }
    } catch (error) {
      console.error('Error fetching order counts:', error);
    }
  }, [isStaffView]);

  const fetchOrders = useCallback(async (page = 1, status = '', search = '', silent = false, isRefresh = false, skipStateUpdate = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const params = {
        page: page,
        limit: pagination.ordersPerPage
      };

      if (status) {
        params.trangThai = status;
      }

      if (search.trim()) {
        params.keyword = search.trim(); // Staff dùng keyword thay vì search
      }

      // Dùng service tương ứng với role
      const service = isStaffView ? staffService : adminService;
      const method = isStaffView ? 'getOrders' : 'getAllOrders';
      const response = await service[method](params);

      if (response.success) {
        // Staff response format từ staffService: { success: true, data: [...], pagination: {...} }
        // Admin response format: { success: true, data: { orders: [...] }, pagination: {...} }
        let newOrders = isStaffView
          ? (response.data || [])  // Staff: staffService đã parse, data là array orders
          : (response.data?.orders || response.data || []); // Admin: data.orders hoặc data

        // Backend đã convert sang camelCase bằng DTOMapper, chỉ cần normalize nhẹ
        console.log('🔍 [OrderManagementPage] Raw orders from backend:', newOrders);
        newOrders = newOrders.map(order => {
          // Tính tổng số lượng sản phẩm
          const chiTiet = order.chiTiet || [];
          const tongSoLuongSanPham = chiTiet.reduce((sum, item) => {
            return sum + (item.soLuong || 0);
          }, 0);

          // Khách hàng - backend đã convert, lấy từ taiKhoan
          const khachHang = {
            hoTen: order.khachHang?.taiKhoan?.hoTen || order.khachHang?.hoTen || '',
            dienThoai: order.khachHang?.taiKhoan?.dienThoai || order.khachHang?.dienThoai || '',
            email: order.khachHang?.taiKhoan?.email || order.khachHang?.email || ''
          };

          // Phương thức thanh toán
          const phuongThucThanhToan = {
            ten: order.phuongThucThanhToan?.ten || '',
            id: order.phuongThucThanhToan?.id
          };

          // Địa chỉ giao hàng - backend đã convert
          const diaChiGiaoHang = order.diaChiGiaoHang ? {
            id: order.diaChiGiaoHang.id,
            diaChiChiTiet: order.diaChiGiaoHang.diaChiChiTiet || '',
            tenPhuong: order.diaChiGiaoHang.tenPhuong || '',
            tenQuan: order.diaChiGiaoHang.tenQuan || '',
            tenTinh: order.diaChiGiaoHang.tenTinh || '',
            tenNguoiNhan: order.diaChiGiaoHang.tenNguoiNhan || '',
            soDienThoai: order.diaChiGiaoHang.soDienThoai || ''
          } : null;

          return {
            id: order.id,
            maHD: order.maHd || order.maHD,
            trangThai: order.trangThai,
            tongTien: order.thanhTien || order.tongTien || 0,
            thanhTien: order.thanhTien || 0,
            ngayLap: order.ngayLap,
            tongSoLuongSanPham: tongSoLuongSanPham,
            khachHang: khachHang,
            phuongThucThanhToan: phuongThucThanhToan,
            diaChiGiaoHang: diaChiGiaoHang,
            chiTiet: chiTiet,
            ...order // Giữ lại các field khác
          };
        });
        console.log('✅ [OrderManagementPage] Normalized orders:', newOrders);

        const paginationData = response.pagination || {};
        const newOrderCount = paginationData?.total || paginationData?.totalOrders || newOrders.length;

        if (isRefresh && !silent && previousOrderCount > 0 && newOrderCount > previousOrderCount) {
          const newOrdersAdded = newOrderCount - previousOrderCount;
          showToast(`Có ${newOrdersAdded} đơn hàng mới!`, 'success');

          if (typeof Audio !== 'undefined') {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eafTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgc7y2Yk2CBlou+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgc7y2Yk2CBlou+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgc7y2Yk2CBlou+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgc7y2Yk2CBlou+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgc7y2Yk2CBloP+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgsry2Yk2CBlou+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgsry2Yk2CBloP+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgsry2Yk2CBloP+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgsry2Yk2CBloP+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAAhRftOvqVRQKRp/g8r5sIQUrgsry2Yk2CBloP+3mn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAA==');
            audio.play().catch(() => { });
          }
        }

        // ✅ SỬA: Luôn dùng dữ liệu từ server, nhưng merge với orders hiện tại để giữ animation mượt
        setOrders(newOrders);

        setPreviousOrderCount(newOrderCount);
        setPagination({
          currentPage: paginationData?.page || paginationData?.currentPage || 1,
          totalPages: paginationData?.totalPages || 1,
          totalOrders: paginationData?.total || paginationData?.totalOrders || newOrders.length,
          ordersPerPage: paginationData?.limit || paginationData?.ordersPerPage || pagination.ordersPerPage
        });

        setLastRefreshTime(new Date());
      }
    } catch (error) {
      console.error('Error fetching orders:', error);

      if (error.message?.includes('đăng nhập')) {
        showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại', 'error');
        setTimeout(() => {
          logout();
          navigate(isStaffView ? '/login' : '/admin/login');
        }, 2000);
      } else if (!silent) {
        showToast(error.message || 'Lỗi khi tải danh sách đơn hàng', 'error');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [pagination.ordersPerPage, previousOrderCount, logout, navigate, isStaffView]);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setStatsLoading(true);

      const response = await statisticsService.getDashboardStats();

      if (response.success) {
        setDashboardStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      if (error.message?.includes('đăng nhập')) {
        showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại', 'error');
        setTimeout(() => {
          logout();
          navigate(isStaffView ? '/login' : '/admin/login');
        }, 2000);
      }
    } finally {
      setStatsLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchOrders(1, selectedStatus, searchTerm);
    fetchDashboardStats();
    fetchOrderCounts();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('Auto-refreshing orders...');
      fetchOrders(pagination.currentPage, selectedStatus, searchTerm, true, true);
      fetchOrderCounts(); // ⭐ Also refresh badge counts
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, pagination.currentPage, selectedStatus, searchTerm, fetchOrders, fetchOrderCounts]);

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    fetchOrders(1, status, searchTerm);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders(1, selectedStatus, searchTerm);
  };

  const handlePageChange = (page) => {
    fetchOrders(page, selectedStatus, searchTerm);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      console.log(`🔄 [handleUpdateStatus] Bắt đầu cập nhật order ${orderId} → ${newStatus}`);

      // ✅ CẬP NHẬT NGAY: Cập nhật trạng thái trong state ngay lập tức
      setOrders(prevOrders => {
        const updated = prevOrders.map(order =>
          order.id === orderId
            ? { ...order, trangThai: newStatus }
            : order
        );
        console.log(`✅ [handleUpdateStatus] Đã cập nhật state local cho order ${orderId}: ${newStatus}`);
        return updated;
      });

      showToast('Cập nhật trạng thái thành công', 'success');

      // ✅ Refresh badge counts
      await fetchOrderCounts();

    } catch (error) {
      console.error('❌ [handleUpdateStatus] Error updating order status:', error);
      showToast(error.message || 'Lỗi khi cập nhật trạng thái đơn hàng', 'error');
      // ✅ Reload lại orders nếu có lỗi để đồng bộ với server
      fetchOrders(pagination.currentPage, selectedStatus, searchTerm);
    }
  };

  const formatLastRefreshTime = () => {
    const now = new Date();
    const diff = Math.floor((now - lastRefreshTime) / 1000);

    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    return lastRefreshTime.toLocaleTimeString('vi-VN');
  };

  const handleManualRefresh = () => {
    showToast('Đang làm mới...', 'info');
    fetchOrders(pagination.currentPage, selectedStatus, searchTerm, false, true);
    fetchOrderCounts(); // ⭐ Refresh badge counts on manual refresh
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const orderStats = {
    total: pagination.totalOrders,
    totalRevenue: orders.reduce((sum, order) => sum + (order.tongTien || order.thanhTien || 0), 0),
    totalProducts: orders.reduce((sum, order) => sum + (order.tongSoLuongSanPham || 0), 0)
  };

  return (
    <AdminLayout isStaffView={isStaffView}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingCart className="text-pink-500" size={24} />
          Quản lý đơn hàng
        </h2>

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
          <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      <div className="mb-4 bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 rounded-xl p-3 shadow-sm border border-pink-100">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Lọc theo trạng thái:</h3>
          <div className="flex flex-wrap gap-2">
            {statusList.map((status) => {
              const IconComponent = status.icon;
              return (
                <button
                  key={status.value}
                  onClick={() => handleStatusChange(status.value)}
                  className={`
                    px-3 py-1.5 text-xs font-semibold rounded-lg
                    transition-all duration-200 shadow-sm
                    flex items-center gap-1.5 relative
                    ${selectedStatus === status.value
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-pink-300 hover:shadow-md'
                    }
                  `}
                >
                  <IconComponent size={14} />
                  {status.label}
                  {statusCounts[status.countKey] > 0 && (
                    <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${selectedStatus === status.value
                      ? 'bg-white/30 text-white'
                      : 'bg-pink-100 text-pink-600'
                      }`}>
                      {statusCounts[status.countKey]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 items-stretch">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white border-2 border-pink-200 rounded-lg 
                       text-gray-700 font-medium text-sm placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400
                       hover:border-pink-300 transition-all duration-200 shadow-sm"
            />
          </div>

          <button
            type="submit"
            className="px-4 bg-gradient-to-r from-pink-400 to-rose-400 
                     text-white font-semibold text-sm rounded-lg
                     hover:from-pink-500 hover:to-rose-500
                     focus:outline-none focus:ring-2 focus:ring-pink-300
                     transition-all duration-200 shadow-md hover:shadow-lg
                     flex items-center gap-2 whitespace-nowrap"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Tìm kiếm</span>
          </button>
        </form>
      </div>

      <Card padding="none" className="mb-4">
        <OrderTable
          orders={orders}
          isStaffView={isStaffView}
          onUpdateStatus={handleUpdateStatus}
          loading={loading}
        />
      </Card>

      {!loading && orders.length > 0 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

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
