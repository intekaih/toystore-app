import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

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

  useEffect(() => {
    // Kiểm tra token trong localStorage khi app khởi động
    try {
      if (authService.isLoggedIn()) {
        const userData = authService.getUser();
        setUser(userData);
        console.log('👤 User đã đăng nhập:', userData);
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      authService.logout(); // Clear invalid data
    }
    
    setLoading(false);
  }, []);

  const login = async (loginData) => {
    try {
      const result = await authService.login(loginData);
      setUser(result.user);
      return result;
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    setUser, // Thêm setUser để admin login có thể dùng
    login,
    logout,
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