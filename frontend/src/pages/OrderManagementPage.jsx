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
  PartyPopper,
  Calendar,
  CreditCard,
  User,
  AlertCircle,
  X
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
  const [autoRefresh, setAutoRefresh] = useState(false); // ✅ TẮT auto-refresh
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false); // ✅ THÊM: Track khi đang cập nhật
  const [localUpdatedOrders, setLocalUpdatedOrders] = useState(new Set()); // ✅ THÊM: Track các order đã cập nhật local
  const [dashboardStats, setDashboardStats] = useState({
    tongSanPham: 0,
    donHangMoi: 0,
    nguoiDung: 0,
    doanhThu: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
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
    { value: 'Chờ thanh toán', label: 'Chờ thanh toán', icon: Clock, color: 'yellow', countKey: 'choThanhToan' },
    { value: 'Chờ xử lý', label: 'Chờ xử lý', icon: Clock, color: 'yellow', countKey: 'choXuLy' },
    { value: 'Đã xác nhận', label: 'Đã xác nhận', icon: CheckCircle, color: 'blue', countKey: 'daXacNhan' },
    { value: 'Đang đóng gói', label: 'Đang đóng gói', icon: Package, color: 'orange', countKey: 'dangDongGoi' },
    { value: 'Sẵn sàng giao hàng', label: 'Sẵn sàng giao hàng', icon: Truck, color: 'blue', countKey: 'sanSangGiaoHang' },
    { value: 'Đang giao hàng', label: 'Đang giao hàng', icon: Truck, color: 'blue', countKey: 'dangGiaoHang' },
    { value: 'Đã giao hàng', label: 'Đã giao hàng', icon: Package, color: 'green', countKey: 'daGiaoHang' },
    { value: 'Hoàn thành', label: 'Hoàn thành', icon: CheckCircle, color: 'green', countKey: 'hoanThanh' },
    { value: 'Đã hủy', label: 'Đã hủy', icon: XCircle, color: 'red', countKey: 'daHuy' },
    { value: 'Giao hàng thất bại', label: 'Giao hàng thất bại', icon: AlertCircle, color: 'red', countKey: 'giaoHangThatBai' },
    { value: 'Đang hoàn tiền', label: 'Đang hoàn tiền', icon: RefreshCw, color: 'orange', countKey: 'dangHoanTien' },
    { value: 'Đã hoàn tiền', label: 'Đã hoàn tiền', icon: CheckCircle, color: 'green', countKey: 'daHoanTien' }
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

      // ✅ SỬA: Ưu tiên tham số được truyền vào, nếu không có thì dùng state
      // Điều này cho phép gọi với giá trị cụ thể (như khi click status button)
      const currentStatus = status !== '' ? status : selectedStatus;
      const currentSearch = search !== '' ? search : searchTerm;

      const params = {
        page: page,
        limit: pagination.ordersPerPage
      };

      if (currentStatus) {
        params.trangThai = currentStatus;
      }

      if (currentSearch.trim()) {
        if (isStaffView) {
          params.keyword = currentSearch.trim(); // Staff dùng keyword
        } else {
          params.search = currentSearch.trim(); // Admin dùng search
        }
      }

      // ✅ THÊM: Các filter mới
      if (filterDateFrom) {
        params.tuNgay = filterDateFrom;
      }
      if (filterDateTo) {
        params.denNgay = filterDateTo;
      }
      if (filterPaymentMethod) {
        params.phuongThucThanhToan = filterPaymentMethod;
      }
      if (filterCustomer) {
        params.khachHangId = filterCustomer; // ✅ Dùng ID thay vì tên
      }

      // ✅ Debug: Log params trước khi gọi API
      console.log('🔍 [fetchOrders] Params being sent:', JSON.stringify(params, null, 2));
      console.log('🔍 [fetchOrders] Current state:', {
        selectedStatus,
        searchTerm,
        filterDateFrom,
        filterDateTo,
        filterPaymentMethod,
        filterCustomer
      });

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
            audio.play().catch(() => {});
          }
        }

        // ✅ SỬA: Chỉ merge khi đang refresh cùng filter (isRefresh = true), còn lại thay thế hoàn toàn
        if (isRefresh && !skipStateUpdate) {
          // ✅ Auto-refresh: Merge để giữ lại orders đã cập nhật local
          setOrders(prevOrders => {
            const statusOrder = ['Chờ xử lý', 'Đã xác nhận', 'Đang đóng gói', 'Sẵn sàng giao hàng', 'Đang giao hàng', 'Đã giao hàng', 'Hoàn thành'];
            const getStatusIndex = (status) => statusOrder.indexOf(status) !== -1 ? statusOrder.indexOf(status) : -1;
            
            const updatedOrders = prevOrders.map(prevOrder => {
              const newOrder = newOrders.find(o => o.id === prevOrder.id);
              if (newOrder) {
                // ✅ Nếu order đã được cập nhật local, LUÔN giữ nguyên state local
                if (localUpdatedOrders.has(prevOrder.id)) {
                  console.log(`✅ [MERGE] Giữ nguyên state local cho order ${prevOrder.id}: ${prevOrder.trangThai} (đã cập nhật local)`);
                  return prevOrder;
                }
                
                // ✅ So sánh trạng thái: nếu state local mới hơn, giữ nguyên
                const prevStatusIndex = getStatusIndex(prevOrder.trangThai);
                const newStatusIndex = getStatusIndex(newOrder.trangThai);
                
                if (prevStatusIndex > newStatusIndex) {
                  // ✅ State local mới hơn, giữ nguyên
                  console.log(`✅ [MERGE] Giữ nguyên state local cho order ${prevOrder.id}: ${prevOrder.trangThai} (mới hơn ${newOrder.trangThai})`);
                  return prevOrder;
                } else {
                  // ✅ Server có dữ liệu mới hơn hoặc bằng, dùng dữ liệu từ server
                  return newOrder;
                }
              }
              // ✅ Không tìm thấy trong server response, giữ nguyên order cũ
              return prevOrder;
            });
            // ✅ Thêm các order mới nếu có
            newOrders.forEach(newOrder => {
              if (!updatedOrders.find(o => o.id === newOrder.id)) {
                updatedOrders.push(newOrder);
              }
            });
            return updatedOrders;
          });
        } else {
          // ✅ Filter thay đổi hoặc load mới: Thay thế hoàn toàn danh sách orders
          console.log('🔄 [fetchOrders] Replacing orders completely (filter changed or initial load)');
          setOrders(newOrders);
        }
        
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
  }, [
    pagination.ordersPerPage, 
    previousOrderCount, 
    logout, 
    navigate,
    selectedStatus,
    searchTerm,
    filterDateFrom,
    filterDateTo,
    filterPaymentMethod,
    filterCustomer,
    isStaffView, 
    isStaffView,
    filterDateFrom,
    filterDateTo,
    filterPaymentMethod,
    filterCustomer,
    selectedStatus,
    searchTerm
  ]);

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

  // ✅ Khởi tạo payment methods (hardcode vì không có API riêng)
  useEffect(() => {
    setPaymentMethods([
      { id: 1, ten: 'Tiền mặt (COD)' },
      { id: 2, ten: 'Chuyển khoản' },
      { id: 3, ten: 'Ví điện tử' }
    ]);
  }, []);

  // ✅ Fetch danh sách khách hàng từ đơn hàng (bao gồm cả khách vãng lai có số điện thoại)
  const fetchCustomers = useCallback(async () => {
    try {
      setCustomersLoading(true);
      const response = await adminService.getCustomersFromOrders();
      
      if (response.success && response.data) {
        // Dữ liệu đã được format sẵn từ backend
        setCustomers(response.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      showToast('Không thể tải danh sách khách hàng', 'error');
    } finally {
      setCustomersLoading(false);
    }
  }, [adminService]);

  useEffect(() => {
    if (!isStaffView) {
      fetchCustomers();
    }
  }, [isStaffView, fetchCustomers]);

  useEffect(() => {
    fetchOrders(1, selectedStatus, searchTerm);
    fetchDashboardStats();
    fetchOrderCounts();
  }, []);

  // ✅ Consolidate: Một useEffect duy nhất để quản lý tất cả filters (tránh duplicate calls)
  const isFirstRender = React.useRef(true);
  const searchTimeoutRef = React.useRef(null);
  
  useEffect(() => {
    // Bỏ qua lần đầu tiên (khi component mount - đã có useEffect riêng)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Clear timeout cũ nếu có
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce cho search, immediate cho các filter khác
    const delay = searchTerm ? 500 : 0; // Chỉ debounce search, các filter khác gọi ngay

    searchTimeoutRef.current = setTimeout(() => {
      console.log('🔍 [useEffect] Filters changed, fetching orders:', {
        selectedStatus,
        searchTerm,
        filterCustomer,
        filterDateFrom,
        filterDateTo,
        filterPaymentMethod
      });
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      fetchOrders(1, selectedStatus, searchTerm, false, false);
    }, delay);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [selectedStatus, searchTerm, filterCustomer, filterDateFrom, filterDateTo, filterPaymentMethod]); // ✅ Loại bỏ fetchOrders khỏi dependency

  useEffect(() => {
    // ✅ SỬA: Không auto-refresh khi đang cập nhật order
    if (!autoRefresh || isUpdatingOrder) return;

    const interval = setInterval(() => {
      console.log('Auto-refreshing orders...');
      fetchOrders(pagination.currentPage, selectedStatus, searchTerm, true, true);
      fetchOrderCounts(); // ⭐ Also refresh badge counts
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, isUpdatingOrder, pagination.currentPage, selectedStatus, searchTerm, fetchOrderCounts]); // ✅ Loại bỏ fetchOrders khỏi dependency để tránh recreate

  const handleStatusChange = (status) => {
    console.log('🔍 [handleStatusChange] Changing status to:', status);
    setSelectedStatus(status);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    // ✅ Gọi fetchOrders với status mới (không phải refresh, nên sẽ thay thế hoàn toàn)
    fetchOrders(1, status, searchTerm, false, false);
  };

  // ✅ Hàm xóa tất cả filters
  const handleClearFilters = () => {
    setSelectedStatus('');
    setSearchTerm('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterPaymentMethod('');
    setFilterCustomer('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    // useEffect sẽ tự động trigger fetchOrders khi filters thay đổi
  };

  const handlePageChange = (page) => {
    fetchOrders(page, selectedStatus, searchTerm);
  };

  const handleUpdateStatus = async (orderId, newStatus, additionalData = {}) => {
    try {
      console.log(`🔄 [handleUpdateStatus] Bắt đầu cập nhật order ${orderId} → ${newStatus}`, additionalData);
      
      // ✅ SỬA: Đánh dấu đang cập nhật để tắt auto-refresh
      setIsUpdatingOrder(true);
      
      // ✅ THÊM: Đánh dấu order đã được cập nhật local
      setLocalUpdatedOrders(prev => new Set([...prev, orderId]));
      
      // ✅ CẬP NHẬT NGAY: Cập nhật trạng thái và các field khác trong state ngay lập tức
      setOrders(prevOrders => {
        const updated = prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, trangThai: newStatus, ...additionalData }
            : order
        );
        console.log(`✅ [handleUpdateStatus] Đã cập nhật state local cho order ${orderId}:`, { trangThai: newStatus, ...additionalData });
        return updated;
      });
      
      showToast('Cập nhật trạng thái thành công', 'success');
      
      // ✅ Chỉ refresh badge counts, không refresh danh sách đơn hàng
      await fetchOrderCounts();
      
      // ✅ Xóa flag localUpdatedOrders sau 10 giây để cho phép server update
      setTimeout(() => {
        console.log(`✅ [handleUpdateStatus] Xóa flag localUpdatedOrders cho order ${orderId} sau 10 giây`);
        setLocalUpdatedOrders(prev => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });
        setIsUpdatingOrder(false);
      }, 10000); // ✅ Tăng lên 10 giây để đảm bảo server đã commit xong
    } catch (error) {
      console.error('❌ [handleUpdateStatus] Error updating order status:', error);
      showToast(error.message || 'Lỗi khi cập nhật trạng thái đơn hàng', 'error');
      setIsUpdatingOrder(false); // ✅ Đảm bảo reset flag nếu có lỗi
      // ✅ Xóa flag nếu có lỗi
      setLocalUpdatedOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
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
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="text-pink-500" size={24} />
            Quản lý đơn hàng
          </h2>
          
          {/* ✅ Nút xóa bộ lọc - Căn phải */}
          {(selectedStatus || searchTerm || filterDateFrom || filterDateTo || filterPaymentMethod || filterCustomer) && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-pink-500 hover:text-pink-600 font-medium text-sm
                       transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
              title="Xóa tất cả bộ lọc"
            >
              <X size={16} className="text-pink-500" />
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 rounded-xl p-3 shadow-sm border border-pink-100">
        {/* ✅ Filter bar - Tất cả filter trong 1 dòng */}
        <div className="flex flex-wrap gap-3 items-center mb-3">
          {/* Thanh tìm kiếm */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white border-2 border-pink-200 rounded-lg 
                       text-gray-700 font-medium text-sm placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400
                       hover:border-pink-300 transition-all duration-200 shadow-sm"
            />
          </div>

          {/* Filter theo ngày */}
          <div className="flex gap-2 items-center">
            <Calendar className="text-gray-400" size={16} />
            <input
              type="date"
              placeholder="Từ ngày"
              value={filterDateFrom}
              onChange={(e) => {
                setFilterDateFrom(e.target.value);
                // ✅ useEffect sẽ tự động trigger fetchOrders
              }}
              className="px-3 py-2 bg-white border-2 border-pink-200 rounded-lg 
                       text-gray-700 text-sm
                       focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400
                       hover:border-pink-300 transition-all duration-200 shadow-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              placeholder="Đến ngày"
              value={filterDateTo}
              onChange={(e) => {
                setFilterDateTo(e.target.value);
                // ✅ useEffect sẽ tự động trigger fetchOrders
              }}
              className="px-3 py-2 bg-white border-2 border-pink-200 rounded-lg 
                       text-gray-700 text-sm
                       focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400
                       hover:border-pink-300 transition-all duration-200 shadow-sm"
            />
          </div>

          {/* Filter theo phương thức thanh toán */}
          <div className="relative min-w-[180px]">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={filterPaymentMethod}
              onChange={(e) => {
                setFilterPaymentMethod(e.target.value);
                // ✅ useEffect sẽ tự động trigger fetchOrders
              }}
              className="w-full pl-10 pr-3 py-2 bg-white border-2 border-pink-200 rounded-lg 
                       text-gray-700 text-sm appearance-none
                       focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400
                       hover:border-pink-300 transition-all duration-200 shadow-sm cursor-pointer"
            >
              <option value="">Tất cả phương thức</option>
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.ten}
                </option>
              ))}
            </select>
          </div>

          {/* Filter theo khách hàng - Combobox */}
          <div className="relative min-w-[200px]">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={filterCustomer}
              onChange={(e) => {
                setFilterCustomer(e.target.value);
                // ✅ useEffect sẽ tự động trigger fetchOrders
              }}
              disabled={customersLoading}
              className="w-full pl-10 pr-3 py-2 bg-white border-2 border-pink-200 rounded-lg 
                       text-gray-700 text-sm appearance-none
                       focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400
                       hover:border-pink-300 transition-all duration-200 shadow-sm cursor-pointer
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Tất cả khách hàng</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.hoTen} {customer.dienThoai ? `(${customer.dienThoai})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ✅ Filter theo trạng thái */}
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
                    <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                      selectedStatus === status.value
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
      </div>

      <OrderTable
        orders={orders}
        isStaffView={isStaffView}
        onUpdateStatus={handleUpdateStatus}
        loading={loading}
      />

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
