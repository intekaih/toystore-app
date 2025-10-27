// src/api/cartApi.js
import axios from 'axios';
import authService from '../services/authService';

const API_URL = 'http://localhost:5000/api';

// Tạo axios instance với interceptor để thêm token
const cartApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào mỗi request
cartApi.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {number} sanPhamId - ID sản phẩm
 * @param {number} soLuong - Số lượng (mặc định 1)
 * @returns {Promise} Response từ API
 */
export const addToCart = async (sanPhamId, soLuong = 1) => {
  try {
    console.log(`🛒 Thêm sản phẩm vào giỏ hàng - ID: ${sanPhamId}, SL: ${soLuong}`);
    
    const response = await cartApi.post('/cart/add', {
      sanPhamId,
      soLuong,
    });

    console.log('✅ Thêm vào giỏ hàng thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi thêm vào giỏ hàng:', error);
    
    // Xử lý lỗi chi tiết
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.message || 'Dữ liệu không hợp lệ');
        case 401:
          throw new Error('Vui lòng đăng nhập để sử dụng giỏ hàng');
        case 404:
          throw new Error(data.message || 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh');
        case 500:
          throw new Error('Lỗi máy chủ, vui lòng thử lại sau');
        default:
          throw new Error(data.message || `Lỗi ${status}`);
      }
    } else if (error.request) {
      throw new Error('Không thể kết nối đến máy chủ');
    } else {
      throw new Error(error.message || 'Có lỗi xảy ra');
    }
  }
};

/**
 * Lấy thông tin giỏ hàng
 * @returns {Promise} Danh sách sản phẩm trong giỏ
 */
export const getCart = async () => {
  try {
    console.log('📦 Lấy thông tin giỏ hàng...');
    
    const response = await cartApi.get('/cart');
    
    console.log('✅ Lấy giỏ hàng thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi lấy giỏ hàng:', error);
    
    if (error.response) {
      throw new Error(error.response.data.message || 'Lỗi lấy giỏ hàng');
    }
    throw new Error('Không thể kết nối đến máy chủ');
  }
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ
 * @param {number} sanPhamId - ID sản phẩm
 * @param {number} soLuong - Số lượng mới
 * @returns {Promise} Sản phẩm đã cập nhật
 */
export const updateCartItem = async (sanPhamId, soLuong) => {
  try {
    console.log(`🔄 Cập nhật số lượng - ID: ${sanPhamId}, SL: ${soLuong}`);
    
    const response = await cartApi.put('/cart/update', {
      sanPhamId,
      soLuong,
    });

    console.log('✅ Cập nhật giỏ hàng thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi cập nhật giỏ hàng:', error);
    
    if (error.response) {
      throw new Error(error.response.data.message || 'Lỗi cập nhật giỏ hàng');
    }
    throw new Error('Không thể kết nối đến máy chủ');
  }
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 * @param {number} productId - ID sản phẩm
 * @returns {Promise} Kết quả xóa
 */
export const removeFromCart = async (productId) => {
  try {
    console.log(`🗑️ Xóa sản phẩm khỏi giỏ - ID: ${productId}`);
    
    const response = await cartApi.delete(`/cart/remove/${productId}`);

    console.log('✅ Xóa khỏi giỏ hàng thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi xóa khỏi giỏ hàng:', error);
    
    if (error.response) {
      throw new Error(error.response.data.message || 'Lỗi xóa sản phẩm');
    }
    throw new Error('Không thể kết nối đến máy chủ');
  }
};

/**
 * Xóa toàn bộ giỏ hàng
 * @returns {Promise} Kết quả xóa
 */
export const clearCart = async () => {
  try {
    console.log('🗑️ Xóa toàn bộ giỏ hàng...');
    
    const response = await cartApi.delete('/cart/clear');

    console.log('✅ Xóa giỏ hàng thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi xóa giỏ hàng:', error);
    
    if (error.response) {
      throw new Error(error.response.data.message || 'Lỗi xóa giỏ hàng');
    }
    throw new Error('Không thể kết nối đến máy chủ');
  }
};
