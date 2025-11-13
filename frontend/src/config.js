/**
 * CENTRAL API CONFIGURATION
 * File này quản lý tất cả API URLs cho toàn bộ frontend
 * 
 * Khi thay đổi port backend, chỉ cần sửa file này
 */

// Lấy API URL từ environment variables, fallback về localhost:5000
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const config = {
  // Base URLs
  API_BASE_URL: API_BASE_URL,
  API_URL: API_URL,
  
  // Specific endpoints
  endpoints: {
    // Auth
    auth: {
      register: `${API_URL}/auth/register`,
      login: `${API_URL}/auth/login`,
      adminLogin: `${API_URL}/auth/admin/login`,
    },
    
    // Users
    users: {
      profile: `${API_URL}/users/profile`,
    },
    
    // Products
    products: {
      base: `${API_URL}/products`,
      admin: `${API_URL}/admin/products`,
    },
    
    // Categories
    categories: {
      base: `${API_URL}/admin/categories`,
    },
    
    // Cart
    cart: {
      base: `${API_URL}/cart`,
      add: `${API_URL}/cart/add`,
      update: `${API_URL}/cart/update`,
      remove: `${API_URL}/cart/remove`,
      clear: `${API_URL}/cart/clear`,
    },
    
    // Orders
    orders: {
      base: `${API_URL}/orders`,
      create: `${API_URL}/orders/create`,
      myOrders: `${API_URL}/orders/my-orders`,
      history: `${API_URL}/orders/history`,
      admin: `${API_URL}/admin/orders`,
    },
    
    // Payment
    payment: {
      vnpay: {
        createPaymentUrl: `${API_URL}/payment/vnpay/create-payment-url`,
        return: `${API_URL}/payment/vnpay/return`,
      },
    },
    
    // Admin Statistics
    admin: {
      statistics: {
        dashboard: `${API_URL}/admin/statistics/dashboard`,
      },
      orders: `${API_URL}/admin/orders`,
      users: `${API_URL}/admin/users`,
    },
  },
  
  // Helper function để build URL với params
  buildUrl: (baseUrl, params = {}) => {
    const url = new URL(baseUrl);
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });
    return url.toString();
  },
  
  // Helper function để build image URL
  getImageUrl: (imagePath) => {
    if (!imagePath) return null;
    // Nếu imagePath đã là full URL thì return luôn
    if (imagePath.startsWith('http')) return imagePath;
    // Nếu imagePath bắt đầu bằng / thì nối với base URL
    return `${API_BASE_URL}${imagePath}`;
  },
};

export default config;