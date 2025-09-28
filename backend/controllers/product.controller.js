const db = require('../models');
const { Op } = require('sequelize');
const SanPham = db.SanPham;
const LoaiSP = db.LoaiSP;

// Lấy danh sách tất cả sản phẩm với phân trang và tìm kiếm
exports.getAllProducts = async (req, res) => {
  try {
    console.log('📦 Lấy danh sách sản phẩm - Query params:', req.query);

    // Lấy parameters từ query string
    const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là 1
    const limit = parseInt(req.query.limit) || 10; // Số sản phẩm mỗi trang, mặc định 10
    const search = req.query.search || ''; // Từ khóa tìm kiếm
    const offset = (page - 1) * limit; // Bỏ qua bao nhiêu bản ghi

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

    // Tạo điều kiện tìm kiếm - SỬA: Dùng Enable thay vì TrangThai
    const whereCondition = {
      Enable: true // Chỉ lấy sản phẩm đang hoạt động
    };

    // Thêm điều kiện tìm kiếm theo tên nếu có - SỬA: Dùng Ten thay vì TenSP
    if (search.trim()) {
      whereCondition.Ten = {
        [Op.like]: `%${search.trim()}%` // Tìm kiếm gần đúng theo tên sản phẩm
      };
    }

    console.log('🔍 Điều kiện tìm kiếm:', whereCondition);

    // Truy vấn database với JOIN và phân trang
    const { count, rows } = await SanPham.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: LoaiSP,
          as: 'loaiSP', // Alias đã định nghĩa trong relation
          attributes: ['ID', 'Ten', 'MoTa'], // SỬA: Dùng Ten thay vì TenLoai
          where: {
            Enable: true // SỬA: Dùng Enable thay vì TrangThai
          }
        }
      ],
      attributes: [
        'ID', 
        'Ten',        // SỬA: Dùng Ten thay vì TenSP
        'MoTa', 
        'GiaBan', 
        'Ton',        // SỬA: Dùng Ton thay vì SoLuongTon
        'HinhAnhURL', // SỬA: Dùng HinhAnhURL thay vì HinhAnh
        'LoaiID',     // SỬA: Dùng LoaiID thay vì IDLoaiSP
        'NgayTao',
        'Enable'      // SỬA: Dùng Enable thay vì TrangThai
      ],
      limit: limit,
      offset: offset,
      order: [['NgayTao', 'DESC']], // Sắp xếp theo ngày tạo mới nhất
      distinct: true // Đảm bảo count chính xác khi có JOIN
    });

    // Tính toán thông tin phân trang
    const totalProducts = count;
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Format dữ liệu trả về theo cấu trúc chuẩn
    const products = rows.map(product => ({
      id: product.ID,
      tenSP: product.Ten,        // SỬA: Lấy từ product.Ten
      moTa: product.MoTa,
      giaBan: parseFloat(product.GiaBan), // Convert Decimal to Number
      soLuongTon: product.Ton,   // SỬA: Lấy từ product.Ton
      hinhAnh: product.HinhAnhURL, // SỬA: Lấy từ product.HinhAnhURL
      loaiID: product.LoaiID,    // SỬA: Lấy từ product.LoaiID
      ngayTao: product.NgayTao,
      trangThai: product.Enable, // SỬA: Lấy từ product.Enable
      loaiSP: product.loaiSP ? {
        id: product.loaiSP.ID,
        tenLoai: product.loaiSP.Ten, // SỬA: Lấy từ product.loaiSP.Ten
        moTa: product.loaiSP.MoTa
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
        search: search.trim() || null
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
        Enable: true // Chỉ lấy sản phẩm đang hoạt động
      },
      include: [
        {
          model: LoaiSP,
          as: 'loaiSP', // Alias đã định nghĩa trong relation
          attributes: ['ID', 'Ten', 'MoTa'], // Lấy thông tin loại sản phẩm
          where: {
            Enable: true // Chỉ JOIN với loại sản phẩm đang hoạt động
          }
        }
      ],
      attributes: [
        'ID',
        'Ten',        // Tên sản phẩm
        'MoTa',       // Mô tả sản phẩm
        'GiaBan',     // Giá bán
        'Ton',        // Số lượng tồn kho
        'HinhAnhURL', // Hình ảnh sản phẩm
        'LoaiID',     // ID loại sản phẩm
        'NgayTao',    // Ngày tạo
        'Enable'      // Trạng thái hoạt động
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

    // Format dữ liệu trả về theo yêu cầu
    const productDetail = {
      id: product.ID,
      ten: product.Ten,                    // Tên sản phẩm
      moTa: product.MoTa,                  // Mô tả sản phẩm
      hinhAnhURL: product.HinhAnhURL,      // Link hình ảnh
      giaBan: parseFloat(product.GiaBan),  // Giá bán (convert Decimal to Number)
      ton: product.Ton,                    // Số lượng tồn kho
      loaiID: product.LoaiID,              // ID loại sản phẩm
      ngayTao: product.NgayTao,            // Ngày tạo sản phẩm
      trangThai: product.Enable,           // Trạng thái hoạt động
      // Thông tin loại sản phẩm (từ JOIN)
      loaiSP: product.loaiSP ? {
        id: product.loaiSP.ID,
        ten: product.loaiSP.Ten,           // Tên loại sản phẩm
        moTa: product.loaiSP.MoTa          // Mô tả loại sản phẩm
      } : null
    };

    console.log('✅ Lấy chi tiết sản phẩm thành công:', productDetail.ten);

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

    // In chi tiết SQL query để debug nếu có lỗi
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

    // Xử lý lỗi validation
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