const { DataTypes } = require('sequelize');

/**
 * Model DiaChiGiaoHangUser - Quản lý địa chỉ giao hàng của người dùng
 * Hỗ trợ lưu nhiều địa chỉ, tích hợp với GHN API
 */
module.exports = (sequelize, Sequelize) => {
    const DiaChiGiaoHangUser = sequelize.define('DiaChiGiaoHangUser', {
        ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'ID'
        },
        TaiKhoanID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'TaiKhoanID',
            comment: 'ID tài khoản người dùng'
        },
        TenNguoiNhan: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'TenNguoiNhan',
            comment: 'Tên người nhận hàng'
        },
        SoDienThoai: {
            type: DataTypes.STRING(20),
            allowNull: false,
            field: 'SoDienThoai',
            comment: 'Số điện thoại người nhận'
        },
        // GHN API - Mã số
        MaTinhID: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'MaTinhID',
            comment: 'Mã tỉnh/thành phố từ GHN API'
        },
        TenTinh: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'TenTinh',
            comment: 'Tên tỉnh/thành phố (để hiển thị)'
        },
        MaQuanID: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'MaQuanID',
            comment: 'Mã quận/huyện từ GHN API'
        },
        TenQuan: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'TenQuan',
            comment: 'Tên quận/huyện (để hiển thị)'
        },
        MaPhuongXa: {
            type: DataTypes.STRING(20),
            allowNull: true,
            field: 'MaPhuongXa',
            comment: 'Mã phường/xã từ GHN API'
        },
        TenPhuong: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'TenPhuong',
            comment: 'Tên phường/xã (để hiển thị)'
        },
        DiaChiChiTiet: {
            type: DataTypes.STRING(500),
            allowNull: false,
            field: 'DiaChiChiTiet',
            comment: 'Địa chỉ chi tiết (số nhà, tên đường...)'
        },
        LaMacDinh: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'LaMacDinh',
            comment: 'Địa chỉ mặc định để giao hàng'
        },
        TrangThai: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'TrangThai',
            comment: 'Trạng thái hoạt động (1: Active, 0: Deleted)'
        }
    }, {
        tableName: 'DiaChiGiaoHangUser',
        timestamps: false,
        indexes: [
            {
                name: 'IX_DiaChiUser_TaiKhoanID',
                fields: ['TaiKhoanID', 'TrangThai']
            },
            {
                name: 'IX_DiaChiUser_LaMacDinh',
                fields: ['TaiKhoanID', 'LaMacDinh'],
                where: { TrangThai: 1 }
            }
        ]
    });

    /**
     * Instance Methods
     */
    DiaChiGiaoHangUser.prototype.getDiaChiDayDu = function() {
        const parts = [];
        if (this.DiaChiChiTiet) parts.push(this.DiaChiChiTiet);
        if (this.TenPhuong) parts.push(this.TenPhuong);
        if (this.TenQuan) parts.push(this.TenQuan);
        if (this.TenTinh) parts.push(this.TenTinh);
        return parts.join(', ');
    };

    /**
     * Class Methods
     */
    DiaChiGiaoHangUser.getDiaChiMacDinh = async function(taiKhoanID) {
        return await this.findOne({
            where: { 
                TaiKhoanID: taiKhoanID,
                LaMacDinh: true,
                TrangThai: true
            }
        });
    };

    DiaChiGiaoHangUser.getAllDiaChiCuaUser = async function(taiKhoanID) {
        return await this.findAll({
            where: { 
                TaiKhoanID: taiKhoanID,
                TrangThai: true
            },
            order: [
                ['LaMacDinh', 'DESC'],
                ['ID', 'DESC']
            ]
        });
    };

    return DiaChiGiaoHangUser;
};
