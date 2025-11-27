# 🔐 Hướng Dẫn Triển Khai Đăng Nhập/Đăng Ký Bằng Google OAuth

## 📋 Tổng Quan

Tài liệu này hướng dẫn chi tiết cách triển khai chức năng đăng nhập và đăng ký bằng Google OAuth cho hệ thống Toystore.

## 🎯 Mục Tiêu

- Cho phép người dùng đăng nhập/đăng ký bằng tài khoản Google
- Tự động tạo tài khoản nếu chưa tồn tại
- Liên kết tài khoản Google với tài khoản hiện có (nếu email trùng)
- Giữ nguyên flow đăng nhập bằng username/password hiện tại

---

## 📝 CÁC BƯỚC TRIỂN KHAI

### **BƯỚC 1: Cấu Hình Google OAuth Console**

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Bật **Google+ API** hoặc **Google Identity Services**
4. Tạo **OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Authorized redirect URIs:
     - Development: `http://localhost:5000/api/auth/google/callback`
     - Production: `https://yourdomain.com/api/auth/google/callback`
5. Lưu **Client ID** và **Client Secret**

---

### **BƯỚC 2: Cập Nhật Database Schema**

#### 2.1. Thêm cột vào bảng `TaiKhoan`

```sql
-- Thêm cột GoogleID để lưu Google User ID
ALTER TABLE TaiKhoan 
ADD GoogleID VARCHAR(255) NULL;

-- Thêm cột LoginMethod để đánh dấu phương thức đăng nhập
ALTER TABLE TaiKhoan 
ADD LoginMethod NVARCHAR(20) DEFAULT 'Password' NULL;
-- Giá trị: 'Password', 'Google', 'Both'

-- Tạo index cho GoogleID để tối ưu truy vấn
CREATE UNIQUE NONCLUSTERED INDEX UQ_TaiKhoan_GoogleID 
ON TaiKhoan(GoogleID) WHERE GoogleID IS NOT NULL;

-- Tạo index cho LoginMethod
CREATE NONCLUSTERED INDEX IX_TaiKhoan_LoginMethod 
ON TaiKhoan(LoginMethod);
```

#### 2.2. Cập nhật constraint (nếu cần)

```sql
-- Thêm constraint cho LoginMethod
ALTER TABLE TaiKhoan 
ADD CONSTRAINT CK_TaiKhoan_LoginMethod 
CHECK (LoginMethod IN ('Password', 'Google', 'Both'));
```

---

### **BƯỚC 3: Cấu Hình Environment Variables**

Thêm vào file `.env` (backend):

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

---

### **BƯỚC 4: Cập Nhật ConfigService**

Cập nhật `backend/utils/ConfigService.js` để thêm Google OAuth config:

```javascript
// Thêm vào method #loadConfigs()

// ========== GOOGLE OAUTH CONFIG ==========
this.#configs.google = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
};
```

---

### **BƯỚC 5: Tạo Google OAuth Strategy**

Tạo file `backend/strategies/google.strategy.js`:

```javascript
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const db = require('../models');
const TaiKhoan = db.TaiKhoan;
const jwt = require('jsonwebtoken');
const ConfigService = require('../utils/ConfigService');
const Logger = require('../utils/Logger');

const config = ConfigService.getInstance();
const logger = Logger.getInstance();

passport.use(new GoogleStrategy({
  clientID: config.getValue('google', 'clientId'),
  clientSecret: config.getValue('google', 'clientSecret'),
  callbackURL: config.getValue('google', 'callbackUrl')
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { id, displayName, emails, photos } = profile;
    const email = emails && emails[0] ? emails[0].value : null;
    const photo = photos && photos[0] ? photos[0].value : null;

    if (!email) {
      return done(new Error('Không thể lấy email từ Google'), null);
    }

    // Tìm user theo GoogleID hoặc Email
    let user = await TaiKhoan.findOne({
      where: {
        [Op.or]: [
          { GoogleID: id },
          { Email: email.toLowerCase() }
        ]
      }
    });

    if (user) {
      // User đã tồn tại - cập nhật thông tin Google
      if (!user.GoogleID) {
        // Liên kết Google với tài khoản hiện có
        user.GoogleID = id;
        user.LoginMethod = user.MatKhau ? 'Both' : 'Google';
        await user.save();
        logger.info(`✅ Đã liên kết Google với tài khoản: ${user.TenDangNhap}`);
      }
    } else {
      // Tạo tài khoản mới
      const username = email.split('@')[0] + '_' + Date.now().toString().slice(-6);
      
      user = await TaiKhoan.create({
        TenDangNhap: username,
        MatKhau: null, // Không có mật khẩu cho Google login
        HoTen: displayName || email.split('@')[0],
        Email: email.toLowerCase(),
        GoogleID: id,
        LoginMethod: 'Google',
        VaiTro: 'KhachHang',
        TrangThai: true
      });

      logger.success(`✅ Đã tạo tài khoản mới từ Google: ${user.TenDangNhap}`);
    }

    return done(null, user);
  } catch (error) {
    logger.logError(error, 'Google OAuth Strategy');
    return done(error, null);
  }
}));

module.exports = passport;
```

---

### **BƯỚC 6: Cập Nhật Auth Controller**

Thêm các hàm mới vào `backend/controllers/auth.controller.js`:

```javascript
// Thêm vào đầu file
const passport = require('passport');
require('../strategies/google.strategy');

// Thêm hàm xử lý Google OAuth callback
exports.googleCallback = async (req, res) => {
  try {
    // User đã được xác thực bởi passport middleware
    const user = req.user;

    if (!user) {
      logger.warn('Google OAuth callback: Không tìm thấy user');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`);
    }

    // Kiểm tra tài khoản có bị khóa không
    if (!user.TrangThai) {
      logger.warn(`Google OAuth: Tài khoản bị khóa - ${user.TenDangNhap}`);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=account_disabled`);
    }

    // Tạo JWT token
    const jwtSecret = config.getValue('jwt', 'secret');
    const jwtExpires = config.getValue('jwt', 'expiresIn');

    const token = jwt.sign(
      {
        userId: user.ID,
        username: user.TenDangNhap,
        role: user.VaiTro || 'KhachHang'
      },
      jwtSecret,
      { expiresIn: jwtExpires }
    );

    logger.success(`✅ Google OAuth đăng nhập thành công: ${user.TenDangNhap}`);

    // Redirect về frontend với token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/auth/google/callback?token=${token}&success=true`);

  } catch (error) {
    logger.logError(error, 'Google OAuth callback');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/login?error=server_error`);
  }
};
```

---

### **BƯỚC 7: Cập Nhật Auth Routes**

Cập nhật `backend/routes/auth.routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const { loginLimiter, registerLimiter } = require('../middlewares/rateLimiter.middleware');

// POST /register - Đăng ký tài khoản
router.post('/register', registerLimiter, authController.register);

// POST /login - Đăng nhập
router.post('/login', loginLimiter, authController.login);

// POST /admin/login - Đăng nhập admin
router.post('/admin/login', loginLimiter, authController.adminLogin);

// ========== GOOGLE OAUTH ROUTES ==========

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

module.exports = router;
```

---

### **BƯỚC 8: Cập Nhật Server.js**

Đảm bảo `backend/server.js` có passport middleware:

```javascript
// Thêm vào đầu file
const passport = require('passport');

// Thêm sau khi khởi tạo app
app.use(passport.initialize());
```

---

### **BƯỚC 9: Cập Nhật Frontend - Auth Service**

Cập nhật `frontend/src/services/authService.js`:

```javascript
// Thêm method mới
googleLogin() {
  // Redirect đến backend Google OAuth endpoint
  const backendUrl = config.API_URL || 'http://localhost:5000';
  window.location.href = `${backendUrl}/api/auth/google`;
}

// Thêm method xử lý callback
handleGoogleCallback(token) {
  if (token) {
    // Lưu token và fetch user info
    this.setToken(token);
    return this.fetchUserProfile();
  }
  return Promise.reject(new Error('Không nhận được token từ Google'));
}
```

---

### **BƯỚC 10: Tạo Google Callback Page (Frontend)**

Tạo `frontend/src/pages/GoogleCallbackPage.js`:

```javascript
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';

const GoogleCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      navigate('/login', { 
        state: { error: 'Đăng nhập bằng Google thất bại' } 
      });
      return;
    }

    if (success === 'true' && token) {
      // Lưu token
      authService.setToken(token);
      
      // Fetch user profile và cập nhật context
      authService.fetchUserProfile()
        .then(() => {
          navigate('/', { replace: true });
        })
        .catch((err) => {
          console.error('Error fetching user profile:', err);
          navigate('/login', { 
            state: { error: 'Không thể lấy thông tin người dùng' } 
          });
        });
    } else {
      navigate('/login', { 
        state: { error: 'Đăng nhập bằng Google thất bại' } 
      });
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
```

---

### **BƯỚC 11: Cập Nhật Login Page**

Cập nhật `frontend/src/pages/LoginPage.js`:

```javascript
// Thêm import
import authService from '../services/authService';

// Thêm nút Google Login vào form
const handleGoogleLogin = () => {
  authService.googleLogin();
};

// Thêm vào JSX (sau form đăng nhập)
<div className="mt-6">
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-300"></div>
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-2 bg-white text-gray-500">Hoặc</span>
    </div>
  </div>

  <button
    type="button"
    onClick={handleGoogleLogin}
    className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    <span className="font-semibold text-gray-700">Đăng nhập bằng Google</span>
  </button>
</div>
```

---

### **BƯỚC 12: Cập Nhật Register Page**

Tương tự, thêm nút Google vào `frontend/src/pages/RegisterPage.js`.

---

### **BƯỚC 13: Cập Nhật Routes (Frontend)**

Cập nhật `frontend/src/App.js`:

```javascript
import GoogleCallbackPage from './pages/GoogleCallbackPage';

// Thêm route
<Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
```

---

### **BƯỚC 14: Cập Nhật Auth Controller - Xử Lý Trường Hợp Đặc Biệt**

Cập nhật hàm `register` và `login` trong `auth.controller.js` để xử lý trường hợp user có GoogleID:

```javascript
// Trong hàm login, thêm kiểm tra
if (user.LoginMethod === 'Google' && !user.MatKhau) {
  return res.status(401).json({
    success: false,
    message: 'Tài khoản này chỉ đăng nhập được bằng Google'
  });
}
```

---

### **BƯỚC 15: Testing**

#### 15.1. Test Cases

1. ✅ Đăng nhập bằng Google với tài khoản mới
2. ✅ Đăng nhập bằng Google với email đã tồn tại (liên kết tài khoản)
3. ✅ Đăng nhập bằng Google với GoogleID đã có
4. ✅ Đăng nhập bằng username/password vẫn hoạt động
5. ✅ Tài khoản có cả Google và Password (LoginMethod = 'Both')
6. ✅ Xử lý lỗi khi Google OAuth thất bại

#### 15.2. Test Script

```javascript
// backend/tests/test-google-oauth.js
// Tạo file test để kiểm tra Google OAuth flow
```

---

## 🔒 Bảo Mật

1. **HTTPS trong Production**: Luôn sử dụng HTTPS cho OAuth callback
2. **Validate Token**: Luôn verify JWT token từ Google
3. **Rate Limiting**: Áp dụng rate limiting cho Google OAuth endpoints
4. **Error Handling**: Không expose thông tin nhạy cảm trong error messages

---

## 📊 Database Migration Script

Tạo file `db/migrations/add_google_oauth_fields.sql`:

```sql
-- Migration: Thêm Google OAuth fields
-- Date: 2025-01-XX

USE toystore;
GO

-- Thêm cột GoogleID
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('TaiKhoan') AND name = 'GoogleID')
BEGIN
    ALTER TABLE TaiKhoan ADD GoogleID VARCHAR(255) NULL;
    PRINT '✅ Đã thêm cột GoogleID';
END
ELSE
BEGIN
    PRINT '⚠️ Cột GoogleID đã tồn tại';
END
GO

-- Thêm cột LoginMethod
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('TaiKhoan') AND name = 'LoginMethod')
BEGIN
    ALTER TABLE TaiKhoan ADD LoginMethod NVARCHAR(20) DEFAULT 'Password' NULL;
    PRINT '✅ Đã thêm cột LoginMethod';
END
ELSE
BEGIN
    PRINT '⚠️ Cột LoginMethod đã tồn tại';
END
GO

-- Tạo index cho GoogleID
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_TaiKhoan_GoogleID')
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX UQ_TaiKhoan_GoogleID 
    ON TaiKhoan(GoogleID) WHERE GoogleID IS NOT NULL;
    PRINT '✅ Đã tạo index UQ_TaiKhoan_GoogleID';
END
ELSE
BEGIN
    PRINT '⚠️ Index UQ_TaiKhoan_GoogleID đã tồn tại';
END
GO

-- Tạo index cho LoginMethod
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TaiKhoan_LoginMethod')
BEGIN
    CREATE NONCLUSTERED INDEX IX_TaiKhoan_LoginMethod 
    ON TaiKhoan(LoginMethod);
    PRINT '✅ Đã tạo index IX_TaiKhoan_LoginMethod';
END
ELSE
BEGIN
    PRINT '⚠️ Index IX_TaiKhoan_LoginMethod đã tồn tại';
END
GO

-- Thêm constraint cho LoginMethod
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_TaiKhoan_LoginMethod')
BEGIN
    ALTER TABLE TaiKhoan 
    ADD CONSTRAINT CK_TaiKhoan_LoginMethod 
    CHECK (LoginMethod IN ('Password', 'Google', 'Both') OR LoginMethod IS NULL);
    PRINT '✅ Đã thêm constraint CK_TaiKhoan_LoginMethod';
END
ELSE
BEGIN
    PRINT '⚠️ Constraint CK_TaiKhoan_LoginMethod đã tồn tại';
END
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════════';
PRINT '✅ MIGRATION HOÀN TẤT: Google OAuth Fields';
PRINT '═══════════════════════════════════════════════════════════════════';
GO
```

---

## 📝 Checklist Triển Khai

- [ ] Bước 1: Cấu hình Google OAuth Console
- [ ] Bước 2: Cập nhật Database Schema
- [ ] Bước 3: Cấu hình Environment Variables
- [ ] Bước 4: Cập nhật ConfigService
- [ ] Bước 5: Tạo Google OAuth Strategy
- [ ] Bước 6: Cập nhật Auth Controller
- [ ] Bước 7: Cập nhật Auth Routes
- [ ] Bước 8: Cập nhật Server.js
- [ ] Bước 9: Cập nhật Frontend Auth Service
- [ ] Bước 10: Tạo Google Callback Page
- [ ] Bước 11: Cập nhật Login Page
- [ ] Bước 12: Cập nhật Register Page
- [ ] Bước 13: Cập nhật Routes (Frontend)
- [ ] Bước 14: Xử lý trường hợp đặc biệt
- [ ] Bước 15: Testing

---

## 🚀 Deployment Notes

1. **Environment Variables**: Đảm bảo set đúng Google OAuth credentials trong production
2. **Callback URL**: Cập nhật callback URL trong Google Console cho production domain
3. **HTTPS**: Bắt buộc sử dụng HTTPS trong production
4. **CORS**: Cấu hình CORS đúng cho frontend domain

---

## 📚 Tài Liệu Tham Khảo

- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [JWT Authentication Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

---

## ❓ FAQ

**Q: Làm sao để user có thể liên kết Google với tài khoản hiện có?**
A: Khi user đăng nhập bằng Google với email đã tồn tại, hệ thống sẽ tự động liên kết.

**Q: User có thể đăng nhập bằng cả Google và Password không?**
A: Có, khi liên kết Google với tài khoản có password, LoginMethod sẽ là 'Both'.

**Q: Làm sao để user hủy liên kết Google?**
A: Cần thêm chức năng trong profile page để user có thể xóa GoogleID.

---

**Tài liệu được tạo: 2025-01-XX**
**Version: 1.0.0**

