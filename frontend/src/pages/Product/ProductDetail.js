import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { getProductById } from '../../api/productApi';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/format';
import { Button, Loading, ErrorMessage } from '../../components/common';

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToCart, loading: cartLoading } = useCart();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading product with ID:', id);
      
      // getProductById đã return trực tiếp product object
      const productData = await getProductById(id);
      console.log('📦 Product data received:', productData);
      
      setProduct(productData);
    } catch (error) {
      console.error('❌ Error loading product:', error);
      setMessage(error.message || 'Không thể tải thông tin sản phẩm');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      setMessage('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      setMessageType('warning');
      setTimeout(() => {
        navigate('/login', { state: { from: location } });
      }, 1500);
      return;
    }

    if (quantity > product.ton) {
      setMessage(`Chỉ còn ${product.ton} sản phẩm trong kho`);
      setMessageType('error');
      return;
    }

    try {
      await addToCart(product.id, quantity);
      setMessage('✅ Đã thêm vào giỏ hàng!');
      setMessageType('success');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    }
  };

  const handleQuantityChange = (change) => {
    const newQty = quantity + change;
    if (newQty < 1) return;
    if (newQty > product.ton) {
      setMessage(`Chỉ còn ${product.ton} sản phẩm trong kho`);
      setMessageType('warning');
      return;
    }
    setQuantity(newQty);
  };

  if (loading) return <Loading fullScreen text="Đang tải sản phẩm..." />;
  if (!product) return (
    <div className="product-detail">
      <ErrorMessage message="Không tìm thấy sản phẩm" type="error" />
      <Link to="/products" className="back-button">← Quay lại danh sách sản phẩm</Link>
    </div>
  );

  return (
    <div className="product-detail">
      <Link to="/products" className="back-button">
        ← Quay lại danh sách sản phẩm
      </Link>

      {message && (
        <ErrorMessage
          message={message}
          type={messageType}
          onClose={() => setMessage('')}
        />
      )}
      
      <div className="product-detail-content">
        <div className="product-image-container">
          <img 
            src={product.hinhAnhURL || '/placeholder.jpg'} 
            alt={product.ten}
            className="product-image"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMzYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOWNhM2FmIj7wn6eYPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
        </div>

        <div className="product-info">
          <h1>{product.ten}</h1>
          
          <p className="price">{formatCurrency(product.giaBan)}</p>
          
          <div className="stock-info">
            {product.ton > 0 ? (
              <span className="in-stock">✅ Còn hàng ({product.ton} sản phẩm)</span>
            ) : (
              <span className="out-of-stock">❌ Hết hàng</span>
            )}
          </div>

          {product.loaiSP && (
            <p className="category">
              <strong>Loại:</strong> {product.loaiSP.ten}
            </p>
          )}

          <div className="product-description">
            <h3>Mô tả sản phẩm:</h3>
            <p>{product.moTa || 'Chưa có mô tả'}</p>
          </div>

          {product.ton > 0 && (
            <div className="purchase-section">
              <div className="quantity-selector">
                <label>Số lượng:</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="qty-btn"
                  >
                    −
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.ton}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="action-buttons">
                <Button
                  variant="primary"
                  size="large"
                  fullWidth
                  onClick={handleAddToCart}
                  loading={cartLoading}
                  disabled={cartLoading || product.ton === 0}
                >
                  🛒 Thêm vào giỏ hàng
                </Button>

                {user && (
                  <Button
                    variant="secondary"
                    size="large"
                    fullWidth
                    onClick={() => navigate('/cart')}
                  >
                    👁️ Xem giỏ hàng
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;