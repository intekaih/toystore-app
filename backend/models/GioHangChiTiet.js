module.exports = (sequelize, Sequelize) => {
  const GioHangChiTiet = sequelize.define("GioHangChiTiet", {
    ID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    GioHangID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'GioHang',
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
      allowNull: false,
      defaultValue: 1
    },
    DonGia: {
      type: Sequelize.DECIMAL(15, 0),
      allowNull: false
    },
    NgayThem: {
      type: Sequelize.DATE,
      allowNull: true
    }
  }, {
    tableName: 'GioHangChiTiet',
    timestamps: false
  });

  return GioHangChiTiet;
};
