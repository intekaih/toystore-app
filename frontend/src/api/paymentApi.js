const API_URL = 'http://localhost:5000/api';

/**
 * Tạo URL thanh toán VNPay
 * @param {number} orderId - ID đơn hàng
 * @param {number} amount - Số tiền thanh toán
 * @param {string} bankCode - Mã ngân hàng (optional)
 * @param {string} language - Ngôn ngữ (vn hoặc en)
 */
export const createVNPayPaymentUrl = async (orderId, amount, bankCode = '', language = 'vn') => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Vui lòng đăng nhập để thanh toán');
    }

    // Validate input
    if (!orderId) {
      throw new Error('Thiếu mã đơn hàng');
    }

    if (!amount || amount <= 0) {
      throw new Error('Số tiền thanh toán không hợp lệ');
    }

    console.log('Creating VNPay payment URL with:', { orderId, amount, bankCode, language });

    const params = new URLSearchParams({
      orderId: String(orderId), // Chuyển sang string rõ ràng
      amount: String(amount),   // Chuyển sang string rõ ràng
      language: language
    });

    if (bankCode) {
      params.append('bankCode', bankCode);
    }

    const response = await fetch(
      `${API_URL}/payment/vnpay/create-payment-url?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Không thể tạo URL thanh toán');
    }

    return data;
  } catch (error) {
    console.error('Error creating VNPay payment URL:', error);
    throw error;
  }
};

/**
 * Kiểm tra kết quả thanh toán VNPay
 * @param {URLSearchParams} queryParams - Query parameters từ VNPay return URL
 */
export const verifyVNPayReturn = async (queryParams) => {
  try {
    const response = await fetch(
      `${API_URL}/payment/vnpay/return?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Xác thực thanh toán thất bại');
    }

    return data;
  } catch (error) {
    console.error('Error verifying VNPay return:', error);
    throw error;
  }
};
