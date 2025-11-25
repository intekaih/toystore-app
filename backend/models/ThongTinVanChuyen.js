// filepath: backend/models/ThongTinVanChuyen.js
module.exports = (sequelize, DataTypes) => {
  const ThongTinVanChuyen = sequelize.define('ThongTinVanChuyen', {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    HoaDonID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'HoaDon',
        key: 'ID'
      }
    },
    MaVanDon: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    DonViVanChuyen: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    NgayGuiHang: {
      type: DataTypes.DATE,
      allowNull: true
    },
    NgayGiaoThanhCong: {
      type: DataTypes.DATE,
      allowNull: true
    },
    NgayGiaoDuKien: {
      type: DataTypes.DATE,
      allowNull: true
    },
    SoLanGiaoThatBai: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    GhiChuShipper: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    PhiVanChuyen: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true
    },
    TrangThaiGHN: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    tableName: 'ThongTinVanChuyen',
    timestamps: false
  });

  ThongTinVanChuyen.associate = function(models) {
    // Quan hệ 1-1 với HoaDon
    ThongTinVanChuyen.belongsTo(models.HoaDon, {
      foreignKey: 'HoaDonID',
      as: 'hoaDon'
    });
  };

  return ThongTinVanChuyen;
};

