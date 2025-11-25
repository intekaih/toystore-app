module.exports = (sequelize, Sequelize) => {
  const ThuongHieu = sequelize.define("ThuongHieu", {
    ID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    TenThuongHieu: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    },
    Logo: {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'URL logo thương hiệu'
    },
    TrangThai: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      field: 'TrangThai'
    }
  }, {
    tableName: 'ThuongHieu',
    timestamps: false
  });

  return ThuongHieu;
};
