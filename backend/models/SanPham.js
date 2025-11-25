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
    ThuongHieuID: {  // Tên cột trong DB là "ThuongHieuID"
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'ThuongHieu',
        key: 'ID'
      }
    },
    GiaBan: {
      type: Sequelize.DECIMAL(18, 2), // ✅ ĐÃ SỬA: (15,0) → (18,2)
      allowNull: false
    },
    SoLuongTon: {  // Tên cột trong DB là "SoLuongTon"
      type: Sequelize.INTEGER,
      defaultValue: 0,
      field: 'SoLuongTon'
    },
    // ✅ THÊM: Alias Ton để tương thích với code cũ
    Ton: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.getDataValue('SoLuongTon');
      },
      set(value) {
        this.setDataValue('SoLuongTon', value);
      }
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
      defaultValue: Sequelize.literal('GETDATE()') // Sử dụng GETDATE() của SQL Server
    },
    TrangThai: {  // Tên cột trong DB là "TrangThai"
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      field: 'TrangThai'
    },
    TongSoDanhGia: {  // Tên cột trong DB là "TongSoDanhGia"
      type: Sequelize.INTEGER,
      defaultValue: 0,
      field: 'TongSoDanhGia'
    },
    DiemTrungBinh: {  // Tên cột trong DB là "DiemTrungBinh"
      type: Sequelize.DECIMAL(3, 2),
      defaultValue: 0.00,
      field: 'DiemTrungBinh'
    }
  }, {
    tableName: 'SanPham',
    timestamps: false, // Tắt createdAt, updatedAt tự động
    hooks: {
      // Hook để loại bỏ NgayTao khỏi INSERT nếu không được set explicitly
      beforeCreate: (instance, options) => {
        // Nếu NgayTao không được set, xóa nó để SQL Server dùng DEFAULT
        if (!instance.changed('NgayTao')) {
          delete instance.dataValues.NgayTao;
        }
      }
    }
  });

  return SanPham;
};