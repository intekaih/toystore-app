/**
 * Model LichSuTrangThaiDonHang
 * Lưu lịch sử thay đổi trạng thái đơn hàng
 */
module.exports = (sequelize, DataTypes) => {
  const LichSuTrangThaiDonHang = sequelize.define('LichSuTrangThaiDonHang', {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    HoaDonID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'HoaDon',
        key: 'ID'
      }
    },
    TrangThaiCu: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    TrangThaiMoi: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    NguoiThayDoi: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    LyDo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    NgayThayDoi: {
      type: DataTypes.DATE,
      allowNull: false
      // ✅ FIX: Không dùng DataTypes.NOW - để DB tự động set với DEFAULT GETDATE()
      // DataTypes.NOW tự động thêm timezone → SQL Server DATETIME lỗi conversion
    }
  }, {
    tableName: 'LichSuTrangThaiDonHang',
    timestamps: false
  });

  LichSuTrangThaiDonHang.associate = function (models) {
    // Quan hệ với HoaDon
    LichSuTrangThaiDonHang.belongsTo(models.HoaDon, {
      foreignKey: 'HoaDonID',
      as: 'hoaDon'
    });
  };

  return LichSuTrangThaiDonHang;
};

