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
db.LoaiSP = require('./LoaiSP')(sequelize, Sequelize);
db.GioHang = require('./GioHang')(sequelize, Sequelize);
db.GioHangChiTiet = require('./GioHangChiTiet')(sequelize, Sequelize);
db.GioHangKhachVangLai = require('./GioHangKhachVangLai')(sequelize, Sequelize);
db.HoaDon = require('./HoaDon')(sequelize, Sequelize);
db.ChiTietHoaDon = require('./ChiTietHoaDon')(sequelize, Sequelize);
db.KhachHang = require('./KhachHang')(sequelize, Sequelize);
db.PhuongThucThanhToan = require('./PhuongThucThanhToan')(sequelize, Sequelize);
// ✅ THÊM MODELS MỚI
db.Voucher = require('./Voucher')(sequelize);
db.PhiShip = require('./PhiShip')(sequelize);
db.LichSuSuDungVoucher = require('./LichSuSuDungVoucher')(sequelize);

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
// ✅ QUAN HỆ CHO VOUCHER, PHÍ SHIP, LỊCH SỬ
// ============================================

// === Voucher ===
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

module.exports = db;
