const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shipping.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

// ✅ Public routes - Không cần đăng nhập
// Lấy danh sách tỉnh/thành
router.get('/provinces', shippingController.getProvinces);

// Lấy danh sách quận/huyện
router.get('/districts/:provinceId', shippingController.getDistricts);

// Lấy danh sách phường/xã
router.get('/wards/:districtId', shippingController.getWards);

// Tính phí ship (cho khách hàng khi checkout)
router.post('/calculate-fee', shippingController.calculateShippingFee);

// ✅ Routes cần authentication
// Tracking đơn hàng (khách hàng có thể xem)
router.get('/:orderCode/tracking', shippingController.trackOrder);

// ✅ Lấy trạng thái GHN từ database
router.get('/orders/:orderId/ghn-status', verifyToken, shippingController.getGHNStatus);

// ✅ Đồng bộ trạng thái GHN từ API vào database
router.post('/orders/:orderId/sync-ghn-status', verifyToken, shippingController.syncGHNStatus);

// ✅ Lấy chi tiết tracking GHN với timeline
router.get('/orders/:orderId/ghn-tracking', verifyToken, shippingController.getGHNTracking);

// ✅ Admin routes - Cần quyền admin
// Tạo đơn GHN khi bàn giao shipper
router.post('/admin/:id/create-ghn-order', verifyToken, requireAdmin, shippingController.createGHNOrder);

// In phiếu giao hàng
router.post('/admin/print-label', verifyToken, requireAdmin, shippingController.getPrintLabel);

// ✅ MOCK ROUTES - Chỉ dùng trong development (không cần auth để dễ test)
// Chuyển trạng thái đơn hàng sang bước tiếp theo
router.post('/mock/advance-status/:ghnOrderCode', shippingController.advanceMockStatus);

// Đặt trạng thái cụ thể cho đơn hàng
router.post('/mock/set-status/:ghnOrderCode', shippingController.setMockStatus);

// Lấy danh sách tất cả đơn hàng mock
router.get('/mock/orders', shippingController.getMockOrders);

module.exports = router;
