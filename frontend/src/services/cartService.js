/**
 * Cart Service
 * Xử lý giỏ hàng cho cả User (đã đăng nhập) và Guest (khách vãng lai)
 */
import axios from 'axios';
import config from '../config';
import authService from './authService';

const API_URL = config.API_URL;

// 🔍 DEBUG: In ra để kiểm tra API_URL
console.log('🔍 CartService - API_URL:', API_URL);
console.log('🔍 CartService - config:', config);

class CartService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 🔍 DEBUG: Kiểm tra baseURL của axios instance
    console.log('🔍 CartService - axios baseURL:', this.api.defaults.baseURL);

    // Thêm interceptor để tự động gửi token
    this.api.interceptors.request.use(
      (config) => {
        // 🔍 DEBUG: In ra URL đầy đủ của request
        console.log('🔍 Request URL:', config.baseURL + config.url);
        
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Thêm sessionId cho guest cart
        const sessionId = this._getSessionId();
        if (sessionId) {
          config.headers['X-Session-ID'] = sessionId;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Lấy hoặc tạo session ID cho guest cart
   * @private
   */
  _getSessionId() {
    let sessionId = sessionStorage.getItem('guestSessionId');
    if (!sessionId) {
      sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('guestSessionId', sessionId);
    }
    return sessionId;
  }

  /**
   * Kiểm tra user đã đăng nhập chưa
   * @private
   */
  _isAuthenticated() {
    return authService.isAuthenticated();
  }

  /**
   * Lấy giỏ hàng (tự động phân biệt User/Guest)
   * @returns {Promise<Object>}
   */
  async getCart() {
    try {
      let response;
      
      if (this._isAuthenticated()) {
        // ✅ User đã đăng nhập - Gọi /cart
        response = await this.api.get('/cart');
      } else {
        // ✅ Guest - Gọi /cart/guest?sessionId=xxx
        const sessionId = this._getSessionId();
        console.log('🔍 getCart - Guest sessionId:', sessionId);
        response = await this.api.get('/cart/guest', {
          params: { sessionId }
        });
      }
      
      if (response.data && response.data.success) {
        // ✅ SỬA: Backend trả về data.data = { items, totalItems, totalAmount }
        const cartData = response.data.data || {};
        const items = cartData.items || [];
        
        console.log('✅ getCart - Response:', response.data);
        console.log('✅ getCart - Items:', items);
        
        return {
          success: true,
          data: items, // <-- Trả về mảng items
          total: this._calculateTotal(items),
          totalItems: cartData.totalItems || 0,
          totalAmount: cartData.totalAmount || 0,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy giỏ hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy giỏ hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Lấy các sản phẩm đã chọn trong giỏ hàng
   * @returns {Promise<Object>}
   */
  async getSelectedItems() {
    try {
      let response;
      
      if (this._isAuthenticated()) {
        response = await this.api.get('/cart/selected');
      } else {
        // ✅ Guest - Gửi sessionId trong query parameter
        const sessionId = this._getSessionId();
        response = await this.api.get('/cart/guest/selected', {
          params: { sessionId }
        });
      }
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          total: this._calculateTotal(response.data.data || []),
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy sản phẩm đã chọn thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy sản phẩm đã chọn:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param {number} productId - ID sản phẩm
   * @param {number} quantity - Số lượng (mặc định: 1)
   * @returns {Promise<Object>}
   */
  async addToCart(productId, quantity = 1) {
    try {
      const endpoint = this._isAuthenticated() 
        ? '/cart/add' 
        : '/cart/guest/add';
      
      // ✅ SỬA: Gửi sanPhamId và soLuong thay vì productId và quantity
      const payload = this._isAuthenticated() 
        ? { sanPhamId: productId, soLuong: quantity }
        : { sessionId: this._getSessionId(), sanPhamId: productId, soLuong: quantity };
      
      const response = await this.api.post(endpoint, payload);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã thêm vào giỏ hàng'
        };
      }
      
      throw new Error(response.data.message || 'Thêm vào giỏ hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi thêm vào giỏ hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Cập nhật số lượng sản phẩm trong giỏ
   * @param {number} productId - ID sản phẩm (sanPhamId)
   * @param {number} quantity - Số lượng mới
   * @returns {Promise<Object>}
   */
  async updateQuantity(productId, quantity) {
    try {
      const endpoint = this._isAuthenticated() 
        ? '/cart/update' 
        : '/cart/guest/update';
      
      // ✅ SỬA: Gửi sanPhamId và soLuong thay vì itemId và quantity
      const payload = this._isAuthenticated()
        ? { sanPhamId: productId, soLuong: quantity }
        : { sessionId: this._getSessionId(), sanPhamId: productId, soLuong: quantity };
      
      // 🔍 DEBUG: Log payload trước khi gửi
      console.log('🔍 cartService.updateQuantity - productId:', productId);
      console.log('🔍 cartService.updateQuantity - quantity:', quantity);
      console.log('🔍 cartService.updateQuantity - payload:', payload);
      console.log('🔍 cartService.updateQuantity - payload JSON:', JSON.stringify(payload));
      
      const response = await this.api.put(endpoint, payload);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã cập nhật số lượng'
        };
      }
      
      throw new Error(response.data.message || 'Cập nhật số lượng thất bại');
    } catch (error) {
      console.error('❌ Lỗi cập nhật số lượng:', error);
      console.error('❌ Error response:', error.response?.data);
      throw this._handleError(error);
    }
  }

  /**
   * Tăng số lượng sản phẩm (+ 1)
   * @param {number} productId - ID sản phẩm
   * @returns {Promise<Object>}
   */
  async incrementQuantity(productId) {
    try {
      let response;
      
      if (this._isAuthenticated()) {
        response = await this.api.patch(`/cart/increment/${productId}`);
      } else {
        // ✅ Guest - Gửi sessionId trong query parameter
        const sessionId = this._getSessionId();
        response = await this.api.patch(`/cart/guest/increment/${productId}`, null, {
          params: { sessionId }
        });
      }
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Tăng số lượng thất bại');
    } catch (error) {
      console.error('❌ Lỗi tăng số lượng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Giảm số lượng sản phẩm (- 1)
   * @param {number} productId - ID sản phẩm
   * @returns {Promise<Object>}
   */
  async decrementQuantity(productId) {
    try {
      let response;
      
      if (this._isAuthenticated()) {
        response = await this.api.patch(`/cart/decrement/${productId}`);
      } else {
        // ✅ Guest - Gửi sessionId trong query parameter
        const sessionId = this._getSessionId();
        response = await this.api.patch(`/cart/guest/decrement/${productId}`, null, {
          params: { sessionId }
        });
      }
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Giảm số lượng thất bại');
    } catch (error) {
      console.error('❌ Lỗi giảm số lượng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   * @param {number} productId - ID sản phẩm
   * @returns {Promise<Object>}
   */
  async removeFromCart(productId) {
    try {
      let response;
      
      if (this._isAuthenticated()) {
        response = await this.api.delete(`/cart/remove/${productId}`);
      } else {
        // ✅ Guest - Gửi sessionId trong query parameter
        const sessionId = this._getSessionId();
        response = await this.api.delete(`/cart/guest/remove/${productId}`, {
          params: { sessionId }
        });
      }
      
      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Đã xóa khỏi giỏ hàng'
        };
      }
      
      throw new Error(response.data.message || 'Xóa khỏi giỏ hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi xóa khỏi giỏ hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Xóa tất cả sản phẩm trong giỏ hàng
   * @returns {Promise<Object>}
   */
  async clearCart() {
    try {
      let response;
      
      if (this._isAuthenticated()) {
        response = await this.api.delete('/cart/clear');
      } else {
        // ✅ Guest - Gửi sessionId trong query parameter
        const sessionId = this._getSessionId();
        response = await this.api.delete('/cart/guest/clear', {
          params: { sessionId }
        });
      }
      
      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Đã xóa tất cả sản phẩm'
        };
      }
      
      throw new Error(response.data.message || 'Xóa giỏ hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi xóa giỏ hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Chọn/bỏ chọn một sản phẩm
   * @param {number} productId - ID sản phẩm
   * @param {boolean} selected - Trạng thái chọn
   * @returns {Promise<Object>}
   */
  async toggleSelectItem(productId, selected = true) {
    try {
      let response;
      
      if (this._isAuthenticated()) {
        response = await this.api.put(`/cart/select/${productId}`, { selected });
      } else {
        // ✅ Guest - Gửi sessionId trong body
        const sessionId = this._getSessionId();
        response = await this.api.put(`/cart/guest/select/${productId}`, { 
          sessionId, 
          selected 
        });
      }
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Cập nhật trạng thái thất bại');
    } catch (error) {
      console.error('❌ Lỗi chọn sản phẩm:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Chọn/bỏ chọn tất cả sản phẩm
   * @param {boolean} selected - Trạng thái chọn
   * @returns {Promise<Object>}
   */
  async toggleSelectAll(selected = true) {
    try {
      let response;
      
      if (this._isAuthenticated()) {
        response = await this.api.put('/cart/select-all', { selected });
      } else {
        // ✅ Guest - Gửi sessionId trong body
        const sessionId = this._getSessionId();
        response = await this.api.put('/cart/guest/select-all', { 
          sessionId, 
          selected 
        });
      }
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Cập nhật trạng thái thất bại');
    } catch (error) {
      console.error('❌ Lỗi chọn tất cả:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Khôi phục giỏ hàng sau khi thanh toán thất bại
   * @param {Array} items - Danh sách items cần khôi phục
   * @returns {Promise<Object>}
   */
  async restoreCart(items) {
    try {
      if (!this._isAuthenticated()) {
        const sessionId = this._getSessionId();
        const response = await this.api.post('/cart/guest/restore', { 
          sessionId,
          cartItems: items 
        });
        
        if (response.data && response.data.success) {
          return {
            success: true,
            message: response.data.message || 'Đã khôi phục giỏ hàng'
          };
        }
      }
      
      throw new Error('Chỉ hỗ trợ khôi phục cho guest cart');
    } catch (error) {
      console.error('❌ Lỗi khôi phục giỏ hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Đếm số lượng sản phẩm trong giỏ
   * @returns {Promise<number>}
   */
  async getCartCount() {
    try {
      const result = await this.getCart();
      return result.data.reduce((total, item) => total + (item.SoLuong || item.quantity || 0), 0);
    } catch (error) {
      console.error('❌ Lỗi đếm giỏ hàng:', error);
      return 0;
    }
  }

  /**
   * Tính tổng tiền giỏ hàng
   * @private
   * @param {Array} items - Danh sách items
   * @returns {Object}
   */
  _calculateTotal(items) {
    const subtotal = items.reduce((sum, item) => {
      const price = item.DonGia || item.price || 0;
      const quantity = item.SoLuong || item.quantity || 0;
      return sum + (price * quantity);
    }, 0);

    return {
      subtotal,
      discount: 0,
      shipping: 0,
      total: subtotal,
      formattedSubtotal: this._formatPrice(subtotal),
      formattedTotal: this._formatPrice(subtotal)
    };
  }

  /**
   * Format giá tiền
   * @private
   */
  _formatPrice(price) {
    if (!price && price !== 0) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  /**
   * Xử lý lỗi
   * @private
   */
  _handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return new Error(data.message || 'Dữ liệu không hợp lệ');
        case 401:
          // ✅ SỬA: Chỉ hiển thị "đăng nhập hết hạn" cho user đã đăng nhập
          // Guest cart không cần thông báo này
          if (this._isAuthenticated()) {
            return new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
          }
          return new Error(data.message || 'Không thể thực hiện thao tác');
        case 404:
          return new Error(data.message || 'Không tìm thấy sản phẩm');
        case 409:
          return new Error(data.message || 'Sản phẩm đã hết hàng');
        case 500:
          return new Error('Lỗi máy chủ, vui lòng thử lại sau');
        default:
          return new Error(data.message || `Lỗi ${status}`);
      }
    } else if (error.request) {
      return new Error('Không thể kết nối đến máy chủ');
    } else {
      return error;
    }
  }
}

// Export singleton instance
export default new CartService();
