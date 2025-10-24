const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { cartLimiter } = require('../middlewares/rateLimiter.middleware');

router.use(verifyToken);
router.use(cartLimiter);

// ✅ Routes cụ thể ĐẶT TRƯỚC
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateCartItem);
router.patch('/increment/:productId', cartController.incrementCartItem);
router.patch('/decrement/:productId', cartController.decrementCartItem);
router.delete('/remove/:productId', cartController.removeCartItem);
router.delete('/clear', cartController.clearCart); // ✅ Đặt trước /:id

module.exports = router;
