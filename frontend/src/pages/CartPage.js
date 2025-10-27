import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../api/cartApi';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft, Package, Truck, Shield, RefreshCw } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { Button, Badge, Loading, Modal } from '../components/ui';
import Toast from '../components/Toast';

const CartPage = () => {
  // Backend API URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Build full image URL
  const buildImageUrl = (imagePath) => {
    if (!imagePath) return '/barbie.jpg';
    
    // Nếu đã là full URL (http/https)
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Nếu bắt đầu với /uploads/
    if (imagePath.startsWith('/uploads/')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    
    // Nếu chỉ là filename
    if (!imagePath.startsWith('/')) {
      return `${API_BASE_URL}/uploads/${imagePath}`;
    }
    
    return '/barbie.jpg';
  };
  
  // Handle image error với multiple fallback
  const handleImageError = (e) => {
    console.warn('❌ Lỗi load ảnh trong giỏ hàng:', e.target.src);
    
    // Fallback: Thử ảnh barbie.jpg trong public
    if (!e.target.src.includes('barbie.jpg')) {
      e.target.src = '/barbie.jpg';
    }
  };

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [toast, setToast] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      showToast('Vui lòng đăng nhập để xem giỏ hàng', 'warning', 3000);
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    loadCart();
  }, [user, navigate]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await getCart();
      
      if (response.success && response.data) {
        setCartItems(response.data.items || []);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      showToast(error.message || 'Không thể tải giỏ hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration });
  };

  const handleIncrement = async (item) => {
    const productId = item.SanPhamID;
    const currentQuantity = item.SoLuong;
    const maxStock = item.sanPham.Ton;

    if (currentQuantity >= maxStock) {
      showToast(`Chỉ còn ${maxStock} sản phẩm trong kho`, 'warning');
      return;
    }

    const newQuantity = currentQuantity + 1;
    await updateQuantity(productId, newQuantity, item.sanPham.Ten);
  };

  const handleDecrement = async (item) => {
    const productId = item.SanPhamID;
    const currentQuantity = item.SoLuong;

    if (currentQuantity <= 1) {
      setShowDeleteConfirm({ 
        productId, 
        productName: item.sanPham.Ten 
      });
      return;
    }

    const newQuantity = currentQuantity - 1;
    await updateQuantity(productId, newQuantity, item.sanPham.Ten);
  };

  const updateQuantity = async (productId, newQuantity, productName) => {
    try {
      setUpdating(prev => ({ ...prev, [productId]: true }));

      const response = await updateCartItem(productId, newQuantity);

      if (response.success) {
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.SanPhamID === productId
              ? { ...item, SoLuong: newQuantity }
              : item
          )
        );

        showToast(`Cập nhật số lượng "${productName}" thành công`, 'success', 2000);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      showToast(error.message || 'Không thể cập nhật số lượng', 'error');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemoveItem = async (productId, productName) => {
    try {
      setUpdating(prev => ({ ...prev, [productId]: true }));

      const response = await removeFromCart(productId);

      if (response.success) {
        setCartItems(prevItems => 
          prevItems.filter(item => item.SanPhamID !== productId)
        );

        showToast(`Đã xóa "${productName}" khỏi giỏ hàng`, 'success');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      showToast(error.message || 'Không thể xóa sản phẩm', 'error');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
      setShowDeleteConfirm(null);
    }
  };

  const handleClearCart = async () => {
    try {
      setLoading(true);

      const response = await clearCart();

      if (response.success) {
        setCartItems([]);
        showToast('Đã xóa toàn bộ giỏ hàng', 'success');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      showToast(error.message || 'Không thể xóa giỏ hàng', 'error');
    } finally {
      setLoading(false);
      setShowClearConfirm(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.DonGia) * item.SoLuong);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.SoLuong, 0);
  };

  if (loading) {
    return (
      <MainLayout>
        <Loading text="Đang tải giỏ hàng..." fullScreen />
      </MainLayout>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <MainLayout>
        <div className="container-cute py-16 text-center">
          <div className="text-8xl mb-6 animate-bounce-soft">🛒</div>
          <h2 className="text-3xl font-display font-bold text-gray-700 mb-4">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </p>
          <Button 
            variant="primary"
            size="lg"
            icon={<ShoppingCart size={20} />}
            onClick={() => navigate('/products')}
          >
            Tiếp tục mua sắm
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-cute py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gradient-primary mb-2 flex items-center gap-3">
            <ShoppingCart size={40} />
            Giỏ Hàng Của Bạn
          </h1>
          <p className="text-gray-600">
            Bạn có <strong className="text-primary-600">{getTotalItems()}</strong> sản phẩm trong giỏ hàng
          </p>
        </div>

        {/* Cart Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-700">Sản phẩm</h3>
              <Button 
                variant="outline"
                size="sm"
                icon={<Trash2 size={16} />}
                onClick={() => setShowClearConfirm(true)}
              >
                Xóa tất cả
              </Button>
            </div>

            {/* Items List */}
            {cartItems.map((item) => {
              const isUpdating = updating[item.SanPhamID];
              const itemTotal = parseFloat(item.DonGia) * item.SoLuong;
              const isOutOfStock = item.sanPham.Ton <= 0;
              const isMaxQuantity = item.SoLuong >= item.sanPham.Ton;
              
              // Build image URL từ backend
              const imageUrl = buildImageUrl(item.sanPham.HinhAnhURL);

              return (
                <div 
                  key={item.ID} 
                  className={`bg-white rounded-cute shadow-soft border-2 border-primary-100 p-4 transition-all ${
                    isUpdating ? 'opacity-50' : ''
                  } ${isOutOfStock ? 'bg-gray-50' : ''}`}
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Product Image */}
                    <div className="relative w-full md:w-24 h-24 flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt={item.sanPham.Ten}
                        className="w-full h-full object-cover rounded-cute"
                        onError={handleImageError}
                        loading="lazy"
                      />
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-cute">
                          <Badge variant="danger" size="sm">Hết hàng</Badge>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/products/${item.SanPhamID}`}
                        className="text-lg font-bold text-gray-800 hover:text-primary-600 transition-colors line-clamp-1"
                      >
                        {item.sanPham.Ten}
                      </Link>
                      <div className="text-xl font-bold text-primary-600 mt-1">
                        {parseFloat(item.DonGia).toLocaleString('vi-VN')} ₫
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {isOutOfStock ? (
                          <Badge variant="danger" size="sm">🚫 Hết hàng</Badge>
                        ) : (
                          <span>Còn {item.sanPham.Ton} sản phẩm</span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Control */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDecrement(item)}
                          disabled={isUpdating || isOutOfStock}
                          className="p-2 rounded-cute bg-primary-50 hover:bg-primary-100 text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        
                        <div className="w-16 text-center font-bold text-lg">
                          {item.SoLuong}
                        </div>
                        
                        <button
                          onClick={() => handleIncrement(item)}
                          disabled={isUpdating || isMaxQuantity || isOutOfStock}
                          className="p-2 rounded-cute bg-primary-50 hover:bg-primary-100 text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-600">Tổng cộng:</div>
                        <div className="text-xl font-bold text-primary-600">
                          {itemTotal.toLocaleString('vi-VN')} ₫
                        </div>
                      </div>

                      <button
                        onClick={() => setShowDeleteConfirm({ 
                          productId: item.SanPhamID, 
                          productName: item.sanPham.Ten 
                        })}
                        disabled={isUpdating}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  {isUpdating && (
                    <div className="mt-2 text-sm text-primary-600 flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
                      Đang cập nhật...
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-primary-50 to-rose-50 rounded-bubble shadow-bubble border-2 border-primary-200 p-6 sticky top-24">
              <h3 className="text-2xl font-display font-bold text-gray-800 mb-6">
                Tóm Tắt Đơn Hàng
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Tổng số lượng:</span>
                  <span className="font-bold">{getTotalItems()} sản phẩm</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính:</span>
                  <span className="font-bold">
                    {calculateTotal().toLocaleString('vi-VN')} ₫
                  </span>
                </div>

                <div className="flex justify-between text-green-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-bold">Miễn phí</span>
                </div>

                <div className="border-t-2 border-primary-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-gradient-primary">
                      {calculateTotal().toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={<ArrowRight size={20} />}
                  onClick={() => navigate('/checkout')}
                >
                  Tiến Hành Thanh Toán
                </Button>
                
                <Button 
                  variant="outline"
                  fullWidth
                  icon={<ArrowLeft size={20} />}
                  onClick={() => navigate('/products')}
                >
                  Tiếp tục mua sắm
                </Button>
              </div>

              {/* Benefits */}
              <div className="mt-6 pt-6 border-t-2 border-primary-200 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Truck size={20} className="text-primary-500" />
                  <span>Miễn phí vận chuyển</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <RefreshCw size={20} className="text-primary-500" />
                  <span>Đổi trả trong 30 ngày</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Shield size={20} className="text-primary-500" />
                  <span>Hàng chính hãng 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="⚠️ Xác Nhận Xóa"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa <strong className="text-primary-600">"{showDeleteConfirm?.productName}"</strong> khỏi giỏ hàng?
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(null)}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={() => handleRemoveItem(
                showDeleteConfirm.productId, 
                showDeleteConfirm.productName
              )}
            >
              Xóa
            </Button>
          </div>
        </div>
      </Modal>

      {/* Clear Cart Confirmation Modal */}
      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="⚠️ Xác Nhận Xóa Tất Cả"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa <strong className="text-primary-600">tất cả sản phẩm</strong> khỏi giỏ hàng?
          </p>
          <p className="text-red-600 text-sm">Hành động này không thể hoàn tác!</p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(false)}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={handleClearCart}
            >
              Xóa Tất Cả
            </Button>
          </div>
        </div>
      </Modal>

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

export default CartPage;
