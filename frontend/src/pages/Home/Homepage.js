import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getProducts } from '../../api/productApi';

const Homepage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    categories: 4,
    customers: 150
  });

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      // getProducts() đã return response.data.data rồi
      // Cấu trúc: { products: [...], pagination: {...} }
      const data = await getProducts(1, '', 6);
      
      console.log('📦 Products data received:', data);
      
      if (data && data.products) {
        setFeaturedProducts(data.products.slice(0, 6));
        setStats(prev => ({ 
          ...prev, 
          totalProducts: data.pagination?.totalProducts || 0 
        }));
      }
    } catch (error) {
      console.error('❌ Error loading featured products:', error);
      // Fallback với dữ liệu mock nếu API không khả dụng
      setFeaturedProducts([
        { id: 1, tenSP: 'Búp bê Barbie', giaBan: 150000, hinhAnh: '/placeholder.jpg', soLuongTon: 50 },
        { id: 2, tenSP: 'Xe điều khiển', giaBan: 250000, hinhAnh: '/placeholder.jpg', soLuongTon: 30 },
        { id: 3, tenSP: 'Lego City', giaBan: 350000, hinhAnh: '/placeholder.jpg', soLuongTon: 20 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              🧸 Chào mừng đến với <span className="brand-name">ToyStore</span>
            </h1>
            <p className="hero-subtitle">
              Thế giới đồ chơi tuyệt vời dành cho bé yêu của bạn
            </p>
            <p className="welcome-message">
              {user ? (
                <>Xin chào <strong>{user.hoTen || user.tenDangNhap}</strong>! Khám phá những sản phẩm mới nhất 🎉</>
              ) : (
                'Khám phá hàng ngàn sản phẩm đồ chơi chất lượng cao'
              )}
            </p>
            
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-large">
                🛍️ Mua sắm ngay
              </Link>
              {!user && (
                <Link to="/register" className="btn btn-secondary btn-large">
                  📝 Đăng ký tài khoản
                </Link>
              )}
            </div>
          </div>
          
          <div className="hero-image">
            <div className="floating-toy toy-1">🚗</div>
            <div className="floating-toy toy-2">🧸</div>
            <div className="floating-toy toy-3">🎮</div>
            <div className="floating-toy toy-4">🪀</div>
            <div className="floating-toy toy-5">🎯</div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-icon">🎪</div>
            <div className="stat-number">{stats.totalProducts}+</div>
            <div className="stat-label">Sản phẩm</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">📦</div>
            <div className="stat-number">{stats.categories}</div>
            <div className="stat-label">Danh mục</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">😊</div>
            <div className="stat-number">{stats.customers}+</div>
            <div className="stat-label">Khách hàng</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">⭐</div>
            <div className="stat-number">4.8</div>
            <div className="stat-label">Đánh giá</div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="section-header">
          <h2>🌟 Sản phẩm nổi bật</h2>
          <p>Những món đồ chơi được yêu thích nhất</p>
        </div>

        {loading ? (
          <div className="loading-products">
            <div className="loading-spinner"></div>
            <p>Đang tải sản phẩm...</p>
          </div>
        ) : (
          <div className="featured-grid">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="featured-product-card"
                onClick={() => navigate(`/products/${product.id}`)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="product-image-wrapper">
                  <img 
                    src={product.hinhAnh || '/placeholder.jpg'} 
                    alt={product.tenSP}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOWNhM2FmIj7wn6eYPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                  <div className="product-overlay">
                    <div className="overlay-content">
                      <button className="view-btn">👁️ Xem chi tiết</button>
                    </div>
                  </div>
                </div>
                
                <div className="product-info">
                  <h3>{product.tenSP}</h3>
                  <div className="price-section">
                    <span className="price">{product.giaBan?.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="product-meta">
                    <span className="stock">📦 Còn {product.soLuongTon}</span>
                    {product.loaiSP && (
                      <span className="category">🏷️ {product.loaiSP.tenLoai}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="view-all-section">
          <Link to="/products" className="btn btn-outline">
            Xem tất cả sản phẩm →
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="section-header">
          <h2>🎯 Danh mục sản phẩm</h2>
          <p>Tìm đồ chơi phù hợp với lứa tuổi</p>
        </div>

        <div className="categories-grid">
          <div className="category-card" onClick={() => navigate('/products?category=educational')}>
            <div className="category-icon">🧠</div>
            <h3>Đồ chơi giáo dục</h3>
            <p>Phát triển trí tuệ</p>
          </div>
          <div className="category-card" onClick={() => navigate('/products?category=building')}>
            <div className="category-icon">🧱</div>
            <h3>Đồ chơi lắp ráp</h3>
            <p>Lego, xếp hình</p>
          </div>
          <div className="category-card" onClick={() => navigate('/products?category=dolls')}>
            <div className="category-icon">👸</div>
            <h3>Búp bê</h3>
            <p>Búp bê các loại</p>
          </div>
          <div className="category-card" onClick={() => navigate('/products?category=vehicles')}>
            <div className="category-icon">🚗</div>
            <h3>Xe mô hình</h3>
            <p>Xe đồ chơi</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>🎉 Sẵn sàng mua sắm?</h2>
          <p>Khám phá hàng ngàn sản phẩm đồ chơi chất lượng với giá tốt nhất</p>
          <div className="cta-actions">
            <Link to="/products" className="btn btn-primary btn-large">
              🛍️ Mua sắm ngay
            </Link>
            {!user && (
              <Link to="/register" className="btn btn-secondary-outline btn-large">
                📱 Tải ứng dụng
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;