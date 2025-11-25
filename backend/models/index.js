const Sequelize = require("sequelize");
const DBConnection = require("../utils/DBConnection");

// Lấy Sequelize instance từ DBConnection Singleton
const dbConnection = DBConnection.getInstance();
const sequelize = dbConnection.getSequelize();

// Export database object
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import các models
db.TaiKhoan = require('./TaiKhoan')(sequelize, Sequelize);
db.SanPham = require('./SanPham')(sequelize, Sequelize);
db.SanPhamHinhAnh = require('./SanPhamHinhAnh')(sequelize, Sequelize);
db.LoaiSP = require('./LoaiSP')(sequelize, Sequelize);
db.ThuongHieu = require('./ThuongHieu')(sequelize, Sequelize);
db.GioHang = require('./GioHang')(sequelize, Sequelize);
db.GioHangChiTiet = require('./GioHangChiTiet')(sequelize, Sequelize);
db.GioHangKhachVangLai = require('./GioHangKhachVangLai')(sequelize, Sequelize);
db.HoaDon = require('./HoaDon')(sequelize, Sequelize);
db.ChiTietHoaDon = require('./ChiTietHoaDon')(sequelize, Sequelize);
db.KhachHang = require('./KhachHang')(sequelize, Sequelize);
db.PhuongThucThanhToan = require('./PhuongThucThanhToan')(sequelize, Sequelize);
db.Voucher = require('./Voucher')(sequelize);
// ❌ XÓA: db.VoucherSanPham - Không cần áp dụng voucher theo từng sản phẩm
// ❌ XÓA: db.VoucherLoaiSanPham - Không cần áp dụng voucher theo loại sản phẩm
db.LichSuSuDungVoucher = require('./LichSuSuDungVoucher')(sequelize);
db.DiaChiGiaoHangUser = require('./DiaChiGiaoHangUser')(sequelize, Sequelize);
// ✅ THÊM: Import model DiaChiGiaoHang (địa chỉ cho từng hóa đơn)
db.DiaChiGiaoHang = require('./DiaChiGiaoHang')(sequelize, Sequelize);
// ✅ THÊM MỚI: Import model ThongTinVanChuyen
db.ThongTinVanChuyen = require('./ThongTinVanChuyen')(sequelize, Sequelize);
// ✅ THÊM MỚI: Import model LichSuTrangThaiDonHang
db.LichSuTrangThaiDonHang = require('./LichSuTrangThaiDonHang')(sequelize, Sequelize);
db.DanhGiaSanPham = require('./DanhGiaSanPham')(sequelize, Sequelize);

// Định nghĩa quan hệ giữa các bảng
// SanPham thuộc về một LoaiSP
db.SanPham.belongsTo(db.LoaiSP, {
  foreignKey: 'LoaiID',
  as: 'loaiSP'
});

// LoaiSP có nhiều SanPham
db.LoaiSP.hasMany(db.SanPham, {
  foreignKey: 'LoaiID',
  as: 'sanPhams'
});

// SanPham thuộc về một ThuongHieu
db.SanPham.belongsTo(db.ThuongHieu, {
  foreignKey: 'ThuongHieuID',
  as: 'thuongHieu'
});

// ThuongHieu có nhiều SanPham
db.ThuongHieu.hasMany(db.SanPham, {
  foreignKey: 'ThuongHieuID',
  as: 'sanPhams'
});

// === Quan hệ cho SanPhamHinhAnh ===
// SanPham có nhiều SanPhamHinhAnh
db.SanPham.hasMany(db.SanPhamHinhAnh, {
  foreignKey: 'SanPhamID',
  as: 'hinhAnhs'
});

// SanPhamHinhAnh thuộc về một SanPham
db.SanPhamHinhAnh.belongsTo(db.SanPham, {
  foreignKey: 'SanPhamID',
  as: 'sanPham'
});

// TaiKhoan có một GioHang
db.TaiKhoan.hasOne(db.GioHang, {
  foreignKey: 'TaiKhoanID',
  as: 'gioHang'
});

// GioHang thuộc về một TaiKhoan
db.GioHang.belongsTo(db.TaiKhoan, {
  foreignKey: 'TaiKhoanID',
  as: 'taiKhoan'
});

// TaiKhoan có một KhachHang
db.TaiKhoan.hasOne(db.KhachHang, {
  foreignKey: 'TaiKhoanID',
  as: 'khachHang'
});

// KhachHang thuộc về một TaiKhoan
db.KhachHang.belongsTo(db.TaiKhoan, {
  foreignKey: 'TaiKhoanID',
  as: 'taiKhoan'
});

// GioHang có nhiều GioHangChiTiet
db.GioHang.hasMany(db.GioHangChiTiet, {
  foreignKey: 'GioHangID',
  as: 'chiTiet'
});

// GioHangChiTiet thuộc về một GioHang
db.GioHangChiTiet.belongsTo(db.GioHang, {
  foreignKey: 'GioHangID',
  as: 'gioHang'
});

// GioHangChiTiet thuộc về một SanPham
db.GioHangChiTiet.belongsTo(db.SanPham, {
  foreignKey: 'SanPhamID',
  as: 'sanPham'
});

// SanPham có nhiều GioHangChiTiet
db.SanPham.hasMany(db.GioHangChiTiet, {
  foreignKey: 'SanPhamID',
  as: 'gioHangChiTiet'
});

// === Quan hệ cho HoaDon ===
// HoaDon thuộc về một KhachHang
db.HoaDon.belongsTo(db.KhachHang, {
  foreignKey: 'KhachHangID',
  as: 'khachHang'
});

// KhachHang có nhiều HoaDon
db.KhachHang.hasMany(db.HoaDon, {
  foreignKey: 'KhachHangID',
  as: 'hoaDons'
});

// HoaDon thuộc về một PhuongThucThanhToan
db.HoaDon.belongsTo(db.PhuongThucThanhToan, {
  foreignKey: 'PhuongThucThanhToanID',
  as: 'phuongThucThanhToan'
});

// PhuongThucThanhToan có nhiều HoaDon
db.PhuongThucThanhToan.hasMany(db.HoaDon, {
  foreignKey: 'PhuongThucThanhToanID',
  as: 'hoaDons'
});

// HoaDon có nhiều ChiTietHoaDon
db.HoaDon.hasMany(db.ChiTietHoaDon, {
  foreignKey: 'HoaDonID',
  as: 'chiTiet'
});

// ChiTietHoaDon thuộc về một HoaDon
db.ChiTietHoaDon.belongsTo(db.HoaDon, {
  foreignKey: 'HoaDonID',
  as: 'hoaDon'
});

// ChiTietHoaDon thuộc về một SanPham
db.ChiTietHoaDon.belongsTo(db.SanPham, {
  foreignKey: 'SanPhamID',
  as: 'sanPham'
});

// SanPham có nhiều ChiTietHoaDon
db.SanPham.hasMany(db.ChiTietHoaDon, {
  foreignKey: 'SanPhamID',
  as: 'chiTietHoaDons'
});

// === Quan hệ cho GioHangKhachVangLai (Guest Cart) ===
// GioHangKhachVangLai thuộc về một SanPham
db.GioHangKhachVangLai.belongsTo(db.SanPham, {
  foreignKey: 'SanPhamID',
  as: 'sanPham'
});

// SanPham có nhiều GioHangKhachVangLai
db.SanPham.hasMany(db.GioHangKhachVangLai, {
  foreignKey: 'SanPhamID',
  as: 'gioHangKhachVangLai'
});

// ============================================
// ✅ QUAN HỆ CHO VOUCHER, LỊCH SỬ
// ============================================

// === HoaDon & Voucher ===
// HoaDon thuộc về một Voucher (optional)
db.HoaDon.belongsTo(db.Voucher, {
  foreignKey: 'VoucherID',
  as: 'voucher'
});

// Voucher có nhiều HoaDon
db.Voucher.hasMany(db.HoaDon, {
  foreignKey: 'VoucherID',
  as: 'hoaDons'
});

// === Lịch sử sử dụng Voucher ===
// LichSuSuDungVoucher thuộc về một Voucher
db.LichSuSuDungVoucher.belongsTo(db.Voucher, {
  foreignKey: 'VoucherID',
  as: 'voucher'
});

// Voucher có nhiều LichSuSuDungVoucher
db.Voucher.hasMany(db.LichSuSuDungVoucher, {
  foreignKey: 'VoucherID',
  as: 'lichSuSuDung'
});

// LichSuSuDungVoucher thuộc về một HoaDon
db.LichSuSuDungVoucher.belongsTo(db.HoaDon, {
  foreignKey: 'HoaDonID',
  as: 'hoaDon'
});

// HoaDon có nhiều LichSuSuDungVoucher
db.HoaDon.hasMany(db.LichSuSuDungVoucher, {
  foreignKey: 'HoaDonID',
  as: 'lichSuVoucher'
});

// LichSuSuDungVoucher thuộc về một TaiKhoan (optional - NULL nếu khách vãng lai)
db.LichSuSuDungVoucher.belongsTo(db.TaiKhoan, {
  foreignKey: 'TaiKhoanID',
  as: 'taiKhoan'
});

// TaiKhoan có nhiều LichSuSuDungVoucher
db.TaiKhoan.hasMany(db.LichSuSuDungVoucher, {
  foreignKey: 'TaiKhoanID',
  as: 'lichSuVoucher'
});

// ============================================
// ✅ QUAN HỆ CHO ĐỊA CHỈ GIAO HÀNG
// ============================================

// TaiKhoan có nhiều DiaChiGiaoHangUser
db.TaiKhoan.hasMany(db.DiaChiGiaoHangUser, {
  foreignKey: 'TaiKhoanID',
  as: 'diaChiGiaoHangs'
});

// DiaChiGiaoHangUser thuộc về một TaiKhoan
db.DiaChiGiaoHangUser.belongsTo(db.TaiKhoan, {
  foreignKey: 'TaiKhoanID',
  as: 'taiKhoan'
});

// ✅ THÊM: Quan hệ giữa HoaDon và DiaChiGiaoHang (1-1)
// HoaDon có một DiaChiGiaoHang
db.HoaDon.hasOne(db.DiaChiGiaoHang, {
  foreignKey: 'HoaDonID',
  as: 'diaChiGiaoHang'
});

// DiaChiGiaoHang thuộc về một HoaDon
db.DiaChiGiaoHang.belongsTo(db.HoaDon, {
  foreignKey: 'HoaDonID',
  as: 'hoaDon'
});

// ✅ THÊM MỚI: Quan hệ giữa HoaDon và ThongTinVanChuyen (1-1)
// HoaDon có một ThongTinVanChuyen
db.HoaDon.hasOne(db.ThongTinVanChuyen, {
  foreignKey: 'HoaDonID',
  as: 'thongTinVanChuyen'
});

// ThongTinVanChuyen thuộc về một HoaDon
db.ThongTinVanChuyen.belongsTo(db.HoaDon, {
  foreignKey: 'HoaDonID',
  as: 'hoaDon'
});

// ✅ THÊM MỚI: Quan hệ giữa HoaDon và LichSuTrangThaiDonHang (1-nhiều)
// HoaDon có nhiều LichSuTrangThaiDonHang
db.HoaDon.hasMany(db.LichSuTrangThaiDonHang, {
  foreignKey: 'HoaDonID',
  as: 'lichSuTrangThai'
});

// LichSuTrangThaiDonHang thuộc về một HoaDon
db.LichSuTrangThaiDonHang.belongsTo(db.HoaDon, {
  foreignKey: 'HoaDonID',
  as: 'hoaDon'
});

// ============================================
// ✅ QUAN HỆ CHO ĐÁNH GIÁ SẢN PHẨM (MVP - 8 cột)
// ============================================

// DanhGiaSanPham thuộc về một SanPham
db.DanhGiaSanPham.belongsTo(db.SanPham, {
  foreignKey: 'SanPhamID',
  as: 'sanPham'
});

// SanPham có nhiều DanhGiaSanPham
db.SanPham.hasMany(db.DanhGiaSanPham, {
  foreignKey: 'SanPhamID',
  as: 'danhGias'
});

// DanhGiaSanPham thuộc về một TaiKhoan
db.DanhGiaSanPham.belongsTo(db.TaiKhoan, {
  foreignKey: 'TaiKhoanID',
  as: 'taiKhoan'
});

// TaiKhoan có nhiều DanhGiaSanPham
db.TaiKhoan.hasMany(db.DanhGiaSanPham, {
  foreignKey: 'TaiKhoanID',
  as: 'danhGias'
});

module.exports = db;
