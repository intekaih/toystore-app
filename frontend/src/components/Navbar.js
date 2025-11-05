import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { ShoppingCart, User, Home, Package, LogOut, Settings, Edit, Heart } from 'lucide-react';

/**
 * 🌸 Navbar - Thanh điều hướng với tone màu trắng hồng sữa
 */
const Navbar = () => {
  const { user, logout } = useAuth();
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

  return (
    <nav className="bg-white border-b-2 border-primary-100 shadow-soft sticky top-0 z-50">
      <div className="container-cute">
        <div className="flex items-center justify-between py-4">
          {/* Logo - Dễ thương */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-display font-bold text-gradient-primary hover:scale-105 transition-transform">
            <span className="text-3xl animate-bounce-soft">🧸</span>
            <span>ToyStore</span>
          </Link>

          {/* Navigation Links - Center */}
          <div className="hidden md:flex items-center gap-2">
            <Link 
              to="/" 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-cute text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all font-semibold relative ${
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-cute text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all font-semibold relative ${
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-cute text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all font-semibold relative ${
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
              to="/orders" 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-cute text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all font-semibold relative ${
                isActive('/orders') ? 'text-primary-600' : ''
              }`}
            >
              <Package size={18} />
              <span>Đơn hàng</span>
              {isActive('/orders') && (
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
                  className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-primary-50 to-rose-50 border-2 border-primary-200 rounded-cute hover:shadow-soft transition-all"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-rose-400 flex items-center justify-center text-white font-bold text-sm shadow-soft">
                    {user.hoTen?.charAt(0).toUpperCase() || user.tenDangNhap?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="font-semibold text-gray-700 hidden sm:block">
                    {user.hoTen || user.tenDangNhap}
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
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-200 text-primary-700 rounded-full text-xs font-semibold">
                              {user.role === 'admin' || user.vaiTro === 'admin' ? '👑 Admin' : '👤 User'}
                            </span>
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
                      
                      {(user.role === 'admin' || user.vaiTro === 'admin') && (
                        <>
                          <div className="my-2 border-t-2 border-primary-100"></div>
                          <Link 
                            to="/admin/dashboard" 
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-5 py-3 hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-600"
                          >
                            <Settings size={18} className="text-primary-500" />
                            <span className="font-medium">Quản trị hệ thống</span>
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