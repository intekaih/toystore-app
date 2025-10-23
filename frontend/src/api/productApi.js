/**
 * Product API
 * Product related API calls
 */

import apiClient from './client';
import config from '../config';

/**
 * Lấy danh sách sản phẩm với phân trang và tìm kiếm
 * @param {number} page - Số trang
 * @param {string} search - Từ khóa tìm kiếm
 * @param {number} limit - Số lượng sản phẩm mỗi trang
 * @returns {Promise<Object>} - Danh sách sản phẩm và thông tin phân trang
 */
export const getProducts = async (page = 1, search = '', limit = 10) => {
  const response = await apiClient.get(config.api.endpoints.product.list, {
    params: { page, search, limit }
  });
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Không thể tải danh sách sản phẩm');
};

/**
 * Lấy chi tiết một sản phẩm
 * @param {number|string} id - ID sản phẩm
 * @returns {Promise<Object>} - Thông tin chi tiết sản phẩm
 */
export const getProductById = async (id) => {
  const response = await apiClient.get(config.api.endpoints.product.detail(id));
  
  console.log('📦 Product API response:', response.data);
  
  if (response.data.success) {
    return response.data.data.product;
  }
  
  throw new Error(response.data.message || 'Không thể tải thông tin sản phẩm');
};

/**
 * Tìm kiếm sản phẩm
 * @param {string} keyword - Từ khóa tìm kiếm
 * @param {Object} filters - Các bộ lọc
 * @returns {Promise<Object>} - Kết quả tìm kiếm
 */
export const searchProducts = async (keyword, filters = {}) => {
  const response = await apiClient.get(config.api.endpoints.product.search, {
    params: { keyword, ...filters }
  });
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Tìm kiếm thất bại');
};

/**
 * Lấy sản phẩm theo danh mục
 * @param {number} categoryId - ID danh mục
 * @param {number} page - Số trang
 * @param {number} limit - Số lượng sản phẩm mỗi trang
 * @returns {Promise<Object>} - Danh sách sản phẩm
 */
export const getProductsByCategory = async (categoryId, page = 1, limit = 10) => {
  const response = await apiClient.get(config.api.endpoints.product.list, {
    params: { categoryId, page, limit }
  });
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Không thể tải sản phẩm theo danh mục');
};

export default {
  getProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
};