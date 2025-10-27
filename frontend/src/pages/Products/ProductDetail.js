import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById } from '../../api/productApi.js';
import { addToCart } from '../../api/cartApi.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { ArrowLeft, ShoppingCart, Package, Shield, RefreshCw, Truck, Minus, Plus, Heart } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import { Button, Badge, Loading } from '../../components/ui';
import Toast from '../../components/Toast.js';

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await getProductById(id);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Error loading product:', error);
      showToast('Không thể tải chi tiết sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration });
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    const maxQuantity = product?.ton || 1;
    
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
    const maxQuantity = product?.ton || 1;
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
    if (!user) {
      showToast('Vui lòng đăng nhập để thêm vào giỏ hàng', 'warning', 3000);
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (quantity < 1) {
      showToast('Vui lòng chọn số lượng lớn hơn 0', 'warning');
      return;
    }

    if (quantity > product.ton) {
      showToast(`Chỉ còn ${product.ton} sản phẩm trong kho`, 'warning');
      setQuantity(product.ton);
      return;
    }

    try {
      setAdding(true);
      const response = await addToCart(product.id, quantity);

      if (response.success) {
        showToast(
          response.message || `Đã thêm ${quantity} ${product.ten} vào giỏ hàng`,
          'success',
          3000
        );
        setQuantity(1);
      }
    } catch (error) {
      console.error('❌ Lỗi thêm vào giỏ hàng:', error);
      showToast(error.message || 'Không thể thêm vào giỏ hàng', 'error', 4000);
    } finally {
      setAdding(false);
    }
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

  const isOutOfStock = product.ton <= 0;
  const isMaxQuantity = quantity >= product.ton;

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
          {/* Product Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-primary-50 to-rose-50 rounded-bubble overflow-hidden shadow-soft border-2 border-primary-100 sticky top-24">
              <img
                src={product.hinhAnhURL || '/barbie.jpg'}
                alt={product.ten}
                className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  e.target.src = '/barbie.jpg';
                }}
              />
              
              {/* Out of Stock Badge */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Badge variant="danger" size="lg" className="text-lg px-6 py-3">
                    Hết hàng
                  </Badge>
                </div>
              )}

              {/* Favorite Button */}
              <button className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-cute hover:shadow-bubble transition-all hover:scale-110">
                <Heart size={24} className="text-rose-500" />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-800 leading-tight">
              {product.ten}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-4 p-6 bg-gradient-to-r from-primary-50 to-rose-50 rounded-cute border-2 border-primary-200">
              <span className="text-4xl font-bold text-gradient-primary">
                {product.giaBan?.toLocaleString('vi-VN')} ₫
              </span>
              {product.giaBanGoc && product.giaBanGoc > product.giaBan && (
                <span className="text-xl text-gray-400 line-through">
                  {product.giaBanGoc?.toLocaleString('vi-VN')} ₫
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-3">
              <Package size={20} className="text-primary-500" />
              <Badge 
                variant={isOutOfStock ? 'danger' : product.ton < 10 ? 'warning' : 'success'}
                size="lg"
              >
                {isOutOfStock ? '🚫 Hết hàng' : `✅ Còn ${product.ton} sản phẩm`}
              </Badge>
            </div>

            {/* Category */}
            {product.loaiSP && (
              <div className="flex items-center gap-3 text-gray-600">
                <span className="text-lg">🏷️</span>
                <span className="font-semibold">Danh mục:</span>
                <Badge variant="primary">{product.loaiSP.ten}</Badge>
              </div>
            )}

            {/* Description */}
            <div className="bg-white p-6 rounded-cute border-2 border-primary-100 shadow-soft">
              <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                Mô tả sản phẩm
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {product.moTa || 'Không có mô tả'}
              </p>
            </div>

            {/* Add to Cart Section */}
            {!isOutOfStock && (
              <div className="bg-gradient-to-br from-cream-50 to-primary-50 p-6 rounded-cute border-2 border-primary-200 space-y-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📦 Số lượng:
                </label>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white rounded-cute border-2 border-primary-200 overflow-hidden">
                    <button
                      onClick={handleDecrement}
                      disabled={quantity <= 1 || adding}
                      className="p-3 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus size={20} className="text-primary-600" />
                    </button>
                    
                    <input
                      type="number"
                      min="1"
                      max={product.ton}
                      value={quantity}
                      onChange={handleQuantityChange}
                      disabled={adding}
                      className="w-20 text-center font-bold text-lg border-none focus:outline-none"
                    />
                    
                    <button
                      onClick={handleIncrement}
                      disabled={isMaxQuantity || adding}
                      className="p-3 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={20} className="text-primary-600" />
                    </button>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleAddToCart}
                    disabled={adding || isOutOfStock}
                    loading={adding}
                    icon={<ShoppingCart size={20} />}
                  >
                    {adding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                  </Button>
                </div>

                {!user && (
                  <p className="text-sm text-center text-gray-600">
                    Vui lòng{' '}
                    <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
                      đăng nhập
                    </Link>
                    {' '}để sử dụng giỏ hàng
                  </p>
                )}
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white rounded-cute shadow-soft border border-primary-100">
                <Truck size={24} className="text-primary-500" />
                <span className="text-sm font-medium text-gray-700">
                  Giao hàng toàn quốc
                </span>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-cute shadow-soft border border-primary-100">
                <Shield size={24} className="text-primary-500" />
                <span className="text-sm font-medium text-gray-700">
                  Hàng chính hãng 100%
                </span>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-cute shadow-soft border border-primary-100">
                <RefreshCw size={24} className="text-primary-500" />
                <span className="text-sm font-medium text-gray-700">
                  Đổi trả trong 30 ngày
                </span>
              </div>
            </div>
          </div>
        </div>
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