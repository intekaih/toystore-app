// src/api/orderApi.js
import axios from 'axios';
import authService from '../services/authService';
import config from '../config';

const API_URL = config.API_URL;

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
 * Tạo đơn hàng cho khách vãng lai (không cần đăng nhập)
 * @param {Object} orderData - Dữ liệu đơn hàng (thông tin khách hàng, giỏ hàng, địa chỉ)
 * @returns {Promise} Response từ API
 */
export const createGuestOrder = async (orderData) => {
  try {
    console.log('📦 Tạo đơn hàng cho khách vãng lai:', orderData);
    
    // Không cần token cho guest checkout
    const response = await axios.post(`${API_URL}/orders/guest/create`, orderData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });

    console.log('✅ Tạo đơn hàng cho khách vãng lai thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi tạo đơn hàng cho khách vãng lai:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.message || 'Dữ liệu đơn hàng không hợp lệ');
        case 404:
          throw new Error(data.message || 'Không tìm thấy sản phẩm');
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
 * Lấy chi tiết đơn hàng công khai bằng orderCode (không cần đăng nhập)
 * @param {string} orderCode - Mã đơn hàng (VD: HD20241112001)
 * @returns {Promise} Chi tiết đơn hàng
 */
export const getPublicOrderDetail = async (orderCode) => {
  try {
    console.log(`📄 Lấy đơn hàng công khai - Mã: ${orderCode}`);
    
    // Không cần token cho public order
    const response = await axios.get(`${API_URL}/orders/public/${orderCode}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });
    
    console.log('✅ Lấy đơn hàng công khai thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi lấy đơn hàng công khai:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 404:
          throw new Error('Không tìm thấy đơn hàng với mã này');
        case 403:
          throw new Error('Đơn hàng này yêu cầu đăng nhập để xem');
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
 * Tra cứu đơn hàng cho khách vãng lai
 * @param {Object} lookupData - { orderCode, email?, phoneNumber? }
 * @returns {Promise} Kết quả tra cứu
 */
export const guestOrderLookup = async (lookupData) => {
  try {
    console.log('🔍 Tra cứu đơn hàng guest:', lookupData);
    
    // Không cần token cho guest lookup
    const response = await axios.post(`${API_URL}/orders/guest/lookup`, lookupData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });
    
    console.log('✅ Tra cứu đơn hàng thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi tra cứu đơn hàng:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error('Vui lòng nhập đầy đủ thông tin');
        case 403:
          throw new Error('Thông tin không khớp với đơn hàng');
        case 404:
          throw new Error('Không tìm thấy đơn hàng');
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
 * Lấy danh sách đơn hàng theo email hoặc số điện thoại (cho guest)
 * @param {Object} contactData - { email?, phoneNumber? }
 * @returns {Promise} Danh sách đơn hàng
 */
export const getOrdersByContact = async (contactData) => {
  try {
    console.log('📞 Lấy đơn hàng theo contact:', contactData);
    
    // Không cần token cho guest lookup
    const response = await axios.post(`${API_URL}/orders/guest/search`, contactData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });
    
    console.log('✅ Lấy danh sách đơn hàng thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách đơn hàng:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error('Vui lòng nhập email hoặc số điện thoại');
        case 404:
          throw new Error('Không tìm thấy đơn hàng nào');
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
