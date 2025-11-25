import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services'; // ✅ Sử dụng authService
import { Lock, User, ArrowRight, Home, Shield, BarChart3, Users, Package, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui';
import Toast from '../components/Toast';
import config from '../config';
import { RoleChecker } from '../constants/roles';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    tenDangNhap: '',
    matKhau: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      const role = user.vaiTro || user.VaiTro || user.role;
      if (RoleChecker.isAdminOrStaff(role)) {
        navigate('/admin/dashboard');
      }
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tenDangNhap.trim()) {
      newErrors.tenDangNhap = 'Vui lòng nhập tên đăng nhập';
    } else if (formData.tenDangNhap.length < 3) {
      newErrors.tenDangNhap = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    if (!formData.matKhau) {
      newErrors.matKhau = 'Vui lòng nhập mật khẩu';
    } else if (formData.matKhau.length < 6) {
      newErrors.matKhau = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Vui lòng kiểm tra lại thông tin đăng nhập', 'error');
      return;
    }

    setLoading(true);

    try {
      // ✅ Sử dụng authService thay vì fetch trực tiếp
      const response = await authService.adminLogin({
        username: formData.tenDangNhap.trim(),
        password: formData.matKhau
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Đăng nhập thất bại');
      }

      const adminUser = response.data.admin || response.data.user;
      
      if (!RoleChecker.isAdmin(adminUser.role || adminUser.vaiTro)) {
        showToast('❌ Bạn không có quyền truy cập trang quản trị', 'error', 4000);
        setLoading(false);
        return;
      }

      // authService đã tự động lưu token và user vào localStorage
      // Cập nhật context
      const userForContext = {
        id: adminUser.id || adminUser.ID,
        tenDangNhap: adminUser.username || adminUser.tenDangNhap,
        hoTen: adminUser.hoTen || adminUser.HoTen || 'Admin',
        email: adminUser.email || adminUser.Email || '',
        role: 'admin',
        vaiTro: 'admin'
      };
      
      setUser(userForContext);

      showToast('✅ Đăng nhập thành công! Chào mừng Admin.', 'success', 2000);

      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true });
      }, 1000);

    } catch (error) {
      console.error('❌ Login error:', error);
      
      if (error.message.includes('không có quyền')) {
        showToast(error.message, 'error', 4000);
      } else {
        showToast('❌ ' + (error.message || 'Đăng nhập thất bại. Vui lòng thử lại.'), 'error');
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-10 animate-float">👑</div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>🔐</div>
      <div className="absolute top-1/3 right-20 text-5xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>⚙️</div>

      <div className="w-full max-w-5xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-bubble shadow-2xl overflow-hidden">
          {/* Left side - Branding */}
          <div className="bg-gradient-to-br from-primary-600 via-rose-500 to-primary-700 p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <div className="mb-8">
                <div className="text-6xl mb-4 animate-bounce-soft">🎮</div>
                <h1 className="text-4xl font-display font-bold mb-2">ToyStore Admin</h1>
                <p className="text-primary-100 text-lg">
                  Hệ thống quản trị cửa hàng đồ chơi
                </p>
              </div>

              <div className="space-y-4 mt-12">
                <div className="flex items-center gap-4 p-4 bg-white bg-opacity-10 rounded-cute backdrop-blur-sm">
                  <BarChart3 size={24} />
                  <span className="font-medium">Quản lý sản phẩm</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white bg-opacity-10 rounded-cute backdrop-blur-sm">
                  <ShoppingCart size={24} />
                  <span className="font-medium">Quản lý đơn hàng</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white bg-opacity-10 rounded-cute backdrop-blur-sm">
                  <Users size={24} />
                  <span className="font-medium">Quản lý người dùng</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white bg-opacity-10 rounded-cute backdrop-blur-sm">
                  <Package size={24} />
                  <span className="font-medium">Thống kê báo cáo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="p-12 bg-gradient-to-br from-primary-50 via-rose-50 to-cream-100">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4 animate-bounce-soft">🔐</div>
              <h2 className="text-3xl font-display font-bold text-gradient-primary mb-2">
                Đăng nhập Admin
              </h2>
              <p className="text-gray-600">
                Vui lòng đăng nhập để truy cập trang quản trị
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên đăng nhập <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="tenDangNhap"
                    value={formData.tenDangNhap}
                    onChange={handleInputChange}
                    placeholder="Nhập tên đăng nhập"
                    disabled={loading}
                    className={`input-cute pl-12 ${errors.tenDangNhap ? 'border-red-400' : ''}`}
                  />
                </div>
                {errors.tenDangNhap && (
                  <p className="mt-1 text-xs text-red-500">⚠️ {errors.tenDangNhap}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="matKhau"
                    value={formData.matKhau}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu"
                    disabled={loading}
                    className={`input-cute pl-12 pr-12 ${errors.matKhau ? 'border-red-400' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.matKhau && (
                  <p className="mt-1 text-xs text-red-500">⚠️ {errors.matKhau}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
                loading={loading}
                icon={<ArrowRight size={20} />}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-primary-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gradient-to-br from-primary-50 via-rose-50 to-cream-100 text-gray-600">
                    hoặc
                  </span>
                </div>
              </div>

              <Link 
                to="/login" 
                className="flex items-center justify-center gap-2 p-4 bg-white rounded-cute border-2 border-primary-200 hover:border-primary-400 transition-colors text-gray-700 hover:text-primary-600"
              >
                <Home size={20} />
                <span className="font-medium">Đăng nhập với tài khoản người dùng</span>
              </Link>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-cute border border-gray-200">
                <Shield size={16} className="text-primary-500" />
                <span>Chỉ dành cho quản trị viên. Phiên đăng nhập được bảo mật.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AdminLoginPage;
