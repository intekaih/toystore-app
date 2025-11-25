const express = require('express');
const router = express.Router();
const adminBrandController = require('../controllers/admin.brand.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

// Tất cả routes đều yêu cầu authentication và quyền admin
router.use(verifyToken);
router.use(requireAdmin);

// GET /api/admin/brands/search - Tìm kiếm để autocomplete
router.get('/search', adminBrandController.searchBrands);

// GET /api/admin/brands - Lấy danh sách thương hiệu
router.get('/', adminBrandController.getAllBrands);

// POST /api/admin/brands - Tạo thương hiệu mới
router.post('/', adminBrandController.createBrand);

// PUT /api/admin/brands/:id - Cập nhật thương hiệu
router.put('/:id', adminBrandController.updateBrand);

// DELETE /api/admin/brands/:id - Xóa thương hiệu
router.delete('/:id', adminBrandController.deleteBrand);

module.exports = router;
