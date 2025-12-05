# PHẦN 4: THIẾT KẾ KIẾN TRÚC HỆ THỐNG

## 4.1. Kiến trúc tổng thể

Hệ thống ToyStore được xây dựng dựa trên kiến trúc ba tầng (3-Tier Architecture), một mô hình kiến trúc phổ biến và được chứng minh là hiệu quả trong phát triển các ứng dụng web quy mô vừa và lớn. Kiến trúc này tách biệt hệ thống thành ba tầng độc lập: tầng trình diễn (Presentation Tier), tầng logic nghiệp vụ (Business Logic Tier), và tầng dữ liệu (Data Tier).

### 4.1.1. Tổng quan kiến trúc ba tầng

Kiến trúc ba tầng tổ chức hệ thống theo nguyên tắc phân tách trách nhiệm (Separation of Concerns), trong đó mỗi tầng có một vai trò và trách nhiệm cụ thể. Tầng trình diễn chịu trách nhiệm tương tác với người dùng, hiển thị thông tin và nhận input. Tầng logic nghiệp vụ xử lý các quy tắc nghiệp vụ, tính toán và điều phối luồng dữ liệu. Tầng dữ liệu quản lý việc lưu trữ và truy xuất dữ liệu.

Sự tách biệt này mang lại nhiều lợi ích quan trọng. Thứ nhất, mỗi tầng có thể được phát triển, kiểm thử và bảo trì độc lập. Thứ hai, thay đổi ở một tầng ít ảnh hưởng đến các tầng khác, miễn là interface giữa các tầng được giữ nguyên. Thứ ba, mỗi tầng có thể được mở rộng (scale) độc lập dựa trên nhu cầu thực tế.

### 4.1.2. Sơ đồ kiến trúc tổng thể của ToyStore

Trong hệ thống ToyStore, ba tầng được triển khai như sau:

**Tầng trình diễn (Presentation Tier)** được xây dựng bằng React.js, một thư viện JavaScript phổ biến cho việc xây dựng giao diện người dùng. Tầng này bao gồm hai phần chính: giao diện người dùng (customer-facing) và giao diện quản trị (admin-facing). Giao diện được thiết kế responsive, tương thích với nhiều kích thước màn hình từ desktop đến mobile. Tầng này giao tiếp với tầng logic nghiệp vụ thông qua các RESTful API calls sử dụng thư viện Axios.

**Tầng logic nghiệp vụ (Business Logic Tier)** được phát triển bằng Node.js và Express.js. Tầng này đóng vai trò trung tâm của hệ thống, xử lý tất cả logic nghiệp vụ, xác thực và phân quyền, tích hợp với các dịch vụ bên ngoài. Tầng này được tổ chức thành các module rõ ràng: controllers xử lý HTTP requests, services chứa logic nghiệp vụ, middlewares xử lý các tác vụ trung gian như authentication và logging, và các Design Pattern implementations để tối ưu hóa cấu trúc code.

**Tầng dữ liệu (Data Tier)** sử dụng SQL Server làm hệ quản trị cơ sở dữ liệu. Sequelize ORM được sử dụng làm lớp trung gian giữa tầng logic nghiệp vụ và database, cung cấp một cách thức tương tác với database an toàn và dễ bảo trì. Tầng này chịu trách nhiệm lưu trữ tất cả dữ liệu của hệ thống: thông tin người dùng, sản phẩm, đơn hàng, giao dịch.

### 4.1.3. Luồng giao tiếp giữa các tầng

Giao tiếp giữa các tầng tuân theo nguyên tắc một chiều từ trên xuống. Tầng trình diễn chỉ giao tiếp với tầng logic nghiệp vụ thông qua HTTP/HTTPS protocol, sử dụng các RESTful API endpoints. Tầng logic nghiệp vụ giao tiếp với tầng dữ liệu thông qua Sequelize ORM, sử dụng các phương thức như findAll, findOne, create, update, destroy.

Khi người dùng thực hiện một thao tác trên giao diện, ví dụ như xem danh sách sản phẩm, luồng xử lý diễn ra như sau: Frontend gửi HTTP GET request đến endpoint /api/products. Backend nhận request, controller tương ứng được gọi. Controller gọi service để lấy dữ liệu. Service sử dụng Sequelize để query database. Database trả về dữ liệu. Service xử lý và format dữ liệu nếu cần. Controller trả về HTTP response dưới dạng JSON. Frontend nhận response và hiển thị dữ liệu cho người dùng.

## 4.2. Lý do chọn kiến trúc ba tầng

Việc lựa chọn kiến trúc ba tầng cho hệ thống ToyStore dựa trên nhiều yếu tố kỹ thuật và nghiệp vụ.

### 4.2.1. Tách biệt trách nhiệm rõ ràng

Nguyên tắc Separation of Concerns là nền tảng của kiến trúc ba tầng. Mỗi tầng có một trách nhiệm cụ thể và không can thiệp vào trách nhiệm của tầng khác. Tầng trình diễn chỉ lo về việc hiển thị và tương tác với người dùng, không chứa logic nghiệp vụ. Tầng logic nghiệp vụ xử lý các quy tắc nghiệp vụ mà không quan tâm đến cách dữ liệu được hiển thị hay lưu trữ. Tầng dữ liệu chỉ lo việc lưu trữ và truy xuất dữ liệu.

Sự tách biệt này giúp code dễ hiểu, dễ bảo trì. Khi cần sửa lỗi hoặc thêm tính năng, developer có thể tập trung vào một tầng cụ thể mà không cần lo lắng về tác động đến các tầng khác. Ví dụ, khi cần thay đổi giao diện từ React sang Vue.js, chỉ cần thay đổi tầng trình diễn mà không ảnh hưởng đến backend và database.

### 4.2.2. Dễ bảo trì và mở rộng

Kiến trúc ba tầng tạo điều kiện thuận lợi cho việc bảo trì và mở rộng hệ thống. Khi cần thêm một tính năng mới, ví dụ như chức năng đánh giá sản phẩm, developer có thể thêm component mới ở frontend, controller và service mới ở backend, và bảng mới ở database một cách độc lập. Các thay đổi này không ảnh hưởng đến các tính năng hiện có nếu được thực hiện đúng cách.

Việc debug cũng trở nên dễ dàng hơn khi hệ thống được tổ chức theo tầng. Nếu có lỗi xảy ra, developer có thể xác định lỗi thuộc về tầng nào: lỗi hiển thị thuộc frontend, lỗi logic nghiệp vụ thuộc backend, lỗi dữ liệu thuộc database. Điều này giúp thu hẹp phạm vi tìm kiếm và sửa lỗi nhanh chóng.

### 4.2.3. Khả năng mở rộng theo chiều ngang

Một trong những lợi thế lớn của kiến trúc ba tầng là khả năng mở rộng (scaling) linh hoạt. Mỗi tầng có thể được mở rộng độc lập dựa trên nhu cầu thực tế. Nếu hệ thống gặp bottleneck ở tầng logic nghiệp vụ do số lượng request tăng cao, có thể thêm nhiều server backend để phân tải mà không cần thay đổi frontend hay database.

Trong ToyStore, backend được thiết kế stateless, nghĩa là không lưu trữ session state trong memory của server. Session được lưu trong database hoặc có thể sử dụng Redis. Điều này cho phép triển khai nhiều instance của backend server phía sau một load balancer. Các request từ cùng một người dùng có thể được xử lý bởi các server khác nhau mà không gặp vấn đề.

### 4.2.4. Bảo mật tốt hơn

Kiến trúc ba tầng cung cấp nhiều lớp bảo vệ cho hệ thống. Tầng dữ liệu không tiếp xúc trực tiếp với internet, chỉ có tầng logic nghiệp vụ mới có quyền truy cập. Điều này giảm thiểu rủi ro tấn công trực tiếp vào database. Tất cả các request từ frontend phải đi qua tầng logic nghiệp vụ, nơi có các middleware để xác thực, phân quyền và validate input.

Trong ToyStore, mọi API endpoint đều được bảo vệ bằng authentication middleware. Các thao tác nhạy cảm như quản lý sản phẩm, đơn hàng yêu cầu quyền admin hoặc staff. Input từ người dùng được validate và sanitize ở backend trước khi xử lý, ngăn chặn các cuộc tấn công như SQL injection, XSS.

### 4.2.5. Tái sử dụng API

Một lợi ích quan trọng khác của kiến trúc ba tầng là khả năng tái sử dụng API. Tầng logic nghiệp vụ cung cấp các RESTful API có thể được sử dụng bởi nhiều client khác nhau: web application, mobile application, hoặc thậm chí các hệ thống bên thứ ba thông qua API integration.

Trong tương lai, nếu ToyStore muốn phát triển ứng dụng mobile, có thể sử dụng lại toàn bộ backend API hiện có mà không cần thay đổi. Chỉ cần phát triển mobile app mới ở tầng trình diễn. Điều này tiết kiệm đáng kể thời gian và chi phí phát triển.

### 4.2.6. Phù hợp với quy mô dự án

Kiến trúc ba tầng là lựa chọn cân bằng giữa đơn giản và linh hoạt cho dự án quy mô vừa như ToyStore. So với kiến trúc monolithic đơn giản hơn nhưng khó mở rộng, ba tầng cung cấp sự tách biệt cần thiết mà không quá phức tạp. So với microservices phức tạp và overhead cao, ba tầng dễ quản lý hơn với nhóm nhỏ và không yêu cầu infrastructure phức tạp.

## 4.3. Các thành phần chính

### 4.3.1. Tầng trình diễn (Presentation Tier)

Tầng trình diễn là giao diện giữa người dùng và hệ thống, được xây dựng hoàn toàn bằng React.js và các công nghệ web hiện đại.

**Công nghệ sử dụng**

React.js phiên bản 18 là thư viện chính để xây dựng giao diện người dùng. React được chọn vì khả năng tạo ra giao diện động, hiệu suất cao với Virtual DOM, và hệ sinh thái phong phú với nhiều thư viện hỗ trợ. Tailwind CSS được sử dụng để styling, cung cấp các utility classes giúp phát triển giao diện nhanh chóng và nhất quán. React Router quản lý routing phía client, cho phép điều hướng giữa các trang mà không cần reload toàn bộ ứng dụng. Axios là thư viện HTTP client để giao tiếp với backend API.

**Cấu trúc thư mục**

Frontend được tổ chức theo cấu trúc component-based. Thư mục components chứa các React components tái sử dụng như Button, Input, ProductCard, Header, Footer. Thư mục pages chứa các components đại diện cho từng trang: HomePage, ProductListPage, ProductDetailPage, CartPage, CheckoutPage, OrderHistoryPage. Thư mục services chứa các module để gọi API: productService, orderService, authService. Thư mục contexts chứa React Context cho state management toàn cục như AuthContext, CartContext.

**State management**

Hệ thống sử dụng kết hợp local state và Context API để quản lý state. Local state được sử dụng cho các component độc lập, ví dụ như form input, modal visibility. Context API được sử dụng cho state cần chia sẻ giữa nhiều components như thông tin người dùng đăng nhập, giỏ hàng. Cách tiếp cận này đơn giản hơn so với Redux nhưng vẫn đáp ứng tốt nhu cầu của dự án.

**Responsive design**

Giao diện được thiết kế responsive sử dụng Tailwind CSS breakpoints. Layout tự động điều chỉnh dựa trên kích thước màn hình: desktop hiển thị nhiều cột, tablet hiển thị ít cột hơn, mobile hiển thị một cột. Hình ảnh được tối ưu với lazy loading và responsive images. Navigation menu chuyển thành hamburger menu trên mobile.

**Hai giao diện chính**

Tầng trình diễn bao gồm hai giao diện riêng biệt. Giao diện khách hàng (customer-facing) cho phép người dùng duyệt sản phẩm, thêm vào giỏ hàng, đặt hàng, thanh toán và quản lý tài khoản. Giao diện này tập trung vào trải nghiệm người dùng, với thiết kế thân thiện và quy trình mua hàng đơn giản. Giao diện quản trị (admin-facing) cung cấp các công cụ quản lý cho admin và staff: quản lý sản phẩm, đơn hàng, người dùng, voucher, và xem thống kê. Giao diện này tập trung vào hiệu quả và đầy đủ thông tin.

### 4.3.2. Tầng logic nghiệp vụ (Business Logic Tier)

Tầng logic nghiệp vụ là trung tâm của hệ thống, xử lý tất cả logic nghiệp vụ và điều phối luồng dữ liệu.

**Công nghệ sử dụng**

Node.js phiên bản 18 LTS là runtime environment, được chọn vì hiệu suất cao với non-blocking I/O, phù hợp cho ứng dụng web có nhiều request đồng thời. Express.js phiên bản 4 là web framework, cung cấp các công cụ để xây dựng RESTful API một cách nhanh chóng. Sequelize phiên bản 6 là ORM để tương tác với SQL Server, giúp viết code database an toàn và dễ bảo trì. Passport.js được sử dụng cho authentication, hỗ trợ nhiều strategy như JWT và OAuth.

**Cấu trúc thư mục**

Backend được tổ chức theo mô hình MVC (Model-View-Controller) với một số điều chỉnh. Thư mục models chứa các Sequelize models định nghĩa cấu trúc bảng và quan hệ. Thư mục controllers chứa các controller xử lý HTTP requests, validate input và gọi services. Thư mục services chứa logic nghiệp vụ phức tạp, tách biệt khỏi controllers để dễ test và tái sử dụng. Thư mục routes định nghĩa các API endpoints và mapping với controllers. Thư mục middlewares chứa các middleware như authentication, authorization, error handling, rate limiting. Thư mục utils chứa các utility functions dùng chung. Thư mục decorators, strategies, states chứa implementations của các Design Patterns.

**Controllers**

Controllers đóng vai trò là lớp đầu tiên nhận và xử lý HTTP requests. Mỗi controller tương ứng với một nhóm chức năng: ProductController xử lý các request liên quan đến sản phẩm, OrderController xử lý đơn hàng, AuthController xử lý authentication. Controllers có trách nhiệm validate input từ request, gọi services để xử lý logic nghiệp vụ, format response và trả về cho client. Controllers không chứa logic nghiệp vụ phức tạp, giữ code ngắn gọn và dễ đọc.

**Services**

Services chứa logic nghiệp vụ chính của hệ thống. Ví dụ, OrderService xử lý logic tạo đơn hàng: kiểm tra tồn kho, tính giá sử dụng Decorator Pattern, tạo bản ghi đơn hàng, trừ tồn kho, tạo đơn vận chuyển GHN. AddressService xử lý logic liên quan đến địa chỉ giao hàng. ReviewService xử lý đánh giá sản phẩm. Việc tách logic nghiệp vụ ra services giúp code dễ test, dễ tái sử dụng và tuân thủ Single Responsibility Principle.

**Middlewares**

Middlewares là các hàm xử lý trung gian trong request-response cycle. Authentication middleware kiểm tra JWT token và xác thực người dùng. Authorization middleware kiểm tra quyền hạn của người dùng dựa trên vai trò. Error handling middleware bắt và xử lý lỗi một cách tập trung, trả về error response nhất quán. Rate limiting middleware giới hạn số lượng request từ một IP trong một khoảng thời gian để chống DDoS. Upload middleware xử lý việc upload file sử dụng Multer.

**Design Patterns**

Tầng logic nghiệp vụ triển khai ba Design Patterns chính. Decorator Pattern được sử dụng để tính giá đơn hàng một cách linh hoạt, với các decorators: VATDecorator, VoucherDecorator, ShippingDecorator. Strategy Pattern được áp dụng cho việc lọc và sắp xếp sản phẩm, với các strategies: NewestStrategy, PriceAscendingStrategy, PriceDescendingStrategy, BestSellerStrategy. Singleton Pattern được sử dụng cho các utility classes như DBConnection, Logger, ConfigService để đảm bảo chỉ có một instance duy nhất.

### 4.3.3. Tầng dữ liệu (Data Tier)

Tầng dữ liệu chịu trách nhiệm lưu trữ và quản lý tất cả dữ liệu của hệ thống.

**Hệ quản trị cơ sở dữ liệu**

SQL Server 2019 được chọn làm hệ quản trị cơ sở dữ liệu. SQL Server là một RDBMS mạnh mẽ, ổn định và được sử dụng rộng rãi trong doanh nghiệp. Nó cung cấp các tính năng quan trọng như transaction support, foreign key constraints, stored procedures, views. SQL Server cũng có công cụ quản lý trực quan (SQL Server Management Studio) giúp dễ dàng quản lý database.

**Sequelize ORM**

Sequelize được sử dụng làm lớp trung gian giữa Node.js và SQL Server. ORM (Object-Relational Mapping) cho phép tương tác với database thông qua các object và method thay vì viết SQL trực tiếp. Sequelize cung cấp nhiều lợi ích: tự động escape parameters ngăn chặn SQL injection, hỗ trợ migrations để quản lý schema changes, cung cấp các phương thức tiện lợi như findAll, findOne, create, update, destroy, hỗ trợ associations và eager loading.

**Database schema**

Database được thiết kế với 21 bảng chính, được chuẩn hóa đến dạng chuẩn 3NF (Third Normal Form). Các bảng chính bao gồm: TaiKhoan lưu thông tin đăng nhập, KhachHang lưu thông tin khách hàng, SanPham lưu thông tin sản phẩm, LoaiSP và ThuongHieu lưu danh mục và thương hiệu, GioHang và GioHangChiTiet quản lý giỏ hàng, HoaDon và ChiTietHoaDon quản lý đơn hàng, Voucher và LichSuSuDungVoucher quản lý voucher, DiaChiGiaoHangUser và DiaChiGiaoHang quản lý địa chỉ, ThongTinVanChuyen lưu thông tin vận chuyển, DanhGiaSanPham lưu đánh giá.

**Quan hệ giữa các bảng**

Database được thiết kế với các quan hệ rõ ràng. Quan hệ một-một: TaiKhoan và KhachHang, HoaDon và DiaChiGiaoHang, HoaDon và ThongTinVanChuyen. Quan hệ một-nhiều: KhachHang có nhiều HoaDon, HoaDon có nhiều ChiTietHoaDon, SanPham có nhiều ChiTietHoaDon, LoaiSP có nhiều SanPham, ThuongHieu có nhiều SanPham. Các quan hệ này được định nghĩa trong Sequelize models sử dụng hasOne, hasMany, belongsTo.

**Indexing và optimization**

Để tối ưu hiệu suất truy vấn, các index được tạo trên các cột thường xuyên được sử dụng trong WHERE clause và JOIN: primary keys tự động có index, foreign keys được index, các cột như Email trong TaiKhoan, TenSP trong SanPham được index để tăng tốc tìm kiếm. Các truy vấn phức tạp được phân tích và tối ưu sử dụng execution plan.

## 4.4. Sơ đồ luồng dữ liệu chính

Để hiểu rõ cách các tầng tương tác với nhau, cần phân tích các luồng dữ liệu chính trong hệ thống.

### 4.4.1. Luồng đặt hàng

Luồng đặt hàng là một trong những luồng nghiệp vụ phức tạp nhất, liên quan đến nhiều thành phần và xử lý nhiều logic nghiệp vụ.

**Bước 1: Người dùng xác nhận đặt hàng**

Người dùng vào trang giỏ hàng, xem lại các sản phẩm đã chọn và nhấn nút "Đặt hàng". Frontend gửi request đến trang checkout. Tại trang checkout, người dùng chọn hoặc nhập địa chỉ giao hàng, có thể nhập mã voucher nếu có.

**Bước 2: Frontend gửi request tạo đơn hàng**

Khi người dùng xác nhận thông tin và nhấn "Thanh toán", frontend gửi POST request đến endpoint /api/orders/create với payload chứa: danh sách sản phẩm từ giỏ hàng, địa chỉ giao hàng, mã voucher nếu có.

**Bước 3: Backend xác thực và xử lý**

OrderController nhận request, kiểm tra authentication token để xác định người dùng. Controller gọi OrderService.createOrder() để xử lý logic tạo đơn hàng. OrderService thực hiện các bước: lấy thông tin giỏ hàng từ database, kiểm tra tồn kho cho từng sản phẩm, nếu không đủ hàng trả về lỗi.

**Bước 4: Tính giá sử dụng Decorator Pattern**

OrderService sử dụng Decorator Pattern để tính giá đơn hàng. Tạo OrderPriceCalculator với danh sách sản phẩm. Wrap với VATDecorator để thêm VAT mười phần trăm. Nếu có voucher, wrap với VoucherDecorator để trừ giảm giá. Wrap với ShippingDecorator để thêm phí vận chuyển hoặc miễn phí nếu đơn hàng đạt giá trị tối thiểu. Gọi calculate() để lấy tổng tiền cuối cùng và getDetails() để lấy chi tiết từng thành phần giá.

**Bước 5: Tạo bản ghi đơn hàng**

OrderService tạo bản ghi trong bảng HoaDon với các thông tin: khách hàng, tổng tiền, các thành phần giá (TienGoc, TienVAT, TienGiamGia, PhiVanChuyen), trạng thái "Chờ xử lý", phương thức thanh toán. Tạo các bản ghi trong ChiTietHoaDon cho từng sản phẩm. Tạo bản ghi DiaChiGiaoHang với thông tin địa chỉ giao hàng. Nếu có voucher, tạo bản ghi LichSuSuDungVoucher.

**Bước 6: Tích hợp thanh toán VNPay**

OrderService gọi PaymentService để tạo URL thanh toán VNPay. PaymentService tạo các tham số cần thiết: số tiền, mã đơn hàng, thông tin đơn hàng, URL return. Tạo chữ ký bảo mật sử dụng secret key. Tạo URL thanh toán VNPay với các tham số đã mã hóa.

**Bước 7: Chuyển hướng đến VNPay**

Backend trả về URL thanh toán cho frontend. Frontend chuyển hướng người dùng đến trang thanh toán VNPay. Người dùng thực hiện thanh toán trên VNPay.

**Bước 8: Xử lý kết quả thanh toán**

Sau khi thanh toán, VNPay chuyển hướng người dùng về URL return của ToyStore với các tham số kết quả. Frontend gửi các tham số này đến backend để xác thực. Backend xác thực chữ ký từ VNPay, kiểm tra tính toàn vẹn dữ liệu. Nếu thanh toán thành công, cập nhật trạng thái thanh toán của đơn hàng, trừ tồn kho cho các sản phẩm, xóa giỏ hàng. Nếu thanh toán thất bại, giữ nguyên trạng thái đơn hàng hoặc hủy đơn hàng.

**Bước 9: Phản hồi cho người dùng**

Backend trả về kết quả cho frontend. Frontend hiển thị trang xác nhận đơn hàng thành công hoặc thông báo lỗi. Gửi email xác nhận đơn hàng cho khách hàng.

### 4.4.2. Luồng lọc và sắp xếp sản phẩm

Luồng này minh họa cách Strategy Pattern được áp dụng trong thực tế.

**Bước 1: Người dùng chọn tiêu chí lọc/sắp xếp**

Người dùng vào trang danh sách sản phẩm, chọn tiêu chí sắp xếp từ dropdown: "Mới nhất", "Giá tăng dần", "Giá giảm dần", "Bán chạy nhất". Có thể chọn thêm bộ lọc: khoảng giá, danh mục, thương hiệu.

**Bước 2: Frontend gửi request**

Frontend gửi GET request đến /api/products với query parameters: filter (loại sắp xếp), minPrice, maxPrice, categoryId, brandId, page, limit.

**Bước 3: Backend nhận và xử lý**

ProductController nhận request, parse các query parameters. Gọi ProductService để lấy danh sách sản phẩm từ database với các includes cần thiết (LoaiSP, ThuongHieu, ChiTietHoaDons cho BestSellerStrategy).

**Bước 4: Áp dụng Strategy Pattern**

ProductService gọi FilterContext.applyFilter() với các tham số: danh sách sản phẩm, filterType (ví dụ "priceAsc"), queryParams (minPrice, maxPrice, categoryId). FilterContext tra cứu strategy tương ứng trong registry. Nếu filterType là "priceAsc", lấy PriceAscendingStrategy. Gọi strategy.filter(products, queryParams). Strategy thực hiện lọc và sắp xếp: lọc theo khoảng giá nếu có, lọc theo danh mục nếu có, sắp xếp theo tiêu chí của strategy. Trả về danh sách sản phẩm đã lọc và sắp xếp.

**Bước 5: Phân trang và trả về**

ProductService áp dụng phân trang trên danh sách đã lọc. Tính tổng số trang dựa trên limit. Lấy subset của sản phẩm cho trang hiện tại. ProductController format response với thông tin: danh sách sản phẩm, thông tin phân trang (trang hiện tại, tổng số trang, tổng số sản phẩm), thông tin filter đang áp dụng. Trả về JSON response cho frontend.

**Bước 6: Frontend hiển thị**

Frontend nhận response, cập nhật state với danh sách sản phẩm mới. Re-render component ProductList với dữ liệu mới. Cập nhật UI phân trang.

### 4.4.3. Luồng xác thực người dùng

Luồng này minh họa cách JWT authentication hoạt động trong hệ thống.

**Bước 1: Người dùng đăng nhập**

Người dùng nhập email và mật khẩu vào form đăng nhập. Frontend gửi POST request đến /api/auth/login với payload chứa email và password.

**Bước 2: Backend xác thực**

AuthController nhận request, gọi AuthService.login(). AuthService tìm user trong database theo email. Nếu không tìm thấy, trả về lỗi "Email không tồn tại". Nếu tìm thấy, so sánh password hash sử dụng bcrypt.compare(). Nếu password không khớp, trả về lỗi "Mật khẩu không đúng".

**Bước 3: Tạo JWT token**

Nếu xác thực thành công, AuthService tạo JWT token chứa payload: userId, email, role, expiresIn (thời gian sống của token). Ký token sử dụng secret key. Trả về token cho controller.

**Bước 4: Trả về cho client**

AuthController trả về response chứa: token, thông tin user (không bao gồm password). Frontend lưu token vào localStorage. Lưu thông tin user vào AuthContext.

**Bước 5: Sử dụng token cho các request sau**

Khi gọi các API cần authentication, frontend thêm token vào header: Authorization: Bearer <token>. Backend có authentication middleware kiểm tra token. Middleware lấy token từ header, verify token sử dụng secret key. Nếu token hợp lệ, decode để lấy thông tin user, gắn thông tin user vào request object (req.user). Cho phép request tiếp tục đến controller. Nếu token không hợp lệ hoặc hết hạn, trả về lỗi 401 Unauthorized.

## 4.5. Tích hợp bên ngoài

Hệ thống ToyStore tích hợp với hai dịch vụ bên ngoài quan trọng để cung cấp tính năng thanh toán và vận chuyển.

### 4.5.1. Tích hợp VNPay Payment Gateway

VNPay là một trong những cổng thanh toán trực tuyến phổ biến nhất tại Việt Nam, hỗ trợ nhiều phương thức thanh toán.

**Quy trình tích hợp**

Đăng ký tài khoản merchant với VNPay và nhận thông tin: TMN Code (mã merchant), Hash Secret (secret key để tạo chữ ký). Cấu hình các thông tin này trong file .env của backend. Triển khai PaymentService để tạo URL thanh toán và xử lý callback.

**Tạo URL thanh toán**

Khi tạo đơn hàng, PaymentService.createPaymentUrl() được gọi với các tham số: orderId, amount, orderInfo. Service tạo các tham số theo định dạng VNPay yêu cầu: vnp_Version, vnp_Command, vnp_TmnCode, vnp_Amount (số tiền nhân 100), vnp_CreateDate, vnp_CurrCode (VND), vnp_IpAddr, vnp_Locale (vn), vnp_OrderInfo, vnp_OrderType, vnp_ReturnUrl, vnp_TxnRef (mã đơn hàng). Sắp xếp các tham số theo thứ tự alphabet. Tạo chuỗi query string. Tạo chữ ký HMAC SHA512 sử dụng Hash Secret. Thêm chữ ký vào query string. Tạo URL đầy đủ đến VNPay payment gateway.

**Xử lý callback**

Sau khi thanh toán, VNPay chuyển hướng người dùng về returnUrl với các tham số kết quả. PaymentService.handleReturn() nhận các tham số, xác thực chữ ký để đảm bảo dữ liệu không bị giả mạo. Kiểm tra vnp_ResponseCode: "00" nghĩa là thành công. Cập nhật trạng thái thanh toán của đơn hàng trong database. Trả về kết quả cho frontend để hiển thị.

**Xử lý IPN (Instant Payment Notification)**

VNPay cũng gửi IPN đến một endpoint riêng của backend để thông báo kết quả giao dịch. Điều này đảm bảo backend luôn nhận được thông báo ngay cả khi người dùng đóng trình duyệt. PaymentService.handleIPN() xác thực chữ ký, cập nhật trạng thái thanh toán, trả về response cho VNPay theo định dạng yêu cầu.

### 4.5.2. Tích hợp Giao Hàng Nhanh (GHN) API

GHN là đơn vị vận chuyển được tích hợp để tạo đơn vận chuyển và theo dõi trạng thái giao hàng.

**Quy trình tích hợp**

Đăng ký tài khoản doanh nghiệp với GHN và nhận API token. Cấu hình thông tin: API token, Shop ID, từ địa chỉ (kho hàng). Triển khai GHNService để giao tiếp với GHN API.

**Tạo đơn vận chuyển**

Khi admin cập nhật trạng thái đơn hàng thành "Đang vận chuyển", hệ thống tự động tạo đơn vận chuyển trên GHN. GHNService.createOrder() được gọi với thông tin: địa chỉ người nhận (từ DiaChiGiaoHang), danh sách sản phẩm, trọng lượng, kích thước, giá trị đơn hàng, ghi chú. Service gửi POST request đến GHN API endpoint /v2/shipping-order/create. GHN trả về mã vận đơn (order_code) và thông tin phí vận chuyển. Hệ thống lưu mã vận đơn vào bảng ThongTinVanChuyen.

**Tra cứu trạng thái vận chuyển**

Khách hàng có thể sử dụng mã vận đơn để tra cứu trạng thái trên website GHN. Hệ thống cũng có thể gọi GHN API để lấy thông tin trạng thái và cập nhật vào database. GHNService.getOrderStatus() gửi GET request đến /v2/shipping-order/detail với order_code. GHN trả về thông tin chi tiết: trạng thái hiện tại, lịch sử thay đổi trạng thái, thời gian dự kiến giao hàng.

**Webhook từ GHN**

GHN có thể gửi webhook đến hệ thống khi trạng thái đơn hàng thay đổi. Hệ thống cung cấp endpoint để nhận webhook, xác thực request từ GHN, cập nhật trạng thái vận chuyển trong database, gửi thông báo cho khách hàng nếu cần.

### 4.5.3. Lợi ích của việc tích hợp

Tích hợp với các dịch vụ bên ngoài mang lại nhiều lợi ích. Giảm chi phí và thời gian phát triển: không cần xây dựng hệ thống thanh toán và vận chuyển riêng. Tận dụng chuyên môn: VNPay và GHN là các đơn vị chuyên nghiệp với hệ thống ổn định và bảo mật cao. Tăng độ tin cậy: người dùng tin tưởng hơn khi thanh toán qua cổng thanh toán uy tín. Mở rộng phương thức thanh toán: VNPay hỗ trợ nhiều phương thức mà hệ thống không thể tự triển khai. Mạng lưới vận chuyển rộng: GHN có mạng lưới toàn quốc, đảm bảo giao hàng nhanh chóng.
