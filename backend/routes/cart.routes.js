const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { cartLimiter } = require('../middlewares/rateLimiter.middleware');

// Tất cả routes đều yêu cầu authentication
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
