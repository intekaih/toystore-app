import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import authService from '../services/authService';
import LogoutButton from '../components/LogoutButton';

const EditProfilePage = () => {
  // State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    HoTen: '',
    Email: '',
    DienThoai: ''
  });

  // State quản lý dữ liệu gốc (để so sánh thay đổi)
  const [originalData, setOriginalData] = useState({
    HoTen: '',
    Email: '',
    DienThoai: ''
  });

  // State quản lý trạng thái UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  const navigate = useNavigate();

  /**
   * Load thông tin profile khi component mount
   */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Kiểm tra đăng nhập
        if (!authService.isLoggedIn()) {
          console.log('❌ User chưa đăng nhập, chuyển hướng về login');
          navigate('/login');
          return;
        }

        setLoading(true);
        console.log('📤 Đang tải thông tin profile...');

        // Gọi API lấy thông tin profile
        const response = await userService.getProfile();
        const userData = response.data.user;

        console.log('✅ Đã tải thông tin profile:', userData);

        // Cập nhật state với dữ liệu từ API
        const profileData = {
          HoTen: userData.hoTen || '',
          Email: userData.email || '',
          DienThoai: userData.dienThoai || ''
        };

        setFormData(profileData);
        setOriginalData(profileData); // Lưu dữ liệu gốc để so sánh
        setUserInfo(userData);

      } catch (error) {
        console.error('❌ Lỗi tải profile:', error);
        setMessage(error.message || 'Có lỗi xảy ra khi tải thông tin profile');
        
        // Nếu lỗi 401, chuyển về login
        if (error.message.includes('đăng nhập')) {
          setTimeout(() => navigate('/login'), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  /**
   * Xử lý thay đổi giá trị input
   * @param {Event} e - Event từ input
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Xóa lỗi của field đang được chỉnh sửa
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Xóa message khi user bắt đầu chỉnh sửa
    if (message) {
      setMessage('');
    }
  };

  /**
   * Validate form trước khi submit
   * @returns {boolean} True nếu form hợp lệ
   */
  const validateForm = () => {
    const newErrors = {};

    // Validate họ tên
    if (!formData.HoTen.trim()) {
      newErrors.HoTen = 'Họ tên không được để trống';
    } else if (!userService.validateName(formData.HoTen)) {
      newErrors.HoTen = 'Họ tên chỉ được chứa chữ cái và khoảng trắng, tối thiểu 2 ký tự';
    }

    // Validate email
    if (!formData.Email.trim()) {
      newErrors.Email = 'Email không được để trống';
    } else if (!userService.validateEmail(formData.Email)) {
      newErrors.Email = 'Định dạng email không hợp lệ';
    }

    // Validate số điện thoại (tùy chọn)
    if (formData.DienThoai.trim() && !userService.validatePhoneNumber(formData.DienThoai)) {
      newErrors.DienThoai = 'Số điện thoại phải có định dạng Việt Nam hợp lệ (VD: 0901234567)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Kiểm tra có thay đổi dữ liệu không
   * @returns {boolean} True nếu có thay đổi
   */
  const hasChanges = () => {
    return (
      formData.HoTen.trim() !== originalData.HoTen.trim() ||
      formData.Email.trim() !== originalData.Email.trim() ||
      formData.DienThoai.trim() !== originalData.DienThoai.trim()
    );
  };

  /**
   * Xử lý submit form
   * @param {Event} e - Submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset message
    setMessage('');

    // Kiểm tra có thay đổi gì không
    if (!hasChanges()) {
      setMessage('Không có thay đổi nào để lưu');
      return;
    }

    // Validate form
    if (!validateForm()) {
      setMessage('Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    setSaving(true);

    try {
      // Chuẩn bị dữ liệu cập nhật (chỉ gửi những field có thay đổi)
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

      console.log('📝 Cập nhật profile với dữ liệu:', updateData);

      // Gọi API cập nhật
      const response = await userService.updateProfile(updateData);

      console.log('✅ Cập nhật thành công:', response.data);

      // Cập nhật state với dữ liệu mới
      const newUserData = response.data.user;
      const newProfileData = {
        HoTen: newUserData.hoTen || '',
        Email: newUserData.email || '',
        DienThoai: newUserData.dienThoai || ''
      };

      setFormData(newProfileData);
      setOriginalData(newProfileData); // Cập nhật dữ liệu gốc
      setUserInfo(newUserData);

      // Hiển thị thông báo thành công
      setMessage('Cập nhật thông tin thành công!');

      // Tự động chuyển về trang profile sau 2 giây
      setTimeout(() => {
        navigate('/profile');
      }, 2000);

    } catch (error) {
      console.error('❌ Lỗi cập nhật profile:', error);
      setMessage(error.message || 'Có lỗi xảy ra khi cập nhật thông tin');

      // Nếu lỗi 401, chuyển về login
      if (error.message.includes('đăng nhập')) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  /**
   * Reset form về dữ liệu gốc
   */
  const handleReset = () => {
    setFormData({ ...originalData });
    setErrors({});
    setMessage('');
  };

  /**
   * Hủy và quay về trang profile
   */
  const handleCancel = () => {
    navigate('/profile');
  };

  // Hiển thị loading khi đang tải dữ liệu
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

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>✏️ Chỉnh sửa thông tin cá nhân</h2>
          <LogoutButton />
        </div>

        {/* User Info Card */}
        {userInfo && (
          <div style={styles.userCard}>
            <div style={styles.userInfo}>
              <div style={styles.avatar}>
                {userInfo.hoTen?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h4 style={styles.username}>@{userInfo.tenDangNhap}</h4>
                <span style={{
                  ...styles.badge,
                  backgroundColor: userInfo.vaiTro === 'admin' ? '#dc3545' : '#28a745'
                }}>
                  {userInfo.vaiTro === 'admin' ? '👑 Admin' : '👤 User'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div style={styles.formCard}>
          {/* Hiển thị thông báo */}
          {message && (
            <div style={{
              ...styles.message,
              backgroundColor: message.includes('thành công') ? '#d4edda' : '#f8d7da',
              color: message.includes('thành công') ? '#155724' : '#721c24',
              borderColor: message.includes('thành công') ? '#c3e6cb' : '#f5c6cb'
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Họ tên */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Họ tên *</label>
              <input
                type="text"
                name="HoTen"
                value={formData.HoTen}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  borderColor: errors.HoTen ? '#dc3545' : '#ddd'
                }}
                placeholder="Nhập họ tên đầy đủ"
                disabled={saving}
              />
              {errors.HoTen && (
                <span style={styles.error}>{errors.HoTen}</span>
              )}
            </div>

            {/* Email */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  borderColor: errors.Email ? '#dc3545' : '#ddd'
                }}
                placeholder="Nhập địa chỉ email"
                disabled={saving}
              />
              {errors.Email && (
                <span style={styles.error}>{errors.Email}</span>
              )}
            </div>

            {/* Số điện thoại */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Số điện thoại</label>
              <input
                type="tel"
                name="DienThoai"
                value={formData.DienThoai}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  borderColor: errors.DienThoai ? '#dc3545' : '#ddd'
                }}
                placeholder="Nhập số điện thoại (tùy chọn)"
                disabled={saving}
              />
              {errors.DienThoai && (
                <span style={styles.error}>{errors.DienThoai}</span>
              )}
              <small style={styles.hint}>
                Định dạng: 0901234567 hoặc +84901234567
              </small>
            </div>

            {/* Buttons */}
            <div style={styles.buttonGroup}>
              <button
                type="submit"
                style={{
                  ...styles.saveBtn,
                  backgroundColor: saving ? '#6c757d' : (hasChanges() ? '#28a745' : '#6c757d'),
                  cursor: saving || !hasChanges() ? 'not-allowed' : 'pointer'
                }}
                disabled={saving || !hasChanges()}
              >
                {saving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
              </button>

              <button
                type="button"
                onClick={handleReset}
                style={{
                  ...styles.resetBtn,
                  cursor: hasChanges() ? 'pointer' : 'not-allowed'
                }}
                disabled={saving || !hasChanges()}
              >
                🔄 Khôi phục
              </button>

              <button
                type="button"
                onClick={handleCancel}
                style={styles.cancelBtn}
                disabled={saving}
              >
                ❌ Hủy
              </button>
            </div>
          </form>
        </div>

        {/* Debug Info (chỉ hiển thị trong development) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={styles.debugInfo}>
            <h4>🐛 Debug Info:</h4>
            <p><strong>Has Changes:</strong> {hasChanges() ? 'Yes' : 'No'}</p>
            <p><strong>Saving:</strong> {saving ? 'Yes' : 'No'}</p>
            <p><strong>Errors:</strong> {Object.keys(errors).length}</p>
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
    maxWidth: '600px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  title: {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold'
  },
  username: {
    margin: '0 0 5px 0',
    color: '#333',
    fontSize: '18px'
  },
  badge: {
    padding: '3px 8px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '11px',
    fontWeight: 'bold'
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
    fontSize: '14px'
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    transition: 'border-color 0.3s',
    outline: 'none'
  },
  error: {
    color: '#dc3545',
    fontSize: '12px',
    marginTop: '2px'
  },
  hint: {
    color: '#6c757d',
    fontSize: '12px',
    fontStyle: 'italic'
  },
  message: {
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid',
    textAlign: 'center',
    fontSize: '14px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    flexWrap: 'wrap'
  },
  saveBtn: {
    flex: 1,
    padding: '12px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    minWidth: '150px'
  },
  resetBtn: {
    padding: '12px 20px',
    backgroundColor: '#ffc107',
    color: '#212529',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  cancelBtn: {
    padding: '12px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    backgroundColor: 'white',
    borderRadius: '8px'
  },
  debugInfo: {
    backgroundColor: '#e9ecef',
    padding: '15px',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#495057'
  }
};

export default EditProfilePage;