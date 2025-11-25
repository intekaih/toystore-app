/**
 * Category Service
 * Xử lý tất cả API liên quan đến danh mục sản phẩm
 */
import axios from 'axios';
import config from '../config';
import authService from './authService';

const API_URL = config.API_URL;

class CategoryService {
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
   * [PUBLIC] Lấy danh sách tất cả danh mục
   * @returns {Promise<Object>}
   */
  async getCategories() {
    try {
      // ✅ Sửa: Gọi endpoint public /products/categories thay vì /categories
      const response = await this.api.get('/products/categories');
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy danh sách danh mục thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy danh mục:', error);
      throw this._handleError(error);
    }
  }

  /**
   * [PUBLIC] Lấy chi tiết danh mục theo ID
   * @param {number} categoryId - ID danh mục
   * @returns {Promise<Object>}
   */
  async getCategoryById(categoryId) {
    try {
      const response = await this.api.get(`/categories/${categoryId}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy thông tin danh mục thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy chi tiết danh mục:', error);
      throw this._handleError(error);
    }
  }

  /**
   * [ADMIN] Lấy danh sách danh mục (có phân trang)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>}
   */
  async adminGetCategories(params = {}) {
    try {
      const response = await this.api.get('/admin/categories', { params });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          pagination: response.data.pagination,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy danh sách danh mục thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy danh mục (admin):', error);
      throw this._handleError(error);
    }
  }

  /**
   * [ADMIN] Tạo danh mục mới
   * @param {Object} categoryData - Dữ liệu danh mục
   * @returns {Promise<Object>}
   */
  async adminCreateCategory(categoryData) {
    try {
      const response = await this.api.post('/admin/categories', categoryData);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Tạo danh mục thất bại');
    } catch (error) {
      console.error('❌ Lỗi tạo danh mục:', error);
      throw this._handleError(error);
    }
  }

  /**
   * [ADMIN] Cập nhật danh mục
   * @param {number} categoryId - ID danh mục
   * @param {Object} categoryData - Dữ liệu cập nhật
   * @returns {Promise<Object>}
   */
  async adminUpdateCategory(categoryId, categoryData) {
    try {
      const response = await this.api.put(`/admin/categories/${categoryId}`, categoryData);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Cập nhật danh mục thất bại');
    } catch (error) {
      console.error('❌ Lỗi cập nhật danh mục:', error);
      throw this._handleError(error);
    }
  }

  /**
   * [ADMIN] Xóa danh mục
   * @param {number} categoryId - ID danh mục
   * @returns {Promise<Object>}
   */
  async adminDeleteCategory(categoryId) {
    try {
      const response = await this.api.delete(`/admin/categories/${categoryId}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Xóa danh mục thất bại');
    } catch (error) {
      console.error('❌ Lỗi xóa danh mục:', error);
      throw this._handleError(error);
    }
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
          return new Error('Phiên đăng nhập đã hết hạn');
        case 403:
          return new Error('Bạn không có quyền thực hiện thao tác này');
        case 404:
          return new Error(data.message || 'Không tìm thấy danh mục');
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
export default new CategoryService();
