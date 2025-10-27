import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import userService from '../services/userService';
import { User, Mail, Phone, Calendar, Shield, Edit, Home, ShoppingBag, RefreshCw } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { Button, Badge, Loading } from '../components/ui';
import LogoutButton from '../components/LogoutButton';

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!authService.isLoggedIn()) {
          navigate('/login');
          return;
        }

        const localUserInfo = authService.getUserInfo();
        setUserInfo(localUserInfo);

        try {
          const profileResponse = await userService.getProfile();
          setProfileData(profileResponse.data.user);
        } catch (apiError) {
          console.warn('⚠️ Không thể load profile từ API, sử dụng dữ liệu local:', apiError.message);
          setProfileData(localUserInfo);
        }

      } catch (error) {
        console.error('❌ Lỗi load user data:', error);
        setError('Có lỗi xảy ra khi tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const goToEditProfile = () => {
    navigate('/profile/edit');
  };

  const refreshProfile = async () => {
    try {
      setLoading(true);
      const profileResponse = await userService.getProfile();
      setProfileData(profileResponse.data.user);
      authService.saveUserInfo(profileResponse.data.user);
    } catch (error) {
      console.error('❌ Lỗi refresh profile:', error);
      setError('Không thể tải lại thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Loading text="Đang tải thông tin..." fullScreen />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container-cute py-16 text-center">
          <div className="text-8xl mb-6">❌</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-4">Có lỗi xảy ra</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </MainLayout>
    );
  }

  const displayData = profileData || userInfo;

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
              onClick={refreshProfile}
            >
              Làm mới
            </Button>
            <LogoutButton />
          </div>
        </div>

        {/* Profile Card */}
        {displayData && (
          <div className="bg-white rounded-bubble shadow-bubble border-2 border-primary-100 overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-primary-50 via-rose-50 to-cream-100 p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-rose-400 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {displayData.hoTen?.charAt(0).toUpperCase() || 'U'}
                </div>

                {/* Basic Info */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-3xl font-display font-bold text-gray-800 mb-2">
                    {displayData.hoTen || 'Chưa cập nhật'}
                  </h3>
                  <p className="text-gray-600 mb-3">@{displayData.tenDangNhap}</p>
                  <Badge 
                    variant={displayData.vaiTro === 'admin' ? 'danger' : 'success'}
                    size="lg"
                  >
                    {displayData.vaiTro === 'admin' ? '👑 Admin' : '👤 User'}
                  </Badge>
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
                  <p className="text-gray-800 ml-8">{displayData.email || 'Chưa cập nhật'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-cute border-2 border-primary-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="text-primary-500" size={20} />
                    <strong className="text-gray-700">Số điện thoại</strong>
                  </div>
                  <p className="text-gray-800 ml-8">{displayData.dienThoai || 'Chưa cập nhật'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-cute border-2 border-primary-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="text-primary-500" size={20} />
                    <strong className="text-gray-700">Ngày tạo</strong>
                  </div>
                  <p className="text-gray-800 ml-8">
                    {displayData.ngayTao 
                      ? new Date(displayData.ngayTao).toLocaleDateString('vi-VN')
                      : 'Không xác định'
                    }
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-cute border-2 border-primary-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="text-primary-500" size={20} />
                    <strong className="text-gray-700">Trạng thái</strong>
                  </div>
                  <p className={`ml-8 font-bold ${displayData.enable ? 'text-green-600' : 'text-red-600'}`}>
                    {displayData.enable ? '🟢 Hoạt động' : '🔴 Bị khóa'}
                  </p>
                </div>
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
        )}

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