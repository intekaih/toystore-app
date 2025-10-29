import React, { useState } from 'react';
import { X, ShoppingCart, Heart, Package, Tag, Star } from 'lucide-react';
import { Modal, Badge, Button } from './ui';

/**
 * 👁️ ProductQuickViewModal - Modal xem nhanh sản phẩm
 */
const ProductQuickViewModal = ({ 
  isOpen, 
  onClose, 
  product, 
  onAddToCart,
  onFavorite 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  if (!product) return null;

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Hỗ trợ cả 2 format: chữ hoa (ID, Ten) và chữ thường (id, ten)
  const productId = product.ID || product.id || product.MaSP || product.maSP;
  const productName = product.Ten || product.ten || product.tenSP || product.TenSP || 'Sản phẩm';
  const productPrice = product.GiaBan || product.giaBan || product.donGia || product.DonGia || product.price || 0;
  const productDescription = product.MoTa || product.moTa || product.description || 'Chưa có mô tả sản phẩm';
  
  // Build full image URL
  const buildImageUrl = (imagePath) => {
    if (!imagePath) return '/barbie.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `${API_BASE_URL}${imagePath}`;
    if (!imagePath.startsWith('/')) return `${API_BASE_URL}/uploads/${imagePath}`;
    return '/barbie.jpg';
  };
  
  const productImageRaw = product.HinhAnhURL || product.hinhAnhURL || product.hinhAnh || product.HinhAnh || product.image;
  const productImage = buildImageUrl(productImageRaw);
  
  const productStock = product.Ton !== undefined ? product.Ton : 
                       product.ton !== undefined ? product.ton :
                       product.soLuongTon !== undefined ? product.soLuongTon : 
                       product.SoLuongTon !== undefined ? product.SoLuongTon : 
                       product.stock !== undefined ? product.stock : 0;
  const productCategory = product.LoaiSP?.Ten || product.loaiSP?.Ten || product.loaiSP?.tenLoai || product.TenLoai || product.tenLoai || product.category || '';
  
  // Format giá tiền
  const formatPrice = (price) => {
    const numPrice = Number(price);
    if (isNaN(numPrice)) return '0 ₫';
    return numPrice.toLocaleString('vi-VN') + ' ₫';
  };

  // Xác định trạng thái tồn kho
  const getStockStatus = () => {
    if (productStock === 0) return { variant: 'danger', text: 'Hết hàng', icon: '❌' };
    if (productStock < 10) return { variant: 'warning', text: `Chỉ còn ${productStock}`, icon: '⚠️' };
    return { variant: 'success', text: 'Còn hàng', icon: '✅' };
  };

  const stockStatus = getStockStatus();

  // Handle quantity change
  const handleQuantityChange = (value) => {
    const newQty = Math.max(1, Math.min(value, productStock));
    setQuantity(newQty);
  };

  // Handle favorite toggle
  const handleFavoriteClick = () => {
    setIsFavorited(!isFavorited);
    onFavorite && onFavorite(product);
  };

  // Handle add to cart with quantity
  const handleAddToCartClick = () => {
    onAddToCart && onAddToCart(product, quantity);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={false}>
      <div className="relative">
        {/* Close Button - Đẹp hơn */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300 group"
          aria-label="Đóng"
        >
          <X size={24} className="text-gray-600 group-hover:text-primary-500 transition-colors" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left Side - Product Image (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50 shadow-cute group">
              <img 
                src={productImage} 
                alt={productName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.target.src = '/barbie.jpg';
                }}
              />
              
              {/* Category Badge */}
              {productCategory && (
                <div className="absolute top-3 left-3">
                  <Badge variant="primary" size="sm" className="shadow-soft backdrop-blur-sm bg-white/90">
                    <Tag size={12} className="mr-1" />
                    {productCategory}
                  </Badge>
                </div>
              )}

              {/* Stock Badge */}
              <div className="absolute top-3 right-3">
                <Badge variant={stockStatus.variant} size="sm" className="shadow-soft backdrop-blur-sm bg-white/90">
                  <span className="mr-1">{stockStatus.icon}</span>
                  {stockStatus.text}
                </Badge>
              </div>
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-xs text-gray-600">(128 đánh giá)</span>
            </div>
          </div>

          {/* Right Side - Product Info (3 cols) */}
          <div className="md:col-span-3 flex flex-col">
            {/* Product Name & ID */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-800 leading-tight mb-1">
                {productName}
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Mã SP:</span>
                <span className="font-mono font-semibold text-primary-600">#{productId}</span>
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4 mb-4 border border-primary-100">
              <div className="text-xs text-gray-600 mb-1">Giá bán</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gradient-primary">
                  {formatPrice(productPrice)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(productPrice * 1.2)}
                </span>
                <Badge variant="danger" size="sm">-20%</Badge>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm mb-1">
                <span className="w-1 h-4 bg-primary-500 rounded-full"></span>
                Mô tả sản phẩm
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                {productDescription}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-4">
              <label className="font-semibold text-gray-700 flex items-center gap-2 text-xs mb-2">
                <Package size={14} />
                Số lượng
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-14 text-center py-1.5 font-semibold text-sm focus:outline-none"
                    min="1"
                    max={productStock}
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= productStock}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  {productStock > 0 ? `${productStock} sản phẩm có sẵn` : 'Hết hàng'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-auto">
              <Button
                onClick={handleAddToCartClick}
                disabled={productStock === 0}
                className="flex-1 py-2.5 text-sm font-semibold shadow-lg hover:shadow-xl"
              >
                <ShoppingCart size={18} className="mr-2" />
                {productStock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
              </Button>
              
              <button
                onClick={handleFavoriteClick}
                className={`px-4 py-2.5 border-2 font-semibold rounded-cute shadow-soft hover:shadow-cute transition-all duration-300 ${
                  isFavorited 
                    ? 'bg-rose-500 border-rose-500 text-white' 
                    : 'bg-white border-rose-300 text-rose-500 hover:bg-rose-50 hover:border-rose-400'
                }`}
                title={isFavorited ? 'Đã thích' : 'Thêm vào yêu thích'}
              >
                <Heart size={18} className={isFavorited ? 'fill-white' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductQuickViewModal;
