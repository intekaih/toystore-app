module.exports = (sequelize, Sequelize) => {
  const PhuongThucThanhToan = sequelize.define("PhuongThucThanhToan", {
    ID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Ten: {
      type: Sequelize.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'PhuongThucThanhToan',
    timestamps: false
  });

  return PhuongThucThanhToan;
};
