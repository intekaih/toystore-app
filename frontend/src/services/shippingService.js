/**
 * Shipping Service
 * Xử lý tất cả API liên quan đến vận chuyển (GHN Integration)
 */
import axios from 'axios';
import config from '../config';
import authService from './authService';

const API_URL = config.API_URL;

class ShippingService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 45000, // ✅ Tăng timeout lên 45s để xử lý IP mới chậm hơn
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Thêm interceptor để tự động gửi token
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

    // ✅ THÊM: Response interceptor để retry khi gặp lỗi network
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        
        // Nếu đã retry quá số lần cho phép, bỏ qua
        if (!config || config.__retryCount >= 3) {
          return Promise.reject(error);
        }

        // Chỉ retry với các lỗi network/timeout
        const isNetworkError = 
          error.code === 'ECONNRESET' ||
          error.code === 'ETIMEDOUT' ||
          error.code === 'ECONNABORTED' ||
          error.code === 'ECONNREFUSED' ||
          error.code === 'ENOTFOUND' ||
          error.message?.includes('timeout') ||
          error.message?.includes('ECONNRESET') ||
          (error.response?.status >= 500 && error.response?.status < 600);

        if (isNetworkError) {
          config.__retryCount = config.__retryCount || 0;
          config.__retryCount += 1;

          // Exponential backoff: delay tăng dần (1s, 2s, 4s)
          const delay = 1000 * Math.pow(2, config.__retryCount - 1);
          
          console.log(`🔄 [Frontend] Retry request (${config.__retryCount}/3) sau ${delay}ms...`, error.code || error.message);

          // Đợi trước khi retry
          await new Promise(resolve => setTimeout(resolve, delay));

          // Tăng timeout cho lần retry
          config.timeout = 45000;

          // Retry request
          return this.api(config);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Lấy danh sách tỉnh/thành phố
   * @returns {Promise<Object>}
   */
  async getProvinces() {
    try {
      console.log('📡 [Frontend] Đang gọi API lấy danh sách tỉnh/thành...');
      const response = await this.api.get('/shipping/provinces', {
        timeout: 45000 // ✅ Tăng timeout riêng cho request này
      });
      
      if (response.data && response.data.success) {
        console.log(`✅ [Frontend] Lấy thành công ${response.data.data?.length || 0} tỉnh/thành`);
        return {
          success: true,
          data: response.data.data || [],
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy danh sách tỉnh/thành thất bại');
    } catch (error) {
      console.error('❌ [Frontend] Lỗi lấy danh sách tỉnh/thành:', error);
      
      // ✅ CẢI THIỆN: Log chi tiết hơn
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.error('   ⚠️ Timeout - Có thể do IP mới chậm hơn, đã thử retry tự động');
      } else if (error.code === 'ECONNRESET') {
        console.error('   ⚠️ Connection reset - Đã thử retry tự động');
      }
      
      throw this._handleError(error);
    }
  }

  /**
   * Lấy danh sách quận/huyện theo tỉnh
   * @param {number} provinceId - ID tỉnh/thành
   * @returns {Promise<Object>}
   */
  async getDistricts(provinceId) {
    try {
      const response = await this.api.get(`/shipping/districts/${provinceId}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy danh sách quận/huyện thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy danh sách quận/huyện:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Lấy danh sách phường/xã theo quận
   * @param {number} districtId - ID quận/huyện
   * @returns {Promise<Object>}
   */
  async getWards(districtId) {
    try {
      const response = await this.api.get(`/shipping/wards/${districtId}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy danh sách phường/xã thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy danh sách phường/xã:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Tính phí vận chuyển
   * @param {Object} shippingInfo - Thông tin vận chuyển
   * @param {number} shippingInfo.toDistrictId - ID quận/huyện đích
   * @param {string} shippingInfo.toWardCode - Mã phường/xã đích
   * @param {number} shippingInfo.weight - Khối lượng (gram)
   * @param {number} shippingInfo.length - Chiều dài (cm)
   * @param {number} shippingInfo.width - Chiều rộng (cm)
   * @param {number} shippingInfo.height - Chiều cao (cm)
   * @param {number} shippingInfo.insuranceValue - Giá trị bảo hiểm
   * @returns {Promise<Object>}
   */
  async calculateShippingFee(shippingInfo) {
    try {
      const response = await this.api.post('/shipping/calculate-fee', shippingInfo);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          fee: response.data.data.total || 0,
          formattedFee: this._formatPrice(response.data.data.total || 0),
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Tính phí vận chuyển thất bại');
    } catch (error) {
      console.error('❌ Lỗi tính phí vận chuyển:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Tính thời gian giao hàng dự kiến
   * @param {Object} params
   * @param {number} params.toDistrictId - ID quận/huyện đích
   * @param {string} params.toWardCode - Mã phường/xã đích
   * @param {number} params.serviceId - ID dịch vụ GHN
   * @returns {Promise<Object>}
   */
  async calculateDeliveryTime(params) {
    try {
      const response = await this.api.post('/shipping/delivery-time', params);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Tính thời gian giao hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi tính thời gian giao hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Lấy danh sách dịch vụ GHN có sẵn
   * @param {Object} params
   * @param {number} params.toDistrictId - ID quận/huyện đích
   * @returns {Promise<Object>}
   */
  async getAvailableServices(params) {
    try {
      const response = await this.api.post('/shipping/available-services', params);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy dịch vụ vận chuyển thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy dịch vụ vận chuyển:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Lấy địa chỉ giao hàng của user
   * @returns {Promise<Object>}
   */
  async getUserAddresses() {
    try {
      const response = await this.api.get('/users/addresses');
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy địa chỉ thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy địa chỉ:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Thêm địa chỉ giao hàng mới
   * @param {Object} address - Thông tin địa chỉ
   * @returns {Promise<Object>}
   */
  async addAddress(address) {
    try {
      const response = await this.api.post('/users/addresses', address);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã thêm địa chỉ mới'
        };
      }
      
      throw new Error(response.data.message || 'Thêm địa chỉ thất bại');
    } catch (error) {
      console.error('❌ Lỗi thêm địa chỉ:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Cập nhật địa chỉ giao hàng
   * @param {number} addressId - ID địa chỉ
   * @param {Object} address - Thông tin địa chỉ mới
   * @returns {Promise<Object>}
   */
  async updateAddress(addressId, address) {
    try {
      const response = await this.api.put(`/users/addresses/${addressId}`, address);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã cập nhật địa chỉ'
        };
      }
      
      throw new Error(response.data.message || 'Cập nhật địa chỉ thất bại');
    } catch (error) {
      console.error('❌ Lỗi cập nhật địa chỉ:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Xóa địa chỉ giao hàng
   * @param {number} addressId - ID địa chỉ
   * @returns {Promise<Object>}
   */
  async deleteAddress(addressId) {
    try {
      const response = await this.api.delete(`/users/addresses/${addressId}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Đã xóa địa chỉ'
        };
      }
      
      throw new Error(response.data.message || 'Xóa địa chỉ thất bại');
    } catch (error) {
      console.error('❌ Lỗi xóa địa chỉ:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Đặt địa chỉ làm mặc định
   * @param {number} addressId - ID địa chỉ
   * @returns {Promise<Object>}
   */
  async setDefaultAddress(addressId) {
    try {
      const response = await this.api.put(`/users/addresses/${addressId}/default`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Đã đặt làm địa chỉ mặc định'
        };
      }
      
      throw new Error(response.data.message || 'Đặt địa chỉ mặc định thất bại');
    } catch (error) {
      console.error('❌ Lỗi đặt địa chỉ mặc định:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Theo dõi đơn hàng (tracking)
   * @param {string} orderCode - Mã đơn hàng
   * @returns {Promise<Object>}
   */
  async trackOrder(orderCode) {
    try {
      const response = await this.api.get(`/shipping/${orderCode}/tracking`);
      
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
   * Lấy trạng thái GHN từ database
   * @param {number} orderId - ID đơn hàng
   * @returns {Promise<Object>}
   */
  async getGHNStatus(orderId) {
    try {
      const response = await this.api.get(`/shipping/orders/${orderId}/ghn-status`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy trạng thái GHN thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy trạng thái GHN:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Đồng bộ trạng thái GHN từ API vào database
   * @param {number} orderId - ID đơn hàng
   * @returns {Promise<Object>}
   */
  async syncGHNStatus(orderId) {
    try {
      const response = await this.api.post(`/shipping/orders/${orderId}/sync-ghn-status`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Đồng bộ trạng thái GHN thất bại');
    } catch (error) {
      console.error('❌ Lỗi đồng bộ trạng thái GHN:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Lấy chi tiết tracking GHN với timeline
   * @param {number} orderId - ID đơn hàng
   * @returns {Promise<Object>}
   */
  async getGHNTracking(orderId) {
    try {
      const response = await this.api.get(`/shipping/orders/${orderId}/ghn-tracking`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy tracking GHN thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy tracking GHN:', error);
      throw this._handleError(error);
    }
  }

  /**
   * 🎭 MOCK: Lấy danh sách tất cả đơn hàng mock
   * @returns {Promise<Object>}
   */
  async getMockOrders() {
    try {
      const response = await this.api.get('/shipping/mock/orders');
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy danh sách mock orders thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy danh sách mock orders:', error);
      throw this._handleError(error);
    }
  }

  /**
   * 🎭 MOCK: Chuyển trạng thái đơn hàng sang bước tiếp theo
   * @param {string} ghnOrderCode - Mã vận đơn GHN
   * @returns {Promise<Object>}
   */
  async advanceMockStatus(ghnOrderCode) {
    try {
      const response = await this.api.post(`/shipping/mock/advance-status/${ghnOrderCode}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Chuyển trạng thái thất bại');
    } catch (error) {
      console.error('❌ Lỗi chuyển trạng thái mock:', error);
      throw this._handleError(error);
    }
  }

  /**
   * 🎭 MOCK: Đặt trạng thái cụ thể cho đơn hàng
   * @param {string} ghnOrderCode - Mã vận đơn GHN
   * @param {string} status - Trạng thái muốn đặt
   * @returns {Promise<Object>}
   */
  async setMockStatus(ghnOrderCode, status) {
    try {
      const response = await this.api.post(`/shipping/mock/set-status/${ghnOrderCode}`, {
        status
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Đặt trạng thái thất bại');
    } catch (error) {
      console.error('❌ Lỗi đặt trạng thái mock:', error);
      throw this._handleError(error);
    }
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
          return new Error('Vui lòng đăng nhập để tiếp tục');
        case 404:
          return new Error(data.message || 'Không tìm thấy thông tin');
        case 500:
          return new Error('Lỗi máy chủ, vui lòng thử lại sau');
        case 503:
          return new Error('Dịch vụ tạm thời không khả dụng, vui lòng thử lại sau');
        default:
          return new Error(data.message || `Lỗi ${status}`);
      }
    } else if (error.request) {
      // ✅ CẢI THIỆN: Thông báo lỗi chi tiết hơn
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return new Error('Kết nối quá lâu. Vui lòng kiểm tra kết nối internet và thử lại.');
      } else if (error.code === 'ECONNRESET') {
        return new Error('Kết nối bị ngắt. Vui lòng thử lại sau vài giây.');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.');
      }
      return new Error('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } else {
      return error;
    }
  }
}

// Export singleton instance
export default new ShippingService();
