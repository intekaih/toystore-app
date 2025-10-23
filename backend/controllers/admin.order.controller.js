const db = require('../models');
const HoaDon = db.HoaDon;
const ChiTietHoaDon = db.ChiTietHoaDon;
const KhachHang = db.KhachHang;
const SanPham = db.SanPham;
const PhuongThucThanhToan = db.PhuongThucThanhToan;
const { Op } = require('sequelize');

/**
 * GET /api/admin/orders
 * Lấy danh sách tất cả đơn hàng (Admin only)
 */
exports.getAllOrders = async (req, res) => {
  try {
    console.log('📦 Admin - Lấy danh sách tất cả đơn hàng');
    console.log('📝 Query params:', req.query);

    // Lấy query parameters
    const pageParam = req.query.page;
    const limitParam = req.query.limit;
    const trangThai = req.query.trangThai || null;
    const search = req.query.search || '';

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
          message: 'Số lượng đơn hàng mỗi trang phải từ 1 đến 100'
        });
      }
      limit = parseInt(limitParam);
      if (limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          message: 'Số lượng đơn hàng mỗi trang phải từ 1 đến 100'
        });
      }
    }

    const offset = (page - 1) * limit;

    console.log(`✅ Validated params - Page: ${page}, Limit: ${limit}, Offset: ${offset}`);

    // Tạo điều kiện tìm kiếm
    const whereCondition = {
      Enable: true
    };

    // Thêm điều kiện lọc theo trạng thái nếu có
    if (trangThai) {
      whereCondition.TrangThai = trangThai;
    }

    // Thêm điều kiện tìm kiếm theo mã hóa đơn nếu có
    if (search.trim()) {
      whereCondition.MaHD = {
        [Op.like]: `%${search.trim()}%`
      };
    }

    console.log('🔍 Điều kiện tìm kiếm:', whereCondition);

    // Lấy danh sách đơn hàng với phân trang
    const { count, rows } = await HoaDon.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: KhachHang,
          as: 'khachHang',
          attributes: ['ID', 'HoTen', 'Email', 'DienThoai', 'DiaChi']
        },
        {
          model: PhuongThucThanhToan,
          as: 'phuongThucThanhToan',
          attributes: ['ID', 'Ten', 'MoTa']
        },
        {
          model: ChiTietHoaDon,
          as: 'chiTiet',
          where: { Enable: true },
          required: false,
          include: [{
            model: SanPham,
            as: 'sanPham',
            attributes: ['ID', 'Ten', 'HinhAnhURL', 'GiaBan']
          }]
        }
      ],
      limit: limit,
      offset: offset,
      order: [['NgayLap', 'DESC']],
      distinct: true
    });

    // Tính toán thông tin phân trang
    const totalOrders = count;
    const totalPages = Math.ceil(totalOrders / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Format dữ liệu trả về
    const orders = rows.map(hoaDon => {
      const tongSoLuongSanPham = hoaDon.chiTiet.reduce((sum, item) => sum + item.SoLuong, 0);

      return {
        id: hoaDon.ID,
        maHD: hoaDon.MaHD,
        ngayLap: hoaDon.NgayLap,
        trangThai: hoaDon.TrangThai,
        tongTien: parseFloat(hoaDon.TongTien),
        ghiChu: hoaDon.GhiChu,
        khachHang: {
          id: hoaDon.khachHang.ID,
          hoTen: hoaDon.khachHang.HoTen,
          email: hoaDon.khachHang.Email,
          dienThoai: hoaDon.khachHang.DienThoai,
          diaChi: hoaDon.khachHang.DiaChi
        },
        phuongThucThanhToan: {
          id: hoaDon.phuongThucThanhToan.ID,
          ten: hoaDon.phuongThucThanhToan.Ten
        },
        tongSoLuongSanPham: tongSoLuongSanPham,
        soLoaiSanPham: hoaDon.chiTiet.length
      };
    });

    console.log(`✅ Lấy ${orders.length}/${totalOrders} đơn hàng thành công`);

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách đơn hàng thành công',
      data: {
        orders: orders,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalOrders: totalOrders,
          ordersPerPage: limit,
          hasNextPage: hasNextPage,
          hasPrevPage: hasPrevPage
        },
        filter: {
          trangThai: trangThai || 'Tất cả',
          search: search.trim() || null
        },
        summary: {
          tongTienTatCaDonHang: orders.reduce((sum, order) => sum + order.tongTien, 0),
          tongSoSanPhamDaBan: orders.reduce((sum, order) => sum + order.tongSoLuongSanPham, 0)
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy danh sách đơn hàng:', error);

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
 * GET /api/admin/orders/:id
 * Xem chi tiết 1 đơn hàng (Admin only)
 */
exports.getOrderById = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    console.log('🔍 Admin - Xem chi tiết đơn hàng ID:', orderId);

    // Validate orderId
    if (!orderId || orderId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID đơn hàng không hợp lệ'
      });
    }

    // Lấy chi tiết đơn hàng
    const hoaDon = await HoaDon.findOne({
      where: {
        ID: orderId,
        Enable: true
      },
      include: [
        {
          model: KhachHang,
          as: 'khachHang',
          attributes: ['ID', 'HoTen', 'Email', 'DienThoai', 'DiaChi']
        },
        {
          model: PhuongThucThanhToan,
          as: 'phuongThucThanhToan',
          attributes: ['ID', 'Ten', 'MoTa']
        },
        {
          model: ChiTietHoaDon,
          as: 'chiTiet',
          where: { Enable: true },
          required: false,
          include: [{
            model: SanPham,
            as: 'sanPham',
            attributes: ['ID', 'Ten', 'HinhAnhURL', 'GiaBan', 'Ton', 'LoaiID']
          }]
        }
      ]
    });

    if (!hoaDon) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Format dữ liệu chi tiết
    const orderDetail = {
      id: hoaDon.ID,
      maHD: hoaDon.MaHD,
      ngayLap: hoaDon.NgayLap,
      trangThai: hoaDon.TrangThai,
      tongTien: parseFloat(hoaDon.TongTien),
      ghiChu: hoaDon.GhiChu,
      khachHang: {
        id: hoaDon.khachHang.ID,
        hoTen: hoaDon.khachHang.HoTen,
        email: hoaDon.khachHang.Email,
        dienThoai: hoaDon.khachHang.DienThoai,
        diaChi: hoaDon.khachHang.DiaChi
      },
      phuongThucThanhToan: {
        id: hoaDon.phuongThucThanhToan.ID,
        ten: hoaDon.phuongThucThanhToan.Ten,
        moTa: hoaDon.phuongThucThanhToan.MoTa
      },
      sanPhams: hoaDon.chiTiet.map(item => ({
        id: item.ID,
        sanPhamId: item.SanPhamID,
        tenSanPham: item.sanPham.Ten,
        hinhAnh: item.sanPham.HinhAnhURL,
        soLuong: item.SoLuong,
        donGia: parseFloat(item.DonGia),
        thanhTien: parseFloat(item.ThanhTien),
        giaBanHienTai: parseFloat(item.sanPham.GiaBan),
        tonKhoHienTai: item.sanPham.Ton
      })),
      tongSoLuongSanPham: hoaDon.chiTiet.reduce((sum, item) => sum + item.SoLuong, 0),
      soLoaiSanPham: hoaDon.chiTiet.length
    };

    console.log('✅ Lấy chi tiết đơn hàng thành công:', hoaDon.MaHD);

    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết đơn hàng thành công',
      data: {
        order: orderDetail
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy chi tiết đơn hàng:', error);

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
 * PATCH /api/admin/orders/:id/status
 * Cập nhật trạng thái đơn hàng (Admin only)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { trangThai, ghiChu } = req.body;

    console.log('📝 Admin - Cập nhật trạng thái đơn hàng ID:', orderId);
    console.log('📝 Trạng thái mới:', trangThai);

    // Validate orderId
    if (!orderId || orderId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID đơn hàng không hợp lệ'
      });
    }

    // Validate trangThai - Chỉ cho phép 3 trạng thái theo yêu cầu
    const allowedStatuses = ['Chờ xử lý', 'Đang giao', 'Đã giao'];
    
    if (!trangThai) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp trạng thái đơn hàng'
      });
    }

    if (!allowedStatuses.includes(trangThai)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái không hợp lệ. Chỉ chấp nhận: ${allowedStatuses.join(', ')}`,
        allowedStatuses: allowedStatuses
      });
    }

    // Kiểm tra đơn hàng có tồn tại không
    const hoaDon = await HoaDon.findOne({
      where: {
        ID: orderId,
        Enable: true
      },
      include: [{
        model: KhachHang,
        as: 'khachHang',
        attributes: ['HoTen', 'Email']
      }]
    });

    if (!hoaDon) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Kiểm tra logic chuyển trạng thái hợp lệ
    const currentStatus = hoaDon.TrangThai;
    
    // Không cho phép cập nhật nếu đơn hàng đã bị hủy
    if (currentStatus === 'Đã hủy') {
      return res.status(400).json({
        success: false,
        message: 'Không thể cập nhật trạng thái của đơn hàng đã hủy',
        currentStatus: currentStatus
      });
    }

    // Không cho phép chuyển về trạng thái trước đó
    const statusOrder = {
      'Chờ xử lý': 0,
      'Đang giao': 1,
      'Đã giao': 2
    };

    if (statusOrder[trangThai] < statusOrder[currentStatus]) {
      return res.status(400).json({
        success: false,
        message: `Không thể chuyển trạng thái từ "${currentStatus}" về "${trangThai}"`,
        currentStatus: currentStatus,
        requestedStatus: trangThai
      });
    }

    // Không cho phép cập nhật nếu trạng thái giống nhau
    if (currentStatus === trangThai) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng đã ở trạng thái "${trangThai}"`,
        currentStatus: currentStatus
      });
    }

    // Tạo ghi chú cập nhật
    const updateNote = `[${new Date().toLocaleString('vi-VN')}] Admin cập nhật trạng thái: ${currentStatus} → ${trangThai}`;
    const newGhiChu = ghiChu 
      ? (hoaDon.GhiChu ? `${hoaDon.GhiChu} | ${updateNote} | ${ghiChu}` : `${updateNote} | ${ghiChu}`)
      : (hoaDon.GhiChu ? `${hoaDon.GhiChu} | ${updateNote}` : updateNote);

    // Cập nhật trạng thái
    await hoaDon.update({
      TrangThai: trangThai,
      GhiChu: newGhiChu
    });

    console.log(`✅ Cập nhật trạng thái đơn hàng ${hoaDon.MaHD}: ${currentStatus} → ${trangThai}`);

    // Lấy lại thông tin đơn hàng đã cập nhật
    const updatedOrder = await HoaDon.findOne({
      where: { ID: orderId },
      include: [
        {
          model: KhachHang,
          as: 'khachHang',
          attributes: ['ID', 'HoTen', 'Email', 'DienThoai', 'DiaChi']
        },
        {
          model: PhuongThucThanhToan,
          as: 'phuongThucThanhToan',
          attributes: ['ID', 'Ten']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: `Cập nhật trạng thái đơn hàng thành công: ${currentStatus} → ${trangThai}`,
      data: {
        order: {
          id: updatedOrder.ID,
          maHD: updatedOrder.MaHD,
          ngayLap: updatedOrder.NgayLap,
          trangThaiCu: currentStatus,
          trangThaiMoi: updatedOrder.TrangThai,
          tongTien: parseFloat(updatedOrder.TongTien),
          ghiChu: updatedOrder.GhiChu,
          khachHang: {
            id: updatedOrder.khachHang.ID,
            hoTen: updatedOrder.khachHang.HoTen,
            email: updatedOrder.khachHang.Email
          },
          phuongThucThanhToan: updatedOrder.phuongThucThanhToan.Ten
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi cập nhật trạng thái đơn hàng:', error);

    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({
        success: false,
        message: 'Lỗi cơ sở dữ liệu',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Database Error'
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
