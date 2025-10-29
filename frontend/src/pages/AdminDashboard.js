import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui';
import AdminLayout from '../layouts/AdminLayout';
import authService from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // State cho dữ liệu thống kê
  const [stats, setStats] = useState({
    tongSanPham: 0,
    donHangMoi: 0,
    nguoiDung: 0,
    doanhThu: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch thống kê dashboard
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        
        const token = authService.getToken();
        if (!token) {
          logout();
          navigate('/admin/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/admin/statistics/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        if (error.response?.status === 401) {
          logout();
          navigate('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [logout, navigate]);

  // Format số tiền
  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}M`;
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const adminFeatures = [
    {
      title: 'Quản lý danh mục',
      description: 'Thêm, sửa, xóa danh mục sản phẩm',
      icon: '📂',
      route: '/admin/categories',
      color: 'from-orange-50 to-orange-100 border-orange-200',
      iconBg: 'bg-orange-500',
      stats: 'Tổng: 12 danh mục'
    },
    {
      title: 'Quản lý sản phẩm',
      description: 'Thêm, sửa, xóa sản phẩm',
      icon: '📦',
      route: '/admin/products',
      color: 'from-blue-50 to-blue-100 border-blue-200',
      iconBg: 'bg-blue-500',
      stats: `Tổng: ${stats.tongSanPham} sản phẩm`
    },
    {
      title: 'Quản lý đơn hàng',
      description: 'Xem và cập nhật đơn hàng',
      icon: '🛒',
      route: '/admin/orders',
      color: 'from-green-50 to-green-100 border-green-200',
      iconBg: 'bg-green-500',
      stats: `Đang xử lý: ${stats.donHangMoi} đơn`
    },
    {
      title: 'Quản lý người dùng',
      description: 'Quản lý tài khoản khách hàng',
      icon: '👥',
      route: '/admin/users',
      color: 'from-purple-50 to-purple-100 border-purple-200',
      iconBg: 'bg-purple-500',
      stats: `Tổng: ${stats.nguoiDung} users`
    },
    {
      title: 'Thống kê báo cáo',
      description: 'Xem báo cáo doanh thu',
      icon: '📈',
      route: '/admin/statistics',
      color: 'from-pink-50 to-pink-100 border-pink-200',
      iconBg: 'bg-pink-500',
      stats: 'Doanh thu tháng'
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <Card className="text-center p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Quick Stats - Siêu Compact */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-2 p-3">
            <div className="text-2xl">📦</div>
            <div>
              <p className="text-xs text-blue-600">Tổng sản phẩm</p>
              <p className="text-xl font-bold text-blue-700">{stats.tongSanPham}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-2 p-3">
            <div className="text-2xl">🛒</div>
            <div>
              <p className="text-xs text-green-600">Đơn hàng mới</p>
              <p className="text-xl font-bold text-green-700">{stats.donHangMoi}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-2 p-3">
            <div className="text-2xl">👥</div>
            <div>
              <p className="text-xs text-purple-600">Người dùng</p>
              <p className="text-xl font-bold text-purple-700">{stats.nguoiDung}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center gap-2 p-3">
            <div className="text-2xl">💰</div>
            <div>
              <p className="text-xs text-orange-600">Doanh thu</p>
              <p className="text-xl font-bold text-orange-700">{formatCurrency(stats.doanhThu)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Admin Features - Ưu tiên hiển thị */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span>⚡</span>
          Chức năng quản lý
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {adminFeatures.map((feature, index) => (
            <Card
              key={index}
              className={`bg-gradient-to-r ${feature.color} cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}
              onClick={() => navigate(feature.route)}
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 ${feature.iconBg} rounded-cute text-white text-xl shadow-lg`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-800 mb-0.5">{feature.title}</h3>
                    <p className="text-gray-600 text-xs">{feature.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-300">
                  <span className="text-xs font-semibold text-gray-500">{feature.stats}</span>
                  <span className="text-primary-600 text-sm">→</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
