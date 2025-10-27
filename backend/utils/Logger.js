/**
 * ==========================================
 * Logger.js - SINGLETON PATTERN
 * ==========================================
 * Mục đích: Tạo một hệ thống logging toàn cục cho ứng dụng
 * với format nhất quán: [time] [level] message
 * 
 * Lợi ích:
 * - Tập trung quản lý log tại một điểm duy nhất
 * - Dễ dàng mở rộng (ghi file, gửi log server...)
 * - Format log nhất quán trong toàn bộ hệ thống
 * - Có thể bật/tắt log theo level (dev/production)
 */

const fs = require('fs');
const path = require('path');

class Logger {
  // Biến static lưu instance duy nhất
  static #instance = null;
  
  // Các log levels
  static LEVELS = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG',
    SUCCESS: 'SUCCESS'
  };

  // Màu cho console (ANSI colors)
  static COLORS = {
    INFO: '\x1b[36m',    // Cyan
    WARN: '\x1b[33m',    // Yellow
    ERROR: '\x1b[31m',   // Red
    DEBUG: '\x1b[35m',   // Magenta
    SUCCESS: '\x1b[32m', // Green
    RESET: '\x1b[0m'     // Reset
  };

  // Cấu hình logger
  #config = {
    enableConsole: true,
    enableFile: true,
    logDirectory: path.join(__dirname, '../logs'),
    logFileName: 'app.log',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    dateFormat: 'vi-VN'
  };

  /**
   * Constructor private
   */
  constructor() {
    if (Logger.#instance) {
      throw new Error('❌ Không thể tạo instance mới! Sử dụng Logger.getInstance()');
    }

    // Tạo thư mục logs nếu chưa tồn tại
    if (this.#config.enableFile && !fs.existsSync(this.#config.logDirectory)) {
      fs.mkdirSync(this.#config.logDirectory, { recursive: true });
    }

    console.log('🔧 Logger Singleton đã được khởi tạo');
  }

  /**
   * Lấy instance duy nhất của Logger
   */
  static getInstance() {
    if (!Logger.#instance) {
      Logger.#instance = new Logger();
    }
    return Logger.#instance;
  }

  /**
   * Cấu hình Logger
   * @param {Object} config - Cấu hình mới
   */
  configure(config) {
    this.#config = { ...this.#config, ...config };
    
    // Tạo thư mục logs nếu thay đổi đường dẫn
    if (this.#config.enableFile && !fs.existsSync(this.#config.logDirectory)) {
      fs.mkdirSync(this.#config.logDirectory, { recursive: true });
    }
  }

  /**
   * Lấy timestamp hiện tại với format
   */
  #getTimestamp() {
    const now = new Date();
    return now.toLocaleString(this.#config.dateFormat, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  /**
   * Phương thức ghi log chung
   * @param {string} level - Log level (INFO, WARN, ERROR...)
   * @param {string} message - Nội dung log
   * @param {Object} metadata - Dữ liệu bổ sung (optional)
   */
  #log(level, message, metadata = null) {
    const timestamp = this.#getTimestamp();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    // Ghi ra console
    if (this.#config.enableConsole) {
      const color = Logger.COLORS[level] || Logger.COLORS.RESET;
      console.log(`${color}${logMessage}${Logger.COLORS.RESET}`);
      
      // In metadata nếu có
      if (metadata) {
        console.log(`${color}Metadata:${Logger.COLORS.RESET}`, metadata);
      }
    }

    // Ghi ra file
    if (this.#config.enableFile) {
      this.#writeToFile(logMessage, metadata);
    }
  }

  /**
   * Ghi log vào file
   */
  #writeToFile(message, metadata = null) {
    try {
      const logFilePath = path.join(this.#config.logDirectory, this.#config.logFileName);
      
      // Kiểm tra kích thước file
      if (fs.existsSync(logFilePath)) {
        const stats = fs.statSync(logFilePath);
        if (stats.size > this.#config.maxFileSize) {
          // Rotate log file (đổi tên file cũ)
          const timestamp = Date.now();
          const archiveName = `app-${timestamp}.log`;
          fs.renameSync(logFilePath, path.join(this.#config.logDirectory, archiveName));
        }
      }

      // Ghi log
      let logContent = message + '\n';
      if (metadata) {
        logContent += `Metadata: ${JSON.stringify(metadata, null, 2)}\n`;
      }
      
      fs.appendFileSync(logFilePath, logContent, 'utf8');
    } catch (error) {
      console.error('❌ Lỗi khi ghi log vào file:', error.message);
    }
  }

  /**
   * Log level INFO
   */
  info(message, metadata = null) {
    this.#log(Logger.LEVELS.INFO, message, metadata);
  }

  /**
   * Log level WARN
   */
  warn(message, metadata = null) {
    this.#log(Logger.LEVELS.WARN, message, metadata);
  }

  /**
   * Log level ERROR
   */
  error(message, metadata = null) {
    this.#log(Logger.LEVELS.ERROR, message, metadata);
  }

  /**
   * Log level DEBUG
   */
  debug(message, metadata = null) {
    this.#log(Logger.LEVELS.DEBUG, message, metadata);
  }

  /**
   * Log level SUCCESS
   */
  success(message, metadata = null) {
    this.#log(Logger.LEVELS.SUCCESS, message, metadata);
  }

  /**
   * Log HTTP request
   */
  logRequest(req, message = 'HTTP Request') {
    const metadata = {
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    };
    this.info(message, metadata);
  }

  /**
   * Log lỗi với stack trace
   */
  logError(error, context = '') {
    const metadata = {
      context,
      stack: error.stack,
      name: error.name
    };
    this.error(error.message, metadata);
  }

  /**
   * Xóa tất cả log files
   */
  clearLogs() {
    try {
      const files = fs.readdirSync(this.#config.logDirectory);
      files.forEach(file => {
        if (file.endsWith('.log')) {
          fs.unlinkSync(path.join(this.#config.logDirectory, file));
        }
      });
      this.info('🗑️ Đã xóa tất cả log files');
    } catch (error) {
      this.error(`❌ Lỗi khi xóa log files: ${error.message}`);
    }
  }
}

// Export singleton class
module.exports = Logger;
