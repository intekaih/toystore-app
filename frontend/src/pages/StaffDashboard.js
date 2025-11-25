import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import staffService from '../services/staffService';
import { RoleChecker } from '../constants/roles';
import AdminLayout from '../layouts/AdminLayout';
import { Card } from '../components/ui';
import { 
  ClipboardList, 
  Truck, 
  Package, 
  DollarSign,
  ShoppingCart,
  AlertCircle,
  TrendingUp,
  Zap,
  Clock,
  CheckCircle2
} from 'lucide-react';

/**
 * =======================================
 * STAFF DASHBOARD - Redesigned
 * =======================================
 * Trang dashboard dành cho Nhân viên
 * Thiết kế đồng bộ với phong cách dự án, tập trung vào UX
 */
const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy thống kê dashboard
  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 [StaffDashboard] Đang lấy thống kê dashboard...');
      const response = await staffService.getDashboardStats();
      console.log('📊 [StaffDashboard] Response:', response);
      
      if (response && response.success) {
        console.log('✅ [StaffDashboard] Thống kê đã tải thành công:', response.data);
        setStats(response.data);
      } else {
        throw new Error(response?.message || 'Không thể tải thống kê');
      }
    } catch (err) {
      console.error('❌ [StaffDashboard] Lỗi tải dashboard:', err);
      console.error('❌ [StaffDashboard] Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Xử lý các loại lỗi khác nhau
      let errorMessage = 'Không thể tải thống kê';
      
      if (err.response) {
        errorMessage = err.response.data?.message || `Lỗi server (${err.response.status})`;
      } else if (err.request) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
      } else {
        errorMessage = err.message || 'Lỗi máy chủ, vui lòng thử lại sau';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format tiền tệ
  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M ₫`;
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Quick actions cho nhân viên
  const quickActions = [
    {
      title: 'Đơn hàng chờ xử lý',
      description: 'Xem và xử lý đơn hàng mới',
      icon: ClipboardList,
      route: '/staff/orders?status=Chờ xử lý',
      color: 'from-blue-50 to-blue-100 border-blue-200',
      iconBg: 'bg-blue-500',
      count: stats?.pendingOrders || 0,
      priority: stats?.pendingOrders > 0
    },
    {
      title: 'Đơn đang giao hàng',
      description: 'Theo dõi đơn hàng đang vận chuyển',
      icon: Truck,
      route: '/staff/orders?status=Đang giao hàng',
      color: 'from-orange-50 to-orange-100 border-orange-200',
      iconBg: 'bg-orange-500',
      count: stats?.shippingOrders || 0
    },
    {
      title: 'Quản lý sản phẩm',
      description: 'Xem danh sách và tồn kho sản phẩm',
      icon: Package,
      route: '/staff/products',
      color: 'from-purple-50 to-purple-100 border-purple-200',
      iconBg: 'bg-purple-500',
      count: stats?.lowStockProducts || 0,
      badge: stats?.lowStockProducts > 0 ? `${stats.lowStockProducts} sắp hết` : null
    },
    {
      title: 'Tất cả đơn hàng',
      description: 'Xem toàn bộ đơn hàng',
      icon: ShoppingCart,
      route: '/staff/orders',
      color: 'from-green-50 to-green-100 border-green-200',
      iconBg: 'bg-green-500'
    }
  ];

  // Render loading state
  if (loading) {
    return (
      <AdminLayout isStaffView={true}>
        <Card className="text-center p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="text-gray-600">Đang tải thống kê...</p>
          </div>
        </Card>
      </AdminLayout>
    );
  }

  // Render error state
  if (error) {
    return (
      <AdminLayout isStaffView={true}>
        <Card className="text-center p-12">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="text-red-500" size={48} />
            <h3 className="text-xl font-bold text-gray-800">⚠️ Có lỗi xảy ra</h3>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={loadDashboardStats}
              className="btn-cute btn-primary px-6 py-3"
            >
              Thử lại
            </button>
          </div>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout isStaffView={true}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-cute p-6 border-2 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                👋 Xin chào, <span className="text-primary-600">{user?.HoTen || user?.hoTen || 'Nhân viên'}</span>!
              </h1>
              <p className="text-gray-600">
                Hôm nay là <strong>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Vai trò</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-primary-200 text-primary-700">
                {RoleChecker.getDisplayInfo(user?.VaiTro || user?.vaiTro).label}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats - Compact Cards */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp className="text-primary-500" size={24} />
            Thống kê nhanh
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Đơn hàng chờ xử lý */}
            <Card 
              className={`bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 ${stats?.pendingOrders > 0 ? 'ring-2 ring-blue-300' : ''}`}
              onClick={() => navigate('/staff/orders?status=Chờ xử lý')}
            >
              <div className="flex items-center gap-3 p-3">
                <div className="p-2 bg-blue-500 rounded-cute text-white shadow-lg">
                  <ClipboardList size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-blue-600 font-semibold">Chờ xử lý</p>
                  <p className="text-2xl font-bold text-blue-700">{stats?.pendingOrders || 0}</p>
                </div>
                {stats?.pendingOrders > 0 && (
                  <div className="animate-pulse">
                    <AlertCircle className="text-blue-600" size={20} />
                  </div>
                )}
              </div>
            </Card>

            {/* Đơn đang giao */}
            <Card 
              className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200"
              onClick={() => navigate('/staff/orders?status=Đang giao hàng')}
            >
              <div className="flex items-center gap-3 p-3">
                <div className="p-2 bg-orange-500 rounded-cute text-white shadow-lg">
                  <Truck size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-orange-600 font-semibold">Đang giao</p>
                  <p className="text-2xl font-bold text-orange-700">{stats?.shippingOrders || 0}</p>
                </div>
              </div>
            </Card>

            {/* Sản phẩm sắp hết */}
            <Card 
              className={`bg-gradient-to-r from-red-50 to-red-100 border-red-200 ${stats?.lowStockProducts > 0 ? 'ring-2 ring-red-300' : ''}`}
              onClick={() => navigate('/staff/products')}
            >
              <div className="flex items-center gap-3 p-3">
                <div className="p-2 bg-red-500 rounded-cute text-white shadow-lg">
                  <Package size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-red-600 font-semibold">Sắp hết hàng</p>
                  <p className="text-2xl font-bold text-red-700">{stats?.lowStockProducts || 0}</p>
                </div>
                {stats?.lowStockProducts > 0 && (
                  <div className="animate-pulse">
                    <AlertCircle className="text-red-600" size={20} />
                  </div>
                )}
              </div>
            </Card>

            {/* Doanh thu hôm nay */}
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <div className="flex items-center gap-3 p-3">
                <div className="p-2 bg-green-500 rounded-cute text-white shadow-lg">
                  <DollarSign size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-green-600 font-semibold">Doanh thu hôm nay</p>
                  <p className="text-lg font-bold text-green-700">{formatCurrency(stats?.todayRevenue || 0)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Actions - Workflow Focused */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Zap className="text-yellow-500" size={24} />
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Card
                  key={index}
                  className={`bg-gradient-to-r ${action.color} cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg ${action.priority ? 'ring-2 ring-primary-300' : ''}`}
                  onClick={() => navigate(action.route)}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 ${action.iconBg} rounded-cute text-white shadow-lg`}>
                        <IconComponent size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-800 mb-0.5">{action.title}</h3>
                        <p className="text-gray-600 text-xs">{action.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-300">
                      {action.count !== undefined ? (
                        <span className="text-xs font-semibold text-gray-500">
                          {action.count > 0 ? (
                            <span className="text-primary-600 font-bold">{action.count} {action.badge || 'mục'}</span>
                          ) : (
                            <span className="text-gray-400">Không có</span>
                          )}
                        </span>
                      ) : action.badge ? (
                        <span className="text-xs font-semibold text-red-600">{action.badge}</span>
                      ) : (
                        <span className="text-xs font-semibold text-gray-500">Xem tất cả</span>
                      )}
                      <span className="text-primary-600 text-sm font-bold">→</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Workflow Guide - Hướng dẫn quy trình */}
        <Card className="bg-gradient-to-r from-primary-50 to-rose-50 border-primary-200">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-primary-600" size={20} />
              Quy trình xử lý đơn hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">Chờ xử lý</h4>
                  <p className="text-xs text-gray-600">Kiểm tra và xác nhận đơn hàng mới</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">Đang đóng gói</h4>
                  <p className="text-xs text-gray-600">Chuẩn bị và đóng gói sản phẩm</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">Đang giao hàng</h4>
                  <p className="text-xs text-gray-600">Giao cho đơn vị vận chuyển</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">Hoàn thành</h4>
                  <p className="text-xs text-gray-600">Đơn hàng đã giao thành công</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Info Box - Compact */}
        <Card className="bg-gray-50 border-gray-200">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="text-gray-500 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 text-sm mb-1">Thông tin tài khoản</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Email: <strong className="text-gray-800">{user?.Email || user?.email}</strong></p>
                  <p>Nếu gặp vấn đề, vui lòng liên hệ Admin để được hỗ trợ</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default StaffDashboard;
