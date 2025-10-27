import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card } from '../components/ui';

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

  const adminFeatures = [
    {
      title: 'Quản lý danh mục',
      description: 'Thêm, sửa, xóa danh mục sản phẩm',
      icon: '📂',
      route: '/admin/categories',
      color: 'from-orange-50 to-orange-100 border-orange-200',
      iconBg: 'bg-orange-500'
    },
    {
      title: 'Quản lý sản phẩm',
      description: 'Thêm, sửa, xóa sản phẩm',
      icon: '📊',
      route: '/admin/products',
      color: 'from-blue-50 to-blue-100 border-blue-200',
      iconBg: 'bg-blue-500'
    },
    {
      title: 'Quản lý đơn hàng',
      description: 'Xem và cập nhật đơn hàng',
      icon: '🛒',
      route: '/admin/orders',
      color: 'from-green-50 to-green-100 border-green-200',
      iconBg: 'bg-green-500'
    },
    {
      title: 'Quản lý người dùng',
      description: 'Quản lý tài khoản khách hàng',
      icon: '👥',
      route: '/admin/users',
      color: 'from-purple-50 to-purple-100 border-purple-200',
      iconBg: 'bg-purple-500'
    },
    {
      title: 'Thống kê báo cáo',
      description: 'Xem báo cáo doanh thu',
      icon: '📈',
      route: '/admin/statistics',
      color: 'from-pink-50 to-pink-100 border-pink-200',
      iconBg: 'bg-pink-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
      {/* Header */}
      <Card className="mb-6 border-primary-200" padding="md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleBackToStore}
              icon="🏪"
            >
              Quay lại Store
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary-400 to-primary-500 rounded-cute text-white">
                🎮
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Admin Dashboard - ToyStore
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

      {/* Admin Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {adminFeatures.map((feature, index) => (
          <Card
            key={index}
            padding="md"
            className={`bg-gradient-to-r ${feature.color} cursor-pointer transform transition-all duration-300 hover:scale-105`}
            onClick={() => navigate(feature.route)}
          >
            <div className="flex items-center gap-4">
              <div className={`p-4 ${feature.iconBg} rounded-cute text-white text-3xl shadow-lg`}>
                {feature.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Info Box */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200" padding="md">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500 rounded-cute text-white text-xl">
            ℹ️
          </div>
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">Thông tin hướng dẫn</h3>
            <p className="text-blue-700">
              Click vào các thẻ chức năng ở trên để truy cập các trang quản lý tương ứng. 
              Mỗi trang đều đã được tối ưu với giao diện hiện đại và dễ sử dụng.
            </p>
          </div>
        </div>
      </Card>

      {/* System Info */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-cute shadow-soft border border-primary-100">
          <span className="text-xl">🎯</span>
          <span className="font-medium text-gray-600">Hệ thống quản trị ToyStore</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-6 text-center">
        <div className="inline-flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-cute border border-primary-200">
          <div className="flex items-center gap-2 text-primary-600">
            <span className="text-xl">⚡</span>
            <span className="font-medium">Phiên bản 2.0</span>
          </div>
          <div className="w-px h-6 bg-primary-300"></div>
          <div className="flex items-center gap-2 text-primary-600">
            <span className="text-xl">🚀</span>
            <span className="font-medium">Giao diện mới</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
