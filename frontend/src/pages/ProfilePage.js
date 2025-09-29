import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import userService from '../services/userService'; // Import userService
import LogoutButton from '../components/LogoutButton';

const ProfilePage = () => {
  // State quản lý thông tin user
  const [userInfo, setUserInfo] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  /**
   * Kiểm tra đăng nhập và load thông tin user
   */
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Kiểm tra user đã đăng nhập chưa
        if (!authService.isLoggedIn()) {
          console.log('❌ User chưa đăng nhập, chuyển hướng về login');
          navigate('/login');
          return;
        }

        // Lấy thông tin user từ localStorage
        const localUserInfo = authService.getUserInfo();
        setUserInfo(localUserInfo);

        // Lấy thông tin profile từ API (để có dữ liệu mới nhất)
        try {
          const profileResponse = await userService.getProfile(); // Sử dụng userService
          setProfileData(profileResponse.data.user);
          console.log('✅ Đã load profile data từ API:', profileResponse.data.user);
        } catch (apiError) {
          console.warn('⚠️ Không thể load profile từ API, sử dụng dữ liệu local:', apiError.message);
          // Nếu API lỗi, vẫn hiển thị dữ liệu từ localStorage
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

  /**
   * Chuyển đến trang chỉnh sửa profile
   */
  const goToEditProfile = () => {
    navigate('/edit-profile'); // Chuyển đến trang edit profile
  };

  /**
   * Refresh profile data từ API
   */
  const refreshProfile = async () => {
    try {
      setLoading(true);
      const profileResponse = await userService.getProfile(); // Sử dụng userService
      setProfileData(profileResponse.data.user);
      
      // Cập nhật localStorage với dữ liệu mới
      authService.saveUserInfo(profileResponse.data.user);
      
      console.log('🔄 Đã refresh profile data');
    } catch (error) {
      console.error('❌ Lỗi refresh profile:', error);
      setError('Không thể tải lại thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.loading}>
            <h3>⏳ Đang tải thông tin...</h3>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.error}>
            <h3>❌ Có lỗi xảy ra</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} style={styles.retryBtn}>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dữ liệu hiển thị (ưu tiên API data, fallback về localStorage data)
  const displayData = profileData || userInfo;

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>👤 Thông tin cá nhân</h2>
          <div style={styles.headerActions}>
            <button onClick={refreshProfile} style={styles.refreshBtn}>
              🔄 Làm mới
            </button>
            <LogoutButton />
          </div>
        </div>

        {/* Profile Info */}
        {displayData && (
          <div style={styles.profileCard}>
            <div style={styles.profileHeader}>
              <div style={styles.avatar}>
                {displayData.hoTen?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div style={styles.profileBasic}>
                <h3 style={styles.name}>{displayData.hoTen || 'Chưa cập nhật'}</h3>
                <p style={styles.username}>@{displayData.tenDangNhap}</p>
                <span style={{
                  ...styles.badge,
                  backgroundColor: displayData.vaiTro === 'admin' ? '#dc3545' : '#28a745'
                }}>
                  {displayData.vaiTro === 'admin' ? '👑 Admin' : '👤 User'}
                </span>
              </div>
            </div>

            <div style={styles.divider}></div>

            <div style={styles.profileDetails}>
              <div style={styles.detailItem}>
                <strong>📧 Email:</strong>
                <span>{displayData.email || 'Chưa cập nhật'}</span>
              </div>

              <div style={styles.detailItem}>
                <strong>📱 Số điện thoại:</strong>
                <span>{displayData.dienThoai || 'Chưa cập nhật'}</span>
              </div>

              <div style={styles.detailItem}>
                <strong>📅 Ngày tạo:</strong>
                <span>
                  {displayData.ngayTao 
                    ? new Date(displayData.ngayTao).toLocaleDateString('vi-VN')
                    : 'Không xác định'
                  }
                </span>
              </div>

              <div style={styles.detailItem}>
                <strong>🟢 Trạng thái:</strong>
                <span style={{
                  color: displayData.enable ? '#28a745' : '#dc3545',
                  fontWeight: 'bold'
                }}>
                  {displayData.enable ? 'Hoạt động' : 'Bị khóa'}
                </span>
              </div>
            </div>

            <div style={styles.divider}></div>

            <div style={styles.actions}>
              <button onClick={goToEditProfile} style={styles.editBtn}>
                ✏️ Chỉnh sửa thông tin
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={styles.navigation}>
          <button onClick={() => navigate('/')} style={styles.navBtn}>
            🏠 Trang chủ
          </button>
          <button onClick={() => navigate('/products')} style={styles.navBtn}>
            🛍️ Sản phẩm
          </button>
        </div>

        {/* Debug Info (chỉ hiển thị trong development) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={styles.debugInfo}>
            <h4>🐛 Debug Info:</h4>
            <p><strong>Token:</strong> {authService.getToken() ? 'Có' : 'Không'}</p>
            <p><strong>LocalStorage User:</strong> {userInfo ? 'Có' : 'Không'}</p>
            <p><strong>API Profile:</strong> {profileData ? 'Có' : 'Không'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// CSS Styles
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px'
  },
  wrapper: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  title: {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  refreshBtn: {
    padding: '8px 16px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px'
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px'
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold'
  },
  profileBasic: {
    flex: 1
  },
  name: {
    margin: '0 0 5px 0',
    fontSize: '24px',
    color: '#333'
  },
  username: {
    margin: '0 0 10px 0',
    color: '#666',
    fontSize: '16px'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  divider: {
    height: '1px',
    backgroundColor: '#dee2e6',
    margin: '20px 0'
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px'
  },
  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  editBtn: {
    padding: '10px 20px',
    backgroundColor: '#ffc107',
    color: '#212529',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  navigation: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  navBtn: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    backgroundColor: 'white',
    borderRadius: '8px'
  },
  error: {
    textAlign: 'center',
    padding: '50px',
    backgroundColor: 'white',
    borderRadius: '8px',
    color: '#dc3545'
  },
  retryBtn: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  debugInfo: {
    backgroundColor: '#e9ecef',
    padding: '15px',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#495057'
  }
};

export default ProfilePage;