// src/pages/ProductManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductTable from '../components/ProductTable';
import ProductModal from '../components/ProductModal';
import Pagination from '../components/Pagination';
import Toast from '../components/Toast';
import { Button, Card, Input, Badge } from '../components/ui';

const API_URL = 'http://localhost:5000/api';

const ProductManagementPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingProduct, setEditingProduct] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/products`, {
        headers: getAuthHeader(),
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          loaiId: filterCategory,
          enable: filterStatus
        }
      });

      if (response.data.success) {
        setProducts(response.data.data.products || []);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
        setTotalItems(response.data.data.pagination?.totalProducts || 0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Lỗi khi tải danh sách sản phẩm!', 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/categories`, {
        headers: getAuthHeader()
      });
      if (response.data.success) {
        setCategories(response.data.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, filterCategory, filterStatus]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmitProduct = async (formData) => {
    try {
      if (modalMode === 'create') {
        const response = await axios.post(`${API_URL}/admin/products`, formData, {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.success) {
          showToast('✅ Thêm sản phẩm thành công!', 'success');
          fetchProducts();
          handleCloseModal();
        }
      } else {
        const response = await axios.put(
          `${API_URL}/admin/products/${editingProduct.id}`,
          formData,
          {
            headers: {
              ...getAuthHeader(),
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.success) {
          showToast('✅ Cập nhật sản phẩm thành công!', 'success');
          fetchProducts();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra!';
      showToast(`❌ ${errorMsg}`, 'error');
      throw error;
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('⚠️ Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_URL}/admin/products/${productId}`, {
        headers: getAuthHeader()
      });

      if (response.data.success) {
        showToast('✅ Xóa sản phẩm thành công!', 'success');
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      const errorMsg = error.response?.data?.message || 'Không thể xóa sản phẩm!';
      showToast(`❌ ${errorMsg}`, 'error');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                📦
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Quản lý Sản phẩm
                </h1>
                <p className="text-gray-600">Quản lý danh sách sản phẩm của cửa hàng</p>
              </div>
            </div>
          </div>
          <Button onClick={handleOpenCreateModal} icon="➕">
            Thêm sản phẩm mới
          </Button>
        </div>
      </Card>

      {/* Filters & Search */}
      <Card className="mb-6" padding="md">
        <div className="mb-4">
          <Input
            type="text"
            placeholder="🔍 Tìm kiếm theo tên sản phẩm..."
            value={searchTerm}
            onChange={handleSearch}
            icon="🔍"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="input-cute min-w-[200px]"
          >
            <option value="">🗂️ Tất cả loại</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.ten}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="input-cute min-w-[200px]"
          >
            <option value="">📊 Tất cả trạng thái</option>
            <option value="true">✅ Đang bán</option>
            <option value="false">❌ Đã ẩn</option>
          </select>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card padding="md" className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-cute text-white text-xl">📊</div>
            <div>
              <p className="text-sm text-blue-600">Tổng số sản phẩm</p>
              <p className="text-2xl font-bold text-blue-700">{totalItems}</p>
            </div>
          </div>
        </Card>
        
        <Card padding="md" className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-cute text-white text-xl">📄</div>
            <div>
              <p className="text-sm text-green-600">Trang hiện tại</p>
              <p className="text-2xl font-bold text-green-700">{currentPage} / {totalPages}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Product Table */}
      {loading ? (
        <Card padding="lg" className="text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </Card>
      ) : products.length === 0 ? (
        <Card padding="lg" className="text-center bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl opacity-50">📦</div>
            <p className="text-xl font-semibold text-gray-600">Không có sản phẩm nào</p>
            <Button onClick={handleOpenCreateModal} icon="➕">
              Thêm sản phẩm đầu tiên
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card padding="none" className="mb-6">
            <ProductTable
              products={products}
              categories={categories}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteProduct}
            />
          </Card>

          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}

      {/* Modal thêm/sửa */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitProduct}
        editingProduct={editingProduct}
        categories={categories}
        mode={modalMode}
      />

      {/* Toast notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}
    </div>
  );
};

export default ProductManagementPage;
