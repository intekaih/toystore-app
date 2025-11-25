const db = require('../models');
const HoaDon = db.HoaDon;
const ChiTietHoaDon = db.ChiTietHoaDon;
const KhachHang = db.KhachHang;
const SanPham = db.SanPham;
const PhuongThucThanhToan = db.PhuongThucThanhToan;
const { Op, Sequelize } = require('sequelize');
const DTOMapper = require('../utils/DTOMapper');

// ⭐ IMPORT STATE PATTERN
const { OrderStateContext } = require('../states/OrderState');

// 🚚 IMPORT GHN SERVICE
const ghnService = require('../services/ghn.service');
const ghnMockService = require('../services/ghn.mock.service');
const ThongTinVanChuyen = db.ThongTinVanChuyen;

/**
 * ✅ HÀM ROLLBACK AN TOÀN - Tránh lỗi "no corresponding BEGIN TRANSACTION"
 * @param {Transaction} transaction - Sequelize transaction
 * @param {string} context - Ngữ cảnh để log (ví dụ: "validation failed")
 */
const safeRollback = async (transaction, context = '') => {
  if (transaction && !transaction.finished) {
    try {
      await transaction.rollback();
      console.log(`🔄 Đã rollback transaction thành công ${context ? `(${context})` : ''}`);
    } catch (rollbackError) {
      console.error(`⚠️ Không thể rollback transaction ${context ? `(${context})` : ''}: ${rollbackError.message}`);
      // Không throw error để tránh crash server
    }
  } else {
    console.log(`⚠️ Transaction đã kết thúc, không thể rollback ${context ? `(${context})` : ''}`);
  }
};

/**
 * ✅ HÀM COMMIT AN TOÀN - Tránh lỗi "no corresponding BEGIN TRANSACTION"
 * @param {Transaction} transaction - Sequelize transaction
 * @param {Object} order - Order object để kiểm tra sau khi commit
 * @param {string} expectedStatus - Trạng thái mong đợi sau khi commit
 * @param {string} context - Ngữ cảnh để log
 * @returns {Promise<boolean>} true nếu commit thành công hoặc order đã được cập nhật
 */
const safeCommit = async (transaction, order = null, expectedStatus = null, context = '') => {
  if (!transaction) {
    console.warn(`⚠️ Transaction không tồn tại ${context ? `(${context})` : ''}`);
    return false;
  }

  if (transaction.finished) {
    console.warn(`⚠️ Transaction đã kết thúc, không thể commit ${context ? `(${context})` : ''}`);
    // Kiểm tra xem order đã được cập nhật chưa
    if (order && expectedStatus) {
      try {
        await order.reload();
        if (order.TrangThai === expectedStatus) {
          console.log(`✅ Đơn hàng đã được cập nhật thành công (transaction đã commit trước đó) ${context ? `(${context})` : ''}`);
          return true;
        }
      } catch (reloadError) {
        console.error(`❌ Lỗi khi reload order: ${reloadError.message}`);
      }
    }
    return false;
  }

  try {
    // ✅ FIX: Kiểm tra transaction status trước khi commit
    if (transaction.finished) {
      console.warn(`⚠️ Transaction đã kết thúc trước khi commit ${context ? `(${context})` : ''}, finished=${transaction.finished}`);
      // Kiểm tra xem order đã được cập nhật chưa
      if (order && expectedStatus) {
        try {
          await order.reload();
          if (order.TrangThai === expectedStatus) {
            console.log(`✅ Order đã được cập nhật (transaction đã commit trước đó) ${context ? `(${context})` : ''}`);
            return true;
          }
        } catch (reloadError) {
          console.error(`❌ Lỗi khi reload order: ${reloadError.message}`);
        }
      }
      return false;
    }

    await transaction.commit();
    console.log(`✅ Transaction đã được commit thành công ${context ? `(${context})` : ''}`);

    // ✅ THÊM: Verify order đã được cập nhật sau khi commit
    if (order && expectedStatus) {
      try {
        // Đợi một chút để đảm bảo commit đã được flush
        await new Promise(resolve => setTimeout(resolve, 50));
        await order.reload();
        if (order.TrangThai === expectedStatus) {
          console.log(`✅ Verified: Order ${order.ID} đã được cập nhật thành ${expectedStatus} ${context ? `(${context})` : ''}`);
        } else {
          console.warn(`⚠️ Warning: Order ${order.ID} status mismatch. Expected: ${expectedStatus}, Got: ${order.TrangThai} ${context ? `(${context})` : ''}`);
        }
      } catch (reloadError) {
        console.error(`❌ Lỗi khi reload order để verify: ${reloadError.message}`);
      }
    }

    return true;
  } catch (commitError) {
    console.error(`❌ Lỗi khi commit transaction ${context ? `(${context})` : ''}: ${commitError.message}`);
    console.error(`❌ Stack trace:`, commitError.stack);
    console.error(`❌ Transaction state: finished=${transaction.finished}, id=${transaction.id}`);

    // Nếu commit thất bại do "no corresponding BEGIN TRANSACTION"
    if (commitError.message && commitError.message.includes('no corresponding BEGIN TRANSACTION')) {
      console.warn(`⚠️ Transaction đã bị rollback hoặc connection bị mất ${context ? `(${context})` : ''}`);

      // Kiểm tra xem order đã được cập nhật chưa
      if (order && expectedStatus) {
        try {
          await order.reload();
          if (order.TrangThai === expectedStatus) {
            console.log(`✅ Đơn hàng đã được cập nhật thành công (transaction đã commit trước đó) ${context ? `(${context})` : ''}`);
            return true; // Coi như thành công vì dữ liệu đã được lưu
          }
        } catch (reloadError) {
          console.error(`❌ Lỗi khi reload order: ${reloadError.message}`);
        }
      }

      // Không throw error để tránh crash, nhưng return false để caller biết
      return false;
    }

    // Re-throw nếu là lỗi khác
    throw commitError;
  }
};

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

    // ✅ FIX: Bỏ điều kiện Enable vì database có thể chưa có cột này
    const whereCondition = {};

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
          attributes: ['ID', 'HoTen', 'Email', 'DienThoai']
        },
        {
          model: PhuongThucThanhToan,
          as: 'phuongThucThanhToan',
          attributes: ['ID', 'Ten']
        },
        // ✅ THÊM: Include DiaChiGiaoHang để hiển thị địa chỉ đúng
        {
          model: db.DiaChiGiaoHang,
          as: 'diaChiGiaoHang',
          required: false,
          attributes: ['TenTinh', 'TenQuan', 'TenPhuong', 'DiaChiChiTiet', 'SoDienThoai', 'TenNguoiNhan']
        },
        {
          model: ChiTietHoaDon,
          as: 'chiTiet',
          required: false,
          include: [{
            model: SanPham,
            as: 'sanPham',
            attributes: ['ID', 'Ten', 'HinhAnhURL', 'GiaBan']
          }]
        },
        {
          model: db.ThongTinVanChuyen,
          as: 'thongTinVanChuyen',
          required: false,
          attributes: ['MaVanDon', 'DonViVanChuyen', 'PhiVanChuyen', 'TrangThaiGHN', 'NgayGiaoDuKien']
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

    // Format dữ liệu trả về với DTOMapper
    const orders = rows.map(hoaDon => {
      const tongSoLuongSanPham = hoaDon.chiTiet.reduce((sum, item) => sum + item.SoLuong, 0);

      const orderData = DTOMapper.toCamelCase({
        ID: hoaDon.ID,
        MaHD: hoaDon.MaHD,
        NgayLap: hoaDon.NgayLap,
        TrangThai: hoaDon.TrangThai,
        ThanhTien: parseFloat(hoaDon.ThanhTien),
        GhiChu: hoaDon.GhiChu,
        MaVanDon: hoaDon.thongTinVanChuyen?.MaVanDon || null,
        DonViVanChuyen: hoaDon.thongTinVanChuyen?.DonViVanChuyen || null,
        // ✅ THÊM: Địa chỉ giao hàng
        DiaChiGiaoHang: hoaDon.diaChiGiaoHang ? {
          TenTinh: hoaDon.diaChiGiaoHang.TenTinh,
          TenQuan: hoaDon.diaChiGiaoHang.TenQuan,
          TenPhuong: hoaDon.diaChiGiaoHang.TenPhuong,
          DiaChiChiTiet: hoaDon.diaChiGiaoHang.DiaChiChiTiet,
          SoDienThoai: hoaDon.diaChiGiaoHang.SoDienThoai,
          TenNguoiNhan: hoaDon.diaChiGiaoHang.TenNguoiNhan
        } : null,
        KhachHang: {
          ID: hoaDon.khachHang.ID,
          HoTen: hoaDon.khachHang.HoTen,
          Email: hoaDon.khachHang.Email,
          DienThoai: hoaDon.khachHang.DienThoai
        },
        PhuongThucThanhToan: {
          ID: hoaDon.phuongThucThanhToan.ID,
          Ten: hoaDon.phuongThucThanhToan.Ten
        },
        // ✅ FIX: Sửa HinhAnhURL thành HinhAnh
        ChiTiet: hoaDon.chiTiet.map(item => ({
          ID: item.ID,
          SoLuong: item.SoLuong,
          DonGia: parseFloat(item.DonGia),
          ThanhTien: parseFloat(item.ThanhTien),
          SanPham: {
            ID: item.sanPham.ID,
            Ten: item.sanPham.Ten,
            HinhAnh: item.sanPham.HinhAnhURL,
            GiaBan: parseFloat(item.sanPham.GiaBan)
          }
        }))
      });

      return {
        ...orderData,
        tongSoLuongSanPham,
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
          tongTienTatCaDonHang: orders.reduce((sum, order) => sum + order.thanhTien, 0),
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

    // ✅ FIX: Bỏ điều kiện Enable trong where
    const hoaDon = await HoaDon.findOne({
      where: {
        ID: orderId
        // ✅ Bỏ: Enable: true
      },
      include: [
        {
          model: KhachHang,
          as: 'khachHang',
          attributes: ['ID', 'HoTen', 'Email', 'DienThoai']
        },
        {
          model: PhuongThucThanhToan,
          as: 'phuongThucThanhToan',
          attributes: ['ID', 'Ten'] // ✅ BỎ: MoTa (không tồn tại trong DB)
        },
        // ✅ THÊM: Include bảng LichSuTrangThaiDonHang
        {
          model: db.LichSuTrangThaiDonHang,
          as: 'lichSuTrangThai',
          attributes: ['ID', 'TrangThaiCu', 'TrangThaiMoi', 'NguoiThayDoi', 'LyDo', 'NgayThayDoi'],
          order: [['NgayThayDoi', 'ASC']]
        },
        {
          model: ChiTietHoaDon,
          as: 'chiTiet',
          // ✅ FIX: Bỏ điều kiện Enable
          required: false,
          include: [{
            model: SanPham,
            as: 'sanPham',
            attributes: ['ID', 'Ten', 'HinhAnhURL', 'GiaBan', 'SoLuongTon', 'LoaiID'] // ✅ SỬA: Ton → SoLuongTon
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

    // ✅ SỬ DỤNG DTOMapper
    const orderDetail = DTOMapper.toCamelCase({
      ID: hoaDon.ID,
      MaHD: hoaDon.MaHD,
      NgayLap: hoaDon.NgayLap,
      TrangThai: hoaDon.TrangThai,
      ThanhTien: parseFloat(hoaDon.ThanhTien),
      GhiChu: hoaDon.GhiChu,
      KhachHang: {
        ID: hoaDon.khachHang.ID,
        HoTen: hoaDon.khachHang.HoTen,
        Email: hoaDon.khachHang.Email,
        DienThoai: hoaDon.khachHang.DienThoai
      },
      PhuongThucThanhToan: {
        ID: hoaDon.phuongThucThanhToan.ID,
        Ten: hoaDon.phuongThucThanhToan.Ten
      },
      SanPhams: hoaDon.chiTiet.map(item => ({
        ID: item.ID,
        SanPhamID: item.SanPhamID,
        TenSanPham: item.sanPham.Ten,
        HinhAnh: item.sanPham.HinhAnhURL,
        SoLuong: item.SoLuong,
        DonGia: parseFloat(item.DonGia),
        ThanhTien: parseFloat(item.ThanhTien),
        GiaBanHienTai: parseFloat(item.sanPham.GiaBan),
        TonKhoHienTai: item.sanPham.SoLuongTon
      }))
    });

    // ✅ THÊM: Lịch sử trạng thái đơn hàng
    const lichSuTrangThai = hoaDon.lichSuTrangThai ? hoaDon.lichSuTrangThai.map(item => ({
      id: item.ID,
      trangThaiCu: item.TrangThaiCu,
      trangThaiMoi: item.TrangThaiMoi,
      nguoiThayDoi: item.NguoiThayDoi,
      lyDo: item.LyDo,
      ngayThayDoi: item.NgayThayDoi
    })) : [];

    const result = {
      ...orderDetail,
      tongSoLuongSanPham: hoaDon.chiTiet.reduce((sum, item) => sum + item.SoLuong, 0),
      soLoaiSanPham: hoaDon.chiTiet.length,
      lichSuTrangThai: lichSuTrangThai
    };

    console.log('✅ Lấy chi tiết đơn hàng thành công:', hoaDon.MaHD);

    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết đơn hàng thành công',
      data: {
        order: result
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
 * Cập nhật trạng thái đơn hàng (Admin only) - SỬ DỤNG STATE PATTERN
 */
exports.updateOrderStatus = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const orderId = parseInt(req.params.id);
    const { trangThai, ghiChu, maVanDon, donViVanChuyen } = req.body;

    console.log('📝 Admin - Cập nhật trạng thái đơn hàng ID:', orderId);
    console.log('📝 Trạng thái mới:', trangThai);

    // Validate orderId
    if (!orderId || orderId < 1) {
      await safeRollback(transaction, 'invalid orderId');
      return res.status(400).json({
        success: false,
        message: 'ID đơn hàng không hợp lệ'
      });
    }

    if (!trangThai) {
      await safeRollback(transaction, 'missing trangThai');
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp trạng thái đơn hàng'
      });
    }

    // Lấy đơn hàng với lock
    const hoaDon = await HoaDon.findOne({
      where: { ID: orderId },
      include: [{
        model: KhachHang,
        as: 'khachHang',
        attributes: ['HoTen', 'Email', 'DienThoai']
      }],
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!hoaDon) {
      await safeRollback(transaction, 'order not found');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // ✅ SỬ DỤNG STATE PATTERN
    const orderState = new OrderStateContext(hoaDon);
    const currentStatus = orderState.getCurrentState().getName();

    // Kiểm tra quyền hủy đơn của admin
    if (trangThai === 'Đã hủy' && !orderState.canAdminCancel()) {
      await safeRollback(transaction, 'admin cannot cancel');
      return res.status(400).json({
        success: false,
        message: `Admin không thể hủy đơn hàng ở trạng thái "${currentStatus}"`,
        currentStatus: currentStatus
      });
    }

    // Chuẩn bị dữ liệu bổ sung
    const additionalData = {};

    // Nếu chuyển sang "Đang giao hàng", yêu cầu mã vận đơn
    if (trangThai === 'Đang giao hàng') {
      if (!maVanDon || !maVanDon.trim()) {
        await safeRollback(transaction, 'missing maVanDon');
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập mã vận đơn khi chuyển sang trạng thái "Đang giao hàng"'
        });
      }
      additionalData.MaVanDon = maVanDon.trim();
      additionalData.DonViVanChuyen = donViVanChuyen?.trim() || 'Chưa xác định';
      additionalData.NgayGuiHang = new Date();
    }

    // Nếu chuyển sang "Đã giao hàng", lưu ngày giao thành công
    if (trangThai === 'Đã giao hàng') {
      // ✅ FIX: Không truyền Date object trực tiếp - sẽ được xử lý trong transitionTo
      // Hoặc dùng raw SQL update sau khi transition
      // additionalData chỉ dùng cho HoaDon.update(), không phải ThongTinVanChuyen
    }

    // Nếu hủy đơn, lưu lý do
    if (trangThai === 'Đã hủy') {
      additionalData.LyDoHuy = ghiChu || 'Admin hủy đơn';
      additionalData.NguoiHuy = 'Admin';

      // ⚠️ HOÀN TỒN KHO khi hủy đơn
      const chiTietList = await ChiTietHoaDon.findAll({
        where: { HoaDonID: hoaDon.ID },
        transaction
      });

      for (const item of chiTietList) {
        await SanPham.update(
          { SoLuongTon: db.Sequelize.literal(`SoLuongTon + ${item.SoLuong}`) }, // ✅ FIX: Ton → SoLuongTon
          {
            where: { ID: item.SanPhamID },
            transaction
          }
        );
        console.log(`📦 Hoàn ${item.SoLuong} sản phẩm ID ${item.SanPhamID} vào kho`);
      }
    }

    // Thêm ghi chú từ admin nếu có
    if (ghiChu && trangThai !== 'Đã hủy') {
      const currentGhiChu = hoaDon.GhiChu || '';
      additionalData.GhiChu = currentGhiChu
        ? `${currentGhiChu} | [Admin] ${ghiChu}`
        : `[Admin] ${ghiChu}`;
    }

    // ✅ CHUYỂN TRẠNG THÁI BẰNG STATE PATTERN
    try {
      await orderState.transitionTo(trangThai, transaction, additionalData);
    } catch (stateError) {
      await safeRollback(transaction, 'state transition error');
      return res.status(400).json({
        success: false,
        message: stateError.message,
        currentStatus: currentStatus,
        availableTransitions: orderState.getAvailableTransitions()
      });
    }

    // ✅ SỬA: Sử dụng safeCommit để commit transaction an toàn
    transactionCommitted = await safeCommit(transaction, hoaDon, trangThai, 'updateOrderStatus');

    // Lấy lại thông tin đơn hàng đã cập nhật
    const updatedOrder = await HoaDon.findOne({
      where: { ID: orderId },
      include: [
        {
          model: KhachHang,
          as: 'khachHang',
          attributes: ['ID', 'HoTen', 'Email', 'DienThoai']
        },
        {
          model: PhuongThucThanhToan,
          as: 'phuongThucThanhToan',
          attributes: ['ID', 'Ten']
        }
      ]
    });

    // Tạo OrderStateContext mới để lấy trạng thái hiện tại
    const newOrderState = new OrderStateContext(updatedOrder);

    // ✅ SỬ DỤNG DTOMapper
    const orderDTO = DTOMapper.toCamelCase({
      ID: updatedOrder.ID,
      MaHD: updatedOrder.MaHD,
      NgayLap: updatedOrder.NgayLap,
      TrangThai: updatedOrder.TrangThai,
      ThanhTien: parseFloat(updatedOrder.ThanhTien),
      GhiChu: updatedOrder.GhiChu,
      MaVanDon: updatedOrder.MaVanDon,
      DonViVanChuyen: updatedOrder.DonViVanChuyen,
      NgayGuiHang: updatedOrder.NgayGuiHang,
      NgayGiaoThanhCong: updatedOrder.NgayGiaoThanhCong,
      KhachHang: {
        ID: updatedOrder.khachHang.ID,
        HoTen: updatedOrder.khachHang.HoTen,
        Email: updatedOrder.khachHang.Email,
        DienThoai: updatedOrder.khachHang.DienThoai
      },
      PhuongThucThanhToan: updatedOrder.phuongThucThanhToan.Ten
    });

    res.status(200).json({
      success: true,
      message: `Cập nhật trạng thái đơn hàng thành công: ${currentStatus} → ${trangThai}`,
      data: {
        order: {
          ...orderDTO,
          trangThaiCu: currentStatus,
          trangThaiMoi: updatedOrder.TrangThai
        },
        availableActions: newOrderState.getAvailableTransitions(),
        permissions: {
          canAdminCancel: newOrderState.canAdminCancel(),
          canCustomerCancel: newOrderState.canCustomerCancel()
        }
      }
    });

  } catch (error) {
    // ✅ SỬA: Chỉ rollback nếu transaction chưa được commit
    if (!transactionCommitted && !transaction.finished) {
      await safeRollback(transaction, 'updateOrderStatus error');
    }
    console.error('❌ Lỗi cập nhật trạng thái đơn hàng:', error);

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
 * ⭐ POST /api/admin/orders/:id/confirm
 * Xác nhận đơn hàng (Chờ xử lý → Đã xác nhận)
 */
exports.confirmOrder = async (req, res) => {
  // ✅ FIX: Không dùng transaction cho operation đơn giản này để tránh lỗi MSSQL
  // Thay vào đó, update trực tiếp và kiểm tra kết quả
  try {
    const orderId = parseInt(req.params.id);
    const { ghiChu } = req.body;


    if (!orderId || orderId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID đơn hàng không hợp lệ'
      });
    }

    // ✅ FIX: Lấy order không dùng transaction
    const hoaDon = await HoaDon.findByPk(orderId);

    if (!hoaDon) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const orderState = new OrderStateContext(hoaDon);
    const currentStatus = orderState.getCurrentState().getName();


    // ✅ FIX: Kiểm tra có thể chuyển trạng thái không
    if (!orderState.getCurrentState().canTransitionTo('Đã xác nhận')) {
      return res.status(400).json({
        success: false,
        message: `Không thể chuyển từ "${currentStatus}" sang "Đã xác nhận". ` +
          `Chỉ có thể chuyển sang: ${orderState.getCurrentState().getAllowedTransitions().join(', ')}`
      });
    }

    // ✅ FIX: Update trực tiếp không dùng transaction để tránh lỗi MSSQL
    try {
      const timestamp = new Date();
      const updateNote = `[${timestamp.toLocaleString('vi-VN')}] ${currentStatus} → Đã xác nhận`;
      const newGhiChu = hoaDon.GhiChu
        ? `${hoaDon.GhiChu} | ${updateNote}`
        : updateNote;

      // ✅ FIX: Update trực tiếp không dùng transaction
      await hoaDon.update({
        TrangThai: 'Đã xác nhận',
        GhiChu: newGhiChu,
        NgayCapNhat: timestamp
      });

      console.log(`✅ [confirmOrder] Order ${hoaDon.ID} đã được cập nhật thành công: ${currentStatus} → Đã xác nhận`);
    } catch (updateError) {
      console.error(`❌ [confirmOrder] Lỗi khi update order:`, updateError);
      console.error(`❌ [confirmOrder] Update error stack:`, updateError.stack);
      return res.status(500).json({
        success: false,
        message: updateError.message || 'Không thể cập nhật trạng thái đơn hàng'
      });
    }

    // ✅ FIX: Reload để lấy dữ liệu mới nhất
    await hoaDon.reload();

    // ✅ FIX: Kiểm tra xem update có thành công không
    if (hoaDon.TrangThai !== 'Đã xác nhận') {
      console.error(`❌ [confirmOrder] Order status không được cập nhật. Expected: Đã xác nhận, Got: ${hoaDon.TrangThai}`);
      return res.status(500).json({
        success: false,
        message: 'Không thể cập nhật trạng thái đơn hàng'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã xác nhận đơn hàng',
      data: {
        orderId: hoaDon.ID,
        maHD: hoaDon.MaHD,
        trangThai: hoaDon.TrangThai,
        availableActions: new OrderStateContext(hoaDon).getAvailableTransitions()
      }
    });

  } catch (error) {
    console.error('❌ Lỗi xác nhận đơn hàng:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server nội bộ'
    });
  }
};

/**
 * ⭐ POST /api/admin/orders/:id/pack
 * ❌ DEPRECATED: Endpoint này không còn sử dụng trong quy trình mới
 * Quy trình mới: Đã xác nhận → Tạo đơn GHN (createShippingOrder) → Đang đóng gói (tự động)
 */
exports.packOrder = async (req, res) => {
  return res.status(410).json({
    success: false,
    message: 'Endpoint này đã không còn sử dụng. Vui lòng sử dụng "Tạo đơn GHN" để chuyển sang đóng gói.',
    newEndpoint: 'POST /api/admin/orders/:id/create-shipping'
  });
};

/**
 * ⭐ POST /api/admin/orders/:id/create-shipping
 * Tạo đơn GHN ngay sau khi xác nhận (Đã xác nhận → Đang đóng gói)
 * ⚠️ Thay đổi: Tạo đơn GHN và lấy mã vận đơn TRƯỚC KHI đóng gói
 */
exports.createShippingOrder = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  let transactionCommitted = false;

  try {
    const orderId = parseInt(req.params.id);
    const { weight, note, useGHN = true } = req.body;

    if (!orderId || orderId < 1) {
      await safeRollback(transaction, 'invalid orderId');
      return res.status(400).json({
        success: false,
        message: 'ID đơn hàng không hợp lệ'
      });
    }

    // Lấy thông tin đầy đủ đơn hàng
    const hoaDon = await HoaDon.findByPk(orderId, {
      include: [
        {
          model: KhachHang,
          as: 'khachHang',
          attributes: ['ID', 'HoTen', 'Email', 'DienThoai']
        },
        {
          model: PhuongThucThanhToan,
          as: 'phuongThucThanhToan',
          attributes: ['ID', 'Ten']
        },
        {
          model: ChiTietHoaDon,
          as: 'chiTiet',
          include: [{
            model: SanPham,
            as: 'sanPham',
            attributes: ['ID', 'Ten', 'GiaBan']
          }]
        },
        {
          model: db.DiaChiGiaoHang,
          as: 'diaChiGiaoHang',
          attributes: ['MaTinhID', 'MaQuanID', 'MaPhuongXa', 'TenTinh', 'TenQuan', 'TenPhuong', 'DiaChiChiTiet', 'SoDienThoai', 'TenNguoiNhan']
        }
      ],
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!hoaDon) {
      await safeRollback(transaction, 'order not found');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // ✅ SỬA: Kiểm tra trạng thái "Đã xác nhận"
    if (hoaDon.TrangThai !== 'Đã xác nhận') {
      await safeRollback(transaction, 'invalid order status');
      return res.status(400).json({
        success: false,
        message: `Chỉ có thể tạo đơn GHN khi đơn hàng ở trạng thái "Đã xác nhận". Trạng thái hiện tại: "${hoaDon.TrangThai}"`
      });
    }

    let finalMaVanDon = null;
    let finalDonViVanChuyen = 'GHN';
    let phiVanChuyen = null;
    let expectedDeliveryTime = null;
    let printUrl = null;

    // ✅ FIX: Validate useGHN - phải tạo đơn GHN để có mã vận đơn
    if (!useGHN) {
      await safeRollback(transaction, 'useGHN is false');
      return res.status(400).json({
        success: false,
        message: 'Phải tạo đơn GHN để có mã vận đơn. Không thể bỏ qua bước này.'
      });
    }

    if (useGHN) {
      // Tạo đơn GHN tự động
      const diaChiGH = hoaDon.diaChiGiaoHang;

      if (!diaChiGH) {
        await safeRollback(transaction, 'missing delivery address');
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy thông tin địa chỉ giao hàng'
        });
      }

      if (!diaChiGH.MaQuanID || !diaChiGH.MaPhuongXa) {
        await safeRollback(transaction, 'missing district/ward code');
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin mã quận/phường. Không thể tạo đơn GHN.',
          detail: {
            maTinhID: diaChiGH.MaTinhID,
            maQuanID: diaChiGH.MaQuanID,
            maPhuongXa: diaChiGH.MaPhuongXa
          }
        });
      }

      const totalWeight = weight || 500;

      const ghnOrderData = {
        orderId: hoaDon.ID,
        orderCode: hoaDon.MaHD,
        customer: {
          name: diaChiGH.TenNguoiNhan || hoaDon.khachHang.HoTen,
          phone: diaChiGH.SoDienThoai || hoaDon.khachHang.DienThoai,
          address: diaChiGH.DiaChiChiTiet,
          districtId: parseInt(diaChiGH.MaQuanID),
          wardCode: diaChiGH.MaPhuongXa
        },
        items: hoaDon.chiTiet.map(item => ({
          name: item.sanPham.Ten,
          quantity: item.SoLuong,
          price: parseFloat(item.DonGia)
        })),
        totalAmount: parseFloat(hoaDon.ThanhTien),
        codAmount: hoaDon.phuongThucThanhToan.Ten.toLowerCase().includes('cod') ? parseFloat(hoaDon.ThanhTien) : 0,
        weight: totalWeight,
        note: note || `Đơn hàng ${hoaDon.MaHD} - ToyStore`
      };

      console.log('📤 Gọi GHN API để tạo đơn vận chuyển...');
      const ghnResult = await ghnService.createShippingOrder(ghnOrderData);

      if (!ghnResult.success) {
        await safeRollback(transaction, 'GHN API failed');
        return res.status(400).json({
          success: false,
          message: `Không thể tạo đơn GHN: ${ghnResult.message}`,
          error: ghnResult.error
        });
      }

      finalMaVanDon = ghnResult.data.ghnOrderCode;
      phiVanChuyen = ghnResult.data.totalFee;
      expectedDeliveryTime = ghnResult.data.expectedDeliveryTime;
      printUrl = `https://donhang.ghn.vn/?order_code=${finalMaVanDon}`;

      console.log('✅ Tạo đơn GHN thành công:', finalMaVanDon);
    }

    // ✅ FIX: Validate finalMaVanDon trước khi tiếp tục
    if (!finalMaVanDon) {
      await safeRollback(transaction, 'finalMaVanDon is null');
      return res.status(400).json({
        success: false,
        message: 'Không thể tạo đơn GHN. Vui lòng thử lại hoặc liên hệ hỗ trợ.'
      });
    }

    // ✅ LƯU VÀO BẢNG ThongTinVanChuyen
    const ThongTinVanChuyen = db.ThongTinVanChuyen;

    // ✅ FIX: Format date for SQL Server DATETIME type (YYYY-MM-DD HH:mm:ss WITHOUT timezone)
    // SQL Server DATETIME không chấp nhận timezone (+00:00), chỉ cần format: 2025-11-27 07:25:10
    const formatDateForSQLServer = (date) => {
      if (!date) return null;

      // Chuyển đổi sang Date object
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) {
        console.warn('⚠️ Invalid date format:', date);
        return null;
      }

      // ✅ QUAN TRỌNG: Dùng local time, KHÔNG dùng UTC
      // getFullYear(), getMonth() etc. sẽ trả về local time
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');

      // Format: YYYY-MM-DD HH:mm:ss (NO TIMEZONE!)
      const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      console.log(`🔍 [formatDateForSQLServer] Input: ${date}, Output: ${formatted}`);
      return formatted;
    };


    // ✅ FIX CRITICAL: Set NULL cho NgayGiaoDuKien để tránh lỗi conversion
    // Vấn đề: Sequelize + tedious driver tự động thêm timezone vào Date object
    // SQL Server DATETIME không hỗ trợ timezone
    // Giải pháp tạm thời: Set NULL, sau đó update bằng raw query
    const ngayGiaoDuKienValue = null; // TEMPORARY FIX

    console.log(`🔍 [createShippingOrder] expectedDeliveryTime:`, expectedDeliveryTime);
    console.log(`⚠️ [createShippingOrder] Tạm thời set NgayGiaoDuKien = NULL để tránh lỗi conversion`);

    // ✅ FIX: Sử dụng Sequelize model thay vì raw query để đảm bảo consistency
    let vanChuyen = await ThongTinVanChuyen.findOne({
      where: { HoaDonID: hoaDon.ID },
      transaction
    });

    console.log(`🔍 [createShippingOrder] vanChuyen found: ${!!vanChuyen}, HoaDonID: ${hoaDon.ID}`);

    if (vanChuyen) {
      console.log(`🔍 [createShippingOrder] Updating existing ThongTinVanChuyen ID: ${vanChuyen.ID}`);
      await vanChuyen.update({
        MaVanDon: finalMaVanDon,
        DonViVanChuyen: finalDonViVanChuyen,
        PhiVanChuyen: phiVanChuyen,
        NgayGiaoDuKien: ngayGiaoDuKienValue, // ✅ FIX: Dùng string thay vì Sequelize.literal()
        TrangThaiGHN: 'ready_to_pick'
      }, { transaction });
      console.log('✅ Đã update ThongTinVanChuyen');
    } else {
      console.log(`🔍 [createShippingOrder] Creating new ThongTinVanChuyen`);

      // ✅ FIX: Dùng findOrCreate thay vì create để tránh lỗi duplicate key
      // Trường hợp: record đã tồn tại từ lần thử trước nhưng transaction bị rollback
      const [createdVanChuyen, created] = await ThongTinVanChuyen.findOrCreate({
        where: { HoaDonID: hoaDon.ID },
        defaults: {
          MaVanDon: finalMaVanDon,
          DonViVanChuyen: finalDonViVanChuyen,
          PhiVanChuyen: phiVanChuyen,
          NgayGiaoDuKien: ngayGiaoDuKienValue, // ✅ FIX: Dùng Date object thay vì string
          TrangThaiGHN: 'ready_to_pick',
          SoLanGiaoThatBai: 0
        },
        transaction
      });

      vanChuyen = createdVanChuyen;

      if (created) {
        console.log('✅ Đã insert ThongTinVanChuyen mới');
      } else {
        console.log('⚠️ ThongTinVanChuyen đã tồn tại, đang update...');
        // Nếu record đã tồn tại, update nó
        await vanChuyen.update({
          MaVanDon: finalMaVanDon,
          DonViVanChuyen: finalDonViVanChuyen,
          PhiVanChuyen: phiVanChuyen,
          NgayGiaoDuKien: ngayGiaoDuKienValue,
          TrangThaiGHN: 'ready_to_pick'
        }, { transaction });
        console.log('✅ Đã update ThongTinVanChuyen hiện có');
      }
    }

    // ✅ FIX: Verify ThongTinVanChuyen đã được tạo
    if (!vanChuyen || !vanChuyen.MaVanDon) {
      throw new Error('Không thể tạo hoặc cập nhật ThongTinVanChuyen');
    }
    console.log(`✅ [createShippingOrder] ThongTinVanChuyen verified: MaVanDon=${vanChuyen.MaVanDon}`);

    // ✅ FIX: Update NgayGiaoDuKien bằng raw SQL để tránh lỗi timezone của Sequelize
    if (expectedDeliveryTime) {
      const ngayGiaoDuKienFormatted = formatDateForSQLServer(expectedDeliveryTime);
      console.log(`🔍 [createShippingOrder] Updating NgayGiaoDuKien with raw SQL: ${ngayGiaoDuKienFormatted}`);

      try {
        await db.sequelize.query(
          `UPDATE ThongTinVanChuyen 
           SET NgayGiaoDuKien = :ngayGiaoDuKien
           WHERE HoaDonID = :hoaDonID`,
          {
            replacements: {
              ngayGiaoDuKien: ngayGiaoDuKienFormatted,
              hoaDonID: hoaDon.ID
            },
            transaction,
            type: db.sequelize.QueryTypes.UPDATE
          }
        );
        console.log(`✅ [createShippingOrder] Đã update NgayGiaoDuKien thành công`);
      } catch (dateUpdateError) {
        console.warn(`⚠️ [createShippingOrder] Lỗi khi update NgayGiaoDuKien:`, dateUpdateError.message);
        // Không throw để không làm gián đoạn flow chính
      }
    }

    // ✅ FIX: Reload order với ThongTinVanChuyen để đảm bảo có MaVanDon
    await hoaDon.reload({
      include: [{
        model: db.ThongTinVanChuyen,
        as: 'thongTinVanChuyen',
        attributes: ['MaVanDon', 'DonViVanChuyen']
      }],
      transaction
    });

    // ✅ FIX: Set MaVanDon vào order object để PackingState.onEnter có thể kiểm tra
    if (hoaDon.thongTinVanChuyen) {
      hoaDon.MaVanDon = hoaDon.thongTinVanChuyen.MaVanDon;
      hoaDon.DonViVanChuyen = hoaDon.thongTinVanChuyen.DonViVanChuyen;
    } else {
      // Nếu không có, set trực tiếp từ biến
      hoaDon.MaVanDon = finalMaVanDon;
      hoaDon.DonViVanChuyen = finalDonViVanChuyen;
    }

    // ✅ SỬA: Chuyển sang "Đang đóng gói" (có mã vận đơn)
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🔍 [createShippingOrder] =========== CHUẨN BỊ CHUYỂN TRẠNG THÁI ===========`);
    console.log(`🔍 [createShippingOrder] Order ID: ${hoaDon.ID}, MaHD: ${hoaDon.MaHD}`);
    console.log(`🔍 [createShippingOrder] Trạng thái hiện tại: ${hoaDon.TrangThai}`);
    console.log(`🔍 [createShippingOrder] finalMaVanDon: ${finalMaVanDon}`);
    console.log(`🔍 [createShippingOrder] Order.MaVanDon: ${hoaDon.MaVanDon}`);
    console.log(`🔍 [createShippingOrder] Transaction status: finished=${transaction.finished}, id=${transaction.id}`);
    console.log(`${'='.repeat(80)}\n`);

    const orderState = new OrderStateContext(hoaDon);

    // ✅ FIX: Đảm bảo MaVanDon được set vào order object trước khi transition
    if (!hoaDon.MaVanDon && finalMaVanDon) {
      hoaDon.MaVanDon = finalMaVanDon;
      hoaDon.DonViVanChuyen = finalDonViVanChuyen;
      console.log(`✅ [createShippingOrder] Đã set MaVanDon vào order object: ${hoaDon.MaVanDon}`);
    }

    console.log(`\n🔍 [createShippingOrder] Bắt đầu gọi orderState.transitionTo()...\n`);

    try {
      await orderState.transitionTo('Đang đóng gói', transaction, {
        MaVanDon: finalMaVanDon,
        DonViVanChuyen: finalDonViVanChuyen,
        GhiChu: hoaDon.GhiChu
          ? `${hoaDon.GhiChu} | [Tạo đơn GHN] Mã: ${finalMaVanDon}`
          : `[Tạo đơn GHN] Mã: ${finalMaVanDon}`
      });
      console.log(`\n✅ [createShippingOrder] transitionTo() hoàn thành thành công!`);
      console.log(`✅ [createShippingOrder] Order.TrangThai sau transition: ${hoaDon.TrangThai}`);
      console.log(`✅ [createShippingOrder] Transaction status sau transition: finished=${transaction.finished}\n`);
    } catch (transitionError) {
      console.error(`\n${'!'.repeat(80)}`);
      console.error(`❌ [createShippingOrder] LỖI TRONG transitionTo()!`);
      console.error(`❌ [createShippingOrder] Error name: ${transitionError.name}`);
      console.error(`❌ [createShippingOrder] Error message: ${transitionError.message}`);
      console.error(`❌ [createShippingOrder] Transaction status khi lỗi: finished=${transaction.finished}`);
      console.error(`❌ [createShippingOrder] Full error:`, transitionError);
      console.error(`❌ [createShippingOrder] Error stack:`, transitionError.stack);
      console.error(`${'!'.repeat(80)}\n`);
      throw transitionError; // Re-throw để catch block xử lý
    }

    // ✅ SỬA: Commit transaction và verify
    console.log(`🔍 [createShippingOrder] Chuẩn bị commit transaction. Order.TrangThai: ${hoaDon.TrangThai}`);
    console.log(`🔍 [createShippingOrder] Transaction status: finished=${transaction.finished}, id=${transaction.id}`);

    // ✅ FIX: Kiểm tra transaction status trước khi commit
    if (transaction.finished) {
      console.warn(`⚠️ [createShippingOrder] Transaction đã finished trước khi commit! finished=${transaction.finished}`);
      // Kiểm tra xem order đã được cập nhật chưa
      try {
        await hoaDon.reload();
        if (hoaDon.TrangThai === 'Đang đóng gói') {
          console.log(`✅ [createShippingOrder] Order đã được cập nhật (transaction đã commit trước đó)`);
          transactionCommitted = true;
        } else {
          console.error(`❌ [createShippingOrder] Order chưa được cập nhật! TrangThai: ${hoaDon.TrangThai}`);
          // Thử update lại không dùng transaction
          await hoaDon.update({ TrangThai: 'Đang đóng gói' });
          console.log(`✅ [createShippingOrder] Đã force update trạng thái`);
          transactionCommitted = true;
        }
      } catch (reloadError) {
        console.error(`❌ [createShippingOrder] Lỗi khi reload order:`, reloadError);
        throw new Error(`Transaction đã finished nhưng không thể verify order: ${reloadError.message}`);
      }
    } else {
      try {
        await transaction.commit();
        transactionCommitted = true;
        console.log(`✅ [createShippingOrder] Transaction đã được commit thành công`);

        // ✅ Verify: Reload order từ DB để đảm bảo đã được cập nhật
        await new Promise(resolve => setTimeout(resolve, 100)); // Đợi commit flush
        await hoaDon.reload();
        console.log(`✅ [createShippingOrder] Order reloaded. Order.TrangThai: ${hoaDon.TrangThai}`);

        if (hoaDon.TrangThai !== 'Đang đóng gói') {
          console.error(`❌ [createShippingOrder] CRITICAL: Order status không khớp! Expected: "Đang đóng gói", Got: "${hoaDon.TrangThai}"`);
          // Thử update lại trực tiếp (không dùng transaction vì đã commit)
          await hoaDon.update({ TrangThai: 'Đang đóng gói' });
          console.log(`✅ [createShippingOrder] Đã force update trạng thái`);
        }
      } catch (commitError) {
        transactionCommitted = false;
        console.error(`❌ [createShippingOrder] Lỗi khi commit transaction:`, commitError.message);
        console.error(`❌ [createShippingOrder] Commit error stack:`, commitError.stack);

        // ✅ FIX: Nếu lỗi "no corresponding BEGIN TRANSACTION", thử update lại không dùng transaction
        if (commitError.message && commitError.message.includes('no corresponding BEGIN TRANSACTION')) {
          console.warn(`⚠️ [createShippingOrder] Transaction đã bị rollback, thử tạo lại ThongTinVanChuyen và update order`);
          try {
            // ✅ CRITICAL: Đảm bảo ThongTinVanChuyen được tạo ngay cả khi transaction rollback
            const ThongTinVanChuyen = db.ThongTinVanChuyen;
            let vanChuyen = await ThongTinVanChuyen.findOne({
              where: { HoaDonID: hoaDon.ID }
            });

            const formatDateForSQL = (date) => {
              if (!date) return null;
              const d = new Date(date);
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              const hours = String(d.getHours()).padStart(2, '0');
              const minutes = String(d.getMinutes()).padStart(2, '0');
              const seconds = String(d.getSeconds()).padStart(2, '0');
              return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            };

            const ngayGiaoDuKienFormatted = expectedDeliveryTime ? formatDateForSQL(expectedDeliveryTime) : null;

            if (!vanChuyen) {
              // ✅ FIX: Tạo mới ThongTinVanChuyen bằng raw SQL để tránh lỗi timezone
              // Sequelize.create() tự động thêm timezone vào DATE field → SQL Server lỗi conversion
              await db.sequelize.query(
                `INSERT INTO ThongTinVanChuyen (HoaDonID, MaVanDon, DonViVanChuyen, PhiVanChuyen, NgayGiaoDuKien, TrangThaiGHN, SoLanGiaoThatBai)
                 VALUES (:hoaDonID, :maVanDon, :donViVanChuyen, :phiVanChuyen, :ngayGiaoDuKien, :trangThaiGHN, :soLanGiaoThatBai)`,
                {
                  replacements: {
                    hoaDonID: hoaDon.ID,
                    maVanDon: finalMaVanDon,
                    donViVanChuyen: finalDonViVanChuyen,
                    phiVanChuyen: phiVanChuyen,
                    ngayGiaoDuKien: ngayGiaoDuKienFormatted,
                    trangThaiGHN: 'ready_to_pick',
                    soLanGiaoThatBai: 0
                  },
                  type: db.sequelize.QueryTypes.INSERT
                }
              );
              console.log(`✅ [createShippingOrder] Đã tạo lại ThongTinVanChuyen sau rollback`);
            } else if (!vanChuyen.MaVanDon) {
              // Update nếu chưa có MaVanDon
              await vanChuyen.update({
                MaVanDon: finalMaVanDon,
                DonViVanChuyen: finalDonViVanChuyen,
                PhiVanChuyen: phiVanChuyen,
                NgayGiaoDuKien: ngayGiaoDuKienFormatted,
                TrangThaiGHN: 'ready_to_pick'
              });
              console.log(`✅ [createShippingOrder] Đã update ThongTinVanChuyen sau rollback`);
            }

            // Update trạng thái order
            await hoaDon.reload();
            if (hoaDon.TrangThai !== 'Đang đóng gói') {
              await hoaDon.update({ TrangThai: 'Đang đóng gói' });
              console.log(`✅ [createShippingOrder] Đã update trạng thái sau khi transaction rollback`);
            } else {
              console.log(`✅ [createShippingOrder] Order đã được cập nhật đúng trạng thái`);
            }
            transactionCommitted = true;
          } catch (updateError) {
            console.error(`❌ [createShippingOrder] Lỗi khi update sau rollback:`, updateError);
            throw commitError; // Throw lỗi gốc
          }
        } else {
          throw commitError;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: '✅ Đã tạo đơn GHN thành công!',
      data: {
        orderId: hoaDon.ID,
        maHD: hoaDon.MaHD,
        trangThai: 'Đang đóng gói',
        maVanDon: finalMaVanDon,
        donViVanChuyen: finalDonViVanChuyen,
        phiVanChuyen: phiVanChuyen,
        thoiGianGiaoDuKien: expectedDeliveryTime,
        printUrl: printUrl,
        instructions: [
          '📦 1️⃣ In mã vận đơn này ra giấy',
          '✍️ 2️⃣ Đóng gói sản phẩm và dán mã vận đơn lên kiện hàng',
          '✅ 3️⃣ Bấm nút "Đóng gói xong" khi hoàn tất'
        ]
      }
    });

  } catch (error) {
    // ✅ FIX: Rollback nếu transaction chưa được commit
    if (!transactionCommitted && transaction && !transaction.finished) {
      await safeRollback(transaction, 'createShippingOrder error');
    }
    console.error('❌ Lỗi tạo đơn vận chuyển:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi tạo đơn vận chuyển'
    });
  }
};

/**
 * ⭐ POST /api/admin/orders/:id/packed
 * Xác nhận đã đóng gói xong (Đang đóng gói → Sẵn sàng giao hàng)
 * ⚠️ ENDPOINT MỚI: Thay thế "shipOrder"
 */
exports.markAsPacked = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const orderId = parseInt(req.params.id);

    if (!orderId || orderId < 1) {
      await safeRollback(transaction, 'invalid orderId');
      return res.status(400).json({
        success: false,
        message: 'ID đơn hàng không hợp lệ'
      });
    }

    const hoaDon = await HoaDon.findByPk(orderId, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!hoaDon) {
      await safeRollback(transaction, 'order not found');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Kiểm tra trạng thái
    if (hoaDon.TrangThai !== 'Đang đóng gói') {
      await safeRollback(transaction, 'invalid order status for packing');
      return res.status(400).json({
        success: false,
        message: `Chỉ có thể xác nhận đóng gói xong khi đơn hàng ở trạng thái "Đang đóng gói". Trạng thái hiện tại: "${hoaDon.TrangThai}"`
      });
    }

    // ✅ FIX: Kiểm tra có mã vận đơn - Thử query không dùng transaction trước
    const ThongTinVanChuyen = db.ThongTinVanChuyen;
    let vanChuyen = null;

    // Thử query không dùng transaction trước (vì có thể đã commit từ createShippingOrder)
    try {
      vanChuyen = await ThongTinVanChuyen.findOne({
        where: { HoaDonID: hoaDon.ID }
      });
      console.log(`🔍 [markAsPacked] Query ThongTinVanChuyen (no transaction): ${vanChuyen ? 'Found' : 'Not found'}`);
    } catch (queryError) {
      console.warn(`⚠️ [markAsPacked] Lỗi khi query không dùng transaction:`, queryError.message);
    }

    // Nếu không tìm thấy, thử query với transaction
    if (!vanChuyen) {
      try {
        vanChuyen = await ThongTinVanChuyen.findOne({
          where: { HoaDonID: hoaDon.ID },
          transaction
        });
        console.log(`🔍 [markAsPacked] Query ThongTinVanChuyen (with transaction): ${vanChuyen ? 'Found' : 'Not found'}`);
      } catch (queryError) {
        console.warn(`⚠️ [markAsPacked] Lỗi khi query với transaction:`, queryError.message);
      }
    }

    if (!vanChuyen || !vanChuyen.MaVanDon) {
      await safeRollback(transaction, 'missing maVanDon');
      console.error(`❌ [markAsPacked] Order ${hoaDon.ID} (${hoaDon.MaHD}) chưa có mã vận đơn`);
      console.error(`❌ [markAsPacked] ThongTinVanChuyen:`, vanChuyen ? 'Found but no MaVanDon' : 'Not found');
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng chưa có mã vận đơn. Vui lòng tạo đơn GHN trước.',
        detail: {
          orderId: hoaDon.ID,
          maHD: hoaDon.MaHD,
          trangThai: hoaDon.TrangThai,
          hasThongTinVanChuyen: !!vanChuyen,
          hasMaVanDon: !!(vanChuyen && vanChuyen.MaVanDon)
        }
      });
    }

    console.log(`✅ [markAsPacked] Found MaVanDon: ${vanChuyen.MaVanDon}`);

    // Chuyển trạng thái sang "Sẵn sàng giao hàng"
    const orderState = new OrderStateContext(hoaDon);

    await orderState.transitionTo('Sẵn sàng giao hàng', transaction, {
      GhiChu: hoaDon.GhiChu
        ? `${hoaDon.GhiChu} | [Đóng gói xong] ${new Date().toLocaleString('vi-VN')}`
        : `[Đóng gói xong] ${new Date().toLocaleString('vi-VN')}`
    });

    // ✅ SỬA: Sử dụng safeCommit để commit transaction an toàn
    await safeCommit(transaction, hoaDon, 'Sẵn sàng giao hàng', 'markAsPacked');

    res.status(200).json({
      success: true,
      message: '✅ Đã xác nhận đóng gói xong! Đơn hàng sẵn sàng giao.',
      data: {
        orderId: hoaDon.ID,
        maHD: hoaDon.MaHD,
        trangThai: 'Sẵn sàng giao hàng',
        maVanDon: vanChuyen.MaVanDon,
        donViVanChuyen: vanChuyen.DonViVanChuyen,
        instructions: [
          '🚚 Shipper GHN sẽ đến lấy hàng',
          '📱 Bạn sẽ nhận được thông báo khi shipper đến',
          '📊 Trạng thái giao hàng sẽ được cập nhật tự động từ GHN'
        ]
      }
    });

  } catch (error) {
    // ✅ SỬA: Chỉ rollback nếu transaction chưa được commit
    if (!transactionCommitted && !transaction.finished) {
      await safeRollback(transaction, 'markAsPacked error');
    }
    console.error('❌ Lỗi xác nhận đóng gói:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ⭐ POST /api/admin/orders/:id/ship
 * Bàn giao shipper (Sẵn sàng giao hàng → Đang giao hàng)
 * ⚠️ Chỉ gọi SAU KHI đã dán mã vận đơn lên kiện hàng
 */
exports.shipOrder = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const orderId = parseInt(req.params.id);
    const { confirmed } = req.body;

    if (!orderId || orderId < 1) {
      await safeRollback(transaction, 'invalid orderId');
      return res.status(400).json({
        success: false,
        message: 'ID đơn hàng không hợp lệ'
      });
    }

    const hoaDon = await HoaDon.findByPk(orderId, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!hoaDon) {
      await safeRollback(transaction, 'order not found');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // ✅ SỬA: Kiểm tra trạng thái "Sẵn sàng giao hàng" thay vì "Chờ in vận đơn"
    if (hoaDon.TrangThai !== 'Sẵn sàng giao hàng') {
      await safeRollback(transaction, 'invalid order status for shipping');
      return res.status(400).json({
        success: false,
        message: `Chỉ có thể bàn giao shipper khi đơn hàng ở trạng thái "Sẵn sàng giao hàng". Trạng thái hiện tại: "${hoaDon.TrangThai}"`
      });
    }

    // ✅ Kiểm tra mã vận đơn từ bảng ThongTinVanChuyen
    const ThongTinVanChuyen = db.ThongTinVanChuyen;
    const vanChuyen = await ThongTinVanChuyen.findOne({
      where: { HoaDonID: hoaDon.ID },
      transaction
    });

    if (!vanChuyen || !vanChuyen.MaVanDon) {
      await safeRollback(transaction, 'missing maVanDon');
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng chưa có mã vận đơn. Vui lòng tạo đơn GHN trước.'
      });
    }

    // Chuyển trạng thái sang "Đang giao hàng"
    const orderState = new OrderStateContext(hoaDon);

    await orderState.transitionTo('Đang giao hàng', transaction, {
      GhiChu: hoaDon.GhiChu
        ? `${hoaDon.GhiChu} | [Bàn giao shipper] ${new Date().toLocaleString('vi-VN')}`
        : `[Bàn giao shipper] ${new Date().toLocaleString('vi-VN')}`
    });

    // ✅ Cập nhật NgayGuiHang trong bảng ThongTinVanChuyen
    const formatDateForSQL = (date) => {
      if (!date) return null;
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const ngayGuiHangFormatted = formatDateForSQL(new Date());

    await db.sequelize.query(
      `UPDATE ThongTinVanChuyen 
       SET NgayGuiHang = :ngayGui, 
           TrangThaiGHN = :trangThai
       WHERE HoaDonID = :hoaDonId`,
      {
        replacements: {
          ngayGui: ngayGuiHangFormatted,
          trangThai: 'picking',
          hoaDonId: hoaDon.ID
        },
        transaction
      }
    );

    // ✅ SỬA: Sử dụng safeCommit để commit transaction an toàn
    await safeCommit(transaction, hoaDon, 'Đang giao hàng', 'shipOrder');

    res.status(200).json({
      success: true,
      message: '🚚 Đã bàn giao cho shipper thành công!',
      data: {
        orderId: hoaDon.ID,
        maHD: hoaDon.MaHD,
        trangThai: 'Đang giao hàng',
        maVanDon: vanChuyen.MaVanDon,
        donViVanChuyen: vanChuyen.DonViVanChuyen,
        ngayGuiHang: new Date()
      }
    });

  } catch (error) {
    // ✅ SỬA: Chỉ rollback nếu transaction chưa được commit
    if (!transactionCommitted && !transaction.finished) {
      await safeRollback(transaction, 'shipOrder error');
    }
    console.error('❌ Lỗi bàn giao shipper:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ⭐ POST /api/admin/orders/:id/delivered
 * Xác nhận đã giao hàng (Đang giao hàng → Đã giao hàng)
 */
exports.markAsDelivered = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  let transactionCommitted = false;

  try {
    const orderId = parseInt(req.params.id);

    if (!orderId || orderId < 1) {
      await safeRollback(transaction, 'invalid orderId');
      return res.status(400).json({
        success: false,
        message: 'ID đơn hàng không hợp lệ'
      });
    }

    const hoaDon = await HoaDon.findByPk(orderId, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!hoaDon) {
      await safeRollback(transaction, 'order not found');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const orderState = new OrderStateContext(hoaDon);

    await orderState.transitionTo('Đã giao hàng', transaction);

    // ✅ FIX: Update NgayGiaoThanhCong bằng raw SQL để tránh lỗi timezone
    await db.sequelize.query(
      `UPDATE ThongTinVanChuyen 
       SET NgayGiaoThanhCong = GETDATE()
       WHERE HoaDonID = :hoaDonID`,
      {
        replacements: { hoaDonID: hoaDon.ID },
        transaction,
        type: db.sequelize.QueryTypes.UPDATE
      }
    );

    // ✅ SỬA: Sử dụng safeCommit để commit transaction an toàn
    transactionCommitted = await safeCommit(transaction, hoaDon, 'Đã giao hàng', 'markAsDelivered');

    const ngayGiaoThanhCong = new Date();

    res.status(200).json({
      success: true,
      message: 'Đã xác nhận giao hàng thành công',
      data: {
        orderId: hoaDon.ID,
        maHD: hoaDon.MaHD,
        trangThai: 'Đã giao hàng',
        ngayGiaoThanhCong: ngayGiaoThanhCong,
        availableActions: orderState.getAvailableTransitions()
      }
    });

  } catch (error) {
    // ✅ SỬA: Chỉ rollback nếu transaction chưa được commit
    if (!transactionCommitted && !transaction.finished) {
      await safeRollback(transaction, 'markAsDelivered error');
    }
    console.error('❌ Lỗi xác nhận đã giao hàng:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ⭐ POST /api/admin/orders/:id/complete
 * Hoàn thành đơn hàng (Đã giao hàng → Hoàn thành)
 */
exports.completeOrder = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  let transactionCommitted = false; // ✅ THÊM: Khai báo biến track transaction state

  try {
    const orderId = parseInt(req.params.id);

    if (!orderId || orderId < 1) {
      await safeRollback(transaction, 'invalid orderId');
      return res.status(400).json({
        success: false,
        message: 'ID đơn hàng không hợp lệ'
      });
    }

    const hoaDon = await HoaDon.findByPk(orderId, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!hoaDon) {
      await safeRollback(transaction, 'order not found');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // ✅ THÊM: Validate trạng thái hiện tại trước khi chuyển
    if (hoaDon.TrangThai !== 'Đã giao hàng') {
      await safeRollback(transaction, 'invalid status for completeOrder');
      return res.status(400).json({
        success: false,
        message: `Không thể hoàn thành đơn hàng. Trạng thái hiện tại: "${hoaDon.TrangThai}". Chỉ có thể hoàn thành từ trạng thái "Đã giao hàng".`,
        currentStatus: hoaDon.TrangThai,
        requiredStatus: 'Đã giao hàng'
      });
    }

    const orderState = new OrderStateContext(hoaDon);
    await orderState.transitionTo('Hoàn thành', transaction);

    // ✅ SỬA: Sử dụng safeCommit để commit transaction an toàn
    transactionCommitted = await safeCommit(transaction, hoaDon, 'Hoàn thành', 'completeOrder');

    res.status(200).json({
      success: true,
      message: 'Đã hoàn thành đơn hàng',
      data: {
        orderId: hoaDon.ID,
        maHD: hoaDon.MaHD,
        trangThai: 'Hoàn thành'
      }
    });

  } catch (error) {
    // ✅ SỬA: Chỉ rollback nếu transaction chưa được commit
    if (!transactionCommitted && !transaction.finished) {
      await safeRollback(transaction, 'completeOrder error');
    }
    console.error('❌ Lỗi hoàn thành đơn hàng:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ⭐ POST /api/admin/orders/:id/delivery-failed
 * Giao hàng thất bại (Đang giao hàng → Giao hàng thất bại)
 */
exports.markDeliveryFailed = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  let transactionCommitted = false;

  try {
    const orderId = parseInt(req.params.id);
    const { lyDo } = req.body;

    if (!orderId || orderId < 1) {
      await safeRollback(transaction, 'invalid orderId');
      return res.status(400).json({
        success: false,
        message: 'ID đơn hàng không hợp lệ'
      });
    }

    const hoaDon = await HoaDon.findByPk(orderId, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!hoaDon) {
      await safeRollback(transaction, 'order not found');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const orderState = new OrderStateContext(hoaDon);

    const soLanThatBai = (hoaDon.SoLanGiaoThatBai || 0) + 1;

    await orderState.transitionTo('Giao hàng thất bại', transaction, {
      SoLanGiaoThatBai: soLanThatBai,
      GhiChu: hoaDon.GhiChu
        ? `${hoaDon.GhiChu} | [Giao thất bại lần ${soLanThatBai}] ${lyDo || 'Không có lý do'}`
        : `[Giao thất bại lần ${soLanThatBai}] ${lyDo || 'Không có lý do'}`
    });

    // ✅ SỬA: Sử dụng safeCommit để commit transaction an toàn
    await safeCommit(transaction, hoaDon, 'Giao hàng thất bại', 'markDeliveryFailed');

    res.status(200).json({
      success: true,
      message: `Đã đánh dấu giao hàng thất bại (lần ${soLanThatBai}/3)`,
      data: {
        orderId: hoaDon.ID,
        maHD: hoaDon.MaHD,
        trangThai: 'Giao hàng thất bại',
        soLanThatBai: soLanThatBai,
        availableActions: orderState.getAvailableTransitions()
      }
    });

  } catch (error) {
    // ✅ SỬA: Chỉ rollback nếu transaction chưa được commit
    if (!transactionCommitted && !transaction.finished) {
      await safeRollback(transaction, 'markDeliveryFailed error');
    }
    console.error('❌ Lỗi đánh dấu giao thất bại:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ⭐ GET /api/admin/orders/counts/by-status
 * Lấy số lượng đơn hàng theo từng trạng thái (Admin only)
 * Dùng để hiển thị badge count trên các tab
 */
exports.getOrderCountsByStatus = async (req, res) => {
  try {
    console.log('📊 Admin - Lấy số lượng đơn hàng theo trạng thái');

    // Đếm tổng số đơn hàng
    const totalCount = await HoaDon.count();

    // Đếm số lượng đơn hàng theo từng trạng thái
    const statusCounts = await HoaDon.findAll({
      attributes: [
        'TrangThai',
        [db.sequelize.fn('COUNT', db.sequelize.col('ID')), 'count']
      ],
      group: ['TrangThai']
    });

    // Chuyển đổi kết quả thành object dễ sử dụng
    const counts = {
      'Tất cả': totalCount,
      'Chờ xử lý': 0,
      'Đang giao': 0,
      'Đã giao': 0,
      'Hoàn thành': 0,
      'Đã hủy': 0
    };

    statusCounts.forEach(item => {
      const status = item.TrangThai;
      const count = parseInt(item.dataValues.count);
      counts[status] = count;
    });

    console.log('✅ Đếm số lượng đơn hàng thành công:', counts);

    res.status(200).json({
      success: true,
      message: 'Lấy số lượng đơn hàng theo trạng thái thành công',
      data: {
        counts: DTOMapper.toCamelCase(counts),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Lỗi đếm số lượng đơn hàng:', error);

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

