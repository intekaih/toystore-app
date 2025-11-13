const db = require('../models');
const Decimal = require('decimal.js'); // ✅ Thêm Decimal.js cho tính toán chính xác

// ✅ IMPORT DECORATOR PATTERN
const { OrderPriceCalculator } = require('../decorators/OrderPriceDecorator');
const VATDecorator = require('../decorators/VATDecorator');
const ShippingDecorator = require('../decorators/ShippingDecorator');
const VoucherDecorator = require('../decorators/VoucherDecorator');

const HoaDon = db.HoaDon;
const ChiTietHoaDon = db.ChiTietHoaDon;
const GioHang = db.GioHang;
const GioHangChiTiet = db.GioHangChiTiet;
const SanPham = db.SanPham;
const KhachHang = db.KhachHang;
const PhuongThucThanhToan = db.PhuongThucThanhToan;
const TaiKhoan = db.TaiKhoan;

/**
 * ✅ HÀM TẠO MÃ HÓA ĐƠN TỰ ĐỘNG - THREAD SAFE
 * Sử dụng pessimistic locking để tránh race condition
 * 
 * @param {Object} transaction - Sequelize transaction (bắt buộc)
 * @param {number} maxRetries - Số lần thử lại tối đa (mặc định: 3)
 * @returns {Promise<string>} Mã hóa đơn unique
 */
const generateOrderCode = async (transaction, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // Format: YYYYMMDD
      
      // ✅ PESSIMISTIC LOCKING - Lock bản ghi cuối cùng trong ngày
      // Điều này ngăn các transaction khác đọc cùng lúc
      const lastOrder = await HoaDon.findOne({
        where: {
          MaHD: {
            [db.Sequelize.Op.like]: `HD${dateStr}%`
          }
        },
        order: [['ID', 'DESC']],
        lock: transaction.LOCK.UPDATE, // 🔒 LOCK bản ghi này
        transaction // Bắt buộc phải có transaction
      });
      
      let sequence = 1;
      if (lastOrder) {
        const lastSequence = parseInt(lastOrder.MaHD.slice(-3));
        sequence = lastSequence + 1;
        
        console.log(`📄 [Attempt ${attempt}] Tìm thấy đơn hàng cuối: ${lastOrder.MaHD}, sequence tiếp theo: ${sequence}`);
      } else {
        console.log(`📄 [Attempt ${attempt}] Không có đơn hàng trong ngày, bắt đầu từ sequence: 1`);
      }
      
      // ✅ KIỂM TRA SEQUENCE KHÔNG VƯỢT QUÁ 999
      if (sequence > 999) {
        throw new Error(`Đã vượt quá giới hạn đơn hàng trong ngày (${sequence}/999)`);
      }
      
      const orderCode = `HD${dateStr}${sequence.toString().padStart(3, '0')}`;
      
      console.log(`✅ [Attempt ${attempt}] Tạo mã hóa đơn: ${orderCode}`);
      
      return orderCode;
      
    } catch (error) {
      console.error(`❌ [Attempt ${attempt}/${maxRetries}] Lỗi tạo mã hóa đơn:`, error.message);
      
      // Nếu đã hết số lần thử → throw error
      if (attempt >= maxRetries) {
        throw new Error(`Không thể tạo mã hóa đơn sau ${maxRetries} lần thử: ${error.message}`);
      }
      
      // Đợi một khoảng ngẫu nhiên trước khi thử lại (100-300ms)
      const delay = Math.floor(Math.random() * 200) + 100;
      console.log(`⏳ Đợi ${delay}ms trước khi thử lại...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Tạo đơn hàng từ giỏ hàng
exports.createOrder = async (req, res) => {
  // Bắt đầu transaction
  const transaction = await db.sequelize.transaction();
  
  try {
    console.log('🛒 Bắt đầu tạo đơn hàng cho user:', req.user.id);
    
    const taiKhoanId = req.user.id;
    const { 
      phuongThucThanhToanId = 1, 
      ghiChu = '', 
      diaChiGiaoHang = '',
      dienThoai = ''
    } = req.body;

    console.log('📦 Dữ liệu đặt hàng:', {
      dienThoai,
      diaChiGiaoHang,
      phuongThucThanhToanId
    });

    // Validate phương thức thanh toán
    if (!phuongThucThanhToanId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn phương thức thanh toán'
      });
    }

    // Kiểm tra phương thức thanh toán có tồn tại không
    const phuongThucThanhToan = await PhuongThucThanhToan.findOne({
      where: {
        ID: phuongThucThanhToanId,
        Enable: true
      }
    });

    if (!phuongThucThanhToan) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Phương thức thanh toán không hợp lệ'
      });
    }

    // Bước 1: Lấy giỏ hàng của người dùng
    const gioHang = await GioHang.findOne({
      where: { TaiKhoanID: taiKhoanId },
      include: [{
        model: GioHangChiTiet,
        as: 'chiTiet',
        include: [{
          model: SanPham,
          as: 'sanPham',
          attributes: ['ID', 'Ten', 'GiaBan', 'Ton', 'Enable']
        }]
      }],
      transaction
    });

    // Kiểm tra giỏ hàng có tồn tại và có sản phẩm không
    if (!gioHang || !gioHang.chiTiet || gioHang.chiTiet.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng của bạn đang trống'
      });
    }

    console.log(`📦 Tìm thấy ${gioHang.chiTiet.length} sản phẩm trong giỏ hàng`);

    // ✅ PESSIMISTIC LOCKING - LOCK SẢN PHẨM TRONG DB ĐỂ TRÁNH RACE CONDITION
    console.log('🔒 Bắt đầu kiểm tra và lock tồn kho...');
    const validationErrors = [];
    const lockedProducts = []; // Lưu sản phẩm đã lock để debug

    for (const item of gioHang.chiTiet) {
      // ✅ SELECT FOR UPDATE - Lock bản ghi sản phẩm cho đến khi transaction kết thúc
      // Điều này ngăn các transaction khác đọc/ghi vào sản phẩm này
      const sanPham = await SanPham.findByPk(item.SanPhamID, {
        lock: transaction.LOCK.UPDATE, // 🔒 PESSIMISTIC LOCK
        transaction
      });

      if (!sanPham || !sanPham.Enable) {
        validationErrors.push(`Sản phẩm "${item.sanPham?.Ten || 'Unknown'}" không còn tồn tại hoặc đã ngừng kinh doanh`);
        console.error(`❌ Sản phẩm ID ${item.SanPhamID} không tồn tại hoặc bị vô hiệu hóa`);
        continue;
      }

      // ✅ KIỂM TRA TỒN KHO SAU KHI ĐÃ LOCK
      // Lúc này tồn kho là giá trị CHÍNH XÁC, không bị thay đổi bởi transaction khác
      if (item.SoLuong > sanPham.Ton) {
        validationErrors.push(`Sản phẩm "${sanPham.Ten}" chỉ còn ${sanPham.Ton} trong kho (bạn đang yêu cầu ${item.SoLuong})`);
        console.error(`❌ Sản phẩm "${sanPham.Ten}": Yêu cầu ${item.SoLuong}, Còn ${sanPham.Ton}`);
        continue;
      }

      // ✅ GHI LOG SẢN PHẨM ĐÃ LOCK THÀNH CÔNG
      lockedProducts.push({
        id: sanPham.ID,
        ten: sanPham.Ten,
        tonKho: sanPham.Ton,
        soLuongDat: item.SoLuong,
        conLai: sanPham.Ton - item.SoLuong
      });
      
      console.log(`🔒 Đã lock sản phẩm "${sanPham.Ten}" - Tồn: ${sanPham.Ton}, Đặt: ${item.SoLuong}`);
    }

    // ❌ Nếu có lỗi validation → Rollback và trả về lỗi
    if (validationErrors.length > 0) {
      await transaction.rollback();
      console.error('❌ Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Có lỗi với một số sản phẩm trong giỏ hàng',
        errors: validationErrors
      });
    }

    console.log(`✅ Đã lock và validate ${lockedProducts.length} sản phẩm thành công`);

    // ✅ SỬ DỤNG DECORATOR PATTERN ĐỂ TÍNH GIÁ
    console.log('💰 Bắt đầu tính giá với Decorator Pattern...');
    
    // Bước 1: Tạo danh sách items cho calculator
    const items = gioHang.chiTiet.map(item => ({
      sanPhamId: item.SanPhamID,
      ten: item.sanPham.Ten,
      soLuong: item.SoLuong,
      donGia: item.DonGia
    }));

    // Bước 2: Tạo base calculator
    let priceCalculator = new OrderPriceCalculator(items);
    console.log(`📊 Tổng tiền sản phẩm: ${priceCalculator.calculate().toFixed(2)} VNĐ`);

    // Bước 3: Thêm VAT 10% (nếu cần)
    const VAT_RATE = 0.1; // 10% VAT
    priceCalculator = new VATDecorator(priceCalculator, VAT_RATE);
    console.log(`📊 Sau khi thêm VAT ${VAT_RATE * 100}%: ${priceCalculator.calculate().toFixed(2)} VNĐ`);

    // Bước 4: Thêm phí ship (nếu có)
    const SHIPPING_FEE = 30000; // 30k phí ship cố định
    priceCalculator = new ShippingDecorator(priceCalculator, SHIPPING_FEE, {
      method: 'Standard',
      estimatedDays: '3-5'
    });
    console.log(`📊 Sau khi thêm phí ship: ${priceCalculator.calculate().toFixed(2)} VNĐ`);

    // Bước 5: Áp dụng voucher (nếu có trong request)
    // TODO: Implement voucher logic from request body
    // const { voucherCode } = req.body;
    // if (voucherCode) {
    //   const voucher = await Voucher.findOne({ where: { MaVoucher: voucherCode, Enable: true } });
    //   if (voucher) {
    //     priceCalculator = new VoucherDecorator(priceCalculator, {
    //       code: voucher.MaVoucher,
    //       type: voucher.LoaiGiamGia,
    //       value: voucher.GiaTriGiam,
    //       maxDiscount: voucher.GiamToiDa,
    //       minOrderValue: voucher.GiaTriDonHangToiThieu
    //     });
    //   }
    // }

    // Bước 6: Lấy chi tiết giá và tổng tiền cuối cùng
    const priceDetails = priceCalculator.getDetails();
    const tongTienCuoi = priceCalculator.calculate();

    console.log('💰 Chi tiết giá:', JSON.stringify(priceDetails, null, 2));
    console.log(`💰 Tổng tiền cuối cùng: ${tongTienCuoi.toFixed(2)} VNĐ`);

    // ✅ TRÍCH XUẤT CÁC GIÁ TRỊ TỪ DECORATOR DETAILS
    const tongTienSanPham = new Decimal(priceDetails.tongTienSanPham || 0);
    const vatRate = priceDetails.vat ? new Decimal(priceDetails.vat.rate) : new Decimal(0);
    const tienVAT = priceDetails.vat ? new Decimal(priceDetails.vat.amount) : new Decimal(0);
    const phiShip = priceDetails.shipping ? new Decimal(priceDetails.shipping.fee) : new Decimal(0);
    const giamGia = priceDetails.voucher ? new Decimal(priceDetails.voucher.discountAmount) : new Decimal(0);
    const voucherId = priceDetails.voucher ? priceDetails.voucher.voucherId : null;

    console.log('📊 Breakdown giá:', {
      tongTienSanPham: tongTienSanPham.toFixed(2),
      vatRate: vatRate.toFixed(4),
      tienVAT: tienVAT.toFixed(2),
      phiShip: phiShip.toFixed(2),
      giamGia: giamGia.toFixed(2),
      tongTienCuoi: tongTienCuoi.toFixed(2)
    });

    // Lấy thông tin tài khoản
    const taiKhoan = await TaiKhoan.findByPk(taiKhoanId, { transaction });

    // ✅ QUAN TRỌNG: Cập nhật số điện thoại vào TaiKhoan TRƯỚC
    if (dienThoai && dienThoai.trim() !== '') {
      await taiKhoan.update({ DienThoai: dienThoai.trim() }, { transaction });
      console.log('📱 Đã cập nhật số điện thoại vào TaiKhoan:', dienThoai.trim());
    }

    // Tạo hoặc lấy khách hàng (SỬ DỤNG số điện thoại đã cập nhật)
    let khachHang = await KhachHang.findOne({
      where: { TaiKhoanID: taiKhoanId },
      transaction
    });

    if (!khachHang) {
      // Tạo khách hàng mới với TaiKhoanID
      const phoneToUse = dienThoai?.trim() || taiKhoan.DienThoai || null;
      khachHang = await KhachHang.create({
        TaiKhoanID: taiKhoanId,
        HoTen: taiKhoan.HoTen,
        Email: taiKhoan.Email || null,
        DienThoai: phoneToUse,
        DiaChi: diaChiGiaoHang || null
      }, { transaction });
      
      console.log('👤 Đã tạo khách hàng mới:', khachHang.ID, '- Số ĐT:', khachHang.DienThoai);
    } else {
      // Cập nhật cả địa chỉ VÀ số điện thoại nếu có
      const updateData = {};
      if (diaChiGiaoHang) {
        updateData.DiaChi = diaChiGiaoHang;
      }
      // Ưu tiên số điện thoại từ request, nếu không có thì lấy từ TaiKhoan
      const phoneToUse = dienThoai?.trim() || taiKhoan.DienThoai;
      if (phoneToUse) {
        updateData.DienThoai = phoneToUse;
      }
      
      if (Object.keys(updateData).length > 0) {
        await khachHang.update(updateData, { transaction });
        console.log('👤 Đã cập nhật thông tin khách hàng:', khachHang.ID, '- Dữ liệu:', updateData);
      } else {
        console.log('👤 Sử dụng khách hàng có sẵn:', khachHang.ID);
      }
    }

    // Bước 2: Tạo mã hóa đơn (TRUYỀN transaction vào)
    const maHoaDon = await generateOrderCode(transaction);
    console.log('📄 Mã hóa đơn:', maHoaDon);

    // ✅ TẠO HÓA ĐƠN VỚI CÁC GIÁ TRỊ TỪ DECORATOR PATTERN
    const hoaDon = await HoaDon.create({
      MaHD: maHoaDon,
      KhachHangID: khachHang.ID,
      TongTienSanPham: tongTienSanPham.toFixed(2),     // ✅ Tổng tiền sản phẩm
      VAT: vatRate.toFixed(4),                          // ✅ Tỷ lệ VAT (0.1 = 10%)
      TienVAT: tienVAT.toFixed(2),                      // ✅ Số tiền VAT
      PhiShip: phiShip.toFixed(2),                      // ✅ Phí ship
      VoucherID: voucherId,                             // ✅ ID voucher (nếu có)
      GiamGia: giamGia.toFixed(2),                      // ✅ Số tiền giảm giá
      TongTien: tongTienCuoi.toFixed(2),                // ✅ Tổng tiền cuối cùng
      PhuongThucThanhToanID: phuongThucThanhToanId,
      TrangThai: 'Chờ xử lý',
      GhiChu: ghiChu || null
    }, { transaction });

    console.log('✅ Đã tạo hóa đơn:', hoaDon.ID);
    console.log('💰 Breakdown lưu vào DB:', {
      tongTienSanPham: tongTienSanPham.toFixed(2),
      vatRate: vatRate.toFixed(4),
      tienVAT: tienVAT.toFixed(2),
      phiShip: phiShip.toFixed(2),
      giamGia: giamGia.toFixed(2),
      tongTienCuoi: tongTienCuoi.toFixed(2)
    });

    // Bước 3: Thêm chi tiết hóa đơn
    const chiTietHoaDonData = [];
    for (const item of gioHang.chiTiet) {
      const donGia = new Decimal(item.DonGia);
      const thanhTien = donGia.times(item.SoLuong);

      // Tạo chi tiết hóa đơn
      const chiTiet = await ChiTietHoaDon.create({
        HoaDonID: hoaDon.ID,
        SanPhamID: item.SanPhamID,
        SoLuong: item.SoLuong,
        DonGia: donGia.toFixed(2),
        GiaBan: donGia.toFixed(2),
        ThanhTien: thanhTien.toFixed(2)
      }, { transaction });

      chiTietHoaDonData.push(chiTiet);

      console.log(`📦 Sản phẩm "${item.sanPham.Ten}": ${item.SoLuong} x ${donGia.toFixed(2).toLocaleString('vi-VN')} = ${thanhTien.toFixed(2).toLocaleString('vi-VN')}`);
      
      console.log(`📦 Đã thêm sản phẩm "${item.sanPham.Ten}" vào hóa đơn`);
    }

    // Bước 4: Xóa giỏ hàng sau khi tạo đơn thành công
    await GioHangChiTiet.destroy({
      where: { GioHangID: gioHang.ID },
      transaction
    });

    console.log('🗑️ Đã xóa giỏ hàng');

    // Commit transaction
    await transaction.commit();

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
    res.status(201).json({
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
          // ✅ THÊM: Breakdown giá chi tiết
          priceBreakdown: {
            tongTienSanPham: parseFloat(hoaDonDetail.TongTienSanPham || 0),
            vat: {
              rate: parseFloat(hoaDonDetail.VAT || 0),
              ratePercent: (parseFloat(hoaDonDetail.VAT || 0) * 100).toFixed(2) + '%',
              amount: parseFloat(hoaDonDetail.TienVAT || 0)
            },
            shipping: {
              fee: parseFloat(hoaDonDetail.PhiShip || 0)
            },
            voucher: hoaDonDetail.VoucherID ? {
              voucherId: hoaDonDetail.VoucherID,
              discountAmount: parseFloat(hoaDonDetail.GiamGia || 0)
            } : null,
            tongTienCuoi: parseFloat(hoaDonDetail.TongTien)
          },
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

    // Xử lý lỗi cụ thể
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Mã hóa đơn bị trùng, vui lòng thử lại'
      });
    }

    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({
        success: false,
        message: 'Lỗi cơ sở dữ liệu',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Database Error'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ khi tạo đơn hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Tạo đơn hàng cho khách vãng lai (không cần đăng nhập)
exports.createGuestOrder = async (req, res) => {
  // Bắt đầu transaction
  const transaction = await db.sequelize.transaction();
  
  try {
    console.log('🛒 Bắt đầu tạo đơn hàng cho khách vãng lai');
    
    const { 
      sessionId, // ✅ Nhận sessionId thay vì cartItems
      hoTen,
      email,
      dienThoai,
      diaChi,
      tinhThanh,
      quanHuyen,
      phuongXa,
      phuongThucThanhToanId = 2, // Mặc định VNPay
      ghiChu = ''
    } = req.body;

    console.log('📦 Dữ liệu đặt hàng:', {
      sessionId,
      hoTen,
      email,
      dienThoai,
      diaChi,
      phuongThucThanhToanId
    });

    // Validate dữ liệu đầu vào
    if (!sessionId || sessionId.trim() === '') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Session ID không được để trống'
      });
    }

    if (!hoTen || !hoTen.trim()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập họ tên'
      });
    }

    if (!email || !email.trim()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email'
      });
    }

    if (!dienThoai || !dienThoai.trim()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập số điện thoại'
      });
    }

    if (!diaChi || !diaChi.trim()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập địa chỉ giao hàng'
      });
    }

    // ✅ LẤY GIỎ HÀNG TỪ DATABASE
    const GioHangKhachVangLai = db.GioHangKhachVangLai;
    const cartItems = await GioHangKhachVangLai.findAll({
      where: {
        SessionID: sessionId,
        Enable: true
      },
      include: [{
        model: SanPham,
        as: 'sanPham',
        where: { Enable: true },
        required: true,
        attributes: ['ID', 'Ten', 'GiaBan', 'Ton', 'Enable']
      }],
      transaction
    });

    if (!cartItems || cartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng'
      });
    }

    console.log(`📦 Tìm thấy ${cartItems.length} sản phẩm trong giỏ hàng guest`);

    // Kiểm tra phương thức thanh toán (chỉ cho phép VNPay cho guest)
    if (phuongThucThanhToanId !== 2) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Khách vãng lai chỉ được thanh toán qua VNPay'
      });
    }

    // Kiểm tra phương thức thanh toán có tồn tại không
    const phuongThucThanhToan = await PhuongThucThanhToan.findOne({
      where: {
        ID: phuongThucThanhToanId,
        Enable: true
      }
    });

    if (!phuongThucThanhToan) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Phương thức thanh toán không hợp lệ'
      });
    }

    // Xây dựng địa chỉ đầy đủ
    const diaChiDayDu = `${diaChi}, ${phuongXa || ''}, ${quanHuyen || ''}, ${tinhThanh || ''}`.replace(/,\s*,/g, ',').trim();

    // ✅ PESSIMISTIC LOCKING - LOCK SẢN PHẨM TRONG DB ĐỂ TRÁNH RACE CONDITION
    console.log('🔒 Bắt đầu kiểm tra và lock tồn kho (Guest)...');
    const validationErrors = [];
    const lockedProducts = [];
    const validatedItems = [];

    for (const item of cartItems) {
      // ✅ SELECT FOR UPDATE - Lock bản ghi sản phẩm
      const sanPham = await SanPham.findByPk(item.SanPhamID, {
        lock: transaction.LOCK.UPDATE, // 🔒 PESSIMISTIC LOCK
        transaction
      });

      // Kiểm tra sản phẩm còn kinh doanh
      if (!sanPham || !sanPham.Enable) {
        validationErrors.push(`Sản phẩm "${item.sanPham?.Ten || 'Unknown'}" không tồn tại hoặc đã ngừng kinh doanh`);
        console.error(`❌ Sản phẩm ID ${item.SanPhamID} không tồn tại hoặc bị vô hiệu hóa`);
        continue;
      }

      // ✅ KIỂM TRA TỒN KHO SAU KHI ĐÃ LOCK
      if (item.SoLuong > sanPham.Ton) {
        validationErrors.push(`Sản phẩm "${sanPham.Ten}" chỉ còn ${sanPham.Ton} trong kho (bạn đang yêu cầu ${item.SoLuong})`);
        console.error(`❌ Sản phẩm "${sanPham.Ten}": Yêu cầu ${item.SoLuong}, Còn ${sanPham.Ton}`);
        continue;
      }

      const donGia = new Decimal(sanPham.GiaBan);
      const thanhTien = donGia.times(item.SoLuong);

      validatedItems.push({
        cartItemId: item.ID,
        sanPhamId: sanPham.ID,
        ten: sanPham.Ten,
        soLuong: item.SoLuong,
        donGia: donGia.toFixed(2),
        thanhTien: thanhTien.toFixed(2)
      });

      // ✅ GHI LOG SẢN PHẨM ĐÃ LOCK THÀNH CÔNG
      lockedProducts.push({
        id: sanPham.ID,
        ten: sanPham.Ten,
        tonKho: sanPham.Ton,
        soLuongDat: item.SoLuong,
        conLai: sanPham.Ton - item.SoLuong
      });

      console.log(`🔒 Đã lock sản phẩm "${sanPham.Ten}" - Tồn: ${sanPham.Ton}, Đặt: ${item.SoLuong}`);
      console.log(`📦 Sản phẩm "${sanPham.Ten}": ${item.SoLuong} x ${donGia.toFixed(2).toLocaleString('vi-VN')} = ${thanhTien.toFixed(2).toLocaleString('vi-VN')}`);
    }

    // ❌ Nếu có lỗi validation → Rollback và trả về lỗi
    if (validationErrors.length > 0) {
      await transaction.rollback();
      console.error('❌ Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Có lỗi với một số sản phẩm trong giỏ hàng',
        errors: validationErrors
      });
    }

    console.log(`✅ Đã lock và validate ${lockedProducts.length} sản phẩm thành công`);

    // ✅ SỬ DỤNG DECORATOR PATTERN ĐỂ TÍNH GIÁ (GIỐNG createOrder)
    console.log('💰 Bắt đầu tính giá với Decorator Pattern...');
    
    // Bước 1: Tạo danh sách items cho calculator
    const items = validatedItems.map(item => ({
      sanPhamId: item.sanPhamId,
      ten: item.ten,
      soLuong: item.soLuong,
      donGia: item.donGia
    }));

    // Bước 2: Tạo base calculator
    let priceCalculator = new OrderPriceCalculator(items);
    console.log(`📊 Tổng tiền sản phẩm: ${priceCalculator.calculate().toFixed(2)} VNĐ`);

    // Bước 3: Thêm VAT 10%
    const VAT_RATE = 0.1; // 10% VAT
    priceCalculator = new VATDecorator(priceCalculator, VAT_RATE);
    console.log(`📊 Sau khi thêm VAT ${VAT_RATE * 100}%: ${priceCalculator.calculate().toFixed(2)} VNĐ`);

    // Bước 4: Thêm phí ship
    const SHIPPING_FEE = 30000; // 30k phí ship cố định
    priceCalculator = new ShippingDecorator(priceCalculator, SHIPPING_FEE, {
      method: 'Standard',
      estimatedDays: '3-5'
    });
    console.log(`📊 Sau khi thêm phí ship: ${priceCalculator.calculate().toFixed(2)} VNĐ`);

    // Bước 5: Lấy chi tiết giá và tổng tiền cuối cùng
    const priceDetails = priceCalculator.getDetails();
    const tongTienCuoi = priceCalculator.calculate();

    console.log('💰 Chi tiết giá:', JSON.stringify(priceDetails, null, 2));
    console.log(`💰 Tổng tiền cuối cùng: ${tongTienCuoi.toFixed(2)} VNĐ`);

    // ✅ TRÍCH XUẤT CÁC GIÁ TRỊ TỪ DECORATOR DETAILS
    const tongTienSanPham = new Decimal(priceDetails.tongTienSanPham || 0);
    const vatRate = priceDetails.vat ? new Decimal(priceDetails.vat.rate) : new Decimal(0);
    const tienVAT = priceDetails.vat ? new Decimal(priceDetails.vat.amount) : new Decimal(0);
    const phiShip = priceDetails.shipping ? new Decimal(priceDetails.shipping.fee) : new Decimal(0);
    const giamGia = priceDetails.voucher ? new Decimal(priceDetails.voucher.discountAmount) : new Decimal(0);
    const voucherId = priceDetails.voucher ? priceDetails.voucher.voucherId : null;

    console.log('📊 Breakdown giá:', {
      tongTienSanPham: tongTienSanPham.toFixed(2),
      vatRate: vatRate.toFixed(4),
      tienVAT: tienVAT.toFixed(2),
      phiShip: phiShip.toFixed(2),
      giamGia: giamGia.toFixed(2),
      tongTienCuoi: tongTienCuoi.toFixed(2)
    });

    // Tạo hoặc lấy khách hàng (không liên kết với tài khoản)
    let khachHang = await KhachHang.findOne({
      where: { 
        Email: email.trim(),
        TaiKhoanID: null // Chỉ lấy khách vãng lai
      },
      transaction
    });

    if (!khachHang) {
      // Tạo khách hàng mới (không có TaiKhoanID)
      khachHang = await KhachHang.create({
        TaiKhoanID: null,
        HoTen: hoTen.trim(),
        Email: email.trim(),
        DienThoai: dienThoai.trim(),
        DiaChi: diaChiDayDu
      }, { transaction });
      
      console.log('👤 Đã tạo khách hàng vãng lai mới:', khachHang.ID);
    } else {
      // Cập nhật thông tin khách hàng
      await khachHang.update({
        HoTen: hoTen.trim(),
        DienThoai: dienThoai.trim(),
        DiaChi: diaChiDayDu
      }, { transaction });
      console.log('👤 Đã cập nhật thông tin khách hàng vãng lai:', khachHang.ID);
    }

    // Tạo mã hóa đơn (TRUYỀN transaction vào)
    const maHoaDon = await generateOrderCode(transaction);
    console.log('📄 Mã hóa đơn:', maHoaDon);

    // ✅ TẠO HÓA ĐƠN VỚI CÁC GIÁ TRỊ TỪ DECORATOR PATTERN
    const hoaDon = await HoaDon.create({
      MaHD: maHoaDon,
      KhachHangID: khachHang.ID,
      TongTienSanPham: tongTienSanPham.toFixed(2),     // ✅ Tổng tiền sản phẩm
      VAT: vatRate.toFixed(4),                          // ✅ Tỷ lệ VAT (0.1 = 10%)
      TienVAT: tienVAT.toFixed(2),                      // ✅ Số tiền VAT
      PhiShip: phiShip.toFixed(2),                      // ✅ Phí ship
      VoucherID: voucherId,                             // ✅ ID voucher (nếu có)
      GiamGia: giamGia.toFixed(2),                      // ✅ Số tiền giảm giá
      TongTien: tongTienCuoi.toFixed(2),                // ✅ Tổng tiền cuối cùng
      PhuongThucThanhToanID: phuongThucThanhToanId,
      TrangThai: 'Chờ thanh toán',
      GhiChu: ghiChu || null
    }, { transaction });

    console.log('✅ Đã tạo hóa đơn:', hoaDon.ID);
    console.log('💰 Breakdown lưu vào DB:', {
      tongTienSanPham: tongTienSanPham.toFixed(2),
      vatRate: vatRate.toFixed(4),
      tienVAT: tienVAT.toFixed(2),
      phiShip: phiShip.toFixed(2),
      giamGia: giamGia.toFixed(2),
      tongTienCuoi: tongTienCuoi.toFixed(2)
    });

    // Thêm chi tiết hóa đơn
    for (const item of validatedItems) {
      await ChiTietHoaDon.create({
        HoaDonID: hoaDon.ID,
        SanPhamID: item.sanPhamId,
        SoLuong: item.soLuong,
        DonGia: item.donGia,
        GiaBan: item.donGia,
        ThanhTien: item.thanhTien
      }, { transaction });

      // ❌ BỎ LOGIC TRỪ KHO TẠI ĐÂY
      // Lý do: Guest user chỉ thanh toán qua VNPay
      // Logic trừ kho được xử lý trong payment.controller.js khi thanh toán thành công

      console.log(`📦 Đã thêm sản phẩm "${item.ten}" vào hóa đơn`);
    }

    // ✅ XÓA GIỎ HÀNG GUEST SAU KHI TẠO ĐƠN THÀNH CÔNG
    await GioHangKhachVangLai.update(
      { Enable: false },
      {
        where: { SessionID: sessionId },
        transaction
      }
    );
    console.log('🗑️ Đã xóa giỏ hàng guest');

    // Commit transaction
    await transaction.commit();

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

    console.log('✅ Tạo đơn hàng cho khách vãng lai thành công:', hoaDon.MaHD);

    // Trả về kết quả
    res.status(201).json({
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
    
    console.error('❌ Lỗi tạo đơn hàng cho khách vãng lai:', error);

    // Xử lý lỗi cụ thể
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Mã hóa đơn bị trùng, vui lòng thử lại'
      });
    }

    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({
        success: false,
        message: 'Lỗi cơ sở dữ liệu',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Database Error'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ khi tạo đơn hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * Tìm kiếm tất cả đơn hàng theo email hoặc số điện thoại (không cần đăng nhập)
 * POST /api/orders/guest/search
 * Body: { email?, phoneNumber? }
 */
exports.searchGuestOrders = async (req, res) => {
  try {
    console.log('🔍 Tìm kiếm đơn hàng theo contact');

    const { email, phoneNumber } = req.body;

    // Validate input - Phải có ít nhất 1 trong 2
    if ((!email || !email.trim()) && (!phoneNumber || !phoneNumber.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email hoặc số điện thoại'
      });
    }

    console.log('📋 Tìm kiếm với:', {
      email: email?.trim() || null,
      phoneNumber: phoneNumber?.trim() || null
    });

    // Tìm khách hàng theo email hoặc số điện thoại
    const whereCondition = {
      TaiKhoanID: null // Chỉ lấy khách vãng lai
    };

    if (email && email.trim()) {
      whereCondition.Email = email.trim().toLowerCase();
    } else if (phoneNumber && phoneNumber.trim()) {
      whereCondition.DienThoai = phoneNumber.trim();
    }

    const khachHang = await KhachHang.findAll({
      where: whereCondition,
      attributes: ['ID']
    });

    if (!khachHang || khachHang.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng nào',
        data: {
          orders: []
        }
      });
    }

    const khachHangIds = khachHang.map(kh => kh.ID);

    // Tìm tất cả đơn hàng của khách hàng đó
    const hoaDons = await HoaDon.findAll({
      where: {
        KhachHangID: khachHangIds,
        Enable: true
      },
      include: [
        {
          model: ChiTietHoaDon,
          as: 'chiTiet',
          where: { Enable: true },
          required: false
        }
      ],
      order: [['NgayLap', 'DESC']]
    });

    if (!hoaDons || hoaDons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng nào',
        data: {
          orders: []
        }
      });
    }

    console.log(`✅ Tìm thấy ${hoaDons.length} đơn hàng`);

    // Format dữ liệu trả về
    const orders = hoaDons.map(hd => ({
      maHD: hd.MaHD,
      ngayLap: hd.NgayLap,
      tongTien: parseFloat(hd.TongTien),
      trangThai: hd.TrangThai,
      soSanPham: hd.chiTiet.reduce((sum, item) => sum + item.SoLuong, 0)
    }));

    res.status(200).json({
      success: true,
      message: `Tìm thấy ${orders.length} đơn hàng`,
      data: {
        orders: orders,
        total: orders.length
      }
    });

  } catch (error) {
    console.error('❌ Lỗi tìm kiếm đơn hàng guest:', error);

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

// Lấy danh sách đơn hàng của user
exports.getMyOrders = async (req, res) => {
  try {
    const taiKhoanId = req.user.id;
    
    // Lấy thông tin tài khoản
    const taiKhoan = await TaiKhoan.findByPk(taiKhoanId);
    
    // ✅ SỬA: Tìm khách hàng theo TaiKhoanID trước
    let khachHang = await KhachHang.findOne({
      where: { TaiKhoanID: taiKhoanId }
    });

    // Fallback: tìm theo Email/HoTen (cho dữ liệu cũ)
    if (!khachHang) {
      khachHang = await KhachHang.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            { Email: taiKhoan.Email || null },
            { HoTen: taiKhoan.HoTen }
          ]
        }
      });

      // Nếu tìm thấy, cập nhật TaiKhoanID
      if (khachHang) {
        await khachHang.update({ TaiKhoanID: taiKhoanId });
        console.log('✅ Đã liên kết KhachHang với TaiKhoan:', khachHang.ID);
      }
    }

    if (!khachHang) {
      return res.status(200).json({
        success: true,
        message: 'Bạn chưa có đơn hàng nào',
        data: {
          orders: [],
          total: 0
        }
      });
    }

    // Lấy danh sách đơn hàng
    const hoaDons = await HoaDon.findAll({
      where: {
        KhachHangID: khachHang.ID,
        Enable: true
      },
      include: [
        {
          model: PhuongThucThanhToan,
          as: 'phuongThucThanhToan',
          attributes: ['ID', 'Ten']
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
      order: [['NgayLap', 'DESC']]
    });

    const orders = hoaDons.map(hd => ({
      id: hd.ID,
      maHD: hd.MaHD,
      ngayLap: hd.NgayLap,
      tongTien: parseFloat(hd.TongTien),
      trangThai: hd.TrangThai,
      ghiChu: hd.GhiChu,
      phuongThucThanhToan: hd.phuongThucThanhToan.Ten,
      soLuongSanPham: hd.chiTiet.length
    }));

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách đơn hàng thành công',
      data: {
        orders: orders,
        total: orders.length
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy danh sách đơn hàng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
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

    // ✅ ĐƠN GIẢN HÓA - CHỈ TRẢ VỀ DỮ LIỆU CƠ BẢN
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

    // ✅ KIỂM TRA TRẠNG THÁI ĐƠN HÀNG - CÓ THỂ HỦY KHÔNG?
    const allowedCancelStatuses = ['Chờ xử lý', 'Chờ thanh toán', 'Đã thanh toán'];
    
    // Admin có thể hủy thêm đơn "Đang giao hàng"
    if (isAdmin) {
      allowedCancelStatuses.push('Đang giao hàng');
    }
    
    if (!allowedCancelStatuses.includes(hoaDon.TrangThai)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Không thể hủy đơn hàng ở trạng thái "${hoaDon.TrangThai}"`,
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

    // ✅ XÁC ĐỊNH CÓ CẦN HOÀN KHO KHÔNG
    // LOGIC: Chỉ hoàn kho NẾU đơn hàng đã thanh toán (kho đã bị trừ)
    const shouldRestoreStock = ['Đã thanh toán', 'Đang giao hàng'].includes(hoaDon.TrangThai);
    
    console.log(`📋 Trạng thái đơn hàng: "${hoaDon.TrangThai}"`);
    console.log(`📦 Cần hoàn kho: ${shouldRestoreStock ? 'CÓ (kho đã bị trừ)' : 'KHÔNG (kho chưa bị trừ)'}`);

    const restoredProducts = [];

    // ✅ CHỈ HOÀN KHO NẾU ĐƠN HÀNG ĐÃ THANH TOÁN
    if (shouldRestoreStock && hoaDon.chiTiet.length > 0) {
      console.log(`📦 Bắt đầu hoàn tồn kho cho ${hoaDon.chiTiet.length} sản phẩm`);

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
    } else {
      console.log(`⚠️ Không hoàn kho vì đơn hàng ở trạng thái "${hoaDon.TrangThai}" (kho chưa bị trừ)`);
    }

    // Cập nhật trạng thái đơn hàng
    const cancelNote = `Đơn hàng đã hủy bởi ${isAdmin ? 'Admin' : 'Khách hàng'} lúc ${new Date().toLocaleString('vi-VN')}${shouldRestoreStock ? ' - Đã hoàn kho' : ' - Không hoàn kho (chưa trừ kho)'}`;
    
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
        stockRestored: shouldRestoreStock,
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

    // ✅ SỬA: Tìm khách hàng theo TaiKhoanID trước
    let khachHang = await KhachHang.findOne({
      where: { TaiKhoanID: taiKhoanId }
    });

    // Fallback: tìm theo Email/HoTen (cho dữ liệu cũ)
    if (!khachHang) {
      khachHang = await KhachHang.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            { Email: taiKhoan.Email || null },
            { HoTen: taiKhoan.HoTen }
          ]
        }
      });

      // Nếu tìm thấy, cập nhật TaiKhoanID
      if (khachHang) {
        await khachHang.update({ TaiKhoanID: taiKhoanId });
        console.log('✅ Đã liên kết KhachHang với TaiKhoan:', khachHang.ID);
      }
    }

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

    // ✅ Thêm điều kiện lọc theo trạng thái nếu có (và không phải chuỗi rỗng)
    if (trangThai && trangThai.trim() !== '') {
      whereCondition.TrangThai = trangThai.trim();
      console.log('🔍 Lọc theo trạng thái:', trangThai.trim());
    } else {
      console.log('🔍 Lấy tất cả trạng thái');
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

/**
 * Tra cứu đơn hàng cho khách vãng lai (không cần đăng nhập)
 * POST /api/orders/guest/lookup
 * Body: { orderCode, email?, phoneNumber? }
 * Yêu cầu: (orderCode + email) HOẶC (orderCode + phoneNumber)
 */
exports.guestOrderLookup = async (req, res) => {
  try {
    console.log('🔍 Tra cứu đơn hàng khách vãng lai');

    const { orderCode, email, phoneNumber } = req.body;

    // Validate input - Phải có orderCode
    if (!orderCode || !orderCode.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mã đơn hàng'
      });
    }

    // Validate - Phải có ít nhất email HOẶC phoneNumber
    if ((!email || !email.trim()) && (!phoneNumber || !phoneNumber.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email hoặc số điện thoại để tra cứu'
      });
    }

    console.log('📋 Thông tin tra cứu:', {
      orderCode: orderCode.trim(),
      email: email?.trim() || null,
      phoneNumber: phoneNumber?.trim() || null
    });

    // Bước 1: Tìm đơn hàng theo mã
    const hoaDon = await HoaDon.findOne({
      where: {
        MaHD: orderCode.trim(),
        Enable: true
      },
      include: [
        {
          model: KhachHang,
          as: 'khachHang',
          attributes: ['ID', 'HoTen', 'Email', 'DienThoai', 'DiaChi', 'TaiKhoanID']
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
          required: false,
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
        message: 'Không tìm thấy đơn hàng với mã này'
      });
    }

    // Bước 2: Kiểm tra quyền truy cập - Khớp email HOẶC số điện thoại
    let isAuthorized = false;
    let matchedBy = null;

    // Chuẩn hóa dữ liệu để so sánh
    const inputEmail = email?.trim().toLowerCase();
    const inputPhone = phoneNumber?.trim();
    const orderEmail = hoaDon.khachHang.Email?.toLowerCase();
    const orderPhone = hoaDon.khachHang.DienThoai?.trim();

    // Kiểm tra khớp email
    if (inputEmail && orderEmail && inputEmail === orderEmail) {
      isAuthorized = true;
      matchedBy = 'email';
      console.log('✅ Xác thực thành công qua email');
    }

    // Kiểm tra khớp số điện thoại
    if (inputPhone && orderPhone && inputPhone === orderPhone) {
      isAuthorized = true;
      matchedBy = matchedBy ? 'email_and_phone' : 'phone';
      console.log('✅ Xác thực thành công qua số điện thoại');
    }

    // Nếu không khớp thông tin nào
    if (!isAuthorized) {
      console.log('❌ Thông tin không khớp:', {
        inputEmail,
        orderEmail,
        inputPhone,
        orderPhone
      });
      return res.status(403).json({
        success: false,
        message: 'Thông tin email hoặc số điện thoại không khớp với đơn hàng này'
      });
    }

    // ✅ CHỈ CHO PHÉP TRA CỨU ĐƠN HÀNG CỦA KHÁCH VÃNG LAI
    // (TaiKhoanID = NULL)
    if (hoaDon.khachHang.TaiKhoanID !== null) {
      return res.status(403).json({
        success: false,
        message: 'Đơn hàng này thuộc về tài khoản đã đăng ký. Vui lòng đăng nhập để xem chi tiết.'
      });
    }

    // Bước 3: Trả về thông tin đơn hàng
    console.log(`✅ Tra cứu thành công đơn hàng ${hoaDon.MaHD} (matched by: ${matchedBy})`);

    res.status(200).json({
      success: true,
      message: 'Tìm thấy đơn hàng',
      data: {
        hoaDon: {
          id: hoaDon.ID,
          maHD: hoaDon.MaHD,
          ngayLap: hoaDon.NgayLap,
          tongTien: parseFloat(hoaDon.TongTien),
          trangThai: hoaDon.TrangThai,
          ghiChu: hoaDon.GhiChu,
          khachHang: {
            hoTen: hoaDon.khachHang.HoTen,
            // ✅ CHỈ HIỆN 4 KÝ TỰ CUỐI EMAIL ĐỂ BẢO MẬT
            email: hoaDon.khachHang.Email 
              ? '***' + hoaDon.khachHang.Email.slice(-10)
              : null,
            // ✅ CHỈ HIỆN 4 SỐ CUỐI ĐIỆN THOẠI
            dienThoai: hoaDon.khachHang.DienThoai
              ? '***' + hoaDon.khachHang.DienThoai.slice(-4)
              : null,
            diaChi: hoaDon.khachHang.DiaChi
          },
          phuongThucThanhToan: {
            id: hoaDon.phuongThucThanhToan.ID,
            ten: hoaDon.phuongThucThanhToan.Ten
          },
          chiTiet: hoaDon.chiTiet.map(item => ({
            id: item.ID,
            sanPhamId: item.SanPhamID,
            tenSanPham: item.sanPham.Ten,
            hinhAnh: item.sanPham.HinhAnhURL,
            soLuong: item.SoLuong,
            donGia: parseFloat(item.DonGia),
            thanhTien: parseFloat(item.ThanhTien)
          })),
          tongSoLuongSanPham: hoaDon.chiTiet.reduce((sum, item) => sum + item.SoLuong, 0),
          soLoaiSanPham: hoaDon.chiTiet.length
        },
        matchedBy: matchedBy // Để frontend biết xác thực bằng email hay phone
      }
    });

  } catch (error) {
    console.error('❌ Lỗi tra cứu đơn hàng guest:', error);

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

/**
 * Xem chi tiết đơn hàng công khai (không cần đăng nhập)
 * GET /api/orders/public/:orderCode
 * Dùng ngay sau khi đặt hàng hoặc thanh toán thành công
 * CHỈ hiển thị thông tin cơ bản, KHÔNG YÊU CẦU xác thực email/phone
 */
exports.getPublicOrderDetail = async (req, res) => {
  try {
    console.log('👁️ Xem đơn hàng công khai');

    const { orderCode } = req.params;

    // Validate input
    if (!orderCode || !orderCode.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã đơn hàng'
      });
    }

    console.log('📋 Mã đơn hàng:', orderCode.trim());

    // Tìm đơn hàng theo mã
    const hoaDon = await HoaDon.findOne({
      where: {
        MaHD: orderCode.trim(),
        Enable: true
      },
      include: [
        {
          model: KhachHang,
          as: 'khachHang',
          attributes: ['ID', 'HoTen', 'Email', 'DienThoai', 'DiaChi', 'TaiKhoanID']
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
          required: false,
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
        message: 'Không tìm thấy đơn hàng với mã này'
      });
    }

    // ✅ CHỈ CHO PHÉP XEM ĐƠN HÀNG CỦA KHÁCH VÃNG LAI
    // (TaiKhoanID = NULL)
    // Đơn hàng của user đã đăng ký phải đăng nhập mới xem được
    if (hoaDon.khachHang.TaiKhoanID !== null) {
      return res.status(403).json({
        success: false,
        message: 'Đơn hàng này yêu cầu đăng nhập để xem chi tiết.'
      });
    }

    console.log(`✅ Tìm thấy đơn hàng ${hoaDon.MaHD}`);

    // Trả về thông tin đơn hàng (CHE BỚT thông tin nhạy cảm)
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
            hoTen: hoaDon.khachHang.HoTen,
            // ✅ CHE BỚT EMAIL - chỉ hiện phần cuối
            email: hoaDon.khachHang.Email 
              ? '***' + hoaDon.khachHang.Email.slice(-10)
              : null,
            // ✅ CHE BỚT SĐT - chỉ hiện 4 số cuối
            dienThoai: hoaDon.khachHang.DienThoai
              ? '***' + hoaDon.khachHang.DienThoai.slice(-4)
              : null,
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
          })),
          tongSoLuongSanPham: hoaDon.chiTiet.reduce((sum, item) => sum + item.SoLuong, 0),
          soLoaiSanPham: hoaDon.chiTiet.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi xem đơn hàng công khai:', error);

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

