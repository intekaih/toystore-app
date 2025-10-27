// src/pages/UserManagementPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserTable from '../components/UserTable';
import UserModal from '../components/UserModal';
import Toast from '../components/Toast';
import Pagination from '../components/Pagination';
import * as userApi from '../api/userApi';
import '../styles/UserManagementPage.css';

const UserManagementPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // State quản lý danh sách user
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    usersPerPage: 10
  });

  // State cho filters
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });

  // State cho modal
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'create', // 'create' hoặc 'edit'
    editingUser: null
  });

  // State cho toast notification
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  // Hiển thị toast
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  // Fetch danh sách users
  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await userApi.getAllUsers({
        page,
        limit: 10,
        search: filters.search,
        role: filters.role,
        status: filters.status
      });

      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      
      if (error.response?.status === 401) {
        showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại', 'error');
        setTimeout(() => {
          logout();
          navigate('/admin/login');
        }, 2000);
      } else {
        showToast(error.response?.data?.message || 'Lỗi khi tải danh sách người dùng', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [filters, logout, navigate]);

  // Load users khi component mount hoặc filters thay đổi
  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  // Xử lý thay đổi filter
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      role: '',
      status: ''
    });
  };

  // Mở modal thêm mới
  const handleOpenCreateModal = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      editingUser: null
    });
  };

  // Mở modal chỉnh sửa
  const handleOpenEditModal = (user) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      editingUser: user
    });
  };

  // Đóng modal
  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      mode: 'create',
      editingUser: null
    });
  };

  // Xử lý tạo user mới
  const handleCreateUser = async (userData) => {
    try {
      const response = await userApi.createUser(userData);
      
      if (response.success) {
        showToast(response.message || 'Tạo người dùng mới thành công', 'success');
        fetchUsers(pagination.currentPage);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showToast(error.response?.data?.message || 'Lỗi khi tạo người dùng mới', 'error');
      throw error;
    }
  };

  // Xử lý cập nhật user
  const handleUpdateUser = async (userData) => {
    try {
      const response = await userApi.updateUser(modalState.editingUser.id, userData);
      
      if (response.success) {
        showToast(response.message || 'Cập nhật thông tin thành công', 'success');
        fetchUsers(pagination.currentPage);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showToast(error.response?.data?.message || 'Lỗi khi cập nhật thông tin', 'error');
      throw error;
    }
  };

  // Xử lý submit modal (create hoặc update)
  const handleModalSubmit = async (userData) => {
    if (modalState.mode === 'create') {
      await handleCreateUser(userData);
    } else {
      await handleUpdateUser(userData);
    }
  };

  // Xử lý khóa/mở khóa tài khoản
  const handleToggleStatus = async (user) => {
    const action = user.enable ? 'khóa' : 'mở khóa';
    
    console.log('🔒 Frontend - Đang thực hiện:', action);
    console.log('👤 User được chọn:', user);
    console.log('📊 Enable hiện tại:', user.enable);
    console.log('📊 Enable mới sẽ gửi:', !user.enable);
    
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản "${user.tenDangNhap}"?`)) {
      return;
    }

    try {
      console.log('🚀 Gọi API updateUserStatus với userId:', user.id, ', enable:', !user.enable);
      const response = await userApi.updateUserStatus(user.id, !user.enable);
      
      console.log('✅ Response từ server:', response);
      
      if (response.success) {
        showToast(response.message || `${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản thành công`, 'success');
        fetchUsers(pagination.currentPage);
      }
    } catch (error) {
      console.error('❌ Error toggling user status:', error);
      console.error('📝 Error response:', error.response);
      console.error('📝 Error message:', error.response?.data?.message);
      showToast(error.response?.data?.message || `Lỗi khi ${action} tài khoản`, 'error');
    }
  };

  // Xử lý xóa user
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`⚠️ BẠN CÓ CHẮC CHẮN MUỐN XÓA VĨNH VIỄN TÀI KHOẢN "${user.tenDangNhap}"?\n\nHành động này không thể hoàn tác!`)) {
      return;
    }

    try {
      const response = await userApi.deleteUser(user.id);
      
      if (response.success) {
        showToast(response.message || 'Xóa tài khoản thành công', 'success');
        
        // Nếu xóa user cuối cùng của trang và không phải trang 1, quay về trang trước
        if (users.length === 1 && pagination.currentPage > 1) {
          fetchUsers(pagination.currentPage - 1);
        } else {
          fetchUsers(pagination.currentPage);
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast(error.response?.data?.message || 'Lỗi khi xóa tài khoản', 'error');
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="user-management-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>
              ⬅️ Dashboard
            </button>
            <h1>👥 Quản lý người dùng</h1>
          </div>
          <div className="header-right">
            <span className="welcome-text">Xin chào, <strong>{user?.hoTen || 'Admin'}</strong></span>
            <button className="btn-logout" onClick={handleLogout}>
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Filters & Actions */}
        <div className="filters-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              name="search"
              placeholder="🔍 Tìm kiếm theo tên, email, tên đăng nhập..."
              value={filters.search}
              onChange={handleFilterChange}
              className="search-input"
            />
            <button type="submit" className="btn-search">Tìm kiếm</button>
          </form>

          <div className="filter-controls">
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Tất cả vai trò</option>
              <option value="admin">👑 Admin</option>
              <option value="user">👤 User</option>
            </select>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">✅ Hoạt động</option>
              <option value="inactive">🔒 Bị khóa</option>
            </select>

            <button className="btn-reset" onClick={handleResetFilters}>
              🔄 Reset
            </button>

            <button className="btn-create" onClick={handleOpenCreateModal}>
              ➕ Thêm mới
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-label">Tổng số:</span>
            <span className="stat-value">{pagination.totalUsers}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Trang hiện tại:</span>
            <span className="stat-value">{pagination.currentPage}/{pagination.totalPages}</span>
          </div>
        </div>

        {/* Table */}
        <UserTable
          users={users}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteUser}
          onToggleStatus={handleToggleStatus}
          loading={loading}
        />

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={fetchUsers}
          />
        )}
      </div>

      {/* Modal */}
      <UserModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        editingUser={modalState.editingUser}
        mode={modalState.mode}
      />

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default UserManagementPage;
