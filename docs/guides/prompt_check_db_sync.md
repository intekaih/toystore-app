# 📋 PROMPT KIỂM TRA DATABASE & BACKEND SYNC - TOYSTORE

## 🎯 HƯỚNG DẪN KIỂM TRA ĐỒNG BỘ DATABASE VÀ BACKEND

### Dự Án: Website Bán Đồ Chơi (Toystore) - MVP v3.1

---

## ✅ PART 1: KIỂM TRA TÊN CỘT & BẢNG

**Yêu cầu:** Kiểm tra file BE có sử dụng đúng tên các bảng và cột từ database không

### Danh sách 20 bảng DATABASE:

1. **TaiKhoan** (9 cột)
   - ID, TenDangNhap, MatKhau, HoTen, Email, DienThoai, VaiTro, NgayTao, TrangThai

2. **LoaiSP** (3 cột)
   - ID, Ten, TrangThai

3. **ThuongHieu** (3 cột)
   - ID, TenThuongHieu, Logo, TrangThai

4. **PhuongThucThanhToan** (2 cột)
   - ID, Ten

5. **SanPham** (12 cột)
   - ID, Ten, LoaiID, ThuongHieuID, GiaBan, SoLuongTon, MoTa, HinhAnhURL, NgayTao, TrangThai, TongSoDanhGia, DiemTrungBinh

6. **SanPhamHinhAnh** (5 cột)
   - ID, SanPhamID, DuongDanHinhAnh, ThuTu, LaMacDinh

7. **KhachHang** (6 cột)
   - ID, HoTen, Email, DienThoai, TaiKhoanID, NgayTao

8. **Voucher** (14 cột)
   - ID, MaVoucher, Ten, MoTa, LoaiGiamGia, GiaTriGiam, GiamToiDa, DonHangToiThieu, ApDungCho, NgayBatDau, NgayKetThuc, SoLuong, SoLuongDaSuDung, SuDungToiDaMoiNguoi, TrangThai

9. **VoucherSanPham** (4 cột)
   - ID, VoucherID, SanPhamID, NgayTao

10. **VoucherLoaiSanPham** (4 cột)
    - ID, VoucherID, LoaiID, NgayTao

11. **HoaDon** (13 cột)
    - ID, MaHD, KhachHangID, PhuongThucThanhToanID, NgayLap, TrangThai, TienGoc, VoucherID, GiamGia, TienShip, TyLeVAT, TienVAT, ThanhTien, GhiChu

12. **DiaChiGiaoHang** (11 cột)
    - ID, HoaDonID, MaTinhID, MaQuanID, MaPhuongXa, TenTinh, TenQuan, TenPhuong, DiaChiChiTiet, SoDienThoai, TenNguoiNhan

13. **ThongTinVanChuyen** (11 cột)
    - ID, HoaDonID, MaVanDon, DonViVanChuyen, NgayGuiHang, NgayGiaoThanhCong, NgayGiaoDuKien, SoLanGiaoThatBai, GhiChuShipper, PhiVanChuyen, TrangThaiGHN

14. **LichSuTrangThaiDonHang** (6 cột)
    - ID, HoaDonID, TrangThaiCu, TrangThaiMoi, NguoiThayDoi, LyDo, NgayThayDoi

15. **ChiTietHoaDon** (6 cột)
    - ID, HoaDonID, SanPhamID, SoLuong, DonGia, ThanhTien

16. **GioHang** (2 cột)
    - ID, TaiKhoanID

17. **GioHangChiTiet** (6 cột)
    - ID, GioHangID, SanPhamID, SoLuong, DonGia, DaChon

18. **GioHangKhachVangLai** (7 cột)
    - ID, MaPhien, SanPhamID, SoLuong, DonGia, DaChon, NgayHetHan

19. **DanhGiaSanPham** (8 cột)
    - ID, SanPhamID, TaiKhoanID, SoSao, NoiDung, HinhAnh1, TrangThai, NgayTao

20. **DiaChiGiaoHangUser** (12 cột)
    - ID, TaiKhoanID, TenNguoiNhan, SoDienThoai, MaTinhID, TenTinh, MaQuanID, TenQuan, MaPhuongXa, TenPhuong, DiaChiChiTiet, LaMacDinh, TrangThai

---

## 🔍 PART 2: KIỂM TRA CHỨC NĂNG CÓ TRONG DATABASE

**Yêu cầu:** Kiểm tra BE đã implement các chức năng từ database chưa

### Danh sách Chức Năng Core:

#### 📦 QUẢN LÝ SẢN PHẨM (SanPham + SanPhamHinhAnh)
- [ ] Lấy danh sách sản phẩm (có phân trang)
- [ ] Lấy chi tiết sản phẩm (kèm hình ảnh)
- [ ] Tìm kiếm sản phẩm theo tên, danh mục, khoảng giá
- [ ] Thêm sản phẩm mới (Admin)
- [ ] Sửa sản phẩm (Admin)
- [ ] Xóa sản phẩm (Admin)
- [ ] Upload/quản lý nhiều ảnh sản phẩm
- [ ] Hiển thị ảnh mặc định (LaMacDinh)
- [ ] Lấy thống kê đánh giá (TongSoDanhGia, DiemTrungBinh)
- [ ] Lọc sản phẩm theo danh mục (LoaiID)
- [ ] Lọc sản phẩm theo thương hiệu (ThuongHieuID)
- [ ] Sắp xếp theo giá, rating, mới nhất

#### 👥 QUẢN LÝ TÀI KHOẢN (TaiKhoan + KhachHang)
- [ ] Đăng ký tài khoản mới (hash password bcrypt)
- [ ] Đăng nhập (verify password)
- [ ] Phân quyền theo VaiTro (Admin, NhanVien, KhachHang)
- [ ] Lấy thông tin tài khoản
- [ ] Cập nhật profil (HoTen, Email, DienThoai)
- [ ] Thay đổi mật khẩu (verify old password)
- [ ] Kiểm tra TenDangNhap & Email không trùng lặp (UNIQUE)
- [ ] Khóa/mở tài khoản (TrangThai)
- [ ] Lấy danh sách khách hàng (Admin)

#### 🛒 QUẢN LÝ GIỎ HÀNG (GioHang + GioHangChiTiet + GioHangKhachVangLai)
- [ ] Tạo giỏ hàng cho user đăng nhập
- [ ] Thêm sản phẩm vào giỏ
- [ ] Xóa sản phẩm khỏi giỏ
- [ ] Cập nhật số lượng sản phẩm
- [ ] Lấy danh sách giỏ hàng (GioHangChiTiet)
- [ ] Tính tổng tiền giỏ hàng
- [ ] Hỗ trợ guest checkout (GioHangKhachVangLai với MaPhien/SessionID)
- [ ] Xóa giỏ hàng hết hạn (NgayHetHan)
- [ ] Chọn/bỏ chọn sản phẩm (DaChon)

#### 💳 QUẢN LÝ ĐƠN HÀNG (HoaDon + ChiTietHoaDon + DiaChiGiaoHang + ThongTinVanChuyen + LichSuTrangThaiDonHang)
- [ ] Tạo đơn hàng từ giỏ hàng
- [ ] Tính TienGoc từ ChiTietHoaDon
- [ ] Áp dụng voucher (GiamGia)
- [ ] Tính TienVAT = ThanhTien * TyLeVAT
- [ ] Tính ThanhTien = TienGoc - GiamGia + TienShip + TienVAT
- [ ] Tạo MaHD unique & auto-generate
- [ ] Lưu địa chỉ giao hàng (DiaChiGiaoHang)
- [ ] Lưu thông tin vận chuyển (ThongTinVanChuyen)
- [ ] Cập nhật trạng thái đơn hàng (TrangThai)
- [ ] Ghi lịch sử thay đổi trạng thái (LichSuTrangThaiDonHang)
- [ ] Lấy danh sách đơn hàng theo user
- [ ] Lấy chi tiết đơn hàng
- [ ] Admin: xem tất cả đơn hàng
- [ ] Hỗ trợ GHN API (MaTinhID, MaQuanID, MaPhuongXa)
- [ ] Cập nhật trạng thái GHN webhook (TrangThaiGHN)

#### 🎁 QUẢN LÝ VOUCHER (Voucher + VoucherSanPham + VoucherLoaiSanPham)
- [ ] Tạo voucher mới (Admin)
- [ ] Lấy danh sách voucher có hiệu lực
- [ ] Kiểm tra voucher hợp lệ (ngày, số lượng, điều kiện)
- [ ] Áp dụng voucher vào đơn hàng
- [ ] Tính GiamGia theo LoaiGiamGia (TienMat hoặc PhanTram)
- [ ] Giới hạn GiamToiDa
- [ ] Kiểm tra DonHangToiThieu
- [ ] Kiểm tra SoLuongDaSuDung <= SoLuong
- [ ] Kiểm tra SuDungToiDaMoiNguoi
- [ ] Áp dụng voucher theo ApDungCho (ToanDon, SanPhamCuThe, LoaiSanPham)
- [ ] Cập nhật SoLuongDaSuDung sau mỗi lần dùng
- [ ] Admin: quản lý voucher (thêm, sửa, xóa, kích hoạt)

#### ⭐ ĐÁNH GIÁ SẢN PHẨM (DanhGiaSanPham)
- [ ] Lấy danh sách đánh giá sản phẩm
- [ ] Thêm đánh giá mới (user đã mua)
- [ ] Kiểm tra SoSao từ 1-5
- [ ] Upload ảnh đánh giá (HinhAnh1)
- [ ] Duyệt đánh giá (Admin, TrangThai)
- [ ] Cập nhật TongSoDanhGia & DiemTrungBinh trong SanPham
- [ ] Lọc đánh giá theo TrangThai (ChoDuyet, DaDuyet, BiTuChoi)
- [ ] Sắp xếp đánh giá mới nhất

#### 📍 QUẢN LÝ ĐỊA CHỈ (DiaChiGiaoHangUser)
- [ ] Tạo địa chỉ giao hàng mới
- [ ] Lấy danh sách địa chỉ của user
- [ ] Cập nhật địa chỉ
- [ ] Xóa địa chỉ
- [ ] Đặt địa chỉ mặc định (LaMacDinh)
- [ ] Tích hợp GHN: dropdown tỉnh, quận, phường
- [ ] Lưu MaTinhID, MaQuanID, MaPhuongXa từ GHN API

#### 📊 DANH MỤC & THƯƠNG HIỆU (LoaiSP + ThuongHieu)
- [ ] Lấy danh sách danh mục
- [ ] Lấy danh sách thương hiệu
- [ ] Admin: quản lý danh mục
- [ ] Admin: quản lý thương hiệu

#### 💰 PHƯƠNG THỨC THANH TOÁN (PhuongThucThanhToan)
- [ ] Lấy danh sách phương thức thanh toán
- [ ] Hỗ trợ: COD, chuyển khoản, VNPay, MoMo

---

## 📝 PART 3: CHECKLIST KIỂM TRA CỤ THỂ

### 1️⃣ Kiểm Tra Naming Convention
```
Yêu cầu:
- Tên model/entity: PascalCase, viết tắt tương ứng với bảng DB
  VD: TaiKhoan, SanPham, HoaDon, DanhGiaSanPham
  
- Tên property: PascalCase hoặc camelCase (tùy framework)
  VD: tenDangNhap, giaBan, soLuongTon
  
- Tên API endpoint:
  GET    /api/v1/san-pham          → getAll()
  GET    /api/v1/san-pham/:id      → getById()
  POST   /api/v1/san-pham          → create()
  PUT    /api/v1/san-pham/:id      → update()
  DELETE /api/v1/san-pham/:id      → delete()

Kiểm tra:
☐ File Service: product.service.ts, user.service.ts, order.service.ts, ...
☐ File Controller: product.controller.ts, user.controller.ts, ...
☐ File Model/Entity: Product.ts, User.ts, Order.ts, ...
☐ File DTO: CreateProductDTO, UpdateProductDTO, ...
```

### 2️⃣ Kiểm Tra Foreign Key & Relationships
```
Kiểm tra có SELECT * FROM bảng với JOIN đúng chưa:

☐ SanPham.LoaiID → LoaiSP
☐ SanPham.ThuongHieuID → ThuongHieu
☐ SanPhamHinhAnh.SanPhamID → SanPham
☐ KhachHang.TaiKhoanID → TaiKhoan
☐ HoaDon.KhachHangID → KhachHang
☐ HoaDon.PhuongThucThanhToanID → PhuongThucThanhToan
☐ HoaDon.VoucherID → Voucher
☐ ChiTietHoaDon.HoaDonID → HoaDon
☐ ChiTietHoaDon.SanPhamID → SanPham
☐ VoucherSanPham.VoucherID → Voucher
☐ VoucherSanPham.SanPhamID → SanPham
☐ DanhGiaSanPham.SanPhamID → SanPham
☐ DanhGiaSanPham.TaiKhoanID → TaiKhoan
```

### 3️⃣ Kiểm Tra Validation & Business Logic
```
Kiểm tra có validate theo DB constraints:

☐ VaiTro IN ('Admin', 'NhanVien', 'KhachHang')
☐ GiaBan >= 0
☐ SoLuongTon >= 0
☐ SoSao BETWEEN 1 AND 5
☐ TrangThai IN ('Chờ thanh toán', 'Chờ xử lý', ...)
☐ LoaiGiamGia IN ('TienMat', 'PhanTram')
☐ ThanhTien >= 0
☐ SoLuong > 0
☐ MaHD UNIQUE
☐ TenDangNhap UNIQUE
☐ Email UNIQUE
```

### 4️⃣ Kiểm Tra API Response Format
```
Mẫu response phải contain tất cả field từ DB:

☐ GET /api/san-pham/:id → response có đủ 12 field của SanPham
☐ GET /api/san-pham/:id/hinh-anh → response có 5 field SanPhamHinhAnh
☐ GET /api/hoa-don/:id → response có 13 field HoaDon + nested ChiTietHoaDon
☐ GET /api/hoa-don/:id/dia-chi → response có 11 field DiaChiGiaoHang
☐ Kiểm tra type dữ liệu (string, number, date, boolean)
☐ Kiểm tra NULL-able fields (nullable: true)
```

---

## 🎯 PART 4: HƯỚNG DẪN KIỂM TRA TỪNG FEATURE

**Cách sử dụng prompt này:**

1. Hãy copy danh sách 20 bảng database trên
2. Paste tên file BE của bạn (VD: product.service.ts, user.controller.ts, ...)
3. Yêu cầu Claude Copilot:
   ```
   "Hãy kiểm tra file [tên file] này có sử dụng đúng tên bảng/cột từ database 
   toystore (20 bảng MVP v3.1) chưa? Kiểm tra:
   
   1. Tên bảng DB (ví dụ: TaiKhoan, SanPham, HoaDon)
   2. Tên cột chính xác (ví dụ: TenDangNhap, GiaBan, SoLuongTon)
   3. Foreign Key relationships có đúng chưa
   4. Có implement tất cả chức năng trong database chưa
   
   Nếu thiếu hoặc sai, hãy chỉ ra cụ thể chỗ nào."
   ```

4. Hoặc yêu cầu chi tiết hơn:
   ```
   "Kiểm tra GET /api/san-pham/:id endpoint:
   - Có return đủ 12 cột từ SanPham không?
   - Có kèm danh sách SanPhamHinhAnh không?
   - Có lấy TongSoDanhGia & DiemTrungBinh từ DanhGiaSanPham không?
   - Response format có match database schema chưa?"
   ```

---

## 📌 GHI CHÚ QUAN TRỌNG

1. **Database version: 3.1 FINAL**
   - 20 bảng core (đã loại bỏ 30 trường dư thừa)
   - 100% tiếng Việt
   - 45+ indexes
   - 35+ constraints

2. **Tên tiếng Việt (KHÔNG dùng English)**
   - ✅ Đúng: TaiKhoan, SanPham, HoaDon, GiaBan, TenDangNhap
   - ❌ Sai: User, Product, Order, Price, Username

3. **Data types phải match DB**
   - INT: ID, SoLuong, SoLanGiaoThatBai
   - NVARCHAR: Tên, Mô tả, Email (cho Tiếng Việt)
   - VARCHAR: Mã (MaHD, MaVoucher, TenDangNhap)
   - DECIMAL(18,2): Giá tiền
   - BIT: TrangThai, Enable (0=inactive, 1=active)
   - DATETIME: Ngày tháng

4. **Foreign Key (không được NULL nếu required)**
   - LoaiID: required
   - ThuongHieuID: nullable
   - TaiKhoanID: nullable (guest)

5. **Đặc biệt lưu ý**
   - Password phải hash (bcrypt/Argon2)
   - MaHD phải auto-generate & UNIQUE
   - TrangThai đơn hàng có 11 giá trị
   - GioHangKhachVangLai có NgayHetHan

---

## 💡 CÂU HỎI GỢI Ý

Nếu muốn kiểm tra cụ thể, hãy hỏi Claude Copilot:

1. "File nào implement chức năng quản lý sản phẩm? Có đầy đủ chưa?"
2. "Endpoint tạo đơn hàng có tính TienGoc, GiamGia, TienVAT, ThanhTien đúng chưa?"
3. "Có kiểm tra SoSao 1-5 trước khi lưu đánh giá không?"
4. "Voucher apply có check DonHangToiThieu & SoLuongDaSuDung không?"
5. "Danh sách sản phẩm có filter theo LoaiID & ThuongHieuID không?"
6. "Có xóa giỏ hàng hết hạn (NgayHetHan) tự động không?"

---

✅ **Sẵn sàng kiểm tra!** Hãy upload file BE và dán prompt này cho Claude Copilot.
