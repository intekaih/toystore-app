# 📊 BÀI TẬP NHÓM - QUẢN LÝ CHI PHÍ DỰ ÁN TOYSTORE-APP

## I. Thông tin dự án

| Thông tin | Chi tiết |
|---|---|
| **Tên dự án** | Toystore App - Ứng dụng bán đồ chơi trực tuyến |
| **Ngôn ngữ** | JavaScript (Node.js Backend + React Frontend) |
| **Kiến trúc** | Frontend (React), Backend (Node.js/Express), Database (MongoDB), Docker, Nginx |
| **Thời gian** | 28/09/2025 → 15/01/2026 (~**4 tháng**) |
| **Số công việc** | **6 công việc chính** |
| **Thành viên** | Nguyễn Huỳnh Tiến Khải (intekaih), Duy Anh (DuyAnh-code), và các thành viên khác |

---

## II. Phân chia công việc và giả định chi phí (đơn vị: triệu đồng)

Dựa trên commit history thực tế của dự án, các giai đoạn phát triển được xác định như sau:

| STT | Công việc | Thời gian KH (tuần) | Số tuần thực hiện | Chi phí KH/tuần (tr.đ) | Chi phí KH tổng (tr.đ) |
|-----|-----------|---------------------|-------------------|------------------------|------------------------|
| 1 | **Thiết kế hệ thống** (DB, API, UI/UX) | 2 | 2 | 2 | 4 |
| 2 | **Phát triển Backend** (API, Auth, CRUD) | 3 | 3 | 3 | 9 |
| 3 | **Phát triển Frontend** (UI, trang chủ, đăng ký/đăng nhập) | 3 | 3 | 2.5 | 7.5 |
| 4 | **Tích hợp & Nâng cao** (Login GG, biểu đồ thống kê, lọc) | 3 | 4 | 3 | 9 |
| 5 | **Triển khai & DevOps** (Docker, Nginx, Deploy) | 2 | 2 | 2 | 4 |
| 6 | **Kiểm thử & Sửa lỗi** | 2 | 3 | 2 | 4 |
| | **Tổng cộng** | **15** | **17** | | **37.5** |

---

## III. Bảng quản lý chi phí theo phương pháp Earned Value (EV)

> **Giả sử dự án đã hoàn thành 6 công việc trong 4 tháng (~17 tuần)**

### Bảng BCWS, BCWP, ACWP

| Công việc | BCWS (1) | BCWP (2) | ACWP (3) |
|-----------|----------|----------|----------|
| Thiết kế hệ thống | 4 | 4 | 4 |
| Phát triển Backend | 9 | 9 | 10 |
| Phát triển Frontend | 7.5 | 7.5 | 8 |
| Tích hợp & Nâng cao | 9 | 8 | 10 |
| Triển khai & DevOps | 4 | 4 | 3.5 |
| Kiểm thử & Sửa lỗi | 4 | 3 | 4.5 |
| **Chung** | **37.5** | **35.5** | **40** |

### Giải thích giả định:
- **BCWS (Budgeted Cost of Work Scheduled)**: Chi phí kế hoạch ban đầu
- **BCWP (Budgeted Cost of Work Performed)**: Chi phí KH cho khối lượng thực tế hoàn thành (Tích hợp hoàn thành ~89%, Kiểm thử hoàn thành ~75%)
- **ACWP (Actual Cost of Work Performed)**: Chi phí thực tế phát sinh (Backend và Tích hợp tốn nhiều hơn do debug, kiểm thử kéo dài)

---

## IV. Tính các chỉ số quản lý chi phí

### 1. Chỉ số hiệu quả đầu tư (CPI - Cost Performance Index)

**Công thức:** `CPI = BCWP / ACWP`

| Công việc | BCWP | ACWP | CPI | Đánh giá |
|-----------|------|------|-----|----------|
| Thiết kế hệ thống | 4 | 4 | **1.00** | ✅ Đúng ngân sách |
| Phát triển Backend | 9 | 10 | **0.90** | ⚠️ Vượt ngân sách |
| Phát triển Frontend | 7.5 | 8 | **0.94** | ⚠️ Vượt nhẹ |
| Tích hợp & Nâng cao | 8 | 10 | **0.80** | ❌ Vượt ngân sách nhiều |
| Triển khai & DevOps | 4 | 3.5 | **1.14** | ✅ Tiết kiệm |
| Kiểm thử & Sửa lỗi | 3 | 4.5 | **0.67** | ❌ Vượt ngân sách nhiều |
| **Toàn dự án** | **35.5** | **40** | **0.89** | ⚠️ **Vượt ngân sách** |

> **Nhận xét CPI toàn dự án = 0.89 < 1**: Dự án đang vượt ngân sách. Cứ mỗi 1 đồng bỏ ra chỉ thu được 0.89 đồng giá trị công việc.

### 2. Chỉ số độ tin cậy kế hoạch (SPI - Schedule Performance Index)

**Công thức:** `SPI = BCWP / BCWS`

| Công việc | BCWP | BCWS | SPI | Đánh giá |
|-----------|------|------|-----|----------|
| Thiết kế hệ thống | 4 | 4 | **1.00** | ✅ Đúng tiến độ |
| Phát triển Backend | 9 | 9 | **1.00** | ✅ Đúng tiến độ |
| Phát triển Frontend | 7.5 | 7.5 | **1.00** | ✅ Đúng tiến độ |
| Tích hợp & Nâng cao | 8 | 9 | **0.89** | ⚠️ Chậm tiến độ |
| Triển khai & DevOps | 4 | 4 | **1.00** | ✅ Đúng tiến độ |
| Kiểm thử & Sửa lỗi | 3 | 4 | **0.75** | ❌ Chậm tiến độ |
| **Toàn dự án** | **35.5** | **37.5** | **0.95** | ⚠️ **Chậm nhẹ** |

> **Nhận xét SPI toàn dự án = 0.95 < 1**: Dự án hoàn thành chậm hơn so với kế hoạch ~5%.

### 3. Các chỉ số khác

| Chỉ số | Công thức | Giá trị | Ý nghĩa |
|--------|-----------|---------|----------|
| **CV (Cost Variance)** | BCWP - ACWP | 35.5 - 40 = **-4.5 tr.đ** | Vượt chi 4.5 triệu |
| **SV (Schedule Variance)** | BCWP - BCWS | 35.5 - 37.5 = **-2 tr.đ** | Chậm tiến độ tương đương 2 triệu giá trị |
| **BAC (Budget at Completion)** | Tổng BCWS | **37.5 tr.đ** | Ngân sách dự kiến |
| **EAC (Estimate at Completion)** | BAC / CPI | 37.5 / 0.89 = **42.1 tr.đ** | Ước tính tổng chi phí khi hoàn thành |
| **ETC (Estimate to Complete)** | EAC - ACWP | 42.1 - 40 = **2.1 tr.đ** | Chi phí còn cần để hoàn thành |
| **VAC (Variance at Completion)** | BAC - EAC | 37.5 - 42.1 = **-4.6 tr.đ** | Dự kiến vượt ngân sách 4.6 triệu |

### 4. Thời gian hoàn thành dự án ước tính

**Công thức:** `Thời gian ước tính = Thời gian KH / SPI`

- Thời gian kế hoạch: **15 tuần**
- SPI = 0.95
- **Thời gian ước tính = 15 / 0.95 ≈ 15.8 tuần ≈ 16 tuần**
- Thời gian thực tế: **17 tuần** (do nhiều lần fix bug, cải thiện)

---

## V. Biểu đồ tiến độ chi phí theo tháng

| Tháng | Tuần | BCWS tích lũy | BCWP tích lũy | ACWP tích lũy |
|-------|------|----------------|----------------|----------------|
| Tháng 1 (T10/2025) | 1-4 | 8.5 | 8.5 | 8.5 |
| Tháng 2 (T11/2025) | 5-8 | 19 | 18.5 | 20 |
| Tháng 3 (T12/2025) | 9-12 | 30.5 | 28 | 32 |
| Tháng 4 (T01/2026) | 13-17 | 37.5 | 35.5 | 40 |

---

## VI. Kết luận & Bài học kinh nghiệm

### Đánh giá tổng quan:
1. **CPI = 0.89**: Dự án vượt ngân sách **~12.3%** (40 tr.đ so với KH 37.5 tr.đ)
2. **SPI = 0.95**: Tiến độ chậm **~5%**, chủ yếu ở giai đoạn tích hợp và kiểm thử
3. **CV = -4.5 tr.đ**: Chi phí vượt 4.5 triệu đồng
4. **SV = -2 tr.đ**: Giá trị công việc hoàn thành ít hơn kế hoạch

### Nguyên nhân (dựa trên commit history thực tế):
- Giai đoạn **Tích hợp & Nâng cao** có nhiều commit "fix" liên tục → phát sinh chi phí debug
- Giai đoạn **Kiểm thử** kéo dài do phát hiện nhiều lỗi giao diện cửa hàng, biểu đồ thống kê
- Một số tính năng nâng cao (Login Google, bộ lọc) phức tạp hơn dự kiến

### Kiến nghị cải thiện:
- Dự trữ ngân sách **10-15%** cho giai đoạn tích hợp và kiểm thử
- Thực hiện code review sớm để giảm bug ở giai đoạn sau
- Áp dụng CI/CD để phát hiện lỗi sớm, giảm chi phí sửa lỗi

---

> **Ghi chú**: Các số liệu chi phí được giả định hợp lý dựa trên quy mô dự án sinh viên và commit history thực tế từ repository [intekaih/toystore-app](https://github.com/intekaih/toystore-app).
