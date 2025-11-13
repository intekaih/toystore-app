const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { cartLimiter } = require('../middlewares/rateLimiter.middleware');

// =======================================
// GUEST CART ROUTES (Không cần đăng nhập)
// =======================================
router.get('/guest', cartLimiter, cartController.getGuestCart);
router.post('/guest/add', cartLimiter, cartController.addToGuestCart);
router.put('/guest/update', cartLimiter, cartController.updateGuestCartItem);
router.patch('/guest/increment/:productId', cartLimiter, cartController.incrementGuestCartItem);
router.patch('/guest/decrement/:productId', cartLimiter, cartController.decrementGuestCartItem);
router.delete('/guest/remove/:productId', cartLimiter, cartController.removeGuestCartItem);
router.delete('/guest/clear', cartLimiter, cartController.clearGuestCart);
// ✅ THÊM: Route khôi phục giỏ hàng sau khi thanh toán thất bại
router.post('/guest/restore', cartLimiter, cartController.restoreGuestCart);

// =======================================
// AUTHENTICATED CART ROUTES (Cần đăng nhập)
// =======================================
// Tất cả routes dưới đây yêu cầu authentication
router.use(verifyToken);

// Áp dụng rate limiter cho tất cả cart operations (50 lần/10 phút)
router.use(cartLimiter);

// Lấy giỏ hàng của user
router.get('/', cartController.getCart);

// Thêm sản phẩm vào giỏ hàng
router.post('/add', cartController.addToCart);

// Cập nhật số lượng sản phẩm trong giỏ
router.put('/update', cartController.updateCartItem);

// Tăng 1 đơn vị sản phẩm
router.patch('/increment/:productId', cartController.incrementCartItem);

// Giảm 1 đơn vị sản phẩm
router.patch('/decrement/:productId', cartController.decrementCartItem);

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/remove/:productId', cartController.removeCartItem);

// Xóa toàn bộ giỏ hàng
router.delete('/clear', cartController.clearCart);

module.exports = router;
