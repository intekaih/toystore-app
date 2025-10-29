import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import authService from '../services/authService';
import { User, Mail, Phone, Save, RotateCcw, X, Edit } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { Button, Badge, Loading } from '../components/ui';
import Toast from '../components/Toast';
import LogoutButton from '../components/LogoutButton';
import { useAuth } from '../contexts/AuthContext';

const EditProfilePage = () => {
  const { refreshUser } = useAuth(); // ✅ Gọi useAuth ở top level

  const [formData, setFormData] = useState({
    HoTen: '',
    Email: '',
    DienThoai: ''
  });

  const [originalData, setOriginalData] = useState({
    HoTen: '',
    Email: '',
    DienThoai: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!authService.isLoggedIn()) {
          navigate('/login');
          return;
        }

        setLoading(true);
        const response = await userService.getProfile();
        const userData = response.data.user;

        // Format dữ liệu từ backend (PascalCase) sang frontend (PascalCase cho form)
        const profileData = {
          HoTen: userData.HoTen || userData.hoTen || '',
          Email: userData.Email || userData.email || '',
          DienThoai: userData.DienThoai || userData.dienThoai || ''
        };

        setFormData(profileData);
        setOriginalData(profileData);
        
        // Format user info để hiển thị
        setUserInfo({
          hoTen: userData.HoTen || userData.hoTen,
          tenDangNhap: userData.TenDangNhap || userData.tenDangNhap,
          vaiTro: userData.VaiTro || userData.vaiTro,
          enable: userData.Enable !== undefined ? userData.Enable : userData.enable
        });

      } catch (error) {
        console.error('❌ Lỗi tải profile:', error);
        showToast(error.message || 'Có lỗi xảy ra khi tải thông tin profile', 'error');
        
        if (error.message.includes('đăng nhập')) {
          setTimeout(() => navigate('/login'), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration });
  };

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

    if (!formData.HoTen.trim()) {
      newErrors.HoTen = 'Họ tên không được để trống';
    } else if (!userService.validateName(formData.HoTen)) {
      newErrors.HoTen = 'Họ tên chỉ được chứa chữ cái và khoảng trắng, tối thiểu 2 ký tự';
    }

    if (!formData.Email.trim()) {
      newErrors.Email = 'Email không được để trống';
    } else if (!userService.validateEmail(formData.Email)) {
      newErrors.Email = 'Định dạng email không hợp lệ';
    }

    if (formData.DienThoai.trim() && !userService.validatePhoneNumber(formData.DienThoai)) {
      newErrors.DienThoai = 'Số điện thoại phải có định dạng Việt Nam hợp lệ (VD: 0901234567)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = () => {
    return (
      formData.HoTen.trim() !== originalData.HoTen.trim() ||
      formData.Email.trim() !== originalData.Email.trim() ||
      formData.DienThoai.trim() !== originalData.DienThoai.trim()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasChanges()) {
      showToast('Không có thay đổi nào để lưu', 'info');
      return;
    }

    if (!validateForm()) {
      showToast('Vui lòng kiểm tra lại thông tin đã nhập', 'error');
      return;
    }

    setSaving(true);

    try {
      const updateData = {};

      if (formData.HoTen.trim() !== originalData.HoTen.trim()) {
        updateData.HoTen = formData.HoTen.trim();
      }

      if (formData.Email.trim() !== originalData.Email.trim()) {
        updateData.Email = formData.Email.trim();
      }

      if (formData.DienThoai.trim() !== originalData.DienThoai.trim()) {
        updateData.DienThoai = formData.DienThoai.trim() || null;
      }

      const response = await userService.updateProfile(updateData);

      showToast('✅ Cập nhật thông tin thành công!', 'success');

      // Refresh user data từ AuthContext (sẽ tự động cập nhật Navbar)
      await refreshUser(); // ✅ Sử dụng refreshUser đã được khai báo ở top level

      setTimeout(() => {
        navigate('/profile');
      }, 1500);

    } catch (error) {
      console.error('❌ Lỗi cập nhật profile:', error);
      showToast(error.message || 'Có lỗi xảy ra khi cập nhật thông tin', 'error');

      if (error.message.includes('đăng nhập')) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({ ...originalData });
    setErrors({});
    showToast('Đã khôi phục dữ liệu gốc', 'info');
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <MainLayout>
        <Loading text="Đang tải thông tin..." fullScreen />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-cute py-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl font-display font-bold text-gradient-primary flex items-center gap-3">
            <Edit size={40} />
            Chỉnh sửa thông tin cá nhân
          </h1>
          <LogoutButton />
        </div>

        {/* User Info Card */}
        {userInfo && (
          <div className="bg-white rounded-bubble shadow-soft border-2 border-primary-100 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-rose-400 flex items-center justify-center text-white text-2xl font-bold">
                {userInfo.hoTen?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800">@{userInfo.tenDangNhap}</h4>
                <Badge variant={userInfo.vaiTro === 'admin' ? 'danger' : 'success'}>
                  {userInfo.vaiTro === 'admin' ? '👑 Admin' : '👤 User'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-bubble shadow-bubble border-2 border-primary-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Họ tên */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User size={16} className="text-primary-500" />
                Họ tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="HoTen"
                value={formData.HoTen}
                onChange={handleInputChange}
                placeholder="Nhập họ tên đầy đủ"
                disabled={saving}
                className={`input-cute ${errors.HoTen ? 'border-red-400' : ''}`}
              />
              {errors.HoTen && (
                <p className="mt-1 text-xs text-red-500">⚠️ {errors.HoTen}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Mail size={16} className="text-primary-500" />
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ email"
                disabled={saving}
                className={`input-cute ${errors.Email ? 'border-red-400' : ''}`}
              />
              {errors.Email && (
                <p className="mt-1 text-xs text-red-500">⚠️ {errors.Email}</p>
              )}
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Phone size={16} className="text-primary-500" />
                Số điện thoại
              </label>
              <input
                type="tel"
                name="DienThoai"
                value={formData.DienThoai}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại (tùy chọn)"
                disabled={saving}
                className={`input-cute ${errors.DienThoai ? 'border-red-400' : ''}`}
              />
              {errors.DienThoai && (
                <p className="mt-1 text-xs text-red-500">⚠️ {errors.DienThoai}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 italic">
                Định dạng: 0901234567 hoặc +84901234567
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={saving || !hasChanges()}
                loading={saving}
                icon={<Save size={20} />}
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleReset}
                disabled={saving || !hasChanges()}
                icon={<RotateCcw size={20} />}
              >
                Khôi phục
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={handleCancel}
                disabled={saving}
                icon={<X size={20} />}
              >
                Hủy
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}
    </MainLayout>
  );
};

export default EditProfilePage;