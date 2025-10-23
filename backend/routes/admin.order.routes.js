const express = require('express');
const router = express.Router();
const adminOrderController = require('../controllers/admin.order.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

// Tất cả routes đều yêu cầu authentication và quyền admin
router.use(verifyToken);
router.use(requireAdmin);

// GET /api/admin/orders - Lấy danh sách tất cả đơn hàng
router.get('/', adminOrderController.getAllOrders);

// GET /api/admin/orders/:id - Xem chi tiết 1 đơn hàng
router.get('/:id', adminOrderController.getOrderById);

// PATCH /api/admin/orders/:id/status - Cập nhật trạng thái đơn hàng
router.patch('/:id/status', adminOrderController.updateOrderStatus);

module.exports = router;
