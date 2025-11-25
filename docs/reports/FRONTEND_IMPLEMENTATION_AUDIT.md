# 🔍 BÁO CÁO TRIỂN KHAI FRONTEND vs BACKEND
**Ngày:** 16/11/2025  
**Dự án:** ToyStore E-commerce Platform

---

## 📊 TỔNG QUAN

Kiểm tra tình trạng triển khai Frontend so với Backend API và Database Schema.

### **Backend có 10 chức năng chính:**
1. ✅ Authentication (Login/Register)
2. ✅ Products (Public)
3. ✅ Shopping Cart
4. ✅ Orders
5. ✅ Payment
6. ✅ Shipping
7. ✅ Reviews
8. ⚠️ Staff Management
9. ✅ Admin Management
10. ✅ Statistics

---

## 1️⃣ AUTHENTICATION (LOGIN/REGISTER)

### ✅ **BACKEND API** (`/api/auth`)
```javascript
POST /api/auth/register      // Đăng ký
POST /api/auth/login         // Đăng nhập user
POST /api/auth/admin/login   // Đăng nhập admin
```

### ✅ **DATABASE** (`TaiKhoan`)
```sql
TaiKhoan (9 cột):
- ID, TenDangNhap, MatKhau, HoTen
- Email, DienThoai
- VaiTro ('Admin', 'NhanVien', 'KhachHang')
- NgayTao, TrangThai
```

### ✅ **FRONTEND**
- **Pages:**
  - `LoginPage.js` ✅
  - `RegisterPage.js` ✅
  - `AdminLoginPage.js` ✅
  
- **Services:**
  - `authService.js` ✅
    - `login()` ✅
    - `register()` ✅
    - `isAdmin()` ✅
    - `isStaff()` ✅
    - `isAdminOrStaff()` ✅
    - `getUserRole()` ✅

- **Context:**
  - `AuthContext.js` ✅
    - Quản lý state user
    - Expose helper functions

### 🎯 **ĐÁNH GIÁ:** ✅ **HOÀN CHỈNH**
- Frontend đồng bộ với Backend
- Role system đã chuẩn hóa
- Hỗ trợ đầy đủ 3 vai trò: Admin, NhanVien, KhachHang

---

## 2️⃣ PRODUCTS (PUBLIC)

### ✅ **BACKEND API** (`/api/products`)
```javascript
GET  /api/products           // Danh sách SP (phân trang, tìm kiếm)
GET  /api/products/:id       // Chi tiết sản phẩm
```

### ✅ **DATABASE** (`SanPham`)
```sql
SanPham (12 cột):
- ID, Ten, LoaiID, ThuongHieuID
- GiaBan, SoLuongTon, MoTa, HinhAnhURL
- NgayTao, TrangThai
- TongSoDanhGia, DiemTrungBinh

SanPhamHinhAnh (5 cột):
- ID, SanPhamID, DuongDanHinhAnh, ThuTu, LaMacDinh

LoaiSP (3 cột): ID, Ten, TrangThai
ThuongHieu (4 cột): ID, TenThuongHieu, Logo, TrangThai
```

### ⚠️ **FRONTEND**
- **Pages:**
  - `Products/ProductList.js` ✅
  - `Products/ProductDetail.js` ✅

- **Services:**
  - ❌ **THIẾU:** `productService.js`

### 🔧 **VẤN ĐỀ:**
1. ❌ Không có service chuyên dụng cho Products
2. ⚠️ ProductList/ProductDetail đang gọi API trực tiếp
3. ⚠️ Chưa xử lý `TongSoDanhGia`, `DiemTrungBinh`
4. ⚠️ Chưa hiển thị `ThuongHieu` (Logo)
5. ⚠️ Chưa tích hợp `SanPhamHinhAnh` (gallery)

### 🎯 **CẦN LÀM:**
- [ ] Tạo `productService.js`
- [ ] Refactor ProductList/ProductDetail dùng service
- [ ] Hiển thị rating & review count
- [ ] Hiển thị logo thương hiệu
- [ ] Tích hợp gallery nhiều hình ảnh

---

## 3️⃣ SHOPPING CART

### ✅ **BACKEND API** (`/api/cart`)

#### **Guest Cart:**
```javascript
GET    /api/cart/guest              // Lấy giỏ hàng guest
POST   /api/cart/guest/add          // Thêm vào giỏ guest
PUT    /api/cart/guest/update       // Cập nhật số lượng
PATCH  /api/cart/guest/increment/:id // +1
PATCH  /api/cart/guest/decrement/:id // -1
DELETE /api/cart/guest/remove/:id   // Xóa item
DELETE /api/cart/guest/clear        // Xóa hết
POST   /api/cart/guest/restore      // Khôi phục sau thanh toán thất bại
PUT    /api/cart/guest/select/:id   // Chọn/bỏ chọn item
PUT    /api/cart/guest/select-all   // Chọn/bỏ chọn tất cả
GET    /api/cart/guest/selected     // Lấy items đã chọn
```

#### **User Cart (Auth):**
```javascript
GET    /api/cart/                   // Lấy giỏ hàng user
POST   /api/cart/add               // Thêm vào giỏ
PUT    /api/cart/update            // Cập nhật số lượng
PATCH  /api/cart/increment/:id     // +1
PATCH  /api/cart/decrement/:id     // -1
DELETE /api/cart/remove/:id        // Xóa item
DELETE /api/cart/clear             // Xóa hết
PUT    /api/cart/select/:id        // Chọn/bỏ chọn item
PUT    /api/cart/select-all        // Chọn/bỏ chọn tất cả
GET    /api/cart/selected          // Lấy items đã chọn
```

### ✅ **DATABASE**
```sql
GioHang (2 cột): ID, TaiKhoanID
GioHangChiTiet (6 cột): 
  ID, GioHangID, SanPhamID, SoLuong, DonGia, DaChon

GioHangKhachVangLai (7 cột):
  ID, MaPhien, SanPhamID, SoLuong, DonGia, DaChon, NgayHetHan
```

### ⚠️ **FRONTEND**
- **Pages:**
  - `CartPage.js` ✅

- **Services:**
  - ❌ **THIẾU:** `cartService.js`

### 🔧 **VẤN ĐỀ:**
1. ❌ Không có service chuyên dụng cho Cart
2. ⚠️ CartPage đang gọi API trực tiếp
3. ⚠️ Chưa xử lý field `DaChon` (select items)
4. ⚠️ Chưa có chức năng "Chọn sản phẩm để thanh toán"
5. ⚠️ Chưa xử lý Guest Cart đầy đủ
6. ⚠️ Chưa có chức năng restore sau thanh toán thất bại

### 🎯 **CẦN LÀM:**
- [ ] Tạo `cartService.js` (hỗ trợ cả User & Guest)
- [ ] Refactor CartPage dùng service
- [ ] Thêm checkbox chọn sản phẩm
- [ ] Tính tổng tiền chỉ sản phẩm đã chọn
- [ ] Xử lý Guest Cart với sessionStorage
- [ ] Tích hợp restore cart

---

## 4️⃣ ORDERS

### ✅ **BACKEND API** (`/api/orders`)
```javascript
POST   /api/orders/create          // Tạo đơn hàng
GET    /api/orders/lookup/:code    // Tra cứu đơn (guest)
POST   /api/orders/cancel/:id      // Hủy đơn
GET    /api/orders/history         // Lịch sử đơn (user)
GET    /api/orders/:id             // Chi tiết đơn
```

### ✅ **DATABASE**
```sql
HoaDon (13 cột):
  ID, MaHD, KhachHangID, PhuongThucThanhToanID
  NgayLap, TrangThai
  TienGoc, VoucherID, GiamGia
  TienShip, TyLeVAT, TienVAT, ThanhTien, GhiChu

ChiTietHoaDon (6 cột):
  ID, HoaDonID, SanPhamID, SoLuong, DonGia, ThanhTien

DiaChiGiaoHang (11 cột):
  ID, HoaDonID, MaTinhID, MaQuanID, MaPhuongXa
  TenTinh, TenQuan, TenPhuong, DiaChiChiTiet
  SoDienThoai, TenNguoiNhan

LichSuTrangThaiDonHang (6 cột):
  ID, HoaDonID, TrangThaiCu, TrangThaiMoi
  NguoiThayDoi, LyDo, NgayThayDoi

KhachHang (6 cột):
  ID, HoTen, Email, DienThoai, TaiKhoanID, NgayTao
```

**Trạng thái đơn hàng:**
- Chờ thanh toán
- Chờ xử lý
- Đã xác nhận
- Đang đóng gói
- Đang giao hàng
- Đã giao hàng
- Hoàn thành
- Đã hủy
- Giao hàng thất bại
- Đang hoàn tiền
- Đã hoàn tiền

### ⚠️ **FRONTEND**
- **Pages:**
  - `CheckoutPage.js` ✅
  - `OrderHistoryPage.js` ✅
  - `OrderDetailPage.js` ✅
  - `OrderLookupPage.js` ✅

- **Services:**
  - ❌ **THIẾU:** `orderService.js`

### 🔧 **VẤN ĐỀ:**
1. ❌ Không có service chuyên dụng cho Orders
2. ⚠️ CheckoutPage đang gọi API trực tiếp
3. ⚠️ Chưa hiển thị đầy đủ trạng thái đơn hàng
4. ⚠️ Chưa có timeline lịch sử thay đổi trạng thái
5. ⚠️ Chưa tích hợp `TyLeVAT`, `TienVAT`
6. ⚠️ Chưa xử lý `KhachHang` cho guest checkout

### 🎯 **CẦN LÀM:**
- [ ] Tạo `orderService.js`
- [ ] Refactor các order pages dùng service
- [ ] Thêm timeline trạng thái đơn hàng
- [ ] Hiển thị VAT trong chi tiết đơn
- [ ] Xử lý guest checkout (tạo KhachHang)
- [ ] Thêm order constants cho trạng thái

---

## 5️⃣ PAYMENT

### ✅ **BACKEND API** (`/api/payment`)
```javascript
POST   /api/payment/vnpay/create-url    // Tạo URL thanh toán VNPay
GET    /api/payment/vnpay/return        // Callback VNPay
POST   /api/payment/momo/create         // Tạo thanh toán MoMo
POST   /api/payment/momo/callback       // Callback MoMo
```

### ✅ **DATABASE**
```sql
PhuongThucThanhToan (2 cột):
  ID, Ten
  
  Giá trị mẫu:
  1. Tiền mặt (COD)
  2. Chuyển khoản ngân hàng
  3. VNPay
  4. MoMo
```

### ⚠️ **FRONTEND**
- **Pages:**
  - `PaymentMethodPage.js` ✅
  - `PaymentReturnPage.js` ✅

- **Services:**
  - ❌ **THIẾU:** `paymentService.js`

### 🔧 **VẤN ĐỀ:**
1. ❌ Không có service chuyên dụng cho Payment
2. ⚠️ PaymentMethodPage đang gọi API trực tiếp
3. ⚠️ Chưa hiển thị logo các phương thức thanh toán
4. ⚠️ Chưa xử lý lỗi thanh toán đầy đủ
5. ⚠️ Chưa có loading state khi redirect

### 🎯 **CẦN LÀM:**
- [ ] Tạo `paymentService.js`
- [ ] Refactor payment pages dùng service
- [ ] Thêm logo VNPay, MoMo, Banking
- [ ] Xử lý error handling tốt hơn
- [ ] Thêm loading animation khi redirect

---

## 6️⃣ SHIPPING

### ✅ **BACKEND API** (`/api/shipping`)
```javascript
GET    /api/shipping/provinces         // Danh sách tỉnh/thành
GET    /api/shipping/districts/:id     // Quận/huyện theo tỉnh
GET    /api/shipping/wards/:id         // Phường/xã theo quận
POST   /api/shipping/calculate-fee     // Tính phí ship GHN
```

### ✅ **DATABASE**
```sql
ThongTinVanChuyen (11 cột):
  ID, HoaDonID, MaVanDon, DonViVanChuyen
  NgayGuiHang, NgayGiaoThanhCong, NgayGiaoDuKien
  SoLanGiaoThatBai, GhiChuShipper
  PhiVanChuyen, TrangThaiGHN

DiaChiGiaoHangUser (12 cột):
  ID, TaiKhoanID, TenNguoiNhan, SoDienThoai
  MaTinhID, TenTinh, MaQuanID, TenQuan
  MaPhuongXa, TenPhuong, DiaChiChiTiet
  LaMacDinh, TrangThai
```

### ⚠️ **FRONTEND**
- **Pages:**
  - `CheckoutPage.js` (có form địa chỉ) ✅

- **Services:**
  - ❌ **THIẾU:** `shippingService.js`

- **Components:**
  - ❌ **THIẾU:** `AddressForm.js`
  - ❌ **THIẾU:** `AddressSelector.js`

### 🔧 **VẤN ĐỀ:**
1. ❌ Không có service chuyên dụng cho Shipping
2. ❌ Chưa có component tái sử dụng cho địa chỉ
3. ⚠️ Chưa tích hợp GHN API đầy đủ
4. ⚠️ Chưa có chức năng quản lý địa chỉ của user
5. ⚠️ Chưa tính phí ship động theo địa chỉ
6. ⚠️ Chưa hiển thị timeline vận chuyển

### 🎯 **CẦN LÀM:**
- [ ] Tạo `shippingService.js`
- [ ] Tạo `AddressForm.js` component
- [ ] Tạo `AddressSelector.js` component
- [ ] Tạo trang quản lý địa chỉ user
- [ ] Tích hợp tính phí ship GHN
- [ ] Hiển thị tracking vận chuyển

---

## 7️⃣ REVIEWS

### ✅ **BACKEND API** (`/api/reviews`)
```javascript
GET    /api/reviews/product/:id        // Đánh giá theo sản phẩm
POST   /api/reviews                    // Tạo đánh giá (auth)
PUT    /api/reviews/:id                // Sửa đánh giá (auth)
DELETE /api/reviews/:id                // Xóa đánh giá (auth)
```

### ✅ **DATABASE**
```sql
DanhGiaSanPham (8 cột):
  ID, SanPhamID, TaiKhoanID, SoSao
  NoiDung, HinhAnh1
  TrangThai ('ChoDuyet', 'DaDuyet', 'BiTuChoi')
  NgayTao
```

### ⚠️ **FRONTEND**
- **Components:**
  - ❌ **THIẾU:** `ReviewList.js`
  - ❌ **THIẾU:** `ReviewForm.js`
  - ❌ **THIẾU:** `StarRating.js`

- **Services:**
  - ❌ **THIẾU:** `reviewService.js`

### 🔧 **VẤN ĐỀ:**
1. ❌ Chưa triển khai hoàn toàn
2. ❌ Không có UI cho đánh giá
3. ❌ Không có service
4. ⚠️ ProductDetail chưa hiển thị reviews

### 🎯 **CẦN LÀM:**
- [ ] Tạo `reviewService.js`
- [ ] Tạo `ReviewList.js` component
- [ ] Tạo `ReviewForm.js` component
- [ ] Tạo `StarRating.js` component
- [ ] Tích hợp vào ProductDetail
- [ ] Xử lý upload hình ảnh review

---

## 8️⃣ STAFF MANAGEMENT

### ✅ **BACKEND API** (`/api/staff`)
```javascript
GET    /api/staff/orders              // Đơn hàng (staff)
PUT    /api/staff/orders/:id/status   // Cập nhật trạng thái (staff)
GET    /api/staff/orders/:id          // Chi tiết đơn (staff)
```

### ⚠️ **FRONTEND**
- **Pages:**
  - ❌ **THIẾU:** `StaffDashboard.js`
  - ❌ **THIẾU:** `StaffOrderManagement.js`

### 🔧 **VẤN ĐỀ:**
1. ❌ Chưa triển khai gì
2. ❌ Role `NhanVien` mới được thêm
3. ⚠️ Navbar đã có menu nhưng chưa có trang

### 🎯 **CẦN LÀM:**
- [ ] Tạo `staffService.js`
- [ ] Tạo `StaffDashboard.js`
- [ ] Tạo `StaffOrderManagement.js`
- [ ] Phân quyền xem đơn hàng
- [ ] Chỉ cho phép cập nhật trạng thái nhất định

---

## 9️⃣ ADMIN MANAGEMENT

### ✅ **BACKEND API**

#### **User Management** (`/api/admin/users`)
```javascript
GET    /api/admin/users               // Danh sách user
GET    /api/admin/users/:id           // Chi tiết user
PUT    /api/admin/users/:id           // Cập nhật user
DELETE /api/admin/users/:id           // Xóa user
PATCH  /api/admin/users/:id/toggle    // Khóa/mở khóa
```

#### **Product Management** (`/api/admin/products`)
```javascript
POST   /api/admin/products            // Thêm SP
PUT    /api/admin/products/:id        // Sửa SP
DELETE /api/admin/products/:id        // Xóa SP
POST   /api/admin/products/:id/images // Upload ảnh SP
```

#### **Order Management** (`/api/admin/orders`)
```javascript
GET    /api/admin/orders              // Danh sách đơn
GET    /api/admin/orders/:id          // Chi tiết đơn
PUT    /api/admin/orders/:id/status   // Cập nhật trạng thái
PUT    /api/admin/orders/:id/shipping // Cập nhật vận chuyển
```

#### **Voucher Management** (`/api/admin/vouchers`)
```javascript
GET    /api/admin/vouchers            // Danh sách voucher
POST   /api/admin/vouchers            // Tạo voucher
PUT    /api/admin/vouchers/:id        // Sửa voucher
DELETE /api/admin/vouchers/:id        // Xóa voucher
```

### ✅ **FRONTEND**
- **Pages:**
  - `AdminDashboard.js` ✅
  - `UserManagementPage.js` ✅
  - `ProductManagementPage.jsx` ✅
  - `OrderManagementPage.jsx` ✅
  - `VoucherManagementPage.jsx` ✅
  - `CategoryManagementPage.js` ✅

- **Components:**
  - `UserTable.js` ✅

- **Services:**
  - ❌ **THIẾU:** `adminService.js`

### 🔧 **VẤN ĐỀ:**
1. ❌ Không có service tập trung cho Admin
2. ⚠️ Các admin pages đang gọi API trực tiếp
3. ⚠️ Chưa chuẩn hóa API calls
4. ⚠️ ProductManagement chưa xử lý `SanPhamHinhAnh`
5. ⚠️ VoucherManagement chưa đầy đủ fields

### 🎯 **CẦN LÀM:**
- [ ] Tạo `adminService.js`
- [ ] Refactor tất cả admin pages dùng service
- [ ] Cập nhật ProductManagement xử lý gallery
- [ ] Cập nhật VoucherManagement đầy đủ
- [ ] Thêm bulk actions (xóa nhiều, cập nhật nhiều)

---

## 🔟 STATISTICS

### ✅ **BACKEND API** (`/api/admin/statistics`)
```javascript
GET    /api/admin/statistics/overview      // Tổng quan
GET    /api/admin/statistics/revenue       // Doanh thu
GET    /api/admin/statistics/products      // Sản phẩm bán chạy
GET    /api/admin/statistics/orders        // Thống kê đơn hàng
```

### ✅ **FRONTEND**
- **Pages:**
  - `StatisticsPage.jsx` ✅

- **Services:**
  - ❌ **THIẾU:** Dùng chung `adminService.js`

### 🔧 **VẤN ĐỀ:**
1. ⚠️ StatisticsPage đang gọi API trực tiếp
2. ⚠️ Chưa có charts đẹp (Chart.js, Recharts)
3. ⚠️ Chưa có date range picker

### 🎯 **CẦN LÀM:**
- [ ] Refactor StatisticsPage dùng service
- [ ] Thêm chart libraries
- [ ] Thêm date range filter
- [ ] Thêm export PDF/Excel

---

## 📋 TỔNG KẾT TRIỂN KHAI

### ✅ **ĐÃ TRIỂN KHAI (80%)**
1. ✅ Authentication - **100%**
2. ⚠️ Products - **70%**
3. ⚠️ Shopping Cart - **60%**
4. ⚠️ Orders - **80%**
5. ⚠️ Payment - **70%**
6. ⚠️ Shipping - **50%**
7. ❌ Reviews - **20%**
8. ❌ Staff Management - **10%**
9. ⚠️ Admin Management - **85%**
10. ⚠️ Statistics - **75%**

### ❌ **SERVICES THIẾU (ƯU TIÊN CAO)**
1. ❌ `productService.js`
2. ❌ `cartService.js`
3. ❌ `orderService.js`
4. ❌ `paymentService.js`
5. ❌ `shippingService.js`
6. ❌ `reviewService.js`
7. ❌ `staffService.js`
8. ❌ `adminService.js`

### ❌ **COMPONENTS THIẾU**
1. ❌ `ReviewList.js`
2. ❌ `ReviewForm.js`
3. ❌ `StarRating.js`
4. ❌ `AddressForm.js`
5. ❌ `AddressSelector.js`
6. ❌ `ProductGallery.js`

### ❌ **PAGES THIẾU**
1. ❌ `StaffDashboard.js`
2. ❌ `StaffOrderManagement.js`
3. ❌ `UserAddressManagement.js`

---

## 🎯 KẾ HOẠCH TRIỂN KHAI

### **PHASE 1: Tạo Services (Ưu tiên cao)**
1. [ ] `productService.js` - 30 phút
2. [ ] `cartService.js` - 45 phút
3. [ ] `orderService.js` - 30 phút
4. [ ] `paymentService.js` - 20 phút
5. [ ] `shippingService.js` - 30 phút
6. [ ] `adminService.js` - 45 phút

**Thời gian:** ~3 giờ

### **PHASE 2: Refactor Existing Pages**
1. [ ] ProductList/ProductDetail dùng productService
2. [ ] CartPage dùng cartService
3. [ ] CheckoutPage dùng orderService + shippingService
4. [ ] OrderHistory/Detail dùng orderService
5. [ ] Admin pages dùng adminService

**Thời gian:** ~2 giờ

### **PHASE 3: Triển khai Reviews**
1. [ ] `reviewService.js`
2. [ ] `StarRating.js` component
3. [ ] `ReviewList.js` component
4. [ ] `ReviewForm.js` component
5. [ ] Tích hợp vào ProductDetail

**Thời gian:** ~2 giờ

### **PHASE 4: Triển khai Staff Management**
1. [ ] `staffService.js`
2. [ ] `StaffDashboard.js`
3. [ ] `StaffOrderManagement.js`
4. [ ] Phân quyền routes

**Thời gian:** ~2 giờ

### **PHASE 5: Hoàn thiện Shipping**
1. [ ] `AddressForm.js` component
2. [ ] `AddressSelector.js` component
3. [ ] `UserAddressManagement.js` page
4. [ ] Tích hợp GHN calculate fee

**Thời gian:** ~2 giờ

---

## 🚀 BƯỚC TIẾP THEO

Chúng ta sẽ triển khai từng phase:
1. **Bắt đầu với PHASE 1:** Tạo tất cả services
2. **PHASE 2:** Refactor existing pages
3. **PHASE 3-5:** Triển khai features mới

**Tổng thời gian dự kiến:** ~11 giờ

**Bạn muốn bắt đầu từ phase nào?**

---

**Status:** 📊 **ĐANG PHÂN TÍCH**  
**Ngày tạo:** 16/11/2025  
**Người thực hiện:** AI Assistant
