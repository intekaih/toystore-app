const db = require('../models');
const LoaiSP = db.LoaiSP;
const SanPham = db.SanPham;
const { Op } = require('sequelize');

/**
 * GET /api/admin/categories
 * Lấy danh sách tất cả danh mục
 */
exports.getAllCategories = async (req, res) => {
  try {
    console.log('📂 Admin - Lấy danh sách danh mục');

    // Lấy tất cả danh mục kèm theo số lượng sản phẩm
    const categories = await LoaiSP.findAll({
      attributes: [
        'ID',
        'Ten',
        'MoTa',
        'Enable',
        [
          db.sequelize.literal(`(
            SELECT COUNT(*)
            FROM SanPham
            WHERE SanPham.LoaiID = LoaiSP.ID
            AND SanPham.Enable = 1
          )`),
          'soLuongSanPham'
        ]
      ],
      order: [['ID', 'ASC']]
    });

    console.log(`✅ Lấy ${categories.length} danh mục thành công`);

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách danh mục thành công',
      data: {
        categories: categories.map(cat => ({
          id: cat.ID,
          ten: cat.Ten,
          moTa: cat.MoTa,
          enable: cat.Enable,
          soLuongSanPham: parseInt(cat.dataValues.soLuongSanPham) || 0
        })),
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

    const { Ten, MoTa } = req.body;

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

    // Tạo danh mục mới
    const newCategory = await LoaiSP.create({
      Ten: Ten.trim(),
      MoTa: MoTa ? MoTa.trim() : null,
      Enable: true
    });

    console.log('✅ Tạo danh mục mới thành công:', newCategory.Ten);

    res.status(201).json({
      success: true,
      message: 'Tạo danh mục mới thành công',
      data: {
        category: {
          id: newCategory.ID,
          ten: newCategory.Ten,
          moTa: newCategory.MoTa,
          enable: newCategory.Enable
        }
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

    const { Ten, MoTa, Enable } = req.body;

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

    if (MoTa !== undefined && MoTa && MoTa.length > 500) {
      errors.push('Mô tả không được vượt quá 500 ký tự');
    }

    if (Enable !== undefined && typeof Enable !== 'boolean') {
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

    // Tạo object dữ liệu cần cập nhật
    const updateData = {};
    
    if (Ten !== undefined) {
      updateData.Ten = Ten.trim();
    }
    
    if (MoTa !== undefined) {
      updateData.MoTa = MoTa ? MoTa.trim() : null;
    }

    if (Enable !== undefined) {
      updateData.Enable = Enable;
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

    res.status(200).json({
      success: true,
      message: 'Cập nhật danh mục thành công',
      data: {
        category: {
          id: updatedCategory.ID,
          ten: updatedCategory.Ten,
          moTa: updatedCategory.MoTa,
          enable: updatedCategory.Enable
        }
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

    // Kiểm tra danh mục có sản phẩm không
    const productCount = await SanPham.count({
      where: {
        LoaiID: categoryId,
        Enable: true
      }
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa danh mục này vì còn ${productCount} sản phẩm đang sử dụng`,
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

    res.status(200).json({
      success: true,
      message: 'Xóa danh mục thành công',
      data: {
        deletedCategory: {
          id: categoryId,
          ten: categoryName
        }
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
