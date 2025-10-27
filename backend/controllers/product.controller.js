const db = require('../models');
const { Op } = require('sequelize');
const SanPham = db.SanPham;
const LoaiSP = db.LoaiSP;
const ChiTietHoaDon = db.ChiTietHoaDon;

// 🎯 Import Strategy Pattern
const FilterContext = require('../strategies/FilterContext');

// Lấy danh sách tất cả sản phẩm với phân trang và tìm kiếm
exports.getAllProducts = async (req, res) => {
  try {
    console.log('📦 Lấy danh sách sản phẩm - Query params:', req.query);

    // Lấy parameters từ query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    // 🎯 STRATEGY PATTERN: Lấy filterType từ query
    const filterType = req.query.filter || 'newest'; // Mặc định là 'newest'
    
    // Lấy các tham số lọc khác
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : null;
    
    const offset = (page - 1) * limit;

    // Validate parameters
    if (page < 1) {
      return res.status(400).json({
        success: false,
        message: 'Số trang phải lớn hơn 0'
      });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng sản phẩm mỗi trang phải từ 1 đến 100'
      });
    }

    // Tạo điều kiện tìm kiếm
    const whereCondition = {
      Enable: true
    };

    // Thêm điều kiện tìm kiếm theo tên nếu có
    if (search.trim()) {
      whereCondition.Ten = {
        [Op.like]: `%${search.trim()}%`
      };
    }

    console.log('🔍 Điều kiện tìm kiếm:', whereCondition);
    console.log('🎯 Filter type:', filterType);

    // Truy vấn database - Lấy TẤT CẢ sản phẩm trước khi apply strategy
    // Nếu dùng bestSeller strategy, cần include ChiTietHoaDon
    const includeOptions = [
      {
        model: LoaiSP,
        as: 'loaiSP',
        attributes: ['ID', 'Ten', 'MoTa'],
        where: { Enable: true }
      }
    ];

    // Nếu filter là bestSeller, thêm include ChiTietHoaDon
    if (filterType === 'bestSeller') {
      includeOptions.push({
        model: ChiTietHoaDon,
        as: 'chiTietHoaDons', // ✅ Sửa từ 'ChiTietHoaDons' thành 'chiTietHoaDons'
        attributes: ['SoLuong'],
        required: false // LEFT JOIN để lấy cả sản phẩm chưa bán
      });
    }

    const { count, rows } = await SanPham.findAndCountAll({
      where: whereCondition,
      include: includeOptions,
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
      distinct: true
    });

    console.log(`📊 Tìm thấy ${count} sản phẩm trước khi áp dụng strategy`);

    // 🎯 STRATEGY PATTERN: Áp dụng strategy để lọc và sắp xếp
    const queryParams = {
      minPrice,
      maxPrice,
      categoryId
    };

    // Chuyển đổi Sequelize models sang plain objects
    const plainProducts = rows.map(p => p.toJSON());

    // Áp dụng strategy
    const filteredProducts = FilterContext.applyFilter(
      plainProducts,
      filterType,
      queryParams
    );

    console.log(`✅ Sau khi áp dụng strategy '${filterType}': ${filteredProducts.length} sản phẩm`);

    // Áp dụng phân trang SAU KHI đã lọc
    const totalProducts = filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    // Tính toán thông tin phân trang
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Lấy base URL từ request
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Format dữ liệu trả về theo cấu trúc chuẩn - CHUẨN HÓA THEO DATABASE
    const products = paginatedProducts.map(product => ({
      ID: product.ID,
      Ten: product.Ten,
      MoTa: product.MoTa,
      GiaBan: parseFloat(product.GiaBan),
      Ton: product.Ton,
      HinhAnhURL: product.HinhAnhURL ? `${baseUrl}${product.HinhAnhURL}` : null,
      LoaiID: product.LoaiID,
      NgayTao: product.NgayTao,
      Enable: product.Enable,
      // Thêm totalSold nếu là bestSeller strategy
      ...(product.totalSold !== undefined && { SoLuongBan: product.totalSold }),
      LoaiSP: product.loaiSP ? {
        ID: product.loaiSP.ID,
        Ten: product.loaiSP.Ten,
        MoTa: product.loaiSP.MoTa
      } : null
    }));

    console.log(`✅ Lấy ${products.length}/${totalProducts} sản phẩm thành công`);

    // Trả về kết quả theo format chuẩn
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
          filterType: filterType,
          search: search.trim() || null,
          minPrice: minPrice,
          maxPrice: maxPrice,
          categoryId: categoryId,
          availableFilters: FilterContext.getAvailableFilters()
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy danh sách sản phẩm:', error);

    // In chi tiết SQL query để debug
    if (error.sql) {
      console.error('📝 SQL Query gây lỗi:', error.sql);
    }

    // Xử lý lỗi SQL cụ thể
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({
        success: false,
        message: 'Lỗi truy vấn cơ sở dữ liệu',
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

// Lấy chi tiết sản phẩm theo ID
exports.getProductById = async (req, res) => {
  try {
    console.log('🔍 Lấy chi tiết sản phẩm - ID:', req.params.id);

    const productId = parseInt(req.params.id);

    // Validate ID parameter
    if (!productId || productId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID sản phẩm không hợp lệ'
      });
    }

    // Truy vấn sản phẩm theo ID với JOIN bảng LoaiSP
    const product = await SanPham.findOne({
      where: {
        ID: productId,
        Enable: true
      },
      include: [
        {
          model: LoaiSP,
          as: 'loaiSP',
          attributes: ['ID', 'Ten', 'MoTa'],
          where: {
            Enable: true
          }
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
      ]
    });

    // Kiểm tra sản phẩm có tồn tại không
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm hoặc sản phẩm đã ngừng kinh doanh'
      });
    }

    console.log('✅ Tìm thấy sản phẩm:', product.Ten);

    // Lấy base URL từ request
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Format dữ liệu trả về với URL đầy đủ - CHUẨN HÓA THEO DATABASE
    const productDetail = {
      ID: product.ID,
      Ten: product.Ten,
      MoTa: product.MoTa,
      // Thêm base URL vào đường dẫn ảnh
      HinhAnhURL: product.HinhAnhURL ? `${baseUrl}${product.HinhAnhURL}` : null,
      GiaBan: parseFloat(product.GiaBan),
      Ton: product.Ton,
      LoaiID: product.LoaiID,
      NgayTao: product.NgayTao,
      Enable: product.Enable,
      LoaiSP: product.loaiSP ? {
        ID: product.loaiSP.ID,
        Ten: product.loaiSP.Ten,
        MoTa: product.loaiSP.MoTa
      } : null
    };

    console.log('✅ Lấy chi tiết sản phẩm thành công:', productDetail.Ten);

    // Trả về thông tin chi tiết sản phẩm
    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết sản phẩm thành công',
      data: {
        product: productDetail
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy chi tiết sản phẩm:', error);

    if (error.sql) {
      console.error('📝 SQL Query gây lỗi:', error.sql);
    }

    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({
        success: false,
        message: 'Lỗi truy vấn cơ sở dữ liệu',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Database Error'
      });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Validation Error'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};