const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LichSuSuDungVoucher = sequelize.define('LichSuSuDungVoucher', {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    VoucherID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Voucher',
        key: 'ID'
      }
    },
    HoaDonID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'HoaDon',
        key: 'ID'
      }
    },
    TaiKhoanID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'TaiKhoan',
        key: 'ID'
      },
      comment: 'NULL nếu khách vãng lai'
    },
    GiaTriGiam: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      comment: 'Giá trị giảm thực tế của lần sử dụng này'
    },
    NgaySuDung: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    Enable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'LichSuSuDungVoucher',
    timestamps: false,
    indexes: [
      { fields: ['VoucherID'] },
      { fields: ['HoaDonID'] },
      { fields: ['TaiKhoanID'] }
    ]
  });

  return LichSuSuDungVoucher;
};
