module.exports = (sequelize, Sequelize) => {
  const SanPhamHinhAnh = sequelize.define("SanPhamHinhAnh", {
    ID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    SanPhamID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'SanPham',
        key: 'ID'
      },
      onDelete: 'CASCADE'
    },
    DuongDanHinhAnh: {
      type: Sequelize.STRING(500),
      allowNull: false
    },
    ThuTu: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    LaMacDinh: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'SanPhamHinhAnh',
    timestamps: false
  });

  return SanPhamHinhAnh;
};
