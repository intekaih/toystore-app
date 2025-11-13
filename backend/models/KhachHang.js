module.exports = (sequelize, Sequelize) => {
  const KhachHang = sequelize.define("KhachHang", {
    ID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    TaiKhoanID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'TaiKhoan',
        key: 'ID'
      }
    },
    HoTen: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    Email: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    DienThoai: {
      type: Sequelize.STRING(20),
      allowNull: true
    },
    DiaChi: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    NgayTao: {
      type: Sequelize.DATE,
      allowNull: true
    },
    Enable: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'KhachHang',
    timestamps: false
  });

  return KhachHang;
};
