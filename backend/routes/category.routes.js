const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

// Tất cả routes đều yêu cầu authentication và quyền admin
router.use(verifyToken);
router.use(requireAdmin);

// GET /api/admin/categories/search - Tìm kiếm để autocomplete
router.get('/search', categoryController.searchCategories);

// GET /api/admin/categories - Lấy danh sách tất cả danh mục
router.get('/', categoryController.getAllCategories);

// POST /api/admin/categories - Thêm danh mục mới
router.post('/', categoryController.createCategory);

// PUT /api/admin/categories/:id - Cập nhật danh mục
router.put('/:id', categoryController.updateCategory);

// DELETE /api/admin/categories/:id - Xóa danh mục
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
