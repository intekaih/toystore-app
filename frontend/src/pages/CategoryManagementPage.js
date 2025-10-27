// src/pages/CategoryManagementPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CategoryTable from '../components/CategoryTable';
import CategoryModal from '../components/CategoryModal';
import Toast from '../components/Toast';
import * as categoryApi from '../api/categoryApi';
import '../styles/CategoryManagementPage.css';

const CategoryManagementPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // State quản lý danh sách danh mục
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho modal
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'create', // 'create' hoặc 'edit'
    editingCategory: null
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

  // Fetch danh sách danh mục
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getAllCategories();

      if (response.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      
      if (error.response?.status === 401) {
        showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại', 'error');
        setTimeout(() => {
          logout();
          navigate('/admin/login');
        }, 2000);
      } else {
        showToast(error.response?.data?.message || 'Lỗi khi tải danh sách danh mục', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  // Load danh mục khi component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Mở modal thêm mới
  const handleOpenCreateModal = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      editingCategory: null
    });
  };

  // Mở modal chỉnh sửa
  const handleOpenEditModal = (category) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      editingCategory: category
    });
  };

  // Đóng modal
  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      mode: 'create',
      editingCategory: null
    });
  };

  // Xử lý tạo danh mục mới
  const handleCreateCategory = async (categoryData) => {
    try {
      const response = await categoryApi.createCategory(categoryData);
      
      if (response.success) {
        showToast(response.message || 'Tạo danh mục mới thành công', 'success');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error creating category:', error);
      showToast(error.response?.data?.message || 'Lỗi khi tạo danh mục mới', 'error');
      throw error;
    }
  };

  // Xử lý cập nhật danh mục
  const handleUpdateCategory = async (categoryData) => {
    try {
      const response = await categoryApi.updateCategory(modalState.editingCategory.id, categoryData);
      
      if (response.success) {
        showToast(response.message || 'Cập nhật danh mục thành công', 'success');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      showToast(error.response?.data?.message || 'Lỗi khi cập nhật danh mục', 'error');
      throw error;
    }
  };

  // Xử lý submit modal (create hoặc update)
  const handleModalSubmit = async (categoryData) => {
    if (modalState.mode === 'create') {
      await handleCreateCategory(categoryData);
    } else {
      await handleUpdateCategory(categoryData);
    }
  };

  // Xử lý xóa danh mục
  const handleDeleteCategory = async (category) => {
    // Kiểm tra xem danh mục có sản phẩm không
    if (category.soLuongSanPham > 0) {
      showToast(`Không thể xóa danh mục "${category.ten}" vì còn ${category.soLuongSanPham} sản phẩm đang sử dụng`, 'warning');
      return;
    }

    if (!window.confirm(`⚠️ BẠN CÓ CHẮC CHẮN MUỐN XÓA DANH MỤC "${category.ten}"?\n\nHành động này không thể hoàn tác!`)) {
      return;
    }

    try {
      const response = await categoryApi.deleteCategory(category.id);
      
      if (response.success) {
        showToast(response.message || 'Xóa danh mục thành công', 'success');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast(error.response?.data?.message || 'Lỗi khi xóa danh mục', 'error');
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="category-management-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>
              ⬅️ Dashboard
            </button>
            <h1>📂 Quản lý danh mục sản phẩm</h1>
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
        {/* Actions Bar */}
        <div className="actions-bar">
          <div className="info-section">
            <div className="stat-item">
              <span className="stat-icon">📂</span>
              <div className="stat-info">
                <span className="stat-label">Tổng danh mục</span>
                <span className="stat-value">{categories.length}</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📦</span>
              <div className="stat-info">
                <span className="stat-label">Tổng sản phẩm</span>
                <span className="stat-value">
                  {categories.reduce((sum, cat) => sum + (cat.soLuongSanPham || 0), 0)}
                </span>
              </div>
            </div>
          </div>

          <button className="btn-create" onClick={handleOpenCreateModal}>
            ➕ Thêm danh mục mới
          </button>
        </div>

        {/* Table */}
        <CategoryTable
          categories={categories}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteCategory}
          loading={loading}
        />
      </div>

      {/* Modal */}
      <CategoryModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        editingCategory={modalState.editingCategory}
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

export default CategoryManagementPage;
