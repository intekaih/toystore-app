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
    }
  }, {
    tableName: 'GioHang',
    timestamps: false
  });

  return GioHang;
};
