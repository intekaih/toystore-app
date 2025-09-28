const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /register - Đăng ký tài khoản
router.post('/register', authController.register);

// Route đăng nhập - POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;