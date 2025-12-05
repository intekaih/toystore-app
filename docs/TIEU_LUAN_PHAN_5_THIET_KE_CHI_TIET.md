# PHẦN 5: THIẾT KẾ CHI TIẾT

## 5.1. Thiết kế cơ sở dữ liệu

Cơ sở dữ liệu là nền tảng của hệ thống, lưu trữ tất cả thông tin quan trọng và đảm bảo tính toàn vẹn dữ liệu. Thiết kế database của ToyStore tuân thủ các nguyên tắc chuẩn hóa và tối ưu hóa để đảm bảo hiệu suất và khả năng mở rộng.

### 5.1.1. Mô hình quan hệ (ERD)

Hệ thống ToyStore sử dụng mô hình cơ sở dữ liệu quan hệ (Relational Database Model) với 21 bảng chính, được tổ chức thành các nhóm chức năng rõ ràng.

**Nhóm quản lý người dùng**

Bảng TaiKhoan lưu trữ thông tin đăng nhập với các trường: MaTK (primary key), TenDangNhap, Email (unique), MatKhau (đã mã hóa), VaiTro (user/admin/staff), TrangThai (active/inactive), NgayTao, NgayCapNhat. Bảng KhachHang lưu thông tin chi tiết khách hàng với các trường: MaKH (primary key), TaiKhoanID (foreign key), HoTen, SoDienThoai, NgaySinh, GioiTinh, DiaChi. Quan hệ giữa TaiKhoan và KhachHang là một-một, mỗi tài khoản tương ứng với một khách hàng.

**Nhóm quản lý sản phẩm**

Bảng SanPham lưu thông tin sản phẩm: MaSP (primary key), TenSP, MoTa, Gia, SoLuongTonKho, LoaiID (foreign key), ThuongHieuID (foreign key), DoTuoiPhuHop, HinhAnh, TrangThai, NgayTao. Bảng LoaiSP lưu danh mục sản phẩm: MaLoai (primary key), TenLoai, MoTa. Bảng ThuongHieu lưu thông tin thương hiệu: MaThuongHieu (primary key), TenThuongHieu, MoTa. Bảng SanPhamHinhAnh lưu nhiều hình ảnh cho một sản phẩm: MaHinhAnh (primary key), SanPhamID (foreign key), DuongDan, ThuTu, LaMacDinh.

**Nhóm quản lý giỏ hàng**

Bảng GioHang lưu thông tin giỏ hàng: MaGioHang (primary key), TaiKhoanID (foreign key), NgayTao, NgayCapNhat. Bảng GioHangChiTiet lưu chi tiết sản phẩm trong giỏ: MaGioHangChiTiet (primary key), GioHangID (foreign key), SanPhamID (foreign key), SoLuong, NgayThem. Bảng GioHangKhachVangLai lưu giỏ hàng cho khách chưa đăng nhập: MaGioHangKV (primary key), SessionID, SanPhamID (foreign key), SoLuong, NgayThem, NgayHetHan.

**Nhóm quản lý đơn hàng**

Bảng HoaDon lưu thông tin đơn hàng: MaHD (primary key), KhachHangID (foreign key), TongTien, TienGoc, TienVAT, TyLeVAT, MaVoucher, TienGiamGia, PhiVanChuyen, MiemPhiVanChuyen, TrangThai, PhuongThucThanhToanID (foreign key), TrangThaiThanhToan, NgayDat, NgayCapNhat. Bảng ChiTietHoaDon lưu chi tiết sản phẩm trong đơn: MaCTHD (primary key), HoaDonID (foreign key), SanPhamID (foreign key), SoLuong, DonGia, ThanhTien. Bảng PhuongThucThanhToan lưu các phương thức thanh toán: MaPTTT (primary key), TenPTTT, MoTa.

**Nhóm quản lý voucher**

Bảng Voucher lưu thông tin voucher: MaVoucher (primary key), Code (unique), LoaiGiamGia (percent/fixed), GiaTriGiam, GiaTriDonHangToiThieu, SoLuong, SoLuongDaSuDung, NgayBatDau, NgayKetThuc, TrangThai. Bảng LichSuSuDungVoucher lưu lịch sử sử dụng: MaLichSu (primary key), VoucherID (foreign key), TaiKhoanID (foreign key), HoaDonID (foreign key), NgaySuDung.

**Nhóm quản lý địa chỉ và vận chuyển**

Bảng DiaChiGiaoHangUser lưu địa chỉ đã lưu của người dùng: MaDiaChi (primary key), TaiKhoanID (foreign key), TenNguoiNhan, SoDienThoai, DiaChiChiTiet, PhuongXa, QuanHuyen, TinhThanhPho, LaMacDinh. Bảng DiaChiGiaoHang lưu địa chỉ cho từng đơn hàng: MaDCGH (primary key), HoaDonID (foreign key), TenNguoiNhan, SoDienThoai, DiaChiChiTiet, PhuongXa, QuanHuyen, TinhThanhPho. Bảng ThongTinVanChuyen lưu thông tin vận chuyển: MaTTVC (primary key), HoaDonID (foreign key), DonViVanChuyen, MaVanDon, TrangThaiVanChuyen, NgayGuiHang, NgayGiaoHangDuKien, NgayGiaoThucTe.

**Nhóm khác**

Bảng DanhGiaSanPham lưu đánh giá: MaDanhGia (primary key), SanPhamID (foreign key), TaiKhoanID (foreign key), DiemDanhGia, NoiDung, NgayDanhGia. Bảng Banner lưu banner quảng cáo: MaBanner (primary key), TieuDe, HinhAnh, Link, ThuTu, TrangThai, NgayBatDau, NgayKetThuc.

### 5.1.2. Danh sách các bảng và quan hệ chi tiết

**Quan hệ một-một (1:1)**

TaiKhoan và KhachHang: Mỗi tài khoản tương ứng với một khách hàng duy nhất. Foreign key TaiKhoanID trong bảng KhachHang tham chiếu đến MaTK trong TaiKhoan. HoaDon và DiaChiGiaoHang: Mỗi đơn hàng có một địa chỉ giao hàng cụ thể. Foreign key HoaDonID trong DiaChiGiaoHang tham chiếu đến MaHD trong HoaDon. HoaDon và ThongTinVanChuyen: Mỗi đơn hàng có thông tin vận chuyển riêng (nếu đã được gửi đi). Foreign key HoaDonID trong ThongTinVanChuyen tham chiếu đến MaHD.

**Quan hệ một-nhiều (1:N)**

TaiKhoan và GioHang: Một tài khoản có một giỏ hàng, giỏ hàng có nhiều sản phẩm thông qua GioHangChiTiet. KhachHang và HoaDon: Một khách hàng có thể có nhiều đơn hàng. Foreign key KhachHangID trong HoaDon tham chiếu đến MaKH. HoaDon và ChiTietHoaDon: Một đơn hàng chứa nhiều sản phẩm. Foreign key HoaDonID trong ChiTietHoaDon tham chiếu đến MaHD. SanPham và ChiTietHoaDon: Một sản phẩm có thể xuất hiện trong nhiều đơn hàng. Foreign key SanPhamID trong ChiTietHoaDon tham chiếu đến MaSP. LoaiSP và SanPham: Một danh mục chứa nhiều sản phẩm. Foreign key LoaiID trong SanPham tham chiếu đến MaLoai. ThuongHieu và SanPham: Một thương hiệu có nhiều sản phẩm. Foreign key ThuongHieuID trong SanPham tham chiếu đến MaThuongHieu. SanPham và SanPhamHinhAnh: Một sản phẩm có nhiều hình ảnh. Foreign key SanPhamID trong SanPhamHinhAnh tham chiếu đến MaSP. Voucher và LichSuSuDungVoucher: Một voucher có thể được sử dụng nhiều lần bởi nhiều người. Foreign key VoucherID trong LichSuSuDungVoucher tham chiếu đến MaVoucher. TaiKhoan và DiaChiGiaoHangUser: Một tài khoản có thể lưu nhiều địa chỉ. Foreign key TaiKhoanID trong DiaChiGiaoHangUser tham chiếu đến MaTK. SanPham và DanhGiaSanPham: Một sản phẩm có nhiều đánh giá. Foreign key SanPhamID trong DanhGiaSanPham tham chiếu đến MaSP. TaiKhoan và DanhGiaSanPham: Một người dùng có thể đánh giá nhiều sản phẩm. Foreign key TaiKhoanID trong DanhGiaSanPham tham chiếu đến MaTK.

### 5.1.3. Chuẩn hóa dữ liệu

Database của ToyStore được thiết kế tuân thủ các dạng chuẩn hóa để đảm bảo tính toàn vẹn dữ liệu và giảm thiểu dư thừa.

**Dạng chuẩn 1 (1NF - First Normal Form)**

Tất cả các bảng đều đạt dạng chuẩn 1NF với các đặc điểm: mỗi bảng có primary key duy nhất, mỗi cột chứa giá trị nguyên tử (atomic), không có nhóm lặp lại, mỗi cột có kiểu dữ liệu nhất quán. Ví dụ, trong bảng SanPham, thay vì lưu nhiều hình ảnh trong một cột (vi phạm 1NF), hệ thống tạo bảng riêng SanPhamHinhAnh để lưu từng hình ảnh.

**Dạng chuẩn 2 (2NF - Second Normal Form)**

Các bảng đạt 2NF khi đã đạt 1NF và không có phụ thuộc hàm một phần (partial dependency). Tất cả các thuộc tính không khóa phụ thuộc hoàn toàn vào khóa chính. Ví dụ, trong bảng ChiTietHoaDon, các thuộc tính SoLuong, DonGia, ThanhTien đều phụ thuộc hoàn toàn vào khóa chính (MaCTHD), không phụ thuộc vào một phần của khóa.

**Dạng chuẩn 3 (3NF - Third Normal Form)**

Các bảng đạt 3NF khi đã đạt 2NF và không có phụ thuộc bắc cầu (transitive dependency). Mọi thuộc tính không khóa phụ thuộc trực tiếp vào khóa chính, không thông qua thuộc tính khác. Ví dụ minh họa chuẩn hóa: thay vì lưu TenLoai và TenThuongHieu trực tiếp trong bảng SanPham (gây dư thừa khi nhiều sản phẩm cùng loại), hệ thống tách thành các bảng LoaiSP và ThuongHieu riêng biệt. SanPham chỉ lưu LoaiID và ThuongHieuID (foreign keys). Trong bảng ChiTietHoaDon, DonGia được lưu tại thời điểm mua hàng thay vì tham chiếu đến SanPham.Gia hiện tại. Điều này đảm bảo giá trong đơn hàng không thay đổi khi giá sản phẩm thay đổi.

**Lợi ích của chuẩn hóa**

Giảm dư thừa dữ liệu: thông tin chỉ được lưu một lần, tiết kiệm không gian lưu trữ. Đảm bảo tính toàn vẹn: cập nhật dữ liệu ở một nơi tự động phản ánh ở mọi nơi sử dụng. Dễ bảo trì: thêm, sửa, xóa dữ liệu đơn giản hơn và ít rủi ro hơn. Tránh anomalies: ngăn chặn các vấn đề khi insert, update, delete dữ liệu.

### 5.1.4. Indexing và tối ưu hóa

Để đảm bảo hiệu suất truy vấn tốt, các index được tạo một cách có chọn lọc.

**Primary key indexes**

Tất cả primary keys tự động có clustered index, đảm bảo truy vấn theo ID nhanh chóng.

**Foreign key indexes**

Các foreign keys được tạo non-clustered index để tối ưu JOIN operations: TaiKhoanID trong KhachHang, KhachHangID trong HoaDon, SanPhamID trong ChiTietHoaDon, LoaiID và ThuongHieuID trong SanPham.

**Search indexes**

Các cột thường được sử dụng trong tìm kiếm được index: Email trong TaiKhoan (unique index), TenSP trong SanPham (full-text index hoặc regular index), Code trong Voucher (unique index).

**Composite indexes**

Một số trường hợp sử dụng composite index cho các truy vấn phức tạp: (GioHangID, SanPhamID) trong GioHangChiTiet, (HoaDonID, SanPhamID) trong ChiTietHoaDon.

## 5.2. Thiết kế giao diện người dùng (UI/UX)

Giao diện người dùng đóng vai trò quan trọng trong trải nghiệm mua sắm trực tuyến. ToyStore được thiết kế với nguyên tắc user-centered design, tập trung vào sự đơn giản, trực quan và hiệu quả.

### 5.2.1. Nguyên tắc thiết kế

**Consistency (Tính nhất quán)**

Giao diện duy trì tính nhất quán về màu sắc, typography, spacing, và layout xuyên suốt toàn bộ ứng dụng. Các thành phần tương tự có cách hiển thị và tương tác giống nhau. Ví dụ, tất cả các nút chính đều có màu xanh, nút phụ có màu xám, nút nguy hiểm có màu đỏ. Các form input đều có cùng style, validation messages hiển thị ở vị trí nhất quán.

**Simplicity (Tính đơn giản)**

Giao diện tránh sự phức tạp không cần thiết, tập trung vào các tính năng cốt lõi. Mỗi trang có một mục đích rõ ràng và hướng dẫn người dùng đến hành động tiếp theo. Quy trình mua hàng được thiết kế với số bước tối thiểu: duyệt sản phẩm, thêm vào giỏ, checkout, thanh toán. Navigation menu được tổ chức theo cấu trúc phân cấp rõ ràng, dễ tìm kiếm.

**Responsive Design (Thiết kế đáp ứng)**

Giao diện tự động điều chỉnh layout dựa trên kích thước màn hình. Desktop (≥1024px): hiển thị nhiều cột, sidebar navigation, nhiều sản phẩm trên một hàng. Tablet (768px-1023px): giảm số cột, điều chỉnh spacing, ẩn một số thông tin phụ. Mobile (<768px): hiển thị một cột, hamburger menu, tối ưu cho thao tác chạm. Hình ảnh sử dụng responsive images với srcset để load kích thước phù hợp.

**Accessibility (Khả năng tiếp cận)**

Giao diện tuân thủ các nguyên tắc accessibility cơ bản: sử dụng semantic HTML (header, nav, main, footer, article), cung cấp alt text cho tất cả hình ảnh, đảm bảo contrast ratio tối thiểu 4.5:1 cho text, hỗ trợ keyboard navigation, sử dụng ARIA labels khi cần thiết.

**Feedback (Phản hồi)**

Hệ thống cung cấp feedback tức thì cho mọi thao tác của người dùng: loading indicators khi đang xử lý request, success messages khi thao tác thành công (màu xanh), error messages khi có lỗi (màu đỏ), confirmation dialogs cho các thao tác quan trọng (xóa, hủy đơn hàng).

### 5.2.2. Các màn hình chính

**Trang chủ (Homepage)**

Trang chủ là điểm tiếp xúc đầu tiên với người dùng, được thiết kế để tạo ấn tượng tốt và hướng dẫn người dùng khám phá sản phẩm. Header chứa logo, search bar, navigation menu, giỏ hàng icon, user menu. Banner carousel hiển thị các chương trình khuyến mãi, sản phẩm nổi bật. Danh mục sản phẩm với icons và tên rõ ràng. Sản phẩm mới nhất hiển thị dưới dạng grid. Sản phẩm bán chạy với badge "Best Seller". Footer chứa thông tin liên hệ, chính sách, social media links.

**Trang danh sách sản phẩm (Product List)**

Trang này cho phép người dùng duyệt và lọc sản phẩm. Sidebar (desktop) hoặc filter drawer (mobile) chứa các bộ lọc: danh mục, thương hiệu, khoảng giá (slider), độ tuổi phù hợp. Toolbar chứa: số lượng sản phẩm tìm thấy, dropdown sắp xếp (mới nhất, giá tăng/giảm, bán chạy), view mode (grid/list). Product grid hiển thị: hình ảnh sản phẩm, tên, giá, rating, nút "Thêm vào giỏ". Pagination ở cuối trang với số trang và nút previous/next.

**Trang chi tiết sản phẩm (Product Detail)**

Trang này cung cấp thông tin đầy đủ về sản phẩm. Image gallery với ảnh chính lớn và thumbnails, hỗ trợ zoom và lightbox. Thông tin sản phẩm: tên, giá, rating với số lượt đánh giá, mô tả ngắn, danh mục và thương hiệu, độ tuổi phù hợp. Quantity selector và nút "Thêm vào giỏ hàng" lớn, nổi bật. Tabs chứa: mô tả chi tiết, thông số kỹ thuật, đánh giá khách hàng. Section sản phẩm liên quan ở cuối trang.

**Trang giỏ hàng (Shopping Cart)**

Trang giỏ hàng hiển thị các sản phẩm đã chọn và cho phép điều chỉnh. Bảng hoặc danh sách sản phẩm với: hình ảnh nhỏ, tên sản phẩm (link đến chi tiết), giá đơn vị, quantity selector (có validation tồn kho), thành tiền, nút xóa. Summary box hiển thị: tạm tính, số lượng sản phẩm, nút "Tiếp tục mua sắm" và "Thanh toán". Empty cart state với icon và message khuyến khích mua sắm.

**Trang thanh toán (Checkout)**

Trang checkout được thiết kế theo multi-step form hoặc single page với sections rõ ràng. Section địa chỉ giao hàng: chọn từ địa chỉ đã lưu hoặc nhập mới, form validation real-time. Section voucher: input để nhập mã, nút "Áp dụng", hiển thị voucher đã áp dụng. Section tóm tắt đơn hàng: danh sách sản phẩm (compact), breakdown giá (tạm tính, VAT, giảm giá, phí ship, tổng cộng). Section phương thức thanh toán: radio buttons cho các phương thức, hiện tại chỉ VNPay. Nút "Đặt hàng" lớn, nổi bật với loading state khi processing.

**Trang lịch sử đơn hàng (Order History)**

Trang này cho phép người dùng xem và quản lý đơn hàng. Tabs hoặc filter theo trạng thái: tất cả, chờ xử lý, đang giao, đã giao, đã hủy. Danh sách đơn hàng với: mã đơn hàng, ngày đặt, tổng tiền, trạng thái (với màu sắc khác nhau), nút "Xem chi tiết". Trang chi tiết đơn hàng hiển thị: thông tin đầy đủ, timeline trạng thái, danh sách sản phẩm, địa chỉ giao hàng, thông tin thanh toán, breakdown giá, nút "Hủy đơn" (nếu cho phép).

**Admin Dashboard**

Dashboard cung cấp tổng quan về hoạt động kinh doanh. Cards hiển thị metrics chính: doanh thu hôm nay/tháng này, số đơn hàng, số khách hàng mới, sản phẩm bán chạy. Biểu đồ doanh thu theo thời gian (line chart hoặc bar chart). Bảng đơn hàng mới nhất cần xử lý. Bảng sản phẩm sắp hết hàng. Quick actions: thêm sản phẩm, xem đơn hàng, tạo voucher.

**Admin quản lý sản phẩm**

Trang này cho phép admin quản lý toàn bộ sản phẩm. Toolbar với: nút "Thêm sản phẩm mới", search box, filter theo danh mục/thương hiệu/trạng thái. Bảng sản phẩm với columns: hình ảnh, tên, giá, tồn kho, danh mục, trạng thái, actions (sửa, xóa). Pagination và số lượng hiển thị per page. Form thêm/sửa sản phẩm với: các input fields, upload nhiều hình ảnh với preview, rich text editor cho mô tả, validation đầy đủ.

## 5.3. Thiết kế API

API là cầu nối giữa frontend và backend, được thiết kế theo chuẩn RESTful để đảm bảo tính nhất quán và dễ sử dụng.

### 5.3.1. Nguyên tắc RESTful API Design

**Sử dụng HTTP methods đúng ngữ nghĩa**

GET: lấy dữ liệu, không thay đổi state của server, có thể cache. POST: tạo resource mới, thay đổi state, không idempotent. PUT: cập nhật toàn bộ resource, idempotent. PATCH: cập nhật một phần resource, idempotent. DELETE: xóa resource, idempotent.

**URL rõ ràng và có cấu trúc**

Sử dụng danh từ số nhiều cho resources: /api/products, /api/orders, /api/users. Sử dụng ID để truy cập resource cụ thể: /api/products/123. Sử dụng nested resources khi có quan hệ rõ ràng: /api/orders/456/items. Tránh động từ trong URL, sử dụng HTTP methods thay thế: GET /api/products thay vì /api/getProducts.

**Response format nhất quán**

Tất cả responses đều là JSON với cấu trúc nhất quán. Success response bao gồm: success (boolean), data (object hoặc array), message (optional). Error response bao gồm: success (false), error (object với code và message), details (optional, cho validation errors). Pagination response bao gồm: data (array), pagination (object với page, limit, total, totalPages).

**Status codes phù hợp**

200 OK: request thành công, có data trả về. 201 Created: resource mới được tạo thành công. 204 No Content: request thành công, không có data trả về (ví dụ DELETE). 400 Bad Request: request không hợp lệ (validation error). 401 Unauthorized: chưa authenticate hoặc token không hợp lệ. 403 Forbidden: đã authenticate nhưng không có quyền. 404 Not Found: resource không tồn tại. 500 Internal Server Error: lỗi server.

### 5.3.2. Authentication và Authorization

**JWT (JSON Web Token) Authentication**

Hệ thống sử dụng JWT cho stateless authentication. Quy trình đăng nhập: người dùng gửi email và password đến /api/auth/login. Server xác thực thông tin, nếu đúng tạo JWT token chứa payload (userId, email, role, exp). Token được ký bằng secret key và trả về cho client. Client lưu token trong localStorage và gửi kèm trong header Authorization: Bearer <token> cho các request sau.

**Middleware xác thực**

Mọi API endpoint cần authentication đều đi qua auth middleware. Middleware lấy token từ header Authorization. Verify token sử dụng secret key, kiểm tra expiration. Nếu hợp lệ, decode token để lấy thông tin user và gắn vào req.user. Nếu không hợp lệ, trả về 401 Unauthorized.

**Role-Based Access Control (RBAC)**

Hệ thống có ba vai trò: user (khách hàng), staff (nhân viên), admin (quản trị viên). Authorization middleware kiểm tra req.user.role. Các endpoint admin chỉ cho phép role admin. Các endpoint staff cho phép role staff và admin. Các endpoint user cho phép tất cả authenticated users.

### 5.3.3. Ví dụ API endpoints

**Authentication endpoints**

POST /api/auth/register: đăng ký tài khoản mới. Request body: email, password, hoTen, soDienThoai. Response: token, user info. POST /api/auth/login: đăng nhập. Request body: email, password. Response: token, user info. GET /api/auth/me: lấy thông tin user hiện tại. Headers: Authorization. Response: user info. POST /api/auth/logout: đăng xuất (optional, chủ yếu xóa token ở client).

**Product endpoints**

GET /api/products: lấy danh sách sản phẩm. Query params: page, limit, search, filter, minPrice, maxPrice, categoryId, brandId. Response: products array, pagination info. GET /api/products/:id: lấy chi tiết sản phẩm. Response: product object với includes (loaiSP, thuongHieu, hinhAnhs, danhGias). POST /api/admin/products: tạo sản phẩm mới (admin only). Request body: tenSP, moTa, gia, soLuongTonKho, loaiID, thuongHieuID. Response: created product. PUT /api/admin/products/:id: cập nhật sản phẩm (admin only). Request body: các trường cần update. Response: updated product. DELETE /api/admin/products/:id: xóa sản phẩm (admin only, soft delete). Response: success message.

**Cart endpoints**

GET /api/cart: lấy giỏ hàng của user hiện tại. Response: cart với chiTiet (products). POST /api/cart/add: thêm sản phẩm vào giỏ. Request body: sanPhamID, soLuong. Response: updated cart. PUT /api/cart/update/:id: cập nhật số lượng sản phẩm trong giỏ. Request body: soLuong. Response: updated cart. DELETE /api/cart/remove/:id: xóa sản phẩm khỏi giỏ. Response: updated cart. DELETE /api/cart/clear: xóa toàn bộ giỏ hàng. Response: success message.

**Order endpoints**

POST /api/orders/create: tạo đơn hàng từ giỏ hàng. Request body: diaChiGiaoHang, maVoucher (optional). Response: created order với paymentUrl (VNPay). GET /api/orders/my-orders: lấy lịch sử đơn hàng của user. Query params: page, limit, status. Response: orders array, pagination. GET /api/orders/:id: lấy chi tiết đơn hàng. Response: order với chiTiet, diaChiGiaoHang, thongTinVanChuyen. PUT /api/orders/:id/cancel: hủy đơn hàng (chỉ khi status = "Chờ xử lý"). Response: updated order. GET /api/admin/orders: lấy tất cả đơn hàng (admin/staff). Query params: page, limit, status, customerId. Response: orders array, pagination. PUT /api/admin/orders/:id/status: cập nhật trạng thái đơn hàng (admin/staff). Request body: trangThai. Response: updated order.

**Payment endpoints**

GET /api/payment/vnpay/create-payment-url: tạo URL thanh toán VNPay. Query params: orderId, amount, bankCode (optional). Response: paymentUrl. GET /api/payment/vnpay/return: xử lý callback từ VNPay. Query params: các params từ VNPay. Response: redirect đến success/error page. POST /api/payment/vnpay/ipn: nhận IPN từ VNPay. Request body: các params từ VNPay. Response: confirmation cho VNPay.

## 5.4. Áp dụng Design Patterns

Design Patterns giúp giải quyết các vấn đề thiết kế phổ biến một cách hiệu quả và có cấu trúc. ToyStore áp dụng ba patterns chính: Decorator, Strategy và Singleton.

### 5.4.1. Decorator Pattern - Tính giá đơn hàng

**Vấn đề cần giải quyết**

Tính giá đơn hàng trong thương mại điện tử là một bài toán phức tạp với nhiều thành phần: giá gốc của sản phẩm, thuế VAT, giảm giá từ voucher, phí vận chuyển (có thể miễn phí), các chương trình khuyến mãi khác. Nếu sử dụng một hàm tính toán duy nhất với nhiều if-else, code sẽ trở nên phức tạp, khó đọc và khó mở rộng khi cần thêm thành phần giá mới.

**Giải pháp với Decorator Pattern**

Decorator Pattern cho phép thêm các tính năng mới vào object một cách động mà không cần thay đổi cấu trúc của object gốc. Trong ToyStore, mỗi thành phần giá được triển khai như một decorator riêng biệt, có thể kết hợp linh hoạt.

**Cấu trúc implementation**

Base Component là OrderPriceCalculator, nhận danh sách sản phẩm và tính tổng tiền gốc. Base Decorator là OrderPriceDecorator, là abstract class định nghĩa interface chung cho các decorators. Concrete Decorators bao gồm: VATDecorator thêm thuế VAT, VoucherDecorator trừ giảm giá từ voucher, ShippingDecorator thêm phí vận chuyển hoặc miễn phí.

**Code implementation chi tiết**

OrderPriceCalculator (Base Component) có constructor nhận items (danh sách sản phẩm), method calculate() tính tổng tiền gốc bằng cách sum(item.donGia * item.soLuong), method getDetails() trả về object chứa tongTienSanPham và items.

OrderPriceDecorator (Base Decorator) có constructor nhận calculator (component hoặc decorator khác), abstract method calculate() bắt buộc override, abstract method getDetails() bắt buộc override.

VATDecorator extends OrderPriceDecorator với constructor nhận calculator và vatRate (mặc định 0.1), calculate() gọi calculator.calculate() để lấy subtotal, tính VAT = subtotal * vatRate, trả về subtotal + VAT. getDetails() gọi calculator.getDetails(), thêm thông tin VAT vào result, trả về object đầy đủ.

VoucherDecorator extends OrderPriceDecorator với constructor nhận calculator và voucher object (code, type, value, maxDiscount), calculate() gọi calculator.calculate(), tính discount dựa trên voucher type (percent hoặc fixed), áp dụng maxDiscount nếu có, trả về subtotal - discount. getDetails() tương tự VATDecorator, thêm thông tin voucher.

ShippingDecorator extends OrderPriceDecorator với constructor nhận calculator, shippingFee, freeShippingThreshold (mặc định 500000), calculate() gọi calculator.calculate(), kiểm tra nếu subtotal >= freeShippingThreshold thì miễn phí, ngược lại thêm shippingFee, trả về total. getDetails() thêm thông tin shipping.

**Cách sử dụng trong OrderService**

Tạo base calculator với danh sách sản phẩm: let calculator = new OrderPriceCalculator(items). Wrap với VATDecorator: calculator = new VATDecorator(calculator, 0.1). Nếu có voucher, wrap với VoucherDecorator: calculator = new VoucherDecorator(calculator, voucher). Wrap với ShippingDecorator: calculator = new ShippingDecorator(calculator, shippingFee, 500000). Gọi calculate() để lấy tổng tiền cuối: const tongTien = calculator.calculate(). Gọi getDetails() để lấy breakdown chi tiết: const details = calculator.getDetails(). Lưu các giá trị vào database: TienGoc, TienVAT, TienGiamGia, PhiVanChuyen, TongTien.

**Lợi ích của Decorator Pattern**

Open/Closed Principle: mở cho mở rộng (thêm decorator mới), đóng cho sửa đổi (không cần sửa code cũ). Single Responsibility: mỗi decorator chỉ lo một việc (VAT, voucher, shipping). Flexibility: có thể bật/tắt từng decorator, thay đổi thứ tự dễ dàng. Testability: test từng decorator độc lập, dễ mock dependencies. Maintainability: code rõ ràng, dễ đọc, dễ debug.

### 5.4.2. Strategy Pattern - Lọc và sắp xếp sản phẩm

**Vấn đề cần giải quyết**

Người dùng cần nhiều cách sắp xếp sản phẩm khác nhau: mới nhất, giá tăng dần, giá giảm dần, bán chạy nhất, đánh giá cao nhất. Nếu sử dụng if-else hoặc switch-case trong controller, code sẽ dài dòng, khó bảo trì và vi phạm Open/Closed Principle khi cần thêm cách sắp xếp mới.

**Giải pháp với Strategy Pattern**

Strategy Pattern định nghĩa một họ các thuật toán, đóng gói từng thuật toán thành class riêng, và làm cho chúng có thể thay thế lẫn nhau. Client có thể chọn thuật toán phù hợp tại runtime mà không cần biết chi tiết implementation.

**Cấu trúc implementation**

Strategy Interface là ProductFilterStrategy, định nghĩa method filter(products, query). Concrete Strategies bao gồm: NewestStrategy sắp xếp theo ngày tạo giảm dần, PriceAscendingStrategy sắp xếp theo giá tăng dần, PriceDescendingStrategy sắp xếp theo giá giảm dần, BestSellerStrategy sắp xếp theo số lượng bán giảm dần. Context là FilterContext, quản lý strategies và chọn strategy phù hợp.

**Code implementation chi tiết**

ProductFilterStrategy (Base Class) có method filter(products, query) throw error bắt buộc override, helper method filterByPriceRange(products, minPrice, maxPrice) lọc sản phẩm theo khoảng giá, helper method filterByCategory(products, categoryId) lọc theo danh mục.

NewestStrategy extends ProductFilterStrategy với filter(products, query) clone array để tránh mutate, gọi filterByPriceRange và filterByCategory, sort theo createdAt giảm dần (mới nhất trước), trả về filtered array.

PriceAscendingStrategy extends ProductFilterStrategy với filter(products, query) tương tự NewestStrategy nhưng sort theo Gia tăng dần: (a, b) => parseFloat(a.Gia) - parseFloat(b.Gia).

PriceDescendingStrategy extends ProductFilterStrategy với filter(products, query) sort theo Gia giảm dần: (a, b) => parseFloat(b.Gia) - parseFloat(a.Gia).

BestSellerStrategy extends ProductFilterStrategy với filter(products, query) clone và lọc cơ bản, map products để thêm totalSold (tính từ ChiTietHoaDons), sort theo totalSold giảm dần, trả về products với totalSold.

FilterContext (Context Class) có constructor khởi tạo strategies registry: this.strategies = { newest: new NewestStrategy(), priceAsc: new PriceAscendingStrategy(), priceDesc: new PriceDescendingStrategy(), bestSeller: new BestSellerStrategy() }. Method applyFilter(products, filterType, queryParams) gọi getStrategy(filterType), gọi strategy.filter(products, queryParams), trả về kết quả. Method getStrategy(filterType) tra cứu trong strategies registry, trả về strategy hoặc default strategy. Method getAvailableFilters() trả về Object.keys(this.strategies).

**Cách sử dụng trong ProductController**

Lấy filterType từ query params: const filterType = req.query.filter || 'newest'. Lấy các query params khác: minPrice, maxPrice, categoryId. Query database lấy products với includes cần thiết. Convert Sequelize models sang plain objects: const plainProducts = products.map(p => p.toJSON()). Gọi FilterContext: const filtered = FilterContext.applyFilter(plainProducts, filterType, { minPrice, maxPrice, categoryId }). Áp dụng pagination trên filtered results. Trả về response với products và filter info.

**Lợi ích của Strategy Pattern**

Loại bỏ if-else hell: không cần if-else dài để chọn thuật toán. Open/Closed Principle: thêm strategy mới không cần sửa code cũ. Single Responsibility: mỗi strategy chỉ lo một cách sắp xếp. Testability: test từng strategy độc lập. Reusability: strategies có thể dùng ở nhiều nơi khác nhau.

### 5.4.3. Singleton Pattern - Quản lý tài nguyên

**Vấn đề cần giải quyết**

Một số đối tượng trong hệ thống chỉ nên có một instance duy nhất: database connection pool (tránh tạo nhiều connection không cần thiết), logger (đảm bảo log nhất quán), config service (đọc config một lần duy nhất). Nếu tạo nhiều instances, sẽ lãng phí tài nguyên và có thể gây inconsistency.

**Giải pháp với Singleton Pattern**

Singleton Pattern đảm bảo một class chỉ có một instance duy nhất và cung cấp một điểm truy cập global đến instance đó.

**Implementation DBConnection Singleton**

Class DBConnection có static property instance = null lưu instance duy nhất, private constructor để ngăn tạo instance từ bên ngoài, property sequelize lưu Sequelize instance. Static method getInstance() kiểm tra nếu instance === null thì tạo mới, ngược lại trả về instance hiện có. Method getSequelize() trả về sequelize instance. Method connect() thiết lập kết nối database. Method close() đóng kết nối.

Cách sử dụng: const dbConnection = DBConnection.getInstance(), const sequelize = dbConnection.getSequelize(). Mọi nơi trong ứng dụng gọi getInstance() đều nhận được cùng một instance.

**Implementation Logger Singleton**

Class Logger có static instance, private constructor, method log(level, message) ghi log với format nhất quán, method info(message), error(message), warn(message), debug(message). Static getInstance() trả về instance duy nhất.

Cách sử dụng: const logger = Logger.getInstance(), logger.info('Server started'), logger.error('Database connection failed').

**Implementation ConfigService Singleton**

Class ConfigService có static instance, private constructor, property config lưu configuration object, method loadConfig() đọc từ .env hoặc config files, method getValue(section, key) lấy giá trị config. Static getInstance() trả về instance duy nhất.

Cách sử dụng: const config = ConfigService.getInstance(), const dbHost = config.getValue('database', 'host'), const port = config.getValue('server', 'port').

**Lợi ích của Singleton Pattern**

Tiết kiệm tài nguyên: chỉ tạo một instance, tránh lãng phí memory. Đảm bảo tính nhất quán: mọi nơi sử dụng cùng một instance, cùng một state. Global access: dễ dàng truy cập từ mọi nơi trong ứng dụng. Thread-safe: trong Node.js single-threaded, không cần lo lắng về concurrency issues. Lazy initialization: instance chỉ được tạo khi cần (lần đầu gọi getInstance()).

**Lưu ý khi sử dụng Singleton**

Tránh lạm dụng: không phải mọi class đều nên là Singleton. Chỉ dùng cho các đối tượng thực sự cần duy nhất: database connection, logger, config. Testing: Singleton có thể gây khó khăn cho unit testing do global state, cần cẩn thận khi test. Dependency injection: trong một số trường hợp, dependency injection có thể là lựa chọn tốt hơn Singleton.
