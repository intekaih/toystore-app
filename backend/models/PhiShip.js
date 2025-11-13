const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PhiShip = sequelize.define('PhiShip', {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Ten: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Tên quy tắc phí ship'
    },
    TinhThanh: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Tỉnh/Thành phố (NULL = áp dụng chung)'
    },
    KhoangCachMin: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
      comment: 'Khoảng cách tối thiểu (km)'
    },
    KhoangCachMax: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
      comment: 'Khoảng cách tối đa (km)'
    },
    GiaTriDonHangMin: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 0,
      comment: 'Giá trị đơn hàng tối thiểu'
    },
    GiaTriDonHangMax: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
      comment: 'Giá trị đơn hàng tối đa'
    },
    PhiShip: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      comment: 'Phí ship'
    },
    MienPhiShipTu: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
      comment: 'Miễn phí ship từ giá trị đơn hàng này trở lên'
    },
    MoTa: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ThuTu: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Thứ tự ưu tiên (số nhỏ ưu tiên cao hơn)'
    },
    Enable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    NgayTao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    NgayCapNhat: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'PhiShip',
    timestamps: false,
    indexes: [
      { fields: ['TinhThanh'] },
      { fields: ['Enable'] },
      { fields: ['ThuTu'] }
    ]
  });

  // ✅ PHƯƠNG THỨC TÍNH PHÍ SHIP
  PhiShip.calculateShippingFee = async function(tinhThanh, giaTriDonHang) {
    // Tìm phí ship phù hợp (ưu tiên theo ThuTu, sau đó theo TinhThanh cụ thể)
    const phiShipRule = await this.findOne({
      where: {
        Enable: true,
        [sequelize.Sequelize.Op.and]: [
          sequelize.Sequelize.literal(`(TinhThanh = N'${tinhThanh}' OR TinhThanh IS NULL)`),
          sequelize.Sequelize.literal(`(${giaTriDonHang} >= GiaTriDonHangMin)`),
          sequelize.Sequelize.literal(`(${giaTriDonHang} < ISNULL(GiaTriDonHangMax, 999999999) OR GiaTriDonHangMax IS NULL)`)
        ]
      },
      order: [
        [sequelize.Sequelize.literal(`CASE WHEN TinhThanh = N'${tinhThanh}' THEN 0 ELSE 1 END`), 'ASC'],
        ['ThuTu', 'ASC']
      ]
    });

    if (!phiShipRule) {
      return 30000; // Phí ship mặc định
    }

    // Kiểm tra miễn phí ship
    if (phiShipRule.MienPhiShipTu !== null && giaTriDonHang >= parseFloat(phiShipRule.MienPhiShipTu)) {
      return 0;
    }

    return parseFloat(phiShipRule.PhiShip);
  };

  return PhiShip;
};
