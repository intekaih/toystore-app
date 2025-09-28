module.exports = (sequelize, Sequelize) => {
  const SanPham = sequelize.define("SanPham", {
    ID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Ten: {  // Tên cột trong DB là "Ten"
      type: Sequelize.STRING(200),
      allowNull: false
    },
    LoaiID: {  // Tên cột trong DB là "LoaiID" 
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'LoaiSP',
        key: 'ID'
      }
    },
    GiaBan: {
      type: Sequelize.DECIMAL(15, 0),
      allowNull: false
    },
    Ton: {  // Tên cột trong DB là "Ton"
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    MoTa: {
      type: Sequelize.TEXT,  // ntext trong SQL
      allowNull: true
    },
    HinhAnhURL: {  // Tên cột trong DB là "HinhAnhURL"
      type: Sequelize.STRING(500),
      allowNull: true
    },
    NgayTao: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW
    },
    Enable: {  // Tên cột trong DB là "Enable"
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'SanPham',
    timestamps: false
  });

  return SanPham;
};