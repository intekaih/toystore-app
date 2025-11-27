const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner.controller');

// GET /api/banners - Lấy danh sách banner đang active (public, không cần auth)
router.get('/', bannerController.getActiveBanners);

module.exports = router;

