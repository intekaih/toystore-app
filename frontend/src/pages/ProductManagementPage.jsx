// src/pages/ProductManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductTable from '../components/ProductTable';
import ProductModal from '../components/ProductModal';
import Pagination from '../components/Pagination';
import Toast from '../components/Toast';
import { Button, Card, Input, Switch } from '../components/ui';
import AdminLayout from '../layouts/AdminLayout';
import config from '../config';

const API_URL = config.API_URL;

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
  const [filterStatus, setFilterStatus] = useState('true'); // Mặc định là 'true' để hiển thị sản phẩm hoạt động
  const [showActiveOnly, setShowActiveOnly] = useState(true); // Mặc định bật switch

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
        // Backend trả về PascalCase (ID, Ten, MoTa, Enable)
        // Cần convert sang camelCase cho frontend
        const categoriesData = response.data.data.categories || [];
        const mappedCategories = categoriesData.map(cat => ({
          id: cat.ID,
          ten: cat.Ten,
          moTa: cat.MoTa,
          enable: cat.Enable
        }));
        setCategories(mappedCategories);
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
    <AdminLayout>
      {/* Page Title với Statistics */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-3xl">📦</span>
            Quản lý Sản phẩm
          </h2>
          <p className="text-gray-600 mt-1">Quản lý danh sách sản phẩm của cửa hàng</p>
        </div>
        
        {/* Statistics - Text đơn giản */}
        <div className="text-lg font-semibold text-gray-700">
          Tổng số sản phẩm: <span className="text-blue-600">{totalItems}</span>
        </div>
      </div>

      {/* 🎀 Filters & Search - Tone hồng trắng sữa dễ thương */}
      <div className="mb-6 bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 rounded-2xl p-5 shadow-sm border border-pink-100">
        <div className="flex flex-wrap gap-3 items-stretch">
          {/* 📁 Dropdown: Tất cả */}
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 bg-white border-2 border-pink-200 rounded-xl 
                     text-gray-700 font-medium text-sm
                     focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400
                     hover:border-pink-300 transition-all duration-200
                     w-[150px] cursor-pointer shadow-sm h-[42px]"
          >
            <option value="">📁 Tất cả</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.ten}
              </option>
            ))}
          </select>

          {/* 🔍 Thanh tìm kiếm - Bỏ 1 icon */}
          <div className="flex-1 min-w-[280px]">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sản phẩm..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2.5 bg-white border-2 border-pink-200 rounded-xl 
                       text-gray-700 font-medium text-sm placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400
                       hover:border-pink-300 transition-all duration-200 shadow-sm h-[42px]"
            />
          </div>

          {/* ➕ Nút "Thêm" - Cùng độ cao */}
          <button
            onClick={handleOpenCreateModal}
            className="px-5 bg-gradient-to-r from-pink-400 to-rose-400 
                     text-white font-semibold text-sm rounded-xl
                     hover:from-pink-500 hover:to-rose-500
                     focus:outline-none focus:ring-2 focus:ring-pink-300
                     transition-all duration-200 shadow-md hover:shadow-lg
                     flex items-center gap-2 whitespace-nowrap h-[42px]"
          >
            <span className="text-lg">➕</span>
            Thêm
          </button>

          {/* 🔄 Switch: Hoạt động/Không hoạt động */}
          <div className="flex items-center gap-2 px-4 bg-white border-2 border-pink-200 rounded-xl shadow-sm h-[42px]">
            <Switch
              checked={showActiveOnly}
              onChange={(checked) => {
                setShowActiveOnly(checked);
                setFilterStatus(checked ? 'true' : 'false');
                setCurrentPage(1);
              }}
              label={showActiveOnly ? "✅ Hoạt động" : "❌ Không hoạt động"}
            />
          </div>
        </div>
      </div>

      {/* Product Table */}
      {loading ? (
        <Card className="text-center p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </Card>
      ) : products.length === 0 ? (
        <Card className="text-center bg-gradient-to-r from-gray-50 to-gray-100 p-12">
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
    </AdminLayout>
  );
};

export default ProductManagementPage;
