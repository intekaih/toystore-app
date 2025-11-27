/**
 * Services Index
 * Export tất cả services để dễ dàng import
 * 
 * Usage:
 * import { productService, cartService, orderService } from '../services';
 * 
 * Or:
 * import * as services from '../services';
 * services.productService.getProducts();
 */

// Core services
export { default as authService } from './authService';
export { default as userService } from './userService';

// Product & Shopping
export { default as productService } from './productService';
export { default as categoryService } from './categoryService'; // ✅ Added
export { default as cartService } from './cartService';
export { default as orderService } from './orderService';
export { default as paymentService } from './paymentService';
export { default as voucherService } from './voucherService'; // ✅ Added
export { default as bannerService } from './bannerService'; // ✅ Added

// Reviews & Feedback
export { default as shippingService } from './shippingService';
export { default as reviewService } from './reviewService';

// Staff & Admin
export { default as staffService } from './staffService';
export { default as adminService } from './adminService';
export { default as statisticsService } from './statisticsService'; // ✅ Added

// Re-export constants from orderService
export { 
  ORDER_STATUS, 
  ORDER_STATUS_NAMES, 
  ORDER_STATUS_COLORS 
} from './orderService';

// Re-export constants from paymentService
export { 
  PAYMENT_METHODS, 
  PAYMENT_STATUS 
} from './paymentService';
