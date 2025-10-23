/**
 * Order API
 * Order related API calls
 */

import apiClient from './client';

/**
 * Tạo đơn hàng mới từ giỏ hàng
 * @param {Object} orderData - Thông tin đơn hàng
 * @param {number} orderData.KhachHangID - ID khách hàng
 * @param {number} orderData.PhuongThucThanhToanID - ID phương thức thanh toán
 * @param {string} [orderData.GhiChu] - Ghi chú đơn hàng
 * @returns {Promise<Object>} - Order data
 */
export const createOrder = async (orderData) => {
  const response = await apiClient.post('/orders/create', orderData);
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Không thể tạo đơn hàng');
};

/**
 * Lấy lịch sử đơn hàng của user
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số đơn hàng mỗi trang
 * @returns {Promise<Object>} - Orders list với pagination
 */
export const getOrderHistory = async (page = 1, limit = 10) => {
  const response = await apiClient.get('/orders/history', {
    params: { page, limit }
  });
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Không thể tải lịch sử đơn hàng');
};

/**
 * Lấy chi tiết đơn hàng
 * @param {number} orderId - ID đơn hàng
 * @returns {Promise<Object>} - Order detail
 */
export const getOrderDetail = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}`);
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Không thể tải chi tiết đơn hàng');
};

/**
 * Hủy đơn hàng
 * @param {number} orderId - ID đơn hàng
 * @param {string} reason - Lý do hủy
 * @returns {Promise<Object>} - Updated order
 */
export const cancelOrder = async (orderId, reason) => {
  const response = await apiClient.put(`/orders/${orderId}/cancel`, { reason });
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Không thể hủy đơn hàng');
};

/**
 * Lấy danh sách phương thức thanh toán
 * @returns {Promise<Array>} - Payment methods list
 */
export const getPaymentMethods = async () => {
  const response = await apiClient.get('/payment-methods');
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Không thể tải phương thức thanh toán');
};

const orderApi = {
  createOrder,
  getOrderHistory,
  getOrderDetail,
  cancelOrder,
  getPaymentMethods,
};

export default orderApi;
