// src/constants/roles.js

/**
 * 👥 ROLE CONSTANTS
 * Định nghĩa các vai trò trong hệ thống
 * Đồng bộ với Backend (PascalCase)
 */

export const ROLES = {
  ADMIN: 'Admin',           // Quản trị viên
  STAFF: 'NhanVien',        // Nhân viên
  CUSTOMER: 'KhachHang'     // Khách hàng
};

/**
 * Role Display Names - Tên hiển thị
 */
export const ROLE_DISPLAY = {
  [ROLES.ADMIN]: {
    label: 'Admin',
    icon: '👑',
    color: 'purple',  // ✅ Đổi thành purple để map với pink trong Navbar
    description: 'Quản trị viên hệ thống'
  },
  [ROLES.STAFF]: {
    label: 'Nhân viên',
    icon: '👨‍💼',
    color: 'blue',  // ✅ Đổi thành blue
    description: 'Nhân viên cửa hàng'
  },
  [ROLES.CUSTOMER]: {
    label: 'Khách hàng',
    icon: '👤',
    color: 'green',  // ✅ Đổi thành green
    description: 'Người dùng thông thường'
  }
};

/**
 * Kiểm tra role (case-insensitive)
 */
export const RoleChecker = {
  isAdmin: (role) => {
    if (!role) return false;
    return role.toLowerCase() === ROLES.ADMIN.toLowerCase();
  },
  
  isStaff: (role) => {
    if (!role) return false;
    return role.toLowerCase() === ROLES.STAFF.toLowerCase();
  },
  
  isCustomer: (role) => {
    if (!role) return false;
    return role.toLowerCase() === ROLES.CUSTOMER.toLowerCase();
  },
  
  isAdminOrStaff: (role) => {
    if (!role) return false;
    const lowerRole = role.toLowerCase();
    return lowerRole === ROLES.ADMIN.toLowerCase() || 
           lowerRole === ROLES.STAFF.toLowerCase();
  },
  
  /**
   * Lấy thông tin hiển thị của role
   */
  getDisplayInfo: (role) => {
    if (!role) return ROLE_DISPLAY[ROLES.CUSTOMER];
    
    // Tìm role phù hợp (case-insensitive)
    const matchedRole = Object.values(ROLES).find(
      r => r.toLowerCase() === role.toLowerCase()
    );
    
    return ROLE_DISPLAY[matchedRole] || ROLE_DISPLAY[ROLES.CUSTOMER];
  },
  
  /**
   * Format role từ user object
   */
  getUserRole: (user) => {
    if (!user) return null;
    return user.vaiTro || user.VaiTro || user.role || ROLES.CUSTOMER;
  }
};

export default {
  ROLES,
  ROLE_DISPLAY,
  RoleChecker
};
