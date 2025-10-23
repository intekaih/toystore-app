const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { orderLimiter } = require('../middlewares/rateLimiter.middleware');

// Tất cả routes đều yêu cầu authentication
router.use(verifyToken);

// POST /api/orders/create - Tạo đơn hàng từ giỏ hàng (giới hạn 20 lần/giờ)
router.post('/create', orderLimiter, orderController.createOrder);

// GET /api/orders/my-orders - Lấy danh sách đơn hàng của user
router.get('/my-orders', orderController.getMyOrders);

// GET /api/orders/history - Lấy lịch sử đơn hàng chi tiết với phân trang
router.get('/history', orderController.getOrderHistory);

// GET /api/orders/:id - Lấy chi tiết đơn hàng
router.get('/:id', orderController.getOrderDetail);

// POST /api/orders/:id/cancel - Hủy đơn hàng (hoàn tồn kho) (giới hạn 20 lần/giờ)
router.post('/:id/cancel', orderLimiter, orderController.cancelOrder);

module.exports = router;
