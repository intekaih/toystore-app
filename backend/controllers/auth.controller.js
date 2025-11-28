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

/**
 * 🔗 Merge đơn hàng guest vào tài khoản mới
 * Tìm các KhachHang có cùng email/số điện thoại nhưng chưa có TaiKhoanID
 * và cập nhật TaiKhoanID cho họ
 * @param {number} taiKhoanId - ID của tài khoản mới
 * @param {string} email - Email của tài khoản (có thể null)
 * @param {string} dienThoai - Số điện thoại của tài khoản (có thể null)
 */
exports.mergeGuestOrders = async (taiKhoanId, email, dienThoai) => {
  try {
    const KhachHang = db.KhachHang;
    
    // Tìm các KhachHang có cùng email hoặc số điện thoại nhưng chưa có TaiKhoanID
    const whereCondition = {
      TaiKhoanID: null, // Chỉ tìm các guest chưa có tài khoản
      [Op.or]: []
    };

    if (email && email.trim()) {
      whereCondition[Op.or].push({ Email: email.trim().toLowerCase() });
    }

    if (dienThoai && dienThoai.trim()) {
      whereCondition[Op.or].push({ DienThoai: dienThoai.trim() });
    }

    // Nếu không có email hoặc số điện thoại, không merge
    if (whereCondition[Op.or].length === 0) {
      logger.info('⚠️ Không có email/số điện thoại để merge đơn hàng guest');
      return { merged: 0 };
    }

    const guestCustomers = await KhachHang.findAll({
      where: whereCondition
    });

    if (!guestCustomers || guestCustomers.length === 0) {
      logger.info('ℹ️ Không tìm thấy đơn hàng guest để merge');
      return { merged: 0 };
    }

    logger.info(`🔗 Tìm thấy ${guestCustomers.length} khách hàng guest để merge vào tài khoản ${taiKhoanId}`);

    // Cập nhật TaiKhoanID cho tất cả các KhachHang guest
    let mergedCount = 0;
    for (const guestCustomer of guestCustomers) {
      await guestCustomer.update({ TaiKhoanID: taiKhoanId });
      mergedCount++;
      logger.info(`✅ Đã merge khách hàng guest ID ${guestCustomer.ID} vào tài khoản ${taiKhoanId}`);
    }

    logger.success(`✅ Đã merge ${mergedCount} khách hàng guest vào tài khoản ${taiKhoanId}`);
    return { merged: mergedCount };

  } catch (error) {
    logger.logError(error, 'Merge guest orders');
    // Không throw error để không ảnh hưởng đến quá trình đăng ký/đăng nhập
    return { merged: 0, error: error.message };
  }
};

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
      TrangThai: true,      // Changed from Enable to TrangThai
      LoginMethod: 'Password'  // Đánh dấu đăng ký bằng password
    });

    logger.success(`✅ Đăng ký thành công: ${newUser.TenDangNhap} (ID: ${newUser.ID})`);

    // 🔗 Merge đơn hàng guest vào tài khoản mới (nếu có)
    const mergeResult = await exports.mergeGuestOrders(
      newUser.ID,
      newUser.Email,
      newUser.DienThoai
    );
    if (mergeResult.merged > 0) {
      logger.info(`📦 Đã merge ${mergeResult.merged} đơn hàng guest vào tài khoản ${newUser.TenDangNhap}`);
    }

    // ✅ SỬ DỤNG DTOMapper
    const userResponse = DTOMapper.toCamelCase({
      ID: newUser.ID,
      TenDangNhap: newUser.TenDangNhap,
      HoTen: newUser.HoTen,
      Email: newUser.Email,
      DienThoai: newUser.DienThoai,
      VaiTro: newUser.VaiTro,
      NgayTao: newUser.NgayTao,
      TrangThai: newUser.TrangThai,
      GoogleID: newUser.GoogleID,
      LoginMethod: newUser.LoginMethod
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

    // Kiểm tra tài khoản có mật khẩu không (tài khoản Google-only không có mật khẩu)
    if (!user.MatKhau) {
      logger.warn(`Đăng nhập thất bại: Tài khoản chỉ đăng nhập được bằng Google - ${TenDangNhap}`);
      return res.status(401).json({
        success: false,
        message: 'Tài khoản này chỉ đăng nhập được bằng Google. Vui lòng sử dụng "Đăng nhập bằng Google"'
      });
    }

    // Kiểm tra LoginMethod nếu có
    if (user.LoginMethod === 'Google') {
      logger.warn(`Đăng nhập thất bại: Tài khoản chỉ hỗ trợ Google login - ${TenDangNhap}`);
      return res.status(401).json({
        success: false,
        message: 'Tài khoản này chỉ đăng nhập được bằng Google. Vui lòng sử dụng "Đăng nhập bằng Google"'
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

    // 🔗 Merge đơn hàng guest vào tài khoản (nếu có)
    const mergeResult = await exports.mergeGuestOrders(
      user.ID,
      user.Email,
      user.DienThoai
    );
    if (mergeResult.merged > 0) {
      logger.info(`📦 Đã merge ${mergeResult.merged} đơn hàng guest vào tài khoản ${user.TenDangNhap}`);
    }

    // ✅ SỬ DỤNG DTOMapper
    const userData = DTOMapper.toCamelCase({
      ID: user.ID,
      TenDangNhap: user.TenDangNhap,
      VaiTro: user.VaiTro,
      HoTen: user.HoTen,
      Email: user.Email,
      DienThoai: user.DienThoai,
      NgayTao: user.NgayTao,
      TrangThai: user.TrangThai,
      GoogleID: user.GoogleID,
      LoginMethod: user.LoginMethod
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

    // Kiểm tra tài khoản có mật khẩu không (tài khoản Google-only không có mật khẩu)
    if (!user.MatKhau) {
      logger.warn(`Đăng nhập admin thất bại: Tài khoản chỉ đăng nhập được bằng Google - ${username}`);
      return res.status(401).json({
        success: false,
        message: 'Tài khoản này chỉ đăng nhập được bằng Google'
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
      TrangThai: user.TrangThai,
      GoogleID: user.GoogleID,
      LoginMethod: user.LoginMethod
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

// Hàm xử lý Google OAuth callback
exports.googleCallback = async (req, res) => {
  try {
    // User đã được xác thực bởi passport middleware
    const user = req.user;

    if (!user) {
      logger.warn('Google OAuth callback: Không tìm thấy user');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }

    // Kiểm tra tài khoản có bị khóa không
    if (!user.TrangThai) {
      logger.warn(`Google OAuth: Tài khoản bị khóa - ${user.TenDangNhap}`);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/login?error=account_disabled`);
    }

    // Tạo JWT token
    const jwtSecret = config.getValue('jwt', 'secret');
    const jwtExpires = config.getValue('jwt', 'expiresIn');

    const token = jwt.sign(
      {
        userId: user.ID,
        username: user.TenDangNhap,
        role: user.VaiTro || 'KhachHang'
      },
      jwtSecret,
      { expiresIn: jwtExpires }
    );

    logger.success(`✅ Google OAuth đăng nhập thành công: ${user.TenDangNhap} (${user.VaiTro})`);

    // 🔗 Merge đơn hàng guest vào tài khoản (nếu có)
    const mergeResult = await exports.mergeGuestOrders(
      user.ID,
      user.Email,
      user.DienThoai
    );
    if (mergeResult.merged > 0) {
      logger.info(`📦 Đã merge ${mergeResult.merged} đơn hàng guest vào tài khoản ${user.TenDangNhap}`);
    }

    // Redirect về frontend với token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/auth/google/callback?token=${token}&success=true`);

  } catch (error) {
    logger.logError(error, 'Google OAuth callback');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/login?error=server_error`);
  }
};