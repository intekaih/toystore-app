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

// Định nghĩa quan hệ giữa các bảng
// SanPham thuộc về một LoaiSP
db.SanPham.belongsTo(db.LoaiSP, {
  foreignKey: 'LoaiID',  // Sử dụng LoaiID thay vì IDLoaiSP
  as: 'loaiSP'
});

// LoaiSP có nhiều SanPham
db.LoaiSP.hasMany(db.SanPham, {
  foreignKey: 'LoaiID',
  as: 'sanPhams'
});

module.exports = db;
