require('dotenv').config();
const express = require('express');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/products', require('./routes/product.routes'));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: "API Toystore Backend đang chạy!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    database: "Sử dụng database SQL Server hiện có",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login"
      },
      users: {
        getProfile: "GET /api/users/profile (cần token)",
        updateProfile: "PUT /api/users/profile (cần token)"
      },
      products: {
        getAllProducts: "GET /api/products?page=1&limit=10&search=keyword"
      }
    }
  });
});

// Protected routes demo
const authMiddleware = require('./middlewares/auth.middleware');

app.get('/api/profile', authMiddleware.verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Thông tin người dùng',
    data: req.user
  });
});

app.get('/api/admin', 
  authMiddleware.verifyToken, 
  authMiddleware.requireAdmin, 
  (req, res) => {
    res.json({
      success: true,
      message: 'Chào mừng Admin!',
      data: {
        user: req.user,
        adminAccess: true
      }
    });
  }
);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint không tồn tại",
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global Error:', err);
  res.status(500).json({
    success: false,
    message: "Lỗi server nội bộ",
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Kết nối database và khởi động server (KHÔNG sync để tránh thay đổi cấu trúc)
db.sequelize.authenticate()
  .then(() => {
    console.log("✅ Kết nối database thành công!");
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy trên port ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('\n📚 Available endpoints:');
      console.log('- POST /api/auth/register - Đăng ký tài khoản');
      console.log('- POST /api/auth/login - Đăng nhập');
      console.log('- GET /api/users/profile - Xem thông tin cá nhân (cần token)');
      console.log('- PUT /api/users/profile - Cập nhật thông tin cá nhân (cần token)');
      console.log('- GET /api/products - Lấy danh sách sản phẩm');
      console.log('- GET /api/profile - Xem profile (cần token)');
      console.log('- GET /api/admin - Admin only (cần token + admin role)');
    });
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối database:", err);
    process.exit(1);
  });