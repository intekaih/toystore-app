/**
 * Format Utilities
 * Functions to format data for display
 */

import { CURRENCY, DATE_FORMATS } from './constants';

/**
 * Format số thành định dạng tiền tệ Việt Nam
 * @param {number} amount - Số tiền cần format
 * @param {boolean} showSymbol - Hiển thị ký hiệu tiền tệ
 * @returns {string} - Số tiền đã được format
 */
export const formatCurrency = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? `0 ${CURRENCY.SYMBOL}` : '0';
  }

  const formatted = Number(amount).toLocaleString('vi-VN');
  return showSymbol ? `${formatted} ${CURRENCY.SYMBOL}` : formatted;
};

/**
 * Format số điện thoại Việt Nam
 * @param {string} phone - Số điện thoại
 * @returns {string} - Số điện thoại đã format
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';

  // Loại bỏ tất cả ký tự không phải số
  const cleaned = phone.replace(/\D/g, '');

  // Format: 0xxx xxx xxx hoặc 0xxxx xxx xxx
  if (cleaned.startsWith('0')) {
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    } else if (cleaned.length === 11) {
      return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
    }
  }

  return phone;
};

/**
 * Format ngày tháng
 * @param {string|Date} date - Ngày cần format
 * @param {string} format - Định dạng (từ DATE_FORMATS)
 * @returns {string} - Ngày đã format
 */
export const formatDate = (date, format = DATE_FORMATS.DATE_ONLY) => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');

  switch (format) {
    case DATE_FORMATS.FULL:
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    case DATE_FORMATS.DATE_ONLY:
      return `${day}/${month}/${year}`;
    case DATE_FORMATS.TIME_ONLY:
      return `${hours}:${minutes}:${seconds}`;
    case DATE_FORMATS.SHORT:
      return `${day}/${month}/${String(year).slice(-2)}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

/**
 * Format thời gian tương đối (vd: "2 giờ trước")
 * @param {string|Date} date - Ngày cần format
 * @returns {string} - Thời gian tương đối
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);

  if (diffInSeconds < 60) {
    return 'Vừa xong';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} tuần trước`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} năm trước`;
};

/**
 * Format tên hiển thị từ họ tên
 * @param {string} fullName - Họ tên đầy đủ
 * @returns {string} - Tên rút gọn
 */
export const formatDisplayName = (fullName) => {
  if (!fullName) return '';
  
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0];
  
  return parts[parts.length - 1]; // Lấy tên
};

/**
 * Format chữ cái đầu từ tên (cho avatar)
 * @param {string} name - Tên
 * @returns {string} - Chữ cái đầu (1-2 chữ)
 */
export const formatInitials = (name) => {
  if (!name) return 'U';
  
  const parts = name.trim().split(' ');
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  // Lấy chữ cái đầu của tên đệm và tên
  const firstName = parts[0].charAt(0);
  const lastName = parts[parts.length - 1].charAt(0);
  
  return (firstName + lastName).toUpperCase();
};

/**
 * Truncate text với ellipsis
 * @param {string} text - Text cần truncate
 * @param {number} maxLength - Độ dài tối đa
 * @returns {string} - Text đã truncate
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Format số lượng (thêm dấu + nếu lớn hơn max)
 * @param {number} count - Số lượng
 * @param {number} max - Số tối đa hiển thị
 * @returns {string} - Số lượng đã format
 */
export const formatCount = (count, max = 99) => {
  if (count === null || count === undefined) return '0';
  
  const num = Number(count);
  if (isNaN(num)) return '0';
  
  return num > max ? `${max}+` : String(num);
};

/**
 * Format file size
 * @param {number} bytes - Kích thước file (bytes)
 * @returns {string} - Kích thước đã format
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
};

/**
 * Capitalize chữ cái đầu
 * @param {string} text - Text cần capitalize
 * @returns {string} - Text đã capitalize
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Capitalize tất cả các từ
 * @param {string} text - Text cần capitalize
 * @returns {string} - Text đã capitalize
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  return text.split(' ').map(word => capitalize(word)).join(' ');
};

/**
 * Slugify text (tạo URL-friendly string)
 * @param {string} text - Text cần slugify
 * @returns {string} - Text đã slugify
 */
export const slugify = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Thay khoảng trắng bằng -
    .replace(/[^\w\-]+/g, '')    // Xóa các ký tự không phải chữ và số
    .replace(/\-\-+/g, '-')      // Thay nhiều - bằng một -
    .replace(/^-+/, '')          // Xóa - ở đầu
    .replace(/-+$/, '');         // Xóa - ở cuối
};

export default {
  formatCurrency,
  formatPhoneNumber,
  formatDate,
  formatRelativeTime,
  formatDisplayName,
  formatInitials,
  truncateText,
  formatCount,
  formatFileSize,
  capitalize,
  capitalizeWords,
  slugify,
};
