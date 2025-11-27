const db = require('../models');
const { Op, Sequelize } = require('sequelize');
const DTOMapper = require('../utils/DTOMapper');
const { deleteOldBannerImage } = require('../middlewares/upload.middleware');

const Banner = db.Banner;

/**
 * 📋 Lấy danh sách tất cả banner (admin)
 * GET /api/admin/banners
 */
exports.getAllBanners = async (req, res) => {
  try {
    console.log('📋 Admin lấy danh sách banners');

    const banners = await Banner.findAll({
      order: [['ThuTu', 'ASC'], ['ID', 'DESC']]
    });

    const bannersData = banners.map(b => DTOMapper.toCamelCase({
      ID: b.ID,
      HinhAnhUrl: b.HinhAnhUrl,
      Link: b.Link,
      ThuTu: b.ThuTu,
      IsActive: b.IsActive === 1 || b.IsActive === true,
      NgayTao: b.NgayTao,
      NgayCapNhat: b.NgayCapNhat
    }));

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách banner thành công',
      data: { banners: bannersData }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy danh sách banner:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * 🔍 Lấy chi tiết 1 banner
 * GET /api/admin/banners/:id
 */
exports.getBannerById = async (req, res) => {
  try {
    const bannerId = parseInt(req.params.id);

    if (!bannerId || bannerId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID banner không hợp lệ'
      });
    }

    const banner = await Banner.findByPk(bannerId);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy banner'
      });
    }

    const bannerDTO = DTOMapper.toCamelCase({
      ID: banner.ID,
      HinhAnhUrl: banner.HinhAnhUrl,
      Link: banner.Link,
      ThuTu: banner.ThuTu,
      IsActive: banner.IsActive === 1 || banner.IsActive === true,
      NgayTao: banner.NgayTao,
      NgayCapNhat: banner.NgayCapNhat
    });

    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết banner thành công',
      data: { banner: bannerDTO }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy chi tiết banner:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * ➕ Tạo banner mới
 * POST /api/admin/banners
 */
exports.createBanner = async (req, res) => {
  try {
    console.log('➕ Admin tạo banner mới');
    console.log('📁 File upload:', req.file ? req.file.filename : 'Không có file');

    const { link, thuTu, isActive } = req.body;

    // ✅ XỬ LÝ FILE UPLOAD
    let hinhAnhUrl = null;
    
    if (req.file) {
      // Nếu có file upload, lưu đường dẫn
      hinhAnhUrl = `/uploads/banner/${req.file.filename}`;
      console.log('✅ Đã upload file banner:', hinhAnhUrl);
    } else if (req.body.hinhAnhUrl) {
      // Hỗ trợ base64 string (tương thích ngược)
      hinhAnhUrl = req.body.hinhAnhUrl.trim();
      console.log('⚠️ Sử dụng base64 string (không khuyến khích)');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload hình ảnh banner'
      });
    }

    // Tạo banner mới
    const newBanner = await Banner.create({
      HinhAnhUrl: hinhAnhUrl,
      Link: link || '/products',
      ThuTu: thuTu || 1,
      IsActive: isActive !== undefined ? isActive : true,
      NgayTao: Sequelize.literal('GETDATE()'),
      NgayCapNhat: Sequelize.literal('GETDATE()')
    });

    const bannerDTO = DTOMapper.toCamelCase({
      ID: newBanner.ID,
      HinhAnhUrl: newBanner.HinhAnhUrl,
      Link: newBanner.Link,
      ThuTu: newBanner.ThuTu,
      IsActive: newBanner.IsActive === 1 || newBanner.IsActive === true,
      NgayTao: newBanner.NgayTao,
      NgayCapNhat: newBanner.NgayCapNhat
    });

    res.status(201).json({
      success: true,
      message: 'Tạo banner thành công',
      data: { banner: bannerDTO }
    });

  } catch (error) {
    console.error('❌ Lỗi tạo banner:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * ✏️ Cập nhật banner
 * PUT /api/admin/banners/:id
 */
exports.updateBanner = async (req, res) => {
  try {
    const bannerId = parseInt(req.params.id);

    if (!bannerId || bannerId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID banner không hợp lệ'
      });
    }

    const banner = await Banner.findByPk(bannerId);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy banner'
      });
    }

    const { link, thuTu, isActive } = req.body;

    // ✅ XỬ LÝ FILE UPLOAD MỚI (nếu có)
    if (req.file) {
      // Xóa file banner cũ (nếu không phải base64)
      if (banner.HinhAnhUrl && !banner.HinhAnhUrl.startsWith('data:image/')) {
        deleteOldBannerImage(banner.HinhAnhUrl);
      }
      
      // Lưu đường dẫn file mới
      banner.HinhAnhUrl = `/uploads/banner/${req.file.filename}`;
      console.log('✅ Đã cập nhật file banner:', banner.HinhAnhUrl);
    } else if (req.body.hinhAnhUrl !== undefined) {
      // Hỗ trợ base64 string (tương thích ngược)
      // Xóa file cũ nếu đang dùng file
      if (banner.HinhAnhUrl && !banner.HinhAnhUrl.startsWith('data:image/')) {
        deleteOldBannerImage(banner.HinhAnhUrl);
      }
      banner.HinhAnhUrl = req.body.hinhAnhUrl.trim();
    }

    // Update các fields khác
    if (link !== undefined) {
      banner.Link = link || '/products';
    }
    if (thuTu !== undefined) {
      banner.ThuTu = thuTu;
    }
    if (isActive !== undefined) {
      banner.IsActive = isActive;
    }
    banner.NgayCapNhat = Sequelize.literal('GETDATE()');

    await banner.save();

    const bannerDTO = DTOMapper.toCamelCase({
      ID: banner.ID,
      HinhAnhUrl: banner.HinhAnhUrl,
      Link: banner.Link,
      ThuTu: banner.ThuTu,
      IsActive: banner.IsActive === 1 || banner.IsActive === true,
      NgayTao: banner.NgayTao,
      NgayCapNhat: banner.NgayCapNhat
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật banner thành công',
      data: { banner: bannerDTO }
    });

  } catch (error) {
    console.error('❌ Lỗi cập nhật banner:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * 🔄 Toggle trạng thái banner (ẩn/hiện)
 * PATCH /api/admin/banners/:id/toggle
 */
exports.toggleBannerStatus = async (req, res) => {
  try {
    const bannerId = parseInt(req.params.id);

    if (!bannerId || bannerId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID banner không hợp lệ'
      });
    }

    const banner = await Banner.findByPk(bannerId);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy banner'
      });
    }

    // Toggle IsActive
    banner.IsActive = !banner.IsActive;
    banner.NgayCapNhat = Sequelize.literal('GETDATE()');
    await banner.save();

    const bannerDTO = DTOMapper.toCamelCase({
      ID: banner.ID,
      HinhAnhUrl: banner.HinhAnhUrl,
      Link: banner.Link,
      ThuTu: banner.ThuTu,
      IsActive: banner.IsActive === 1 || banner.IsActive === true,
      NgayTao: banner.NgayTao,
      NgayCapNhat: banner.NgayCapNhat
    });

    res.status(200).json({
      success: true,
      message: `Banner đã được ${bannerDTO.isActive ? 'hiển thị' : 'ẩn'}`,
      data: { banner: bannerDTO }
    });

  } catch (error) {
    console.error('❌ Lỗi toggle trạng thái banner:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * 🗑️ Xóa banner
 * DELETE /api/admin/banners/:id
 */
exports.deleteBanner = async (req, res) => {
  try {
    const bannerId = parseInt(req.params.id);

    if (!bannerId || bannerId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID banner không hợp lệ'
      });
    }

    const banner = await Banner.findByPk(bannerId);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy banner'
      });
    }

    // ✅ XÓA FILE BANNER (nếu không phải base64)
    if (banner.HinhAnhUrl && !banner.HinhAnhUrl.startsWith('data:image/')) {
      deleteOldBannerImage(banner.HinhAnhUrl);
    }

    await banner.destroy();

    res.status(200).json({
      success: true,
      message: 'Xóa banner thành công'
    });

  } catch (error) {
    console.error('❌ Lỗi xóa banner:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

