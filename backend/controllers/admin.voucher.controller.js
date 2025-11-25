const db = require('../models');
const { Op, Sequelize } = require('sequelize');
const DTOMapper = require('../utils/DTOMapper');

const Voucher = db.Voucher;
const LichSuSuDungVoucher = db.LichSuSuDungVoucher;
const TaiKhoan = db.TaiKhoan;
const HoaDon = db.HoaDon;

/**
 * 📋 Lấy danh sách tất cả voucher (có phân trang và filter)
 * GET /api/admin/vouchers
 * Query params: page, limit, trangThai, search
 */
exports.getAllVouchers = async (req, res) => {
  try {
    console.log('📋 Admin lấy danh sách vouchers');

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const trangThai = req.query.trangThai; // HoatDong, TamDung, HetHan
    const search = req.query.search; // Tìm theo mã hoặc tên

    // Tạo điều kiện where
    const whereCondition = {};

    if (trangThai && trangThai.trim() !== '') {
      whereCondition.TrangThai = trangThai.trim();
    }

    if (search && search.trim() !== '') {
      whereCondition[Op.or] = [
        { MaVoucher: { [Op.like]: `%${search.trim()}%` } },
        { Ten: { [Op.like]: `%${search.trim()}%` } }
      ];
    }

    // Lấy danh sách voucher với phân trang
    const { count, rows } = await Voucher.findAndCountAll({
      where: whereCondition,
      limit: limit,
      offset: offset,
      order: [['ID', 'DESC']] // ✅ SỬA: NgayTao → ID (vì NgayTao không tồn tại trong DB)
    });

    const totalPages = Math.ceil(count / limit);

    // ✅ SỬ DỤNG DTOMapper để format dữ liệu
    const vouchers = rows.map(v => {
      const voucherData = DTOMapper.toCamelCase({
        ID: v.ID,
        MaVoucher: v.MaVoucher,
        Ten: v.Ten,
        MoTa: v.MoTa,
        LoaiGiamGia: v.LoaiGiamGia,
        GiaTriGiam: parseFloat(v.GiaTriGiam),
        GiamToiDa: v.GiamToiDa ? parseFloat(v.GiamToiDa) : null,
        DonHangToiThieu: parseFloat(v.DonHangToiThieu),
        NgayBatDau: v.NgayBatDau,
        NgayKetThuc: v.NgayKetThuc,
        SoLuong: v.SoLuong,
        SoLuongDaSuDung: v.SoLuongDaSuDung,
        SuDungToiDaMoiNguoi: v.SuDungToiDaMoiNguoi,
        TrangThai: v.TrangThai
      });
      
      return {
        ...voucherData,
        soLuongConLai: v.SoLuong - v.SoLuongDaSuDung
      };
    });

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách voucher thành công',
      data: {
        vouchers,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalVouchers: count,
          vouchersPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy danh sách voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * 🔍 Lấy chi tiết 1 voucher
 * GET /api/admin/vouchers/:id
 */
exports.getVoucherById = async (req, res) => {
  try {
    const voucherId = parseInt(req.params.id);

    if (!voucherId || voucherId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID voucher không hợp lệ'
      });
    }

    const voucher = await Voucher.findByPk(voucherId);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy voucher'
      });
    }

    // ✅ SỬ DỤNG DTOMapper
    const voucherDTO = DTOMapper.toCamelCase({
      ID: voucher.ID,
      MaVoucher: voucher.MaVoucher,
      Ten: voucher.Ten,
      MoTa: voucher.MoTa,
      LoaiGiamGia: voucher.LoaiGiamGia,
      GiaTriGiam: parseFloat(voucher.GiaTriGiam),
      GiamToiDa: voucher.GiamToiDa ? parseFloat(voucher.GiamToiDa) : null,
      DonHangToiThieu: parseFloat(voucher.DonHangToiThieu),
      NgayBatDau: voucher.NgayBatDau,
      NgayKetThuc: voucher.NgayKetThuc,
      SoLuong: voucher.SoLuong,
      SoLuongDaSuDung: voucher.SoLuongDaSuDung,
      SuDungToiDaMoiNguoi: voucher.SuDungToiDaMoiNguoi,
      TrangThai: voucher.TrangThai,
      Enable: voucher.Enable,
      NgayTao: voucher.NgayTao,
      NgayCapNhat: voucher.NgayCapNhat
    });

    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết voucher thành công',
      data: {
        voucher: {
          ...voucherDTO,
          soLuongConLai: voucher.SoLuong - voucher.SoLuongDaSuDung
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy chi tiết voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * ➕ Tạo voucher mới
 * POST /api/admin/vouchers
 */
exports.createVoucher = async (req, res) => {
  try {
    console.log('➕ Admin tạo voucher mới');

    const {
      maVoucher,
      ten,
      moTa,
      loaiGiamGia, // PhanTram hoặc TienMat
      giaTriGiam,
      giamToiDa,
      donHangToiThieu,
      ngayBatDau,
      ngayKetThuc,
      soLuong,
      suDungToiDaMoiNguoi
    } = req.body;

    // Validation
    if (!maVoucher || !maVoucher.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mã voucher'
      });
    }

    if (!ten || !ten.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên voucher'
      });
    }

    if (!loaiGiamGia || !['PhanTram', 'TienMat'].includes(loaiGiamGia)) {
      return res.status(400).json({
        success: false,
        message: 'Loại giảm giá không hợp lệ (PhanTram hoặc TienMat)'
      });
    }

    if (!giaTriGiam || giaTriGiam <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Giá trị giảm phải lớn hơn 0'
      });
    }

    if (!ngayBatDau || !ngayKetThuc) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập ngày bắt đầu và kết thúc'
      });
    }

    // Kiểm tra mã voucher đã tồn tại chưa
    const existingVoucher = await Voucher.findOne({
      where: { MaVoucher: maVoucher.trim().toUpperCase() }
    });

    if (existingVoucher) {
      return res.status(409).json({
        success: false,
        message: `Mã voucher "${maVoucher}" đã tồn tại`
      });
    }

    // ✅ FIX: Format ngày giờ thành chuỗi đơn giản cho SQL Server
    const formatDateForSQLServer = (dateString) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // Tạo voucher mới - ✅ SỬ DỤNG Sequelize.literal() để tránh timezone offset
    const newVoucher = await Voucher.create({
      MaVoucher: maVoucher.trim().toUpperCase(),
      Ten: ten.trim(),
      MoTa: moTa?.trim() || null,
      LoaiGiamGia: loaiGiamGia,
      GiaTriGiam: giaTriGiam,
      GiamToiDa: giamToiDa || null,
      DonHangToiThieu: donHangToiThieu || 0,
      NgayBatDau: Sequelize.literal(`'${formatDateForSQLServer(ngayBatDau)}'`),
      NgayKetThuc: Sequelize.literal(`'${formatDateForSQLServer(ngayKetThuc)}'`),
      SoLuong: soLuong || null,
      SoLuongDaSuDung: 0,
      SuDungToiDaMoiNguoi: suDungToiDaMoiNguoi || 1,
      TrangThai: 'HoatDong'
    });

    console.log('✅ Tạo voucher thành công:', newVoucher.MaVoucher);

    res.status(201).json({
      success: true,
      message: 'Tạo voucher thành công',
      data: {
        voucher: {
          id: newVoucher.ID,
          maVoucher: newVoucher.MaVoucher,
          ten: newVoucher.Ten,
          loaiGiamGia: newVoucher.LoaiGiamGia,
          giaTriGiam: parseFloat(newVoucher.GiaTriGiam),
          trangThai: newVoucher.TrangThai
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi tạo voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * ✏️ Cập nhật voucher
 * PUT /api/admin/vouchers/:id
 */
exports.updateVoucher = async (req, res) => {
  try {
    const voucherId = parseInt(req.params.id);

    if (!voucherId || voucherId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID voucher không hợp lệ'
      });
    }

    const voucher = await Voucher.findByPk(voucherId);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy voucher'
      });
    }

    const {
      ten,
      moTa,
      giaTriGiam,
      giamToiDa,
      donHangToiThieu,
      ngayBatDau,
      ngayKetThuc,
      soLuong,
      suDungToiDaMoiNguoi
    } = req.body;

    // ✅ FIX: Format ngày giờ để tránh lỗi timezone với SQL Server
    const formatDateForSQLServer = (dateString) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // Cập nhật các trường (không cho phép sửa MaVoucher và LoaiGiamGia)
    const updateData = {};

    if (ten) updateData.Ten = ten.trim();
    if (moTa !== undefined) updateData.MoTa = moTa?.trim() || null;
    if (giaTriGiam) updateData.GiaTriGiam = giaTriGiam;
    if (giamToiDa !== undefined) updateData.GiamToiDa = giamToiDa || null;
    if (donHangToiThieu !== undefined) updateData.DonHangToiThieu = donHangToiThieu;
    if (ngayBatDau) updateData.NgayBatDau = Sequelize.literal(`'${formatDateForSQLServer(ngayBatDau)}'`);
    if (ngayKetThuc) updateData.NgayKetThuc = Sequelize.literal(`'${formatDateForSQLServer(ngayKetThuc)}'`);
    if (soLuong !== undefined) updateData.SoLuong = soLuong;
    if (suDungToiDaMoiNguoi) updateData.SuDungToiDaMoiNguoi = suDungToiDaMoiNguoi;

    updateData.NgayCapNhat = new Date();
    updateData.NguoiCapNhat = req.user.id;

    await voucher.update(updateData);

    console.log('✅ Cập nhật voucher thành công:', voucher.MaVoucher);

    res.status(200).json({
      success: true,
      message: 'Cập nhật voucher thành công',
      data: {
        voucher: {
          id: voucher.ID,
          maVoucher: voucher.MaVoucher,
          ten: voucher.Ten,
          trangThai: voucher.TrangThai
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi cập nhật voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * 🔄 Cập nhật trạng thái voucher (Tạm dừng/Kích hoạt)
 * PATCH /api/admin/vouchers/:id/status
 */
exports.updateVoucherStatus = async (req, res) => {
  try {
    const voucherId = parseInt(req.params.id);
    const { trangThai } = req.body;

    if (!voucherId || voucherId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID voucher không hợp lệ'
      });
    }

    if (!trangThai || !['HoatDong', 'TamDung', 'HetHan'].includes(trangThai)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ (HoatDong, TamDung, HetHan)'
      });
    }

    const voucher = await Voucher.findByPk(voucherId);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy voucher'
      });
    }

    await voucher.update({
      TrangThai: trangThai,
      NgayCapNhat: new Date(),
      NguoiCapNhat: req.user.id
    });

    console.log(`✅ Cập nhật trạng thái voucher ${voucher.MaVoucher}: ${trangThai}`);

    res.status(200).json({
      success: true,
      message: `Đã ${trangThai === 'HoatDong' ? 'kích hoạt' : trangThai === 'TamDung' ? 'tạm dừng' : 'đánh dấu hết hạn'} voucher`,
      data: {
        voucher: {
          id: voucher.ID,
          maVoucher: voucher.MaVoucher,
          trangThai: voucher.TrangThai
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi cập nhật trạng thái voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * 🗑️ Xóa voucher (Soft delete)
 * DELETE /api/admin/vouchers/:id
 */
exports.deleteVoucher = async (req, res) => {
  try {
    const voucherId = parseInt(req.params.id);

    if (!voucherId || voucherId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID voucher không hợp lệ'
      });
    }

    const voucher = await Voucher.findByPk(voucherId);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy voucher'
      });
    }

    // Kiểm tra voucher đã được sử dụng chưa
    if (voucher.SoLuongDaSuDung > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa voucher đã được sử dụng ${voucher.SoLuongDaSuDung} lần. Bạn có thể tạm dừng voucher thay vì xóa.`
      });
    }

    // Soft delete
    await voucher.update({
      Enable: false,
      TrangThai: 'HetHan',
      NgayCapNhat: new Date(),
      NguoiCapNhat: req.user.id
    });

    console.log('✅ Xóa voucher thành công:', voucher.MaVoucher);

    res.status(200).json({
      success: true,
      message: 'Xóa voucher thành công',
      data: {
        voucher: {
          id: voucher.ID,
          maVoucher: voucher.MaVoucher
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi xóa voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * 📜 Lấy lịch sử sử dụng voucher
 * GET /api/admin/vouchers/:id/history
 */
exports.getVoucherHistory = async (req, res) => {
  try {
    const voucherId = parseInt(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (!voucherId || voucherId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID voucher không hợp lệ'
      });
    }

    const voucher = await Voucher.findByPk(voucherId);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy voucher'
      });
    }

    // Lấy lịch sử sử dụng
    const { count, rows } = await LichSuSuDungVoucher.findAndCountAll({
      where: {
        VoucherID: voucherId,
        Enable: true
      },
      include: [
        {
          model: HoaDon,
          as: 'hoaDon',
          attributes: ['ID', 'MaHD', 'ThanhTien', 'TrangThai']
        }
      ],
      limit: limit,
      offset: offset,
      order: [['NgaySuDung', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      message: 'Lấy lịch sử sử dụng voucher thành công',
      data: {
        voucher: {
          id: voucher.ID,
          maVoucher: voucher.MaVoucher,
          ten: voucher.Ten,
          soLuongDaSuDung: voucher.SoLuongDaSuDung
        },
        history: rows.map(h => ({
          id: h.ID,
          hoaDon: {
            id: h.hoaDon.ID,
            maHD: h.hoaDon.MaHD,
            tongTien: parseFloat(h.hoaDon.ThanhTien),
            trangThai: h.hoaDon.TrangThai
          },
          giaTriGiam: parseFloat(h.GiaTriGiam),
          ngaySuDung: h.NgaySuDung
        })),
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalRecords: count,
          recordsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy lịch sử voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};