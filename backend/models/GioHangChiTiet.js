module.exports = (sequelize, Sequelize) => {
  const GioHangChiTiet = sequelize.define("GioHangChiTiet", {
    ID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    GioHangID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'GioHang',
        key: 'ID'
      }
    },
    SanPhamID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'SanPham',
        key: 'ID'
      }
    },
    SoLuong: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    NgayThem: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('GETDATE()') // ✅ SQL Server function
    },
    Enable: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    tableName: 'GioHangChiTiet',
    timestamps: false,
    freezeTableName: true
  });

  return GioHangChiTiet;
};
