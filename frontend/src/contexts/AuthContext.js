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
  
  console.log('🔄 Formatting user data:', userData);
  
  // ✅ Backend luôn trả về enable (camelCase), không cần fallback Enable nữa
  const enableValue = userData.enable !== undefined ? userData.enable : true;
  
  const formatted = {
    id: userData.ID || userData.id,
    tenDangNhap: userData.TenDangNhap || userData.tenDangNhap,
    hoTen: userData.HoTen || userData.hoTen,
    email: userData.Email || userData.email,
    dienThoai: userData.DienThoai || userData.dienThoai,
    vaiTro: userData.VaiTro || userData.vaiTro || userData.role,
    ngayTao: userData.NgayTao || userData.ngayTao,
    enable: enableValue
  };
  
  console.log('✅ Formatted user data:', formatted);
  
  return formatted;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load user data từ database thay vì localStorage
   */
  const loadUserFromDatabase = async () => {
    try {
      setError(null);
      
      if (!authService.isLoggedIn()) {
        console.log('⚠️ User chưa đăng nhập');
        setUser(null);
        return;
      }

      console.log('🔄 Đang load user từ database...');

      // Gọi API để lấy thông tin user mới nhất từ database
      const profileResponse = await userService.getProfile();
      const userData = profileResponse.data.user;
      
      const formattedUser = formatUserData(userData);
      setUser(formattedUser);
      
      // Cập nhật localStorage để đồng bộ
      authService.saveUserInfo(userData);
      
      console.log('✅ User đã load từ database:', formattedUser);
    } catch (error) {
      console.error('❌ Lỗi load user từ database:', error);
      setError(error);
      
      // Nếu lỗi 401 (token hết hạn), logout
      if (error.message.includes('đăng nhập') || error.message.includes('hết hạn')) {
        console.log('⚠️ Token hết hạn, đang logout...');
        authService.logout();
        setUser(null);
      } else {
        // Fallback về localStorage nếu không kết nối được database
        try {
          const localUserData = authService.getUser();
          if (localUserData) {
            const formattedUser = formatUserData(localUserData);
            setUser(formattedUser);
            console.log('⚠️ Fallback to localStorage:', formattedUser);
          } else {
            console.log('⚠️ Không có dữ liệu trong localStorage');
            authService.logout();
            setUser(null);
          }
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
      } catch (error) {
        console.error('❌ Lỗi khởi tạo auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (loginData) => {
    try {
      setError(null);
      const result = await authService.login(loginData);
      const formattedUser = formatUserData(result.user);
      setUser(formattedUser);
      console.log('✅ Đăng nhập thành công, user:', formattedUser);
      
      // Tự động refresh user từ database để đảm bảo dữ liệu mới nhất
      try {
        console.log('🔄 Đang refresh user data từ database sau khi đăng nhập...');
        await loadUserFromDatabase();
        console.log('✅ Đã refresh user data từ database');
      } catch (refreshError) {
        console.warn('⚠️ Không thể refresh user từ database, sử dụng dữ liệu từ login response:', refreshError);
        // Vẫn giữ user từ login response nếu refresh thất bại
      }
      
      return { ...result, user: formattedUser };
    } catch (error) {
      console.error('❌ Lỗi đăng nhập trong context:', error);
      setError(error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
    console.log('👋 Đã đăng xuất');
  };

  const updateUser = (userData) => {
    const formattedUser = formatUserData(userData);
    setUser(formattedUser);
    authService.saveUserInfo(userData); // Lưu dữ liệu gốc từ backend
    console.log('✅ Đã cập nhật user:', formattedUser);
  };

  /**
   * Refresh user data từ database
   */
  const refreshUser = async () => {
    console.log('🔄 Đang refresh user data...');
    await loadUserFromDatabase();
  };

  const value = {
    user,
    setUser: updateUser,
    updateUser, // Alias để tương thích với code cũ
    login,
    logout,
    refreshUser, // Thêm hàm refresh để component có thể gọi khi cần
    loading,
    error,
    isLoggedIn: () => authService.isLoggedIn(),
    isAdmin: () => authService.isAdmin(),
    isStaff: () => authService.isStaff(),
    isAdminOrStaff: () => authService.isAdminOrStaff(),
    getUserRole: () => authService.getUserRole(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};