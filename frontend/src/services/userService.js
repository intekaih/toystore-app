// Service xử lý các API liên quan đến thông tin người dùng
import authService from './authService';
import config from '../config';

const API_URL = config.API_URL; // Sửa từ API_BASE_URL thành API_URL để có /api prefix

class UserService {
  /**
   * Lấy thông tin profile của người dùng hiện tại
   * @returns {Promise} Response từ API
   */
  async getProfile() {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Không tìm thấy token đăng nhập');
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Kiểm tra content-type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        throw new Error('Server trả về response không hợp lệ');
      }

      const data = await response.json();

      if (!response.ok) {
        // Nếu token hết hạn hoặc không hợp lệ
        if (response.status === 401) {
          authService.logout(); // Tự động logout
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
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

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      }

      throw error;
    }
  }

  /**
   * Cập nhật thông tin profile của người dùng
   * @param {Object} updateData - Dữ liệu cần cập nhật
   * @param {string} updateData.HoTen - Họ tên mới
   * @param {string} updateData.Email - Email mới
   * @param {string} updateData.DienThoai - Số điện thoại mới
   * @returns {Promise} Response từ API
   */
  async updateProfile(updateData) {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Không tìm thấy token đăng nhập');
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      // Kiểm tra content-type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        throw new Error('Server trả về response không hợp lệ');
      }

      const data = await response.json();

      if (!response.ok) {
        // Nếu token hết hạn hoặc không hợp lệ
        if (response.status === 401) {
          authService.logout(); // Tự động logout
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }

        // Xử lý lỗi validation từ server
        if (response.status === 400 && data.errors) {
          throw new Error(data.errors.join(', '));
        }

        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Cập nhật thông tin user trong localStorage
      if (data.success && data.data && data.data.user) {
        authService.saveUserInfo(data.data.user);
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };

    } catch (error) {
      console.error('❌ Lỗi cập nhật profile:', error);

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      }

      throw error;
    }
  }

  /**
   * Kiểm tra email có hợp lệ không
   * @param {string} email - Email cần kiểm tra
   * @returns {boolean} True nếu email hợp lệ
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Kiểm tra số điện thoại Việt Nam có hợp lệ không
   * @param {string} phone - Số điện thoại cần kiểm tra
   * @returns {boolean} True nếu số điện thoại hợp lệ
   */
  validatePhoneNumber(phone) {
    // Regex cho số điện thoại Việt Nam: bắt đầu bằng 0 hoặc +84, theo sau là 9-10 số
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Kiểm tra họ tên có hợp lệ không
   * @param {string} name - Họ tên cần kiểm tra
   * @returns {boolean} True nếu họ tên hợp lệ
   */
  validateName(name) {
    // Regex cho họ tên: chỉ chứa chữ cái tiếng Việt và khoảng trắng
    const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
    return name.trim().length >= 2 && nameRegex.test(name.trim());
  }
}

// Export singleton instance
export default new UserService();