# ✅ HOÀN THIỆN CÁC CHỨC NĂNG BACKEND DỰA VÀO DATABASE

## 📋 Tổng quan các chức năng đã hoàn thiện

Dựa vào file database `db/toystore.sql`, tôi đã hoàn thiện các chức năng Backend còn thiếu:

### 1. ✅ Chức năng CHỌN SẢN PHẨM trong giỏ hàng (Cột `DaChon`)

Database đã có sẵn cột `DaChon` (BIT) trong 2 bảng:
- `GioHangChiTiet` - cho user đã đăng nhập
- `GioHangKhachVangLai` - cho khách vãng lai

**Backend Controller đã thêm:**
- `toggleSelectItem` - Chọn/bỏ chọn 1 sản phẩm (USER)
- `toggleSelectGuestItem` - Chọn/bỏ chọn 1 sản phẩm (GUEST)
- `toggleSelectAll` - Chọn/bỏ chọn tất cả (USER)
- `toggleSelectAllGuest` - Chọn/bỏ chọn tất cả (GUEST)
- `getSelectedItems` - Lấy danh sách sản phẩm đã chọn (USER)
- `getSelectedGuestItems` - Lấy danh sách sản phẩm đã chọn (GUEST)

**Routes đã thêm:**
```javascript
// USER (cần đăng nhập)
PUT  /api/cart/select/:productId     - Chọn/bỏ chọn 1 sản phẩm
PUT  /api/cart/select-all            - Chọn/bỏ chọn tất cả
GET  /api/cart/selected              - Lấy sản phẩm đã chọn

// GUEST (không cần đăng nhập)
PUT  /api/cart/guest/select/:productId  - Chọn/bỏ chọn 1 sản phẩm
PUT  /api/cart/guest/select-all         - Chọn/bỏ chọn tất cả
GET  /api/cart/guest/selected           - Lấy sản phẩm đã chọn
```

---

## 🎯 Cách sử dụng các API mới

### A. Chọn/Bỏ chọn 1 sản phẩm

#### USER (đã đăng nhập):
```http
PUT /api/cart/select/5
Authorization: Bearer <token>
Content-Type: application/json

{
  "selected": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã chọn sản phẩm",
  "data": {
    "productId": 5,
    "selected": true
  }
}
```

#### GUEST (chưa đăng nhập):
```http
PUT /api/cart/guest/select/5
Content-Type: application/json

{
  "sessionId": "guest_abc123",
  "selected": true
}
```

---

### B. Chọn/Bỏ chọn tất cả sản phẩm

#### USER:
```http
PUT /api/cart/select-all
Authorization: Bearer <token>
Content-Type: application/json

{
  "selected": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã chọn tất cả sản phẩm",
  "data": {
    "updatedCount": 5,
    "selected": true
  }
}
```

#### GUEST:
```http
PUT /api/cart/guest/select-all
Content-Type: application/json

{
  "sessionId": "guest_abc123",
  "selected": true
}
```

---

### C. Lấy danh sách sản phẩm đã chọn

#### USER:
```http
GET /api/cart/selected
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách sản phẩm đã chọn thành công",
  "data": {
    "items": [
      {
        "ID": 10,
        "SanPhamID": 5,
        "SoLuong": 2,
        "DonGia": "250000.00",
        "DaChon": true,
        "thanhTien": 500000,
        "sanPham": {
          "ID": 5,
          "Ten": "Xe điều khiển từ xa",
          "GiaBan": "250000.00",
          "HinhAnhURL": "/uploads/xe.jpg",
          "Ton": 50
        }
      }
    ],
    "totalItems": 1,
    "totalAmount": 500000
  }
}
```

#### GUEST:
```http
GET /api/cart/guest/selected?sessionId=guest_abc123
```

---

## 📊 Database Schema đã tối ưu

### Bảng `GioHangChiTiet`:
```sql
CREATE TABLE GioHangChiTiet (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    GioHangID INT NOT NULL,
    SanPhamID INT NOT NULL,
    SoLuong INT NOT NULL,
    DonGia DECIMAL(18, 2) NOT NULL,
    DaChon BIT NULL DEFAULT 0,  -- ✅ Cột mới
    NgayThem DATETIME NULL DEFAULT GETDATE(),
    NgayCapNhat DATETIME NULL DEFAULT GETDATE(),
    Enable BIT NULL DEFAULT 1
);
```

### Bảng `GioHangKhachVangLai`:
```sql
CREATE TABLE GioHangKhachVangLai (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    SessionID VARCHAR(255) NOT NULL,
    SanPhamID INT NOT NULL,
    SoLuong INT NOT NULL,
    DonGia DECIMAL(18, 2) NOT NULL,
    DaChon BIT NULL DEFAULT 0,  -- ✅ Cột mới
    NgayThem DATETIME NULL DEFAULT GETDATE(),
    NgayCapNhat DATETIME NULL DEFAULT GETDATE(),
    Enable BIT NULL DEFAULT 1
);
```

### Indexes đã tối ưu:
```sql
-- Index cho cột DaChon
CREATE NONCLUSTERED INDEX IX_GioHangChiTiet_DaChon 
ON GioHangChiTiet(DaChon) WHERE Enable = 1;

CREATE NONCLUSTERED INDEX IX_GioHangKhachVangLai_DaChon 
ON GioHangKhachVangLai(DaChon) WHERE Enable = 1;
```

---

## 🔧 Stored Procedures có sẵn trong Database

Database cũng đã có các Stored Procedures (nếu muốn dùng):

### 1. `sp_CapNhatTrangThaiChonSanPham`
```sql
EXEC sp_CapNhatTrangThaiChonSanPham 
    @GioHangChiTietID = 10, 
    @DaChon = 1;
```

### 2. `sp_LayDanhSachSanPhamDaChon`
```sql
EXEC sp_LayDanhSachSanPhamDaChon @GioHangID = 5;
```

### 3. `sp_TaoHoaDonTuGioHang`
```sql
EXEC sp_TaoHoaDonTuGioHang 
    @GioHangID = 5,
    @VoucherID = NULL,
    @TinhThanh = N'Hà Nội',
    @QuanHuyen = N'Cầu Giấy',
    @PhuongXa = N'Dịch Vọng',
    @DiaChiGiaoHang = N'Số 1 Phố Huế',
    @PhuongThucThanhToanID = 1,
    @GhiChu = NULL,
    @HoaDonID = NULL OUTPUT;
```

**Lưu ý:** Backend hiện tại đang dùng Sequelize ORM, không dùng Stored Procedures. Nếu muốn tối ưu hiệu suất, có thể refactor để gọi SP.

---

## 🎨 Use Case: Thanh toán sản phẩm đã chọn

### Flow hoàn chỉnh:

1. **User chọn sản phẩm trong giỏ:**
```javascript
// Chọn sản phẩm ID 5
PUT /api/cart/select/5
{ "selected": true }

// Chọn sản phẩm ID 10
PUT /api/cart/select/10
{ "selected": true }
```

2. **Lấy danh sách sản phẩm đã chọn:**
```javascript
GET /api/cart/selected
// Response: totalAmount = 1,500,000 VNĐ
```

3. **Tạo đơn hàng:**
```javascript
POST /api/orders
{
  "phuongThucThanhToanId": 1,
  "diaChiGiaoHang": "123 Nguyễn Trãi",
  "tinhThanh": "Hà Nội",
  "quanHuyen": "Thanh Xuân",
  "dienThoai": "0901234567"
}
```

4. **Backend tự động:**
   - Lấy sản phẩm có `DaChon = true`
   - Tính tổng tiền với Decorator Pattern (VAT, Ship, Voucher)
   - Tạo hóa đơn
   - Xóa sản phẩm đã thanh toán khỏi giỏ

---

## ✅ Checklist tính năng đã hoàn thiện

- [x] Cột `DaChon` trong database
- [x] Indexes tối ưu cho `DaChon`
- [x] Backend controller: toggle select item
- [x] Backend controller: toggle select all
- [x] Backend controller: get selected items
- [x] Routes cho USER và GUEST
- [x] Rate limiting cho cart operations
- [x] Validation đầu vào
- [x] Error handling đầy đủ
- [x] Logging chi tiết

---

## 🚀 Tiếp theo cần làm gì?

### 1. Frontend Integration:
- Thêm checkbox cho từng sản phẩm trong giỏ hàng
- Hiển thị tổng tiền của sản phẩm đã chọn
- Nút "Chọn tất cả / Bỏ chọn tất cả"
- Khi thanh toán, chỉ thanh toán sản phẩm đã chọn

### 2. Testing:
```bash
# Test API chọn sản phẩm
curl -X PUT http://localhost:5000/api/cart/select/5 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"selected": true}'

# Test lấy sản phẩm đã chọn
curl -X GET http://localhost:5000/api/cart/selected \
  -H "Authorization: Bearer <token>"
```

### 3. Cải tiến (optional):
- [ ] Lưu trạng thái chọn vào localStorage (cho guest)
- [ ] Tự động chọn sản phẩm khi thêm vào giỏ
- [ ] Hiển thị số lượng sản phẩm đã chọn trên icon giỏ hàng
- [ ] Xác nhận khi bỏ chọn tất cả

---

## 📝 Ví dụ Frontend (React/Vue)

### React Example:
```javascript
// Chọn sản phẩm
const handleToggleSelect = async (productId, selected) => {
  try {
    const response = await fetch(`/api/cart/select/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ selected })
    });
    
    const data = await response.json();
    if (data.success) {
      // Refresh giỏ hàng
      fetchCart();
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Lấy sản phẩm đã chọn
const fetchSelectedItems = async () => {
  const response = await fetch('/api/cart/selected', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.data;
};
```

---

## 🎉 Kết luận

Tất cả các chức năng Backend đã được hoàn thiện dựa vào database schema:

1. ✅ **Chọn sản phẩm trong giỏ hàng** - Hỗ trợ cả USER và GUEST
2. ✅ **Lấy danh sách sản phẩm đã chọn** - Để hiển thị tổng tiền
3. ✅ **Tạo đơn hàng từ sản phẩm đã chọn** - Logic đã có sẵn trong `order.controller.js`
4. ✅ **Stored Procedures** - Database đã có sẵn (có thể dùng để tối ưu)
5. ✅ **Indexes** - Database đã tối ưu query cho `DaChon`

Backend đã sẵn sàng cho Frontend tích hợp! 🚀
