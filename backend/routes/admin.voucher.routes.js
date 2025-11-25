const express = require('express');
const router = express.Router();
const adminVoucherController = require('../controllers/admin.voucher.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

// Tất cả routes đều yêu cầu authentication và quyền admin
router.use(verifyToken);
router.use(requireAdmin);

// GET /api/admin/vouchers - Lấy danh sách voucher
router.get('/', adminVoucherController.getAllVouchers);

// GET /api/admin/vouchers/:id - Xem chi tiết voucher
router.get('/:id', adminVoucherController.getVoucherById);

// POST /api/admin/vouchers - Tạo voucher mới
router.post('/', adminVoucherController.createVoucher);

// PUT /api/admin/vouchers/:id - Cập nhật voucher
router.put('/:id', adminVoucherController.updateVoucher);

// PATCH /api/admin/vouchers/:id/status - Cập nhật trạng thái voucher
router.patch('/:id/status', adminVoucherController.updateVoucherStatus);

// DELETE /api/admin/vouchers/:id - Xóa voucher
router.delete('/:id', adminVoucherController.deleteVoucher);

// GET /api/admin/vouchers/:id/history - Lịch sử sử dụng voucher
router.get('/:id/history', adminVoucherController.getVoucherHistory);

module.exports = router;