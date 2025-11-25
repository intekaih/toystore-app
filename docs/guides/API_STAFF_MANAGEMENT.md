# API DOCUMENTATION - STAFF MANAGEMENT
## Quản lý chức năng nhân viên (NhanVien)

---

## 📋 MỤC LỤC
1. [Tổng quan](#tổng-quan)
2. [Authentication](#authentication)
3. [Quản lý đơn hàng](#quản-lý-đơn-hàng)
4. [Quản lý sản phẩm](#quản-lý-sản-phẩm)
5. [Quản lý đánh giá](#quản-lý-đánh-giá)
6. [Dashboard](#dashboard)

---

## 🎯 TỔNG QUAN

API Staff Management cung cấp các chức năng cho nhân viên:
- **Quản lý đơn hàng**: Xem, cập nhật trạng thái đơn hàng
- **Quản lý sản phẩm**: Xem danh sách, cập nhật tồn kho, bật/tắt sản phẩm
- **Quản lý đánh giá**: Duyệt/từ chối đánh giá sản phẩm
- **Dashboard**: Thống kê tổng quan công việc

### Quyền truy cập
- **Role yêu cầu**: `nhanvien` hoặc `admin`
- **Authentication**: JWT Bearer Token
- **Base URL**: `/api/staff`

---

## 🔐 AUTHENTICATION

Tất cả endpoints yêu cầu JWT token trong header:

```http
Authorization: Bearer <your_jwt_token>
```

**Cách lấy token:**
1. Đăng nhập bằng tài khoản có role `nhanvien`
2. Server trả về token trong response
3. Sử dụng token cho các request tiếp theo

---

## 📦 QUẢN LÝ ĐƠN HÀNG

### 1. Lấy danh sách đơn hàng

**Endpoint:** `GET /api/staff/orders`

**Query Parameters:**
- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số đơn hàng mỗi trang (default: 10)
- `trangThai` (optional): Lọc theo trạng thái
  - `cho_xac_nhan`
  - `da_xac_nhan`
  - `dang_giao`
  - `da_giao`
  - `da_huy`
  - `hoan_tra`
- `tuNgay` (optional): Lọc từ ngày (format: YYYY-MM-DD)
- `denNgay` (optional): Lọc đến ngày (format: YYYY-MM-DD)
- `keyword` (optional): Tìm kiếm theo mã đơn hàng

**Example Request:**
```http
GET /api/staff/orders?page=1&limit=10&trangThai=cho_xac_nhan
Authorization: Bearer <token>
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "ID": 1,
        "MaHoaDon": "HD20250116001",
        "IDKhachHang": 5,
        "NgayDatHang": "2025-01-16T10:30:00.000Z",
        "TongTien": 350000,
        "TrangThai": "cho_xac_nhan",
        "DiaChiGiaoHang": "123 Đường ABC, Quận 1, TP.HCM",
        "khachHang": {
          "HoTen": "Nguyễn Văn A",
          "taiKhoan": {
            "Email": "nguyenvana@email.com",
            "SDT": "0901234567"
          }
        },
        "chiTietHoaDons": [
          {
            "IDSanPham": 10,
            "SoLuong": 2,
            "DonGia": 175000,
            "sanPham": {
              "TenSP": "Gấu bông teddy",
              "HinhAnh": "uploads/gau-bong.jpg"
            }
          }
        ]
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

---

### 2. Lấy chi tiết đơn hàng

**Endpoint:** `GET /api/staff/orders/:id`

**Example Request:**
```http
GET /api/staff/orders/1
Authorization: Bearer <token>
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "ID": 1,
    "MaHoaDon": "HD20250116001",
    "IDKhachHang": 5,
    "NgayDatHang": "2025-01-16T10:30:00.000Z",
    "TongTien": 350000,
    "TrangThai": "cho_xac_nhan",
    "DiaChiGiaoHang": "123 Đường ABC, Quận 1, TP.HCM",
    "GhiChu": "",
    "khachHang": {
      "HoTen": "Nguyễn Văn A",
      "taiKhoan": {
        "TenDangNhap": "nguyenvana",
        "Email": "nguyenvana@email.com",
        "HoTen": "Nguyễn Văn A",
        "SDT": "0901234567"
      }
    },
    "chiTietHoaDons": [
      {
        "IDSanPham": 10,
        "SoLuong": 2,
        "DonGia": 175000,
        "ThanhTien": 350000,
        "sanPham": {
          "TenSP": "Gấu bông teddy",
          "HinhAnh": "uploads/gau-bong.jpg",
          "loaiSP": {
            "TenLoai": "Gấu bông"
          }
        }
      }
    ]
  }
}
```

---

### 3. Cập nhật trạng thái đơn hàng

**Endpoint:** `PUT /api/staff/orders/:id/status`

**Request Body:**
```json
{
  "trangThai": "da_xac_nhan",
  "ghiChu": "Đã xác nhận và chuẩn bị hàng"
}
```

**Luồng chuyển trạng thái hợp lệ:**
- `cho_xac_nhan` → `da_xac_nhan`, `da_huy`
- `da_xac_nhan` → `dang_giao`, `da_huy`
- `dang_giao` → `da_giao`, `hoan_tra`
- `da_giao` → `hoan_tra`

**Example Request:**
```http
PUT /api/staff/orders/1/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "trangThai": "da_xac_nhan",
  "ghiChu": "Đã xác nhận đơn hàng"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái đơn hàng thành công",
  "data": {
    "ID": 1,
    "MaHoaDon": "HD20250116001",
    "TrangThai": "da_xac_nhan",
    "GhiChu": "Đã xác nhận đơn hàng"
  }
}
```

---

### 4. Thống kê đơn hàng

**Endpoint:** `GET /api/staff/orders-statistics`

**Example Request:**
```http
GET /api/staff/orders-statistics
Authorization: Bearer <token>
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "byStatus": [
      {
        "TrangThai": "cho_xac_nhan",
        "soLuong": 15,
        "tongTien": 5250000
      },
      {
        "TrangThai": "da_xac_nhan",
        "soLuong": 8,
        "tongTien": 3200000
      },
      {
        "TrangThai": "dang_giao",
        "soLuong": 12,
        "tongTien": 4800000
      },
      {
        "TrangThai": "da_giao",
        "soLuong": 45,
        "tongTien": 18500000
      }
    ],
    "summary": {
      "totalOrders": 80,
      "totalRevenue": 18500000
    }
  }
}
```

---

## 🏷️ QUẢN LÝ SẢN PHẨM

### 1. Lấy danh sách sản phẩm

**Endpoint:** `GET /api/staff/products`

**Query Parameters:**
- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số sản phẩm mỗi trang (default: 10)
- `idLoai` (optional): Lọc theo ID loại sản phẩm
- `keyword` (optional): Tìm kiếm theo tên hoặc mô tả
- `trangThai` (optional): Lọc theo trạng thái (`active` hoặc `inactive`)

**Example Request:**
```http
GET /api/staff/products?page=1&limit=10&keyword=gấu&trangThai=active
Authorization: Bearer <token>
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "ID": 10,
        "TenSP": "Gấu bông teddy",
        "MoTa": "Gấu bông mềm mại, đáng yêu",
        "GiaBan": 175000,
        "SoLuongTon": 25,
        "HinhAnh": "uploads/gau-bong.jpg",
        "Enable": 1,
        "IDLoai": 2,
        "loaiSP": {
          "TenLoai": "Gấu bông"
        }
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

### 2. Cập nhật tồn kho sản phẩm

**Endpoint:** `PUT /api/staff/products/:id/stock`

**Request Body:**
```json
{
  "soLuongTon": 50,
  "ghiChu": "Nhập thêm 25 sản phẩm từ nhà cung cấp"
}
```

**Example Request:**
```http
PUT /api/staff/products/10/stock
Authorization: Bearer <token>
Content-Type: application/json

{
  "soLuongTon": 50,
  "ghiChu": "Nhập thêm hàng"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Cập nhật số lượng tồn kho thành công",
  "data": {
    "ID": 10,
    "TenSP": "Gấu bông teddy",
    "SoLuongTon": 50
  }
}
```

---

### 3. Cập nhật trạng thái sản phẩm

**Endpoint:** `PUT /api/staff/products/:id/status`

**Request Body:**
```json
{
  "enable": false
}
```

**Example Request:**
```http
PUT /api/staff/products/10/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "enable": false
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Vô hiệu hóa sản phẩm thành công",
  "data": {
    "ID": 10,
    "TenSP": "Gấu bông teddy",
    "Enable": 0
  }
}
```

---

## ⭐ QUẢN LÝ ĐÁNH GIÁ

### 1. Lấy danh sách đánh giá chờ duyệt

**Endpoint:** `GET /api/staff/reviews/pending`

**Query Parameters:**
- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số đánh giá mỗi trang (default: 10)

**Example Request:**
```http
GET /api/staff/reviews/pending?page=1&limit=10
Authorization: Bearer <token>
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "ID": 5,
        "IDSanPham": 10,
        "IDKhachHang": 3,
        "SoSao": 5,
        "NoiDung": "Sản phẩm rất đẹp và chất lượng",
        "NgayDanhGia": "2025-01-16T08:30:00.000Z",
        "TrangThai": "pending",
        "sanPham": {
          "TenSP": "Gấu bông teddy",
          "HinhAnh": "uploads/gau-bong.jpg"
        },
        "khachHang": {
          "taiKhoan": {
            "HoTen": "Trần Thị B",
            "Email": "tranthib@email.com"
          }
        }
      }
    ],
    "pagination": {
      "total": 8,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### 2. Duyệt đánh giá

**Endpoint:** `POST /api/staff/reviews/:id/approve`

**Example Request:**
```http
POST /api/staff/reviews/5/approve
Authorization: Bearer <token>
```

**Example Response:**
```json
{
  "success": true,
  "message": "Duyệt đánh giá thành công",
  "data": {
    "ID": 5,
    "TrangThai": "approved"
  }
}
```

---

### 3. Từ chối đánh giá

**Endpoint:** `POST /api/staff/reviews/:id/reject`

**Request Body:**
```json
{
  "lyDo": "Nội dung không phù hợp"
}
```

**Example Request:**
```http
POST /api/staff/reviews/5/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "lyDo": "Nội dung vi phạm quy định"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Từ chối đánh giá thành công",
  "data": {
    "ID": 5,
    "TrangThai": "rejected",
    "LyDoTuChoi": "Nội dung vi phạm quy định"
  }
}
```

---

## 📊 DASHBOARD

### Lấy thống kê tổng quan

**Endpoint:** `GET /api/staff/dashboard`

**Example Request:**
```http
GET /api/staff/dashboard
Authorization: Bearer <token>
```

**Example Response:**
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

**Giải thích:**
- `pendingOrders`: Số đơn hàng chờ xác nhận
- `shippingOrders`: Số đơn hàng đang giao
- `pendingReviews`: Số đánh giá chờ duyệt
- `lowStockProducts`: Số sản phẩm sắp hết hàng (< 10)
- `todayRevenue`: Doanh thu hôm nay

---

## 🚨 ERROR RESPONSES

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Không tìm thấy token xác thực"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Bạn không có quyền truy cập. Yêu cầu quyền nhân viên."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Không tìm thấy đơn hàng"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Thiếu thông tin đơn hàng hoặc trạng thái"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Lỗi server khi xử lý yêu cầu"
}
```

---

## 📝 NOTES

1. **Authentication**: Tất cả endpoints yêu cầu JWT token hợp lệ
2. **Role**: Chỉ tài khoản có role `nhanvien` hoặc `admin` mới truy cập được
3. **Pagination**: Hỗ trợ phân trang với `page` và `limit`
4. **Logging**: Mọi thao tác đều được ghi log với thông tin nhân viên
5. **Validation**: Kiểm tra dữ liệu đầu vào nghiêm ngặt
6. **Transaction**: Các thao tác quan trọng sử dụng database transaction

---

## 🔧 TESTING

### Tạo tài khoản nhân viên test
```sql
INSERT INTO TaiKhoan (TenDangNhap, MatKhau, Email, HoTen, VaiTro, Enable)
VALUES ('nhanvien1', 'hashed_password', 'staff@toystore.com', 'Nhân Viên 1', 'nhanvien', 1);
```

### Test với Postman/Thunder Client
1. Login để lấy token
2. Thêm token vào header: `Authorization: Bearer <token>`
3. Test các endpoints theo thứ tự:
   - Dashboard (kiểm tra quyền truy cập)
   - Danh sách đơn hàng
   - Chi tiết đơn hàng
   - Cập nhật trạng thái
   - Quản lý sản phẩm
   - Quản lý đánh giá

---

**Created:** 2025-01-16  
**Version:** 1.0.0  
**Author:** Toystore Development Team
