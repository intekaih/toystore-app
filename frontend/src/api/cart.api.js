/**
 * Cart API
 * Shopping cart related API calls
 */

import apiClient from './client';
import { normalizeCartItem } from '../utils/normalize';

/**
 * Lấy giỏ hàng của user hiện tại
 * @returns {Promise<Object>} - Cart data với danh sách sản phẩm
 */
export const getCart = async () => {
  const response = await apiClient.get('/cart');
  
  if (response.data.success) {
    const data = response.data.data;
    
    return {
      items: (data.items || []).map(item => {
        const normalized = normalizeCartItem(item);
        
        return {
          id: normalized.id,
          sanPhamId: normalized.sanPhamId,
          tenSanPham: normalized.sanPham?.ten || '',
          hinhAnh: normalized.sanPham?.hinhAnhURL || '',
          giaBan: parseFloat(normalized.donGia || normalized.sanPham?.giaBan || 0),
          soLuong: normalized.soLuong,
          ton: normalized.sanPham?.ton || 0,
          thanhTien: normalized.thanhTien || (parseFloat(normalized.donGia) * normalized.soLuong)
        };
      }),
      totalItems: data.totalItems || 0,
      totalAmount: data.totalAmount || 0
    };
  }
  
  throw new Error(response.data.message || 'Không thể tải giỏ hàng');
};

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {number} sanPhamId - ID sản phẩm
 * @param {number} soLuong - Số lượng muốn thêm
 * @returns {Promise<Object>} - Updated cart data
 */
export const addToCart = async (sanPhamId, soLuong = 1) => {
  const response = await apiClient.post('/cart/add', {
    sanPhamId: sanPhamId,  // Backend nhận sanPhamId (chữ thường)
    soLuong: soLuong,
  });
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Không thể thêm vào giỏ hàng');
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 * @param {number} sanPhamId - ID sản phẩm
 * @param {number} soLuong - Số lượng mới
 * @returns {Promise<Object>} - Updated cart data
 */
export const updateCartItem = async (sanPhamId, soLuong) => {
  const response = await apiClient.put('/cart/update', {
    sanPhamId: sanPhamId,  // Backend nhận sanPhamId
    soLuong: soLuong,
  });
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Không thể cập nhật giỏ hàng');
};

/**
 * Tăng 1 đơn vị sản phẩm
 * @param {number} productId - ID sản phẩm
 * @returns {Promise<Object>} - Updated item
 */
export const incrementCartItem = async (productId) => {
  const response = await apiClient.patch(`/cart/increment/${productId}`);
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Không thể tăng số lượng');
};

/**
 * Giảm 1 đơn vị sản phẩm
 * @param {number} productId - ID sản phẩm
 * @returns {Promise<Object>} - Updated item hoặc removed = true
 */
export const decrementCartItem = async (productId) => {
  const response = await apiClient.patch(`/cart/decrement/${productId}`);
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Không thể giảm số lượng');
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 * @param {number} productId - ID sản phẩm
 * @returns {Promise<Object>} - Success message
 */
export const removeFromCart = async (productId) => {
  const response = await apiClient.delete(`/cart/remove/${productId}`);
  
  if (response.data.success) {
    return response.data.data || {};
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
    return response.data.data || {};
  }
  
  throw new Error(response.data.message || 'Không thể xóa giỏ hàng');
};

const cartApi = {
  getCart,
  addToCart,
  updateCartItem,
  incrementCartItem,
  decrementCartItem,
  removeFromCart,
  clearCart,
};

export default cartApi;
