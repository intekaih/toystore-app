const db = require('../models');
const ThuongHieu = db.ThuongHieu;
const { Op } = require('sequelize');
const DTOMapper = require('../utils/DTOMapper');

/**
 * GET /api/admin/brands
 * Lấy danh sách tất cả thương hiệu
 */
exports.getAllBrands = async (req, res) => {
  try {
    console.log('🏷️ Admin - Lấy danh sách thương hiệu');
    
    const search = req.query.search || '';
    const whereCondition = {};
    
    if (search.trim()) {
      whereCondition.TenThuongHieu = {
        [Op.like]: `%${search.trim()}%`
      };
    }

    const brands = await ThuongHieu.findAll({
      where: whereCondition,
      order: [['TenThuongHieu', 'ASC']]
    });

    const brandsDTO = brands.map(brand => DTOMapper.toCamelCase({
      ID: brand.ID,
      TenThuongHieu: brand.TenThuongHieu,
      Logo: brand.Logo,
      TrangThai: brand.TrangThai
    }));

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách thương hiệu thành công',
      data: {
        brands: brandsDTO
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy danh sách thương hiệu:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * POST /api/admin/brands
 * Tạo thương hiệu mới
 */
exports.createBrand = async (req, res) => {
  try {
    console.log('➕ Admin - Tạo thương hiệu mới');
    const { TenThuongHieu, Logo } = req.body;

    if (!TenThuongHieu || !TenThuongHieu.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tên thương hiệu là bắt buộc'
      });
    }

    if (TenThuongHieu.trim().length < 2 || TenThuongHieu.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Tên thương hiệu phải từ 2-100 ký tự'
      });
    }

    // Kiểm tra tên đã tồn tại
    const existing = await ThuongHieu.findOne({
      where: db.sequelize.where(
        db.sequelize.fn('LOWER', db.sequelize.col('TenThuongHieu')),
        db.sequelize.fn('LOWER', TenThuongHieu.trim())
      )
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Tên thương hiệu đã tồn tại'
      });
    }

    const newBrand = await ThuongHieu.create({
      TenThuongHieu: TenThuongHieu.trim(),
      Logo: Logo ? Logo.trim() : null,
      TrangThai: true
    });

    const brandDTO = DTOMapper.toCamelCase({
      ID: newBrand.ID,
      TenThuongHieu: newBrand.TenThuongHieu,
      Logo: newBrand.Logo,
      TrangThai: newBrand.TrangThai
    });

    console.log('✅ Tạo thương hiệu thành công:', newBrand.TenThuongHieu);

    res.status(201).json({
      success: true,
      message: 'Tạo thương hiệu thành công',
      data: { brand: brandDTO }
    });

  } catch (error) {
    console.error('❌ Lỗi tạo thương hiệu:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * PUT /api/admin/brands/:id
 * Cập nhật thương hiệu
 */
exports.updateBrand = async (req, res) => {
  try {
    const brandId = parseInt(req.params.id);
    console.log('✏️ Admin - Cập nhật thương hiệu ID:', brandId);

    if (!brandId || brandId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID thương hiệu không hợp lệ'
      });
    }

    const { TenThuongHieu, Logo } = req.body;

    if (!TenThuongHieu || !TenThuongHieu.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tên thương hiệu là bắt buộc'
      });
    }

    if (TenThuongHieu.trim().length < 2 || TenThuongHieu.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Tên thương hiệu phải từ 2-100 ký tự'
      });
    }

    const brand = await ThuongHieu.findByPk(brandId);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thương hiệu'
      });
    }

    // Kiểm tra tên trùng
    if (TenThuongHieu.trim() !== brand.TenThuongHieu) {
      const existing = await ThuongHieu.findOne({
        where: {
          [Op.and]: [
            db.sequelize.where(
              db.sequelize.fn('LOWER', db.sequelize.col('TenThuongHieu')),
              db.sequelize.fn('LOWER', TenThuongHieu.trim())
            ),
            { ID: { [Op.ne]: brandId } }
          ]
        }
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Tên thương hiệu đã tồn tại'
        });
      }
    }

    await brand.update({
      TenThuongHieu: TenThuongHieu.trim(),
      Logo: Logo ? Logo.trim() : null
    });

    const brandDTO = DTOMapper.toCamelCase({
      ID: brand.ID,
      TenThuongHieu: brand.TenThuongHieu,
      Logo: brand.Logo,
      TrangThai: brand.TrangThai
    });

    console.log('✅ Cập nhật thương hiệu thành công:', brand.TenThuongHieu);

    res.status(200).json({
      success: true,
      message: 'Cập nhật thương hiệu thành công',
      data: { brand: brandDTO }
    });

  } catch (error) {
    console.error('❌ Lỗi cập nhật thương hiệu:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * DELETE /api/admin/brands/:id
 * Xóa thương hiệu (soft delete)
 */
exports.deleteBrand = async (req, res) => {
  try {
    const brandId = parseInt(req.params.id);
    console.log('🗑️ Admin - Xóa thương hiệu ID:', brandId);

    if (!brandId || brandId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID thương hiệu không hợp lệ'
      });
    }

    const brand = await ThuongHieu.findByPk(brandId);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thương hiệu'
      });
    }

    // Kiểm tra có sản phẩm nào đang dùng thương hiệu này không
    const SanPham = db.SanPham;
    const productCount = await SanPham.count({
      where: { ThuongHieuID: brandId }
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa thương hiệu này vì có ${productCount} sản phẩm đang sử dụng`
      });
    }

    await brand.update({ TrangThai: false });

    console.log('✅ Xóa thương hiệu thành công:', brand.TenThuongHieu);

    res.status(200).json({
      success: true,
      message: 'Xóa thương hiệu thành công'
    });

  } catch (error) {
    console.error('❌ Lỗi xóa thương hiệu:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * GET /api/admin/brands/search?q=...
 * Tìm kiếm thương hiệu để autocomplete
 */
exports.searchBrands = async (req, res) => {
  try {
    const query = req.query.q || '';
    
    const brands = await ThuongHieu.findAll({
      where: {
        TenThuongHieu: {
          [Op.like]: `%${query.trim()}%`
        },
        TrangThai: true
      },
      order: [['TenThuongHieu', 'ASC']],
      limit: 10
    });

    const brandsDTO = brands.map(brand => DTOMapper.toCamelCase({
      ID: brand.ID,
      TenThuongHieu: brand.TenThuongHieu
    }));

    res.status(200).json({
      success: true,
      data: { brands: brandsDTO }
    });

  } catch (error) {
    console.error('❌ Lỗi tìm kiếm thương hiệu:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
};
