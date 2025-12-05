# 📚 HƯỚNG DẪN LÀM TIỂU LUẬN MÔN PHÂN TÍCH & THIẾT KẾ PHẦN MỀM
## Dựa trên dự án ToyStore

---

## 🎯 MỤC TIÊU

Tạo một bài tiểu luận **sáng tạo, khác biệt** và **đánh giá cao** về quá trình Phân tích & Thiết kế phần mềm dựa trên dự án ToyStore thực tế.

---

## 📋 CẤU TRÚC ĐỀ XUẤT CHO TIỂU LUẬN

### **PHẦN 1: GIỚI THIỆU DỰ ÁN (2-3 trang)**

#### 1.1. Tổng quan dự án ToyStore
- **Mô tả**: Hệ thống thương mại điện tử chuyên bán đồ chơi
- **Mục tiêu**: Tạo nền tảng online cho việc mua bán đồ chơi
- **Đối tượng sử dụng**: 
  - Khách hàng (mua hàng)
  - Admin (quản lý)
  - Staff (nhân viên)

#### 1.2. Lý do chọn dự án
- ✅ Dự án thực tế, đã triển khai
- ✅ Áp dụng nhiều Design Patterns (Decorator, Strategy, Singleton)
- ✅ Kiến trúc rõ ràng (3-tier)
- ✅ Có đầy đủ tài liệu kỹ thuật

---

### **PHẦN 2: PHÂN TÍCH YÊU CẦU (5-7 trang)**

#### 2.1. Quy trình thu thập yêu cầu
- **Phương pháp**: Phỏng vấn, khảo sát, phân tích thị trường
- **Tham khảo**: Product Management Tower (từ tài liệu môn học)

#### 2.2. Yêu cầu người dùng (User Requirements)

##### 2.2.1. Yêu cầu chức năng (Functional Requirements)

**A. Quản lý người dùng:**
- FR-1.1: Đăng ký/Đăng nhập (JWT Authentication)
- FR-1.2: Quản lý profile cá nhân
- FR-1.3: Quản lý địa chỉ giao hàng
- FR-1.4: Xem lịch sử đơn hàng

**B. Quản lý sản phẩm:**
- FR-2.1: Tìm kiếm sản phẩm (theo tên, danh mục, thương hiệu)
- FR-2.2: Lọc và sắp xếp sản phẩm (Strategy Pattern)
  - Sắp xếp theo: Mới nhất, Giá tăng/giảm, Bán chạy nhất
- FR-2.3: Xem chi tiết sản phẩm (ảnh, mô tả, đánh giá)
- FR-2.4: Đánh giá và nhận xét sản phẩm

**C. Quản lý giỏ hàng:**
- FR-3.1: Thêm/Xóa/Cập nhật sản phẩm trong giỏ hàng
- FR-3.2: Giỏ hàng cho khách vãng lai (localStorage)
- FR-3.3: Tính tổng tiền tự động

**D. Quản lý đơn hàng:**
- FR-4.1: Tạo đơn hàng từ giỏ hàng
- FR-4.2: Tính giá đơn hàng với Decorator Pattern:
  - Giá gốc
  - + VAT (10%)
  - - Voucher (nếu có)
  - + Phí vận chuyển (hoặc miễn phí nếu ≥ 500K)
- FR-4.3: Theo dõi trạng thái đơn hàng
- FR-4.4: Hủy đơn hàng (chỉ khi "Chờ xử lý")

**E. Thanh toán:**
- FR-5.1: Tích hợp VNPay payment gateway
- FR-5.2: Xử lý webhook từ VNPay
- FR-5.3: Cập nhật trạng thái thanh toán

**F. Quản trị (Admin):**
- FR-6.1: Quản lý sản phẩm (CRUD)
- FR-6.2: Quản lý đơn hàng
- FR-6.3: Quản lý người dùng
- FR-6.4: Quản lý voucher
- FR-6.5: Thống kê doanh thu, sản phẩm

##### 2.2.2. Yêu cầu phi chức năng (Non-Functional Requirements)

**A. Hiệu suất (Performance):**
- NFR-1.1: Thời gian tải trang < 3 giây
- NFR-1.2: Hỗ trợ đồng thời 1000+ người dùng
- NFR-1.3: API response time < 500ms

**B. Bảo mật (Security):**
- NFR-2.1: Mã hóa mật khẩu (bcrypt)
- NFR-2.2: JWT token authentication
- NFR-2.3: Rate limiting (chống DDoS)
- NFR-2.4: SQL injection protection (Sequelize ORM)

**C. Khả năng sử dụng (Usability):**
- NFR-3.1: Giao diện responsive (mobile, tablet, desktop)
- NFR-3.2: UI/UX thân thiện, dễ sử dụng
- NFR-3.3: Hỗ trợ đa ngôn ngữ (tiếng Việt)

**D. Độ tin cậy (Reliability):**
- NFR-4.1: Uptime 99.9%
- NFR-4.2: Database backup tự động
- NFR-4.3: Transaction rollback khi lỗi

**E. Khả năng mở rộng (Scalability):**
- NFR-5.1: Dễ dàng thêm tính năng mới (nhờ Design Patterns)
- NFR-5.2: Hỗ trợ horizontal scaling

#### 2.3. Yêu cầu nghiệp vụ (Domain Requirements)

**A. Quản lý kho:**
- DR-1: Tự động trừ tồn kho khi đặt hàng thành công
- DR-2: Không cho phép đặt hàng nếu hết hàng
- DR-3: Hoàn lại tồn kho khi hủy đơn hàng

**B. Quản lý giá:**
- DR-4: Tính giá đơn hàng theo công thức:
  ```
  Tổng tiền = TienGoc + TienVAT - TienGiamGia + PhiVanChuyen
  ```
- DR-5: VAT mặc định 10%
- DR-6: Miễn phí vận chuyển nếu đơn hàng ≥ 500.000đ

**C. Quản lý voucher:**
- DR-7: Mỗi voucher chỉ dùng 1 lần/khách hàng
- DR-8: Voucher có hạn sử dụng
- DR-9: Voucher có điều kiện áp dụng (giá trị đơn hàng tối thiểu)

#### 2.4. Phi yêu cầu (Non-Requirements)

- ❌ Không hỗ trợ thanh toán bằng tiền mặt
- ❌ Không tích hợp chatbot AI
- ❌ Không tự vận chuyển (dùng dịch vụ bên thứ 3 - GHN)
- ❌ Không hỗ trợ đa ngôn ngữ (chỉ tiếng Việt)

---

### **PHẦN 3: CHỌN MÔ HÌNH PHÁT TRIỂN PHẦN MỀM (3-4 trang)**

#### 3.1. Phân tích và lựa chọn mô hình

**Mô hình được chọn: Agile/Scrum (kết hợp Iterative)**

**Lý do:**
- ✅ Yêu cầu có thể thay đổi (thêm tính năng mới)
- ✅ Cần phản hồi nhanh từ người dùng
- ✅ Phát triển theo từng sprint (2 tuần)
- ✅ Phù hợp với dự án e-commerce

#### 3.2. Quy trình phát triển

**Sprint 1 (2 tuần):**
- Authentication & Authorization
- Quản lý sản phẩm cơ bản
- Giỏ hàng

**Sprint 2 (2 tuần):**
- Đặt hàng
- Thanh toán VNPay
- Quản lý đơn hàng

**Sprint 3 (2 tuần):**
- Admin dashboard
- Thống kê
- Voucher system

**Sprint 4 (2 tuần):**
- Tối ưu hóa (Design Patterns)
- Testing
- Deployment

#### 3.3. So sánh với các mô hình khác

| Mô hình | Ưu điểm | Nhược điểm | Phù hợp? |
|---------|---------|------------|----------|
| **Waterfall** | Rõ ràng, dễ quản lý | Khó thay đổi | ❌ Không |
| **V-Model** | Kiểm thử tốt | Cứng nhắc | ❌ Không |
| **Spiral** | Quản lý rủi ro tốt | Phức tạp | ⚠️ Có thể |
| **Scrum** | Linh hoạt, phản hồi nhanh | Cần team có kinh nghiệm | ✅ **Có** |
| **Iterative** | Phát triển từng phần | Cần quản lý tốt | ✅ **Có** |

---

### **PHẦN 4: THIẾT KẾ KIẾN TRÚC HỆ THỐNG (5-7 trang)**

#### 4.1. Kiến trúc tổng thể

**Kiến trúc được chọn: 3-Tier Architecture (N-tier)**

```
┌─────────────────────────────────────┐
│   PRESENTATION TIER (Frontend)      │
│   - React.js                        │
│   - Tailwind CSS                    │
│   - Axios (API calls)               │
└──────────────┬──────────────────────┘
               │ HTTP/REST API
┌──────────────▼──────────────────────┐
│   BUSINESS LOGIC TIER (Backend)    │
│   - Node.js + Express              │
│   - Controllers                    │
│   - Services                       │
│   - Design Patterns                │
└──────────────┬──────────────────────┘
               │ SQL Queries
┌──────────────▼──────────────────────┐
│   DATA TIER (Database)              │
│   - SQL Server                      │
│   - Sequelize ORM                   │
└─────────────────────────────────────┘
```

#### 4.2. Lý do chọn 3-Tier Architecture

**Ưu điểm:**
- ✅ **Tách biệt trách nhiệm**: Frontend, Backend, Database độc lập
- ✅ **Dễ bảo trì**: Sửa frontend không ảnh hưởng backend
- ✅ **Khả năng mở rộng**: Scale từng tầng độc lập
- ✅ **Bảo mật**: Database không tiếp xúc trực tiếp với client
- ✅ **Tái sử dụng**: API có thể dùng cho web, mobile app

**So sánh với các kiến trúc khác:**

| Kiến trúc | Ưu điểm | Nhược điểm | Phù hợp? |
|-----------|---------|------------|----------|
| **Monolithic** | Đơn giản, hiệu suất cao | Khó mở rộng | ❌ Không (dự án lớn) |
| **3-Tier** | Cân bằng tốt | Phức tạp hơn monolithic | ✅ **Có** |
| **Microservices** | Rất linh hoạt | Phức tạp, overhead | ❌ Không (dự án vừa) |

#### 4.3. Các thành phần chính

**A. Frontend (Presentation Tier):**
- React.js components
- React Router (routing)
- State management (local state + Context API)
- API integration (Axios)

**B. Backend (Business Logic Tier):**
- Express.js server
- Controllers (xử lý HTTP requests)
- Services (business logic)
- Middlewares (auth, rate limiting, upload)
- Design Patterns:
  - **Decorator Pattern**: Tính giá đơn hàng
  - **Strategy Pattern**: Lọc/sắp xếp sản phẩm
  - **Singleton Pattern**: DB connection, Logger, Config

**C. Database (Data Tier):**
- SQL Server
- Sequelize ORM
- Models và Relationships

#### 4.4. Sơ đồ luồng dữ liệu chính

**Luồng đặt hàng:**
```
User → Frontend → API Request → Controller → Service → Database
                                      ↓
                              Decorator Pattern (tính giá)
                                      ↓
                              VNPay Integration
                                      ↓
                              Update Database
                                      ↓
                              Response → Frontend → User
```

---

### **PHẦN 5: THIẾT KẾ CHI TIẾT (7-10 trang)**

#### 5.1. Thiết kế cơ sở dữ liệu

##### 5.1.1. Mô hình quan hệ (ERD)

**Các bảng chính:**
- `TaiKhoan` (Users)
- `KhachHang` (Customers)
- `SanPham` (Products)
- `LoaiSP` (Categories)
- `ThuongHieu` (Brands)
- `GioHang` (Carts)
- `GioHangChiTiet` (Cart Items)
- `HoaDon` (Orders)
- `ChiTietHoaDon` (Order Items)
- `Voucher` (Vouchers)
- `DiaChiGiaoHang` (Shipping Addresses)
- `ThongTinVanChuyen` (Shipping Info)
- `DanhGiaSanPham` (Product Reviews)

**Quan hệ:**
- 1 User → 1 Customer
- 1 Customer → N Orders
- 1 Order → N Order Items
- 1 Product → N Order Items
- 1 Product → N Cart Items
- 1 Order → 1 Shipping Address
- 1 Order → 1 Shipping Info (optional)
- 1 Order → 1 Voucher (optional)

##### 5.1.2. Chuẩn hóa dữ liệu

- **1NF**: Tất cả các bảng đều ở dạng chuẩn 1
- **2NF**: Loại bỏ phụ thuộc hàm một phần
- **3NF**: Loại bỏ phụ thuộc bắc cầu

**Ví dụ chuẩn hóa:**
- `SanPham` tách riêng `LoaiSP` và `ThuongHieu` (tránh lặp lại)
- `ChiTietHoaDon` lưu giá tại thời điểm mua (không phụ thuộc `SanPham.GiaBan` hiện tại)

#### 5.2. Thiết kế giao diện người dùng (UI/UX)

##### 5.2.1. Nguyên tắc thiết kế
- **Consistency**: Giao diện nhất quán
- **Simplicity**: Đơn giản, dễ sử dụng
- **Responsive**: Tương thích mọi thiết bị
- **Accessibility**: Dễ truy cập

##### 5.2.2. Các màn hình chính
- Trang chủ (Homepage)
- Danh sách sản phẩm (Product List)
- Chi tiết sản phẩm (Product Detail)
- Giỏ hàng (Shopping Cart)
- Thanh toán (Checkout)
- Lịch sử đơn hàng (Order History)
- Admin Dashboard

#### 5.3. Thiết kế API

##### 5.3.1. RESTful API Design

**Nguyên tắc:**
- Sử dụng HTTP methods: GET, POST, PUT, DELETE, PATCH
- URL rõ ràng, có nghĩa
- Response format nhất quán (JSON)

**Ví dụ:**
```
GET    /api/products              - Lấy danh sách sản phẩm
GET    /api/products/:id          - Lấy chi tiết sản phẩm
POST   /api/cart/add              - Thêm vào giỏ hàng
POST   /api/orders/create         - Tạo đơn hàng
GET    /api/orders/my-orders      - Lịch sử đơn hàng
```

##### 5.3.2. Authentication & Authorization

- **JWT Token**: Lưu trong localStorage (frontend)
- **Middleware**: `auth.middleware.js` kiểm tra token
- **Roles**: `user`, `admin`, `staff`

#### 5.4. Áp dụng Design Patterns

##### 5.4.1. Decorator Pattern - Tính giá đơn hàng

**Vấn đề:**
- Tính giá đơn hàng phức tạp: Giá gốc + VAT - Voucher + Phí ship
- Cần linh hoạt thêm/bớt các thành phần giá

**Giải pháp: Decorator Pattern**

**Cấu trúc:**
```
OrderPriceCalculator (Base Component)
    ↓
OrderPriceDecorator (Base Decorator)
    ├── VATDecorator
    ├── VoucherDecorator
    └── ShippingDecorator
```

**Code example:**
```javascript
// Base
let calculator = new OrderPriceCalculator(items);

// Thêm VAT
calculator = new VATDecorator(calculator, 0.1); // 10%

// Thêm Voucher
calculator = new VoucherDecorator(calculator, voucher);

// Thêm Shipping
calculator = new ShippingDecorator(calculator, shippingFee);

// Tính tổng
const total = calculator.calculate();
```

**Lợi ích:**
- ✅ Linh hoạt: Dễ thêm/bớt thành phần giá
- ✅ Tuân thủ Open/Closed Principle
- ✅ Code dễ đọc, dễ bảo trì

##### 5.4.2. Strategy Pattern - Lọc/Sắp xếp sản phẩm

**Vấn đề:**
- Nhiều cách sắp xếp: Mới nhất, Giá tăng, Giá giảm, Bán chạy
- Nếu dùng if-else → code dài, khó mở rộng

**Giải pháp: Strategy Pattern**

**Cấu trúc:**
```
ProductFilterStrategy (Interface)
    ├── NewestStrategy
    ├── PriceAscendingStrategy
    ├── PriceDescendingStrategy
    └── BestSellerStrategy

FilterContext (Context)
```

**Code example:**
```javascript
const context = new FilterContext();
const filteredProducts = context.applyFilter(
    products, 
    'priceAsc',  // Strategy type
    { minPrice: 100000, maxPrice: 500000 }
);
```

**Lợi ích:**
- ✅ Loại bỏ if-else dài
- ✅ Dễ thêm strategy mới
- ✅ Tách biệt logic lọc ra khỏi controller

##### 5.4.3. Singleton Pattern - Quản lý tài nguyên

**Vấn đề:**
- Database connection: Chỉ cần 1 connection pool
- Logger: Chỉ cần 1 instance để ghi log
- Config: Chỉ cần 1 instance để đọc config

**Giải pháp: Singleton Pattern**

**Các class áp dụng:**
- `DBConnection`: Quản lý kết nối database
- `Logger`: Ghi log
- `ConfigService`: Đọc cấu hình

**Code example:**
```javascript
// Chỉ tạo 1 instance duy nhất
const dbConnection = DBConnection.getInstance();
const logger = Logger.getInstance();
const config = ConfigService.getInstance();
```

**Lợi ích:**
- ✅ Tiết kiệm tài nguyên
- ✅ Đảm bảo tính nhất quán
- ✅ Dễ quản lý

---

### **PHẦN 6: UML DIAGRAMS (5-7 trang)**

#### 6.1. Use Case Diagram

**Actors:**
- Customer (Khách hàng)
- Admin (Quản trị viên)
- Staff (Nhân viên)
- System (Hệ thống)

**Use Cases chính:**
- Đăng ký/Đăng nhập
- Xem sản phẩm
- Tìm kiếm/Lọc sản phẩm
- Quản lý giỏ hàng
- Đặt hàng
- Thanh toán
- Quản lý đơn hàng (Admin)
- Quản lý sản phẩm (Admin)
- Thống kê (Admin)

#### 6.2. Class Diagram

**Các class chính:**

**Models:**
- `TaiKhoan`, `KhachHang`, `SanPham`, `HoaDon`, `Voucher`, ...

**Controllers:**
- `ProductController`, `OrderController`, `CartController`, ...

**Services:**
- `AddressService`, `ReviewService`, `GHNService`, ...

**Patterns:**
- `OrderPriceCalculator`, `OrderPriceDecorator`, `VATDecorator`, ...
- `ProductFilterStrategy`, `NewestStrategy`, `PriceAscendingStrategy`, ...
- `DBConnection`, `Logger`, `ConfigService` (Singleton)

**Relationships:**
- Inheritance: `OrderPriceDecorator` ← `VATDecorator`
- Composition: `FilterContext` contains `ProductFilterStrategy[]`
- Association: `HoaDon` → `KhachHang`, `SanPham`

#### 6.3. Sequence Diagram

**Luồng đặt hàng:**
```
User → Frontend → OrderController → OrderService
                                      ↓
                              CartService (lấy giỏ hàng)
                                      ↓
                              Decorator Pattern (tính giá)
                                      ↓
                              PaymentService (tạo VNPay URL)
                                      ↓
                              Database (lưu đơn hàng)
                                      ↓
                              Response → Frontend → User
```

**Luồng lọc sản phẩm:**
```
User → Frontend → ProductController → FilterContext
                                      ↓
                              Strategy Pattern (chọn strategy)
                                      ↓
                              ProductFilterStrategy.filter()
                                      ↓
                              Database (query)
                                      ↓
                              Response → Frontend → User
```

#### 6.4. Activity Diagram

**Quy trình đặt hàng:**
1. User thêm sản phẩm vào giỏ
2. Vào trang Checkout
3. Nhập địa chỉ giao hàng
4. Chọn voucher (nếu có)
5. Hệ thống tính giá (Decorator Pattern)
6. Chọn phương thức thanh toán
7. Thanh toán VNPay
8. Xác nhận đơn hàng
9. Cập nhật tồn kho
10. Gửi email xác nhận

#### 6.5. Component Diagram

**Frontend Components:**
- `ProductList`, `ProductDetail`, `Cart`, `Checkout`, `OrderHistory`
- `AdminDashboard`, `ProductManagement`, `OrderManagement`

**Backend Components:**
- `Controllers`, `Services`, `Models`, `Middlewares`
- `Decorators`, `Strategies`, `Utils`

---

### **PHẦN 7: ĐÁNH GIÁ VÀ KẾT LUẬN (2-3 trang)**

#### 7.1. Đánh giá quá trình phân tích và thiết kế

**Điểm mạnh:**
- ✅ Yêu cầu rõ ràng, đầy đủ
- ✅ Kiến trúc 3-tier phù hợp
- ✅ Áp dụng Design Patterns hiệu quả
- ✅ Database được chuẩn hóa tốt
- ✅ API RESTful chuẩn

**Điểm cần cải thiện:**
- ⚠️ Có thể thêm caching (Redis) để tăng hiệu suất
- ⚠️ Có thể thêm unit tests
- ⚠️ Có thể thêm API documentation (Swagger)

#### 7.2. Bài học kinh nghiệm

1. **Phân tích yêu cầu kỹ lưỡng** trước khi code
2. **Chọn Design Patterns phù hợp** giúp code dễ bảo trì
3. **Kiến trúc rõ ràng** giúp team làm việc hiệu quả
4. **Tài liệu đầy đủ** giúp onboarding nhanh

#### 7.3. Hướng phát triển tương lai

- 🔮 Microservices architecture (khi scale lớn)
- 🔮 Real-time notifications (WebSocket)
- 🔮 Recommendation system (AI/ML)
- 🔮 Mobile app (React Native)
- 🔮 Multi-language support

---

## 🎨 GỢI Ý ĐỂ TẠO SỰ KHÁC BIỆT VÀ SÁNG TẠO

### 1. **Visual Diagrams**
- Vẽ UML diagrams bằng công cụ chuyên nghiệp (Draw.io, Lucidchart)
- Thêm màu sắc, icons để dễ hiểu
- Tạo sơ đồ kiến trúc 3D hoặc interactive

### 2. **Case Studies Thực Tế**
- So sánh ToyStore với các hệ thống e-commerce khác (Shopee, Tiki)
- Phân tích tại sao chọn 3-tier thay vì microservices
- Giải thích lý do chọn từng Design Pattern

### 3. **Metrics & Performance**
- Thêm số liệu thực tế:
  - Response time của API
  - Số lượng requests/giây
  - Database query performance
- So sánh trước/sau khi áp dụng Design Patterns

### 4. **Code Examples**
- Đưa code snippets thực tế từ dự án
- Giải thích từng dòng code quan trọng
- So sánh code trước/sau refactoring

### 5. **User Stories & Personas**
- Tạo personas cho từng loại người dùng
- Viết user stories chi tiết
- Tạo journey map cho user

### 6. **Testing Strategy**
- Mô tả chiến lược testing (Unit, Integration, E2E)
- Test cases cho các chức năng chính
- Code coverage metrics

### 7. **Deployment & DevOps**
- Mô tả quy trình deployment
- CI/CD pipeline (nếu có)
- Monitoring & logging strategy

---

## 📝 CHECKLIST HOÀN THIỆN TIỂU LUẬN

### Nội dung:
- [ ] Phần 1: Giới thiệu dự án
- [ ] Phần 2: Phân tích yêu cầu (đầy đủ FR, NFR, DR, Non-requirements)
- [ ] Phần 3: Mô hình phát triển phần mềm
- [ ] Phần 4: Thiết kế kiến trúc hệ thống
- [ ] Phần 5: Thiết kế chi tiết (Database, UI/UX, API, Design Patterns)
- [ ] Phần 6: UML Diagrams (Use Case, Class, Sequence, Activity, Component)
- [ ] Phần 7: Đánh giá và kết luận

### Hình ảnh/Diagrams:
- [ ] Use Case Diagram
- [ ] Class Diagram
- [ ] Sequence Diagram (ít nhất 2 luồng chính)
- [ ] Activity Diagram
- [ ] Component Diagram
- [ ] ERD (Entity Relationship Diagram)
- [ ] Architecture Diagram (3-tier)
- [ ] Design Pattern Diagrams

### Format:
- [ ] Bìa tiểu luận
- [ ] Mục lục
- [ ] Danh sách hình ảnh/bảng biểu
- [ ] Tài liệu tham khảo
- [ ] Phụ lục (nếu có)

### Chất lượng:
- [ ] Không có lỗi chính tả
- [ ] Format nhất quán
- [ ] Số trang đủ (20-30 trang)
- [ ] Nội dung sáng tạo, khác biệt

---

## 🛠️ CÔNG CỤ HỖ TRỢ

### Vẽ Diagrams:
1. **Draw.io** (https://app.diagrams.net/) - Miễn phí, online
2. **Lucidchart** - Chuyên nghiệp, có bản free
3. **PlantUML** - Code-based, dễ version control
4. **Visual Paradigm** - Chuyên nghiệp, có bản student

### Viết tài liệu:
1. **Microsoft Word** - Chuẩn, dễ format
2. **Google Docs** - Collaboration tốt
3. **LaTeX** - Chuyên nghiệp, đẹp
4. **Markdown** - Đơn giản, dễ version control

### Tài liệu tham khảo:
- Tài liệu môn học "Phân tích và thiết kế PM"
- Design Patterns: Elements of Reusable Object-Oriented Software (Gang of Four)
- Clean Architecture (Robert C. Martin)
- Refactoring Guru (https://refactoring.guru/)

---

## 📚 TÀI LIỆU THAM KHẢO TRONG DỰ ÁN

Dự án ToyStore đã có sẵn các tài liệu:
- `docs/patterns/DECORATOR_PATTERN_EXPLAINED.md`
- `docs/patterns/STRATEGY_PATTERN_GUIDE.md`
- `docs/patterns/SINGLETON_PATTERN_GUIDE.md`
- `README.md` - Tổng quan dự án
- `backend/README.md` - Hướng dẫn backend

---

## 🎯 KẾT LUẬN

Với cấu trúc này, bạn sẽ có một bài tiểu luận:
- ✅ **Đầy đủ**: Bao phủ tất cả nội dung môn học
- ✅ **Thực tế**: Dựa trên dự án thật
- ✅ **Sáng tạo**: Áp dụng Design Patterns, có diagrams đẹp
- ✅ **Chuyên nghiệp**: Format chuẩn, có tài liệu tham khảo

**Chúc bạn thành công! 🚀**

