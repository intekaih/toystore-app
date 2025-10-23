const rateLimit = require('express-rate-limit');

/**
 * Rate limiter cho API chung
 * 100 requests mỗi 15 phút cho mỗi IP
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Giới hạn 100 requests
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ IP này. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter cho API đăng nhập
 * 5 requests mỗi 15 phút cho mỗi IP (ngăn chặn brute force)
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Giới hạn 5 lần đăng nhập
  message: {
    success: false,
    message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

/**
 * Rate limiter cho API đăng ký
 * 3 requests mỗi giờ cho mỗi IP (ngăn chặn spam account)
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 3, // Giới hạn 3 tài khoản mới
  message: {
    success: false,
    message: 'Quá nhiều tài khoản được tạo từ IP này. Vui lòng thử lại sau 1 giờ.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter cho API thanh toán VNPay
 * 10 requests mỗi 10 phút
 */
const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 10, // Giới hạn 10 payment requests
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu thanh toán. Vui lòng thử lại sau 10 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter cho API tạo đơn hàng
 * 20 requests mỗi giờ
 */
const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 20, // Giới hạn 20 đơn hàng
  message: {
    success: false,
    message: 'Quá nhiều đơn hàng được tạo. Vui lòng thử lại sau 1 giờ.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter cho API giỏ hàng
 * 50 requests mỗi 10 phút
 */
const cartLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 50, // Giới hạn 50 cart operations
  message: {
    success: false,
    message: 'Quá nhiều thao tác với giỏ hàng. Vui lòng thử lại sau 10 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter cho API cập nhật profile
 * 10 requests mỗi giờ
 */
const profileUpdateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 10, // Giới hạn 10 lần update
  message: {
    success: false,
    message: 'Quá nhiều lần cập nhật thông tin. Vui lòng thử lại sau 1 giờ.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Strict rate limiter cho API nhạy cảm
 * 3 requests mỗi giờ
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 3, // Giới hạn 3 requests
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 giờ.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  paymentLimiter,
  orderLimiter,
  cartLimiter,
  profileUpdateLimiter,
  strictLimiter
};
