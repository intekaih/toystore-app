const db = require('../models');
const HoaDon = db.HoaDon;
const ChiTietHoaDon = db.ChiTietHoaDon;
const KhachHang = db.KhachHang;
const SanPham = db.SanPham;
const { Op } = require('sequelize');

/**
 * GET /api/admin/statistics
 * Thống kê đơn hàng tổng quan (Admin only)
 */
exports.getStatistics = async (req, res) => {
  try {
    console.log('📊 Admin - Lấy thống kê đơn hàng');
    console.log('📝 Query params:', req.query);

    // Lấy query parameters để lọc thời gian (optional)
    const { startDate, endDate, year } = req.query;

    // Tạo điều kiện lọc cơ bản
    const whereCondition = {
      Enable: true
    };

    // Thêm điều kiện lọc theo khoảng thời gian nếu có
    if (startDate && endDate) {
      whereCondition.NgayLap = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
      console.log(`📅 Lọc từ ${startDate} đến ${endDate}`);
    } else if (year) {
      // Lọc theo năm
      const yearInt = parseInt(year);
      if (yearInt && yearInt > 2000 && yearInt < 2100) {
        whereCondition.NgayLap = {
          [Op.between]: [
            new Date(`${yearInt}-01-01`),
            new Date(`${yearInt}-12-31 23:59:59`)
          ]
        };
        console.log(`📅 Lọc theo năm ${yearInt}`);
      }
    }

    // 1. Tính tổng doanh thu và số đơn hàng
    const totalStats = await HoaDon.findOne({
      where: whereCondition,
      attributes: [
        [db.sequelize.fn('SUM', db.sequelize.col('TongTien')), 'tongDoanhThu'],
        [db.sequelize.fn('COUNT', db.sequelize.col('ID')), 'soDonHang']
      ],
      raw: true
    });

    // 2. Thống kê theo trạng thái đơn hàng
    const statusStats = await HoaDon.findAll({
      where: whereCondition,
      attributes: [
        'TrangThai',
        [db.sequelize.fn('COUNT', db.sequelize.col('ID')), 'soLuong'],
        [db.sequelize.fn('SUM', db.sequelize.col('TongTien')), 'tongTien']
      ],
      group: ['TrangThai'],
      raw: true
    });

    // 3. Thống kê theo tháng
    // SQL Server sử dụng FORMAT hoặc DATEPART để lấy tháng
    const monthlyStats = await db.sequelize.query(`
      SELECT 
        FORMAT(NgayLap, 'yyyy-MM') as thang,
        COUNT(*) as soDonHang,
        SUM(TongTien) as doanhThu
      FROM HoaDon
      WHERE Enable = 1
        ${startDate && endDate ? `AND NgayLap BETWEEN '${startDate}' AND '${endDate}'` : ''}
        ${year && !startDate ? `AND YEAR(NgayLap) = ${parseInt(year)}` : ''}
      GROUP BY FORMAT(NgayLap, 'yyyy-MM')
      ORDER BY FORMAT(NgayLap, 'yyyy-MM') DESC
    `, {
      type: db.sequelize.QueryTypes.SELECT
    });

    // 4. Top 5 khách hàng mua nhiều nhất
    const topCustomers = await HoaDon.findAll({
      where: whereCondition,
      attributes: [
        'KhachHangID',
        [db.sequelize.fn('COUNT', db.sequelize.col('HoaDon.ID')), 'soDonHang'],
        [db.sequelize.fn('SUM', db.sequelize.col('HoaDon.TongTien')), 'tongChiTieu']
      ],
      include: [{
        model: KhachHang,
        as: 'khachHang',
        attributes: ['ID', 'HoTen', 'Email', 'DienThoai']
      }],
      group: ['HoaDon.KhachHangID', 'khachHang.ID', 'khachHang.HoTen', 'khachHang.Email', 'khachHang.DienThoai'],
      order: [[db.sequelize.literal('tongChiTieu'), 'DESC']],
      limit: 5,
      subQuery: false
    });

    // 5. Top 5 sản phẩm bán chạy nhất
    const topProducts = await ChiTietHoaDon.findAll({
      attributes: [
        'SanPhamID',
        [db.sequelize.fn('SUM', db.sequelize.col('SoLuong')), 'tongSoLuongBan'],
        [db.sequelize.fn('SUM', db.sequelize.col('ThanhTien')), 'tongDoanhThu'],
        [db.sequelize.fn('COUNT', db.sequelize.col('ChiTietHoaDon.ID')), 'soLanMua']
      ],
      include: [
        {
          model: SanPham,
          as: 'sanPham',
          attributes: ['ID', 'Ten', 'HinhAnhURL', 'GiaBan', 'Ton']
        },
        {
          model: HoaDon,
          as: 'hoaDon',
          attributes: [],
          where: whereCondition
        }
      ],
      where: {
        Enable: true
      },
      group: ['ChiTietHoaDon.SanPhamID', 'sanPham.ID', 'sanPham.Ten', 'sanPham.HinhAnhURL', 'sanPham.GiaBan', 'sanPham.Ton'],
      order: [[db.sequelize.literal('tongSoLuongBan'), 'DESC']],
      limit: 5,
      subQuery: false
    });

    // 6. Thống kê số đơn hàng theo ngày trong 7 ngày gần nhất
    const last7DaysStats = await db.sequelize.query(`
      SELECT 
        CAST(NgayLap AS DATE) as ngay,
        COUNT(*) as soDonHang,
        SUM(TongTien) as doanhThu
      FROM HoaDon
      WHERE Enable = 1
        AND NgayLap >= DATEADD(day, -7, GETDATE())
      GROUP BY CAST(NgayLap AS DATE)
      ORDER BY CAST(NgayLap AS DATE) DESC
    `, {
      type: db.sequelize.QueryTypes.SELECT
    });

    // Format dữ liệu trả về
    const statistics = {
      // Tổng quan
      tongDoanhThu: parseFloat(totalStats.tongDoanhThu || 0),
      soDonHang: parseInt(totalStats.soDonHang || 0),
      doanhThuTrungBinh: totalStats.soDonHang > 0 
        ? parseFloat(totalStats.tongDoanhThu) / parseInt(totalStats.soDonHang) 
        : 0,

      // Thống kê theo trạng thái
      theoTrangThai: statusStats.map(stat => ({
        trangThai: stat.TrangThai,
        soLuong: parseInt(stat.soLuong),
        tongTien: parseFloat(stat.tongTien || 0)
      })),

      // Thống kê theo tháng
      theoThang: monthlyStats.map(stat => ({
        thang: stat.thang,
        soDonHang: parseInt(stat.soDonHang),
        doanhThu: parseFloat(stat.doanhThu || 0)
      })),

      // Top khách hàng
      topKhachHang: topCustomers.map(item => ({
        khachHangId: item.KhachHangID,
        hoTen: item.khachHang?.HoTen,
        email: item.khachHang?.Email,
        dienThoai: item.khachHang?.DienThoai,
        soDonHang: parseInt(item.dataValues.soDonHang),
        tongChiTieu: parseFloat(item.dataValues.tongChiTieu || 0)
      })),

      // Top sản phẩm
      topSanPham: topProducts.map(item => ({
        sanPhamId: item.SanPhamID,
        tenSanPham: item.sanPham?.Ten,
        hinhAnh: item.sanPham?.HinhAnhURL,
        giaBan: parseFloat(item.sanPham?.GiaBan || 0),
        tonKho: item.sanPham?.Ton,
        tongSoLuongBan: parseInt(item.dataValues.tongSoLuongBan),
        tongDoanhThu: parseFloat(item.dataValues.tongDoanhThu || 0),
        soLanMua: parseInt(item.dataValues.soLanMua)
      })),

      // Thống kê 7 ngày gần nhất
      bays7NgayGanNhat: last7DaysStats.map(stat => ({
        ngay: stat.ngay,
        soDonHang: parseInt(stat.soDonHang),
        doanhThu: parseFloat(stat.doanhThu || 0)
      }))
    };

    console.log('✅ Lấy thống kê thành công');
    console.log(`💰 Tổng doanh thu: ${statistics.tongDoanhThu.toLocaleString('vi-VN')} VNĐ`);
    console.log(`📦 Tổng số đơn: ${statistics.soDonHang}`);

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê đơn hàng thành công',
      data: {
        statistics,
        filter: {
          startDate: startDate || null,
          endDate: endDate || null,
          year: year || null
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy thống kê đơn hàng:', error);

    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({
        success: false,
        message: 'Lỗi cơ sở dữ liệu',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Database Error'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * GET /api/admin/statistics/revenue
 * Thống kê doanh thu chi tiết theo khoảng thời gian
 */
exports.getRevenueStatistics = async (req, res) => {
  try {
    console.log('💰 Admin - Lấy thống kê doanh thu chi tiết');

    const { startDate, endDate, groupBy = 'month' } = req.query;

    // Validate groupBy
    const validGroupBy = ['day', 'week', 'month', 'year'];
    if (!validGroupBy.includes(groupBy)) {
      return res.status(400).json({
        success: false,
        message: `groupBy phải là một trong: ${validGroupBy.join(', ')}`
      });
    }

    // Tạo điều kiện lọc
    const whereCondition = { Enable: true };
    
    if (startDate && endDate) {
      whereCondition.NgayLap = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Tạo câu query dựa trên groupBy
    let groupFormat;
    switch (groupBy) {
      case 'day':
        groupFormat = 'yyyy-MM-dd';
        break;
      case 'week':
        groupFormat = 'yyyy-ww'; // ISO week
        break;
      case 'month':
        groupFormat = 'yyyy-MM';
        break;
      case 'year':
        groupFormat = 'yyyy';
        break;
    }

    const revenueStats = await db.sequelize.query(`
      SELECT 
        FORMAT(NgayLap, '${groupFormat}') as period,
        COUNT(*) as soDonHang,
        SUM(TongTien) as doanhThu,
        AVG(TongTien) as doanhThuTrungBinh,
        MIN(TongTien) as donHangThapNhat,
        MAX(TongTien) as donHangCaoNhat
      FROM HoaDon
      WHERE Enable = 1
        ${startDate && endDate ? `AND NgayLap BETWEEN '${startDate}' AND '${endDate}'` : ''}
      GROUP BY FORMAT(NgayLap, '${groupFormat}')
      ORDER BY FORMAT(NgayLap, '${groupFormat}') DESC
    `, {
      type: db.sequelize.QueryTypes.SELECT
    });

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê doanh thu thành công',
      data: {
        groupBy: groupBy,
        statistics: revenueStats.map(stat => ({
          period: stat.period,
          soDonHang: parseInt(stat.soDonHang),
          doanhThu: parseFloat(stat.doanhThu || 0),
          doanhThuTrungBinh: parseFloat(stat.doanhThuTrungBinh || 0),
          donHangThapNhat: parseFloat(stat.donHangThapNhat || 0),
          donHangCaoNhat: parseFloat(stat.donHangCaoNhat || 0)
        })),
        filter: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy thống kê doanh thu:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * GET /api/admin/statistics/products
 * Thống kê sản phẩm chi tiết
 */
exports.getProductStatistics = async (req, res) => {
  try {
    console.log('📦 Admin - Lấy thống kê sản phẩm');

    const { startDate, endDate } = req.query;

    // Tạo điều kiện lọc cho hóa đơn
    const hoaDonCondition = { Enable: true };
    
    if (startDate && endDate) {
      hoaDonCondition.NgayLap = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Thống kê sản phẩm
    const productStats = await ChiTietHoaDon.findAll({
      attributes: [
        'SanPhamID',
        [db.sequelize.fn('SUM', db.sequelize.col('SoLuong')), 'tongSoLuongBan'],
        [db.sequelize.fn('SUM', db.sequelize.col('ThanhTien')), 'tongDoanhThu'],
        [db.sequelize.fn('COUNT', db.sequelize.literal('DISTINCT HoaDonID')), 'soLanMua'],
        [db.sequelize.fn('AVG', db.sequelize.col('SoLuong')), 'soLuongTrungBinh']
      ],
      include: [
        {
          model: SanPham,
          as: 'sanPham',
          attributes: ['ID', 'Ten', 'HinhAnhURL', 'GiaBan', 'Ton', 'LoaiID']
        },
        {
          model: HoaDon,
          as: 'hoaDon',
          attributes: [],
          where: hoaDonCondition
        }
      ],
      where: {
        Enable: true
      },
      group: ['ChiTietHoaDon.SanPhamID', 'sanPham.ID', 'sanPham.Ten', 'sanPham.HinhAnhURL', 'sanPham.GiaBan', 'sanPham.Ton', 'sanPham.LoaiID'],
      order: [[db.sequelize.literal('tongDoanhThu'), 'DESC']],
      subQuery: false
    });

    // Tổng hợp thống kê
    let tongSoLuongBan = 0;
    let tongDoanhThu = 0;

    const products = productStats.map(item => {
      const soLuongBan = parseInt(item.dataValues.tongSoLuongBan);
      const doanhThu = parseFloat(item.dataValues.tongDoanhThu || 0);
      
      tongSoLuongBan += soLuongBan;
      tongDoanhThu += doanhThu;

      return {
        sanPhamId: item.SanPhamID,
        tenSanPham: item.sanPham?.Ten,
        hinhAnh: item.sanPham?.HinhAnhURL,
        giaBan: parseFloat(item.sanPham?.GiaBan || 0),
        tonKho: item.sanPham?.Ton,
        loaiId: item.sanPham?.LoaiID,
        tongSoLuongBan: soLuongBan,
        tongDoanhThu: doanhThu,
        soLanMua: parseInt(item.dataValues.soLanMua),
        soLuongTrungBinh: parseFloat(item.dataValues.soLuongTrungBinh || 0)
      };
    });

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê sản phẩm thành công',
      data: {
        summary: {
          tongSoSanPham: products.length,
          tongSoLuongBan: tongSoLuongBan,
          tongDoanhThu: tongDoanhThu
        },
        products: products,
        filter: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy thống kê sản phẩm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};
