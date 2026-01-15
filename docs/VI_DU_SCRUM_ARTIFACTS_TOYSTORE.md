# VÍ DỤ VỀ CÁC SCRUM ARTIFACTS CHO DỰ ÁN TOYSTORE

---

## TỔNG QUAN NHÓM TOYSTORE

**Thành viên:**
- **Product Owner:** Lê Gia Công (Giảng viên hướng dẫn)
- **Scrum Master:** Nguyễn Huỳnh Tiến Khải
- **Development Team:**
  - Nguyễn Huỳnh Tiến Khải - Backend Developer
  - Lê Tiến Huy - Frontend Store Developer
  - Lê Bình Duy Anh - Frontend Admin Developer

---

## 1. PRODUCT BACKLOG (SẢN PHẨM TỒN ĐỌN CÔNG VIỆC)

> **Quản lý bởi:** Product Owner (Lê Gia Công)
> 
> **Mục đích:** Danh sách ưu tiên tất cả tính năng, yêu cầu cần có trong ToyStore

### Ví dụ Product Backlog của ToyStore (Sprint 1-3):

| ID | User Story | Priority | Story Points | Sprint | Assigned To | Status |
|----|------------|----------|--------------|--------|-------------|--------|
| **MUST HAVE** |
| PB-001 | Là admin, tôi muốn đăng nhập vào hệ thống để quản lý cửa hàng | High | 5 | Sprint 1 | Khải (Backend) | ✅ Done |
| PB-002 | Là khách hàng, tôi muốn đăng ký tài khoản để mua hàng | High | 5 | Sprint 1 | Khải (Backend)<br/>Huy (FE Store) | ✅ Done |
| PB-003 | Là admin, tôi muốn thêm/sửa/xóa sản phẩm | High | 8 | Sprint 1 | Khải (Backend)<br/>Anh (FE Admin) | ✅ Done |
| PB-004 | Là khách hàng, tôi muốn xem danh sách sản phẩm có filter và search | High | 8 | Sprint 2 | Khải (Backend)<br/>Huy (FE Store) | ✅ Done |
| PB-005 | Là khách hàng, tôi muốn thêm sản phẩm vào giỏ hàng | High | 5 | Sprint 3 | Khải (Backend)<br/>Huy (FE Store) | 🔄 In Progress |
| PB-006 | Là khách hàng, tôi muốn checkout và tạo đơn hàng | High | 8 | Sprint 3 | Khải (Backend)<br/>Huy (FE Store) | 📋 To Do |
| PB-007 | Là admin, tôi muốn xem và quản lý đơn hàng | High | 5 | Sprint 3 | Khải (Backend)<br/>Anh (FE Admin) | 📋 To Do |
| **SHOULD HAVE** |
| PB-008 | Là khách hàng, tôi muốn thanh toán qua VNPay | Medium | 8 | Sprint 4 | Khải (Backend)<br/>Huy (FE Store) | 📋 Backlog |
| PB-009 | Là admin, tôi muốn tạo vận đơn GHN tự động | Medium | 8 | Sprint 5 | Khải (Backend)<br/>Anh (FE Admin) | 📋 Backlog |
| PB-010 | Là admin, tôi muốn tạo và quản lý voucher giảm giá | Medium | 5 | Sprint 6 | Khải (Backend)<br/>Anh (FE Admin) | 📋 Backlog |
| PB-011 | Là khách hàng, tôi muốn áp dụng voucher khi checkout | Medium | 3 | Sprint 6 | Khải (Backend)<br/>Huy (FE Store) | 📋 Backlog |
| PB-012 | Là admin, tôi muốn xem dashboard doanh thu theo ngày/tháng | Medium | 5 | Sprint 4 | Khải (Backend)<br/>Anh (FE Admin) | 📋 Backlog |
| **COULD HAVE** |
| PB-013 | Là khách hàng, tôi muốn đánh giá và review sản phẩm | Low | 5 | Sprint 7 | Khải (Backend)<br/>Huy (FE Store) | 📋 Backlog |
| PB-014 | Là admin, tôi muốn quản lý banner trang chủ | Low | 3 | Sprint 7 | Khải (Backend)<br/>Anh (FE Admin) | 📋 Backlog |

**Commitment:** Product Goal = "Website ToyStore đầy đủ chức năng e-commerce, tích hợp VNPay và GHN, sẵn sàng deploy tháng 12/2025"

---

## 2. SPRINT BACKLOG (KẾ HOẠCH SPRINT)

> **Quản lý bởi:** Development Team
> 
> **Mục đích:** Công việc cụ thể cho Sprint hiện tại + Kế hoạch hoàn thành

### Ví dụ Sprint 3 Backlog - "Hoàn thiện flow mua hàng"

**Sprint Goal:** "Khách hàng có thể thêm sản phẩm vào giỏ, checkout và tạo đơn hàng. Admin có thể quản lý đơn hàng."

**Sprint Duration:** 2 tuần (14 ngày)  
**Story Points Committed:** 18 SP

---

#### 📦 User Story: PB-005 - Giỏ hàng (5 SP)

**Tasks - Khải (Backend):**

| Task ID | Mô tả | Estimate | Status | Notes |
|---------|-------|----------|--------|-------|
| SB3-001 | Thiết kế API POST `/api/cart/add` | 2h | ✅ Done | JWT required |
| SB3-002 | Thiết kế API PUT `/api/cart/update/:itemId` | 1h | ✅ Done | Update quantity |
| SB3-003 | Thiết kế API DELETE `/api/cart/remove/:itemId` | 1h | ✅ Done | |
| SB3-004 | Thiết kế API GET `/api/cart` | 1h | ✅ Done | Get user's cart |
| SB3-005 | Logic kiểm tra tồn kho khi add to cart | 3h | 🔄 In Progress | Check stock availability |
| SB3-006 | Unit test cho cart APIs | 2h | 📋 To Do | |

**Tasks - Huy (Frontend Store):**

| Task ID | Mô tả | Estimate | Status | Notes |
|---------|-------|----------|--------|-------|
| SB3-007 | Component: `CartPage.jsx` - UI giỏ hàng | 4h | ✅ Done | Responsive design |
| SB3-008 | Component: `CartItem.jsx` - Item trong giỏ | 2h | ✅ Done | Update quantity, remove |
| SB3-009 | Component: `CartSummary.jsx` - Tổng tiền | 2h | 🔄 In Progress | Calculate total |
| SB3-010 | Integrate cart APIs | 3h | 📋 To Do | API calls, error handling |
| SB3-011 | Animation khi thêm vào giỏ | 1h | 📋 To Do | Toast notification |

---

#### 📦 User Story: PB-006 - Checkout và tạo đơn hàng (8 SP)

**Tasks - Khải (Backend):**

| Task ID | Mô tả | Estimate | Status | Notes |
|---------|-------|----------|--------|-------|
| SB3-012 | API POST `/api/orders/create` | 4h | 📋 To Do | Create order from cart |
| SB3-013 | Logic xử lý tồn kho (giảm stock) | 3h | 📋 To Do | Transaction để avoid race condition |
| SB3-014 | Email xác nhận đơn hàng | 2h | 📋 To Do | Nodemailer |
| SB3-015 | API GET `/api/orders/user/:userId` | 2h | 📋 To Do | Order history |

**Tasks - Huy (Frontend Store):**

| Task ID | Mô tả | Estimate | Status | Notes |
|---------|-------|----------|--------|-------|
| SB3-016 | Page: `CheckoutPage.jsx` - Form thông tin giao hàng | 5h | 📋 To Do | Validation |
| SB3-017 | Component: `OrderSummary.jsx` - Tóm tắt đơn hàng | 2h | 📋 To Do | |
| SB3-018 | Integrate order API | 3h | 📋 To Do | |
| SB3-019 | Page: `OrderSuccessPage.jsx` - Thông báo thành công | 2h | 📋 To Do | |

---

#### 📦 User Story: PB-007 - Admin quản lý đơn hàng (5 SP)

**Tasks - Khải (Backend):**

| Task ID | Mô tả | Estimate | Status | Notes |
|---------|-------|----------|--------|-------|
| SB3-020 | API GET `/api/admin/orders` - Danh sách đơn hàng | 2h | 📋 To Do | Pagination, filter |
| SB3-021 | API PUT `/api/admin/orders/:id/status` | 2h | 📋 To Do | Update order status |
| SB3-022 | API GET `/api/admin/orders/:id` - Chi tiết đơn | 1h | 📋 To Do | |

**Tasks - Anh (Frontend Admin):**

| Task ID | Mô tả | Estimate | Status | Notes |
|---------|-------|----------|--------|-------|
| SB3-023 | Page: `OrderListPage.jsx` - Danh sách đơn hàng | 4h | 📋 To Do | Table with filters |
| SB3-024 | Page: `OrderDetailPage.jsx` - Chi tiết đơn hàng | 3h | 📋 To Do | |
| SB3-025 | Component: `OrderStatusBadge.jsx` | 1h | 📋 To Do | Visual status indicator |
| SB3-026 | Feature: Update order status | 2h | 📋 To Do | Dropdown + API call |

---

**Sprint Backlog Summary:**

| Developer | Total Tasks | Estimated Hours | Status |
|-----------|-------------|-----------------|--------|
| **Khải (Backend)** | 15 tasks | ~35h | 4 Done, 1 In Progress, 10 To Do |
| **Huy (Frontend Store)** | 9 tasks | ~24h | 2 Done, 1 In Progress, 6 To Do |
| **Anh (Frontend Admin)** | 4 tasks | ~10h | 0 Done, 0 In Progress, 4 To Do |
| **Total** | 28 tasks | ~69h | Sprint Progress: 25% |

**Commitment:** Sprint Goal phải đạt được sau 14 ngày

---

## 3. PRODUCT INCREMENT (SẢN PHẨM TĂNG DẦN)

> **Thuộc về:** Cả Development Team
> 
> **Mục đích:** Tổng hợp tất cả công việc Done từ Sprint hiện tại + tất cả Sprint trước

### Ví dụ Increment sau Sprint 3:

**Definition of Done được áp dụng:**
- ✅ Code đã được code review
- ✅ Unit tests pass (coverage ≥ 70%)
- ✅ Integration tests pass
- ✅ Deployed to dev environment
- ✅ Product Owner đã accept

---

#### 🎯 Increment Sprint 1: "Foundation"

**Backend (Khải):**
- ✅ 21 bảng database schema (SQL Server)
- ✅ JWT Authentication & Authorization (3 roles: Admin, Staff, Customer)
- ✅ API: User register, login, logout
- ✅ API: CRUD Products (21 controllers)
- ✅ API: CRUD Categories
- ✅ Middleware: Auth, Error handling, Validation
- ✅ Environment setup (.env, config)

**Frontend Store (Huy):**
- ✅ React project setup với TailwindCSS
- ✅ Component: Header, Footer, Layout
- ✅ Page: Home, Product List
- ✅ Page: Login, Register
- ✅ Component: ProductCard
- ✅ API integration: Auth

**Frontend Admin (Anh):**
- ✅ Admin project setup
- ✅ Layout: Sidebar, Navbar
- ✅ Page: Admin Login
- ✅ Page: Product Management (List, Add, Edit, Delete)
- ✅ API integration: Auth, Products

**Deliverable:** Sản phẩm có thể login, xem danh sách sản phẩm, admin quản lý sản phẩm

---

#### 🎯 Increment Sprint 2: "Product Discovery"

**Backend (Khải):**
- ✅ API: Product search với full-text search
- ✅ API: Filter products (category, brand, price range)
- ✅ API: Product details with images
- ✅ API: Category tree structure
- ✅ Image upload với Cloudinary

**Frontend Store (Huy):**
- ✅ Page: Product Detail với image gallery
- ✅ Component: FilterSidebar
- ✅ Component: SearchBar với autocomplete
- ✅ Component: Breadcrumb navigation
- ✅ Pagination cho product list
- ✅ Responsive design (mobile, tablet, desktop)

**Frontend Admin (Anh):**
- ✅ Page: Category Management
- ✅ Page: Brand Management
- ✅ Feature: Bulk upload products (Excel)
- ✅ Component: Image uploader

**Deliverable:** Khách hàng có thể search, filter, xem chi tiết sản phẩm với đầy đủ thông tin

---

#### 🎯 Increment Sprint 3: "Shopping Flow" (Đang thực hiện)

**Backend (Khải):**
- ✅ API: Shopping cart (add, update, remove, get)
- 🔄 Logic kiểm tra tồn kho
- 📋 API: Create order
- 📋 API: Order management (admin)

**Frontend Store (Huy):**
- ✅ Page: Cart với CartItem components
- 🔄 Component: CartSummary
- 📋 Page: Checkout
- 📋 Page: Order Success

**Frontend Admin (Anh):**
- 📋 Page: Order Management
- 📋 Page: Order Detail
- 📋 Feature: Update order status

**Deliverable (Dự kiến):** End-to-end shopping flow từ browse → cart → checkout → order

---

### So sánh Increment qua các Sprint:

| Sprint | Features Completed | APIs | Pages | Components | Lines of Code | Demo Video |
|--------|-------------------|------|-------|------------|---------------|------------|
| Sprint 1 | Auth + CRUD Products | 15 APIs | 8 pages | 12 components | ~5,000 LOC | ✅ 5 min |
| Sprint 2 | Search + Filter + Detail | 8 APIs | 5 pages | 8 components | ~3,500 LOC | ✅ 7 min |
| Sprint 3 | Cart + Checkout | 10 APIs | 6 pages | 10 components | ~4,000 LOC | 🔄 Pending |
| **Total** | **Auth + Products + Cart** | **33 APIs** | **19 pages** | **30 components** | **~12,500 LOC** | **✅ 20 min** |

---

## 4. VÍ DỤ THỰC TẾ - ARTIFACTS TRONG DAILY SCRUM

### Daily Scrum - Ngày 10/10/2025 (Sprint 3, Day 5)

**Khải (Backend) sử dụng artifacts:**

📋 **Sprint Backlog:**
- Yesterday: ✅ Hoàn thành SB3-005 (Logic tồn kho) - 3h
- Today: 📌 Sẽ bắt đầu SB3-012 (API create order) - 4h
- Blockers: ❌ Không

📊 **Product Backlog:**
- Review PB-008 (VNPay) để chuẩn bị Sprint 4 Planning

---

**Huy (Frontend Store) sử dụng artifacts:**

📋 **Sprint Backlog:**
- Yesterday: ✅ Hoàn thành SB3-009 (CartSummary component) - 2h
- Today: 📌 Sẽ làm SB3-010 (Integrate cart APIs) - 3h
- Blockers: ⚠️ Đợi Khải fix bug API cart/update

📦 **Product Increment:**
- Đã test CartPage trên dev environment, responsive tốt

---

**Anh (Frontend Admin) sử dụng artifacts:**

📋 **Sprint Backlog:**
- Yesterday: ✅ Research về table component tốt nhất cho OrderList
- Today: 📌 Sẽ bắt đầu SB3-023 (OrderListPage) - 4h
- Blockers: ❌ Không

📊 **Product Backlog:**
- Suggest thêm PB-015: Export orders to Excel (cho Sprint sau)

---

## 5. VÍ DỤ - ARTIFACTS TRONG SPRINT REVIEW

### Sprint Review - Sprint 2 (Cuối tháng 9/2025)

**Product Owner (Lê Gia Công) sử dụng:**

📊 **Product Backlog trước Sprint:**
- PB-004: Search & Filter (8 SP) - ✅ Done
- PB-004b: Product Detail (5 SP) - ✅ Done
- PB-004c: Image Gallery (3 SP) - ✅ Done

📦 **Product Increment được demo:**
- ✅ Search products by name
- ✅ Filter by category, brand, price
- ✅ Product detail page với 5 images
- ✅ Breadcrumb navigation
- ✅ Responsive design

**Feedback từ stakeholders:**
- 👍 UI đẹp, tone màu hồng phù hợp target audience (tuổi teen)
- 🔧 Cần thêm "Sort by" (price, newest) → Thêm PB-016 vào Product Backlog
- 🔧 Image gallery cần zoom feature → Refine PB-004c

📊 **Product Backlog sau Sprint (Updated):**
- PB-005: Cart (5 SP) → Move to Sprint 3
- PB-006: Checkout (8 SP) → Move to Sprint 3  
- PB-016: Sort products (NEW - 2 SP) → Sprint 4
- PB-004c: Image zoom (UPDATED - 2 SP) → Sprint 4

---

## TỔNG KẾT

### Vai trò của từng thành viên với Artifacts:

| Thành viên | Product Backlog | Sprint Backlog | Product Increment |
|------------|-----------------|----------------|-------------------|
| **Product Owner (GV Lê Gia Công)** | ✏️ Tạo và ưu tiên<br/>🔄 Update sau Sprint Review | 👀 Xem để hiểu Sprint Goal | ✅ Accept/Reject<br/>🎯 Demo cho stakeholders |
| **Scrum Master (Khải)** | 🤝 Hỗ trợ PO refine<br/>👀 Xem để plan Sprint | 📊 Track progress (Burndown)<br/>🚧 Remove impediments | 👀 Đảm bảo DoD được tuân thủ |
| **Developer (Khải - Backend)** | 💭 Estimate story points<br/>❓ Ask questions | ✏️ Chia nhỏ thành tasks<br/>✅ Complete tasks<br/>🔄 Update daily | 💻 Code APIs<br/>✅ Pass tests<br/>📦 Deploy |
| **Developer (Huy - FE Store)** | 💭 Estimate story points<br/>💡 Suggest technical stories | ✏️ Chia nhỏ thành tasks<br/>✅ Complete tasks<br/>🔄 Update daily | 💻 Code UI/UX<br/>✅ Pass tests<br/>🎨 Design |
| **Developer (Anh - FE Admin)** | 💭 Estimate story points<br/>📋 Add admin-related stories | ✏️ Chia nhỏ thành tasks<br/>✅ Complete tasks<br/>🔄 Update daily | 💻 Code Admin panel<br/>✅ Pass tests<br/>📊 Dashboard |

---

**Nguồn tham khảo:**
- Scrum Guide Official (https://scrumguides.org/)
- Atlassian - Scrum Artifacts (https://www.atlassian.com/agile/scrum/artifacts)
- Mountain Goat Software - User Stories (https://www.mountaingoatsoftware.com/)
