import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>
          🧸 ToyStore
        </Link>

        <div style={styles.navCenter}>
          <Link to="/products" style={styles.navLink}>
            🛍️ Sản phẩm
          </Link>
          <Link to="/" style={styles.navLink}>
            🏠 Trang chủ
          </Link>
          <Link to="/cart" style={styles.navLink}>
            🛒 Giỏ hàng
            {totalItems > 0 && (
              <span style={styles.cartBadge}>{totalItems}</span>
            )}
          </Link>
          {user && (
            <Link to="/orders" style={styles.navLink}>
              📜 Đơn hàng
            </Link>
          )}
        </div>

        <div style={styles.navRight}>
          {user ? (
            <div style={styles.userSection}>
              <div style={styles.userInfo} onClick={toggleUserMenu}>
                <div style={styles.userAvatar}>
                  {user.hoTen?.charAt(0).toUpperCase() || user.tenDangNhap?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span style={styles.userName}>
                  {user.hoTen || user.tenDangNhap}
                </span>
                <span style={styles.dropdownArrow}>
                  {showUserMenu ? '▲' : '▼'}
                </span>
              </div>
              
              {showUserMenu && (
                <div style={styles.userMenu}>
                  <div style={styles.menuHeader}>
                    <div style={styles.menuAvatar}>
                      {user.hoTen?.charAt(0).toUpperCase() || user.tenDangNhap?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div style={styles.menuUserInfo}>
                      <div style={styles.menuUserName}>{user.hoTen || user.tenDangNhap}</div>
                      <div style={styles.menuUserEmail}>{user.email || 'No email'}</div>
                      <div style={styles.menuUserRole}>
                        {user.vaiTro === 'admin' ? '👑 Admin' : '👤 User'}
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.menuDivider}></div>
                  
                  <Link 
                    to="/profile" 
                    style={styles.menuItem}
                    onClick={() => setShowUserMenu(false)}
                  >
                    <span style={styles.menuIcon}>👤</span>
                    Thông tin cá nhân
                  </Link>
                  
                  <Link 
                    to="/profile/edit" 
                    style={styles.menuItem}
                    onClick={() => setShowUserMenu(false)}
                  >
                    <span style={styles.menuIcon}>✏️</span>
                    Chỉnh sửa profile
                  </Link>
                  
                  {user.vaiTro === 'admin' && (
                    <>
                      <div style={styles.menuDivider}></div>
                      <Link 
                        to="/admin/dashboard" 
                        style={styles.menuItem}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span style={styles.menuIcon}>⚙️</span>
                        Quản trị hệ thống
                      </Link>
                    </>
                  )}
                  
                  <div style={styles.menuDivider}></div>
                  
                  <button 
                    onClick={handleLogout}
                    style={{ ...styles.menuItem, ...styles.logoutMenuItem }}
                  >
                    <span style={styles.menuIcon}>🚪</span>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.authLinks}>
              <Link to="/login" style={styles.authLink}>
                🔑 Đăng nhập
              </Link>
              <Link to="/register" style={styles.authLinkPrimary}>
                📝 Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Overlay để đóng menu khi click bên ngoài */}
      {showUserMenu && (
        <div 
          style={styles.overlay} 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </nav>
  );
};

const styles = {
  navbar: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1rem 0',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 2rem',
  },
  brand: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: 'white',
    textDecoration: 'none',
    transition: 'transform 0.3s ease',
  },
  navCenter: {
    display: 'flex',
    gap: '2rem',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: '600',
    padding: '0.75rem 1.5rem',
    borderRadius: '25px',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
  cartBadge: {
    background: 'red',
    color: 'white',
    borderRadius: '50%',
    padding: '0.2rem 0.5rem',
    fontSize: '0.8rem',
    marginLeft: '0.5rem',
  },
  navRight: {
    position: 'relative',
  },
  userSection: {
    position: 'relative',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 1rem',
    background: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, #10b981, #059669)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
  },
  userName: {
    color: 'white',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  dropdownArrow: {
    color: 'white',
    fontSize: '0.8rem',
    transition: 'transform 0.3s ease',
  },
  userMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.5rem',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    minWidth: '280px',
    overflow: 'hidden',
    animation: 'fadeInDown 0.3s ease',
    border: '1px solid rgba(0, 0, 0, 0.08)',
  },
  menuHeader: {
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  menuAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.3rem',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
  },
  menuUserInfo: {
    flex: 1,
  },
  menuUserName: {
    fontWeight: '700',
    color: '#1f2937',
    fontSize: '1.1rem',
    marginBottom: '0.25rem',
  },
  menuUserEmail: {
    color: '#6b7280',
    fontSize: '0.9rem',
    marginBottom: '0.25rem',
  },
  menuUserRole: {
    fontSize: '0.8rem',
    color: '#667eea',
    fontWeight: '600',
    padding: '0.25rem 0.5rem',
    background: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '12px',
    display: 'inline-block',
  },
  menuDivider: {
    height: '1px',
    background: 'rgba(0, 0, 0, 0.08)',
    margin: '0.5rem 0',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    color: '#374151',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    width: '100%',
    textAlign: 'left',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  menuIcon: {
    fontSize: '1.1rem',
    width: '20px',
    textAlign: 'center',
  },
  logoutMenuItem: {
    color: '#dc2626',
    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
    marginTop: '0.5rem',
  },
  authLinks: {
    display: 'flex',
    gap: '1rem',
  },
  authLink: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: '600',
    padding: '0.75rem 1.5rem',
    borderRadius: '25px',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
  authLinkPrimary: {
    background: 'linear-gradient(45deg, #10b981, #059669)',
    color: 'white',
    textDecoration: 'none',
    fontWeight: '600',
    padding: '0.75rem 1.5rem',
    borderRadius: '25px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
};

export default Navbar;