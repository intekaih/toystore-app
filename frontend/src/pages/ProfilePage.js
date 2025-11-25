import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Calendar, Shield, Edit, Home, ShoppingBag, RefreshCw } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { Button, Badge, Loading } from '../components/ui';
import LogoutButton from '../components/LogoutButton';
import { RoleChecker } from '../constants/roles';

const ProfilePage = () => {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const navigate = useNavigate();

  const getRoleDisplay = () => {
    if (!user) return null;
    const role = user.vaiTro || user.VaiTro || user.role;
    return RoleChecker.getDisplayInfo(role);
  };

  const roleDisplay = getRoleDisplay();

  useEffect(() => {
    const loadUserData = async () => {
      // Nếu không có user và không đang loading từ AuthContext
      if (!user && !authLoading && !initialLoadDone) {
        try {
          setLoading(true);
          setError('');
          await refreshUser(); // Load user từ database
          setInitialLoadDone(true);
        } catch (error) {
          console.error('❌ Lỗi load user:', error);
          setError('Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.');
          // Redirect về trang login sau 2 giây
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } finally {
          setLoading(false);
        }
      } else if (!user && !authLoading && initialLoadDone) {
        // Đã thử load nhưng vẫn không có user -> redirect login
        navigate('/login');
      }
    };

    loadUserData();
  }, [user, authLoading, refreshUser, navigate, initialLoadDone]);

  const goToEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleRefreshProfile = async () => {
    try {
      setLoading(true);
      setError('');
      await refreshUser(); // Gọi API để load lại user từ database
    } catch (error) {
      console.error('❌ Lỗi refresh profile:', error);
      setError('Không thể tải lại thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị loading khi đang tải dữ liệu
  if (loading || authLoading) {
    return (
      <MainLayout>
        <Loading text="Đang tải thông tin..." fullScreen />
      </MainLayout>
    );
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <MainLayout>
        <div className="container-cute py-16 text-center">
          <div className="text-8xl mb-6">❌</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-4">Có lỗi xảy ra</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button variant="primary" onClick={handleRefreshProfile}>
              Thử lại
            </Button>
            <Button variant="outline" onClick={() => navigate('/login')}>
              Đăng nhập lại
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Chờ user được load
  if (!user) {
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
            <User size={40} />
            Thông tin cá nhân
          </h1>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw size={16} />}
              onClick={handleRefreshProfile}
              disabled={loading}
            >
              Làm mới
            </Button>
            <LogoutButton />
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-bubble shadow-bubble border-2 border-primary-100 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary-50 via-rose-50 to-cream-100 p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-rose-400 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {user.hoTen?.charAt(0).toUpperCase() || 'U'}
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl font-display font-bold text-gray-800 mb-2">
                  {user.hoTen || 'Chưa cập nhật'}
                </h3>
                <p className="text-gray-600 mb-3">@{user.tenDangNhap}</p>
                {/* ✅ Sử dụng roleDisplay thay vì hardcode */}
                {roleDisplay && (
                  <Badge 
                    variant={roleDisplay.color}
                    size="lg"
                  >
                    {roleDisplay.icon} {roleDisplay.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-cute border-2 border-primary-100">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="text-primary-500" size={20} />
                  <strong className="text-gray-700">Email</strong>
                </div>
                <p className="text-gray-800 ml-8">{user.email || 'Chưa cập nhật'}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-cute border-2 border-primary-100">
                <div className="flex items-center gap-3 mb-2">
                  <Phone className="text-primary-500" size={20} />
                  <strong className="text-gray-700">Số điện thoại</strong>
                </div>
                <p className="text-gray-800 ml-8">{user.dienThoai || 'Chưa cập nhật'}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-cute border-2 border-primary-100">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="text-primary-500" size={20} />
                  <strong className="text-gray-700">Ngày tạo</strong>
                </div>
                <p className="text-gray-800 ml-8">
                  {user.ngayTao 
                    ? new Date(user.ngayTao).toLocaleDateString('vi-VN')
                    : 'Không xác định'
                  }
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-cute border-2 border-primary-100">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="text-primary-500" size={20} />
                  <strong className="text-gray-700">Trạng thái</strong>
                </div>
                <p className={`ml-8 font-bold flex items-center gap-2 ${
                  user.enable ? 'text-green-600' : 'text-red-600'
                }`}>
                  {user.enable ? (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Hoạt động
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Bị khóa
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Role Badge */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Vai trò:</span>
              {roleDisplay && (
                <Badge variant={roleDisplay.color}>
                  {roleDisplay.icon} {roleDisplay.label}
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="pt-6 border-t-2 border-primary-100 flex justify-center">
              <Button
                variant="primary"
                size="lg"
                icon={<Edit size={20} />}
                onClick={goToEditProfile}
              >
                Chỉnh sửa thông tin
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button
            variant="outline"
            icon={<Home size={20} />}
            onClick={() => navigate('/')}
          >
            Trang chủ
          </Button>
          <Button
            variant="outline"
            icon={<ShoppingBag size={20} />}
            onClick={() => navigate('/products')}
          >
            Sản phẩm
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;