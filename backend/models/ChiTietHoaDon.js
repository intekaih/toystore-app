module.exports = (sequelize, Sequelize) => {
  const ChiTietHoaDon = sequelize.define("ChiTietHoaDon", {
    ID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    HoaDonID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'HoaDon',
        key: 'ID'
      }
    },
    SanPhamID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'SanPham',
        key: 'ID'
      }
    },
    SoLuong: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    DonGia: {
      type: Sequelize.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0
    },
    ThanhTien: {
      type: Sequelize.DECIMAL(18, 2),
      allowNull: false
    }
  }, {
    tableName: 'ChiTietHoaDon',
    timestamps: false
  });

  return ChiTietHoaDon;
};
