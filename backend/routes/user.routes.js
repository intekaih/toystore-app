const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { profileUpdateLimiter } = require('../middlewares/rateLimiter.middleware');

// GET /api/users/profile - Xem thông tin cá nhân
router.get('/profile', authMiddleware.verifyToken, userController.getProfile);

// PUT /api/users/profile - Cập nhật thông tin cá nhân (cần đăng nhập + giới hạn 10 lần/giờ)
router.put('/profile', authMiddleware.verifyToken, profileUpdateLimiter, userController.updateProfile);

module.exports = router;