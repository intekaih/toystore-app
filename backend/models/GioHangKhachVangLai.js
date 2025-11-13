/**
 * =======================================
 * MODEL: GioHangKhachVangLai (Guest Cart)
 * =======================================
 * Mục đích: Lưu giỏ hàng của khách vãng lai (không đăng nhập) vào DB
 * Thay thế: localStorage
 * Ưu điểm: 
 * - Đồng bộ 100% với DB
 * - Không bị mất khi đổi thiết bị/trình duyệt
 * - Dễ quản lý và debug
 */

module.exports = (sequelize, DataTypes) => {
  const GioHangKhachVangLai = sequelize.define('GioHangKhachVangLai', {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'ID'
    },
    SessionID: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'SessionID',
      validate: {
        notEmpty: {
          msg: 'Session ID không được để trống'
        },
        len: {
          args: [1, 255],
          msg: 'Session ID phải từ 1-255 ký tự'
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
      type: DataTypes.DECIMAL(15, 0),
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
    NgayThem: {
      type: DataTypes.DATE,
      allowNull: true, // ✅ Cho phép null trong Sequelize
      field: 'NgayThem'
      // SQL Server sẽ tự động điền qua DEFAULT GETDATE()
    },
    NgayCapNhat: {
      type: DataTypes.DATE,
      allowNull: true, // ✅ Cho phép null trong Sequelize
      field: 'NgayCapNhat'
      // SQL Server sẽ tự động điền qua DEFAULT GETDATE()
    },
    Enable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'Enable'
    }
  }, {
    tableName: 'GioHangKhachVangLai',
    timestamps: false,
    indexes: [
      {
        name: 'IX_GioHangKhachVangLai_SessionID',
        fields: ['SessionID']
      },
      {
        name: 'IX_GioHangKhachVangLai_NgayThem',
        fields: ['NgayThem']
      },
      {
        name: 'UQ_GuestCart_Session_Product',
        unique: true,
        fields: ['SessionID', 'SanPhamID']
      }
    ]
    // ❌ XÓA hook beforeUpdate - để SQL Server tự động cập nhật
  });

  // =======================================
  // ASSOCIATIONS (Mối quan hệ)
  // =======================================
  GioHangKhachVangLai.associate = (models) => {
    // Một giỏ hàng guest thuộc về một sản phẩm
    GioHangKhachVangLai.belongsTo(models.SanPham, {
      foreignKey: 'SanPhamID',
      as: 'sanPham',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  // =======================================
  // INSTANCE METHODS (Phương thức instance)
  // =======================================
  
  /**
   * Tính thành tiền
   */
  GioHangKhachVangLai.prototype.getThanhTien = function() {
    return this.SoLuong * parseFloat(this.DonGia);
  };

  /**
   * Kiểm tra giỏ hàng có hết hạn chưa (>7 ngày)
   */
  GioHangKhachVangLai.prototype.isExpired = function() {
    const now = new Date();
    const diffTime = now - this.NgayCapNhat;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays > 7;
  };

  // =======================================
  // CLASS METHODS (Phương thức static)
  // =======================================
  
  /**
   * Lấy giỏ hàng theo SessionID
   * @param {string} sessionId - UUID của guest user
   * @param {object} models - Danh sách models
   * @returns {Promise<Array>}
   */
  GioHangKhachVangLai.getCartBySession = async function(sessionId, models) {
    return await this.findAll({
      where: {
        SessionID: sessionId,
        Enable: true
      },
      include: [{
        model: models.SanPham,
        as: 'sanPham',
        where: { Enable: true },
        required: true,
        attributes: ['ID', 'Ten', 'GiaBan', 'Ton', 'HinhAnhURL', 'LoaiID'],
        include: [{
          model: models.LoaiSP,
          as: 'loaiSP', // ✅ SỬA: 'loai' → 'loaiSP'
          attributes: ['ID', 'Ten']
        }]
      }],
      order: [['NgayThem', 'DESC']]
    });
  };

  /**
   * Thêm sản phẩm vào giỏ hàng guest
   * @param {string} sessionId - UUID của guest user
   * @param {number} sanPhamId - ID sản phẩm
   * @param {number} soLuong - Số lượng
   * @param {number} donGia - Đơn giá
   * @returns {Promise<object>}
   */
  GioHangKhachVangLai.addToCart = async function(sessionId, sanPhamId, soLuong, donGia) {
    // ✅ Tìm item hiện có (BẤT KỂ Enable true/false để tránh vi phạm unique constraint)
    const existingItem = await this.findOne({
      where: {
        SessionID: sessionId,
        SanPhamID: sanPhamId
        // ❌ BỎ Enable: true - tìm cả item đã bị soft delete
      }
    });

    if (existingItem) {
      // ✅ Đã tồn tại → cộng dồn số lượng và enable lại
      await existingItem.update({
        SoLuong: existingItem.Enable ? existingItem.SoLuong + soLuong : soLuong,
        Enable: true // Enable lại nếu đã bị soft delete
      });
      return existingItem;
    } else {
      // ✅ Chưa tồn tại → tạo mới
      const newItem = await this.create({
        SessionID: sessionId,
        SanPhamID: sanPhamId,
        SoLuong: soLuong,
        DonGia: donGia,
        Enable: true
      });
      return newItem;
    }
  };

  /**
   * Khôi phục sản phẩm vào giỏ hàng (không cộng dồn số lượng)
   * Dùng khi thanh toán thất bại
   * @param {string} sessionId - UUID của guest user
   * @param {number} sanPhamId - ID sản phẩm
   * @param {number} soLuong - Số lượng cần khôi phục
   * @param {number} donGia - Đơn giá
   * @returns {Promise<object>}
   */
  GioHangKhachVangLai.restoreToCart = async function(sessionId, sanPhamId, soLuong, donGia) {
    // ✅ Tìm item hiện có
    const existingItem = await this.findOne({
      where: {
        SessionID: sessionId,
        SanPhamID: sanPhamId
      }
    });

    if (existingItem) {
      // ✅ Đã tồn tại → SET lại số lượng (KHÔNG cộng dồn) và enable lại
      await existingItem.update({
        SoLuong: soLuong, // ✅ SET = số lượng cần khôi phục (không cộng thêm)
        DonGia: donGia,
        Enable: true
      });
      return existingItem;
    } else {
      // ✅ Chưa tồn tại → tạo mới
      const newItem = await this.create({
        SessionID: sessionId,
        SanPhamID: sanPhamId,
        SoLuong: soLuong,
        DonGia: donGia,
        Enable: true
      });
      return newItem;
    }
  };

  /**
   * Cập nhật số lượng sản phẩm trong giỏ
   * @param {string} sessionId - UUID của guest user
   * @param {number} sanPhamId - ID sản phẩm
   * @param {number} soLuong - Số lượng mới
   * @returns {Promise<boolean>}
   */
  GioHangKhachVangLai.updateQuantity = async function(sessionId, sanPhamId, soLuong) {
    const [affectedRows] = await this.update(
      { 
        SoLuong: soLuong
        // ❌ XÓA NgayCapNhat - để SQL Server tự động cập nhật qua trigger/default
      },
      {
        where: {
          SessionID: sessionId,
          SanPhamID: sanPhamId,
          Enable: true
        }
      }
    );

    return affectedRows > 0;
  };

  /**
   * Xóa sản phẩm khỏi giỏ hàng (soft delete)
   * @param {string} sessionId - UUID của guest user
   * @param {number} sanPhamId - ID sản phẩm
   * @returns {Promise<boolean>}
   */
  GioHangKhachVangLai.removeFromCart = async function(sessionId, sanPhamId) {
    const [affectedRows] = await this.update(
      { Enable: false },
      {
        where: {
          SessionID: sessionId,
          SanPhamID: sanPhamId
        }
      }
    );

    return affectedRows > 0;
  };

  /**
   * Xóa toàn bộ giỏ hàng của guest
   * @param {string} sessionId - UUID của guest user
   * @returns {Promise<boolean>}
   */
  GioHangKhachVangLai.clearCart = async function(sessionId) {
    const [affectedRows] = await this.update(
      { Enable: false },
      {
        where: {
          SessionID: sessionId
        }
      }
    );

    return affectedRows > 0;
  };

  /**
   * Xóa giỏ hàng cũ (>7 ngày) - Chạy tự động
   * @returns {Promise<number>}
   */
  GioHangKhachVangLai.cleanupOldCarts = async function() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const deletedCount = await this.destroy({
      where: {
        NgayCapNhat: {
          [sequelize.Sequelize.Op.lt]: sevenDaysAgo
        }
      },
      force: true // Hard delete
    });

    return deletedCount;
  };

  /**
   * Tính tổng tiền giỏ hàng
   * @param {string} sessionId - UUID của guest user
   * @returns {Promise<number>}
   */
  GioHangKhachVangLai.getTotalAmount = async function(sessionId) {
    const cartItems = await this.findAll({
      where: {
        SessionID: sessionId,
        Enable: true
      },
      attributes: ['SoLuong', 'DonGia']
    });

    return cartItems.reduce((total, item) => {
      return total + (item.SoLuong * parseFloat(item.DonGia));
    }, 0);
  };

  return GioHangKhachVangLai;
};
