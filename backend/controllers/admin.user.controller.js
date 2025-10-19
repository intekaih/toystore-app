const db = require('../models');
const bcrypt = require('bcryptjs');
const TaiKhoan = db.TaiKhoan;
const { Op } = require('sequelize');

/**
 * GET /api/admin/users
 * Lấy danh sách tất cả người dùng với phân trang và tìm kiếm
 */
exports.getAllUsers = async (req, res) => {
  try {
    console.log('👥 Admin - Lấy danh sách người dùng');
    console.log('📝 Query params:', req.query);

    // Lấy parameters từ query string
    const pageParam = req.query.page;
    const limitParam = req.query.limit;
    const search = req.query.search || '';
    const role = req.query.role || ''; // Lọc theo vai trò
    const status = req.query.status || ''; // Lọc theo trạng thái

    // Validate và parse page parameter
    let page = 1; // Giá trị mặc định
    if (pageParam !== undefined) {
      // Kiểm tra xem có phải là số không
      if (!/^\d+$/.test(String(pageParam))) {
        return res.status(400).json({
          success: false,
          message: 'Số trang phải là số nguyên dương lớn hơn 0'
        });
      }
      
      page = parseInt(pageParam);
      
      // Kiểm tra page phải > 0
      if (page < 1) {
        return res.status(400).json({
          success: false,
          message: 'Số trang phải là số nguyên dương lớn hơn 0'
        });
      }
    }

    // Validate và parse limit parameter
    let limit = 10; // Giá trị mặc định
    if (limitParam !== undefined) {
      // Kiểm tra xem có phải là số không
      if (!/^\d+$/.test(String(limitParam))) {
        return res.status(400).json({
          success: false,
          message: 'Số lượng người dùng mỗi trang phải từ 1 đến 100'
        });
      }
      
      limit = parseInt(limitParam);
      
      // Kiểm tra limit trong khoảng hợp lệ
      if (limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          message: 'Số lượng người dùng mỗi trang phải từ 1 đến 100'
        });
      }
    }

    // Tính offset SAU KHI đã validate
    const offset = (page - 1) * limit;

    console.log(`✅ Validated params - Page: ${page}, Limit: ${limit}, Offset: ${offset}`);

    // Tạo điều kiện tìm kiếm
    const whereCondition = {};

    // Tìm kiếm theo tên đăng nhập, họ tên, email
    if (search.trim()) {
      whereCondition[Op.or] = [
        { TenDangNhap: { [Op.like]: `%${search.trim()}%` } },
        { HoTen: { [Op.like]: `%${search.trim()}%` } },
        { Email: { [Op.like]: `%${search.trim()}%` } }
      ];
    }

    // Lọc theo vai trò
    if (role && ['admin', 'user'].includes(role)) {
      whereCondition.VaiTro = role;
    }

    // Lọc theo trạng thái
    if (status === 'active') {
      whereCondition.Enable = true;
    } else if (status === 'inactive') {
      whereCondition.Enable = false;
    }

    console.log('🔍 Điều kiện tìm kiếm:', whereCondition);

    // Truy vấn database với phân trang
    const { count, rows } = await TaiKhoan.findAndCountAll({
      where: whereCondition,
      attributes: [
        'ID',
        'TenDangNhap',
        'HoTen',
        'Email',
        'DienThoai',
        'VaiTro',
        'NgayTao',
        'Enable'
      ],
      limit: limit,
      offset: offset,
      order: [['NgayTao', 'DESC']]
    });

    // Tính toán thông tin phân trang
    const totalUsers = count;
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Format dữ liệu trả về
    const users = rows.map(user => ({
      id: user.ID,
      tenDangNhap: user.TenDangNhap,
      hoTen: user.HoTen,
      email: user.Email,
      dienThoai: user.DienThoai,
      vaiTro: user.VaiTro,
      ngayTao: user.NgayTao,
      trangThai: user.Enable ? 'Hoạt động' : 'Bị khóa',
      enable: user.Enable
    }));

    console.log(`✅ Lấy ${users.length}/${totalUsers} người dùng thành công`);

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách người dùng thành công',
      data: {
        users: users,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalUsers: totalUsers,
          usersPerPage: limit,
          hasNextPage: hasNextPage,
          hasPrevPage: hasPrevPage
        },
        filters: {
          search: search.trim() || null,
          role: role || null,
          status: status || null
        },
        statistics: {
          totalActive: users.filter(u => u.enable).length,
          totalInactive: users.filter(u => !u.enable).length,
          totalAdmin: users.filter(u => u.vaiTro === 'admin').length,
          totalUser: users.filter(u => u.vaiTro === 'user').length
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy danh sách người dùng:', error);

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
 * POST /api/admin/users
 * Tạo người dùng mới
 */
exports.createUser = async (req, res) => {
  try {
    console.log('➕ Admin - Tạo người dùng mới');
    console.log('📝 Dữ liệu nhận được:', req.body);

    const { TenDangNhap, MatKhau, HoTen, Email, DienThoai, VaiTro } = req.body;

    // Validate input - TenDangNhap, MatKhau, HoTen là bắt buộc
    if (!TenDangNhap || !MatKhau || !HoTen) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập, mật khẩu và họ tên là bắt buộc'
      });
    }

    // Validate độ dài tên đăng nhập
    if (TenDangNhap.length < 3 || TenDangNhap.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập phải có từ 3 đến 50 ký tự'
      });
    }

    // Validate độ dài mật khẩu
    if (MatKhau.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    // Validate họ tên
    if (HoTen.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Họ tên phải có ít nhất 2 ký tự'
      });
    }

    // Validate email format nếu có
    if (Email && Email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Định dạng email không hợp lệ'
      });
    }

    // Validate vai trò
    if (VaiTro && !['admin', 'user'].includes(VaiTro)) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò phải là "admin" hoặc "user"'
      });
    }

    // Kiểm tra trùng tên đăng nhập
    const existingUsername = await TaiKhoan.findOne({
      where: { TenDangNhap: TenDangNhap.trim() }
    });

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Tên đăng nhập đã tồn tại'
      });
    }

    // Kiểm tra trùng email (nếu có email)
    if (Email && Email.trim()) {
      const existingEmail = await TaiKhoan.findOne({
        where: { Email: Email.trim().toLowerCase() }
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Email đã được sử dụng'
        });
      }
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(MatKhau, 12);

    // Tạo user mới
    const newUser = await TaiKhoan.create({
      TenDangNhap: TenDangNhap.trim(),
      MatKhau: hashedPassword,
      HoTen: HoTen.trim(),
      Email: Email ? Email.trim().toLowerCase() : null,
      DienThoai: DienThoai ? DienThoai.trim() : null,
      VaiTro: VaiTro || 'user',
      Enable: true
    });

    console.log('✅ Tạo người dùng mới thành công:', newUser.TenDangNhap);

    res.status(201).json({
      success: true,
      message: 'Tạo người dùng mới thành công',
      data: {
        user: {
          id: newUser.ID,
          tenDangNhap: newUser.TenDangNhap,
          hoTen: newUser.HoTen,
          email: newUser.Email,
          dienThoai: newUser.DienThoai,
          vaiTro: newUser.VaiTro,
          ngayTao: newUser.NgayTao,
          enable: newUser.Enable
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi tạo người dùng:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0].path;
      let message = 'Dữ liệu đã tồn tại';
      
      if (field === 'TenDangNhap') {
        message = 'Tên đăng nhập đã tồn tại';
      } else if (field === 'Email') {
        message = 'Email đã được sử dụng';
      }

      return res.status(409).json({
        success: false,
        message: message
      });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: error.errors.map(err => err.message)
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
 * PUT /api/admin/users/:id
 * Cập nhật thông tin người dùng
 */
exports.updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    console.log('✏️ Admin - Cập nhật người dùng ID:', userId);
    console.log('📝 Dữ liệu nhận được:', req.body);

    // Validate userId
    if (!userId || userId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID người dùng không hợp lệ'
      });
    }

    const { HoTen, Email, DienThoai, VaiTro } = req.body;

    // Validate dữ liệu đầu vào
    const errors = [];

    if (HoTen !== undefined && (!HoTen || HoTen.trim().length < 2)) {
      errors.push('Họ tên phải có ít nhất 2 ký tự');
    }

    if (Email !== undefined && Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) {
      errors.push('Định dạng email không hợp lệ');
    }

    if (VaiTro !== undefined && !['admin', 'user'].includes(VaiTro)) {
      errors.push('Vai trò phải là "admin" hoặc "user"');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors
      });
    }

    // Kiểm tra user có tồn tại không
    const user = await TaiKhoan.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Không cho phép admin tự thay đổi vai trò của chính mình
    if (userId === req.user.id && VaiTro !== undefined && VaiTro !== user.VaiTro) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không thể thay đổi vai trò của chính mình'
      });
    }

    // Kiểm tra email trùng lặp (nếu email được cập nhật)
    if (Email !== undefined && Email && Email !== user.Email) {
      const existingUser = await TaiKhoan.findOne({
        where: {
          Email: Email.trim().toLowerCase(),
          ID: { [Op.ne]: userId }
        }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email đã được sử dụng bởi tài khoản khác'
        });
      }
    }

    // Tạo object dữ liệu cần cập nhật
    const updateData = {};
    
    if (HoTen !== undefined) {
      updateData.HoTen = HoTen.trim();
    }
    
    if (Email !== undefined) {
      updateData.Email = Email ? Email.trim().toLowerCase() : null;
    }
    
    if (DienThoai !== undefined) {
      updateData.DienThoai = DienThoai ? DienThoai.trim() : null;
    }

    if (VaiTro !== undefined) {
      updateData.VaiTro = VaiTro;
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

    console.log('✅ Cập nhật người dùng thành công:', updatedUser.TenDangNhap);

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin người dùng thành công',
      data: {
        user: {
          id: updatedUser.ID,
          tenDangNhap: updatedUser.TenDangNhap,
          hoTen: updatedUser.HoTen,
          email: updatedUser.Email,
          dienThoai: updatedUser.DienThoai,
          vaiTro: updatedUser.VaiTro,
          ngayTao: updatedUser.NgayTao,
          enable: updatedUser.Enable
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi cập nhật người dùng:', error);

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

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: error.errors.map(err => err.message)
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
 * PATCH /api/admin/users/:id/status
 * Khóa hoặc mở khóa tài khoản
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    console.log('🔒 Admin - Cập nhật trạng thái người dùng ID:', userId);
    console.log('📝 Dữ liệu nhận được:', req.body);

    // Validate userId
    if (!userId || userId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID người dùng không hợp lệ'
      });
    }

    const { enable } = req.body;

    // Validate enable parameter
    if (enable === undefined || typeof enable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Tham số "enable" phải là true hoặc false'
      });
    }

    // Kiểm tra user có tồn tại không
    const user = await TaiKhoan.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Không cho phép admin tự khóa tài khoản của chính mình
    if (userId === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không thể thay đổi trạng thái tài khoản của chính mình'
      });
    }

    // Kiểm tra trạng thái hiện tại
    if (user.Enable === enable) {
      return res.status(400).json({
        success: false,
        message: `Tài khoản đã ${enable ? 'được mở' : 'bị khóa'} từ trước`
      });
    }

    // Cập nhật trạng thái
    await user.update({ Enable: enable });

    console.log(`✅ ${enable ? 'Mở khóa' : 'Khóa'} tài khoản thành công:`, user.TenDangNhap);

    res.status(200).json({
      success: true,
      message: `${enable ? 'Mở khóa' : 'Khóa'} tài khoản thành công`,
      data: {
        user: {
          id: user.ID,
          tenDangNhap: user.TenDangNhap,
          hoTen: user.HoTen,
          email: user.Email,
          vaiTro: user.VaiTro,
          enable: user.Enable,
          trangThai: user.Enable ? 'Hoạt động' : 'Bị khóa'
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi cập nhật trạng thái người dùng:', error);

    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Xóa tài khoản vĩnh viễn
 */
exports.deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    console.log('🗑️ Admin - Xóa người dùng ID:', userId);

    // Validate userId
    if (!userId || userId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID người dùng không hợp lệ'
      });
    }

    // Kiểm tra user có tồn tại không
    const user = await TaiKhoan.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Không cho phép admin tự xóa tài khoản của chính mình
    if (userId === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không thể xóa tài khoản của chính mình'
      });
    }

    // Lưu thông tin user trước khi xóa để trả về response
    const deletedUserInfo = {
      id: user.ID,
      tenDangNhap: user.TenDangNhap,
      hoTen: user.HoTen,
      email: user.Email,
      vaiTro: user.VaiTro
    };

    // Xóa tài khoản vĩnh viễn
    await user.destroy();

    console.log('✅ Xóa tài khoản thành công:', deletedUserInfo.tenDangNhap);

    res.status(200).json({
      success: true,
      message: 'Xóa tài khoản thành công',
      data: {
        deletedUser: deletedUserInfo
      }
    });

  } catch (error) {
    console.error('❌ Lỗi xóa người dùng:', error);

    // Xử lý lỗi ràng buộc khóa ngoại
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa người dùng do có dữ liệu liên quan (giỏ hàng, đơn hàng, v.v.)'
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
 * GET /api/admin/users/:id
 * Lấy chi tiết người dùng theo ID
 */
exports.getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    console.log('🔍 Admin - Lấy chi tiết người dùng ID:', userId);

    // Validate userId
    if (!userId || userId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID người dùng không hợp lệ'
      });
    }

    // Lấy thông tin user
    const user = await TaiKhoan.findByPk(userId, {
      attributes: ['ID', 'TenDangNhap', 'HoTen', 'Email', 'DienThoai', 'VaiTro', 'NgayTao', 'Enable']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    console.log('✅ Lấy chi tiết người dùng thành công:', user.TenDangNhap);

    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết người dùng thành công',
      data: {
        user: {
          id: user.ID,
          tenDangNhap: user.TenDangNhap,
          hoTen: user.HoTen,
          email: user.Email,
          dienThoai: user.DienThoai,
          vaiTro: user.VaiTro,
          ngayTao: user.NgayTao,
          enable: user.Enable,
          trangThai: user.Enable ? 'Hoạt động' : 'Bị khóa'
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy chi tiết người dùng:', error);

    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};
