/**
 * Voucher Service
 * Xử lý tất cả API liên quan đến voucher/mã giảm giá
 */
import axios from 'axios';
import config from '../config';
import authService from './authService';

const API_URL = config.API_URL;

class VoucherService {
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
   * [PUBLIC] Kiểm tra mã voucher
   * @param {string} voucherCode - Mã voucher
   * @param {number} totalAmount - Tổng tiền đơn hàng
   * @returns {Promise<Object>}
   */
  async checkVoucher(voucherCode, totalAmount) {
    try {
      const response = await this.api.post('/vouchers/check', {
        maVoucher: voucherCode,
        tongTien: totalAmount
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Kiểm tra voucher thất bại');
    } catch (error) {
      console.error('❌ Lỗi kiểm tra voucher:', error);
      throw this._handleError(error);
    }
  }

  /**
   * [PUBLIC] Áp dụng voucher vào đơn hàng
   * @param {string} voucherCode - Mã voucher
   * @param {number} totalAmount - Tổng tiền đơn hàng
   * @returns {Promise<Object>}
   */
  async applyVoucher(voucherCode, totalAmount) {
    try {
      return await this.checkVoucher(voucherCode, totalAmount);
    } catch (error) {
      console.error('❌ Lỗi áp dụng voucher:', error);
      throw error;
    }
  }

  /**
   * [ADMIN] Lấy danh sách voucher (có phân trang)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>}
   */
  async adminGetVouchers(params = {}) {
    try {
      const response = await this.api.get('/admin/vouchers', { params });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          pagination: response.data.pagination,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy danh sách voucher thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy danh sách voucher:', error);
      throw this._handleError(error);
    }
  }

  /**
   * [ADMIN] Tạo voucher mới
   * @param {Object} voucherData - Dữ liệu voucher
   * @returns {Promise<Object>}
   */
  async adminCreateVoucher(voucherData) {
    try {
      const response = await this.api.post('/admin/vouchers', voucherData);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Tạo voucher thất bại');
    } catch (error) {
      console.error('❌ Lỗi tạo voucher:', error);
      throw this._handleError(error);
    }
  }

  /**
   * [ADMIN] Cập nhật voucher
   * @param {number} voucherId - ID voucher
   * @param {Object} voucherData - Dữ liệu cập nhật
   * @returns {Promise<Object>}
   */
  async adminUpdateVoucher(voucherId, voucherData) {
    try {
      const response = await this.api.put(`/admin/vouchers/${voucherId}`, voucherData);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Cập nhật voucher thất bại');
    } catch (error) {
      console.error('❌ Lỗi cập nhật voucher:', error);
      throw this._handleError(error);
    }
  }

  /**
   * [ADMIN] Cập nhật trạng thái voucher
   * @param {number} voucherId - ID voucher
   * @param {string} status - Trạng thái mới (HoatDong, TamDung, HetHan)
   * @returns {Promise<Object>}
   */
  async adminUpdateVoucherStatus(voucherId, status) {
    try {
      const response = await this.api.patch(`/admin/vouchers/${voucherId}/status`, {
        trangThai: status
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Cập nhật trạng thái voucher thất bại');
    } catch (error) {
      console.error('❌ Lỗi cập nhật trạng thái voucher:', error);
      throw this._handleError(error);
    }
  }

  /**
   * [ADMIN] Xóa voucher
   * @param {number} voucherId - ID voucher
   * @returns {Promise<Object>}
   */
  async adminDeleteVoucher(voucherId) {
    try {
      const response = await this.api.delete(`/admin/vouchers/${voucherId}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Xóa voucher thất bại');
    } catch (error) {
      console.error('❌ Lỗi xóa voucher:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Format giá trị giảm giá
   * @param {Object} voucher - Thông tin voucher
   * @returns {string}
   */
  formatDiscount(voucher) {
    if (!voucher) return '';
    
    // ✅ ĐỒNG BỘ VỚI DATABASE: 'PhanTram' hoặc 'TienMat'
    const loaiGiamGia = voucher.LoaiGiamGia || voucher.loaiGiamGia;
    const giaTriGiam = voucher.GiaTriGiam || voucher.giaTriGiam;
    
    if (loaiGiamGia === 'PhanTram') {
      return `${giaTriGiam}%`;
    } else {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(giaTriGiam);
    }
  }

  /**
   * Tính số tiền được giảm
   * @param {Object} voucher - Thông tin voucher
   * @param {number} totalAmount - Tổng tiền đơn hàng
   * @returns {number}
   */
  calculateDiscount(voucher, totalAmount) {
    if (!voucher || !totalAmount) return 0;
    
    let discount = 0;
    
    // ✅ ĐỒNG BỘ VỚI DATABASE: Hỗ trợ cả PascalCase và camelCase
    const loaiGiamGia = voucher.LoaiGiamGia || voucher.loaiGiamGia;
    const giaTriGiam = parseFloat(voucher.GiaTriGiam || voucher.giaTriGiam || 0);
    const giamToiDa = voucher.GiamToiDa || voucher.giamToiDa;
    
    if (loaiGiamGia === 'PhanTram') {
      // Giảm theo phần trăm
      discount = (totalAmount * giaTriGiam) / 100;
      
      // Áp dụng giảm tối đa nếu có
      if (giamToiDa && discount > parseFloat(giamToiDa)) {
        discount = parseFloat(giamToiDa);
      }
    } else if (loaiGiamGia === 'TienMat') {
      // Giảm theo tiền mặt
      discount = giaTriGiam;
    }
    
    // Đảm bảo không giảm quá tổng tiền
    return Math.min(discount, totalAmount);
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
          return new Error(data.message || 'Mã voucher không hợp lệ');
        case 401:
          return new Error('Phiên đăng nhập đã hết hạn');
        case 403:
          return new Error('Bạn không có quyền sử dụng voucher này');
        case 404:
          return new Error(data.message || 'Không tìm thấy voucher');
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
export default new VoucherService();
