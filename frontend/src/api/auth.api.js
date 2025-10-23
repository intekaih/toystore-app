/**
 * Auth API
 * Authentication related API calls
 */

import apiClient from './client';
import config from '../config';
import { setToken, setUser } from '../utils/storage';

/**
 * Đăng nhập
 * @param {Object} credentials - Thông tin đăng nhập
 * @param {string} credentials.TenDangNhap - Tên đăng nhập
 * @param {string} credentials.MatKhau - Mật khẩu
 * @returns {Promise<Object>} - { token, user }
 */
export const login = async (credentials) => {
  const response = await apiClient.post(config.api.endpoints.auth.login, credentials);
  
  console.log('🔐 Login response:', response.data);
  
  if (response.data && response.data.success) {
    // Backend trả về: { success: true, data: { token, user } }
    const { token, user } = response.data.data;
    
    // Lưu vào localStorage
    setToken(token);
    setUser(user);
    
    return { token, user };
  }
  
  throw new Error(response.data.message || 'Đăng nhập thất bại');
};

/**
 * Đăng ký tài khoản mới
 * @param {Object} userData - Thông tin đăng ký
 * @returns {Promise<Object>} - User data
 */
export const register = async (userData) => {
  const response = await apiClient.post(config.api.endpoints.auth.register, userData);
  
  console.log('📝 Register response:', response.data);
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Đăng ký thất bại');
};

/**
 * Đăng xuất
 * @returns {Promise<void>}
 */
export const logout = async () => {
  // Backend có thể không có logout endpoint, 
  // nhưng vẫn gọi để consistency
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    // Không cần throw error nếu logout API không tồn tại
    console.log('⚠️ Logout API call failed (this is OK):', error.message);
  }
};

// Named exports
const authApi = {
  login,
  register,
  logout,
};

export default authApi;
