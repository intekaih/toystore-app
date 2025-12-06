# 🎯 CÁC ĐIỂM NỔI BẬT CỦA BACKEND (Đã được Frontend sử dụng)

## 1. 💳 **Tích hợp Thanh toán VNPay**
- Tạo URL thanh toán với chữ ký SHA512
- Xử lý callback (Return URL & IPN) từ VNPay
- Tự động cập nhật trạng thái đơn hàng sau thanh toán
- Trừ tồn kho khi thanh toán thành công
- Hỗ trợ cả user đăng nhập và guest

## 2. 🚚 **Tích hợp Giao Hàng Nhanh (GHN)**
- Tính phí ship tự động theo địa chỉ
- Lấy danh sách tỉnh/huyện/xã từ GHN API
- Tạo đơn vận chuyển trên GHN khi admin bàn giao
- Tracking đơn hàng với timeline chi tiết
- Đồng bộ trạng thái từ GHN vào database

## 3. 🎟️ **Hệ thống Voucher**
- Áp dụng voucher với validation đầy đủ:
  - Kiểm tra thời gian hiệu lực
  - Giới hạn số lượng sử dụng
  - Giới hạn số lần sử dụng/người
  - Kiểm tra điều kiện đơn hàng tối thiểu
- Hỗ trợ voucher % và voucher số tiền cố định
- Tự động tính toán giảm giá khi tạo đơn hàng

## 4. 🛒 **Giỏ hàng Hỗ trợ Guest**
- Giỏ hàng cho user đăng nhập (lưu trong DB)
- Giỏ hàng cho guest (lưu bằng Session ID)
- Tự động merge giỏ hàng khi guest đăng nhập
- Validation tồn kho khi thêm/cập nhật
- Tính toán chính xác bằng Decimal.js

## 5. 📦 **Quản lý Đơn hàng với Database Transaction**
- Tạo đơn hàng với transaction đảm bảo tính toàn vẹn
- Tự động trừ tồn kho (với Pessimistic Locking)
- Tự động tạo mã đơn hàng unique: HDYYYYMMDDXXX
- Tạo đơn hàng từ giỏ hàng và xóa giỏ sau khi đặt
- Hủy đơn hàng tự động hoàn tồn kho

## 6. 💰 **Decorator Pattern cho Tính Giá Đơn Hàng**
- Tách biệt logic tính giá (VAT, Ship, Voucher)
- Dễ mở rộng thêm các loại phí khác
- Tính toán chính xác bằng Decimal.js (tránh lỗi floating point)

## 7. ⭐ **Hệ thống Đánh giá Sản phẩm**
- User chỉ đánh giá sản phẩm từ đơn hàng đã giao
- Đánh giá có hình ảnh, sao, và bình luận
- Admin quản lý và xóa đánh giá không phù hợp
- Hiển thị đánh giá trên trang chi tiết sản phẩm

## 8. 📊 **Thống kê và Báo cáo Admin**
- Thống kê dashboard: tổng sản phẩm, đơn hàng, doanh thu
- Thống kê doanh thu theo ngày/tuần/tháng/năm
- Thống kê sản phẩm: top bán chạy, doanh thu, số lượng bán
- Top khách hàng mua nhiều nhất
- Biểu đồ doanh thu 7 ngày gần nhất

## 9. 🔐 **Xác thực và Phân quyền (JWT)**
- JWT token với expiration time
- Phân quyền: Admin, Nhân viên, User
- Middleware kiểm tra quyền (verifyToken, requireAdmin, requireStaff)
- Optional authentication cho guest users

## 10. 🛡️ **Rate Limiting**
- Giới hạn số request theo endpoint:
  - Đăng nhập: 50 lần/15 phút
  - Đăng ký: 30 lần/giờ
  - Thanh toán: 100 lần/10 phút
  - Giỏ hàng: 1000 lần/10 phút

## 11. 🖼️ **Quản lý Banner**
- Hiển thị banner trên homepage
- Admin quản lý banner (thêm, sửa, xóa, bật/tắt)
- Banner có link điều hướng và hình ảnh

## 12. 📝 **Logging System (Singleton Pattern)**
- Ghi log vào file và console
- Format log nhất quán: [time] [level] message
- Các mức log: INFO, WARN, ERROR, DEBUG, SUCCESS
- Tự động tạo thư mục logs

## 13. 🏗️ **Kiến trúc Clean Code**
- Tách biệt Controller → Service → Model
- Sử dụng DTOMapper để chuẩn hóa response
- Middleware tái sử dụng (auth, rate limit)
- Singleton Pattern cho Logger, Config, DB Connection

## 14. 🔒 **Bảo mật Database**
- Pessimistic Locking khi trừ tồn kho (tránh race condition)
- SQL Injection protection (Sequelize ORM)
- Validation dữ liệu đầu vào
- Xử lý transaction an toàn với rollback

## 15. 📱 **API RESTful đầy đủ**
- CRUD đầy đủ cho Products, Categories, Brands, Orders
- Phân trang, tìm kiếm, sắp xếp
- Response format nhất quán: { success, message, data }
- Error handling chuẩn với status code phù hợp

