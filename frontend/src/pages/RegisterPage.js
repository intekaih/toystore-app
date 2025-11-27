import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gift, Sparkles, Heart, UserPlus, User, Mail, Phone, Lock, Eye, EyeOff, IdCard } from 'lucide-react';
import authService from '../services/authService';
import { Button } from '../components/ui';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    TenDangNhap: '',
    MatKhau: '',
    NhapLaiMatKhau: '',
    HoTen: '',
    Email: '',
    DienThoai: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

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

    if (!formData.TenDangNhap.trim()) {
      newErrors.TenDangNhap = 'Tên đăng nhập không được để trống';
    } else if (formData.TenDangNhap.length < 3) {
      newErrors.TenDangNhap = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.TenDangNhap)) {
      newErrors.TenDangNhap = 'Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới';
    }

    if (!formData.HoTen.trim()) {
      newErrors.HoTen = 'Họ tên không được để trống';
    } else if (formData.HoTen.length < 2) {
      newErrors.HoTen = 'Họ tên phải có ít nhất 2 ký tự';
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.HoTen.trim())) {
      newErrors.HoTen = 'Họ tên chỉ được chứa chữ cái và khoảng trắng';
    }

    if (!formData.Email.trim()) {
      newErrors.Email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      newErrors.Email = 'Định dạng email không hợp lệ';
    }

    if (!formData.MatKhau) {
      newErrors.MatKhau = 'Mật khẩu không được để trống';
    } else if (formData.MatKhau.length < 6) {
      newErrors.MatKhau = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.NhapLaiMatKhau) {
      newErrors.NhapLaiMatKhau = 'Vui lòng nhập lại mật khẩu';
    } else if (formData.MatKhau !== formData.NhapLaiMatKhau) {
      newErrors.NhapLaiMatKhau = 'Mật khẩu nhập lại không khớp';
    }

    if (formData.DienThoai && !/^(0|\+84)[0-9]{9,10}$/.test(formData.DienThoai.replace(/\s/g, ''))) {
      newErrors.DienThoai = 'Số điện thoại phải có định dạng Việt Nam hợp lệ';
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
      const registerData = {
        TenDangNhap: formData.TenDangNhap.trim(),
        MatKhau: formData.MatKhau,
        HoTen: formData.HoTen.trim(),
        Email: formData.Email.trim().toLowerCase(),
        DienThoai: formData.DienThoai.trim() || undefined
      };

      const result = await authService.register(registerData);
      setMessage('Đăng ký tài khoản thành công! Đang chuyển hướng...');
      
      setFormData({
        TenDangNhap: '',
        MatKhau: '',
        NhapLaiMatKhau: '',
        HoTen: '',
        Email: '',
        DienThoai: ''
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('❌ Lỗi đăng ký:', error);
      setMessage(error.message || 'Có lỗi xảy ra trong quá trình đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements - Using Lucide Icons */}
      <div className="absolute top-10 left-10 text-pink-300 opacity-20 animate-float">
        <Gift size={64} />
      </div>
      <div className="absolute bottom-10 right-10 text-purple-300 opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>
        <Sparkles size={64} />
      </div>
      <div className="absolute top-1/3 right-20 text-blue-300 opacity-20 animate-float" style={{ animationDelay: '1s' }}>
        <Heart size={48} />
      </div>
      <div className="absolute bottom-1/4 left-20 text-5xl opacity-20 animate-float" style={{ animationDelay: '1.5s' }}>⭐</div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="text-6xl mb-4 animate-bounce-soft">📝</div>
          <h1 className="text-4xl font-display font-bold text-gradient-primary mb-2">
            Đăng ký tài khoản
          </h1>
          <p className="text-gray-600">Tham gia cùng chúng tôi ngay hôm nay!</p>
        </div>

        {/* Register Form */}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên đăng nhập <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
                  <input
                    type="text"
                    name="TenDangNhap"
                    value={formData.TenDangNhap}
                    onChange={handleInputChange}
                    placeholder="username"
                    disabled={loading}
                    className={`input-cute pl-11 ${errors.TenDangNhap ? 'border-red-400' : ''}`}
                  />
                </div>
                {errors.TenDangNhap && (
                  <p className="mt-1 text-xs text-red-500">⚠️ {errors.TenDangNhap}</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Họ tên <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
                  <input
                    type="text"
                    name="HoTen"
                    value={formData.HoTen}
                    onChange={handleInputChange}
                    placeholder="Nguyễn Văn A"
                    disabled={loading}
                    className={`input-cute pl-11 ${errors.HoTen ? 'border-red-400' : ''}`}
                  />
                </div>
                {errors.HoTen && (
                  <p className="mt-1 text-xs text-red-500">⚠️ {errors.HoTen}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    disabled={loading}
                    className={`input-cute pl-11 ${errors.Email ? 'border-red-400' : ''}`}
                  />
                </div>
                {errors.Email && (
                  <p className="mt-1 text-xs text-red-500">⚠️ {errors.Email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
                  <input
                    type="tel"
                    name="DienThoai"
                    value={formData.DienThoai}
                    onChange={handleInputChange}
                    placeholder="0123456789"
                    disabled={loading}
                    className={`input-cute pl-11 ${errors.DienThoai ? 'border-red-400' : ''}`}
                  />
                </div>
                {errors.DienThoai && (
                  <p className="mt-1 text-xs text-red-500">⚠️ {errors.DienThoai}</p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="MatKhau"
                  value={formData.MatKhau}
                  onChange={handleInputChange}
                  placeholder="Ít nhất 6 ký tự"
                  disabled={loading}
                  className={`input-cute pl-11 pr-11 ${errors.MatKhau ? 'border-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.MatKhau && (
                <p className="mt-1 text-xs text-red-500">⚠️ {errors.MatKhau}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nhập lại mật khẩu <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="NhapLaiMatKhau"
                  value={formData.NhapLaiMatKhau}
                  onChange={handleInputChange}
                  placeholder="Nhập lại mật khẩu"
                  disabled={loading}
                  className={`input-cute pl-11 pr-11 ${errors.NhapLaiMatKhau ? 'border-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.NhapLaiMatKhau && (
                <p className="mt-1 text-xs text-red-500">⚠️ {errors.NhapLaiMatKhau}</p>
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
              icon={<UserPlus size={20} />}
              className="mt-6"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
          </form>

          {/* Google Register Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>

            {/* Google Register Button */}
            <button
              type="button"
              onClick={() => authService.googleLogin()}
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-cute hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Đăng ký bằng Google</span>
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Đã có tài khoản?{' '}
              <Link 
                to="/login" 
                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                Đăng nhập ngay
              </Link>
            </p>
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

export default RegisterPage;