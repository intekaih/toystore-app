const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Voucher = sequelize.define('Voucher', {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    MaVoucher: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Mã voucher (VD: FREESHIP2024, GIAM50K)'
    },
    Ten: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Tên voucher'
    },
    MoTa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Mô tả chi tiết'
    },
    LoaiGiamGia: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['PhanTram', 'TienMat']]
      },
      comment: 'Loại giảm giá: PhanTram hoặc TienMat'
    },
    GiaTriGiam: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      comment: 'Giá trị giảm (10% = 10, hoặc 50000đ = 50000)'
    },
    GiamToiDa: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
      comment: 'Giảm tối đa (chỉ áp dụng với phần trăm)'
    },
    DonHangToiThieu: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 0,
      comment: 'Giá trị đơn hàng tối thiểu để áp dụng'
    },
    NgayBatDau: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Ngày bắt đầu hiệu lực'
    },
    NgayKetThuc: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Ngày kết thúc'
    },
    SoLuong: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Số lượng voucher có sẵn (NULL = không giới hạn)'
    },
    SoLuongDaSuDung: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Số lượng đã sử dụng'
    },
    SuDungToiDaMoiNguoi: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Mỗi người dùng được dùng tối đa bao nhiêu lần'
    },
    TrangThai: {
      type: DataTypes.STRING(20),
      defaultValue: 'HoatDong',
      validate: {
        isIn: [['HoatDong', 'TamDung', 'HetHan']]
      },
      comment: 'Trạng thái voucher'
    }
  }, {
    tableName: 'Voucher',
    timestamps: false,
    indexes: [
      { fields: ['MaVoucher'] },
      { fields: ['TrangThai'] },
      { fields: ['NgayBatDau', 'NgayKetThuc'] }
    ]
  });

  // ✅ PHƯƠNG THỨC KIỂM TRA VOUCHER HỢP LỆ
  Voucher.prototype.isValid = function(tongTienSanPham, taiKhoanId = null) {
    const now = new Date();
    
    // Kiểm tra trạng thái
    if (this.TrangThai !== 'HoatDong') {
      return { valid: false, message: 'Voucher không còn hoạt động' };
    }
    
    // Kiểm tra thời gian hiệu lực
    if (now < new Date(this.NgayBatDau)) {
      return { valid: false, message: 'Voucher chưa đến ngày hiệu lực' };
    }
    
    if (now > new Date(this.NgayKetThuc)) {
      return { valid: false, message: 'Voucher đã hết hạn' };
    }
    
    // Kiểm tra số lượng
    if (this.SoLuong !== null && this.SoLuongDaSuDung >= this.SoLuong) {
      return { valid: false, message: 'Voucher đã hết số lượng' };
    }
    
    // ✅ Voucher chỉ áp dụng cho toàn đơn hàng (ToanDon)
    
    // Kiểm tra giá trị đơn hàng tối thiểu
    if (tongTienSanPham < this.DonHangToiThieu) {
      return { 
        valid: false, 
        message: `Đơn hàng tối thiểu ${this.DonHangToiThieu.toLocaleString('vi-VN')}đ để áp dụng voucher này` 
      };
    }
    
    return { valid: true };
  };

  // ✅ PHƯƠNG THỨC TÍNH GIÁ TRỊ GIẢM GIÁ
  Voucher.prototype.calculateDiscount = function(tongTienSanPham) {
    if (this.LoaiGiamGia === 'TienMat') {
      return parseFloat(this.GiaTriGiam);
    } else if (this.LoaiGiamGia === 'PhanTram') {
      let giamGia = tongTienSanPham * parseFloat(this.GiaTriGiam) / 100;
      
      // Giới hạn giảm tối đa
      if (this.GiamToiDa !== null && giamGia > parseFloat(this.GiamToiDa)) {
        giamGia = parseFloat(this.GiamToiDa);
      }
      
      return giamGia;
    }
    
    return 0;
  };

  return Voucher;
};
