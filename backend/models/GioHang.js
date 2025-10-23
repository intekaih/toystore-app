module.exports = (sequelize, Sequelize) => {
  const GioHang = sequelize.define("GioHang", {
    ID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    TaiKhoanID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'TaiKhoan',
        key: 'ID'
      }
    },
    NgayTao: {
      type: Sequelize.DATE,
      allowNull: true
      // Bỏ defaultValue - để SQL Server tự động gán DEFAULT GETDATE()
    }
  }, {
    tableName: 'GioHang',
    timestamps: false
  });

  return GioHang;
};
