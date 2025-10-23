import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LogoutButton = ({ style, className, children }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  /**
   * Xử lý đăng xuất
   */
  const handleLogout = async () => {
    try {
      setLoading(true);
      
      // Gọi logout từ AuthContext
      await logout();
      
      console.log('🔓 Đăng xuất thành công');
      
      // Chuyển hướng về trang đăng nhập
      navigate('/login');
      
    } catch (error) {
      console.error('❌ Lỗi đăng xuất:', error);
      alert('Có lỗi xảy ra khi đăng xuất');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xác nhận trước khi đăng xuất
   */
  const confirmLogout = () => {
    const isConfirmed = window.confirm('Bạn có chắc chắn muốn đăng xuất?');
    if (isConfirmed) {
      handleLogout();
    }
  };

  return (
    <button
      onClick={confirmLogout}
      disabled={loading}
      style={{
        ...defaultStyles.button,
        ...style,
        backgroundColor: loading ? '#6c757d' : '#dc3545',
        cursor: loading ? 'not-allowed' : 'pointer'
      }}
      className={className}
    >
      {loading ? 'Đang đăng xuất...' : (children || '🔓 Đăng xuất')}
    </button>
  );
};

// Default styles cho nút đăng xuất
const defaultStyles = {
  button: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px'
  }
};

export default LogoutButton;