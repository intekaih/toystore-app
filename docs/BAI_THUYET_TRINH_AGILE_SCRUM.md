# ÁP DỤNG AGILE/SCRUM CHO DỰ ÁN TOYSTORE

## ĐỀ CƯƠNG BÀI THUYẾT TRÌNH (MAX 30 SLIDES)

---

### **PHẦN 1: LÝ THUYẾT CƠ BẢN (5 slides - 2 điểm)**

#### **Slide 1: Tiêu đề**
- Tên bài: ÁP DỤNG AGILE/SCRUM TRONG QUẢN LÝ DỰ ÁN TOYSTORE
- Nhóm thực hiện:
  - Nguyễn Huỳnh Tiến Khải - PM & Backend Developer
  - Lê Tiến Huy - Frontend Store Developer  
  - Lê Bình Duy Anh - Frontend Admin Developer
- GVHD: Lê Gia Công

#### **Slide 2: Agile & Scrum là gì?**

**Agile:**
- Triết lý quản lý dự án linh hoạt
- Phát triển lặp đi lặp lại (iterative)
- Thích ứng nhanh với thay đổi
- Tập trung vào giá trị khách hàng

**Scrum:**
- Framework cụ thể trong Agile
- Chia dự án thành các Sprint (1-4 tuần)
- Cấu trúc: Roles + Ceremonies + Artifacts
- Phù hợp phát triển phần mềm

#### **Slide 3: So sánh với Waterfall**

| Tiêu chí | Waterfall | Agile/Scrum |
|----------|-----------|-------------|
| Tiếp cận | Tuyến tính | Lặp lại |
| Yêu cầu | Cố định từ đầu | Linh hoạt |
| Giao sản phẩm | Một lần cuối | Sau mỗi Sprint |
| Khách hàng | Ít tương tác | Liên tục |
| Phù hợp | Yêu cầu rõ ràng | Yêu cầu thay đổi |

**→ ToyStore chọn Scrum vì:**
- Yêu cầu thay đổi theo xu hướng Market
- Cần feedback nhanh về UI/UX
- Phối hợp 3 developers hiệu quả

#### **Slide 4: Thành phần Scrum**

**3 Roles:**
- Product Owner → Giảng viên hướng dẫn
- Scrum Master → Khải (PM)
- Development Team → Khải, Huy, Anh

**3 Artifacts:**
- Product Backlog → Danh sách tính năng
- Sprint Backlog → Công việc từng Sprint
- Increment → Sản phẩm sau mỗi Sprint

**5 Ceremonies:**
- Sprint Planning → Lập kế hoạch Sprint
- Daily Scrum → Họp hàng ngày
- Sprint Review → Demo sản phẩm
- Sprint Retrospective → Cải tiến
- Backlog Refinement → Tinh chỉnh backlog

#### **Slide 5: Quy trình Scrum**

```
Product Backlog
      ↓
Sprint Planning (2-4 tiếng)
      ↓
Sprint 2 tuần
  ├─ Daily Scrum (15 phút/ngày)
  ├─ Development
  └─ Testing
      ↓
Sprint Review (1-2 giờ)
      ↓
Sprint Retrospective (1 giờ)
      ↓
[Lặp lại Sprint mới]
```

---

### **PHẦN 2: ÁP DỤNG VÀO DỰ ÁN TOYSTORE (25 slides - 8 điểm)**

#### **Slide 6: Tổng quan dự án ToyStore**

**Thông tin dự án:**
- Tên: ToyStore - Website bán đồ chơi trực tuyến
- Đối tượng: Khách hàng tuổi teen
- Thời gian: 08/2025 - 12/2025 (5 tháng)
- Stack: React + Node.js + SQL Server

**Mục tiêu:**
- Website thương mại điện tử hoàn chỉnh
- Tích hợp VNPay, GHN
- Hệ thống quản lý voucher
- Responsive, UI/UX hiện đại

#### **Slide 7: Tại sao chọn Agile/Scrum?**

**Lý do:**
1. **Thị trường động:** Xu hướng đồ chơi teen thay đổi nhanh theo mạng xã hội
2. **Feedback liên tục:** Cần test UI/UX với khách hàng mục tiêu sớm
3. **Nhóm nhỏ:** 3 developers, phù hợp với team size của Scrum (3-9 người)
4. **Tích hợp phức tạp:** VNPay, GHN API cần test và điều chỉnh liên tục
5. **Thời gian hạn chế:** 5 tháng cần quản lý tiến độ chặt chẽ

**Thay vì Waterfall:**
- Không thể định nghĩa hết yêu cầu từ đầu
- UI/UX cần thử nghiệm và điều chỉnh nhiều lần
- Rủi ro cao nếu giao sản phẩm một lần cuối

#### **Slide 8: Phân chia vai trò Scrum**

**Product Owner:**
- Lê Gia Công (Giảng viên hướng dẫn)
- Xác định tầm nhìn sản phẩm
- Ưu tiên Product Backlog
- Review và chấp nhận Sprint Increment

**Scrum Master:**
- Nguyễn Huỳnh Tiến Khải (PM)
- Tổ chức các buổi họp Scrum
- Loại bỏ trở ngại cho nhóm
- Đảm bảo quy trình Scrum được tuân thủ
- Hỗ trợ phối hợp giữa Backend và Frontend

**Development Team:**
- Nguyễn Huỳnh Tiến Khải - Backend (API, Database, Integration)
- Lê Tiến Huy - Frontend Store (Customer UI)
- Lê Bình Duy Anh - Frontend Admin (Admin Panel)

**Đặc điểm team:**
- Cross-functional: Đủ kỹ năng BE/FE
- Self-organizing: Tự quyết định cách làm việc
- Size: 3 người (trong range 3-9 của Scrum)

#### **Slide 9: Product Backlog - Tổng quan**

**Product Backlog của ToyStore:**

**Epic 1: Hệ thống Backend API**
- User Story: Quản lý sản phẩm (CRUD)
- User Story: Quản lý đơn hàng
- User Story: Hệ thống authentication (JWT)
- User Story: Tích hợp VNPay
- User Story: Tích hợp GHN
- User Story: Quản lý voucher
- User Story: Thống kê doanh thu

**Epic 2: Frontend Store (Khách hàng)**
- User Story: Trang chủ + Catalog
- User Story: Chi tiết sản phẩm
- User Story: Giỏ hàng
- User Story: Checkout + Thanh toán
- User Story: Quản lý tài khoản
- User Story: Lịch sử đơn hàng
- User Story: Đánh giá sản phẩm

**Epic 3: Frontend Admin**
- User Story: Dashboard thống kê
- User Story: Quản lý sản phẩm
- User Story: Quản lý đơn hàng
- User Story: Quản lý voucher
- User Story: Quản lý banner

#### **Slide 10: Product Backlog - Ưu tiên**

**Cách ưu tiên (MoSCoW):**

**Must Have (Priority: High):**
1. Hệ thống Auth + Phân quyền
2. CRUD Sản phẩm (Backend + Frontend)
3. Giỏ hàng + Checkout cơ bản
4. Quản lý đơn hàng
5. Database schema

**Should Have (Priority: Medium):**
6. Tích hợp VNPay
7. Tích hợp GHN
8. Hệ thống voucher
9. Đánh giá sản phẩm
10. Dashboard thống kê

**Could Have (Priority: Low):**
11. Quản lý banner
12. UI polish + animations
13. Filter/Search nâng cao
14. Wishlist

**Won't Have (Out of scope):**
- Mobile app
- Chat trực tuyến
- Multiple payment gateways

#### **Slide 11: Sprint Planning - Ví dụ Sprint 1**

**Sprint 1 (Tuần 1-2, Tháng 9/2025)**
**Sprint Goal:** "Xây dựng nền tảng cơ bản - Database, Auth, và CRUD sản phẩm"

**Sprint Planning Meeting:**
- **Thời lượng:** 4 giờ (Sprint 2 tuần)
- **WHY:** Tạo nền móng vững chắc cho các tính năng sau
- **WHAT:** Chọn 8 User Stories từ Product Backlog
- **HOW:** Phân chia tasks cụ thể

**Sprint Backlog:**

**Backend (Khải):**
- [ ] Setup project structure (Express + SQL Server)
- [ ] Thiết kế database schema (21 bảng)
- [ ] Implement Authentication (JWT)
- [ ] API: Đăng ký/Đăng nhập
- [ ] API: CRUD Sản phẩm
- [ ] API: CRUD Danh mục
- [ ] Middleware phân quyền

**Frontend Store (Huy):**
- [ ] Setup React project + TailwindCSS
- [ ] Component: Header, Footer
- [ ] Trang: Đăng nhập/Đăng ký
- [ ] Trang: Home + Product List
- [ ] Component: ProductCard
- [ ] API integration: Auth

**Frontend Admin (Anh):**
- [ ] Setup Admin project
- [ ] Layout: Sidebar + Navbar
- [ ] Trang: Login
- [ ] Trang: Danh sách sản phẩm
- [ ] API integration: Auth

**Definition of Done:**
- Code review hoàn thành
- Unit test coverage ≥ 70%
- API documentation updated
- No critical bugs
- Deployed to dev environment

#### **Slide 12: Sprint Planning - Ví dụ Sprint 3**

**Sprint 3 (Tuần 5-6, Tháng 10/2025)**
**Sprint Goal:** "Hoàn thiện flow mua hàng - Giỏ hàng, Checkout, và Quản lý đơn"

**Sprint Backlog:**

**Backend (Khải):**
- [ ] API: Thêm/Xóa/Cập nhật giỏ hàng
- [ ] API: Tạo đơn hàng
- [ ] API: Quản lý đơn hàng (Admin)
- [ ] API: Cập nhật trạng thái đơn
- [ ] Logic xử lý tồn kho
- [ ] Transaction handling cho checkout

**Frontend Store (Huy):**
- [ ] Trang: Giỏ hàng (Cart)
- [ ] Trang: Checkout
- [ ] Component: CartItem
- [ ] Component: OrderSummary
- [ ] Validation thông tin giao hàng
- [ ] Flow thanh toán (chưa tích hợp VNPay)

**Frontend Admin (Anh):**
- [ ] Trang: Danh sách đơn hàng
- [ ] Trang: Chi tiết đơn hàng
- [ ] Component: OrderStatus update
- [ ] Filter đơn hàng theo trạng thái

**Estimation:**
- Total Story Points: 21
- Team Velocity: ~18-20 SP/Sprint
- Risk: Medium (phụ thuộc logic phức tạp)

#### **Slide 13: Daily Scrum - Quy trình**

**Thông tin:**
- **Thời gian:** 15 phút mỗi sáng, 9:00 AM
- **Địa điểm:** Google Meet hoặc offline
- **Người tham gia:** Khải, Huy, Anh (3 dev team)

**Format (3 câu hỏi):**

**Khải (Backend):**
1. **Yesterday:** Hoàn thành API tạo đơn hàng, fix bug validation voucher
2. **Today:** Implement logic tính phí ship với GHN API
3. **Blockers:** Cần test account GHN sandbox

**Huy (Frontend Store):**
1. **Yesterday:** Hoàn thiện UI giỏ hàng, thêm animation
2. **Today:** Tích hợp API đơn hàng, test flow checkout
3. **Blockers:** Đợi API phí ship từ Khải

**Anh (Frontend Admin):**
1. **Yesterday:** Tạo trang quản lý voucher, CRUD form
2. **Today:** Implement filter và search voucher
3. **Blockers:** None

**Scrum Master (Khải) notes:**
- Action: Cung cấp GHN test account cho team
- Action: Review API phí ship trước 2PM để Huy integrate

#### **Slide 14: Daily Scrum - Công cụ**

**Công cụ sử dụng:**

**1. Kanban Board (Trello/Jira):**
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   TO DO     │ IN PROGRESS │   REVIEW    │    DONE     │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ Task 1      │ Task 4      │ Task 7      │ Task 10     │
│ Task 2      │ Task 5      │ Task 8      │ Task 11     │
│ Task 3      │ Task 6      │             │ Task 12     │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**2. Burndown Chart:**
- Theo dõi Story Points còn lại mỗi ngày
- Dự đoán liệu Sprint có hoàn thành đúng hạn

**3. Git Commit Activity:**
- Review commits hàng ngày
- Đảm bảo progress thực tế

**4. Shared Document:**
- Google Docs: Meeting notes, blockers
- Slack: Quick updates, questions

#### **Slide 15: Sprint Review - Demo Sprint 4**

**Sprint 4 Review (Cuối tuần 8, Tháng 11/2025)**
**Sprint Goal đã đạt:** "Tích hợp VNPay và hoàn thiện flow thanh toán"

**Người tham gia:**
- Development Team: Khải, Huy, Anh
- Product Owner: Giảng viên Lê Gia Công
- Stakeholders: (Nếu có) Đại diện cửa hàng đồ chơi

**Demo Increment:**

**1. Khải demo Backend:**
- ✅ API tạo payment URL VNPay
- ✅ API xử lý VNPay callback (IPN)
- ✅ API verify transaction
- ✅ Update order status sau thanh toán

**2. Huy demo Frontend Store:**
- ✅ Flow thanh toán VNPay từ checkout
- ✅ Trang payment processing
- ✅ Trang payment success/failure
- ✅ Email xác nhận đơn hàng

**3. Anh demo Frontend Admin:**
- ✅ Dashboard hiển thị doanh thu theo ngày
- ✅ Filter đơn hàng đã thanh toán
- ✅ Export báo cáo Excel

**Feedback từ Product Owner:**
- 👍 Flow thanh toán mượt mà
- 🔧 Cần thêm loading state khi chờ VNPay
- 🔧 Email template cần professional hơn
- 📝 Thêm vào Sprint 5 Backlog

**Outcome:**
- Demo success: 90% hoàn thành Sprint Goal
- 1 User Story chưa done (Email template) → move to Sprint 5

#### **Slide 16: Sprint Retrospective - Ví dụ Sprint 4**

**Retrospective Meeting (1 giờ sau Sprint Review)**

**Format: Start-Stop-Continue**

**✅ START (Bắt đầu làm):**
- Viết unit test trước khi code (TDD)
- Tăng code review comments (hiện tại quá ít)
- Daily standup lúc 9AM đúng giờ (không trễ)

**❌ STOP (Ngừng làm):**
- Commit code lúc nửa đêm không có description
- Skip code review vì "gấp"
- Hardcode config (cần dùng .env)

**🔄 CONTINUE (Tiếp tục):**
- Pair programming cho features phức tạp
- Share knowledge qua mini tech talks
- Dùng Git branch strategy (feature branches)

**Vấn đề chính và giải pháp:**

**❗ Vấn đề 1:** VNPay sandbox API hay timeout → delay 2 ngày
**Giải pháp:** Mock VNPay response cho development, chỉ test thật trước demo

**❗ Vấn đề 2:** Frontend và Backend không sync về data format
**Giải pháp:** Viết API contract (OpenAPI/Swagger) trước khi code

**❗ Vấn đề 3:** Merge conflict nhiều trên file config
**Giải pháp:** Tách config thành nhiều file nhỏ theo module

**Action Items cho Sprint 5:**
1. Khải: Setup Swagger documentation
2. Huy: Viết test cho critical components
3. Anh: Refactor hardcoded values thành constants

#### **Slide 17: Backlog Refinement**

**Backlog Refinement Session (2 giờ giữa Sprint)**

**Mục đích:**
- Chuẩn bị Product Backlog cho Sprint Planning tới
- Thêm chi tiết, ước lượng, chia nhỏ User Stories

**Ví dụ: Refine User Story "Tích hợp GHN"**

**Ban đầu (vague):**
```
- Tích hợp Giao Hàng Nhanh
```

**Sau Refinement (detailed):**
```
Epic: Tích hợp GHN Shipping

User Story 1: Tạo đơn vận chuyển GHN
- Acceptance Criteria:
  ✓ Admin có thể tạo vận đơn GHN từ order detail
  ✓ Hiển thị tracking code sau khi tạo thành công
  ✓ Xử lý lỗi khi GHN API fail
- Estimation: 5 Story Points
- Dependencies: API quản lý đơn hàng

User Story 2: Tính phí ship tự động
- Acceptance Criteria:
  ✓ Checkout page hiển thị phí ship theo địa chỉ
  ✓ API call GHN calculate fee
  ✓ Cache kết quả 5 phút để giảm API calls
- Estimation: 3 Story Points

User Story 3: Tracking đơn hàng
- Acceptance Criteria:
  ✓ Khách hàng xem trạng thái vận chuyển realtime
  ✓ Webhook từ GHN update trạng thái
  ✓ Notification khi đơn hàng được giao
- Estimation: 5 Story Points
```

**Result:**
- 1 Epic → 3 User Stories
- Rõ ràng, có thể ước lượng
- Sẵn sàng cho Sprint Planning

#### **Slide 18: Estimation - Planning Poker**

**Phương pháp ước lượng: Planning Poker**

**Story Points scale (Fibonacci):**
1, 2, 3, 5, 8, 13, 21

**Ví dụ: Ước lượng "API Quản lý Voucher"**

**Round 1:**
- Khải: 8 points (Backend phức tạp: validation, logic áp dụng)
- Huy: 3 points (Frontend đơn giản: form + list)
- Anh: 3 points (Admin UI tương tự)

**Thảo luận:**
- Khải: Logic voucher phức tạp (giới hạn số lượng, thời gian, giá trị đơn min, kết hợp voucher)
- Huy: Frontend chỉ hiển thị + select voucher
- Consensus: Nên tách thành 2 stories riêng Backend/Frontend

**Round 2:**
- **Backend API Voucher:** 8 points (complex)
- **Frontend Apply Voucher:** 3 points (simple)

**Velocity Tracking:**

| Sprint | Planned | Completed | Velocity |
|--------|---------|-----------|----------|
| Sprint 1 | 18 SP | 16 SP | 16 |
| Sprint 2 | 20 SP | 19 SP | 19 |
| Sprint 3 | 21 SP | 18 SP | 18 |
| Sprint 4 | 20 SP | 20 SP | 20 |
| **Average** | | | **18 SP** |

**→ Sprint 5 planning: Target 18-20 SP**

#### **Slide 19: Definition of Done (DoD)**

**Definition of Done cho ToyStore:**

**Code Level:**
- [ ] Code follows style guide (ESLint + Prettier)
- [ ] No console.log in production code
- [ ] All functions have JSDoc comments
- [ ] No hardcoded values (use config/env)

**Testing:**
- [ ] Unit tests written (coverage ≥ 70%)
- [ ] Integration tests for API endpoints
- [ ] Manual testing completed
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Responsive tested (mobile, tablet, desktop)

**Code Review:**
- [ ] Pull Request created
- [ ] At least 1 approval from team member
- [ ] All review comments addressed
- [ ] No merge conflicts

**Documentation:**
- [ ] API documentation updated (Swagger)
- [ ] README updated if needed
- [ ] User guide updated (if UI changes)

**Deployment:**
- [ ] Merged to `develop` branch
- [ ] Deployed to dev environment
- [ ] No breaking changes to existing features

**Acceptance:**
- [ ] Demo to Product Owner
- [ ] Acceptance criteria met
- [ ] Product Owner approved

**→ Nếu 1 item chưa Done → User Story không Done**

#### **Slide 20: Timeline - Sprint Structure**

**Timeline dự án ToyStore (5 tháng):**

**Tháng 8/2025 - Sprint 0 (Inception):**
- Lập đề cương, Project Charter
- Thiết kế database schema
- Wireframe UI/UX
- Setup Product Backlog ban đầu

**Tháng 9/2025:**
- **Sprint 1 (2 tuần):** Database + Auth + CRUD Sản phẩm
- **Sprint 2 (2 tuần):** Chi tiết sản phẩm + Danh mục + Search

**Tháng 10/2025:**
- **Sprint 3 (2 tuần):** Giỏ hàng + Checkout + Quản lý đơn
- **Sprint 4 (2 tuần):** Tích hợp VNPay + Dashboard

**Tháng 11/2025:**
- **Sprint 5 (2 tuần):** Tích hợp GHN + Shipping
- **Sprint 6 (2 tuần):** Voucher System + Promotions

**Tháng 12/2025:**
- **Sprint 7 (2 tuần):** UI Polish + Testing + Bug fixes
- **Sprint 8 (1 tuần):** Deployment + Documentation
- **Sprint 9 (1 tuần):** Final review + Bàn giao

**Total:** 9 Sprints (18 tuần = 4.5 tháng development)

#### **Slide 21: Artifacts thực tế - Product Backlog**

**Product Backlog Management:**

**Công cụ: Jira / Trello**

**Structure:**
```
📁 TOYSTORE PRODUCT BACKLOG
├── 🎯 Epic 1: Authentication & Authorization (Completed - Sprint 1)
│   ├── ✅ User Story: Đăng ký tài khoản (3 SP)
│   ├── ✅ User Story: Đăng nhập JWT (3 SP)
│   ├── ✅ User Story: Phân quyền 3 cấp (5 SP)
│   └── ✅ User Story: Quên mật khẩu (3 SP)
│
├── 🎯 Epic 2: Product Management (Completed - Sprint 1-2)
│   ├── ✅ User Story: CRUD Sản phẩm Backend (5 SP)
│   ├── ✅ User Story: Danh sách sản phẩm Frontend (3 SP)
│   ├── ✅ User Story: Chi tiết sản phẩm (3 SP)
│   ├── ✅ User Story: Upload hình ảnh (5 SP)
│   └── ✅ User Story: Filter & Search (5 SP)
│
├── 🎯 Epic 3: Shopping Cart & Checkout (Sprint 3)
│   ├── 🔄 User Story: Giỏ hàng (5 SP) - In Progress
│   ├── 📋 User Story: Checkout form (3 SP) - To Do
│   └── 📋 User Story: Order confirmation (2 SP) - To Do
│
├── 🎯 Epic 4: Payment Integration (Sprint 4)
│   ├── 📋 User Story: VNPay integration (8 SP)
│   └── 📋 User Story: Payment confirmation (3 SP)
│
└── 🎯 Epic 5: Shipping Integration (Backlog)
    └── 📋 User Story: GHN integration (8 SP)
```

**Metrics:**
- Total Items: 50+
- Completed: 27 (54%)
- In Progress: 5 (10%)
- To Do: 18 (36%)

#### **Slide 22: Artifacts thực tế - Sprint Backlog**

**Sprint Backlog Example - Sprint 3**

**Kanban Board Snapshot:**

```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│    TO DO (8)     │  IN PROGRESS (3) │   In REVIEW (2)  │     DONE (12)    │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ TS-45: Validate  │ TS-40: Cart UI   │ TS-38: Add Cart  │ TS-35: Database  │
│   checkout form  │   (Huy)          │   API (Khải)     │   schema         │
│                  │ 2 days left      │ Waiting review   │                  │
│ TS-46: Order     │                  │                  │ TS-36: Auth API  │
│   confirmation   │ TS-41: Checkout  │ TS-39: Update    │                  │
│   email          │   page (Huy)     │   Cart (Khải)    │ TS-37: Login UI  │
│                  │ 3 days left      │ Huy reviewing    │                  │
│ TS-47: Admin     │                  │                  │ ... (9 more)     │
│   order list     │ TS-42: Order     │                  │                  │
│   (Anh)          │   management     │                  │                  │
│                  │   (Anh)          │                  │                  │
│ ... (5 more)     │ 1 day left       │                  │                  │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

**Burndown Chart Sprint 3:**
```
Story Points
30 │●
25 │  ●
20 │    ●─●
15 │        ●─●
10 │            ●─●
 5 │                ●─●
 0 └───────────────────●
   Day 1  3  5  7  9  11 13 14
   
   ● Actual    ─── Ideal
```

**Sprint Goal Progress:**
- Completed: 12/25 tasks (48%)
- Days remaining: 6/14 days
- On track: ✅ Yes (velocity matching)

#### **Slide 23: Artifacts thực tế - Increment**

**Increment sau mỗi Sprint (Potentially Shippable):**

**Sprint 1 Increment:**
- ✅ Database với 21 bảng
- ✅ Authentication API hoạt động
- ✅ Admin có thể CRUD sản phẩm
- ✅ Customer có thể xem danh sách sản phẩm
- 📸 Demo: Login page + Product list

**Sprint 3 Increment:**
- ✅ Tất cả tính năng Sprint 1, 2
- ✅ Customer có thể thêm sản phẩm vào giỏ
- ✅ Checkout flow hoàn chỉnh (chưa thanh toán thật)
- ✅ Admin quản lý đơn hàng
- 📸 Demo: Full shopping flow (browse → cart → checkout)

**Sprint 5 Increment:**
- ✅ Tất cả tính năng trước
- ✅ Thanh toán VNPay thật
- ✅ Tạo vận đơn GHN tự động
- ✅ Tracking đơn hàng realtime
- 📸 Demo: Complete e-commerce flow

**Final Increment (Sprint 9):**
- ✅ Website hoàn chỉnh, production-ready
- ✅ 21 API controllers, 38+ pages, 48+ components
- ✅ VNPay + GHN integration
- ✅ Responsive design
- ✅ Dashboard thống kê
- 🚀 **Ready to deploy**

#### **Slide 24: Challenges & Solutions**

**Thách thức gặp phải và giải pháp:**

**🔴 Challenge 1: VNPay Sandbox API không ổn định**
- **Impact:** Sprint 4 delay 2 ngày
- **Solution Áp dụng Scrum:**
  - Daily Scrum: Phát hiện blockers sớm
  - Sprint Review: Thảo luận với PO → Chấp nhận mock data
  - Retrospective: Thống nhất dùng mock cho dev, test thật trước Sprint Review
- **Outcome:** Sprint 5 không bị ảnh hưởng

**🔴 Challenge 2: Frontend-Backend không sync API contract**
- **Impact:** 3 lần phải refactor API, waste time
- **Solution:**
  - Backlog Refinement: Define API contract trước (Swagger)
  - Daily Scrum: Review API changes hàng ngày
  - DoD: Thêm "API doc updated" vào checklist
- **Outcome:** Giảm 80% miscommunication

**🔴 Challenge 3: Yêu cầu thay đổi giữa Sprint**
- **Impact:** PO muốn đổi màu theme + thêm wishlist feature
- **Solution Scrum:**
  - Scrum Master: Giải thích Sprint Goal không nên thay đổi
  - Negotiation: Theme color → Sprint này, Wishlist → Product Backlog (Sprint 7)
  - Sprint Planning: Re-prioritize backlog
- **Outcome:** Giữ được Sprint Goal, thỏa mãn PO

**🔴 Challenge 4: Team member bận thi giữa kỳ**
- **Impact:** Velocity giảm 30% ở Sprint 5
- **Solution:**
  - Sprint Planning: Giảm commitment (15 SP thay vì 20 SP)
  - Daily Scrum: Redistribute tasks giữa team
  - Retrospective: Plan ahead cho exam season
- **Outcome:** Sprint 5 vẫn hoàn thành đúng hạn với scope nhỏ hơn

#### **Slide 25: Lợi ích thực tế khi áp dụng Scrum**

**Lợi ích đo lường được:**

**1. Tốc độ phát triển:**
- ✅ Giao sản phẩm sau mỗi 2 tuần (thay vì 5 tháng)
- ✅ PO có thể test và feedback sớm
- ✅ Phát hiện bug sớm → Chi phí fix thấp hơn

**2. Chất lượng code:**
- ✅ Code review bắt buộc trong DoD
- ✅ Unit test coverage tăng từ 0% → 75%
- ✅ Git workflow rõ ràng (feature branches)

**3. Phối hợp team:**
- ✅ Daily Scrum giúp đồng bộ 3 developers
- ✅ Scrum ceremonies tạo communication rhythm
- ✅ Giảm blockers (trung bình 15 phút → 1 ngày xử lý)

**4. Linh hoạt với thay đổi:**
- ✅ UI/UX điều chỉnh 5 lần dựa trên feedback
- ✅ Priority thay đổi: Voucher từ Sprint 8 → Sprint 6
- ✅ Không mất công sức vì đã deliver incremental

**5. Quản lý rủi ro:**
- ✅ VNPay API issue phát hiện Sprint 4 → Fix trước deadline
- ✅ GHN rate limit → Implement caching sớm
- ✅ Database performance → Optimize từ Sprint 2

**6. Minh bạch tiến độ:**
- ✅ PO luôn biết team đang làm gì (Kanban board)
- ✅ Burndown chart dự đoán deadline chính xác
- ✅ Sprint Review = checkpoint định kỳ

**Metrics:**
| Metric | Before Scrum | With Scrum |
|--------|--------------|------------|
| Delivery Frequency | 1 lần/5 tháng | 1 lần/2 tuần |
| Bug found post-release | N/A | 70% giảm (catch early) |
| Code review rate | 0% | 100% |
| Team satisfaction | N/A | 8.5/10 |

#### **Slide 26: Sprint Burndown - Thực tế**

**Ví dụ: Sprint 4 Burndown Chart**

**Planned vs Actual:**
```
Story Points
25 │●                          ← Initial Sprint Backlog
   │ ●
20 │  ●─●
   │      ●                    ← Ideal burndown
15 │       ●─●
   │         ○ ●               ← Actual (slower Day 6-7 due to VNPay issue)
10 │             ●─●
   │                ●          ← Back on track after fixing issue
 5 │                 ●─●
   │                     ●─●
 0 └────────────────────────●
   D1  2  3  4  5  6  7  8  9 10 11 12 13 14
   
   ● Actual    ─── Ideal    ○ Behind schedule
```

**Analysis:**
- **Day 1-5:** On track
- **Day 6-7:** Behind (VNPay blockers)
- **Scrum Master action:** Daily Scrum → escalate to PO → approve mock
- **Day 8-14:** Caught up + finished early (Day 13)

**Outcome:**
- Sprint Goal: ✅ Achieved
- Story Points: 20/20 completed
- Days saved: 1 day buffer

#### **Slide 27: Velocity Tracking**

**Team Velocity qua các Sprint:**

```
Story Points Completed
25 │
   │     ┌──┐        ┌──┐
20 │ ┌──┐│  │    ┌──┐│  │ ┌──┐
   │ │  ││  │┌──┐│  ││  │ │  │
15 │ │  ││  ││  ││  ││  │ │  │
   │ │  ││  ││  ││  ││  │ │  │
10 │ │  ││  ││  ││  ││  │ │  │
   │ │  ││  ││  ││  ││  │ │  │
 5 │ │  ││  ││  ││  ││  │ │  │
   │ │  ││  ││  ││  ││  │ │  │
 0 └─┴──┴┴──┴┴──┴┴──┴┴──┴─┴──┴─
   Sp1 Sp2 Sp3 Sp4 Sp5 Sp6 Sp7
```

| Sprint | Planned | Actual | Variance | Notes |
|--------|---------|--------|----------|-------|
| Sprint 1 | 18 | 16 | -2 | Learning curve, setup overhead |
| Sprint 2 | 20 | 19 | -1 | UI refactor took longer |
| Sprint 3 | 21 | 18 | -3 | Complex checkout logic |
| Sprint 4 | 20 | 20 | 0 | VNPay solved efficiently |
| Sprint 5 | 15 | 15 | 0 | Reduced due to exams |
| Sprint 6 | 20 | 20 | 0 | Team rhythm stable |
| Sprint 7 | 18 | 18 | 0 | Final polish |

**Average Velocity:** 18 SP/Sprint

**Predictability:** Sprint 4-7 = 100% on-target
→ Team maturity tăng, estimation chính xác hơn

#### **Slide 28: Lessons Learned**

**Bài học từ việc áp dụng Scrum:**

**✅ What Worked Well:**
1. **Daily Scrum 15 phút:**
   - Ngắn gọn, hiệu quả
   - Phát hiện blockers nhanh
   - Team bonding tốt

2. **Sprint Review with Demo:**
   - PO thấy progress rõ ràng
   - Feedback cụ thể hơn văn bản
   - Tăng motivation team

3. **Retrospective culture:**
   - Team cởi mở chia sẻ vấn đề
   - Continuous improvement thật sự
   - Quan hệ team tốt hơn

4. **Definition of Done:**
   - Code quality đồng đều
   - Không còn "forgot to test"
   - Review process smooth

**❌ What Didn't Work:**
1. **Sprint Planning quá dài (6 giờ Sprint 1):**
   - Giải pháp: Refine backlog trước → Planning chỉ 3-4 giờ

2. **Code review bottleneck:**
   - Chỉ Khải review → delay
   - Giải pháp: Cross-review (FE review FE, BE review BE)

3. **Estimation không chính xác lúc đầu:**
   - Over-commit Sprint 1-3
   - Giải pháp: Track velocity, điều chỉnh theo reality

**💡 Key Takeaways:**
- Scrum cần **discipline** (đúng giờ, đủ attendees, follow process)
- **Adapt** Scrum cho team nhỏ (không cứng nhắc)
- **Transparency** là chìa khóa (burndown, blockers, honest communication)
- **Product Owner engagement** critical (feedback nhanh = team productive)

#### **Slide 29: So sánh: Nếu dùng Waterfall**

**Giả định: Dự án ToyStore dùng Waterfall**

**Timeline Waterfall:**
```
Tháng 8-9: Requirements & Design (100% hoàn thiện trước code)
Tháng 10-11: Development (Cả Backend + Frontend cùng lúc)
Tháng 12: Testing & Deployment
```

**Vấn đề sẽ gặp phải:**

**1. Yêu cầu thay đổi → Chi phí cao:**
- UI theme thay đổi tháng 11 → Refactor toàn bộ CSS
- Wishlist feature thêm vào → Refactor database + API
- **Scrum:** Thay đổi chỉ ảnh hưởng Sprint hiện tại

**2. Lỗi phát hiện muộn:**
- VNPay integration issue phát hiện tháng 12 → Không đủ thời gian fix
- Performance problem phát hiện lúc testing → Redesign database
- **Scrum:** Test mỗi Sprint → phát hiện sớm

**3. Không có sản phẩm giữa chừng:**
- Tháng 10: PO không thể test gì
- Tháng 11: Vẫn chưa có gì để demo
- Tháng 12: "Big bang" release → High risk
- **Scrum:** Increment sau mỗi 2 tuần

**4. Team coordination khó:**
- Backend phải hoàn thành 100% trước khi FE bắt đầu → Waste time
- Hoặc FE mock data → API thật khác → Refactor
- **Scrum:** BE và FE song song, đồng bộ qua Daily Scrum

**5. Feedback muộn:**
- PO chỉ thấy sản phẩm tháng 12
- Nếu không hài lòng → Quá muộn để sửa
- **Scrum:** Feedback mỗi 2 tuần → Điều chỉnh kịp

**Kết luận:**
- Waterfall phù hợp: Yêu cầu cố định, không thay đổi
- **ToyStore với Scrum:** ~30% hiệu quả hơn về thời gian và chất lượng

#### **Slide 30: Kết luận & Q&A**

**Tóm tắt:**

✅ **Agile/Scrum phù hợp với ToyStore vì:**
- Dự án phần mềm với yêu cầu thay đổi
- Team nhỏ (3 dev) cần phối hợp chặt chẽ
- Cần feedback liên tục về UI/UX
- Tích hợp API bên thứ ba (VNPay, GHN) có rủi ro cao

✅ **Áp dụng thành công:**
- 9 Sprints, mỗi 2 tuần
- Velocity ổn định: 18 SP/Sprint
- Phát hiện và xử lý issues sớm
- Chất lượng code tốt (75% test coverage)
- Team coordination hiệu quả

✅ **3 Roles hoạt động tốt:**
- Product Owner (GV): Clear vision, feedback kịp thời
- Scrum Master (Khải): Remove blockers, facilitate
- Dev Team: Self-organizing, cross-functional

✅ **5 Ceremonies giá trị:**
- Sprint Planning: Set realistic goals
- Daily Scrum: Sync + remove blockers fast
- Sprint Review: Demo + feedback
- Sprint Retrospective: Continuous improvement
- Backlog Refinement: Prepare for success

✅ **3 Artifacts minh bạch:**
- Product Backlog: Prioritized roadmap
- Sprint Backlog: Clear sprint commitments
- Increment: Deliverable product mỗi 2 tuần

**Thành quả cuối cùng:**
- ✅ Website ToyStore hoàn chỉnh, production-ready
- ✅ Đúng deadline (12/2025)
- ✅ Chất lượng đảm bảo
- ✅ Team hài lòng, học được nhiều

---

**Questions & Answers**

**Cảm ơn đã lắng nghe!** 🎯

---

## **PHỤ LỤC: DEMO SCREENSHOTS/VIDEOS**

*(Gợi ý nội dung cho slides thực tế)*

**Slide 31-34: Screenshots (Nếu muốn mở rộng)**
- Screenshot: Trello/Jira board thực tế
- Screenshot: Burndown chart
- Screenshot: Sprint Review demo
- Screenshot: Git commits timeline

**Slide 35-37: Videos (Embedded hoặc links)**
- Video: Daily Scrum recording
- Video: Sprint Review demo
- Video: Product walkthrough

---

**GHI CHÚ CHO SINH VIÊN:**

Bài thuyết trình này đã bao gồm:
- **5 slides lý thuyết** (2 điểm): Slides 1-5
- **25 slides thực hành** (8 điểm): Slides 6-30

**Khi trình bày:**
1. **Slides 1-5:** Nhanh gọn, tóm tắt lý thuyết (5-7 phút)
2. **Slides 6-30:** Chi tiết cách áp dụng vào ToyStore (20-25 phút)
3. Nhấn mạnh **ví dụ thực tế**: Sprint planning, Daily Scrum, Retrospective
4. Sử dụng **metrics**: Velocity, burndown, story points
5. **Challenges & Solutions**: Thể hiện critical thinking

**Tùy chỉnh:**
- Thay thế các ví dụ cụ thể bằng thực tế dự án của bạn
- Thêm screenshots/videos nếu có
- Điều chỉnh số liệu (velocity, story points) theo thực tế
