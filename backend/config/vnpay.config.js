require('dotenv').config();

module.exports = {
  // Thông tin VNPay Sandbox (test environment)
  vnp_TmnCode: process.env.VNP_TMNCODE || process.env.VNP_TMN_CODE || 'YOUR_TMNCODE', // Mã website tại VNPay
  vnp_HashSecret: process.env.VNP_HASHSECRET || process.env.VNP_HASH_SECRET || 'YOUR_HASH_SECRET', // Chuỗi bí mật
  vnp_Url: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', // URL thanh toán VNPay
  vnp_Api: process.env.VNP_API || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
  vnp_ReturnUrl: process.env.VNP_RETURNURL || process.env.VNP_RETURN_URL || 'http://localhost:5000/api/payment/vnpay/return', // URL return sau khi thanh toán
  
  // Cấu hình bổ sung
  vnp_Version: '2.1.0',
  vnp_Command: 'pay',
  vnp_CurrCode: 'VND',
  vnp_Locale: 'vn', // 'vn' hoặc 'en'
  vnp_OrderType: 'other', // Loại hàng hóa
  vnp_IpnUrl: process.env.VNP_IPNURL || process.env.VNP_IPN_URL || 'http://localhost:5000/api/payment/vnpay/ipn', // URL nhận IPN
};
