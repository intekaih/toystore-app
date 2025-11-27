/**
 * 🚚 SHIPPING CONTROLLER - Tích hợp Giao Hàng Nhanh (GHN)
 */

const ghnService = require('../services/ghn.service');
const ghnMockService = require('../services/ghn.mock.service');
const { syncGHNStatusToOrder } = require('../utils/ghnStatusSync');
const db = require('../models');
const DTOMapper = require('../utils/DTOMapper'); // ✅ THÊM DTOMapper

const HoaDon = db.HoaDon;
const ChiTietHoaDon = db.ChiTietHoaDon;
const SanPham = db.SanPham;
const KhachHang = db.KhachHang;
const ThongTinVanChuyen = db.ThongTinVanChuyen;

/**
 * 💰 Tính phí ship tự động từ GHN
 * POST /api/shipping/calculate-fee
 */
exports.calculateShippingFee = async (req, res) => {
  try {
    const { toDistrictId, toWardCode, weight, insuranceValue } = req.body;

    if (!toDistrictId || !toWardCode) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin địa chỉ giao hàng (toDistrictId, toWardCode)'
      });
    }

    const result = await ghnService.calculateShippingFee({
      toDistrictId,
      toWardCode,
      weight: weight || 500,
      insuranceValue: insuranceValue || 0
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Tính phí ship thành công',
        data: {
          shippingFee: result.data.total,
          details: result.data
        }
      });
    }

    return res.status(400).json(result);

  } catch (error) {
    console.error('❌ Lỗi tính phí ship:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tính phí ship',
      error: error.message
    });
  }
};

/**
 * 📦 Tạo đơn vận chuyển trên GHN khi admin bàn giao shipper
 * POST /api/admin/orders/:id/create-ghn-order
 */
exports.createGHNOrder = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { weight, note } = req.body;

    // Lấy thông tin đơn hàng
    const hoaDon = await HoaDon.findOne({
      where: { ID: orderId },
      include: [
        {
          model: KhachHang,
          as: 'khachHang',
          attributes: ['HoTen', 'DienThoai', 'DiaChi']
        },
        {
          model: ChiTietHoaDon,
          as: 'chiTiet',
          include: [{
            model: SanPham,
            as: 'sanPham',
            attributes: ['Ten', 'GiaBan']
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

    // Validate địa chỉ giao hàng
    if (!hoaDon.QuanHuyen || !hoaDon.PhuongXa) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng thiếu thông tin địa chỉ giao hàng (QuanHuyen, PhuongXa)'
      });
    }

    // Chuẩn bị dữ liệu khách hàng
    const customerData = {
      name: hoaDon.khachHang.HoTen,
      phone: hoaDon.khachHang.DienThoai,
      address: hoaDon.DiaChiGiaoHang || hoaDon.khachHang.DiaChi,
      districtId: parseInt(hoaDon.QuanHuyen), // Lưu ý: Cần convert tên quận sang ID
      wardCode: hoaDon.PhuongXa // Lưu ý: Cần convert tên phường sang code
    };

    // Chuẩn bị danh sách sản phẩm
    const items = hoaDon.chiTiet.map(item => ({
      name: item.sanPham.Ten,
      quantity: item.SoLuong,
      price: parseFloat(item.DonGia)
    }));

    // Tính COD amount (nếu là COD)
    const codAmount = hoaDon.PhuongThucThanhToanID === 1 
      ? parseFloat(hoaDon.ThanhTien) 
      : 0;

    // Tạo đơn trên GHN
    const result = await ghnService.createShippingOrder({
      orderId: hoaDon.ID,
      orderCode: hoaDon.MaHD,
      customer: customerData,
      items: items,
      totalAmount: parseFloat(hoaDon.ThanhTien),
      codAmount: codAmount,
      note: note || '',
      weight: weight || 500
    });

    if (result.success) {
      // Cập nhật mã vận đơn GHN vào database
      await hoaDon.update({
        MaVanDon: result.data.ghnOrderCode,
        DonViVanChuyen: 'Giao Hàng Nhanh',
        NgayGuiHang: new Date()
      });

      return res.status(200).json({
        success: true,
        message: 'Tạo đơn GHN thành công',
        data: {
          orderId: hoaDon.ID,
          orderCode: hoaDon.MaHD,
          ghnOrderCode: result.data.ghnOrderCode,
          expectedDeliveryTime: result.data.expectedDeliveryTime,
          totalFee: result.data.totalFee
        }
      });
    }

    return res.status(400).json(result);

  } catch (error) {
    console.error('❌ Lỗi tạo đơn GHN:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo đơn GHN',
      error: error.message
    });
  }
};

/**
 * 🔍 Tracking đơn hàng từ GHN
 * GET /api/orders/:orderCode/tracking
 */
exports.trackOrder = async (req, res) => {
  try {
    const { orderCode } = req.params;

    // Tìm đơn hàng trong DB
    const hoaDon = await HoaDon.findOne({
      where: { MaHD: orderCode }
    });

    if (!hoaDon) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (!hoaDon.MaVanDon) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng chưa có mã vận đơn GHN'
      });
    }

    // Lấy thông tin tracking từ GHN
    const result = await ghnService.getOrderInfo(hoaDon.MaVanDon);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Lấy thông tin tracking thành công',
        data: {
          orderCode: hoaDon.MaHD,
          ghnOrderCode: hoaDon.MaVanDon,
          currentStatus: result.data.statusText,
          expectedDeliveryTime: result.data.expectedDeliveryTime,
          logs: result.data.logs
        }
      });
    }

    return res.status(400).json(result);

  } catch (error) {
    console.error('❌ Lỗi tracking đơn hàng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tracking đơn hàng',
      error: error.message
    });
  }
};

/**
 * 🖨️ Lấy link in phiếu giao hàng
 * POST /api/admin/orders/print-label
 */
exports.getPrintLabel = async (req, res) => {
  try {
    const { orderCodes } = req.body; // Mảng mã vận đơn GHN

    if (!orderCodes || !Array.isArray(orderCodes) || orderCodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách mã vận đơn'
      });
    }

    const result = await ghnService.getPrintToken(orderCodes);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Lấy link in phiếu thành công',
        data: {
          printUrl: result.data.printUrl,
          token: result.data.token
        }
      });
    }

    return res.status(400).json(result);

  } catch (error) {
    console.error('❌ Lỗi lấy link in phiếu:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy link in phiếu',
      error: error.message
    });
  }
};

/**
 * 🗺️ Lấy danh sách tỉnh/thành phố
 * GET /api/shipping/provinces
 */
exports.getProvinces = async (req, res) => {
  try {
    const result = await ghnService.getProvinces();
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data
      });
    }

    return res.status(400).json(result);
  } catch (error) {
    console.error('❌ Lỗi lấy tỉnh/thành:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * 🗺️ Lấy danh sách quận/huyện
 * GET /api/shipping/districts/:provinceId
 */
exports.getDistricts = async (req, res) => {
  try {
    const { provinceId } = req.params;
    const result = await ghnService.getDistricts(parseInt(provinceId));
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data
      });
    }

    return res.status(400).json(result);
  } catch (error) {
    console.error('❌ Lỗi lấy quận/huyện:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * 🗺️ Lấy danh sách phường/xã
 * GET /api/shipping/wards/:districtId
 */
exports.getWards = async (req, res) => {
  try {
    const { districtId } = req.params;
    const result = await ghnService.getWards(parseInt(districtId));
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data
      });
    }

    return res.status(400).json(result);
  } catch (error) {
    console.error('❌ Lỗi lấy phường/xã:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * 📊 Lấy trạng thái GHN của đơn hàng từ database
 * GET /api/shipping/orders/:orderId/ghn-status
 */
exports.getGHNStatus = async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);

    // Tìm đơn hàng và thông tin vận chuyển
    const hoaDon = await HoaDon.findOne({
      where: { ID: orderId },
      include: [{
        model: ThongTinVanChuyen,
        as: 'thongTinVanChuyen',
        attributes: ['MaVanDon', 'DonViVanChuyen', 'TrangThaiGHN', 'NgayGiaoDuKien', 'NgayGuiHang']
      }]
    });

    if (!hoaDon) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const vanChuyen = hoaDon.thongTinVanChuyen;

    if (!vanChuyen || !vanChuyen.MaVanDon) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng chưa có mã vận đơn GHN'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        orderId: hoaDon.ID,
        orderCode: hoaDon.MaHD,
        ghnOrderCode: vanChuyen.MaVanDon,
        shippingCompany: vanChuyen.DonViVanChuyen,
        status: vanChuyen.TrangThaiGHN,
        statusText: ghnService.getStatusText(vanChuyen.TrangThaiGHN || ''),
        expectedDeliveryTime: vanChuyen.NgayGiaoDuKien,
        shippedAt: vanChuyen.NgayGuiHang
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy trạng thái GHN:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy trạng thái GHN',
      error: error.message
    });
  }
};

/**
 * 🔄 Đồng bộ trạng thái GHN từ API vào database
 * POST /api/shipping/orders/:orderId/sync-ghn-status
 */
exports.syncGHNStatus = async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);

    // Tìm đơn hàng và thông tin vận chuyển
    const hoaDon = await HoaDon.findOne({
      where: { ID: orderId },
      include: [{
        model: ThongTinVanChuyen,
        as: 'thongTinVanChuyen'
      }]
    });

    if (!hoaDon) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const vanChuyen = hoaDon.thongTinVanChuyen;

    if (!vanChuyen || !vanChuyen.MaVanDon) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng chưa có mã vận đơn GHN'
      });
    }

    // Lấy thông tin mới nhất từ GHN API
    const result = await ghnService.getOrderInfo(vanChuyen.MaVanDon);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || 'Không thể lấy thông tin từ GHN',
        error: result.error
      });
    }

    // Cập nhật trạng thái vào database
    const newStatus = result.data.status;
    const statusText = result.data.statusText;
    const oldGHNStatus = vanChuyen.TrangThaiGHN;

    // ✅ FIX: Tạo transaction trước khi sử dụng
    const transaction = await db.sequelize.transaction();

    try {
      // Cập nhật trạng thái GHN trong database
      await ThongTinVanChuyen.update(
        {
          TrangThaiGHN: newStatus
        },
        {
          where: { HoaDonID: orderId },
          transaction
        }
      );

      // Nếu đã giao hàng thành công, cập nhật NgayGiaoThanhCong
      if (newStatus === 'delivered' && !vanChuyen.NgayGiaoThanhCong) {
        await ThongTinVanChuyen.update(
          {
            NgayGiaoThanhCong: new Date()
          },
          {
            where: { HoaDonID: orderId },
            transaction
          }
        );
      }

      // Reload hoaDon để có dữ liệu mới nhất
      await hoaDon.reload({ transaction });
      
      // ✅ ĐỒNG BỘ: Tự động chuyển trạng thái đơn hàng nếu cần
      const syncResult = await syncGHNStatusToOrder(
        hoaDon,
        newStatus,
        transaction,
        `Đồng bộ từ GHN API: ${oldGHNStatus} → ${newStatus}`
      );

      if (syncResult.updated) {
        console.log(`✅ Đã đồng bộ trạng thái đơn hàng: ${syncResult.message}`);
      } else if (syncResult.message) {
        console.log(`ℹ️ ${syncResult.message}`);
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Đồng bộ trạng thái GHN thành công',
      data: {
        orderId: hoaDon.ID,
        orderCode: hoaDon.MaHD,
        ghnOrderCode: vanChuyen.MaVanDon,
        oldStatus: vanChuyen.TrangThaiGHN,
        newStatus: newStatus,
        statusText: statusText,
        expectedDeliveryTime: result.data.expectedDeliveryTime,
        logs: result.data.logs || []
      }
    });

  } catch (error) {
    console.error('❌ Lỗi đồng bộ trạng thái GHN:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đồng bộ trạng thái GHN',
      error: error.message
    });
  }
};

/**
 * 📍 Lấy chi tiết tracking GHN với timeline
 * GET /api/shipping/orders/:orderId/ghn-tracking
 */
exports.getGHNTracking = async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);

    // Tìm đơn hàng và thông tin vận chuyển
    const hoaDon = await HoaDon.findOne({
      where: { ID: orderId },
      include: [{
        model: ThongTinVanChuyen,
        as: 'thongTinVanChuyen'
      }]
    });

    if (!hoaDon) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const vanChuyen = hoaDon.thongTinVanChuyen;

    if (!vanChuyen || !vanChuyen.MaVanDon) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng chưa có mã vận đơn GHN'
      });
    }

    // Lấy thông tin tracking từ GHN API
    const result = await ghnService.getOrderInfo(vanChuyen.MaVanDon);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || 'Không thể lấy thông tin tracking từ GHN',
        error: result.error
      });
    }

    // Format logs thành timeline
    const timeline = (result.data.logs || []).map(log => ({
      status: log.status || '',
      statusText: ghnService.getStatusText(log.status || ''),
      time: log.updated_date || log.created_date || '',
      location: log.location || '',
      note: log.note || ''
    }));

    return res.status(200).json({
      success: true,
      data: {
        orderId: hoaDon.ID,
        orderCode: hoaDon.MaHD,
        ghnOrderCode: vanChuyen.MaVanDon,
        shippingCompany: vanChuyen.DonViVanChuyen,
        currentStatus: result.data.status,
        currentStatusText: result.data.statusText,
        expectedDeliveryTime: result.data.expectedDeliveryTime,
        leadTime: result.data.leadTime,
        sortCode: result.data.sortCode,
        timeline: timeline,
        // Trạng thái từ database (có thể cũ hơn)
        dbStatus: vanChuyen.TrangThaiGHN,
        dbStatusText: ghnService.getStatusText(vanChuyen.TrangThaiGHN || '')
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy tracking GHN:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy tracking GHN',
      error: error.message
    });
  }
};

/**
 * 🎭 MOCK: Chuyển trạng thái đơn hàng sang bước tiếp theo (chỉ dùng trong development)
 * POST /api/shipping/mock/advance-status/:ghnOrderCode
 */
exports.advanceMockStatus = async (req, res) => {
  try {
    // Chỉ cho phép trong development mode
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Mock endpoints chỉ dùng trong development mode'
      });
    }

    const { ghnOrderCode } = req.params;

    if (!ghnOrderCode) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu mã vận đơn GHN'
      });
    }

    // Advance status trong mock service
    const mockOrder = ghnMockService.advanceStatus(ghnOrderCode);
    const oldGHNStatus = mockOrder.statusIndex > 0 
      ? ghnMockService.getStatusFlow()[mockOrder.statusIndex - 1] 
      : null;

    // Tìm đơn hàng trong database và cập nhật trạng thái
    const vanChuyen = await ThongTinVanChuyen.findOne({
      where: { MaVanDon: ghnOrderCode },
      include: [{
        model: HoaDon,
        as: 'hoaDon'
      }]
    });

    if (vanChuyen && vanChuyen.hoaDon) {
      const transaction = await db.sequelize.transaction();
      
      try {
        // Cập nhật trạng thái GHN trong database
        await ThongTinVanChuyen.update(
          {
            TrangThaiGHN: mockOrder.status
          },
          {
            where: { MaVanDon: ghnOrderCode },
            transaction
          }
        );

        // Nếu đã giao hàng thành công, cập nhật NgayGiaoThanhCong
        if (mockOrder.status === 'delivered' && !vanChuyen.NgayGiaoThanhCong) {
          await ThongTinVanChuyen.update(
            {
              NgayGiaoThanhCong: new Date()
            },
            {
              where: { MaVanDon: ghnOrderCode },
              transaction
            }
          );
        }

        // Reload hoaDon để có dữ liệu mới nhất
        await vanChuyen.hoaDon.reload({ transaction });
        
        // ✅ ĐỒNG BỘ: Tự động chuyển trạng thái đơn hàng nếu cần
        const syncResult = await syncGHNStatusToOrder(
          vanChuyen.hoaDon,
          mockOrder.status,
          transaction,
          `Mock mode: ${oldGHNStatus} → ${mockOrder.status}`
        );

        if (syncResult.updated) {
          console.log(`✅ Đã đồng bộ trạng thái đơn hàng: ${syncResult.message}`);
        } else if (syncResult.message) {
          console.log(`ℹ️ ${syncResult.message}`);
        }

        await transaction.commit();
        console.log(`✅ Đã cập nhật trạng thái GHN trong database: ${ghnOrderCode} -> ${mockOrder.status}`);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } else {
      console.warn(`⚠️ Không tìm thấy đơn hàng với mã vận đơn: ${ghnOrderCode}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Đã chuyển trạng thái thành công',
      data: {
        ghnOrderCode: mockOrder.orderCode,
        oldStatus: mockOrder.statusIndex > 0 ? ghnMockService.getStatusFlow()[mockOrder.statusIndex - 1] : null,
        newStatus: mockOrder.status,
        newStatusText: ghnMockService.getStatusText(mockOrder.status),
        statusIndex: mockOrder.statusIndex,
        timeline: mockOrder.timeline
      }
    });

  } catch (error) {
    console.error('❌ Lỗi advance mock status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi chuyển trạng thái mock',
      error: error.message
    });
  }
};

/**
 * 🎭 MOCK: Đặt trạng thái cụ thể cho đơn hàng (chỉ dùng trong development)
 * POST /api/shipping/mock/set-status/:ghnOrderCode
 */
exports.setMockStatus = async (req, res) => {
  try {
    // Chỉ cho phép trong development mode
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Mock endpoints chỉ dùng trong development mode'
      });
    }

    const { ghnOrderCode } = req.params;
    const { status } = req.body;

    if (!ghnOrderCode || !status) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu mã vận đơn GHN hoặc trạng thái'
      });
    }

    // Đặt trạng thái trong mock service
    const mockOrder = ghnMockService.setStatus(ghnOrderCode, status);
    const oldGHNStatus = mockOrder.timeline.length > 1 
      ? mockOrder.timeline[mockOrder.timeline.length - 2].status 
      : null;

    // Cập nhật trong database
    const vanChuyen = await ThongTinVanChuyen.findOne({
      where: { MaVanDon: ghnOrderCode },
      include: [{
        model: HoaDon,
        as: 'hoaDon'
      }]
    });

    if (vanChuyen && vanChuyen.hoaDon) {
      const transaction = await db.sequelize.transaction();
      
      try {
        await ThongTinVanChuyen.update(
          {
            TrangThaiGHN: status
          },
          {
            where: { MaVanDon: ghnOrderCode },
            transaction
          }
        );

        if (status === 'delivered' && !vanChuyen.NgayGiaoThanhCong) {
          await ThongTinVanChuyen.update(
            {
              NgayGiaoThanhCong: new Date()
            },
            {
              where: { MaVanDon: ghnOrderCode },
              transaction
            }
          );
        }

        // Reload hoaDon để có dữ liệu mới nhất
        await vanChuyen.hoaDon.reload({ transaction });
        
        // ✅ ĐỒNG BỘ: Tự động chuyển trạng thái đơn hàng nếu cần
        const syncResult = await syncGHNStatusToOrder(
          vanChuyen.hoaDon,
          status,
          transaction,
          `Mock mode set status: ${oldGHNStatus} → ${status}`
        );

        if (syncResult.updated) {
          console.log(`✅ Đã đồng bộ trạng thái đơn hàng: ${syncResult.message}`);
        } else if (syncResult.message) {
          console.log(`ℹ️ ${syncResult.message}`);
        }

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } else {
      console.warn(`⚠️ Không tìm thấy đơn hàng với mã vận đơn: ${ghnOrderCode}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Đã đặt trạng thái thành công',
      data: {
        ghnOrderCode: mockOrder.orderCode,
        status: mockOrder.status,
        statusText: ghnMockService.getStatusText(mockOrder.status),
        timeline: mockOrder.timeline
      }
    });

  } catch (error) {
    console.error('❌ Lỗi set mock status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đặt trạng thái mock',
      error: error.message
    });
  }
};

/**
 * 🎭 MOCK: Lấy danh sách tất cả đơn hàng mock (chỉ dùng trong development)
 * GET /api/shipping/mock/orders
 */
exports.getMockOrders = async (req, res) => {
  try {
    // Chỉ cho phép trong development mode
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Mock endpoints chỉ dùng trong development mode'
      });
    }

    const mockOrders = ghnMockService.getAllMockOrders();

    return res.status(200).json({
      success: true,
      data: mockOrders.map(order => ({
        orderCode: order.orderCode,
        status: order.status,
        statusText: ghnMockService.getStatusText(order.status),
        statusIndex: order.statusIndex,
        expectedDeliveryTime: order.expectedDeliveryTime,
        timeline: order.timeline
      }))
    });

  } catch (error) {
    console.error('❌ Lỗi lấy danh sách mock orders:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách mock orders',
      error: error.message
    });
  }
};