import React, { useState } from 'react';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import Badge from './Badge';
import { Link, useNavigate } from 'react-router-dom';
import config from '../../config';

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
  
  // ✨ Lấy danh sách ảnh sản phẩm (hỗ trợ nhiều format)
  const productImages = product.hinhAnhs || product.HinhAnhs || product.images || [];
  const sortedImages = Array.isArray(productImages) && productImages.length > 0
    ? productImages
        .sort((a, b) => (a.thuTu || a.ThuTu || 0) - (b.thuTu || b.ThuTu || 0))
        .map(img => {
          const url = img.duongDanHinhAnh || img.DuongDanHinhAnh || img.url || img;
          return typeof url === 'string' ? buildImageUrl(url) : buildImageUrl(url?.duongDanHinhAnh || url?.DuongDanHinhAnh || '');
        })
    : [];
  
  // Ảnh chính (ảnh 1)
  const imgDefault = sortedImages.length > 0 ? sortedImages[0] : productImage;
  // Ảnh thứ 2 (nếu có) - dùng khi hover
  const imgHover = sortedImages.length > 1 ? sortedImages[1] : null;
  
  // Debug: Log để kiểm tra (comment để tắt khi không cần)
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('🖼️ Product images debug:', {
  //     productName,
  //     productImages: productImages.length,
  //     sortedImages: sortedImages.length,
  //     hasHoverImage: !!imgHover,
  //     imgDefault: imgDefault?.substring(0, 50) + '...',
  //     imgHover: imgHover?.substring(0, 50) + '...',
  //     productData: {
  //       hinhAnhs: product.hinhAnhs?.length || 0,
  //       HinhAnhs: product.HinhAnhs?.length || 0,
  //       images: product.images?.length || 0
  //     }
  //   });
  // }
  
  // State để quản lý hover
  const [isHover, setIsHover] = useState(false);
  
  // Handlers cho hover
  const handleMouseEnter = () => {
    setIsHover(true);
  };
  
  const handleMouseLeave = () => {
    setIsHover(false);
  };
  
  // ✨ Handle click nút xem nhanh
  const handleQuickViewClick = (e) => {
    e.stopPropagation(); // Ngăn trigger click vào card
    if (onQuickView) {
      onQuickView(product);
    }
  };
  
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
  const navigate = useNavigate();

  // ✅ Handle click vào toàn bộ card để điều hướng
  const handleCardClick = (e) => {
    // Nếu click vào button hoặc link, không điều hướng
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(`/products/${productId}`);
  };

  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all group cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      {/* Product Image - với padding để lộ viền nền */}
      <div className="p-3">
        <div 
          className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden group/image"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src={isHover && imgHover ? imgHover : imgDefault}
            alt={productName}
            className="w-full h-full object-cover rounded-lg transition-opacity duration-300"
            onError={handleImageError}
            loading="lazy"
          />
          
          {/* Nút xem nhanh - hiển thị khi hover */}
          {onQuickView && (
            <button
              onClick={handleQuickViewClick}
              className={`absolute top-2 right-2 w-10 h-10 bg-white/90 hover:bg-white text-primary-600 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 z-10 ${
                isHover ? 'opacity-100' : 'opacity-0'
              }`}
              title="Xem nhanh"
            >
              <Eye size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="px-3 pb-3 relative">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1 hover:text-primary-600 transition-colors">
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
            className="w-10 h-10 bg-primary-400 hover:bg-primary-500 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
