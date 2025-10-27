// src/pages/ProductManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductTable from '../components/ProductTable';
import ProductModal from '../components/ProductModal';
import Pagination from '../components/Pagination';
import Toast from '../components/Toast';
import '../styles/ProductManagement.css';

const API_URL = 'http://localhost:5000/api';

const ProductManagementPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' hoặc 'edit'
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Lấy token từ localStorage
  const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  // Fetch danh sách sản phẩm
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
        // API trả về cấu trúc: data.products và data.pagination
        setProducts(response.data.data.products || []);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
        setTotalItems(response.data.data.pagination?.totalProducts || 0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Lỗi khi tải danh sách sản phẩm!', 'error');
      setProducts([]); // Set mảng rỗng nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  // Fetch danh sách loại sản phẩm
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/categories`, {
        headers: getAuthHeader()
      });
      if (response.data.success) {
        // Sửa lại: lấy mảng categories từ response.data.data.categories
        setCategories(response.data.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]); // Set mảng rỗng nếu lỗi
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, filterCategory, filterStatus]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Hiển thị toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Mở modal thêm mới
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // Mở modal chỉnh sửa
  const handleOpenEditModal = (product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Xử lý submit form (thêm/sửa)
  const handleSubmitProduct = async (formData) => {
    try {
      if (modalMode === 'create') {
        // Thêm mới sản phẩm
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
        // Cập nhật sản phẩm
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

  // Xóa sản phẩm (soft delete)
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

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="product-management-page">
      <div className="page-header">
        <div className="header-left">
          <button 
            className="btn-back" 
            onClick={() => navigate('/admin/dashboard')}
            title="Quay lại Dashboard"
          >
            ← Quay lại
          </button>
          <div>
            <h1>📦 Quản lý Sản phẩm</h1>
            <p className="subtitle">Quản lý danh sách sản phẩm của cửa hàng</p>
          </div>
        </div>
        <button className="btn-add-new" onClick={handleOpenCreateModal}>
          ➕ Thêm sản phẩm mới
        </button>
      </div>

      {/* Filters & Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo tên sản phẩm..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
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
            className="filter-select"
          >
            <option value="">📊 Tất cả trạng thái</option>
            <option value="true">✅ Đang bán</option>
            <option value="false">❌ Đã ẩn</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <span className="stat-item">
          📊 Tổng số: <strong>{totalItems}</strong> sản phẩm
        </span>
        <span className="stat-item">
          📄 Trang: <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
        </span>
      </div>

      {/* Product Table */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>📦 Không có sản phẩm nào</p>
          <button className="btn-add-first" onClick={handleOpenCreateModal}>
            ➕ Thêm sản phẩm đầu tiên
          </button>
        </div>
      ) : (
        <>
          <ProductTable
            products={products}
            categories={categories}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteProduct}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
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
