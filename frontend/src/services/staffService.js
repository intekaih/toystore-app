/**
 * Staff Service
 * Xử lý tất cả API dành cho nhân viên
 */
import axios from 'axios';
import config from '../config';
import authService from './authService';

const API_URL = config.API_URL;

class StaffService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000,
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
  }

  /**
   * Kiểm tra quyền staff
   * @returns {boolean}
   */
  isStaff() {
    const user = authService.getCurrentUser();
    return user && (user.VaiTro === 'NhanVien' || user.VaiTro === 'Admin');
  }

  // ========== QUẢN LÝ ĐƠN HÀNG ==========

  /**
   * Lấy danh sách đơn hàng (với filter)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Trang hiện tại
   * @param {number} params.limit - Số đơn hàng mỗi trang
   * @param {string} params.status - Lọc theo trạng thái
   * @param {string} params.search - Tìm kiếm theo mã đơn hàng
   * @param {string} params.fromDate - Từ ngày
   * @param {string} params.toDate - Đến ngày
   * @returns {Promise<Object>}
   */
  async getOrders(params = {}) {
    try {
      const response = await this.api.get('/staff/orders', { params });
      
      if (response.data && response.data.success) {
        // Backend trả về: { success: true, data: { orders: [...], pagination: {...} } }
        const backendData = response.data.data || {};
        return {
          success: true,
          data: backendData.orders || [],
          pagination: backendData.pagination || response.data.pagination,
          statistics: response.data.statistics,
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
   * Lấy chi tiết đơn hàng
   * @param {number} orderId - ID đơn hàng
   * @returns {Promise<Object>}
   */
  async getOrderDetail(orderId) {
    try {
      const response = await this.api.get(`/staff/orders/${orderId}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy chi tiết đơn hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy chi tiết đơn hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Cập nhật trạng thái đơn hàng
   * @param {number} orderId - ID đơn hàng
   * @param {Object} updateData
   * @param {string} updateData.status - Trạng thái mới
   * @param {string} updateData.reason - Lý do thay đổi (optional)
   * @returns {Promise<Object>}
   */
  async updateOrderStatus(orderId, updateData) {
    try {
      const response = await this.api.put(`/staff/orders/${orderId}/status`, updateData);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã cập nhật trạng thái'
        };
      }
      
      throw new Error(response.data.message || 'Cập nhật trạng thái thất bại');
    } catch (error) {
      console.error('❌ Lỗi cập nhật trạng thái:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Xác nhận đơn hàng
   * @param {number} orderId - ID đơn hàng
   * @returns {Promise<Object>}
   */
  async confirmOrder(orderId) {
    try {
      const response = await this.api.post(`/staff/orders/${orderId}/confirm`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã xác nhận đơn hàng'
        };
      }
      
      throw new Error(response.data.message || 'Xác nhận đơn hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi xác nhận đơn hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Đóng gói đơn hàng
   * @param {number} orderId - ID đơn hàng
   * @returns {Promise<Object>}
   */
  async packOrder(orderId) {
    try {
      const response = await this.api.post(`/staff/orders/${orderId}/pack`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã đóng gói đơn hàng'
        };
      }
      
      throw new Error(response.data.message || 'Đóng gói thất bại');
    } catch (error) {
      console.error('❌ Lỗi đóng gói đơn hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Giao cho đơn vị vận chuyển
   * @param {number} orderId - ID đơn hàng
   * @param {Object} shippingData - Thông tin vận chuyển
   * @returns {Promise<Object>}
   */
  async shipOrder(orderId, shippingData) {
    try {
      const response = await this.api.post(`/staff/orders/${orderId}/ship`, shippingData);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã giao cho đơn vị vận chuyển'
        };
      }
      
      throw new Error(response.data.message || 'Giao hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi giao hàng:', error);
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
      const response = await this.api.post(`/staff/orders/${orderId}/cancel`, { reason });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Đã hủy đơn hàng'
        };
      }
      
      throw new Error(response.data.message || 'Hủy đơn hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi hủy đơn hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * In hóa đơn/phiếu giao hàng
   * @param {number} orderId - ID đơn hàng
   * @param {string} type - Loại phiếu (invoice/shipping)
   * @returns {Promise<Object>}
   */
  async printDocument(orderId, type = 'invoice') {
    try {
      const response = await this.api.get(`/staff/orders/${orderId}/print/${type}`, {
        responseType: 'blob'
      });
      
      // Tạo file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return {
        success: true,
        message: 'Đã tải xuống thành công'
      };
    } catch (error) {
      console.error('❌ Lỗi in phiếu:', error);
      throw this._handleError(error);
    }
  }

  // ========== QUẢN LÝ SẢN PHẨM (CƠ BẢN) ==========

  /**
   * Lấy danh sách sản phẩm (với filter)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Trang hiện tại
   * @param {number} params.limit - Số sản phẩm mỗi trang
   * @param {string} params.search - Tìm kiếm theo tên
   * @param {number} params.loaiId - Lọc theo loại
   * @param {number} params.trangThai - Trạng thái (1: hoạt động, 0: không hoạt động)
   * @returns {Promise<Object>}
   */
  async getAllProducts(params = {}) {
    try {
      // Map frontend params to backend params
      const backendParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        keyword: params.search,
        idLoai: params.loaiId,
        trangThai: params.trangThai
      };
      
      const response = await this.api.get('/staff/products', { params: backendParams });
      
      if (response.data && response.data.success) {
        // Backend trả về: { success: true, data: { products: [...], pagination: {...} } }
        const backendData = response.data.data || {};
        return {
          success: true,
          data: backendData.products || [],
          pagination: backendData.pagination || {},
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy danh sách sản phẩm thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy danh sách sản phẩm:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Cập nhật số lượng tồn kho
   * @param {number} productId - ID sản phẩm
   * @param {number} quantity - Số lượng mới
   * @returns {Promise<Object>}
   */
  async updateStock(productId, quantity) {
    try {
      const response = await this.api.put(`/staff/products/${productId}/stock`, { quantity });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã cập nhật tồn kho'
        };
      }
      
      throw new Error(response.data.message || 'Cập nhật tồn kho thất bại');
    } catch (error) {
      console.error('❌ Lỗi cập nhật tồn kho:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Kiểm tra tồn kho
   * @param {Object} params - Filter params
   * @returns {Promise<Object>}
   */
  async checkInventory(params = {}) {
    try {
      const response = await this.api.get('/staff/inventory', { params });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          statistics: response.data.statistics,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Kiểm tra tồn kho thất bại');
    } catch (error) {
      console.error('❌ Lỗi kiểm tra tồn kho:', error);
      throw this._handleError(error);
    }
  }

  // ========== BÁO CÁO & THỐNG KÊ ==========

  /**
   * Lấy báo cáo bán hàng
   * @param {Object} params
   * @param {string} params.period - Khoảng thời gian (today/week/month/year/custom)
   * @param {string} params.fromDate - Từ ngày (cho custom)
   * @param {string} params.toDate - Đến ngày (cho custom)
   * @returns {Promise<Object>}
   */
  async getSalesReport(params = {}) {
    try {
      const response = await this.api.get('/staff/reports/sales', { params });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy báo cáo thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy báo cáo bán hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Lấy danh sách đơn hàng cần xử lý
   * @returns {Promise<Object>}
   */
  async getPendingOrders() {
    try {
      const response = await this.api.get('/staff/orders/pending');
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          count: response.data.count || 0,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy danh sách thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy đơn hàng chờ xử lý:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Lấy thống kê dashboard nhân viên
   * @returns {Promise<Object>}
   */
  async getDashboardStats() {
    try {
      const response = await this.api.get('/staff/dashboard');
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy thống kê thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy dashboard:', error);
      throw this._handleError(error);
    }
  }

  // ========== TIỆN ÍCH ==========

  /**
   * Format trạng thái đơn hàng
   * @param {string} status - Trạng thái
   * @returns {Object}
   */
  formatOrderStatus(status) {
    const statusMap = {
      'Chờ thanh toán': { color: 'yellow', text: 'Chờ thanh toán', icon: 'clock' },
      'Chờ xử lý': { color: 'blue', text: 'Chờ xử lý', icon: 'clipboard' },
      'Đã xác nhận': { color: 'cyan', text: 'Đã xác nhận', icon: 'check' },
      'Đang đóng gói': { color: 'purple', text: 'Đang đóng gói', icon: 'package' },
      'Đang giao hàng': { color: 'orange', text: 'Đang giao hàng', icon: 'truck' },
      'Đã giao hàng': { color: 'green', text: 'Đã giao hàng', icon: 'check' },
      'Hoàn thành': { color: 'green', text: 'Hoàn thành', icon: 'check' },
      'Đã hủy': { color: 'red', text: 'Đã hủy', icon: 'x' },
      'Giao hàng thất bại': { color: 'red', text: 'Giao thất bại', icon: 'x' }
    };

    return statusMap[status] || { color: 'gray', text: status, icon: 'help-circle' };
  }

  /**
   * Validate dữ liệu cập nhật đơn hàng
   * @param {Object} data
   * @returns {Object}
   */
  validateOrderUpdate(data) {
    const errors = {};
    
    if (!data.status) {
      errors.status = 'Vui lòng chọn trạng thái';
    }
    
    if (data.status === 'Đã hủy' && !data.reason) {
      errors.reason = 'Vui lòng nhập lý do hủy';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
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
          return new Error('Vui lòng đăng nhập');
        case 403:
          return new Error('Bạn không có quyền thực hiện thao tác này');
        case 404:
          return new Error(data.message || 'Không tìm thấy thông tin');
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
export default new StaffService();
