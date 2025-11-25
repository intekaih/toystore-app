const db = require('../models');
const { Op } = require('sequelize');
const DTOMapper = require('../utils/DTOMapper');

const Voucher = db.Voucher;
const LichSuSuDungVoucher = db.LichSuSuDungVoucher;

/**
 * 🎟️ ÁP DỤNG VOUCHER - API công khai cho khách hàng
 * POST /api/vouchers/apply
 * Body: { maVoucher, tongTien, taiKhoanId? }
 * ⚠️ QUAN TRỌNG: API này CHỈ KIỂM TRA voucher, KHÔNG ghi vào DB
 * Việc ghi nhận sẽ thực hiện khi tạo đơn hàng (order.controller.js)
 */
exports.applyVoucher = async (req, res) => {
  try {
    const { maVoucher, tongTien, taiKhoanId } = req.body;

    // ✅ VALIDATION
    if (!maVoucher || !maVoucher.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mã voucher'
      });
    }

    if (!tongTien || tongTien <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Tổng tiền đơn hàng không hợp lệ'
      });
    }

    // ✅ TÌM VOUCHER THEO MÃ
    const voucher = await Voucher.findOne({
      where: {
        MaVoucher: maVoucher.trim().toUpperCase()
      }
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Mã voucher không tồn tại'
      });
    }

    // ✅ KIỂM TRA TRẠNG THÁI
    if (voucher.TrangThai !== 'HoatDong') {
      return res.status(400).json({
        success: false,
        message: voucher.TrangThai === 'TamDung' 
          ? 'Mã voucher tạm thời ngừng hoạt động' 
          : 'Mã voucher đã hết hạn'
      });
    }

    // ✅ KIỂM TRA THỜI GIAN SỬ DỤNG
    const now = new Date();
    const startDate = new Date(voucher.NgayBatDau);
    const endDate = new Date(voucher.NgayKetThuc);

    if (now < startDate) {
      return res.status(400).json({
        success: false,
        message: `Voucher chưa bắt đầu. Có hiệu lực từ ${startDate.toLocaleDateString('vi-VN')}`
      });
    }

    if (now > endDate) {
      return res.status(400).json({
        success: false,
        message: 'Mã voucher đã hết hạn'
      });
    }

    // ✅ KIỂM TRA SỐ LƯỢNG CÒN LẠI (tổng thể)
    if (voucher.SoLuong !== null) {
      const soLuongConLai = voucher.SoLuong - voucher.SoLuongDaSuDung;
      if (soLuongConLai <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Mã voucher đã hết lượt sử dụng'
        });
      }
    }

    // ✅ KIỂM TRA SỐ LẦN ĐÃ DÙNG CỦA USER (NẾU ĐĂNG NHẬP)
    if (taiKhoanId && voucher.SuDungToiDaMoiNguoi) {
      const soLanDaSuDung = await LichSuSuDungVoucher.count({
        where: {
          VoucherID: voucher.ID,
          TaiKhoanID: taiKhoanId
        }
      });

      if (soLanDaSuDung >= voucher.SuDungToiDaMoiNguoi) {
        return res.status(400).json({
          success: false,
          message: `Bạn đã sử dụng hết ${voucher.SuDungToiDaMoiNguoi} lượt cho voucher này`
        });
      }
    }

    // ✅ KIỂM TRA ĐƠN HÀNG TỐI THIỂU
    const donHangToiThieu = parseFloat(voucher.DonHangToiThieu || 0);
    if (tongTien < donHangToiThieu) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu ${donHangToiThieu.toLocaleString('vi-VN')}₫ để sử dụng voucher này`
      });
    }

    // ✅ TÍNH GIÁ TRỊ GIẢM
    let giaTriGiam = 0;
    
    if (voucher.LoaiGiamGia === 'PhanTram') {
      const phanTramGiam = parseFloat(voucher.GiaTriGiam);
      giaTriGiam = (tongTien * phanTramGiam) / 100;
      
      if (voucher.GiamToiDa && giaTriGiam > parseFloat(voucher.GiamToiDa)) {
        giaTriGiam = parseFloat(voucher.GiamToiDa);
      }
    } else {
      giaTriGiam = parseFloat(voucher.GiaTriGiam);
    }

    if (giaTriGiam > tongTien) {
      giaTriGiam = tongTien;
    }

    // ✅ TRẢ VỀ THÔNG TIN VOUCHER (KHÔNG GHI VÀO DB)
    const voucherDTO = DTOMapper.toCamelCase({
      ID: voucher.ID,
      MaVoucher: voucher.MaVoucher,
      Ten: voucher.Ten,
      MoTa: voucher.MoTa,
      LoaiGiamGia: voucher.LoaiGiamGia,
      GiaTriGiam: parseFloat(voucher.GiaTriGiam),
      GiaTriGiamDaTinh: giaTriGiam,
      GiamToiDa: voucher.GiamToiDa ? parseFloat(voucher.GiamToiDa) : null,
      DonHangToiThieu: parseFloat(voucher.DonHangToiThieu),
      NgayBatDau: voucher.NgayBatDau,
      NgayKetThuc: voucher.NgayKetThuc,
      SuDungToiDaMoiNguoi: voucher.SuDungToiDaMoiNguoi
    });

    console.log('✅ Voucher hợp lệ:', voucher.MaVoucher, '- Giảm:', giaTriGiam);

    res.status(200).json({
      success: true,
      message: `Áp dụng voucher thành công! Giảm ${giaTriGiam.toLocaleString('vi-VN')}₫`,
      data: voucherDTO
    });

  } catch (error) {
    console.error('❌ Lỗi áp dụng voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * 📋 LẤY DANH SÁCH VOUCHER ĐANG HOẠT ĐỘNG - API công khai
 * GET /api/vouchers/active
 */
exports.getActiveVouchers = async (req, res) => {
  try {
    const now = new Date();

    const vouchers = await Voucher.findAll({
      where: {
        TrangThai: 'HoatDong',
        NgayBatDau: { [Op.lte]: now },
        NgayKetThuc: { [Op.gte]: now }
      },
      order: [['NgayKetThuc', 'ASC']]
    });

    // ✅ Chỉ trả về các voucher còn số lượng
    const activeVouchers = vouchers
      .filter(v => v.SoLuong === null || (v.SoLuong - v.SoLuongDaSuDung) > 0)
      .map(v => DTOMapper.toCamelCase({
        ID: v.ID,
        MaVoucher: v.MaVoucher,
        Ten: v.Ten,
        MoTa: v.MoTa,
        LoaiGiamGia: v.LoaiGiamGia,
        GiaTriGiam: parseFloat(v.GiaTriGiam),
        GiamToiDa: v.GiamToiDa ? parseFloat(v.GiamToiDa) : null,
        DonHangToiThieu: parseFloat(v.DonHangToiThieu),
        NgayKetThuc: v.NgayKetThuc,
        SoLuongConLai: v.SoLuong ? (v.SoLuong - v.SoLuongDaSuDung) : null
      }));

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách voucher thành công',
      data: activeVouchers
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

module.exports = exports;
