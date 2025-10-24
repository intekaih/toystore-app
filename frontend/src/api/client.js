/**
 * API Client
 * Centralized Axios instance with interceptors
 */

import axios from 'axios';
import config from '../config'; // ✅ Import config
import { getToken, removeToken } from '../utils/storage';

/**
 * API Client
 * Centralized Axios instance with interceptors
 */

// Tạo axios instance
const apiClient = axios.create({
  baseURL: config.api.baseURL, // ✅ Dùng config.api.baseURL thay vì API_BASE_URL
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Thêm token vào headers
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ LOG REQUEST ĐỂ DEBUG
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,  // ← Kiểm tra data gửi đi
      headers: config.headers
    });

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý response và errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });

    // Xử lý lỗi 401 Unauthorized
    if (error.response?.status === 401) {
      removeToken();
      
      // Chỉ redirect nếu không phải trang login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
