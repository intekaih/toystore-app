// src/pages/CategoryManagementPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { categoryService } from '../services';
import { FolderOpen, Plus, ArrowLeft } from 'lucide-react';
import CategoryTable from '../components/CategoryTable';
import CategoryModal from '../components/CategoryModal';
import Toast from '../components/Toast';
import { Button, Card } from '../components/ui';
import AdminLayout from '../layouts/AdminLayout';

const CategoryManagementPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

      const response = await categoryService.adminGetCategories();

      if (response.success) {
        setCategories(response.data.categories || response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);

      if (error.message?.includes('đăng nhập')) {
        showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại', 'error');
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      } else {
        showToast(error.message || 'Lỗi khi tải danh sách danh mục', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

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
      const response = await categoryService.adminCreateCategory(categoryData);

      if (response.success) {
        showToast(response.message || 'Tạo danh mục mới thành công', 'success');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error creating category:', error);
      showToast(error.message || 'Lỗi khi tạo danh mục mới', 'error');
      throw error;
    }
  };

  const handleUpdateCategory = async (categoryData) => {
    try {
      // ✅ Hỗ trợ cả hai format: ID (chữ hoa) và id (chữ thường)
      const categoryId = modalState.editingCategory?.ID || 
                         modalState.editingCategory?.id ||
                         modalState.editingCategory?.Id;

      if (!categoryId) {
        console.error('❌ Category object:', modalState.editingCategory);
        showToast('Không tìm thấy ID danh mục', 'error');
        throw new Error('Category ID not found');
      }

      console.log('🔄 Cập nhật danh mục ID:', categoryId);

      const response = await categoryService.adminUpdateCategory(categoryId, categoryData);

      if (response.success) {
        showToast(response.message || 'Cập nhật danh mục thành công', 'success');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      showToast(error.message || 'Lỗi khi cập nhật danh mục', 'error');
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
    const productCount = category.soLuongSanPham || category.SoLuongSanPham || 0;
    const categoryName = category.ten || category.Ten || 'danh mục';
    const categoryId = category.id || category.ID;

    if (productCount > 0) {
      showToast(`Không thể xóa danh mục "${categoryName}" vì còn ${productCount} sản phẩm đang sử dụng`, 'warning');
      return;
    }

    if (!window.confirm(`⚠️ BẠN CÓ CHẮC CHẮN MUỐN XÓA DANH MỤC "${categoryName}"?\n\nHành động này không thể hoàn tác!`)) {
      return;
    }

    try {
      const response = await categoryService.adminDeleteCategory(categoryId);

      if (response.success) {
        showToast(response.message || 'Xóa danh mục thành công', 'success');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast(error.message || 'Lỗi khi xóa danh mục', 'error');
    }
  };

  return (
    <AdminLayout>
      {/* Page Title */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center gap-2 text-gray-600 hover:text-gray-900"
            title="Quay lại trang quản lý sản phẩm"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Quay lại</span>
          </button>
        </div>
        
        {/* Title and Add Button Row */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FolderOpen size={32} />
              Quản lý danh mục sản phẩm
            </h2>
            <p className="text-gray-600 mt-1">Thêm, sửa, xóa danh mục sản phẩm</p>
          </div>
          
          <button
            onClick={handleOpenCreateModal}
            className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 
                     text-white font-semibold text-sm rounded-lg
                     hover:from-pink-600 hover:to-rose-600
                     focus:outline-none focus:ring-2 focus:ring-pink-300
                     transition-all duration-200 shadow-md hover:shadow-lg
                     flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} />
            Thêm danh mục
          </button>
        </div>
      </div>

      {/* Category Table - Hiển thị trực tiếp */}
      {loading ? (
        <Card className="text-center p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </Card>
      ) : categories.length === 0 ? (
        <Card className="text-center bg-gradient-to-r from-gray-50 to-gray-100 p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl opacity-50">
              <FolderOpen size={64} />
            </div>
            <p className="text-xl font-semibold text-gray-600">Chưa có danh mục nào</p>
            <p className="text-gray-500 mb-4">Hãy tạo danh mục đầu tiên cho cửa hàng của bạn</p>
            <Button onClick={handleOpenCreateModal} icon="➕" size="lg">
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
    </AdminLayout>
  );
};

export default CategoryManagementPage;
