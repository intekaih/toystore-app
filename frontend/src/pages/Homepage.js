import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProducts } from '../api/productApi.js';
import { addToCart } from '../api/cartApi.js';
import { ShoppingBag, Sparkles, TrendingUp, Users, Star, ArrowRight } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { ProductCard, Loading, Button } from '../components/ui';
import ProductQuickViewModal from '../components/ProductQuickViewModal.jsx';
import Toast from '../components/Toast.js';

const Homepage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
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
      // ✅ Sửa: truyền object params thay vì 3 tham số riêng lẻ
      const response = await getProducts({ 
        page: 1, 
        limit: 6,
        filter: 'newest'
      });
      
      if (response.success && response.data && response.data.products) {
        setFeaturedProducts(response.data.products.slice(0, 6));
        setStats(prev => ({ 
          ...prev, 
          totalProducts: response.data.pagination?.totalProducts || 0 
        }));
      }
    } catch (error) {
      console.error('Error loading featured products:', error);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration });
  };

  const handleAddToCart = async (product) => {
    // ✅ BỎ KIỂM TRA ĐĂNG NHẬP - Cho phép guest thêm vào giỏ hàng
    
    try {
      setAdding(true);
      const productId = product.ID || product.id || product.MaSP || product.maSP;
      
      // Thông tin sản phẩm cho guest user
      const productInfo = {
        name: product.Ten || product.ten || product.tenSP || product.TenSP,
        price: product.GiaBan || product.giaBan || product.gia || 0,
        image: product.HinhAnhURL || product.hinhAnhURL || product.image || '',
        stock: product.Ton || product.ton || product.soLuong || 999
      };
      
      const response = await addToCart(productId, 1, productInfo);

      if (response.success) {
        showToast(
          `Đã thêm ${productInfo.name} vào giỏ hàng`,
          'success',
          3000
        );
        
        // Nếu không đăng nhập, hiển thị thông báo thêm
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

  // 👁️ Xử lý xem nhanh sản phẩm
  const handleQuickView = (product) => {
    console.log('👁️ Quick view product:', product);
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  // ❤️ Xử lý thêm vào yêu thích
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
      {/* 🌸 Hero Section - Dễ thương */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-rose-50 to-cream-100 py-20">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-float">🧸</div>
        <div className="absolute top-32 right-20 text-5xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>🎀</div>
        <div className="absolute bottom-20 left-1/4 text-5xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>🎈</div>
        <div className="absolute bottom-32 right-1/3 text-4xl opacity-20 animate-float" style={{ animationDelay: '1.5s' }}>⭐</div>

        <div className="container-cute relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-slide-up">
              <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-800 leading-tight">
                Chào mừng đến với{' '}
                <span className="text-gradient-primary">ToyStore</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Thế giới đồ chơi tuyệt vời dành cho bé yêu của bạn
              </p>
              {user ? (
                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-cute shadow-soft w-fit">
                  <span className="text-2xl">👋</span>
                  <p className="text-gray-700">
                    Xin chào <span className="font-bold text-primary-600">{user.hoTen || user.tenDangNhap}</span>!
                  </p>
                </div>
              ) : null}
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  variant="primary" 
                  size="lg"
                  icon={<ShoppingBag size={20} />}
                  onClick={() => navigate('/products')}
                >
                  Mua sắm ngay
                </Button>
                {!user && (
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={() => navigate('/register')}
                  >
                    Đăng ký tài khoản
                  </Button>
                )}
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="relative hidden md:block">
              <div className="relative w-full h-96 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-rose-200 rounded-bubble opacity-20"></div>
                <div className="relative grid grid-cols-3 gap-4 p-8">
                  <div className="text-7xl animate-bounce-soft">🚗</div>
                  <div className="text-8xl animate-bounce-soft" style={{ animationDelay: '0.2s' }}>🧸</div>
                  <div className="text-7xl animate-bounce-soft" style={{ animationDelay: '0.4s' }}>🎮</div>
                  <div className="text-7xl animate-bounce-soft" style={{ animationDelay: '0.6s' }}>🪀</div>
                  <div className="text-8xl animate-bounce-soft" style={{ animationDelay: '0.8s' }}>🎯</div>
                  <div className="text-7xl animate-bounce-soft" style={{ animationDelay: '1s' }}>🎪</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 Stats Section */}
      <section className="py-12 bg-white border-y-2 border-primary-100">
        <div className="container-cute">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-rose-50 rounded-cute hover:shadow-cute transition-all">
              <div className="text-4xl mb-3">🎪</div>
              <div className="text-3xl font-bold text-gradient-primary">{stats.totalProducts}+</div>
              <div className="text-gray-600 font-medium mt-1">Sản phẩm</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-rose-50 to-primary-50 rounded-cute hover:shadow-cute transition-all">
              <div className="text-4xl mb-3">📦</div>
              <div className="text-3xl font-bold text-gradient-primary">{stats.categories}</div>
              <div className="text-gray-600 font-medium mt-1">Danh mục</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-rose-50 rounded-cute hover:shadow-cute transition-all">
              <div className="text-4xl mb-3">😊</div>
              <div className="text-3xl font-bold text-gradient-primary">{stats.customers}+</div>
              <div className="text-gray-600 font-medium mt-1">Khách hàng</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-rose-50 to-primary-50 rounded-cute hover:shadow-cute transition-all">
              <div className="text-4xl mb-3">⭐</div>
              <div className="text-3xl font-bold text-gradient-primary">4.8</div>
              <div className="text-gray-600 font-medium mt-1">Đánh giá</div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 Featured Products */}
      <section className="py-16 container-cute">
        <div className="text-center mb-12 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="text-primary-500" size={28} />
            <h2 className="text-4xl font-display font-bold text-gray-800">Sản phẩm nổi bật</h2>
            <Sparkles className="text-primary-500" size={28} />
          </div>
          <p className="text-lg text-gray-600">Những món đồ chơi được yêu thích nhất</p>
        </div>

        {loading ? (
          <Loading text="Đang tải sản phẩm..." />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {featuredProducts.map((product) => (
                <div key={product.ID} onClick={() => navigate(`/products/${product.ID}`)}>
                  <ProductCard 
                    product={product}
                    onAddToCart={handleAddToCart}
                    onQuickView={handleQuickView}
                    onFavorite={handleFavorite}
                  />
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button 
                variant="outline" 
                size="lg"
                icon={<ArrowRight size={20} />}
                onClick={() => navigate('/products')}
              >
                Xem tất cả sản phẩm
              </Button>
            </div>
          </>
        )}
      </section>

      {/* 🎯 Categories Section */}
      <section className="py-16 bg-gradient-to-br from-cream-50 via-primary-50 to-rose-50">
        <div className="container-cute">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-4xl font-display font-bold text-gray-800">Danh mục sản phẩm</h2>
            <p className="text-lg text-gray-600">Tìm đồ chơi phù hợp với lứa tuổi</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🧠', title: 'Đồ chơi giáo dục', desc: 'Phát triển trí tuệ', category: 'educational' },
              { icon: '🧱', title: 'Đồ chơi lắp ráp', desc: 'Lego, xếp hình', category: 'building' },
              { icon: '👸', title: 'Búp bê', desc: 'Búp bê các loại', category: 'dolls' },
              { icon: '🚗', title: 'Xe mô hình', desc: 'Xe đồ chơi', category: 'vehicles' },
            ].map((cat, idx) => (
              <div 
                key={idx}
                onClick={() => navigate(`/products?category=${cat.category}`)}
                className="bg-white p-8 rounded-bubble text-center hover:shadow-bubble hover:-translate-y-2 transition-all cursor-pointer border-2 border-primary-100 group"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{cat.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{cat.title}</h3>
                <p className="text-gray-600">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🎉 CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-400 via-primary-500 to-rose-400 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-cute text-center relative z-10 space-y-6">
          <h2 className="text-4xl md:text-5xl font-display font-bold">Sẵn sàng mua sắm?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Khám phá hàng ngàn sản phẩm đồ chơi chất lượng với giá tốt nhất
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <button
              onClick={() => navigate('/products')}
              className="px-8 py-4 bg-white text-primary-600 font-bold rounded-cute shadow-cute hover:shadow-bubble hover:-translate-y-1 transition-all text-lg"
            >
              🛍️ Mua sắm ngay
            </button>
            {!user && (
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-cute hover:bg-white hover:text-primary-600 transition-all text-lg"
              >
                📝 Đăng ký ngay
              </button>
            )}
          </div>
        </div>
      </section>

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
    </MainLayout>
  );
};

export default Homepage;