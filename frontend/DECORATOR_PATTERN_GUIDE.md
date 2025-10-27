# 🎨 Decorator Pattern - Frontend React Guide

## 📋 Mục lục
1. [Giới thiệu](#giới-thiệu)
2. [Cấu trúc thư mục Frontend](#cấu-trúc-thư-mục)
3. [Các Decorator Classes](#các-decorator-classes)
4. [React Hook - useCartDecorator](#react-hook)
5. [Cách sử dụng trong Component](#cách-sử-dụng)
6. [Demo Component](#demo-component)
7. [Tích hợp vào dự án thực tế](#tích-hợp-thực-tế)
8. [Best Practices](#best-practices)

---

## 🎯 Giới thiệu {#giới-thiệu}

**Decorator Pattern trong Frontend React** được sử dụng để tính giá giỏ hàng một cách linh hoạt với các yếu tố:
- 💰 **VAT (10%)** - Thuế giá trị gia tăng
- 🎫 **Voucher** - Mã giảm giá
- 🚚 **Free Shipping** - Miễn phí vận chuyển

### Điểm khác biệt so với Backend:
- ✅ Tương thích với React hooks & components
- ✅ Sử dụng `useMemo` để tối ưu performance
- ✅ Format giá theo VNĐ tự động
- ✅ Trả về `priceBreakdown` để hiển thị chi tiết
- ✅ Hỗ trợ real-time UI update

---

## 📁 Cấu trúc thư mục Frontend {#cấu-trúc-thư-mục}

```
frontend/src/
├── decorators/
│   ├── BaseCartItem.js              # ⭐ Component gốc
│   ├── CartItemDecorator.js         # 🎨 Base Decorator
│   ├── VATDecorator.js              # 💰 VAT decorator
│   ├── VoucherDecorator.js          # 🎫 Voucher decorator
│   ├── FreeShippingDecorator.js     # 🚚 Free shipping decorator
│   ├── useCartDecorator.js          # 🎣 Custom React Hook
│   └── index.js                     # 📦 Exports
│
└── components/
    ├── CartDecoratorDemo.jsx        # 🎮 Demo component
    └── CartDecoratorDemo.css        # 🎨 Styles
```

---

## 🧱 Các Decorator Classes {#các-decorator-classes}

### 1️⃣ BaseCartItem.js - Component Gốc

**Khác biệt so với Backend:**

```javascript
// Backend nhận: (name, basePrice, quantity)
const item = new BaseCartItem('Xe đồ chơi', 200000, 1);

// Frontend nhận: (cartData object từ API)
const item = new BaseCartItem({
  MaSP: 1,
  TenSP: 'Xe đồ chơi',
  Gia: 200000,
  SoLuong: 1,
  HinhAnh: '/images/toy.jpg'
});
```

**Method đặc biệt:**

```javascript
// 1. formatPrice() - Format theo VNĐ
item.formatPrice(200000); // "200.000 ₫"

// 2. getDetails() - Trả về object cho React
const details = item.getDetails();
// {
//   id: 1,
//   name: "Xe đồ chơi",
//   quantity: 1,
//   basePrice: 200000,
//   finalPrice: 200000,
//   image: "/images/toy.jpg",
//   description: "Xe đồ chơi (x1)",
//   priceBreakdown: []
// }
```

---

### 2️⃣ VATDecorator.js - Thuế VAT

**Điểm mạnh:**

```javascript
import { VATDecorator } from './decorators';

let item = new BaseCartItem(cartData);
item = new VATDecorator(item, 0.1); // 10%

const details = item.getDetails();
console.log(details.priceBreakdown);
// [
//   {
//     type: 'vat',
//     label: 'VAT (10%)',
//     amount: 20000,
//     isAddition: true // Để UI biết hiển thị dấu "+"
//   }
// ]
```

**Sử dụng trong JSX:**

```jsx
{details.priceBreakdown.map(item => (
  <div key={item.type}>
    <span>{item.label}</span>
    <span className={item.isAddition ? 'add' : 'subtract'}>
      {item.isAddition ? '+' : '-'} {formatPrice(item.amount)}
    </span>
  </div>
))}
```

---

### 3️⃣ VoucherDecorator.js - Mã Giảm Giá

**Tích hợp với state:**

```jsx
const [voucher, setVoucher] = useState(null);

// Khi user apply voucher
const handleApplyVoucher = (code) => {
  const discount = validateVoucher(code); // API call
  setVoucher({ code, discount });
};

// Hook tự động apply
const cart = useCartDecorator(cartItems, { voucher });
```

---

### 4️⃣ FreeShippingDecorator.js - Miễn Phí Ship

**UI thông minh:**

```javascript
const details = item.getDetails();

if (details.freeShipping) {
  const { isEligible, remaining, savedAmount } = details.freeShipping;
  
  if (isEligible) {
    // Hiển thị: "🎉 Miễn phí ship! Tiết kiệm 30.000₫"
  } else {
    // Hiển thị: "🚚 Mua thêm 150.000₫ để được miễn phí ship"
  }
}
```

---

## 🎣 React Hook - useCartDecorator {#react-hook}

### Signature:

```javascript
const cart = useCartDecorator(cartItems, options);
```

### Parameters:

| Param | Type | Default | Mô tả |
|-------|------|---------|-------|
| `cartItems` | Array | `[]` | Mảng sản phẩm từ API |
| `options.applyVAT` | Boolean | `true` | Có áp dụng VAT không |
| `options.vatRate` | Number | `0.1` | Tỷ lệ VAT (10%) |
| `options.voucher` | Object | `null` | `{ code, discount }` |
| `options.enableFreeShipping` | Boolean | `true` | Kiểm tra free ship |
| `options.shippingFee` | Number | `20000` | Phí ship (VNĐ) |
| `options.minOrderForFreeShip` | Number | `500000` | Đơn tối thiểu |

### Returns:

```javascript
{
  items: [],           // Danh sách items đã decorated
  subtotal: 0,        // Tổng giá gốc
  vat: 0,             // Tổng VAT
  discount: 0,        // Tổng giảm giá
  shipping: 0,        // Phí ship (0 nếu free)
  total: 0,           // Tổng cuối cùng
  priceBreakdown: [], // Chi tiết từng khoản
  freeShippingInfo: {
    isEligible: false,
    remaining: 100000,
    savedAmount: 0
  },
  formatPrice: (price) => string // Helper function
}
```

### Ví dụ sử dụng cơ bản:

```jsx
import { useCartDecorator } from './decorators/useCartDecorator';

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [voucher, setVoucher] = useState(null);

  // Áp dụng Decorator Pattern
  const cart = useCartDecorator(cartItems, {
    applyVAT: true,
    voucher: voucher,
    enableFreeShipping: true
  });

  return (
    <div>
      <h2>Tổng: {cart.formatPrice(cart.total)}</h2>
      
      {/* Hiển thị chi tiết */}
      {cart.priceBreakdown.map((item, index) => (
        <div key={index}>
          <span>{item.label}</span>
          <span>{cart.formatPrice(item.amount)}</span>
        </div>
      ))}
      
      {/* Free shipping banner */}
      {cart.freeShippingInfo && !cart.freeShippingInfo.isEligible && (
        <p>Mua thêm {cart.formatPrice(cart.freeShippingInfo.remaining)}</p>
      )}
    </div>
  );
}
```

---

## 🚀 Cách sử dụng trong Component {#cách-sử-dụng}

### Ví dụ 1: Cart Page đơn giản

```jsx
import React, { useState, useEffect } from 'react';
import { useCartDecorator } from '../decorators/useCartDecorator';
import { getCart } from '../api/cartApi';

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cart từ API
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await getCart();
        setCartItems(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // Áp dụng Decorator Pattern
  const cart = useCartDecorator(cartItems, {
    applyVAT: true,
    vatRate: 0.1,
    enableFreeShipping: true,
    shippingFee: 30000,
    minOrderForFreeShip: 500000
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="cart-page">
      <h1>Giỏ hàng ({cart.items.length})</h1>
      
      {/* Danh sách sản phẩm */}
      {cart.items.map(item => (
        <div key={item.id} className="cart-item">
          <img src={item.image} alt={item.name} />
          <div>
            <h3>{item.name}</h3>
            <p>Số lượng: {item.quantity}</p>
            <p>Giá: {cart.formatPrice(item.finalPrice)}</p>
          </div>
        </div>
      ))}

      {/* Price Summary */}
      <div className="price-summary">
        <h3>Thanh toán</h3>
        {cart.priceBreakdown.map((item, index) => (
          <div key={index} className="price-row">
            <span>{item.label}</span>
            <span className={item.isAddition ? 'add' : 'subtract'}>
              {item.isAddition ? '+' : '-'} {cart.formatPrice(item.amount)}
            </span>
          </div>
        ))}
        <div className="total">
          <strong>Tổng cộng:</strong>
          <strong>{cart.formatPrice(cart.total)}</strong>
        </div>
      </div>

      <button className="checkout-btn">
        Thanh toán {cart.formatPrice(cart.total)}
      </button>
    </div>
  );
}
```

---

### Ví dụ 2: Tích hợp Voucher System

```jsx
function CartWithVoucher() {
  const [cartItems, setCartItems] = useState([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');

  // Áp dụng decorator với voucher
  const cart = useCartDecorator(cartItems, {
    voucher: appliedVoucher,
    applyVAT: true
  });

  // Validate và apply voucher
  const handleApplyVoucher = async () => {
    try {
      // Gọi API validate voucher
      const response = await validateVoucher(voucherCode);
      
      if (response.success) {
        setAppliedVoucher({
          code: voucherCode,
          discount: response.discount
        });
        setVoucherError('');
        alert('✅ Áp dụng voucher thành công!');
      } else {
        setVoucherError('Mã voucher không hợp lệ');
      }
    } catch (error) {
      setVoucherError('Lỗi khi áp dụng voucher');
    }
  };

  // Remove voucher
  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
  };

  return (
    <div>
      {/* Voucher input */}
      <div className="voucher-section">
        {!appliedVoucher ? (
          <>
            <input
              type="text"
              placeholder="Nhập mã voucher"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
            />
            <button onClick={handleApplyVoucher}>Áp dụng</button>
            {voucherError && <p className="error">{voucherError}</p>}
          </>
        ) : (
          <div className="voucher-applied">
            <span>✅ {appliedVoucher.code}</span>
            <span>-{cart.formatPrice(appliedVoucher.discount)}</span>
            <button onClick={handleRemoveVoucher}>Xóa</button>
          </div>
        )}
      </div>

      {/* Hiển thị tổng với voucher đã áp dụng */}
      <div className="total">
        Tổng: {cart.formatPrice(cart.total)}
        {cart.discount > 0 && (
          <small> (Đã giảm {cart.formatPrice(cart.discount)})</small>
        )}
      </div>
    </div>
  );
}
```

---

### Ví dụ 3: Free Shipping Progress Bar

```jsx
function FreeShippingProgress({ cart }) {
  const { freeShippingInfo } = cart;
  
  if (!freeShippingInfo) return null;

  const { isEligible, minOrderValue, remaining } = freeShippingInfo;
  const currentValue = minOrderValue - remaining;
  const percentage = (currentValue / minOrderValue) * 100;

  return (
    <div className="free-shipping-progress">
      {isEligible ? (
        <div className="success">
          <span>🎉</span>
          <span>Bạn được miễn phí vận chuyển!</span>
        </div>
      ) : (
        <>
          <p>
            Mua thêm <strong>{cart.formatPrice(remaining)}</strong> 
            {' '}để được miễn phí ship
          </p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="progress-text">
            {cart.formatPrice(currentValue)} / {cart.formatPrice(minOrderValue)}
          </p>
        </>
      )}
    </div>
  );
}

// Sử dụng:
<FreeShippingProgress cart={cart} />
```

---

## 🎮 Demo Component {#demo-component}

Demo component đã được tạo tại:
- **File:** `src/components/CartDecoratorDemo.jsx`
- **CSS:** `src/components/CartDecoratorDemo.css`

### Chạy demo:

```jsx
// Trong App.js
import CartDecoratorDemo from './components/CartDecoratorDemo';

function App() {
  return (
    <div>
      <CartDecoratorDemo />
    </div>
  );
}
```

### Features trong demo:

✅ Danh sách sản phẩm với giá  
✅ Input voucher với validation  
✅ Free shipping progress banner  
✅ Price breakdown chi tiết  
✅ Summary cards (Subtotal, VAT, Discount, Shipping)  
✅ Responsive design  
✅ Debug panel (JSON output)  

---

## 🔧 Tích hợp vào dự án thực tế {#tích-hợp-thực-tế}

### Bước 1: Import decorators

```jsx
// Trong CartPage.jsx hoặc CheckoutPage.jsx
import { useCartDecorator } from '../decorators/useCartDecorator';
```

### Bước 2: Lấy dữ liệu từ API

```jsx
import { getCart } from '../api/cartApi';

const [cartItems, setCartItems] = useState([]);

useEffect(() => {
  const fetchCart = async () => {
    const response = await getCart(); // API call
    setCartItems(response.data.items); // Giả sử response có structure này
  };
  fetchCart();
}, []);
```

### Bước 3: Apply decorators

```jsx
const cart = useCartDecorator(cartItems, {
  applyVAT: true,
  voucher: appliedVoucher, // State từ voucher form
  enableFreeShipping: true
});
```

### Bước 4: Render UI

```jsx
return (
  <div>
    {/* Items */}
    {cart.items.map(item => (
      <CartItemCard key={item.id} item={item} formatPrice={cart.formatPrice} />
    ))}

    {/* Price Summary */}
    <PriceSummary cart={cart} />

    {/* Free Shipping Banner */}
    <FreeShippingBanner cart={cart} />

    {/* Checkout Button */}
    <button onClick={handleCheckout}>
      Thanh toán {cart.formatPrice(cart.total)}
    </button>
  </div>
);
```

### Bước 5: Tạo reusable components

```jsx
// components/PriceSummary.jsx
export function PriceSummary({ cart }) {
  return (
    <div className="price-summary">
      {cart.priceBreakdown.map((item, index) => (
        <div key={index} className="price-row">
          <span>{item.label}</span>
          <span className={item.isAddition ? 'add' : 'subtract'}>
            {item.isAddition ? '+' : '-'} {cart.formatPrice(item.amount)}
          </span>
        </div>
      ))}
      <div className="total">
        <strong>Tổng:</strong>
        <strong>{cart.formatPrice(cart.total)}</strong>
      </div>
    </div>
  );
}
```

---

## ✅ Best Practices {#best-practices}

### 1️⃣ Tối ưu Performance với useMemo

Hook `useCartDecorator` đã sử dụng `useMemo` để tránh tính toán lại không cần thiết:

```javascript
const decoratedCart = useMemo(() => {
  // Logic phức tạp tính giá
}, [cartItems, applyVAT, vatRate, voucher, ...]);
```

**Kết quả:** Chỉ re-calculate khi dependencies thay đổi.

---

### 2️⃣ Tách logic ra khỏi component

```jsx
// ❌ BAD: Logic trong component
function Cart() {
  const [total, setTotal] = useState(0);
  
  useEffect(() => {
    let sum = 0;
    cartItems.forEach(item => {
      let price = item.Gia * item.SoLuong;
      price += price * 0.1; // VAT
      if (voucher) price -= voucher.discount;
      sum += price;
    });
    setTotal(sum);
  }, [cartItems, voucher]);
  
  // ... JSX
}

// ✅ GOOD: Dùng hook
function Cart() {
  const cart = useCartDecorator(cartItems, { voucher });
  
  return <div>Tổng: {cart.formatPrice(cart.total)}</div>;
}
```

---

### 3️⃣ Type Safety với PropTypes hoặc TypeScript

```jsx
// Với PropTypes
import PropTypes from 'prop-types';

PriceSummary.propTypes = {
  cart: PropTypes.shape({
    total: PropTypes.number.isRequired,
    priceBreakdown: PropTypes.arrayOf(PropTypes.object),
    formatPrice: PropTypes.func.isRequired
  }).isRequired
};

// Hoặc với TypeScript
interface Cart {
  total: number;
  priceBreakdown: PriceBreakdownItem[];
  formatPrice: (price: number) => string;
}
```

---

### 4️⃣ Error Handling

```jsx
const cart = useCartDecorator(cartItems, options);

// Kiểm tra empty cart
if (!cart.items || cart.items.length === 0) {
  return <EmptyCartMessage />;
}

// Kiểm tra free shipping
if (cart.freeShippingInfo) {
  // Safe to use
}
```

---

### 5️⃣ Testing

```jsx
// __tests__/useCartDecorator.test.js
import { renderHook } from '@testing-library/react-hooks';
import { useCartDecorator } from '../decorators/useCartDecorator';

describe('useCartDecorator', () => {
  it('should calculate VAT correctly', () => {
    const cartItems = [
      { MaSP: 1, TenSP: 'Test', Gia: 100000, SoLuong: 1 }
    ];
    
    const { result } = renderHook(() => 
      useCartDecorator(cartItems, { applyVAT: true, vatRate: 0.1 })
    );
    
    expect(result.current.vat).toBe(10000);
    expect(result.current.total).toBe(110000);
  });

  it('should apply voucher correctly', () => {
    const cartItems = [
      { MaSP: 1, TenSP: 'Test', Gia: 200000, SoLuong: 1 }
    ];
    
    const voucher = { code: 'TEST50K', discount: 50000 };
    
    const { result } = renderHook(() => 
      useCartDecorator(cartItems, { 
        applyVAT: false, 
        voucher 
      })
    );
    
    expect(result.current.discount).toBe(50000);
    expect(result.current.total).toBe(150000);
  });
});
```

---

## 🎯 So sánh Backend vs Frontend

| Khía cạnh | Backend | Frontend |
|-----------|---------|----------|
| **Input** | `new BaseCartItem(name, price, qty)` | `new BaseCartItem(apiData)` |
| **Output** | `getPrice()` → number | `getDetails()` → object |
| **Format giá** | Không có | `formatPrice()` VNĐ |
| **React Hook** | Không | `useCartDecorator` |
| **Performance** | N/A | `useMemo` optimization |
| **UI Support** | Không | `priceBreakdown`, `freeShippingInfo` |

---

## 📚 Kết luận

**Decorator Pattern trong Frontend React:**

✅ **Tách logic tính giá** ra khỏi UI components  
✅ **Dễ test** với Jest & React Testing Library  
✅ **Performance tốt** nhờ `useMemo`  
✅ **Type-safe** với PropTypes/TypeScript  
✅ **Reusable** ở nhiều pages (Cart, Checkout, Order)  
✅ **Maintainable** - thêm decorator mới không sửa code cũ  

---

## 🔗 Files quan trọng

- `src/decorators/useCartDecorator.js` - Custom hook chính
- `src/components/CartDecoratorDemo.jsx` - Demo component
- `src/decorators/index.js` - Central exports

---

*Tạo bởi: Decorator Pattern Frontend Implementation*  
*Ngày: October 26, 2025*
