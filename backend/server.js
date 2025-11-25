require('dotenv').config();
const express = require('express');
const db = require('./models');
const path = require('path');

// Import Singleton utilities
const Logger = require('./utils/Logger');
const ConfigService = require('./utils/ConfigService');
const DBConnection = require('./utils/DBConnection');

// 🔄 KHÔNG SỬ DỤNG Transform Response Middleware NỮA
// Giữ nguyên PascalCase từ SQL Server - đúng với database convention
// const transformResponse = require('./middlewares/transformResponse.middleware');

const app = express();

// Khởi tạo các Singleton
const logger = Logger.getInstance();
const config = ConfigService.getInstance();
const dbConnection = DBConnection.getInstance();

const PORT = config.getValue('server', 'port');

// Middleware logging cho mọi request
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ❌ TẮT Transform Response Middleware
// Lý do: Dữ liệu từ SQL Server dùng PascalCase là chuẩn
// Frontend sẽ đọc trực tiếp PascalCase để đồng nhất với database
// app.use(transformResponse);

// Serve static files từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS middleware
app.use((req, res, next) => {
  const corsOrigin = config.getValue('server', 'corsOrigin');
  res.header('Access-Control-Allow-Origin', corsOrigin === '*' ? '*' : corsOrigin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-session-id');
  res.header('Access-Control-Allow-Credentials', 'true');
  
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
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/shipping', require('./routes/shipping.routes')); // ⭐ THÊM MỚI: Shipping/GHN API
app.use('/api/webhooks', require('./routes/webhook.routes')); // 🔔 THÊM MỚI: Webhook từ GHN
app.use('/api/reviews', require('./routes/review.routes')); // ⭐ THÊM MỚI: Review API
app.use('/api/vouchers', require('./routes/voucher.routes')); // 🎟️ THÊM MỚI: Voucher API công khai
app.use('/api/staff', require('./routes/staff.routes')); // ⭐ THÊM MỚI: Staff Management API
app.use('/api/admin/users', require('./routes/admin.user.routes'));
app.use('/api/admin/categories', require('./routes/category.routes'));
app.use('/api/admin/brands', require('./routes/admin.brand.routes')); // ⭐ THÊM MỚI: Brand Management API
app.use('/api/admin/products', require('./routes/admin.product.routes'));
app.use('/api/admin/orders', require('./routes/admin.order.routes'));
app.use('/api/admin/vouchers', require('./routes/admin.voucher.routes'));
app.use('/api/admin/statistics', require('./routes/admin.statistics.routes'));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: "🎮 API Toystore Backend - Quản lý cửa hàng đồ chơi",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    database: "SQL Server - toystore",
    documentation: "Truy cập / để xem danh sách đầy đủ các API endpoints",
    endpoints: {
      // ========== AUTHENTICATION ==========

      authentication: {
        register: {
          method: "POST",
          url: "/api/auth/register",
          description: "Đăng ký tài khoản mới",
          auth: "Không cần",
          rateLimit: "3 lần/giờ"
        },
        login: {
          method: "POST",
          url: "/api/auth/login",
          description: "Đăng nhập user",
          auth: "Không cần",
          rateLimit: "5 lần/15 phút"
        },
        adminLogin: {
          method: "POST",
          url: "/api/auth/admin/login",
          description: "Đăng nhập admin",
          auth: "Không cần",
          rateLimit: "5 lần/15 phút"
        }
      },

      // ========== USER PROFILE ==========

      users: {
        getProfile: {
          method: "GET",
          url: "/api/users/profile",
          description: "Xem thông tin cá nhân",
          auth: "Token required"
        },
        updateProfile: {
          method: "PUT",
          url: "/api/users/profile",
          description: "Cập nhật thông tin cá nhân",
          auth: "Token required",
          rateLimit: "10 lần/giờ"
        }
      },

      // ========== PRODUCTS (PUBLIC) ==========

      products: {
        getAllProducts: {
          method: "GET",
          url: "/api/products?page=1&limit=10&search=keyword",
          description: "Lấy danh sách sản phẩm (public)",
          auth: "Không cần",
          params: "page, limit, search"
        },
        getProductById: {
          method: "GET",
          url: "/api/products/:id",
          description: "Xem chi tiết sản phẩm (public)",
          auth: "Không cần"
        }
      },

      // ========== SHOPPING CART ==========

      cart: {
        getCart: {
          method: "GET",
          url: "/api/cart",
          description: "Xem giỏ hàng",
          auth: "Token required"
        },
        addToCart: {
          method: "POST",
          url: "/api/cart/add",
          description: "Thêm sản phẩm vào giỏ",
          auth: "Token required",
          rateLimit: "50 lần/10 phút"
        },
        updateCartItem: {
          method: "PUT",
          url: "/api/cart/update",
          description: "Cập nhật số lượng trong giỏ",
          auth: "Token required",
          rateLimit: "50 lần/10 phút"
        },
        removeFromCart: {
          method: "DELETE",
          url: "/api/cart/remove/:productId",
          description: "Xóa sản phẩm khỏi giỏ",
          auth: "Token required",
          rateLimit: "50 lần/10 phút"
        },
        clearCart: {
          method: "DELETE",
          url: "/api/cart/clear",
          description: "Xóa toàn bộ giỏ hàng",
          auth: "Token required",
          rateLimit: "50 lần/10 phút"
        }
      },

      // ========== ORDERS ==========

      orders: {
        createOrder: {
          method: "POST",
          url: "/api/orders/create",
          description: "Tạo đơn hàng từ giỏ hàng",
          auth: "Token required",
          rateLimit: "20 lần/giờ",
          note: "Tự động trừ tồn kho & xóa giỏ hàng"
        },
        getMyOrders: {
          method: "GET",
          url: "/api/orders/my-orders",
          description: "Xem danh sách đơn hàng của tôi",
          auth: "Token required"
        },
        getOrderHistory: {
          method: "GET",
          url: "/api/orders/history?page=1&limit=10&trangThai=Đã giao",
          description: "Lịch sử đơn hàng chi tiết có phân trang",
          auth: "Token required",
          params: "page, limit, trangThai"
        },
        getOrderDetail: {
          method: "GET",
          url: "/api/orders/:id",
          description: "Xem chi tiết đơn hàng",
          auth: "Token required"
        },
        cancelOrder: {
          method: "POST",
          url: "/api/orders/:id/cancel",
          description: "Hủy đơn hàng (hoàn tồn kho)",
          auth: "Token required",
          rateLimit: "20 lần/giờ",
          note: "Chỉ hủy được đơn 'Chờ xử lý'"
        }
      },

      // ========== PAYMENT - VNPAY ==========

      payment: {
        createPaymentUrl: {
          method: "GET",
          url: "/api/payment/vnpay/create-payment-url?orderId=1&amount=100000&bankCode=NCB",
          description: "Tạo URL thanh toán VNPay",
          auth: "Token required",
          rateLimit: "10 lần/10 phút",
          params: "orderId, amount, bankCode (optional), language (optional)"
        },
        vnpayReturn: {
          method: "GET",
          url: "/api/payment/vnpay/return",
          description: "Xử lý kết quả thanh toán từ VNPay",
          auth: "Không cần (VNPay callback)",
          note: "VNPay redirect về đây sau thanh toán"
        },
        vnpayIPN: {
          method: "GET",
          url: "/api/payment/vnpay/ipn",
          description: "Nhận thông báo từ VNPay server",
          auth: "Không cần (VNPay IPN)",
          note: "VNPay gửi IPN để confirm giao dịch"
        }
      },

      // ========== ADMIN - USER MANAGEMENT ==========

      adminUsers: {
        getAllUsers: {
          method: "GET",
          url: "/api/admin/users?page=1&limit=10&role=user&enable=true",
          description: "Lấy danh sách tất cả user",
          auth: "Admin only",
          params: "page, limit, role, enable, search"
        },
        getUserById: {
          method: "GET",
          url: "/api/admin/users/:id",
          description: "Xem chi tiết user",
          auth: "Admin only"
        },
        createUser: {
          method: "POST",
          url: "/api/admin/users",
          description: "Tạo user mới",
          auth: "Admin only"
        },
        updateUser: {
          method: "PUT",
          url: "/api/admin/users/:id",
          description: "Cập nhật thông tin user",
          auth: "Admin only"
        },
        updateUserStatus: {
          method: "PATCH",
          url: "/api/admin/users/:id/status",
          description: "Khóa/mở khóa tài khoản",
          auth: "Admin only"
        },
        deleteUser: {
          method: "DELETE",
          url: "/api/admin/users/:id",
          description: "Xóa user vĩnh viễn",
          auth: "Admin only",
          note: "Cẩn thận! Không thể khôi phục"
        }
      },

      // ========== ADMIN - CATEGORY MANAGEMENT ==========

      adminCategories: {
        getAllCategories: {
          method: "GET",
          url: "/api/admin/categories",
          description: "Lấy danh sách danh mục",
          auth: "Admin only"
        },
        createCategory: {
          method: "POST",
          url: "/api/admin/categories",
          description: "Tạo danh mục mới",
          auth: "Admin only"
        },
        updateCategory: {
          method: "PUT",
          url: "/api/admin/categories/:id",
          description: "Cập nhật danh mục",
          auth: "Admin only"
        },
        deleteCategory: {
          method: "DELETE",
          url: "/api/admin/categories/:id",
          description: "Xóa danh mục",
          auth: "Admin only",
          note: "Chỉ xóa được nếu không có sản phẩm"
        }
      },

      // ========== ADMIN - PRODUCT MANAGEMENT ==========

      adminProducts: {
        getAllProducts: {
          method: "GET",
          url: "/api/admin/products?page=1&limit=10&loaiId=1&enable=true",
          description: "Lấy tất cả sản phẩm (bao gồm cả đã xóa)",
          auth: "Admin only",
          params: "page, limit, search, loaiId, enable"
        },
        createProduct: {
          method: "POST",
          url: "/api/admin/products",
          description: "Thêm sản phẩm mới (có upload ảnh)",
          auth: "Admin only",
          contentType: "multipart/form-data",
          fields: "Ten, MoTa, GiaBan, Ton, LoaiID, hinhAnh (file)"
        },
        updateProduct: {
          method: "PUT",
          url: "/api/admin/products/:id",
          description: "Cập nhật sản phẩm (có upload ảnh)",
          auth: "Admin only",
          contentType: "multipart/form-data"
        },
        deleteProduct: {
          method: "DELETE",
          url: "/api/admin/products/:id",
          description: "Xóa sản phẩm (soft delete)",
          auth: "Admin only",
          note: "Set Enable = false, không xóa vật lý"
        }
      },

      // ========== ADMIN - ORDER MANAGEMENT ==========

      adminOrders: {
        getAllOrders: {
          method: "GET",
          url: "/api/admin/orders?page=1&limit=10&trangThai=Chờ xử lý&search=HD20250101",
          description: "Lấy danh sách tất cả đơn hàng",
          auth: "Admin only",
          params: "page, limit, trangThai, search (theo mã HD)"
        },
        getOrderById: {
          method: "GET",
          url: "/api/admin/orders/:id",
          description: "Xem chi tiết đơn hàng",
          auth: "Admin only"
        },
        updateOrderStatus: {
          method: "PATCH",
          url: "/api/admin/orders/:id/status",
          description: "Cập nhật trạng thái đơn hàng",
          auth: "Admin only",
          body: "{ trangThai: 'Đang giao', ghiChu: 'Ghi chú' }",
          allowedStatus: "Chờ xử lý, Đang giao, Đã giao"
        }
      },

      // ========== ADMIN - STATISTICS ==========

      adminStatistics: {
        getStatistics: {
          method: "GET",
          url: "/api/admin/statistics?year=2025&startDate=2025-01-01&endDate=2025-12-31",
          description: "Thống kê tổng quan đơn hàng",
          auth: "Admin only",
          params: "year, startDate, endDate",
          returns: "Tổng doanh thu, số đơn, theo tháng, top khách hàng, top sản phẩm, 7 ngày gần nhất"
        },
        getRevenueStatistics: {
          method: "GET",
          url: "/api/admin/statistics/revenue?groupBy=month&startDate=2025-01-01",
          description: "Thống kê doanh thu chi tiết",
          auth: "Admin only",
          params: "groupBy (day/week/month/year), startDate, endDate"
        },
        getProductStatistics: {
          method: "GET",
          url: "/api/admin/statistics/products?startDate=2025-01-01",
          description: "Thống kê sản phẩm chi tiết",
          auth: "Admin only",
          params: "startDate, endDate",
          returns: "Tất cả sản phẩm với tổng số lượng bán, doanh thu, số lần mua"
        }
      }
    },

    // ========== NOTES ==========

    notes: {
      authentication: "Sử dụng JWT Bearer Token trong header: Authorization: Bearer <token>",
      rateLimit: "Áp dụng rate limiting để bảo vệ API khỏi abuse",
      pagination: "Hầu hết API list đều hỗ trợ phân trang với page & limit",
      softDelete: "Sản phẩm sử dụng soft delete (Enable = false)",
      transactions: "Tạo đơn hàng & hủy đơn sử dụng database transactions",
      upload: "Upload ảnh sản phẩm giới hạn 5MB, chỉ chấp nhận JPEG/PNG/GIF/WEBP"
    },

    // ========== STATUS CODES ==========

    statusCodes: {
      200: "OK - Thành công",
      201: "Created - Tạo mới thành công",
      400: "Bad Request - Dữ liệu không hợp lệ",
      401: "Unauthorized - Chưa đăng nhập hoặc token không hợp lệ",
      403: "Forbidden - Không có quyền truy cập",
      404: "Not Found - Không tìm thấy",
      409: "Conflict - Dữ liệu bị trùng lặp",
      429: "Too Many Requests - Vượt quá giới hạn rate limit",
      500: "Internal Server Error - Lỗi server"
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
  logger.warn(`404 Not Found: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Endpoint không tồn tại",
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.logError(err, `Error at ${req.method} ${req.url}`);
  res.status(500).json({
    success: false,
    message: "Lỗi server nội bộ",
    error: config.isDevelopment() ? err.message : 'Internal Server Error'
  });
});

// Kết nối database và khởi động server
dbConnection.connect()
  .then(() => {
    logger.success("✅ Kết nối database thành công!");
    
    // In config hệ thống (ẩn thông tin nhạy cảm)
    if (config.isDevelopment()) {
      config.printConfigs();
    }
    
    app.listen(PORT, () => {
      logger.success('\n' + '='.repeat(80));
      logger.info('🎮 TOYSTORE BACKEND API SERVER');
      logger.info('='.repeat(80));
      logger.success(`🚀 Server đang chạy trên port ${PORT}`);
      logger.info(`📍 URL: http://localhost:${PORT}`);
      logger.info(`🌐 Environment: ${config.getValue('server', 'env')}`);
      logger.info(`📊 Database: ${config.getValue('database', 'name')} - ${config.getValue('database', 'host')}`);
      logger.info('='.repeat(80));
      
      console.log('\n📚 AUTHENTICATION ENDPOINTS:');
      console.log('   POST   /api/auth/register           - Đăng ký tài khoản mới');
      console.log('   POST   /api/auth/login              - Đăng nhập user');
      console.log('   POST   /api/auth/admin/login        - Đăng nhập admin');
      
      console.log('\n👤 USER PROFILE ENDPOINTS:');
      console.log('   GET    /api/users/profile           - Xem thông tin cá nhân (Token)');
      console.log('   PUT    /api/users/profile           - Cập nhật thông tin (Token)');
      
      console.log('\n📦 PRODUCTS ENDPOINTS (PUBLIC):');
      console.log('   GET    /api/products                - Lấy danh sách sản phẩm');
      console.log('   GET    /api/products/:id            - Chi tiết sản phẩm');
      
      console.log('\n🛒 SHOPPING CART ENDPOINTS:');
      console.log('   GET    /api/cart                    - Xem giỏ hàng (Token)');
      console.log('   POST   /api/cart/add                - Thêm vào giỏ (Token)');
      console.log('   PUT    /api/cart/update             - Cập nhật giỏ (Token)');
      console.log('   DELETE /api/cart/remove/:productId  - Xóa khỏi giỏ (Token)');
      console.log('   DELETE /api/cart/clear              - Xóa toàn bộ giỏ (Token)');
      
      console.log('\n📋 ORDERS ENDPOINTS:');
      console.log('   POST   /api/orders/create           - Tạo đơn hàng (Token)');
      console.log('   GET    /api/orders/my-orders        - Danh sách đơn hàng (Token)');
      console.log('   GET    /api/orders/history          - Lịch sử đơn hàng (Token)');
      console.log('   GET    /api/orders/:id              - Chi tiết đơn hàng (Token)');
      console.log('   POST   /api/orders/:id/cancel       - Hủy đơn hàng (Token)');
      
      console.log('\n💳 PAYMENT ENDPOINTS (VNPAY):');
      console.log('   GET    /api/payment/vnpay/create-payment-url  - Tạo URL thanh toán (Token)');
      console.log('   GET    /api/payment/vnpay/return              - Xử lý return từ VNPay');
      console.log('   GET    /api/payment/vnpay/ipn                 - Nhận IPN từ VNPay');
      
      console.log('\n🔐 ADMIN - USER MANAGEMENT:');
      console.log('   GET    /api/admin/users             - Danh sách users (Admin)');
      console.log('   GET    /api/admin/users/:id         - Chi tiết user (Admin)');
      console.log('   POST   /api/admin/users             - Tạo user mới (Admin)');
      console.log('   PUT    /api/admin/users/:id         - Cập nhật user (Admin)');
      console.log('   PATCH  /api/admin/users/:id/status  - Khóa/mở user (Admin)');
      console.log('   DELETE /api/admin/users/:id         - Xóa user (Admin)');
      
      console.log('\n🗂️  ADMIN - CATEGORY MANAGEMENT:');
      console.log('   GET    /api/admin/categories        - Danh sách danh mục (Admin)');
      console.log('   POST   /api/admin/categories        - Tạo danh mục (Admin)');
      console.log('   PUT    /api/admin/categories/:id    - Cập nhật danh mục (Admin)');
      console.log('   DELETE /api/admin/categories/:id    - Xóa danh mục (Admin)');
      
      console.log('\n📦 ADMIN - PRODUCT MANAGEMENT:');
      console.log('   GET    /api/admin/products          - Danh sách sản phẩm (Admin)');
      console.log('   POST   /api/admin/products          - Thêm sản phẩm + upload (Admin)');
      console.log('   PUT    /api/admin/products/:id      - Cập nhật sản phẩm (Admin)');
      console.log('   DELETE /api/admin/products/:id      - Xóa sản phẩm (Admin)');
      
      console.log('\n📋 ADMIN - ORDER MANAGEMENT:');
      console.log('   GET    /api/admin/orders            - Danh sách đơn hàng (Admin)');
      console.log('   GET    /api/admin/orders/:id        - Chi tiết đơn hàng (Admin)');
      console.log('   PATCH  /api/admin/orders/:id/status - Cập nhật trạng thái (Admin)');
      
      console.log('\n📊 ADMIN - STATISTICS:');
      console.log('   GET    /api/admin/statistics        - Thống kê tổng quan (Admin)');
      console.log('   GET    /api/admin/statistics/revenue   - Thống kê doanh thu (Admin)');
      console.log('   GET    /api/admin/statistics/products  - Thống kê sản phẩm (Admin)');
      
      console.log('\n' + '='.repeat(80));
      console.log('📝 NOTES:');
      console.log('   • (Token) = Yêu cầu JWT Bearer Token');
      console.log('   • (Admin) = Chỉ admin mới được truy cập');
      console.log('   • Xem chi tiết API: GET http://localhost:' + PORT + '/');
      console.log('   • Rate limiting được áp dụng cho hầu hết endpoints');
      console.log('='.repeat(80) + '\n');
      
      console.log('✨ Server sẵn sàng nhận request!');
      console.log('🔗 Tài khoản admin mặc định: admin / admin123\n');
    });
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối database:", err);
    process.exit(1);
  });