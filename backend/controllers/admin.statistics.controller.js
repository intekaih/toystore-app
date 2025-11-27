const db = require('../models');
const HoaDon = db.HoaDon;
const ChiTietHoaDon = db.ChiTietHoaDon;
const KhachHang = db.KhachHang;
const SanPham = db.SanPham;
const TaiKhoan = db.TaiKhoan;
const LoaiSP = db.LoaiSP;
const DanhGiaSanPham = db.DanhGiaSanPham;
const { Op } = require('sequelize');
const DTOMapper = require('../utils/DTOMapper');

/**
 * GET /api/admin/statistics/dashboard
 * Lấy thống kê tổng quan cho dashboard (Admin only)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Admin - Lấy thống kê dashboard');

    // 1. Tổng số sản phẩm - ✅ SỬA: Enable → TrangThai
    const tongSanPham = await SanPham.count({
      where: { TrangThai: true }
    });

    // 2. Đơn hàng mới (đơn có trạng thái "Chờ xử lý") - ✅ BỎ: Enable
    const donHangMoi = await HoaDon.count({
      where: { 
        TrangThai: 'Chờ xử lý'
      }
    });

    // 3. Tổng số người dùng - ✅ SỬA: Enable → TrangThai
    const nguoiDung = await TaiKhoan.count({
      where: { TrangThai: true }
    });

    // ✅ 4. Tổng số danh mục - SỬA: Enable → TrangThai
    const tongDanhMuc = await LoaiSP.count({
      where: { TrangThai: true }
    });

    // ✨ 5. Tổng doanh thu tháng hiện tại - BỎ Enable, TÍNH TẤT CẢ ĐƠN (TRỪ ĐÃ HỦY)
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01 00:00:00`;
    const lastDay = new Date(currentYear, currentMonth, 0).getDate();
    const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')} 23:59:59`;

    const doanhThuResult = await db.sequelize.query(`
      SELECT ISNULL(SUM(ThanhTien), 0) AS tongDoanhThu
      FROM HoaDon
      WHERE TrangThai != N'Đã hủy'
        AND CAST(NgayLap AS DATE) BETWEEN CAST(:startDate AS DATE) AND CAST(:endDate AS DATE)
    `, {
      replacements: { startDate, endDate },
      type: db.sequelize.QueryTypes.SELECT
    });

    const doanhThu = doanhThuResult?.[0]?.tongDoanhThu || 0;

    console.log('✅ Dashboard stats:', {
      tongSanPham,
      donHangMoi,
      nguoiDung,
      tongDanhMuc,
      doanhThu
    });

    // ✅ SỬ DỤNG DTOMapper - dù data đơn giản nhưng vẫn consistent
    const statsDTO = DTOMapper.toCamelCase({
      TongSanPham: parseInt(tongSanPham),
      DonHangMoi: parseInt(donHangMoi),
      NguoiDung: parseInt(nguoiDung),
      TongDanhMuc: parseInt(tongDanhMuc),
      DoanhThu: parseFloat(doanhThu)
    });

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê dashboard thành công',
      data: statsDTO
    });

  } catch (error) {
    console.error('❌ Lỗi lấy thống kê dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * GET /api/admin/statistics
 * Thống kê đơn hàng tổng quan (Admin only)
 */
exports.getStatistics = async (req, res) => {
  try {
    console.log('📊 Admin - Lấy thống kê đơn hàng');
    console.log('📝 Query params:', req.query);

    // Lấy query parameters để lọc thời gian (optional)
    const { startDate, endDate, year, viewMode = 'month' } = req.query;

    // Tạo điều kiện lọc cơ bản - ✨ TÍNH TẤT CẢ ĐƠN (TRỪ ĐÃ HỦY)
    const whereCondition = {
      TrangThai: { [Op.ne]: 'Đã hủy' } // ✅ Loại trừ đơn đã hủy
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
    
    console.log('📋 Where condition:', JSON.stringify(whereCondition, null, 2));

    // ✨ 1. Tính tổng doanh thu và số đơn hàng - TÍNH TẤT CẢ ĐƠN (TRỪ ĐÃ HỦY)
    let totalStats = { tongDoanhThu: 0, soDonHang: 0 };
    try {
      let whereClause = "WHERE TrangThai != N'Đã hủy'"; // ✅ Loại trừ đơn đã hủy
      const params = {};
      
      if (startDate && endDate) {
        whereClause += ' AND CAST(NgayLap AS DATE) BETWEEN CAST(:startDate AS DATE) AND CAST(:endDate AS DATE)';
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const result = await db.sequelize.query(`
        SELECT 
          ISNULL(SUM(ThanhTien), 0) AS tongDoanhThu,
          COUNT(ID) AS soDonHang
        FROM HoaDon
        ${whereClause}
      `, {
        replacements: params,
        type: db.sequelize.QueryTypes.SELECT
      });
      
      if (result && result.length > 0 && result[0]) {
        totalStats = {
          tongDoanhThu: result[0].tongDoanhThu || 0,
          soDonHang: result[0].soDonHang || 0
        };
      }
    } catch (error) {
      console.error('⚠️ Lỗi query totalStats:', error.message);
    }

    // 2. Thống kê theo trạng thái đơn hàng - SỬA: Dùng CAST AS DATE
    let statusStats = [];
    try {
      let whereClause = '';
      const params = {};
      
      if (startDate && endDate) {
        whereClause += ' AND CAST(NgayLap AS DATE) BETWEEN CAST(:startDate AS DATE) AND CAST(:endDate AS DATE)';
        params.startDate = startDate;
        params.endDate = endDate;
      }

      statusStats = await db.sequelize.query(`
        SELECT 
          TrangThai,
          COUNT(ID) AS soLuong,
          ISNULL(SUM(ThanhTien), 0) AS tongTien
        FROM HoaDon
        WHERE 1=1
        ${whereClause}
        GROUP BY TrangThai
      `, {
        replacements: params,
        type: db.sequelize.QueryTypes.SELECT
      });
    } catch (error) {
      console.error('⚠️ Lỗi query statusStats:', error.message);
      statusStats = [];
    }

    // ✨ 3. Thống kê theo tháng - TÍNH TẤT CẢ ĐƠN (TRỪ ĐÃ HỦY)
    let monthlyStats = [];
    try {
      let whereClause = "WHERE TrangThai != N'Đã hủy'"; // ✅ Loại trừ đơn đã hủy
      const params = {};
      
      if (startDate && endDate) {
        whereClause += ' AND CAST(NgayLap AS DATE) BETWEEN CAST(:startDate AS DATE) AND CAST(:endDate AS DATE)';
        params.startDate = startDate;
        params.endDate = endDate;
      } else if (year && !startDate) {
        whereClause += ' AND YEAR(NgayLap) = :year';
        params.year = parseInt(year);
      }

      monthlyStats = await db.sequelize.query(`
        SELECT 
          FORMAT(NgayLap, 'yyyy-MM') as thang,
          COUNT(*) as soDonHang,
          ISNULL(SUM(ThanhTien), 0) as doanhThu
        FROM HoaDon
        ${whereClause}
        GROUP BY FORMAT(NgayLap, 'yyyy-MM')
        ORDER BY FORMAT(NgayLap, 'yyyy-MM') DESC
      `, {
        replacements: params,
        type: db.sequelize.QueryTypes.SELECT
      });
    } catch (error) {
      console.error('⚠️ Lỗi query monthlyStats:', error.message);
      monthlyStats = [];
    }

    // 4. Top 5 khách hàng mua nhiều nhất - SỬ DỤNG RAW QUERY để đảm bảo chính xác
    let topCustomers = [];
    try {
      const params = {};
      let whereClause = "WHERE hd.TrangThai != N'Đã hủy'";
      
      // Thêm điều kiện thời gian nếu có
      if (startDate && endDate) {
        whereClause += ' AND CAST(hd.NgayLap AS DATE) BETWEEN CAST(:startDate AS DATE) AND CAST(:endDate AS DATE)';
        params.startDate = startDate;
        params.endDate = endDate;
      } else if (year && !startDate) {
        whereClause += ' AND YEAR(hd.NgayLap) = :year';
        params.year = parseInt(year);
      }
      
      // Sử dụng raw query để đảm bảo tính chính xác
      const customerResults = await db.sequelize.query(`
        SELECT TOP 5
          hd.KhachHangID as KhachHangID,
          kh.ID as KhachHang_ID,
          kh.HoTen as HoTen,
          kh.Email as Email,
          kh.DienThoai as DienThoai,
          COUNT(hd.ID) as soDonHang,
          ISNULL(SUM(hd.ThanhTien), 0) as tongChiTieu
        FROM HoaDon hd
        INNER JOIN KhachHang kh ON hd.KhachHangID = kh.ID
        ${whereClause}
        GROUP BY hd.KhachHangID, kh.ID, kh.HoTen, kh.Email, kh.DienThoai
        ORDER BY tongChiTieu DESC
      `, {
        replacements: params,
        type: db.sequelize.QueryTypes.SELECT
      });
      
      // Map kết quả về format giống như Sequelize
      topCustomers = customerResults.map(row => ({
        KhachHangID: row.KhachHangID,
        dataValues: {
          soDonHang: parseInt(row.soDonHang || 0),
          tongChiTieu: parseFloat(row.tongChiTieu || 0)
        },
        khachHang: {
          ID: row.KhachHang_ID,
          HoTen: row.HoTen,
          Email: row.Email,
          DienThoai: row.DienThoai
        }
      }));
      
      console.log(`✅ Top customers found: ${topCustomers.length}`);
      if (topCustomers.length > 0) {
        console.log('👥 Sample customer:', {
          id: topCustomers[0].KhachHangID,
          name: topCustomers[0].khachHang?.HoTen,
          orders: topCustomers[0].dataValues.soDonHang,
          total: topCustomers[0].dataValues.tongChiTieu
        });
      }
    } catch (error) {
      console.error('⚠️ Lỗi query topCustomers:', error.message);
      console.error('Stack:', error.stack);
      topCustomers = [];
    }

    // 5. Top 5 sản phẩm bán chạy nhất - SỬ DỤNG RAW QUERY để đảm bảo chính xác
    let topProducts = [];
    try {
      const params = {};
      let whereClause = "WHERE hd.TrangThai != N'Đã hủy'";
      
      // Thêm điều kiện thời gian nếu có
      if (startDate && endDate) {
        whereClause += ' AND CAST(hd.NgayLap AS DATE) BETWEEN CAST(:startDate AS DATE) AND CAST(:endDate AS DATE)';
        params.startDate = startDate;
        params.endDate = endDate;
      } else if (year && !startDate) {
        whereClause += ' AND YEAR(hd.NgayLap) = :year';
        params.year = parseInt(year);
      }
      
      // Sử dụng raw query để đảm bảo tính chính xác, bao gồm đánh giá và danh mục
      const productResults = await db.sequelize.query(`
        SELECT TOP 5
          cthd.SanPhamID as SanPhamID,
          sp.ID as SanPham_ID,
          sp.Ten as TenSanPham,
          sp.HinhAnhURL as HinhAnh,
          sp.GiaBan as GiaBan,
          sp.SoLuongTon as SoLuongTon,
          sp.DiemTrungBinh as DiemTrungBinh,
          sp.TongSoDanhGia as TongSoDanhGia,
          sp.LoaiID as LoaiID,
          ls.Ten as TenLoai,
          SUM(cthd.SoLuong) as tongSoLuongBan,
          ISNULL(SUM(cthd.ThanhTien), 0) as tongDoanhThu,
          COUNT(DISTINCT cthd.HoaDonID) as soLanMua
        FROM ChiTietHoaDon cthd
        INNER JOIN HoaDon hd ON cthd.HoaDonID = hd.ID
        INNER JOIN SanPham sp ON cthd.SanPhamID = sp.ID
        LEFT JOIN LoaiSP ls ON sp.LoaiID = ls.ID
        ${whereClause}
        GROUP BY cthd.SanPhamID, sp.ID, sp.Ten, sp.HinhAnhURL, sp.GiaBan, sp.SoLuongTon, 
                 sp.DiemTrungBinh, sp.TongSoDanhGia, sp.LoaiID, ls.Ten
        ORDER BY tongSoLuongBan DESC
      `, {
        replacements: params,
        type: db.sequelize.QueryTypes.SELECT
      });
      
      // Map kết quả về format giống như Sequelize
      topProducts = productResults.map(row => ({
        SanPhamID: row.SanPhamID,
        dataValues: {
          tongSoLuongBan: parseInt(row.tongSoLuongBan || 0),
          tongDoanhThu: parseFloat(row.tongDoanhThu || 0),
          soLanMua: parseInt(row.soLanMua || 0)
        },
        sanPham: {
          ID: row.SanPham_ID,
          Ten: row.TenSanPham,
          HinhAnhURL: row.HinhAnh,
          GiaBan: parseFloat(row.GiaBan || 0),
          SoLuongTon: parseInt(row.SoLuongTon || 0),
          DiemTrungBinh: parseFloat(row.DiemTrungBinh || 0),
          TongSoDanhGia: parseInt(row.TongSoDanhGia || 0),
          LoaiID: row.LoaiID,
          loaiSP: row.TenLoai ? {
            Ten: row.TenLoai
          } : null
        }
      }));
      
      console.log(`✅ Top products found: ${topProducts.length}`);
      if (topProducts.length > 0) {
        console.log('📦 Sample product:', {
          id: topProducts[0].SanPhamID,
          name: topProducts[0].sanPham?.Ten,
          sold: topProducts[0].dataValues.tongSoLuongBan,
          revenue: topProducts[0].dataValues.tongDoanhThu
        });
      }
    } catch (error) {
      console.error('⚠️ Lỗi query topProducts:', error.message);
      console.error('Stack:', error.stack);
      topProducts = [];
    }

    // ✨ 6. Thống kê biểu đồ theo viewMode (day/month/year)
    let chartStats = [];
    try {
      const params = {};
      let whereClause = "WHERE TrangThai != N'Đã hủy'";
      let groupByClause = '';
      let orderByClause = '';
      
      if (startDate && endDate) {
        whereClause += ' AND CAST(NgayLap AS DATE) BETWEEN CAST(:startDate AS DATE) AND CAST(:endDate AS DATE)';
        params.startDate = startDate;
        params.endDate = endDate;
      }

      // Xác định group by dựa trên viewMode
      if (viewMode === 'day') {
        // Hiển thị theo giờ trong ngày
        chartStats = await db.sequelize.query(`
          SELECT 
            FORMAT(NgayLap, 'HH:00') as label,
            COUNT(*) as soDonHang,
            ISNULL(SUM(ThanhTien), 0) as doanhThu
          FROM HoaDon
          ${whereClause}
          GROUP BY FORMAT(NgayLap, 'HH:00')
          ORDER BY FORMAT(NgayLap, 'HH:00') ASC
        `, {
          replacements: params,
          type: db.sequelize.QueryTypes.SELECT
        });
      } else if (viewMode === 'month') {
        // Hiển thị theo ngày trong tháng (dd/MM)
        chartStats = await db.sequelize.query(`
          SELECT 
            FORMAT(CAST(NgayLap AS DATE), 'dd/MM') as label,
            CAST(NgayLap AS DATE) as date,
            COUNT(*) as soDonHang,
            ISNULL(SUM(ThanhTien), 0) as doanhThu
          FROM HoaDon
          ${whereClause}
          GROUP BY CAST(NgayLap AS DATE)
          ORDER BY CAST(NgayLap AS DATE) ASC
        `, {
          replacements: params,
          type: db.sequelize.QueryTypes.SELECT
        });
      } else if (viewMode === 'year') {
        // Hiển thị theo tháng trong năm (MM/yyyy)
        chartStats = await db.sequelize.query(`
          SELECT 
            FORMAT(NgayLap, 'MM/yyyy') as label,
            FORMAT(NgayLap, 'yyyy-MM') as month,
            COUNT(*) as soDonHang,
            ISNULL(SUM(ThanhTien), 0) as doanhThu
          FROM HoaDon
          ${whereClause}
          GROUP BY FORMAT(NgayLap, 'yyyy-MM'), FORMAT(NgayLap, 'MM/yyyy')
          ORDER BY FORMAT(NgayLap, 'yyyy-MM') ASC
        `, {
          replacements: params,
          type: db.sequelize.QueryTypes.SELECT
        });
      }
      
    } catch (error) {
      console.error('⚠️ Lỗi query chartStats:', error.message);
      chartStats = [];
    }

    // ✨ 7. Top 5 sản phẩm bán ế nhất (ít bán nhất)
    let worstProducts = [];
    try {
      worstProducts = await ChiTietHoaDon.findAll({
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
            attributes: ['ID', 'Ten', 'HinhAnhURL', 'GiaBan', 'SoLuongTon'],
            required: false
          },
          {
            model: HoaDon,
            as: 'hoaDon',
            attributes: [],
            where: whereCondition,
            required: true
          }
        ],
        group: ['ChiTietHoaDon.SanPhamID', 'sanPham.ID', 'sanPham.Ten', 'sanPham.HinhAnhURL', 'sanPham.GiaBan', 'sanPham.SoLuongTon'],
        order: [[db.sequelize.literal('tongSoLuongBan'), 'ASC']],
        limit: 5,
        subQuery: false
      });
    } catch (error) {
      console.error('⚠️ Lỗi query worstProducts:', error.message);
      worstProducts = [];
    }

    // ✨ 8. Sản phẩm có đánh giá xấu (số sao <= 3) với đánh giá chi tiết
    let badRatedProducts = [];
    try {
      const params = {};
      let dateFilter = '';
      
      if (startDate && endDate) {
        dateFilter = ' AND CAST(dg.NgayTao AS DATE) BETWEEN CAST(:startDate AS DATE) AND CAST(:endDate AS DATE)';
        params.startDate = startDate;
        params.endDate = endDate;
      }

      // Lấy danh sách sản phẩm có đánh giá xấu
      const badProductsList = await db.sequelize.query(`
        SELECT TOP 10
          sp.ID as SanPhamID,
          sp.Ten as TenSanPham,
          sp.HinhAnhURL as HinhAnh,
          sp.GiaBan,
          sp.SoLuongTon as TonKho,
          AVG(CAST(dg.SoSao AS FLOAT)) as diemTrungBinh,
          COUNT(dg.ID) as soLuongDanhGia,
          SUM(CASE WHEN dg.SoSao = 1 THEN 1 ELSE 0 END) as soDanhGia1Sao,
          SUM(CASE WHEN dg.SoSao = 2 THEN 1 ELSE 0 END) as soDanhGia2Sao,
          SUM(CASE WHEN dg.SoSao = 3 THEN 1 ELSE 0 END) as soDanhGia3Sao
        FROM DanhGiaSanPham dg
        INNER JOIN SanPham sp ON dg.SanPhamID = sp.ID
        WHERE dg.TrangThai = N'DaDuyet' AND dg.SoSao <= 3 ${dateFilter}
        GROUP BY sp.ID, sp.Ten, sp.HinhAnhURL, sp.GiaBan, sp.SoLuongTon
        HAVING AVG(CAST(dg.SoSao AS FLOAT)) <= 3.0
        ORDER BY diemTrungBinh ASC, soLuongDanhGia DESC
      `, {
        replacements: params,
        type: db.sequelize.QueryTypes.SELECT
      });

      // Lấy đánh giá chi tiết cho từng sản phẩm
      for (const product of badProductsList) {
        const reviews = await DanhGiaSanPham.findAll({
          where: {
            SanPhamID: product.SanPhamID,
            TrangThai: 'DaDuyet',
            SoSao: { [Op.lte]: 3 }
          },
          include: [{
            model: TaiKhoan,
            as: 'taiKhoan',
            attributes: ['ID', 'HoTen', 'Email'],
            required: false
          }],
          order: [['SoSao', 'ASC'], ['NgayTao', 'DESC']],
          limit: 10 // Lấy tối đa 10 đánh giá xấu nhất
        });

        badRatedProducts.push({
          ...product,
          danhGiaChiTiet: reviews.map(review => ({
            id: review.ID,
            soSao: review.SoSao,
            noiDung: review.NoiDung,
            hinhAnh: review.HinhAnh1,
            ngayTao: review.NgayTao,
            nguoiDanhGia: review.taiKhoan ? {
              hoTen: review.taiKhoan.HoTen,
              email: review.taiKhoan.Email
            } : null
          }))
        });
      }
    } catch (error) {
      console.error('⚠️ Lỗi query badRatedProducts:', error.message);
      badRatedProducts = [];
    }

    // ✨ 9. Tỷ lệ hủy đơn
    let cancelRate = 0;
    let totalOrders = 0;
    let canceledOrders = 0;
    try {
      const params = {};
      let whereClause = '';
      
      if (startDate && endDate) {
        whereClause = ' AND CAST(NgayLap AS DATE) BETWEEN CAST(:startDate AS DATE) AND CAST(:endDate AS DATE)';
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const cancelStats = await db.sequelize.query(`
        SELECT 
          COUNT(*) as tongSoDon,
          SUM(CASE WHEN TrangThai = N'Đã hủy' THEN 1 ELSE 0 END) as soDonHuy
        FROM HoaDon
        WHERE 1=1 ${whereClause}
      `, {
        replacements: params,
        type: db.sequelize.QueryTypes.SELECT
      });

      if (cancelStats && cancelStats.length > 0) {
        totalOrders = parseInt(cancelStats[0].tongSoDon || 0);
        canceledOrders = parseInt(cancelStats[0].soDonHuy || 0);
        cancelRate = totalOrders > 0 ? (canceledOrders / totalOrders) * 100 : 0;
      }
    } catch (error) {
      console.error('⚠️ Lỗi query cancelRate:', error.message);
    }

    // ✨ 10. Sản phẩm hết hàng (SoLuongTon = 0)
    let outOfStockProducts = [];
    try {
      outOfStockProducts = await SanPham.findAll({
        where: {
          SoLuongTon: 0,
          TrangThai: true
        },
        attributes: ['ID', 'Ten', 'HinhAnhURL', 'GiaBan', 'SoLuongTon'],
        limit: 10,
        order: [['Ten', 'ASC']]
      });
    } catch (error) {
      console.error('⚠️ Lỗi query outOfStockProducts:', error.message);
      outOfStockProducts = [];
    }

    // ✨ 12. Sản phẩm bán không chạy (số lượng bán thấp trong kỳ, < 10 sản phẩm)
    let slowSellingProducts = [];
    try {
      const params = {};
      let whereClause = "WHERE hd.TrangThai != N'Đã hủy'";
      
      if (startDate && endDate) {
        whereClause += ' AND CAST(hd.NgayLap AS DATE) BETWEEN CAST(:startDate AS DATE) AND CAST(:endDate AS DATE)';
        params.startDate = startDate;
        params.endDate = endDate;
      } else if (year && !startDate) {
        whereClause += ' AND YEAR(hd.NgayLap) = :year';
        params.year = parseInt(year);
      }

      const slowProductsResult = await db.sequelize.query(`
        SELECT 
          cthd.SanPhamID as SanPhamID,
          sp.ID as SanPham_ID,
          sp.Ten as TenSanPham,
          sp.HinhAnhURL as HinhAnh,
          sp.GiaBan as GiaBan,
          sp.SoLuongTon as SoLuongTon,
          SUM(cthd.SoLuong) as tongSoLuongBan,
          ISNULL(SUM(cthd.ThanhTien), 0) as tongDoanhThu,
          COUNT(DISTINCT cthd.HoaDonID) as soLanMua
        FROM ChiTietHoaDon cthd
        INNER JOIN HoaDon hd ON cthd.HoaDonID = hd.ID
        INNER JOIN SanPham sp ON cthd.SanPhamID = sp.ID
        ${whereClause}
        GROUP BY cthd.SanPhamID, sp.ID, sp.Ten, sp.HinhAnhURL, sp.GiaBan, sp.SoLuongTon
        HAVING SUM(cthd.SoLuong) < 10
        ORDER BY tongSoLuongBan ASC
      `, {
        replacements: params,
        type: db.sequelize.QueryTypes.SELECT
      });

      slowSellingProducts = slowProductsResult.map(row => ({
        SanPhamID: row.SanPhamID,
        TenSanPham: row.TenSanPham,
        HinhAnh: row.HinhAnh,
        GiaBan: parseFloat(row.GiaBan || 0),
        SoLuongTon: parseInt(row.SoLuongTon || 0),
        TongSoLuongBan: parseInt(row.tongSoLuongBan || 0),
        TongDoanhThu: parseFloat(row.tongDoanhThu || 0),
        SoLanMua: parseInt(row.soLanMua || 0)
      }));

      console.log(`✅ Slow selling products found: ${slowSellingProducts.length}`);
    } catch (error) {
      console.error('⚠️ Lỗi query slowSellingProducts:', error.message);
      slowSellingProducts = [];
    }

    // ✨ 13. Hàng sắp hết (0 < SoLuongTon <= 10)
    let lowStockProducts = [];
    try {
      lowStockProducts = await SanPham.findAll({
        where: {
          SoLuongTon: {
            [Op.gt]: 0,
            [Op.lte]: 10
          },
          TrangThai: true
        },
        attributes: ['ID', 'Ten', 'HinhAnhURL', 'GiaBan', 'SoLuongTon'],
        order: [['SoLuongTon', 'ASC'], ['Ten', 'ASC']],
        limit: 20
      });
      console.log(`✅ Low stock products found: ${lowStockProducts.length}`);
    } catch (error) {
      console.error('⚠️ Lỗi query lowStockProducts:', error.message);
      lowStockProducts = [];
    }

    // ✨ 11. Thống kê đánh giá tổng quan
    let reviewStats = {
      tongSoDanhGia: 0,
      diemTrungBinh: 0,
      phanBoSao: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
    try {
      const params = {};
      let whereClause = "WHERE TrangThai = N'DaDuyet'";
      
      if (startDate && endDate) {
        whereClause += ' AND CAST(NgayTao AS DATE) BETWEEN CAST(:startDate AS DATE) AND CAST(:endDate AS DATE)';
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const reviewStatsResult = await db.sequelize.query(`
        SELECT 
          COUNT(*) as tongSoDanhGia,
          AVG(CAST(SoSao AS FLOAT)) as diemTrungBinh,
          SUM(CASE WHEN SoSao = 1 THEN 1 ELSE 0 END) as sao1,
          SUM(CASE WHEN SoSao = 2 THEN 1 ELSE 0 END) as sao2,
          SUM(CASE WHEN SoSao = 3 THEN 1 ELSE 0 END) as sao3,
          SUM(CASE WHEN SoSao = 4 THEN 1 ELSE 0 END) as sao4,
          SUM(CASE WHEN SoSao = 5 THEN 1 ELSE 0 END) as sao5
        FROM DanhGiaSanPham
        ${whereClause}
      `, {
        replacements: params,
        type: db.sequelize.QueryTypes.SELECT
      });

      if (reviewStatsResult && reviewStatsResult.length > 0) {
        const stat = reviewStatsResult[0];
        reviewStats = {
          tongSoDanhGia: parseInt(stat.tongSoDanhGia || 0),
          diemTrungBinh: parseFloat(stat.diemTrungBinh || 0),
          phanBoSao: {
            1: parseInt(stat.sao1 || 0),
            2: parseInt(stat.sao2 || 0),
            3: parseInt(stat.sao3 || 0),
            4: parseInt(stat.sao4 || 0),
            5: parseInt(stat.sao5 || 0)
          }
        };
      }
    } catch (error) {
      console.error('⚠️ Lỗi query reviewStats:', error.message);
    }

    // ✅ Format dữ liệu với DTOMapper
    const statistics = {
      tongDoanhThu: parseFloat(totalStats?.tongDoanhThu || 0),
      soDonHang: parseInt(totalStats?.soDonHang || 0),
      doanhThuTrungBinh: (totalStats?.soDonHang && totalStats?.soDonHang > 0)
        ? parseFloat(totalStats.tongDoanhThu) / parseInt(totalStats.soDonHang) 
        : 0,

      theoTrangThai: statusStats.map(stat => 
        DTOMapper.toCamelCase({
          TrangThai: stat.TrangThai,
          SoLuong: parseInt(stat.soLuong),
          TongTien: parseFloat(stat.tongTien || 0)
        })
      ),

      theoThang: monthlyStats.map(stat => 
        DTOMapper.toCamelCase({
          Thang: stat.thang,
          SoDonHang: parseInt(stat.soDonHang),
          DoanhThu: parseFloat(stat.doanhThu || 0)
        })
      ),

      topKhachHang: topCustomers.map(item => {
        const mapped = DTOMapper.toCamelCase({
          KhachHangId: item.KhachHangID,
          HoTen: item.khachHang?.HoTen || 'Không rõ',
          Email: item.khachHang?.Email || '',
          DienThoai: item.khachHang?.DienThoai || '',
          SoDonHang: parseInt(item.dataValues.soDonHang || 0),
          TongChiTieu: parseFloat(item.dataValues.tongChiTieu || 0)
        });
        return mapped;
      }),

      topSanPham: topProducts.map(item => {
        const mapped = DTOMapper.toCamelCase({
          SanPhamId: item.SanPhamID,
          TenSanPham: item.sanPham?.Ten || 'Không rõ',
          HinhAnh: item.sanPham?.HinhAnhURL || null,
          GiaBan: parseFloat(item.sanPham?.GiaBan || 0),
          TonKho: item.sanPham?.SoLuongTon || 0,
          TongSoLuongBan: parseInt(item.dataValues.tongSoLuongBan || 0),
          TongDoanhThu: parseFloat(item.dataValues.tongDoanhThu || 0),
          SoLanMua: parseInt(item.dataValues.soLanMua || 0),
          DiemTrungBinh: parseFloat(item.sanPham?.DiemTrungBinh || 0),
          TongSoDanhGia: parseInt(item.sanPham?.TongSoDanhGia || 0),
          LoaiID: item.sanPham?.LoaiID || null,
          LoaiSP: item.sanPham?.loaiSP ? {
            Ten: item.sanPham.loaiSP.Ten
          } : null
        });
        return mapped;
      }),

      chartData: chartStats.map(stat => 
        DTOMapper.toCamelCase({
          Label: stat.label,
          SoDonHang: parseInt(stat.soDonHang),
          DoanhThu: parseFloat(stat.doanhThu || 0)
        })
      ),

      // ✨ Thống kê mới
      sanPhamBanE: worstProducts.map(item => 
        DTOMapper.toCamelCase({
          SanPhamId: item.SanPhamID,
          TenSanPham: item.sanPham?.Ten || 'Không rõ',
          HinhAnh: item.sanPham?.HinhAnhURL || null,
          GiaBan: parseFloat(item.sanPham?.GiaBan || 0),
          TonKho: item.sanPham?.SoLuongTon || 0,
          TongSoLuongBan: parseInt(item.dataValues.tongSoLuongBan || 0),
          TongDoanhThu: parseFloat(item.dataValues.tongDoanhThu || 0),
          SoLanMua: parseInt(item.dataValues.soLanMua || 0)
        })
      ),

      sanPhamDanhGiaXau: badRatedProducts.map(item => ({
        sanPhamId: item.SanPhamID,
        tenSanPham: item.TenSanPham || 'Không rõ',
        hinhAnh: item.HinhAnh || null,
        giaBan: parseFloat(item.GiaBan || 0),
        tonKho: item.TonKho || 0,
        diemTrungBinh: parseFloat(item.diemTrungBinh || 0),
        soLuongDanhGia: parseInt(item.soLuongDanhGia || 0),
        soDanhGia1Sao: parseInt(item.soDanhGia1Sao || 0),
        soDanhGia2Sao: parseInt(item.soDanhGia2Sao || 0),
        soDanhGia3Sao: parseInt(item.soDanhGia3Sao || 0),
        danhGiaChiTiet: item.danhGiaChiTiet || []
      })),

      tyLeHuyDon: {
        tongSoDon: totalOrders,
        soDonHuy: canceledOrders,
        tyLe: parseFloat(cancelRate.toFixed(2))
      },

      sanPhamHetHang: outOfStockProducts.map(item => 
        DTOMapper.toCamelCase({
          SanPhamId: item.ID,
          TenSanPham: item.Ten,
          HinhAnh: item.HinhAnhURL,
          GiaBan: parseFloat(item.GiaBan || 0),
          SoLuongTon: item.SoLuongTon || 0
        })
      ),

      sanPhamBanKhongChay: slowSellingProducts.map(item => ({
        sanPhamId: item.SanPhamID,
        tenSanPham: item.TenSanPham || 'Không rõ',
        hinhAnh: item.HinhAnh || null,
        giaBan: parseFloat(item.GiaBan || 0),
        tonKho: item.SoLuongTon || 0,
        tongSoLuongBan: parseInt(item.TongSoLuongBan || 0),
        tongDoanhThu: parseFloat(item.TongDoanhThu || 0),
        soLanMua: parseInt(item.SoLanMua || 0)
      })),

      hangSapHet: lowStockProducts.map(item => 
        DTOMapper.toCamelCase({
          SanPhamId: item.ID,
          TenSanPham: item.Ten,
          HinhAnh: item.HinhAnhURL,
          GiaBan: parseFloat(item.GiaBan || 0),
          SoLuongTon: item.SoLuongTon || 0
        })
      ),

      thongKeDanhGia: reviewStats,

      viewMode: viewMode
    };

    console.log('✅ Lấy thống kê thành công');
    console.log(`💰 Tổng doanh thu: ${statistics.tongDoanhThu.toLocaleString('vi-VN')} VNĐ`);
    console.log(`📦 Tổng số đơn: ${statistics.soDonHang}`);
    console.log(`📊 View mode: ${viewMode}`);
    console.log(`👥 Top khách hàng: ${statistics.topKhachHang.length} người`);
    console.log(`📦 Top sản phẩm: ${statistics.topSanPham.length} sản phẩm`);
    if (statistics.topSanPham.length > 0) {
      console.log('📦 Top sản phẩm chi tiết:', statistics.topSanPham.map(p => ({
        id: p.sanPhamId,
        ten: p.tenSanPham,
        ban: p.tongSoLuongBan
      })));
    }
    if (statistics.topKhachHang.length > 0) {
      console.log('👥 Top khách hàng chi tiết:', statistics.topKhachHang.map(c => ({
        id: c.khachHangId,
        ten: c.hoTen,
        don: c.soDonHang
      })));
    }

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê đơn hàng thành công',
      data: {
        statistics,
        filter: {
          startDate: startDate || null,
          endDate: endDate || null,
          year: year || null,
          viewMode: viewMode
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy thống kê đơn hàng:', error);
    console.error('Chi tiết lỗi:', error.message);
    console.error('Stack trace:', error.stack);

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

    // ✨ Tạo điều kiện lọc - CHỈ TÍNH ĐƠN ĐÃ THANH TOÁN
    const whereCondition = { 
      TrangThai: 'Đã thanh toán' // ✅ THÊM ĐIỀU KIỆN NÀY
    };
    
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

    // ✨ Thêm điều kiện TrangThai vào query
    const revenueStats = await db.sequelize.query(`
      SELECT 
        FORMAT(NgayLap, '${groupFormat}') as period,
        COUNT(*) as soDonHang,
        SUM(ThanhTien) as doanhThu,
        AVG(ThanhTien) as doanhThuTrungBinh,
        MIN(ThanhTien) as donHangThapNhat,
        MAX(ThanhTien) as donHangCaoNhat
      FROM HoaDon
      WHERE TrangThai = N'Đã thanh toán'
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

    // ✨ Tạo điều kiện lọc cho hóa đơn - CHỈ TÍNH ĐƠN ĐÃ THANH TOÁN
    const hoaDonCondition = { 
      TrangThai: 'Đã thanh toán' // ✅ THÊM ĐIỀU KIỆN NÀY
    };
    
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
          attributes: ['ID', 'Ten', 'HinhAnhURL', 'GiaBan', 'SoLuongTon', 'LoaiID']
        },
        {
          model: HoaDon,
          as: 'hoaDon',
          attributes: [],
          where: hoaDonCondition // ✅ ĐÃ CÓ TrangThai: 'Đã thanh toán'
        }
      ],
      group: ['ChiTietHoaDon.SanPhamID', 'sanPham.ID', 'sanPham.Ten', 'sanPham.HinhAnhURL', 'sanPham.GiaBan', 'sanPham.SoLuongTon', 'sanPham.LoaiID'],
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
        tonKho: item.sanPham?.SoLuongTon,
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
