const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');
const { upload, handleUploadError } = require('../middlewares/upload.middleware');

// ============================================
// 🌍 PUBLIC ROUTES (Không cần đăng nhập)
// ============================================

// GET /api/reviews/product/:sanPhamId - Lấy đánh giá của sản phẩm (public, có thống kê)
router.get('/product/:sanPhamId', reviewController.getProductReviews);

// ============================================
// 🔐 USER ROUTES (Cần đăng nhập)
// ============================================

// GET /api/reviews/reviewable-products - Lấy sản phẩm có thể đánh giá (từ đơn hoàn thành)
router.get('/reviewable-products', verifyToken, reviewController.getReviewableProducts);

// GET /api/reviews/can-review/:sanPhamId - Kiểm tra quyền đánh giá
router.get('/can-review/:sanPhamId', verifyToken, reviewController.checkCanReview);

// POST /api/reviews - Tạo đánh giá mới (✅ THÊM MIDDLEWARE UPLOAD ẢNH)
router.post('/', 
  verifyToken, 
  upload.single('hinhAnh'), // Cho phép upload 1 ảnh với field name 'hinhAnh'
  handleUploadError,
  reviewController.createReview
);

// GET /api/reviews/user/me - Lấy đánh giá của user hiện tại
router.get('/user/me', verifyToken, reviewController.getMyReviews);

// ============================================
// 👑 ADMIN ROUTES (Cần quyền Admin)
// ============================================

// GET /api/reviews/admin/all - Lấy tất cả đánh giá (Admin)
router.get('/admin/all', verifyToken, requireAdmin, reviewController.getAllReviews);

// DELETE /api/reviews/admin/:id - Xóa đánh giá (Admin)
router.delete('/admin/:id', verifyToken, requireAdmin, reviewController.deleteReview);

// PUT /api/reviews/admin/:id/approve - Duyệt đánh giá (Admin)
router.put('/admin/:id/approve', verifyToken, requireAdmin, reviewController.approveReview);

// PUT /api/reviews/admin/:id/reject - Từ chối đánh giá (Admin)
router.put('/admin/:id/reject', verifyToken, requireAdmin, reviewController.rejectReview);

module.exports = router;
