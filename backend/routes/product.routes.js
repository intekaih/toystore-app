const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const categoryController = require('../controllers/category.controller');

// ✅ PUBLIC ROUTES - CATEGORIES & BRANDS (ĐẶT TRƯỚC /products)
router.get('/categories/brands', categoryController.getPublicBrands);
router.get('/categories', categoryController.getPublicCategories);

// ✅ PUBLIC STATS ROUTE (ĐẶT TRƯỚC /products)
router.get('/stats', productController.getPublicStats);

// ✅ PUBLIC TOP CUSTOMERS ROUTE
router.get('/top-customers', productController.getTopCustomers);

// PRODUCTS ROUTES
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

module.exports = router;