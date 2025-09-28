const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { Op } = require('sequelize');
const TaiKhoan = db.TaiKhoan;

// Đăng ký tài khoản mới
exports.register = async (req, res) => {
  try {
    console.log('📝 Received register request:', req.body);

    const { TenDangNhap, MatKhau, HoTen, Email, DienThoai } = req.body;

    // Validate input - HoTen bây giờ là bắt buộc
    if (!TenDangNhap || !MatKhau || !HoTen) {
      return res.status(400).json({
        success: false,
        message: "Tên đăng nhập, mật khẩu và họ tên là bắt buộc"
      });
    }

    // Validate độ dài mật khẩu
    if (MatKhau.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự"
      });
    }

    // Validate email format nếu có
    if (Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) {
      return res.status(400).json({
        success: false,
        message: "Định dạng email không hợp lệ"
      });
    }

    // Kiểm tra trùng tên đăng nhập hoặc email trong một query
    const whereCondition = {
      [Op.or]: [
        { TenDangNhap: TenDangNhap }
      ]
    };

    if (Email) {
      whereCondition[Op.or].push({ Email: Email });
    }

    const existingUser = await TaiKhoan.findOne({
      where: whereCondition
    });

    if (existingUser) {
      if (existingUser.TenDangNhap === TenDangNhap) {
        return res.status(409).json({
          success: false,
          message: "Tên đăng nhập đã tồn tại"
        });
      }
      if (existingUser.Email === Email) {
        return res.status(409).json({
          success: false,
          message: "Email đã tồn tại"
        });
      }
    }

    // Mã hóa mật khẩu
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(MatKhau, saltRounds);

    // Tạo tài khoản mới
    const newUser = await TaiKhoan.create({
      TenDangNhap: TenDangNhap.trim(),
      MatKhau: hashedPassword,
      HoTen: HoTen ? HoTen.trim() : null,
      Email: Email ? Email.trim().toLowerCase() : null,
      DienThoai: DienThoai ? DienThoai.trim() : null,
      VaiTro: 'user',
      Enable: true
      // Không gửi NgayTao - để SQL Server tự động gán
    });

    // Trả về thông tin người dùng (không bao gồm mật khẩu)
    const userResponse = {
      ID: newUser.ID,
      TenDangNhap: newUser.TenDangNhap,
      HoTen: newUser.HoTen,
      Email: newUser.Email,
      DienThoai: newUser.DienThoai,
      VaiTro: newUser.VaiTro,
      NgayTao: newUser.NgayTao,
      Enable: newUser.Enable
    };

    res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công",
      data: userResponse
    });

  } catch (error) {
    console.error("❌ Register error:", error);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      original: error.original?.message
    });

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
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Hàm đăng nhập người dùng
exports.login = async (req, res) => {
  try {
    console.log('🔐 Đăng nhập - Dữ liệu nhận được:', req.body);

    const { TenDangNhap, MatKhau } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!TenDangNhap || !MatKhau) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu'
      });
    }

    // Tìm người dùng theo tên đăng nhập và kiểm tra trạng thái Enable = true
    const user = await TaiKhoan.findOne({
      where: {
        TenDangNhap: TenDangNhap,
        Enable: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập không tồn tại hoặc tài khoản đã bị vô hiệu hóa'
      });
    }

    console.log('👤 Tìm thấy user:', {
      ID: user.ID,
      TenDangNhap: user.TenDangNhap,
      VaiTro: user.VaiTro,
      Enable: user.Enable
    });

    // So sánh mật khẩu với bcrypt
    const isPasswordValid = await bcrypt.compare(MatKhau, user.MatKhau);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu không chính xác'
      });
    }

    // Kiểm tra JWT_SECRET có tồn tại
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET không được cấu hình trong .env');
      return res.status(500).json({
        success: false,
        message: 'Lỗi cấu hình server'
      });
    }

    // Tạo JWT token với thời hạn 1 giờ
    const token = jwt.sign(
      {
        userId: user.ID,
        username: user.TenDangNhap,
        role: user.VaiTro || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('✅ Đăng nhập thành công cho user:', user.TenDangNhap);

    // Trả về thông tin đăng nhập thành công
    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token: token,
        user: {
          id: user.ID,
          tenDangNhap: user.TenDangNhap,
          vaiTro: user.VaiTro || 'user',
          hoTen: user.HoTen || '',
          email: user.Email || ''
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi đăng nhập:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};