import axios from 'axios';
import config from '../config';

const API_URL = config.API_URL; // Sửa từ API_BASE_URL thành API_URL

class AuthService {
  constructor() {
    this.TOKEN_KEY = 'token';
    this.USER_KEY = 'user';
    
    // Tạo axios instance
    this.api = axios.create({
      baseURL: API_URL, // Sửa từ API_BASE_URL thành API_URL
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Đăng nhập
   */
  async login(loginData) {
    try {
      const response = await this.api.post('/auth/login', loginData);
      
      if (response.data && response.data.success) {
        const { token, user } = response.data.data;
        
        // Lưu vào localStorage
        this.setAuth(token, user);
        
        return { token, user };
      } else {
        throw new Error(response.data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('❌ Lỗi đăng nhập:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            throw new Error(data.message || 'Thông tin đăng nhập không hợp lệ');
          case 401:
            // Backend trả về 401 cho cả "không tìm thấy user" và "sai mật khẩu"
            throw new Error(data.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
          case 403:
            throw new Error(data.message || 'Tài khoản đã bị khóa');
          case 429:
            throw new Error(data.message || 'Quá nhiều lần thử. Vui lòng thử lại sau');
          case 500:
            throw new Error('Lỗi máy chủ, vui lòng thử lại sau');
          default:
            throw new Error(data.message || `Lỗi ${status}`);
        }
      } else if (error.request) {
        throw new Error('Không thể kết nối đến máy chủ');
      } else {
        throw new Error(error.message || 'Có lỗi xảy ra');
      }
    }
  }

  /**
   * Đăng ký
   */
  async register(registerData) {
    try {
      const response = await this.api.post('/auth/register', registerData);
      
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      console.error('❌ Lỗi đăng ký:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            throw new Error(data.message || 'Thông tin đăng ký không hợp lệ');
          case 409:
            throw new Error('Tên đăng nhập hoặc email đã tồn tại');
          case 500:
            throw new Error('Lỗi máy chủ, vui lòng thử lại sau');
          default:
            throw new Error(data.message || `Lỗi ${status}`);
        }
      } else if (error.request) {
        throw new Error('Không thể kết nối đến máy chủ');
      } else {
        throw new Error(error.message || 'Có lỗi xảy ra');
      }
    }
  }

  /**
   * Kiểm tra xem user đã đăng nhập chưa
   */
  isLoggedIn() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user && !this.isTokenExpired());
  }

  /**
   * Lấy token từ localStorage
   */
  getToken() {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Lấy thông tin user từ localStorage
   */
  getUser() {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * Lưu thông tin user (dùng cho việc update profile)
   */
  saveUserInfo(user) {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user info:', error);
    }
  }

  /**
   * Lấy thông tin user (alias cho getUser)
   */
  getUserInfo() {
    return this.getUser();
  }

  /**
   * Lưu token và user info vào localStorage
   */
  setAuth(token, user) {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting auth:', error);
    }
  }

  /**
   * Xóa thông tin đăng nhập
   */
  logout() {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  /**
   * Kiểm tra role của user
   */
  isAdmin() {
    const user = this.getUser();
    return user && user.vaiTro === 'admin';
  }

  /**
   * Kiểm tra token có hết hạn không
   */
  isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Decode JWT payload (chỉ để kiểm tra exp, không verify signature)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp && payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }
}

export default new AuthService();