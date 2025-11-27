const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const db = require('../models');
const { Op } = require('sequelize');
const TaiKhoan = db.TaiKhoan;
const ConfigService = require('../utils/ConfigService');
const Logger = require('../utils/Logger');

const config = ConfigService.getInstance();
const logger = Logger.getInstance();

// Lấy Google OAuth config
const googleClientId = config.getValue('google', 'clientId');
const googleClientSecret = config.getValue('google', 'clientSecret');
let googleCallbackUrl = config.getValue('google', 'callbackUrl');

// Đảm bảo callback URL không có trailing slash và đúng format
if (googleCallbackUrl) {
  googleCallbackUrl = googleCallbackUrl.trim().replace(/\/$/, ''); // Xóa trailing slash
  logger.info(`🔗 Google OAuth Callback URL: ${googleCallbackUrl}`);
}

/**
 * Google OAuth Strategy
 * Xử lý đăng nhập/đăng ký bằng Google
 * Chỉ load strategy khi có đầy đủ config
 */
if (googleClientId && googleClientSecret && googleCallbackUrl) {
  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: googleCallbackUrl
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    const { id, displayName, emails, photos } = profile;
    const email = emails && emails[0] ? emails[0].value : null;
    const photo = photos && photos[0] ? photos[0].value : null;

    if (!email) {
      logger.warn('Google OAuth: Không thể lấy email từ Google profile');
      return done(new Error('Không thể lấy email từ Google'), null);
    }

    logger.info('Google OAuth: Xử lý profile', { 
      googleId: id, 
      email: email,
      displayName: displayName 
    });

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
      // User đã tồn tại
      if (!user.GoogleID) {
        // Liên kết Google với tài khoản hiện có (email trùng)
        user.GoogleID = id;
        // Cập nhật LoginMethod
        if (user.MatKhau) {
          user.LoginMethod = 'Both';  // Có cả password và Google
        } else {
          user.LoginMethod = 'Google';
        }
        await user.save();
        logger.success(`✅ Đã liên kết Google với tài khoản: ${user.TenDangNhap}`);
      } else if (user.GoogleID !== id) {
        // Email trùng nhưng GoogleID khác - có thể là tài khoản khác
        logger.warn(`Google OAuth: Email ${email} đã được sử dụng bởi GoogleID khác`);
        return done(new Error('Email đã được sử dụng bởi tài khoản Google khác'), null);
      } else {
        // User đã có GoogleID trùng - đăng nhập thành công
        logger.info(`✅ Google OAuth: User đã tồn tại - ${user.TenDangNhap}`);
      }
    } else {
      // Tạo tài khoản mới
      // Tạo username từ email (tránh trùng)
      const emailPrefix = email.split('@')[0];
      let username = emailPrefix;
      let counter = 1;
      
      // Kiểm tra username đã tồn tại chưa
      while (await TaiKhoan.findOne({ where: { TenDangNhap: username } })) {
        username = `${emailPrefix}_${Date.now().toString().slice(-6)}`;
        counter++;
        if (counter > 10) break; // Tránh vòng lặp vô hạn
      }

      user = await TaiKhoan.create({
        TenDangNhap: username,
        MatKhau: null, // Không có mật khẩu cho Google login
        HoTen: displayName || emailPrefix,
        Email: email.toLowerCase(),
        GoogleID: id,
        LoginMethod: 'Google',
        VaiTro: 'KhachHang',
        TrangThai: true
      });

      logger.success(`✅ Đã tạo tài khoản mới từ Google: ${user.TenDangNhap} (ID: ${user.ID})`);
    }

    return done(null, user);
  } catch (error) {
    logger.logError(error, 'Google OAuth Strategy');
    return done(error, null);
  }
  }));
  
  logger.success('✅ Google OAuth Strategy đã được khởi tạo');
} else {
  logger.warn('⚠️ Google OAuth chưa được cấu hình. Vui lòng thêm GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET vào file .env');
  logger.warn('⚠️ Đăng nhập bằng Google sẽ không hoạt động cho đến khi cấu hình xong');
}

module.exports = passport;

