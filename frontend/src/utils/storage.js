/**
 * Storage Utilities
 * Centralized localStorage management
 */

import { STORAGE_KEYS } from './constants';

/**
 * Lưu dữ liệu vào localStorage
 * @param {string} key - Key để lưu
 * @param {any} value - Giá trị cần lưu
 */
export const setItem = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

/**
 * Lấy dữ liệu từ localStorage
 * @param {string} key - Key cần lấy
 * @param {any} defaultValue - Giá trị mặc định nếu không tìm thấy
 * @returns {any} - Giá trị đã parse
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Xóa dữ liệu khỏi localStorage
 * @param {string} key - Key cần xóa
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
};

/**
 * Xóa tất cả dữ liệu trong localStorage
 */
export const clear = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Kiểm tra key có tồn tại không
 * @param {string} key - Key cần kiểm tra
 * @returns {boolean}
 */
export const hasItem = (key) => {
  return localStorage.getItem(key) !== null;
};

// Auth-specific storage functions

/**
 * Lưu token đăng nhập
 * @param {string} token - JWT token
 */
export const setToken = (token) => {
  setItem(STORAGE_KEYS.TOKEN, token);
};

/**
 * Lấy token đăng nhập
 * @returns {string|null}
 */
export const getToken = () => {
  return getItem(STORAGE_KEYS.TOKEN);
};

/**
 * Xóa token đăng nhập
 */
export const removeToken = () => {
  removeItem(STORAGE_KEYS.TOKEN);
};

/**
 * Lưu thông tin user
 * @param {Object} user - Thông tin user
 */
export const setUser = (user) => {
  setItem(STORAGE_KEYS.USER, user);
};

/**
 * Lấy thông tin user
 * @returns {Object|null}
 */
export const getUser = () => {
  return getItem(STORAGE_KEYS.USER);
};

/**
 * Xóa thông tin user
 */
export const removeUser = () => {
  removeItem(STORAGE_KEYS.USER);
};

/**
 * Xóa tất cả thông tin đăng nhập
 */
export const clearAuth = () => {
  removeToken();
  removeUser();
};

/**
 * Kiểm tra user đã đăng nhập chưa
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return hasItem(STORAGE_KEYS.TOKEN) && hasItem(STORAGE_KEYS.USER);
};

// Theme storage

/**
 * Lưu theme
 * @param {string} theme - Theme name
 */
export const setTheme = (theme) => {
  setItem(STORAGE_KEYS.THEME, theme);
};

/**
 * Lấy theme
 * @returns {string|null}
 */
export const getTheme = () => {
  return getItem(STORAGE_KEYS.THEME);
};

export default {
  setItem,
  getItem,
  removeItem,
  clear,
  hasItem,
  setToken,
  getToken,
  removeToken,
  setUser,
  getUser,
  removeUser,
  clearAuth,
  isAuthenticated,
  setTheme,
  getTheme,
};
