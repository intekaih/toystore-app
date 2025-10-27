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
}) => {
  // Hỗ trợ cả 2 format: chữ hoa (MaSP, TenSP) và chữ thường (maSP, tenSP)
  const productId = product.id || product.MaSP || product.maSP;
  const productName = product.tenSP || product.TenSP || product.ten || 'Sản phẩm';
  const productPrice = product.giaBan || product.GiaBan || product.donGia || product.DonGia || product.price || 0;
  const productImage = product.hinhAnh || product.HinhAnh || product.hinhAnhURL || product.HinhAnhURL || product.image || '/barbie.jpg';
  const productStock = product.soLuongTon !== undefined ? product.soLuongTon : 
                       product.SoLuongTon !== undefined ? product.SoLuongTon : 
                       product.ton !== undefined ? product.ton :
                       product.Ton !== undefined ? product.Ton :
                       product.stock !== undefined ? product.stock : 0;
  const productCategory = product.loaiSP?.tenLoai || product.loaiSP?.Ten || product.TenLoai || product.tenLoai || product.category || '';
  
  // Format giá tiền
  const formatPrice = (price) => {
    const numPrice = Number(price);
    if (isNaN(numPrice)) return '0 ₫';
    return numPrice.toLocaleString('vi-VN') + ' ₫';
  };

  // Xác định trạng thái tồn kho
  const getStockStatus = () => {
    if (productStock === 0) return { variant: 'danger', text: 'Hết hàng' };
    if (productStock < 10) return { variant: 'warning', text: `Còn ${productStock}` };
    return { variant: 'success', text: 'Còn hàng' };
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
          onError={(e) => { e.target.src = '/barbie.jpg'; }}
        />
        
        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant={stockStatus.variant} size="sm">
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
