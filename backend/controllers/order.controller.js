const db = require('../models');
const HoaDon = db.HoaDon;
const ChiTietHoaDon = db.ChiTietHoaDon;
const GioHang = db.GioHang;
const GioHangChiTiet = db.GioHangChiTiet;
const SanPham = db.SanPham;
const KhachHang = db.KhachHang;
const PhuongThucThanhToan = db.PhuongThucThanhToan;
const TaiKhoan = db.TaiKhoan;

// Hàm tạo mã hóa đơn tự động
const generateOrderCode = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // Format: YYYYMMDD
  
  // Tìm hóa đơn cuối cùng trong ngày
  const lastOrder = await HoaDon.findOne({
    where: {
      MaHD: {
        [db.Sequelize.Op.like]: `HD${dateStr}%`
      }
    },
    order: [['ID', 'DESC']]
  });
  
  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.MaHD.slice(-3));
    sequence = lastSequence + 1;
  }
  
  const orderCode = `HD${dateStr}${sequence.toString().padStart(3, '0')}`;
  return orderCode;
};

// Tạo đơn hàng từ giỏ hàng
exports.createOrder = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    console.log('🛒 Request body:', req.body);
    
    const taiKhoanId = req.user.id;
    
    const { 
      phuongThucThanhToanId = 1, 
      ghiChu = '', 
      diaChiGiaoHang = '',
      hoTen = '',
      email = '',
      dienThoai = ''
    } = req.body;

    console.log('📝 Extracted data:', { hoTen, email, dienThoai, diaChiGiaoHang });

    // ✅ Validate thông tin khách hàng
    if (!hoTen || !hoTen.trim()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Họ tên không được để trống'
      });
    }

    if (!email || !email.trim()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Email không được để trống'
      });
    }

    if (!dienThoai || !dienThoai.trim()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại không được để trống'
      });
    }

    if (!diaChiGiaoHang || !diaChiGiaoHang.trim()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Địa chỉ giao hàng không được để trống'
      });
    }

    // Validate phương thức thanh toán
    if (!phuongThucThanhToanId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn phương thức thanh toán'
      });
    }

    // Bước 1: Lấy giỏ hàng của người dùng
    const gioHang = await GioHang.findOne({
      where: { TaiKhoanID: taiKhoanId },
      include: [{
        model: GioHangChiTiet,
        as: 'chiTiet',
        attributes: ['ID', 'GioHangID', 'SanPhamID', 'SoLuong', 'NgayThem'],
        include: [{
          model: SanPham,
          as: 'sanPham',
          attributes: ['ID', 'Ten', 'GiaBan', 'Ton', 'Enable']
        }]
      }],
      transaction
    });

    console.log('🛒 Giỏ hàng tìm thấy:', gioHang ? 'Có' : 'Không');
    console.log('📦 Số lượng items:', gioHang?.chiTiet?.length || 0);

    // Kiểm tra giỏ hàng có tồn tại và có sản phẩm không
    if (!gioHang || !gioHang.chiTiet || gioHang.chiTiet.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng của bạn đang trống'
      });
    }

    // Validate từng sản phẩm trong giỏ hàng
    const validationErrors = [];
    for (const item of gioHang.chiTiet) {
      if (!item.sanPham || !item.sanPham.Enable) {
        validationErrors.push(`Sản phẩm "${item.sanPham?.Ten || 'Unknown'}" không còn tồn tại hoặc đã ngừng kinh doanh`);
        continue;
      }

      if (item.SoLuong > item.sanPham.Ton) {
        validationErrors.push(`Sản phẩm "${item.sanPham.Ten}" chỉ còn ${item.sanPham.Ton} trong kho`);
      }
    }

    if (validationErrors.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Có lỗi với một số sản phẩm trong giỏ hàng',
        errors: validationErrors
      });
    }

    // Tính tổng tiền từ GiaBan
    let tongTien = 0;
    gioHang.chiTiet.forEach(item => {
      const giaBan = parseFloat(item.sanPham.GiaBan);
      tongTien += giaBan * item.SoLuong;
    });

    console.log(`💰 Tổng tiền đơn hàng: ${tongTien.toLocaleString('vi-VN')} VNĐ`);

    // Tạo hoặc lấy khách hàng từ form data
    let khachHang = await KhachHang.findOne({
      where: { Email: email.trim() },
      transaction
    });

    if (!khachHang) {
      khachHang = await KhachHang.create({
        HoTen: hoTen.trim(),
        Email: email.trim(),
        DienThoai: dienThoai.trim(),
        DiaChi: diaChiGiaoHang.trim()
      }, { transaction });
      
      console.log('✅ Đã tạo khách hàng mới:', khachHang.ID);
    } else {
      // Cập nhật thông tin khách hàng
      await khachHang.update({
        HoTen: hoTen.trim(),
        DienThoai: dienThoai.trim(),
        DiaChi: diaChiGiaoHang.trim()
      }, { transaction });
      
      console.log('✅ Cập nhật thông tin khách hàng:', khachHang.ID);
    }

    // Tạo mã hóa đơn
    const maHoaDon = await generateOrderCode();
    console.log('📄 Mã hóa đơn:', maHoaDon);

    // Tạo hóa đơn
    const hoaDon = await HoaDon.create({
      MaHD: maHoaDon,
      KhachHangID: khachHang.ID,
      TongTien: tongTien,
      PhuongThucThanhToanID: phuongThucThanhToanId,
      TrangThai: 'Chờ xử lý',
      GhiChu: ghiChu || null
    }, { transaction });

    console.log('✅ Đã tạo hóa đơn:', hoaDon.ID);

    // Thêm chi tiết hóa đơn và cập nhật tồn kho
    for (const item of gioHang.chiTiet) {
      const giaBan = parseFloat(item.sanPham.GiaBan);
      const thanhTien = giaBan * item.SoLuong;
      
      // Tạo chi tiết hóa đơn
      await ChiTietHoaDon.create({
        HoaDonID: hoaDon.ID,
        SanPhamID: item.SanPhamID,
        SoLuong: item.SoLuong,
        DonGia: giaBan,
        GiaBan: giaBan,
        ThanhTien: thanhTien
      }, { transaction });

      // Trừ tồn kho
      await item.sanPham.update({
        Ton: item.sanPham.Ton - item.SoLuong
      }, { transaction });

      console.log(`✅ Đã trừ tồn kho ${item.sanPham.Ten}: ${item.sanPham.Ton + item.SoLuong} → ${item.sanPham.Ton}`);
    }

    // ✅ COMMIT TRANSACTION TRƯỚC
    await transaction.commit();
    console.log('✅ Transaction committed successfully');

    // ✅ XÓA GIỎ HÀNG SAU KHI COMMIT (NGOÀI TRANSACTION)
    try {
      const deleteCount = await GioHangChiTiet.destroy({
        where: { GioHangID: gioHang.ID }
      });

      console.log(`🗑️ Đã xóa ${deleteCount} items từ giỏ hàng`);
    } catch (deleteError) {
      console.error('⚠️ Lỗi khi xóa giỏ hàng (không ảnh hưởng đơn hàng):', deleteError);
      // KHÔNG throw error vì đơn hàng đã tạo thành công
    }

    // Lấy lại thông tin đầy đủ của hóa đơn vừa tạo
    const hoaDonDetail = await HoaDon.findOne({
      where: { ID: hoaDon.ID },
      include: [
        {
          model: KhachHang,
          as: 'khachHang',
          attributes: ['ID', 'HoTen', 'Email', 'DienThoai', 'DiaChi']
        },
        {
          model: PhuongThucThanhToan,
          as: 'phuongThucThanhToan',
          attributes: ['ID', 'Ten', 'MoTa']
        },
        {
          model: ChiTietHoaDon,
          as: 'chiTiet',
          include: [{
            model: SanPham,
            as: 'sanPham',
            attributes: ['ID', 'Ten', 'HinhAnhURL']
          }]
        }
      ]
    });

    console.log('✅ Tạo đơn hàng thành công:', hoaDon.MaHD);

    // Trả về kết quả
    return res.status(201).json({
      success: true,
      message: 'Tạo đơn hàng thành công',
      data: {
        hoaDon: {
          id: hoaDonDetail.ID,
          maHD: hoaDonDetail.MaHD,
          ngayLap: hoaDonDetail.NgayLap,
          tongTien: parseFloat(hoaDonDetail.TongTien),
          trangThai: hoaDonDetail.TrangThai,
          ghiChu: hoaDonDetail.GhiChu,
          khachHang: {
            id: hoaDonDetail.khachHang.ID,
            hoTen: hoaDonDetail.khachHang.HoTen,
            email: hoaDonDetail.khachHang.Email,
            dienThoai: hoaDonDetail.khachHang.DienThoai,
            diaChi: hoaDonDetail.khachHang.DiaChi
          },
          phuongThucThanhToan: {
            id: hoaDonDetail.phuongThucThanhToan.ID,
            ten: hoaDonDetail.phuongThucThanhToan.Ten,
            moTa: hoaDonDetail.phuongThucThanhToan.MoTa
          },
          chiTiet: hoaDonDetail.chiTiet.map(item => ({
            id: item.ID,
            sanPhamId: item.SanPhamID,
            tenSanPham: item.sanPham.Ten,
            hinhAnh: item.sanPham.HinhAnhURL,
            soLuong: item.SoLuong,
            donGia: parseFloat(item.DonGia),
            thanhTien: parseFloat(item.ThanhTien)
          }))
        }
      }
    });

  } catch (error) {
    // Rollback transaction nếu có lỗi
    await transaction.rollback();
    
    console.error('❌ Lỗi tạo đơn hàng:', error);
    console.error('❌ Error stack:', error.stack);

    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ khi tạo đơn hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Lấy danh sách đơn hàng của user
exports.getMyOrders = async (req, res) => {
  try {
    const taiKhoanId = req.user.id;
    const { page = 1, limit = 10, trangThai = '' } = req.query;

    console.log('📦 Getting orders for user:', taiKhoanId);

    // ✅ Lấy thông tin tài khoản
    const taiKhoan = await TaiKhoan.findByPk(taiKhoanId);
    
    if (!taiKhoan) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản'
      });
    }

    console.log('👤 User info:', { email: taiKhoan.Email, hoTen: taiKhoan.HoTen });

    // ✅ Tìm khách hàng dựa trên email HOẶC họ tên
    let khachHang = null;

    if (taiKhoan.Email) {
      khachHang = await KhachHang.findOne({
        where: { Email: taiKhoan.Email }
      });
    }

    // Nếu không tìm thấy theo email, thử tìm theo họ tên
    if (!khachHang && taiKhoan.HoTen) {
      khachHang = await KhachHang.findOne({
        where: { HoTen: taiKhoan.HoTen }
      });
    }

    console.log('🔍 Khách hàng tìm thấy:', khachHang ? `ID: ${khachHang.ID}` : 'Không có');

    // ✅ Nếu không tìm thấy khách hàng, trả về danh sách rỗng (không lỗi)
    if (!khachHang) {
      return res.status(200).json({
        success: true,
        data: {
          orders: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalOrders: 0,
            limit: parseInt(limit)
          }
        }
      });
    }

    // ✅ Build WHERE clause
    const whereClause = {
      KhachHangID: khachHang.ID,
      Enable: true
    };

    if (trangThai && trangThai.trim()) {
      whereClause.TrangThai = trangThai.trim();
    }

    // ✅ Đếm tổng số đơn hàng
    const totalOrders = await HoaDon.count({ where: whereClause });

    console.log(`📊 Tổng số đơn hàng: ${totalOrders}`);

    // ✅ Lấy danh sách đơn hàng với phân trang
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const hoaDons = await HoaDon.findAll({
      where: whereClause,
      include: [
        {
          model: KhachHang,
          as: 'khachHang',
          attributes: ['ID', 'HoTen', 'Email', 'DienThoai', 'DiaChi']
        },
        {
          model: PhuongThucThanhToan,
          as: 'phuongThucThanhToan',
          attributes: ['ID', 'Ten', 'MoTa']
        },
        {
          model: ChiTietHoaDon,
          as: 'chiTiet',
          include: [{
            model: SanPham,
            as: 'sanPham',
            attributes: ['ID', 'Ten', 'HinhAnhURL']
          }]
        }
      ],
      order: [['NgayLap', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    console.log(`✅ Đã lấy ${hoaDons.length} đơn hàng`);

    // ✅ Format data để trả về
    const orders = hoaDons.map(hd => {
      const chiTiet = hd.chiTiet || [];
      
      return {
        id: hd.ID,
        maHD: hd.MaHD,
        ngayLap: hd.NgayLap,
        tongTien: parseFloat(hd.TongTien),
        trangThai: hd.TrangThai,
        ghiChu: hd.GhiChu,
        phuongThucThanhToan: {
          id: hd.phuongThucThanhToan?.ID,
          ten: hd.phuongThucThanhToan?.Ten,
          moTa: hd.phuongThucThanhToan?.MoTa
        },
        // ✅ Thông tin tổng hợp
        soLoaiSanPham: chiTiet.length,
        tongSoLuongSanPham: chiTiet.reduce((sum, item) => sum + item.SoLuong, 0),
        // ✅ Danh sách sản phẩm
        sanPhams: chiTiet.map(item => ({
          id: item.ID,
          sanPhamId: item.SanPhamID,
          tenSanPham: item.sanPham?.Ten || 'N/A',
          hinhAnh: item.sanPham?.HinhAnhURL || null,
          soLuong: item.SoLuong,
          donGia: parseFloat(item.DonGia),
          thanhTien: parseFloat(item.ThanhTien)
        }))
      };
    });

    // ✅ Trả về kết quả
    return res.status(200).json({
      success: true,
      data: {
        orders: orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / parseInt(limit)),
          totalOrders: totalOrders,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy danh sách đơn hàng:', error);
    console.error('❌ Error stack:', error.stack);

    return res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Lấy chi tiết đơn hàng
exports.getOrderDetail = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const taiKhoanId = req.user.id;

    if (!orderId || orderId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID đơn hàng không hợp lệ'
      });
    }

    // Lấy thông tin tài khoản
    const taiKhoan = await TaiKhoan.findByPk(taiKhoanId);

    // Lấy chi tiết đơn hàng
    const hoaDon = await HoaDon.findOne({
      where: {
        ID: orderId,
        Enable: true
      },
      include: [
        {
          model: KhachHang,
          as: 'khachHang',
          attributes: ['ID', 'HoTen', 'Email', 'DienThoai', 'DiaChi']
        },
        {
          model: PhuongThucThanhToan,
          as: 'phuongThucThanhToan',
          attributes: ['ID', 'Ten', 'MoTa']
        },
        {
          model: ChiTietHoaDon,
          as: 'chiTiet',
          include: [{
            model: SanPham,
            as: 'sanPham',
            attributes: ['ID', 'Ten', 'HinhAnhURL', 'GiaBan']
          }]
        }
      ]
    });

    if (!hoaDon) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Kiểm tra quyền xem đơn hàng (chỉ user tạo đơn hoặc admin mới xem được)
    const isOwner = hoaDon.khachHang.Email === taiKhoan.Email || 
                    hoaDon.khachHang.HoTen === taiKhoan.HoTen;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem đơn hàng này'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết đơn hàng thành công',
      data: {
        hoaDon: {
          id: hoaDon.ID,
          maHD: hoaDon.MaHD,
          ngayLap: hoaDon.NgayLap,
          tongTien: parseFloat(hoaDon.TongTien),
          trangThai: hoaDon.TrangThai,
          ghiChu: hoaDon.GhiChu,
          khachHang: {
            id: hoaDon.khachHang.ID,
            hoTen: hoaDon.khachHang.HoTen,
            email: hoaDon.khachHang.Email,
            dienThoai: hoaDon.khachHang.DienThoai,
            diaChi: hoaDon.khachHang.DiaChi
          },
          phuongThucThanhToan: {
            id: hoaDon.phuongThucThanhToan.ID,
            ten: hoaDon.phuongThucThanhToan.Ten,
            moTa: hoaDon.phuongThucThanhToan.MoTa
          },
          chiTiet: hoaDon.chiTiet.map(item => ({
            id: item.ID,
            sanPhamId: item.SanPhamID,
            tenSanPham: item.sanPham.Ten,
            hinhAnh: item.sanPham.HinhAnhURL,
            soLuong: item.SoLuong,
            donGia: parseFloat(item.DonGia),
            thanhTien: parseFloat(item.ThanhTien)
          }))
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy chi tiết đơn hàng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Hủy đơn hàng (hoàn tồn kho)
exports.cancelOrder = async (req, res) => {
  // Bắt đầu transaction
  const transaction = await db.sequelize.transaction();
  
  try {
    const orderId = parseInt(req.params.id);
    const taiKhoanId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    console.log('🚫 Yêu cầu hủy đơn hàng - Order ID:', orderId, '- User ID:', taiKhoanId);

    // Validate orderId
    if (!orderId || orderId < 1) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'ID đơn hàng không hợp lệ'
      });
    }

    // Lấy thông tin tài khoản
    const taiKhoan = await TaiKhoan.findByPk(taiKhoanId);

    if (!taiKhoan) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản'
      });
    }

    // Lấy thông tin đơn hàng với chi tiết sản phẩm
    const hoaDon = await HoaDon.findOne({
      where: {
        ID: orderId,
        Enable: true
      },
      include: [
        {
          model: KhachHang,
          as: 'khachHang',
          attributes: ['ID', 'HoTen', 'Email', 'DienThoai']
        },
        {
          model: ChiTietHoaDon,
          as: 'chiTiet',
          where: { Enable: true },
          required: false,
          include: [{
            model: SanPham,
            as: 'sanPham',
            attributes: ['ID', 'Ten', 'Ton']
          }]
        }
      ],
      transaction
    });

    if (!hoaDon) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Kiểm tra quyền hủy đơn (chỉ user tạo đơn hoặc admin mới hủy được)
    const isOwner = hoaDon.khachHang.Email === taiKhoan.Email || 
                    hoaDon.khachHang.HoTen === taiKhoan.HoTen;

    if (!isOwner && !isAdmin) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền hủy đơn hàng này'
      });
    }

    // Kiểm tra trạng thái đơn hàng có thể hủy không
    const allowedCancelStatuses = ['Chờ xử lý', 'Chờ thanh toán'];
    
    if (!allowedCancelStatuses.includes(hoaDon.TrangThai)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Không thể hủy đơn hàng ở trạng thái "${hoaDon.TrangThai}". Chỉ có thể hủy đơn hàng "Chờ xử lý" hoặc "Chờ thanh toán"`,
        data: {
          currentStatus: hoaDon.TrangThai,
          allowedStatuses: allowedCancelStatuses
        }
      });
    }

    // Kiểm tra đơn hàng đã bị hủy trước đó chưa
    if (hoaDon.TrangThai === 'Đã hủy') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đã bị hủy trước đó'
      });
    }

    console.log(`📦 Bắt đầu hoàn tồn kho cho ${hoaDon.chiTiet.length} sản phẩm`);

    // Hoàn tồn kho cho từng sản phẩm
    const restoredProducts = [];
    for (const item of hoaDon.chiTiet) {
      // Cập nhật số lượng tồn kho (cộng lại số lượng đã mua)
      const [affectedRows] = await SanPham.update(
        { Ton: db.Sequelize.literal(`Ton + ${item.SoLuong}`) },
        {
          where: { ID: item.SanPhamID },
          transaction
        }
      );

      if (affectedRows > 0) {
        // Lấy lại thông tin sản phẩm đã cập nhật
        const updatedProduct = await SanPham.findByPk(item.SanPhamID, {
          attributes: ['ID', 'Ten', 'Ton'],
          transaction
        });

        restoredProducts.push({
          sanPhamId: item.SanPhamID,
          tenSanPham: item.sanPham.Ten,
          soLuongHoan: item.SoLuong,
          tonKhoMoi: updatedProduct.Ton
        });

        console.log(`✅ Hoàn ${item.SoLuong} sản phẩm "${item.sanPham.Ten}" - Tồn kho mới: ${updatedProduct.Ton}`);
      }
    }

    // Cập nhật trạng thái đơn hàng
    const cancelNote = `Đơn hàng đã hủy bởi ${isAdmin ? 'Admin' : 'Khách hàng'} lúc ${new Date().toLocaleString('vi-VN')}`;
    
    await hoaDon.update({
      TrangThai: 'Đã hủy',
      GhiChu: hoaDon.GhiChu ? `${hoaDon.GhiChu} | ${cancelNote}` : cancelNote
    }, { transaction });

    // Commit transaction
    await transaction.commit();

    console.log(`✅ Hủy đơn hàng ${hoaDon.MaHD} thành công`);

    res.status(200).json({
      success: true,
      message: 'Hủy đơn hàng thành công',
      data: {
        hoaDon: {
          id: hoaDon.ID,
          maHD: hoaDon.MaHD,
          trangThai: 'Đã hủy',
          tongTien: parseFloat(hoaDon.TongTien),
          ngayLap: hoaDon.NgayLap
        },
        restoredProducts: restoredProducts,
        totalProductsRestored: restoredProducts.length,
        totalQuantityRestored: restoredProducts.reduce((sum, p) => sum + p.soLuongHoan, 0)
      }
    });

  } catch (error) {
    // Rollback transaction nếu có lỗi
    await transaction.rollback();
    
    console.error('❌ Lỗi hủy đơn hàng:', error);

    // Xử lý lỗi cụ thể
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({
        success: false,
        message: 'Lỗi cơ sở dữ liệu',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Database Error'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ khi hủy đơn hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Lấy lịch sử đơn hàng chi tiết
exports.getOrderHistory = async (req, res) => {
  try {
    console.log('📜 Lấy lịch sử đơn hàng - User ID:', req.user.id);
     console.log('📜 Query params:', req.query);

    const taiKhoanId = req.user.id;
    
    // Lấy query parameters
    const pageParam = req.query.page;
    const limitParam = req.query.limit;
    const trangThai = req.query.trangThai || null;

    // Validate và parse page parameter
    let page = 1; // Giá trị mặc định
    if (pageParam !== undefined) {
      // Kiểm tra xem có phải là số không (string số hoặc number)
      if (!/^\d+$/.test(String(pageParam))) {
        return res.status(400).json({
          success: false,
          message: 'Số trang phải là số nguyên dương lớn hơn 0'
        });
      }
      
      page = parseInt(pageParam);
      
      // Kiểm tra page phải > 0
      if (page < 1) {
        return res.status(400).json({
          success: false,
          message: 'Số trang phải là số nguyên dương lớn hơn 0'
        });
      }
    }

    // Validate và parse limit parameter
    let limit = 10; // Giá trị mặc định
    if (limitParam !== undefined) {
      // Kiểm tra xem có phải là số không
      if (!/^\d+$/.test(String(limitParam))) {
        return res.status(400).json({
          success: false,
          message: 'Số lượng đơn hàng mỗi trang phải từ 1 đến 50'
        });
      }
      
      limit = parseInt(limitParam);
      
      // Kiểm tra limit trong khoảng hợp lệ
      if (limit < 1 || limit > 50) {
        return res.status(400).json({
          success: false,
          message: 'Số lượng đơn hàng mỗi trang phải từ 1 đến 50'
        });
      }
    }

    // Tính offset SAU KHI đã validate
    const offset = (page - 1) * limit;

    console.log(`✅ Validated params - Page: ${page}, Limit: ${limit}, Offset: ${offset}`);

    // Lấy thông tin tài khoản
    const taiKhoan = await TaiKhoan.findByPk(taiKhoanId);
    
    if (!taiKhoan) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản'
      });
    }

    // Tìm khách hàng dựa trên email hoặc tên
    const khachHang = await KhachHang.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { Email: taiKhoan.Email || null },
          { HoTen: taiKhoan.HoTen }
        ]
      }
    });

    // Nếu không tìm thấy khách hàng, trả về danh sách rỗng
    if (!khachHang) {
      return res.status(200).json({
        success: true,
        message: 'Bạn chưa có đơn hàng nào',
        data: {
          orders: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalOrders: 0,
            ordersPerPage: limit,
            hasNextPage: false,
            hasPrevPage: false
          }
        }
      });
    }

    // Tạo điều kiện tìm kiếm
    const whereCondition = {
      KhachHangID: khachHang.ID,
      Enable: true
    };

    // Thêm điều kiện lọc theo trạng thái nếu có
    if (trangThai) {
      whereCondition.TrangThai = trangThai;
    }

    console.log('🔍 Điều kiện tìm kiếm:', whereCondition);

    // Lấy danh sách đơn hàng với phân trang
    const { count, rows } = await HoaDon.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: KhachHang,
          as: 'khachHang',
          attributes: ['ID', 'HoTen', 'Email', 'DienThoai', 'DiaChi']
        },
        {
          model: PhuongThucThanhToan,
          as: 'phuongThucThanhToan',
          attributes: ['ID', 'Ten', 'MoTa']
        },
        {
          model: ChiTietHoaDon,
          as: 'chiTiet',
          where: { Enable: true },
          required: false, // LEFT JOIN để lấy cả đơn hàng không có chi tiết
          include: [{
            model: SanPham,
            as: 'sanPham',
            attributes: ['ID', 'Ten', 'HinhAnhURL', 'GiaBan', 'LoaiID']
          }]
        }
      ],
      limit: limit,
      offset: offset,
      order: [['NgayLap', 'DESC']], // Sắp xếp từ mới nhất đến cũ nhất
      distinct: true // Đảm bảo count chính xác khi có JOIN
    });

    // Tính toán thông tin phân trang
    const totalOrders = count;
    const totalPages = Math.ceil(totalOrders / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Format dữ liệu trả về
    const orders = rows.map(hoaDon => {
      // Tính tổng số lượng sản phẩm
      const tongSoLuongSanPham = hoaDon.chiTiet.reduce((sum, item) => sum + item.SoLuong, 0);

      return {
        id: hoaDon.ID,
        maHD: hoaDon.MaHD,
        ngayLap: hoaDon.NgayLap,
        trangThai: hoaDon.TrangThai,
        tongTien: parseFloat(hoaDon.TongTien),
        ghiChu: hoaDon.GhiChu,
        khachHang: {
          id: hoaDon.khachHang.ID,
          hoTen: hoaDon.khachHang.HoTen,
          email: hoaDon.khachHang.Email,
          dienThoai: hoaDon.khachHang.DienThoai,
          diaChi: hoaDon.khachHang.DiaChi
        },
        phuongThucThanhToan: {
          id: hoaDon.phuongThucThanhToan.ID,
          ten: hoaDon.phuongThucThanhToan.Ten,
          moTa: hoaDon.phuongThucThanhToan.MoTa
        },
        sanPhams: hoaDon.chiTiet.map(item => ({
          id: item.ID,
          sanPhamId: item.SanPhamID,
          tenSanPham: item.sanPham.Ten,
          hinhAnh: item.sanPham.HinhAnhURL,
          soLuong: item.SoLuong,
          donGia: parseFloat(item.DonGia),
          thanhTien: parseFloat(item.ThanhTien),
          giaBanHienTai: parseFloat(item.sanPham.GiaBan) // Giá hiện tại của sản phẩm (có thể khác giá lúc mua)
        })),
        tongSoLuongSanPham: tongSoLuongSanPham,
        soLoaiSanPham: hoaDon.chiTiet.length
      };
    });

    console.log(`✅ Lấy ${orders.length}/${totalOrders} đơn hàng thành công`);

    // Trả về kết quả
    res.status(200).json({
      success: true,
      message: 'Lấy lịch sử đơn hàng thành công',
      data: {
        orders: orders,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalOrders: totalOrders,
          ordersPerPage: limit,
          hasNextPage: hasNextPage,
          hasPrevPage: hasPrevPage
        },
        filter: {
          trangThai: trangThai || 'Tất cả'
        },
        summary: {
          tongTienTatCaDonHang: orders.reduce((sum, order) => sum + order.tongTien, 0),
          tongSoSanPhamDaMua: orders.reduce((sum, order) => sum + order.tongSoLuongSanPham, 0)
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy lịch sử đơn hàng:', error);

    // Xử lý lỗi cơ sở dữ liệu
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
