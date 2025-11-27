/**
 * ==========================================
 * ConfigService.js - SINGLETON PATTERN
 * ==========================================
 * Mục đích: Quản lý tập trung các cấu hình của hệ thống
 * (API keys, đường dẫn, thông số...)
 * 
 * Lợi ích:
 * - Đọc file .env hoặc config chỉ 1 lần duy nhất
 * - Truy cập config nhanh từ bất kỳ đâu
 * - Dễ dàng thay đổi và mở rộng cấu hình
 * - Validation config khi khởi tạo
 */

require('dotenv').config();
const path = require('path');
const Logger = require('./Logger');

class ConfigService {
  // Biến static lưu instance duy nhất
  static #instance = null;
  
  // Lưu trữ tất cả config
  #configs = {};

  /**
   * Constructor private
   */
  constructor() {
    if (ConfigService.#instance) {
      throw new Error('❌ Không thể tạo instance mới! Sử dụng ConfigService.getInstance()');
    }

    // Load tất cả cấu hình
    this.#loadConfigs();
    
    Logger.getInstance().info('🔧 ConfigService Singleton đã được khởi tạo');
  }

  /**
   * Lấy instance duy nhất
   */
  static getInstance() {
    if (!ConfigService.#instance) {
      ConfigService.#instance = new ConfigService();
    }
    return ConfigService.#instance;
  }

  /**
   * Load tất cả cấu hình từ .env và giá trị mặc định
   */
  #loadConfigs() {
    // ========== DATABASE CONFIG ==========
    this.#configs.database = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || '',
      name: process.env.DB_NAME || 'toystore',
      port: parseInt(process.env.DB_PORT) || 1433,
      dialect: 'mssql'
    };

    // ========== SERVER CONFIG ==========
    this.#configs.server = {
      port: parseInt(process.env.PORT) || 5000,
      env: process.env.NODE_ENV || 'development',
      apiPrefix: process.env.API_PREFIX || '/api',
      corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
    };

    // ========== JWT CONFIG ==========
    this.#configs.jwt = {
      secret: process.env.JWT_SECRET || 'toystore-secret-key-2025',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'toystore-refresh-secret',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    };

    // ========== VNPAY CONFIG ==========
    this.#configs.vnpay = {
      tmnCode: process.env.VNP_TMN_CODE || '',
      hashSecret: process.env.VNP_HASH_SECRET || '',
      url: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      returnUrl: process.env.VNP_RETURN_URL || 'http://localhost:3000/payment/vnpay-return',
      api: process.env.VNP_API || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction'
    };

    // ========== UPLOAD CONFIG ==========
    this.#configs.upload = {
      directory: path.join(__dirname, '../uploads'),
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'],
      imageUrl: process.env.IMAGE_URL || 'http://localhost:5000/uploads'
    };

    // ========== EMAIL CONFIG ==========
    this.#configs.email = {
      enabled: process.env.EMAIL_ENABLED === 'true' || false,
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true' || false,
      user: process.env.EMAIL_USER || '',
      password: process.env.EMAIL_PASSWORD || '',
      from: process.env.EMAIL_FROM || 'noreply@toystore.com'
    };

    // ========== SECURITY CONFIG ==========
    this.#configs.security = {
      bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
      rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 phút
      rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      sessionSecret: process.env.SESSION_SECRET || 'toystore-session-secret'
    };

    // ========== PAGINATION CONFIG ==========
    this.#configs.pagination = {
      defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE) || 12,
      maxPageSize: parseInt(process.env.MAX_PAGE_SIZE) || 100
    };

    // ========== LOGGING CONFIG ==========
    this.#configs.logging = {
      level: process.env.LOG_LEVEL || 'info',
      enableConsole: process.env.LOG_CONSOLE !== 'false',
      enableFile: process.env.LOG_FILE === 'true' || true
    };

    // ========== GOOGLE OAUTH CONFIG ==========
    this.#configs.google = {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
    };

    // Validation các config bắt buộc
    this.#validateConfigs();
  }

  /**
   * Validate các config quan trọng
   */
  #validateConfigs() {
    const logger = Logger.getInstance();
    
    // Kiểm tra database config
    if (!this.#configs.database.host || !this.#configs.database.name) {
      logger.warn('⚠️ Database config chưa đầy đủ! Kiểm tra file .env');
    }

    // Kiểm tra JWT secret
    if (this.#configs.jwt.secret === 'toystore-secret-key-2025') {
      logger.warn('⚠️ JWT Secret đang dùng giá trị mặc định! Nên thay đổi trong production');
    }

    // Kiểm tra VNPay config
    if (!this.#configs.vnpay.tmnCode || !this.#configs.vnpay.hashSecret) {
      logger.warn('⚠️ VNPay config chưa được cấu hình! Thanh toán VNPay sẽ không hoạt động');
    }

    // Kiểm tra Google OAuth config
    if (!this.#configs.google.clientId || !this.#configs.google.clientSecret) {
      logger.warn('⚠️ Google OAuth config chưa được cấu hình! Đăng nhập Google sẽ không hoạt động');
    }

    logger.success('✅ Validation config hoàn tất');
  }

  /**
   * Lấy toàn bộ config
   */
  getAll() {
    return { ...this.#configs };
  }

  /**
   * Lấy config theo key
   * @param {string} key - Tên nhóm config (database, server, jwt...)
   */
  get(key) {
    if (!this.#configs[key]) {
      Logger.getInstance().warn(`⚠️ Config key '${key}' không tồn tại`);
      return null;
    }
    return { ...this.#configs[key] };
  }

  /**
   * Lấy giá trị config cụ thể
   * @param {string} key - Nhóm config
   * @param {string} subKey - Key con
   */
  getValue(key, subKey) {
    if (!this.#configs[key] || this.#configs[key][subKey] === undefined) {
      Logger.getInstance().warn(`⚠️ Config '${key}.${subKey}' không tồn tại`);
      return null;
    }
    return this.#configs[key][subKey];
  }

  /**
   * Cập nhật config động (chỉ dùng trong runtime, không lưu vào .env)
   * @param {string} key - Nhóm config
   * @param {Object} values - Các giá trị cần cập nhật
   */
  update(key, values) {
    if (!this.#configs[key]) {
      Logger.getInstance().error(`❌ Không thể update config '${key}' - key không tồn tại`);
      return false;
    }

    this.#configs[key] = { ...this.#configs[key], ...values };
    Logger.getInstance().info(`✅ Đã cập nhật config '${key}'`);
    return true;
  }

  /**
   * Kiểm tra môi trường development
   */
  isDevelopment() {
    return this.#configs.server.env === 'development';
  }

  /**
   * Kiểm tra môi trường production
   */
  isProduction() {
    return this.#configs.server.env === 'production';
  }

  /**
   * In ra tất cả config (ẩn thông tin nhạy cảm)
   */
  printConfigs() {
    const logger = Logger.getInstance();
    const safeConfigs = this.#getSafeConfigs();
    
    logger.info('📋 Cấu hình hệ thống:');
    console.log(JSON.stringify(safeConfigs, null, 2));
  }

  /**
   * Lấy config đã ẩn thông tin nhạy cảm
   */
  #getSafeConfigs() {
    const safe = JSON.parse(JSON.stringify(this.#configs));
    
    // Ẩn thông tin nhạy cảm
    if (safe.database) {
      safe.database.password = '***';
    }
    if (safe.jwt) {
      safe.jwt.secret = '***';
      safe.jwt.refreshSecret = '***';
    }
    if (safe.vnpay) {
      safe.vnpay.hashSecret = '***';
    }
    if (safe.email) {
      safe.email.password = '***';
    }
    if (safe.security) {
      safe.security.sessionSecret = '***';
    }
    
    return safe;
  }

  /**
   * Reload config từ .env (sau khi thay đổi file .env)
   */
  reload() {
    require('dotenv').config();
    this.#loadConfigs();
    Logger.getInstance().info('🔄 Đã reload config từ .env');
  }
}

// Export singleton class
module.exports = ConfigService;
