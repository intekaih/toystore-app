import axios from 'axios';
import config from '../config';
import { RoleChecker } from '../constants/roles';

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
   * Alias cho isLoggedIn() - để tương thích với các service khác
   */
  isAuthenticated() {
    return this.isLoggedIn();
  }

  /**
   * Lấy token từ localStorage
   */
  getToken() {
    try {
      // Thử lấy token user trước
      let token = localStorage.getItem(this.TOKEN_KEY);
      
      // Nếu không có, thử lấy adminToken
      if (!token) {
        token = localStorage.getItem('adminToken');
      }
      
      return token;
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
    if (!user) return false;
    const role = user.vaiTro || user.VaiTro || user.role;
    return RoleChecker.isAdmin(role);
  }

  /**
   * Kiểm tra user có phải nhân viên không
   */
  isStaff() {
    const user = this.getUser();
    if (!user) return false;
    const role = user.vaiTro || user.VaiTro || user.role;
    return RoleChecker.isStaff(role);
  }

  /**
   * Kiểm tra user có phải admin hoặc nhân viên không
   */
  isAdminOrStaff() {
    const user = this.getUser();
    if (!user) return false;
    const role = user.vaiTro || user.VaiTro || user.role;
    return RoleChecker.isAdminOrStaff(role);
  }

  /**
   * Lấy role của user
   */
  getUserRole() {
    const user = this.getUser();
    return RoleChecker.getUserRole(user);
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

  /**
   * Đăng nhập bằng Google - Redirect đến backend Google OAuth endpoint
   */
  googleLogin() {
    const backendUrl = API_URL.replace('/api', ''); // Lấy base URL (http://localhost:5000)
    window.location.href = `${backendUrl}/api/auth/google`;
  }

  /**
   * Xử lý callback từ Google OAuth
   * @param {string} token - JWT token từ backend
   */
  async handleGoogleCallback(token) {
    if (!token) {
      throw new Error('Không nhận được token từ Google');
    }

    // Lưu token
    this.setToken(token);

    // Fetch user profile từ backend
    try {
      const response = await this.api.get('/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.success) {
        const user = response.data.data.user;
        this.saveUserInfo(user);
        return { token, user };
      } else {
        throw new Error('Không thể lấy thông tin người dùng');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Vẫn giữ token nếu có, user có thể được load sau
      throw error;
    }
  }

  /**
   * Set token (dùng cho Google callback)
   */
  setToken(token) {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }
}

export default new AuthService();