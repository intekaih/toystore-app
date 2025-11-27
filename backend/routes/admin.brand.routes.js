const express = require('express');
const router = express.Router();
const adminBrandController = require('../controllers/admin.brand.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');
const { uploadBrandLogo, handleUploadError } = require('../middlewares/upload.middleware');

// Tất cả routes đều yêu cầu authentication và quyền admin
router.use(verifyToken);
router.use(requireAdmin);

// GET /api/admin/brands/search - Tìm kiếm để autocomplete
router.get('/search', adminBrandController.searchBrands);

// GET /api/admin/brands - Lấy danh sách thương hiệu
router.get('/', adminBrandController.getAllBrands);

// POST /api/admin/brands - Tạo thương hiệu mới với upload logo
router.post('/', uploadBrandLogo.single('logo'), handleUploadError, adminBrandController.createBrand);

// PUT /api/admin/brands/:id - Cập nhật thương hiệu với upload logo
router.put('/:id', uploadBrandLogo.single('logo'), handleUploadError, adminBrandController.updateBrand);

// DELETE /api/admin/brands/:id - Xóa thương hiệu
router.delete('/:id', adminBrandController.deleteBrand);

module.exports = router;
