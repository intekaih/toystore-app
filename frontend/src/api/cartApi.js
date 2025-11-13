// src/api/cartApi.js
import axios from 'axios';
import authService from '../services/authService';
import config from '../config';

const API_URL = config.API_URL;

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
 * Tạo hoặc lấy Session ID cho guest user
 * @returns {string} UUID session ID
 */
const getOrCreateSessionId = () => {
  const SESSION_KEY = 'guest_session_id';
  let sessionId = localStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    // Tạo UUID v4
    sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    
    localStorage.setItem(SESSION_KEY, sessionId);
    console.log('🆔 Tạo Session ID mới:', sessionId);
  }
  
  return sessionId;
};

/**
 * Thêm sản phẩm vào giỏ hàng
 * Tự động xác định user đã đăng nhập hay guest
 * @param {number} sanPhamId - ID sản phẩm
 * @param {number} soLuong - Số lượng (mặc định 1)
 * @returns {Promise} Response từ API
 */
export const addToCart = async (sanPhamId, soLuong = 1) => {
  try {
    const token = authService.getToken();
    const isAuthenticated = !!token;
    
    console.log(`🛒 Thêm sản phẩm vào giỏ hàng - ID: ${sanPhamId}, SL: ${soLuong}, Authenticated: ${isAuthenticated}`);
    
    let response;
    
    if (isAuthenticated) {
      // ✅ User đã đăng nhập → dùng endpoint authenticated
      response = await cartApi.post('/cart/add', {
        sanPhamId,
        soLuong
      });
    } else {
      // ✅ Guest user → dùng endpoint guest
      const sessionId = getOrCreateSessionId();
      response = await cartApi.post('/cart/guest/add', {
        sessionId,
        sanPhamId,
        soLuong
      });
    }

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
          throw new Error('Phiên đăng nhập đã hết hạn');
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
 * Tự động xác định user đã đăng nhập hay guest
 * @returns {Promise} Danh sách sản phẩm trong giỏ
 */
export const getCart = async () => {
  try {
    const token = authService.getToken();
    const isAuthenticated = !!token;
    
    console.log('📦 Lấy thông tin giỏ hàng từ server...', isAuthenticated ? '(Authenticated)' : '(Guest)');
    
    let response;
    
    if (isAuthenticated) {
      // User đã đăng nhập
      response = await cartApi.get('/cart');
    } else {
      // Guest user
      const sessionId = getOrCreateSessionId();
      response = await cartApi.get('/cart/guest', { 
        params: { sessionId } 
      });
    }
    
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
 * Lấy số lượng sản phẩm trong giỏ hàng
 * @returns {Promise<number>} Tổng số lượng sản phẩm
 */
export const getCartCount = async () => {
  try {
    const cartData = await getCart();
    return cartData.data?.totalItems || 0;
  } catch (error) {
    console.error('❌ Lỗi lấy số lượng giỏ hàng:', error);
    return 0;
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
    const token = authService.getToken();
    const isAuthenticated = !!token;
    
    console.log(`🔄 Cập nhật số lượng - ID: ${sanPhamId}, SL: ${soLuong}`);
    
    let response;
    
    if (isAuthenticated) {
      response = await cartApi.put('/cart/update', {
        sanPhamId,
        soLuong
      });
    } else {
      const sessionId = getOrCreateSessionId();
      response = await cartApi.put('/cart/guest/update', {
        sessionId,
        sanPhamId,
        soLuong
      });
    }

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
 * Tăng 1 đơn vị sản phẩm
 * @param {number} productId - ID sản phẩm
 * @returns {Promise} Kết quả
 */
export const incrementCartItem = async (productId) => {
  try {
    const token = authService.getToken();
    const isAuthenticated = !!token;
    
    console.log(`➕ Tăng số lượng sản phẩm - ID: ${productId}`);
    
    let response;
    
    if (isAuthenticated) {
      response = await cartApi.patch(`/cart/increment/${productId}`);
    } else {
      const sessionId = getOrCreateSessionId();
      response = await cartApi.patch(`/cart/guest/increment/${productId}`, null, {
        params: { sessionId }
      });
    }

    console.log('✅ Tăng số lượng thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi tăng số lượng:', error);
    
    if (error.response) {
      throw new Error(error.response.data.message || 'Lỗi tăng số lượng');
    }
    throw new Error('Không thể kết nối đến máy chủ');
  }
};

/**
 * Giảm 1 đơn vị sản phẩm
 * @param {number} productId - ID sản phẩm
 * @returns {Promise} Kết quả
 */
export const decrementCartItem = async (productId) => {
  try {
    const token = authService.getToken();
    const isAuthenticated = !!token;
    
    console.log(`➖ Giảm số lượng sản phẩm - ID: ${productId}`);
    
    let response;
    
    if (isAuthenticated) {
      response = await cartApi.patch(`/cart/decrement/${productId}`);
    } else {
      const sessionId = getOrCreateSessionId();
      response = await cartApi.patch(`/cart/guest/decrement/${productId}`, null, {
        params: { sessionId }
      });
    }

    console.log('✅ Giảm số lượng thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi giảm số lượng:', error);
    
    if (error.response) {
      throw new Error(error.response.data.message || 'Lỗi giảm số lượng');
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
    const token = authService.getToken();
    const isAuthenticated = !!token;
    
    console.log(`🗑️ Xóa sản phẩm khỏi giỏ - ID: ${productId}`);
    
    let response;
    
    if (isAuthenticated) {
      response = await cartApi.delete(`/cart/remove/${productId}`);
    } else {
      const sessionId = getOrCreateSessionId();
      response = await cartApi.delete(`/cart/guest/remove/${productId}`, {
        params: { sessionId }
      });
    }

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
    const token = authService.getToken();
    const isAuthenticated = !!token;
    
    console.log('🗑️ Xóa toàn bộ giỏ hàng...');
    
    let response;
    
    if (isAuthenticated) {
      response = await cartApi.delete('/cart/clear');
    } else {
      const sessionId = getOrCreateSessionId();
      response = await cartApi.delete('/cart/guest/clear', {
        params: { sessionId }
      });
    }

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

/**
 * Khôi phục giỏ hàng guest sau khi thanh toán thất bại
 * @param {string} sessionId - Session ID của guest user
 * @param {Array} cartItems - Danh sách sản phẩm cần khôi phục
 * @returns {Promise} Kết quả khôi phục
 */
export const restoreGuestCart = async (sessionId, cartItems) => {
  try {
    console.log('🔄 Khôi phục giỏ hàng guest - Session:', sessionId);
    console.log('📦 Số lượng sản phẩm:', cartItems?.length);

    const response = await cartApi.post('/cart/guest/restore', {
      sessionId,
      cartItems
    });

    console.log('✅ Khôi phục giỏ hàng thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khôi phục giỏ hàng:', error);
    
    if (error.response) {
      throw new Error(error.response.data.message || 'Lỗi khôi phục giỏ hàng');
    }
    throw new Error('Không thể kết nối đến máy chủ');
  }
};

// Export thêm helper function
export { getOrCreateSessionId };
