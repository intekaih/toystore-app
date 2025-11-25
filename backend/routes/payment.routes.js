const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken, optionalAuth } = require('../middlewares/auth.middleware');
const { paymentLimiter } = require('../middlewares/rateLimiter.middleware');

// Tạo URL thanh toán VNPay (hỗ trợ cả guest và logged-in user)
// optionalAuth: cho phép cả user đăng nhập và guest
// ✅ FIX: Đổi từ GET → POST vì frontend gọi POST
router.post('/vnpay/create-payment-url', paymentLimiter, optionalAuth, paymentController.createVNPayPaymentUrl);

// Return URL từ VNPay (không yêu cầu đăng nhập vì VNPay redirect)
router.get('/vnpay/return', paymentController.vnpayReturn);

// IPN từ VNPay (không yêu cầu đăng nhập)
router.get('/vnpay/ipn', paymentController.vnpayIPN);

module.exports = router;
