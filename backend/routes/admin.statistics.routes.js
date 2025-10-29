const express = require('express');
const router = express.Router();
const adminStatisticsController = require('../controllers/admin.statistics.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

// Tất cả routes đều yêu cầu authentication và quyền admin
router.use(verifyToken);
router.use(requireAdmin);

// GET /api/admin/statistics/dashboard - Lấy thống kê tổng quan cho dashboard
router.get('/dashboard', adminStatisticsController.getDashboardStats);

// GET /api/admin/statistics - Lấy thống kê tổng quan
router.get('/', adminStatisticsController.getStatistics);

// GET /api/admin/statistics/revenue - Lấy thống kê doanh thu chi tiết
router.get('/revenue', adminStatisticsController.getRevenueStatistics);

// GET /api/admin/statistics/products - Lấy thống kê sản phẩm chi tiết
router.get('/products', adminStatisticsController.getProductStatistics);

module.exports = router;
