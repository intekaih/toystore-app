/**
 * =======================================
 * MODEL: GioHangKhachVangLai (Guest Cart)
 * =======================================
 * Mục đích: Lưu giỏ hàng của khách vãng lai (không đăng nhập) vào DB
 */

module.exports = (sequelize, DataTypes) => {
  const GioHangKhachVangLai = sequelize.define('GioHangKhachVangLai', {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'ID'
    },
    MaPhien: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'MaPhien',
      validate: {
        notEmpty: {
          msg: 'Mã phiên không được để trống'
        },
        len: {
          args: [1, 255],
          msg: 'Mã phiên phải từ 1-255 ký tự'
        }
      },
      comment: 'UUID từ frontend để định danh guest user'
    },
    SanPhamID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'SanPhamID',
      references: {
        model: 'SanPham',
        key: 'ID'
      },
      validate: {
        isInt: {
          msg: 'ID sản phẩm phải là số nguyên'
        }
      }
    },
    SoLuong: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'SoLuong',
      defaultValue: 1,
      validate: {
        isInt: {
          msg: 'Số lượng phải là số nguyên'
        },
        min: {
          args: [1],
          msg: 'Số lượng phải lớn hơn 0'
        }
      }
    },
    DonGia: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      field: 'DonGia',
      defaultValue: 0,
      validate: {
        isDecimal: {
          msg: 'Đơn giá phải là số'
        },
        min: {
          args: [0],
          msg: 'Đơn giá không được âm'
        }
      },
      get() {
        const rawValue = this.getDataValue('DonGia');
        return rawValue ? parseFloat(rawValue) : 0;
      }
    },
    DaChon: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'DaChon',
      defaultValue: false,
      comment: 'Đánh dấu sản phẩm được chọn để thanh toán'
    },
    NgayHetHan: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'NgayHetHan',
      comment: 'Ngày hết hạn giỏ hàng (để cleanup tự động)'
    }
  }, {
    tableName: 'GioHangKhachVangLai',
    timestamps: false,
    indexes: [
      {
        name: 'IX_GioHangKhachVangLai_MaPhien',
        fields: ['MaPhien']
      },
      {
        name: 'UQ_GuestCart_MaPhien_Product',
        unique: true,
        fields: ['MaPhien', 'SanPhamID']
      }
    ]
  });

  // =======================================
  // ASSOCIATIONS (Mối quan hệ)
  // =======================================
  GioHangKhachVangLai.associate = (models) => {
    GioHangKhachVangLai.belongsTo(models.SanPham, {
      foreignKey: 'SanPhamID',
      as: 'sanPham',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  // =======================================
  // INSTANCE METHODS
  // =======================================
  
  GioHangKhachVangLai.prototype.getThanhTien = function() {
    return this.SoLuong * parseFloat(this.DonGia);
  };

  GioHangKhachVangLai.prototype.isExpired = function() {
    if (!this.NgayHetHan) return false;
    return new Date() > new Date(this.NgayHetHan);
  };

  // =======================================
  // CLASS METHODS
  // =======================================
  
  GioHangKhachVangLai.getCartBySession = async function(maPhien, models) {
    return await this.findAll({
      where: {
        MaPhien: maPhien
      },
      include: [{
        model: models.SanPham,
        as: 'sanPham',
        where: { TrangThai: true },
        required: true,
        attributes: ['ID', 'Ten', 'GiaBan', 'SoLuongTon', 'HinhAnhURL', 'LoaiID'],
        include: [{
          model: models.LoaiSP,
          as: 'loaiSP',
          attributes: ['ID', 'Ten']
        }]
      }],
      order: [['ID', 'DESC']]
    });
  };

  GioHangKhachVangLai.addToCart = async function(maPhien, sanPhamId, soLuong, donGia) {
    const existingItem = await this.findOne({
      where: {
        MaPhien: maPhien,
        SanPhamID: sanPhamId
      }
    });

    if (existingItem) {
      await existingItem.update({
        SoLuong: existingItem.SoLuong + soLuong,
        DaChon: true // ✅ Tự động chọn khi cập nhật số lượng
      });
      return existingItem;
    } else {
      const newItem = await this.create({
        MaPhien: maPhien,
        SanPhamID: sanPhamId,
        SoLuong: soLuong,
        DonGia: donGia,
        DaChon: true // ✅ Tự động chọn khi thêm mới
      });
      return newItem;
    }
  };

  GioHangKhachVangLai.updateQuantity = async function(maPhien, sanPhamId, soLuong) {
    const [affectedRows] = await this.update(
      { SoLuong: soLuong },
      {
        where: {
          MaPhien: maPhien,
          SanPhamID: sanPhamId
        }
      }
    );
    return affectedRows > 0;
  };

  GioHangKhachVangLai.removeFromCart = async function(maPhien, sanPhamId) {
    const deletedCount = await this.destroy({
      where: {
        MaPhien: maPhien,
        SanPhamID: sanPhamId
      }
    });
    return deletedCount > 0;
  };

  GioHangKhachVangLai.clearCart = async function(maPhien) {
    const deletedCount = await this.destroy({
      where: {
        MaPhien: maPhien
      }
    });
    return deletedCount > 0;
  };

  GioHangKhachVangLai.cleanupExpired = async function() {
    const now = new Date();
    const deletedCount = await this.destroy({
      where: {
        NgayHetHan: {
          [sequelize.Sequelize.Op.lt]: now
        }
      }
    });
    return deletedCount;
  };

  GioHangKhachVangLai.getTotalAmount = async function(maPhien) {
    const cartItems = await this.findAll({
      where: {
        MaPhien: maPhien
      },
      attributes: ['SoLuong', 'DonGia']
    });

    return cartItems.reduce((total, item) => {
      return total + (item.SoLuong * parseFloat(item.DonGia));
    }, 0);
  };

  return GioHangKhachVangLai;
};
