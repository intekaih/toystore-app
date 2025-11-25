/**
 * Product Service
 * Xử lý tất cả API liên quan đến sản phẩm
 */
import axios from 'axios';
import config from '../config';

const API_URL = config.API_URL;

class ProductService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Lấy danh sách sản phẩm (có phân trang, tìm kiếm, lọc)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Trang hiện tại
   * @param {number} params.limit - Số sản phẩm mỗi trang
   * @param {string} params.search - Từ khóa tìm kiếm
   * @param {number} params.categoryId - ID danh mục
   * @param {number} params.brandId - ID thương hiệu
   * @param {string} params.sortBy - Sắp xếp theo (price, name, rating, newest)
   * @param {string} params.order - Thứ tự (asc, desc)
   * @param {number} params.minPrice - Giá tối thiểu
   * @param {number} params.maxPrice - Giá tối đa
   * @returns {Promise<Object>}
   */
  async getProducts(params = {}) {
    try {
      const response = await this.api.get('/products', { params });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          pagination: response.data.pagination,
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
   * Lấy chi tiết sản phẩm theo ID
   * @param {number} productId - ID sản phẩm
   * @returns {Promise<Object>}
   */
  async getProductById(productId) {
    try {
      const response = await this.api.get(`/products/${productId}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy thông tin sản phẩm thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy chi tiết sản phẩm:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Lấy danh sách danh mục sản phẩm
   * @returns {Promise<Object>}
   */
  async getCategories() {
    try {
      const response = await this.api.get('/products/categories'); // ✅ SỬA: /categories → /products/categories
      
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
   * Lấy danh sách thương hiệu
   * @returns {Promise<Object>}
   */
  async getBrands() {
    try {
      const response = await this.api.get('/products/categories/brands'); // ✅ SỬA: /categories/brands → /products/categories/brands
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy danh sách thương hiệu thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy thương hiệu:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Lấy hình ảnh của sản phẩm
   * @param {number} productId - ID sản phẩm
   * @returns {Promise<Object>}
   */
  async getProductImages(productId) {
    try {
      const response = await this.api.get(`/products/${productId}/images`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy hình ảnh sản phẩm thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy hình ảnh sản phẩm:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Tìm kiếm sản phẩm
   * @param {string} keyword - Từ khóa tìm kiếm
   * @param {Object} filters - Bộ lọc bổ sung
   * @returns {Promise<Object>}
   */
  async searchProducts(keyword, filters = {}) {
    try {
      const params = {
        search: keyword,
        ...filters
      };
      
      return await this.getProducts(params);
    } catch (error) {
      console.error('❌ Lỗi tìm kiếm sản phẩm:', error);
      throw error;
    }
  }

  /**
   * Lấy sản phẩm liên quan
   * @param {number} productId - ID sản phẩm
   * @param {number} limit - Số lượng sản phẩm liên quan
   * @returns {Promise<Object>}
   */
  async getRelatedProducts(productId, limit = 4) {
    try {
      const response = await this.api.get(`/products/${productId}/related`, {
        params: { limit }
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy sản phẩm liên quan thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy sản phẩm liên quan:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Lấy sản phẩm bán chạy
   * @param {number} limit - Số lượng sản phẩm
   * @returns {Promise<Object>}
   */
  async getBestSellingProducts(limit = 10) {
    try {
      const response = await this.api.get('/products/best-selling', {
        params: { limit }
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy sản phẩm bán chạy thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy sản phẩm bán chạy:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Lấy sản phẩm mới nhất
   * @param {number} limit - Số lượng sản phẩm
   * @returns {Promise<Object>}
   */
  async getNewestProducts(limit = 10) {
    try {
      return await this.getProducts({
        limit,
        sortBy: 'newest',
        order: 'desc'
      });
    } catch (error) {
      console.error('❌ Lỗi lấy sản phẩm mới nhất:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách filter options có sẵn
   * @returns {Array<Object>} Danh sách các filter strategy
   */
  getAvailableFilters() {
    return [
      { 
        value: 'newest', 
        label: 'Mới nhất', 
        icon: '🆕',
        description: 'Sản phẩm mới nhất'
      },
      { 
        value: 'price_asc', 
        label: 'Giá thấp đến cao', 
        icon: '💰',
        description: 'Sắp xếp theo giá tăng dần'
      },
      { 
        value: 'price_desc', 
        label: 'Giá cao đến thấp', 
        icon: '💎',
        description: 'Sắp xếp theo giá giảm dần'
      },
      { 
        value: 'best_selling', 
        label: 'Bán chạy', 
        icon: '🔥',
        description: 'Sản phẩm bán chạy nhất'
      },
      { 
        value: 'rating', 
        label: 'Đánh giá cao', 
        icon: '⭐',
        description: 'Sản phẩm được đánh giá cao'
      }
    ];
  }

  /**
   * Lấy badge cho mức giá
   * @param {number} price
   * @returns {Object}
   */
  getBadgeForPrice(price) {
    if (price < 100000) {
      return {
        label: 'Giá rẻ',
        color: 'green',
        icon: 'dollar-sign'
      };
    } else if (price < 500000) {
      return {
        label: 'Tầm trung',
        color: 'blue',
        icon: 'gem'
      };
    } else {
      return {
        label: 'Cao cấp',
        color: 'purple',
        icon: 'flame'
      };
    }
  }

  /**
   * Format giá tiền
   * @param {number} price - Giá tiền
   * @returns {string}
   */
  formatPrice(price) {
    if (!price && price !== 0) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  /**
   * Format số lượng tồn kho
   * @param {number} stock - Số lượng tồn
   * @returns {Object}
   */
  formatStock(stock) {
    if (stock === 0) {
      return { text: 'Hết hàng', class: 'text-red-600', available: false };
    } else if (stock < 10) {
      return { text: `Còn ${stock} sản phẩm`, class: 'text-orange-600', available: true };
    } else {
      return { text: 'Còn hàng', class: 'text-green-600', available: true };
    }
  }

  /**
   * Format đánh giá sao
   * @param {number} rating - Điểm trung bình (0-5)
   * @param {number} totalReviews - Tổng số đánh giá
   * @returns {Object}
   */
  formatRating(rating, totalReviews) {
    return {
      stars: Number(rating) || 0,
      total: Number(totalReviews) || 0,
      text: totalReviews > 0 
        ? `${Number(rating).toFixed(1)} (${totalReviews} đánh giá)` 
        : 'Chưa có đánh giá'
    };
  }

  // ============================================
  // 🔧 ADMIN METHODS
  // ============================================

  /**
   * [ADMIN] Lấy danh sách sản phẩm (có phân trang, tìm kiếm, lọc)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>}
   */
  async adminGetProducts(params = {}) {
    try {
      const token = localStorage.getItem('token');
      
      const response = await this.api.get('/admin/products', {
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy danh sách sản phẩm thất bại');
    } catch (error) {
      console.error('❌ [ADMIN] Lỗi lấy danh sách sản phẩm:', error);
      throw this._handleError(error);
    }
  }

  /**
   * [ADMIN] Tạo sản phẩm mới
   * @param {FormData} formData - Dữ liệu sản phẩm (bao gồm file ảnh)
   * @returns {Promise<Object>}
   */
  async adminCreateProduct(formData) {
    try {
      const token = localStorage.getItem('token');
      
      const response = await this.api.post('/admin/products', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Tạo sản phẩm thất bại');
    } catch (error) {
      console.error('❌ [ADMIN] Lỗi tạo sản phẩm:', error);
      throw this._handleError(error);
    }
  }

  /**
   * [ADMIN] Cập nhật sản phẩm
   * @param {number} productId - ID sản phẩm
   * @param {FormData} formData - Dữ liệu cập nhật
   * @returns {Promise<Object>}
   */
  async adminUpdateProduct(productId, formData) {
    try {
      const token = localStorage.getItem('token');
      
      const response = await this.api.put(`/admin/products/${productId}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Cập nhật sản phẩm thất bại');
    } catch (error) {
      console.error('❌ [ADMIN] Lỗi cập nhật sản phẩm:', error);
      throw this._handleError(error);
    }
  }

  /**
   * [ADMIN] Xóa sản phẩm
   * @param {number} productId - ID sản phẩm
   * @returns {Promise<Object>}
   */
  async adminDeleteProduct(productId) {
    try {
      const token = localStorage.getItem('token');
      
      const response = await this.api.delete(`/admin/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Xóa sản phẩm thất bại');
    } catch (error) {
      console.error('❌ [ADMIN] Lỗi xóa sản phẩm:', error);
      throw this._handleError(error);
    }
  }

  /**
   * [ADMIN] Lấy chi tiết sản phẩm
   * @param {number} productId - ID sản phẩm
   * @returns {Promise<Object>}
   */
  async adminGetProductById(productId) {
    try {
      const token = localStorage.getItem('token');
      
      const response = await this.api.get(`/admin/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy thông tin sản phẩm thất bại');
    } catch (error) {
      console.error('❌ [ADMIN] Lỗi lấy chi tiết sản phẩm:', error);
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
        case 404:
          return new Error(data.message || 'Không tìm thấy sản phẩm');
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
export default new ProductService();
