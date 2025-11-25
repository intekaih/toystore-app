module.exports = (sequelize, DataTypes) => {
  const DiaChiGiaoHang = sequelize.define('DiaChiGiaoHang', {
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
    // Mã GHN API
    MaTinhID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    MaQuanID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    MaPhuongXa: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    // Tên hiển thị
    TenTinh: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    TenQuan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    TenPhuong: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    DiaChiChiTiet: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    // Người nhận
    SoDienThoai: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    TenNguoiNhan: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'DiaChiGiaoHang',
    timestamps: false
  });

  DiaChiGiaoHang.associate = function(models) {
    // Quan hệ 1-1 với HoaDon
    DiaChiGiaoHang.belongsTo(models.HoaDon, {
      foreignKey: 'HoaDonID',
      as: 'hoaDon'
    });
  };

  return DiaChiGiaoHang;
};
