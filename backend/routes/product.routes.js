const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const categoryController = require('../controllers/category.controller');

// ✅ PUBLIC ROUTES - CATEGORIES & BRANDS (ĐẶT TRƯỚC /products)
router.get('/categories/brands', categoryController.getPublicBrands);
router.get('/categories', categoryController.getPublicCategories);

// PRODUCTS ROUTES
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

module.exports = router;