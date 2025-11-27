/**
 * Admin Service
 * Xử lý tất cả API dành cho quản trị viên
 */
import axios from 'axios';
import config from '../config';
import authService from './authService';

const API_URL = config.API_URL;

class AdminService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 15000,
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
   * Kiểm tra quyền admin
   * @returns {boolean}
   */
  isAdmin() {
    const user = authService.getCurrentUser();
    return user && user.VaiTro === 'Admin';
  }

  // ========== QUẢN LÝ SẢN PHẨM ==========

  /**
   * Tạo sản phẩm mới
   * @param {FormData} productData - Form data chứa thông tin sản phẩm và hình ảnh
   * @returns {Promise<Object>}
   */
  async createProduct(productData) {
    try {
      const response = await this.api.post('/admin/products', productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã tạo sản phẩm mới'
        };
      }

      throw new Error(response.data.message || 'Tạo sản phẩm thất bại');
    } catch (error) {
      console.error('❌ Lỗi tạo sản phẩm:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Cập nhật sản phẩm
   * @param {number} productId - ID sản phẩm
   * @param {FormData} productData - Form data chứa thông tin cập nhật
   * @returns {Promise<Object>}
   */
  async updateProduct(productId, productData) {
    try {
      const response = await this.api.put(`/admin/products/${productId}`, productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã cập nhật sản phẩm'
        };
      }

      throw new Error(response.data.message || 'Cập nhật sản phẩm thất bại');
    } catch (error) {
      console.error('❌ Lỗi cập nhật sản phẩm:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Xóa sản phẩm
   * @param {number} productId - ID sản phẩm
   * @returns {Promise<Object>}
   */
  async deleteProduct(productId) {
    try {
      const response = await this.api.delete(`/admin/products/${productId}`);

      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Đã xóa sản phẩm'
        };
      }

      throw new Error(response.data.message || 'Xóa sản phẩm thất bại');
    } catch (error) {
      console.error('❌ Lỗi xóa sản phẩm:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Bật/tắt trạng thái sản phẩm
   * @param {number} productId - ID sản phẩm
   * @param {boolean} status - Trạng thái mới
   * @returns {Promise<Object>}
   */
  async toggleProductStatus(productId, status) {
    try {
      const response = await this.api.patch(`/admin/products/${productId}/status`, { status });

      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Đã cập nhật trạng thái'
        };
      }

      throw new Error(response.data.message || 'Cập nhật trạng thái thất bại');
    } catch (error) {
      console.error('❌ Lỗi cập nhật trạng thái sản phẩm:', error);
      throw this._handleError(error);
    }
  }

  // ========== QUẢN LÝ DANH MỤC ==========

  /**
   * Lấy danh sách danh mục
   * @returns {Promise<Object>}
   */
  async getCategories() {
    try {
      const response = await this.api.get('/admin/categories');

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          message: response.data.message
        };
      }

      throw new Error(response.data.message || 'Lấy danh mục thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy danh mục:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Tìm kiếm danh mục để autocomplete
   * @param {string} query - Từ khóa tìm kiếm
   * @returns {Promise<Object>}
   */
  async searchCategories(query) {
    try {
      const response = await this.api.get('/admin/categories/search', {
        params: { q: query }
      });

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          message: response.data.message
        };
      }

      throw new Error(response.data.message || 'Tìm kiếm danh mục thất bại');
    } catch (error) {
      console.error('❌ Lỗi tìm kiếm danh mục:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Tạo danh mục mới
   * @param {Object} categoryData
   * @returns {Promise<Object>}
   */
  async createCategory(categoryData) {
    try {
      const response = await this.api.post('/admin/categories', categoryData);

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã tạo danh mục mới'
        };
      }

      throw new Error(response.data.message || 'Tạo danh mục thất bại');
    } catch (error) {
      console.error('❌ Lỗi tạo danh mục:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Cập nhật danh mục
   * @param {number} categoryId - ID danh mục
   * @param {Object} categoryData - Dữ liệu cập nhật
   * @returns {Promise<Object>}
   */
  async updateCategory(categoryId, categoryData) {
    try {
      const response = await this.api.put(`/admin/categories/${categoryId}`, categoryData);

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã cập nhật danh mục'
        };
      }

      throw new Error(response.data.message || 'Cập nhật danh mục thất bại');
    } catch (error) {
      console.error('❌ Lỗi cập nhật danh mục:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Xóa danh mục
   * @param {number} categoryId - ID danh mục
   * @returns {Promise<Object>}
   */
  async deleteCategory(categoryId) {
    try {
      const response = await this.api.delete(`/admin/categories/${categoryId}`);

      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Đã xóa danh mục'
        };
      }

      throw new Error(response.data.message || 'Xóa danh mục thất bại');
    } catch (error) {
      console.error('❌ Lỗi xóa danh mục:', error);
      throw this._handleError(error);
    }
  }

  // ========== QUẢN LÝ THƯƠNG HIỆU ==========

  /**
   * Lấy danh sách thương hiệu
   * @returns {Promise<Object>}
   */
  async getBrands() {
    try {
      const response = await this.api.get('/admin/brands');

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          message: response.data.message
        };
      }

      throw new Error(response.data.message || 'Lấy thương hiệu thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy thương hiệu:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Tìm kiếm thương hiệu để autocomplete
   * @param {string} query - Từ khóa tìm kiếm
   * @returns {Promise<Object>}
   */
  async searchBrands(query) {
    try {
      const response = await this.api.get('/admin/brands/search', {
        params: { q: query }
      });

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          message: response.data.message
        };
      }

      throw new Error(response.data.message || 'Tìm kiếm thương hiệu thất bại');
    } catch (error) {
      console.error('❌ Lỗi tìm kiếm thương hiệu:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Tạo thương hiệu mới
   * @param {FormData|Object} brandData - FormData nếu có file upload, hoặc Object nếu chỉ có text
   * @returns {Promise<Object>}
   */
  async createBrand(brandData) {
    try {
      // Axios tự động xử lý Content-Type cho FormData
      const config = brandData instanceof FormData 
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};
      
      const response = await this.api.post('/admin/brands', brandData, config);

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã tạo thương hiệu mới'
        };
      }

      throw new Error(response.data.message || 'Tạo thương hiệu thất bại');
    } catch (error) {
      console.error('❌ Lỗi tạo thương hiệu:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Cập nhật thương hiệu
   * @param {number} brandId - ID thương hiệu
   * @param {FormData|Object} brandData - FormData nếu có file upload, hoặc Object nếu chỉ có text
   * @returns {Promise<Object>}
   */
  async updateBrand(brandId, brandData) {
    try {
      // Axios tự động xử lý Content-Type cho FormData
      const config = brandData instanceof FormData 
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};
      
      const response = await this.api.put(`/admin/brands/${brandId}`, brandData, config);

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã cập nhật thương hiệu'
        };
      }

      throw new Error(response.data.message || 'Cập nhật thương hiệu thất bại');
    } catch (error) {
      console.error('❌ Lỗi cập nhật thương hiệu:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Xóa thương hiệu
   * @param {number} brandId - ID thương hiệu
   * @returns {Promise<Object>}
   */
  async deleteBrand(brandId) {
    try {
      const response = await this.api.delete(`/admin/brands/${brandId}`);

      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Đã xóa thương hiệu'
        };
      }

      throw new Error(response.data.message || 'Xóa thương hiệu thất bại');
    } catch (error) {
      console.error('❌ Lỗi xóa thương hiệu:', error);
      throw this._handleError(error);
    }
  }

  // ========== QUẢN LÝ NGƯỜI DÙNG ==========

  /**
   * Lấy danh sách người dùng
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>}
   */
  async getUsers(params = {}) {
    try {
      const response = await this.api.get('/admin/users', { params });

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          pagination: response.data.pagination,
          message: response.data.message
        };
      }

      throw new Error(response.data.message || 'Lấy danh sách người dùng thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy người dùng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Lấy chi tiết người dùng
   * @param {number} userId - ID người dùng
   * @returns {Promise<Object>}
   */
  async getUserDetail(userId) {
    try {
      const response = await this.api.get(`/admin/users/${userId}`);

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }

      throw new Error(response.data.message || 'Lấy thông tin người dùng thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy chi tiết người dùng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Cập nhật thông tin người dùng
   * @param {number} userId - ID người dùng
   * @param {Object} userData - Dữ liệu cập nhật
   * @returns {Promise<Object>}
   */
  async updateUser(userId, userData) {
    try {
      const response = await this.api.put(`/admin/users/${userId}`, userData);

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã cập nhật người dùng'
        };
      }

      throw new Error(response.data.message || 'Cập nhật người dùng thất bại');
    } catch (error) {
      console.error('❌ Lỗi cập nhật người dùng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * ✅ THÊM: Tạo người dùng mới
   * @param {Object} userData - Dữ liệu người dùng mới
   * @returns {Promise<Object>}
   */
  async createUser(userData) {
    try {
      const response = await this.api.post('/admin/users', userData);

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã tạo người dùng mới'
        };
      }

      throw new Error(response.data.message || 'Tạo người dùng thất bại');
    } catch (error) {
      console.error('❌ Lỗi tạo người dùng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Khóa/mở khóa tài khoản
   * @param {number} userId - ID người dùng
   * @param {boolean} enable - Trạng thái (true: active, false: inactive)
   * @returns {Promise<Object>}
   */
  async toggleUserStatus(userId, enable) {
    try {
      // ✅ SỬA: Gửi "enable" thay vì "status" để khớp với backend
      const response = await this.api.patch(`/admin/users/${userId}/status`, { enable });

      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Đã cập nhật trạng thái tài khoản'
        };
      }

      throw new Error(response.data.message || 'Cập nhật trạng thái thất bại');
    } catch (error) {
      console.error('❌ Lỗi cập nhật trạng thái tài khoản:', error);
      throw this._handleError(error);
    }
  }

  /**
   * ✅ THÊM: Xóa người dùng
   * @param {number} userId - ID người dùng
   * @returns {Promise<Object>}
   */
  async deleteUser(userId) {
    try {
      const response = await this.api.delete(`/admin/users/${userId}`);

      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Đã xóa người dùng'
        };
      }

      throw new Error(response.data.message || 'Xóa người dùng thất bại');
    } catch (error) {
      console.error('❌ Lỗi xóa người dùng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Đổi vai trò người dùng
   * @param {number} userId - ID người dùng
   * @param {string} role - Vai trò mới (Admin/NhanVien/KhachHang)
   * @returns {Promise<Object>}
   */
  async changeUserRole(userId, role) {
    try {
      const response = await this.api.patch(`/admin/users/${userId}/role`, { role });

      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Đã thay đổi vai trò'
        };
      }

      throw new Error(response.data.message || 'Thay đổi vai trò thất bại');
    } catch (error) {
      console.error('❌ Lỗi đổi vai trò:', error);
      throw this._handleError(error);
    }
  }

  // ========== QUẢN LÝ ĐƠN HÀNG ==========

  /**
   * Lấy tất cả đơn hàng (Admin view)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>}
   */
  async getAllOrders(params = {}) {
    try {
      const response = await this.api.get('/admin/orders', { params });

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          pagination: response.data.pagination,
          statistics: response.data.statistics,
          message: response.data.message
        };
      }

      throw new Error(response.data.message || 'Lấy danh sách đơn hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy đơn hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * ⭐ Lấy số lượng đơn hàng theo trạng thái
   * @returns {Promise<Object>}
   */
  async getOrderCountsByStatus() {
    try {
      const response = await this.api.get('/admin/orders/counts/by-status');

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data.counts,
          message: response.data.message
        };
      }

      throw new Error(response.data.message || 'Lấy số lượng đơn hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy số lượng đơn hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * ✅ Lấy danh sách khách hàng từ đơn hàng (bao gồm cả khách vãng lai có số điện thoại)
   * @returns {Promise<Object>}
   */
  async getCustomersFromOrders() {
    try {
      const response = await this.api.get('/admin/orders/customers');

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          message: response.data.message
        };
      }

      throw new Error(response.data.message || 'Lấy danh sách khách hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy danh sách khách hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * ✅ THÊM: Xác nhận đơn hàng (Chờ xử lý → Đã xác nhận)
   * @param {number} orderId - ID đơn hàng
   * @param {Object} data - Dữ liệu bổ sung (ghiChu)
   * @returns {Promise<Object>}
   */
  async confirmOrder(orderId, data = {}) {
    try {
      const response = await this.api.post(`/admin/orders/${orderId}/confirm`, data);

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
   * ✅ THÊM: Chuyển sang đóng gói (Đã xác nhận → Đang đóng gói)
   * @param {number} orderId - ID đơn hàng
   * @returns {Promise<Object>}
   */
  async packOrder(orderId) {
    try {
      const response = await this.api.post(`/admin/orders/${orderId}/pack`);

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã chuyển sang đóng gói'
        };
      }

      throw new Error(response.data.message || 'Chuyển sang đóng gói thất bại');
    } catch (error) {
      console.error('❌ Lỗi chuyển sang đóng gói:', error);
      throw this._handleError(error);
    }
  }

  /**
   * 🚚 THÊM MỚI: Tạo đơn GHN và lấy mã vận đơn (BƯỚC 1: Đang đóng gói → Chờ in vận đơn)
   * @param {number} orderId - ID đơn hàng
   * @param {Object} data - { weight, note, useGHN }
   * @returns {Promise<Object>}
   */
  async createShippingOrder(orderId, data = {}) {
    try {
      const response = await this.api.post(`/admin/orders/${orderId}/create-shipping`, {
        useGHN: data.useGHN !== false, // Mặc định true
        weight: data.weight || 500,
        note: data.note || ''
      });

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã tạo đơn vận chuyển'
        };
      }

      throw new Error(response.data.message || 'Tạo đơn vận chuyển thất bại');
    } catch (error) {
      console.error('❌ Lỗi tạo đơn vận chuyển:', error);
      throw this._handleError(error);
    }
  }

  /**
   * ✅ THÊM MỚI: Xác nhận đã đóng gói xong (Đang đóng gói → Sẵn sàng giao hàng)
   * @param {number} orderId - ID đơn hàng
   * @returns {Promise<Object>}
   */
  async markAsPacked(orderId) {
    try {
      const response = await this.api.post(`/admin/orders/${orderId}/packed`);

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã xác nhận đóng gói xong'
        };
      }

      throw new Error(response.data.message || 'Xác nhận đóng gói thất bại');
    } catch (error) {
      console.error('❌ Lỗi xác nhận đóng gói:', error);
      throw this._handleError(error);
    }
  }

  /**
   * ✅ SỬA: Bàn giao shipper (BƯỚC 2: Sẵn sàng giao hàng → Đang giao hàng)
   * ⚠️ CHỈ GỌI SAU KHI đã dán mã vận đơn lên kiện hàng
   * @param {number} orderId - ID đơn hàng
   * @param {Object} data - { confirmed }
   * @returns {Promise<Object>}
   */
  async shipOrder(orderId, data = {}) {
    try {
      const response = await this.api.post(`/admin/orders/${orderId}/ship`, {
        confirmed: data.confirmed || true
      });

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã bàn giao shipper'
        };
      }

      throw new Error(response.data.message || 'Bàn giao shipper thất bại');
    } catch (error) {
      console.error('❌ Lỗi bàn giao shipper:', error);
      throw this._handleError(error);
    }
  }

  /**
   * ✅ THÊM: Xác nhận đã giao hàng (Đang giao hàng → Đã giao hàng)
   * @param {number} orderId - ID đơn hàng
   * @returns {Promise<Object>}
   */
  async markAsDelivered(orderId) {
    try {
      const response = await this.api.post(`/admin/orders/${orderId}/delivered`);

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã xác nhận giao hàng'
        };
      }

      throw new Error(response.data.message || 'Xác nhận giao hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi xác nhận giao hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * ✅ THÊM: Hoàn thành đơn hàng (Đã giao hàng → Hoàn thành)
   * @param {number} orderId - ID đơn hàng
   * @returns {Promise<Object>}
   */
  async completeOrder(orderId) {
    try {
      const response = await this.api.post(`/admin/orders/${orderId}/complete`);

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã hoàn thành đơn hàng'
        };
      }

      throw new Error(response.data.message || 'Hoàn thành đơn hàng thất bại');
    } catch (error) {
      console.error('❌ Lỗi hoàn thành đơn hàng:', error);
      throw this._handleError(error);
    }
  }

  /**
   * ✅ THÊM: Đánh dấu giao hàng thất bại
   * @param {number} orderId - ID đơn hàng
   * @param {Object} data - { lyDo }
   * @returns {Promise<Object>}
   */
  async markDeliveryFailed(orderId, data = {}) {
    try {
      const response = await this.api.post(`/admin/orders/${orderId}/delivery-failed`, data);

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã đánh dấu giao thất bại'
        };
      }

      throw new Error(response.data.message || 'Đánh dấu giao thất bại thất bại');
    } catch (error) {
      console.error('❌ Lỗi đánh dấu giao thất bại:', error);
      throw this._handleError(error);
    }
  }

  /**
   * ✅ THÊM: Cập nhật trạng thái đơn hàng (general)
   * @param {number} orderId - ID đơn hàng
   * @param {Object} data - { trangThai, ghiChu }
   * @returns {Promise<Object>}
   */
  async updateOrderStatus(orderId, data) {
    try {
      const response = await this.api.patch(`/admin/orders/${orderId}/status`, data);

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
   * ✅ THÊM: Xem tracking đơn hàng GHN
   * @param {number} orderId - ID đơn hàng
   * @returns {Promise<Object>}
   */
  async getOrderTracking(orderId) {
    try {
      const response = await this.api.get(`/admin/orders/${orderId}/tracking`);

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }

      throw new Error(response.data.message || 'Lấy tracking thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy tracking:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Cập nhật đơn hàng (legacy - dùng updateOrderStatus thay thế)
   * @param {number} orderId - ID đơn hàng
   * @param {Object} orderData - Dữ liệu cập nhật
   * @returns {Promise<Object>}
   */
  async updateOrder(orderId, orderData) {
    return this.updateOrderStatus(orderId, orderData);
  }

  // ========== QUẢN LÝ VOUCHER ==========

  /**
   * Lấy danh sách voucher
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>}
   */
  async getVouchers(params = {}) {
    try {
      const response = await this.api.get('/admin/vouchers', { params });

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          pagination: response.data.pagination,
          message: response.data.message
        };
      }

      throw new Error(response.data.message || 'Lấy danh sách voucher thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy voucher:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Tạo voucher mới
   * @param {Object} voucherData - Thông tin voucher
   * @returns {Promise<Object>}
   */
  async createVoucher(voucherData) {
    try {
      const response = await this.api.post('/admin/vouchers', voucherData);

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã tạo voucher mới'
        };
      }

      throw new Error(response.data.message || 'Tạo voucher thất bại');
    } catch (error) {
      console.error('❌ Lỗi tạo voucher:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Cập nhật voucher
   * @param {number} voucherId - ID voucher
   * @param {Object} voucherData - Dữ liệu cập nhật
   * @returns {Promise<Object>}
   */
  async updateVoucher(voucherId, voucherData) {
    try {
      const response = await this.api.put(`/admin/vouchers/${voucherId}`, voucherData);

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Đã cập nhật voucher'
        };
      }

      throw new Error(response.data.message || 'Cập nhật voucher thất bại');
    } catch (error) {
      console.error('❌ Lỗi cập nhật voucher:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Xóa voucher
   * @param {number} voucherId - ID voucher
   * @returns {Promise<Object>}
   */
  async deleteVoucher(voucherId) {
    try {
      const response = await this.api.delete(`/admin/vouchers/${voucherId}`);

      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Đã xóa voucher'
        };
      }

      throw new Error(response.data.message || 'Xóa voucher thất bại');
    } catch (error) {
      console.error('❌ Lỗi xóa voucher:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Đổi trạng thái voucher
   * @param {number} voucherId - ID voucher
   * @param {string} status - Trạng thái mới (HoatDong/TamDung/HetHan)
   * @returns {Promise<Object>}
   */
  async changeVoucherStatus(voucherId, status) {
    try {
      const response = await this.api.patch(`/admin/vouchers/${voucherId}/status`, { status });

      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Đã cập nhật trạng thái voucher'
        };
      }

      throw new Error(response.data.message || 'Cập nhật trạng thái thất bại');
    } catch (error) {
      console.error('❌ Lỗi đổi trạng thái voucher:', error);
      throw this._handleError(error);
    }
  }

  // ========== THỐNG KÊ & BÁO CÁO ==========

  /**
   * Lấy thống kê dashboard
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>}
   */
  async getDashboardStatistics(params = {}) {
    try {
      const response = await this.api.get('/admin/statistics/dashboard', { params });

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }

      throw new Error(response.data.message || 'Lấy thống kê thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy thống kê dashboard:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Lấy báo cáo doanh thu
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async getRevenueReport(params = {}) {
    try {
      const response = await this.api.get('/admin/statistics/revenue', { params });

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }

      throw new Error(response.data.message || 'Lấy báo cáo doanh thu thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy báo cáo doanh thu:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Lấy báo cáo sản phẩm bán chạy
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async getTopSellingProducts(params = {}) {
    try {
      const response = await this.api.get('/admin/statistics/top-products', { params });

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
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
   * Xuất báo cáo (Excel/PDF)
   * @param {string} reportType - Loại báo cáo
   * @param {Object} params - Parameters
   * @returns {Promise<Object>}
   */
  async exportReport(reportType, params = {}) {
    try {
      const response = await this.api.get(`/admin/reports/export/${reportType}`, {
        params,
        responseType: 'blob'
      });

      // Tạo file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return {
        success: true,
        message: 'Đã xuất báo cáo thành công'
      };
    } catch (error) {
      console.error('❌ Lỗi xuất báo cáo:', error);
      throw this._handleError(error);
    }
  }

  // ========== QUẢN LÝ ĐÁNH GIÁ ==========

  /**
   * Duyệt đánh giá
   * @param {number} reviewId - ID đánh giá
   * @param {string} status - Trạng thái (DaDuyet/BiTuChoi)
   * @returns {Promise<Object>}
   */
  async moderateReview(reviewId, status) {
    try {
      const response = await this.api.patch(`/admin/reviews/${reviewId}/moderate`, { status });

      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Đã cập nhật trạng thái đánh giá'
        };
      }

      throw new Error(response.data.message || 'Duyệt đánh giá thất bại');
    } catch (error) {
      console.error('❌ Lỗi duyệt đánh giá:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Xóa đánh giá
   * @param {number} reviewId - ID đánh giá
   * @returns {Promise<Object>}
   */
  async deleteReview(reviewId) {
    try {
      const response = await this.api.delete(`/admin/reviews/${reviewId}`);

      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Đã xóa đánh giá'
        };
      }

      throw new Error(response.data.message || 'Xóa đánh giá thất bại');
    } catch (error) {
      console.error('❌ Lỗi xóa đánh giá:', error);
      throw this._handleError(error);
    }
  }

  // ========== TIỆN ÍCH ==========

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
   * Format ngày tháng
   * @param {string} date - ISO date string
   * @returns {string}
   */
  formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
  }

  /**
   * Validate dữ liệu sản phẩm
   * @param {Object} productData
   * @returns {Object}
   */
  validateProductData(productData) {
    const errors = {};

    if (!productData.name || productData.name.trim() === '') {
      errors.name = 'Vui lòng nhập tên sản phẩm';
    }

    if (!productData.categoryId) {
      errors.categoryId = 'Vui lòng chọn danh mục';
    }

    if (!productData.price || productData.price <= 0) {
      errors.price = 'Giá phải lớn hơn 0';
    }

    if (!productData.stock || productData.stock < 0) {
      errors.stock = 'Số lượng tồn không được âm';
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
          return new Error('Bạn không có quyền truy cập');
        case 404:
          return new Error(data.message || 'Không tìm thấy thông tin');
        case 409:
          return new Error(data.message || 'Dữ liệu đã tồn tại');
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
export default new AdminService();
