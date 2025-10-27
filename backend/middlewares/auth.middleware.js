const jwt = require('jsonwebtoken');
const db = require('../models');
const TaiKhoan = db.TaiKhoan;

// Import Singleton utilities
const Logger = require('../utils/Logger');
const ConfigService = require('../utils/ConfigService');

const logger = Logger.getInstance();
const config = ConfigService.getInstance();

// Middleware xác thực JWT token
exports.verifyToken = async (req, res, next) => {
  try {
    // Lấy token từ header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      logger.warn('Xác thực thất bại: Không có token', { 
        url: req.url, 
        ip: req.ip 
      });
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực'
      });
    }

    // Token có format: "Bearer <token>"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      logger.warn('Xác thực thất bại: Token không hợp lệ');
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    // Verify token - sử dụng config từ ConfigService
    const jwtSecret = config.getValue('jwt', 'secret');
    const decoded = jwt.verify(token, jwtSecret);
    
    // Kiểm tra user vẫn tồn tại và đang hoạt động
    const user = await TaiKhoan.findOne({
      where: {
        ID: decoded.userId,
        Enable: true
      }
    });

    if (!user) {
      logger.warn(`Xác thực thất bại: User không tồn tại hoặc bị khóa - ID: ${decoded.userId}`);
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa'
      });
    }

    // Lưu thông tin user vào request
    req.user = {
      id: user.ID,
      username: user.TenDangNhap,
      role: user.VaiTro,
      hoTen: user.HoTen,
      email: user.Email
    };

    logger.debug(`Token xác thực thành công: ${user.TenDangNhap} (${user.VaiTro})`);
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Xác thực thất bại: Token không hợp lệ');
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    if (error.name === 'TokenExpiredError') {
      logger.warn('Xác thực thất bại: Token đã hết hạn');
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn'
      });
    }

    logger.logError(error, 'Middleware verifyToken');
    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
};

// Middleware kiểm tra quyền admin
exports.requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    logger.debug(`Admin access granted: ${req.user.username}`);
    next();
  } else {
    logger.warn(`Truy cập bị từ chối: User ${req.user?.username || 'unknown'} không có quyền admin`);
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền truy cập'
    });
  }
};

// Middleware kiểm tra quyền user (đã đăng nhập)
exports.requireAuth = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    logger.warn('Yêu cầu đăng nhập để tiếp tục');
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập để tiếp tục'
    });
  }
};