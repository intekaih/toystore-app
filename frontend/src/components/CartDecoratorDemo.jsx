import React, { useState } from 'react';
import { useCartDecorator } from '../decorators/useCartDecorator';
import './CartDecoratorDemo.css';

/**
 * 🎮 DEMO COMPONENT - Cart Decorator Pattern
 * 
 * Component demo sử dụng Decorator Pattern để tính giá giỏ hàng
 */
const CartDecoratorDemo = () => {
  // Dữ liệu giả lập từ API
  const [cartItems] = useState([
    {
      MaSP: 1,
      TenSP: 'Búp bê Barbie Dream House',
      Gia: 500000,
      SoLuong: 2,
      HinhAnh: '/images/barbie.jpg'
    },
    {
      MaSP: 2,
      TenSP: 'Lego Star Wars Millennium Falcon',
      Gia: 800000,
      SoLuong: 1,
      HinhAnh: '/images/lego.jpg'
    },
    {
      MaSP: 3,
      TenSP: 'Robot biến hình Transformers',
      Gia: 350000,
      SoLuong: 1,
      HinhAnh: '/images/robot.jpg'
    }
  ]);

  // State cho voucher
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  // Danh sách voucher có sẵn (giả lập)
  const availableVouchers = {
    'SALE50K': { code: 'SALE50K', discount: 50000 },
    'MEGA100K': { code: 'MEGA100K', discount: 100000 },
    'DISCOUNT30K': { code: 'DISCOUNT30K', discount: 30000 }
  };

  // Áp dụng Decorator Pattern
  const cart = useCartDecorator(cartItems, {
    applyVAT: true,
    vatRate: 0.1,
    voucher: appliedVoucher,
    enableFreeShipping: true,
    shippingFee: 30000,
    minOrderForFreeShip: 500000
  });

  // Xử lý apply voucher
  const handleApplyVoucher = () => {
    const voucher = availableVouchers[voucherCode.toUpperCase()];
    if (voucher) {
      setAppliedVoucher(voucher);
      alert(`✅ Áp dụng voucher ${voucher.code} thành công! Giảm ${cart.formatPrice(voucher.discount)}`);
    } else {
      alert('❌ Mã voucher không hợp lệ!');
    }
  };

  // Xóa voucher
  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
  };

  return (
    <div className="cart-decorator-demo">
      <h1>🎨 Decorator Pattern - Demo Giỏ Hàng</h1>

      {/* Danh sách sản phẩm */}
      <div className="cart-items">
        <h2>🛒 Sản phẩm trong giỏ ({cartItems.length})</h2>
        {cart.items.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="item-info">
              <h3>{item.name}</h3>
              <p>Số lượng: {item.quantity}</p>
              <p>Đơn giá: {cart.formatPrice(item.basePrice)}</p>
            </div>
            <div className="item-price">
              <strong>{cart.formatPrice(item.finalPrice)}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Voucher Section */}
      <div className="voucher-section">
        <h3>🎫 Mã giảm giá</h3>
        {!appliedVoucher ? (
          <div className="voucher-input">
            <input
              type="text"
              placeholder="Nhập mã voucher..."
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
            />
            <button onClick={handleApplyVoucher}>Áp dụng</button>
          </div>
        ) : (
          <div className="voucher-applied">
            <span>✅ {appliedVoucher.code} (-{cart.formatPrice(appliedVoucher.discount)})</span>
            <button onClick={handleRemoveVoucher}>Xóa</button>
          </div>
        )}
        <div className="voucher-hints">
          <small>Mã khả dụng: SALE50K, MEGA100K, DISCOUNT30K</small>
        </div>
      </div>

      {/* Free Shipping Info */}
      {cart.freeShippingInfo && (
        <div className={`free-shipping-banner ${cart.freeShippingInfo.isEligible ? 'eligible' : ''}`}>
          {cart.freeShippingInfo.isEligible ? (
            <>
              <span className="icon">🎉</span>
              <span>Bạn được miễn phí vận chuyển! Tiết kiệm {cart.formatPrice(cart.freeShippingInfo.savedAmount)}</span>
            </>
          ) : (
            <>
              <span className="icon">🚚</span>
              <span>Mua thêm {cart.formatPrice(cart.freeShippingInfo.remaining)} để được miễn phí ship!</span>
            </>
          )}
        </div>
      )}

      {/* Price Breakdown - Chi tiết giá */}
      <div className="price-breakdown">
        <h3>💰 Chi tiết thanh toán</h3>
        {cart.priceBreakdown.map((item, index) => (
          <div key={index} className={`breakdown-item ${item.isAddition ? 'addition' : 'subtraction'}`}>
            <span>{item.label}</span>
            <span className={item.isAddition ? 'amount-add' : 'amount-subtract'}>
              {item.isAddition ? '+' : '-'} {cart.formatPrice(item.amount)}
            </span>
          </div>
        ))}

        <div className="breakdown-total">
          <strong>Tổng cộng:</strong>
          <strong className="total-amount">{cart.formatPrice(cart.total)}</strong>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-label">Tạm tính</div>
          <div className="card-value">{cart.formatPrice(cart.subtotal)}</div>
        </div>
        <div className="summary-card vat">
          <div className="card-label">VAT (10%)</div>
          <div className="card-value">+{cart.formatPrice(cart.vat)}</div>
        </div>
        <div className="summary-card discount">
          <div className="card-label">Giảm giá</div>
          <div className="card-value">-{cart.formatPrice(cart.discount)}</div>
        </div>
        <div className="summary-card shipping">
          <div className="card-label">Vận chuyển</div>
          <div className="card-value">
            {cart.shipping === 0 ? 'Miễn phí' : cart.formatPrice(cart.shipping)}
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="checkout-section">
        <button className="checkout-btn">
          Thanh toán {cart.formatPrice(cart.total)}
        </button>
      </div>

      {/* Debug Info (chỉ để demo) */}
      <details className="debug-info">
        <summary>🔍 Debug Info (Decorator Pattern)</summary>
        <pre>{JSON.stringify(cart, null, 2)}</pre>
      </details>
    </div>
  );
};

export default CartDecoratorDemo;
