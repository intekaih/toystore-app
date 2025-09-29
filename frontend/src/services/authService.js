// API service xử lý authentication
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AuthService {
  /**
   * Đăng ký tài khoản mới
   * @param {Object} userData - Dữ liệu đăng ký
   * @param {string} userData.TenDangNhap - Tên đăng nhập
   * @param {string} userData.MatKhau - Mật khẩu
   * @param {string} userData.HoTen - Họ tên đầy đủ
   * @param {string} userData.Email - Địa chỉ email
   * @param {string} userData.DienThoai - Số điện thoại (tùy chọn)
   * @returns {Promise} Response từ API
   */
  async register(userData) {
    try {
      // Debug: In ra URL đang gọi
      const url = `${API_BASE_URL}/auth/register`;
      console.log('🌐 API URL:', url);
      console.log('🌐 API_BASE_URL:', API_BASE_URL);
      
      console.log('📤 Gửi yêu cầu đăng ký:', userData);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      // Debug: Kiểm tra response
      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers.get('content-type'));

      // Kiểm tra content-type trước khi parse JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Nếu không phải JSON, đọc as text để debug
        const textResponse = await response.text();
        console.error('❌ Response không phải JSON:', textResponse);
        throw new Error('Server trả về response không phải JSON. Kiểm tra URL API.');
      }

      const data = await response.json();

      // Log response để debug
      console.log('📥 Response từ server:', {
        status: response.status,
        success: data.success,
        message: data.message
      });

      // Kiểm tra response status
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };

    } catch (error) {
      console.error('❌ Lỗi đăng ký:', error);

      // Xử lý các loại lỗi khác nhau
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      }

      // Ném lại lỗi để component xử lý
      throw error;
    }
  }

  /**
   * Đăng nhập tài khoản
   * @param {Object} loginData - Dữ liệu đăng nhập
   * @param {string} loginData.TenDangNhap - Tên đăng nhập hoặc Email
   * @param {string} loginData.MatKhau - Mật khẩu
   * @returns {Promise} Response từ API
   */
  async login(loginData) {
    try {
      const url = `${API_BASE_URL}/auth/login`;
      console.log('🔐 Gửi yêu cầu đăng nhập đến:', url);
      console.log('🔐 Dữ liệu đăng nhập:', { TenDangNhap: loginData.TenDangNhap });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      // Debug response
      console.log('📥 Login response status:', response.status);
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Login response không phải JSON:', textResponse);
        throw new Error('Server trả về response không phải JSON. Kiểm tra URL API.');
      }

      const data = await response.json();
      console.log('📥 Login response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Lưu token vào localStorage nếu đăng nhập thành công
      if (data.success && data.data && data.data.token) {
        this.saveToken(data.data.token);
        this.saveUserInfo(data.data.user);
        console.log('💾 Đã lưu token và thông tin user');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };

    } catch (error) {
      console.error('❌ Lỗi đăng nhập:', error);

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      }

      throw error;
    }
  }

  /**
   * Lưu JWT token vào localStorage
   * @param {string} token - JWT token
   */
  saveToken(token) {
    try {
      localStorage.setItem('token', token);
      console.log('💾 Token đã được lưu vào localStorage');
    } catch (error) {
      console.error('❌ Lỗi lưu token:', error);
    }
  }

  /**
   * Lưu thông tin user vào localStorage
   * @param {Object} user - Thông tin user
   */
  saveUserInfo(user) {
    try {
      localStorage.setItem('userInfo', JSON.stringify(user));
      console.log('💾 Thông tin user đã được lưu:', user);
    } catch (error) {
      console.error('❌ Lỗi lưu thông tin user:', error);
    }
  }

  /**
   * Lấy JWT token từ localStorage
   * @returns {string|null} JWT token hoặc null nếu không có
   */
  getToken() {
    try {
      const token = localStorage.getItem('token');
      return token;
    } catch (error) {
      console.error('❌ Lỗi lấy token:', error);
      return null;
    }
  }

  /**
   * Lấy thông tin user từ localStorage
   * @returns {Object|null} User info hoặc null nếu không có
   */
  getUserInfo() {
    try {
      const userInfo = localStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('❌ Lỗi lấy thông tin user:', error);
      return null;
    }
  }

  /**
   * Kiểm tra user đã đăng nhập chưa
   * @returns {boolean} True nếu đã đăng nhập
   */
  isLoggedIn() {
    const token = this.getToken();
    const userInfo = this.getUserInfo();
    
    // Kiểm tra có token và thông tin user
    if (!token || !userInfo) {
      return false;
    }

    // Kiểm tra token có hết hạn không (optional)
    try {
      // Decode JWT payload (không verify signature)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Nếu token hết hạn
      if (payload.exp && payload.exp < currentTime) {
        console.log('⏰ Token đã hết hạn');
        this.logout(); // Tự động logout
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Lỗi kiểm tra token:', error);
      return false;
    }
  }

  /**
   * Đăng xuất - xóa token và thông tin user
   */
  logout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      console.log('🔓 Đã đăng xuất và xóa token, thông tin user');
    } catch (error) {
      console.error('❌ Lỗi đăng xuất:', error);
    }
  }

  /**
   * Lấy thông tin profile từ API (cần token)
   * @returns {Promise} Response từ API
   */
  async getProfile() {
    try {
      const token = this.getToken();
      
      if (!token) {
        throw new Error('Không tìm thấy token đăng nhập');
      }

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        // Nếu token hết hạn hoặc không hợp lệ
        if (response.status === 401) {
          this.logout(); // Tự động logout
        }
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };

    } catch (error) {
      console.error('❌ Lỗi lấy profile:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new AuthService();