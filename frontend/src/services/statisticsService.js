/**
 * Statistics Service
 * Xử lý tất cả API liên quan đến thống kê và báo cáo
 */
import axios from 'axios';
import config from '../config';
import authService from './authService';

const API_URL = config.API_URL;

class StatisticsService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor để tự động thêm token
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
   * [ADMIN] Lấy thống kê dashboard
   * @returns {Promise<Object>}
   */
  async getDashboardStats() {
    try {
      const response = await this.api.get('/admin/statistics/dashboard');
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy thống kê dashboard thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy thống kê dashboard:', error);
      throw this._handleError(error);
    }
  }

  /**
   * [ADMIN] Lấy thống kê chi tiết theo khoảng thời gian
   * @param {Object} params - Query parameters
   * @param {string} params.startDate - Ngày bắt đầu (YYYY-MM-DD)
   * @param {string} params.endDate - Ngày kết thúc (YYYY-MM-DD)
   * @param {string} params.viewMode - Chế độ xem (day, month, year)
   * @param {number} params.year - Năm
   * @returns {Promise<Object>}
   */
  async getStatistics(params = {}) {
    try {
      const response = await this.api.get('/admin/statistics', { params });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy thống kê thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy thống kê:', error);
      throw this._handleError(error);
    }
  }

  /**
   * [ADMIN] Lấy thống kê doanh thu theo tháng
   * @param {number} month - Tháng (1-12)
   * @param {number} year - Năm
   * @returns {Promise<Object>}
   */
  async getRevenueByMonth(month, year) {
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01 00:00:00`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')} 23:59:59`;
      
      return await this.getStatistics({
        startDate,
        endDate,
        viewMode: 'month',
        year
      });
    } catch (error) {
      console.error('❌ Lỗi lấy thống kê doanh thu tháng:', error);
      throw error;
    }
  }

  /**
   * [ADMIN] Lấy thống kê doanh thu theo năm
   * @param {number} year - Năm
   * @returns {Promise<Object>}
   */
  async getRevenueByYear(year) {
    try {
      const startDate = `${year}-01-01 00:00:00`;
      const endDate = `${year}-12-31 23:59:59`;
      
      return await this.getStatistics({
        startDate,
        endDate,
        viewMode: 'year',
        year
      });
    } catch (error) {
      console.error('❌ Lỗi lấy thống kê doanh thu năm:', error);
      throw error;
    }
  }

  /**
   * [ADMIN] Lấy thống kê doanh thu theo ngày
   * @returns {Promise<Object>}
   */
  async getRevenueToday() {
    try {
      const today = new Date();
      const startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 00:00:00`;
      const endDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 23:59:59`;
      
      return await this.getStatistics({
        startDate,
        endDate,
        viewMode: 'day'
      });
    } catch (error) {
      console.error('❌ Lỗi lấy thống kê doanh thu hôm nay:', error);
      throw error;
    }
  }

  /**
   * [ADMIN] Lấy top sản phẩm bán chạy
   * @param {number} limit - Số lượng sản phẩm
   * @param {string} startDate - Ngày bắt đầu
   * @param {string} endDate - Ngày kết thúc
   * @returns {Promise<Object>}
   */
  async getTopProducts(limit = 10, startDate = null, endDate = null) {
    try {
      const params = { limit };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await this.api.get('/admin/statistics/top-products', { params });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy top sản phẩm thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy top sản phẩm:', error);
      throw this._handleError(error);
    }
  }

  /**
   * [ADMIN] Lấy top khách hàng
   * @param {number} limit - Số lượng khách hàng
   * @param {string} startDate - Ngày bắt đầu
   * @param {string} endDate - Ngày kết thúc
   * @returns {Promise<Object>}
   */
  async getTopCustomers(limit = 10, startDate = null, endDate = null) {
    try {
      const params = { limit };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await this.api.get('/admin/statistics/top-customers', { params });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy top khách hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy top khách hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Format số tiền
   * @param {number} amount - Số tiền
   * @returns {string}
   */
  formatCurrency(amount) {
    if (!amount && amount !== 0) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Format phần trăm
   * @param {number} value - Giá trị phần trăm
   * @param {number} decimals - Số chữ số thập phân
   * @returns {string}
   */
  formatPercentage(value, decimals = 1) {
    if (!value && value !== 0) return '0%';
    return `${Number(value).toFixed(decimals)}%`;
  }

  /**
   * Tính tỷ lệ tăng trưởng
   * @param {number} current - Giá trị hiện tại
   * @param {number} previous - Giá trị trước đó
   * @returns {Object}
   */
  calculateGrowth(current, previous) {
    if (!previous || previous === 0) {
      return {
        value: current > 0 ? 100 : 0,
        isPositive: current > 0,
        text: current > 0 ? '+100%' : '0%'
      };
    }
    
    const growth = ((current - previous) / previous) * 100;
    const isPositive = growth >= 0;
    
    return {
      value: Math.abs(growth),
      isPositive,
      text: `${isPositive ? '+' : '-'}${Math.abs(growth).toFixed(1)}%`
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
          return new Error(data.message || 'Tham số không hợp lệ');
        case 401:
          return new Error('Phiên đăng nhập đã hết hạn');
        case 403:
          return new Error('Bạn không có quyền xem thống kê');
        case 404:
          return new Error(data.message || 'Không tìm thấy dữ liệu thống kê');
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
export default new StatisticsService();
