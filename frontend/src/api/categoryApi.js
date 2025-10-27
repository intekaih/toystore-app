// src/api/categoryApi.js
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
 * Lấy danh sách tất cả danh mục (Admin only)
 */
export const getAllCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/categories`, createAuthRequest());
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Tạo danh mục mới (Admin only)
 */
export const createCategory = async (categoryData) => {
  try {
    const response = await axios.post(`${API_URL}/admin/categories`, categoryData, createAuthRequest());
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Cập nhật danh mục (Admin only)
 */
export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await axios.put(`${API_URL}/admin/categories/${categoryId}`, categoryData, createAuthRequest());
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Xóa danh mục (Admin only)
 */
export const deleteCategory = async (categoryId) => {
  try {
    const response = await axios.delete(`${API_URL}/admin/categories/${categoryId}`, createAuthRequest());
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};
