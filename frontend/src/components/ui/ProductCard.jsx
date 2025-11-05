import React from 'react';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import Badge from './Badge';

/**
 * 🧸 ProductCard Component - Card sản phẩm dễ thương
 */
const ProductCard = ({ 
  product,
  onAddToCart,
  onQuickView,
  onFavorite,
  className = '',
  filterType = null, // ✨ THÊM: Để biết đang lọc theo gì (bestSeller, newest, etc.)
}) => {
  // Backend API URL - có thể config trong .env
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Hỗ trợ cả 2 format: chữ hoa (ID, Ten) và chữ thường (id, ten)
  const productId = product.ID || product.id || product.MaSP || product.maSP;
  const productName = product.Ten || product.ten || product.tenSP || product.TenSP || 'Sản phẩm';
  const productPrice = product.GiaBan || product.giaBan || product.donGia || product.DonGia || product.price || 0;
  
  // Build full image URL
  const buildImageUrl = (imagePath) => {
    if (!imagePath) return '/barbie.jpg'; // Fallback to default
    
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
    
    return '/barbie.jpg'; // Fallback
  };
  
  const productImageRaw = product.HinhAnhURL || product.hinhAnhURL || product.hinhAnh || product.HinhAnh || product.image;
  const productImage = buildImageUrl(productImageRaw);
  
  const productStock = product.Ton !== undefined ? product.Ton : 
                       product.ton !== undefined ? product.ton :
                       product.soLuongTon !== undefined ? product.soLuongTon : 
                       product.SoLuongTon !== undefined ? product.SoLuongTon : 
                       product.stock !== undefined ? product.stock : 0;
  
  // ✨ THÊM: Số lượng đã bán (dùng khi lọc bán chạy)
  const productSold = product.SoLuongBan || product.soLuongBan || 0;
  
  const productCategory = product.LoaiSP?.Ten || product.loaiSP?.Ten || product.loaiSP?.tenLoai || product.TenLoai || product.tenLoai || product.category || '';
  
  // Format giá tiền
  const formatPrice = (price) => {
    const numPrice = Number(price);
    if (isNaN(numPrice)) return '0 ₫';
    return numPrice.toLocaleString('vi-VN') + ' ₫';
  };

  // ✨ CẬP NHẬT: Xác định trạng thái tồn kho HOẶC số lượng đã bán
  const getStockStatus = () => {
    // 🔥 Nếu đang lọc theo bán chạy → Hiển thị số lượng đã bán
    if (filterType === 'bestSeller' && productSold > 0) {
      return { variant: 'danger', text: `Đã bán ${productSold}`, icon: '🔥' };
    }
    
    // ⚠️ Hết hàng
    if (productStock === 0) return { variant: 'danger', text: 'Hết hàng' };
    
    // ⚠️ Sắp hết (< 10)
    if (productStock < 10) return { variant: 'warning', text: `Còn ${productStock}` };
    
    // ✅ Còn hàng
    return { variant: 'success', text: 'Còn hàng' };
  };

  // Handle image error với multiple fallback
  const handleImageError = (e) => {
    console.warn('❌ Lỗi load ảnh:', e.target.src);
    
    // Fallback 1: Thử ảnh barbie.jpg trong public
    if (!e.target.src.includes('barbie.jpg')) {
      e.target.src = '/barbie.jpg';
      return;
    }
    
    // Fallback 2: Placeholder image với text
    e.target.style.display = 'none';
    const placeholder = e.target.nextElementSibling;
    if (placeholder && placeholder.classList.contains('image-placeholder')) {
      placeholder.style.display = 'flex';
    }
  };

  const stockStatus = getStockStatus();

  return (
    <div className={`product-card-cute group ${className}`}>
      {/* Product Image */}
      <div className="product-image-wrapper relative">
        <img 
          src={productImage} 
          alt={productName}
          className="w-full h-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />
        
        {/* Image Placeholder - hiển thị khi ảnh lỗi */}
        <div 
          className="image-placeholder absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-400 text-sm"
          style={{ display: 'none' }}
        >
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <span>Không có ảnh</span>
        </div>
        
        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant={stockStatus.variant} size="sm">
            {stockStatus.icon && <span className="mr-1">{stockStatus.icon}</span>}
            {stockStatus.text}
          </Badge>
        </div>

        {/* Category Badge */}
        {productCategory && (
          <div className="absolute top-3 left-3">
            <Badge variant="primary" size="sm">
              {productCategory}
            </Badge>
          </div>
        )}

        {/* Hover Overlay với Quick Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 px-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView && onQuickView(product);
              }}
              className="p-2 bg-white rounded-full text-primary-500 hover:bg-primary-500 hover:text-white transition-colors shadow-soft"
              title="Xem nhanh"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite && onFavorite(product);
              }}
              className="p-2 bg-white rounded-full text-rose-500 hover:bg-rose-500 hover:text-white transition-colors shadow-soft"
              title="Yêu thích"
            >
              <Heart size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <h3 className="font-bold text-gray-800 line-clamp-2 min-h-[3rem] leading-6">
          {productName}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gradient-primary">
            {formatPrice(productPrice)}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onAddToCart) {
              onAddToCart(product);
            }
          }}
          disabled={productStock === 0}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-400 to-primary-500 text-white font-semibold rounded-cute shadow-soft hover:shadow-cute hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} />
          {productStock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
