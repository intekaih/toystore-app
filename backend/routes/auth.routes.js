const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const { loginLimiter, registerLimiter } = require('../middlewares/rateLimiter.middleware');
const ConfigService = require('../utils/ConfigService');

// Load Google OAuth Strategy (chỉ khi có config)
const config = ConfigService.getInstance();
const googleClientId = config.getValue('google', 'clientId');
const googleClientSecret = config.getValue('google', 'clientSecret');

if (googleClientId && googleClientSecret) {
  require('../strategies/google.strategy');
}

// POST /register - Đăng ký tài khoản (giới hạn 3 lần/giờ)
router.post('/register', registerLimiter, authController.register);

// Route đăng nhập - POST /api/auth/login (giới hạn 5 lần/15 phút)
router.post('/login', loginLimiter, authController.login);

// Route đăng nhập admin - POST /api/admin/login (giới hạn 5 lần/15 phút)
router.post('/admin/login', loginLimiter, authController.adminLogin);

// ========== GOOGLE OAUTH ROUTES ==========
// Chỉ thêm routes nếu Google OAuth đã được cấu hình

if (googleClientId && googleClientSecret) {
  // GET /google - Bắt đầu Google OAuth flow
  router.get('/google', 
    passport.authenticate('google', { 
      scope: ['profile', 'email'] 
    })
  );

  // GET /google/callback - Xử lý callback từ Google
  router.get('/google/callback',
    passport.authenticate('google', { 
      session: false,
      failureRedirect: '/login?error=google_auth_failed'
    }),
    authController.googleCallback
  );
} else {
  // Routes fallback khi chưa cấu hình Google OAuth
  router.get('/google', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Google OAuth chưa được cấu hình. Vui lòng thêm GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET vào file .env'
    });
  });

  router.get('/google/callback', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Google OAuth chưa được cấu hình'
    });
  });
}

module.exports = router;