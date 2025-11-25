module.exports = (sequelize, Sequelize) => {
  const LoaiSP = sequelize.define("LoaiSP", {
    ID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Ten: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    },
    TrangThai: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      field: 'TrangThai'
    }
  }, {
    tableName: 'LoaiSP',
    timestamps: false
  });

  return LoaiSP;
};