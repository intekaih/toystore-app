const db = require('../models');
const { Op } = require('sequelize');
const DanhGiaSanPham = db.DanhGiaSanPham;
const SanPham = db.SanPham;
const TaiKhoan = db.TaiKhoan;
const HoaDon = db.HoaDon;
const ChiTietHoaDon = db.ChiTietHoaDon;
const KhachHang = db.KhachHang;

/**
 * Service xử lý nghiệp vụ đánh giá sản phẩm
 */
class ReviewService {
  /**
   * Kiểm tra khách hàng đã mua sản phẩm chưa
   * @param {number} taiKhoanId - ID tài khoản
   * @param {number} sanPhamId - ID sản phẩm
   * @returns {Promise<boolean>}
   */
  async checkUserPurchasedProduct(taiKhoanId, sanPhamId) {
    try {
      // Lấy thông tin khách hàng từ tài khoản
      const khachHang = await KhachHang.findOne({
        where: { TaiKhoanID: taiKhoanId }
      });

      if (!khachHang) {
        return false;
      }

      // Kiểm tra xem có hóa đơn nào đã hoàn thành chứa sản phẩm này không
      const hoaDon = await HoaDon.findOne({
        where: {
          KhachHangID: khachHang.ID,
          TrangThai: 'DaGiaoHang' // Chỉ cho phép đánh giá khi đã nhận hàng
        },
        include: [{
          model: ChiTietHoaDon,
          as: 'chiTiet',
          where: { SanPhamID: sanPhamId },
          required: true
        }]
      });

      return !!hoaDon;
    } catch (error) {
      console.error('❌ Lỗi kiểm tra lịch sử mua hàng:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra user đã đánh giá sản phẩm chưa
   * @param {number} taiKhoanId 
   * @param {number} sanPhamId 
   * @returns {Promise<boolean>}
   */
  async checkUserReviewedProduct(taiKhoanId, sanPhamId) {
    try {
      const existingReview = await DanhGiaSanPham.findOne({
        where: {
          TaiKhoanID: taiKhoanId,
          SanPhamID: sanPhamId
        }
      });

      return !!existingReview;
    } catch (error) {
      console.error('❌ Lỗi kiểm tra đánh giá:', error);
      throw error;
    }
  }

  /**
   * Tạo đánh giá mới
   * @param {Object} reviewData 
   * @returns {Promise<Object>}
   */
  async createReview({ taiKhoanId, sanPhamId, soSao, noiDung }) {
    console.log('🔧 Service: Tạo đánh giá mới');

    try {
      // 1. Kiểm tra sản phẩm tồn tại
      const sanPham = await SanPham.findByPk(sanPhamId);
      if (!sanPham) {
        throw new Error('Sản phẩm không tồn tại');
      }

      // 2. Kiểm tra đã mua sản phẩm chưa
      const hasPurchased = await this.checkUserPurchasedProduct(taiKhoanId, sanPhamId);
      if (!hasPurchased) {
        throw new Error('Bạn chỉ có thể đánh giá sản phẩm đã mua và đã nhận hàng');
      }

      // 3. Kiểm tra đã đánh giá chưa
      const hasReviewed = await this.checkUserReviewedProduct(taiKhoanId, sanPhamId);
      if (hasReviewed) {
        throw new Error('Bạn đã đánh giá sản phẩm này rồi');
      }

      // 4. Tạo đánh giá mới (mặc định trạng thái ChoDuyet)
      const review = await DanhGiaSanPham.create({
        TaiKhoanID: taiKhoanId,
        SanPhamID: sanPhamId,
        SoSao: soSao,
        NoiDung: noiDung,
        TrangThai: 'ChoDuyet', // Mặc định chờ duyệt
        NgayTao: new Date()
      });

      // 5. Lấy thông tin đầy đủ của đánh giá
      const reviewWithDetails = await DanhGiaSanPham.findByPk(review.ID, {
        include: [
          {
            model: TaiKhoan,
            as: 'taiKhoan',
            attributes: ['ID', 'TenDangNhap', 'Email']
          },
          {
            model: SanPham,
            as: 'sanPham',
            attributes: ['ID', 'Ten', 'HinhAnhURL']
          }
        ]
      });

      return reviewWithDetails;
    } catch (error) {
      console.error('❌ Lỗi tạo đánh giá:', error);
      throw error;
    }
  }

  /**
   * Cập nhật thống kê đánh giá cho sản phẩm
   * @param {number} sanPhamId 
   */
  async updateProductReviewStats(sanPhamId) {
    try {
      // Chỉ tính các đánh giá đã được duyệt
      const reviews = await DanhGiaSanPham.findAll({
        where: {
          SanPhamID: sanPhamId,
          TrangThai: 'DaDuyet'
        }
      });

      const tongSoDanhGia = reviews.length;
      const diemTrungBinh = tongSoDanhGia > 0
        ? reviews.reduce((sum, r) => sum + r.SoSao, 0) / tongSoDanhGia
        : 0;

      // Cập nhật vào bảng SanPham
      await SanPham.update(
        {
          TongSoDanhGia: tongSoDanhGia,
          DiemTrungBinh: Math.round(diemTrungBinh * 10) / 10 // Làm tròn 1 chữ số
        },
        {
          where: { ID: sanPhamId }
        }
      );

      console.log(`✅ Cập nhật thống kê đánh giá sản phẩm ${sanPhamId}: ${tongSoDanhGia} đánh giá, ${diemTrungBinh} sao`);
    } catch (error) {
      console.error('❌ Lỗi cập nhật thống kê đánh giá:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách đánh giá của sản phẩm
   * @param {number} sanPhamId 
   * @param {Object} options - { page, limit, soSao, trangThai }
   * @returns {Promise<Object>}
   */
  async getProductReviews(sanPhamId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        soSao = null,
        trangThai = 'DaDuyet' // Mặc định chỉ lấy đánh giá đã duyệt
      } = options;

      const offset = (page - 1) * limit;

      // Điều kiện where
      const whereCondition = {
        SanPhamID: sanPhamId
      };

      if (trangThai) {
        whereCondition.TrangThai = trangThai;
      }

      if (soSao) {
        whereCondition.SoSao = soSao;
      }

      const { count, rows } = await DanhGiaSanPham.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: TaiKhoan,
            as: 'taiKhoan',
            attributes: ['ID', 'TenDangNhap', 'Email']
          }
        ],
        order: [['NgayTao', 'DESC']],
        limit,
        offset,
        distinct: true
      });

      return {
        reviews: rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalReviews: count,
          reviewsPerPage: limit
        }
      };
    } catch (error) {
      console.error('❌ Lỗi lấy danh sách đánh giá:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê đánh giá theo số sao
   * @param {number} sanPhamId 
   * @returns {Promise<Object>}
   */
  async getReviewStatistics(sanPhamId) {
    try {
      const stats = await DanhGiaSanPham.findAll({
        where: {
          SanPhamID: sanPhamId,
          TrangThai: 'DaDuyet'
        },
        attributes: [
          'SoSao',
          [db.sequelize.fn('COUNT', db.sequelize.col('ID')), 'soLuong']
        ],
        group: ['SoSao'],
        raw: true
      });

      // Format thành object dễ dùng
      const statsByStars = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      };

      stats.forEach(stat => {
        statsByStars[stat.SoSao] = parseInt(stat.soLuong);
      });

      const totalReviews = Object.values(statsByStars).reduce((sum, count) => sum + count, 0);

      return {
        statsByStars,
        totalReviews
      };
    } catch (error) {
      console.error('❌ Lỗi lấy thống kê đánh giá:', error);
      throw error;
    }
  }

  /**
   * Admin duyệt/từ chối đánh giá
   * @param {number} reviewId 
   * @param {string} trangThai - 'DaDuyet' hoặc 'BiTuChoi'
   * @param {string} lyDoTuChoi 
   * @returns {Promise<Object>}
   */
  async moderateReview(reviewId, trangThai, lyDoTuChoi = null) {
    try {
      const review = await DanhGiaSanPham.findByPk(reviewId);

      if (!review) {
        throw new Error('Không tìm thấy đánh giá');
      }

      if (review.TrangThai !== 'ChoDuyet') {
        throw new Error('Chỉ có thể duyệt đánh giá đang chờ duyệt');
      }

      await review.update({
        TrangThai: trangThai,
        LyDoTuChoi: trangThai === 'BiTuChoi' ? lyDoTuChoi : null,
        NgayDuyet: new Date()
      });

      // Nếu duyệt, cập nhật thống kê sản phẩm
      if (trangThai === 'DaDuyet') {
        await this.updateProductReviewStats(review.SanPhamID);
      }

      return review;
    } catch (error) {
      console.error('❌ Lỗi duyệt đánh giá:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách đánh giá của user
   * @param {number} taiKhoanId 
   * @param {Object} options 
   * @returns {Promise<Object>}
   */
  async getUserReviews(taiKhoanId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      const { count, rows } = await DanhGiaSanPham.findAndCountAll({
        where: { TaiKhoanID: taiKhoanId },
        include: [
          {
            model: SanPham,
            as: 'sanPham',
            attributes: ['ID', 'Ten', 'HinhAnhURL', 'GiaBan']
          }
        ],
        order: [['NgayTao', 'DESC']],
        limit,
        offset,
        distinct: true
      });

      return {
        reviews: rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalReviews: count,
          reviewsPerPage: limit
        }
      };
    } catch (error) {
      console.error('❌ Lỗi lấy đánh giá của user:', error);
      throw error;
    }
  }
}

module.exports = new ReviewService();
