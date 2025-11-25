import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService, cartService } from '../../services'; // ✅ Sử dụng services
import { useAuth } from '../../contexts/AuthContext.js';
import { ArrowLeft, ShoppingCart, Package, Shield, RefreshCw, Truck, Minus, Plus, Heart, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import { Button, Badge, Loading } from '../../components/ui';
import Toast from '../../components/Toast.js';
import config from '../../config';
import ReviewList from '../../components/ReviewList';

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedSection, setExpandedSection] = useState('description'); // 'description', 'specs', 'policy'
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      
      const response = await productService.getProductById(id);
      
      console.log('📦 Response from API:', response);
      
      if (response.success && response.data && response.data.product) {
        setProduct(response.data.product);
        console.log('✅ Product loaded:', response.data.product);
        // Load sản phẩm liên quan (cùng danh mục)
        if (response.data.product.loaiID) {
          loadRelatedProducts(response.data.product.loaiID, response.data.product.id);
        }
      } else {
        throw new Error('Không tìm thấy thông tin sản phẩm');
      }
    } catch (error) {
      console.error('❌ Error loading product:', error);
      showToast(error.message || 'Không thể tải chi tiết sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async (categoryId, currentProductId) => {
    try {
      const response = await productService.getProducts({
        loaiId: categoryId,
        limit: 8
      });
      
      if (response.success && response.data && response.data.products) {
        // Lọc bỏ sản phẩm hiện tại và chỉ lấy 4 sản phẩm
        const filtered = response.data.products
          .filter(p => p.id !== currentProductId)
          .slice(0, 4);
        setRelatedProducts(filtered);
      }
    } catch (error) {
      console.error('❌ Error loading related products:', error);
    }
  };

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration });
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    const maxQuantity = product?.soLuongTon || 1;
    
    if (value < 1) {
      setQuantity(1);
    } else if (value > maxQuantity) {
      setQuantity(maxQuantity);
      showToast(`Chỉ còn ${maxQuantity} sản phẩm trong kho`, 'warning');
    } else {
      setQuantity(value);
    }
  };

  const handleIncrement = () => {
    const maxQuantity = product?.soLuongTon || 1;
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    } else {
      showToast('Đã đạt giới hạn tồn kho', 'warning');
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (quantity < 1) {
      showToast('Vui lòng chọn số lượng lớn hơn 0', 'warning');
      return;
    }

    const productStock = product.soLuongTon || 0;
    if (quantity > productStock) {
      showToast(`Chỉ còn ${productStock} sản phẩm trong kho`, 'warning');
      setQuantity(productStock);
      return;
    }

    try {
      setAdding(true);
      const productId = product.id;
      const productName = product.ten;
      
      const response = await cartService.addToCart(productId, quantity);

      if (response.success) {
        showToast(
          `Đã thêm ${quantity} ${productName} vào giỏ hàng`,
          'success',
          3000
        );
        setQuantity(1);
        
        if (!user) {
          showToast(
            'Bạn có thể thanh toán mà không cần đăng nhập!',
            'info',
            4000
          );
        }
      }
    } catch (error) {
      console.error('❌ Lỗi thêm vào giỏ hàng:', error);
      showToast(error.message || 'Không thể thêm vào giỏ hàng', 'error', 4000);
    } finally {
      setAdding(false);
    }
  };

  // Handle image navigation
  const handlePrevImage = () => {
    if (!product?.hinhAnhs || product.hinhAnhs.length === 0) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.hinhAnhs.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!product?.hinhAnhs || product.hinhAnhs.length === 0) return;
    setCurrentImageIndex((prev) => 
      prev === product.hinhAnhs.length - 1 ? 0 : prev + 1
    );
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  if (loading) {
    return (
      <MainLayout>
        <Loading text="Đang tải sản phẩm..." fullScreen />
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container-cute py-16 text-center">
          <div className="text-8xl mb-6">😢</div>
          <h2 className="text-3xl font-display font-bold text-gray-700 mb-4">
            Không tìm thấy sản phẩm
          </h2>
          <Button 
            variant="primary"
            icon={<ArrowLeft size={20} />}
            onClick={() => navigate('/products')}
          >
            Quay lại danh sách sản phẩm
          </Button>
        </div>
      </MainLayout>
    );
  }

  const isOutOfStock = (product.soLuongTon || 0) <= 0;
  const isMaxQuantity = quantity >= (product.soLuongTon || 0);
  
  // Helper getters để hỗ trợ cả 2 format
  const productName = product.ten || '';
  const productPrice = product.giaBan || 0;
  const productStock = product.soLuongTon || 0;
  const productImages = product.hinhAnhs && product.hinhAnhs.length > 0 ? product.hinhAnhs : (product.hinhAnhURL ? [{ duongDanHinhAnh: product.hinhAnhURL, thuTu: 0, laMacDinh: true }] : []);
  const productDescription = product.moTa || 'Không có mô tả';
  const productCategory = product.loaiSP;
  const productOriginalPrice = product.giaBanGoc;
  const currentImage = productImages[currentImageIndex]?.duongDanHinhAnh || '/barbie.jpg';

  return (
    <MainLayout>
      <div className="container-cute py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 px-4 py-2 mb-6 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Quay lại danh sách sản phẩm</span>
        </button>

        {/* Product Detail Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image Gallery - Layout: Thumbnail Left + Main Image Right */}
          <div className="relative">
            <div className="flex gap-4">
              {/* Thumbnail Column - Only show if more than 1 image */}
              {productImages.length > 1 && (
                <div className="flex flex-col gap-3 w-24">
                  <div className="relative flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary-300 scrollbar-track-primary-50">
                    {productImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => handleThumbnailClick(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          currentImageIndex === index
                            ? 'border-primary-500 shadow-md ring-2 ring-primary-200'
                            : 'border-primary-100 hover:border-primary-300 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img.duongDanHinhAnh}
                          alt={`${productName} - Ảnh ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Image */}
              <div className="flex-1 bg-gradient-to-br from-primary-50 to-rose-50 rounded-bubble overflow-hidden shadow-soft border-2 border-primary-100 sticky top-24">
                <div className="relative aspect-square">
                  <img
                    src={currentImage}
                    alt={productName}
                    className="w-full h-full object-contain p-4 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Out of Stock Badge */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Badge variant="danger" size="lg" className="text-lg px-6 py-3">
                        Hết hàng
                      </Badge>
                    </div>
                  )}

                  {/* Image Counter */}
                  {productImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white rounded-full text-sm font-semibold">
                      {currentImageIndex + 1} / {productImages.length}
                    </div>
                  )}

                  {/* Favorite Button */}
                  <button className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-cute hover:shadow-bubble transition-all hover:scale-110">
                    <Heart size={24} className="text-rose-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info - ✅ THIẾT KẾ MỚI THEO ẢNH */}
          <div className="space-y-5">
            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-gray-800 leading-tight">
              {productName}
            </h1>

            {/* Price Box - Nổi bật với nền hồng nhạt */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-5 border-2 border-pink-100">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl lg:text-5xl font-bold text-pink-600">
                  {productPrice?.toLocaleString('vi-VN')} ₫
                </span>
                {productOriginalPrice && productOriginalPrice > productPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {productOriginalPrice?.toLocaleString('vi-VN')} ₫
                  </span>
                )}
              </div>
            </div>

            {/* Stock & Category Info */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Stock Status */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border-2 border-gray-100">
                <Package size={18} className="text-green-500" />
                <span className="text-sm font-semibold text-green-600">
                  {isOutOfStock ? '🚫 Hết hàng' : `Còn ${productStock} sản phẩm`}
                </span>
              </div>

              {/* Category */}
              {productCategory && (
                <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-xl border-2 border-pink-200">
                  <span className="text-sm">🏷️</span>
                  <span className="text-sm font-semibold text-gray-700">Danh mục:</span>
                  <span className="text-sm font-bold text-pink-600">{productCategory.ten}</span>
                </div>
              )}
            </div>

            {/* Add to Cart Section */}
            {!isOutOfStock && (
              <div className="bg-white rounded-2xl border-2 border-pink-100 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📦</span>
                  <span className="font-bold text-gray-800">Số lượng:</span>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Quantity Selector - Giống ảnh */}
                  <div className="flex items-center bg-gradient-to-r from-pink-50 to-rose-50 rounded-full border-2 border-pink-200">
                    <button
                      onClick={handleDecrement}
                      disabled={quantity <= 1 || adding}
                      className="p-3 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-l-full"
                    >
                      <Minus size={20} className="text-pink-600" />
                    </button>
                    
                    <div className="w-16 text-center font-bold text-2xl text-gray-800">
                      {quantity}
                    </div>
                    
                    <button
                      onClick={handleIncrement}
                      disabled={isMaxQuantity || adding}
                      className="p-3 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-r-full"
                    >
                      <Plus size={20} className="text-pink-600" />
                    </button>
                  </div>

                  {/* Add to Cart Button - Gradient hồng */}
                  <button
                    onClick={handleAddToCart}
                    disabled={adding || isOutOfStock}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 px-6 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {adding ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Thêm vào giỏ hàng
                      </>
                    )}
                  </button>
                </div>

                {!user && (
                  <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <p className="text-sm text-center text-blue-700">
                      💡 <span className="font-semibold">Mua hàng không cần đăng nhập!</span>{' '}
                      <Link to="/login" className="font-bold hover:underline text-blue-800">
                        Đăng nhập ngay
                      </Link>
                      {' '}để theo dõi đơn hàng.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Additional Info - 3 Icons dạng card */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border-2 border-gray-100 hover:border-pink-200 hover:shadow-md transition-all">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50 rounded-full">
                  <Truck size={24} className="text-pink-500" />
                </div>
                <span className="text-xs font-bold text-gray-700 text-center leading-tight">
                  Giao hàng<br/>toàn quốc
                </span>
              </div>
              
              <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border-2 border-gray-100 hover:border-pink-200 hover:shadow-md transition-all">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50 rounded-full">
                  <Shield size={24} className="text-pink-500" />
                </div>
                <span className="text-xs font-bold text-gray-700 text-center leading-tight">
                  Hàng chính hãng<br/>100%
                </span>
              </div>
              
              <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border-2 border-gray-100 hover:border-pink-200 hover:shadow-md transition-all">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50 rounded-full">
                  <RefreshCw size={24} className="text-pink-500" />
                </div>
                <span className="text-xs font-bold text-gray-700 text-center leading-tight">
                  Đổi trả<br/>30 ngày
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description Section - Chỉ giữ lại Mô tả */}
        <div className="mt-12 bg-white rounded-bubble shadow-soft border-2 border-primary-100 overflow-hidden">
          <h2 className="text-3xl font-display font-bold text-gray-800 p-6 bg-gradient-to-r from-primary-50 to-rose-50 border-b-2 border-primary-100 flex items-center gap-3">
            <span className="text-2xl">📝</span>
            Mô tả sản phẩm
          </h2>

          {/* Mô tả sản phẩm */}
          <div className="p-6">
            <div className="bg-gradient-to-br from-cream-50 to-primary-25 rounded-lg p-6 border border-primary-100">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {productDescription}
              </p>
            </div>
          </div>
        </div>

        {/* ✅ MỚI: Review Section - Hiển thị đánh giá từ database */}
        <div className="mt-12">
          <h2 className="text-3xl font-display font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="text-4xl">⭐</span>
            Đánh giá sản phẩm
          </h2>
          <ReviewList sanPhamId={product.id} />
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-display font-bold text-gray-800 flex items-center gap-3">
                <span className="text-4xl">🎁</span>
                Sản phẩm liên quan
              </h2>
              {productCategory && (
                <Link
                  to={`/products?category=${productCategory.id}`}
                  className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2 transition-colors"
                >
                  Xem tất cả
                  <ChevronRight size={20} />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/products/${relatedProduct.id}`}
                  className="group bg-white rounded-bubble shadow-soft hover:shadow-bubble border-2 border-primary-100 overflow-hidden transition-all duration-300 hover:scale-105"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-primary-50 to-rose-50 overflow-hidden">
                    <img
                      src={relatedProduct.hinhAnhURL || '/barbie.jpg'}
                      alt={relatedProduct.ten}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                    {relatedProduct.soLuongTon === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="danger" size="sm">Hết hàng</Badge>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-sm md:text-base group-hover:text-primary-600 transition-colors">
                      {relatedProduct.ten}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg md:text-xl font-bold text-gradient-primary">
                        {relatedProduct.giaBan?.toLocaleString('vi-VN')} ₫
                      </span>
                      {relatedProduct.soLuongTon > 0 && (
                        <Badge variant="success" size="sm">
                          Còn hàng
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

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

export default ProductDetail;