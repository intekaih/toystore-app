import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { productService, cartService, bannerService } from '../services';
import config from '../config';
import { ShoppingCart, ShoppingBag, Sparkles, TrendingUp, Users, Star, ArrowRight, Zap, Clock, Shield, Truck, CreditCard, Headphones, Gift, Mail } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { ProductCard, Loading, Button, OptimizedImage } from '../components/ui';
import ProductQuickViewModal from '../components/ProductQuickViewModal.jsx';
import Toast from '../components/Toast.js';
import LeaderboardBanner from '../components/LeaderboardBanner.jsx';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import './Homepage.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

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
    customers: 0,
    averageRating: 0
  });
  const [banners, setBanners] = useState([]);
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  const [bannerImagesLoaded, setBannerImagesLoaded] = useState({});
  const [hoveredProducts, setHoveredProducts] = useState({}); // Track hover state cho mỗi product

  const navigate = useNavigate();
  const { user } = useAuth();
  const swiperRef = useRef(null);

  // Scroll Reveal Hooks cho các sections
  const [flashSaleRef, isFlashSaleVisible] = useScrollReveal({ threshold: 0.1, rootMargin: '-50px' });
  const [bestSellersRef, isBestSellersVisible] = useScrollReveal({ threshold: 0.1, rootMargin: '-50px' });
  const [newArrivalsRef, isNewArrivalsVisible] = useScrollReveal({ threshold: 0.1, rootMargin: '-50px' });
  const [trendingRef, isTrendingVisible] = useScrollReveal({ threshold: 0.1, rootMargin: '-50px' });
  const [featuresRef, isFeaturesVisible] = useScrollReveal({ threshold: 0.1, rootMargin: '-50px' });
  const [newsletterRef, isNewsletterVisible] = useScrollReveal({ threshold: 0.1, rootMargin: '-50px' });

  // ✅ Helper function để build image URL
  const buildImageUrl = (imagePath) => {
    if (!imagePath) return '/barbie.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `${config.API_BASE_URL}${imagePath}`;
    if (!imagePath.startsWith('/')) return `${config.API_BASE_URL}/uploads/${imagePath}`;
    return '/barbie.jpg';
  };

  // ✅ Helper function để lấy ảnh chính và ảnh hover từ product
  const getProductImages = (product) => {
    const productImages = product.hinhAnhs || product.HinhAnhs || product.images || [];
    const sortedImages = Array.isArray(productImages) && productImages.length > 0
      ? productImages
          .sort((a, b) => (a.thuTu || a.ThuTu || 0) - (b.thuTu || b.ThuTu || 0))
          .map(img => {
            const url = img.duongDanHinhAnh || img.DuongDanHinhAnh || img.url || img;
            return typeof url === 'string' ? buildImageUrl(url) : buildImageUrl(url?.duongDanHinhAnh || url?.DuongDanHinhAnh || '');
          })
      : [];
    
    const imgDefault = sortedImages.length > 0 
      ? sortedImages[0] 
      : buildImageUrl(product.hinhAnhUrl || product.hinhAnhURL || product.HinhAnhURL || product.hinhAnh || product.HinhAnh || product.image);
    
    const imgHover = sortedImages.length > 1 ? sortedImages[1] : null;
    
    return { imgDefault, imgHover };
  };

  // ✅ Handlers cho hover - dùng unique key kết hợp section và product id
  const handleProductMouseEnter = (productId, sectionName, index) => {
    const uniqueKey = `${sectionName}-${productId}-${index}`;
    setHoveredProducts(prev => ({ ...prev, [uniqueKey]: true }));
  };

  const handleProductMouseLeave = (productId, sectionName, index) => {
    const uniqueKey = `${sectionName}-${productId}-${index}`;
    setHoveredProducts(prev => ({ ...prev, [uniqueKey]: false }));
  };

  // ✅ Helper để get hover state với unique key
  const getHoverState = (productId, sectionName, index) => {
    const uniqueKey = `${sectionName}-${productId}-${index}`;
    return hoveredProducts[uniqueKey] || false;
  };

  useEffect(() => {
    loadAllProducts();
    startCountdown();
    loadBanners();
    loadPublicStats();
  }, []);

  // Preload banner đầu tiên để tăng tốc độ load
  useEffect(() => {
    if (banners.length > 0) {
      const firstBanner = banners[0];
      if (firstBanner?.imageUrl) {
        const img = new Image();
        img.src = firstBanner.imageUrl;
        img.onload = () => {
          setBannerImagesLoaded(prev => ({ ...prev, [firstBanner.id]: true }));
        };
      }
    }
  }, [banners]);

  const loadBanners = async () => {
    try {
      const response = await bannerService.getActiveBanners();
      let mappedBanners = [];
      
      if (response.success && response.data) {
        // Map từ API format sang format frontend
        mappedBanners = response.data.banners.map(b => {
          // ✅ XỬ LÝ URL: Nếu là đường dẫn tương đối, thêm API_BASE_URL
          let imageUrl = b.hinhAnhUrl;
          if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:image/')) {
            // Nếu là đường dẫn tương đối (/uploads/banner/...), thêm API base URL
            if (imageUrl.startsWith('/uploads/')) {
              imageUrl = `${config.API_BASE_URL}${imageUrl}`;
            }
          }
          
          return {
            id: b.id,
            imageUrl: imageUrl,
            link: b.link,
            order: b.thuTu,
            type: 'image'
          };
        });
      }
      
      // Thêm leaderboard banner vào đầu danh sách
      mappedBanners.unshift({
        id: 'leaderboard-banner',
        type: 'leaderboard',
        order: 0
      });
      
      setBanners(mappedBanners);
    } catch (error) {
      console.error('Error loading banners:', error);
      // Khi có lỗi, vẫn thêm leaderboard banner
      setBanners([{
        id: 'leaderboard-banner',
        type: 'leaderboard',
        order: 0
      }]);
    }
  };

  const loadPublicStats = async () => {
    try {
      const response = await productService.getPublicStats();
      if (response.success && response.data) {
        setStats(prev => ({
          ...prev,
          customers: response.data.totalCustomers || 0,
          averageRating: response.data.averageRating || 0
        }));
      }
    } catch (error) {
      console.error('Error loading public stats:', error);
      // Giữ giá trị mặc định nếu có lỗi
    }
  };

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
      const [featuredRes, bestSellerRes, newArrivalRes, trendingRes] = await Promise.all([
        productService.getProducts({ page: 1, limit: 6, filter: 'newest' }).catch(() => ({ success: false })),
        productService.getProducts({ page: 1, limit: 4, filter: 'bestSeller' }).catch(() => ({ success: false })),
        productService.getProducts({ page: 1, limit: 4, filter: 'newest' }).catch(() => ({ success: false })),
        productService.getProducts({ page: 1, limit: 4, filter: 'newest' }).catch(() => ({ success: false }))
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
        
        // ✅ Dispatch event để Navbar cập nhật badge
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
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

  const handleBuyNow = async (product) => {
    try {
      setAdding(true);
      const productId = product.id;
      const response = await cartService.addToCart(productId, 1);

      if (response.success) {
        const productName = product.ten;
        showToast(
          `Đã thêm ${productName} vào giỏ hàng`,
          'success',
          2000
        );
        
        // ✅ Dispatch event để Navbar cập nhật badge
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        // Navigate to cart
        navigate('/cart');
      }
    } catch (error) {
      console.error('❌ Lỗi mua ngay:', error);
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
              
              <div className="flex flex-wrap items-center gap-6 pt-4">
                {/* Customer Count */}
                <div className="flex items-center gap-3">
                  <span className="text-4xl">😊</span>
                  <div>
                    <p className="text-2xl font-bold text-rose-600">
                      {stats.customers || 0}+
                    </p>
                    <p className="text-gray-700 text-sm font-medium">Khách hàng</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <span className="text-4xl">⭐</span>
                  <div>
                    <p className="text-2xl font-bold text-rose-600">
                      {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '4.8'}
                    </p>
                    <p className="text-gray-700 text-sm font-medium">Đánh giá</p>
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  size="lg"
                  icon={<ShoppingCart size={20} />}
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

            {banners.length > 0 && (
              <div className="relative hidden md:block">
                <div 
                  className="relative w-full h-96"
                  onMouseEnter={() => setIsBannerHovered(true)}
                  onMouseLeave={() => setIsBannerHovered(false)}
                >
                  <Swiper
                    onSwiper={(swiper) => {
                      swiperRef.current = swiper;
                    }}
                    modules={[Navigation, Pagination, Autoplay, EffectFade]}
                    spaceBetween={0}
                    slidesPerView={1}
                    pagination={{
                      clickable: true,
                      bulletClass: 'swiper-pagination-bullet-custom',
                    }}
                    autoplay={{
                      delay: 5000,
                      disableOnInteraction: false,
                    }}
                    effect="fade"
                    fadeEffect={{
                      crossFade: true
                    }}
                    loop={banners.length > 1}
                    className="banner-swiper rounded-bubble overflow-hidden h-full"
                  >
                    {banners.map((banner, index) => (
                      <SwiperSlide key={banner.id}>
                        {banner.type === 'leaderboard' ? (
                          <LeaderboardBanner />
                        ) : (
                          <div className="relative w-full h-full bg-gradient-to-br from-primary-100 to-rose-100 overflow-hidden group cursor-pointer" onClick={() => navigate(banner.link || '/products')}>
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-20"></div>
                            {/* Image with Ken Burns Effect */}
                            <div className="banner-image-wrapper w-full h-full">
                              <OptimizedImage
                                src={banner.imageUrl}
                                alt={`Banner ${banner.order}`}
                                aspectRatio="16/9"
                                objectFit="cover"
                                sizes="100vw"
                                priority={index === 0}
                                className="banner-image"
                                fallback="/barbie.jpg"
                              />
                            </div>
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-primary-400/0 group-hover:bg-primary-400/20 transition-all duration-500 blur-2xl -z-10"></div>
                          </div>
                        )}
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  <button 
                    onClick={() => swiperRef.current?.slidePrev()}
                    className={`swiper-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all ${isBannerHovered ? 'opacity-100' : 'opacity-0'}`}
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={20} className="text-gray-800" />
                  </button>
                  <button 
                    onClick={() => swiperRef.current?.slideNext()}
                    className={`swiper-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all ${isBannerHovered ? 'opacity-100' : 'opacity-0'}`}
                    aria-label="Next slide"
                  >
                    <ChevronRight size={20} className="text-gray-800" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Flash Sale Section */}
      <section ref={flashSaleRef} className={`py-8 bg-gradient-to-r from-rose-400 via-primary-500 to-rose-400 text-white relative overflow-hidden scroll-reveal scroll-reveal-slide-left ${isFlashSaleVisible ? 'revealed' : ''}`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-cute relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Zap className="text-yellow-300 animate-pulse" size={32} />
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold"> FLASH SALE - HÔM NAY THÔI!</h2>
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
                    <div 
                      className="aspect-square bg-gradient-to-br from-primary-50 to-rose-50 rounded-cute overflow-hidden relative"
                      onMouseEnter={() => handleProductMouseEnter(product.id, 'flashSale', flashSaleProducts.indexOf(product))}
                      onMouseLeave={() => handleProductMouseLeave(product.id, 'flashSale', flashSaleProducts.indexOf(product))}
                    >
                      {(() => {
                        const { imgDefault, imgHover } = getProductImages(product);
                        const isHover = getHoverState(product.id, 'flashSale', flashSaleProducts.indexOf(product));
                        return (
                          <img
                            src={isHover && imgHover ? imgHover : imgDefault}
                            alt={product.ten || product.Ten}
                            className="w-full h-full object-cover transition-opacity duration-300"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => { e.target.src = '/barbie.jpg'; }}
                          />
                        );
                      })()}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2">{product.ten || product.Ten}</h3>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-primary-600 font-bold text-lg">
                        {new Intl.NumberFormat('vi-VN').format(product.giaBan || product.GiaBan || 0)}đ
                      </span>
                      <span className="text-gray-400 line-through text-xs">
                        {new Intl.NumberFormat('vi-VN').format(product.originalPrice)}đ
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow(product);
                        }}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-semibold text-base px-3 py-1.5 rounded-lg transition-all"
                      >
                        Mua ngay
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-600 hover:bg-primary-600 hover:text-white transition-all"
                        title="Thêm vào giỏ"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400 text-xs">
                    {[...Array(5)].map((_, index) => {
                      const rating = product.diemTrungBinh || product.DiemTrungBinh || 0;
                      const filled = index < Math.round(rating);
                      return (
                        <Star 
                          key={index} 
                          size={12} 
                          fill={filled ? "currentColor" : "none"}
                          className={filled ? "" : "text-gray-300"}
                        />
                      );
                    })}
                    <span className="text-gray-600 ml-1">
                      ({product.tongSoDanhGia || product.TongSoDanhGia || 0})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Collections */}
      <section className="mb-6 md:mb-8 container-cute">
        {/* Best Sellers */}
        <div ref={bestSellersRef} className={`mb-6 md:mb-8 bg-gradient-to-br from-primary-50 via-rose-50 to-cream-50 rounded-cute p-6 md:p-8 relative overflow-hidden scroll-reveal scroll-reveal-scale ${isBestSellersVisible ? 'revealed' : ''}`}>
          <div className="absolute top-5 left-5 text-5xl opacity-20 animate-float">🏆</div>
          <div className="absolute top-10 right-10 text-4xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>🎯</div>
          <div className="absolute bottom-10 left-1/4 text-4xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>🎁</div>
          <div className="absolute bottom-5 right-1/3 text-3xl opacity-20 animate-float" style={{ animationDelay: '1.5s' }}>⭐</div>
          <div className="relative z-10">
          <div className="flex items-center justify-between px-1 pb-4 pt-5">
            <h2 className="text-gray-800 text-2xl font-bold leading-tight tracking-tight">
              🏆 Sản phẩm Bán Chạy Nhất
            </h2>
            <button
              onClick={() => navigate('/products?sortBy=bestSeller')}
              className="text-primary-600 text-sm font-bold hover:underline"
            >
              Xem tất cả
            </button>
          </div>

          {loading ? (
            <Loading text="Đang tải sản phẩm..." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {bestSellers.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-3 rounded-xl bg-white p-3 group border border-transparent hover:border-primary-200 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div 
                    className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden"
                    onMouseEnter={() => handleProductMouseEnter(product.id, 'bestSellers', bestSellers.indexOf(product))}
                    onMouseLeave={() => handleProductMouseLeave(product.id, 'bestSellers', bestSellers.indexOf(product))}
                  >
                    {(() => {
                      const { imgDefault, imgHover } = getProductImages(product);
                      const isHover = getHoverState(product.id, 'bestSellers', bestSellers.indexOf(product));
                      return (
                        <img
                          src={isHover && imgHover ? imgHover : imgDefault}
                          alt={product.ten || product.Ten}
                          className="w-full h-full object-cover rounded-lg transition-opacity duration-300"
                          loading="lazy"
                          onError={(e) => { e.target.src = '/barbie.jpg'; }}
                        />
                      );
                    })()}
                  </div>
                  <p className="text-gray-800 text-base font-medium truncate group-hover:text-primary-600 transition-colors">
                    {product.ten || product.Ten}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {product.loaiSP?.ten || product.loaiSP?.Ten || product.LoaiSP?.Ten || product.LoaiSP?.ten || product.tenLoai || product.TenLoai || product.category || product.danhMuc || 'Đồ chơi'}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-800 text-lg font-bold">
                      {new Intl.NumberFormat('vi-VN').format(product.giaBan || product.GiaBan || 0)}₫
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await handleBuyNow(product);
                        }}
                        className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-all"
                      >
                        Mua ngay
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 text-gray-600 hover:bg-primary-600 hover:text-white transition-all"
                        title="Thêm vào giỏ"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>

        {/* New Arrivals */}
        <div ref={newArrivalsRef} className={`mb-6 md:mb-8 bg-gradient-to-br from-cream-50 via-primary-50 to-rose-50 rounded-cute p-6 md:p-8 relative overflow-hidden scroll-reveal scroll-reveal-slide-right ${isNewArrivalsVisible ? 'revealed' : ''}`}>
          <div className="absolute top-5 left-5 text-5xl opacity-20 animate-float">🆕</div>
          <div className="absolute top-10 right-10 text-4xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>🎈</div>
          <div className="absolute bottom-10 left-1/4 text-4xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>🎨</div>
          <div className="absolute bottom-5 right-1/3 text-3xl opacity-20 animate-float" style={{ animationDelay: '1.5s' }}>✨</div>
          <div className="relative z-10">
            <div className="flex items-center justify-between px-1 pb-4 pt-5">
            <h2 className="text-gray-800 text-2xl font-bold leading-tight tracking-tight">
              🆕 Sản Phẩm Mới
            </h2>
            <button
              onClick={() => navigate('/products?sortBy=newest')}
              className="text-primary-600 text-sm font-bold hover:underline"
            >
              Xem tất cả
            </button>
          </div>

          {loading ? (
            <Loading text="Đang tải sản phẩm..." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {newArrivals.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-3 rounded-xl bg-white p-3 group border border-transparent hover:border-primary-200 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div 
                    className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden"
                    onMouseEnter={() => handleProductMouseEnter(product.id, 'newArrivals', newArrivals.indexOf(product))}
                    onMouseLeave={() => handleProductMouseLeave(product.id, 'newArrivals', newArrivals.indexOf(product))}
                  >
                    {(() => {
                      const { imgDefault, imgHover } = getProductImages(product);
                      const isHover = getHoverState(product.id, 'newArrivals', newArrivals.indexOf(product));
                      return (
                        <img
                          src={isHover && imgHover ? imgHover : imgDefault}
                          alt={product.ten || product.Ten}
                          className="w-full h-full object-cover rounded-lg transition-opacity duration-300"
                          loading="lazy"
                          onError={(e) => { e.target.src = '/barbie.jpg'; }}
                        />
                      );
                    })()}
                  </div>
                  <p className="text-gray-800 text-base font-medium truncate group-hover:text-primary-600 transition-colors">
                    {product.ten || product.Ten}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {product.loaiSP?.ten || product.loaiSP?.Ten || product.LoaiSP?.Ten || product.LoaiSP?.ten || product.tenLoai || product.TenLoai || product.category || product.danhMuc || 'Đồ chơi'}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-800 text-lg font-bold">
                      {new Intl.NumberFormat('vi-VN').format(product.giaBan || product.GiaBan || 0)}₫
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await handleBuyNow(product);
                        }}
                        className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-all"
                      >
                        Mua ngay
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 text-gray-600 hover:bg-primary-600 hover:text-white transition-all"
                        title="Thêm vào giỏ"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>

        {/* Trending Now */}
        <div ref={trendingRef} className={`bg-gradient-to-br from-rose-50 via-cream-50 to-primary-50 rounded-cute p-6 md:p-8 relative overflow-hidden scroll-reveal scroll-reveal-rotate ${isTrendingVisible ? 'revealed' : ''}`}>
          <div className="absolute top-5 left-5 text-5xl opacity-20 animate-float">🔥</div>
          <div className="absolute top-10 right-10 text-4xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>🚀</div>
          <div className="absolute bottom-10 left-1/4 text-4xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>💫</div>
          <div className="absolute bottom-5 right-1/3 text-3xl opacity-20 animate-float" style={{ animationDelay: '1.5s' }}>🌟</div>
          <div className="relative z-10">
          <div className="flex items-center justify-between px-1 pb-4 pt-5">
            <h2 className="text-gray-800 text-2xl font-bold leading-tight tracking-tight">
              🔥 Đang Thịnh Hành
            </h2>
            <button
              onClick={() => navigate('/products?sortBy=trending')}
              className="text-primary-600 text-sm font-bold hover:underline"
            >
              Xem tất cả
            </button>
          </div>

          {loading ? (
            <Loading text="Đang tải sản phẩm..." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {trendingProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-3 rounded-xl bg-white p-3 group border border-transparent hover:border-primary-200 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div 
                    className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden"
                    onMouseEnter={() => handleProductMouseEnter(product.id, 'trendingProducts', trendingProducts.indexOf(product))}
                    onMouseLeave={() => handleProductMouseLeave(product.id, 'trendingProducts', trendingProducts.indexOf(product))}
                  >
                    {(() => {
                      const { imgDefault, imgHover } = getProductImages(product);
                      const isHover = getHoverState(product.id, 'trendingProducts', trendingProducts.indexOf(product));
                      return (
                        <img
                          src={isHover && imgHover ? imgHover : imgDefault}
                          alt={product.ten || product.Ten}
                          className="w-full h-full object-cover rounded-lg transition-opacity duration-300"
                          loading="lazy"
                          onError={(e) => { e.target.src = '/barbie.jpg'; }}
                        />
                      );
                    })()}
                  </div>
                  <p className="text-gray-800 text-base font-medium truncate group-hover:text-primary-600 transition-colors">
                    {product.ten || product.Ten}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {product.loaiSP?.ten || product.loaiSP?.Ten || product.LoaiSP?.Ten || product.LoaiSP?.ten || product.tenLoai || product.TenLoai || product.category || product.danhMuc || 'Đồ chơi'}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-800 text-lg font-bold">
                      {new Intl.NumberFormat('vi-VN').format(product.giaBan || product.GiaBan || 0)}₫
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await handleBuyNow(product);
                        }}
                        className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-all"
                      >
                        Mua ngay
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 text-gray-600 hover:bg-primary-600 hover:text-white transition-all"
                        title="Thêm vào giỏ"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </section>

      {/* Trust & Credibility Section */}
      <section ref={featuresRef} className={`py-16 bg-gradient-to-br from-primary-50 via-rose-50 to-cream-50 scroll-reveal ${isFeaturesVisible ? 'revealed' : ''}`}>
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
      <section ref={newsletterRef} className={`py-16 bg-gradient-to-r from-primary-400 via-primary-500 to-rose-400 text-white relative overflow-hidden scroll-reveal scroll-reveal-bounce ${isNewsletterVisible ? 'revealed' : ''}`}>
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
        onBuyNow={handleBuyNow}
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