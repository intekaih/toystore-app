import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/format';
import { Button, Loading, ErrorMessage } from '../../components/common';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    totalItems,
    totalAmount,
    loading,
    incrementCartItem,
    decrementCartItem,
    removeFromCart,
    clearCart,
  } = useCart();

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleIncrement = async (sanPhamId) => {
    try {
      await incrementCartItem(sanPhamId);
      showMessage('Đã tăng số lượng', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const handleDecrement = async (sanPhamId) => {
    try {
      const result = await decrementCartItem(sanPhamId);
      if (result.removed) {
        showMessage('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
      } else {
        showMessage('Đã giảm số lượng', 'success');
      }
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const handleRemoveItem = async (sanPhamId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      return;
    }

    try {
      await removeFromCart(sanPhamId);
      showMessage('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
      return;
    }

    try {
      await clearCart();
      showMessage('Đã xóa toàn bộ giỏ hàng', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showMessage('Giỏ hàng trống', 'warning');
      return;
    }
    navigate('/checkout');
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading && cartItems.length === 0) {
    return <Loading fullScreen text="Đang tải giỏ hàng..." />;
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>🛒 Giỏ hàng của bạn</h1>
          <p className="cart-count">
            {totalItems > 0 ? `${totalItems} sản phẩm` : 'Giỏ hàng trống'}
          </p>
        </div>

        {message && (
          <ErrorMessage
            message={message}
            type={messageType}
            onClose={() => setMessage('')}
          />
        )}

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Giỏ hàng trống</h2>
            <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
            <Button
              variant="primary"
              size="large"
              onClick={() => navigate('/products')}
            >
              🛍️ Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              <div className="cart-items-header">
                <h3>Sản phẩm</h3>
                {cartItems.length > 1 && (
                  <Button
                    variant="danger"
                    size="small"
                    onClick={handleClearCart}
                    disabled={loading}
                  >
                    🗑️ Xóa tất cả
                  </Button>
                )}
              </div>

              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div key={item.sanPhamId} className="cart-item">
                    <div className="cart-item-image">
                      <img
                        src={item.hinhAnh || '/placeholder.jpg'}
                        alt={item.tenSanPham}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOWNhM2FmIj7wn6eYPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    </div>

                    <div className="cart-item-info">
                      <h4 className="cart-item-name">{item.tenSanPham}</h4>
                      <p className="cart-item-price">
                        {formatCurrency(item.giaBan)}
                      </p>
                      {item.ton > 0 && (
                        <p className="cart-item-stock">Còn {item.ton} sản phẩm</p>
                      )}
                    </div>

                    <div className="cart-item-quantity">
                      <button
                        className="qty-btn"
                        onClick={() => handleDecrement(item.sanPhamId)}
                        disabled={loading}
                      >
                        −
                      </button>
                      <span className="qty-value">{item.soLuong}</span>
                      <button
                        className="qty-btn"
                        onClick={() => handleIncrement(item.sanPhamId)}
                        disabled={loading || item.soLuong >= item.ton}
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-total">
                      <p className="item-total-price">
                        {formatCurrency(item.giaBan * item.soLuong)}
                      </p>
                    </div>

                    <div className="cart-item-actions">
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveItem(item.sanPhamId)}
                        disabled={loading}
                        title="Xóa sản phẩm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cart-summary">
              <div className="summary-card">
                <h3>Tóm tắt đơn hàng</h3>
                
                <div className="summary-row">
                  <span>Tổng sản phẩm:</span>
                  <span>{totalItems} sản phẩm</span>
                </div>

                <div className="summary-row">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>

                <div className="summary-row">
                  <span>Phí vận chuyển:</span>
                  <span className="free-shipping">Miễn phí</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row summary-total">
                  <span>Tổng cộng:</span>
                  <span className="total-amount">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="large"
                  fullWidth
                  onClick={handleCheckout}
                  disabled={loading || cartItems.length === 0}
                >
                  💳 Tiến hành thanh toán
                </Button>

                <Button
                  variant="ghost"
                  size="medium"
                  fullWidth
                  onClick={() => navigate('/products')}
                  disabled={loading}
                >
                  ← Tiếp tục mua sắm
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
