const express = require('express');
const router = express.Router();
const adminProductController = require('../controllers/admin.product.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');
const { upload, handleUploadError } = require('../middlewares/upload.middleware');

// Tất cả routes đều yêu cầu authentication và quyền admin
router.use(verifyToken);
router.use(requireAdmin);

// GET /api/admin/products - Lấy danh sách tất cả sản phẩm
router.get('/', adminProductController.getAllProducts);

// POST /api/admin/products - Thêm sản phẩm mới với upload ảnh
// upload.array('hinhAnh', 5) - field name trong form-data phải là 'hinhAnh', tối đa 5 ảnh
router.post('/', upload.array('hinhAnh', 5), handleUploadError, adminProductController.createProduct);

// PUT /api/admin/products/:id - Cập nhật sản phẩm
router.put('/:id', upload.array('hinhAnh', 5), handleUploadError, adminProductController.updateProduct);

// DELETE /api/admin/products/:id - Xóa sản phẩm (soft delete)
router.delete('/:id', adminProductController.deleteProduct);

module.exports = router;
