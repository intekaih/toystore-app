/**
 * Application Configuration
 * Centralized configuration file for the entire application
 */

const config = {
  // API Configuration
  api: {
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
    timeout: 10000,
    endpoints: {
      auth: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
      },
      user: {
        profile: '/users/profile',
        updateProfile: '/users/profile',
      },
      product: {
        list: '/products',
        detail: (id) => `/products/${id}`,
        search: '/products/search',
      },
    },
  },

  // Local Storage Keys
  storage: {
    TOKEN_KEY: 'token',
    USER_KEY: 'user',
    THEME_KEY: 'theme',
  },

  // Pagination
  pagination: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // Validation Rules
  validation: {
    username: {
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_]+$/,
    },
    password: {
      minLength: 6,
      maxLength: 100,
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: {
      pattern: /^(0|\+84)[0-9]{9,10}$/,
    },
    name: {
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
    },
  },

  // User Roles
  roles: {
    ADMIN: 'admin',
    USER: 'user',
  },

  // App Settings
  app: {
    name: 'ToyStore',
    version: '1.0.0',
    description: 'Cửa hàng đồ chơi trực tuyến',
  },

  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

export default config;
