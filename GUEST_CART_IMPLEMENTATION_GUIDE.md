# 📘 HƯỚNG DẪN TRIỂN KHAI GIỎ HÀNG KHÁCH VÃNG LAI

## 🎯 Mục tiêu
Cho phép người dùng **không cần đăng nhập** vẫn có thể:
- ✅ Thêm/xóa sản phẩm vào giỏ hàng
- ✅ Cập nhật số lượng sản phẩm
- ✅ Đặt hàng và thanh toán qua VNPay
- ✅ Dữ liệu giỏ hàng lưu trong **Database** (không dùng localStorage)

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### 1. Database Schema

#### Bảng: `GioHangKhachVangLai`
```sql
CREATE TABLE GioHangKhachVangLai (
    ID INT PRIMARY KEY IDENTITY(1,1),
    SessionID NVARCHAR(255) NOT NULL,
    SanPhamID INT NOT NULL,
    SoLuong INT NOT NULL DEFAULT 1,
    DonGia DECIMAL(15,0) NOT NULL DEFAULT 0,
    NgayThem DATETIME NOT NULL DEFAULT GETDATE(),
    NgayCapNhat DATETIME NOT NULL DEFAULT GETDATE(),
    Enable BIT NOT NULL DEFAULT 1,
    
    CONSTRAINT FK_GioHangKhachVangLai_SanPham 
        FOREIGN KEY (SanPhamID) REFERENCES SanPham(ID),
    
    CONSTRAINT UQ_GuestCart_Session_Product 
        UNIQUE (SessionID, SanPhamID)
);

CREATE INDEX IX_GioHangKhachVangLai_SessionID ON GioHangKhachVangLai(SessionID);
CREATE INDEX IX_GioHangKhachVangLai_NgayThem ON GioHangKhachVangLai(NgayThem);
```

**Giải thích:**
- `SessionID`: UUID từ frontend để định danh khách vãng lai
- `Enable`: Soft delete (không xóa vật lý, chỉ đánh dấu không hoạt động)
- `UNIQUE (SessionID, SanPhamID)`: Mỗi session chỉ có 1 record cho 1 sản phẩm

---

## 🔌 API ENDPOINTS

### A. GUEST CART APIs (Không cần Authentication)

#### 1. Lấy giỏ hàng
```http
GET /api/cart/guest?sessionId={uuid}
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy giỏ hàng thành công",
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "items": [
      {
        "id": 1,
        "sanPhamId": 5,
        "soLuong": 2,
        "donGia": 150000,
        "thanhTien": 300000,
        "sanPham": {
          "id": 5,
          "ten": "Xe điều khiển từ xa",
          "giaBan": 150000,
          "ton": 50,
          "hinhAnhURL": "product_5.jpg"
        }
      }
    ],
    "totalItems": 1,
    "totalAmount": 300000
  }
}
```

#### 2. Thêm sản phẩm vào giỏ hàng
```http
POST /api/cart/guest/add
Content-Type: application/json

{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "sanPhamId": 5,
  "soLuong": 1
}
```

#### 3. Tăng 1 đơn vị sản phẩm
```http
PATCH /api/cart/guest/increment/5?sessionId={uuid}
```

#### 4. Giảm 1 đơn vị sản phẩm
```http
PATCH /api/cart/guest/decrement/5?sessionId={uuid}
```

#### 5. Xóa sản phẩm
```http
DELETE /api/cart/guest/remove/5?sessionId={uuid}
```

#### 6. Xóa toàn bộ giỏ hàng
```http
DELETE /api/cart/guest/clear?sessionId={uuid}
```

---

### B. ORDER APIs

#### Tạo đơn hàng cho khách vãng lai
```http
POST /api/orders/guest
Content-Type: application/json

{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "hoTen": "Nguyễn Văn A",
  "email": "nguyenvana@gmail.com",
  "dienThoai": "0912345678",
  "diaChi": "123 Đường ABC",
  "phuongXa": "Phường 1",
  "quanHuyen": "Quận 1",
  "tinhThanh": "TP. Hồ Chí Minh",
  "phuongThucThanhToanId": 2,
  "ghiChu": "Giao hàng buổi sáng"
}
```

**Lưu ý quan trọng:**
- ✅ Giỏ hàng được lấy từ DB dựa trên `sessionId`
- ✅ Không cần truyền `cartItems` từ localStorage
- ✅ Khách vãng lai chỉ được thanh toán qua VNPay (`phuongThucThanhToanId = 2`)

---

## 💻 FRONTEND IMPLEMENTATION

### 1. Tạo/Lấy Session ID (UUID)

```javascript
// utils/sessionManager.js
export const getOrCreateSessionId = () => {
  const SESSION_KEY = 'guest_session_id';
  
  // Kiểm tra localStorage có sessionId chưa
  let sessionId = localStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    // Tạo UUID mới (sử dụng thư viện uuid hoặc tự implement)
    sessionId = crypto.randomUUID(); // Modern browsers
    // Hoặc: sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, ...)
    
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
};

export const clearSessionId = () => {
  localStorage.removeItem('guest_session_id');
};
```

### 2. Cart Service cho Guest User

```javascript
// services/guestCartService.js
import axios from 'axios';
import { getOrCreateSessionId } from '../utils/sessionManager';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:6000/api';

export const guestCartService = {
  // Lấy giỏ hàng
  async getCart() {
    const sessionId = getOrCreateSessionId();
    const response = await axios.get(`${API_URL}/cart/guest`, {
      params: { sessionId }
    });
    return response.data;
  },

  // Thêm sản phẩm
  async addToCart(sanPhamId, soLuong = 1) {
    const sessionId = getOrCreateSessionId();
    const response = await axios.post(`${API_URL}/cart/guest/add`, {
      sessionId,
      sanPhamId,
      soLuong
    });
    return response.data;
  },

  // Tăng số lượng
  async incrementItem(productId) {
    const sessionId = getOrCreateSessionId();
    const response = await axios.patch(
      `${API_URL}/cart/guest/increment/${productId}`,
      null,
      { params: { sessionId } }
    );
    return response.data;
  },

  // Giảm số lượng
  async decrementItem(productId) {
    const sessionId = getOrCreateSessionId();
    const response = await axios.patch(
      `${API_URL}/cart/guest/decrement/${productId}`,
      null,
      { params: { sessionId } }
    );
    return response.data;
  },

  // Xóa sản phẩm
  async removeItem(productId) {
    const sessionId = getOrCreateSessionId();
    const response = await axios.delete(
      `${API_URL}/cart/guest/remove/${productId}`,
      { params: { sessionId } }
    );
    return response.data;
  },

  // Xóa giỏ hàng
  async clearCart() {
    const sessionId = getOrCreateSessionId();
    const response = await axios.delete(`${API_URL}/cart/guest/clear`, {
      params: { sessionId }
    });
    return response.data;
  }
};
```

### 3. Component sử dụng Guest Cart

```javascript
// pages/ProductDetail.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { guestCartService } from '../services/guestCartService';
import { cartService } from '../services/cartService'; // Cho user đã đăng nhập

const ProductDetail = ({ product }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      
      // Kiểm tra user đã đăng nhập chưa
      if (user) {
        // Dùng cart API cho user đã đăng nhập
        await cartService.addToCart(product.ID, 1);
      } else {
        // Dùng guest cart API
        await guestCartService.addToCart(product.ID, 1);
      }
      
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleAddToCart} disabled={loading}>
      {loading ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
    </button>
  );
};
```

### 4. Component Giỏ hàng

```javascript
// pages/Cart.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { guestCartService } from '../services/guestCartService';
import { cartService } from '../services/cartService';

const Cart = () => {
  const { user } = useAuth();
  const [cartData, setCartData] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      
      const response = user 
        ? await cartService.getCart() // User đã đăng nhập
        : await guestCartService.getCart(); // Khách vãng lai
      
      setCartData(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = async (productId) => {
    try {
      if (user) {
        await cartService.incrementItem(productId);
      } else {
        await guestCartService.incrementItem(productId);
      }
      fetchCart(); // Refresh cart
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  // ... tương tự cho decrement, remove, clear

  return (
    <div className="cart-page">
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          <h1>Giỏ hàng của bạn</h1>
          {cartData.items.length === 0 ? (
            <p>Giỏ hàng trống</p>
          ) : (
            <>
              {cartData.items.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onIncrement={() => handleIncrement(item.sanPhamId)}
                  onDecrement={() => handleDecrement(item.sanPhamId)}
                  onRemove={() => handleRemove(item.sanPhamId)}
                />
              ))}
              <div className="cart-total">
                Tổng tiền: {cartData.totalAmount.toLocaleString('vi-VN')} VNĐ
              </div>
              <button onClick={handleCheckout}>Thanh toán</button>
            </>
          )}
        </>
      )}
    </div>
  );
};
```

### 5. Component Checkout cho Guest

```javascript
// pages/GuestCheckout.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { guestCartService } from '../services/guestCartService';
import { orderService } from '../services/orderService';
import { getOrCreateSessionId } from '../utils/sessionManager';

const GuestCheckout = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    dienThoai: '',
    diaChi: '',
    tinhThanh: '',
    quanHuyen: '',
    phuongXa: '',
    ghiChu: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const sessionId = getOrCreateSessionId();
      
      // Tạo đơn hàng (giỏ hàng sẽ được lấy từ DB dựa trên sessionId)
      const response = await orderService.createGuestOrder({
        sessionId,
        ...formData,
        phuongThucThanhToanId: 2 // VNPay
      });
      
      // Chuyển đến trang thanh toán VNPay
      if (response.data.hoaDon) {
        navigate(`/payment/${response.data.hoaDon.id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Thông tin giao hàng</h2>
      
      <input
        type="text"
        placeholder="Họ tên *"
        value={formData.hoTen}
        onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
        required
      />
      
      <input
        type="email"
        placeholder="Email *"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      
      <input
        type="tel"
        placeholder="Số điện thoại *"
        value={formData.dienThoai}
        onChange={(e) => setFormData({ ...formData, dienThoai: e.target.value })}
        required
      />
      
      <input
        type="text"
        placeholder="Địa chỉ *"
        value={formData.diaChi}
        onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
        required
      />
      
      {/* Tỉnh/Thành, Quận/Huyện, Phường/Xã */}
      
      <textarea
        placeholder="Ghi chú (tùy chọn)"
        value={formData.ghiChu}
        onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
      />
      
      <button type="submit">Thanh toán qua VNPay</button>
    </form>
  );
};
```

---

## 🔄 MIGRATION TỪ LOCALSTORAGE SANG DB

### Bước 1: Xóa code sử dụng localStorage

**❌ CŨ (localStorage):**
```javascript
// KHÔNG DÙNG NỮA
const cart = JSON.parse(localStorage.getItem('guestCart')) || [];
localStorage.setItem('guestCart', JSON.stringify(cart));
```

**✅ MỚI (Database):**
```javascript
// Sử dụng API
const cart = await guestCartService.getCart();
```

### Bước 2: Migrate dữ liệu hiện tại (Optional)

```javascript
// utils/migrateGuestCart.js
export const migrateLocalStorageToDb = async () => {
  const localCart = localStorage.getItem('guestCart');
  
  if (!localCart) return;
  
  try {
    const items = JSON.parse(localCart);
    
    // Thêm từng sản phẩm vào DB
    for (const item of items) {
      await guestCartService.addToCart(item.sanPhamId, item.soLuong);
    }
    
    // Xóa localStorage sau khi migrate thành công
    localStorage.removeItem('guestCart');
    console.log('✅ Migration completed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
};

// Gọi trong App.jsx hoặc useEffect
useEffect(() => {
  migrateLocalStorageToDb();
}, []);
```

---

## 🧹 DỌN DẸP DỮ LIỆU CŨ

### Tự động xóa giỏ hàng cũ (>7 ngày)

Backend đã có sẵn method `cleanupOldCarts()` trong model `GioHangKhachVangLai`.

**Cách 1: Chạy Cron Job (Khuyến nghị)**
```javascript
// server.js
const cron = require('node-cron');
const { GioHangKhachVangLai } = require('./models');

// Chạy hàng ngày lúc 2:00 AM
cron.schedule('0 2 * * *', async () => {
  try {
    const deletedCount = await GioHangKhachVangLai.cleanupOldCarts();
    console.log(`🧹 Đã xóa ${deletedCount} giỏ hàng cũ`);
  } catch (error) {
    console.error('❌ Lỗi cleanup:', error);
  }
});
```

**Cách 2: API Endpoint (Cho Admin)**
```javascript
// routes/admin.routes.js
router.post('/cleanup-guest-carts', adminController.cleanupGuestCarts);

// controllers/admin.controller.js
exports.cleanupGuestCarts = async (req, res) => {
  try {
    const deletedCount = await db.GioHangKhachVangLai.cleanupOldCarts();
    res.json({
      success: true,
      message: `Đã xóa ${deletedCount} giỏ hàng cũ`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## ✅ CHECKLIST TRIỂN KHAI

### Backend
- [x] Tạo model `GioHangKhachVangLai`
- [x] Thêm controller methods cho guest cart
- [x] Cập nhật routes (không cần authentication)
- [x] Cập nhật `createGuestOrder` để lấy cart từ DB
- [x] Thêm cleanup cho giỏ hàng cũ

### Database
- [ ] Chạy migration SQL để tạo bảng `GioHangKhachVangLai`
- [ ] Kiểm tra indexes đã được tạo
- [ ] Test constraints và foreign keys

### Frontend
- [ ] Tạo utility `getOrCreateSessionId()`
- [ ] Tạo service `guestCartService`
- [ ] Cập nhật component Cart để hỗ trợ guest
- [ ] Tạo component GuestCheckout
- [ ] Xóa code sử dụng localStorage
- [ ] (Optional) Migrate dữ liệu localStorage cũ

### Testing
- [ ] Test thêm sản phẩm vào giỏ hàng (không đăng nhập)
- [ ] Test tăng/giảm số lượng
- [ ] Test xóa sản phẩm
- [ ] Test đặt hàng thành công
- [ ] Test validation (tồn kho, sản phẩm ngừng kinh doanh)
- [ ] Test cleanup giỏ hàng cũ

---

## 🚨 LƯU Ý QUAN TRỌNG

### 1. Session ID Management
- ✅ Session ID được lưu trong localStorage (chỉ để tracking)
- ✅ Dữ liệu thực tế lưu trong Database
- ✅ Session ID nên là UUID v4 (đảm bảo unique)

### 2. Security
- ✅ Rate limiting đã được áp dụng (50 requests/10 phút)
- ✅ Validation đầy đủ cho input
- ✅ Không cần authentication cho guest cart APIs
- ⚠️ Khách vãng lai CHỈ thanh toán qua VNPay (bắt buộc)

### 3. Performance
- ✅ Indexes đã được tạo cho SessionID và NgayThem
- ✅ Unique constraint tránh duplicate records
- ✅ Soft delete (Enable = false) thay vì hard delete

### 4. Data Consistency
- ✅ Transaction được sử dụng khi tạo đơn hàng
- ✅ Giỏ hàng được xóa sau khi đặt hàng thành công
- ✅ Validation tồn kho trước khi thêm/cập nhật

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, kiểm tra:
1. Database đã có bảng `GioHangKhachVangLai` chưa?
2. Model đã được load trong `models/index.js` chưa?
3. Routes có đúng thứ tự không? (Guest routes phải ĐỂ TRƯỚC middleware `verifyToken`)
4. Frontend có tạo sessionId đúng không?

Happy coding! 🚀
