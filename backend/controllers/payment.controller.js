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
 * Tạo URL thanh toán VNPay
 * GET /api/payment/vnpay/create-payment-url
 */
exports.createVNPayPaymentUrl = async (req, res) => {
  try {
    console.log('💳 Tạo URL thanh toán VNPay - Params:', req.query);

    const { orderId, amount, bankCode, language } = req.query;
    const taiKhoanId = req.user.id;

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

    // Kiểm tra đơn hàng có tồn tại và thuộc về user không
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
    let vnp_Params = {
      vnp_Version: vnpayConfig.vnp_Version,
      vnp_Command: vnpayConfig.vnp_Command,
      vnp_TmnCode: vnpayConfig.vnp_TmnCode,
      vnp_Locale: language || vnpayConfig.vnp_Locale,
      vnp_CurrCode: vnpayConfig.vnp_CurrCode,
      vnp_TxnRef: vnp_TxnRef,
      vnp_OrderInfo: vnp_OrderInfo,
      vnp_OrderType: vnpayConfig.vnp_OrderType,
      vnp_Amount: parseInt(amount) * 100, // VNPay yêu cầu amount * 100
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
        amount: parseInt(amount),
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

    // Kiểm tra kết quả thanh toán
    if (vnp_ResponseCode === '00') {
      // Thanh toán thành công
      console.log('✅ Giao dịch thành công');

      // Lấy orderId từ txnRef (format: MaHD_timestamp)
      const orderCode = vnp_TxnRef.split('_')[0];

      // Cập nhật trạng thái đơn hàng
      const hoaDon = await HoaDon.findOne({
        where: { MaHD: orderCode }
      });

      if (hoaDon) {
        await hoaDon.update({
          TrangThai: 'Đã thanh toán',
          GhiChu: `Thanh toán VNPay - Mã GD: ${vnp_TransactionNo} - Ngân hàng: ${vnp_BankCode}`
        });
        console.log('✅ Cập nhật trạng thái đơn hàng thành công');
      }

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
      // Thanh toán thất bại
      console.log('❌ Giao dịch thất bại - Mã lỗi:', vnp_ResponseCode);

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
        amount: vnp_Amount
      });
      
      return res.redirect(`${frontendUrl}/payment/return?${redirectParams.toString()}`);
    }

  } catch (error) {
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

    // Tìm đơn hàng
    const hoaDon = await HoaDon.findOne({
      where: { MaHD: orderCode }
    });

    if (!hoaDon) {
      console.error('❌ IPN - Không tìm thấy đơn hàng');
      return res.status(200).json({
        RspCode: '01',
        Message: 'Order not found'
      });
    }

    // Kiểm tra số tiền
    if (parseFloat(hoaDon.TongTien) !== vnp_Amount) {
      console.error('❌ IPN - Số tiền không khớp');
      return res.status(200).json({
        RspCode: '04',
        Message: 'Invalid amount'
      });
    }

    // Kiểm tra trạng thái đơn hàng
    if (hoaDon.TrangThai === 'Đã thanh toán') {
      console.log('⚠️ IPN - Đơn hàng đã được xác nhận trước đó');
      return res.status(200).json({
        RspCode: '02',
        Message: 'Order already confirmed'
      });
    }

    // Xử lý theo response code
    if (vnp_ResponseCode === '00') {
      // Thanh toán thành công - cập nhật đơn hàng
      await hoaDon.update({
        TrangThai: 'Đã thanh toán',
        GhiChu: `Thanh toán VNPay - Mã GD: ${vnp_TransactionNo} - Ngân hàng: ${vnp_BankCode}`
      });

      console.log('✅ IPN - Cập nhật đơn hàng thành công');

      return res.status(200).json({
        RspCode: '00',
        Message: 'Success'
      });
    } else {
      // Thanh toán thất bại
      await hoaDon.update({
        TrangThai: 'Thanh toán thất bại',
        GhiChu: `Thanh toán VNPay thất bại - Mã lỗi: ${vnp_ResponseCode}`
      });

      console.log('❌ IPN - Thanh toán thất bại');

      return res.status(200).json({
        RspCode: '00',
        Message: 'Success'
      });
    }

  } catch (error) {
    console.error('❌ Lỗi xử lý VNPay IPN:', error);
    return res.status(200).json({
      RspCode: '99',
      Message: 'Unknown error'
    });
  }
};
