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
      type: Sequelize.DECIMAL(18, 2),
      allowNull: false
    },
    DaChon: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'DaChon',
      comment: 'Đánh dấu sản phẩm được chọn để thanh toán'
    }
  }, {
    tableName: 'GioHangChiTiet',
    timestamps: false
  });

  return GioHangChiTiet;
};
