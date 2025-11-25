import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, User, Lock, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '../components/ui';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    TenDangNhap: '',
    MatKhau: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      console.log('👤 User đã đăng nhập, chuyển hướng về:', from);
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

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

    if (message) {
      setMessage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.TenDangNhap.trim()) {
      newErrors.TenDangNhap = 'Tên đăng nhập hoặc email không được để trống';
    } else if (formData.TenDangNhap.length < 3) {
      newErrors.TenDangNhap = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    if (!formData.MatKhau) {
      newErrors.MatKhau = 'Mật khẩu không được để trống';
    } else if (formData.MatKhau.length < 6) {
      newErrors.MatKhau = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!validateForm()) {
      setMessage('Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    setLoading(true);

    try {
      const loginData = {
        TenDangNhap: formData.TenDangNhap.trim(),
        MatKhau: formData.MatKhau
      };

      // ✅ useAuth hook đã sử dụng authService bên trong
      // Không cần import authService trực tiếp ở đây
      await login(loginData);
      
      setMessage('Đăng nhập thành công! Đang chuyển hướng...');
      
      setFormData({
        TenDangNhap: '',
        MatKhau: ''
      });

    } catch (error) {
      console.error('❌ Lỗi đăng nhập:', error);
      setMessage(error.message || 'Có lỗi xảy ra trong quá trình đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-cream-100 flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-float">🧸</div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>🎀</div>
      <div className="absolute top-1/3 right-20 text-5xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>⭐</div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="text-6xl mb-4 animate-bounce-soft">🔐</div>
          <h1 className="text-4xl font-display font-bold text-gradient-primary mb-2">
            Đăng nhập
          </h1>
          <p className="text-gray-600">Chào mừng bạn quay trở lại!</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-bubble shadow-bubble border-2 border-primary-100 p-8 animate-scale-in">
          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-cute border-2 ${
              message.includes('thành công')
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <p className="text-sm font-medium text-center">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username/Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên đăng nhập hoặc Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={20} />
                <input
                  type="text"
                  name="TenDangNhap"
                  value={formData.TenDangNhap}
                  onChange={handleInputChange}
                  placeholder="Nhập tên đăng nhập hoặc email"
                  disabled={loading}
                  autoComplete="username"
                  className={`input-cute pl-12 ${errors.TenDangNhap ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.TenDangNhap && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <span>⚠️</span> {errors.TenDangNhap}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="MatKhau"
                  value={formData.MatKhau}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu"
                  disabled={loading}
                  autoComplete="current-password"
                  className={`input-cute pl-12 pr-12 ${errors.MatKhau ? 'border-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.MatKhau && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <span>⚠️</span> {errors.MatKhau}
                </p>
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
              icon={<LogIn size={20} />}
              className="mt-6"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Chưa có tài khoản?{' '}
              <Link 
                to="/register" 
                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>

          {/* Test Accounts Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-rose-50 rounded-cute border-2 border-primary-200">
            <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <span className="text-lg">🧪</span>
              Tài khoản test:
            </p>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>User:</strong> user1 / user123</p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-primary-600 hover:text-primary-700 font-semibold transition-colors inline-flex items-center gap-2"
          >
            ← Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;