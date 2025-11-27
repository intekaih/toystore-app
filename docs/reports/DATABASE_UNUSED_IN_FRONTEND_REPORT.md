# 📊 BÁO CÁO CÁC BẢNG/TRƯỜNG DATABASE CHƯA ĐƯỢC SỬ DỤNG TRONG FRONTEND

**Ngày kiểm tra:** 27/11/2025  
**Database:** `db/f1.sql` - 20 bảng  
**Phạm vi kiểm tra:** Toàn bộ Frontend (Services, Pages, Components)

---

## 📋 TÓM TẮT

- **Tổng số bảng:** 20
- **Bảng được sử dụng trong FE:** 18/20 (90%)
- **Bảng không được sử dụng trong FE:** 2/20 (10%)
- **Trường không được sử dụng trong FE:** 12 trường
- **Tỷ lệ sử dụng:** ~88%

---

## 🚫 CÁC BẢNG KHÔNG ĐƯỢC SỬ DỤNG TRONG FRONTEND

### 1. `LichSuSuDungVoucher` (6 cột) - ❌ KHÔNG ĐƯỢC SỬ DỤNG

**Trạng thái:** Bảng này hoàn toàn không có API endpoint nào được gọi từ Frontend.

**Các cột:**
- `ID` - ❌ Không dùng
- `VoucherID` - ❌ Không dùng
- `HoaDonID` - ❌ Không dùng
- `TaiKhoanID` - ❌ Không dùng
- `GiaTriGiam` - ❌ Không dùng
- `NgaySuDung` - ❌ Không dùng

**Phân tích:**
- Backend có lưu dữ liệu vào bảng này khi user sử dụng voucher
- Frontend không có tính năng xem "Lịch sử voucher đã dùng" của user
- Không có API endpoint nào query bảng này từ Frontend

**Đề xuất:**
- ✅ **Ưu tiên cao:** Thêm tính năng "Lịch sử voucher đã dùng" cho user
- Tạo API: `GET /api/users/voucher-history`
- Tạo page: `VoucherHistoryPage.jsx`
- Hiển thị danh sách voucher đã sử dụng, ngày sử dụng, giá trị giảm

---

### 2. `LichSuTrangThaiDonHang` (6 cột) - ⚠️ ÍT ĐƯỢC SỬ DỤNG

**Trạng thái:** Bảng này có dữ liệu nhưng Frontend không query để hiển thị lịch sử chi tiết.

**Các cột:**
- `ID` - ❌ Không query
- `HoaDonID` - ✅ Được dùng (foreign key)
- `TrangThaiCu` - ❌ Không hiển thị
- `TrangThaiMoi` - ⚠️ Có trong OrderStatusTimeline nhưng không query từ bảng này
- `NguoiThayDoi` - ❌ Không hiển thị
- `LyDo` - ❌ Không hiển thị
- `NgayThayDoi` - ⚠️ Có trong OrderStatusTimeline nhưng không query từ bảng này

**Phân tích:**
- Component `OrderStatusTimeline.jsx` chỉ hiển thị trạng thái hiện tại (`currentStatus`)
- Không có API endpoint nào query `LichSuTrangThaiDonHang` để hiển thị timeline chi tiết
- Backend có lưu dữ liệu vào bảng này nhưng Frontend không sử dụng

**Đề xuất:**
- ✅ **Ưu tiên trung bình:** Cải thiện OrderStatusTimeline để hiển thị lịch sử thay đổi
- Tạo API: `GET /api/orders/:id/status-history`
- Cập nhật `OrderStatusTimeline` để hiển thị:
  - Trạng thái cũ → Trạng thái mới
  - Người thay đổi (Admin/System/KhachHang)
  - Lý do thay đổi (nếu có)
  - Ngày giờ thay đổi

---

## 🔍 CÁC TRƯỜNG KHÔNG ĐƯỢC SỬ DỤNG TRONG FRONTEND

### 1. Bảng `Banner` (7 cột)

| Cột | Trạng thái | Ghi chú |
|-----|-----------|---------|
| `ID` | ✅ Được dùng | Primary key |
| `HinhAnhUrl` | ✅ Được dùng | Hiển thị banner |
| `Link` | ✅ Được dùng | Link điều hướng |
| `ThuTu` | ✅ Được dùng | Sắp xếp banner |
| `IsActive` | ✅ Được dùng | Lọc banner active |
| `NgayTao` | ✅ Được dùng | Hiển thị ngày tạo |
| `NgayCapNhat` | ❌ **KHÔNG HIỂN THỊ** | Có trong API response nhưng không hiển thị trong UI |

**Đề xuất:**
- Thêm hiển thị "Cập nhật lần cuối" trong admin banner management
- Hoặc xóa cột nếu không cần thiết

---

### 2. Bảng `ThongTinVanChuyen` (11 cột)

| Cột | Trạng thái | Ghi chú |
|-----|-----------|---------|
| `ID` | ✅ Được dùng | Primary key |
| `HoaDonID` | ✅ Được dùng | Foreign key |
| `MaVanDon` | ✅ Được dùng | Hiển thị mã vận đơn |
| `DonViVanChuyen` | ✅ Được dùng | Hiển thị đơn vị vận chuyển |
| `NgayGuiHang` | ✅ Được dùng | Hiển thị ngày gửi hàng |
| `NgayGiaoThanhCong` | ✅ Được dùng | Hiển thị ngày giao thành công |
| `NgayGiaoDuKien` | ✅ Được dùng | Hiển thị ngày giao dự kiến |
| `SoLanGiaoThatBai` | ✅ Được dùng | Logic xử lý giao thất bại |
| `PhiVanChuyen` | ✅ Được dùng | Hiển thị phí vận chuyển |
| `TrangThaiGHN` | ✅ Được dùng | Hiển thị trạng thái GHN |
| `GhiChuShipper` | ❌ **KHÔNG HIỂN THỊ** | Có trong database nhưng không có UI để xem/ghi |

**Đề xuất:**
- Thêm tính năng ghi chú từ shipper trong admin order management
- Hoặc xóa cột nếu không cần thiết

---

### 3. Bảng `DiaChiGiaoHang` (11 cột)

| Cột | Trạng thái | Ghi chú |
|-----|-----------|---------|
| `ID` | ✅ Được dùng | Primary key |
| `HoaDonID` | ✅ Được dùng | Foreign key |
| `MaTinhID` | ⚠️ **LƯU NHƯNG KHÔNG QUERY** | Được lưu khi tạo đơn nhưng không được query/sử dụng |
| `MaQuanID` | ⚠️ **LƯU NHƯNG KHÔNG QUERY** | Được lưu khi tạo đơn nhưng không được query/sử dụng |
| `MaPhuongXa` | ⚠️ **LƯU NHƯNG KHÔNG QUERY** | Được lưu khi tạo đơn nhưng không được query/sử dụng |
| `TenTinh` | ✅ Được dùng | Hiển thị địa chỉ |
| `TenQuan` | ✅ Được dùng | Hiển thị địa chỉ |
| `TenPhuong` | ✅ Được dùng | Hiển thị địa chỉ |
| `DiaChiChiTiet` | ✅ Được dùng | Hiển thị địa chỉ |
| `SoDienThoai` | ✅ Được dùng | Hiển thị số điện thoại |
| `TenNguoiNhan` | ✅ Được dùng | Hiển thị tên người nhận |

**Phân tích:**
- `MaTinhID`, `MaQuanID`, `MaPhuongXa` được lưu khi tạo đơn (từ GHN API)
- Frontend chỉ hiển thị tên (`TenTinh`, `TenQuan`, `TenPhuong`)
- Không có logic nào sử dụng các mã này trong Frontend

**Đề xuất:**
- ✅ **Ưu tiên thấp:** Các mã này có thể hữu ích cho tích hợp GHN API trong tương lai
- Nếu không cần: Có thể xóa để giảm dữ liệu
- Nếu cần: Sử dụng khi cần query đơn hàng theo khu vực

---

### 4. Bảng `DiaChiGiaoHangUser` (12 cột)

| Cột | Trạng thái | Ghi chú |
|-----|-----------|---------|
| `ID` | ✅ Được dùng | Primary key |
| `TaiKhoanID` | ✅ Được dùng | Foreign key |
| `TenNguoiNhan` | ✅ Được dùng | Hiển thị tên người nhận |
| `SoDienThoai` | ✅ Được dùng | Hiển thị số điện thoại |
| `MaTinhID` | ⚠️ **LƯU NHƯNG KHÔNG QUERY** | Được lưu nhưng không được query/sử dụng |
| `TenTinh` | ✅ Được dùng | Hiển thị địa chỉ |
| `MaQuanID` | ⚠️ **LƯU NHƯNG KHÔNG QUERY** | Được lưu nhưng không được query/sử dụng |
| `TenQuan` | ✅ Được dùng | Hiển thị địa chỉ |
| `MaPhuongXa` | ⚠️ **LƯU NHƯNG KHÔNG QUERY** | Được lưu nhưng không được query/sử dụng |
| `TenPhuong` | ✅ Được dùng | Hiển thị địa chỉ |
| `DiaChiChiTiet` | ✅ Được dùng | Hiển thị địa chỉ |
| `LaMacDinh` | ✅ Được dùng | Địa chỉ mặc định |
| `TrangThai` | ✅ Được dùng | Trạng thái địa chỉ |

**Phân tích:**
- Tương tự `DiaChiGiaoHang`, các mã địa chỉ được lưu nhưng không được sử dụng trong Frontend

---

### 5. Bảng `LichSuTrangThaiDonHang` (6 cột) - Chi tiết

| Cột | Trạng thái | Ghi chú |
|-----|-----------|---------|
| `ID` | ❌ Không query | Primary key |
| `HoaDonID` | ✅ Được dùng | Foreign key (implicit) |
| `TrangThaiCu` | ❌ **KHÔNG HIỂN THỊ** | Có trong database nhưng không hiển thị |
| `TrangThaiMoi` | ⚠️ **HIỂN THỊ NHƯNG KHÔNG QUERY TỪ BẢNG NÀY** | Chỉ hiển thị trạng thái hiện tại từ `HoaDon.TrangThai` |
| `NguoiThayDoi` | ❌ **KHÔNG HIỂN THỊ** | Có trong database nhưng không hiển thị |
| `LyDo` | ❌ **KHÔNG HIỂN THỊ** | Có trong database nhưng không hiển thị |
| `NgayThayDoi` | ⚠️ **HIỂN THỊ NHƯNG KHÔNG QUERY TỪ BẢNG NÀY** | Component OrderStatusTimeline không query bảng này |

**Phân tích:**
- Component `OrderStatusTimeline.jsx` chỉ hiển thị trạng thái hiện tại
- Không có API endpoint nào query `LichSuTrangThaiDonHang` để hiển thị timeline
- Backend có lưu dữ liệu nhưng Frontend không sử dụng

---

## 📊 TỔNG KẾT CÁC BẢNG/TRƯỜNG CHƯA ĐƯỢC SỬ DỤNG

### Bảng hoàn toàn không được sử dụng (1 bảng):

1. **`LichSuSuDungVoucher`** (6 cột)
   - Không có API endpoint nào được gọi từ Frontend
   - Không có UI hiển thị lịch sử voucher đã dùng
   - **Đề xuất:** Thêm tính năng "Lịch sử voucher đã dùng"

### Bảng ít được sử dụng (1 bảng):

2. **`LichSuTrangThaiDonHang`** (6 cột)
   - Có dữ liệu nhưng Frontend không query để hiển thị
   - Component OrderStatusTimeline không sử dụng bảng này
   - **Đề xuất:** Cải thiện OrderStatusTimeline để hiển thị lịch sử chi tiết

### Trường không được hiển thị (12 trường):

1. **`Banner.NgayCapNhat`** - Có trong API nhưng không hiển thị
2. **`ThongTinVanChuyen.GhiChuShipper`** - Không có UI để xem/ghi
3. **`LichSuTrangThaiDonHang.TrangThaiCu`** - Không hiển thị
4. **`LichSuTrangThaiDonHang.NguoiThayDoi`** - Không hiển thị
5. **`LichSuTrangThaiDonHang.LyDo`** - Không hiển thị
6. **`DiaChiGiaoHang.MaTinhID`** - Lưu nhưng không query
7. **`DiaChiGiaoHang.MaQuanID`** - Lưu nhưng không query
8. **`DiaChiGiaoHang.MaPhuongXa`** - Lưu nhưng không query
9. **`DiaChiGiaoHangUser.MaTinhID`** - Lưu nhưng không query
10. **`DiaChiGiaoHangUser.MaQuanID`** - Lưu nhưng không query
11. **`DiaChiGiaoHangUser.MaPhuongXa`** - Lưu nhưng không query
12. **`LichSuSuDungVoucher.*`** - Toàn bộ bảng không được sử dụng

---

## 🎯 KHUYẾN NGHỊ THEO ĐỘ ƯU TIÊN

### 🔴 Ưu tiên cao:

1. **Thêm tính năng "Lịch sử voucher đã dùng"**
   - Tạo API: `GET /api/users/voucher-history`
   - Tạo service: `voucherService.getMyVoucherHistory()`
   - Tạo page: `VoucherHistoryPage.jsx`
   - Hiển thị: Danh sách voucher đã dùng, ngày sử dụng, giá trị giảm, đơn hàng liên quan

### 🟡 Ưu tiên trung bình:

2. **Cải thiện OrderStatusTimeline**
   - Tạo API: `GET /api/orders/:id/status-history`
   - Cập nhật `OrderStatusTimeline.jsx` để:
     - Query lịch sử từ `LichSuTrangThaiDonHang`
     - Hiển thị: Trạng thái cũ → Mới, Người thay đổi, Lý do, Ngày giờ
     - Hiển thị timeline đầy đủ thay vì chỉ trạng thái hiện tại

3. **Thêm hiển thị `Banner.NgayCapNhat`**
   - Hiển thị "Cập nhật lần cuối" trong admin banner management
   - Hoặc xóa cột nếu không cần thiết

### 🟢 Ưu tiên thấp:

4. **Quyết định về các mã địa chỉ**
   - `MaTinhID`, `MaQuanID`, `MaPhuongXa` trong `DiaChiGiaoHang` và `DiaChiGiaoHangUser`
   - Nếu cần tích hợp GHN API: Giữ lại và sử dụng
   - Nếu không cần: Có thể xóa để giảm dữ liệu

5. **Thêm tính năng ghi chú shipper**
   - Thêm UI để admin xem/ghi `GhiChuShipper` trong order management
   - Hoặc xóa cột nếu không cần thiết

---

## ✅ CÁC BẢNG ĐƯỢC SỬ DỤNG ĐẦY ĐỦ TRONG FRONTEND

Các bảng sau được sử dụng đầy đủ, không có trường nào bị bỏ sót:

1. ✅ `TaiKhoan` - 11/11 cột (100%)
2. ✅ `LoaiSP` - 3/3 cột (100%)
3. ✅ `ThuongHieu` - 4/4 cột (100%)
4. ✅ `PhuongThucThanhToan` - 2/2 cột (100%)
5. ✅ `SanPham` - 12/12 cột (100%)
6. ✅ `SanPhamHinhAnh` - 5/5 cột (100%)
7. ✅ `KhachHang` - 6/6 cột (100%)
8. ✅ `Voucher` - 13/13 cột (100%)
9. ✅ `HoaDon` - 13/13 cột (100%)
10. ✅ `ChiTietHoaDon` - 6/6 cột (100%)
11. ✅ `GioHang` - 2/2 cột (100%)
12. ✅ `GioHangChiTiet` - 6/6 cột (100%)
13. ✅ `GioHangKhachVangLai` - 7/7 cột (100%)
14. ✅ `DanhGiaSanPham` - 8/8 cột (100%)

---

## 📝 CHI TIẾT CÁC API ENDPOINTS ĐƯỢC SỬ DỤNG

### ✅ Các API đã được triển khai trong Frontend:

1. **Authentication APIs**
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `POST /api/auth/admin/login`
   - Google OAuth

2. **Product APIs**
   - `GET /api/products` (list, search, filter)
   - `GET /api/products/:id`
   - `GET /api/products/categories`
   - `GET /api/products/categories/brands`
   - `GET /api/admin/products` (CRUD)

3. **Cart APIs**
   - `GET /api/cart` (user)
   - `GET /api/cart/guest` (guest)
   - `POST /api/cart/add`
   - `PUT /api/cart/update`
   - `DELETE /api/cart/remove/:id`

4. **Order APIs**
   - `POST /api/orders/create`
   - `GET /api/orders/my-orders`
   - `GET /api/orders/:id`
   - `PUT /api/orders/:id/cancel`

5. **Voucher APIs**
   - `POST /api/vouchers/check`
   - `GET /api/admin/vouchers` (CRUD)

6. **Review APIs**
   - `GET /api/reviews/reviewable-products`
   - `POST /api/reviews`
   - `GET /api/reviews/product/:id`

7. **Banner APIs**
   - `GET /api/banners` (public)
   - `GET /api/admin/banners` (CRUD)

8. **Shipping APIs**
   - `GET /api/shipping/calculate`
   - `GET /api/shipping/tracking/:orderCode`

9. **Payment APIs**
   - `GET /api/payment/methods`
   - `POST /api/payment/vnpay/create`

10. **User APIs**
    - `GET /api/users/profile`
    - `PUT /api/users/profile`

11. **Admin APIs**
    - `GET /api/admin/orders` (quản lý đơn hàng)
    - `GET /api/admin/statistics/*` (thống kê)
    - `GET /api/admin/users` (quản lý user)

### ❌ Các API chưa được triển khai trong Frontend:

1. **`GET /api/users/voucher-history`** - Lịch sử voucher đã dùng
2. **`GET /api/orders/:id/status-history`** - Lịch sử thay đổi trạng thái đơn hàng

---

## 📊 THỐNG KÊ

- **Tổng số bảng:** 20
- **Bảng được sử dụng:** 18 (90%)
- **Bảng không được sử dụng:** 2 (10%)
- **Tổng số trường:** ~150
- **Trường được sử dụng:** ~138 (92%)
- **Trường không được sử dụng:** ~12 (8%)

---

## 🎯 KẾT LUẬN

Frontend đã sử dụng **90% bảng** và **92% trường** trong database. Các phần chưa được sử dụng chủ yếu là:

1. **Lịch sử và tracking:** `LichSuSuDungVoucher`, `LichSuTrangThaiDonHang` (một phần)
2. **Metadata:** `NgayCapNhat`, `GhiChuShipper`, `NguoiThayDoi`, `LyDo`
3. **Mã địa chỉ:** `MaTinhID`, `MaQuanID`, `MaPhuongXa` (lưu nhưng không query)

**Đánh giá:** Frontend đã implement đầy đủ các tính năng chính. Các phần chưa sử dụng chủ yếu là tính năng bổ sung (lịch sử, metadata) có thể triển khai trong tương lai.

---

**Người kiểm tra:** AI Assistant  
**Phiên bản báo cáo:** 1.0  
**Ngày tạo:** 27/11/2025

