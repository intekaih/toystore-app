const express = require('express');
const router = express.Router();
const adminOrderController = require('../controllers/admin.order.controller');
const webhookController = require('../controllers/webhook.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

// Tất cả routes đều yêu cầu authentication và quyền admin
router.use(verifyToken);
router.use(requireAdmin);

// ⭐ GET /api/admin/orders/counts/by-status - Lấy số lượng đơn hàng theo trạng thái (PHẢI ĐẶT TRƯỚC /:id)
router.get('/counts/by-status', adminOrderController.getOrderCountsByStatus);

// GET /api/admin/orders/customers - Lấy danh sách khách hàng từ đơn hàng
router.get('/customers', adminOrderController.getCustomersFromOrders);

// ❌ TEMPORARY: Commented out - function doesn't exist yet
// router.post('/print-label', webhookController.printGHNLabel);

// GET /api/admin/orders - Lấy danh sách tất cả đơn hàng
router.get('/', adminOrderController.getAllOrders);

// GET /api/admin/orders/:id - Xem chi tiết 1 đơn hàng
router.get('/:id', adminOrderController.getOrderById);

// 🔍 GET /api/admin/orders/:id/tracking - Lấy thông tin tracking từ GHN
router.get('/:id/tracking', webhookController.getGHNTracking);

// PATCH /api/admin/orders/:id/status - Cập nhật trạng thái đơn hàng (general)
router.patch('/:id/status', adminOrderController.updateOrderStatus);

// ⭐ THÊM MỚI: Các API quản lý trạng thái cụ thể
// POST /api/admin/orders/:id/confirm - Xác nhận đơn hàng
router.post('/:id/confirm', adminOrderController.confirmOrder);

// POST /api/admin/orders/:id/pack - Chuyển sang đóng gói
router.post('/:id/pack', adminOrderController.packOrder);

// 🚚 POST /api/admin/orders/:id/create-shipping - Tạo đơn GHN và lấy mã vận đơn (BƯỚC 1)
router.post('/:id/create-shipping', adminOrderController.createShippingOrder);

// ✅ POST /api/admin/orders/:id/packed - Xác nhận đã đóng gói xong (ENDPOINT MỚI)
router.post('/:id/packed', adminOrderController.markAsPacked);

// 📦 POST /api/admin/orders/:id/ship - Bàn giao shipper (BƯỚC 2 - sau khi dán mã)
router.post('/:id/ship', adminOrderController.shipOrder);

// POST /api/admin/orders/:id/delivered - Xác nhận đã giao hàng
router.post('/:id/delivered', adminOrderController.markAsDelivered);

// POST /api/admin/orders/:id/complete - Hoàn thành đơn hàng
router.post('/:id/complete', adminOrderController.completeOrder);

// POST /api/admin/orders/:id/delivery-failed - Đánh dấu giao hàng thất bại
router.post('/:id/delivery-failed', adminOrderController.markDeliveryFailed);

module.exports = router;
