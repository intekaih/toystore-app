const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { verifyToken, requireStaff, requireAdminOrStaff } = require('../middlewares/auth.middleware');

/**
 * =======================================
 * ROUTES QUẢN LÝ ĐƠN HÀNG - NHÂN VIÊN
 * =======================================
 */

// Lấy danh sách đơn hàng với phân trang và lọc
// GET /api/staff/orders?page=1&limit=10&trangThai=cho_xac_nhan&keyword=DH001
router.get('/orders', verifyToken, requireAdminOrStaff, staffController.getAllOrders);

// Lấy chi tiết đơn hàng
// GET /api/staff/orders/:id
router.get('/orders/:id', verifyToken, requireAdminOrStaff, staffController.getOrderDetail);

// Cập nhật trạng thái đơn hàng
// PUT /api/staff/orders/:id/status
router.put('/orders/:id/status', verifyToken, requireAdminOrStaff, staffController.updateOrderStatus);

// Thống kê đơn hàng theo trạng thái
// GET /api/staff/orders/statistics
router.get('/orders-statistics', verifyToken, requireAdminOrStaff, staffController.getOrderStatistics);

/**
 * =======================================
 * ROUTES QUẢN LÝ SẢN PHẨM - NHÂN VIÊN
 * =======================================
 */

// Lấy danh sách sản phẩm với lọc và phân trang
// GET /api/staff/products?page=1&limit=10&keyword=gấu&trangThai=active
router.get('/products', verifyToken, requireAdminOrStaff, staffController.getAllProducts);

// Cập nhật số lượng tồn kho sản phẩm
// PUT /api/staff/products/:id/stock
router.put('/products/:id/stock', verifyToken, requireAdminOrStaff, staffController.updateProductStock);

// Cập nhật trạng thái sản phẩm (enable/disable)
// PUT /api/staff/products/:id/status
router.put('/products/:id/status', verifyToken, requireAdminOrStaff, staffController.updateProductStatus);

/**
 * =======================================
 * ROUTES QUẢN LÝ ĐÁNH GIÁ - NHÂN VIÊN
 * =======================================
 * ⚠️ CHỨC NĂNG NÀY ĐÃ BỊ TẮT
 */

// Lấy danh sách đánh giá chờ duyệt
// GET /api/staff/reviews/pending?page=1&limit=10
// router.get('/reviews/pending', verifyToken, requireAdminOrStaff, staffController.getPendingReviews);

// Duyệt đánh giá
// POST /api/staff/reviews/:id/approve
// router.post('/reviews/:id/approve', verifyToken, requireAdminOrStaff, staffController.approveReview);

// Từ chối đánh giá
// POST /api/staff/reviews/:id/reject
// router.post('/reviews/:id/reject', verifyToken, requireAdminOrStaff, staffController.rejectReview);

/**
 * =======================================
 * ROUTES DASHBOARD - NHÂN VIÊN
 * =======================================
 */

// Lấy thống kê tổng quan cho dashboard nhân viên
// GET /api/staff/dashboard
router.get('/dashboard', verifyToken, requireAdminOrStaff, staffController.getDashboardStats);

module.exports = router;
