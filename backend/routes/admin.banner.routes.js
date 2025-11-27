const express = require('express');
const router = express.Router();
const adminBannerController = require('../controllers/admin.banner.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');
const { uploadBanner, handleUploadError } = require('../middlewares/upload.middleware');

// Tất cả routes đều yêu cầu authentication và quyền admin
router.use(verifyToken);
router.use(requireAdmin);

// GET /api/admin/banners - Lấy danh sách banner
router.get('/', adminBannerController.getAllBanners);

// GET /api/admin/banners/:id - Xem chi tiết banner
router.get('/:id', adminBannerController.getBannerById);

// POST /api/admin/banners - Tạo banner mới (với file upload)
router.post('/', uploadBanner.single('image'), handleUploadError, adminBannerController.createBanner);

// PUT /api/admin/banners/:id - Cập nhật banner (với file upload)
router.put('/:id', uploadBanner.single('image'), handleUploadError, adminBannerController.updateBanner);

// PATCH /api/admin/banners/:id/toggle - Toggle trạng thái banner
router.patch('/:id/toggle', adminBannerController.toggleBannerStatus);

// DELETE /api/admin/banners/:id - Xóa banner
router.delete('/:id', adminBannerController.deleteBanner);

module.exports = router;

