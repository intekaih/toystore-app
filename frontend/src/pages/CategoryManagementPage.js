// src/pages/CategoryManagementPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CategoryTable from '../components/CategoryTable';
import CategoryModal from '../components/CategoryModal';
import Toast from '../components/Toast';
import { Button, Card, Badge } from '../components/ui';
import * as categoryApi from '../api/categoryApi';

const CategoryManagementPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'create',
    editingCategory: null
  });

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

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

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreateModal = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      editingCategory: null
    });
  };

  const handleOpenEditModal = (category) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      editingCategory: category
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      mode: 'create',
      editingCategory: null
    });
  };

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

  const handleModalSubmit = async (categoryData) => {
    if (modalState.mode === 'create') {
      await handleCreateCategory(categoryData);
    } else {
      await handleUpdateCategory(categoryData);
    }
  };

  const handleDeleteCategory = async (category) => {
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
                📂
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Quản lý danh mục sản phẩm
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card padding="md" className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-cute text-white text-xl">📂</div>
            <div>
              <p className="text-sm text-blue-600">Tổng danh mục</p>
              <p className="text-2xl font-bold text-blue-700">{categories.length}</p>
            </div>
          </div>
        </Card>
        
        <Card padding="md" className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-cute text-white text-xl">📦</div>
            <div>
              <p className="text-sm text-green-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-green-700">
                {categories.reduce((sum, cat) => sum + (cat.soLuongSanPham || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card className="mb-6" padding="md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-gray-600">
              <span className="text-lg font-semibold">Danh sách danh mục</span>
            </div>
          </div>
          <Button onClick={handleOpenCreateModal} icon="➕">
            Thêm danh mục mới
          </Button>
        </div>
      </Card>

      {/* Category Table */}
      {loading ? (
        <Card padding="lg" className="text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </Card>
      ) : categories.length === 0 ? (
        <Card padding="lg" className="text-center bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl opacity-50">📂</div>
            <p className="text-xl font-semibold text-gray-600">Chưa có danh mục nào</p>
            <Button onClick={handleOpenCreateModal} icon="➕">
              Tạo danh mục đầu tiên
            </Button>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <CategoryTable
            categories={categories}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteCategory}
            loading={loading}
          />
        </Card>
      )}

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
