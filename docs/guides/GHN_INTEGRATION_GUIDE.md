# 🚚 HƯỚNG DẪN TÍCH HỢP GIAO HÀNG NHANH (GHN) API

## 📋 MỤC LỤC
1. [Cấu hình GHN](#1-cấu-hình-ghn)
2. [Các API đã tích hợp](#2-các-api-đã-tích-hợp)
3. [Luồng hoạt động](#3-luồng-hoạt-động)
4. [Webhook từ GHN](#4-webhook-từ-ghn)
5. [Testing](#5-testing)
6. [Troubleshooting](#6-troubleshooting)

---

## 1️⃣ CẤU HÌNH GHN

### **Bước 1: Đăng ký tài khoản GHN**
1. Truy cập: https://saleronline.ghn.vn/
2. Đăng ký tài khoản shop
3. Xác thực email và thông tin

### **Bước 2: Lấy API Token & Shop ID**
1. Đăng nhập vào GHN Dashboard
2. Vào: **Cài đặt** → **Thiết lập Token**
3. Copy:
   - **Token**: Dùng để gọi API
   - **Shop ID**: ID của shop

### **Bước 3: Cấu hình trong `.env`**
```env
# GHN Configuration
GHN_API_TOKEN=your_ghn_token_here
GHN_SHOP_ID=your_shop_id_here
GHN_WEBHOOK_URL=https://yourdomain.com/api/webhooks/ghn
```

### **Bước 4: Cấu hình địa chỉ kho/shop**
Mở file: `backend/config/ghn.config.js`

```javascript
DEFAULT_FROM_ADDRESS: {
  provinceId: 202,        // ID tỉnh/thành của shop (VD: 202 = Hà Nội)
  districtId: 1482,       // ID quận/huyện (VD: 1482 = Hoàn Kiếm)
  wardCode: '10203',      // Mã phường/xã
  address: 'Số 1, Đường ABC, Phường Hàng Bạc, Quận Hoàn Kiếm, Hà Nội'
},

SHOP_INFO: {
  name: 'ToyStore Shop',
  phone: '0123456789',
  address: 'Số 1, Đường ABC'
}
```

> **Lấy ID địa chỉ**: Sử dụng API GET /api/shipping/provinces, /districts, /wards

---

## 2️⃣ CÁC API ĐÃ TÍCH HỢP

### **A. API CHO ADMIN**

#### **1. Tạo đơn GHN tự động khi bàn giao shipper**
```http
POST /api/admin/orders/:id/ship
Authorization: Bearer <admin_token>

Body:
{
  "autoCreateGHN": true,    // Tự động tạo đơn GHN
  "weight": 500,            // Trọng lượng (gram) - Optional
  "note": "Ghi chú giao hàng"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã tạo đơn GHN và bàn giao cho shipper thành công",
  "data": {
    "orderId": 123,
    "maHD": "HD202511190001",
    "trangThai": "Đang giao hàng",
    "maVanDon": "GHN123456789",
    "donViVanChuyen": "Giao Hàng Nhanh (GHN)",
    "phiVanChuyen": 35000,
    "ngayGuiHang": "2025-11-19T10:30:00.000Z",
    "thoiGianGiaoDuKien": "2025-11-21T18:00:00.000Z",
    "trackingUrl": "https://donhang.ghn.vn/?order_code=GHN123456789",
    "availableActions": ["Đã giao hàng", "Giao hàng thất bại"]
  }
}
```

#### **2. Bàn giao shipper - Nhập mã vận đơn thủ công**
```http
POST /api/admin/orders/:id/ship
Authorization: Bearer <admin_token>

Body:
{
  "autoCreateGHN": false,        // Không tự động
  "maVanDon": "GHNXXX",         // Nhập thủ công
  "donViVanChuyen": "GHN"       // Optional
}
```

#### **3. Xem tracking đơn hàng từ GHN**
```http
GET /api/admin/orders/:id/tracking
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy thông tin tracking thành công",
  "data": {
    "orderCode": "HD202511190001",
    "maVanDon": "GHN123456789",
    "donViVanChuyen": "Giao Hàng Nhanh (GHN)",
    "tracking": {
      "orderCode": "GHN123456789",
      "status": "delivering",
      "statusText": "Đang giao hàng",
      "expectedDeliveryTime": "2025-11-21T18:00:00.000Z",
      "logs": [
        {
          "status": "ready_to_pick",
          "time": "2025-11-19T10:30:00.000Z"
        },
        {
          "status": "picked",
          "time": "2025-11-19T14:00:00.000Z"
        },
        {
          "status": "delivering",
          "time": "2025-11-20T08:00:00.000Z"
        }
      ]
    },
    "trackingUrl": "https://donhang.ghn.vn/?order_code=GHN123456789"
  }
}
```

#### **4. In phiếu giao hàng**
```http
POST /api/admin/orders/print-label
Authorization: Bearer <admin_token>

Body:
{
  "orderIds": [123, 124, 125]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy token in thành công",
  "data": {
    "orders": [
      { "id": 123, "maHD": "HD202511190001", "maVanDon": "GHN123" },
      { "id": 124, "maHD": "HD202511190002", "maVanDon": "GHN124" }
    ],
    "printUrl": "https://online-gateway.ghn.vn/a5/public-api/printA5?token=xxx",
    "token": "xxx"
  }
}
```

### **B. API CHO SHIPPING (PUBLIC/USER)**

#### **1. Tính phí ship**
```http
POST /api/shipping/calculate-fee

Body:
{
  "toDistrictId": 1482,
  "toWardCode": "10203",
  "weight": 500,
  "insuranceValue": 100000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tính phí ship thành công",
  "data": {
    "total": 35000,
    "serviceFee": 32000,
    "insuranceFee": 3000,
    "pickStationFee": 0,
    "couponValue": 0,
    "r2sFee": 0
  }
}
```

#### **2. Lấy danh sách tỉnh/thành**
```http
GET /api/shipping/provinces
```

#### **3. Lấy danh sách quận/huyện**
```http
GET /api/shipping/districts/:provinceId
```

#### **4. Lấy danh sách phường/xã**
```http
GET /api/shipping/wards/:districtId
```

---

## 3️⃣ LUỒNG HOẠT ĐỘNG

### **Luồng tự động tạo đơn GHN**

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN: Xác nhận đơn hàng                                    │
│ POST /api/admin/orders/:id/confirm                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ ADMIN: Chuyển sang đóng gói                                 │
│ POST /api/admin/orders/:id/pack                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ ADMIN: Bàn giao shipper + TẠO ĐƠN GHN TỰ ĐỘNG              │
│ POST /api/admin/orders/:id/ship                             │
│ Body: { "autoCreateGHN": true }                             │
│                                                              │
│ Backend thực hiện:                                           │
│ 1. Validate địa chỉ giao hàng (DistrictId, WardCode)       │
│ 2. Tính trọng lượng từ sản phẩm                            │
│ 3. Gọi GHN API: createShippingOrder()                       │
│ 4. Nhận mã vận đơn: GHN123456789                           │
│ 5. Lưu vào DB: MaVanDon, PhiVanChuyen, ThoiGianGiaoDuKien │
│ 6. Chuyển trạng thái: "Đang giao hàng"                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ GHN: Xử lý đơn hàng & cập nhật trạng thái                   │
│ - ready_to_pick → picked → delivering → delivered           │
│                                                              │
│ GHN gửi Webhook về server mỗi khi đổi trạng thái           │
│ POST /api/webhooks/ghn                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND: Nhận webhook từ GHN                                │
│ Tự động cập nhật trạng thái đơn hàng:                       │
│ - delivered → "Đã giao hàng"                                │
│ - delivery_fail → "Giao hàng thất bại"                      │
│ - return → "Giao hàng thất bại"                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4️⃣ WEBHOOK TỪ GHN

### **Cấu hình Webhook trên GHN Dashboard**

1. Đăng nhập GHN Dashboard
2. Vào: **Cài đặt** → **Webhook**
3. Nhập URL: `https://yourdomain.com/api/webhooks/ghn`
4. Chọn các event cần nhận:
   - ✅ Đơn hàng đã lấy (picked)
   - ✅ Đang giao hàng (delivering)
   - ✅ Giao thành công (delivered)
   - ✅ Giao thất bại (delivery_fail)
   - ✅ Hoàn trả (return)

### **Webhook Payload từ GHN**

```json
{
  "OrderCode": "GHN123456789",
  "Status": "delivered",
  "StatusText": "Đã giao hàng thành công",
  "Time": "2025-11-21T15:30:00.000Z",
  "Reason": null,
  "CODAmount": 331100,
  "CODTransferDate": "2025-11-22"
}
```

### **Xử lý Webhook trong Backend**

Backend tự động:
1. ✅ Tìm đơn hàng theo `OrderCode` (MaVanDon)
2. ✅ Mapping trạng thái GHN → ToyStore
3. ✅ Sử dụng State Pattern để chuyển trạng thái
4. ✅ Lưu log vào `GhiChu`
5. ✅ Trả về response cho GHN

**Mapping trạng thái:**
| GHN Status | ToyStore Status | Mô tả |
|------------|----------------|-------|
| `ready_to_pick` | (không đổi) | Chờ lấy hàng |
| `picked` | (không đổi) | Đã lấy hàng |
| `delivering` | (không đổi) | Đang giao hàng |
| `delivered` | **Đã giao hàng** | ✅ Giao thành công |
| `delivery_fail` | **Giao hàng thất bại** | ❌ Giao thất bại |
| `return` | **Giao hàng thất bại** | ❌ Hoàn trả |
| `returned` | **Đã hủy** | ❌ Đã hoàn về shop |
| `cancel` | **Đã hủy** | ❌ Đơn bị hủy |

---

## 5️⃣ TESTING

### **Test 1: Tạo đơn GHN thủ công**

```bash
# Bước 1: Đăng nhập admin
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Lấy token từ response

# Bước 2: Tạo đơn GHN
curl -X POST http://localhost:5000/api/admin/orders/1/ship \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "autoCreateGHN": true,
    "weight": 500,
    "note": "Test tạo đơn GHN"
  }'
```

### **Test 2: Xem tracking**

```bash
curl -X GET http://localhost:5000/api/admin/orders/1/tracking \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### **Test 3: Tính phí ship**

```bash
curl -X POST http://localhost:5000/api/shipping/calculate-fee \
  -H "Content-Type: application/json" \
  -d '{
    "toDistrictId": 1482,
    "toWardCode": "10203",
    "weight": 500,
    "insuranceValue": 100000
  }'
```

### **Test 4: Webhook simulation**

```bash
curl -X POST http://localhost:5000/api/webhooks/ghn \
  -H "Content-Type: application/json" \
  -d '{
    "OrderCode": "GHN123456789",
    "Status": "delivered",
    "StatusText": "Đã giao hàng thành công",
    "Time": "2025-11-21T15:30:00.000Z",
    "CODAmount": 331100,
    "CODTransferDate": "2025-11-22"
  }'
```

---

## 6️⃣ TROUBLESHOOTING

### **Lỗi: "Thiếu thông tin địa chỉ giao hàng"**

**Nguyên nhân**: Đơn hàng chưa có `DistrictId` hoặc `WardCode`

**Giải pháp**:
1. Kiểm tra bảng `HoaDon` có cột `DistrictId`, `WardCode` chưa
2. Nếu chưa có, thêm vào schema:
```sql
ALTER TABLE HoaDon ADD DistrictId INT NULL;
ALTER TABLE HoaDon ADD WardCode VARCHAR(20) NULL;
```
3. Khi tạo đơn hàng, lưu địa chỉ đầy đủ từ form checkout

### **Lỗi: "GHN API Token invalid"**

**Giải pháp**:
1. Kiểm tra `.env`: `GHN_API_TOKEN` đúng chưa
2. Kiểm tra token còn hiệu lực trên GHN Dashboard
3. Restart server sau khi đổi `.env`

### **Lỗi: "Không thể tạo đơn GHN"**

**Kiểm tra**:
1. ✅ Shop ID đúng chưa
2. ✅ Địa chỉ kho (`DEFAULT_FROM_ADDRESS`) đúng chưa
3. ✅ Địa chỉ giao hàng hợp lệ chưa
4. ✅ Tài khoản GHN còn tiền không
5. ✅ Log chi tiết: `console.log()` trong `ghn.service.js`

### **Webhook không nhận được từ GHN**

**Giải pháp**:
1. ✅ Server phải có domain public (không dùng localhost)
2. ✅ HTTPS (GHN yêu cầu SSL)
3. ✅ URL webhook đúng: `https://yourdomain.com/api/webhooks/ghn`
4. ✅ Endpoint không yêu cầu authentication
5. ✅ Test bằng Postman trước

### **Tracking không cập nhật**

**Kiểm tra**:
1. Mã vận đơn đúng chưa
2. GHN đã lấy hàng chưa
3. Gọi API tracking thủ công: `GET /api/admin/orders/:id/tracking`

---

## 📚 TÀI LIỆU THAM KHẢO

- **GHN API Documentation**: https://api.ghn.vn/home/docs/detail
- **GHN Dashboard**: https://saleronline.ghn.vn/
- **Tracking URL**: https://donhang.ghn.vn/

---

## 🎯 CHECKLIST TRIỂN KHAI

- [ ] Đăng ký tài khoản GHN
- [ ] Lấy API Token & Shop ID
- [ ] Cấu hình `.env`
- [ ] Cập nhật địa chỉ kho trong `ghn.config.js`
- [ ] Thêm cột `DistrictId`, `WardCode` vào bảng `HoaDon`
- [ ] Test API tạo đơn GHN
- [ ] Test API tracking
- [ ] Cấu hình webhook trên GHN Dashboard
- [ ] Deploy server lên domain public với HTTPS
- [ ] Test webhook nhận từ GHN
- [ ] Test toàn bộ luồng: Tạo đơn → GHN xử lý → Webhook cập nhật

---

**✅ HOÀN TẤT!** Hệ thống đã sẵn sàng tích hợp GHN!
