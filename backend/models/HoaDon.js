module.exports = (sequelize, Sequelize) => {
  const HoaDon = sequelize.define("HoaDon", {
    ID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    MaHD: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    KhachHangID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'KhachHang',
        key: 'ID'
      }
    },
    NgayLap: {
      type: Sequelize.DATE,
      allowNull: true
    },
    TongTien: {
      type: Sequelize.DECIMAL(15, 0),
      allowNull: false
    },
    // ✨ TRƯỜNG MỚI - DECORATOR PATTERN DATA
    TienGoc: {
      type: Sequelize.DECIMAL(15, 0),
      allowNull: true,
      comment: 'Tạm tính - Giá trước VAT và voucher'
    },
    TienVAT: {
      type: Sequelize.DECIMAL(15, 0),
      allowNull: true,
      defaultValue: 0,
      comment: 'Tiền thuế VAT'
    },
    TyLeVAT: {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0.10,
      comment: 'Tỷ lệ VAT (0.10 = 10%)'
    },
    MaVoucher: {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Mã voucher đã áp dụng'
    },
    TienGiamGia: {
      type: Sequelize.DECIMAL(15, 0),
      allowNull: true,
      defaultValue: 0,
      comment: 'Số tiền giảm giá từ voucher'
    },
    PhiVanChuyen: {
      type: Sequelize.DECIMAL(15, 0),
      allowNull: true,
      defaultValue: 30000,
      comment: 'Phí vận chuyển'
    },
    MiemPhiVanChuyen: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      comment: 'Có miễn phí vận chuyển không'
    },
    PhuongThucThanhToanID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'PhuongThucThanhToan',
        key: 'ID'
      }
    },
    TrangThai: {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: 'Chờ xử lý'
    },
    GhiChu: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    Enable: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'HoaDon',
    timestamps: false
  });

  return HoaDon;
};
