/**
 * Review Service - MVP
 * Đồng bộ với backend: 8 APIs (4 User + 1 Public + 3 Admin)
 */
import axios from 'axios';
import config from '../config';
import authService from './authService';

const API_URL = config.API_URL;

class ReviewService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor để tự động gửi token
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
  // 📦 USER APIs (Cần đăng nhập)
  // ============================================

  /**
   * 1️⃣ Lấy danh sách sản phẩm có thể đánh giá (từ đơn hàng hoàn thành)
   * GET /api/reviews/reviewable-products
   */
  async getReviewableProducts() {
    try {
      const response = await this.api.get('/reviews/reviewable-products');
      
      if (response.data && response.data.success) {
        return {
          success: true,
          products: response.data.data?.products || [],
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy danh sách thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy sản phẩm có thể đánh giá:', error);
      throw this._handleError(error);
    }
  }

  /**
   * 2️⃣ Kiểm tra có thể đánh giá sản phẩm không
   * GET /api/reviews/can-review/:sanPhamId
   */
  async checkCanReview(sanPhamId) {
    try {
      const response = await this.api.get(`/reviews/can-review/${sanPhamId}`);
      
      return {
        success: response.data.success,
        canReview: response.data.data?.canReview || false,
        reason: response.data.data?.reason,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Lỗi kiểm tra quyền đánh giá:', error);
      throw this._handleError(error);
    }
  }

  /**
   * 3️⃣ Tạo đánh giá mới
   * POST /api/reviews
   * Body: { sanPhamId, soSao, noiDung?, hinhAnh1? }
   */
  async createReview(reviewData) {
    try {
      // Validate dữ liệu
      const validation = this.validateReviewData(reviewData);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0]);
      }

      // ✅ SỬ DỤNG FORMDATA KHI CÓ ẢNH
      let payload;
      let headers = {};

      if (reviewData.hinhAnh1 && reviewData.hinhAnh1 instanceof File) {
        // Nếu có file ảnh, dùng FormData
        const formData = new FormData();
        formData.append('sanPhamId', reviewData.sanPhamId);
        formData.append('soSao', reviewData.soSao);
        if (reviewData.noiDung) {
          formData.append('noiDung', reviewData.noiDung);
        }
        formData.append('hinhAnh', reviewData.hinhAnh1); // ✅ Field name phải là 'hinhAnh'
        
        payload = formData;
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        // Không có ảnh, gửi JSON như cũ
        payload = {
          sanPhamId: reviewData.sanPhamId,
          soSao: reviewData.soSao,
          noiDung: reviewData.noiDung || null,
          hinhAnh1: null
        };
      }

      const response = await this.api.post('/reviews', payload, { headers });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          review: response.data.data?.review,
          message: response.data.message || 'Đã gửi đánh giá thành công'
        };
      }
      
      throw new Error(response.data.message || 'Gửi đánh giá thất bại');
    } catch (error) {
      console.error('❌ Lỗi tạo đánh giá:', error);
      throw this._handleError(error);
    }
  }

  /**
   * 4️⃣ Lấy đánh giá của user hiện tại
   * GET /api/reviews/user/me
   */
  async getMyReviews(params = { page: 1, limit: 10 }) {
    try {
      const response = await this.api.get('/reviews/user/me', { params });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          reviews: response.data.data?.reviews || [],
          pagination: response.data.data?.pagination,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy danh sách thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy đánh giá của tôi:', error);
      throw this._handleError(error);
    }
  }

  // ============================================
  // 🌍 PUBLIC APIs (Không cần đăng nhập)
  // ============================================

  /**
   * 5️⃣ Lấy đánh giá của sản phẩm (Public, có thống kê)
   * GET /api/reviews/product/:sanPhamId
   */
  async getProductReviews(sanPhamId, params = { page: 1, limit: 10, soSao: null }) {
    try {
      const response = await this.api.get(`/reviews/product/${sanPhamId}`, { params });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          reviews: response.data.data?.reviews || [],
          statistics: response.data.data?.statistics || {},
          pagination: response.data.data?.pagination,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy đánh giá thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy đánh giá sản phẩm:', error);
      throw this._handleError(error);
    }
  }

  // ============================================
  // 👑 ADMIN APIs (Cần quyền Admin)
  // ============================================

  /**
   * 6️⃣ Lấy tất cả đánh giá (Admin)
   * GET /api/reviews/admin/all
   */
  async getAllReviews(params = { page: 1, limit: 20, trangThai: null }) {
    try {
      const response = await this.api.get('/reviews/admin/all', { params });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          reviews: response.data.data?.reviews || [],
          pagination: response.data.data?.pagination,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Lấy danh sách thất bại');
    } catch (error) {
      console.error('❌ Lỗi lấy tất cả đánh giá:', error);
      throw this._handleError(error);
    }
  }

  /**
   * 7️⃣ Duyệt đánh giá (Admin)
   * PUT /api/reviews/admin/:id/approve
   */
  async approveReview(reviewId) {
    try {
      const response = await this.api.put(`/reviews/admin/${reviewId}/approve`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          review: response.data.data?.review,
          message: response.data.message || 'Duyệt đánh giá thành công'
        };
      }
      
      throw new Error(response.data.message || 'Duyệt đánh giá thất bại');
    } catch (error) {
      console.error('❌ Lỗi duyệt đánh giá:', error);
      throw this._handleError(error);
    }
  }

  /**
   * 8️⃣ Từ chối đánh giá (Admin)
   * PUT /api/reviews/admin/:id/reject
   */
  async rejectReview(reviewId) {
    try {
      const response = await this.api.put(`/reviews/admin/${reviewId}/reject`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          review: response.data.data?.review,
          message: response.data.message || 'Từ chối đánh giá thành công'
        };
      }
      
      throw new Error(response.data.message || 'Từ chối đánh giá thất bại');
    } catch (error) {
      console.error('❌ Lỗi từ chối đánh giá:', error);
      throw this._handleError(error);
    }
  }

  // ============================================
  // 🔧 UTILITY FUNCTIONS
  // ============================================

  /**
   * Format rating display
   */
  formatRating(rating, totalReviews = 0) {
    const stars = Number(rating) || 0;
    const total = Number(totalReviews) || 0;
    
    return {
      stars: stars.toFixed(1),
      starsNumber: stars,
      total,
      percentage: (stars / 5) * 100,
      text: total > 0 ? `${stars.toFixed(1)} (${total} đánh giá)` : 'Chưa có đánh giá',
      starArray: this._generateStarArray(stars)
    };
  }

  /**
   * Tạo mảng sao để hiển thị
   */
  _generateStarArray(rating) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }
    
    if (hasHalfStar && fullStars < 5) {
      stars.push('half');
    }
    
    while (stars.length < 5) {
      stars.push('empty');
    }
    
    return stars;
  }

  /**
   * Format ngày tháng đánh giá
   */
  formatReviewDate(date) {
    if (!date) return '';
    
    const reviewDate = new Date(date);
    const now = new Date();
    
    // ✅ SỬA LỖI: Reset giờ phút giây để so sánh chính xác theo ngày
    const reviewDateOnly = new Date(reviewDate.getFullYear(), reviewDate.getMonth(), reviewDate.getDate());
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = nowDateOnly - reviewDateOnly; // Thời gian chênh lệch (milliseconds)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Số ngày chênh lệch
    
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    
    return reviewDate.toLocaleDateString('vi-VN');
  }

  /**
   * Validate dữ liệu đánh giá
   */
  validateReviewData(reviewData) {
    const errors = {};
    
    if (!reviewData.sanPhamId) {
      errors.sanPhamId = 'Vui lòng chọn sản phẩm';
    }
    
    if (!reviewData.soSao || reviewData.soSao < 1 || reviewData.soSao > 5) {
      errors.soSao = 'Vui lòng chọn số sao từ 1-5';
    }
    
    if (reviewData.noiDung && reviewData.noiDung.length > 1000) {
      errors.noiDung = 'Nội dung không được vượt quá 1000 ký tự';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Xử lý lỗi
   */
  _handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return new Error(data.message || 'Dữ liệu không hợp lệ');
        case 401:
          return new Error('Vui lòng đăng nhập để đánh giá');
        case 403:
          return new Error('Bạn chưa mua sản phẩm này hoặc đơn hàng chưa hoàn thành');
        case 404:
          return new Error(data.message || 'Không tìm thấy đánh giá');
        case 500:
          return new Error('Lỗi máy chủ, vui lòng thử lại sau');
        default:
          return new Error(data.message || `Lỗi ${status}`);
      }
    } else if (error.request) {
      return new Error('Không thể kết nối đến máy chủ');
    }
    return error;
  }
}

export default new ReviewService();
