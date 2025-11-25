const db = require('../models');
const { Op } = require('sequelize');
const DTOMapper = require('../utils/DTOMapper');

/**
 * 🌟 HỆ THỐNG ĐÁNH GIÁ MVP
 * Theo cấu trúc DB: 8 cột (ID, SanPhamID, TaiKhoanID, SoSao, NoiDung, HinhAnh1, TrangThai, NgayTao)
 */

// ============================================
// 📦 USER APIs - Khách hàng đánh giá
// ============================================

/**
 * 1️⃣ Lấy danh sách sản phẩm có thể đánh giá (từ đơn hàng hoàn thành)
 * GET /api/reviews/reviewable-products
 */
exports.getReviewableProducts = async (req, res) => {
  try {
    console.log('📦 [MVP] Lấy sản phẩm có thể đánh giá cho user:', req.user?.id);

    const taiKhoanId = req.user?.id || req.userId;
    
    if (!taiKhoanId) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập'
      });
    }

    // Tìm khách hàng
    const khachHang = await db.KhachHang.findOne({
      where: { TaiKhoanID: taiKhoanId }
    });

    if (!khachHang) {
      return res.status(200).json({
        success: true,
        message: 'Bạn chưa có đơn hàng nào',
        data: { products: [] }
      });
    }

    // ✅ CHỈ LẤY ĐơN HÀNG ĐÃ HOÀN THÀNH
    const completedOrders = await db.HoaDon.findAll({
      where: {
        KhachHangID: khachHang.ID,
        TrangThai: 'Hoàn thành' // 🎯 Điều kiện quan trọng nhất
      },
      include: [{
        model: db.ChiTietHoaDon,
        as: 'chiTiet',
        include: [{
          model: db.SanPham,
          as: 'sanPham',
          attributes: ['ID', 'Ten', 'HinhAnhURL', 'GiaBan']
        }]
      }],
      order: [['NgayLap', 'DESC']]
    });

    if (completedOrders.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Bạn chưa có đơn hàng nào hoàn thành',
        data: { products: [] }
      });
    }

    // Lấy danh sách đã đánh giá
    const existingReviews = await db.DanhGiaSanPham.findAll({
      where: { TaiKhoanID: taiKhoanId },
      attributes: ['SanPhamID']
    });

    const reviewedProductIds = new Set(existingReviews.map(r => r.SanPhamID));
    const reviewableProducts = [];
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Tạo danh sách sản phẩm chưa đánh giá
    for (const order of completedOrders) {
      for (const item of order.chiTiet) {
        // Chỉ thêm nếu chưa đánh giá
        if (!reviewedProductIds.has(item.SanPhamID)) {
          reviewableProducts.push({
            hoaDonId: order.ID,
            maHD: order.MaHD,
            ngayLap: order.NgayLap,
            sanPham: {
              id: item.sanPham.ID,
              ten: item.sanPham.Ten,
              hinhAnh: item.sanPham.HinhAnhURL ? `${baseUrl}${item.sanPham.HinhAnhURL}` : null,
              giaBan: parseFloat(item.sanPham.GiaBan),
              soLuongDaMua: item.SoLuong
            }
          });
          
          // MVP: Mỗi sản phẩm chỉ hiện 1 lần (dù mua nhiều đơn)
          reviewedProductIds.add(item.SanPhamID);
        }
      }
    }

    console.log(`✅ Tìm thấy ${reviewableProducts.length} sản phẩm có thể đánh giá`);

    res.status(200).json({
      success: true,
      message: reviewableProducts.length > 0 
        ? `Bạn có ${reviewableProducts.length} sản phẩm có thể đánh giá` 
        : 'Bạn đã đánh giá tất cả sản phẩm',
      data: { products: reviewableProducts }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy sản phẩm có thể đánh giá:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 2️⃣ Kiểm tra có thể đánh giá sản phẩm không
 * GET /api/reviews/can-review/:sanPhamId
 */
exports.checkCanReview = async (req, res) => {
  try {
    const sanPhamId = parseInt(req.params.sanPhamId);
    const taiKhoanId = req.user?.id || req.userId;

    if (!sanPhamId || !taiKhoanId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin'
      });
    }

    // Kiểm tra đã đánh giá chưa
    const existingReview = await db.DanhGiaSanPham.findOne({
      where: {
        TaiKhoanID: taiKhoanId,
        SanPhamID: sanPhamId
      }
    });

    if (existingReview) {
      return res.status(200).json({
        success: false,
        message: 'Bạn đã đánh giá sản phẩm này rồi',
        data: { canReview: false, reason: 'ALREADY_REVIEWED' }
      });
    }

    // Kiểm tra đã mua và hoàn thành chưa
    const khachHang = await db.KhachHang.findOne({
      where: { TaiKhoanID: taiKhoanId }
    });

    if (!khachHang) {
      return res.status(200).json({
        success: false,
        message: 'Bạn chưa mua sản phẩm này',
        data: { canReview: false, reason: 'NOT_PURCHASED' }
      });
    }

    const completedOrder = await db.HoaDon.findOne({
      where: {
        KhachHangID: khachHang.ID,
        TrangThai: 'Hoàn thành'
      },
      include: [{
        model: db.ChiTietHoaDon,
        as: 'chiTiet',
        where: { SanPhamID: sanPhamId },
        required: true
      }]
    });

    if (!completedOrder) {
      return res.status(200).json({
        success: false,
        message: 'Bạn chưa mua hoặc đơn hàng chưa hoàn thành',
        data: { canReview: false, reason: 'ORDER_NOT_COMPLETED' }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bạn có thể đánh giá sản phẩm này',
      data: { canReview: true }
    });

  } catch (error) {
    console.error('❌ Lỗi kiểm tra quyền đánh giá:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 3️⃣ Tạo đánh giá mới
 * POST /api/reviews
 * Body: { sanPhamId, soSao, noiDung?, hinhAnh? (file upload) }
 */
exports.createReview = async (req, res) => {
  try {
    console.log('📝 [MVP] Tạo đánh giá mới:', req.body);
    console.log('📸 File upload:', req.file); // Log file thông tin

    const { sanPhamId, soSao, noiDung } = req.body;
    const taiKhoanId = req.user?.id || req.userId;

    // ✅ XỬ LÝ FILE UPLOAD (nếu có)
    let hinhAnh1 = null;
    if (req.file) {
      // Lưu đường dẫn tương đối để truy cập qua browser
      hinhAnh1 = `/uploads/temp/${req.file.filename}`;
      console.log('✅ Upload ảnh thành công:', hinhAnh1);
    }

    // Validate input
    if (!sanPhamId || !soSao) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: sanPhamId và soSao là bắt buộc'
      });
    }

    if (soSao < 1 || soSao > 5) {
      return res.status(400).json({
        success: false,
        message: 'Số sao phải từ 1 đến 5'
      });
    }

    // ✅ KIỂM TRA: Đã đánh giá chưa
    const existingReview = await db.DanhGiaSanPham.findOne({
      where: {
        TaiKhoanID: taiKhoanId,
        SanPhamID: sanPhamId
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đánh giá sản phẩm này rồi'
      });
    }

    // ✅ KIỂM TRA: Đã mua và hoàn thành chưa
    const khachHang = await db.KhachHang.findOne({
      where: { TaiKhoanID: taiKhoanId }
    });

    if (!khachHang) {
      return res.status(403).json({
        success: false,
        message: 'Không tìm thấy thông tin khách hàng'
      });
    }

    const completedOrder = await db.HoaDon.findOne({
      where: {
        KhachHangID: khachHang.ID,
        TrangThai: 'Hoàn thành'
      },
      include: [{
        model: db.ChiTietHoaDon,
        as: 'chiTiet',
        where: { SanPhamID: sanPhamId },
        required: true
      }]
    });

    if (!completedOrder) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chưa mua sản phẩm này hoặc đơn hàng chưa hoàn thành'
      });
    }

    // ✅ Tạo đánh giá và HIỂN THỊ NGAY (TrangThai = 'DaDuyet')
    const reviewData = {
      SanPhamID: sanPhamId,
      TaiKhoanID: taiKhoanId,
      SoSao: soSao,
      NoiDung: noiDung || null,
      HinhAnh1: hinhAnh1, // ✅ Lưu đường dẫn ảnh
      TrangThai: 'DaDuyet' // ⭐ Hiển thị ngay lập tức
    };

    const review = await db.DanhGiaSanPham.create(reviewData);

    // ⭐ Tự động cập nhật thống kê sản phẩm ngay lập tức
    await updateProductStatistics(review.SanPhamID);

    // Lấy lại với thông tin đầy đủ
    const reviewDetail = await db.DanhGiaSanPham.findByPk(review.ID, {
      include: [
        {
          model: db.TaiKhoan,
          as: 'taiKhoan',
          attributes: ['ID', 'HoTen', 'Email']
        },
        {
          model: db.SanPham,
          as: 'sanPham',
          attributes: ['ID', 'Ten', 'HinhAnhURL']
        }
      ]
    });

    console.log('✅ Tạo đánh giá thành công và hiển thị ngay:', review.ID);

    res.status(201).json({
      success: true,
      message: 'Đánh giá của bạn đã được gửi thành công!',
      data: {
        review: DTOMapper.toCamelCase({
          ID: reviewDetail.ID,
          SanPhamID: reviewDetail.SanPhamID,
          TaiKhoanID: reviewDetail.TaiKhoanID,
          SoSao: reviewDetail.SoSao,
          NoiDung: reviewDetail.NoiDung,
          HinhAnh1: reviewDetail.HinhAnh1,
          TrangThai: reviewDetail.TrangThai,
          NgayTao: reviewDetail.NgayTao,
          TaiKhoan: reviewDetail.taiKhoan,
          SanPham: reviewDetail.sanPham
        })
      }
    });

  } catch (error) {
    console.error('❌ Lỗi tạo đánh giá:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 4️⃣ Lấy đánh giá của user hiện tại
 * GET /api/reviews/user/me
 */
exports.getMyReviews = async (req, res) => {
  try {
    const taiKhoanId = req.user?.id || req.userId;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows } = await db.DanhGiaSanPham.findAndCountAll({
      where: { TaiKhoanID: taiKhoanId },
      include: [{
        model: db.SanPham,
        as: 'sanPham',
        attributes: ['ID', 'Ten', 'HinhAnhURL', 'GiaBan']
      }],
      order: [['NgayTao', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const reviews = rows.map(review => DTOMapper.toCamelCase({
      ID: review.ID,
      SanPhamID: review.SanPhamID,
      SoSao: review.SoSao,
      NoiDung: review.NoiDung,
      HinhAnh1: review.HinhAnh1,
      TrangThai: review.TrangThai,
      NgayTao: review.NgayTao,
      SanPham: {
        ID: review.sanPham.ID,
        Ten: review.sanPham.Ten,
        HinhAnhURL: review.sanPham.HinhAnhURL ? `${baseUrl}${review.sanPham.HinhAnhURL}` : null,
        GiaBan: parseFloat(review.sanPham.GiaBan)
      }
    }));

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách đánh giá thành công',
      data: {
        reviews,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy đánh giá của user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// 🌍 PUBLIC APIs - Hiển thị đánh giá
// ============================================

/**
 * 5️⃣ Lấy đánh giá của sản phẩm (Public)
 * GET /api/reviews/product/:sanPhamId
 */
exports.getProductReviews = async (req, res) => {
  try {
    const sanPhamId = parseInt(req.params.sanPhamId);
    const { page = 1, limit = 10, soSao } = req.query;

    if (!sanPhamId) {
      return res.status(400).json({
        success: false,
        message: 'ID sản phẩm không hợp lệ'
      });
    }

    const whereClause = {
      SanPhamID: sanPhamId,
      TrangThai: 'DaDuyet' // Chỉ lấy đánh giá đã duyệt
    };

    // Lọc theo số sao nếu có
    if (soSao) {
      whereClause.SoSao = parseInt(soSao);
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await db.DanhGiaSanPham.findAndCountAll({
      where: whereClause,
      include: [{
        model: db.TaiKhoan,
        as: 'taiKhoan',
        attributes: ['ID', 'HoTen']
      }],
      order: [['NgayTao', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // ✅ THÊM BASE URL CHO ẢNH
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const reviews = rows.map(review => DTOMapper.toCamelCase({
      ID: review.ID,
      SoSao: review.SoSao,
      NoiDung: review.NoiDung,
      HinhAnh1: review.HinhAnh1 ? `${baseUrl}${review.HinhAnh1}` : null, // ✅ Thêm base URL
      NgayTao: review.NgayTao,
      TaiKhoan: {
        HoTen: review.taiKhoan.HoTen
      }
    }));

    // Thống kê số sao
    const statistics = await db.DanhGiaSanPham.findAll({
      where: {
        SanPhamID: sanPhamId,
        TrangThai: 'DaDuyet'
      },
      attributes: [
        'SoSao',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('ID')), 'count']
      ],
      group: ['SoSao'],
      raw: true
    });

    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    statistics.forEach(stat => {
      starCounts[stat.SoSao] = parseInt(stat.count);
    });

    const totalReviews = Object.values(starCounts).reduce((a, b) => a + b, 0);
    const avgRating = totalReviews > 0
      ? Object.entries(starCounts).reduce((sum, [star, count]) => sum + star * count, 0) / totalReviews
      : 0;

    res.status(200).json({
      success: true,
      message: 'Lấy đánh giá sản phẩm thành công',
      data: {
        reviews,
        statistics: {
          totalReviews,
          averageRating: parseFloat(avgRating.toFixed(2)),
          starCounts
        },
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy đánh giá sản phẩm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// 👑 ADMIN APIs - Quản lý đánh giá
// ============================================

/**
 * 6️⃣ Lấy tất cả đánh giá (Admin)
 * GET /api/reviews/admin/all
 */
exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, trangThai } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (trangThai) {
      whereClause.TrangThai = trangThai;
    }

    const { count, rows } = await db.DanhGiaSanPham.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.TaiKhoan,
          as: 'taiKhoan',
          attributes: ['ID', 'HoTen', 'Email']
        },
        {
          model: db.SanPham,
          as: 'sanPham',
          attributes: ['ID', 'Ten', 'HinhAnhURL']
        }
      ],
      order: [['NgayTao', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    const reviews = rows.map(review => DTOMapper.toCamelCase({
      ID: review.ID,
      SanPhamID: review.SanPhamID,
      TaiKhoanID: review.TaiKhoanID,
      SoSao: review.SoSao,
      NoiDung: review.NoiDung,
      HinhAnh1: review.HinhAnh1,
      TrangThai: review.TrangThai,
      NgayTao: review.NgayTao,
      TaiKhoan: review.taiKhoan,
      SanPham: review.sanPham
    }));

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách đánh giá thành công',
      data: {
        reviews,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy tất cả đánh giá:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 7️⃣ Duyệt đánh giá (Admin)
 * PUT /api/reviews/admin/:id/approve
 */
exports.approveReview = async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);

    const review = await db.DanhGiaSanPham.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    if (review.TrangThai === 'DaDuyet') {
      return res.status(400).json({
        success: false,
        message: 'Đánh giá đã được duyệt rồi'
      });
    }

    // Cập nhật trạng thái
    await review.update({ TrangThai: 'DaDuyet' });

    // Cập nhật thống kê sản phẩm
    await updateProductStatistics(review.SanPhamID);

    console.log(`✅ Admin duyệt đánh giá #${reviewId}`);

    res.status(200).json({
      success: true,
      message: 'Duyệt đánh giá thành công',
      data: {
        review: DTOMapper.toCamelCase({
          ID: review.ID,
          TrangThai: review.TrangThai
        })
      }
    });

  } catch (error) {
    console.error('❌ Lỗi duyệt đánh giá:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 8️⃣ Từ chối đánh giá (Admin)
 * PUT /api/reviews/admin/:id/reject
 */
exports.rejectReview = async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);

    const review = await db.DanhGiaSanPham.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    // Cập nhật trạng thái
    await review.update({ TrangThai: 'BiTuChoi' });

    console.log(`✅ Admin từ chối đánh giá #${reviewId}`);

    res.status(200).json({
      success: true,
      message: 'Từ chối đánh giá thành công',
      data: {
        review: DTOMapper.toCamelCase({
          ID: review.ID,
          TrangThai: review.TrangThai
        })
      }
    });

  } catch (error) {
    console.error('❌ Lỗi từ chối đánh giá:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * ⭐ MỚI: Xóa đánh giá (Admin)
 * DELETE /api/reviews/admin/:id
 */
exports.deleteReview = async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);

    const review = await db.DanhGiaSanPham.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    const sanPhamId = review.SanPhamID;

    // Xóa đánh giá
    await review.destroy();

    // Cập nhật lại thống kê sản phẩm
    await updateProductStatistics(sanPhamId);

    console.log(`✅ Admin xóa đánh giá #${reviewId}`);

    res.status(200).json({
      success: true,
      message: 'Xóa đánh giá thành công'
    });

  } catch (error) {
    console.error('❌ Lỗi xóa đánh giá:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// 🔧 HELPER FUNCTIONS
// ============================================

/**
 * Cập nhật thống kê đánh giá của sản phẩm
 */
async function updateProductStatistics(sanPhamId) {
  try {
    // Lấy tất cả đánh giá đã duyệt
    const reviews = await db.DanhGiaSanPham.findAll({
      where: {
        SanPhamID: sanPhamId,
        TrangThai: 'DaDuyet'
      },
      attributes: ['SoSao']
    });

    const tongSoDanhGia = reviews.length;
    const diemTrungBinh = tongSoDanhGia > 0
      ? reviews.reduce((sum, r) => sum + r.SoSao, 0) / tongSoDanhGia
      : 0;

    // Cập nhật vào bảng SanPham
    await db.SanPham.update(
      {
        TongSoDanhGia: tongSoDanhGia,
        DiemTrungBinh: parseFloat(diemTrungBinh.toFixed(2))
      },
      {
        where: { ID: sanPhamId }
      }
    );

    console.log(`✅ Cập nhật thống kê sản phẩm #${sanPhamId}: ${tongSoDanhGia} đánh giá, ${diemTrungBinh.toFixed(2)} sao`);

  } catch (error) {
    console.error('❌ Lỗi cập nhật thống kê sản phẩm:', error);
  }
}
