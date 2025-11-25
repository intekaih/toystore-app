import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { productService, cartService } from '../services';
import { ShoppingBag, Sparkles, TrendingUp, Users, Star, ArrowRight, Zap, Clock, Shield, Truck, CreditCard, Headphones, Gift, Mail } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { ProductCard, Loading, Button } from '../components/ui';
import ProductQuickViewModal from '../components/ProductQuickViewModal.jsx';
import Toast from '../components/Toast.js';

const Homepage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 8, minutes: 43, seconds: 21 });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [stats, setStats] = useState({
    totalProducts: 0,
    categories: 4,
    customers: 150
  });

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadAllProducts();
    startCountdown();
  }, []);

  // Countdown timer cho Flash Sale
  const startCountdown = () => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          clearInterval(interval);
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  };

  const loadAllProducts = async () => {
    try {
      setLoading(true);
      
      // Load tất cả các loại sản phẩm song song
      // Note: Tất cả đều dùng 'newest' vì API có thể không hỗ trợ bestSeller/trending
      const [featuredRes, bestSellerRes, newArrivalRes, trendingRes] = await Promise.all([
        productService.getProducts({ page: 1, limit: 6, sortBy: 'newest', order: 'desc' }).catch(() => ({ success: false })),
        productService.getProducts({ page: 1, limit: 4, sortBy: 'newest', order: 'desc' }).catch(() => ({ success: false })),
        productService.getProducts({ page: 1, limit: 4, sortBy: 'newest', order: 'desc' }).catch(() => ({ success: false })),
        productService.getProducts({ page: 1, limit: 4, sortBy: 'newest', order: 'desc' }).catch(() => ({ success: false }))
      ]);

      // Xử lý kết quả
      const getProducts = (res) => {
        if (res.success && res.data) {
          return res.data.products || res.data || [];
        }
        return [];
      };

      const featured = getProducts(featuredRes);
      const bestSellersData = getProducts(bestSellerRes);
      const newArrivalsData = getProducts(newArrivalRes);
      const trendingData = getProducts(trendingRes);

      // Set products
      setFeaturedProducts(featured.slice(0, 6));
      setBestSellers(bestSellersData.length > 0 ? bestSellersData.slice(0, 4) : featured.slice(1, 5));
      setNewArrivals(newArrivalsData.length > 0 ? newArrivalsData.slice(0, 4) : featured.slice(0, 4));
      setTrendingProducts(trendingData.length > 0 ? trendingData.slice(0, 4) : featured.slice(2, 6));

      // Flash sale = best sellers với discount
      const flashSaleSource = bestSellersData.length > 0 ? bestSellersData : featured.slice(0, 4);
      setFlashSaleProducts(flashSaleSource.slice(0, 4).map((p) => ({
        ...p,
        originalPrice: Math.round((p.giaBan || p.GiaBan || 0) * 1.4), // Giả sử giảm 30%
        discount: 30
      })));

      // Set stats
      if (featuredRes.pagination) {
        setStats(prev => ({ 
          ...prev, 
          totalProducts: featuredRes.pagination.totalProducts || 0 
        }));
      }
    } catch (error) {
      console.error('Error loading products:', error);
      showToast(error.message || 'Không thể tải sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration });
  };

  const handleAddToCart = async (product) => {
    try {
      setAdding(true);
      const productId = product.id; // ✅ Sửa từ ID → id
      const response = await cartService.addToCart(productId, 1);

      if (response.success) {
        const productName = product.ten; // ✅ Sửa từ Ten → ten
        showToast(
          `Đã thêm ${productName} vào giỏ hàng`,
          'success',
          3000
        );
        
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
    
    const productName = product.ten; // ✅ Sửa từ Ten → ten
    showToast(`❤️ Đã thêm "${productName}" vào danh sách yêu thích!`, 'success', 3000);
    // TODO: Implement wishlist API call
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      showToast('🎉 Cảm ơn bạn đã đăng ký! Voucher 10% đã được gửi vào email của bạn.', 'success');
      setNewsletterEmail('');
    }
  };

  return (
    <MainLayout>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-rose-50 to-cream-100 py-20">
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

      {/* Flash Sale Section */}
      <section className="py-8 bg-gradient-to-r from-rose-400 via-primary-500 to-rose-400 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-cute relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Zap className="text-yellow-300 animate-pulse" size={32} />
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold">⚡ FLASH SALE - HÔM NAY THÔI!</h2>
                <p className="text-rose-100 text-sm">Giảm giá cực sốc, không bỏ lỡ!</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-cute border-2 border-white/30">
              <Clock size={20} />
              <span className="font-bold text-lg">
                Hết trong {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          {flashSaleProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {flashSaleProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="bg-white rounded-cute p-4 shadow-bubble hover:shadow-cute transition-all cursor-pointer group"
                >
                  <div className="relative mb-3">
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                      -{product.discount}%
                    </div>
                    <div className="aspect-square bg-gradient-to-br from-primary-50 to-rose-50 rounded-cute overflow-hidden">
                      <img
                        src={product.hinhAnhUrl || product.hinhAnhURL || '/barbie.jpg'}
                        alt={product.ten || product.Ten}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2">{product.ten || product.Ten}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-400 line-through text-xs">
                      {new Intl.NumberFormat('vi-VN').format(product.originalPrice)}đ
                    </span>
                    <span className="text-primary-600 font-bold text-lg">
                      {new Intl.NumberFormat('vi-VN').format(product.giaBan || product.GiaBan || 0)}đ
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400 text-xs">
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <span className="text-gray-600 ml-1">(128)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

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

      {/* Featured Collections */}
      <section className="py-16 container-cute">
        {/* Best Sellers */}
        <div className="mb-16">
          <div className="text-center mb-8 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="text-primary-500" size={28} />
              <h2 className="text-3xl font-display font-bold text-gray-800">🏆 Sản phẩm Bán Chạy Nhất</h2>
              <TrendingUp className="text-primary-500" size={28} />
            </div>
            <p className="text-gray-600">Những món đồ chơi được yêu thích nhất</p>
          </div>

          {loading ? (
            <Loading text="Đang tải sản phẩm..." />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {bestSellers.map((product) => (
                  <div key={product.id} onClick={() => navigate(`/products/${product.id}`)}>
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
                  size="md"
                  icon={<ArrowRight size={18} />}
                  onClick={() => navigate('/products?sortBy=bestSeller')}
                >
                  Xem thêm
                </Button>
              </div>
            </>
          )}
        </div>

        {/* New Arrivals */}
        <div className="mb-16">
          <div className="text-center mb-8 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="text-primary-500" size={28} />
              <h2 className="text-3xl font-display font-bold text-gray-800">🆕 Sản Phẩm Mới</h2>
              <Sparkles className="text-primary-500" size={28} />
            </div>
            <p className="text-gray-600">Những sản phẩm mới nhất tại ToyStore</p>
          </div>

          {loading ? (
            <Loading text="Đang tải sản phẩm..." />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {newArrivals.map((product) => (
                  <div key={product.id} onClick={() => navigate(`/products/${product.id}`)}>
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
                  size="md"
                  icon={<ArrowRight size={18} />}
                  onClick={() => navigate('/products?sortBy=newest')}
                >
                  Xem thêm
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Trending Now */}
        <div>
          <div className="text-center mb-8 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Zap className="text-primary-500" size={28} />
              <h2 className="text-3xl font-display font-bold text-gray-800">🔥 Đang Thịnh Hành</h2>
              <Zap className="text-primary-500" size={28} />
            </div>
            <p className="text-gray-600">Sản phẩm đang được tìm kiếm nhiều nhất</p>
          </div>

          {loading ? (
            <Loading text="Đang tải sản phẩm..." />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {trendingProducts.map((product) => (
                  <div key={product.id} onClick={() => navigate(`/products/${product.id}`)}>
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
                  size="md"
                  icon={<ArrowRight size={18} />}
                  onClick={() => navigate('/products?sortBy=trending')}
                >
                  Xem thêm
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

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

      {/* Trust & Credibility Section */}
      <section className="py-16 bg-gradient-to-br from-primary-50 via-rose-50 to-cream-50">
        <div className="container-cute">
          <h2 className="text-3xl font-display font-bold text-gray-800 text-center mb-12">
            🛡️ TẠI SAO CHỌN TOYSTORE?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="bg-white p-6 rounded-cute text-center hover:shadow-cute transition-all border-2 border-primary-100">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-bold text-gray-800 mb-2 text-sm">10,000+ Sản Phẩm</h3>
              <p className="text-xs text-gray-600">Chính Hãng</p>
            </div>
            <div className="bg-white p-6 rounded-cute text-center hover:shadow-cute transition-all border-2 border-primary-100">
              <Truck className="text-primary-500 mx-auto mb-3" size={32} />
              <h3 className="font-bold text-gray-800 mb-2 text-sm">🚚 Miễn Phí Vận Chuyển</h3>
              <p className="text-xs text-gray-600">Đơn Từ 50.000đ+</p>
            </div>
            <div className="bg-white p-6 rounded-cute text-center hover:shadow-cute transition-all border-2 border-primary-100">
              <Shield className="text-primary-500 mx-auto mb-3" size={32} />
              <h3 className="font-bold text-gray-800 mb-2 text-sm">🔒 An Toàn</h3>
              <p className="text-xs text-gray-600">100%</p>
            </div>
            <div className="bg-white p-6 rounded-cute text-center hover:shadow-cute transition-all border-2 border-primary-100">
              <Star className="text-yellow-400 mx-auto mb-3" size={32} fill="currentColor" />
              <h3 className="font-bold text-gray-800 mb-2 text-sm">⭐ 4.9/5 Sao</h3>
              <p className="text-xs text-gray-600">(12,483 reviews)</p>
            </div>
            <div className="bg-white p-6 rounded-cute text-center hover:shadow-cute transition-all border-2 border-primary-100">
              <CreditCard className="text-primary-500 mx-auto mb-3" size={32} />
              <h3 className="font-bold text-gray-800 mb-2 text-sm">💳 Nhiều Cách Thanh Toán</h3>
              <p className="text-xs text-gray-600">An Toàn</p>
            </div>
            <div className="bg-white p-6 rounded-cute text-center hover:shadow-cute transition-all border-2 border-primary-100">
              <Headphones className="text-primary-500 mx-auto mb-3" size={32} />
              <h3 className="font-bold text-gray-800 mb-2 text-sm">📞 Hỗ Trợ</h3>
              <p className="text-xs text-gray-600">24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Banner */}
      <section className="py-16 bg-gradient-to-r from-primary-400 via-primary-500 to-rose-400 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-cute relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-2">
              <Gift className="text-yellow-300" size={40} />
              <h2 className="text-3xl md:text-4xl font-display font-bold">
                🎁 NHẬN VOUCHER 10% NGAY HÔM NAY!
              </h2>
            </div>
            <p className="text-lg opacity-90">
              Đăng ký nhận thông tin khuyến mãi và ưu đãi độc quyền
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Nhập email của bạn..."
                className="flex-1 px-4 py-3 rounded-cute text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                icon={<Mail size={20} />}
                className="bg-white text-primary-600 hover:bg-primary-50"
              >
                Đăng ký
              </Button>
            </form>
            <p className="text-sm opacity-75">
              ☐ Tôi đồng ý nhận email từ ToyStore
            </p>
          </div>
        </div>
      </section>

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

      <ProductQuickViewModal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        product={quickViewProduct}
        onAddToCart={handleAddToCart}
        onFavorite={handleFavorite}
      />

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