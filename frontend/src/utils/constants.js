/**
 * Application Constants
 * All constant values used throughout the application
 */

// API Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Trường này không được để trống',
  INVALID_EMAIL: 'Địa chỉ email không hợp lệ',
  INVALID_PHONE: 'Số điện thoại không hợp lệ',
  PASSWORD_TOO_SHORT: 'Mật khẩu phải có ít nhất 6 ký tự',
  PASSWORD_MISMATCH: 'Mật khẩu nhập lại không khớp',
  USERNAME_TOO_SHORT: 'Tên đăng nhập phải có ít nhất 3 ký tự',
  USERNAME_INVALID: 'Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới',
  NAME_TOO_SHORT: 'Họ tên phải có ít nhất 2 ký tự',
  NAME_INVALID: 'Họ tên chỉ được chứa chữ cái và khoảng trắng',
};

// API Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Không thể kết nối đến máy chủ',
  SERVER_ERROR: 'Lỗi máy chủ, vui lòng thử lại sau',
  SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn',
  INVALID_CREDENTIALS: 'Tên đăng nhập hoặc mật khẩu không đúng',
  ACCOUNT_LOCKED: 'Tài khoản đã bị khóa',
  ACCOUNT_NOT_FOUND: 'Tài khoản không tồn tại',
  USER_EXISTS: 'Tên đăng nhập hoặc email đã tồn tại',
  INVALID_DATA: 'Thông tin không hợp lệ',
  UNAUTHORIZED: 'Bạn không có quyền truy cập',
  UNKNOWN_ERROR: 'Có lỗi xảy ra',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  REGISTER_SUCCESS: 'Đăng ký tài khoản thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  UPDATE_SUCCESS: 'Cập nhật thành công',
  DELETE_SUCCESS: 'Xóa thành công',
  CREATE_SUCCESS: 'Tạo mới thành công',
};

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  ITEMS_PER_PAGE_OPTIONS: [10, 20, 50, 100],
};

// Product Categories (có thể mở rộng từ database)
export const PRODUCT_CATEGORIES = {
  EDUCATIONAL: 'educational',
  BUILDING: 'building',
  DOLLS: 'dolls',
  VEHICLES: 'vehicles',
};

// Product Sort Options
export const SORT_OPTIONS = {
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  NEWEST: 'newest',
  OLDEST: 'oldest',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  PROFILE: '/profile',
  EDIT_PROFILE: '/profile/edit',
  ADMIN_DASHBOARD: '/admin/dashboard',
  NOT_FOUND: '*',
};

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_VN: /^(0|\+84)[0-9]{9,10}$/,
  USERNAME: /^[a-zA-Z0-9_]+$/,
  NAME_VN: /^[a-zA-ZÀ-ỹ\s]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, // Ít nhất 1 chữ hoa, 1 chữ thường, 1 số
};

// Date Formats
export const DATE_FORMATS = {
  FULL: 'DD/MM/YYYY HH:mm:ss',
  DATE_ONLY: 'DD/MM/YYYY',
  TIME_ONLY: 'HH:mm:ss',
  SHORT: 'DD/MM/YY',
};

// Currency
export const CURRENCY = {
  VND: 'VND',
  SYMBOL: '₫',
};

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Theme
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// Timeout Durations (in milliseconds)
export const TIMEOUTS = {
  API_TIMEOUT: 10000,
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 3000,
  REDIRECT_DELAY: 2000,
};

export default {
  HTTP_STATUS,
  USER_ROLES,
  STORAGE_KEYS,
  VALIDATION_MESSAGES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PAGINATION,
  PRODUCT_CATEGORIES,
  SORT_OPTIONS,
  ROUTES,
  REGEX_PATTERNS,
  DATE_FORMATS,
  CURRENCY,
  LOADING_STATES,
  THEMES,
  TIMEOUTS,
};
