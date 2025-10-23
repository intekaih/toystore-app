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
    GiaBan: {
      type: Sequelize.DECIMAL(15, 0),
      allowNull: false
    },
    ThanhTien: {
      type: Sequelize.DECIMAL(15, 0),
      allowNull: false
    },
    DonGia: {
      type: Sequelize.DECIMAL(15, 0),
      allowNull: false,
      defaultValue: 0
    },
    Enable: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'ChiTietHoaDon',
    timestamps: false
  });

  return ChiTietHoaDon;
};
