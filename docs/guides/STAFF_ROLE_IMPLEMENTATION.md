# 📚 HƯỚNG DẪN TRIỂN KHAI VAI TRÒ NHÂN VIÊN (NhanVien)

## 📋 MỤC LỤC
1. [Tổng quan](#tổng-quan)
2. [Cấu trúc hệ thống](#cấu-trúc-hệ-thống)
3. [Cài đặt và khởi chạy](#cài-đặt-và-khởi-chạy)
4. [Chức năng Nhân viên](#chức-năng-nhân-viên)
5. [API Endpoints](#api-endpoints)
6. [Frontend Routes](#frontend-routes)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 TỔNG QUAN

Hệ thống đã được triển khai đầy đủ vai trò **Nhân viên (NhanVien)** với các quyền và chức năng riêng biệt.

### Phân quyền trong hệ thống:

| Vai trò | Mã (Database) | Quyền hạn |
|---------|---------------|-----------|
| **Admin** | `Admin` | Toàn quyền quản trị hệ thống |
| **Nhân viên** | `NhanVien` | Quản lý đơn hàng, sản phẩm, đánh giá |
| **Khách hàng** | `KhachHang` | Mua sắm, đặt hàng, đánh giá |

---

## 🏗️ CẤU TRÚC HỆ THỐNG

### 📁 Backend

```
backend/
├── controllers/
│   └── staff.controller.js         # Controller cho Nhân viên
├── services/
│   └── staff.service.js            # Business logic cho Nhân viên
├── routes/
│   └── staff.routes.js             # API routes cho Nhân viên
├── middlewares/
│   └── auth.middleware.js          # Phân quyền (requireStaff, requireAdminOrStaff)
└── API_STAFF_MANAGEMENT.md         # Tài liệu API
```

### 📁 Frontend

```
frontend/src/
├── components/
│   └── StaffRoute.js               # Protected route cho Nhân viên
├── pages/
│   ├── StaffDashboard.js           # Dashboard Nhân viên
│   ├── StaffDashboard.css
│   ├── StaffOrderManagementPage.jsx
│   └── StaffOrderManagementPage.css
├── services/
│   └── staffService.js             # API service cho Nhân viên
└── constants/
    └── roles.js                     # Role constants và helpers
```

### 🗄️ Database

```
db/
├── toystore.sql                     # Database chính
└── update_staff_role.sql           # Script cập nhật phân quyền
```

---

## 🚀 CÀI ĐẶT VÀ KHỞI CHẠY

### Bước 1: Cập nhật Database

```bash
# Chạy script cập nhật database
cd db
sqlcmd -S localhost -d toystore -i update_staff_role.sql
```

Hoặc mở SQL Server Management Studio và chạy file `update_staff_role.sql`

**Script này sẽ:**
- ✅ Thêm constraint `NhanVien` vào bảng `LichSuTrangThaiDonHang`
- ✅ Tạo tài khoản nhân viên mẫu: `staff01` / `password123`
- ✅ Kiểm tra và hiển thị thống kê vai trò

### Bước 2: Khởi động Backend

```bash
cd backend
npm install
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

### Bước 3: Khởi động Frontend

```bash
cd frontend
npm install
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

---

## 👨‍💼 CHỨC NĂNG NHÂN VIÊN

### 📊 Dashboard
- Xem tổng quan công việc
- Số đơn hàng chờ xử lý
- Số đơn đang giao hàng
- Đánh giá chờ duyệt
- Sản phẩm sắp hết hàng
- Doanh thu hôm nay

### 📦 Quản lý Đơn hàng
- ✅ Xem danh sách đơn hàng
- ✅ Lọc theo trạng thái
- ✅ Tìm kiếm theo mã đơn hàng
- ✅ Xem chi tiết đơn hàng
- ✅ Cập nhật trạng thái đơn hàng
  - Chờ xử lý → Đã xác nhận
  - Đã xác nhận → Đang giao hàng
  - Đang giao hàng → Đã giao hàng

### 📦 Quản lý Sản phẩm (Giới hạn)
- ✅ Xem danh sách sản phẩm
- ✅ Cập nhật số lượng tồn kho
- ✅ Bật/tắt sản phẩm
- ❌ Không được thêm/xóa sản phẩm (chỉ Admin)

### ⭐ Quản lý Đánh giá
- ✅ Xem đánh giá chờ duyệt
- ✅ Duyệt đánh giá
- ✅ Từ chối đánh giá (với lý do)

### 📊 Thống kê & Báo cáo
- ✅ Xem thống kê đơn hàng
- ✅ Doanh thu theo trạng thái
- ✅ Sản phẩm bán chạy

---

## 🔌 API ENDPOINTS

### Authentication
```http
POST /api/auth/login
```
**Body:**
```json
{
  "username": "staff01",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "user": {
      "ID": 2,
      "TenDangNhap": "staff01",
      "HoTen": "Nhân Viên 1",
      "Email": "staff01@toystore.com",
      "VaiTro": "NhanVien"
    }
  }
}
```

### Quản lý Đơn hàng

**1. Lấy danh sách đơn hàng**
```http
GET /api/staff/orders?page=1&limit=10&trangThai=cho_xac_nhan
Authorization: Bearer <token>
```

**2. Chi tiết đơn hàng**
```http
GET /api/staff/orders/:id
Authorization: Bearer <token>
```

**3. Cập nhật trạng thái**
```http
PUT /api/staff/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "trangThai": "da_xac_nhan",
  "ghiChu": "Đã xác nhận đơn hàng"
}
```

**4. Thống kê đơn hàng**
```http
GET /api/staff/orders-statistics
Authorization: Bearer <token>
```

### Quản lý Sản phẩm

**1. Danh sách sản phẩm**
```http
GET /api/staff/products?page=1&limit=10&keyword=gấu
Authorization: Bearer <token>
```

**2. Cập nhật tồn kho**
```http
PUT /api/staff/products/:id/stock
Authorization: Bearer <token>
Content-Type: application/json

{
  "soLuongTon": 50,
  "ghiChu": "Nhập thêm hàng"
}
```

**3. Cập nhật trạng thái sản phẩm**
```http
PUT /api/staff/products/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "enable": false
}
```

### Quản lý Đánh giá

**1. Đánh giá chờ duyệt**
```http
GET /api/staff/reviews/pending?page=1&limit=10
Authorization: Bearer <token>
```

**2. Duyệt đánh giá**
```http
POST /api/staff/reviews/:id/approve
Authorization: Bearer <token>
```

**3. Từ chối đánh giá**
```http
POST /api/staff/reviews/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "lyDo": "Nội dung không phù hợp"
}
```

### Dashboard

```http
GET /api/staff/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pendingOrders": 15,
    "shippingOrders": 12,
    "pendingReviews": 8,
    "lowStockProducts": 5,
    "todayRevenue": 2500000
  }
}
```

---

## 🖥️ FRONTEND ROUTES

### Public Routes
- `/login` - Đăng nhập (dùng chung cho mọi role)

### Staff Routes (Bảo vệ bởi `StaffRoute`)
- `/staff/dashboard` - Dashboard Nhân viên
- `/staff/orders` - Quản lý đơn hàng
- `/staff/orders/:id` - Chi tiết đơn hàng
- `/staff/products` - Quản lý sản phẩm
- `/staff/reviews` - Quản lý đánh giá
- `/staff/statistics` - Thống kê báo cáo

### Navigation
Khi đăng nhập với tài khoản Nhân viên:
1. Navbar sẽ hiển thị badge "👨‍💼 Nhân viên"
2. Menu dropdown có link "Bảng điều khiển Nhân viên"
3. Click vào sẽ chuyển đến `/staff/dashboard`

---

## 🧪 TESTING

### Test Account

**Tài khoản Nhân viên mẫu:**
```
Username: staff01
Password: password123
```

**Tài khoản Admin (để so sánh):**
```
Username: admin
Password: password123
```

### Test Flow

**1. Đăng nhập:**
```bash
# Sử dụng Postman hoặc cURL
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "staff01",
    "password": "password123"
  }'
```

**2. Lưu token nhận được**

**3. Test Dashboard:**
```bash
curl -X GET http://localhost:5000/api/staff/dashboard \
  -H "Authorization: Bearer <your_token>"
```

**4. Test tính năng:**
- ✅ Lấy danh sách đơn hàng
- ✅ Cập nhật trạng thái đơn hàng
- ✅ Xem danh sách sản phẩm
- ✅ Cập nhật tồn kho
- ✅ Duyệt đánh giá

### Test Authorization

**Test quyền truy cập:**
```bash
# Staff KHÔNG được truy cập admin endpoints
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer <staff_token>"

# Expected: 403 Forbidden
```

---

## 🔧 TROUBLESHOOTING

### Lỗi thường gặp

**1. Lỗi: "Không có quyền truy cập"**
```
Nguyên nhân: Token không hợp lệ hoặc role không đúng
Giải pháp: 
- Kiểm tra token trong header Authorization
- Đảm bảo user có VaiTro = 'NhanVien' hoặc 'Admin'
```

**2. Lỗi: "Token hết hạn"**
```
Nguyên nhân: JWT token đã expire
Giải pháp: Đăng nhập lại để lấy token mới
```

**3. Lỗi database constraint**
```
Nguyên nhân: Chưa chạy script update_staff_role.sql
Giải pháp: Chạy script trong thư mục db/
```

**4. Không thấy menu "Bảng điều khiển Nhân viên"**
```
Nguyên nhân: User không có VaiTro đúng
Giải pháp: 
- Kiểm tra trong database: SELECT VaiTro FROM TaiKhoan WHERE TenDangNhap = 'staff01'
- Phải là 'NhanVien' (viết hoa đúng)
```

**5. Lỗi CORS**
```
Nguyên nhân: Frontend và Backend chạy khác port
Giải pháp: Kiểm tra file backend/.env có CORS_ORIGIN đúng
```

---

## 📊 SO SÁNH QUYỀN HẠN

| Chức năng | Admin | Nhân viên | Khách hàng |
|-----------|-------|-----------|------------|
| Quản lý User | ✅ | ❌ | ❌ |
| Quản lý Danh mục | ✅ | ❌ | ❌ |
| Quản lý Thương hiệu | ✅ | ❌ | ❌ |
| Thêm/Xóa Sản phẩm | ✅ | ❌ | ❌ |
| Cập nhật Tồn kho | ✅ | ✅ | ❌ |
| Bật/Tắt Sản phẩm | ✅ | ✅ | ❌ |
| Xem Đơn hàng | ✅ Tất cả | ✅ Tất cả | ✅ Của mình |
| Cập nhật Trạng thái ĐH | ✅ | ✅ | ❌ |
| Duyệt Đánh giá | ✅ | ✅ | ❌ |
| Thống kê Chi tiết | ✅ | ✅ Giới hạn | ❌ |
| Quản lý Voucher | ✅ | ❌ | ❌ |
| Quản lý Phí Ship | ✅ | ❌ | ❌ |

---

## 🎓 HƯỚNG DẪN SỬ DỤNG CHO NHÂN VIÊN

### Quy trình xử lý đơn hàng:

**1. Đăng nhập:**
- Truy cập: `http://localhost:3000/login`
- Nhập username: `staff01`, password: `password123`

**2. Vào Dashboard:**
- Sau khi đăng nhập, click vào avatar → "Bảng điều khiển Nhân viên"
- Xem tổng quan công việc cần xử lý

**3. Xử lý đơn hàng mới:**
- Click vào "📋 Quản lý đơn hàng" hoặc card "Đơn hàng chờ xử lý"
- Chọn đơn hàng "Chờ xử lý"
- Click "👁️ Xem" để xem chi tiết
- Click "Xác nhận đơn hàng" để chuyển trạng thái

**4. Cập nhật tồn kho:**
- Vào "📦 Quản lý sản phẩm"
- Tìm sản phẩm cần cập nhật
- Nhập số lượng tồn kho mới
- Lưu thay đổi

**5. Duyệt đánh giá:**
- Vào "⭐ Quản lý đánh giá"
- Xem nội dung đánh giá
- Click "Duyệt" hoặc "Từ chối"

---

## 📝 GHI CHÚ

### Bảo mật
- ✅ Tất cả API đều yêu cầu JWT token
- ✅ Middleware kiểm tra role trước khi xử lý
- ✅ Password được hash bằng bcrypt
- ✅ SQL injection được ngăn chặn bằng Sequelize ORM

### Performance
- ✅ API hỗ trợ pagination
- ✅ Database có indexes tối ưu
- ✅ Frontend có lazy loading

### Logging
- ✅ Mọi thao tác đều được ghi log
- ✅ Log file trong `backend/logs/`

---

## 🆘 HỖ TRỢ

**Liên hệ:**
- Email: admin@toystore.com
- Xem thêm: `backend/API_STAFF_MANAGEMENT.md`

**Tài liệu API đầy đủ:**
```
http://localhost:5000/
```

---

## ✅ CHECKLIST TRIỂN KHAI

- [x] Cập nhật database constraint
- [x] Tạo tài khoản nhân viên mẫu
- [x] Backend API hoàn chỉnh
- [x] Frontend Routes
- [x] StaffRoute middleware
- [x] StaffDashboard
- [x] StaffOrderManagement
- [x] Navbar cập nhật
- [x] Testing cơ bản
- [x] Documentation

---

**Version:** 1.0.0  
**Date:** 2025-01-16  
**Author:** Toystore Development Team  
**Status:** ✅ Hoàn thành và sẵn sàng sử dụng

