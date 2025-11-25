/**
 * 🔔 WEBHOOK CONTROLLER
 * Xử lý các webhook callback từ các dịch vụ bên ngoài:
 * - GHN: Cập nhật trạng thái vận chuyển
 * - VNPay: Thông báo thanh toán (IPN)
 */

const db = require('../models');
const HoaDon = db.HoaDon;
const { OrderStateContext } = require('../states/OrderState');
const ghnService = require('../services/ghn.service');

/**
 * 🚚 WEBHOOK TỪ GIAO HÀNG NHANH (GHN)
 * POST /api/webhooks/ghn
 * 
 * GHN sẽ gọi webhook này khi có thay đổi trạng thái đơn hàng:
 * - ready_to_pick: Chờ lấy hàng
 * - picked: Đã lấy hàng
 * - delivering: Đang giao hàng
 * - delivered: Đã giao hàng thành công
 * - return: Hoàn trả
 * - delivery_fail: Giao thất bại
 */
exports.handleGHNWebhook = async (req, res) => {
  try {
    console.log('🔔 Nhận webhook từ GHN:', JSON.stringify(req.body, null, 2));

    const {
      OrderCode,      // Mã vận đơn GHN
      Status,         // Trạng thái hiện tại
      StatusText,     // Mô tả trạng thái
      Time,           // Thời gian cập nhật
      Reason,         // Lý do (nếu có)
      CODAmount,      // Số tiền COD
      CODTransferDate // Ngày chuyển tiền COD
    } = req.body;

    // Validate dữ liệu
    if (!OrderCode || !Status) {
      console.log('⚠️ Webhook thiếu thông tin OrderCode hoặc Status');
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin OrderCode hoặc Status'
      });
    }

    // Tìm đơn hàng theo mã vận đơn
    const hoaDon = await HoaDon.findOne({
      where: { MaVanDon: OrderCode }
    });

    if (!hoaDon) {
      console.log(`⚠️ Không tìm thấy đơn hàng với mã vận đơn: ${OrderCode}`);
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy đơn hàng với mã vận đơn: ${OrderCode}`
      });
    }

    console.log(`📦 Đơn hàng tìm thấy: ${hoaDon.MaHD}, trạng thái hiện tại: ${hoaDon.TrangThai}`);

    // Mapping trạng thái GHN → ToyStore
    const statusMap = {
      'ready_to_pick': null,          // Chờ lấy hàng (không đổi)
      'picking': null,                // Đang lấy hàng (không đổi)
      'picked': null,                 // Đã lấy hàng (không đổi)
      'storing': null,                // Nhập kho (không đổi)
      'transporting': null,           // Đang luân chuyển (không đổi)
      'sorting': null,                // Đang phân loại (không đổi)
      'delivering': null,             // Đang giao hàng (đã có sẵn)
      'delivered': 'Đã giao hàng',   // ✅ Giao thành công
      'delivery_fail': 'Giao hàng thất bại', // ❌ Giao thất bại
      'return': 'Giao hàng thất bại', // ❌ Hoàn trả
      'returned': 'Đã hủy',           // ❌ Đã hoàn trả về shop
      'cancel': 'Đã hủy'              // ❌ Đơn bị hủy
    };

    const newStatus = statusMap[Status];

    // Nếu không cần cập nhật (các trạng thái trung gian)
    if (!newStatus) {
      console.log(`ℹ️ Trạng thái GHN "${Status}" không yêu cầu cập nhật đơn hàng`);

      // Vẫn lưu log vào GhiChu
      const ghnStatusText = ghnService.getStatusText(Status);
      await HoaDon.update(
        {
          GhiChu: hoaDon.GhiChu
            ? `${hoaDon.GhiChu} | [GHN ${Time}] ${ghnStatusText}`
            : `[GHN ${Time}] ${ghnStatusText}`
        },
        { where: { ID: hoaDon.ID } }
      );

      return res.status(200).json({
        success: true,
        message: `Đã ghi log trạng thái GHN: ${ghnStatusText}`
      });
    }

    // Chỉ cập nhật nếu trạng thái hiện tại cho phép
    if (hoaDon.TrangThai === newStatus) {
      console.log(`ℹ️ Đơn hàng đã ở trạng thái "${newStatus}", không cần cập nhật`);
      return res.status(200).json({
        success: true,
        message: 'Trạng thái đã đúng, không cần cập nhật'
      });
    }

    // Sử dụng State Pattern để chuyển trạng thái
    const transaction = await db.sequelize.transaction();

    try {
      const orderState = new OrderStateContext(hoaDon);

      const additionalData = {
        GhiChu: hoaDon.GhiChu
          ? `${hoaDon.GhiChu} | [GHN Webhook ${Time}] ${StatusText || ghnService.getStatusText(Status)}`
          : `[GHN Webhook ${Time}] ${StatusText} || ghnService.getStatusText(Status)}`
      };

      // Nếu giao thành công
      if (newStatus === 'Đã giao hàng') {
        // ✅ FIX: Cập nhật NgayGiaoThanhCong sau khi transition thành công bằng raw SQL
        // Không truyền qua additionalData vì sẽ gây lỗi timezone
        additionalData.shouldUpdateDeliveryDate = true;
        if (CODAmount && CODTransferDate) {
          additionalData.GhiChu += ` | COD: ${CODAmount}đ (${CODTransferDate})`;
        }
      }

      // Nếu giao thất bại
      if (newStatus === 'Giao hàng thất bại') {
        const soLanThatBai = (hoaDon.SoLanGiaoThatBai || 0) + 1;
        additionalData.SoLanGiaoThatBai = soLanThatBai;
        if (Reason) {
          additionalData.GhiChu += ` | Lý do: ${Reason}`;
        }
      }

      // Chuyển trạng thái
      await orderState.transitionTo(newStatus, transaction, additionalData);

      // ✅ FIX: Nếu giao thành công, update NgayGiaoThanhCong bằng raw SQL
      if (newStatus === 'Đã giao hàng') {
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
      }

      await transaction.commit();

      console.log(`✅ Cập nhật thành công: ${hoaDon.MaHD} - ${hoaDon.TrangThai} → ${newStatus}`);

      res.status(200).json({
        success: true,
        message: `Cập nhật trạng thái thành công: ${hoaDon.TrangThai} → ${newStatus}`,
        data: {
          orderCode: hoaDon.MaHD,
          oldStatus: hoaDon.TrangThai,
          newStatus: newStatus
        }
      });

    } catch (stateError) {
      await transaction.rollback();
      console.error('❌ Lỗi chuyển trạng thái:', stateError.message);

      // Vẫn ghi log ngay cả khi không thể chuyển trạng thái
      await HoaDon.update(
        {
          GhiChu: hoaDon.GhiChu
            ? `${hoaDon.GhiChu} | [GHN Error] Không thể chuyển sang "${newStatus}": ${stateError.message}`
            : `[GHN Error] Không thể chuyển sang "${newStatus}": ${stateError.message}`
        },
        { where: { ID: hoaDon.ID } }
      );

      return res.status(200).json({
        success: true,
        message: 'Đã ghi log lỗi, nhưng không thể tự động chuyển trạng thái',
        error: stateError.message
      });
    }

  } catch (error) {
    console.error('❌ Lỗi xử lý webhook GHN:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xử lý webhook',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * 🔍 TRACKING ĐƠN HÀNG GHN
 * GET /api/admin/orders/:id/tracking
 * 
 * Lấy thông tin tracking chi tiết từ GHN
 */
exports.getGHNTracking = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);

    if (!orderId || orderId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID đơn hàng không hợp lệ'
      });
    }

    const hoaDon = await HoaDon.findByPk(orderId);

    if (!hoaDon) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (!hoaDon.MaVanDon) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng chưa có mã vận đơn'
      });
    }

    // Gọi GHN API để lấy thông tin tracking
    const trackingResult = await ghnService.getOrderInfo(hoaDon.MaVanDon);

    if (!trackingResult.success) {
      return res.status(400).json({
        success: false,
        message: `Không thể lấy thông tin tracking: ${trackingResult.message}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin tracking thành công',
      data: {
        orderCode: hoaDon.MaHD,
        maVanDon: hoaDon.MaVanDon,
        donViVanChuyen: hoaDon.DonViVanChuyen,
        tracking: trackingResult.data,
        trackingUrl: `https://donhang.ghn.vn/?order_code=${hoaDon.MaVanDon}`
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * 🖨️ IN PHIẾU GIAO HÀNG GHN
 * POST /api/admin/orders/print-label
 * 
 * Lấy token để in phiếu giao hàng từ GHN
 */
exports.printGHNLabel = async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách ID đơn hàng'
      });
    }

    // Lấy mã vận đơn từ các đơn hàng
    const hoaDons = await HoaDon.findAll({
      where: {
        ID: orderIds,
        MaVanDon: { [db.Sequelize.Op.ne]: null }
      },
      attributes: ['ID', 'MaHD', 'MaVanDon']
    });

    if (hoaDons.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy đơn hàng nào có mã vận đơn'
      });
    }

    const maVanDons = hoaDons.map(h => h.MaVanDon);

    // Gọi GHN API để lấy token in
    const printResult = await ghnService.getPrintToken(maVanDons);

    if (!printResult.success) {
      return res.status(400).json({
        success: false,
        message: `Không thể lấy token in: ${printResult.message}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lấy token in thành công',
      data: {
        orders: hoaDons.map(h => ({
          id: h.ID,
          maHD: h.MaHD,
          maVanDon: h.MaVanDon
        })),
        printUrl: printResult.data.printUrl,
        token: printResult.data.token
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy token in:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * 💰 TÍNH PHÍ VẬN CHUYỂN GHN
 * POST /api/shipping/calculate-fee
 * 
 * Tính phí ship dựa trên địa chỉ và trọng lượng
 */
exports.calculateShippingFee = async (req, res) => {
  try {
    const { toDistrictId, toWardCode, weight, insuranceValue } = req.body;

    if (!toDistrictId || !toWardCode) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp thông tin địa chỉ giao hàng'
      });
    }

    const feeResult = await ghnService.calculateShippingFee({
      toDistrictId: parseInt(toDistrictId),
      toWardCode: toWardCode,
      weight: weight || 500,
      insuranceValue: insuranceValue || 0
    });

    if (!feeResult.success) {
      return res.status(400).json({
        success: false,
        message: `Không thể tính phí ship: ${feeResult.message}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tính phí ship thành công',
      data: feeResult.data
    });

  } catch (error) {
    console.error('❌ Lỗi tính phí ship:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * 🗺️ LẤY DANH SÁCH TỈNH/THÀNH PHỐ
 * GET /api/shipping/provinces
 */
exports.getProvinces = async (req, res) => {
  try {
    const result = await ghnService.getProvinces();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách tỉnh/thành thành công',
      data: result.data
    });

  } catch (error) {
    console.error('❌ Lỗi lấy tỉnh/thành:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
};

/**
 * 🗺️ LẤY DANH SÁCH QUẬN/HUYỆN
 * GET /api/shipping/districts/:provinceId
 */
exports.getDistricts = async (req, res) => {
  try {
    const provinceId = parseInt(req.params.provinceId);

    if (!provinceId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã tỉnh/thành'
      });
    }

    const result = await ghnService.getDistricts(provinceId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách quận/huyện thành công',
      data: result.data
    });

  } catch (error) {
    console.error('❌ Lỗi lấy quận/huyện:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
};

/**
 * 🗺️ LẤY DANH SÁCH PHƯỜNG/XÃ
 * GET /api/shipping/wards/:districtId
 */
exports.getWards = async (req, res) => {
  try {
    const districtId = parseInt(req.params.districtId);

    if (!districtId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã quận/huyện'
      });
    }

    const result = await ghnService.getWards(districtId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách phường/xã thành công',
      data: result.data
    });

  } catch (error) {
    console.error('❌ Lỗi lấy phường/xã:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
};

module.exports = exports;
