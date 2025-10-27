// src/api/orderApi.js
import axios from 'axios';
import authService from '../services/authService';

const API_URL = 'http://localhost:5000/api';

// Tạo axios instance với interceptor để thêm token
const orderApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào mỗi request
orderApi.interceptors.request.use(
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
 * Tạo đơn hàng từ giỏ hàng
 * @param {Object} orderData - Dữ liệu đơn hàng (địa chỉ, phương thức thanh toán, ghi chú)
 * @returns {Promise} Response từ API
 */
export const createOrder = async (orderData) => {
  try {
    console.log('📦 Tạo đơn hàng:', orderData);
    
    const response = await orderApi.post('/orders/create', orderData);

    console.log('✅ Tạo đơn hàng thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi tạo đơn hàng:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.message || 'Dữ liệu đơn hàng không hợp lệ');
        case 401:
          throw new Error('Vui lòng đăng nhập để đặt hàng');
        case 403:
          throw new Error('Bạn không có quyền thực hiện thao tác này');
        case 404:
          throw new Error(data.message || 'Không tìm thấy giỏ hàng');
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
 * Lấy danh sách đơn hàng của user
 * @returns {Promise} Danh sách đơn hàng
 */
export const getMyOrders = async () => {
  try {
    console.log('📜 Lấy danh sách đơn hàng...');
    
    const response = await orderApi.get('/orders/my-orders');
    
    console.log('✅ Lấy danh sách đơn hàng thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách đơn hàng:', error);
    
    if (error.response) {
      throw new Error(error.response.data.message || 'Lỗi lấy danh sách đơn hàng');
    }
    throw new Error('Không thể kết nối đến máy chủ');
  }
};

/**
 * Lấy lịch sử đơn hàng với phân trang
 * @param {number} page - Số trang
 * @param {number} limit - Số đơn hàng mỗi trang
 * @param {string} trangThai - Lọc theo trạng thái (optional)
 * @returns {Promise} Lịch sử đơn hàng
 */
export const getOrderHistory = async (page = 1, limit = 10, trangThai = null) => {
  try {
    console.log(`📜 Lấy lịch sử đơn hàng - Trang ${page}, Limit ${limit}`);
    
    const params = { page, limit };
    if (trangThai) {
      params.trangThai = trangThai;
    }
    
    const response = await orderApi.get('/orders/history', { params });
    
    console.log('✅ Lấy lịch sử đơn hàng thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi lấy lịch sử đơn hàng:', error);
    
    if (error.response) {
      throw new Error(error.response.data.message || 'Lỗi lấy lịch sử đơn hàng');
    }
    throw new Error('Không thể kết nối đến máy chủ');
  }
};

/**
 * Lấy chi tiết đơn hàng
 * @param {number} orderId - ID đơn hàng
 * @returns {Promise} Chi tiết đơn hàng
 */
export const getOrderDetail = async (orderId) => {
  try {
    console.log(`📄 Lấy chi tiết đơn hàng ID: ${orderId}`);
    
    const response = await orderApi.get(`/orders/${orderId}`);
    
    console.log('✅ Lấy chi tiết đơn hàng thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi lấy chi tiết đơn hàng:', error);
    
    if (error.response) {
      throw new Error(error.response.data.message || 'Lỗi lấy chi tiết đơn hàng');
    }
    throw new Error('Không thể kết nối đến máy chủ');
  }
};

/**
 * Hủy đơn hàng
 * @param {number} orderId - ID đơn hàng
 * @returns {Promise} Kết quả hủy đơn
 */
export const cancelOrder = async (orderId) => {
  try {
    console.log(`🚫 Hủy đơn hàng ID: ${orderId}`);
    
    const response = await orderApi.post(`/orders/${orderId}/cancel`);
    
    console.log('✅ Hủy đơn hàng thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi hủy đơn hàng:', error);
    
    if (error.response) {
      throw new Error(error.response.data.message || 'Lỗi hủy đơn hàng');
    }
    throw new Error('Không thể kết nối đến máy chủ');
  }
};

export default orderApi;
