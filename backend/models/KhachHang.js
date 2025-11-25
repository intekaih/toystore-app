module.exports = (sequelize, Sequelize) => {
  const KhachHang = sequelize.define("KhachHang", {
    ID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    TaiKhoanID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'TaiKhoan',
        key: 'ID'
      }
    },
    NgayTao: {
      type: Sequelize.DATE,
      allowNull: true
    }
  }, {
    tableName: 'KhachHang',
    timestamps: false
  });

  return KhachHang;
};
