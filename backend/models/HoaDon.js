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
    // ✅ THÊM: Tổng tiền sản phẩm (trước khi tính VAT, ship, voucher)
    TongTienSanPham: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0
    },
    // ✅ THÊM: VAT (thuế GTGT) - tỷ lệ %
    VAT: {
      type: Sequelize.DECIMAL(5, 4),
      allowNull: true,
      defaultValue: 0,
      comment: 'VAT rate (e.g., 0.1 = 10%)'
    },
    // ✅ THÊM: Tiền VAT (số tiền thuế thực tế)
    TienVAT: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0
    },
    // ✅ THÊM: Phí ship
    PhiShip: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0
    },
    // ✅ THÊM: VoucherID (nếu có áp dụng voucher)
    VoucherID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Voucher',
        key: 'ID'
      }
    },
    // ✅ THÊM: Giảm giá (số tiền giảm từ voucher)
    GiamGia: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0
    },
    TongTien: {
      type: Sequelize.DECIMAL(15, 2), // ✅ Thay đổi từ DECIMAL(15,0) sang DECIMAL(15,2)
      allowNull: false,
      comment: 'Tổng tiền cuối cùng = TongTienSanPham + TienVAT + PhiShip - GiamGia'
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
