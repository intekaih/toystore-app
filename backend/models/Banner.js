const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Banner = sequelize.define('Banner', {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    HinhAnhUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'URL hình ảnh banner (có thể là URL hoặc base64 string)'
    },
    Link: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: '/products',
      comment: 'Link điều hướng khi click vào banner'
    },
    ThuTu: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Thứ tự hiển thị (số nhỏ hơn hiển thị trước)'
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Trạng thái: true = đang hiển thị, false = đã ẩn'
    },
    NgayTao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Ngày tạo banner'
    },
    NgayCapNhat: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Ngày cập nhật banner'
    }
  }, {
    tableName: 'Banner',
    timestamps: false,
    indexes: [
      { fields: ['IsActive'] },
      { fields: ['ThuTu'] },
      { fields: ['IsActive', 'ThuTu'] }
    ]
  });

  return Banner;
};

