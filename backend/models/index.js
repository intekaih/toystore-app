const Sequelize = require("sequelize");
const dbConfig = require("../config/db.config");

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    dialectOptions: dbConfig.dialectOptions,
    port: dbConfig.port,
    pool: dbConfig.pool,
    logging: false,
  }
);

// Test kết nối
sequelize.authenticate()
  .then(() => {
    console.log("✅ Kết nối SQL Server thành công!");
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối SQL:", err);
  });

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
db.HoaDon = require('./HoaDon')(sequelize, Sequelize);
db.ChiTietHoaDon = require('./ChiTietHoaDon')(sequelize, Sequelize);
db.KhachHang = require('./KhachHang')(sequelize, Sequelize);
db.PhuongThucThanhToan = require('./PhuongThucThanhToan')(sequelize, Sequelize);

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

module.exports = db;
