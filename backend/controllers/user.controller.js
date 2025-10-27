const db = require('../models');
const TaiKhoan = db.TaiKhoan;

// Xem thông tin cá nhân
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await TaiKhoan.findByPk(userId, {
      attributes: ['ID', 'TenDangNhap', 'HoTen', 'Email', 'DienThoai', 'VaiTro', 'NgayTao', 'Enable']
    });

    if (!user || !user.Enable) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản hoặc tài khoản đã bị vô hiệu hóa'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin cá nhân thành công',
      data: {
        user: {
          ID: user.ID,
          TenDangNhap: user.TenDangNhap,
          HoTen: user.HoTen,
          Email: user.Email,
          DienThoai: user.DienThoai,
          VaiTro: user.VaiTro,
          NgayTao: user.NgayTao,
          Enable: user.Enable
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy thông tin profile:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Cập nhật thông tin cá nhân của người dùng
exports.updateProfile = async (req, res) => {
  try {
    console.log('📝 Cập nhật profile - User ID:', req.user.id);
    console.log('📝 Dữ liệu nhận được:', req.body);

    const { HoTen, Email, DienThoai } = req.body;
    const userId = req.user.id;

    // Validate dữ liệu đầu vào
    const errors = [];

    // Validate HoTen (nếu có)
    if (HoTen !== undefined && (!HoTen || HoTen.trim().length < 2)) {
      errors.push('Họ tên phải có ít nhất 2 ký tự');
    }

    // Validate Email (nếu có)
    if (Email !== undefined) {
      if (Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) {
        errors.push('Định dạng email không hợp lệ');
      }
    }

    // Validate số điện thoại Việt Nam (nếu có)
    if (DienThoai !== undefined) {
      if (DienThoai && !/^(0|\+84)[0-9]{9,10}$/.test(DienThoai.replace(/\s/g, ''))) {
        errors.push('Số điện thoại phải có định dạng Việt Nam hợp lệ');
      }
    }

    // Validate HoTen không chứa số
    if (HoTen !== undefined && HoTen) {
      if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(HoTen.trim())) {
        errors.push('Họ tên chỉ được chứa chữ cái và khoảng trắng');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors
      });
    }

    // Kiểm tra user có tồn tại và đang hoạt động không
    const user = await TaiKhoan.findOne({
      where: {
        ID: userId,
        Enable: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản hoặc tài khoản đã bị vô hiệu hóa'
      });
    }

    // Kiểm tra email trùng lặp (nếu email được cập nhật)
    if (Email !== undefined && Email && Email !== user.Email) {
      const existingUser = await TaiKhoan.findOne({
        where: {
          Email: Email.trim().toLowerCase(),
          ID: { [db.Sequelize.Op.ne]: userId } // Loại trừ user hiện tại
        }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email đã được sử dụng bởi tài khoản khác'
        });
      }
    }

    // Tạo object dữ liệu cần cập nhật (chỉ cập nhật các field được gửi)
    const updateData = {};
    
    if (HoTen !== undefined) {
      updateData.HoTen = HoTen ? HoTen.trim() : null;
    }
    
    if (Email !== undefined) {
      updateData.Email = Email ? Email.trim().toLowerCase() : null;
    }
    
    if (DienThoai !== undefined) {
      updateData.DienThoai = DienThoai ? DienThoai.trim() : null;
    }

    // Kiểm tra có dữ liệu để cập nhật không
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có dữ liệu để cập nhật'
      });
    }

    // Cập nhật thông tin user
    await user.update(updateData);

    // Lấy lại thông tin user đã cập nhật
    const updatedUser = await TaiKhoan.findByPk(userId, {
      attributes: ['ID', 'TenDangNhap', 'HoTen', 'Email', 'DienThoai', 'VaiTro', 'NgayTao', 'Enable']
    });

    console.log('✅ Cập nhật profile thành công cho user:', updatedUser.TenDangNhap);

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin cá nhân thành công',
      data: {
        user: {
          ID: updatedUser.ID,
          TenDangNhap: updatedUser.TenDangNhap,
          HoTen: updatedUser.HoTen,
          Email: updatedUser.Email,
          DienThoai: updatedUser.DienThoai,
          VaiTro: updatedUser.VaiTro,
          NgayTao: updatedUser.NgayTao,
          Enable: updatedUser.Enable
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi cập nhật profile:', error);

    // Xử lý lỗi Sequelize validation
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: error.errors.map(err => err.message)
      });
    }

    // Xử lý lỗi Sequelize unique constraint
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0].path;
      let message = 'Dữ liệu đã tồn tại';
      
      if (field === 'Email') {
        message = 'Email đã được sử dụng bởi tài khoản khác';
      }

      return res.status(409).json({
        success: false,
        message: message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};