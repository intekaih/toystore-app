// src/pages/ProductManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, FolderOpen, Plus, Search, ChevronDown } from 'lucide-react';
import { productService, categoryService } from '../services'; // ✅ Sử dụng services
import adminService from '../services/adminService';
import ProductTable from '../components/ProductTable';
import ProductModal from '../components/ProductModal';
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
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStock, setFilterStock] = useState('');
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
          thuongHieuId: filterBrand,
          stockFilter: filterStock,
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
  }, [currentPage, searchTerm, filterCategory, filterBrand, filterStock, filterStatus]);

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
      {/* Header Section */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh sách sản phẩm</h1>
        </div>
        {/* Nút "Thêm sản phẩm mới" - Chỉ hiển thị cho Admin */}
        {!isStaffView && (
          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 
                     text-white font-semibold text-sm rounded-lg
                     hover:from-pink-600 hover:to-rose-600
                     focus:outline-none focus:ring-2 focus:ring-pink-300
                     transition-all duration-200 shadow-md hover:shadow-lg
                     flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} />
            Thêm
          </button>
        )}
      </div>

      {/* Filter and Action Bar */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search Bar */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc ID sản phẩm..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg 
                         text-gray-700 text-sm placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400
                         hover:border-gray-400 transition-all duration-200"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Dropdown: Danh mục */}
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg 
                       text-gray-700 text-sm
                       focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400
                       hover:border-gray-400 transition-all duration-200 cursor-pointer
                       min-w-[150px]"
            >
              <option value="">Danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.ten}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Dropdown: Thương hiệu */}
          <div className="relative">
            <select
              value={filterBrand}
              onChange={(e) => {
                setFilterBrand(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg 
                       text-gray-700 text-sm
                       focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400
                       hover:border-gray-400 transition-all duration-200 cursor-pointer
                       min-w-[150px]"
            >
              <option value="">Thương hiệu</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.tenThuongHieu || brand.TenThuongHieu}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Dropdown: Tồn kho */}
          <div className="relative">
            <select
              value={filterStock}
              onChange={(e) => {
                setFilterStock(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg 
                       text-gray-700 text-sm
                       focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400
                       hover:border-gray-400 transition-all duration-200 cursor-pointer
                       min-w-[130px]"
            >
              <option value="">Tồn kho</option>
              <option value="in-stock">Còn hàng</option>
              <option value="out-of-stock">Hết hàng</option>
              <option value="low-stock">Sắp hết</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Dropdown: Trạng thái */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setShowActiveOnly(e.target.value === 'true');
                setCurrentPage(1);
              }}
              className="appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg 
                       text-gray-700 text-sm
                       focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400
                       hover:border-gray-400 transition-all duration-200 cursor-pointer
                       min-w-[130px]"
            >
              <option value="">Trạng thái</option>
              <option value="true">Đang bán</option>
              <option value="false">Đã ẩn</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
          <ProductTable
            products={products}
            categories={categories}
            onEdit={isStaffView ? undefined : handleOpenEditModal}
            onDelete={isStaffView ? undefined : handleDeleteProduct}
            isStaffView={isStaffView}
          />

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Hiển thị {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, totalItems)} trên {totalItems} sản phẩm
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium
                  ${currentPage === 1
                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 cursor-pointer'
                  }`}
              >
                Trước
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium
                  ${currentPage === totalPages
                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 cursor-pointer'
                  }`}
              >
                Sau
              </button>
            </div>
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
