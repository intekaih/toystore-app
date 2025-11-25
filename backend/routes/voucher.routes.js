const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucher.controller');

// ============================================
// 🎟️ API CÔNG KHAI CHO VOUCHER
// ============================================

/**
 * POST /api/vouchers/apply
 * Kiểm tra và áp dụng mã voucher
 * Body: { maVoucher, tongTien }
 */
router.post('/apply', voucherController.applyVoucher);

/**
 * GET /api/vouchers/active
 * Lấy danh sách voucher đang hoạt động
 */
router.get('/active', voucherController.getActiveVouchers);

module.exports = router;
