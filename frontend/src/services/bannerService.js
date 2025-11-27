/**
 * Banner Service
 * Xử lý tất cả API liên quan đến banner
 */
import axios from 'axios';
import config from '../config';
import authService from './authService';

const API_URL = config.API_URL;

class BannerService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor để tự động gửi token cho admin APIs
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

  // ============================================
  // 📦 PUBLIC APIs (Không cần đăng nhập)
  // ============================================

  /**
   * Lấy danh sách banner đang active (public)
   * GET /api/banners
   * @returns {Promise<Object>}
   */
  async getActiveBanners() {
    try {
      const response = await this.api.get('/banners');
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi lấy danh sách banner:', error);
      throw error;
    }
  }

  // ============================================
  // 🔐 ADMIN APIs (Cần đăng nhập và quyền admin)
  // ============================================

  /**
   * Lấy danh sách tất cả banner (admin)
   * GET /api/admin/banners
   * @returns {Promise<Object>}
   */
  async getAllBanners() {
    try {
      const response = await this.api.get('/admin/banners');
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi lấy danh sách banner (admin):', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết banner (admin)
   * GET /api/admin/banners/:id
   * @param {number} id - ID banner
   * @returns {Promise<Object>}
   */
  async getBannerById(id) {
    try {
      const response = await this.api.get(`/admin/banners/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi lấy chi tiết banner:', error);
      throw error;
    }
  }

  /**
   * Tạo banner mới (admin)
   * POST /api/admin/banners
   * @param {FormData|Object} bannerData - Dữ liệu banner (FormData nếu có file, Object nếu base64)
   * @returns {Promise<Object>}
   */
  async createBanner(bannerData) {
    try {
      // Nếu là FormData, không set Content-Type (browser sẽ tự set với boundary)
      const config = bannerData instanceof FormData 
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};
      
      const response = await this.api.post('/admin/banners', bannerData, config);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi tạo banner:', error);
      throw error;
    }
  }

  /**
   * Cập nhật banner (admin)
   * PUT /api/admin/banners/:id
   * @param {number} id - ID banner
   * @param {FormData|Object} bannerData - Dữ liệu banner cập nhật (FormData nếu có file, Object nếu base64)
   * @returns {Promise<Object>}
   */
  async updateBanner(id, bannerData) {
    try {
      // Nếu là FormData, không set Content-Type (browser sẽ tự set với boundary)
      const config = bannerData instanceof FormData 
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};
      
      const response = await this.api.put(`/admin/banners/${id}`, bannerData, config);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi cập nhật banner:', error);
      throw error;
    }
  }

  /**
   * Toggle trạng thái banner (ẩn/hiện) (admin)
   * PATCH /api/admin/banners/:id/toggle
   * @param {number} id - ID banner
   * @returns {Promise<Object>}
   */
  async toggleBannerStatus(id) {
    try {
      const response = await this.api.patch(`/admin/banners/${id}/toggle`);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi toggle trạng thái banner:', error);
      throw error;
    }
  }

  /**
   * Xóa banner (admin)
   * DELETE /api/admin/banners/:id
   * @param {number} id - ID banner
   * @returns {Promise<Object>}
   */
  async deleteBanner(id) {
    try {
      const response = await this.api.delete(`/admin/banners/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi xóa banner:', error);
      throw error;
    }
  }
}

const bannerService = new BannerService();
export default bannerService;

