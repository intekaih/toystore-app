module.exports = (sequelize, Sequelize) => {
  const LoaiSP = sequelize.define("LoaiSP", {
    ID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Ten: {  // Tên cột trong DB là "Ten"
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    },
    MoTa: {
      type: Sequelize.STRING(500),
      allowNull: true
    },
    Enable: {  // Tên cột trong DB là "Enable"
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'LoaiSP',
    timestamps: false
  });

  return LoaiSP;
};