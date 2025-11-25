// src/pages/ProductManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, FolderOpen, Plus } from 'lucide-react';
import { productService, categoryService } from '../services'; // ✅ Sử dụng services
import adminService from '../services/adminService';
import ProductTable from '../components/ProductTable';
import ProductModal from '../components/ProductModal';
import Pagination from '../components/Pagination';
import Toast from '../components/Toast';
import { Button, Card, Input, Switch } from '../components/ui';
import AdminLayout from '../layouts/AdminLayout';
import staffService from '../services/staffService';

const ProductManagementPage = ({ isStaffView = false }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let response;
      if (isStaffView) {
        // Staff: sử dụng staffService
        response = await staffService.getAllProducts({
          page: currentPage,
          limit: 10,
          search: searchTerm,
          loaiId: filterCategory,
          trangThai: filterStatus === 'true' ? 1 : filterStatus === 'false' ? 0 : undefined
        });
        
        if (response.success) {
          // ✅ Backend đã convert sang camelCase bằng DTOMapper, chỉ cần sử dụng trực tiếp
          const productsData = response.data.products || response.data || [];
          console.log('📦 [ProductManagementPage] Products from backend:', productsData);
          console.log('📦 [ProductManagementPage] First product loaiSP:', productsData[0]?.loaiSP);
          
          // Backend đã convert, chỉ cần đảm bảo format đúng
          const normalizedProducts = productsData.map(product => ({
            ...product, // Giữ lại tất cả fields đã được DTOMapper convert
            id: product.id || product.ID,
            ten: product.ten || product.Ten,
            moTa: product.moTa || product.MoTa,
            giaBan: product.giaBan || product.GiaBan || 0,
            soLuongTon: product.soLuongTon !== undefined ? product.soLuongTon : (product.SoLuongTon !== undefined ? product.SoLuongTon : 0),
            trangThai: product.trangThai !== undefined ? product.trangThai : (product.TrangThai !== undefined ? product.TrangThai : 1),
            enable: product.enable !== undefined ? product.enable : (product.Enable !== undefined ? product.Enable : 1),
            ngayTao: product.ngayTao || product.NgayTao,
            hinhAnhURL: product.hinhAnhUrl || product.hinhAnhURL || product.HinhAnhURL,
            // ✅ Backend đã convert loaiSP sang camelCase
            loaiSP: product.loaiSP || product.LoaiSP,
            loaiID: product.loaiId || product.loaiID || product.IDLoai || product.idLoai
          }));
          setProducts(normalizedProducts);
          setTotalPages(response.pagination?.totalPages || 1);
          setTotalItems(response.pagination?.total || 0);
        }
      } else {
        // Admin: sử dụng productService
        response = await productService.adminGetProducts({
          page: currentPage,
          limit: 10,
          search: searchTerm,
          loaiId: filterCategory,
          enable: filterStatus
        });

        if (response.success) {
          const productsData = response.data.products || [];
          setProducts(productsData);
          setTotalPages(response.data.pagination?.totalPages || 1);
          setTotalItems(response.data.pagination?.totalProducts || 0);
        }
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
      // ✅ Staff: Sử dụng public endpoint, Admin: Sử dụng admin endpoint
      const response = isStaffView 
        ? await categoryService.getCategories()  // Public endpoint
        : await categoryService.adminGetCategories();  // Admin endpoint

      if (response.success) {
        // ✅ Backend trả về { data: { categories: [...] } hoặc { data: [...] }
        const categoriesData = response.data.categories || response.data || [];
        console.log('📂 Categories loaded:', categoriesData);
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchBrands = async () => {
    try {
      // ✅ Staff: Sử dụng public endpoint, Admin: Sử dụng admin endpoint
      let response;
      if (isStaffView) {
        // Staff: Sử dụng productService.getBrands() (public endpoint)
        response = await productService.getBrands();
      } else {
        // Admin: Sử dụng adminService.getBrands()
        response = await adminService.getBrands();
      }
      
      if (response.success) {
        // ✅ Backend có thể trả về { data: { brands: [...] } hoặc { data: [...] }
        const brandsData = response.data.brands || response.data || [];
        console.log('🏷️ Brands loaded:', brandsData);
        setBrands(brandsData);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
    }
  };

  const refreshData = () => {
    fetchCategories();
    fetchBrands();
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, filterCategory, filterStatus]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
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
        // ✅ Sử dụng productService thay vì axios trực tiếp
        const response = await productService.adminCreateProduct(formData);

        if (response.success) {
          showToast('✅ Thêm sản phẩm thành công!', 'success');
          fetchProducts();
          handleCloseModal();
        }
      } else {
        // ✅ Sử dụng productService thay vì axios trực tiếp
        const response = await productService.adminUpdateProduct(
          editingProduct.id,
          formData
        );

        if (response.success) {
          showToast('✅ Cập nhật sản phẩm thành công!', 'success');
          fetchProducts();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      const errorMsg = error.message || 'Có lỗi xảy ra!';
      showToast(`❌ ${errorMsg}`, 'error');
      throw error;
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('⚠️ Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return;
    }

    try {
      // ✅ Sử dụng productService thay vì axios trực tiếp
      const response = await productService.adminDeleteProduct(productId);

      if (response.success) {
        showToast('✅ Xóa sản phẩm thành công!', 'success');
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      const errorMsg = error.message || 'Không thể xóa sản phẩm!';
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
    <AdminLayout isStaffView={isStaffView}>
      {/* Page Title với Statistics */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Package size={32} />
            Quản lý Sản phẩm
          </h2>
          <p className="text-gray-600 mt-1">Quản lý danh sách sản phẩm của cửa hàng</p>
        </div>
        
        {/* Statistics - Text đơn giản */}
        <div className="text-lg font-semibold text-gray-700">
          Tổng số sản phẩm: <span className="text-blue-600">{totalItems}</span>
        </div>
      </div>

      {/* 🎀 Filters & Search */}
      <div className="mb-6 bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 rounded-2xl p-5 shadow-sm border border-pink-100">
        <div className="flex flex-wrap gap-3 items-stretch">
          {/* Dropdown: Tất cả */}
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
            <option value="" className="flex items-center gap-2">
              <FolderOpen size={16} /> Tất cả
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.ten}
              </option>
            ))}
          </select>

          {/* Thanh tìm kiếm */}
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

          {/* Nút "Thêm" - Chỉ hiển thị cho Admin */}
          {!isStaffView && (
            <button
              onClick={handleOpenCreateModal}
              className="px-5 bg-gradient-to-r from-pink-400 to-rose-400 
                       text-white font-semibold text-sm rounded-xl
                       hover:from-pink-500 hover:to-rose-500
                       focus:outline-none focus:ring-2 focus:ring-pink-300
                       transition-all duration-200 shadow-md hover:shadow-lg
                       flex items-center gap-2 whitespace-nowrap h-[42px]"
            >
              <Plus size={18} />
              Thêm
            </button>
          )}

          {/* Switch: Hoạt động/Không hoạt động */}
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
            <Package size={64} className="opacity-50" />
            <p className="text-xl font-semibold text-gray-600">Không có sản phẩm nào</p>
            {!isStaffView && (
              <Button onClick={handleOpenCreateModal}>
                <Plus size={16} className="mr-2" />
                Thêm sản phẩm đầu tiên
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          <Card padding="none" className="mb-6">
            <ProductTable
              products={products}
              categories={categories}
              onEdit={isStaffView ? undefined : handleOpenEditModal}
              onDelete={isStaffView ? undefined : handleDeleteProduct}
              isStaffView={isStaffView}
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
        brands={brands}
        mode={modalMode}
        onRefreshData={refreshData}
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
