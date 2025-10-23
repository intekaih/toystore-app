/**
 * User API
 * User profile related API calls
 */

import apiClient from './client';
import config from '../config';
import { setUser } from '../utils/storage';

/**
 * Lấy thông tin profile của user hiện tại
 * @returns {Promise<Object>} - User profile data
 */
export const getProfile = async () => {
  const response = await apiClient.get(config.api.endpoints.user.profile);
  
  if (response.data.success) {
    return response.data.data.user;
  }
  
  throw new Error(response.data.message || 'Không thể tải thông tin profile');
};

/**
 * Cập nhật thông tin profile
 * @param {Object} profileData - Dữ liệu cần cập nhật
 * @param {string} [profileData.HoTen] - Họ tên mới
 * @param {string} [profileData.Email] - Email mới
 * @param {string} [profileData.DienThoai] - Số điện thoại mới
 * @returns {Promise<Object>} - Updated user data
 */
export const updateProfile = async (profileData) => {
  const response = await apiClient.put(config.api.endpoints.user.updateProfile, profileData);
  
  if (response.data.success) {
    const updatedUser = response.data.data.user;
    
    // Cập nhật user trong localStorage
    setUser(updatedUser);
    
    return updatedUser;
  }
  
  throw new Error(response.data.message || 'Cập nhật profile thất bại');
};

/**
 * Đổi mật khẩu
 * @param {Object} passwordData - Dữ liệu đổi mật khẩu
 * @param {string} passwordData.MatKhauCu - Mật khẩu cũ
 * @param {string} passwordData.MatKhauMoi - Mật khẩu mới
 * @returns {Promise<Object>} - Response data
 */
export const changePassword = async (passwordData) => {
  const response = await apiClient.put('/users/change-password', passwordData);
  
  if (response.data.success) {
    return response.data;
  }
  
  throw new Error(response.data.message || 'Đổi mật khẩu thất bại');
};

// Named export object
const userApi = {
  getProfile,
  updateProfile,
  changePassword,
};

export default userApi;
