# 📡 API DOCUMENTATION - QUẢN LÝ TRẠNG THÁI ĐƠN HÀNG

## 🎯 Mục đích
Tài liệu này mô tả các API mà Admin sử dụng để quản lý trạng thái đơn hàng trong hệ thống ToyStore.

---

## 🔐 Authentication
Tất cả API đều yêu cầu:
- Header: `Authorization: Bearer <admin_token>`
- Role: `Admin`

---

## 📋 DANH SÁCH API

### 1️⃣ XÁC NHẬN ĐƠN HÀNG
**Endpoint**: `POST /api/admin/orders/:id/confirm`

**Mục đích**: Xác nhận đơn hàng từ "Chờ xử lý" → "Đã xác nhận"

**Request Body**:
```json
{
  "ghiChu": "Đã kiểm tra tồn kho, đơn hàng hợp lệ" // Optional
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Đã xác nhận đơn hàng",
  "data": {
    "orderId": 123,
    "maHD": "HD202511150001",
    "trangThai": "Đã xác nhận",
    "availableActions": ["Đang đóng gói", "Đã hủy"]
  }
}
```

**Response Error (400)**:
```json
{
  "success": false,
  "message": "Không thể chuyển từ \"Đang giao hàng\" sang \"Đã xác nhận\". Chỉ có thể chuyển sang: Đã giao hàng, Giao hàng thất bại"
}
```

**Use Case**:
- Admin kiểm tra đơn hàng mới mỗi sáng
- Xác nhận đơn hàng có đủ hàng và thông tin hợp lệ

---

### 2️⃣ CHUYỂN SANG ĐÓNG GÓI
**Endpoint**: `POST /api/admin/orders/:id/pack`

**Mục đích**: Chuyển từ "Đã xác nhận" → "Đang đóng gói"

**Request Body**: Không cần

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Đã chuyển sang đóng gói",
  "data": {
    "orderId": 123,
    "maHD": "HD202511150001",
    "trangThai": "Đang đóng gói",
    "availableActions": ["Đang giao hàng", "Đã hủy"]
  }
}
```

**Use Case**:
- Admin đã lấy hàng từ kho
- Bắt đầu đóng gói sản phẩm

---

### 3️⃣ BÀN GIAO SHIPPER
**Endpoint**: `POST /api/admin/orders/:id/ship`

**Mục đích**: Chuyển từ "Đang đóng gói" → "Đang giao hàng"

**Request Body** (Required):
```json
{
  "maVanDon": "GHNABCD1234567", // Required
  "donViVanChuyen": "Giao Hàng Nhanh" // Optional, default: "Chưa xác định"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Đã bàn giao cho shipper",
  "data": {
    "orderId": 123,
    "maHD": "HD202511150001",
    "trangThai": "Đang giao hàng",
    "maVanDon": "GHNABCD1234567",
    "donViVanChuyen": "Giao Hàng Nhanh",
    "ngayGuiHang": "2025-11-15T10:30:00.000Z",
    "availableActions": ["Đã giao hàng", "Giao hàng thất bại"]
  }
}
```

**Response Error (400)**:
```json
{
  "success": false,
  "message": "Vui lòng nhập mã vận đơn"
}
```

**Use Case**:
- Admin đã đóng gói xong
- Bàn giao cho shipper và nhập mã vận đơn
- Khách hàng có thể theo dõi vận đơn

---

### 4️⃣ XÁC NHẬN ĐÃ GIAO HÀNG
**Endpoint**: `POST /api/admin/orders/:id/delivered`

**Mục đích**: Chuyển từ "Đang giao hàng" → "Đã giao hàng"

**Request Body**: Không cần

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Đã xác nhận giao hàng thành công",
  "data": {
    "orderId": 123,
    "maHD": "HD202511150001",
    "trangThai": "Đã giao hàng",
    "ngayGiaoThanhCong": "2025-11-17T14:20:00.000Z",
    "availableActions": ["Hoàn thành", "Đang hoàn tiền"]
  }
}
```

**Use Case**:
- Shipper báo đã giao hàng thành công
- Admin xác nhận trong hệ thống
- Thu tiền COD (nếu là đơn COD)

---

### 5️⃣ HOÀN THÀNH ĐƠN HÀNG
**Endpoint**: `POST /api/admin/orders/:id/complete`

**Mục đích**: Chuyển từ "Đã giao hàng" → "Hoàn thành"

**Request Body**: Không cần

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Đã hoàn thành đơn hàng",
  "data": {
    "orderId": 123,
    "maHD": "HD202511150001",
    "trangThai": "Hoàn thành"
  }
}
```

**Use Case**:
- Sau 7 ngày khách không khiếu nại
- Admin xác nhận hoàn thành thủ công
- Hoặc hệ thống tự động hoàn thành

---

### 6️⃣ GIAO HÀNG THẤT BẠI
**Endpoint**: `POST /api/admin/orders/:id/delivery-failed`

**Mục đích**: Chuyển từ "Đang giao hàng" → "Giao hàng thất bại"

**Request Body**:
```json
{
  "lyDo": "Khách không có nhà, đã gọi điện không nghe máy" // Optional
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Đã đánh dấu giao hàng thất bại (lần 1/3)",
  "data": {
    "orderId": 123,
    "maHD": "HD202511150001",
    "trangThai": "Giao hàng thất bại",
    "soLanThatBai": 1,
    "availableActions": ["Đang giao hàng", "Đã hủy"]
  }
}
```

**Use Case**:
- Shipper không giao được hàng
- Gọi khách không nghe máy
- Khách vắng nhà
- Hẹn giao lại (tối đa 3 lần)

---

### 7️⃣ CẬP NHẬT TRẠNG THÁI TỔNG QUÁT
**Endpoint**: `PATCH /api/admin/orders/:id/status`

**Mục đích**: Cập nhật trạng thái tổng quát (flexible)

**Request Body**:
```json
{
  "trangThai": "Đang giao hàng", // Required
  "ghiChu": "Ghi chú từ admin", // Optional
  "maVanDon": "GHNXXX", // Optional (required nếu chuyển sang "Đang giao hàng")
  "donViVanChuyen": "GHN" // Optional
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Cập nhật trạng thái đơn hàng thành công: Chờ xử lý → Đang giao hàng",
  "data": {
    "order": {
      "id": 123,
      "maHD": "HD202511150001",
      "trangThaiCu": "Chờ xử lý",
      "trangThaiMoi": "Đang giao hàng",
      "tongTien": 500000,
      "ghiChu": "...",
      "maVanDon": "GHNXXX",
      "donViVanChuyen": "GHN",
      "ngayGuiHang": "2025-11-15T10:00:00.000Z",
      "khachHang": { ... }
    },
    "availableActions": ["Đã giao hàng", "Giao hàng thất bại"],
    "permissions": {
      "canAdminCancel": false,
      "canCustomerCancel": false
    }
  }
}
```

**Các trạng thái hợp lệ**:
- `Chờ xử lý`
- `Đã xác nhận`
- `Đang đóng gói`
- `Đang giao hàng`
- `Đã giao hàng`
- `Hoàn thành`
- `Đã hủy`
- `Giao hàng thất bại`

---

## 🔄 SƠ ĐỒ CHUYỂN TRẠNG THÁI

```
Chờ xử lý
    ↓ (confirm)
Đã xác nhận
    ↓ (pack)
Đang đóng gói
    ↓ (ship + mã vận đơn)
Đang giao hàng
    ↓
    ├─→ Đã giao hàng (delivered)
    │       ↓
    │   Hoàn thành (complete)
    │
    └─→ Giao hàng thất bại (delivery-failed)
            ↓
            ├─→ Đang giao hàng (giao lại, tối đa 3 lần)
            └─→ Đã hủy (sau 3 lần thất bại)
```

---

## ⚠️ VALIDATION RULES

### 1. Chuyển sang "Đang giao hàng"
- **Bắt buộc**: Phải có `maVanDon`
- **Tự động**: Lưu `NgayGuiHang = now()`

### 2. Hủy đơn hàng
- Chỉ hủy được ở trạng thái: `Chờ xử lý`, `Đã xác nhận`, `Đang đóng gói`
- **Tự động**: Hoàn tồn kho
- **Yêu cầu**: Nhập lý do hủy (trong `ghiChu`)

### 3. Chuyển trạng thái
- Chỉ có thể chuyển theo luồng định trước
- Không thể quay lại trạng thái cũ
- Không thể chuyển từ `Hoàn thành` hoặc `Đã hủy` sang trạng thái khác

---

## 🧪 TESTING VỚI POSTMAN/CURL

### Test 1: Xác nhận đơn hàng
```bash
curl -X POST http://localhost:5000/api/admin/orders/1/confirm \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ghiChu": "Đơn hàng hợp lệ"}'
```

### Test 2: Bàn giao shipper
```bash
curl -X POST http://localhost:5000/api/admin/orders/1/ship \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maVanDon": "GHNTEST123456",
    "donViVanChuyen": "Giao Hàng Nhanh"
  }'
```

### Test 3: Xác nhận đã giao
```bash
curl -X POST http://localhost:5000/api/admin/orders/1/delivered \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Test 4: Giao hàng thất bại
```bash
curl -X POST http://localhost:5000/api/admin/orders/1/delivery-failed \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lyDo": "Khách không có nhà"}'
```

---

## 📊 MÃ LỖI

| HTTP Code | Mô tả |
|-----------|-------|
| 200 | Thành công |
| 400 | Dữ liệu không hợp lệ hoặc không thể chuyển trạng thái |
| 401 | Chưa đăng nhập |
| 403 | Không có quyền admin |
| 404 | Không tìm thấy đơn hàng |
| 500 | Lỗi server |

---

## 🎯 BEST PRACTICES

### 1. Luôn kiểm tra `availableActions` trước khi chuyển trạng thái
```javascript
// Frontend nên disable các nút không có trong availableActions
if (order.availableActions.includes('Đang giao hàng')) {
  // Show nút "Bàn giao shipper"
}
```

### 2. Hiển thị thông tin mã vận đơn cho khách
```javascript
if (order.maVanDon) {
  // Hiển thị link tracking
  const trackingUrl = `https://tracking.ghn.vn/?order_code=${order.maVanDon}`;
}
```

### 3. Thông báo cho khách khi thay đổi trạng thái
- Gửi email/SMS khi:
  - Đơn được xác nhận
  - Đang giao hàng (kèm mã vận đơn)
  - Đã giao thành công
  - Giao thất bại (cần liên hệ)

---

## 💡 NOTES

- Tất cả các API đều sử dụng **State Pattern** để validate
- Lịch sử thay đổi trạng thái được lưu trong cột `GhiChu`
- Transaction được sử dụng để đảm bảo tính nhất quán
- Khi hủy đơn, tồn kho được hoàn tự động
