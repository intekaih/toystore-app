import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * 🎯 Category Navigation Bar - Menu bar chuyên nghiệp với dropdown
 * Tone màu hồng sữa cute, chiều cao tối thiểu
 */
const CategoryNavigationBar = () => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredMenu, setHoveredMenu] = useState(null); // 'categories' | 'brands' | null
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const categoryButtonRef = useRef(null);
  const brandButtonRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  // Đo chiều cao navbar để đặt top chính xác
  useEffect(() => {
    const measureNavbar = () => {
      const navbar = document.querySelector('nav');
      if (navbar) {
        const height = navbar.offsetHeight;
        setNavbarHeight(height);
        console.log('📏 Navbar height:', height);
      }
    };

    // Đo khi component mount
    measureNavbar();

    // Đo lại khi resize
    window.addEventListener('resize', measureNavbar);
    return () => window.removeEventListener('resize', measureNavbar);
  }, []);

  // Tính toán vị trí dropdown khi hover - với khoảng cách cố định
  useEffect(() => {
    let animationFrameId = null;
    const GAP = 8; // Khoảng cách cố định 8px

    const updateDropdownPosition = () => {
      if (hoveredMenu === 'categories' && categoryButtonRef.current) {
        const rect = categoryButtonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + GAP, // Khoảng cách cố định từ bottom của button
          left: rect.left,
          width: rect.width
        });
      } else if (hoveredMenu === 'brands' && brandButtonRef.current) {
        const rect = brandButtonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + GAP, // Khoảng cách cố định từ bottom của button
          left: rect.left,
          width: rect.width
        });
      }
    };

    const handleScroll = () => {
      // Dùng requestAnimationFrame để cập nhật mượt mà
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(updateDropdownPosition);
    };

    const handleResize = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(updateDropdownPosition);
    };

    if (hoveredMenu) {
      // Cập nhật ngay lập tức khi hover
      updateDropdownPosition();

      // Lắng nghe scroll và resize với requestAnimationFrame
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);

      // Cập nhật định kỳ để đảm bảo vị trí chính xác (mỗi 100ms)
      const intervalId = setInterval(updateDropdownPosition, 100);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        clearInterval(intervalId);
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, [hoveredMenu]);

  useEffect(() => {
    loadData();
  }, []);

  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setHoveredMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Đang tải danh mục và thương hiệu...');

      const [categoriesRes, brandsRes] = await Promise.all([
        productService.getCategories().catch((err) => {
          console.error('❌ Lỗi load categories:', err);
          return { success: false, error: err.message };
        }),
        productService.getBrands().catch((err) => {
          console.error('❌ Lỗi load brands:', err);
          return { success: false, error: err.message };
        })
      ]);

      console.log('📦 Categories response:', categoriesRes);
      console.log('🏷️ Brands response:', brandsRes);

      // Xử lý categories
      if (categoriesRes.success && categoriesRes.data) {
        const cats = Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : categoriesRes.data.categories || [];
        console.log(`✅ Loaded ${cats.length} categories:`, cats);
        setCategories(cats);
      } else {
        console.warn('⚠️ Categories không có dữ liệu:', categoriesRes);
        setCategories([]);
      }

      // Xử lý brands
      if (brandsRes.success && brandsRes.data) {
        const brs = Array.isArray(brandsRes.data)
          ? brandsRes.data
          : brandsRes.data.brands || [];
        console.log(`✅ Loaded ${brs.length} brands:`, brs);
        setBrands(brs);
      } else {
        console.warn('⚠️ Brands không có dữ liệu:', brandsRes);
        setBrands([]);
      }
    } catch (error) {
      console.error('❌ Error loading navigation data:', error);
      setCategories([]);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?categoryId=${categoryId}`);
    setHoveredMenu(null);
  };

  const handleBrandClick = (brandId) => {
    navigate(`/products?brandId=${brandId}`);
    setHoveredMenu(null);
  };

  const handleMenuClick = (type) => {
    switch (type) {
      case 'new':
        navigate('/products?sortBy=newest');
        break;
      case 'bestseller':
        navigate('/products?sortBy=bestSeller');
        break;
      case 'model':
        navigate('/products?categoryId=4'); // Giả sử Mô hình có categoryId=4
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div
        className="sticky z-40 bg-white border-b border-primary-200 h-12"
        style={{
          top: navbarHeight || 0,
          marginTop: 0
        }}
      >
        <div className="container-cute h-full flex items-center justify-center">
          <div className="spinner-cute w-5 h-5"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dropdownRef}
      className="sticky z-40 bg-white border-b border-primary-200 shadow-soft h-12"
      style={{
        overflow: 'visible',
        position: 'sticky',
        top: navbarHeight || 0,
        marginTop: 0
      }}
    >
      <div className="container-cute h-full" style={{ overflow: 'visible', position: 'relative' }}>
        {/* Menu bar với overflow-x-auto chỉ cho menu items - NHƯNG không clip dropdown */}
        <div
          className="flex items-center h-full gap-1 scrollbar-hide"
          style={{
            position: 'relative',
            overflowX: 'auto',
            overflowY: 'visible' // ✅ QUAN TRỌNG: Cho phép dropdown hiển thị
          }}
        >
          {/* Danh mục sản phẩm - với dropdown */}
          <div
            className="relative h-full"
            style={{
              position: 'relative',
              zIndex: hoveredMenu === 'categories' ? 10000 : 'auto',
              overflow: 'visible' // ✅ Đảm bảo không clip
            }}
            onMouseEnter={() => {
              console.log('🖱️ Mouse enter categories menu');
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }
              setHoveredMenu('categories');
            }}
            onMouseLeave={() => {
              console.log('🖱️ Mouse leave categories menu');
              // Delay nhỏ để cho phép di chuột vào dropdown
              hoverTimeoutRef.current = setTimeout(() => {
                setHoveredMenu(null);
              }, 200);
            }}
          >
            <button
              ref={categoryButtonRef}
              className="h-full px-4 text-sm font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center gap-1"
              onClick={() => {
                // Toggle dropdown khi click
                setHoveredMenu(hoveredMenu === 'categories' ? null : 'categories');
              }}
            >
              Danh mục sản phẩm
              <ChevronDown size={16} className={`transition-transform ${hoveredMenu === 'categories' ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown sẽ được render bằng Portal */}
          </div>

          {/* Thương Hiệu - với dropdown */}
          <div
            className="relative h-full"
            style={{
              position: 'relative',
              zIndex: hoveredMenu === 'brands' ? 10000 : 'auto',
              overflow: 'visible' // ✅ Đảm bảo không clip
            }}
            onMouseEnter={() => {
              console.log('🖱️ Mouse enter brands menu');
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }
              setHoveredMenu('brands');
            }}
            onMouseLeave={() => {
              console.log('🖱️ Mouse leave brands menu');
              // Delay nhỏ để cho phép di chuột vào dropdown
              hoverTimeoutRef.current = setTimeout(() => {
                setHoveredMenu(null);
              }, 200);
            }}
          >
            <button
              ref={brandButtonRef}
              className="h-full px-4 text-sm font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center gap-1"
              onClick={() => {
                setHoveredMenu(hoveredMenu === 'brands' ? null : 'brands');
              }}
            >
              Thương Hiệu
              <ChevronDown size={16} className={`transition-transform ${hoveredMenu === 'brands' ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown sẽ được render bằng Portal */}
          </div>

          {/* Hàng mới - click trực tiếp */}
          <button
            onClick={() => handleMenuClick('new')}
            className="h-full px-4 text-sm font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all whitespace-nowrap"
          >
            Hàng mới
          </button>

          {/* Bán Chạy - click trực tiếp */}
          <button
            onClick={() => handleMenuClick('bestseller')}
            className="h-full px-4 text-sm font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all whitespace-nowrap"
          >
            Bán Chạy
          </button>

          {/* Mô hình - click trực tiếp */}
          <button
            onClick={() => handleMenuClick('model')}
            className="h-full px-4 text-sm font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all whitespace-nowrap"
          >
            Mô hình
          </button>
        </div>
      </div>

      {/* Render dropdowns bằng Portal để tránh bị clip bởi overflow */}
      {hoveredMenu === 'categories' && createPortal(
        <div
          data-dropdown="categories"
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
            transition: 'none' // Không dùng transition để cập nhật vị trí mượt mà
          }}
          onMouseEnter={() => {
            console.log('🖱️ Mouse enter categories dropdown (Portal)');
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
            setHoveredMenu('categories');
          }}
          onMouseLeave={() => {
            console.log('🖱️ Mouse leave categories dropdown (Portal)');
            setHoveredMenu(null);
          }}
        >
          <div
            className="bg-white rounded-cute shadow-bubble border-2 border-primary-100 min-w-[280px] max-w-[90vw] max-h-[400px] overflow-y-auto py-2 animate-fade-in category-dropdown-scrollbar"
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

      {hoveredMenu === 'brands' && createPortal(
        <div
          data-dropdown="brands"
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
            transition: 'none' // Không dùng transition để cập nhật vị trí mượt mà
          }}
          onMouseEnter={() => {
            console.log('🖱️ Mouse enter brands dropdown (Portal)');
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
            setHoveredMenu('brands');
          }}
          onMouseLeave={() => {
            console.log('🖱️ Mouse leave brands dropdown (Portal)');
            setHoveredMenu(null);
          }}
        >
          <div
            className="bg-white rounded-cute shadow-bubble border-2 border-primary-100 min-w-[200px] max-w-[90vw] max-h-[400px] overflow-y-auto py-2 animate-fade-in category-dropdown-scrollbar"
            style={{
              zIndex: 10000,
              position: 'relative',
              display: 'block',
              visibility: 'visible',
              opacity: 1
            }}
          >
            {brands.length > 0 ? (
              brands.map((brand) => {
                const brandId = brand.id || brand.ID || brand.IDThuongHieu;
                const brandName = brand.ten || brand.Ten || brand.TenThuongHieu || brand.name;
                return (
                  <a
                    key={brandId}
                    href={`/products?brandId=${brandId}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleBrandClick(brandId);
                    }}
                    title={brandName}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all flex items-center justify-between group"
                  >
                    <span className="flex-1">{brandName}</span>
                    <div className="flex items-center gap-2">
                      {brand.soLuongSanPham !== undefined && (
                        <span className="text-xs text-gray-400">({brand.soLuongSanPham})</span>
                      )}
                      <ChevronRight size={14} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                  </a>
                );
              })
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Chưa có thương hiệu nào
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default CategoryNavigationBar;
