const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { paymentLimiter } = require('../middlewares/rateLimiter.middleware');

// Tạo URL thanh toán VNPay (yêu cầu đăng nhập + rate limit 10 lần/10 phút)
router.get('/vnpay/create-payment-url', verifyToken, paymentLimiter, paymentController.createVNPayPaymentUrl);

// Return URL từ VNPay (không yêu cầu đăng nhập vì VNPay redirect)
router.get('/vnpay/return', paymentController.vnpayReturn);

// IPN từ VNPay (không yêu cầu đăng nhập)
router.get('/vnpay/ipn', paymentController.vnpayIPN);

module.exports = router;
