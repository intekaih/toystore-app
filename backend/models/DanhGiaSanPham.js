module.exports = (sequelize, Sequelize) => {
  const DanhGiaSanPham = sequelize.define("DanhGiaSanPham", {
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
      }
    },
    TaiKhoanID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'TaiKhoan',
        key: 'ID'
      }
    },
    SoSao: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    NoiDung: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    HinhAnh1: {
      type: Sequelize.STRING(500),
      allowNull: true
    },
    TrangThai: {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'ChoDuyet',
      validate: {
        isIn: [['ChoDuyet', 'DaDuyet', 'BiTuChoi']]
      }
    },
    NgayTao: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('GETDATE()')
    }
  }, {
    tableName: 'DanhGiaSanPham',
    timestamps: false,
    hooks: {
      beforeCreate: (instance, options) => {
        if (!instance.changed('NgayTao')) {
          delete instance.dataValues.NgayTao;
        }
      }
    }
  });

  return DanhGiaSanPham;
};
