module.exports = (sequelize, Sequelize) => {
    const TaiKhoan = sequelize.define("TaiKhoan", {
      ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      TenDangNhap: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: {
          name: 'unique_tendangnhap',
          msg: 'Tên đăng nhập đã tồn tại'
        }
      },
      MatKhau: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      HoTen: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      Email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: {
          name: 'unique_email',
          msg: 'Email đã tồn tại'
        },
        validate: {
          isEmail: {
            msg: 'Định dạng email không hợp lệ'
          }
        }
      },
      DienThoai: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      VaiTro: {
        type: Sequelize.STRING(20),
        defaultValue: 'KhachHang'  // Changed from 'user' to 'KhachHang'
      },
      NgayTao: {
        type: Sequelize.DATE,
        allowNull: true
      },
      TrangThai: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: 'TrangThai'
      }
    }, {
      tableName: 'TaiKhoan',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['TenDangNhap']
        },
        {
          unique: true,
          fields: ['Email'],
          where: {
            Email: {
              [sequelize.Sequelize.Op.ne]: null
            }
          }
        }
      ]
    });
  
    return TaiKhoan;
  };