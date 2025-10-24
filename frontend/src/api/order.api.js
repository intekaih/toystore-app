import apiClient from './client';

/**
 * Order API
 * Order related API calls
 */

// Tạo đơn hàng từ giỏ hàng
export const createOrder = async (orderData) => {
  try {
    console.log('🛒 Creating order with data:', orderData);  // ← DEBUG
    
    // ✅ GỬI ĐẦY ĐỦ TẤT CẢ FIELD
    const response = await apiClient.post('/orders/create', orderData);  // ← GỬI TOÀN BỘ orderData
    
    console.log('✅ Order created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Create order error:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Không thể tạo đơn hàng');
  }
};

// Lấy danh sách đơn hàng của user
export const getOrderHistory = async (params = {}) => {
  try {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get order history error:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Không thể lấy lịch sử đơn hàng');
  }
};

// Lấy chi tiết đơn hàng
export const getOrderDetail = async (orderId) => {
  try {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Get order detail error:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Không thể lấy chi tiết đơn hàng');
  }
};

// Hủy đơn hàng
export const cancelOrder = async (orderId) => {
  try {
    const response = await apiClient.patch(`/orders/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('❌ Cancel order error:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Không thể hủy đơn hàng');
  }
};

// ✅ Export as named exports (ESLint compliant)
const orderApi = {
  createOrder,
  getOrderHistory,
  getOrderDetail,
  cancelOrder
};

export default orderApi;
