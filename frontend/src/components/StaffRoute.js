import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RoleChecker } from '../constants/roles';

/**
 * =======================================
 * STAFF ROUTE - Bảo vệ route cho Nhân viên
 * =======================================
 * Component này bảo vệ các route chỉ dành cho:
 * - Nhân viên (NhanVien)
 * - Admin (có đầy đủ quyền)
 * 
 * Nếu user không phải staff/admin → redirect về home
 * Nếu chưa đăng nhập → redirect về login
 */
const StaffRoute = ({ children }) => {
  const { user } = useAuth();

  // Chưa đăng nhập → redirect về login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Lấy vai trò của user
  const userRole = RoleChecker.getUserRole(user);

  // Kiểm tra quyền Admin hoặc Staff
  const hasAccess = RoleChecker.isAdminOrStaff(userRole);

  if (!hasAccess) {
    // Không có quyền → redirect về home
    console.warn('⚠️ User không có quyền truy cập Staff area:', user);
    return <Navigate to="/" replace />;
  }

  // Có quyền → render component con
  return children;
};

export default StaffRoute;

