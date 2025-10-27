// src/api/productApi.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

/**
 * 🎯 Lấy danh sách sản phẩm với Strategy Pattern filters
 * 
 * @param {Object} params - Tham số query
 * @param {Number} params.page - Trang hiện tại
 * @param {Number} params.limit - Số sản phẩm mỗi trang
 * @param {String} params.search - Từ khóa tìm kiếm
 * @param {String} params.filter - Strategy filter (newest, priceAsc, priceDesc, bestSeller)
 * @param {Number} params.minPrice - Giá tối thiểu
 * @param {Number} params.maxPrice - Giá tối đa
 * @param {Number} params.categoryId - ID danh mục
 */
export const getProducts = async (params = {}) => {
  try {
    // Mặc định
    const defaultParams = {
      page: 1,
      limit: 10,
      search: '',
      filter: 'newest', // 🎯 Strategy mặc định
    };

    // Merge params với default
    const queryParams = { ...defaultParams, ...params };

    // Loại bỏ params null/undefined
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === null || queryParams[key] === undefined || queryParams[key] === '') {
        delete queryParams[key];
      }
    });

    console.log('🔍 API Request params:', queryParams);

    const response = await axios.get(`${API_URL}/products`, {
      params: queryParams
    });

    console.log('✅ API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};

/**
 * 🎯 Lấy danh sách các filter strategies có sẵn từ backend
 */
export const getAvailableFilters = () => {
  return [
    { value: 'newest', label: '📅 Mới nhất', icon: '🆕' },
    { value: 'priceAsc', label: '💰 Giá thấp → cao', icon: '⬆️' },
    { value: 'priceDesc', label: '💎 Giá cao → thấp', icon: '⬇️' },
    { value: 'bestSeller', label: '🔥 Bán chạy nhất', icon: '⭐' },
  ];
};