/**
 * API Client
 * Centralized Axios instance with interceptors
 */

import axios from 'axios';
import config from '../config';
import { getToken, clearAuth } from '../utils/storage';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';

// Tạo axios instance
const apiClient = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Tự động thêm token vào header
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request trong development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔵 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Xử lý response và errors thống nhất
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log response trong development
    if (process.env.NODE_ENV === 'development') {
      console.log('🟢 API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    
    return response;
  },
  (error) => {
    // Log error
    console.error('🔴 API Error:', error);
    
    // Xử lý các trường hợp error
    if (error.response) {
      const { status, data, config } = error.response;
      
      // Token hết hạn hoặc không hợp lệ
      if (status === HTTP_STATUS.UNAUTHORIZED) {
        // CHỈ clear auth nếu KHÔNG PHẢI đang login/register
        const isAuthEndpoint = config.url?.includes('/auth/login') || 
                              config.url?.includes('/auth/register');
        
        if (!isAuthEndpoint) {
          // Đây là request có token nhưng token hết hạn
          clearAuth();
          
          // Chuyển hướng về trang login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          
          throw new Error(ERROR_MESSAGES.SESSION_EXPIRED);
        }
        
        // Nếu là login/register thì trả về message từ backend
        throw new Error(data.message || ERROR_MESSAGES.INVALID_CREDENTIALS);
      }
      
      // Xử lý các status codes khác
      switch (status) {
        case HTTP_STATUS.BAD_REQUEST:
          throw new Error(data.message || ERROR_MESSAGES.INVALID_DATA);
        
        case HTTP_STATUS.FORBIDDEN:
          throw new Error(data.message || ERROR_MESSAGES.UNAUTHORIZED);
        
        case HTTP_STATUS.NOT_FOUND:
          throw new Error(data.message || ERROR_MESSAGES.ACCOUNT_NOT_FOUND);
        
        case HTTP_STATUS.CONFLICT:
          throw new Error(data.message || ERROR_MESSAGES.USER_EXISTS);
        
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          throw new Error(ERROR_MESSAGES.SERVER_ERROR);
        
        default:
          throw new Error(data.message || ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    } else {
      // Lỗi khi setup request
      throw new Error(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }
);

export default apiClient;
