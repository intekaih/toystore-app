const jwt = require('jsonwebtoken');
const db = require('../models');
const TaiKhoan = db.TaiKhoan;

// Middleware xác thực JWT token
exports.verifyToken = async (req, res, next) => {
  try {
    // Lấy token từ header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực'
      });
    }

    // Token có format: "Bearer <token>"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kiểm tra user vẫn tồn tại và đang hoạt động
    const user = await TaiKhoan.findOne({
      where: {
        ID: decoded.userId,
        Enable: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa'
      });
    }

    // Lưu thông tin user vào request để sử dụng ở các middleware/controller tiếp theo
    req.user = {
      id: user.ID,
      username: user.TenDangNhap,
      role: user.VaiTro,
      hoTen: user.HoTen,
      email: user.Email
    };

    next();

  } catch (error) {
    console.error('❌ Lỗi xác thực token:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
};

// Middleware kiểm tra quyền admin
exports.requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
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
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập để tiếp tục'
    });
  }
};