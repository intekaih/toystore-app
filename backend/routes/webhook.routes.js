/**
 * 🔔 WEBHOOK ROUTES
 * Routes cho webhook callbacks từ các dịch vụ bên ngoài
 */

const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

/**
 * POST /api/webhooks/ghn
 * Webhook từ Giao Hàng Nhanh
 * ⚠️ KHÔNG CẦN AUTHENTICATION (GHN gọi từ bên ngoài)
 */
router.post('/ghn', webhookController.handleGHNWebhook);

/**
 * GET /api/shipping/provinces
 * Lấy danh sách tỉnh/thành phố
 */
router.get('/shipping/provinces', webhookController.getProvinces);

/**
 * GET /api/shipping/districts/:provinceId
 * Lấy danh sách quận/huyện theo tỉnh
 */
router.get('/shipping/districts/:provinceId', webhookController.getDistricts);

/**
 * GET /api/shipping/wards/:districtId
 * Lấy danh sách phường/xã theo quận
 */
router.get('/shipping/wards/:districtId', webhookController.getWards);

/**
 * POST /api/shipping/calculate-fee
 * Tính phí vận chuyển
 */
router.post('/shipping/calculate-fee', webhookController.calculateShippingFee);

module.exports = router;
