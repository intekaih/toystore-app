const crypto = require('crypto');
const querystring = require('qs');
const vnpayConfig = require('../config/vnpay.config');
const db = require('../models');
const HoaDon = db.HoaDon;
const ChiTietHoaDon = db.ChiTietHoaDon;

/**
 * Sắp xếp object theo key (yêu cầu của VNPay)
 */
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

/**
 * Tạo chữ ký secure hash SHA256
 */
function createSecureHash(data, secretKey) {
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(data, 'utf-8')).digest('hex');
  return signed;
}

/**
 * ✅ HÀM CHUNG XỬ LÝ THANH TOÁN THÀNH CÔNG
 * Trừ kho và cập nhật trạng thái đơn hàng
 * Được gọi bởi cả vnpayReturn và vnpayIPN
 * 
 * @param {Object} hoaDon - Đơn hàng cần xử lý
 * @param {Object} paymentInfo - Thông tin thanh toán {transactionNo, bankCode, source}
 * @param {Object} transaction - Sequelize transaction
 * @returns {Object} {success, message, outOfStockItems}
 */
async function processPaymentSuccess(hoaDon, paymentInfo, transaction) {
  const { transactionNo, bankCode, source } = paymentInfo;
  
  console.log(`🔄 [${source}] Xử lý thanh toán thành công cho đơn hàng ${hoaDon.MaHD}`);

  // ✅ KIỂM TRA TRẠNG THÁI ĐƠN HÀNG - TRÁNH XỬ LÝ TRÙNG LẶP
  if (hoaDon.TrangThai === 'Đã thanh toán') {
    console.log(`⚠️ [${source}] Đơn hàng đã được xử lý thanh toán trước đó, bỏ qua`);
    return {
      success: true,
      message: 'Đơn hàng đã được xử lý trước đó',
      alreadyProcessed: true
    };
  }

  if (hoaDon.TrangThai === 'Đã hủy') {
    console.log(`⚠️ [${source}] Đơn hàng đã bị hủy, không thể xử lý thanh toán`);
    return {
      success: false,
      message: 'Đơn hàng đã bị hủy',
      alreadyCancelled: true
    };
  }

  // Lấy chi tiết đơn hàng với sản phẩm
  const chiTietHoaDon = await ChiTietHoaDon.findAll({
    where: {
      HoaDonID: hoaDon.ID,
      Enable: true
    },
    include: [{
      model: db.SanPham,
      as: 'sanPham',
      attributes: ['ID', 'Ten', 'Ton']
    }],
    transaction
  });

  console.log(`📦 [${source}] Bắt đầu kiểm tra và trừ kho cho ${chiTietHoaDon.length} sản phẩm`);

  // ✅ KIỂM TRA TỒN KHO TRƯỚC KHI TRỪ - VỚI PESSIMISTIC LOCK
  const outOfStockItems = [];
  for (const item of chiTietHoaDon) {
    // ✅ PESSIMISTIC LOCK - Lock bản ghi sản phẩm để tránh race condition
    const sanPham = await db.SanPham.findByPk(item.SanPhamID, {
      lock: transaction.LOCK.UPDATE, // 🔒 LOCK bản ghi này
      transaction
    });
    
    if (!sanPham) {
      outOfStockItems.push({
        name: item.sanPham.Ten,
        requested: item.SoLuong,
        available: 0
      });
      console.error(`❌ [${source}] Sản phẩm "${item.sanPham.Ten}" không tồn tại`);
    } else if (sanPham.Ton < item.SoLuong) {
      outOfStockItems.push({
        name: sanPham.Ten,
        requested: item.SoLuong,
        available: sanPham.Ton
      });
      console.error(`❌ [${source}] Sản phẩm "${sanPham.Ten}" không đủ hàng: Cần ${item.SoLuong}, Còn ${sanPham.Ton}`);
    }
  }

  // ❌ Nếu có sản phẩm hết hàng → Trả về lỗi
  if (outOfStockItems.length > 0) {
    console.error(`❌ [${source}] Không đủ hàng trong kho:`, outOfStockItems);
    return {
      success: false,
      message: 'Không đủ hàng trong kho',
      outOfStockItems: outOfStockItems
    };
  }

  // ✅ TRỪ KHO SAU KHI ĐÃ LOCK VÀ KIỂM TRA
  for (const item of chiTietHoaDon) {
    // ✅ ĐÃ LOCK Ở TRÊN rồi, giờ chỉ cần update
    const sanPham = await db.SanPham.findByPk(item.SanPhamID, { 
      transaction,
      lock: transaction.LOCK.UPDATE // 🔒 LOCK lại để đảm bảo an toàn
    });
    const tonTruoc = sanPham.Ton;
    
    // ✅ TRỪ KHO VỚI ĐIỀU KIỆN AN TOÀN
    const [affectedRows] = await db.SanPham.update(
      { Ton: db.sequelize.literal(`Ton - ${item.SoLuong}`) },
      {
        where: { 
          ID: item.SanPhamID,
          // ✅ KIỂM TRA LẠI TỒN KHO NGAY TRƯỚC KHI TRỪ (double-check)
          Ton: { [db.Sequelize.Op.gte]: item.SoLuong }
        },
        transaction
      }
    );

    // ✅ KIỂM TRA affectedRows ĐỂ ĐẢM BẢO TRỪ KHO THÀNH CÔNG
    if (affectedRows === 0) {
      console.error(`❌ [${source}] Không thể trừ kho sản phẩm "${item.sanPham.Ten}" - Có thể đã hết hàng`);
      return {
        success: false,
        message: `Không thể trừ kho sản phẩm "${item.sanPham.Ten}"`,
        outOfStockItems: [{
          name: item.sanPham.Ten,
          requested: item.SoLuong,
          available: sanPham.Ton
        }]
      };
    }

    console.log(`✅ [${source}] Trừ ${item.SoLuong} sản phẩm "${item.sanPham.Ten}" khỏi kho`);
    console.log(`   📊 Tồn kho: ${tonTruoc} → ${tonTruoc - item.SoLuong}`);
  }

  // ✅ CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
  await hoaDon.update({
    TrangThai: 'Đã thanh toán',
    GhiChu: `Thanh toán VNPay - Mã GD: ${transactionNo} - Ngân hàng: ${bankCode} - Nguồn: ${source}`
  }, { transaction });

  console.log(`✅ [${source}] Cập nhật trạng thái đơn hàng thành công`);

  return {
    success: true,
    message: 'Xử lý thanh toán thành công'
  };
}

/**
 * Tạo URL thanh toán VNPay
 * GET /api/payment/vnpay/create-payment-url
 */
exports.createVNPayPaymentUrl = async (req, res) => {
  try {
    console.log('💳 Tạo URL thanh toán VNPay - Params:', req.query);

    const { orderId, amount, bankCode, language } = req.query;
    // Không bắt buộc phải có user (hỗ trợ guest checkout)
    const taiKhoanId = req.user?.id;

    // Validate input
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu mã đơn hàng (orderId)'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền không hợp lệ'
      });
    }

    // Kiểm tra đơn hàng có tồn tại không
    const hoaDon = await HoaDon.findOne({
      where: {
        ID: orderId,
        Enable: true
      },
      include: [{
        model: db.KhachHang,
        as: 'khachHang',
        required: true
      }]
    });

    if (!hoaDon) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // ✅ VALIDATE AMOUNT - KIỂM TRA SỐ TIỀN KHỚP VỚI ĐƠN HÀNG
    const requestAmount = parseFloat(amount);
    const orderAmount = parseFloat(hoaDon.TongTien);
    
    console.log('💰 Kiểm tra số tiền:', {
      requestAmount: requestAmount,
      orderAmount: orderAmount,
      match: requestAmount === orderAmount
    });

    // ✅ SỐ TIỀN PHẢI KHỚP CHÍNH XÁC
    if (requestAmount !== orderAmount) {
      console.error(`❌ Số tiền không khớp: Request=${requestAmount}, Order=${orderAmount}`);
      return res.status(400).json({
        success: false,
        message: 'Số tiền thanh toán không khớp với đơn hàng',
        data: {
          requestAmount: requestAmount,
          orderAmount: orderAmount,
          difference: Math.abs(requestAmount - orderAmount)
        }
      });
    }

    // ✅ KIỂM TRA TRẠNG THÁI ĐƠN HÀNG - CHỈ CHO PHÉP THANH TOÁN "CHỜ THANH TOÁN"
    const allowedStatuses = ['Chờ thanh toán', 'Chờ xử lý'];
    if (!allowedStatuses.includes(hoaDon.TrangThai)) {
      console.error(`❌ Trạng thái đơn hàng không hợp lệ: ${hoaDon.TrangThai}`);
      return res.status(400).json({
        success: false,
        message: `Không thể thanh toán đơn hàng ở trạng thái "${hoaDon.TrangThai}"`,
        data: {
          currentStatus: hoaDon.TrangThai,
          allowedStatuses: allowedStatuses
        }
      });
    }

    // Lấy IP address của client
    let ipAddr = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    // Lấy IPv4 nếu có IPv6
    if (ipAddr && ipAddr.includes('::ffff:')) {
      ipAddr = ipAddr.split('::ffff:')[1];
    }

    // Tạo ngày giờ theo format của VNPay: yyyyMMddHHmmss
    const createDate = new Date();
    const vnp_CreateDate = createDate.toISOString()
      .replace(/[-:TZ.]/g, '')
      .slice(0, 14);

    // Tạo mã giao dịch unique (txnRef)
    const vnp_TxnRef = `${hoaDon.MaHD}_${Date.now()}`;

    // Tạo order info
    const vnp_OrderInfo = `Thanh toan don hang ${hoaDon.MaHD}`;

    // Build VNPay parameters
    // ✅ SỬ DỤNG orderAmount (từ DB) THAY VÌ amount (từ request)
    let vnp_Params = {
      vnp_Version: vnpayConfig.vnp_Version,
      vnp_Command: vnpayConfig.vnp_Command,
      vnp_TmnCode: vnpayConfig.vnp_TmnCode,
      vnp_Locale: language || vnpayConfig.vnp_Locale,
      vnp_CurrCode: vnpayConfig.vnp_CurrCode,
      vnp_TxnRef: vnp_TxnRef,
      vnp_OrderInfo: vnp_OrderInfo,
      vnp_OrderType: vnpayConfig.vnp_OrderType,
      vnp_Amount: Math.round(orderAmount * 100), // ✅ Dùng orderAmount từ DB, làm tròn để tránh lỗi số thập phân
      vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: vnp_CreateDate
    };

    // Thêm bankCode nếu có (cho phép chọn ngân hàng cụ thể)
    if (bankCode) {
      vnp_Params.vnp_BankCode = bankCode;
    }

    console.log('📝 VNPay params trước khi sort:', vnp_Params);

    // Sắp xếp params theo key (yêu cầu của VNPay)
    vnp_Params = sortObject(vnp_Params);

    console.log('📝 VNPay params sau khi sort:', vnp_Params);

    // Tạo query string
    const signData = querystring.stringify(vnp_Params, { encode: false });

    console.log('📝 Sign data:', signData);

    // Tạo secure hash
    const secureHash = createSecureHash(signData, vnpayConfig.vnp_HashSecret);

    console.log('🔐 Secure hash:', secureHash);

    // Thêm secure hash vào params
    vnp_Params['vnp_SecureHash'] = secureHash;

    // Tạo URL thanh toán
    const paymentUrl = vnpayConfig.vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });

    console.log('✅ Tạo URL thanh toán thành công');
    console.log('🔗 Payment URL:', paymentUrl);

    res.status(200).json({
      success: true,
      message: 'Tạo URL thanh toán VNPay thành công',
      data: {
        paymentUrl: paymentUrl,
        orderId: orderId,
        orderCode: hoaDon.MaHD,
        amount: orderAmount, // ✅ Trả về amount từ DB
        txnRef: vnp_TxnRef
      }
    });

  } catch (error) {
    console.error('❌ Lỗi tạo URL thanh toán VNPay:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * Xử lý Return URL từ VNPay (sau khi khách hàng thanh toán)
 * GET /api/payment/vnpay/return
 */
exports.vnpayReturn = async (req, res) => {
  // Bắt đầu transaction
  const transaction = await db.sequelize.transaction();
  
  try {
    console.log('🔙 VNPay Return - Query params:', req.query);

    let vnp_Params = req.query;

    // Lấy secure hash từ VNPay gửi về
    const secureHash = vnp_Params['vnp_SecureHash'];

    // Xóa các tham số không cần thiết để verify
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp params
    vnp_Params = sortObject(vnp_Params);

    // Tạo sign data
    const signData = querystring.stringify(vnp_Params, { encode: false });

    console.log('📝 Sign data for verification:', signData);

    // Tạo secure hash để verify
    const checkSum = createSecureHash(signData, vnpayConfig.vnp_HashSecret);

    console.log('🔐 CheckSum:', checkSum);
    console.log('🔐 SecureHash from VNPay:', secureHash);

    // Verify secure hash
    if (secureHash !== checkSum) {
      await transaction.rollback();
      console.error('❌ Chữ ký không hợp lệ');
      // Redirect về frontend với error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/payment/return?success=false&message=Invalid_signature`);
    }

    // Lấy thông tin từ VNPay
    const vnp_TxnRef = vnp_Params['vnp_TxnRef'];
    const vnp_Amount = vnp_Params['vnp_Amount'] / 100; // Chia 100 vì VNPay nhân 100
    const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
    const vnp_TransactionNo = vnp_Params['vnp_TransactionNo'];
    const vnp_BankCode = vnp_Params['vnp_BankCode'];
    const vnp_PayDate = vnp_Params['vnp_PayDate'];

    console.log('💰 Thông tin giao dịch:', {
      txnRef: vnp_TxnRef,
      amount: vnp_Amount,
      responseCode: vnp_ResponseCode,
      transactionNo: vnp_TransactionNo,
      bankCode: vnp_BankCode,
      payDate: vnp_PayDate
    });

    // Lấy orderId từ txnRef (format: MaHD_timestamp)
    const orderCode = vnp_TxnRef.split('_')[0];

    // Lấy thông tin đơn hàng với chi tiết sản phẩm
    const hoaDon = await HoaDon.findOne({
      where: { MaHD: orderCode },
      include: [
        {
          model: db.KhachHang,
          as: 'khachHang',
          attributes: ['ID', 'HoTen', 'Email']
        },
        {
          model: ChiTietHoaDon,
          as: 'chiTiet',
          where: { Enable: true },
          required: false,
          include: [{
            model: db.SanPham,
            as: 'sanPham',
            attributes: ['ID', 'Ten', 'Ton', 'HinhAnhURL']
          }]
        }
      ],
      transaction
    });

    if (!hoaDon) {
      await transaction.rollback();
      console.error('❌ Return URL - Không tìm thấy đơn hàng');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/payment/return?success=false&message=Order_not_found`);
    }

    // ✅ VALIDATE AMOUNT - KIỂM TRA SỐ TIỀN KHỚP VỚI ĐƠN HÀNG
    const orderAmount = parseFloat(hoaDon.TongTien);
    if (orderAmount !== vnp_Amount) {
      await transaction.rollback();
      console.error(`❌ Return URL - Số tiền không khớp: Order=${orderAmount}, VNPay=${vnp_Amount}`);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/payment/return?success=false&message=Invalid_amount&orderAmount=${orderAmount}&vnpayAmount=${vnp_Amount}`);
    }

    // Kiểm tra kết quả thanh toán
    if (vnp_ResponseCode === '00') {
      // ✅ Thanh toán thành công - TRỪ KHO VÀ CẬP NHẬT TRẠNG THÁI
      console.log('✅ Giao dịch thành công');

      if (hoaDon) {
        const paymentInfo = {
          transactionNo: vnp_TransactionNo,
          bankCode: vnp_BankCode,
          source: 'Return URL'
        };

        const result = await processPaymentSuccess(hoaDon, paymentInfo, transaction);

        if (!result.success) {
          await transaction.rollback();
          console.error('❌ Lỗi xử lý thanh toán:', result.message);

          // Cập nhật đơn hàng thành "Đã hủy" do hết hàng (transaction mới)
          const newTransaction = await db.sequelize.transaction();
          try {
            await hoaDon.update({
              TrangThai: 'Đã hủy',
              GhiChu: `Thanh toán thành công nhưng hết hàng - Sản phẩm: ${result.outOfStockItems.map(i => `${i.name} (cần ${i.requested}, còn ${i.available})`).join(', ')}`
            }, { transaction: newTransaction });
            await newTransaction.commit();
            console.log('✅ Đã hủy đơn hàng do hết hàng');
          } catch (updateError) {
            await newTransaction.rollback();
            console.error('❌ Lỗi cập nhật trạng thái đơn hàng:', updateError);
          }

          // Redirect về frontend với lỗi hết hàng
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          const redirectParams = new URLSearchParams({
            success: 'false',
            responseCode: 'OUT_OF_STOCK',
            message: encodeURIComponent('Thanh toán thành công nhưng một số sản phẩm đã hết hàng. Đơn hàng đã được hủy và bạn sẽ được hoàn tiền trong 5-7 ngày làm việc.'),
            orderId: hoaDon?.ID || '',
            orderCode: orderCode,
            outOfStockItems: JSON.stringify(result.outOfStockItems)
          });
          return res.redirect(`${frontendUrl}/payment/return?${redirectParams.toString()}`);
        }
      }

      // Commit transaction
      await transaction.commit();

      // Redirect về frontend với success
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectParams = new URLSearchParams({
        success: 'true',
        orderId: hoaDon?.ID || '',
        orderCode: orderCode,
        amount: vnp_Amount,
        transactionNo: vnp_TransactionNo,
        bankCode: vnp_BankCode,
        payDate: vnp_PayDate,
        responseCode: vnp_ResponseCode
      });
      
      return res.redirect(`${frontendUrl}/payment/return?${redirectParams.toString()}`);
    } else {
      // ❌ Thanh toán thất bại - CHỈ HỦY ĐƠN HÀNG (KHÔNG hoàn trả kho)
      console.log('❌ Giao dịch thất bại - Mã lỗi:', vnp_ResponseCode);

      if (hoaDon) {
        // ✅ KIỂM TRA trạng thái đơn hàng để tránh xử lý trùng lặp
        if (hoaDon.TrangThai === 'Đã hủy') {
          console.log('⚠️ Đơn hàng đã được xử lý trước đó (IPN), bỏ qua');
          await transaction.commit();
          
          // Map mã lỗi VNPay
          const errorMessages = {
            '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
            '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
            '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
            '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
            '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
            '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
            '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
            '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
            '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
            '75': 'Ngân hàng thanh toán đang bảo trì.',
            '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
            '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
          };
          const errorMessage = errorMessages[vnp_ResponseCode] || 'Giao dịch không thành công';
          
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          const redirectParams = new URLSearchParams({
            success: 'false',
            responseCode: vnp_ResponseCode,
            message: encodeURIComponent(errorMessage),
            txnRef: vnp_TxnRef,
            amount: vnp_Amount,
            orderId: hoaDon?.ID || '',
            orderCode: orderCode,
            cartItems: hoaDon ? JSON.stringify(hoaDon.chiTiet.map(item => ({
              id: item.SanPhamID,
              name: item.sanPham.Ten,
              price: item.DonGia,
              quantity: item.SoLuong,
              image: item.sanPham.HinhAnhURL || '',
              stock: item.sanPham.Ton
            }))) : '[]'
          });
          
          return res.redirect(`${frontendUrl}/payment/return?${redirectParams.toString()}`);
        }

        console.log(`📝 Hủy đơn hàng - Không cần hoàn trả kho (chưa trừ kho)`);

        // ⚠️ QUAN TRỌNG: KHÔNG hoàn trả kho vì kho chưa bị trừ
        // Logic: Kho CHỈ bị trừ KHI THANH TOÁN THÀNH CÔNG (vnp_ResponseCode === '00')
        // Khi thanh toán thất bại, kho vẫn nguyên như ban đầu
        // Chỉ cần cập nhật trạng thái đơn hàng thành "Đã hủy"

        // Cập nhật trạng thái đơn hàng thành "Đã hủy"
        const cancelNote = `Thanh toán VNPay thất bại - Mã lỗi: ${vnp_ResponseCode} - Đơn hàng đã hủy (Return URL)`;
        await hoaDon.update({
          TrangThai: 'Đã hủy',
          GhiChu: hoaDon.GhiChu ? `${hoaDon.GhiChu} | ${cancelNote}` : cancelNote
        }, { transaction });

        console.log('✅ Đã hủy đơn hàng - Kho giữ nguyên');
      }

      // Commit transaction
      await transaction.commit();

      // Map mã lỗi VNPay
      const errorMessages = {
        '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
        '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
        '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
        '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
        '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
        '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
        '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
        '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
        '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
        '75': 'Ngân hàng thanh toán đang bảo trì.',
        '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
        '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
      };

      const errorMessage = errorMessages[vnp_ResponseCode] || 'Giao dịch không thành công';

      // Redirect về frontend với error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectParams = new URLSearchParams({
        success: 'false',
        responseCode: vnp_ResponseCode,
        message: encodeURIComponent(errorMessage),
        txnRef: vnp_TxnRef,
        amount: vnp_Amount,
        orderId: hoaDon?.ID || '',
        orderCode: orderCode,
        cartItems: hoaDon ? JSON.stringify(hoaDon.chiTiet.map(item => ({
          id: item.SanPhamID,
          name: item.sanPham.Ten,
          price: item.DonGia,
          quantity: item.SoLuong,
          image: item.sanPham.HinhAnhURL || '',
          stock: item.sanPham.Ton
        }))) : '[]'
      });
      
      return res.redirect(`${frontendUrl}/payment/return?${redirectParams.toString()}`);
    }

  } catch (error) {
    // Rollback transaction nếu có lỗi
    await transaction.rollback();
    
    console.error('❌ Lỗi xử lý VNPay return:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/payment/return?success=false&message=Server_error`);
  }
};

/**
 * Xử lý IPN (Instant Payment Notification) từ VNPay
 * POST /api/payment/vnpay/ipn
 */
exports.vnpayIPN = async (req, res) => {
  // Bắt đầu transaction
  const transaction = await db.sequelize.transaction();
  
  try {
    console.log('📨 VNPay IPN - Query params:', req.query);

    let vnp_Params = req.query;

    // Lấy secure hash
    const secureHash = vnp_Params['vnp_SecureHash'];

    // Xóa các tham số không cần verify
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp params
    vnp_Params = sortObject(vnp_Params);

    // Tạo sign data
    const signData = querystring.stringify(vnp_Params, { encode: false });

    // Verify secure hash
    const checkSum = createSecureHash(signData, vnpayConfig.vnp_HashSecret);

    if (secureHash !== checkSum) {
      await transaction.rollback();
      console.error('❌ IPN - Chữ ký không hợp lệ');
      return res.status(200).json({
        RspCode: '97',
        Message: 'Invalid Checksum'
      });
    }

    // Lấy thông tin
    const vnp_TxnRef = vnp_Params['vnp_TxnRef'];
    const vnp_Amount = vnp_Params['vnp_Amount'] / 100;
    const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
    const vnp_TransactionNo = vnp_Params['vnp_TransactionNo'];
    const vnp_BankCode = vnp_Params['vnp_BankCode'];

    console.log('💰 IPN - Thông tin giao dịch:', {
      txnRef: vnp_TxnRef,
      amount: vnp_Amount,
      responseCode: vnp_ResponseCode,
      transactionNo: vnp_TransactionNo
    });

    // Lấy orderId từ txnRef
    const orderCode = vnp_TxnRef.split('_')[0];

    // Tìm đơn hàng với chi tiết sản phẩm
    const hoaDon = await HoaDon.findOne({
      where: { MaHD: orderCode },
      include: [
        {
          model: ChiTietHoaDon,
          as: 'chiTiet',
          where: { Enable: true },
          required: false,
          include: [{
            model: db.SanPham,
            as: 'sanPham',
            attributes: ['ID', 'Ten', 'Ton']
          }]
        }
      ],
      transaction
    });

    if (!hoaDon) {
      await transaction.rollback();
      console.error('❌ IPN - Không tìm thấy đơn hàng');
      return res.status(200).json({
        RspCode: '01',
        Message: 'Order not found'
      });
    }

    // Kiểm tra số tiền
    if (parseFloat(hoaDon.TongTien) !== vnp_Amount) {
      await transaction.rollback();
      console.error('❌ IPN - Số tiền không khớp');
      return res.status(200).json({
        RspCode: '04',
        Message: 'Invalid amount'
      });
    }

    // Kiểm tra trạng thái đơn hàng
    if (hoaDon.TrangThai === 'Đã thanh toán' || hoaDon.TrangThai === 'Đã hủy') {
      await transaction.commit();
      console.log('⚠️ IPN - Đơn hàng đã được xử lý trước đó');
      return res.status(200).json({
        RspCode: '02',
        Message: 'Order already confirmed'
      });
    }

    // Xử lý theo response code
    if (vnp_ResponseCode === '00') {
      // Thanh toán thành công - cập nhật đơn hàng
      const paymentInfo = {
        transactionNo: vnp_TransactionNo,
        bankCode: vnp_BankCode,
        source: 'IPN'
      };

      const result = await processPaymentSuccess(hoaDon, paymentInfo, transaction);

      if (!result.success) {
        await transaction.rollback();
        console.error('❌ Lỗi xử lý thanh toán:', result.message);
        return res.status(200).json({
          RspCode: '99',
          Message: result.message
        });
      }

      await transaction.commit();
      console.log('✅ IPN - Cập nhật đơn hàng thành công');

      return res.status(200).json({
        RspCode: '00',
        Message: 'Success'
      });
    } else {
      // ❌ Thanh toán thất bại - CHỈ HỦY ĐƠN HÀNG (KHÔNG hoàn trả kho)
      console.log('❌ IPN - Giao dịch thất bại - Mã lỗi:', vnp_ResponseCode);
      console.log(`📝 IPN - Hủy đơn hàng - Không cần hoàn trả kho (chưa trừ kho)`);

      // ⚠️ QUAN TRỌNG: KHÔNG hoàn trả kho vì kho chưa bị trừ
      // Logic: Kho CHỈ bị trừ KHI THANH TOÁN THÀNH CÔNG (vnp_ResponseCode === '00')
      // Khi thanh toán thất bại, kho vẫn nguyên như ban đầu
      // Chỉ cần cập nhật trạng thái đơn hàng thành "Đã hủy"

      // Cập nhật trạng thái đơn hàng thành "Đã hủy"
      const cancelNote = `Thanh toán VNPay thất bại - Mã lỗi: ${vnp_ResponseCode} - Đơn hàng đã hủy (IPN)`;
      await hoaDon.update({
        TrangThai: 'Đã hủy',
        GhiChu: hoaDon.GhiChu ? `${hoaDon.GhiChu} | ${cancelNote}` : cancelNote
      }, { transaction });

      await transaction.commit();
      console.log('✅ IPN - Đã hủy đơn hàng - Kho giữ nguyên');

      return res.status(200).json({
        RspCode: '00',
        Message: 'Success'
      });
    }

  } catch (error) {
    // Rollback transaction nếu có lỗi
    await transaction.rollback();
    
    console.error('❌ Lỗi xử lý VNPay IPN:', error);
    return res.status(200).json({
      RspCode: '99',
      Message: 'Unknown error'
    });
  }
};
