import React, { useState } from 'react';
import authService from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Mail, Phone, Lock, Eye, EyeOff, IdCard } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-cream-100 flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-float">🎀</div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>🧸</div>
      <div className="absolute top-1/3 right-20 text-5xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>💝</div>
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