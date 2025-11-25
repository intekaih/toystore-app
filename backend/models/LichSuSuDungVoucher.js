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
      allowNull: false, // ✅ THAY ĐỔI: Không cho phép NULL vì theo logic mới, chỉ lưu khi có HoaDonID
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
      allowNull: false,
      // ✅ BỎ defaultValue trong Sequelize - để SQL Server tự xử lý với DEFAULT GETDATE() trong DB
      comment: 'Thời điểm sử dụng voucher - DB tự set với DEFAULT GETDATE()'
    }
  }, {
    tableName: 'LichSuSuDungVoucher',
    timestamps: false, // Không dùng createdAt/updatedAt của Sequelize
    indexes: [
      { fields: ['VoucherID'] },
      { fields: ['HoaDonID'] },
      { fields: ['TaiKhoanID'] },
      { fields: ['NgaySuDung'] }
    ]
  });

  return LichSuSuDungVoucher;
};
