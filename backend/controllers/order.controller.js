const db = require('../models');
const Decimal = require('decimal.js');
const DTOMapper = require('../utils/DTOMapper'); // ✅ THÊM DTOMapper

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
 * ✅ HÀM ROLLBACK AN TOÀN - Tránh lỗi "no corresponding BEGIN TRANSACTION"
 * @param {Transaction} transaction - Sequelize transaction
 * @param {string} context - Ngữ cảnh để log (ví dụ: "validation failed")
 */
const safeRollback = async (transaction, context = '') => {
  if (transaction && !transaction.finished) {
    try {
      await transaction.rollback();
      console.log(`🔄 Đã rollback transaction thành công ${context ? `(${context})` : ''}`);
    } catch (rollbackError) {
      console.error(`⚠️ Không thể rollback transaction ${context ? `(${context})` : ''}: ${rollbackError.message}`);
      // Không throw error để tránh crash server
    }
  } else {
    console.log(`⚠️ Transaction đã kết thúc, không thể rollback ${context ? `(${context})` : ''}`);
  }
};

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
  const transaction = await db.sequelize.transaction();
  
  try {
    console.log('🛒 Bắt đầu tạo đơn hàng cho user:', req.user.id);
    
    const taiKhoanId = req.user.id;
    const { 
      phuongThucThanhToanId = 1, 
      ghiChu = '', 
      diaChiGiaoHang = '',
      dienThoai = '',
      // ✅ Nhận thông tin địa chỉ chi tiết (TÊN)
      tinhThanh = '',
      quanHuyen = '',
      phuongXa = '',
      // ✅ THÊM: Nhận MÃ địa chỉ (cho GHN API)
      maTinhID = null,
      maQuanID = null,
      maPhuongXa = null,
      // ✅ Nhận mã voucher (nếu có)
      maVoucher = ''
    } = req.body;

    console.log('📦 Dữ liệu đặt hàng:', {
      dienThoai,
      diaChiGiaoHang,
      tinhThanh,
      quanHuyen,
      phuongXa,
      maTinhID,
      maQuanID,
      maPhuongXa,
      phuongThucThanhToanId,
      maVoucher,
      ghiChu: ghiChu || '(không có)'
    });

    // Validate phương thức thanh toán
    if (!phuongThucThanhToanId) {
      await safeRollback(transaction, 'validate payment method');
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn phương thức thanh toán'
      });
    }

    // Kiểm tra phương thức thanh toán có tồn tại không
    const phuongThucThanhToan = await PhuongThucThanhToan.findOne({
      where: {
        ID: phuongThucThanhToanId
        // ✅ FIX: Xóa Enable vì PhuongThucThanhToan không có cột này
      }
    });

    if (!phuongThucThanhToan) {
      await safeRollback(transaction, 'validate payment method');
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
          attributes: ['ID', 'Ten', 'GiaBan', 'SoLuongTon', 'TrangThai'] // ✅ FIX: Enable → TrangThai, Ton → SoLuongTon
        }]
      }],
      transaction
    });

    // Kiểm tra giỏ hàng có tồn tại và có sản phẩm không
    if (!gioHang || !gioHang.chiTiet || gioHang.chiTiet.length === 0) {
      await safeRollback(transaction, 'validate cart');
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

      if (!sanPham || !sanPham.TrangThai) { // ✅ FIX: Enable → TrangThai
        validationErrors.push(`Sản phẩm "${item.sanPham?.Ten || 'Unknown'}" không còn tồn tại hoặc đã ngừng kinh doanh`);
        console.error(`❌ Sản phẩm ID ${item.SanPhamID} không tồn tại hoặc bị vô hiệu hóa`);
        continue;
      }

      // ✅ KIỂM TRA TỒN KHO SAU KHI ĐÃ LOCK
      // Lúc này tồn kho là giá trị CHÍNH XÁC, không bị thay đổi bởi transaction khác
      if (item.SoLuong > sanPham.SoLuongTon) { // ✅ FIX: Ton → SoLuongTon
        validationErrors.push(`Sản phẩm "${sanPham.Ten}" chỉ còn ${sanPham.SoLuongTon} trong kho (bạn đang yêu cầu ${item.SoLuong})`);
        console.error(`❌ Sản phẩm "${sanPham.Ten}": Yêu cầu ${item.SoLuong}, Còn ${sanPham.SoLuongTon}`);
        continue;
      }

      // ✅ GHI LOG SẢN PHẨM ĐÃ LOCK THÀNH CÔNG
      lockedProducts.push({
        id: sanPham.ID,
        ten: sanPham.Ten,
        tonKho: sanPham.SoLuongTon, // ✅ FIX: Ton → SoLuongTon
        soLuongDat: item.SoLuong,
        conLai: sanPham.SoLuongTon - item.SoLuong // ✅ FIX: Ton → SoLuongTon
      });
      
      console.log(`🔒 Đã lock sản phẩm "${sanPham.Ten}" - Tồn: ${sanPham.SoLuongTon}, Đặt: ${item.SoLuong}`);
    }

    // ❌ Nếu có lỗi validation → Rollback và trả về lỗi
    if (validationErrors.length > 0) {
      await safeRollback(transaction, 'validation failed');
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
    const tongTienSanPham = priceCalculator.calculate();
    console.log(`📊 Tổng tiền sản phẩm: ${tongTienSanPham.toFixed(2)} VNĐ`);

    // ✅ Bước 3: Thêm VAT 10% TRƯỚC (tính trên giá gốc sản phẩm)
    const VAT_RATE = 0.1; // 10% VAT
    priceCalculator = new VATDecorator(priceCalculator, VAT_RATE);
    const tongTienSauVAT = priceCalculator.calculate();
    console.log(`📊 Sau khi thêm VAT ${VAT_RATE * 100}%: ${tongTienSauVAT.toFixed(2)} VNĐ`);

    // ✅ Bước 4: XỬ LÝ VOUCHER SAU VAT (giảm trên giá đã có VAT)
    let voucherData = null;
    if (maVoucher && maVoucher.trim() !== '') {
      const Voucher = db.Voucher;
      const voucher = await Voucher.findOne({
        where: { 
          MaVoucher: maVoucher.trim(),
          TrangThai: 'HoatDong'
        },
        transaction
      });

      if (voucher) {
        const now = new Date();
        if (now >= new Date(voucher.NgayBatDau) && now <= new Date(voucher.NgayKetThuc)) {
          priceCalculator = new VoucherDecorator(priceCalculator, {
            voucherId: voucher.ID,
            code: voucher.MaVoucher,
            type: voucher.LoaiGiamGia,
            value: parseFloat(voucher.GiaTriGiam),
            maxDiscount: voucher.GiamToiDa ? parseFloat(voucher.GiamToiDa) : null,
            minOrderValue: voucher.DonHangToiThieu ? parseFloat(voucher.DonHangToiThieu) : 0
          });
          voucherData = voucher;
          const tongTienSauVoucher = priceCalculator.calculate();
          console.log(`🎟️ Áp dụng voucher: ${voucher.MaVoucher} - Giảm: ${priceCalculator.getDetails().voucher?.discountAmount || 0} VNĐ`);
          console.log(`📊 Sau khi áp dụng voucher: ${tongTienSauVoucher.toFixed(2)} VNĐ`);
        }
      }
    }

    // ✅ Bước 5: Phí ship cuối cùng
    const shippingFee = req.body.tienShip || 30000; // Mặc định 30,000 VNĐ
    
    console.log(`🚚 Phí ship: ${shippingFee.toLocaleString('vi-VN')} VNĐ (Tỉnh: ${tinhThanh || 'Mặc định'})`);

    priceCalculator = new ShippingDecorator(priceCalculator, shippingFee, {
      method: 'Standard',
      estimatedDays: '3-5'
    });
    console.log(`📊 Sau khi thêm phí ship: ${priceCalculator.calculate().toFixed(2)} VNĐ`);

    // Bước 6: Lấy chi tiết giá và tổng tiền cuối cùng
    const priceDetails = priceCalculator.getDetails();
    const tongTienCuoi = priceCalculator.calculate();

    // ✅ TRÍCH XUẤT CÁC GIÁ TRỊ TỪ DECORATOR DETAILS
    const tienGoc = new Decimal(priceDetails.tongTienSanPham || 0);
    const vatRate = priceDetails.vat ? new Decimal(priceDetails.vat.rate) : new Decimal(0);
    const tienVAT = priceDetails.vat ? new Decimal(priceDetails.vat.amount) : new Decimal(0);
    const phiShip = priceDetails.shipping ? new Decimal(priceDetails.shipping.fee) : new Decimal(0);
    const giamGia = priceDetails.voucher ? new Decimal(priceDetails.voucher.discountAmount) : new Decimal(0);
    const voucherId = priceDetails.voucher ? priceDetails.voucher.voucherId : null;

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

    // ✅ QUAN TRỌNG: XÁC ĐỊNH PHƯƠNG THỨC THANH TOÁN TRƯỚC KHI TRỪ KHO
    // Kiểm tra xem đây có phải thanh toán COD hay không
    const isCODPayment = phuongThucThanhToan.Ten.toLowerCase().includes('cod') || 
                         phuongThucThanhToan.Ten.toLowerCase().includes('tiền mặt') ||
                         phuongThucThanhToan.Ten.toLowerCase().includes('khi nhận hàng');
    
    console.log(`💳 Phương thức thanh toán: ${phuongThucThanhToan.Ten} - isCOD: ${isCODPayment}`);

    // ✅ XÁC ĐỊNH TRẠNG THÁI BAN ĐẦU DựA trên phương thức thanh toán
    // - COD: "Chờ xử lý" (admin có thể xử lý ngay, khách đã cam kết mua)
    // - VNPay/Banking: "Chờ thanh toán" (chờ khách thanh toán online)
    const trangThaiBanDau = isCODPayment ? 'Chờ xử lý' : 'Chờ thanh toán';
    
    console.log(`📊 Trạng thái ban đầu: ${trangThaiBanDau} (${isCODPayment ? 'COD' : 'Online Payment'})`);

    // ✅ TẠO HÓA ĐƠN VỚI CÁC GIÁ TRỊ TỪ DECORATOR PATTERN
    // ⚠️ QUAN TRỌNG: HoaDon KHÔNG LƯU địa chỉ theo file toystore.sql
    const hoaDon = await HoaDon.create({
      MaHD: maHoaDon,
      KhachHangID: khachHang.ID,
      TienGoc: tienGoc.toFixed(2),
      TyLeVAT: vatRate.toFixed(4),
      TienVAT: tienVAT.toFixed(2),
      TienShip: phiShip.toFixed(2),
      VoucherID: voucherId,
      GiamGia: giamGia.toFixed(2),
      ThanhTien: tongTienCuoi.toFixed(2),
      PhuongThucThanhToanID: phuongThucThanhToanId,
      TrangThai: trangThaiBanDau,
      GhiChu: ghiChu || null
    }, { transaction });

    console.log('✅ Đã tạo hóa đơn:', hoaDon.ID, '- Trạng thái:', trangThaiBanDau);
    console.log('📝 Ghi chú đã lưu:', hoaDon.GhiChu || '(không có)');

    // ✅ TẠO ĐỊA CHỈ GIAO HÀNG (Bảng DiaChiGiaoHang - Quan hệ 1-1 với HoaDon)
    // Theo file toystore.sql: Địa chỉ lưu ở bảng riêng, không lưu trong HoaDon
    const DiaChiGiaoHang = db.DiaChiGiaoHang;
    await DiaChiGiaoHang.create({
      HoaDonID: hoaDon.ID,
      
      // Mã GHN API (sẽ được cập nhật khi tích hợp GHN)
      MaTinhID: req.body.maTinhID || null,
      MaQuanID: req.body.maQuanID || null,
      MaPhuongXa: req.body.maPhuongXa || null,
      
      // Tên hiển thị
      TenTinh: tinhThanh?.trim() || null,
      TenQuan: quanHuyen?.trim() || null,
      TenPhuong: phuongXa?.trim() || null,
      DiaChiChiTiet: diaChiGiaoHang?.trim() || null,
      
      // Người nhận
      SoDienThoai: dienThoai?.trim() || khachHang.DienThoai || null,
      TenNguoiNhan: khachHang.HoTen || null
    }, { transaction });

    console.log('📍 Đã tạo địa chỉ giao hàng cho hóa đơn:', hoaDon.ID);
    console.log('💰 Breakdown lưu vào DB:', {
      tienGoc: tienGoc.toFixed(2),
      tyLeVAT: vatRate.toFixed(4),
      tienVAT: tienVAT.toFixed(2),
      phiShip: phiShip.toFixed(2),
      giamGia: giamGia.toFixed(2),
      thanhTien: tongTienCuoi.toFixed(2)
    });

    // ✅ YÊU CẦU 2: TRACKING LỊCH SỬ VOUCHER
    if (voucherData && voucherId) {
      console.log('🎟️ ========== BẮT ĐẦU GHI NHẬN VOUCHER ==========');
      console.log('🎟️ voucherData:', JSON.stringify({
        ID: voucherData.ID,
        MaVoucher: voucherData.MaVoucher,
        SuDungToiDaMoiNguoi: voucherData.SuDungToiDaMoiNguoi
      }));
      console.log('🎟️ voucherId:', voucherId);
      console.log('🎟️ HoaDonID:', hoaDon.ID);
      console.log('🎟️ TaiKhoanID:', taiKhoanId);
      console.log('🎟️ GiaTriGiam:', giamGia.toFixed(2));
      
      // 1. Kiểm tra số lần đã dùng voucher của user này
      const LichSuSuDungVoucher = db.LichSuSuDungVoucher;
      const soLanDaSuDung = await LichSuSuDungVoucher.count({
        where: {
          VoucherID: voucherId,
          TaiKhoanID: taiKhoanId
        },
        transaction
      });
      
      console.log(`📊 User đã dùng voucher ${voucherData.MaVoucher}: ${soLanDaSuDung}/${voucherData.SuDungToiDaMoiNguoi} lần`);
      
      // 2. Kiểm tra giới hạn số lần dùng (validation bổ sung)
      if (soLanDaSuDung >= voucherData.SuDungToiDaMoiNguoi) {
        console.error(`❌ User đã hết lượt sử dụng voucher ${voucherData.MaVoucher}`);
        await safeRollback(transaction, 'voucher usage limit exceeded');
        return res.status(400).json({
          success: false,
          message: `Bạn đã dùng hết số lần cho voucher ${voucherData.MaVoucher} (${voucherData.SuDungToiDaMoiNguoi} lần)`
        });
      }
      
      // 3. Lưu lịch sử sử dụng voucher
      console.log('💾 Bắt đầu lưu lịch sử voucher...');
      const lichSuData = {
        VoucherID: voucherId,
        HoaDonID: hoaDon.ID,
        TaiKhoanID: taiKhoanId,
        GiaTriGiam: giamGia.toFixed(2)
        // ✅ BỎ NgaySuDung - để SQL Server tự set với GETDATE()
      };
      console.log('💾 Dữ liệu sẽ lưu:', lichSuData);
      
      // ✅ CHỈ ĐỊNH RÕ RÀNG các field cần insert, LOẠI TRỪ NgaySuDung
      const lichSuVoucher = await LichSuSuDungVoucher.create(lichSuData, { 
        transaction,
        fields: ['VoucherID', 'HoaDonID', 'TaiKhoanID', 'GiaTriGiam'] // ✅ Chỉ insert 4 field này
      });
      
      console.log(`✅ Đã lưu lịch sử voucher với ID: ${lichSuVoucher.ID}`);
      console.log(`✅ User ${taiKhoanId} dùng voucher ${voucherData.MaVoucher}, giảm ${giamGia.toFixed(2)} VNĐ`);
      
      // 4. Cập nhật số lượng đã sử dụng
      console.log('📈 Bắt đầu tăng SoLuongDaSuDung...');
      const [affectedRows] = await db.Voucher.increment('SoLuongDaSuDung', {
        where: { ID: voucherId },
        transaction
      });
      
      console.log(`✅ Đã tăng SoLuongDaSuDung của voucher ${voucherData.MaVoucher} (Affected rows: ${affectedRows})`);
      console.log('🎟️ ========== KẾT THÚC GHI NHẬN VOUCHER ==========');
    } else {
      console.log('⚠️ KHÔNG CÓ VOUCHER ĐỂ GHI NHẬN');
      console.log('⚠️ voucherData:', voucherData);
      console.log('⚠️ voucherId:', voucherId);
      console.log('⚠️ maVoucher từ request:', req.body.maVoucher);
    }

    // Bước 3: Thêm chi tiết hóa đơn
    const chiTietHoaDonData = [];
    for (const item of gioHang.chiTiet) {
      const donGia = new Decimal(item.DonGia);
      const thanhTien = donGia.times(item.SoLuong);

      const chiTiet = await ChiTietHoaDon.create({
        HoaDonID: hoaDon.ID,
        SanPhamID: item.SanPhamID,
        SoLuong: item.SoLuong,
        DonGia: donGia.toFixed(2),
        GiaBan: donGia.toFixed(2),
        ThanhTien: thanhTien.toFixed(2)
      }, { transaction });

      chiTietHoaDonData.push(chiTiet);

      // ✅ QUAN TRỌNG: CHỈ TRỪ KHO CHO COD - VNPAY TRỪ SAU KHI THANH TOÁN THÀNH CÔNG
      // Sử dụng biến isCODPayment đã khai báo ở trên (dòng 449)
      if (isCODPayment) {
        await SanPham.update(
          { SoLuongTon: db.Sequelize.literal(`SoLuongTon - ${item.SoLuong}`) },
          {
            where: { ID: item.SanPhamID },
            transaction
          }
        );
        console.log(`📉 [COD] Đã trừ ${item.SoLuong} sản phẩm "${item.sanPham.Ten}" khỏi kho`);
      } else {
        console.log(`⏳ [VNPay] Giữ kho cho sản phẩm "${item.sanPham.Ten}" - Sẽ trừ sau khi thanh toán thành công`);
      }

      console.log(`📦 Sản phẩm "${item.sanPham.Ten}": ${item.SoLuong} x ${donGia.toFixed(2).toLocaleString('vi-VN')} = ${thanhTien.toFixed(2).toLocaleString('vi-VN')}`);
    }

    // Bước 4: Xóa giỏ hàng - CHỈ XÓA NẾU THANH TOÁN COD
    // ⚠️ QUAN TRỌNG: Nếu thanh toán online (VNPay), giữ giỏ hàng cho đến khi thanh toán thành công
    // Giỏ hàng sẽ được xóa trong payment callback khi thanh toán thành công
    
    if (isCODPayment) {
      // ✅ THANH TOÁN COD - Xóa giỏ hàng ngay vì đơn đã xác nhận
      await GioHangChiTiet.destroy({
        where: { GioHangID: gioHang.ID },
        transaction
      });
      console.log('🗑️ [COD] Đã xóa giỏ hàng - Thanh toán khi nhận hàng');
    } else {
      // ⏳ THANH TOÁN ONLINE - GIỮ GIỎ HÀNG cho đến khi thanh toán thành công
      // Giỏ hàng sẽ được xóa trong payment.controller.js -> processPaymentSuccess()
      console.log('⏳ [Online Payment] Giữ giỏ hàng - Chờ xác nhận thanh toán từ VNPay');
    }

    // Commit transaction
    await transaction.commit();
    
    console.log('✅ Đã commit transaction - Đơn hàng đã được lưu vào DB');

    // ✅ LẤY LẠI THÔNG TIN ĐƠN HÀNG - WRAP TRONG TRY-CATCH ĐỂ TRÁNH LỖI SAU KHI COMMIT
    let hoaDonDetail;
    try {
      hoaDonDetail = await HoaDon.findOne({
        where: { ID: hoaDon.ID },
        include: [
          {
            model: KhachHang,
            as: 'khachHang',
            attributes: ['ID', 'HoTen', 'Email', 'DienThoai'] // ✅ FIX: Xóa 'DiaChi' vì không tồn tại
          },
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
        ]
      });

      if (!hoaDonDetail) {
        throw new Error('Không thể tải lại thông tin đơn hàng');
      }

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
            tongTien: parseFloat(hoaDonDetail.ThanhTien),
            trangThai: hoaDonDetail.TrangThai,
            ghiChu: hoaDonDetail.GhiChu,
            // ✅ THÊM: Thông tin địa chỉ giao hàng
            diaChiGiaoHang: {
              tinhThanh: hoaDonDetail.TinhThanh,
              quanHuyen: hoaDonDetail.QuanHuyen,
              phuongXa: hoaDonDetail.PhuongXa,
              diaChiChiTiet: hoaDonDetail.DiaChiGiaoHang
            },
            // ✅ THÊM: Breakdown giá chi tiết
            priceBreakdown: {
              tienGoc: parseFloat(hoaDonDetail.TienGoc || 0),
              vat: {
                rate: parseFloat(hoaDonDetail.TyLeVAT || 0),
                ratePercent: (parseFloat(hoaDonDetail.TyLeVAT || 0) * 100).toFixed(2) + '%',
                amount: parseFloat(hoaDonDetail.TienVAT || 0)
              },
              shipping: {
                fee: parseFloat(hoaDonDetail.TienShip || 0)
              },
              voucher: hoaDonDetail.VoucherID ? {
                voucherId: hoaDonDetail.VoucherID,
                discountAmount: parseFloat(hoaDonDetail.GiamGia || 0)
              } : null,
              thanhTien: parseFloat(hoaDonDetail.ThanhTien)
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
              ten: hoaDonDetail.phuongThucThanhToan.Ten
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

    } catch (fetchError) {
      // ⚠️ ĐƠN HÀNG ĐÃ TẠO THÀNH CÔNG NHƯNG KHÔNG THỂ TẢI LẠI CHI TIẾT
      // Trả về response tối thiểu để FE biết đơn hàng đã được tạo
      console.error('⚠️ Lỗi khi tải lại thông tin đơn hàng:', fetchError.message);
      console.log('✅ Đơn hàng đã tạo thành công với ID:', hoaDon.ID, 'MaHD:', hoaDon.MaHD);

      return res.status(201).json({
        success: true,
        message: 'Tạo đơn hàng thành công',
        warning: 'Không thể tải đầy đủ thông tin đơn hàng, vui lòng kiểm tra lại trong mục "Đơn hàng của tôi"',
        data: {
          hoaDon: {
            id: hoaDon.ID,
            maHD: hoaDon.MaHD,
            ngayLap: hoaDon.NgayLap,
            tongTien: parseFloat(tongTienCuoi),
            trangThai: 'Chờ thanh toán',
            ghiChu: ghiChu || null,
            diaChiGiaoHang: {
              tinhThanh: tinhThanh?.trim() || null,
              quanHuyen: quanHuyen?.trim() || null,
              phuongXa: phuongXa?.trim() || null,
              diaChiChiTiet: diaChiGiaoHang?.trim() || null
            },
            priceBreakdown: {
              tienGoc: parseFloat(tienGoc),
              vat: {
                rate: parseFloat(vatRate),
                ratePercent: (parseFloat(vatRate) * 100).toFixed(2) + '%',
                amount: parseFloat(tienVAT)
              },
              shipping: {
                fee: parseFloat(phiShip)
              },
              voucher: voucherId ? {
                voucherId: voucherId,
                discountAmount: parseFloat(giamGia)
              } : null,
              thanhTien: parseFloat(tongTienCuoi)
            },
            khachHang: {
              id: khachHang.ID,
              hoTen: khachHang.HoTen,
              email: khachHang.Email,
              dienThoai: khachHang.DienThoai,
              diaChi: khachHang.DiaChi
            },
            phuongThucThanhToan: {
              id: phuongThucThanhToan.ID,
              ten: phuongThucThanhToan.Ten
            },
            chiTiet: gioHang.chiTiet.map(item => ({
              sanPhamId: item.SanPhamID,
              tenSanPham: item.sanPham.Ten,
              hinhAnh: item.sanPham.HinhAnhURL || null,
              soLuong: item.SoLuong,
              donGia: parseFloat(item.DonGia),
              thanhTien: parseFloat(new Decimal(item.DonGia).times(item.SoLuong))
            }))
          }
        }
      });
    }

  } catch (error) {
    // ✅ KIỂM TRA TRẠNG THÁI TRANSACTION TRƯỚC KHI ROLLBACK
    // Chỉ rollback nếu transaction chưa được commit/rollback
    await safeRollback(transaction, 'create order');
    
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

/**
 * ✅ THÊM INCLUDE BẢNG DIACHIGIAOHANG VÀO QUERY GETPUBLICORDERDETAIL
 * 📦 Xem chi tiết đơn hàng bằng mã (PUBLIC - không cần đăng nhập)
 * GET /api/orders/public/:orderCode
 */
exports.getPublicOrderDetail = async (req, res) => {
  try {
    const orderCode = req.params.orderCode;

    if (!orderCode) {
      return res.status(400).json({
        success: false,
        message: 'Mã đơn hàng không hợp lệ'
      });
    }

    console.log('📦 Xem đơn hàng public:', orderCode);

    const hoaDon = await HoaDon.findOne({
      where: { MaHD: orderCode },
      include: [
        {
          model: KhachHang,
          as: 'khachHang',
          attributes: ['ID', 'HoTen', 'Email', 'DienThoai'] // ✅ FIX: Xóa 'DiaChi'
        },
        {
          model: PhuongThucThanhToan,
          as: 'phuongThucThanhToan',
          attributes: ['ID', 'Ten']
        },
        // ✅ THÊM: Include bảng DiaChiGiaoHang
        {
          model: db.DiaChiGiaoHang,
          as: 'diaChiGiaoHang',
          attributes: ['TenTinh', 'TenQuan', 'TenPhuong', 'DiaChiChiTiet', 'SoDienThoai', 'TenNguoiNhan']
        },
        // ✅ THÊM: Include bảng ThongTinVanChuyen
        {
          model: db.ThongTinVanChuyen,
          as: 'thongTinVanChuyen',
          attributes: ['MaVanDon', 'DonViVanChuyen', 'TrangThaiGHN', 'NgayGiaoDuKien', 'NgayGuiHang']
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

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin đơn hàng thành công',
      data: {
        hoaDon: {
          id: hoaDon.ID,
          maHD: hoaDon.MaHD,
          ngayLap: hoaDon.NgayLap,
          tongTien: parseFloat(hoaDon.ThanhTien),
          trangThai: hoaDon.TrangThai,
          ghiChu: hoaDon.GhiChu,
          // ✅ FIX: Lấy địa chỉ từ bảng DiaChiGiaoHang
          diaChiGiaoHang: hoaDon.diaChiGiaoHang ? {
            tinhThanh: hoaDon.diaChiGiaoHang.TenTinh,
            quanHuyen: hoaDon.diaChiGiaoHang.TenQuan,
            phuongXa: hoaDon.diaChiGiaoHang.TenPhuong,
            diaChiChiTiet: hoaDon.diaChiGiaoHang.DiaChiChiTiet,
            soDienThoai: hoaDon.diaChiGiaoHang.SoDienThoai,
            tenNguoiNhan: hoaDon.diaChiGiaoHang.TenNguoiNhan
          } : null,
          priceBreakdown: {
            tienGoc: parseFloat(hoaDon.TienGoc || 0),
            vat: {
              rate: parseFloat(hoaDon.TyLeVAT || 0),
              amount: parseFloat(hoaDon.TienVAT || 0)
            },
            shipping: {
              fee: parseFloat(hoaDon.TienShip || 0)  // ✅ FIX: PhiShip → TienShip
            },
            voucher: hoaDon.VoucherID ? {
              discountAmount: parseFloat(hoaDon.GiamGia || 0)
            } : null,
            thanhTien: parseFloat(hoaDon.ThanhTien)
          },
          khachHang: {
            hoTen: hoaDon.khachHang.HoTen,
            email: hoaDon.khachHang.Email,
            dienThoai: hoaDon.khachHang.DienThoai
            // ✅ FIX: Bỏ diaChi vì không có trong DB
          },
          phuongThucThanhToan: {
            ten: hoaDon.phuongThucThanhToan.Ten
          },
          // ✅ THÊM: Thông tin vận chuyển GHN
          thongTinVanChuyen: hoaDon.thongTinVanChuyen ? {
            maVanDon: hoaDon.thongTinVanChuyen.MaVanDon,
            donViVanChuyen: hoaDon.thongTinVanChuyen.DonViVanChuyen,
            trangThaiGHN: hoaDon.thongTinVanChuyen.TrangThaiGHN,
            ngayGiaoDuKien: hoaDon.thongTinVanChuyen.NgayGiaoDuKien,
            ngayGuiHang: hoaDon.thongTinVanChuyen.NgayGuiHang
          } : null,
          // ✅ THÊM: Lịch sử trạng thái đơn hàng
          chiTiet: hoaDon.chiTiet.map(item => ({
            id: item.ID,
            sanPham: {
              id: item.sanPham.ID,
              ten: item.sanPham.Ten,
              hinhAnh: item.sanPham.HinhAnhURL
            },
            soLuong: item.SoLuong,
            donGia: parseFloat(item.DonGia),
            thanhTien: parseFloat(item.ThanhTien)
          }))
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi xem đơn hàng public:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * 📋 Lấy danh sách đơn hàng của user đang đăng nhập
 * GET /api/orders/my-orders
 */
exports.getMyOrders = async (req, res) => {
  try {
    const taiKhoanId = req.user.id;

    console.log('📋 Lấy danh sách đơn hàng của user:', taiKhoanId);

    // Tìm khách hàng
    const khachHang = await KhachHang.findOne({
      where: { TaiKhoanID: taiKhoanId }
    });

    // ✅ FIX: Nếu chưa có KhachHang, trả về danh sách rỗng (user chưa đặt hàng lần nào)
    if (!khachHang) {
      console.log('👤 User chưa có thông tin khách hàng (chưa đặt hàng lần nào)');
      return res.status(200).json({
        success: true,
        message: 'Bạn chưa có đơn hàng nào',
        data: {
          orders: []
        }
      });
    }

    // Lấy tất cả đơn hàng
    const orders = await HoaDon.findAll({
      where: { KhachHangID: khachHang.ID },
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

    res.status(200).json({
      success: true,
      message: `Tìm thấy ${orders.length} đơn hàng`,
      data: {
        orders: orders.map(o => ({
          id: o.ID,
          maHD: o.MaHD,
          ngayLap: o.NgayLap,
          tongTien: parseFloat(o.ThanhTien),
          thanhTien: parseFloat(o.ThanhTien),
          trangThai: o.TrangThai,
          phuongThucThanhToan: o.phuongThucThanhToan ? {
            id: o.phuongThucThanhToan.ID,
            ten: o.phuongThucThanhToan.Ten
          } : null,
          // ✅ THÊM: Trả về chiTiet đầy đủ
          chiTiet: o.chiTiet.map(item => ({
            id: item.ID,
            soLuong: item.SoLuong,
            donGia: parseFloat(item.DonGia),
            thanhTien: parseFloat(item.ThanhTien),
            sanPham: {
              id: item.sanPham ? item.sanPham.ID : null,
              ten: item.sanPham ? item.sanPham.Ten : 'Sản phẩm không xác định',
              hinhAnhUrl: item.sanPham ? item.sanPham.HinhAnhURL : '',
              hinhAnhURL: item.sanPham ? item.sanPham.HinhAnhURL : '',
              hinhAnh: item.sanPham ? item.sanPham.HinhAnhURL : '',
              giaBan: parseFloat(item.DonGia)
            }
          }))
        }))
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

/**
 * 📜 Lấy lịch sử đơn hàng chi tiết với phân trang
 * GET /api/orders/history?page=1&limit=10&trangThai=Đã giao
 */
exports.getOrderHistory = async (req, res) => {
  try {
    const taiKhoanId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const trangThai = req.query.trangThai; // Filter theo trạng thái (optional)

    console.log('📜 Lấy lịch sử đơn hàng:', { taiKhoanId, page, limit, trangThai });

    // Tìm khách hàng
    const khachHang = await KhachHang.findOne({
      where: { TaiKhoanID: taiKhoanId }
    });

    // ✅ FIX: Nếu chưa có KhachHang, trả về danh sách rỗng
    if (!khachHang) {
      console.log('👤 User chưa có thông tin khách hàng');
      return res.status(200).json({
        success: true,
        message: 'Bạn chưa có đơn hàng nào',
        data: {
          orders: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalOrders: 0,
            recordsPerPage: limit,
            hasNextPage: false,
            hasPrevPage: false
          }
        }
      });
    }

    // Tạo điều kiện where
    const whereCondition = { KhachHangID: khachHang.ID };
    if (trangThai) {
      whereCondition.TrangThai = trangThai;
    }

    // Lấy đơn hàng với phân trang
    const { count, rows } = await HoaDon.findAndCountAll({
      where: whereCondition,
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
            attributes: ['ID', 'Ten', 'HinhAnhURL', 'GiaBan']
          }]
        }
      ],
      limit: limit,
      offset: offset,
      order: [['NgayLap', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      message: 'Lấy lịch sử đơn hàng thành công',
      data: {
        orders: rows.map(o => ({
          id: o.ID,
          maHD: o.MaHD,
          ngayLap: o.NgayLap,
          tongTien: parseFloat(o.ThanhTien),
          trangThai: o.TrangThai,
          ghiChu: o.GhiChu,
          phuongThucThanhToan: {
            id: o.phuongThucThanhToan.ID,
            ten: o.phuongThucThanhToan.Ten
          },
          sanPhams: o.chiTiet.map(item => ({
            id: item.ID,
            tenSanPham: item.sanPham.Ten,
            hinhAnh: item.sanPham.HinhAnhURL,
            soLuong: item.SoLuong,
            donGia: parseFloat(item.DonGia),
            thanhTien: parseFloat(item.ThanhTien)
          }))
        })),
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalOrders: count,
          recordsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy lịch sử đơn hàng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * 🔍 Lấy chi tiết đơn hàng
 * GET /api/orders/:id
 */
exports.getOrderDetail = async (req, res) => {
  try {
    const taiKhoanId = req.user.id;
    const orderId = parseInt(req.params.id);

    if (!orderId || orderId < 1) {
      return res.status(400).json({
        success: false,
        message: 'ID đơn hàng không hợp lệ'
      });
    }

    console.log('🔍 Lấy chi tiết đơn hàng:', orderId);

    // Tìm khách hàng
    const khachHang = await KhachHang.findOne({
      where: { TaiKhoanID: taiKhoanId }
    });

    if (!khachHang) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin khách hàng'
      });
    }

    // Lấy đơn hàng (đảm bảo đơn hàng thuộc về user này)
    const hoaDon = await HoaDon.findOne({
      where: {
        ID: orderId,
        KhachHangID: khachHang.ID
      },
      include: [
        {
          model: KhachHang,
          as: 'khachHang',
          attributes: ['ID', 'HoTen', 'Email', 'DienThoai']
        },
        {
          model: PhuongThucThanhToan,
          as: 'phuongThucThanhToan',
          attributes: ['ID', 'Ten']
        },
        // ✅ THÊM: Include bảng DiaChiGiaoHang
        {
          model: db.DiaChiGiaoHang,
          as: 'diaChiGiaoHang',
          attributes: ['TenTinh', 'TenQuan', 'TenPhuong', 'DiaChiChiTiet', 'SoDienThoai', 'TenNguoiNhan']
        },
        // ✅ THÊM: Include bảng ThongTinVanChuyen
        {
          model: db.ThongTinVanChuyen,
          as: 'thongTinVanChuyen',
          attributes: ['MaVanDon', 'DonViVanChuyen', 'TrangThaiGHN', 'NgayGiaoDuKien', 'NgayGuiHang']
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
        message: 'Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn hàng này'
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
          tongTien: parseFloat(hoaDon.ThanhTien),
          trangThai: hoaDon.TrangThai,
          ghiChu: hoaDon.GhiChu,
          // ✅ FIX: Lấy địa chỉ từ bảng DiaChiGiaoHang
          diaChiGiaoHang: hoaDon.diaChiGiaoHang ? {
            tinhThanh: hoaDon.diaChiGiaoHang.TenTinh,
            quanHuyen: hoaDon.diaChiGiaoHang.TenQuan,
            phuongXa: hoaDon.diaChiGiaoHang.TenPhuong,
            diaChiChiTiet: hoaDon.diaChiGiaoHang.DiaChiChiTiet,
            soDienThoai: hoaDon.diaChiGiaoHang.SoDienThoai,
            tenNguoiNhan: hoaDon.diaChiGiaoHang.TenNguoiNhan
          } : null,
          priceBreakdown: {
            tienGoc: parseFloat(hoaDon.TienGoc || 0),
            vat: {
              rate: parseFloat(hoaDon.TyLeVAT || 0),
              amount: parseFloat(hoaDon.TienVAT || 0)
            },
            shipping: {
              fee: parseFloat(hoaDon.TienShip || 0)
            },
            voucher: hoaDon.VoucherID ? {
              discountAmount: parseFloat(hoaDon.GiamGia || 0)
            } : null,
            thanhTien: parseFloat(hoaDon.ThanhTien)
          },
          khachHang: {
            hoTen: hoaDon.khachHang.HoTen,
            email: hoaDon.khachHang.Email,
            dienThoai: hoaDon.khachHang.DienThoai
          },
          phuongThucThanhToan: {
            id: hoaDon.phuongThucThanhToan.ID,
            ten: hoaDon.phuongThucThanhToan.Ten
          },
          // ✅ THÊM: Thông tin vận chuyển GHN
          thongTinVanChuyen: hoaDon.thongTinVanChuyen ? {
            maVanDon: hoaDon.thongTinVanChuyen.MaVanDon,
            donViVanChuyen: hoaDon.thongTinVanChuyen.DonViVanChuyen,
            trangThaiGHN: hoaDon.thongTinVanChuyen.TrangThaiGHN,
            ngayGiaoDuKien: hoaDon.thongTinVanChuyen.NgayGiaoDuKien,
            ngayGuiHang: hoaDon.thongTinVanChuyen.NgayGuiHang
          } : null,
          // ✅ THÊM: Lịch sử trạng thái đơn hàng
          chiTiet: hoaDon.chiTiet.map(item => ({
            id: item.ID,
            sanPham: {
              id: item.sanPham.ID,
              ten: item.sanPham.Ten,
              hinhAnh: item.sanPham.HinhAnhURL
            },
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

/**
 * 🛒 Tạo đơn hàng cho khách vãng lai (KHÔNG CẦN ĐĂNG NHẬP)
 * POST /api/orders/guest/create
 */
exports.createGuestOrder = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    console.log('🛒 Khách vãng lai tạo đơn hàng');
    
    const { 
      sessionId,
      hoTen,
      email,
      dienThoai,
      diaChiGiaoHang,
      tinhThanh = '',
      quanHuyen = '',
      phuongXa = '',
      maTinhID = null,
      maQuanID = null,
      maPhuongXa = null,
      phuongThucThanhToanId = 1,
      ghiChu = '',
      maVoucher = ''
    } = req.body;

    // Validate dữ liệu bắt buộc
    if (!sessionId) {
      await safeRollback(transaction, 'validate session ID');
      return res.status(400).json({
        success: false,
        message: 'Session ID không hợp lệ'
      });
    }

    if (!hoTen || !dienThoai || !diaChiGiaoHang) {
      await safeRollback(transaction, 'validate guest info');
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin: Họ tên, số điện thoại, địa chỉ'
      });
    }

    console.log('📦 Dữ liệu đặt hàng guest:', {
      sessionId,
      hoTen,
      email,
      dienThoai,
      diaChiGiaoHang,
      phuongThucThanhToanId,
      ghiChu: ghiChu || '(không có)'
    });

    // Kiểm tra phương thức thanh toán
    const phuongThucThanhToan = await PhuongThucThanhToan.findOne({
      where: { ID: phuongThucThanhToanId }
    });

    if (!phuongThucThanhToan) {
      await safeRollback(transaction, 'validate payment method');
      return res.status(404).json({
        success: false,
        message: 'Phương thức thanh toán không hợp lệ'
      });
    }

    // Lấy giỏ hàng guest
    const GioHangKhachVangLai = db.GioHangKhachVangLai;
    const cartItems = await GioHangKhachVangLai.findAll({
      where: { 
        MaPhien: sessionId
        // ✅ BỎ DaChon: true - Lấy tất cả sản phẩm trong giỏ hàng
      },
      include: [{
        model: SanPham,
        as: 'sanPham',
        attributes: ['ID', 'Ten', 'GiaBan', 'SoLuongTon', 'TrangThai']
      }],
      transaction
    });

    if (!cartItems || cartItems.length === 0) {
      await safeRollback(transaction, 'validate cart');
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng trống hoặc chưa chọn sản phẩm nào'
      });
    }

    console.log(`📦 Tìm thấy ${cartItems.length} sản phẩm trong giỏ hàng guest`);

    // Lock và validate tồn kho
    const validationErrors = [];
    for (const item of cartItems) {
      const sanPham = await SanPham.findByPk(item.SanPhamID, {
        lock: transaction.LOCK.UPDATE,
        transaction
      });

      if (!sanPham || !sanPham.TrangThai) {
        validationErrors.push(`Sản phẩm "${item.sanPham?.Ten || 'Unknown'}" không còn tồn tại`);
        continue;
      }

      if (item.SoLuong > sanPham.SoLuongTon) {
        validationErrors.push(`Sản phẩm "${sanPham.Ten}" chỉ còn ${sanPham.SoLuongTon} trong kho`);
        continue;
      }
    }

    if (validationErrors.length > 0) {
      await safeRollback(transaction, 'validation failed');
      return res.status(400).json({
        success: false,
        message: 'Có lỗi với sản phẩm trong giỏ hàng',
        errors: validationErrors
      });
    }

    // Tính giá với Decorator Pattern
    const items = cartItems.map(item => ({
      sanPhamId: item.SanPhamID,
      ten: item.sanPham.Ten,
      soLuong: item.SoLuong,
      donGia: item.DonGia
    }));

    let priceCalculator = new OrderPriceCalculator(items);
    const VAT_RATE = 0.1;
    priceCalculator = new VATDecorator(priceCalculator, VAT_RATE);
    
    const shippingFee = req.body.tienShip || 30000;
    priceCalculator = new ShippingDecorator(priceCalculator, shippingFee, {
      method: 'Standard',
      estimatedDays: '3-5'
    });

    // Xử lý voucher (nếu có)
    let voucherData = null;
    if (maVoucher && maVoucher.trim() !== '') {
      const Voucher = db.Voucher;
      const voucher = await Voucher.findOne({
        where: { 
          MaVoucher: maVoucher.trim(),
          TrangThai: 'HoatDong'
        },
        transaction
      });

      if (voucher) {
        const now = new Date();
        if (now >= new Date(voucher.NgayBatDau) && now <= new Date(voucher.NgayKetThuc)) {
          priceCalculator = new VoucherDecorator(priceCalculator, {
            voucherId: voucher.ID,
            code: voucher.MaVoucher,
            type: voucher.LoaiGiamGia,
            value: parseFloat(voucher.GiaTriGiam),
            maxDiscount: voucher.GiamToiDa ? parseFloat(voucher.GiamToiDa) : null,
            minOrderValue: voucher.DonHangToiThieu ? parseFloat(voucher.DonHangToiThieu) : 0
          });
          voucherData = voucher;
        }
      }
    }

    const priceDetails = priceCalculator.getDetails();
    const tongTienCuoi = priceCalculator.calculate();

    const tienGoc = new Decimal(priceDetails.tongTienSanPham || 0);
    const vatRate = priceDetails.vat ? new Decimal(priceDetails.vat.rate) : new Decimal(0);
    const tienVAT = priceDetails.vat ? new Decimal(priceDetails.vat.amount) : new Decimal(0);
    const phiShip = priceDetails.shipping ? new Decimal(priceDetails.shipping.fee) : new Decimal(0);
    const giamGia = priceDetails.voucher ? new Decimal(priceDetails.voucher.discountAmount) : new Decimal(0);
    const voucherId = priceDetails.voucher ? priceDetails.voucher.voucherId : null;

    // Tạo hoặc lấy khách hàng (KHÔNG CẦN TaiKhoanID)
    let khachHang = await KhachHang.findOne({
      where: { 
        Email: email?.trim() || null,
        DienThoai: dienThoai?.trim()
      },
      transaction
    });

    if (!khachHang) {
      khachHang = await KhachHang.create({
        TaiKhoanID: null, // Guest không có tài khoản
        HoTen: hoTen.trim(),
        Email: email?.trim() || null,
        DienThoai: dienThoai.trim(),
        DiaChi: diaChiGiaoHang.trim()
      }, { transaction });
      
      console.log('👤 Đã tạo khách hàng guest:', khachHang.ID);
    }

    // Tạo mã hóa đơn
    const maHoaDon = await generateOrderCode(transaction);
    console.log('📄 Mã hóa đơn guest:', maHoaDon);

    // Xác định trạng thái ban đầu
    const isCODPayment = phuongThucThanhToan.Ten.toLowerCase().includes('cod') || 
                         phuongThucThanhToan.Ten.toLowerCase().includes('tiền mặt') ||
                         phuongThucThanhToan.Ten.toLowerCase().includes('khi nhận hàng');
    
    const trangThaiBanDau = isCODPayment ? 'Chờ xử lý' : 'Chờ thanh toán';

    // Tạo hóa đơn
    const hoaDon = await HoaDon.create({
      MaHD: maHoaDon,
      KhachHangID: khachHang.ID,
      TienGoc: tienGoc.toFixed(2),
      TyLeVAT: vatRate.toFixed(4),
      TienVAT: tienVAT.toFixed(2),
      TienShip: phiShip.toFixed(2),
      VoucherID: voucherId,
      GiamGia: giamGia.toFixed(2),
      ThanhTien: tongTienCuoi.toFixed(2),
      PhuongThucThanhToanID: phuongThucThanhToanId,
      TrangThai: trangThaiBanDau,
      GhiChu: ghiChu || null
    }, { transaction });

    console.log('✅ Đã tạo hóa đơn guest:', hoaDon.ID);
    console.log('📝 Ghi chú đã lưu:', hoaDon.GhiChu || '(không có)');

    // Tạo địa chỉ giao hàng
    const DiaChiGiaoHang = db.DiaChiGiaoHang;
    await DiaChiGiaoHang.create({
      HoaDonID: hoaDon.ID,
      MaTinhID: maTinhID || null,
      MaQuanID: maQuanID || null,
      MaPhuongXa: maPhuongXa || null,
      TenTinh: tinhThanh?.trim() || null,
      TenQuan: quanHuyen?.trim() || null,
      TenPhuong: phuongXa?.trim() || null,
      DiaChiChiTiet: diaChiGiaoHang?.trim() || null,
      SoDienThoai: dienThoai?.trim() || null,
      TenNguoiNhan: hoTen?.trim() || null
    }, { transaction });

    // Thêm chi tiết hóa đơn và trừ kho
    for (const item of cartItems) {
      const donGia = new Decimal(item.DonGia);
      const thanhTien = donGia.times(item.SoLuong);

      await ChiTietHoaDon.create({
        HoaDonID: hoaDon.ID,
        SanPhamID: item.SanPhamID,
        SoLuong: item.SoLuong,
        DonGia: donGia.toFixed(2),
        GiaBan: donGia.toFixed(2),
        ThanhTien: thanhTien.toFixed(2)
      }, { transaction });

      // Chỉ trừ kho cho COD
      if (isCODPayment) {
        await SanPham.update(
          { SoLuongTon: db.Sequelize.literal(`SoLuongTon - ${item.SoLuong}`) },
          { where: { ID: item.SanPhamID }, transaction }
        );
        console.log(`📉 [COD] Đã trừ ${item.SoLuong} sản phẩm "${item.sanPham.Ten}" khỏi kho`);
      }
    }

    // Xóa giỏ hàng guest nếu COD
    if (isCODPayment) {
      await GioHangKhachVangLai.destroy({
        where: { MaPhien: sessionId },
        transaction
      });
      console.log('🗑️ [COD] Đã xóa giỏ hàng guest');
    } else {
      console.log('⏳ [Online Payment] Giữ giỏ hàng guest - Chờ thanh toán');
    }

    // Commit transaction
    await transaction.commit();
    console.log('✅ Đã commit transaction - Đơn hàng guest đã được tạo');

    return res.status(201).json({
      success: true,
      message: 'Tạo đơn hàng thành công',
      data: {
        hoaDon: {
          id: hoaDon.ID,
          maHD: hoaDon.MaHD,
          ngayLap: hoaDon.NgayLap,
          tongTien: parseFloat(hoaDon.ThanhTien),
          trangThai: hoaDon.TrangThai,
          ghiChu: hoaDon.GhiChu
        }
      }
    });

  } catch (error) {
    await safeRollback(transaction, 'create guest order');
    
    console.error('❌ Lỗi tạo đơn hàng guest:', error);
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ khi tạo đơn hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * 🔍 Tìm tất cả đơn hàng theo email/SĐT (KHÔNG CẦN ĐĂNG NHẬP)
 * POST /api/orders/guest/search
 */
exports.searchGuestOrders = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    console.log('🔍 Tìm đơn hàng khách vãng lai:', { email, phoneNumber });

    // Validate: Phải có ít nhất email hoặc SĐT
    if (!email && !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email hoặc số điện thoại'
      });
    }

    // Tìm khách hàng theo email hoặc SĐT
    const whereCondition = {};
    if (email) whereCondition.Email = email.trim();
    if (phoneNumber) whereCondition.DienThoai = phoneNumber.trim();

    const khachHang = await KhachHang.findAll({
      where: whereCondition
    });

    if (!khachHang || khachHang.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng nào với thông tin này'
      });
    }

    // Lấy tất cả đơn hàng của các khách hàng tìm được
    const khachHangIds = khachHang.map(kh => kh.ID);
    const orders = await HoaDon.findAll({
      where: {
        KhachHangID: khachHangIds
      },
      include: [
        {
          model: KhachHang,
          as: 'khachHang',
          attributes: ['ID', 'HoTen', 'Email', 'DienThoai']
        },
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

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng nào'
      });
    }

    console.log(`✅ Tìm thấy ${orders.length} đơn hàng`);

    res.status(200).json({
      success: true,
      message: `Tìm thấy ${orders.length} đơn hàng`,
      data: orders.map(o => ({
        id: o.ID,
        maHD: o.MaHD,
        ngayLap: o.NgayLap,
        tongTien: parseFloat(o.ThanhTien),
        trangThai: o.TrangThai,
        phuongThucThanhToan: o.phuongThucThanhToan.Ten,
        soSanPham: o.chiTiet.length,
        sanPhamDauTien: o.chiTiet.length > 0 ? {
          ten: o.chiTiet[0].sanPham.Ten,
          hinhAnh: o.chiTiet[0].sanPham.HinhAnhURL
        } : null
      }))
    });

  } catch (error) {
    console.error('❌ Lỗi tìm đơn hàng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * 📱 Tra cứu đơn hàng cho khách vãng lai (KHÔNG CẦN ĐĂNG NHẬP)
 * POST /api/orders/guest/lookup
 */
exports.guestOrderLookup = async (req, res) => {
  try {
    console.log('📱 Tra cứu đơn hàng');
    
    return res.status(501).json({
      success: false,
      message: 'Chức năng tra cứu đơn hàng đang được phát triển'
    });
  } catch (error) {
    console.error('❌ Lỗi tra cứu đơn hàng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * ❌ Hủy đơn hàng (hoàn tồn kho)
 * POST /api/orders/:id/cancel
 */
exports.cancelOrder = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const taiKhoanId = req.user.id;
    const orderId = parseInt(req.params.id);
    const { lyDoHuy = '' } = req.body;

    if (!orderId || orderId < 1) {
      await safeRollback(transaction, 'validate order ID');
      return res.status(400).json({
        success: false,
        message: 'ID đơn hàng không hợp lệ'
      });
    }

    console.log('❌ User hủy đơn hàng:', orderId);

    // Tìm khách hàng
    const khachHang = await KhachHang.findOne({
      where: { TaiKhoanID: taiKhoanId },
      transaction
    });

    if (!khachHang) {
      await safeRollback(transaction, 'validate customer');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin khách hàng'
      });
    }

    // Lấy đơn hàng (với LOCK để tránh race condition)
    const hoaDon = await HoaDon.findOne({
      where: {
        ID: orderId,
        KhachHangID: khachHang.ID
      },
      include: [{
        model: ChiTietHoaDon,
        as: 'chiTiet',
        include: [{
          model: SanPham,
          as: 'sanPham',
          attributes: ['ID', 'Ten', 'SoLuongTon'] // ✅ FIX: Ton → SoLuongTon
        }]
      }],
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!hoaDon) {
      await safeRollback(transaction, 'validate order');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng hoặc bạn không có quyền hủy đơn hàng này'
      });
    }

    // Chỉ cho phép hủy đơn ở trạng thái "Chờ xử lý" hoặc "Chờ thanh toán"
    if (!['Chờ xử lý', 'Chờ thanh toán'].includes(hoaDon.TrangThai)) {
      await safeRollback(transaction, 'validate order status');
      return res.status(400).json({
        success: false,
        message: `Không thể hủy đơn hàng ở trạng thái "${hoaDon.TrangThai}". Chỉ hủy được đơn "Chờ xử lý" hoặc "Chờ thanh toán"`,
        currentStatus: hoaDon.TrangThai
      });
    }

    // Hoàn tồn kho cho tất cả sản phẩm
    console.log('📦 Bắt đầu hoàn tồn kho...');
    for (const item of hoaDon.chiTiet) {
      await SanPham.update(
        { SoLuongTon: db.Sequelize.literal(`SoLuongTon + ${item.SoLuong}`) }, // ✅ FIX: Ton → SoLuongTon
        {
          where: { ID: item.SanPhamID },
          transaction
        }
      );
      console.log(`✅ Hoàn ${item.SoLuong} sản phẩm "${item.sanPham.Ten}" vào kho`);
    }

    // Cập nhật trạng thái đơn hàng
    const cancelNote = `[${new Date().toLocaleString('vi-VN')}] Khách hàng hủy đơn. Lý do: ${lyDoHuy || 'Không nêu lý do'}`;
    const newGhiChu = hoaDon.GhiChu 
      ? `${hoaDon.GhiChu} | ${cancelNote}` 
      : cancelNote;

    await hoaDon.update({
      TrangThai: 'Đã hủy',
      GhiChu: newGhiChu
    }, { transaction });

    // Commit transaction
    await transaction.commit();

    console.log(`✅ Đã hủy đơn hàng ${hoaDon.MaHD} thành công`);

    res.status(200).json({
      success: true,
      message: 'Hủy đơn hàng thành công. Tồn kho đã được hoàn lại.',
      data: {
        orderId: hoaDon.ID,
        maHD: hoaDon.MaHD,
        trangThaiCu: hoaDon.TrangThai,
        trangThaiMoi: 'Đã hủy',
        lyDoHuy: lyDoHuy || 'Không nêu lý do'
      }
    });

  } catch (error) {
    await safeRollback(transaction, 'cancel order');
    console.error('❌ Lỗi hủy đơn hàng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ khi hủy đơn hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

