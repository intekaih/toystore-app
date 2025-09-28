const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// GET /api/users/profile - Xem thông tin cá nhân
router.get('/profile', authMiddleware.verifyToken, userController.getProfile);

// PUT /api/users/profile - Cập nhật thông tin cá nhân (cần đăng nhập)
router.put('/profile', authMiddleware.verifyToken, userController.updateProfile);

module.exports = router;