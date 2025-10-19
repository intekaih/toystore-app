const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/admin.user.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');
// const { strictLimiter } = require('../middlewares/rateLimiter.middleware'); // Tắt rate limiter

// Tất cả routes đều yêu cầu authentication và quyền admin
router.use(verifyToken);
router.use(requireAdmin);

// GET /api/admin/users - Lấy danh sách tất cả người dùng
router.get('/', adminUserController.getAllUsers);

// GET /api/admin/users/:id - Lấy chi tiết người dùng theo ID
router.get('/:id', adminUserController.getUserById);

// POST /api/admin/users - Tạo người dùng mới (đã tắt rate limit)
router.post('/', adminUserController.createUser);

// PUT /api/admin/users/:id - Cập nhật thông tin người dùng (đã tắt rate limit)
router.put('/:id', adminUserController.updateUser);

// PATCH /api/admin/users/:id/status - Khóa/mở khóa tài khoản (đã tắt rate limit)
router.patch('/:id/status', adminUserController.updateUserStatus);

// DELETE /api/admin/users/:id - Xóa tài khoản vĩnh viễn (đã tắt rate limit)
router.delete('/:id', adminUserController.deleteUser);

module.exports = router;
