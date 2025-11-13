# 🚀 ToyStore - Setup Guide

## 📋 Yêu cầu hệ thống

- Node.js >= 14.x
- SQL Server 2019 hoặc mới hơn
- npm hoặc yarn

---

## 🗄️ Bước 1: Setup Database

### 1.1. Tạo Database
```bash
# Mở SQL Server Management Studio (SSMS)
# Chạy file db/toystore.sql
```

**Hoặc dùng sqlcmd:**
```bash
sqlcmd -S localhost -U sa -P your_password -i db/toystore.sql
```

### 1.2. Kiểm tra Database
File `toystore.sql` đã bao gồm:
- ✅ Tất cả các bảng (TaiKhoan, SanPham, HoaDon, v.v.)
- ✅ **Trường mới cho Decorator Pattern** (TienGoc, TienVAT, MaVoucher, v.v.)
- ✅ Dữ liệu mẫu (admin, user, sản phẩm)
- ✅ Views và Stored Procedures

**Không cần chạy migration riêng!** File toystore.sql đã hoàn chỉnh.

---

## 🔧 Bước 2: Setup Backend

```bash
cd backend
npm install
```

### 2.1. Cấu hình Database Connection

Chỉnh sửa `backend/config/db.config.js`:

```javascript
module.exports = {
  HOST: "localhost",
  USER: "sa",
  PASSWORD: "your_password", // ← Thay đổi ở đây
  DATABASE: "ToyStore",
  dialect: "mssql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
```

### 2.2. Chạy Backend

```bash
npm start
# Backend chạy tại: http://localhost:6000
```

---

## 🎨 Bước 3: Setup Frontend

```bash
cd frontend
npm install
npm start
# Frontend chạy tại: http://localhost:3000
```

---

## 🔑 Tài khoản mặc định

### Admin:
- Username: `admin`
- Password: `admin123`

### User:
- Username: `user1`
- Password: `user123`

---

## ✨ Tính năng mới - Decorator Pattern (2025-10-27)

### Database đã được cập nhật với các trường:

| Trường | Kiểu dữ liệu | Mô tả |
|--------|-------------|-------|
| `TienGoc` | DECIMAL(15,0) | Tạm tính (giá trước VAT/voucher) |
| `TienVAT` | DECIMAL(15,0) | Tiền thuế VAT |
| `TyLeVAT` | DECIMAL(5,2) | Tỷ lệ VAT (0.10 = 10%) |
| `MaVoucher` | VARCHAR(50) | Mã voucher đã áp dụng |
| `TienGiamGia` | DECIMAL(15,0) | Số tiền giảm giá |
| `PhiVanChuyen` | DECIMAL(15,0) | Phí vận chuyển |
| `MiemPhiVanChuyen` | BIT | Có miễn phí ship không |

### Công thức tính giá:
```
TongTien = TienGoc + TienVAT - TienGiamGia + PhiVanChuyen
```

### Mã voucher khả dụng (demo):
- `SALE50K` - Giảm 50.000đ
- `MEGA100K` - Giảm 100.000đ
- `DISCOUNT30K` - Giảm 30.000đ
- `FREESHIP` - Giảm 30.000đ (phí ship)

---

## 🧪 Test thử

1. **Đăng nhập** bằng tài khoản user1
2. **Thêm sản phẩm** vào giỏ hàng
3. **Vào trang Checkout** (`/checkout`)
4. **Nhập voucher**: `MEGA100K`
5. Xem **price breakdown** hiển thị:
   - Tạm tính
   - + VAT (10%)
   - - Voucher MEGA100K
   - - Miễn phí vận chuyển (nếu đơn ≥ 500K)
6. **Đặt hàng** và vào **Chi tiết đơn hàng** để kiểm tra giá đã lưu vào DB

---

## 📂 Cấu trúc Project

```
toystore-app/
├── db/
│   ├── toystore.sql                    ← File SQL hoàn chỉnh (chạy file này)
│   └── migration_add_promotion_fields.sql  ← (Optional - chỉ dùng nếu đã có DB cũ)
├── backend/
│   ├── controllers/
│   │   └── order.controller.js         ← Xử lý Decorator Pattern
│   ├── models/
│   │   └── HoaDon.js                   ← Model có trường mới
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── decorators/                 ← Decorator Pattern classes
│   │   ├── pages/
│   │   │   ├── CheckoutPage.js         ← Trang thanh toán
│   │   │   └── OrderDetailPage.js      ← Trang chi tiết đơn hàng
│   │   └── ...
│   └── ...
└── README.md
```

---

## ❓ Troubleshooting

### Lỗi kết nối Database:
```
Error: Login failed for user 'sa'
```
**Giải pháp:** Kiểm tra lại username/password trong `db.config.js`

### Lỗi thiếu trường trong Database:
```
Invalid column name 'TienGoc'
```
**Giải pháp:** Chạy lại file `db/toystore.sql` (file này đã bao gồm tất cả trường mới)

### Backend không start:
```bash
# Kiểm tra port 5000 có bị chiếm không
netstat -ano | findstr :5000

# Kill process nếu cần
taskkill /PID <PID> /F
```

### Frontend không kết nối được Backend:
Kiểm tra file `frontend/src/api/config.js`:
```javascript
export const API_URL = 'http://localhost:6000/api';
```

---

## 📖 Documentation

- **Decorator Pattern Guide:** `backend/DECORATOR_PATTERN_GUIDE.md`
- **Strategy Pattern Guide:** `backend/STRATEGY_PATTERN_GUIDE.md`
- **Singleton Pattern Guide:** `backend/SINGLETON_PATTERN_GUIDE.md`

---

## 🎯 Tính năng chính

- ✅ Authentication (JWT)
- ✅ Quản lý sản phẩm
- ✅ Giỏ hàng
- ✅ **Thanh toán với VAT & Voucher** (Decorator Pattern)
- ✅ **Free Shipping** (đơn hàng ≥ 500K)
- ✅ Lịch sử đơn hàng
- ✅ Admin dashboard
- ✅ VNPay payment gateway

---

## 🤝 Contributors

- **Decorator Pattern Implementation:** 2025-10-27
- Database migration included in `toystore.sql`

---

## 📝 License

MIT License
