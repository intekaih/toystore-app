// src/pages/UserManagementPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserTable from '../components/UserTable';
import UserModal from '../components/UserModal';
import Toast from '../components/Toast';
import Pagination from '../components/Pagination';
import { Button, Card, Input, Badge } from '../components/ui';
import * as userApi from '../api/userApi';

const UserManagementPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    usersPerPage: 10
  });

  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'create',
    editingUser: null
  });

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

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

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      role: '',
      status: ''
    });
  };

  const handleOpenCreateModal = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      editingUser: null
    });
  };

  const handleOpenEditModal = (user) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      editingUser: user
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      mode: 'create',
      editingUser: null
    });
  };

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

  const handleModalSubmit = async (userData) => {
    if (modalState.mode === 'create') {
      await handleCreateUser(userData);
    } else {
      await handleUpdateUser(userData);
    }
  };

  const handleToggleStatus = async (user) => {
    const action = user.enable ? 'khóa' : 'mở khóa';
    
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản "${user.tenDangNhap}"?`)) {
      return;
    }

    try {
      const response = await userApi.updateUserStatus(user.id, !user.enable);
      
      if (response.success) {
        showToast(response.message || `${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản thành công`, 'success');
        fetchUsers(pagination.currentPage);
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      showToast(error.response?.data?.message || `Lỗi khi ${action} tài khoản`, 'error');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`⚠️ BẠN CÓ CHẮC CHẮN MUỐN XÓA VĨNH VIỄN TÀI KHOẢN "${user.tenDangNhap}"?\n\nHành động này không thể hoàn tác!`)) {
      return;
    }

    try {
      const response = await userApi.deleteUser(user.id);
      
      if (response.success) {
        showToast(response.message || 'Xóa tài khoản thành công', 'success');
        
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

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
      {/* Header */}
      <Card className="mb-6 border-primary-200" padding="md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
              icon="⬅️"
            >
              Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary-400 to-primary-500 rounded-cute text-white">
                👥
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Quản lý người dùng
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Xin chào,</p>
              <p className="font-semibold text-primary-600">{user?.hoTen || 'Admin'}</p>
            </div>
            <Button
              variant="danger"
              onClick={handleLogout}
              icon="🚪"
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </Card>

      {/* Filters & Actions */}
      <Card className="mb-6" padding="md">
        <form onSubmit={handleSearch} className="mb-4">
          <Input
            type="text"
            name="search"
            placeholder="🔍 Tìm kiếm theo tên, email, tên đăng nhập..."
            value={filters.search}
            onChange={handleFilterChange}
            icon="🔍"
          />
          <Button type="submit" className="mt-2" fullWidth>
            Tìm kiếm
          </Button>
        </form>

        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="input-cute min-w-[150px]"
            >
              <option value="">Tất cả vai trò</option>
              <option value="admin">👑 Admin</option>
              <option value="user">👤 User</option>
            </select>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="input-cute min-w-[150px]"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">✅ Hoạt động</option>
              <option value="inactive">🔒 Bị khóa</option>
            </select>

            <Button variant="secondary" onClick={handleResetFilters} icon="🔄">
              Reset
            </Button>
          </div>

          <Button onClick={handleOpenCreateModal} icon="➕">
            Thêm mới
          </Button>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card padding="md" className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-cute text-white text-xl">📊</div>
            <div>
              <p className="text-sm text-blue-600">Tổng số người dùng</p>
              <p className="text-2xl font-bold text-blue-700">{pagination.totalUsers}</p>
            </div>
          </div>
        </Card>
        
        <Card padding="md" className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-cute text-white text-xl">📄</div>
            <div>
              <p className="text-sm text-green-600">Trang hiện tại</p>
              <p className="text-2xl font-bold text-green-700">{pagination.currentPage}</p>
            </div>
          </div>
        </Card>
        
        <Card padding="md" className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500 rounded-cute text-white text-xl">📚</div>
            <div>
              <p className="text-sm text-purple-600">Tổng số trang</p>
              <p className="text-2xl font-bold text-purple-700">{pagination.totalPages}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card padding="none" className="mb-6">
        <UserTable
          users={users}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteUser}
          onToggleStatus={handleToggleStatus}
          loading={loading}
        />
      </Card>

      {/* Pagination */}
      {!loading && users.length > 0 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={fetchUsers}
          />
        </div>
      )}

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
