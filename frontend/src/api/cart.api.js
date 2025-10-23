/**
 * Cart API
 * Shopping cart related API calls
 */

import apiClient from './client';

/**
 * Lấy giỏ hàng của user hiện tại
 * @returns {Promise<Object>} - Cart data với danh sách sản phẩm
 */
export const getCart = async () => {
  const response = await apiClient.get('/cart');
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Không thể tải giỏ hàng');
};

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {number} sanPhamID - ID sản phẩm
 * @param {number} soLuong - Số lượng muốn thêm
 * @returns {Promise<Object>} - Updated cart data
 */
export const addToCart = async (sanPhamID, soLuong = 1) => {
  const response = await apiClient.post('/cart/add', {
    SanPhamID: sanPhamID,
    SoLuong: soLuong,
  });
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Không thể thêm vào giỏ hàng');
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 * @param {number} gioHangChiTietID - ID của item trong giỏ hàng
 * @param {number} soLuong - Số lượng mới
 * @returns {Promise<Object>} - Updated cart data
 */
export const updateCartItem = async (gioHangChiTietID, soLuong) => {
  const response = await apiClient.put(`/cart/update/${gioHangChiTietID}`, {
    SoLuong: soLuong,
  });
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Không thể cập nhật giỏ hàng');
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 * @param {number} gioHangChiTietID - ID của item trong giỏ hàng
 * @returns {Promise<Object>} - Updated cart data
 */
export const removeFromCart = async (gioHangChiTietID) => {
  const response = await apiClient.delete(`/cart/remove/${gioHangChiTietID}`);
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Không thể xóa sản phẩm');
};

/**
 * Xóa toàn bộ giỏ hàng
 * @returns {Promise<Object>} - Empty cart data
 */
export const clearCart = async () => {
  const response = await apiClient.delete('/cart/clear');
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Không thể xóa giỏ hàng');
};

const cartApi = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};

export default cartApi;
