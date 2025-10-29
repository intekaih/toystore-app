import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../../api/productApi.js';
import { addToCart } from '../../api/cartApi.js';
import { Search, X, Filter, Sparkles } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import { ProductCard, Loading, Button, Badge } from '../../components/ui';
import Pagination from '../../components/Pagination.js';
import ProductFilterBar from '../../components/ProductFilterBar.js';
import ProductQuickViewModal from '../../components/ProductQuickViewModal.jsx';
import Toast from '../../components/Toast.js';
import { useAuth } from '../../contexts/AuthContext.js';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    filter: 'newest',
    minPrice: null,
    maxPrice: null,
    categoryId: null
  });

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading products with filters:', filters);

      const response = await getProducts(filters);
      
      if (response.success && response.data) {
        setProducts(response.data.products || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalProducts(response.data.pagination?.totalProducts || 0);
        
        console.log('✅ Loaded products:', response.data.products.length);
        console.log('📊 Filter info:', response.data.filters);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('❌ Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    console.log('🎯 Filter changed:', newFilters);
    setFilters(newFilters);
  };

  const handleSearch = (e) => {
    setFilters({
      ...filters,
      search: e.target.value,
      page: 1
    });
  };

  const handlePageChange = (page) => {
    setFilters({
      ...filters,
      page
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration });
  };

  const handleAddToCart = async (product, quantity = 1) => {
    if (!user) {
      showToast('Vui lòng đăng nhập để thêm vào giỏ hàng', 'warning', 3000);
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      setAdding(true);
      // ✅ Sửa: ưu tiên ID trước
      const productId = product.ID || product.id || product.MaSP || product.maSP;
      const response = await addToCart(productId, quantity);

      if (response.success) {
        showToast(
          response.message || `Đã thêm ${quantity} ${product.Ten || product.ten || product.tenSP || product.TenSP} vào giỏ hàng`,
          'success',
          3000
        );
      }
    } catch (error) {
      console.error('❌ Lỗi thêm vào giỏ hàng:', error);
      showToast(error.message || 'Không thể thêm vào giỏ hàng', 'error', 4000);
    } finally {
      setAdding(false);
    }
  };

  // 👁️ Xử lý xem nhanh sản phẩm
  const handleQuickView = (product) => {
    console.log('👁️ Quick view product:', product);
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  // ❤️ Xử lý thêm vào yêu thích (tạm thời chỉ hiển thị thông báo)
  const handleFavorite = (product) => {
    if (!user) {
      showToast('Vui lòng đăng nhập để thêm vào yêu thích', 'warning', 3000);
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    
    const productName = product.Ten || product.ten || product.tenSP || product.TenSP;
    showToast(`❤️ Đã thêm "${productName}" vào danh sách yêu thích!`, 'success', 3000);
    // TODO: Implement wishlist API call
  };

  return (
    <MainLayout>
      <div className="container-cute py-8">
        {/* 🌸 Header Section - Dễ thương */}
        <div className="text-center mb-8 space-y-3 animate-slide-up">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="text-primary-500" size={32} />
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800">
              Danh sách sản phẩm
            </h1>
            <Sparkles className="text-primary-500" size={32} />
          </div>
          <p className="text-lg text-gray-600">
            Tìm thấy <Badge variant="primary" size="lg">{totalProducts}</Badge> sản phẩm
          </p>
        </div>

        {/* 🔍 Search Bar - Cute */}
        <div className="mb-6 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm theo tên... 🔍"
              value={filters.search}
              onChange={handleSearch}
              className="input-cute pl-12 pr-12"
            />
            {filters.search && (
              <button 
                onClick={() => handleFilterChange({ ...filters, search: '', page: 1 })}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-primary-100 rounded-full transition-colors"
              >
                <X size={18} className="text-primary-500" />
              </button>
            )}
          </div>
        </div>

        {/* 🎯 Strategy Pattern Filter Bar */}
        <div className="mb-8">
          <ProductFilterBar 
            onFilterChange={handleFilterChange}
            currentFilters={filters}
          />
        </div>

        {/* 🛍️ Products Grid */}
        {loading ? (
          <Loading text="Đang tải sản phẩm..." />
        ) : (
          <>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {products.map((product, index) => (
                  <div 
                    key={product.ID || product.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => handleProductClick(product.ID || product.id)}
                  >
                    <ProductCard 
                      product={product}
                      onAddToCart={handleAddToCart}
                      onQuickView={handleQuickView}
                      onFavorite={handleFavorite}
                    />
                    {product.SoLuongBan !== undefined && filters.filter === 'bestSeller' && (
                      <div className="mt-2">
                        <Badge variant="danger" size="sm">
                          🔥 Đã bán {product.SoLuongBan}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className="text-8xl">🔍</div>
                <h3 className="text-2xl font-bold text-gray-700">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-500">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                <Button 
                  variant="outline"
                  onClick={() => handleFilterChange({
                    page: 1,
                    limit: 12,
                    search: '',
                    filter: 'newest',
                    minPrice: null,
                    maxPrice: null,
                    categoryId: null
                  })}
                >
                  🔄 Đặt lại bộ lọc
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && products.length > 0 && (
              <div className="mt-8">
                <Pagination
                  currentPage={filters.page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}

        {/* 👁️ Quick View Modal */}
        <ProductQuickViewModal
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
          product={quickViewProduct}
          onAddToCart={handleAddToCart}
          onFavorite={handleFavorite}
        />

        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default ProductList;