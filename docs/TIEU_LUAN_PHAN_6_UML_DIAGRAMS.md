# PHẦN 6: UML DIAGRAMS

UML (Unified Modeling Language) là ngôn ngữ mô hình hóa chuẩn được sử dụng rộng rãi trong phát triển phần mềm để trực quan hóa, đặc tả, xây dựng và tài liệu hóa các thành phần của hệ thống phần mềm. Phần này trình bày các biểu đồ UML chính của hệ thống ToyStore, giúp hiểu rõ hơn về cấu trúc, hành vi và tương tác giữa các thành phần.

## 6.1. Use Case Diagram

Use Case Diagram mô tả các chức năng của hệ thống từ góc nhìn người dùng, cho thấy các actors (người dùng hoặc hệ thống bên ngoài) và các use cases (chức năng) mà họ có thể thực hiện.

### 6.1.1. Actors trong hệ thống

**Customer (Khách hàng)**: Người dùng cuối sử dụng hệ thống để mua sắm đồ chơi. Bao gồm cả khách đã đăng ký và khách vãng lai.

**Admin (Quản trị viên)**: Người quản lý toàn bộ hệ thống, có quyền cao nhất để quản lý sản phẩm, đơn hàng, người dùng và xem báo cáo.

**Staff (Nhân viên)**: Người hỗ trợ xử lý đơn hàng và chăm sóc khách hàng, có quyền hạn trung gian.

**VNPay System**: Hệ thống thanh toán bên ngoài, xử lý các giao dịch thanh toán trực tuyến.

**GHN System**: Hệ thống vận chuyển bên ngoài, quản lý việc giao hàng.

### 6.1.2. Use Cases chính

**Nhóm Authentication và User Management**

Đăng ký tài khoản: Customer tạo tài khoản mới trong hệ thống. Đăng nhập: Customer, Admin, Staff đăng nhập vào hệ thống. Quản lý thông tin cá nhân: Customer cập nhật thông tin profile. Quản lý địa chỉ giao hàng: Customer thêm, sửa, xóa địa chỉ.

**Nhóm Product Management**

Xem danh sách sản phẩm: Customer duyệt các sản phẩm có sẵn. Tìm kiếm sản phẩm: Customer tìm kiếm sản phẩm theo từ khóa. Lọc và sắp xếp sản phẩm: Customer áp dụng bộ lọc và sắp xếp. Xem chi tiết sản phẩm: Customer xem thông tin đầy đủ về sản phẩm. Đánh giá sản phẩm: Customer viết đánh giá cho sản phẩm đã mua. Quản lý sản phẩm (CRUD): Admin thêm, sửa, xóa sản phẩm.

**Nhóm Shopping Cart**

Thêm vào giỏ hàng: Customer thêm sản phẩm vào giỏ. Xem giỏ hàng: Customer xem các sản phẩm trong giỏ. Cập nhật giỏ hàng: Customer thay đổi số lượng hoặc xóa sản phẩm.

**Nhóm Order Management**

Đặt hàng: Customer tạo đơn hàng từ giỏ hàng. Áp dụng voucher: Customer sử dụng mã giảm giá. Thanh toán: Customer thanh toán qua VNPay (include VNPay System). Xem lịch sử đơn hàng: Customer xem các đơn hàng đã đặt. Xem chi tiết đơn hàng: Customer xem thông tin chi tiết đơn hàng. Hủy đơn hàng: Customer hủy đơn hàng đang chờ xử lý. Quản lý đơn hàng: Admin/Staff xem và cập nhật trạng thái đơn hàng. Tạo đơn vận chuyển: Admin/Staff tạo đơn vận chuyển trên GHN (include GHN System).

**Nhóm Admin Functions**

Quản lý người dùng: Admin xem, vô hiệu hóa, thay đổi vai trò người dùng. Quản lý voucher: Admin tạo và quản lý các voucher. Xem thống kê: Admin xem báo cáo doanh thu và các chỉ số. Quản lý danh mục và thương hiệu: Admin quản lý categories và brands.

### 6.1.3. Relationships trong Use Case Diagram

**Include relationships**: Đặt hàng include Thanh toán (không thể đặt hàng mà không thanh toán). Thanh toán include Xử lý thanh toán VNPay. Tạo đơn vận chuyển include Tích hợp GHN API.

**Extend relationships**: Đặt hàng extend Áp dụng voucher (có thể đặt hàng mà không dùng voucher). Xem danh sách sản phẩm extend Lọc và sắp xếp sản phẩm.

**Generalization**: Admin và Staff là specialization của User (kế thừa các use cases cơ bản).

## 6.2. Class Diagram

Class Diagram mô tả cấu trúc tĩnh của hệ thống, bao gồm các classes, attributes, methods và relationships giữa chúng.

### 6.2.1. Model Classes (Database Entities)

**TaiKhoan**: Attributes: MaTK, TenDangNhap, Email, MatKhau, VaiTro, TrangThai, NgayTao. Methods: hashPassword(), verifyPassword(), generateToken(). Relationships: hasOne KhachHang, hasMany DiaChiGiaoHangUser, hasMany DanhGiaSanPham.

**KhachHang**: Attributes: MaKH, TaiKhoanID, HoTen, SoDienThoai, NgaySinh, GioiTinh. Relationships: belongsTo TaiKhoan, hasMany HoaDon.

**SanPham**: Attributes: MaSP, TenSP, MoTa, Gia, SoLuongTonKho, LoaiID, ThuongHieuID. Relationships: belongsTo LoaiSP, belongsTo ThuongHieu, hasMany SanPhamHinhAnh, hasMany ChiTietHoaDon, hasMany DanhGiaSanPham.

**LoaiSP**: Attributes: MaLoai, TenLoai, MoTa. Relationships: hasMany SanPham.

**ThuongHieu**: Attributes: MaThuongHieu, TenThuongHieu, MoTa. Relationships: hasMany SanPham.

**GioHang**: Attributes: MaGioHang, TaiKhoanID, NgayTao. Relationships: belongsTo TaiKhoan, hasMany GioHangChiTiet.

**GioHangChiTiet**: Attributes: MaGioHangChiTiet, GioHangID, SanPhamID, SoLuong. Relationships: belongsTo GioHang, belongsTo SanPham.

**HoaDon**: Attributes: MaHD, KhachHangID, TongTien, TienGoc, TienVAT, TienGiamGia, PhiVanChuyen, TrangThai. Relationships: belongsTo KhachHang, hasMany ChiTietHoaDon, hasOne DiaChiGiaoHang, hasOne ThongTinVanChuyen, belongsTo Voucher.

**ChiTietHoaDon**: Attributes: MaCTHD, HoaDonID, SanPhamID, SoLuong, DonGia, ThanhTien. Relationships: belongsTo HoaDon, belongsTo SanPham.

**Voucher**: Attributes: MaVoucher, Code, LoaiGiamGia, GiaTriGiam, NgayBatDau, NgayKetThuc. Relationships: hasMany HoaDon, hasMany LichSuSuDungVoucher.

### 6.2.2. Controller Classes

**AuthController**: Methods: register(), login(), logout(), getMe(), updateProfile().

**ProductController**: Methods: getAllProducts(), getProductById(), searchProducts(), getProductsByCategory().

**CartController**: Methods: getCart(), addToCart(), updateCartItem(), removeFromCart(), clearCart().

**OrderController**: Methods: createOrder(), getMyOrders(), getOrderById(), cancelOrder().

**AdminProductController**: Methods: createProduct(), updateProduct(), deleteProduct(), getAllProducts().

**AdminOrderController**: Methods: getAllOrders(), updateOrderStatus(), createShippingOrder().

### 6.2.3. Service Classes

**OrderService**: Methods: createOrder(), calculatePrice(), updateStock(), sendConfirmationEmail(). Dependencies: uses OrderPriceCalculator, PaymentService, EmailService.

**PaymentService**: Methods: createVNPayUrl(), handleVNPayReturn(), handleVNPayIPN(). Dependencies: uses VNPay API.

**GHNService**: Methods: createShippingOrder(), getOrderStatus(), calculateShippingFee(). Dependencies: uses GHN API.

**AddressService**: Methods: getUserAddresses(), createAddress(), updateAddress(), deleteAddress().

### 6.2.4. Design Pattern Classes

**OrderPriceCalculator (Component)**: Attributes: items. Methods: calculate(), getDetails().

**OrderPriceDecorator (Decorator)**: Attributes: calculator. Methods: calculate(), getDetails() (abstract).

**VATDecorator extends OrderPriceDecorator**: Attributes: vatRate. Methods: calculate(), getDetails().

**VoucherDecorator extends OrderPriceDecorator**: Attributes: voucher. Methods: calculate(), getDetails().

**ShippingDecorator extends OrderPriceDecorator**: Attributes: shippingFee, freeShippingThreshold. Methods: calculate(), getDetails().

**ProductFilterStrategy (Strategy Interface)**: Methods: filter(products, query) (abstract), filterByPriceRange(), filterByCategory().

**NewestStrategy extends ProductFilterStrategy**: Methods: filter(products, query).

**PriceAscendingStrategy extends ProductFilterStrategy**: Methods: filter(products, query).

**BestSellerStrategy extends ProductFilterStrategy**: Methods: filter(products, query).

**FilterContext (Context)**: Attributes: strategies. Methods: applyFilter(), getStrategy(), getAvailableFilters().

**DBConnection (Singleton)**: Attributes: instance (static), sequelize. Methods: getInstance() (static), getSequelize(), connect(), close().

**Logger (Singleton)**: Attributes: instance (static). Methods: getInstance() (static), log(), info(), error(), warn().

### 6.2.5. Relationships giữa các classes

**Inheritance**: VATDecorator, VoucherDecorator, ShippingDecorator kế thừa OrderPriceDecorator. NewestStrategy, PriceAscendingStrategy, BestSellerStrategy kế thừa ProductFilterStrategy.

**Composition**: FilterContext chứa strategies (composition relationship). OrderPriceDecorator chứa calculator (composition relationship).

**Association**: OrderController sử dụng OrderService. OrderService sử dụng PaymentService, GHNService. ProductController sử dụng FilterContext.

**Dependency**: Controllers phụ thuộc vào Services. Services phụ thuộc vào Models.

## 6.3. Sequence Diagram

Sequence Diagram mô tả tương tác giữa các objects theo thứ tự thời gian, cho thấy luồng xử lý của một use case cụ thể.

### 6.3.1. Sequence Diagram - Luồng đặt hàng

**Participants**: User, Frontend, OrderController, OrderService, CartService, OrderPriceCalculator, VATDecorator, VoucherDecorator, ShippingDecorator, PaymentService, VNPay, Database.

**Luồng xử lý**:

Bước 1: User nhấn nút "Đặt hàng" trên Frontend. Frontend gửi POST request đến OrderController.createOrder() với dữ liệu: diaChiGiaoHang, maVoucher.

Bước 2: OrderController gọi OrderService.createOrder(userId, diaChiGiaoHang, maVoucher). OrderService gọi CartService.getCart(userId) để lấy giỏ hàng. Database trả về cart với chiTiet (sản phẩm).

Bước 3: OrderService kiểm tra tồn kho cho từng sản phẩm. Nếu không đủ hàng, throw error và return. OrderService tạo OrderPriceCalculator với items từ cart.

Bước 4: OrderService wrap calculator với VATDecorator(calculator, 0.1). Nếu có maVoucher, OrderService lấy thông tin voucher từ Database. OrderService wrap với VoucherDecorator(calculator, voucher).

Bước 5: OrderService wrap với ShippingDecorator(calculator, shippingFee, 500000). OrderService gọi calculator.calculate() để lấy tongTien. OrderService gọi calculator.getDetails() để lấy breakdown.

Bước 6: OrderService tạo bản ghi HoaDon trong Database với các thông tin: KhachHangID, TongTien, TienGoc, TienVAT, TienGiamGia, PhiVanChuyen, TrangThai = "Chờ xử lý". Database trả về created order.

Bước 7: OrderService tạo các bản ghi ChiTietHoaDon. OrderService tạo bản ghi DiaChiGiaoHang. Nếu có voucher, tạo LichSuSuDungVoucher.

Bước 8: OrderService gọi PaymentService.createVNPayUrl(orderId, tongTien). PaymentService tạo các tham số VNPay, tạo chữ ký, tạo paymentUrl. PaymentService trả về paymentUrl.

Bước 9: OrderService trả về order và paymentUrl cho OrderController. OrderController trả về response cho Frontend. Frontend redirect User đến VNPay với paymentUrl.

Bước 10: User thực hiện thanh toán trên VNPay. VNPay xử lý giao dịch. VNPay redirect User về returnUrl với kết quả.

Bước 11: Frontend gửi kết quả đến PaymentService.handleReturn(). PaymentService xác thực chữ ký. Nếu thành công, PaymentService cập nhật TrangThaiThanhToan trong Database. PaymentService gọi OrderService.updateStock() để trừ tồn kho. PaymentService trả về kết quả cho Frontend.

Bước 12: Frontend hiển thị trang xác nhận thành công hoặc thất bại cho User.

### 6.3.2. Sequence Diagram - Luồng lọc sản phẩm

**Participants**: User, Frontend, ProductController, FilterContext, Strategy (NewestStrategy/PriceAscendingStrategy/...), Database.

**Luồng xử lý**:

Bước 1: User chọn tiêu chí sắp xếp "Giá tăng dần" trên Frontend. Frontend gửi GET request đến ProductController.getAllProducts() với query params: filter = "priceAsc", minPrice, maxPrice, categoryId.

Bước 2: ProductController parse query parameters. ProductController query Database để lấy tất cả sản phẩm với includes: LoaiSP, ThuongHieu, ChiTietHoaDons (cho BestSellerStrategy). Database trả về products array.

Bước 3: ProductController convert Sequelize models sang plain objects: products.map(p => p.toJSON()). ProductController gọi FilterContext.applyFilter(products, "priceAsc", {minPrice, maxPrice, categoryId}).

Bước 4: FilterContext gọi getStrategy("priceAsc"). FilterContext tra cứu trong strategies registry. FilterContext trả về PriceAscendingStrategy instance.

Bước 5: FilterContext gọi strategy.filter(products, queryParams). PriceAscendingStrategy clone products array. PriceAscendingStrategy gọi filterByPriceRange(products, minPrice, maxPrice). PriceAscendingStrategy gọi filterByCategory(products, categoryId).

Bước 6: PriceAscendingStrategy sort products theo Gia tăng dần. PriceAscendingStrategy trả về filtered và sorted products. FilterContext trả về kết quả cho ProductController.

Bước 7: ProductController áp dụng pagination: tính offset, lấy subset của products. ProductController format response với: products (paginated), pagination info, filter info. ProductController trả về JSON response cho Frontend.

Bước 8: Frontend nhận response. Frontend cập nhật state với products mới. Frontend re-render ProductList component. User thấy danh sách sản phẩm đã được sắp xếp theo giá tăng dần.

## 6.4. Activity Diagram

Activity Diagram mô tả luồng công việc (workflow) của một quy trình nghiệp vụ, bao gồm các activities, decisions và parallel flows.

### 6.4.1. Activity Diagram - Quy trình đặt hàng

**Swimlanes**: Customer, System, VNPay, Database.

**Luồng hoạt động**:

Start: Customer bắt đầu quy trình đặt hàng.

Activity (Customer): Duyệt sản phẩm và thêm vào giỏ hàng.

Activity (Customer): Vào trang giỏ hàng, xem lại sản phẩm.

Decision: Có muốn đặt hàng không? Nếu No: End. Nếu Yes: tiếp tục.

Activity (Customer): Nhấn "Đặt hàng", chuyển đến trang Checkout.

Activity (Customer): Chọn hoặc nhập địa chỉ giao hàng.

Decision: Có mã voucher không? Nếu Yes: Activity (Customer) nhập mã voucher, Activity (System) kiểm tra voucher hợp lệ. Decision: Voucher hợp lệ? Nếu No: hiển thị lỗi, quay lại nhập voucher. Nếu Yes: áp dụng voucher. Nếu No voucher: bỏ qua.

Activity (System): Tính giá đơn hàng sử dụng Decorator Pattern (Giá gốc + VAT - Voucher + Phí ship).

Activity (System): Hiển thị breakdown giá cho Customer.

Activity (Customer): Xác nhận thông tin và nhấn "Thanh toán".

Activity (System): Tạo bản ghi đơn hàng trong Database với trạng thái "Chờ xử lý".

Activity (Database): Lưu HoaDon, ChiTietHoaDon, DiaChiGiaoHang.

Activity (System): Tạo URL thanh toán VNPay.

Activity (System): Chuyển hướng Customer đến VNPay.

Activity (VNPay): Hiển thị trang thanh toán.

Activity (Customer): Chọn phương thức thanh toán và thực hiện thanh toán.

Activity (VNPay): Xử lý giao dịch.

Decision (VNPay): Thanh toán thành công? Nếu No: Activity (VNPay) chuyển hướng về với kết quả thất bại, Activity (System) hiển thị thông báo lỗi, Activity (Customer) có thể thử lại hoặc End. Nếu Yes: tiếp tục.

Activity (VNPay): Chuyển hướng về với kết quả thành công.

Activity (System): Xác thực chữ ký từ VNPay.

Activity (System): Cập nhật trạng thái thanh toán trong Database.

Activity (System): Trừ tồn kho cho các sản phẩm.

Activity (Database): Cập nhật SoLuongTonKho.

Activity (System): Xóa giỏ hàng.

Activity (System): Gửi email xác nhận đơn hàng.

Activity (System): Hiển thị trang xác nhận thành công với thông tin đơn hàng.

End: Quy trình đặt hàng hoàn tất.

**Parallel Activities**: Trong một số trường hợp, có thể có parallel flows như: gửi email xác nhận và cập nhật tồn kho có thể thực hiện song song.

## 6.5. Component Diagram

Component Diagram mô tả cấu trúc vật lý của hệ thống, bao gồm các components và dependencies giữa chúng.

### 6.5.1. Frontend Components

**Presentation Layer**: React Application chứa: Pages Components (HomePage, ProductListPage, ProductDetailPage, CartPage, CheckoutPage, OrderHistoryPage, AdminDashboard). Reusable Components (Header, Footer, ProductCard, Button, Input, Modal). Layout Components (UserLayout, AdminLayout).

**State Management**: Context API (AuthContext, CartContext).

**Services Layer**: API Services (authService, productService, cartService, orderService, paymentService). HTTP Client (Axios instance với interceptors).

**Dependencies**: React Application depends on API Services. API Services depends on Backend API.

### 6.5.2. Backend Components

**API Layer**: Express Server chứa: Routes (auth.routes, product.routes, cart.routes, order.routes, admin.routes). Middlewares (auth.middleware, error.middleware, upload.middleware, rateLimit.middleware).

**Business Logic Layer**: Controllers (AuthController, ProductController, CartController, OrderController, AdminController). Services (OrderService, PaymentService, GHNService, AddressService, EmailService). Design Patterns (Decorators: OrderPriceCalculator, VATDecorator, VoucherDecorator, ShippingDecorator. Strategies: ProductFilterStrategy, NewestStrategy, PriceAscendingStrategy, BestSellerStrategy, FilterContext. Singletons: DBConnection, Logger, ConfigService).

**Data Access Layer**: Models (TaiKhoan, KhachHang, SanPham, HoaDon, Voucher, và 16 models khác). Sequelize ORM. Database Connection Pool.

**Dependencies**: Routes depend on Controllers. Controllers depend on Services. Services depend on Models. Models depend on Sequelize ORM. Sequelize depends on Database.

### 6.5.3. External Components

**VNPay Payment Gateway**: Interface: REST API. Used by: PaymentService. Functions: Tạo URL thanh toán, Xử lý callback, Xử lý IPN.

**GHN Shipping Service**: Interface: REST API. Used by: GHNService. Functions: Tạo đơn vận chuyển, Lấy trạng thái vận chuyển, Tính phí ship.

**Email Service**: Interface: SMTP. Used by: EmailService. Functions: Gửi email xác nhận đơn hàng, Gửi email reset password.

### 6.5.4. Database Component

**SQL Server Database**: Contains: 21 tables (TaiKhoan, KhachHang, SanPham, HoaDon, và các bảng khác). Stored Procedures (nếu có). Views (nếu có). Indexes và Constraints.

**Dependencies**: Backend Models depend on Database. Database is accessed through Sequelize ORM.

### 6.5.5. Deployment Components

**Frontend Deployment**: Static Files (HTML, CSS, JavaScript bundles). Hosted on: Web Server (Nginx hoặc Apache) hoặc CDN.

**Backend Deployment**: Node.js Application. Hosted on: Application Server (PM2 process manager). Load Balancer (nếu có nhiều instances).

**Database Deployment**: SQL Server Instance. Backup Service. Monitoring Tools.

**Infrastructure**: Cloud Platform (AWS, Azure, hoặc on-premise). Container (Docker - nếu sử dụng). Orchestration (Kubernetes - nếu sử dụng).

### 6.5.6. Component Interfaces

**Frontend ↔ Backend**: Protocol: HTTP/HTTPS. Format: JSON. Authentication: JWT in Authorization header.

**Backend ↔ Database**: Protocol: TCP/IP. Driver: Sequelize with mssql driver. Connection Pool: Managed by Sequelize.

**Backend ↔ VNPay**: Protocol: HTTPS. Format: URL-encoded parameters. Security: HMAC SHA512 signature.

**Backend ↔ GHN**: Protocol: HTTPS. Format: JSON. Authentication: API Token in header.

## 6.6. Tổng kết về UML Diagrams

Các biểu đồ UML đã trình bày cung cấp cái nhìn toàn diện về hệ thống ToyStore từ nhiều góc độ khác nhau. Use Case Diagram cho thấy các chức năng mà hệ thống cung cấp và ai có thể sử dụng chúng. Class Diagram mô tả cấu trúc tĩnh của hệ thống với các classes, attributes, methods và relationships. Sequence Diagrams minh họa chi tiết cách các objects tương tác với nhau theo thời gian để thực hiện các use cases quan trọng. Activity Diagram trình bày luồng công việc của quy trình đặt hàng với các decisions và parallel activities. Component Diagram cho thấy cấu trúc vật lý của hệ thống và dependencies giữa các components.

Việc sử dụng UML giúp team phát triển có cùng một hiểu biết về hệ thống, tạo điều kiện cho việc giao tiếp hiệu quả giữa các thành viên. UML cũng là công cụ hữu ích cho việc tài liệu hóa hệ thống, giúp các developer mới dễ dàng hiểu và tham gia vào dự án. Trong quá trình phát triển, các biểu đồ UML có thể được cập nhật để phản ánh các thay đổi trong thiết kế, đảm bảo tài liệu luôn đồng bộ với code thực tế.
