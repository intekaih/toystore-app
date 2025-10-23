const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { loginLimiter, registerLimiter } = require('../middlewares/rateLimiter.middleware');

// POST /register - Đăng ký tài khoản (giới hạn 3 lần/giờ)
router.post('/register', registerLimiter, authController.register);

// Route đăng nhập - POST /api/auth/login (giới hạn 5 lần/15 phút)
router.post('/login', loginLimiter, authController.login);

// Route đăng nhập admin - POST /api/admin/login (giới hạn 5 lần/15 phút)
router.post('/admin/login', loginLimiter, authController.adminLogin);

module.exports = router;