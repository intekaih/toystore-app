import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { ShoppingCart, User, Home, Package, LogOut, Settings, Edit, Heart, Store } from 'lucide-react';
import { RoleChecker } from '../constants/roles';

/**
 * 🌸 Navbar - Thanh điều hướng với tone màu trắng hồng sữa
 */
const Navbar = () => {
  const { user, logout, isAdmin, isStaff, isAdminOrStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Hàm kiểm tra xem link có đang active không
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // ✅ Lấy role display info
  const getRoleDisplay = () => {
    if (!user) return null;
    const role = user.vaiTro || user.VaiTro || user.role;
    return RoleChecker.getDisplayInfo(role);
  };

  const roleDisplay = getRoleDisplay();

  return (
    <nav className="bg-white border-b-2 border-primary-100 shadow-soft sticky top-0 z-50">
      <div className="container-cute">
        <div className="flex items-center justify-between py-2">
          {/* Logo - Dễ thương */}
          <Link to="/" className="flex items-center gap-2 text-xl font-display font-bold text-gradient-primary hover:scale-105 transition-transform">
            <Store size={28} className="text-primary-500" />
            <span>ToyStore</span>
          </Link>

          {/* Navigation Links - Center */}
          <div className="hidden md:flex items-center gap-2">
            <Link 
              to="/" 
              className={`flex items-center gap-2 px-3 py-2 rounded-cute text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all font-semibold relative ${
                isActive('/') ? 'text-primary-600' : ''
              }`}
            >
              <Home size={18} />
              <span>Trang chủ</span>
              {isActive('/') && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"></span>
              )}
            </Link>
            <Link 
              to="/products" 
              className={`flex items-center gap-2 px-3 py-2 rounded-cute text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all font-semibold relative ${
                isActive('/products') ? 'text-primary-600' : ''
              }`}
            >
              <Heart size={18} />
              <span>Sản phẩm</span>
              {isActive('/products') && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"></span>
              )}
            </Link>
            <Link 
              to="/cart" 
              className={`flex items-center gap-2 px-3 py-2 rounded-cute text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all font-semibold relative ${
                isActive('/cart') ? 'text-primary-600' : ''
              }`}
            >
              <ShoppingCart size={18} />
              <span>Giỏ hàng</span>
              {isActive('/cart') && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"></span>
              )}
            </Link>
            <Link 
              to={user ? "/orders" : "/order-lookup"}
              className={`flex items-center gap-2 px-3 py-2 rounded-cute text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all font-semibold relative ${
                isActive('/orders') || isActive('/order-lookup') ? 'text-primary-600' : ''
              }`}
            >
              <Package size={18} />
              <span>Đơn hàng</span>
              {(isActive('/orders') || isActive('/order-lookup')) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"></span>
              )}
            </Link>
          </div>

          {/* User Section */}
          <div className="relative">
            {user ? (
              <div>
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-rose-50 border-2 border-primary-200 rounded-cute hover:shadow-soft transition-all"
                >
                  <span className="text-xl">👋</span>
                  <span className="font-semibold text-sm">
                    <span className="text-gray-700">Xin chào </span>
                    <span className="text-primary-600">{user.hoTen || user.tenDangNhap || 'Quản Trị Viên'}!</span>
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
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-rose-400 flex items-center justify-center text-white font-bold text-lg shadow-soft">
                          {user.hoTen?.charAt(0).toUpperCase() || user.tenDangNhap?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-800">{user.hoTen || user.tenDangNhap}</div>
                          <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                          <div className="mt-1">
                            {/* ✅ Hiển thị role badge với màu nền đúng - Admin màu hồng */}
                            {roleDisplay && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                roleDisplay.color === 'purple' 
                                  ? 'bg-pink-100 text-pink-700 border border-pink-200' 
                                  : roleDisplay.color === 'blue'
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                  : roleDisplay.color === 'green'
                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                  : 'bg-pink-100 text-pink-700 border border-pink-200'
                              }`}>
                                <span>{roleDisplay.icon}</span>
                                <span>{roleDisplay.label}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link 
                        to="/cart" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-600"
                      >
                        <ShoppingCart size={18} className="text-primary-500" />
                        <span className="font-medium">Giỏ hàng</span>
                      </Link>
                      
                      <Link 
                        to="/orders" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-600"
                      >
                        <Package size={18} className="text-primary-500" />
                        <span className="font-medium">Đơn hàng của tôi</span>
                      </Link>
                      
                      <Link 
                        to="/profile" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-600"
                      >
                        <User size={18} className="text-primary-500" />
                        <span className="font-medium">Thông tin cá nhân</span>
                      </Link>
                      
                      <Link 
                        to="/profile/edit" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-600"
                      >
                        <Edit size={18} className="text-primary-500" />
                        <span className="font-medium">Chỉnh sửa profile</span>
                      </Link>
                      
                      {/* ✅ Menu cho Admin và Nhân viên */}
                      {isAdminOrStaff() && (
                        <>
                          <div className="my-2 border-t-2 border-primary-100"></div>
                          <Link 
                            to={isAdmin() ? "/admin/dashboard" : "/staff/dashboard"} 
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-5 py-3 hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-600"
                          >
                            <Settings size={18} className="text-primary-500" />
                            <span className="font-medium">
                              {isAdmin() ? 'Quản trị hệ thống' : 'Bảng điều khiển Nhân viên'}
                            </span>
                          </Link>
                        </>
                      )}
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
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="px-5 py-2.5 rounded-cute font-semibold text-primary-600 hover:bg-primary-50 transition-all border-2 border-primary-200 hover:border-primary-300"
                >
                  Đăng nhập
                </Link>
                <Link 
                  to="/register" 
                  className="px-5 py-2.5 rounded-cute font-semibold text-white bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 shadow-soft hover:shadow-cute transition-all"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;