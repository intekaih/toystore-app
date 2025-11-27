import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RoleChecker } from '../constants/roles';
import { LogOut, Home, Settings, Gamepad2, Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';

/**
 * 🎮 AdminLayout - Layout cho trang quản trị với header navigation
 * Hỗ trợ cả Admin và Staff
 */
const AdminLayout = ({ children, isStaffView = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Kiểm tra role
  const userRole = RoleChecker.getUserRole(user);
  const isAdmin = RoleChecker.isAdmin(userRole);
  const isStaff = RoleChecker.isStaff(userRole);

  const handleLogout = () => {
    logout();
    navigate(isStaffView ? '/login' : '/admin/login');
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Menu items - Ẩn các menu không cần thiết cho Staff
  const allMenuItems = [
    {
      name: 'Dashboard',
      path: isStaffView ? '/staff/dashboard' : '/admin/dashboard',
      icon: <Home size={18} />,
      show: true // Cả Admin và Staff đều có
    },
    {
      name: 'Sản phẩm',
      path: isStaffView ? '/staff/products' : '/admin/products',
      icon: <Package size={18} />,
      show: true // Cả Admin và Staff đều có (nhưng Staff chỉ xem/cập nhật tồn kho)
    },
    {
      name: 'Đơn hàng',
      path: isStaffView ? '/staff/orders' : '/admin/orders',
      icon: <ShoppingCart size={18} />,
      show: true // Cả Admin và Staff đều có
    },
    {
      name: 'Người dùng',
      path: '/admin/users',
      icon: <Users size={18} />,
      show: !isStaffView // Chỉ Admin
    },
    {
      name: 'Thống kê',
      path: '/admin/statistics',
      icon: <TrendingUp size={18} />,
      show: !isStaffView // Chỉ Admin
    }
  ];

  // Lọc menu items theo quyền
  const adminMenuItems = allMenuItems.filter(item => item.show);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header với Navigation - FULL WIDTH - 1 DÒNG DUY NHẤT */}
      <nav className="bg-white border-b-2 border-primary-100 shadow-soft sticky top-0 z-50">
        <div className="w-full px-6">
          <div className="flex items-center justify-between gap-6 py-3">
            {/* Logo - Giống Store */}
            <div className="flex items-center gap-2 text-xl font-display font-bold text-gradient-primary whitespace-nowrap">
              <Gamepad2 size={24} className="animate-bounce-soft" />
              <span className="hidden md:inline">{isStaffView ? 'ToyStore Staff' : 'ToyStore Admin'}</span>
              <span className="md:hidden">{isStaffView ? 'Staff' : 'Admin'}</span>
              <span className="ml-1 px-2 py-0.5 bg-gradient-to-r from-primary-400 to-primary-500 text-white text-[10px] rounded-full">
                {isStaffView ? 'Nhân viên' : 'Hệ thống quản trị'}
              </span>
            </div>

            {/* Navigation Tabs - CENTER */}
            <div className="flex-1 flex items-center justify-center gap-1 overflow-x-auto">
              {adminMenuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-cute font-semibold transition-all whitespace-nowrap text-sm
                    ${isActive(item.path)
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-cute'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                    }
                  `}
                >
                  {item.icon}
                  <span className="hidden lg:inline">{item.name}</span>
                </button>
              ))}
            </div>

            {/* User Section - RIGHT */}
            <div className="flex items-center gap-3">
              {/* Back to Store Button */}
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3 py-2 rounded-cute text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all font-semibold border-2 border-primary-200 whitespace-nowrap"
              >
                <Home size={16} />
                <span className="hidden xl:inline">Quay lại Store</span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary-50 to-rose-50 border-2 border-primary-200 rounded-cute hover:shadow-soft transition-all"
                >
                  <span className="font-semibold text-gray-700 hidden lg:block">
                    {user?.HoTen || user?.hoTen || 'Khả Ái'}
                  </span>
                  <svg className={`w-4 h-4 text-primary-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-bubble shadow-bubble border-2 border-primary-100 overflow-hidden animate-scale-in">
                    {/* Menu Header */}
                    <div className="bg-gradient-to-r from-primary-50 to-rose-50 p-5 border-b-2 border-primary-100">
                      <div className="flex items-center gap-3">
                        {/* ✅ LOẠI BỎ: Avatar element */}
                        <div className="flex-1">
                          <div className="font-bold text-gray-800">{user?.HoTen || user?.hoTen || 'Khả Ái'}</div>
                          <div className="text-sm text-gray-500">{user?.Email || user?.email || 'admin@toystore.com'}</div>
                          <div className="mt-1">
                            {(() => {
                              const roleDisplay = RoleChecker.getDisplayInfo(userRole);
                              return (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  roleDisplay.color === 'purple' 
                                    ? 'bg-pink-100 text-pink-700 border border-pink-200'
                                    : roleDisplay.color === 'blue'
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-primary-200 text-primary-700'
                                }`}>
                                  <span>{roleDisplay.icon}</span>
                                  <span>{roleDisplay.label}</span>
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate(isStaffView ? '/staff/dashboard' : '/admin/dashboard');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-600"
                      >
                        <Settings size={18} className="text-primary-500" />
                        <span className="font-medium">Dashboard</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          navigate('/');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-600"
                      >
                        <Home size={18} className="text-primary-500" />
                        <span className="font-medium">Quay lại Store</span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t-2 border-primary-100">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition-colors text-red-600 hover:text-red-700 font-medium"
                      >
                        <LogOut size={18} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay for dropdown */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}

      {/* Main Content - Container với chiều rộng lớn hơn cho admin */}
      <main className="w-full max-w-[95%] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-[calc(100vh-200px)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-primary-100 py-6 mt-12">
        <div className="container-cute">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-xl">🎯</span>
              <span className="font-medium">Hệ thống quản trị ToyStore</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <span>Phiên bản 2.0</span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🚀</span>
                <span>Giao diện mới</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;