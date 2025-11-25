import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productService, cartService } from '../../services';
import { Search, X, Filter, Sparkles, ChevronDown, ChevronUp, DollarSign, Star, TrendingUp, Package, Tag, Grid, List, SlidersHorizontal } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import { ProductCard, Loading, Button, Badge } from '../../components/ui';
import Pagination from '../../components/Pagination.js';
import ProductQuickViewModal from '../../components/ProductQuickViewModal.jsx';
import Toast from '../../components/Toast.js';
import { useAuth } from '../../contexts/AuthContext.js';

/**
 * 🛍️ ProductList - THIẾT KẾ MỚI 2 CỘT
 * Áp dụng UX/UI tối ưu và tâm lý học thương mại điện tử
 * Layout: Sidebar Filter (trái) + Product Grid (phải)
 */
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // ✅ FILTER STATE - Đầy đủ các trường
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')) : null,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : null,
    loaiId: searchParams.get('category') ? parseInt(searchParams.get('category')) : null,
    thuongHieuId: searchParams.get('brand') ? parseInt(searchParams.get('brand')) : null
  });

  // ✅ EXPANDED STATES cho accordion filters
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    brand: true,
    price: true,
    rating: false
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters]);

  // ✅ Load danh mục và thương hiệu
  const loadInitialData = async () => {
    try {
      console.log('🔄 Đang tải danh mục và thương hiệu...');
      
      const [categoriesRes, brandsRes] = await Promise.all([
        productService.getCategories(),
        productService.getBrands()
      ]);

      console.log('📦 Categories response:', categoriesRes);
      console.log('🏷️ Brands response:', brandsRes);

      if (categoriesRes.success && categoriesRes.data) {
        // ✅ Xử lý cả 2 format response: array trực tiếp hoặc trong object
        const categoriesData = Array.isArray(categoriesRes.data) 
          ? categoriesRes.data 
          : categoriesRes.data.categories || [];
        
        console.log('✅ Categories loaded:', categoriesData.length, categoriesData);
        setCategories(categoriesData);
      } else {
        console.warn('⚠️ Categories response không đúng format:', categoriesRes);
      }

      if (brandsRes.success && brandsRes.data) {
        // ✅ Xử lý cả 2 format response: array trực tiếp hoặc trong object
        const brandsData = Array.isArray(brandsRes.data) 
          ? brandsRes.data 
          : brandsRes.data.brands || [];
        
        console.log('✅ Brands loaded:', brandsData.length, brandsData);
        setBrands(brandsData);
      } else {
        console.warn('⚠️ Brands response không đúng format:', brandsRes);
      }
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      showToast('Không thể tải danh mục và thương hiệu', 'error');
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // ✅ MAP PARAMS ĐỂ KHỚP VỚI BACKEND API
      const apiParams = {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        filter: filters.sortBy, // ✅ Backend nhận 'filter' không phải 'sortBy'
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        categoryId: filters.loaiId, // ✅ Backend nhận 'categoryId' không phải 'loaiId'
        brandId: filters.thuongHieuId // ✅ Backend nhận 'brandId' không phải 'thuongHieuId'
      };

      console.log('📤 Gửi API params:', apiParams);
      
      const response = await productService.getProducts(apiParams);
      
      if (response.success && response.data) {
        const products = response.data.products || response.data;
        setProducts(products);
        
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
          setTotalProducts(response.data.pagination.totalProducts || 0);
        }
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('❌ Error loading products:', error);
      setProducts([]);
      showToast(error.message || 'Không thể tải sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
      page: 1
    });
  };

  const handleSearch = (e) => {
    handleFilterChange('search', e.target.value);
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      search: '',
      sortBy: 'newest',
      minPrice: null,
      maxPrice: null,
      loaiId: null,
      thuongHieuId: null
    });
  };

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration });
  };

  const handleAddToCart = async (product, quantity = 1) => {
    try {
      setAdding(true);
      const response = await cartService.addToCart(product.id, quantity);

      if (response.success) {
        showToast(`Đã thêm ${quantity} ${product.ten} vào giỏ hàng`, 'success', 3000);
        
        if (!user) {
          setTimeout(() => {
            showToast('💡 Bạn có thể thanh toán mà không cần đăng nhập!', 'info', 3000);
          }, 500);
        }
      }
    } catch (error) {
      console.error('❌ Lỗi thêm vào giỏ hàng:', error);
      showToast(error.message || 'Không thể thêm vào giỏ hàng', 'error', 4000);
    } finally {
      setAdding(false);
    }
  };

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleFavorite = (product) => {
    if (!user) {
      showToast('Vui lòng đăng nhập để thêm vào yêu thích', 'warning', 3000);
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    showToast(`❤️ Đã thêm "${product.ten}" vào danh sách yêu thích!`, 'success', 3000);
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  // ✅ Đếm số filter đang active
  const activeFiltersCount = [
    filters.loaiId,
    filters.thuongHieuId,
    filters.minPrice,
    filters.maxPrice,
    filters.search
  ].filter(Boolean).length;

  // ✅ SORT OPTIONS - Áp dụng tâm lý học thương mại điện tử
  const sortOptions = [
    { value: 'newest', label: 'Mới nhất', icon: '🆕' },
    { value: 'bestSeller', label: 'Bán chạy', icon: '🔥' },      // ✅ SỬA: bestseller → bestSeller
    { value: 'priceAsc', label: 'Giá tăng dần', icon: '💰' },    // ✅ SỬA: price-asc → priceAsc
    { value: 'priceDesc', label: 'Giá giảm dần', icon: '💎' }    // ✅ SỬA: price-desc → priceDesc
  ];

  // ✅ PRICE RANGE PRESETS
  const priceRanges = [
    { label: 'Dưới 100k', min: null, max: 100000, color: 'green' },
    { label: '100k - 300k', min: 100000, max: 300000, color: 'blue' },
    { label: '300k - 500k', min: 300000, max: 500000, color: 'purple' },
    { label: 'Trên 500k', min: 500000, max: null, color: 'pink' }
  ];

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-pink-50/30 to-white min-h-screen">
        <div className="container-cute py-4">
          {/* ✅ HEADER - Compact hơn */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Package className="text-pink-500" size={28} />
              <div>
                <h1 className="text-2xl font-display font-bold text-gray-800">Sản phẩm</h1>
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-pink-600">{totalProducts}</span> sản phẩm
                </p>
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-pink-200 rounded-xl font-semibold text-gray-700 hover:bg-pink-50 transition-all relative"
            >
              <SlidersHorizontal size={18} className="text-pink-500" />
              <span>Bộ lọc</span>
              {activeFiltersCount > 0 && (
                <Badge variant="danger" size="sm" className="absolute -top-2 -right-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </button>
          </div>

          {/* ✅ SEARCH BAR - Inline với toolbar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm... 🔍"
                value={filters.search}
                onChange={handleSearch}
                className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all text-gray-700"
              />
              {filters.search && (
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-pink-100 rounded-full transition-colors"
                >
                  <X size={16} className="text-pink-500" />
                </button>
              )}
            </div>
          </div>

          {/* ✅ LAYOUT 2 CỘT: Tỷ lệ tốt hơn */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* ========== SIDEBAR FILTERS (Trái - 3 cột) ========== */}
            <aside className={`lg:col-span-3 ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-20 space-y-3">
                {/* Filter Header - ✅ BỎ BOX, CHỈ TEXT */}
                <div className="flex items-center justify-between mb-1 px-1">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 text-base">
                    <Filter size={18} className="text-pink-500" />
                    Bộ lọc
                    {activeFiltersCount > 0 && (
                      <Badge variant="danger" size="sm">{activeFiltersCount}</Badge>
                    )}
                  </h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <X size={14} />
                      Xóa tất cả
                    </button>
                  )}
                </div>

                {/* ===== 1. DANH MỤC ===== */}
                <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleSection('category')}
                    className="w-full flex items-center justify-between p-3 hover:bg-pink-50 transition-colors"
                  >
                    <span className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                      <Tag size={16} className="text-pink-500" />
                      Danh mục
                    </span>
                    {expandedSections.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {expandedSections.category && (
                    <div className="px-3 pb-3 space-y-1.5 max-h-60 overflow-y-auto">
                      <label className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="category"
                          checked={!filters.loaiId}
                          onChange={() => handleFilterChange('loaiId', null)}
                          className="w-4 h-4 text-pink-600"
                        />
                        <span className="text-sm text-gray-700">Tất cả</span>
                      </label>
                      {categories.map((cat) => (
                        <label
                          key={cat.id}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                            filters.loaiId === cat.id
                              ? 'bg-gradient-to-r from-pink-100 to-rose-100 font-semibold'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="category"
                            checked={filters.loaiId === cat.id}
                            onChange={() => handleFilterChange('loaiId', cat.id)}
                            className="w-4 h-4 text-pink-600"
                          />
                          <span className={`text-sm ${filters.loaiId === cat.id ? 'text-pink-700 font-bold' : 'text-gray-700'}`}>
                            {cat.ten}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* ===== 2. THƯƠNG HIỆU ===== */}
                <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleSection('brand')}
                    className="w-full flex items-center justify-between p-3 hover:bg-pink-50 transition-colors"
                  >
                    <span className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                      <Sparkles size={16} className="text-pink-500" />
                      Thương hiệu
                    </span>
                    {expandedSections.brand ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {expandedSections.brand && (
                    <div className="px-3 pb-3 space-y-1.5 max-h-60 overflow-y-auto">
                      <label className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="brand"
                          checked={!filters.thuongHieuId}
                          onChange={() => handleFilterChange('thuongHieuId', null)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">Tất cả</span>
                      </label>
                      {brands.map((brand) => (
                        <label
                          key={brand.id}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                            filters.thuongHieuId === brand.id
                              ? 'bg-gradient-to-r from-blue-100 to-blue-50 font-semibold'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="brand"
                            checked={filters.thuongHieuId === brand.id}
                            onChange={() => handleFilterChange('thuongHieuId', brand.id)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className={`text-sm ${filters.thuongHieuId === brand.id ? 'text-blue-700 font-bold' : 'text-gray-700'}`}>
                            {brand.ten}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* ===== 3. KHOẢNG GIÁ ===== */}
                <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleSection('price')}
                    className="w-full flex items-center justify-between p-3 hover:bg-pink-50 transition-colors"
                  >
                    <span className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                      <DollarSign size={16} className="text-pink-500" />
                      Khoảng giá
                    </span>
                    {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {expandedSections.price && (
                    <div className="px-3 pb-3 space-y-2">
                      {/* Quick price ranges */}
                      <div className="space-y-1.5">
                        {priceRanges.map((range, index) => {
                          const isActive = filters.minPrice === range.min && filters.maxPrice === range.max;
                          const colorClasses = {
                            green: 'bg-green-100 border-green-300 text-green-700',
                            blue: 'bg-blue-100 border-blue-300 text-blue-700',
                            purple: 'bg-purple-100 border-purple-300 text-purple-700',
                            pink: 'bg-pink-100 border-pink-300 text-pink-700'
                          };
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                handleFilterChange('minPrice', range.min);
                                handleFilterChange('maxPrice', range.max);
                              }}
                              className={`w-full text-left p-2 rounded-lg border-2 transition-all text-sm font-medium ${
                                isActive
                                  ? colorClasses[range.color]
                                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              {range.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom price inputs */}
                      <div className="pt-2 border-t-2 border-gray-100">
                        <p className="text-xs font-semibold text-gray-600 mb-1.5">Tùy chỉnh:</p>
                        <div className="space-y-1.5">
                          <input
                            type="number"
                            placeholder="Tối thiểu"
                            value={filters.minPrice || ''}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : null)}
                            className="w-full px-2.5 py-2 border-2 border-gray-200 rounded-lg text-xs focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                          />
                          <input
                            type="number"
                            placeholder="Tối đa"
                            value={filters.maxPrice || ''}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : null)}
                            className="w-full px-2.5 py-2 border-2 border-gray-200 rounded-lg text-xs focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ===== 4. SOCIAL PROOF ===== */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 p-3 shadow-sm">
                  <div className="text-center space-y-1">
                    <div className="flex justify-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className="text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-gray-700">
                      Đánh giá cao từ khách hàng
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* ========== PRODUCTS GRID (Phải - 9 cột) ========== */}
            <main className="lg:col-span-9">
              {/* Toolbar: Sort & View Mode */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-3 mb-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Sort Options */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <TrendingUp size={16} className="text-pink-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-gray-700">Sắp xếp:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleFilterChange('sortBy', option.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            filters.sortBy === option.value
                              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span className="mr-1">{option.icon}</span>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                      }`}
                      title="Xem dạng lưới"
                    >
                      <Grid size={16} className={viewMode === 'grid' ? 'text-pink-600' : 'text-gray-600'} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                      }`}
                      title="Xem dạng danh sách"
                    >
                      <List size={16} className={viewMode === 'list' ? 'text-pink-600' : 'text-gray-600'} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Display */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loading text="Đang tải sản phẩm..." />
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4' 
                    : 'space-y-4'
                  }>
                    {products.map((product, index) => (
                      <div
                        key={product.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
                        <ProductCard
                          product={product}
                          onAddToCart={handleAddToCart}
                          onQuickView={handleQuickView}
                          onFavorite={handleFavorite}
                          viewMode={viewMode}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={filters.page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-16 text-center shadow-sm">
                  <div className="text-7xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm</h3>
                  <p className="text-gray-600 mb-6">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                  <Button variant="primary" onClick={clearAllFilters}>
                    <X size={16} className="mr-2" />
                    Xóa tất cả bộ lọc
                  </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
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
    </MainLayout>
  );
};

export default ProductList;