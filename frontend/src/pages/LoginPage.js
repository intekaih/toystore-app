import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const LoginPage = () => {
  // State quản lý form đăng nhập
  const [formData, setFormData] = useState({
    TenDangNhap: '',
    MatKhau: ''
  });

  // State quản lý trạng thái UI
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Hook điều hướng
  const navigate = useNavigate();

  /**
   * Kiểm tra nếu user đã đăng nhập thì chuyển hướng
   */
  useEffect(() => {
    if (authService.isLoggedIn()) {
      console.log('👤 User đã đăng nhập, chuyển hướng về profile');
      navigate('/profile');
    }
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

    // Xóa message khi user bắt đầu nhập
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

    // Validate tên đăng nhập/email
    if (!formData.TenDangNhap.trim()) {
      newErrors.TenDangNhap = 'Tên đăng nhập hoặc email không được để trống';
    } else if (formData.TenDangNhap.length < 3) {
      newErrors.TenDangNhap = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    // Validate mật khẩu
    if (!formData.MatKhau) {
      newErrors.MatKhau = 'Mật khẩu không được để trống';
    } else if (formData.MatKhau.length < 6) {
      newErrors.MatKhau = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Xử lý submit form đăng nhập
   * @param {Event} e - Submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset message trước đó
    setMessage('');

    // Validate form
    if (!validateForm()) {
      setMessage('Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    setLoading(true);

    try {
      // Chuẩn bị dữ liệu đăng nhập
      const loginData = {
        TenDangNhap: formData.TenDangNhap.trim(),
        MatKhau: formData.MatKhau
      };

      console.log('🔐 Đăng nhập với dữ liệu:', { TenDangNhap: loginData.TenDangNhap });

      // Gọi API đăng nhập
      const result = await authService.login(loginData);

      console.log('✅ Đăng nhập thành công:', result);

      // Hiển thị thông báo thành công
      setMessage('Đăng nhập thành công! Đang chuyển hướng...');
      
      // Reset form
      setFormData({
        TenDangNhap: '',
        MatKhau: ''
      });

      // Chuyển hướng về trang profile sau 1.5 giây
      setTimeout(() => {
        navigate('/profile');
        console.log('🔄 Chuyển hướng về trang profile');
      }, 1500);

    } catch (error) {
      console.error('❌ Lỗi đăng nhập:', error);
      
      // Hiển thị thông báo lỗi cho người dùng
      setMessage(error.message || 'Có lỗi xảy ra trong quá trình đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Chuyển hướng đến trang đăng ký
   */
  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h2 style={styles.title}>Đăng nhập</h2>
        
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
          {/* Tên đăng nhập hoặc Email */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Tên đăng nhập hoặc Email *</label>
            <input
              type="text"
              name="TenDangNhap"
              value={formData.TenDangNhap}
              onChange={handleInputChange}
              style={{
                ...styles.input,
                borderColor: errors.TenDangNhap ? '#dc3545' : '#ddd'
              }}
              placeholder="Nhập tên đăng nhập hoặc email"
              disabled={loading}
              autoComplete="username"
            />
            {errors.TenDangNhap && (
              <span style={styles.error}>{errors.TenDangNhap}</span>
            )}
          </div>

          {/* Mật khẩu */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Mật khẩu *</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                name="MatKhau"
                value={formData.MatKhau}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  borderColor: errors.MatKhau ? '#dc3545' : '#ddd',
                  paddingRight: '40px'
                }}
                placeholder="Nhập mật khẩu"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.showPasswordBtn}
                disabled={loading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.MatKhau && (
              <span style={styles.error}>{errors.MatKhau}</span>
            )}
          </div>

          {/* Nút đăng nhập */}
          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              backgroundColor: loading ? '#6c757d' : '#007bff',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Link đăng ký */}
        <div style={styles.footer}>
          <p>Chưa có tài khoản? 
            <button 
              style={styles.linkBtn}
              onClick={goToRegister}
              disabled={loading}
            >
              Đăng ký ngay
            </button>
          </p>
        </div>

        {/* Thông tin test */}
        <div style={styles.testInfo}>
          <p style={styles.testTitle}>🧪 Tài khoản test:</p>
          <p><strong>Admin:</strong> admin / admin123</p>
          <p><strong>User:</strong> user1 / user123</p>
        </div>
      </div>
    </div>
  );
};

// CSS Styles
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: '20px'
  },
  formWrapper: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '450px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold'
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
  passwordWrapper: {
    position: 'relative'
  },
  showPasswordBtn: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px'
  },
  error: {
    color: '#dc3545',
    fontSize: '12px',
    marginTop: '2px'
  },
  message: {
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid',
    textAlign: 'center',
    fontSize: '14px'
  },
  submitBtn: {
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    marginTop: '10px'
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px'
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '14px',
    marginLeft: '5px'
  },
  testInfo: {
    marginTop: '30px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    border: '1px solid #dee2e6'
  },
  testTitle: {
    margin: '0 0 10px 0',
    fontWeight: 'bold',
    color: '#495057'
  }
};

export default LoginPage;