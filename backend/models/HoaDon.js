module.exports = (sequelize, Sequelize) => {
  const HoaDon = sequelize.define("HoaDon", {
    ID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    MaHD: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    KhachHangID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'KhachHang',
        key: 'ID'
      }
    },
    NgayLap: {
      type: Sequelize.DATE,
      allowNull: true
    },
    TongTien: {
      type: Sequelize.DECIMAL(15, 0),
      allowNull: false
    },
    PhuongThucThanhToanID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'PhuongThucThanhToan',
        key: 'ID'
      }
    },
    TrangThai: {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: 'Chờ xử lý'
    },
    GhiChu: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    Enable: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'HoaDon',
    timestamps: false
  });

  return HoaDon;
};
