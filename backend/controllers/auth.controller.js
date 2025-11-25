const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { Op } = require('sequelize');
const TaiKhoan = db.TaiKhoan;
const DTOMapper = require('../utils/DTOMapper');

// Import Singleton utilities
const Logger = require('../utils/Logger');
const ConfigService = require('../utils/ConfigService');

const logger = Logger.getInstance();
const config = ConfigService.getInstance();

// Đăng ký tài khoản mới
exports.register = async (req, res) => {
  try {
    logger.info('📝 Đăng ký tài khoản mới', { username: req.body.TenDangNhap });

    const { TenDangNhap, MatKhau, HoTen, Email, DienThoai } = req.body;

    // Validate input - Chỉ TenDangNhap, MatKhau, HoTen là bắt buộc
    if (!TenDangNhap || !MatKhau || !HoTen) {
      logger.warn('Đăng ký thất bại: Thiếu thông tin bắt buộc');
      return res.status(400).json({
        success: false,
        message: "Tên đăng nhập, mật khẩu và họ tên là bắt buộc"
      });
    }

    // Validate độ dài mật khẩu
    if (MatKhau.length < 6) {
      logger.warn('Đăng ký thất bại: Mật khẩu quá ngắn');
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự"
      });
    }

    // Validate email format nếu có
    if (Email && Email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email.trim())) {
      logger.warn('Đăng ký thất bại: Email không hợp lệ');
      return res.status(400).json({
        success: false,
        message: "Định dạng email không hợp lệ"
      });
    }

    // Kiểm tra trùng tên đăng nhập
    const whereCondition = {
      [Op.or]: [
        { TenDangNhap: TenDangNhap }
      ]
    };

    // Chỉ kiểm tra trùng email nếu email được cung cấp
    if (Email && Email.trim()) {
      whereCondition[Op.or].push({ Email: Email.trim().toLowerCase() });
    }

    const existingUser = await TaiKhoan.findOne({
      where: whereCondition
    });

    if (existingUser) {
      if (existingUser.TenDangNhap === TenDangNhap) {
        logger.warn(`Đăng ký thất bại: Tên đăng nhập đã tồn tại - ${TenDangNhap}`);
        return res.status(409).json({
          success: false,
          message: "Tên đăng nhập đã tồn tại"
        });
      }
      if (Email && Email.trim() && existingUser.Email === Email.trim().toLowerCase()) {
        logger.warn(`Đăng ký thất bại: Email đã tồn tại - ${Email}`);
        return res.status(409).json({
          success: false,
          message: "Email đã tồn tại"
        });
      }
    }

    // Mã hóa mật khẩu - sử dụng config từ ConfigService
    const saltRounds = config.getValue('security', 'bcryptSaltRounds');
    const hashedPassword = await bcrypt.hash(MatKhau, saltRounds);

    // Tạo tài khoản mới
    const newUser = await TaiKhoan.create({
      TenDangNhap: TenDangNhap.trim(),
      MatKhau: hashedPassword,
      HoTen: HoTen.trim(),
      Email: (Email && Email.trim()) ? Email.trim().toLowerCase() : null,
      DienThoai: (DienThoai && DienThoai.trim()) ? DienThoai.trim() : null,
      VaiTro: 'KhachHang',  // Changed from 'user' to 'KhachHang'
      TrangThai: true       // Changed from Enable to TrangThai
    });

    logger.success(`✅ Đăng ký thành công: ${newUser.TenDangNhap} (ID: ${newUser.ID})`);

    // ✅ SỬ DỤNG DTOMapper
    const userResponse = DTOMapper.toCamelCase({
      ID: newUser.ID,
      TenDangNhap: newUser.TenDangNhap,
      HoTen: newUser.HoTen,
      Email: newUser.Email,
      DienThoai: newUser.DienThoai,
      VaiTro: newUser.VaiTro,
      NgayTao: newUser.NgayTao,
      TrangThai: newUser.TrangThai
    });

    res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công",
      data: userResponse
    });

  } catch (error) {
    logger.logError(error, 'Đăng ký tài khoản');

    // Xử lý lỗi Sequelize validation
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: error.errors.map(err => err.message)
      });
    }

    // Xử lý lỗi Sequelize unique constraint
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0].path;
      let message = "Dữ liệu đã tồn tại";
      
      if (field === 'TenDangNhap') {
        message = "Tên đăng nhập đã tồn tại";
      } else if (field === 'Email') {
        message = "Email đã tồn tại";
      }

      return res.status(409).json({
        success: false,
        message: message
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server nội bộ",
      error: config.isDevelopment() ? error.message : 'Internal Server Error'
    });
  }
};

// Hàm đăng nhập người dùng
exports.login = async (req, res) => {
  try {
    logger.info('🔐 Yêu cầu đăng nhập', { username: req.body.TenDangNhap });

    const { TenDangNhap, MatKhau } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!TenDangNhap || !MatKhau) {
      logger.warn('Đăng nhập thất bại: Thiếu thông tin');
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu'
      });
    }

    // Tìm người dùng theo tên đăng nhập
    const user = await TaiKhoan.findOne({
      where: {
        TenDangNhap: TenDangNhap,
        TrangThai: true  // Changed from Enable to TrangThai
      }
    });

    if (!user) {
      logger.warn(`Đăng nhập thất bại: User không tồn tại - ${TenDangNhap}`);
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập không tồn tại hoặc tài khoản đã bị vô hiệu hóa'
      });
    }

    // So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(MatKhau, user.MatKhau);
    
    if (!isPasswordValid) {
      logger.warn(`Đăng nhập thất bại: Sai mật khẩu - ${TenDangNhap}`);
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu không chính xác'
      });
    }

    // Lấy JWT config từ ConfigService
    const jwtSecret = config.getValue('jwt', 'secret');
    const jwtExpires = config.getValue('jwt', 'expiresIn');

    // Tạo JWT token
    const token = jwt.sign(
      {
        userId: user.ID,
        username: user.TenDangNhap,
        role: user.VaiTro || 'KhachHang'  // Changed from 'user' to 'KhachHang'
      },
      jwtSecret,
      { expiresIn: jwtExpires }
    );

    logger.success(`✅ Đăng nhập thành công: ${user.TenDangNhap} (${user.VaiTro})`);

    // ✅ SỬ DỤNG DTOMapper
    const userData = DTOMapper.toCamelCase({
      ID: user.ID,
      TenDangNhap: user.TenDangNhap,
      VaiTro: user.VaiTro,
      HoTen: user.HoTen,
      Email: user.Email,
      DienThoai: user.DienThoai,
      NgayTao: user.NgayTao,
      TrangThai: user.TrangThai
    });

    // Trả về thông tin đăng nhập thành công
    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token: token,
        user: userData
      }
    });

  } catch (error) {
    logger.logError(error, 'Đăng nhập user');
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: config.isDevelopment() ? error.message : 'Internal Server Error'
    });
  }
};

// Hàm đăng nhập admin
exports.adminLogin = async (req, res) => {
  try {
    logger.info('🔐 Yêu cầu đăng nhập Admin', { username: req.body.username });

    const { username, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!username || !password) {
      logger.warn('Đăng nhập admin thất bại: Thiếu thông tin');
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu'
      });
    }

    // Tìm admin
    const user = await TaiKhoan.findOne({
      where: {
        TenDangNhap: username,
        TrangThai: true,  // Changed from Enable to TrangThai
        VaiTro: 'Admin'   // Changed from 'admin' to 'Admin'
      }
    });

    if (!user) {
      logger.warn(`Đăng nhập admin thất bại: Không tìm thấy admin - ${username}`);
      return res.status(401).json({
        success: false,
        message: 'Sai thông tin hoặc không có quyền'
      });
    }

    // So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.MatKhau);
    
    if (!isPasswordValid) {
      logger.warn(`Đăng nhập admin thất bại: Sai mật khẩu - ${username}`);
      return res.status(401).json({
        success: false,
        message: 'Sai thông tin hoặc không có quyền'
      });
    }

    // Lấy JWT config từ ConfigService
    const jwtSecret = config.getValue('jwt', 'secret');
    const jwtExpires = config.getValue('jwt', 'expiresIn');

    // Tạo JWT token
    const token = jwt.sign(
      {
        userId: user.ID,
        username: user.TenDangNhap,
        role: user.VaiTro
      },
      jwtSecret,
      { expiresIn: jwtExpires }
    );

    logger.success(`✅ Đăng nhập admin thành công: ${user.TenDangNhap}`);

    // ✅ SỬ DỤNG DTOMapper
    const adminData = DTOMapper.toCamelCase({
      ID: user.ID,
      TenDangNhap: user.TenDangNhap,
      VaiTro: user.VaiTro,
      HoTen: user.HoTen,
      Email: user.Email,
      DienThoai: user.DienThoai,
      NgayTao: user.NgayTao,
      TrangThai: user.TrangThai
    });

    // Trả về thông tin đăng nhập thành công
    res.status(200).json({
      success: true,
      message: 'Đăng nhập admin thành công',
      data: {
        token: token,
        admin: adminData
      }
    });

  } catch (error) {
    logger.logError(error, 'Đăng nhập admin');
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: config.isDevelopment() ? error.message : 'Internal Server Error'
    });
  }
};