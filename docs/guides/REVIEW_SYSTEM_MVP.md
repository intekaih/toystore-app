# 📝 HỆ THỐNG ĐÁNH GIÁ SẢN PHẨM SAU KHI MUA HÀNG - MVP

> **Ngày cập nhật:** 20/11/2025  
> **Phiên bản:** 1.0 MVP  
> **Thiết kế theo:** Cấu trúc DB thực tế (8 cột)

---

## 📋 MỤC LỤC

1. [Tổng quan](#-tổng-quan)
2. [Cấu trúc Database](#-cấu-trúc-database)
3. [Luồng hoạt động](#-luồng-hoạt-động)
4. [API Endpoints](#-api-endpoints)
5. [Business Rules](#-business-rules)
6. [Ví dụ sử dụng](#-ví-dụ-sử-dụng)

---

## 🎯 TỔNG QUAN

### Mục tiêu
Hệ thống cho phép khách hàng đánh giá sản phẩm **SAU KHI ĐƠN HÀNG HOÀN THÀNH**, đảm bảo tính xác thực của đánh giá.

### Đặc điểm MVP
- ✅ **Đơn giản:** Chỉ 8 cột, không phức tạp
- ✅ **Bảo mật:** Chỉ người mua mới được đánh giá
- ✅ **Kiểm duyệt:** Admin duyệt trước khi hiển thị
- ✅ **Thống kê:** Tự động cập nhật điểm trung bình

---

## 🗄️ CẤU TRÚC DATABASE

### Bảng DanhGiaSanPham (8 cột)

```sql
CREATE TABLE DanhGiaSanPham (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    SanPhamID INT NOT NULL,              -- Sản phẩm được đánh giá
    TaiKhoanID INT NOT NULL,             -- Người đánh giá
    SoSao INT NOT NULL,                  -- 1-5 sao
    NoiDung NVARCHAR(MAX) NULL,          -- Nội dung đánh giá (optional)
    HinhAnh1 NVARCHAR(500) NULL,         -- 1 hình ảnh minh họa (optional)
    TrangThai NVARCHAR(20) DEFAULT 'ChoDuyet',  -- ChoDuyet/DaDuyet/BiTuChoi
    NgayTao DATETIME DEFAULT GETDATE()   -- Ngày tạo đánh giá
);
```

### Constraints
```sql
-- Số sao từ 1-5
ALTER TABLE DanhGiaSanPham ADD CONSTRAINT CK_DanhGia_SoSao 
    CHECK (SoSao >= 1 AND SoSao <= 5);

-- Trạng thái hợp lệ
ALTER TABLE DanhGiaSanPham ADD CONSTRAINT CK_DanhGia_TrangThai 
    CHECK (TrangThai IN ('ChoDuyet', 'DaDuyet', 'BiTuChoi'));

-- Foreign Keys
ALTER TABLE DanhGiaSanPham ADD CONSTRAINT FK_DanhGia_SanPham 
    FOREIGN KEY(SanPhamID) REFERENCES SanPham(ID);
    
ALTER TABLE DanhGiaSanPham ADD CONSTRAINT FK_DanhGia_TaiKhoan 
    FOREIGN KEY(TaiKhoanID) REFERENCES TaiKhoan(ID);
```

### Indexes
```sql
-- Tối ưu query lấy đánh giá của sản phẩm
CREATE NONCLUSTERED INDEX IX_DanhGia_SanPhamID 
    ON DanhGiaSanPham(SanPhamID, TrangThai, NgayTao DESC);

-- Tối ưu query lấy đánh giá của user
CREATE NONCLUSTERED INDEX IX_DanhGia_TaiKhoanID 
    ON DanhGiaSanPham(TaiKhoanID, NgayTao DESC);
```

---

## 🔄 LUỒNG HOẠT ĐỘNG

### 1️⃣ Khách hàng mua sản phẩm
```
[Đặt hàng] → [Thanh toán] → [Giao hàng] → [Hoàn thành] ✅
```

### 2️⃣ Điều kiện để đánh giá
```javascript
✅ Đơn hàng có TrangThai = 'Hoàn thành'
✅ User chưa đánh giá sản phẩm này
✅ User đã mua sản phẩm (có trong ChiTietHoaDon)
```

### 3️⃣ Quy trình đánh giá
```
[User viết đánh giá] 
    ↓
[TrangThai = 'ChoDuyet'] (mặc định)
    ↓
[Admin duyệt]
    ↓
├─ [Duyệt] → TrangThai = 'DaDuyet' → Hiển thị public
└─ [Từ chối] → TrangThai = 'BiTuChoi' → Không hiển thị
```

### 4️⃣ Cập nhật thống kê
Khi admin duyệt, tự động cập nhật vào bảng `SanPham`:
```sql
UPDATE SanPham SET
    TongSoDanhGia = (COUNT đánh giá đã duyệt),
    DiemTrungBinh = (AVG SoSao của đánh giá đã duyệt)
WHERE ID = @SanPhamID
```

---

## 🌐 API ENDPOINTS

### 📦 USER APIs (Cần đăng nhập)

#### 1. Lấy sản phẩm có thể đánh giá
```http
GET /api/reviews/reviewable-products
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Bạn có 3 sản phẩm có thể đánh giá",
  "data": {
    "products": [
      {
        "hoaDonId": 15,
        "maHD": "HD-20250120-0001",
        "ngayLap": "2025-01-20T10:30:00Z",
        "sanPham": {
          "id": 5,
          "ten": "Lego City Police Station",
          "hinhAnh": "http://localhost:3000/uploads/products/lego-police.jpg",
          "giaBan": 1500000,
          "soLuongDaMua": 2
        }
      }
    ]
  }
}
```

#### 2. Kiểm tra quyền đánh giá
```http
GET /api/reviews/can-review/:sanPhamId
Authorization: Bearer <token>
```

**Response (Có thể đánh giá):**
```json
{
  "success": true,
  "message": "Bạn có thể đánh giá sản phẩm này",
  "data": {
    "canReview": true
  }
}
```

**Response (Đã đánh giá):**
```json
{
  "success": false,
  "message": "Bạn đã đánh giá sản phẩm này rồi",
  "data": {
    "canReview": false,
    "reason": "ALREADY_REVIEWED"
  }
}
```

**Response (Chưa mua):**
```json
{
  "success": false,
  "message": "Bạn chưa mua hoặc đơn hàng chưa hoàn thành",
  "data": {
    "canReview": false,
    "reason": "ORDER_NOT_COMPLETED"
  }
}
```

#### 3. Tạo đánh giá mới
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "sanPhamId": 5,
  "soSao": 5,
  "noiDung": "Sản phẩm rất tốt, con tôi rất thích!",
  "hinhAnh1": "/uploads/reviews/review-123.jpg"  // Optional
}
```

**Validation:**
- `sanPhamId`: Bắt buộc, số nguyên > 0
- `soSao`: Bắt buộc, từ 1-5
- `noiDung`: Optional, văn bản
- `hinhAnh1`: Optional, URL hình ảnh

**Response:**
```json
{
  "success": true,
  "message": "Tạo đánh giá thành công. Đánh giá của bạn đang chờ duyệt.",
  "data": {
    "review": {
      "id": 45,
      "sanPhamId": 5,
      "taiKhoanId": 12,
      "soSao": 5,
      "noiDung": "Sản phẩm rất tốt, con tôi rất thích!",
      "hinhAnh1": "/uploads/reviews/review-123.jpg",
      "trangThai": "ChoDuyet",
      "ngayTao": "2025-01-20T15:30:00Z",
      "taiKhoan": {
        "id": 12,
        "hoTen": "Nguyễn Văn A",
        "email": "nguyenvana@example.com"
      },
      "sanPham": {
        "id": 5,
        "ten": "Lego City Police Station",
        "hinhAnhUrl": "/uploads/products/lego-police.jpg"
      }
    }
  }
}
```

#### 4. Lấy đánh giá của user hiện tại
```http
GET /api/reviews/user/me?page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách đánh giá thành công",
  "data": {
    "reviews": [
      {
        "id": 45,
        "sanPhamId": 5,
        "soSao": 5,
        "noiDung": "Sản phẩm rất tốt!",
        "hinhAnh1": "/uploads/reviews/review-123.jpg",
        "trangThai": "DaDuyet",
        "ngayTao": "2025-01-20T15:30:00Z",
        "sanPham": {
          "id": 5,
          "ten": "Lego City Police Station",
          "hinhAnhUrl": "http://localhost:3000/uploads/products/lego-police.jpg",
          "giaBan": 1500000
        }
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### 🌍 PUBLIC APIs (Không cần đăng nhập)

#### 5. Lấy đánh giá của sản phẩm
```http
GET /api/reviews/product/:sanPhamId?page=1&limit=10&soSao=5
```

**Query Parameters:**
- `page`: Trang hiện tại (default: 1)
- `limit`: Số lượng/trang (default: 10)
- `soSao`: Lọc theo số sao (optional, 1-5)

**Response:**
```json
{
  "success": true,
  "message": "Lấy đánh giá sản phẩm thành công",
  "data": {
    "reviews": [
      {
        "id": 45,
        "soSao": 5,
        "noiDung": "Sản phẩm rất tốt!",
        "hinhAnh1": "/uploads/reviews/review-123.jpg",
        "ngayTao": "2025-01-20T15:30:00Z",
        "taiKhoan": {
          "hoTen": "Nguyễn Văn A"
        }
      }
    ],
    "statistics": {
      "totalReviews": 150,
      "averageRating": 4.65,
      "starCounts": {
        "1": 5,
        "2": 10,
        "3": 20,
        "4": 45,
        "5": 70
      }
    },
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 10,
      "totalPages": 15
    }
  }
}
```

---

### 👑 ADMIN APIs (Cần quyền Admin)

#### 6. Lấy tất cả đánh giá
```http
GET /api/reviews/admin/all?page=1&limit=20&trangThai=ChoDuyet
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page`: Trang hiện tại
- `limit`: Số lượng/trang
- `trangThai`: Lọc theo trạng thái (ChoDuyet/DaDuyet/BiTuChoi)

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách đánh giá thành công",
  "data": {
    "reviews": [
      {
        "id": 45,
        "sanPhamId": 5,
        "taiKhoanId": 12,
        "soSao": 5,
        "noiDung": "Sản phẩm rất tốt!",
        "hinhAnh1": "/uploads/reviews/review-123.jpg",
        "trangThai": "ChoDuyet",
        "ngayTao": "2025-01-20T15:30:00Z",
        "taiKhoan": {
          "id": 12,
          "hoTen": "Nguyễn Văn A",
          "email": "nguyenvana@example.com"
        },
        "sanPham": {
          "id": 5,
          "ten": "Lego City Police Station",
          "hinhAnhUrl": "/uploads/products/lego-police.jpg"
        }
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    }
  }
}
```

#### 7. Duyệt đánh giá
```http
PUT /api/reviews/admin/:id/approve
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Duyệt đánh giá thành công",
  "data": {
    "review": {
      "id": 45,
      "trangThai": "DaDuyet"
    }
  }
}
```

**Side Effects:**
- Cập nhật `TongSoDanhGia` và `DiemTrungBinh` trong bảng `SanPham`
- Đánh giá sẽ hiển thị public

#### 8. Từ chối đánh giá
```http
PUT /api/reviews/admin/:id/reject
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Từ chối đánh giá thành công",
  "data": {
    "review": {
      "id": 45,
      "trangThai": "BiTuChoi"
    }
  }
}
```

---

## 📐 BUSINESS RULES

### Rule 1: Chỉ đánh giá sau khi nhận hàng
```javascript
// ✅ Hợp lệ
HoaDon.TrangThai === 'Hoàn thành'

// ❌ Không hợp lệ
HoaDon.TrangThai === 'Chờ xử lý' | 'Đang giao hàng' | ...
```

### Rule 2: Mỗi user chỉ đánh giá 1 lần/sản phẩm
```sql
-- Kiểm tra trước khi tạo
SELECT * FROM DanhGiaSanPham 
WHERE TaiKhoanID = @userId 
  AND SanPhamID = @productId
```

### Rule 3: Validation số sao
```javascript
// ✅ Hợp lệ
soSao >= 1 && soSao <= 5

// ❌ Không hợp lệ
soSao = 0 | 6 | -1 | null
```

### Rule 4: Trạng thái đánh giá
- **ChoDuyet**: Mặc định khi tạo, không hiển thị public
- **DaDuyet**: Admin đã duyệt, hiển thị public
- **BiTuChoi**: Admin từ chối, không hiển thị public

### Rule 5: Cập nhật thống kê
Chỉ tính đánh giá có `TrangThai = 'DaDuyet'`:
```javascript
TongSoDanhGia = COUNT(đánh giá DaDuyet)
DiemTrungBinh = AVG(SoSao của đánh giá DaDuyet)
```

---

## 💡 VÍ DỤ SỬ DỤNG

### Ví dụ 1: User xem sản phẩm có thể đánh giá

**Tình huống:**
- User A đã mua 3 đơn hàng hoàn thành
- Đơn 1: Sản phẩm X (chưa đánh giá)
- Đơn 2: Sản phẩm Y (đã đánh giá)
- Đơn 3: Sản phẩm X, Z (chưa đánh giá)

**Kết quả:**
```json
{
  "products": [
    { "sanPham": { "id": 1, "ten": "Sản phẩm X" } },  // Chỉ hiện 1 lần
    { "sanPham": { "id": 3, "ten": "Sản phẩm Z" } }
  ]
}
```

### Ví dụ 2: User tạo đánh giá

**Request:**
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "sanPhamId": 5,
    "soSao": 5,
    "noiDung": "Rất hài lòng với sản phẩm!"
  }'
```

**Xử lý backend:**
1. Verify token → lấy `taiKhoanId`
2. Kiểm tra đã đánh giá chưa
3. Kiểm tra đã mua & hoàn thành chưa
4. Tạo đánh giá với `TrangThai = 'ChoDuyet'`
5. Trả về kết quả

### Ví dụ 3: Admin duyệt đánh giá

**Request:**
```bash
curl -X PUT http://localhost:3000/api/reviews/admin/45/approve \
  -H "Authorization: Bearer <admin_token>"
```

**Xử lý backend:**
1. Verify admin token
2. Tìm đánh giá #45
3. Cập nhật `TrangThai = 'DaDuyet'`
4. Gọi `updateProductStatistics(sanPhamId)`
   - Đếm tổng đánh giá `DaDuyet`
   - Tính điểm trung bình
   - Cập nhật vào `SanPham`

### Ví dụ 4: Public xem đánh giá sản phẩm

**Request:**
```bash
curl http://localhost:3000/api/reviews/product/5?soSao=5&page=1&limit=10
```

**SQL Query:**
```sql
SELECT * FROM DanhGiaSanPham
WHERE SanPhamID = 5 
  AND TrangThai = 'DaDuyet'  -- Chỉ lấy đã duyệt
  AND SoSao = 5              -- Lọc 5 sao
ORDER BY NgayTao DESC
OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY
```

---

## ✅ CHECKLIST TRIỂN KHAI

### Backend
- [x] Model `DanhGiaSanPham` (8 cột)
- [x] Controller với 8 APIs
- [x] Routes (public, user, admin)
- [x] Middleware xác thực
- [x] Business logic kiểm tra đơn hàng
- [x] Tự động cập nhật thống kê

### Database
- [x] Tạo bảng với đúng cấu trúc
- [x] Thêm constraints
- [x] Tạo indexes tối ưu
- [x] Test foreign keys

### Testing
- [ ] Test API user (4 endpoints)
- [ ] Test API public (1 endpoint)
- [ ] Test API admin (3 endpoints)
- [ ] Test business rules
- [ ] Test edge cases

### Frontend (TODO)
- [ ] UI danh sách sản phẩm có thể đánh giá
- [ ] Form viết đánh giá (5 sao + textarea + upload ảnh)
- [ ] Hiển thị đánh giá trên trang sản phẩm
- [ ] Admin panel duyệt đánh giá
- [ ] Toast notifications

---

## 🚀 HƯỚNG DẪN TEST

### Test 1: Tạo đánh giá thành công
```javascript
// 1. Tạo đơn hàng hoàn thành
POST /api/orders + cập nhật TrangThai = 'Hoàn thành'

// 2. Tạo đánh giá
POST /api/reviews
{
  "sanPhamId": 1,
  "soSao": 5,
  "noiDung": "Test review"
}

// 3. Kiểm tra DB
SELECT * FROM DanhGiaSanPham WHERE TaiKhoanID = @userId
// Expected: 1 record, TrangThai = 'ChoDuyet'
```

### Test 2: Không cho đánh giá nếu chưa mua
```javascript
POST /api/reviews
{
  "sanPhamId": 999,  // Chưa mua
  "soSao": 5
}

// Expected: 403 Forbidden
// Message: "Bạn chưa mua sản phẩm này..."
```

### Test 3: Không cho đánh giá 2 lần
```javascript
// Lần 1: Thành công
POST /api/reviews { "sanPhamId": 1, "soSao": 5 }

// Lần 2: Thất bại
POST /api/reviews { "sanPhamId": 1, "soSao": 4 }

// Expected: 400 Bad Request
// Message: "Bạn đã đánh giá sản phẩm này rồi"
```

### Test 4: Admin duyệt → cập nhật thống kê
```javascript
// 1. Tạo 3 đánh giá: 5 sao, 4 sao, 3 sao
// 2. Admin duyệt cả 3
PUT /api/reviews/admin/1/approve
PUT /api/reviews/admin/2/approve
PUT /api/reviews/admin/3/approve

// 3. Kiểm tra SanPham
SELECT TongSoDanhGia, DiemTrungBinh FROM SanPham WHERE ID = 1
// Expected: TongSoDanhGia = 3, DiemTrungBinh = 4.00
```

---

## 📞 HỖ TRỢ

### Lỗi thường gặp

#### Lỗi 1: "Bạn chưa mua sản phẩm này"
**Nguyên nhân:** 
- Đơn hàng chưa hoàn thành
- Sản phẩm không có trong `ChiTietHoaDon`

**Giải pháp:**
```sql
-- Kiểm tra trạng thái đơn hàng
SELECT * FROM HoaDon WHERE KhachHangID = @khId

-- Cập nhật thành 'Hoàn thành' nếu cần test
UPDATE HoaDon SET TrangThai = N'Hoàn thành' WHERE ID = @hoaDonId
```

#### Lỗi 2: "Đã đánh giá rồi"
**Nguyên nhân:** 
- User đã tạo đánh giá cho sản phẩm này

**Giải pháp:**
```sql
-- Xóa đánh giá cũ (chỉ khi test)
DELETE FROM DanhGiaSanPham 
WHERE TaiKhoanID = @userId AND SanPhamID = @spId
```

#### Lỗi 3: Thống kê không cập nhật
**Nguyên nhân:** 
- Chỉ tính đánh giá `DaDuyet`
- Function `updateProductStatistics` chưa được gọi

**Giải pháp:**
```javascript
// Gọi thủ công
await updateProductStatistics(sanPhamId);

// Hoặc duyệt lại đánh giá
PUT /api/reviews/admin/:id/approve
```

---

## 📚 TÀI LIỆU THAM KHẢO

- [ORDER_STATE_MANAGEMENT.md](./ORDER_STATE_MANAGEMENT.md) - Quản lý trạng thái đơn hàng
- [DTO_MAPPER_GUIDE.md](./DTO_MAPPER_GUIDE.md) - Chuyển đổi dữ liệu
- [toystore.sql](../db/toystore.sql) - Cấu trúc database đầy đủ

---

**🎉 HỆ THỐNG ĐÁNH GIÁ MVP ĐÃ SẴN SÀNG!**

*Tài liệu này được tạo theo cấu trúc database thực tế (8 cột) để đảm bảo tính nhất quán và dễ triển khai.*
