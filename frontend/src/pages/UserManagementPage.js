// src/pages/UserManagementPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, Search, RotateCcw } from 'lucide-react';
import { adminService } from '../services';
import UserTable from '../components/UserTable';
import UserModal from '../components/UserModal';
import Toast from '../components/Toast';
import Pagination from '../components/Pagination';
import { Button, Card, Input } from '../components/ui';
import AdminLayout from '../layouts/AdminLayout';

const UserManagementPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

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
      
      const response = await adminService.getUsers({
        page,
        limit: 10,
        search: filters.search,
        role: filters.role,
        status: filters.status
      });

      if (response.success) {
        setUsers(response.data.users || response.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      
      if (error.message?.includes('đăng nhập')) {
        showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại', 'error');
        setTimeout(() => {
          logout();
          navigate('/admin/login');
        }, 2000);
      } else {
        showToast(error.message || 'Lỗi khi tải danh sách người dùng', 'error');
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
      const response = await adminService.createUser(userData);
      
      if (response.success) {
        showToast(response.message || 'Tạo người dùng mới thành công', 'success');
        fetchUsers(pagination.currentPage);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showToast(error.message || 'Lỗi khi tạo người dùng mới', 'error');
      throw error;
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      const response = await adminService.updateUser(modalState.editingUser.id, userData);
      
      if (response.success) {
        showToast(response.message || 'Cập nhật thông tin thành công', 'success');
        fetchUsers(pagination.currentPage);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showToast(error.message || 'Lỗi khi cập nhật thông tin', 'error');
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
      const response = await adminService.toggleUserStatus(user.id, !user.enable);
      
      if (response.success) {
        showToast(response.message || `${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản thành công`, 'success');
        fetchUsers(pagination.currentPage);
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      showToast(error.message || `Lỗi khi ${action} tài khoản`, 'error');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`⚠️ BẠN CÓ CHẮC CHẮN MUỐN XÓA VĨNH VIỄN TÀI KHOẢN "${user.tenDangNhap}"?\n\nHành động này không thể hoàn tác!`)) {
      return;
    }

    try {
      const response = await adminService.deleteUser(user.id);
      
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
      showToast(error.message || 'Lỗi khi xóa tài khoản', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <AdminLayout>
      {/* Page Title & Statistics */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left: Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Users size={32} />
              Quản lý người dùng
            </h2>
            <p className="text-gray-600 mt-1">Quản lý tài khoản khách hàng</p>
          </div>

          {/* Right: Statistics */}
          <div className="flex items-center gap-12">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tổng số người dùng</p>
              <p className="text-2xl font-bold text-gray-800">{pagination.totalUsers}</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Trang hiện tại</p>
              <p className="text-2xl font-bold text-gray-800">{pagination.currentPage}</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Tổng số trang</p>
              <p className="text-2xl font-bold text-gray-800">{pagination.totalPages}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="mb-6 bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 rounded-2xl p-5 shadow-sm border border-pink-100">
        {/* Dòng 1: Tìm kiếm */}
        <form onSubmit={handleSearch} className="flex gap-3 items-stretch mb-4">
          {/* Ô tìm kiếm */}
          <div className="flex-1">
            <input
              type="text"
              name="search"
              placeholder="Tìm kiếm theo tên, email, tên đăng nhập..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full px-4 py-2.5 bg-white border-2 border-pink-200 rounded-xl 
                       text-gray-700 font-medium text-sm placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400
                       hover:border-pink-300 transition-all duration-200 shadow-sm h-[42px]"
            />
          </div>

          {/* Nút tìm kiếm */}
          <button
            type="submit"
            className="px-6 bg-gradient-to-r from-pink-400 to-rose-400 
                     text-white font-semibold text-sm rounded-xl
                     hover:from-pink-500 hover:to-rose-500
                     focus:outline-none focus:ring-2 focus:ring-pink-300
                     transition-all duration-200 shadow-md hover:shadow-lg
                     flex items-center gap-2 whitespace-nowrap h-[42px]"
          >
            <Search size={18} />
            Tìm kiếm
          </button>
        </form>

        {/* Dòng 2: Filters & Actions */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            {/* Dropdown Vai trò */}
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="px-4 py-2.5 bg-white border-2 border-pink-200 rounded-xl 
                       text-gray-700 font-medium text-sm
                       focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400
                       hover:border-pink-300 transition-all duration-200 shadow-sm
                       min-w-[150px] h-[42px] cursor-pointer"
            >
              <option value="">Tất cả vai trò</option>
              <option value="Admin">Admin</option>
              <option value="KhachHang">Khách hàng</option>
              <option value="NhanVien">Nhân viên</option>
            </select>

            {/* Dropdown Trạng thái */}
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="px-4 py-2.5 bg-white border-2 border-pink-200 rounded-xl 
                       text-gray-700 font-medium text-sm
                       focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400
                       hover:border-pink-300 transition-all duration-200 shadow-sm
                       min-w-[150px] h-[42px] cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Bị khóa</option>
            </select>

            {/* Nút Reset */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 bg-white border-2 border-pink-300 
                       text-pink-600 font-semibold text-sm rounded-xl
                       hover:bg-pink-50 hover:border-pink-400
                       focus:outline-none focus:ring-2 focus:ring-pink-300
                       transition-all duration-200 shadow-sm
                       flex items-center gap-2 h-[42px]"
            >
              <RotateCcw size={18} />
              Reset
            </button>
          </div>

          {/* Nút Thêm mới */}
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-6 bg-gradient-to-r from-pink-400 to-rose-400 
                     text-white font-semibold text-sm rounded-xl
                     hover:from-pink-500 hover:to-rose-500
                     focus:outline-none focus:ring-2 focus:ring-pink-300
                     transition-all duration-200 shadow-md hover:shadow-lg
                     flex items-center gap-2 whitespace-nowrap h-[42px]"
          >
            <Plus size={18} />
            Thêm mới
          </button>
        </div>
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
    </AdminLayout>
  );
};

export default UserManagementPage;
