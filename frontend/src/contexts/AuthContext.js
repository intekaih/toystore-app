import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Format user data để đảm bảo tương thích giữa PascalCase (backend) và camelCase (frontend)
 * @param {Object} userData - Dữ liệu user từ backend hoặc localStorage
 * @returns {Object} Formatted user data với camelCase
 */
const formatUserData = (userData) => {
  if (!userData) return null;
  
  return {
    id: userData.ID || userData.id,
    tenDangNhap: userData.TenDangNhap || userData.tenDangNhap,
    hoTen: userData.HoTen || userData.hoTen,
    email: userData.Email || userData.email,
    dienThoai: userData.DienThoai || userData.dienThoai,
    vaiTro: userData.VaiTro || userData.vaiTro || userData.role,
    ngayTao: userData.NgayTao || userData.ngayTao,
    enable: userData.Enable !== undefined ? userData.Enable : userData.enable,
    // Giữ lại các trường gốc để tương thích ngược
    ...userData
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Load user data từ database thay vì localStorage
   */
  const loadUserFromDatabase = async () => {
    try {
      if (!authService.isLoggedIn()) {
        setUser(null);
        return;
      }

      // Gọi API để lấy thông tin user mới nhất từ database
      const profileResponse = await userService.getProfile();
      const userData = profileResponse.data.user;
      
      const formattedUser = formatUserData(userData);
      setUser(formattedUser);
      
      // Cập nhật localStorage để đồng bộ
      authService.saveUserInfo(userData);
      
      console.log('👤 User đã load từ database:', formattedUser);
    } catch (error) {
      console.error('❌ Lỗi load user từ database:', error);
      
      // Nếu lỗi 401 (token hết hạn), logout
      if (error.message.includes('đăng nhập') || error.message.includes('hết hạn')) {
        authService.logout();
        setUser(null);
      } else {
        // Fallback về localStorage nếu không kết nối được database
        try {
          const localUserData = authService.getUser();
          const formattedUser = formatUserData(localUserData);
          setUser(formattedUser);
          console.log('⚠️ Fallback to localStorage:', formattedUser);
        } catch (localError) {
          console.error('❌ Lỗi load từ localStorage:', localError);
          authService.logout();
          setUser(null);
        }
      }
    }
  };

  useEffect(() => {
    // Load user từ database khi app khởi động
    const initAuth = async () => {
      try {
        await loadUserFromDatabase();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (loginData) => {
    try {
      const result = await authService.login(loginData);
      const formattedUser = formatUserData(result.user);
      setUser(formattedUser);
      return { ...result, user: formattedUser };
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (userData) => {
    const formattedUser = formatUserData(userData);
    setUser(formattedUser);
    authService.saveUserInfo(userData); // Lưu dữ liệu gốc từ backend
  };

  /**
   * Refresh user data từ database
   */
  const refreshUser = async () => {
    await loadUserFromDatabase();
  };

  const value = {
    user,
    setUser: updateUser,
    login,
    logout,
    refreshUser, // Thêm hàm refresh để component có thể gọi khi cần
    loading,
    isLoggedIn: () => authService.isLoggedIn(),
    isAdmin: () => authService.isAdmin(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};