/**
 * Order Service
 * Quản lý đơn hàng - tạo, theo dõi, hủy đơn hàng
 */
import axios from 'axios';
import config from '../config';
import authService from './authService';

const API_URL = config.API_URL;

// Order status constants - ✅ ĐỒNG BỘ VỚI DATABASE
export const ORDER_STATUS = {
  CHO_THANH_TOAN: 'Chờ thanh toán',
  CHO_XU_LY: 'Chờ xử lý',
  DA_XAC_NHAN: 'Đã xác nhận',
  DANG_DONG_GOI: 'Đang đóng gói',
  DANG_GIAO_HANG: 'Đang giao hàng',
  DA_GIAO_HANG: 'Đã giao hàng',
  HOAN_THANH: 'Hoàn thành',
  DA_HUY: 'Đã hủy',
  GIAO_HANG_THAT_BAI: 'Giao hàng thất bại',
  DANG_HOAN_TIEN: 'Đang hoàn tiền',
  DA_HOAN_TIEN: 'Đã hoàn tiền'
};

// Order status names - ✅ SỬ DỤNG STRING
export const ORDER_STATUS_NAMES = {
  'Chờ thanh toán': 'Chờ thanh toán',
  'Chờ xử lý': 'Chờ xử lý',
  'Đã xác nhận': 'Đã xác nhận',
  'Đang đóng gói': 'Đang đóng gói',
  'Đang giao hàng': 'Đang giao hàng',
  'Đã giao hàng': 'Đã giao hàng',
  'Hoàn thành': 'Hoàn thành',
  'Đã hủy': 'Đã hủy',
  'Giao hàng thất bại': 'Giao hàng thất bại',
  'Đang hoàn tiền': 'Đang hoàn tiền',
  'Đã hoàn tiền': 'Đã hoàn tiền'
};

// Order status colors for UI
export const ORDER_STATUS_COLORS = {
  'Chờ thanh toán': 'warning',
  'Chờ xử lý': 'warning',
  'Đã xác nhận': 'info',
  'Đang đóng gói': 'primary',
  'Đang giao hàng': 'primary',
  'Đã giao hàng': 'success',
  'Hoàn thành': 'success',
  'Đã hủy': 'error',
  'Giao hàng thất bại': 'error',
  'Đang hoàn tiền': 'warning',
  'Đã hoàn tiền': 'info'
};

class OrderService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor để tự động thêm token
    this.api.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Tạo đơn hàng mới
   * @param {Object} orderData - Dữ liệu đơn hàng
   * @returns {Promise<Object>}
   */
  async createOrder(orderData) {
    try {
      // ✅ SỬA: Phân biệt user đã đăng nhập và guest
      const isAuthenticated = authService.isAuthenticated();
      const endpoint = isAuthenticated ? '/orders/create' : '/orders/guest/create';
      
      console.log('🛒 Tạo đơn hàng - Đã đăng nhập:', isAuthenticated);
      console.log('🛒 Endpoint:', endpoint);
      
      const response = await this.api.post(endpoint, orderData);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đặt hàng thành công'
        };
      }
      
      throw new Error(response.data.message || 'Đặt hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi tạo đơn hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Lấy danh sách đơn hàng của user hiện tại
   * @param {Object} filters - Bộ lọc
   * @param {number} [filters.status] - Trạng thái đơn hàng
   * @param {number} [filters.page] - Trang hiện tại
   * @param {number} [filters.limit] - Số items mỗi trang
   * @returns {Promise<Object>}
   */
  async getMyOrders(filters = {}) {
    try {
      const response = await this.api.get('/orders/my-orders', { params: filters });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          pagination: response.data.pagination,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy danh sách đơn hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy danh sách đơn hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Lấy lịch sử đơn hàng với phân trang và filter
   * @param {Object} filters - Bộ lọc
   * @param {string} [filters.status] - Trạng thái đơn hàng (sẽ map thành trangThai)
   * @param {string} [filters.trangThai] - Trạng thái đơn hàng (tên đúng theo backend)
   * @param {number} [filters.page] - Trang hiện tại
   * @param {number} [filters.limit] - Số items mỗi trang
   * @returns {Promise<Object>}
   */
  async getOrderHistory(filters = {}) {
    try {
      // ✅ Map status thành trangThai để khớp với backend
      const params = {
        ...filters,
        trangThai: filters.trangThai || filters.status || undefined
      };
      // Xóa status nếu có để tránh gửi cả 2
      delete params.status;
      
      const response = await this.api.get('/orders/history', { params });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data?.orders || response.data.data || [],
          pagination: response.data.data?.pagination || response.data.pagination,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy lịch sử đơn hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy lịch sử đơn hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Lấy chi tiết đơn hàng theo ID
   * @param {number} orderId - ID đơn hàng
   * @returns {Promise<Object>}
   */
  async getOrderById(orderId) {
    try {
      const response = await this.api.get(`/orders/${orderId}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy thông tin đơn hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy chi tiết đơn hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Hủy đơn hàng
   * @param {number} orderId - ID đơn hàng
   * @param {string} reason - Lý do hủy
   * @returns {Promise<Object>}
   */
  async cancelOrder(orderId, reason) {
    try {
      // ✅ SỬA: Backend dùng POST không phải PUT, và nhận lyDoHuy không phải reason
      const response = await this.api.post(`/orders/${orderId}/cancel`, { lyDoHuy: reason });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Hủy đơn hàng thành công'
        };
      }
      
      throw new Error(response.data.message || 'Hủy đơn hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi hủy đơn hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Xác nhận đã nhận hàng
   * @param {number} orderId - ID đơn hàng
   * @returns {Promise<Object>}
   */
  async confirmReceived(orderId) {
    try {
      const response = await this.api.put(`/orders/${orderId}/confirm-received`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Xác nhận đã nhận hàng thành công'
        };
      }
      
      throw new Error(response.data.message || 'Xác nhận thất bại');
    } catch (error) {
      console.error('❌ Lỗi xác nhận nhận hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Yêu cầu trả hàng/hoàn tiền
   * @param {number} orderId - ID đơn hàng
   * @param {string} reason - Lý do trả hàng
   * @param {Array<string>} images - Danh sách URL hình ảnh (optional)
   * @returns {Promise<Object>}
   */
  async requestReturn(orderId, reason, images = []) {
    try {
      const response = await this.api.post(`/orders/${orderId}/return`, {
        reason,
        images
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Yêu cầu trả hàng thành công'
        };
      }
      
      throw new Error(response.data.message || 'Yêu cầu trả hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi yêu cầu trả hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Theo dõi đơn hàng (tracking)
   * @param {number} orderId - ID đơn hàng
   * @returns {Promise<Object>}
   */
  async trackOrder(orderId) {
    try {
      const response = await this.api.get(`/orders/${orderId}/tracking`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Theo dõi đơn hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi theo dõi đơn hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Đặt lại đơn hàng (reorder)
   * @param {number} orderId - ID đơn hàng cũ
   * @returns {Promise<Object>}
   */
  async reorder(orderId) {
    try {
      const response = await this.api.post(`/orders/${orderId}/reorder`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đặt lại đơn hàng thành công'
        };
      }
      
      throw new Error(response.data.message || 'Đặt lại đơn hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi đặt lại đơn hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Tìm đơn hàng theo email hoặc số điện thoại (cho guest)
   * @param {Object} params - Thông tin tìm kiếm
   * @param {string} params.email - Email (optional)
   * @param {string} params.phoneNumber - Số điện thoại (optional)
   * @returns {Promise<Object>}
   */
  async getOrdersByContact({ email, phoneNumber }) {
    try {
      const response = await this.api.post('/orders/guest/search', {
        email,
        phoneNumber
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Tìm kiếm đơn hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi tìm kiếm đơn hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Lấy chi tiết đơn hàng theo mã đơn hàng (public - không cần đăng nhập)
   * @param {string} orderCode - Mã đơn hàng (HD...)
   * @returns {Promise<Object>}
   */
  async getOrderByCode(orderCode) {
    try {
      const response = await this.api.get(`/orders/public/${orderCode}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Không tìm thấy đơn hàng');
    } catch (error) {
      console.error('❌ Lỗi lấy đơn hàng theo mã:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Tính toán giá trị đơn hàng
   * @param {Array} items - Danh sách sản phẩm
   * @param {number} shippingFee - Phí vận chuyển
   * @param {Object} voucher - Voucher áp dụng (optional)
   * @returns {Object}
   */
  calculateOrderTotal(items, shippingFee = 0, voucher = null) {
    // Tổng tiền sản phẩm
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Giảm giá từ voucher
    let discount = 0;
    if (voucher) {
      // ✅ ĐỒNG BỘ VỚI DATABASE: Hỗ trợ cả PascalCase và camelCase
      const loaiGiamGia = voucher.LoaiGiamGia || voucher.loaiGiamGia;
      const giaTriGiam = parseFloat(voucher.GiaTriGiam || voucher.giaTriGiam || 0);
      const giamToiDa = voucher.GiamToiDa || voucher.giamToiDa;
      
      if (loaiGiamGia === 'PhanTram') {
        discount = (subtotal * giaTriGiam) / 100;
        if (giamToiDa) {
          discount = Math.min(discount, parseFloat(giamToiDa));
        }
      } else if (loaiGiamGia === 'TienMat') {
        discount = giaTriGiam;
      }
    }

    // Tổng cuối cùng
    const total = subtotal + shippingFee - discount;

    return {
      subtotal,
      shippingFee,
      discount,
      total: Math.max(0, total)
    };
  }

  /**
   * Validate dữ liệu đơn hàng trước khi tạo
   * @param {Object} orderData - Dữ liệu đơn hàng
   * @returns {Object}
   */
  validateOrderData(orderData) {
    const errors = [];

    // Validate thông tin người nhận
    if (!orderData.fullName || orderData.fullName.trim().length < 2) {
      errors.push('Tên người nhận phải có ít nhất 2 ký tự');
    }

    if (!orderData.phone || !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(orderData.phone)) {
      errors.push('Số điện thoại không hợp lệ');
    }

    if (!orderData.address || orderData.address.trim().length < 5) {
      errors.push('Địa chỉ phải có ít nhất 5 ký tự');
    }

    if (!orderData.ward) {
      errors.push('Vui lòng chọn Phường/Xã');
    }

    if (!orderData.district) {
      errors.push('Vui lòng chọn Quận/Huyện');
    }

    if (!orderData.province) {
      errors.push('Vui lòng chọn Tỉnh/Thành phố');
    }

    // Validate phương thức thanh toán
    if (!orderData.paymentMethodId) {
      errors.push('Vui lòng chọn phương thức thanh toán');
    }

    // Validate items
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      errors.push('Đơn hàng phải có ít nhất 1 sản phẩm');
    } else {
      orderData.items.forEach((item, index) => {
        if (!item.productId) {
          errors.push(`Sản phẩm ${index + 1}: Thiếu ID sản phẩm`);
        }
        if (!item.quantity || item.quantity < 1) {
          errors.push(`Sản phẩm ${index + 1}: Số lượng phải lớn hơn 0`);
        }
        if (!item.price || item.price < 0) {
          errors.push(`Sản phẩm ${index + 1}: Giá không hợp lệ`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Lấy tên trạng thái đơn hàng
   * @param {string} status - Trạng thái đơn hàng (string)
   * @returns {string}
   */
  getStatusName(status) {
    return ORDER_STATUS_NAMES[status] || status || 'Không xác định';
  }

  /**
   * Lấy màu cho trạng thái đơn hàng
   * @param {string} status - Trạng thái đơn hàng (string)
   * @returns {string}
   */
  getStatusColor(status) {
    return ORDER_STATUS_COLORS[status] || 'default';
  }

  /**
   * Kiểm tra đơn hàng có thể hủy không
   * @param {string} status - Trạng thái đơn hàng hiện tại (string)
   * @returns {boolean}
   */
  canCancelOrder(status) {
    return [ORDER_STATUS.CHO_THANH_TOAN, ORDER_STATUS.CHO_XU_LY].includes(status);
  }

  /**
   * Kiểm tra đơn hàng có thể xác nhận đã nhận không
   * @param {string} status - Trạng thái đơn hàng hiện tại (string)
   * @returns {boolean}
   */
  canConfirmReceived(status) {
    return status === ORDER_STATUS.DA_GIAO_HANG;
  }

  /**
   * Kiểm tra đơn hàng có thể yêu cầu trả hàng không
   * @param {string} status - Trạng thái đơn hàng hiện tại (string)
   * @returns {boolean}
   */
  canRequestReturn(status) {
    return [ORDER_STATUS.DA_GIAO_HANG, ORDER_STATUS.HOAN_THANH].includes(status);
  }

  /**
   * Kiểm tra đơn hàng có thể đánh giá không
   * @param {string} status - Trạng thái đơn hàng hiện tại (string)
   * @returns {boolean}
   */
  canReview(status) {
    return status === ORDER_STATUS.HOAN_THANH;
  }

  /**
   * Format giá tiền
   * @param {number} amount - Số tiền
   * @returns {string}
   */
  formatPrice(amount) {
    if (!amount && amount !== 0) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Format ngày giờ
   * @param {string|Date} date - Ngày cần format
   * @returns {string}
   */
  formatDate(date) {
    if (!date) return '';
    
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Nếu trong vòng 24h, hiển thị relative time
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    // Ngược lại hiển thị ngày cụ thể
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
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
          return new Error(data.message || 'Dữ liệu đơn hàng không hợp lệ');
        case 401:
          authService.logout();
          return new Error('Phiên đăng nhập đã hết hạn');
        case 403:
          return new Error('Bạn không có quyền thực hiện thao tác này');
        case 404:
          return new Error(data.message || 'Không tìm thấy đơn hàng');
        case 409:
          return new Error(data.message || 'Không thể thực hiện thao tác với đơn hàng này');
        case 422:
          return new Error(data.message || 'Dữ liệu đơn hàng không hợp lệ');
        case 500:
          return new Error('Lỗi hệ thống, vui lòng thử lại sau');
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
export default new OrderService();
