const db = require('../models');
const { Op } = require('sequelize');
const Logger = require('../utils/Logger');
const DTOMapper = require('../utils/DTOMapper');

const logger = Logger.getInstance();

const HoaDon = db.HoaDon;
const ChiTietHoaDon = db.ChiTietHoaDon;
const SanPham = db.SanPham;
const KhachHang = db.KhachHang;
const TaiKhoan = db.TaiKhoan;
const LoaiSP = db.LoaiSP;
const PhuongThucThanhToan = db.PhuongThucThanhToan;
const DiaChiGiaoHang = db.DiaChiGiaoHang;
const ThongTinVanChuyen = db.ThongTinVanChuyen;

/**
 * =======================================
 * QUẢN LÝ ĐỢN HÀNG - NHÂN VIÊN
 * =======================================
 */

/**
 * Lấy danh sách đơn hàng với phân trang và lọc
 */
exports.getAllOrders = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      trangThai,
      tuNgay,
      denNgay,
      keyword
    } = filters;

    const offset = (page - 1) * limit;

    // Xây dựng điều kiện where
    const whereCondition = {};

    if (trangThai) {
      whereCondition.TrangThai = trangThai;
    }

    if (tuNgay && denNgay) {
      whereCondition.NgayLap = {
        [Op.between]: [new Date(tuNgay), new Date(denNgay)]
      };
    }

    // Tìm kiếm theo mã đơn hàng
    if (keyword) {
      whereCondition[Op.or] = [
        { MaHD: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await HoaDon.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: KhachHang,
          as: 'khachHang',
          include: [
            {
              model: TaiKhoan,
              as: 'taiKhoan',
              attributes: ['TenDangNhap', 'Email', 'HoTen', 'DienThoai']
            }
          ]
        },
        {
          model: PhuongThucThanhToan,
          as: 'phuongThucThanhToan',
          attributes: ['ID', 'Ten']
        },
        {
          model: DiaChiGiaoHang,
          as: 'diaChiGiaoHang',
          attributes: ['ID', 'DiaChiChiTiet', 'TenPhuong', 'TenQuan', 'TenTinh', 'TenNguoiNhan', 'SoDienThoai'],
          required: false
        },
        {
          model: ChiTietHoaDon,
          as: 'chiTiet',
          include: [
            {
              model: SanPham,
              as: 'sanPham',
              attributes: ['Ten', 'HinhAnhURL']
            }
          ]
        }
      ],
      order: [['NgayLap', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    logger.info(`Staff - Lấy danh sách đơn hàng thành công: ${count} đơn`);

    // Convert Sequelize instances to plain objects and then to camelCase using DTOMapper
    const ordersPlain = rows.map(row => row.get ? row.get({ plain: true }) : row);
    const ordersDTO = DTOMapper.mapToDTO(ordersPlain);

    return {
      success: true,
      data: {
        orders: ordersDTO,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    };

  } catch (error) {
    logger.logError(error, 'Staff Service - getAllOrders');
    throw error;
  }
};

/**
 * Lấy chi tiết đơn hàng
 */
exports.getOrderDetail = async (orderId) => {
  try {
    const order = await HoaDon.findByPk(orderId, {
      include: [
        {
          model: KhachHang,
          as: 'khachHang',
          include: [
            {
              model: TaiKhoan,
              as: 'taiKhoan',
              attributes: ['TenDangNhap', 'Email', 'HoTen', 'DienThoai']
            }
          ]
        },
        {
          model: PhuongThucThanhToan,
          as: 'phuongThucThanhToan',
          attributes: ['ID', 'Ten']
        },
        {
          model: DiaChiGiaoHang,
          as: 'diaChiGiaoHang',
          attributes: ['ID', 'DiaChiChiTiet', 'TenPhuong', 'TenQuan', 'TenTinh', 'TenNguoiNhan', 'SoDienThoai']
        },
        // ✅ THÊM: Include bảng ThongTinVanChuyen
        {
          model: ThongTinVanChuyen,
          as: 'thongTinVanChuyen',
          attributes: ['MaVanDon', 'DonViVanChuyen', 'TrangThaiGHN', 'NgayGiaoDuKien', 'NgayGuiHang', 'NgayGiaoThanhCong']
        },
        {
          model: ChiTietHoaDon,
          as: 'chiTiet',
          include: [
            {
              model: SanPham,
              as: 'sanPham',
              attributes: ['ID', 'Ten', 'GiaBan', 'HinhAnhURL'],
              include: [
                {
                  model: LoaiSP,
                  as: 'loaiSP',
                  attributes: ['Ten']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!order) {
      return {
        success: false,
        message: 'Không tìm thấy đơn hàng'
      };
    }

    logger.info(`Staff - Lấy chi tiết đơn hàng #${orderId} thành công`);

    // Convert Sequelize instance to plain object
    const orderPlain = order.get ? order.get({ plain: true }) : order;
    
    // ✅ DEBUG: Log raw data
    console.log('🔍 [Staff Service] Raw orderPlain:', JSON.stringify(orderPlain, null, 2));
    console.log('🔍 [Staff Service] diaChiGiaoHang:', orderPlain.diaChiGiaoHang);
    console.log('🔍 [Staff Service] chiTiet:', orderPlain.chiTiet);

    // ✅ Normalize giống admin: Sử dụng DTOMapper.toCamelCase với structure rõ ràng
    const orderDTO = DTOMapper.toCamelCase({
      ID: orderPlain.ID,
      MaHD: orderPlain.MaHD,
      NgayLap: orderPlain.NgayLap,
      TrangThai: orderPlain.TrangThai,
      ThanhTien: parseFloat(orderPlain.ThanhTien || 0),
      GhiChu: orderPlain.GhiChu,
      KhachHang: orderPlain.khachHang ? {
        ID: orderPlain.khachHang.ID,
        HoTen: orderPlain.khachHang.taiKhoan?.HoTen || orderPlain.khachHang.HoTen,
        Email: orderPlain.khachHang.taiKhoan?.Email || orderPlain.khachHang.Email,
        DienThoai: orderPlain.khachHang.taiKhoan?.DienThoai || orderPlain.khachHang.DienThoai,
        TaiKhoan: orderPlain.khachHang.taiKhoan ? {
          TenDangNhap: orderPlain.khachHang.taiKhoan.TenDangNhap,
          Email: orderPlain.khachHang.taiKhoan.Email,
          HoTen: orderPlain.khachHang.taiKhoan.HoTen,
          DienThoai: orderPlain.khachHang.taiKhoan.DienThoai
        } : null
      } : null,
      PhuongThucThanhToan: orderPlain.phuongThucThanhToan ? {
        ID: orderPlain.phuongThucThanhToan.ID,
        Ten: orderPlain.phuongThucThanhToan.Ten
      } : null,
      DiaChiGiaoHang: orderPlain.diaChiGiaoHang ? {
        ID: orderPlain.diaChiGiaoHang.ID,
        DiaChiChiTiet: orderPlain.diaChiGiaoHang.DiaChiChiTiet,
        TenPhuong: orderPlain.diaChiGiaoHang.TenPhuong,
        TenQuan: orderPlain.diaChiGiaoHang.TenQuan,
        TenTinh: orderPlain.diaChiGiaoHang.TenTinh,
        TenNguoiNhan: orderPlain.diaChiGiaoHang.TenNguoiNhan,
        SoDienThoai: orderPlain.diaChiGiaoHang.SoDienThoai
      } : null,
      // ✅ THÊM: Thông tin vận chuyển GHN
      ThongTinVanChuyen: orderPlain.thongTinVanChuyen ? {
        MaVanDon: orderPlain.thongTinVanChuyen.MaVanDon,
        DonViVanChuyen: orderPlain.thongTinVanChuyen.DonViVanChuyen,
        TrangThaiGHN: orderPlain.thongTinVanChuyen.TrangThaiGHN,
        NgayGiaoDuKien: orderPlain.thongTinVanChuyen.NgayGiaoDuKien,
        NgayGuiHang: orderPlain.thongTinVanChuyen.NgayGuiHang,
        NgayGiaoThanhCong: orderPlain.thongTinVanChuyen.NgayGiaoThanhCong
      } : null,
      ChiTiet: (orderPlain.chiTiet || []).map(item => ({
        ID: item.ID,
        SanPhamID: item.SanPhamID,
        SoLuong: item.SoLuong,
        DonGia: parseFloat(item.DonGia || 0),
        ThanhTien: parseFloat(item.ThanhTien || 0),
        SanPham: item.sanPham ? {
          ID: item.sanPham.ID,
          Ten: item.sanPham.Ten,
          HinhAnhURL: item.sanPham.HinhAnhURL,
          GiaBan: parseFloat(item.sanPham.GiaBan || 0),
          LoaiSP: item.sanPham.loaiSP ? {
            Ten: item.sanPham.loaiSP.Ten
          } : null
        } : null
      }))
    });

    // Thêm các field tính toán
    const result = {
      ...orderDTO,
      tongSoLuongSanPham: (orderPlain.chiTiet || []).reduce((sum, item) => sum + (item.SoLuong || 0), 0),
      soLoaiSanPham: (orderPlain.chiTiet || []).length
    };
    
    // ✅ DEBUG: Log normalized result
    console.log('🔍 [Staff Service] Normalized orderDTO:', JSON.stringify(orderDTO, null, 2));
    console.log('🔍 [Staff Service] Final result:', JSON.stringify(result, null, 2));

    return {
      success: true,
      data: result
    };

  } catch (error) {
    logger.logError(error, 'Staff Service - getOrderDetail');
    throw error;
  }
};

/**
 * Cập nhật trạng thái đơn hàng
 */
exports.updateOrderStatus = async (orderId, staffId, newStatus, ghiChu = '') => {
  try {
    const order = await HoaDon.findByPk(orderId);

    if (!order) {
      return {
        success: false,
        message: 'Không tìm thấy đơn hàng'
      };
    }

    // Kiểm tra trạng thái hợp lệ
    const validStatuses = [
      'Chờ xử lý',
      'Đã xác nhận',
      'Đang đóng gói',
      'Sẵn sàng giao hàng',
      'Đang giao hàng',
      'Đã giao hàng',
      'Hoàn thành',
      'Đã hủy',
      'Giao hàng thất bại',
      'Đang hoàn tiền',
      'Đã hoàn tiền'
    ];

    if (!validStatuses.includes(newStatus)) {
      return {
        success: false,
        message: 'Trạng thái không hợp lệ'
      };
    }

    // Kiểm tra luồng chuyển trạng thái hợp lệ
    const statusFlow = {
      'Chờ xử lý': ['Đã xác nhận', 'Đã hủy'],
      'Đã xác nhận': ['Đang đóng gói', 'Đã hủy'],
      'Đang đóng gói': ['Sẵn sàng giao hàng', 'Đã hủy'],
      'Sẵn sàng giao hàng': ['Đang giao hàng', 'Đã hủy'],
      'Đang giao hàng': ['Đã giao hàng', 'Giao hàng thất bại'],
      'Đã giao hàng': ['Hoàn thành'],
      'Hoàn thành': [],
      'Đã hủy': [],
      'Giao hàng thất bại': ['Đang hoàn tiền', 'Đang giao hàng'],
      'Đang hoàn tiền': ['Đã hoàn tiền']
    };

    if (!statusFlow[order.TrangThai].includes(newStatus)) {
      return {
        success: false,
        message: `Không thể chuyển từ trạng thái "${order.TrangThai}" sang "${newStatus}"`
      };
    }

    const oldStatus = order.TrangThai;
    order.TrangThai = newStatus;
    
    if (ghiChu) {
      order.GhiChu = ghiChu;
    }

    await order.save();

    logger.info(`Staff #${staffId} - Cập nhật trạng thái đơn hàng #${orderId}: ${oldStatus} → ${newStatus}`);

    return {
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: order
    };

  } catch (error) {
    logger.logError(error, 'Staff Service - updateOrderStatus');
    throw error;
  }
};

/**
 * Thống kê đơn hàng theo trạng thái
 */
exports.getOrderStatistics = async () => {
  try {
    const statistics = await HoaDon.findAll({
      attributes: [
        'TrangThai',
        [db.sequelize.fn('COUNT', db.sequelize.col('ID')), 'soLuong'],
        [db.sequelize.fn('SUM', db.sequelize.col('ThanhTien')), 'tongTien']
      ],
      group: ['TrangThai']
    });

    // Tổng quan tất cả đơn hàng
    const totalOrders = await HoaDon.count();
    const totalRevenue = await HoaDon.sum('ThanhTien', {
      where: { TrangThai: 'Đã giao hàng' }
    });

    logger.info('Staff - Lấy thống kê đơn hàng thành công');

    return {
      success: true,
      data: {
        byStatus: statistics,
        summary: {
          totalOrders,
          totalRevenue: totalRevenue || 0
        }
      }
    };

  } catch (error) {
    logger.logError(error, 'Staff Service - getOrderStatistics');
    throw error;
  }
};

/**
 * =======================================
 * QUẢN LÝ SẢN PHẨM - NHÂN VIÊN
 * =======================================
 */

/**
 * Lấy danh sách sản phẩm với lọc và phân trang
 */
exports.getAllProducts = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      idLoai,
      keyword,
      trangThai
    } = filters;

    const offset = (page - 1) * limit;

    const whereCondition = {};

    if (idLoai) {
      whereCondition.IDLoai = idLoai;
    }

    if (keyword) {
      whereCondition[Op.or] = [
        { Ten: { [Op.like]: `%${keyword}%` } },
        { MoTa: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (trangThai !== undefined && trangThai !== null) {
      // Nhận 1 hoặc 0 từ frontend, hoặc 'active'/'inactive'
      if (trangThai === 'active' || trangThai === 1 || trangThai === '1') {
        whereCondition.TrangThai = 1;
      } else if (trangThai === 'inactive' || trangThai === 0 || trangThai === '0') {
        whereCondition.TrangThai = 0;
      } else {
        whereCondition.TrangThai = trangThai;
      }
    }

    const { count, rows } = await SanPham.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: LoaiSP,
          as: 'loaiSP',
          attributes: ['Ten']
        }
      ],
      order: [['NgayTao', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    logger.info(`Staff - Lấy danh sách sản phẩm thành công: ${count} sản phẩm`);

    // Convert Sequelize instances to plain objects and then to camelCase using DTOMapper
    const productsPlain = rows.map(row => row.get ? row.get({ plain: true }) : row);
    const productsDTO = DTOMapper.mapToDTO(productsPlain);

    return {
      success: true,
      data: {
        products: productsDTO,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    };

  } catch (error) {
    logger.logError(error, 'Staff Service - getAllProducts');
    throw error;
  }
};

/**
 * Cập nhật số lượng tồn kho sản phẩm
 */
exports.updateProductStock = async (productId, staffId, newStock, ghiChu = '') => {
  try {
    const product = await SanPham.findByPk(productId);

    if (!product) {
      return {
        success: false,
        message: 'Không tìm thấy sản phẩm'
      };
    }

    const oldStock = product.SoLuongTon;
    product.SoLuongTon = newStock;
    await product.save();

    logger.info(`Staff #${staffId} - Cập nhật tồn kho sản phẩm #${productId}: ${oldStock} → ${newStock}. Ghi chú: ${ghiChu}`);

    return {
      success: true,
      message: 'Cập nhật số lượng tồn kho thành công',
      data: product
    };

  } catch (error) {
    logger.logError(error, 'Staff Service - updateProductStock');
    throw error;
  }
};

/**
 * Cập nhật trạng thái sản phẩm (enable/disable)
 */
exports.updateProductStatus = async (productId, staffId, enable) => {
  try {
    const product = await SanPham.findByPk(productId);

    if (!product) {
      return {
        success: false,
        message: 'Không tìm thấy sản phẩm'
      };
    }

    product.TrangThai = enable ? 1 : 0;
    await product.save();

    logger.info(`Staff #${staffId} - ${enable ? 'Kích hoạt' : 'Vô hiệu hóa'} sản phẩm #${productId}`);

    return {
      success: true,
      message: `${enable ? 'Kích hoạt' : 'Vô hiệu hóa'} sản phẩm thành công`,
      data: product
    };

  } catch (error) {
    logger.logError(error, 'Staff Service - updateProductStatus');
    throw error;
  }
};

/**
 * =======================================
 * DASHBOARD - NHÂN VIÊN
 * =======================================
 */

/**
 * Lấy thống kê tổng quan cho dashboard nhân viên
 */
exports.getDashboardStats = async () => {
  try {
    logger.info('Staff - Bắt đầu lấy thống kê dashboard');
    
    // Đơn hàng cần xử lý
    const pendingOrders = await HoaDon.count({
      where: { TrangThai: 'Chờ xử lý' }
    });
    logger.info(`Staff - Đơn hàng chờ xử lý: ${pendingOrders}`);

    // Đơn hàng đang giao
    const shippingOrders = await HoaDon.count({
      where: { TrangThai: 'Đang giao hàng' }
    });
    logger.info(`Staff - Đơn hàng đang giao: ${shippingOrders}`);

    // Sản phẩm sắp hết hàng (< 10)
    const lowStockProducts = await SanPham.count({
      where: {
        SoLuongTon: { [Op.lt]: 10 },
        TrangThai: 1
      }
    });
    logger.info(`Staff - Sản phẩm sắp hết hàng: ${lowStockProducts}`);

    // Doanh thu hôm nay
    // ✅ FIX: Format date đúng cho SQL Server - sử dụng raw query với CAST AS DATE
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Format date thành string cho SQL Server (YYYY-MM-DD)
    const formatDateForSQL = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const todayDateStr = formatDateForSQL(today);
    
    // ✅ Sử dụng raw query với CAST AS DATE để tránh lỗi conversion
    const todayRevenueResult = await db.sequelize.query(
      `SELECT ISNULL(SUM(ThanhTien), 0) as total
       FROM HoaDon
       WHERE TrangThai = N'Hoàn thành'
         AND CAST(NgayLap AS DATE) >= CAST(:todayDateStr AS DATE)`,
      {
        replacements: { todayDateStr },
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    const todayRevenue = parseFloat(todayRevenueResult[0]?.total || 0);
    logger.info(`Staff - Doanh thu hôm nay: ${todayRevenue || 0}`);

    const result = {
      success: true,
      data: {
        pendingOrders: pendingOrders || 0,
        shippingOrders: shippingOrders || 0,
        lowStockProducts: lowStockProducts || 0,
        todayRevenue: todayRevenue || 0
      }
    };

    logger.info('Staff - Lấy thống kê dashboard thành công');
    return result;

  } catch (error) {
    logger.logError(error, 'Staff Service - getDashboardStats');
    console.error('❌ [Staff Service] Lỗi chi tiết:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
};

module.exports = exports;
