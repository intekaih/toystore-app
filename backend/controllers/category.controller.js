const db = require('../models');
const LoaiSP = db.LoaiSP;
const SanPham = db.SanPham;
const ThuongHieu = db.ThuongHieu; // ✅ THÊM import ThuongHieu
const { Op } = require('sequelize');
const DTOMapper = require('../utils/DTOMapper');

/**
 * GET /api/admin/categories/search?q=...
 * Tìm kiếm danh mục để autocomplete
 */
exports.searchCategories = async (req, res) => {
  try {
    const query = req.query.q || '';
    
    const categories = await LoaiSP.findAll({
      where: {
        Ten: {
          [Op.like]: `%${query.trim()}%`
        },
        TrangThai: true
      },
      order: [['Ten', 'ASC']],
      limit: 10
    });

    const categoriesDTO = categories.map(cat => DTOMapper.toCamelCase({
      ID: cat.ID,
      Ten: cat.Ten
    }));

    res.status(200).json({
      success: true,
      data: { categories: categoriesDTO }
    });

  } catch (error) {
    console.error('❌ Lỗi tìm kiếm danh mục:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
};

/**
 * GET /api/admin/categories
 * Lấy danh sách tất cả danh mục
 */
exports.getAllCategories = async (req, res) => {
  try {
    console.log('📂 Admin - Lấy danh sách danh mục');

    // ✅ FIX: Query đơn giản hơn, không dùng group by phức tạp
    const categories = await LoaiSP.findAll({
      order: [['ID', 'ASC']]
    });

    // ✅ Đếm số lượng sản phẩm cho từng danh mục VÀ chuyển sang camelCase ngay
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await SanPham.count({
          where: { 
            LoaiID: cat.ID
            // ✅ Đếm TẤT CẢ sản phẩm (kể cả vô hiệu)
          }
        });

        // ✅ Trả về camelCase đúng format
        return {
          id: cat.ID,  // ✅ "id" chữ thường hoàn toàn
          ten: cat.Ten,
          trangThai: cat.TrangThai,
          soLuongSanPham: productCount
        };
      })
    );

    console.log(`✅ Lấy ${categories.length} danh mục thành công`);

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách danh mục thành công',
      data: {
        categories: categoriesWithCount,  // ✅ Đã là camelCase rồi, không cần DTOMapper
        total: categories.length
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy danh sách danh mục:', error);

    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({
        success: false,
        message: 'Lỗi cơ sở dữ liệu',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Database Error'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * POST /api/admin/categories
 * Thêm danh mục mới
 */
exports.createCategory = async (req, res) => {
  try {
    console.log('➕ Admin - Tạo danh mục mới');
    console.log('📝 Dữ liệu nhận được:', req.body);

    const { Ten } = req.body; // ✅ Bỏ MoTa vì không có trong DB

    // Validate input - Tên là bắt buộc
    if (!Ten || !Ten.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tên danh mục là bắt buộc'
      });
    }

    // Validate độ dài tên
    if (Ten.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Tên danh mục phải có ít nhất 2 ký tự'
      });
    }

    if (Ten.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Tên danh mục không được vượt quá 100 ký tự'
      });
    }

    // Kiểm tra tên danh mục đã tồn tại chưa (không phân biệt hoa thường)
    const existingCategory = await LoaiSP.findOne({
      where: db.sequelize.where(
        db.sequelize.fn('LOWER', db.sequelize.col('Ten')),
        db.sequelize.fn('LOWER', Ten.trim())
      )
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'Tên danh mục đã tồn tại'
      });
    }

    // ✅ Tạo danh mục mới - chỉ có Ten và TrangThai
    const newCategory = await LoaiSP.create({
      Ten: Ten.trim(),
      TrangThai: true
    });

    console.log('✅ Tạo danh mục mới thành công:', newCategory.Ten);

    // ✅ SỬ DỤNG DTOMapper - bỏ MoTa
    res.status(201).json({
      success: true,
      message: 'Tạo danh mục mới thành công',
      data: {
        category: DTOMapper.toCamelCase({
          ID: newCategory.ID,
          Ten: newCategory.Ten,
          TrangThai: newCategory.TrangThai
        })
      }
    });

  } catch (error) {
    console.error('❌ Lỗi tạo danh mục:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Tên danh mục đã tồn tại'
      });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: error.errors.map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * PUT /api/admin/categories/:id
 * Cập nhật danh mục
 */
exports.updateCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    console.log('✏️ Admin - Cập nhật danh mục ID:', categoryId);
    console.log('📝 Dữ liệu nhận được:', req.body);

    // Validate categoryId
    if (!categoryId || categoryId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID danh mục không hợp lệ'
      });
    }

    const { Ten, TrangThai } = req.body; // ✅ Bỏ MoTa

    // Validate dữ liệu đầu vào
    const errors = [];

    if (Ten !== undefined) {
      if (!Ten || !Ten.trim()) {
        errors.push('Tên danh mục không được để trống');
      } else if (Ten.trim().length < 2) {
        errors.push('Tên danh mục phải có ít nhất 2 ký tự');
      } else if (Ten.trim().length > 100) {
        errors.push('Tên danh mục không được vượt quá 100 ký tự');
      }
    }

    if (TrangThai !== undefined && typeof TrangThai !== 'boolean') {
      errors.push('Trạng thái phải là true hoặc false');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors
      });
    }

    // Kiểm tra danh mục có tồn tại không
    const category = await LoaiSP.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    // Kiểm tra tên trùng lặp (nếu tên được cập nhật)
    if (Ten !== undefined && Ten.trim() !== category.Ten) {
      const existingCategory = await LoaiSP.findOne({
        where: {
          [Op.and]: [
            db.sequelize.where(
              db.sequelize.fn('LOWER', db.sequelize.col('Ten')),
              db.sequelize.fn('LOWER', Ten.trim())
            ),
            { ID: { [Op.ne]: categoryId } }
          ]
        }
      });

      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: 'Tên danh mục đã tồn tại'
        });
      }
    }

    // ✅ Tạo object dữ liệu cần cập nhật - bỏ MoTa
    const updateData = {};
    
    if (Ten !== undefined) {
      updateData.Ten = Ten.trim();
    }

    if (TrangThai !== undefined) {
      updateData.TrangThai = TrangThai;
    }

    // Kiểm tra có dữ liệu để cập nhật không
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có dữ liệu để cập nhật'
      });
    }

    // Cập nhật danh mục
    await category.update(updateData);

    // Lấy lại thông tin danh mục đã cập nhật
    const updatedCategory = await LoaiSP.findByPk(categoryId);

    console.log('✅ Cập nhật danh mục thành công:', updatedCategory.Ten);

    // ✅ SỬ DỤNG DTOMapper - bỏ MoTa
    res.status(200).json({
      success: true,
      message: 'Cập nhật danh mục thành công',
      data: {
        category: DTOMapper.toCamelCase({
          ID: updatedCategory.ID,
          Ten: updatedCategory.Ten,
          TrangThai: updatedCategory.TrangThai
        })
      }
    });

  } catch (error) {
    console.error('❌ Lỗi cập nhật danh mục:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Tên danh mục đã tồn tại'
      });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: error.errors.map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * DELETE /api/admin/categories/:id
 * Xóa danh mục (chỉ xóa nếu không có sản phẩm)
 */
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    console.log('🗑️ Admin - Xóa danh mục ID:', categoryId);

    // Validate categoryId
    if (!categoryId || categoryId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID danh mục không hợp lệ'
      });
    }

    // Kiểm tra danh mục có tồn tại không
    const category = await LoaiSP.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    // ✅ Kiểm tra danh mục có sản phẩm không - KIỂM TRA TẤT CẢ sản phẩm
    const productCount = await SanPham.count({
      where: {
        LoaiID: categoryId
        // ✅ Bỏ điều kiện TrangThai: true để kiểm tra TẤT CẢ sản phẩm
      }
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa danh mục này vì còn ${productCount} sản phẩm đang liên quan`,
        data: {
          productCount: productCount
        }
      });
    }

    // Lưu tên danh mục trước khi xóa
    const categoryName = category.Ten;

    // Xóa danh mục
    await category.destroy();

    console.log('✅ Xóa danh mục thành công:', categoryName);

    // ✅ SỬ DỤNG DTOMapper
    res.status(200).json({
      success: true,
      message: 'Xóa danh mục thành công',
      data: {
        deletedCategory: DTOMapper.toCamelCase({
          ID: categoryId,
          Ten: categoryName
        })
      }
    });

  } catch (error) {
    console.error('❌ Lỗi xóa danh mục:', error);

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa danh mục này vì có sản phẩm liên quan'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// ============================================
// 🌐 PUBLIC METHODS - Không cần authentication
// ============================================

/**
 * GET /api/categories
 * Lấy danh sách danh mục công khai (chỉ TrangThai = true)
 */
exports.getPublicCategories = async (req, res) => {
  try {
    console.log('📂 Public - Lấy danh sách danh mục');

    const categories = await LoaiSP.findAll({
      where: {
        TrangThai: true  // ✅ Chỉ lấy danh mục đang hoạt động
      },
      order: [['Ten', 'ASC']]
    });

    // ✅ Đếm số lượng sản phẩm ĐANG BÁN cho từng danh mục
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await SanPham.count({
          where: { 
            LoaiID: cat.ID,
            TrangThai: true  // ✅ Chỉ đếm sản phẩm đang bán
          }
        });

        return {
          id: cat.ID,
          ten: cat.Ten,
          soLuongSanPham: productCount
        };
      })
    );

    console.log(`✅ Lấy ${categories.length} danh mục công khai thành công`);

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách danh mục thành công',
      data: categoriesWithCount
    });

  } catch (error) {
    console.error('❌ Lỗi lấy danh sách danh mục công khai:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * GET /api/categories/brands
 * Lấy danh sách thương hiệu công khai
 */
exports.getPublicBrands = async (req, res) => {
  try {
    console.log('🏷️ Public - Lấy danh sách thương hiệu');

    const brands = await ThuongHieu.findAll({
      where: {
        TrangThai: true  // ✅ Chỉ lấy thương hiệu đang hoạt động
      },
      order: [['TenThuongHieu', 'ASC']]  // ✅ SỬA: 'Ten' → 'TenThuongHieu'
    });

    // Lấy base URL từ request
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // ✅ Đếm số lượng sản phẩm ĐANG BÁN cho từng thương hiệu và thêm logo
    const brandsWithCount = await Promise.all(
      brands.map(async (brand) => {
        const productCount = await SanPham.count({
          where: { 
            ThuongHieuID: brand.ID,
            TrangThai: true  // ✅ Chỉ đếm sản phẩm đang bán
          }
        });

        // Xử lý logo URL
        let logoUrl = null;
        if (brand.Logo) {
          // Nếu logo bắt đầu bằng http thì là URL bên ngoài, giữ nguyên
          // Nếu không thì là đường dẫn local, thêm base URL
          if (brand.Logo.startsWith('http://') || brand.Logo.startsWith('https://')) {
            logoUrl = brand.Logo;
          } else {
            logoUrl = `${baseUrl}${brand.Logo}`;
          }
        }

        return {
          id: brand.ID,
          ten: brand.TenThuongHieu,  // ✅ SỬA: brand.Ten → brand.TenThuongHieu
          tenThuongHieu: brand.TenThuongHieu, // Thêm alias
          logo: logoUrl,
          soLuongSanPham: productCount
        };
      })
    );

    console.log(`✅ Lấy ${brands.length} thương hiệu công khai thành công`);

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách thương hiệu thành công',
      data: brandsWithCount
    });

  } catch (error) {
    console.error('❌ Lỗi lấy danh sách thương hiệu công khai:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};
