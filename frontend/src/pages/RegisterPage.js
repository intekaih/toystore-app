import React, { useState } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  // State quản lý form
  const [formData, setFormData] = useState({
    TenDangNhap: '',
    MatKhau: '',
    NhapLaiMatKhau: '',
    HoTen: '',
    Email: '',
    DienThoai: ''
  });

  // State quản lý trạng thái UI
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Hook điều hướng
  const navigate = useNavigate();

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
  };

  /**
   * Validate form trước khi submit
   * @returns {boolean} True nếu form hợp lệ
   */
  const validateForm = () => {
    const newErrors = {};

    // Validate tên đăng nhập
    if (!formData.TenDangNhap.trim()) {
      newErrors.TenDangNhap = 'Tên đăng nhập không được để trống';
    } else if (formData.TenDangNhap.length < 3) {
      newErrors.TenDangNhap = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.TenDangNhap)) {
      newErrors.TenDangNhap = 'Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới';
    }

    // Validate họ tên
    if (!formData.HoTen.trim()) {
      newErrors.HoTen = 'Họ tên không được để trống';
    } else if (formData.HoTen.length < 2) {
      newErrors.HoTen = 'Họ tên phải có ít nhất 2 ký tự';
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.HoTen.trim())) {
      newErrors.HoTen = 'Họ tên chỉ được chứa chữ cái và khoảng trắng';
    }

    // Validate email
    if (!formData.Email.trim()) {
      newErrors.Email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      newErrors.Email = 'Định dạng email không hợp lệ';
    }

    // Validate mật khẩu
    if (!formData.MatKhau) {
      newErrors.MatKhau = 'Mật khẩu không được để trống';
    } else if (formData.MatKhau.length < 6) {
      newErrors.MatKhau = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    // Validate nhập lại mật khẩu
    if (!formData.NhapLaiMatKhau) {
      newErrors.NhapLaiMatKhau = 'Vui lòng nhập lại mật khẩu';
    } else if (formData.MatKhau !== formData.NhapLaiMatKhau) {
      newErrors.NhapLaiMatKhau = 'Mật khẩu nhập lại không khớp';
    }

    // Validate số điện thoại (tùy chọn)
    if (formData.DienThoai && !/^(0|\+84)[0-9]{9,10}$/.test(formData.DienThoai.replace(/\s/g, ''))) {
      newErrors.DienThoai = 'Số điện thoại phải có định dạng Việt Nam hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Xử lý submit form đăng ký
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
      // Chuẩn bị dữ liệu gửi đi (loại bỏ NhapLaiMatKhau)
      const registerData = {
        TenDangNhap: formData.TenDangNhap.trim(),
        MatKhau: formData.MatKhau,
        HoTen: formData.HoTen.trim(),
        Email: formData.Email.trim().toLowerCase(),
        DienThoai: formData.DienThoai.trim() || undefined
      };

      console.log('📝 Đăng ký với dữ liệu:', { ...registerData, MatKhau: '***' });

      // Gọi API đăng ký
      const result = await authService.register(registerData);

      console.log('✅ Đăng ký thành công:', result);

      // Hiển thị thông báo thành công
      setMessage('Đăng ký tài khoản thành công! Đang chuyển hướng...');
      
      // Reset form
      setFormData({
        TenDangNhap: '',
        MatKhau: '',
        NhapLaiMatKhau: '',
        HoTen: '',
        Email: '',
        DienThoai: ''
      });

      // Chuyển hướng về trang đăng nhập sau 2 giây
      setTimeout(() => {
        navigate('/login');
        console.log('🔄 Chuyển hướng về trang đăng nhập');
      }, 2000);

    } catch (error) {
      console.error('❌ Lỗi đăng ký:', error);
      
      // Hiển thị thông báo lỗi cho người dùng
      setMessage(error.message || 'Có lỗi xảy ra trong quá trình đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h2 style={styles.title}>Đăng ký tài khoản</h2>
        
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
          {/* Tên đăng nhập */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Tên đăng nhập *</label>
            <input
              type="text"
              name="TenDangNhap"
              value={formData.TenDangNhap}
              onChange={handleInputChange}
              style={{
                ...styles.input,
                borderColor: errors.TenDangNhap ? '#dc3545' : '#ddd'
              }}
              placeholder="Nhập tên đăng nhập"
              disabled={loading}
            />
            {errors.TenDangNhap && (
              <span style={styles.error}>{errors.TenDangNhap}</span>
            )}
          </div>

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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
            {errors.DienThoai && (
              <span style={styles.error}>{errors.DienThoai}</span>
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

          {/* Nhập lại mật khẩu */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nhập lại mật khẩu *</label>
            <input
              type="password"
              name="NhapLaiMatKhau"
              value={formData.NhapLaiMatKhau}
              onChange={handleInputChange}
              style={{
                ...styles.input,
                borderColor: errors.NhapLaiMatKhau ? '#dc3545' : '#ddd'
              }}
              placeholder="Nhập lại mật khẩu"
              disabled={loading}
            />
            {errors.NhapLaiMatKhau && (
              <span style={styles.error}>{errors.NhapLaiMatKhau}</span>
            )}
          </div>

          {/* Nút đăng ký */}
          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              backgroundColor: loading ? '#6c757d' : '#007bff',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        {/* Link đăng nhập */}
        <div style={styles.footer}>
          <p>Đã có tài khoản? 
            <button 
              style={styles.linkBtn}
              onClick={() => navigate('/login')}
              disabled={loading}
            >
              Đăng nhập ngay
            </button>
          </p>
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
    maxWidth: '500px'
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
    textAlign: 'center'
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
  }
};

export default RegisterPage;