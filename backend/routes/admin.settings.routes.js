const express = require('express');
const router = express.Router();
const adminSettingsController = require('../controllers/admin.settings.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

// Tất cả routes đều yêu cầu authentication và quyền admin
router.use(verifyToken);
router.use(requireAdmin);

// GET /api/admin/settings/shipping-fee - Lấy phí ship cố định
router.get('/shipping-fee', adminSettingsController.getShippingFee);

// PUT /api/admin/settings/shipping-fee - Cập nhật phí ship cố định
router.put('/shipping-fee', adminSettingsController.updateShippingFee);

module.exports = router;

