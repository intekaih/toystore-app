/**
 * ==========================================
 * DBConnection.js - SINGLETON PATTERN
 * ==========================================
 * Mục đích: Đảm bảo chỉ có DUY NHẤT 1 instance Sequelize 
 * kết nối đến SQL Server trong toàn bộ ứng dụng.
 * 
 * Lợi ích:
 * - Tránh tạo nhiều kết nối không cần thiết
 * - Quản lý connection pool hiệu quả
 * - Tiết kiệm tài nguyên hệ thống
 */

const { Sequelize } = require('sequelize');
const dbConfig = require('../config/db.config');
const Logger = require('./Logger');

class DBConnection {
  // Biến static để lưu instance duy nhất
  static #instance = null;
  
  // Biến lưu Sequelize instance
  #sequelize = null;
  
  // Biến theo dõi trạng thái kết nối
  #isConnected = false;

  /**
   * Constructor private - chỉ gọi được từ bên trong class
   * Ngăn chặn việc tạo instance bằng toán tử `new` từ bên ngoài
   */
  constructor() {
    if (DBConnection.#instance) {
      throw new Error('❌ Không thể tạo instance mới! Sử dụng DBConnection.getInstance()');
    }

    // Khởi tạo Sequelize với config từ db.config.js
    // ✅ FIX: SQL Server cần "server" property thay vì "host"
    this.#sequelize = new Sequelize(
      dbConfig.DB,
      dbConfig.USER,
      dbConfig.PASSWORD,
      {
        host: dbConfig.HOST,
        server: dbConfig.HOST, // ✅ Thêm server property cho SQL Server
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        dialectOptions: dbConfig.dialectOptions,
        // ✅ XÓA timezone - để Sequelize không thêm offset vào datetime
        // timezone: '+00:00',
        pool: dbConfig.pool,
        logging: (msg) => Logger.getInstance().info(`[Sequelize] ${msg}`),
        // Tắt logging nếu muốn: logging: false
      }
    );

    Logger.getInstance().info('🔧 DBConnection Singleton đã được khởi tạo');
  }

  /**
   * Phương thức static để lấy instance duy nhất
   * Đây là ĐIỂM TRUY CẬP DUY NHẤT để lấy DBConnection
   */
  static getInstance() {
    if (!DBConnection.#instance) {
      DBConnection.#instance = new DBConnection();
    }
    return DBConnection.#instance;
  }

  /**
   * Lấy Sequelize instance để sử dụng
   */
  getSequelize() {
    return this.#sequelize;
  }

  /**
   * Kiểm tra và thiết lập kết nối đến database
   */
  async connect() {
    if (this.#isConnected) {
      Logger.getInstance().info('✅ Database đã được kết nối trước đó');
      return true;
    }

    try {
      await this.#sequelize.authenticate();
      this.#isConnected = true;
      Logger.getInstance().info('✅ Kết nối database thành công!');
      return true;
    } catch (error) {
      Logger.getInstance().error(`❌ Kết nối database thất bại: ${error.message}`);
      throw error;
    }
  }

  /**
   * Đóng kết nối database
   */
  async disconnect() {
    if (!this.#isConnected) {
      Logger.getInstance().info('⚠️ Database chưa được kết nối');
      return;
    }

    try {
      await this.#sequelize.close();
      this.#isConnected = false;
      Logger.getInstance().info('🔌 Đã đóng kết nối database');
    } catch (error) {
      Logger.getInstance().error(`❌ Lỗi khi đóng kết nối: ${error.message}`);
      throw error;
    }
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  isConnected() {
    return this.#isConnected;
  }

  /**
   * Đồng bộ hóa models với database
   * @param {Object} options - Tùy chọn sync (force, alter...)
   */
  async syncModels(options = {}) {
    try {
      await this.#sequelize.sync(options);
      Logger.getInstance().info('✅ Đồng bộ models thành công');
    } catch (error) {
      Logger.getInstance().error(`❌ Đồng bộ models thất bại: ${error.message}`);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = DBConnection;
