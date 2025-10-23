/**
 * useProduct Hook
 * Custom hook for product data management
 */

import { useState, useEffect, useCallback } from 'react';
import { getProducts, getProductById } from '../api/productApi';
import { LOADING_STATES, PAGINATION } from '../utils/constants';

/**
 * Hook để lấy danh sách sản phẩm
 * @param {Object} options - Options
 * @returns {Object} - Products data và handlers
 */
export const useProducts = (options = {}) => {
  const {
    initialPage = PAGINATION.DEFAULT_PAGE,
    initialSearch = '',
    limit = PAGINATION.DEFAULT_LIMIT,
  } = options;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(LOADING_STATES.IDLE);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  /**
   * Fetch products
   */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(LOADING_STATES.LOADING);
      setError(null);

      const data = await getProducts(currentPage, searchTerm, limit);

      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.total || 0);
      setLoading(LOADING_STATES.SUCCESS);
    } catch (err) {
      setError(err.message);
      setLoading(LOADING_STATES.ERROR);
      setProducts([]);
    }
  }, [currentPage, searchTerm, limit]);

  /**
   * Refetch products
   */
  const refetch = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  /**
   * Change page
   */
  const changePage = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  /**
   * Change search term
   */
  const changeSearch = useCallback((search) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset về trang 1 khi search
  }, []);

  // Fetch products khi dependencies thay đổi
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading: loading === LOADING_STATES.LOADING,
    error,
    currentPage,
    totalPages,
    total,
    searchTerm,
    changePage,
    changeSearch,
    refetch,
  };
};

/**
 * Hook để lấy chi tiết sản phẩm
 * @param {number|string} productId - ID sản phẩm
 * @returns {Object} - Product data và handlers
 */
export const useProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(LOADING_STATES.IDLE);
  const [error, setError] = useState(null);

  /**
   * Fetch product detail
   */
  const fetchProduct = useCallback(async () => {
    if (!productId) return;

    try {
      setLoading(LOADING_STATES.LOADING);
      setError(null);

      const data = await getProductById(productId);
      setProduct(data);
      setLoading(LOADING_STATES.SUCCESS);
    } catch (err) {
      setError(err.message);
      setLoading(LOADING_STATES.ERROR);
      setProduct(null);
    }
  }, [productId]);

  /**
   * Refetch product
   */
  const refetch = useCallback(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Fetch product khi productId thay đổi
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading: loading === LOADING_STATES.LOADING,
    error,
    refetch,
  };
};

export default {
  useProducts,
  useProduct,
};
