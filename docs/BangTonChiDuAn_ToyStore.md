# BẢN TÔN CHỈ DỰ ÁN (PROJECT CHARTER)

---

## 1.0 NHẬN DẠNG DỰ ÁN (PROJECT IDENTIFICATION)

| Mục | Thông tin |
|-----|-----------|
| **Tên dự án** | ToyStore - Website Bán Đồ Chơi Trực Tuyến |
| **Mô tả** | Thiết kế, phát triển và triển khai hệ thống website thương mại điện tử chuyên bán đồ chơi, hướng đến đối tượng khách hàng tuổi teen với giao diện hiện đại và trải nghiệm mua sắm thân thiện |
| **Nhà tài trợ (Sponsor)** | Lê Gia Công (Giáo viên hướng dẫn) |
| **Quản trị dự án (PM)** | Nguyễn Huỳnh Tiến Khải |
| **Nhóm nguồn lực** | • Nguyễn Huỳnh Tiến Khải - Backend Developer<br>• Lê Tiến Huy - Frontend Store Developer<br>• Lê Bình Duy Anh - Frontend Admin Developer |
| **Đơn vị thực hiện** | Khoa Công nghệ Thông tin - Trường Đại học Đà Lạt |

---

## 2.0 LÝ DO KINH DOANH (BUSINESS REASONS FOR PROJECT)

- Nâng cao khả năng cạnh tranh của cửa hàng đồ chơi trong bối cảnh thị trường thay đổi nhanh và xu hướng tiêu dùng của tuổi teen liên tục biến động theo mạng xã hội.
- Đáp ứng nhu cầu mua sắm trực tuyến ngày càng tăng của người tiêu dùng trẻ, đặc biệt là thế hệ Gen Z.
- Mở rộng kênh bán hàng, từ cửa hàng truyền thống sang nền tảng thương mại điện tử.
- Xây dựng hệ thống quản lý tập trung, tối ưu hóa quy trình bán hàng và quản lý kho.
- Tăng cường khả năng tiếp cận nguồn hàng mới lạ, phù hợp xu hướng đến khách hàng mục tiêu.

---

## 3.0 MỤC TIÊU DỰ ÁN (PROJECT OBJECTIVES)

- Xây dựng website thương mại điện tử hoàn chỉnh với giao diện trẻ trung, hiện đại (tone màu trắng - hồng sữa).
- Tích hợp thanh toán trực tuyến qua VNPay, đảm bảo giao dịch an toàn và tiện lợi.
- Tích hợp dịch vụ vận chuyển Giao Hàng Nhanh (GHN) để tối ưu hóa quy trình giao hàng.
- Phát triển hệ thống quản lý voucher/khuyến mãi linh hoạt để thu hút khách hàng.
- Xây dựng hệ thống thống kê, báo cáo doanh thu cho quản trị viên.
- Hỗ trợ giỏ hàng cho cả khách đăng nhập và khách vãng lai.
- Phát triển hệ thống đánh giá sản phẩm để tăng độ tin cậy.

---

## 4.0 PHẠM VI DỰ ÁN (PROJECT SCOPE)

### Bao gồm:
- Phát triển Backend API với Node.js, Express và SQL Server.
- Phát triển Frontend Store cho khách hàng với React và TailwindCSS.
- Phát triển Frontend Admin cho quản trị viên.
- Tích hợp thanh toán VNPay.
- Tích hợp vận chuyển Giao Hàng Nhanh.
- Hệ thống xác thực JWT với phân quyền 3 cấp (Admin, Nhân viên, Khách hàng).
- Responsive design hỗ trợ đa thiết bị.

### Không bao gồm:
- Ứng dụng mobile (iOS/Android).
- Tích hợp các cổng thanh toán khác ngoài VNPay.
- Hệ thống chat/tư vấn trực tuyến.
- Module kế toán/tài chính chi tiết.

### Thời gian hoàn thành:
- **Dự kiến hoàn thành**: Tháng 12/2025

---

## 5.0 SẢN PHẨM BÀN GIAO CHÍNH (KEY PROJECT DELIVERABLES)

| Tên sản phẩm | Mô tả |
|--------------|-------|
| **Backend API** | Hệ thống API RESTful với 21 controllers xử lý tất cả nghiệp vụ kinh doanh (sản phẩm, đơn hàng, thanh toán, vận chuyển, voucher...) |
| **Frontend Store** | Giao diện website cho khách hàng với 38+ trang, 48+ components, hỗ trợ mua sắm, thanh toán, theo dõi đơn hàng |
| **Frontend Admin** | Giao diện quản trị cho admin/nhân viên với các chức năng quản lý sản phẩm, đơn hàng, thống kê, voucher, banner |
| **Database** | Cơ sở dữ liệu SQL Server với 21 bảng, chứa toàn bộ dữ liệu hệ thống |
| **Tài liệu** | Đề cương đồ án, báo cáo chi tiết, hướng dẫn cài đặt và sử dụng |
| **Source Code** | Mã nguồn hoàn chỉnh trên Git repository với lịch sử commit chi tiết |

---

## 6.0 CÁC MỐC THỜI GIAN QUAN TRỌNG (MILESTONE DATES)

| STT | Sự kiện / Mốc quan trọng | Thời gian |
|-----|--------------------------|-----------|
| 1 | Khởi động dự án, lập đề cương | 08/2025 |
| 2 | Hoàn thành thiết kế cơ sở dữ liệu | 09/2025 |
| 3 | Hoàn thành wireframe và UI/UX design | 09/2025 |
| 4 | Phát triển Backend - Core API (CRUD) | 09-10/2025 |
| 5 | Phát triển Frontend Store - Giao diện cơ bản | 10/2025 |
| 6 | Phát triển Frontend Admin | 10-11/2025 |
| 7 | Tích hợp thanh toán VNPay | 11/2025 |
| 8 | Tích hợp vận chuyển GHN | 11/2025 |
| 9 | Phát triển hệ thống Voucher | 11/2025 |
| 10 | Testing và sửa lỗi | 11-12/2025 |
| 11 | Hoàn thiện giao diện, UI/UX polish | 12/2025 |
| 12 | Hoàn thành báo cáo và bàn giao | 12/2025 |

---

## 7.0 CÁC VẤN ĐỀ CHÍNH (KEY ISSUES)

| Mức độ | Mô tả |
|--------|-------|
| Trung bình | Tích hợp VNPay yêu cầu môi trường sandbox và cấu hình phức tạp |
| Trung bình | API Giao Hàng Nhanh có giới hạn request và yêu cầu xử lý đồng bộ dữ liệu |
| Thấp | Khác biệt trong thiết kế UI giữa Frontend Store và Admin cần đồng bộ |
| Thấp | Xử lý race condition khi nhiều user cùng đặt hàng sản phẩm còn ít tồn kho |
| Trung bình | Đảm bảo tính nhất quán dữ liệu khi có lỗi trong quá trình thanh toán |

---

## 8.0 RỦI RO (RISKS)

| Mức độ | Mô tả |
|--------|-------|
| Cao | Thay đổi API từ VNPay hoặc GHN có thể ảnh hưởng đến tích hợp |
| Trung bình | Thiếu tài nguyên server để deploy và test trong môi trường production |
| Trung bình | Thời gian phát triển hạn chế có thể ảnh hưởng đến chất lượng sản phẩm |
| Thấp | Bảo mật thông tin thanh toán và dữ liệu khách hàng |
| Trung bình | Phụ thuộc vào API bên thứ ba (VNPay, GHN) có thể gây gián đoạn dịch vụ |
| Thấp | Khả năng mở rộng hệ thống khi lượng người dùng tăng cao |

---

## 9.0 TIÊU CHÍ THÀNH CÔNG (PROJECT'S CRITERIA FOR SUCCESS - MUST BE MEASURABLE)

| Tiêu chí | Chỉ số đo lường |
|----------|-----------------|
| Nguồn hàng mới lạ dễ tiếp cận người dùng tuổi teen | Danh mục sản phẩm đa dạng với ≥ 10 danh mục, ≥ 5 thương hiệu |
| Hệ thống thanh toán hoạt động ổn định | Tỷ lệ giao dịch thành công qua VNPay ≥ 95% |
| Quy trình đặt hàng đơn giản | Thời gian hoàn thành đặt hàng ≤ 3 phút (từ giỏ hàng đến thanh toán) |
| Tốc độ tải trang nhanh | Thời gian load trang chính < 3 giây |
| Giao diện thân thiện với người dùng | Responsive design hoạt động tốt trên ≥ 3 breakpoints (mobile, tablet, desktop) |
| Hệ thống quản lý hiệu quả | Admin có thể quản lý ≥ 100 sản phẩm, xử lý ≥ 50 đơn hàng/ngày |
| Tích hợp vận chuyển thành công | 100% đơn hàng có thể tạo vận đơn GHN và tracking |
| Hệ thống voucher hoạt động chính xác | Áp dụng đúng điều kiện voucher (giới hạn số lượng, thời gian, giá trị đơn tối thiểu) |
| Bảo mật hệ thống | JWT authentication hoạt động, phân quyền đúng 3 cấp (Admin/Staff/User) |

---

## 10.0 CÁC YẾU TỐ THÀNH CÔNG THEN CHỐT (CRITICAL SUCCESS FACTORS)

- **Sự hỗ trợ của giảng viên hướng dẫn**: Định hướng kỹ thuật và phản hồi kịp thời trong quá trình phát triển.
- **Phối hợp nhóm hiệu quả**: Phân chia công việc rõ ràng giữa Backend và Frontend, giao tiếp thường xuyên.
- **Lựa chọn công nghệ phù hợp**: Sử dụng stack công nghệ hiện đại (React, Node.js, SQL Server) phù hợp với yêu cầu dự án.
- **Testing và QA**: Kiểm thử kỹ lưỡng các chức năng quan trọng (thanh toán, đơn hàng, tồn kho).
- **Thiết kế UI/UX hướng đến đối tượng mục tiêu**: Giao diện trẻ trung, dễ sử dụng cho khách hàng tuổi teen.
- **Quản lý thời gian**: Tuân thủ các mốc thời gian quan trọng, hoàn thành đúng deadline.
- **Tài liệu hóa đầy đủ**: Lưu trữ code trên Git, viết tài liệu hướng dẫn và báo cáo chi tiết.

---

## 11.0 PHÊ DUYỆT (SIGNOFF)

| Vai trò | Họ tên | Chữ ký | Ngày |
|---------|--------|--------|------|
| **Nhà tài trợ dự án (Sponsor)** | Lê Gia Công | __________________ | ___/___/2025 |
| **Quản trị dự án (PM)** | Nguyễn Huỳnh Tiến Khải | __________________ | ___/___/2025 |

---

*Tài liệu này là bản tôn chỉ chính thức của dự án ToyStore, được lập để xác định phạm vi, mục tiêu và các ràng buộc của dự án.*
