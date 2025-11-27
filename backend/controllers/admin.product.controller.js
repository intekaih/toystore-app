const db = require('../models');
const SanPham = db.SanPham;
const SanPhamHinhAnh = db.SanPhamHinhAnh;
const LoaiSP = db.LoaiSP;
const { Op } = require('sequelize');
const { deleteOldImage, renameFileByProductId, moveFilesToProductFolder, deleteProductFolder, cleanupTempFiles } = require('../middlewares/upload.middleware');
const DTOMapper = require('../utils/DTOMapper');

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
    const thuongHieuId = req.query.thuongHieuId || '';
    const stockFilter = req.query.stockFilter || '';
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

    // Lọc theo thương hiệu
    if (thuongHieuId && parseInt(thuongHieuId) > 0) {
      whereCondition.ThuongHieuID = parseInt(thuongHieuId);
    }

    // Lọc theo tồn kho
    if (stockFilter) {
      if (stockFilter === 'in-stock') {
        // Còn hàng: SoLuongTon > 0
        whereCondition.SoLuongTon = {
          [Op.gt]: 0
        };
      } else if (stockFilter === 'out-of-stock') {
        // Hết hàng: SoLuongTon = 0
        whereCondition.SoLuongTon = 0;
      } else if (stockFilter === 'low-stock') {
        // Sắp hết: SoLuongTon > 0 và SoLuongTon < 10
        whereCondition.SoLuongTon = {
          [Op.gt]: 0,
          [Op.lt]: 10
        };
      }
    }

    // Lọc theo trạng thái Enable
    if (enable === 'true') {
      whereCondition.TrangThai = true;
    } else if (enable === 'false') {
      whereCondition.TrangThai = false;
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
          attributes: ['ID', 'Ten']
        },
        {
          model: db.ThuongHieu,
          as: 'thuongHieu',
          attributes: ['ID', 'TenThuongHieu'],
          required: false // ✅ LEFT JOIN để lấy cả sản phẩm không có thương hiệu
        },
        {
          model: SanPhamHinhAnh,
          as: 'hinhAnhs',
          attributes: ['ID', 'DuongDanHinhAnh', 'ThuTu', 'LaMacDinh'],
          required: false // ✅ LEFT JOIN để lấy cả sản phẩm không có hình
        }
      ],
      attributes: [
        'ID',
        'Ten',
        'MoTa',
        'GiaBan',
        'SoLuongTon',
        'HinhAnhURL',
        'LoaiID',
        'ThuongHieuID', // ✅ Thêm ThuongHieuID
        'NgayTao',
        'TrangThai'
      ],
      limit: limit,
      offset: offset,
      order: [
        ['NgayTao', 'DESC'],
        [{ model: SanPhamHinhAnh, as: 'hinhAnhs' }, 'ThuTu', 'ASC']
      ],
      distinct: true
    });

    // Tính toán thông tin phân trang
    const totalProducts = count;
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // ✅ Lấy base URL từ request
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // ✅ SỬ DỤNG DTOMapper để format dữ liệu trả về
    const products = rows.map(product => {
      const productData = {
        ID: product.ID,
        Ten: product.Ten,
        MoTa: product.MoTa,
        GiaBan: parseFloat(product.GiaBan),
        SoLuongTon: product.SoLuongTon,
        HinhAnhURL: product.HinhAnhURL ? `${baseUrl}${product.HinhAnhURL}` : null, // ✅ Thêm base URL
        LoaiID: product.LoaiID,
        ThuongHieuID: product.ThuongHieuID, // ✅ Thêm ThuongHieuID
        NgayTao: product.NgayTao,
        TrangThai: product.TrangThai,
        LoaiSP: product.loaiSP ? {
          ID: product.loaiSP.ID,
          Ten: product.loaiSP.Ten
        } : null,
        ThuongHieu: product.thuongHieu ? { // ✅ Thêm ThuongHieu
          ID: product.thuongHieu.ID,
          TenThuongHieu: product.thuongHieu.TenThuongHieu
        } : null,
        HinhAnhs: product.hinhAnhs ? product.hinhAnhs.map(img => ({
          ID: img.ID,
          DuongDanHinhAnh: `${baseUrl}${img.DuongDanHinhAnh}`, // ✅ Thêm base URL
          ThuTu: img.ThuTu,
          LaMacDinh: img.LaMacDinh
        })) : []
      };
      return DTOMapper.toCamelCase(productData);
    });

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
 * Thêm sản phẩm mới với upload nhiều ảnh
 */
exports.createProduct = async (req, res) => {
  try {
    console.log('➕ Admin - Tạo sản phẩm mới');
    console.log('📝 Body data:', req.body);
    console.log('📁 Files uploaded:', req.files);

    const { Ten, MoTa, GiaBan, Ton, LoaiID, ThuongHieuID } = req.body;

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
      if (req.files && req.files.length > 0) {
        cleanupTempFiles(req.files);
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
        TrangThai: true
      }
    });

    if (!loaiSP) {
      if (req.files && req.files.length > 0) {
        cleanupTempFiles(req.files);
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
      if (req.files && req.files.length > 0) {
        cleanupTempFiles(req.files);
      }
      return res.status(409).json({
        success: false,
        message: 'Tên sản phẩm đã tồn tại'
      });
    }

    // ✅ Tạo object dữ liệu sản phẩm
    const productData = {
      Ten: Ten.trim(),
      MoTa: MoTa ? MoTa.trim() : null,
      GiaBan: parseFloat(GiaBan),
      SoLuongTon: parseInt(Ton),
      LoaiID: parseInt(LoaiID),
      HinhAnhURL: null, // Sẽ lưu URL ảnh chính (ảnh đầu tiên)
      TrangThai: true
    };

    // ✅ Thêm ThuongHieuID nếu có
    if (ThuongHieuID && parseInt(ThuongHieuID) > 0) {
      productData.ThuongHieuID = parseInt(ThuongHieuID);
    }

    // Tạo sản phẩm mới
    const newProduct = await SanPham.create(productData);

    // ✅ Xử lý upload nhiều ảnh vào bảng SanPhamHinhAnh
    if (req.files && req.files.length > 0) {
      const imageUrls = await moveFilesToProductFolder(req.files, newProduct.ID);
      
      if (imageUrls) {
        const urlArray = JSON.parse(imageUrls);
        
        // Lưu từng ảnh vào bảng SanPhamHinhAnh
        const imageRecords = urlArray.map((url, index) => ({
          SanPhamID: newProduct.ID,
          DuongDanHinhAnh: url,
          ThuTu: index,
          LaMacDinh: index === 0 // Ảnh đầu tiên là ảnh chính
        }));
        
        await SanPhamHinhAnh.bulkCreate(imageRecords);
        
        // Cập nhật HinhAnhURL của sản phẩm = ảnh chính (ảnh đầu tiên)
        await newProduct.update({ HinhAnhURL: urlArray[0] });
        
        console.log(`✅ Đã lưu ${urlArray.length} ảnh cho sản phẩm ${newProduct.ID}`);
      }
    }

    console.log('✅ Tạo sản phẩm mới thành công:', newProduct.Ten);

    // Lấy lại thông tin sản phẩm với loại sản phẩm và hình ảnh
    const productDetail = await SanPham.findOne({
      where: { ID: newProduct.ID },
      include: [
        {
          model: LoaiSP,
          as: 'loaiSP',
          attributes: ['ID', 'Ten']
        },
        {
          model: SanPhamHinhAnh,
          as: 'hinhAnhs',
          attributes: ['ID', 'DuongDanHinhAnh', 'ThuTu', 'LaMacDinh'],
          order: [['ThuTu', 'ASC']]
        }
      ]
    });

    // ✅ Lấy base URL từ request
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // ✅ SỬ DỤNG DTOMapper với base URL đầy đủ
    const productDTO = DTOMapper.toCamelCase({
      ID: productDetail.ID,
      Ten: productDetail.Ten,
      MoTa: productDetail.MoTa,
      GiaBan: parseFloat(productDetail.GiaBan),
      SoLuongTon: productDetail.SoLuongTon,
      HinhAnhURL: productDetail.HinhAnhURL ? `${baseUrl}${productDetail.HinhAnhURL}` : null, // ✅ Thêm base URL
      LoaiID: productDetail.LoaiID,
      ThuongHieuID: productDetail.ThuongHieuID,
      NgayTao: productDetail.NgayTao,
      TrangThai: productDetail.TrangThai,
      LoaiSP: productDetail.loaiSP ? {
        ID: productDetail.loaiSP.ID,
        Ten: productDetail.loaiSP.Ten
      } : null,
      HinhAnhs: productDetail.hinhAnhs ? productDetail.hinhAnhs.map(img => ({
        ID: img.ID,
        DuongDanHinhAnh: `${baseUrl}${img.DuongDanHinhAnh}`, // ✅ Thêm base URL
        ThuTu: img.ThuTu,
        LaMacDinh: img.LaMacDinh
      })) : []
    });

    res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm mới thành công',
      data: {
        product: productDTO
      }
    });

  } catch (error) {
    console.error('❌ Lỗi tạo sản phẩm:', error);

    if (req.files && req.files.length > 0) {
      cleanupTempFiles(req.files);
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
    console.log('📁 Files uploaded:', req.files);

    // Validate productId
    if (!productId || productId < 1) {
      if (req.files && req.files.length > 0) {
        cleanupTempFiles(req.files);
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
      if (req.files && req.files.length > 0) {
        cleanupTempFiles(req.files);
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
      if (req.files && req.files.length > 0) {
        cleanupTempFiles(req.files);
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
          TrangThai: true
        }
      });

      if (!loaiSP) {
        if (req.files && req.files.length > 0) {
          cleanupTempFiles(req.files);
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
        if (req.files && req.files.length > 0) {
          cleanupTempFiles(req.files);
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
      updateData.SoLuongTon = parseInt(Ton);
    }

    if (LoaiID !== undefined) {
      updateData.LoaiID = parseInt(LoaiID);
    }

    if (Enable !== undefined) {
      updateData.TrangThai = Enable === 'true' || Enable === true;
    }

    // ✅ Xử lý upload nhiều ảnh mới vào bảng SanPhamHinhAnh
    if (req.files && req.files.length > 0) {
      // Xóa tất cả ảnh cũ của sản phẩm
      const oldImages = await SanPhamHinhAnh.findAll({
        where: { SanPhamID: productId }
      });
      
      // Xóa files cũ
      for (const oldImage of oldImages) {
        deleteOldImage(oldImage.DuongDanHinhAnh);
      }
      
      // Xóa records cũ trong database
      await SanPhamHinhAnh.destroy({
        where: { SanPhamID: productId }
      });
      
      // Xử lý và lưu ảnh mới (với xử lý vuông 1:1)
      const imageUrls = await moveFilesToProductFolder(req.files, productId);
      
      if (imageUrls) {
        const urlArray = JSON.parse(imageUrls);
        
        // Lưu từng ảnh vào bảng SanPhamHinhAnh
        const imageRecords = urlArray.map((url, index) => ({
          SanPhamID: productId,
          DuongDanHinhAnh: url,
          ThuTu: index,
          LaMacDinh: index === 0 // Ảnh đầu tiên là ảnh chính
        }));
        
        await SanPhamHinhAnh.bulkCreate(imageRecords);
        
        // Cập nhật HinhAnhURL của sản phẩm = ảnh chính (ảnh đầu tiên)
        updateData.HinhAnhURL = urlArray[0];
        
        console.log(`✅ Đã cập nhật ${urlArray.length} ảnh cho sản phẩm ${productId}`);
      }
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
        attributes: ['ID', 'Ten'] // ✅ Bỏ 'MoTa'
      }]
    });

    console.log('✅ Cập nhật sản phẩm thành công:', updatedProduct.Ten);

    // ✅ SỬ DỤNG DTOMapper
    const productDTO = DTOMapper.toCamelCase({
      ID: updatedProduct.ID,
      Ten: updatedProduct.Ten,
      MoTa: updatedProduct.MoTa,
      GiaBan: parseFloat(updatedProduct.GiaBan),
      SoLuongTon: updatedProduct.SoLuongTon,
      HinhAnhURL: updatedProduct.HinhAnhURL,
      LoaiID: updatedProduct.LoaiID,
      NgayTao: updatedProduct.NgayTao,
      TrangThai: updatedProduct.TrangThai,
      LoaiSP: updatedProduct.loaiSP ? {
        ID: updatedProduct.loaiSP.ID,
        Ten: updatedProduct.loaiSP.Ten
      } : null
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: {
        product: productDTO
      }
    });

  } catch (error) {
    console.error('❌ Lỗi cập nhật sản phẩm:', error);

    // Xóa files mới upload nếu có lỗi
    if (req.files && req.files.length > 0) {
      cleanupTempFiles(req.files);
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
    if (!product.TrangThai) {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm đã bị vô hiệu hóa trước đó'
      });
    }

    // Lưu thông tin sản phẩm trước khi xóa
    const productName = product.Ten;
    const productImage = product.HinhAnhURL;

    // Soft delete - set Enable = false
    await product.update({ TrangThai: false });

    // ✅ Xóa toàn bộ thư mục sản phẩm
    deleteProductFolder(productId);

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
