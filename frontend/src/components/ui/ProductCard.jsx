import React from 'react';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import Badge from './Badge';
import { Link } from 'react-router-dom';
import config from '../../config';
import OptimizedImage from './OptimizedImage';

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
  const API_BASE_URL = config.API_BASE_URL;
  
  // Hỗ trợ cả 2 format: chữ hoa (ID, Ten) và chữ thường (id, ten)
  const productId = product.id || product.ID || product.maSP || product.MaSP;
  const productName = product.ten || product.Ten || product.tenSP || product.TenSP || 'Sản phẩm';
  const productPrice = product.giaBan || product.GiaBan || product.donGia || product.DonGia || product.price || 0;
  
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
  
  // ✅ SỬA: Hỗ trợ nhiều tên field để tương thích
  const productImageRaw = product.hinhAnhUrl || product.hinhAnhURL || product.HinhAnhURL || product.hinhAnh || product.HinhAnh || product.image;
  const productImage = buildImageUrl(productImageRaw);
  
  const productStock = product.soLuongTon !== undefined ? product.soLuongTon : 
                       product.SoLuongTon !== undefined ? product.SoLuongTon :
                       product.ton !== undefined ? product.ton :
                       product.Ton !== undefined ? product.Ton : 
                       product.stock !== undefined ? product.stock : 0;
  
  // ✨ THÊM: Số lượng đã bán (dùng khi lọc bán chạy)
  const productSold = product.soLuongBan || product.SoLuongBan || 0;
  
  const productCategory = product.loaiSP?.ten || product.loaiSP?.Ten || product.LoaiSP?.Ten || product.LoaiSP?.ten || product.tenLoai || product.TenLoai || product.category || '';
  
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
    <div className={`bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all group ${className}`}>
      {/* Product Image - với padding để lộ viền nền */}
      <div className="p-3">
        <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <OptimizedImage
            src={productImage}
            alt={productName}
            aspectRatio="1"
            objectFit="cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={false}
            className="rounded-lg"
            fallback="/barbie.jpg"
            onError={handleImageError}
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="px-3 pb-3 relative">
        {/* Product Name */}
        <h3 
          onClick={() => window.location.href = `/products/${productId}`}
          className="font-semibold text-gray-800 mb-1 line-clamp-2 cursor-pointer hover:text-primary-600 transition-colors"
        >
          {productName}
        </h3>

        {/* Category Text - Below Name */}
        {productCategory && (
          <p className="text-sm text-gray-500 mb-3">
            {productCategory}
          </p>
        )}

        {/* Price and Add to Cart - Bottom Row */}
        <div className="flex items-center justify-between">
          {/* Price - Bottom Left */}
          <span className="text-xl font-bold text-gray-800">
            {formatPrice(productPrice)}
          </span>

          {/* Add to Cart Button - Bottom Right (Circular) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onAddToCart) {
                onAddToCart(product);
              }
            }}
            disabled={productStock === 0}
            className="w-10 h-10 bg-primary-200 hover:bg-primary-300 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            title="Thêm vào giỏ"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
