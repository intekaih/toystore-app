const staffService = require('../services/staff.service');
const Logger = require('../utils/Logger');
const DTOMapper = require('../utils/DTOMapper'); // ✅ THÊM DTOMapper

const logger = Logger.getInstance();

/**
 * =======================================
 * QUẢN LÝ ĐƠN HÀNG - CONTROLLER
 * =======================================
 */

/**
 * Lấy danh sách đơn hàng với phân trang và lọc
 */
exports.getAllOrders = async (req, res) => {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      trangThai: req.query.trangThai,
      tuNgay: req.query.tuNgay,
      denNgay: req.query.denNgay,
      keyword: req.query.keyword
    };

    const result = await staffService.getAllOrders(filters);

    return res.status(200).json(result);

  } catch (error) {
    logger.logError(error, 'Staff Controller - getAllOrders');
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách đơn hàng'
    });
  }
};

/**
 * Lấy chi tiết đơn hàng
 */
exports.getOrderDetail = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu ID đơn hàng'
      });
    }

    const result = await staffService.getOrderDetail(orderId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    logger.logError(error, 'Staff Controller - getOrderDetail');
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết đơn hàng'
    });
  }
};

/**
 * Cập nhật trạng thái đơn hàng
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { trangThai, ghiChu } = req.body;
    const staffId = req.user.id;

    if (!orderId || !trangThai) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin đơn hàng hoặc trạng thái'
      });
    }

    const result = await staffService.updateOrderStatus(
      orderId,
      staffId,
      trangThai,
      ghiChu
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    logger.logError(error, 'Staff Controller - updateOrderStatus');
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái đơn hàng'
    });
  }
};

/**
 * Thống kê đơn hàng theo trạng thái
 */
exports.getOrderStatistics = async (req, res) => {
  try {
    const result = await staffService.getOrderStatistics();

    return res.status(200).json(result);

  } catch (error) {
    logger.logError(error, 'Staff Controller - getOrderStatistics');
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê đơn hàng'
    });
  }
};

/**
 * =======================================
 * QUẢN LÝ SẢN PHẨM - CONTROLLER
 * =======================================
 */

/**
 * Lấy danh sách sản phẩm với lọc và phân trang
 */
exports.getAllProducts = async (req, res) => {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      idLoai: req.query.idLoai,
      keyword: req.query.keyword,
      trangThai: req.query.trangThai
    };

    const result = await staffService.getAllProducts(filters);

    return res.status(200).json(result);

  } catch (error) {
    logger.logError(error, 'Staff Controller - getAllProducts');
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách sản phẩm'
    });
  }
};

/**
 * Cập nhật số lượng tồn kho sản phẩm
 */
exports.updateProductStock = async (req, res) => {
  try {
    const productId = req.params.id;
    const { soLuongTon, ghiChu } = req.body;
    const staffId = req.user.id;

    if (!productId || soLuongTon === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin sản phẩm hoặc số lượng tồn kho'
      });
    }

    if (soLuongTon < 0) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng tồn kho không hợp lệ'
      });
    }

    const result = await staffService.updateProductStock(
      productId,
      staffId,
      soLuongTon,
      ghiChu
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    logger.logError(error, 'Staff Controller - updateProductStock');
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật tồn kho sản phẩm'
    });
  }
};

/**
 * Cập nhật trạng thái sản phẩm
 */
exports.updateProductStatus = async (req, res) => {
  try {
    const productId = req.params.id;
    const { enable } = req.body;
    const staffId = req.user.id;

    if (!productId || enable === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin sản phẩm hoặc trạng thái'
      });
    }

    const result = await staffService.updateProductStatus(
      productId,
      staffId,
      enable
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    logger.logError(error, 'Staff Controller - updateProductStatus');
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái sản phẩm'
    });
  }
};

/**
 * =======================================
 * DASHBOARD - CONTROLLER
 * =======================================
 */

/**
 * Lấy thống kê tổng quan cho dashboard nhân viên
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const result = await staffService.getDashboardStats();

    return res.status(200).json(result);

  } catch (error) {
    logger.logError(error, 'Staff Controller - getDashboardStats');
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê dashboard'
    });
  }
};

module.exports = exports;
