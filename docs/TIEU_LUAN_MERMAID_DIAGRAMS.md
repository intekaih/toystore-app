# MERMAID DIAGRAMS CHO TIỂU LUẬN TOYSTORE

Tài liệu này chứa tất cả các Mermaid diagrams cho tiểu luận. Các diagrams này có thể được xem trực tiếp trong các Markdown viewers hỗ trợ Mermaid (như GitHub, VS Code với extension, hoặc Mermaid Live Editor).

---

## 1. USE CASE DIAGRAM

```mermaid
graph TB
    subgraph Actors
        Customer[("👤 Customer<br/>(Khách hàng)")]
        Admin[("👨‍💼 Admin<br/>(Quản trị viên)")]
        Staff[("👨‍💻 Staff<br/>(Nhân viên)")]
        VNPay[("💳 VNPay System")]
        GHN[("🚚 GHN System")]
    end
    
    subgraph "Authentication & User Management"
        UC1["Đăng ký tài khoản"]
        UC2["Đăng nhập"]
        UC3["Quản lý thông tin cá nhân"]
        UC4["Quản lý địa chỉ giao hàng"]
    end
    
    subgraph "Product Management"
        UC5["Xem danh sách sản phẩm"]
        UC6["Tìm kiếm sản phẩm"]
        UC7["Lọc và sắp xếp sản phẩm"]
        UC8["Xem chi tiết sản phẩm"]
        UC9["Đánh giá sản phẩm"]
        UC10["Quản lý sản phẩm (CRUD)"]
    end
    
    subgraph "Shopping Cart"
        UC11["Thêm vào giỏ hàng"]
        UC12["Xem giỏ hàng"]
        UC13["Cập nhật giỏ hàng"]
    end
    
    subgraph "Order Management"
        UC14["Đặt hàng"]
        UC15["Áp dụng voucher"]
        UC16["Thanh toán"]
        UC17["Xem lịch sử đơn hàng"]
        UC18["Hủy đơn hàng"]
        UC19["Quản lý đơn hàng"]
        UC20["Tạo đơn vận chuyển"]
    end
    
    subgraph "Admin Functions"
        UC21["Quản lý người dùng"]
        UC22["Quản lý voucher"]
        UC23["Xem thống kê"]
        UC24["Quản lý danh mục & thương hiệu"]
    end
    
    %% Customer connections
    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4
    Customer --> UC5
    Customer --> UC6
    Customer --> UC7
    Customer --> UC8
    Customer --> UC9
    Customer --> UC11
    Customer --> UC12
    Customer --> UC13
    Customer --> UC14
    Customer --> UC15
    Customer --> UC17
    Customer --> UC18
    
    %% Admin connections
    Admin --> UC2
    Admin --> UC10
    Admin --> UC19
    Admin --> UC20
    Admin --> UC21
    Admin --> UC22
    Admin --> UC23
    Admin --> UC24
    
    %% Staff connections
    Staff --> UC2
    Staff --> UC19
    Staff --> UC20
    
    %% Include relationships
    UC14 -.->|include| UC16
    UC16 -.->|include| VNPay
    UC20 -.->|include| GHN
    
    %% Extend relationships
    UC14 -.->|extend| UC15
    UC5 -.->|extend| UC7
    
    style Customer fill:#e1f5ff
    style Admin fill:#ffe1e1
    style Staff fill:#fff4e1
    style VNPay fill:#e1ffe1
    style GHN fill:#e1ffe1
```

---

## 2. CLASS DIAGRAM - MODELS

```mermaid
classDiagram
    class TaiKhoan {
        +int MaTK
        +string TenDangNhap
        +string Email
        +string MatKhau
        +string VaiTro
        +string TrangThai
        +DateTime NgayTao
        +hashPassword()
        +verifyPassword()
        +generateToken()
    }
    
    class KhachHang {
        +int MaKH
        +int TaiKhoanID
        +string HoTen
        +string SoDienThoai
        +DateTime NgaySinh
        +string GioiTinh
    }
    
    class SanPham {
        +int MaSP
        +string TenSP
        +string MoTa
        +decimal Gia
        +int SoLuongTonKho
        +int LoaiID
        +int ThuongHieuID
        +string HinhAnh
        +string TrangThai
    }
    
    class LoaiSP {
        +int MaLoai
        +string TenLoai
        +string MoTa
    }
    
    class ThuongHieu {
        +int MaThuongHieu
        +string TenThuongHieu
        +string MoTa
    }
    
    class GioHang {
        +int MaGioHang
        +int TaiKhoanID
        +DateTime NgayTao
    }
    
    class GioHangChiTiet {
        +int MaGioHangChiTiet
        +int GioHangID
        +int SanPhamID
        +int SoLuong
    }
    
    class HoaDon {
        +int MaHD
        +int KhachHangID
        +decimal TongTien
        +decimal TienGoc
        +decimal TienVAT
        +decimal TienGiamGia
        +decimal PhiVanChuyen
        +string TrangThai
        +DateTime NgayDat
    }
    
    class ChiTietHoaDon {
        +int MaCTHD
        +int HoaDonID
        +int SanPhamID
        +int SoLuong
        +decimal DonGia
        +decimal ThanhTien
    }
    
    class Voucher {
        +int MaVoucher
        +string Code
        +string LoaiGiamGia
        +decimal GiaTriGiam
        +int SoLuong
        +DateTime NgayBatDau
        +DateTime NgayKetThuc
    }
    
    class DiaChiGiaoHang {
        +int MaDCGH
        +int HoaDonID
        +string TenNguoiNhan
        +string SoDienThoai
        +string DiaChiChiTiet
        +string TinhThanhPho
    }
    
    TaiKhoan "1" -- "1" KhachHang : has
    KhachHang "1" -- "0..*" HoaDon : places
    TaiKhoan "1" -- "1" GioHang : has
    GioHang "1" -- "0..*" GioHangChiTiet : contains
    SanPham "1" -- "0..*" GioHangChiTiet : in
    SanPham "1" -- "0..*" ChiTietHoaDon : in
    HoaDon "1" -- "0..*" ChiTietHoaDon : contains
    HoaDon "1" -- "1" DiaChiGiaoHang : has
    HoaDon "0..*" -- "0..1" Voucher : uses
    LoaiSP "1" -- "0..*" SanPham : categorizes
    ThuongHieu "1" -- "0..*" SanPham : brands
```

---

## 3. CLASS DIAGRAM - DESIGN PATTERNS

```mermaid
classDiagram
    %% Decorator Pattern
    class OrderPriceCalculator {
        -items[]
        +calculate() decimal
        +getDetails() object
    }
    
    class OrderPriceDecorator {
        <<abstract>>
        -calculator
        +calculate()* decimal
        +getDetails()* object
    }
    
    class VATDecorator {
        -vatRate
        +calculate() decimal
        +getDetails() object
    }
    
    class VoucherDecorator {
        -voucher
        +calculate() decimal
        +getDetails() object
    }
    
    class ShippingDecorator {
        -shippingFee
        -freeShippingThreshold
        +calculate() decimal
        +getDetails() object
    }
    
    OrderPriceDecorator <|-- VATDecorator
    OrderPriceDecorator <|-- VoucherDecorator
    OrderPriceDecorator <|-- ShippingDecorator
    OrderPriceDecorator o-- OrderPriceCalculator
    
    %% Strategy Pattern
    class ProductFilterStrategy {
        <<interface>>
        +filter(products, query)* array
        +filterByPriceRange(products, min, max) array
        +filterByCategory(products, categoryId) array
    }
    
    class NewestStrategy {
        +filter(products, query) array
    }
    
    class PriceAscendingStrategy {
        +filter(products, query) array
    }
    
    class PriceDescendingStrategy {
        +filter(products, query) array
    }
    
    class BestSellerStrategy {
        +filter(products, query) array
    }
    
    class FilterContext {
        -strategies map
        +applyFilter(products, filterType, query) array
        +getStrategy(filterType) Strategy
        +getAvailableFilters() array
    }
    
    ProductFilterStrategy <|.. NewestStrategy
    ProductFilterStrategy <|.. PriceAscendingStrategy
    ProductFilterStrategy <|.. PriceDescendingStrategy
    ProductFilterStrategy <|.. BestSellerStrategy
    FilterContext o-- ProductFilterStrategy
    
    %% Singleton Pattern
    class DBConnection {
        <<singleton>>
        -instance$ DBConnection
        -sequelize
        -constructor()
        +getInstance()$ DBConnection
        +getSequelize() Sequelize
        +connect() void
        +close() void
    }
    
    class Logger {
        <<singleton>>
        -instance$ Logger
        -constructor()
        +getInstance()$ Logger
        +log(level, message) void
        +info(message) void
        +error(message) void
    }
    
    class ConfigService {
        <<singleton>>
        -instance$ ConfigService
        -config
        -constructor()
        +getInstance()$ ConfigService
        +getValue(section, key) any
        +loadConfig() void
    }
```

---

## 4. SEQUENCE DIAGRAM - LUỒNG ĐẶT HÀNG

```mermaid
sequenceDiagram
    actor User as 👤 User
    participant FE as Frontend
    participant OC as OrderController
    participant OS as OrderService
    participant Calc as PriceCalculator
    participant VAT as VATDecorator
    participant Voucher as VoucherDecorator
    participant Ship as ShippingDecorator
    participant PS as PaymentService
    participant VNPay as 💳 VNPay
    participant DB as 💾 Database
    
    User->>FE: Nhấn "Đặt hàng"
    FE->>OC: POST /api/orders/create
    activate OC
    
    OC->>OS: createOrder(userId, address, voucher)
    activate OS
    
    OS->>DB: getCart(userId)
    DB-->>OS: cart with items
    
    OS->>OS: Kiểm tra tồn kho
    
    OS->>Calc: new OrderPriceCalculator(items)
    activate Calc
    Calc-->>OS: calculator
    deactivate Calc
    
    OS->>VAT: new VATDecorator(calculator, 0.1)
    activate VAT
    VAT-->>OS: vatCalculator
    deactivate VAT
    
    alt Có voucher
        OS->>Voucher: new VoucherDecorator(calculator, voucher)
        activate Voucher
        Voucher-->>OS: voucherCalculator
        deactivate Voucher
    end
    
    OS->>Ship: new ShippingDecorator(calculator, fee, 500000)
    activate Ship
    Ship-->>OS: finalCalculator
    deactivate Ship
    
    OS->>Ship: calculate()
    Ship-->>OS: tongTien
    
    OS->>Ship: getDetails()
    Ship-->>OS: breakdown
    
    OS->>DB: Tạo HoaDon
    DB-->>OS: created order
    
    OS->>DB: Tạo ChiTietHoaDon
    OS->>DB: Tạo DiaChiGiaoHang
    
    OS->>PS: createVNPayUrl(orderId, tongTien)
    activate PS
    PS->>PS: Tạo tham số VNPay
    PS->>PS: Tạo chữ ký
    PS-->>OS: paymentUrl
    deactivate PS
    
    OS-->>OC: order + paymentUrl
    deactivate OS
    
    OC-->>FE: Response
    deactivate OC
    
    FE->>VNPay: Redirect to paymentUrl
    User->>VNPay: Thực hiện thanh toán
    
    VNPay->>VNPay: Xử lý giao dịch
    VNPay->>FE: Redirect with result
    
    FE->>PS: handleReturn(params)
    activate PS
    PS->>PS: Xác thực chữ ký
    
    alt Thanh toán thành công
        PS->>DB: Cập nhật TrangThaiThanhToan
        PS->>DB: Trừ tồn kho
        PS->>DB: Xóa giỏ hàng
        PS-->>FE: Success
    else Thanh toán thất bại
        PS-->>FE: Error
    end
    deactivate PS
    
    FE->>User: Hiển thị kết quả
```

---

## 5. SEQUENCE DIAGRAM - LUỒNG LỌC SẢN PHẨM

```mermaid
sequenceDiagram
    actor User as 👤 User
    participant FE as Frontend
    participant PC as ProductController
    participant FC as FilterContext
    participant Strategy as PriceAscStrategy
    participant DB as 💾 Database
    
    User->>FE: Chọn "Giá tăng dần"
    FE->>PC: GET /api/products?filter=priceAsc
    activate PC
    
    PC->>PC: Parse query params
    PC->>DB: Query products with includes
    activate DB
    DB-->>PC: products array
    deactivate DB
    
    PC->>PC: Convert to plain objects
    
    PC->>FC: applyFilter(products, "priceAsc", params)
    activate FC
    
    FC->>FC: getStrategy("priceAsc")
    FC->>Strategy: Lấy PriceAscendingStrategy
    
    FC->>Strategy: filter(products, params)
    activate Strategy
    
    Strategy->>Strategy: Clone products array
    Strategy->>Strategy: filterByPriceRange(min, max)
    Strategy->>Strategy: filterByCategory(categoryId)
    Strategy->>Strategy: Sort by Gia ascending
    
    Strategy-->>FC: filtered products
    deactivate Strategy
    
    FC-->>PC: filtered products
    deactivate FC
    
    PC->>PC: Áp dụng pagination
    PC->>PC: Format response
    
    PC-->>FE: JSON response
    deactivate PC
    
    FE->>FE: Update state
    FE->>FE: Re-render ProductList
    FE->>User: Hiển thị sản phẩm đã sắp xếp
```

---

## 6. ACTIVITY DIAGRAM - QUY TRÌNH ĐẶT HÀNG

```mermaid
flowchart TD
    Start([Bắt đầu]) --> Browse[Duyệt sản phẩm]
    Browse --> AddCart[Thêm vào giỏ hàng]
    AddCart --> ViewCart[Xem giỏ hàng]
    ViewCart --> Decision1{Có muốn<br/>đặt hàng?}
    
    Decision1 -->|Không| End([Kết thúc])
    Decision1 -->|Có| Checkout[Nhấn Đặt hàng]
    
    Checkout --> EnterAddress[Nhập địa chỉ giao hàng]
    EnterAddress --> Decision2{Có mã<br/>voucher?}
    
    Decision2 -->|Có| EnterVoucher[Nhập mã voucher]
    EnterVoucher --> ValidateVoucher{Voucher<br/>hợp lệ?}
    ValidateVoucher -->|Không| ShowError1[Hiển thị lỗi]
    ShowError1 --> Decision2
    ValidateVoucher -->|Có| ApplyVoucher[Áp dụng voucher]
    ApplyVoucher --> CalcPrice
    
    Decision2 -->|Không| CalcPrice[Tính giá đơn hàng<br/>Decorator Pattern]
    
    CalcPrice --> ShowBreakdown[Hiển thị chi tiết giá]
    ShowBreakdown --> Confirm[Xác nhận thanh toán]
    
    Confirm --> CreateOrder[Tạo đơn hàng trong DB]
    CreateOrder --> SaveDetails[Lưu chi tiết đơn hàng]
    SaveDetails --> CreatePaymentURL[Tạo URL thanh toán VNPay]
    CreatePaymentURL --> RedirectVNPay[Chuyển hướng đến VNPay]
    
    RedirectVNPay --> UserPay[Người dùng thanh toán]
    UserPay --> VNPayProcess[VNPay xử lý giao dịch]
    
    VNPayProcess --> Decision3{Thanh toán<br/>thành công?}
    
    Decision3 -->|Không| PaymentFailed[Chuyển về với lỗi]
    PaymentFailed --> ShowError2[Hiển thị thông báo lỗi]
    ShowError2 --> Decision4{Thử lại?}
    Decision4 -->|Có| RedirectVNPay
    Decision4 -->|Không| End
    
    Decision3 -->|Có| ReturnSuccess[Chuyển về với kết quả]
    ReturnSuccess --> VerifySignature[Xác thực chữ ký VNPay]
    VerifySignature --> UpdatePayment[Cập nhật trạng thái thanh toán]
    UpdatePayment --> UpdateStock[Trừ tồn kho]
    UpdateStock --> ClearCart[Xóa giỏ hàng]
    ClearCart --> SendEmail[Gửi email xác nhận]
    SendEmail --> ShowSuccess[Hiển thị trang thành công]
    ShowSuccess --> End
    
    style Start fill:#e1f5ff
    style End fill:#e1f5ff
    style Decision1 fill:#fff4e1
    style Decision2 fill:#fff4e1
    style Decision3 fill:#fff4e1
    style Decision4 fill:#fff4e1
    style CalcPrice fill:#e1ffe1
    style VNPayProcess fill:#ffe1e1
```

---

## 7. COMPONENT DIAGRAM

```mermaid
graph TB
    subgraph "Frontend - Presentation Layer"
        React[React Application]
        Pages[Pages Components]
        Components[Reusable Components]
        Context[Context API]
        Services[API Services]
        
        React --> Pages
        React --> Components
        React --> Context
        React --> Services
    end
    
    subgraph "Backend - API Layer"
        Express[Express Server]
        Routes[Routes]
        Middlewares[Middlewares]
        
        Express --> Routes
        Express --> Middlewares
    end
    
    subgraph "Backend - Business Logic"
        Controllers[Controllers]
        ServicesB[Services]
        Decorators[Decorators]
        Strategies[Strategies]
        Singletons[Singletons]
        
        Routes --> Controllers
        Controllers --> ServicesB
        ServicesB --> Decorators
        ServicesB --> Strategies
        ServicesB --> Singletons
    end
    
    subgraph "Backend - Data Access"
        Models[Sequelize Models]
        ORM[Sequelize ORM]
        Pool[Connection Pool]
        
        ServicesB --> Models
        Models --> ORM
        ORM --> Pool
    end
    
    subgraph "Database"
        SQLDB[(SQL Server<br/>21 Tables)]
        Pool --> SQLDB
    end
    
    subgraph "External Services"
        VNPay[VNPay API]
        GHN[GHN API]
        Email[Email Service]
        
        ServicesB --> VNPay
        ServicesB --> GHN
        ServicesB --> Email
    end
    
    Services -.HTTP/JSON.-> Routes
    
    style React fill:#61dafb
    style Express fill:#90c53f
    style SQLDB fill:#cc2927
    style VNPay fill:#0066cc
    style GHN fill:#ff6600
```

---

## 8. ERD DIAGRAM (Simplified)

```mermaid
erDiagram
    TAIKHOAN ||--|| KHACHHANG : "has"
    TAIKHOAN ||--|| GIOHANG : "has"
    TAIKHOAN ||--o{ DIACHIGIAOHANUSER : "has many"
    TAIKHOAN ||--o{ DANHGIASANPHAM : "writes"
    
    KHACHHANG ||--o{ HOADON : "places"
    
    LOAISP ||--o{ SANPHAM : "categorizes"
    THUONGHIEU ||--o{ SANPHAM : "brands"
    
    SANPHAM ||--o{ GIOHANGCHITIET : "in cart"
    SANPHAM ||--o{ CHITIETHOADON : "in order"
    SANPHAM ||--o{ SANPHAMHINHANH : "has images"
    SANPHAM ||--o{ DANHGIASANPHAM : "has reviews"
    
    GIOHANG ||--o{ GIOHANGCHITIET : "contains"
    
    HOADON ||--o{ CHITIETHOADON : "contains"
    HOADON ||--|| DIACHIGIAOANG : "has"
    HOADON ||--o| THONGTINVANCHUYEN : "has"
    HOADON }o--o| VOUCHER : "uses"
    
    VOUCHER ||--o{ LICHSUSUDUNGVOUCHER : "tracks"
    HOADON ||--o{ LICHSUSUDUNGVOUCHER : "records"
    TAIKHOAN ||--o{ LICHSUSUDUNGVOUCHER : "used by"
    
    TAIKHOAN {
        int MaTK PK
        string Email UK
        string MatKhau
        string VaiTro
        datetime NgayTao
    }
    
    KHACHHANG {
        int MaKH PK
        int TaiKhoanID FK
        string HoTen
        string SoDienThoai
    }
    
    SANPHAM {
        int MaSP PK
        string TenSP
        decimal Gia
        int SoLuongTonKho
        int LoaiID FK
        int ThuongHieuID FK
    }
    
    HOADON {
        int MaHD PK
        int KhachHangID FK
        decimal TongTien
        decimal TienGoc
        decimal TienVAT
        decimal TienGiamGia
        decimal PhiVanChuyen
        string TrangThai
        datetime NgayDat
    }
    
    VOUCHER {
        int MaVoucher PK
        string Code UK
        string LoaiGiamGia
        decimal GiaTriGiam
        datetime NgayBatDau
        datetime NgayKetThuc
    }
```

---

## 9. ARCHITECTURE DIAGRAM - 3-TIER

```mermaid
graph TB
    subgraph "Presentation Tier"
        Browser[Web Browser]
        ReactApp[React Application<br/>- Pages<br/>- Components<br/>- State Management]
    end
    
    subgraph "Business Logic Tier"
        API[Express.js API Server]
        Auth[Authentication<br/>JWT Middleware]
        Controllers[Controllers Layer]
        Services[Services Layer<br/>- OrderService<br/>- PaymentService<br/>- GHNService]
        Patterns[Design Patterns<br/>- Decorators<br/>- Strategies<br/>- Singletons]
    end
    
    subgraph "Data Tier"
        ORM[Sequelize ORM]
        Models[Models<br/>21 Tables]
        DB[(SQL Server<br/>Database)]
    end
    
    subgraph "External Systems"
        VNPay[VNPay<br/>Payment Gateway]
        GHN[GHN<br/>Shipping Service]
    end
    
    Browser -->|HTTP/HTTPS| ReactApp
    ReactApp -->|REST API<br/>JSON| API
    API --> Auth
    Auth --> Controllers
    Controllers --> Services
    Services --> Patterns
    Services --> ORM
    ORM --> Models
    Models --> DB
    
    Services -.->|HTTPS| VNPay
    Services -.->|HTTPS| GHN
    
    style Browser fill:#e1f5ff
    style ReactApp fill:#61dafb
    style API fill:#90c53f
    style DB fill:#cc2927
    style VNPay fill:#0066cc
    style GHN fill:#ff6600
```

---

## HƯỚNG DẪN SỬ DỤNG

### Xem diagrams:
1. **GitHub:** Upload file này lên GitHub, diagrams sẽ tự động render
2. **VS Code:** Cài extension "Markdown Preview Mermaid Support"
3. **Mermaid Live Editor:** Copy code vào https://mermaid.live/
4. **Obsidian:** Hỗ trợ Mermaid native

### Export diagrams:
1. Sử dụng Mermaid Live Editor để export PNG/SVG
2. Sử dụng Mermaid CLI: `mmdc -i input.mmd -o output.png`
3. Screenshot từ preview

### Chỉnh sửa:
- Thay đổi text trong các node
- Thêm/bớt relationships
- Điều chỉnh màu sắc với `style` directive
- Thay đổi hướng graph: `TB` (top-bottom), `LR` (left-right)

---

**Lưu ý:** Một số diagram phức tạp (như Class Diagram đầy đủ) có thể cần chia nhỏ hoặc đơn giản hóa để Mermaid render tốt. Nếu cần diagrams chi tiết hơn, nên sử dụng PlantUML hoặc Draw.io.
