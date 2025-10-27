// src/api/userApi.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Lấy token từ localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Tạo axios instance với token
const createAuthRequest = () => {
  const token = getAuthToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

/**
 * Lấy danh sách tất cả người dùng (Admin only)
 */
export const getAllUsers = async (params = {}) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = params;
    
    const response = await axios.get(`${API_URL}/admin/users`, {
      ...createAuthRequest(),
      params: {
        page,
        limit,
        search,
        role,
        status
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết người dùng theo ID (Admin only)
 */
export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/admin/users/${userId}`, createAuthRequest());
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

/**
 * Tạo người dùng mới (Admin only)
 */
export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/admin/users`, userData, createAuthRequest());
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Cập nhật thông tin người dùng (Admin only)
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`${API_URL}/admin/users/${userId}`, userData, createAuthRequest());
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Khóa/Mở khóa tài khoản (Admin only)
 */
export const updateUserStatus = async (userId, enable) => {
  try {
    const response = await axios.patch(
      `${API_URL}/admin/users/${userId}/status`,
      { enable },
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

/**
 * Xóa tài khoản vĩnh viễn (Admin only)
 */
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/admin/users/${userId}`, createAuthRequest());
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
