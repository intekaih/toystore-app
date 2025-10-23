const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// GET /api/products - Lấy danh sách sản phẩm (public, có phân trang & tìm kiếm)
router.get('/', productController.getAllProducts);

// GET /api/products/:id - Xem chi tiết sản phẩm (public)
router.get('/:id', productController.getProductById);

module.exports = router;