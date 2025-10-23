import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authApi from '../api/auth.api';
import { getUser, getToken, clearAuth, isAuthenticated } from '../utils/storage';
import { SUCCESS_MESSAGES } from '../utils/constants';

export const AuthContext = createContext();

// Export useAuth hook để các file cũ có thể import
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khởi tạo auth state từ localStorage
  useEffect(() => {
    try {
      if (isAuthenticated()) {
        const userData = getUser();
        setUser(userData);
        console.log('👤 User đã đăng nhập:', userData);
      }
    } catch (error) {
      console.error('❌ Lỗi load auth state:', error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Đăng nhập
   */
  const login = async (credentials) => {
    try {
      const { token, user: userData } = await authApi.login(credentials);
      setUser(userData);
      console.log('✅', SUCCESS_MESSAGES.LOGIN_SUCCESS);
      return { token, user: userData };
    } catch (error) {
      console.error('❌ Lỗi đăng nhập:', error);
      throw error;
    }
  };

  /**
   * Đăng ký
   */
  const register = async (userData) => {
    try {
      const result = await authApi.register(userData);
      console.log('✅', SUCCESS_MESSAGES.REGISTER_SUCCESS);
      return result;
    } catch (error) {
      console.error('❌ Lỗi đăng ký:', error);
      throw error;
    }
  };

  /**
   * Đăng xuất
   */
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('❌ Lỗi đăng xuất:', error);
    } finally {
      clearAuth();
      setUser(null);
      console.log('✅', SUCCESS_MESSAGES.LOGOUT_SUCCESS);
    }
  };

  /**
   * Cập nhật thông tin user trong context
   */
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  /**
   * Kiểm tra user có phải admin không
   */
  const isAdmin = () => {
    return user && user.vaiTro === 'admin';
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    isLoggedIn: () => isAuthenticated(),
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};