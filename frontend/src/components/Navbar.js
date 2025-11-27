import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { ShoppingCart, User, Home, Package, LogOut, Settings, Edit, Heart, Search, Sparkles, TrendingUp, FolderOpen, Gift, Menu, X, ChevronDown, ChevronRight, Trash2, Plus, Minus, Tag } from 'lucide-react';
import { RoleChecker } from '../constants/roles';
import { productService, cartService } from '../services';
import config from '../config';

/**
 * 🌸 Navbar - Thanh điều hướng với tone màu trắng hồng sữa
 */
const Navbar = () => {
  const { user, logout, isAdmin, isStaff, isAdminOrStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [hoveredDropdown, setHoveredDropdown] = useState(null); // 'categories' | 'brands' | null
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartPopupPosition, setCartPopupPosition] = useState({ top: 0, right: 0 });
  // ✅ Search popup state (cho trang chủ)
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPopupPosition, setSearchPopupPosition] = useState({ top: 0, left: 0, width: 0 });
  const categoryButtonRef = useRef(null);
  const brandButtonRef = useRef(null);
  const cartButtonRef = useRef(null);
  const cartPopupRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchPopupRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const cartHoverTimeoutRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const searchProductsTimeoutRef = useRef(null); // ✅ Timeout cho tìm kiếm tự động ở trang products
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Hàm kiểm tra xem link có đang active không
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // ✅ Lấy role display info
  const getRoleDisplay = () => {
    if (!user) return null;
    const role = user.vaiTro || user.VaiTro || user.role;
    return RoleChecker.getDisplayInfo(role);
  };

  const roleDisplay = getRoleDisplay();

  // ✅ Kiểm tra xem có phải trang chủ không
  const isHomepage = location.pathname === '/';

  // ✅ Tìm kiếm sản phẩm (cho trang chủ - hiển thị popup)
  const searchProducts = async (query) => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchPopup(false);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await productService.getProducts({
        page: 1,
        limit: 4,
        search: query.trim(),
        filter: 'newest'
      });

      if (response.success && response.data) {
        const products = response.data.products || response.data || [];
        setSearchResults(products.slice(0, 4)); // Chỉ lấy 4 sản phẩm đầu tiên
        setShowSearchPopup(products.length > 0);
      } else {
        setSearchResults([]);
        setShowSearchPopup(false);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
      setShowSearchPopup(false);
    } finally {
      setSearchLoading(false);
    }
  };

  // ✅ Handle search input change (với debounce cho cả trang chủ và trang products)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (isHomepage) {
      // Ở trang chủ: tìm kiếm và hiển thị popup
      // Clear timeout cũ
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Nếu input rỗng, đóng popup
      if (!value.trim()) {
        setShowSearchPopup(false);
        setSearchResults([]);
        return;
      }

      // Debounce tìm kiếm
      searchTimeoutRef.current = setTimeout(() => {
        searchProducts(value);
      }, 300);
    } else if (location.pathname.startsWith('/products')) {
      // Ở trang products: tìm kiếm tự động với debounce
      // Clear timeout cũ
      if (searchProductsTimeoutRef.current) {
        clearTimeout(searchProductsTimeoutRef.current);
      }

      // Nếu input rỗng, xóa search param ngay lập tức
      if (!value.trim()) {
        const currentParams = new URLSearchParams(searchParams);
        currentParams.delete('search');
        const newUrl = currentParams.toString() 
          ? `/products?${currentParams.toString()}` 
          : '/products';
        navigate(newUrl, { replace: true });
        return;
      }

      // Debounce tìm kiếm tự động (500ms để tránh quá nhiều requests)
      searchProductsTimeoutRef.current = setTimeout(() => {
        const searchUrl = `/products?search=${encodeURIComponent(value.trim())}`;
        navigate(searchUrl, { replace: true });
      }, 500);
    }
  };

  // ✅ Handle search submit (khi nhấn Enter)
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Clear timeout để tránh tìm kiếm tự động sau khi submit
    if (searchProductsTimeoutRef.current) {
      clearTimeout(searchProductsTimeoutRef.current);
    }
    
    if (searchQuery.trim()) {
      const searchUrl = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
      
      // Nếu đã ở trang products, chỉ update search params
      if (location.pathname.startsWith('/products')) {
        navigate(searchUrl, { replace: true });
      } else {
        // Nếu ở trang khác, navigate đến products
        navigate(searchUrl);
      }
      
      setShowSearchPopup(false);
      
      // Chỉ clear search query nếu không ở trang products
      if (!location.pathname.startsWith('/products')) {
        setSearchQuery('');
      }
    }
  };

  // Load categories and brands
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          productService.getCategories().catch((err) => {
            console.error('❌ Lỗi load categories:', err);
            return { success: false };
          }),
          productService.getBrands().catch((err) => {
            console.error('❌ Lỗi load brands:', err);
            return { success: false };
          })
        ]);

        if (categoriesRes.success && categoriesRes.data) {
          const cats = Array.isArray(categoriesRes.data)
            ? categoriesRes.data
            : categoriesRes.data.categories || [];
          setCategories(cats);
        }

        if (brandsRes.success && brandsRes.data) {
          const brs = Array.isArray(brandsRes.data)
            ? brandsRes.data
            : brandsRes.data.brands || [];
          setBrands(brs);
        }
      } catch (error) {
        console.error('Error loading navigation data:', error);
      }
    };

    loadData();
  }, []);

  // Load cart items khi component mount để hiển thị badge
  useEffect(() => {
    loadCartItems();
  }, []);

  // ✅ Sync search query với URL search params khi ở trang /products
  useEffect(() => {
    if (!isHomepage && location.pathname.startsWith('/products')) {
      const urlSearch = searchParams.get('search') || '';
      if (urlSearch !== searchQuery) {
        setSearchQuery(urlSearch);
      }
    }
  }, [searchParams, location.pathname, isHomepage]);

  // ✅ Cleanup timeouts khi component unmount hoặc location thay đổi
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (searchProductsTimeoutRef.current) {
        clearTimeout(searchProductsTimeoutRef.current);
      }
    };
  }, [location.pathname]);

  // Calculate dropdown position
  useEffect(() => {
    const updateDropdownPosition = () => {
      if (hoveredDropdown === 'categories' && categoryButtonRef.current) {
        const rect = categoryButtonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width
        });
      } else if (hoveredDropdown === 'brands') {
        // Brands dropdown có thể full-width, không cần định vị theo button
        // Hiển thị ngay dưới navbar
        const navbar = document.querySelector('nav');
        if (navbar) {
          const navbarRect = navbar.getBoundingClientRect();
          setDropdownPosition({
            top: navbarRect.bottom,
            left: 0,
            width: window.innerWidth
          });
        } else {
          // Fallback: center trên màn hình
          setDropdownPosition({
            top: 80,
            left: 0,
            width: window.innerWidth
          });
        }
      }
    };

    if (hoveredDropdown) {
      updateDropdownPosition();
      const intervalId = setInterval(updateDropdownPosition, 100);
      window.addEventListener('scroll', updateDropdownPosition, { passive: true });
      window.addEventListener('resize', updateDropdownPosition);

      return () => {
        clearInterval(intervalId);
        window.removeEventListener('scroll', updateDropdownPosition);
        window.removeEventListener('resize', updateDropdownPosition);
      };
    }
  }, [hoveredDropdown]);

  // Đóng popup khi navigate đến trang /cart
  useEffect(() => {
    if (location.pathname === '/cart' && showCartPopup) {
      setShowCartPopup(false);
    }
  }, [location.pathname, showCartPopup]);

  // Calculate cart popup position
  useEffect(() => {
    const updateCartPopupPosition = () => {
      if (showCartPopup && cartButtonRef.current) {
        const rect = cartButtonRef.current.getBoundingClientRect();
        setCartPopupPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right
        });
      }
    };

    if (showCartPopup) {
      updateCartPopupPosition();
      const intervalId = setInterval(updateCartPopupPosition, 100);
      window.addEventListener('scroll', updateCartPopupPosition, { passive: true });
      window.addEventListener('resize', updateCartPopupPosition);

      return () => {
        clearInterval(intervalId);
        window.removeEventListener('scroll', updateCartPopupPosition);
        window.removeEventListener('resize', updateCartPopupPosition);
      };
    }
  }, [showCartPopup]);

  // ✅ Calculate search popup position (cho trang chủ)
  useEffect(() => {
    const updateSearchPopupPosition = () => {
      if (showSearchPopup && searchInputRef.current) {
        const rect = searchInputRef.current.getBoundingClientRect();
        setSearchPopupPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width
        });
      }
    };

    if (showSearchPopup && isHomepage) {
      updateSearchPopupPosition();
      const intervalId = setInterval(updateSearchPopupPosition, 100);
      window.addEventListener('scroll', updateSearchPopupPosition, { passive: true });
      window.addEventListener('resize', updateSearchPopupPosition);

      return () => {
        clearInterval(intervalId);
        window.removeEventListener('scroll', updateSearchPopupPosition);
        window.removeEventListener('resize', updateSearchPopupPosition);
      };
    }
  }, [showSearchPopup, isHomepage]);

  // ✅ Đóng search popup khi click ra ngoài hoặc rời khỏi trang chủ
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showSearchPopup &&
        searchPopupRef.current &&
        !searchPopupRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSearchPopup(false);
      }
    };

    if (showSearchPopup && isHomepage) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSearchPopup, isHomepage]);

  // ✅ Đóng search popup khi rời khỏi trang chủ
  useEffect(() => {
    if (!isHomepage) {
      setShowSearchPopup(false);
      setSearchResults([]);
    }
  }, [isHomepage]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?categoryId=${categoryId}`);
    setHoveredDropdown(null);
  };

  const handleBrandClick = (brandId) => {
    navigate(`/products?brandId=${brandId}`);
    setHoveredDropdown(null);
  };

  // Load cart items
  const loadCartItems = async () => {
    try {
      setCartLoading(true);
      const response = await cartService.getCart();
      if (response.success && response.data) {
        setCartItems(response.data);
        setCartTotal(response.totalAmount || 0);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
      setCartTotal(0);
    } finally {
      setCartLoading(false);
    }
  };

  // Handle cart icon hover
  const handleCartMouseEnter = () => {
    // Không hiển thị popup nếu đang ở trang /cart
    if (location.pathname === '/cart') {
      return;
    }
    
    if (cartHoverTimeoutRef.current) {
      clearTimeout(cartHoverTimeoutRef.current);
    }
    setShowCartPopup(true);
    loadCartItems();
  };

  const handleCartMouseLeave = () => {
    cartHoverTimeoutRef.current = setTimeout(() => {
      setShowCartPopup(false);
    }, 200);
  };

  // Remove item from cart
  const handleRemoveItem = async (productId) => {
    try {
      await cartService.removeFromCart(productId);
      loadCartItems();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // Update quantity
  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    try {
      await cartService.updateQuantity(productId, newQuantity);
      loadCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  // Build image URL
  const buildImageUrl = (imagePath) => {
    if (!imagePath || imagePath === '') return '/barbie.jpg';
    
    // Nếu đã là full URL (http/https) thì return luôn
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Nếu bắt đầu với /uploads/ thì thêm API_BASE_URL
    if (imagePath.startsWith('/uploads/')) {
      return `${config.API_BASE_URL}${imagePath}`;
    }
    
    // Nếu không bắt đầu bằng / thì thêm /uploads/
    if (!imagePath.startsWith('/')) {
      return `${config.API_BASE_URL}/uploads/${imagePath}`;
    }
    
    // Fallback
    return '/barbie.jpg';
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container-cute">
        <div className="flex items-center justify-between gap-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-pink-600 hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="ToyStore Logo" className="w-16 h-16 object-contain" />
            <span className="hidden sm:inline">ToyStore</span>
          </Link>

          {/* Search Bar - Center */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4 relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={20} className="text-pink-500" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  // Nếu ở trang chủ và có kết quả, hiển thị popup
                  if (isHomepage && searchResults.length > 0) {
                    setShowSearchPopup(true);
                  }
                }}
                placeholder="Tìm kiếm đồ chơi..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-gray-700 placeholder-pink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            {/* ✅ Search Popup - Chỉ hiển thị ở trang chủ */}
            {isHomepage && showSearchPopup && searchQuery.trim().length >= 2 && createPortal(
              <div
                ref={searchPopupRef}
                className="fixed bg-transparent z-[10001]"
                style={{
                  zIndex: 10001,
                  position: 'fixed',
                  top: `${searchPopupPosition.top}px`,
                  left: `${searchPopupPosition.left}px`,
                  width: `${searchPopupPosition.width}px`,
                  pointerEvents: 'auto'
                }}
              >
                <div
                  className="bg-white rounded-xl shadow-2xl border-2 border-primary-100 max-h-[500px] overflow-y-auto animate-fade-in"
                  style={{
                    animation: 'fadeIn 0.2s ease-out'
                  }}
                >
                  {/* Search Results */}
                  <div className="p-4 space-y-3">
                    {searchLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-500"></div>
                      </div>
                    ) : (
                      <>
                        {searchResults.length > 0 ? (
                          <>
                            {searchResults.map((product) => {
                              const productId = product.id || product.ID;
                              const productName = product.ten || product.Ten || product.name;
                              const productPrice = product.giaBan || product.GiaBan || 0;
                              const imagePath = product.hinhAnhUrl || product.hinhAnhURL || product.HinhAnhURL || product.HinhAnhUrl;
                              const productImage = buildImageUrl(imagePath);

                              return (
                                <Link
                                  key={productId}
                                  to={`/products/${productId}`}
                                  onClick={() => {
                                    setShowSearchPopup(false);
                                    setSearchQuery('');
                                  }}
                                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-50 transition-colors group"
                                >
                                  {/* Product Image */}
                                  <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                    <img
                                      src={productImage}
                                      alt={productName}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.src = '/barbie.jpg';
                                      }}
                                    />
                                  </div>
                                  
                                  {/* Product Info */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                                      {productName}
                                    </h4>
                                    <p className="text-primary-500 font-bold text-sm">
                                      {productPrice.toLocaleString('vi-VN')}₫
                                    </p>
                                  </div>
                                  
                                  <ChevronRight size={16} className="text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
                                </Link>
                              );
                            })}
                          </>
                        ) : (
                          <div className="py-6 text-center text-gray-500">
                            <Search size={32} className="mx-auto mb-2 text-gray-400" />
                            <p className="text-sm">Không tìm thấy sản phẩm nào</p>
                          </div>
                        )}

                        {/* Xem tất cả Button - Luôn hiển thị nếu có từ khóa */}
                        {searchQuery.trim().length >= 2 && (
                          <div className="pt-2 border-t-2 border-gray-100">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleSearch(e);
                              }}
                              className="w-full px-4 py-2.5 text-center bg-gradient-to-r from-primary-400 to-primary-500 text-white font-semibold rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all flex items-center justify-center gap-2"
                            >
                              <span>Xem tất cả</span>
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>,
              document.body
            )}
          </form>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link 
              to="/products?sortBy=newest"
              className={`px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors ${
                isActive('/products') && location.search.includes('newest') ? 'text-primary-600' : ''
              }`}
            >
              Sản phẩm mới
            </Link>
            <Link 
              to="/products?sortBy=bestSeller"
              className={`px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors ${
                isActive('/products') && location.search.includes('bestSeller') ? 'text-primary-600' : ''
              }`}
            >
              Bán chạy
            </Link>
            <div
              ref={categoryButtonRef}
              className="relative"
              onMouseEnter={() => {
                // Hủy tất cả timeout
                if (hoverTimeoutRef.current) {
                  clearTimeout(hoverTimeoutRef.current);
                  hoverTimeoutRef.current = null;
                }
                // Đóng popup brands ngay và mở categories ngay (React sẽ re-render)
                setHoveredDropdown('categories');
              }}
              onMouseLeave={() => {
                hoverTimeoutRef.current = setTimeout(() => {
                  setHoveredDropdown(null);
                }, 200);
              }}
            >
              <Link 
                to="/products"
                className={`px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors flex items-center gap-1 ${
                  isActive('/products') && !location.search ? 'text-primary-600' : ''
                }`}
              >
                Danh mục
                <ChevronDown size={14} className={`transition-transform ${hoveredDropdown === 'categories' ? 'rotate-180' : ''}`} />
              </Link>
            </div>
            <div
              ref={brandButtonRef}
              className="relative"
              onMouseEnter={() => {
                // Hủy tất cả timeout
                if (hoverTimeoutRef.current) {
                  clearTimeout(hoverTimeoutRef.current);
                  hoverTimeoutRef.current = null;
                }
                // Đóng popup categories ngay và mở brands ngay (React sẽ re-render)
                setHoveredDropdown('brands');
              }}
              onMouseLeave={() => {
                // Delay để người dùng có thể di chuột vào popup
                hoverTimeoutRef.current = setTimeout(() => {
                  setHoveredDropdown(null);
                }, 300);
              }}
            >
              <Link 
                to="/products"
                className={`px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors flex items-center gap-1 ${
                  isActive('/products') && location.search.includes('brandId') ? 'text-primary-600' : ''
                }`}
              >
                Thương hiệu
                <ChevronDown size={14} className={`transition-transform duration-200 ${hoveredDropdown === 'brands' ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          </div>

          {/* User Icons - Right */}
          <div className="flex items-center gap-2">
            {/* Cart Icon */}
            <div 
              ref={cartButtonRef}
              className="relative"
              onMouseEnter={handleCartMouseEnter}
              onMouseLeave={handleCartMouseLeave}
            >
              <Link
                to="/cart"
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all relative"
              >
                <ShoppingCart size={20} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            </div>

            {/* Orders Icon */}
            <button
              onClick={() => {
                if (user) {
                  navigate('/orders');
                } else {
                  navigate('/order-lookup');
                }
              }}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all relative"
            >
              <Package size={20} />
            </button>

            {/* User Profile Icon */}
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all"
                >
                  <User size={20} />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-bubble shadow-bubble border-2 border-primary-100 overflow-hidden animate-scale-in">
                    {/* Menu Header */}
                    <div className="bg-gradient-to-r from-primary-50 to-rose-50 p-5 border-b-2 border-primary-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-rose-400 flex items-center justify-center text-white font-bold text-lg shadow-soft">
                          {user.hoTen?.charAt(0).toUpperCase() || user.tenDangNhap?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-800">{user.hoTen || user.tenDangNhap}</div>
                          <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                          <div className="mt-1">
                            {/* ✅ Hiển thị role badge với màu nền đúng - Admin màu hồng */}
                            {roleDisplay && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                roleDisplay.color === 'purple' 
                                  ? 'bg-pink-100 text-pink-700 border border-pink-200' 
                                  : roleDisplay.color === 'blue'
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                  : roleDisplay.color === 'green'
                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                  : 'bg-pink-100 text-pink-700 border border-pink-200'
                              }`}>
                                <span>{roleDisplay.icon}</span>
                                <span>{roleDisplay.label}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link 
                        to="/cart" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-600"
                      >
                        <ShoppingCart size={18} className="text-primary-500" />
                        <span className="font-medium">Giỏ hàng</span>
                      </Link>
                      
                      <Link 
                        to="/orders" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-600"
                      >
                        <Package size={18} className="text-primary-500" />
                        <span className="font-medium">Đơn hàng của tôi</span>
                      </Link>
                      
                      <Link 
                        to="/profile" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-600"
                      >
                        <User size={18} className="text-primary-500" />
                        <span className="font-medium">Thông tin cá nhân</span>
                      </Link>
                      
                      <Link 
                        to="/profile/edit" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-600"
                      >
                        <Edit size={18} className="text-primary-500" />
                        <span className="font-medium">Chỉnh sửa profile</span>
                      </Link>
                      
                      {/* ✅ Menu cho Admin và Nhân viên */}
                      {isAdminOrStaff() && (
                        <>
                          <div className="my-2 border-t-2 border-primary-100"></div>
                          <Link 
                            to={isAdmin() ? "/admin/dashboard" : "/staff/dashboard"} 
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-5 py-3 hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-600"
                          >
                            <Settings size={18} className="text-primary-500" />
                            <span className="font-medium">
                              {isAdmin() ? 'Quản trị hệ thống' : 'Bảng điều khiển Nhân viên'}
                            </span>
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="border-t-2 border-primary-100">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition-colors text-red-600 hover:text-red-700 font-medium"
                      >
                        <LogOut size={18} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all"
              >
                <User size={20} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="container-cute py-4 space-y-2">
            <Link 
              to="/products?sortBy=newest"
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-lg transition-colors"
            >
              Sản phẩm mới
            </Link>
            <Link 
              to="/products?sortBy=bestSeller"
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-lg transition-colors"
            >
              Bán chạy
            </Link>
            <Link 
              to="/products"
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-lg transition-colors"
            >
              Danh mục
            </Link>
            <Link 
              to="/products?sortBy=discount"
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-lg transition-colors"
            >
              Thương hiệu
            </Link>
          </div>
        </div>
      )}

      {/* Overlay */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}

      {/* Categories Dropdown */}
      {hoveredDropdown === 'categories' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed bg-transparent"
          style={{
            zIndex: 10000,
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            pointerEvents: 'auto',
            display: 'block',
            visibility: 'visible',
            opacity: 1,
            transition: 'none'
          }}
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
            }
            setHoveredDropdown('categories');
          }}
          onMouseLeave={() => {
            setHoveredDropdown(null);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-lg border-2 border-primary-100 min-w-[280px] max-w-[90vw] max-h-[400px] overflow-y-auto py-2 animate-fade-in category-dropdown-scrollbar"
            style={{
              zIndex: 10000,
              position: 'relative',
              display: 'block',
              visibility: 'visible',
              opacity: 1
            }}
          >
            {categories.length > 0 ? (
              categories.map((category) => {
                const categoryId = category.id || category.ID || category.IDLoai;
                const categoryName = category.ten || category.Ten || category.name;
                return (
                  <a
                    key={categoryId}
                    href={`/products?categoryId=${categoryId}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategoryClick(categoryId);
                    }}
                    title={categoryName}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-lg group-hover:scale-110 transition-transform">
                        {category.icon || '📦'}
                      </span>
                      <span className="flex-1">{categoryName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {category.soLuongSanPham !== undefined && (
                        <span className="text-xs text-gray-400">({category.soLuongSanPham})</span>
                      )}
                      <ChevronRight size={14} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                  </a>
                );
              })
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Chưa có danh mục nào
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Brands Dropdown - Chỉ hiển thị hình ảnh, không viền, không chữ */}
      {hoveredDropdown === 'brands' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed inset-0 z-[9999]"
          style={{
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none', // Không block mouse events, chỉ content block
            animation: 'fadeIn 0.2s ease-out'
          }}
          onMouseLeave={() => {
            // Delay để người dùng có thể di chuột quay lại
            hoverTimeoutRef.current = setTimeout(() => {
              setHoveredDropdown(null);
            }, 300);
          }}
          onClick={(e) => {
            // Click vào overlay để đóng
            if (e.target === e.currentTarget) {
              setHoveredDropdown(null);
            }
          }}
        >
          <div
            className="bg-white shadow-lg"
            style={{
              position: 'absolute',
              top: `${dropdownPosition.top}px`,
              left: 0,
              right: 0,
              width: '100vw',
              maxWidth: '100vw',
              maxHeight: `calc(100vh - ${dropdownPosition.top}px - 20px)`,
              overflowY: 'auto',
              animation: 'slideDownBrand 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              willChange: 'transform, opacity',
              pointerEvents: 'auto', // Chỉ content có thể nhận mouse events
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.stopPropagation();
              // Khi di chuột vào popup content, hủy timeout đóng và giữ popup mở
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }
              // Đảm bảo popup vẫn mở
              if (hoveredDropdown !== 'brands') {
                setHoveredDropdown('brands');
              }
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              // Delay khi rời chuột khỏi popup content
              hoverTimeoutRef.current = setTimeout(() => {
                setHoveredDropdown(null);
              }, 300);
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Container với padding */}
            <div className="w-full max-w-full px-4 sm:px-6 md:px-8 lg:px-12 py-6 md:py-8">
              {/* Brands Grid - Chỉ hình ảnh, tỷ lệ 16:9 */}
              {brands.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14 gap-4 md:gap-5 lg:gap-6">
                {brands
                  .filter((brand) => {
                    // Chỉ hiển thị brand có logo
                    const brandLogo = brand.logo || brand.Logo;
                    return brandLogo && brandLogo.trim() !== '';
                  })
                  .map((brand) => {
                    const brandId = brand.id || brand.ID || brand.IDThuongHieu;
                    const brandName = brand.ten || brand.Ten || brand.TenThuongHieu || brand.name || brand.tenThuongHieu;
                    const brandLogo = brand.logo || brand.Logo;
                    
                    // Xử lý logo URL
                    let logoUrl = null;
                    if (brandLogo) {
                      if (brandLogo.startsWith('http://') || brandLogo.startsWith('https://')) {
                        logoUrl = brandLogo;
                      } else {
                        const baseUrl = config.API_URL.replace('/api', '');
                        logoUrl = `${baseUrl}${brandLogo.startsWith('/') ? '' : '/'}${brandLogo}`;
                      }
                    }
                    
                    return (
                      <a
                        key={brandId}
                        href={`/products?brandId=${brandId}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleBrandClick(brandId);
                        }}
                        className="group relative flex items-center justify-center transition-opacity duration-200 hover:opacity-80"
                      >
                        {/* Container với tỷ lệ 16:9 */}
                        <div className="w-full aspect-video bg-white rounded-lg overflow-hidden flex items-center justify-center p-2">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt={brandName}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          ) : null}
                        </div>
                      </a>
                    );
                  })}
              </div>
            ) : null}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Cart Popup */}
      {showCartPopup && createPortal(
        <div
          ref={cartPopupRef}
          className="fixed bg-transparent"
          style={{
            zIndex: 10001,
            position: 'fixed',
            top: `${cartPopupPosition.top}px`,
            right: `${cartPopupPosition.right}px`,
            pointerEvents: 'auto',
            display: 'block',
            visibility: 'visible',
            opacity: 1,
            transition: 'none'
          }}
          onMouseEnter={handleCartMouseEnter}
          onMouseLeave={handleCartMouseLeave}
        >
          <div className="bg-white rounded-cute shadow-bubble border-2 border-primary-100 w-96 max-w-[90vw] max-h-[600px] flex flex-col animate-fade-in">
            {/* Header */}
            <div className="px-4 py-3 bg-primary-50 border-b-2 border-primary-100 rounded-t-cute flex items-center">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-primary-500" />
                <h3 className="text-base font-display font-bold text-gray-800">
                  GIỎ HÀNG ({cartItems.length})
                </h3>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {cartLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-500"></div>
                  <p className="mt-4 text-gray-600 font-body">Đang tải...</p>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart size={48} className="mx-auto mb-4 text-primary-300" />
                  <p className="text-gray-600 font-body">Giỏ hàng trống</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {cartItems.map((item) => {
                    const productId = item.sanPhamId || item.sanPham?.id || item.sanPham?.ID;
                    const productName = item.sanPham?.ten || item.sanPham?.Ten || item.tenSanPham || 'Sản phẩm';
                    const productDescription = item.sanPham?.moTa || item.sanPham?.MoTa || item.moTa || '';
                    // ✅ Sửa: Sử dụng hinhAnhUrl (chữ thường) như trong CartPage, kiểm tra nhiều trường hợp
                    const imagePath = item.sanPham?.hinhAnhUrl || item.sanPham?.hinhAnhURL || item.sanPham?.HinhAnhURL || item.sanPham?.HinhAnhUrl || item.hinhAnhUrl || item.hinhAnhURL;
                    const productImage = buildImageUrl(imagePath);
                    const quantity = item.soLuong || item.SoLuong || 1;
                    const price = item.donGia || item.DonGia || item.sanPham?.giaBan || item.sanPham?.GiaBan || 0;
                    const totalPrice = price * quantity;
                    const maxStock = item.sanPham?.soLuongTon || item.sanPham?.SoLuongTon || 999;

                    return (
                      <div key={productId} className="flex gap-3 pb-4 border-b border-primary-100 last:border-0 last:pb-0">
                        {/* Product Image */}
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <img
                            src={productImage}
                            alt={productName}
                            className="w-full h-full object-cover rounded-cute border border-primary-200 bg-gray-50"
                            onError={(e) => {
                              e.target.src = '/barbie.jpg';
                            }}
                            loading="lazy"
                          />
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          {/* Product Name */}
                          <div className="mb-2">
                            <h4 className="font-display font-bold text-gray-800 text-sm mb-1 line-clamp-1">{productName}</h4>
                            {productDescription && (
                              <p className="text-xs text-gray-500 line-clamp-1">{productDescription}</p>
                            )}
                          </div>
                          
                          {/* Price and Quantity - Căn chỉnh đồng đều */}
                          <div className="flex items-center justify-between">
                            <span className="font-display font-bold text-primary-500 text-sm">{totalPrice.toLocaleString('vi-VN')}₫</span>
                            
                            {/* Quantity Control */}
                            <div className="flex items-center border border-primary-200 rounded-cute bg-white overflow-hidden">
                              <button
                                onClick={() => handleUpdateQuantity(productId, quantity - 1)}
                                className="p-1.5 hover:bg-primary-50 text-gray-600 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={quantity <= 1}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="px-3 py-1 text-sm font-semibold text-gray-700 min-w-[2.5rem] text-center border-x border-primary-200">
                                {quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(productId, quantity + 1)}
                                className="p-1.5 hover:bg-primary-50 text-gray-600 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={quantity >= maxStock}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <>
                <div className="px-4 py-3 border-t-2 border-primary-100 bg-white">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 font-body">Tổng tiền:</span>
                    <span className="text-base font-display font-bold text-gray-800">{cartTotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 space-y-2 border-t-2 border-primary-100 bg-white rounded-b-cute">
                  <Link
                    to="/checkout"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary-400 hover:bg-primary-500 text-white text-sm font-display font-semibold rounded-cute transition-all shadow-soft hover:shadow-cute"
                    onClick={() => setShowCartPopup(false)}
                  >
                    <span>Tiến hành thanh toán</span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link
                    to="/products"
                    className="block w-full text-center text-sm text-gray-600 hover:text-primary-600 font-body transition-colors py-2"
                    onClick={() => setShowCartPopup(false)}
                  >
                    Tiếp tục mua sắm
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </nav>
  );
};

export default Navbar;