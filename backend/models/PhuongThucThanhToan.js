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
    },
    MoTa: {
      type: Sequelize.STRING(500),
      allowNull: true
    },
    Enable: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'PhuongThucThanhToan',
    timestamps: false
  });

  return PhuongThucThanhToan;
};
