/**
 * Payment Service
 * Xử lý thanh toán VNPay và COD
 */
import axios from 'axios';
import config from '../config';
import authService from './authService';

const API_URL = config.API_URL;

// Payment methods
export const PAYMENT_METHODS = {
  COD: 1,
  VNPAY: 2
};

// Payment status
export const PAYMENT_STATUS = {
  PENDING: 'Chờ thanh toán',
  SUCCESS: 'Đã thanh toán',
  FAILED: 'Thanh toán thất bại',
  REFUNDED: 'Đã hoàn tiền'
};

class PaymentService {
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
   * Lấy danh sách phương thức thanh toán
   * @returns {Promise<Object>}
   */
  async getPaymentMethods() {
    try {
      const response = await this.api.get('/payment/methods');
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy phương thức thanh toán thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy phương thức thanh toán:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Tạo URL thanh toán VNPay
   * @param {Object} paymentData - Dữ liệu thanh toán
   * @param {number} paymentData.orderId - ID đơn hàng
   * @param {number} paymentData.amount - Số tiền
   * @param {string} paymentData.orderInfo - Thông tin đơn hàng
   * @param {string} paymentData.returnUrl - URL trả về sau thanh toán
   * @returns {Promise<Object>}
   */
  async createVNPayPayment(paymentData) {
    try {
      // ✅ FIX: Đổi endpoint từ /create → /create-payment-url
      const response = await this.api.post('/payment/vnpay/create-payment-url', paymentData);
      
      console.log('🔍 Raw response from backend:', response.data);
      
      if (response.data && response.data.success) {
        // ✅ FIX: Backend trả về paymentUrl trong data.data.paymentUrl
        const paymentUrl = response.data.data?.paymentUrl || response.data.paymentUrl;
        
        console.log('✅ Extracted paymentUrl:', paymentUrl);
        
        return {
          success: true,
          paymentUrl: paymentUrl,
          data: response.data.data, // ✅ Trả về toàn bộ data để có thể access các field khác
          message: response.data.message || 'Tạo thanh toán thành công'
        };
      }
      
      throw new Error(response.data.message || 'Tạo thanh toán thất bại');
    } catch (error) {
      console.error('❌ Lỗi tạo thanh toán VNPay:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Xác nhận kết quả thanh toán VNPay (callback từ VNPay)
   * @param {Object} queryParams - Query parameters từ VNPay trả về
   * @returns {Promise<Object>}
   */
  async verifyVNPayReturn(queryParams) {
    try {
      const response = await this.api.get('/payment/vnpay/return', { params: queryParams });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Thanh toán thành công'
        };
      }
      
      throw new Error(response.data.message || 'Xác thực thanh toán thất bại');
    } catch (error) {
      console.error('❌ Lỗi xác thực VNPay:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Truy vấn giao dịch VNPay
   * @param {string} transactionNo - Mã giao dịch
   * @param {string} transactionDate - Ngày giao dịch (yyyyMMddHHmmss)
   * @returns {Promise<Object>}
   */
  async queryVNPayTransaction(transactionNo, transactionDate) {
    try {
      const response = await this.api.get('/payment/vnpay/query', {
        params: {
          vnp_TxnRef: transactionNo,
          vnp_TransactionDate: transactionDate
        }
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Truy vấn giao dịch thất bại');
    } catch (error) {
      console.error('❌ Lỗi truy vấn giao dịch VNPay:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Hoàn tiền VNPay
   * @param {Object} refundData - Dữ liệu hoàn tiền
   * @param {number} refundData.orderId - ID đơn hàng
   * @param {number} refundData.amount - Số tiền hoàn
   * @param {string} refundData.reason - Lý do hoàn tiền
   * @returns {Promise<Object>}
   */
  async refundVNPay(refundData) {
    try {
      const response = await this.api.post('/payment/vnpay/refund', refundData);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Yêu cầu hoàn tiền thành công'
        };
      }
      
      throw new Error(response.data.message || 'Hoàn tiền thất bại');
    } catch (error) {
      console.error('❌ Lỗi hoàn tiền VNPay:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Xác nhận thanh toán COD
   * @param {number} orderId - ID đơn hàng
   * @returns {Promise<Object>}
   */
  async confirmCODPayment(orderId) {
    try {
      const response = await this.api.post('/payment/cod/confirm', { orderId });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Xác nhận thanh toán thành công'
        };
      }
      
      throw new Error(response.data.message || 'Xác nhận thanh toán thất bại');
    } catch (error) {
      console.error('❌ Lỗi xác nhận COD:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Lấy lịch sử thanh toán của đơn hàng
   * @param {number} orderId - ID đơn hàng
   * @returns {Promise<Object>}
   */
  async getPaymentHistory(orderId) {
    try {
      const response = await this.api.get(`/payment/history/${orderId}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy lịch sử thanh toán thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy lịch sử thanh toán:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Parse query string từ URL VNPay return
   * @param {string} url - URL có query params
   * @returns {Object}
   */
  parseVNPayReturnUrl(url) {
    try {
      const urlObj = new URL(url);
      const params = {};
      
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      
      return params;
    } catch (error) {
      console.error('❌ Lỗi parse URL:', error);
      return {};
    }
  }

  /**
   * Kiểm tra mã phản hồi VNPay
   * @param {string} responseCode - Mã phản hồi từ VNPay
   * @returns {Object}
   */
  getVNPayResponseMessage(responseCode) {
    const messages = {
      '00': { success: true, message: 'Giao dịch thành công' },
      '07': { success: false, message: 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)' },
      '09': { success: false, message: 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng' },
      '10': { success: false, message: 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần' },
      '11': { success: false, message: 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch' },
      '12': { success: false, message: 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa' },
      '13': { success: false, message: 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)' },
      '24': { success: false, message: 'Giao dịch không thành công do: Khách hàng hủy giao dịch' },
      '51': { success: false, message: 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch' },
      '65': { success: false, message: 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày' },
      '75': { success: false, message: 'Ngân hàng thanh toán đang bảo trì' },
      '79': { success: false, message: 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định' },
      '99': { success: false, message: 'Các lỗi khác' }
    };

    return messages[responseCode] || { success: false, message: 'Lỗi không xác định' };
  }

  /**
   * Format giá tiền
   * @param {number} amount - Số tiền
   * @returns {string}
   */
  formatAmount(amount) {
    if (!amount && amount !== 0) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Validate số tiền thanh toán
   * @param {number} amount - Số tiền
   * @returns {Object}
   */
  validateAmount(amount) {
    const errors = [];

    if (!amount || amount <= 0) {
      errors.push('Số tiền phải lớn hơn 0');
    }

    if (amount < 10000) {
      errors.push('Số tiền tối thiểu là 10,000₫');
    }

    if (amount > 500000000) {
      errors.push('Số tiền tối đa là 500,000,000₫');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Tạo mã đơn hàng cho VNPay
   * @param {number} orderId - ID đơn hàng
   * @returns {string}
   */
  generateVNPayOrderCode(orderId) {
    const timestamp = Date.now();
    return `ORDER_${orderId}_${timestamp}`;
  }

  /**
   * Format ngày giờ cho VNPay (yyyyMMddHHmmss)
   * @param {Date} date - Ngày cần format
   * @returns {string}
   */
  formatVNPayDate(date = new Date()) {
    const pad = (num) => String(num).padStart(2, '0');
    
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
           `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  }

  /**
   * Kiểm tra phương thức thanh toán có sẵn không
   * @param {number} methodId - ID phương thức
   * @returns {boolean}
   */
  isPaymentMethodAvailable(methodId) {
    return Object.values(PAYMENT_METHODS).includes(methodId);
  }

  /**
   * Lấy tên phương thức thanh toán
   * @param {number} methodId - ID phương thức
   * @returns {string}
   */
  getPaymentMethodName(methodId) {
    const names = {
      [PAYMENT_METHODS.COD]: 'Thanh toán khi nhận hàng (COD)',
      [PAYMENT_METHODS.VNPAY]: 'Thanh toán qua VNPay'
    };
    return names[methodId] || 'Không xác định';
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
          return new Error(data.message || 'Dữ liệu thanh toán không hợp lệ');
        case 401:
          authService.logout();
          return new Error('Phiên đăng nhập đã hết hạn');
        case 402:
          return new Error(data.message || 'Thanh toán thất bại');
        case 403:
          return new Error('Bạn không có quyền thực hiện thanh toán này');
        case 404:
          return new Error(data.message || 'Không tìm thấy thông tin thanh toán');
        case 409:
          return new Error(data.message || 'Giao dịch đã được xử lý');
        case 500:
          return new Error('Lỗi hệ thống thanh toán, vui lòng thử lại sau');
        case 503:
          return new Error('Dịch vụ thanh toán tạm thời không khả dụng');
        default:
          return new Error(data.message || `Lỗi ${status}`);
      }
    } else if (error.request) {
      return new Error('Không thể kết nối đến cổng thanh toán');
    } else {
      return error;
    }
  }
}

// Export singleton instance
export default new PaymentService();
