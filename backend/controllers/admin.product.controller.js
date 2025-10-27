const db = require('../models');
const SanPham = db.SanPham;
const LoaiSP = db.LoaiSP;
const { Op } = require('sequelize');
const { deleteOldImage, renameFileByProductId } = require('../middlewares/upload.middleware');

/**
 * GET /api/admin/products
 * Lấy danh sách tất cả sản phẩm (bao gồm cả sản phẩm đã vô hiệu hóa)
 */
exports.getAllProducts = async (req, res) => {
  try {
    console.log('📦 Admin - Lấy danh sách sản phẩm');
    console.log('📝 Query params:', req.query);

    // Lấy parameters từ query string
    const pageParam = req.query.page;
    const limitParam = req.query.limit;
    const search = req.query.search || '';
    const loaiId = req.query.loaiId || '';
    const enable = req.query.enable || '';

    // Validate và parse page parameter
    let page = 1;
    if (pageParam !== undefined) {
      if (!/^\d+$/.test(String(pageParam))) {
        return res.status(400).json({
          success: false,
          message: 'Số trang phải là số nguyên dương lớn hơn 0'
        });
      }
      page = parseInt(pageParam);
      if (page < 1) {
        return res.status(400).json({
          success: false,
          message: 'Số trang phải là số nguyên dương lớn hơn 0'
        });
      }
    }

    // Validate và parse limit parameter
    let limit = 10;
    if (limitParam !== undefined) {
      if (!/^\d+$/.test(String(limitParam))) {
        return res.status(400).json({
          success: false,
          message: 'Số lượng sản phẩm mỗi trang phải từ 1 đến 100'
        });
      }
      limit = parseInt(limitParam);
      if (limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          message: 'Số lượng sản phẩm mỗi trang phải từ 1 đến 100'
        });
      }
    }

    // Tính offset
    const offset = (page - 1) * limit;

    console.log(`✅ Validated params - Page: ${page}, Limit: ${limit}, Offset: ${offset}`);

    // Tạo điều kiện tìm kiếm
    const whereCondition = {};

    // Tìm kiếm theo tên sản phẩm
    if (search.trim()) {
      whereCondition.Ten = {
        [Op.like]: `%${search.trim()}%`
      };
    }

    // Lọc theo loại sản phẩm
    if (loaiId && parseInt(loaiId) > 0) {
      whereCondition.LoaiID = parseInt(loaiId);
    }

    // Lọc theo trạng thái Enable
    if (enable === 'true') {
      whereCondition.Enable = true;
    } else if (enable === 'false') {
      whereCondition.Enable = false;
    }
    // Nếu enable === '', lấy tất cả

    console.log('🔍 Điều kiện tìm kiếm:', whereCondition);

    // Truy vấn database với phân trang
    const { count, rows } = await SanPham.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: LoaiSP,
          as: 'loaiSP',
          attributes: ['ID', 'Ten', 'MoTa']
        }
      ],
      attributes: [
        'ID',
        'Ten',
        'MoTa',
        'GiaBan',
        'Ton',
        'HinhAnhURL',
        'LoaiID',
        'NgayTao',
        'Enable'
      ],
      limit: limit,
      offset: offset,
      order: [['NgayTao', 'DESC']],
      distinct: true
    });

    // Tính toán thông tin phân trang
    const totalProducts = count;
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Format dữ liệu trả về
    const products = rows.map(product => ({
      id: product.ID,
      ten: product.Ten,
      moTa: product.MoTa,
      giaBan: parseFloat(product.GiaBan),
      ton: product.Ton,
      hinhAnhURL: product.HinhAnhURL,
      loaiID: product.LoaiID,
      ngayTao: product.NgayTao,
      enable: product.Enable,
      loaiSP: product.loaiSP ? {
        id: product.loaiSP.ID,
        ten: product.loaiSP.Ten,
        moTa: product.loaiSP.MoTa
      } : null
    }));

    console.log(`✅ Lấy ${products.length}/${totalProducts} sản phẩm thành công`);

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách sản phẩm thành công',
      data: {
        products: products,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalProducts: totalProducts,
          productsPerPage: limit,
          hasNextPage: hasNextPage,
          hasPrevPage: hasPrevPage
        },
        filters: {
          search: search.trim() || null,
          loaiId: loaiId || null,
          enable: enable || 'all'
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy danh sách sản phẩm:', error);

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
 * POST /api/admin/products
 * Thêm sản phẩm mới với upload ảnh
 */
exports.createProduct = async (req, res) => {
  try {
    console.log('➕ Admin - Tạo sản phẩm mới');
    console.log('📝 Body data:', req.body);
    console.log('📁 File uploaded:', req.file);

    const { Ten, MoTa, GiaBan, Ton, LoaiID } = req.body;

    // Validate input - Tên, GiaBan, Ton, LoaiID là bắt buộc
    const errors = [];

    if (!Ten || !Ten.trim()) {
      errors.push('Tên sản phẩm là bắt buộc');
    } else if (Ten.trim().length < 2) {
      errors.push('Tên sản phẩm phải có ít nhất 2 ký tự');
    } else if (Ten.trim().length > 200) {
      errors.push('Tên sản phẩm không được vượt quá 200 ký tự');
    }

    if (!GiaBan) {
      errors.push('Giá bán là bắt buộc');
    } else if (isNaN(GiaBan) || parseFloat(GiaBan) < 0) {
      errors.push('Giá bán phải là số không âm');
    }

    if (!Ton && Ton !== 0 && Ton !== '0') {
      errors.push('Số lượng tồn kho là bắt buộc');
    } else if (isNaN(Ton) || parseInt(Ton) < 0) {
      errors.push('Số lượng tồn kho phải là số nguyên không âm');
    }

    if (!LoaiID) {
      errors.push('Loại sản phẩm là bắt buộc');
    } else if (isNaN(LoaiID) || parseInt(LoaiID) < 1) {
      errors.push('Loại sản phẩm không hợp lệ');
    }

    if (MoTa && MoTa.length > 5000) {
      errors.push('Mô tả không được vượt quá 5000 ký tự');
    }

    if (errors.length > 0) {
      // Xóa file đã upload nếu có lỗi validation
      if (req.file) {
        deleteOldImage(req.file.filename);
      }
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors
      });
    }

    // Kiểm tra loại sản phẩm có tồn tại không
    const loaiSP = await LoaiSP.findOne({
      where: {
        ID: parseInt(LoaiID),
        Enable: true
      }
    });

    if (!loaiSP) {
      // Xóa file đã upload nếu loại sản phẩm không tồn tại
      if (req.file) {
        deleteOldImage(req.file.filename);
      }
      return res.status(404).json({
        success: false,
        message: 'Loại sản phẩm không tồn tại hoặc đã bị vô hiệu hóa'
      });
    }

    // Kiểm tra tên sản phẩm đã tồn tại chưa
    const existingProduct = await SanPham.findOne({
      where: db.sequelize.where(
        db.sequelize.fn('LOWER', db.sequelize.col('Ten')),
        db.sequelize.fn('LOWER', Ten.trim())
      )
    });

    if (existingProduct) {
      // Xóa file đã upload nếu tên trùng
      if (req.file) {
        deleteOldImage(req.file.filename);
      }
      return res.status(409).json({
        success: false,
        message: 'Tên sản phẩm đã tồn tại'
      });
    }

    // Tạo sản phẩm mới TRƯỚC (để có ID)
    const newProduct = await SanPham.create({
      Ten: Ten.trim(),
      MoTa: MoTa ? MoTa.trim() : null,
      GiaBan: parseFloat(GiaBan),
      Ton: parseInt(Ton),
      LoaiID: parseInt(LoaiID),
      HinhAnhURL: null, // Tạm thời null, sẽ update sau
      Enable: true
    });

    // Rename file theo ID sản phẩm và cập nhật HinhAnhURL
    let hinhAnhURL = null;
    if (req.file) {
      const newFilename = renameFileByProductId(req.file.filename, newProduct.ID);
      hinhAnhURL = `/uploads/${newFilename}`;
      
      // Cập nhật HinhAnhURL vào database
      await newProduct.update({ HinhAnhURL: hinhAnhURL });
    }

    console.log('✅ Tạo sản phẩm mới thành công:', newProduct.Ten);

    // Lấy lại thông tin sản phẩm với loại sản phẩm
    const productDetail = await SanPham.findOne({
      where: { ID: newProduct.ID },
      include: [{
        model: LoaiSP,
        as: 'loaiSP',
        attributes: ['ID', 'Ten', 'MoTa']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm mới thành công',
      data: {
        product: {
          id: productDetail.ID,
          ten: productDetail.Ten,
          moTa: productDetail.MoTa,
          giaBan: parseFloat(productDetail.GiaBan),
          ton: productDetail.Ton,
          hinhAnhURL: productDetail.HinhAnhURL,
          loaiID: productDetail.LoaiID,
          ngayTao: productDetail.NgayTao,
          enable: productDetail.Enable,
          loaiSP: productDetail.loaiSP ? {
            id: productDetail.loaiSP.ID,
            ten: productDetail.loaiSP.Ten,
            moTa: productDetail.loaiSP.MoTa
          } : null
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi tạo sản phẩm:', error);

    // Xóa file đã upload nếu có lỗi
    if (req.file) {
      deleteOldImage(req.file.filename);
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
 * PUT /api/admin/products/:id
 * Cập nhật sản phẩm
 */
exports.updateProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    console.log('✏️ Admin - Cập nhật sản phẩm ID:', productId);
    console.log('📝 Body data:', req.body);
    console.log('📁 File uploaded:', req.file);

    // Validate productId
    if (!productId || productId < 1) {
      if (req.file) {
        deleteOldImage(req.file.filename);
      }
      return res.status(400).json({
        success: false,
        message: 'ID sản phẩm không hợp lệ'
      });
    }

    const { Ten, MoTa, GiaBan, Ton, LoaiID, Enable } = req.body;

    // Validate dữ liệu đầu vào
    const errors = [];

    if (Ten !== undefined) {
      if (!Ten || !Ten.trim()) {
        errors.push('Tên sản phẩm không được để trống');
      } else if (Ten.trim().length < 2) {
        errors.push('Tên sản phẩm phải có ít nhất 2 ký tự');
      } else if (Ten.trim().length > 200) {
        errors.push('Tên sản phẩm không được vượt quá 200 ký tự');
      }
    }

    if (GiaBan !== undefined) {
      if (isNaN(GiaBan) || parseFloat(GiaBan) < 0) {
        errors.push('Giá bán phải là số không âm');
      }
    }

    if (Ton !== undefined) {
      if (isNaN(Ton) || parseInt(Ton) < 0) {
        errors.push('Số lượng tồn kho phải là số nguyên không âm');
      }
    }

    if (LoaiID !== undefined) {
      if (isNaN(LoaiID) || parseInt(LoaiID) < 1) {
        errors.push('Loại sản phẩm không hợp lệ');
      }
    }

    if (MoTa !== undefined && MoTa && MoTa.length > 5000) {
      errors.push('Mô tả không được vượt quá 5000 ký tự');
    }

    if (Enable !== undefined && typeof Enable !== 'boolean') {
      // Thử convert string to boolean
      if (Enable !== 'true' && Enable !== 'false') {
        errors.push('Trạng thái phải là true hoặc false');
      }
    }

    if (errors.length > 0) {
      if (req.file) {
        deleteOldImage(req.file.filename);
      }
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors
      });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const product = await SanPham.findByPk(productId);

    if (!product) {
      if (req.file) {
        deleteOldImage(req.file.filename);
      }
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Kiểm tra loại sản phẩm nếu được cập nhật
    if (LoaiID !== undefined) {
      const loaiSP = await LoaiSP.findOne({
        where: {
          ID: parseInt(LoaiID),
          Enable: true
        }
      });

      if (!loaiSP) {
        if (req.file) {
          deleteOldImage(req.file.filename);
        }
        return res.status(404).json({
          success: false,
          message: 'Loại sản phẩm không tồn tại hoặc đã bị vô hiệu hóa'
        });
      }
    }

    // Kiểm tra tên trùng lặp (nếu tên được cập nhật)
    if (Ten !== undefined && Ten.trim() !== product.Ten) {
      const existingProduct = await SanPham.findOne({
        where: {
          [Op.and]: [
            db.sequelize.where(
              db.sequelize.fn('LOWER', db.sequelize.col('Ten')),
              db.sequelize.fn('LOWER', Ten.trim())
            ),
            { ID: { [Op.ne]: productId } }
          ]
        }
      });

      if (existingProduct) {
        if (req.file) {
          deleteOldImage(req.file.filename);
        }
        return res.status(409).json({
          success: false,
          message: 'Tên sản phẩm đã tồn tại'
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

    if (GiaBan !== undefined) {
      updateData.GiaBan = parseFloat(GiaBan);
    }

    if (Ton !== undefined) {
      updateData.Ton = parseInt(Ton);
    }

    if (LoaiID !== undefined) {
      updateData.LoaiID = parseInt(LoaiID);
    }

    if (Enable !== undefined) {
      updateData.Enable = Enable === 'true' || Enable === true;
    }

    // Xử lý upload ảnh mới
    if (req.file) {
      // Xóa ảnh cũ nếu có
      if (product.HinhAnhURL) {
        deleteOldImage(product.HinhAnhURL);
      }
      
      // Rename file theo ID sản phẩm
      const newFilename = renameFileByProductId(req.file.filename, productId);
      updateData.HinhAnhURL = `/uploads/${newFilename}`;
    }

    // Kiểm tra có dữ liệu để cập nhật không
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có dữ liệu để cập nhật'
      });
    }

    // Cập nhật sản phẩm
    await product.update(updateData);

    // Lấy lại thông tin sản phẩm đã cập nhật
    const updatedProduct = await SanPham.findOne({
      where: { ID: productId },
      include: [{
        model: LoaiSP,
        as: 'loaiSP',
        attributes: ['ID', 'Ten', 'MoTa']
      }]
    });

    console.log('✅ Cập nhật sản phẩm thành công:', updatedProduct.Ten);

    res.status(200).json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: {
        product: {
          id: updatedProduct.ID,
          ten: updatedProduct.Ten,
          moTa: updatedProduct.MoTa,
          giaBan: parseFloat(updatedProduct.GiaBan),
          ton: updatedProduct.Ton,
          hinhAnhURL: updatedProduct.HinhAnhURL,
          loaiID: updatedProduct.LoaiID,
          ngayTao: updatedProduct.NgayTao,
          enable: updatedProduct.Enable,
          loaiSP: updatedProduct.loaiSP ? {
            id: updatedProduct.loaiSP.ID,
            ten: updatedProduct.loaiSP.Ten,
            moTa: updatedProduct.loaiSP.MoTa
          } : null
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi cập nhật sản phẩm:', error);

    // Xóa file mới upload nếu có lỗi
    if (req.file) {
      deleteOldImage(req.file.filename);
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
 * DELETE /api/admin/products/:id
 * Xóa sản phẩm (soft delete - set Enable = false)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    console.log('🗑️ Admin - Xóa sản phẩm ID:', productId);

    // Validate productId
    if (!productId || productId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID sản phẩm không hợp lệ'
      });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const product = await SanPham.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Kiểm tra sản phẩm đã bị xóa chưa
    if (!product.Enable) {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm đã bị vô hiệu hóa trước đó'
      });
    }

    // Lưu thông tin sản phẩm trước khi xóa
    const productName = product.Ten;
    const productImage = product.HinhAnhURL;

    // Soft delete - set Enable = false
    await product.update({ Enable: false });

    // Xóa ảnh vật lý nếu muốn (tùy chọn)
    // if (productImage) {
    //   deleteOldImage(productImage);
    // }

    console.log('✅ Vô hiệu hóa sản phẩm thành công:', productName);

    res.status(200).json({
      success: true,
      message: 'Vô hiệu hóa sản phẩm thành công',
      data: {
        deletedProduct: {
          id: productId,
          ten: productName,
          hinhAnhURL: productImage
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi xóa sản phẩm:', error);

    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};
