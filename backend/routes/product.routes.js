const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// GET /api/products - Lấy danh sách sản phẩm với phân trang và tìm kiếm
// Query parameters:
// - page: số trang (mặc định 1)
// - limit: số sản phẩm mỗi trang (mặc định 10, tối đa 100)
// - search: từ khóa tìm kiếm theo tên sản phẩm
router.get('/', productController.getAllProducts);

// GET /api/products/:id - Lấy chi tiết sản phẩm theo ID
// Route parameters:
// - id: ID của sản phẩm cần lấy thông tin (số nguyên dương)
// Response: Thông tin chi tiết sản phẩm với JOIN bảng LoaiSP
// Trả về 404 nếu sản phẩm không tồn tại hoặc đã ngừng kinh doanh
router.get('/:id', productController.getProductById);

module.exports = router;