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
      defaultValue: 'ChoXuLy'
    },
    GhiChu: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    
    // ✅ CÁC CỘT TÍNH TIỀN
    TienGoc: {
      type: Sequelize.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'TienGoc',
      comment: 'Tổng tiền sản phẩm gốc'
    },
    VoucherID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Voucher',
        key: 'ID'
      }
    },
    GiamGia: {
      type: Sequelize.DECIMAL(18, 2),
      allowNull: true,
      defaultValue: 0,
      field: 'GiamGia',
      comment: 'Số tiền giảm giá từ voucher'
    },
    TienShip: {
      type: Sequelize.DECIMAL(18, 2),
      allowNull: true,
      defaultValue: 0,
      field: 'TienShip',
      comment: 'Phí vận chuyển'
    },
    TyLeVAT: {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0.10,
      field: 'TyLeVAT',
      comment: 'Tỷ lệ VAT (0.10 = 10%)'
    },
    TienVAT: {
      type: Sequelize.DECIMAL(18, 2),
      allowNull: true,
      defaultValue: 0,
      field: 'TienVAT',
      comment: 'Số tiền VAT thực tế'
    },
    ThanhTien: {
      type: Sequelize.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'ThanhTien',
      comment: 'Tổng tiền cuối cùng'
    }
  }, {
    tableName: 'HoaDon',
    timestamps: false
  });

  HoaDon.associate = function(models) {
    // Quan hệ với KhachHang
    HoaDon.belongsTo(models.KhachHang, {
      foreignKey: 'KhachHangID',
      as: 'khachHang'
    });

    // Quan hệ với PhuongThucThanhToan
    HoaDon.belongsTo(models.PhuongThucThanhToan, {
      foreignKey: 'PhuongThucThanhToanID',
      as: 'phuongThucThanhToan'
    });

    // Quan hệ với Voucher
    HoaDon.belongsTo(models.Voucher, {
      foreignKey: 'VoucherID',
      as: 'voucher'
    });

    // Quan hệ với ChiTietHoaDon
    HoaDon.hasMany(models.ChiTietHoaDon, {
      foreignKey: 'HoaDonID',
      as: 'chiTiet'
    });

    // ✅ THÊM: Quan hệ 1-1 với DiaChiGiaoHang
    HoaDon.hasOne(models.DiaChiGiaoHang, {
      foreignKey: 'HoaDonID',
      as: 'diaChiGiaoHang'
    });

    // Quan hệ với ThongTinVanChuyen
    HoaDon.hasOne(models.ThongTinVanChuyen, {
      foreignKey: 'HoaDonID',
      as: 'thongTinVanChuyen'
    });

    // ✅ REMOVED: Không dùng LichSuTrangThaiDonHang nữa, chỉ dùng HoaDon.TrangThai
  };

  return HoaDon;
};
