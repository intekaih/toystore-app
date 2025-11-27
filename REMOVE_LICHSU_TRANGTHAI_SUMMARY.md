# ✅ Tóm Tắt: Loại Bỏ Hoàn Toàn LichSuTrangThaiDonHang

## 🎯 Mục Tiêu

Loại bỏ hoàn toàn việc sử dụng bảng `LichSuTrangThaiDonHang`, chuyển sang chỉ dùng `HoaDon.TrangThai` để quản lý trạng thái đơn hàng.

## ✅ Đã Hoàn Thành

### Backend Controllers:

1. **`backend/controllers/admin.order.controller.js`**
   - ✅ Loại bỏ include `LichSuTrangThaiDonHang` trong `getOrderById()`
   - ✅ Loại bỏ xử lý `lichSuTrangThai` trong response

2. **`backend/controllers/order.controller.js`**
   - ✅ Loại bỏ include `LichSuTrangThaiDonHang` trong `getPublicOrderDetail()` và `getOrderDetail()`
   - ✅ Loại bỏ xử lý `lichSuTrangThai` trong response (2 chỗ)

### Backend States:

3. **`backend/states/OrderState.js`**
   - ✅ Loại bỏ code ghi lịch sử vào `LichSuTrangThaiDonHang` trong `transitionTo()`
   - ✅ Chỉ cập nhật `HoaDon.TrangThai`

### Backend Utils:

4. **`backend/utils/ghnStatusSync.js`**
   - ✅ Sửa `updateOrderStatusHistory()` để không ghi lịch sử nữa (chỉ log)
   - ✅ Sửa comment trong `syncGHNStatusToOrder()`

### Backend Models:

5. **`backend/models/index.js`**
   - ✅ Loại bỏ association `HoaDon.hasMany(LichSuTrangThaiDonHang)`
   - ✅ Loại bỏ association `LichSuTrangThaiDonHang.belongsTo(HoaDon)`
   - ⚠️ Giữ lại model definition để tránh lỗi khi load models

6. **`backend/models/HoaDon.js`**
   - ✅ Loại bỏ association `HoaDon.hasMany(LichSuTrangThaiDonHang)`

### Frontend:

7. **`frontend/src/pages/OrderDetailPage.js`**
   - ✅ Loại bỏ normalize `lichSuTrangThai` (3 chỗ)
   - ✅ Loại bỏ prop `lichSuTrangThai` khi gọi `OrderStatusTimeline`

8. **`frontend/src/components/OrderStatusTimeline.jsx`**
   - ✅ Loại bỏ prop `lichSuTrangThai`
   - ✅ Chỉ dùng `currentStatus` (fallback logic)
   - ✅ Loại bỏ `statusHistoryMap` và tất cả logic xử lý lịch sử

## 📋 Cách Hoạt Động Mới

### Timeline Logic:

Timeline chỉ dựa vào `HoaDon.TrangThai` hiện tại:

```javascript
const getStepStatus = (stepIndex) => {
  if (currentIndex === -1) return 'pending';
  
  if (stepIndex < currentIndex) {
    return 'completed';  // ✅ Các bước trước → checkmark xanh (không có thời gian)
  } else if (stepIndex === currentIndex) {
    return 'current';     // ✅ Bước hiện tại → "Đang xử lý..."
  } else {
    return 'pending';     // ✅ Các bước sau → chưa đến
  }
};
```

### Status Steps:

1. **Chờ xử lý** → Index 0
2. **Đã xác nhận** → Index 1
3. **Đang đóng gói** → Index 2
4. **Sẵn sàng giao hàng** → Index 3
5. **Đang giao hàng** → Index 4
6. **Đã giao hàng** → Index 5
7. **Hoàn thành** → Index 6

## ⚠️ Lưu Ý

- **Model definition vẫn còn:** `LichSuTrangThaiDonHang` model vẫn được import trong `models/index.js` để tránh lỗi khi Sequelize load models, nhưng không được sử dụng trong code.
- **Database table:** Bảng `LichSuTrangThaiDonHang` vẫn tồn tại trong database nhưng không được ghi dữ liệu nữa.
- **Timeline không có thời gian:** Vì không có lịch sử, timeline chỉ hiển thị checkmark xanh cho các bước đã hoàn thành, không có thời gian cụ thể.

## ✅ Kết Quả

- ✅ Tất cả code chỉ dùng `HoaDon.TrangThai`
- ✅ Timeline hoạt động dựa trên trạng thái hiện tại
- ✅ Không còn lỗi về `LichSuTrangThaiDonHang`
- ✅ Code đơn giản hơn, dễ maintain hơn

