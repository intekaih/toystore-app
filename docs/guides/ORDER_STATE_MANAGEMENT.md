# 📦 HỆ THỐNG QUẢN LÝ TRẠNG THÁI ĐƠN HÀNG - TOYSTORE

## 🎯 MỤC ĐÍCH
Tài liệu này mô tả chi tiết luồng xử lý đơn hàng trong hệ thống thương mại điện tử ToyStore, từ khi khách hàng đặt hàng đến khi đơn hàng hoàn tất.

---

## 📋 CÁC TRẠNG THÁI ĐƠN HÀNG

### 1️⃣ **Chờ thanh toán** (Pending Payment)
- **Mô tả**: Đơn hàng vừa được tạo, đang chờ khách hàng thanh toán
- **Áp dụng cho**: 
  - Thanh toán online (VNPay, MoMo, Banking)
  - Thanh toán ví điện tử
- **Hành động tự động**: 
  - ✅ Đã trừ tồn kho (giữ hàng cho khách)
  - ⏰ Tự động hủy sau 15 phút nếu không thanh toán
  - 📧 Gửi email nhắc nhở thanh toán

**Khách hàng có thể**:
- ✅ Thanh toán để chuyển sang "Chờ xử lý"
- ❌ Hủy đơn (hoàn tồn kho)

**Admin có thể**:
- 👀 Xem đơn hàng
- ❌ Hủy đơn nếu quá thời gian

---

### 2️⃣ **Chờ xử lý** (Pending)
- **Mô tả**: Đơn hàng đã thanh toán thành công hoặc chọn COD, đang chờ shop xử lý
- **Áp dụng cho**:
  - Thanh toán COD (ship hàng rồi thu tiền)
  - Đơn đã thanh toán online thành công
- **Hành động tự động**:
  - ✅ Tồn kho đã bị trừ
  - 📧 Gửi email xác nhận đơn hàng cho khách

**Khách hàng có thể**:
- ❌ Hủy đơn (hoàn tồn kho, cần liên hệ shop nếu đã thanh toán)

**Admin có thể**:
- ✅ Xác nhận đơn → chuyển sang "Đã xác nhận"
- ❌ Từ chối đơn → chuyển sang "Đã hủy" (hoàn tiền nếu đã thanh toán)
- 📝 Cập nhật ghi chú đơn hàng

---

### 3️⃣ **Đã xác nhận** (Confirmed) ⭐ MỚI
- **Mô tả**: Shop đã xác nhận đơn hàng, đang chuẩn bị hàng
- **Hành động của shop**:
  - 📦 Kiểm tra tồn kho thực tế
  - 🎁 Đóng gói sản phẩm
  - 🏷️ In phiếu giao hàng
  - 📝 Chuẩn bị hóa đơn VAT (nếu có)

**Khách hàng có thể**:
- 👀 Xem trạng thái
- ❌ Không thể hủy (phải liên hệ shop)

**Admin có thể**:
- ✅ Chuyển sang "Đang đóng gói"
- ❌ Hủy đơn (trường hợp hết hàng, hoàn tiền)

---

### 4️⃣ **Đang đóng gói** (Packing) ⭐ MỚI
- **Mô tả**: Shop đang đóng gói sản phẩm
- **Hành động của shop**:
  - 📦 Đóng gói cẩn thận
  - 🎁 Thêm quà tặng (nếu có chương trình khuyến mãi)
  - 📸 Chụp ảnh sản phẩm trước khi gửi
  - 🚚 Tạo đơn giao hàng với đơn vị vận chuyển

**Khách hàng có thể**:
- 👀 Xem trạng thái
- ❌ Không thể hủy

**Admin có thể**:
- ✅ Chuyển sang "Đang giao hàng" (nhập mã vận đơn)
- ❌ Hủy đơn (trường hợp đặc biệt)

---

### 5️⃣ **Đang giao hàng** (Shipping)
- **Mô tả**: Đơn hàng đã được bàn giao cho đơn vị vận chuyển
- **Thông tin hiển thị**:
  - 📦 Mã vận đơn (tracking number)
  - 🚚 Đơn vị vận chuyển (GHN, GHTK, J&T...)
  - 📍 Trạng thái vận chuyển (đang lấy hàng, đang giao, giao thất bại...)
  - 📱 SĐT shipper (nếu có)

**Khách hàng có thể**:
- 👀 Theo dõi vận đơn real-time
- 📞 Liên hệ shipper
- ❌ Từ chối nhận hàng (chuyển về "Giao hàng thất bại")

**Admin có thể**:
- ✅ Cập nhật trạng thái vận chuyển
- ✅ Chuyển sang "Đã giao hàng" (khi khách nhận hàng)
- ❌ Chuyển về "Giao hàng thất bại" (nếu giao không thành công)

---

### 6️⃣ **Đã giao hàng** (Delivered)
- **Mô tả**: Khách hàng đã nhận được hàng
- **Hành động tự động**:
  - ✅ Thu tiền COD (nếu là đơn COD)
  - 📧 Gửi email yêu cầu đánh giá sản phẩm
  - ⏰ Tự động chuyển sang "Hoàn thành" sau 7 ngày nếu không có khiếu nại

**Khách hàng có thể**:
- ⭐ Đánh giá sản phẩm
- 📝 Phản hồi chất lượng
- 🔄 Yêu cầu đổi/trả hàng (trong 7 ngày)

**Admin có thể**:
- ✅ Xác nhận hoàn thành → chuyển sang "Hoàn thành"
- 🔄 Xử lý yêu cầu đổi/trả hàng

---

### 7️⃣ **Hoàn thành** (Completed)
- **Mô tả**: Đơn hàng đã hoàn tất, không thể thay đổi
- **Đặc điểm**:
  - 🔒 Không thể chỉnh sửa
  - 💰 Đã thanh toán đầy đủ
  - 📊 Được tính vào doanh thu
  - 🎁 Tích điểm thành viên (nếu có)

**Khách hàng có thể**:
- 👀 Xem lịch sử đơn hàng
- 🔄 Mua lại đơn hàng này
- 📄 In hóa đơn VAT

**Admin có thể**:
- 👀 Xem để phân tích doanh thu
- 📊 Xuất báo cáo

---

### 8️⃣ **Đã hủy** (Cancelled)
- **Mô tả**: Đơn hàng đã bị hủy bởi khách hàng hoặc admin
- **Lý do hủy**:
  - Khách hàng hủy (trước khi shop xử lý)
  - Admin hủy (hết hàng, không liên hệ được khách)
  - Hệ thống tự động hủy (quá thời gian thanh toán)
  - Giao hàng thất bại nhiều lần

**Hành động tự động**:
  - ✅ Hoàn tồn kho
  - 💸 Hoàn tiền (nếu đã thanh toán)
  - 📧 Gửi email thông báo hủy đơn

**Khách hàng có thể**:
- 👀 Xem lý do hủy
- 🔄 Đặt lại đơn hàng

**Admin có thể**:
- 👀 Xem lý do hủy
- 📊 Phân tích tỷ lệ hủy đơn

---

### 9️⃣ **Giao hàng thất bại** (Delivery Failed) ⭐ MỚI
- **Mô tả**: Không thể giao hàng đến khách (khách vắng nhà, không liên hệ được, từ chối nhận...)
- **Hành động tiếp theo**:
  - 🔄 Gọi điện xác nhận lại với khách
  - 📅 Hẹn lịch giao lại (tối đa 3 lần)
  - ❌ Chuyển về kho nếu không giao được

**Khách hàng có thể**:
- 📞 Liên hệ để hẹn giao lại
- ❌ Hủy đơn

**Admin có thể**:
- 🔄 Chuyển về "Đang giao hàng" (giao lại lần 2, 3)
- ❌ Chuyển sang "Đã hủy" (sau 3 lần giao thất bại)

---

### 🔟 **Đang hoàn tiền** (Refunding) ⭐ MỚI
- **Mô tả**: Đang xử lý hoàn tiền cho khách hàng
- **Áp dụng khi**:
  - Khách hủy đơn đã thanh toán
  - Admin hủy đơn đã thanh toán
  - Đổi trả hàng có hoàn tiền

**Hành động của shop**:
  - 💳 Xử lý hoàn tiền qua cổng thanh toán
  - 🏦 Hoàn tiền qua chuyển khoản
  - 📧 Gửi email xác nhận hoàn tiền

**Admin có thể**:
- ✅ Xác nhận đã hoàn tiền → chuyển sang "Đã hoàn tiền"
- 📝 Nhập thông tin giao dịch hoàn tiền

---

### 1️⃣1️⃣ **Đã hoàn tiền** (Refunded) ⭐ MỚI
- **Mô tả**: Đã hoàn tiền thành công cho khách hàng
- **Thông tin lưu trữ**:
  - 💰 Số tiền hoàn
  - 📅 Ngày hoàn tiền
  - 🏦 Phương thức hoàn
  - 📝 Ghi chú

---

## 🔄 SƠ ĐỒ LUỒNG XỬ LÝ ĐƠN HÀNG

```
                    ┌─────────────────────┐
                    │   Khách đặt hàng    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼───────────┐
                    │ Chọn phương thức TT? │
                    └──────────┬───────────┘
                               │
            ┌──────────────────┴──────────────────┐
            │                                     │
    ┌───────▼────────┐                  ┌────────▼─────────┐
    │ Online Payment │                  │       COD        │
    └───────┬────────┘                  └────────┬─────────┘
            │                                     │
    ┌───────▼────────────┐                      │
    │ Chờ thanh toán     │                      │
    │ (15 phút)          │                      │
    └───────┬────────────┘                      │
            │                                     │
        Thanh toán thành công                    │
            │                                     │
            └─────────────────┬───────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Chờ xử lý        │ ◄─── Khách có thể hủy
                    └─────────┬──────────┘
                              │
                    Admin xác nhận đơn
                              │
                    ┌─────────▼──────────┐
                    │   Đã xác nhận      │
                    └─────────┬──────────┘
                              │
                    Shop đóng gói
                              │
                    ┌─────────▼──────────┐
                    │   Đang đóng gói    │
                    └─────────┬──────────┘
                              │
                    Bàn giao shipper
                              │
                    ┌─────────▼──────────┐
                    │   Đang giao hàng   │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │ Giao hàng thành công?
                    └─────────┬──────────┘
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
      ┌─────▼──────┐                   ┌───────▼────────┐
      │ Đã giao    │                   │ Thất bại       │
      │ hàng       │                   │ (giao lại)     │
      └─────┬──────┘                   └───────┬────────┘
            │                                   │
      Sau 7 ngày                          Giao lại < 3 lần
            │                                   │
      ┌─────▼──────┐                           │
      │ Hoàn thành │                           │
      └────────────┘                    ┌──────▼────────┐
                                        │   Đã hủy      │
                                        │ (hoàn tiền)   │
                                        └───────────────┘
```

---

## 👨‍💼 LUỒNG XỬ LÝ CỦA ADMIN (CHỦ SHOP)

### 📋 **BƯỚC 1: KIỂM TRA ĐƠN HÀNG MỚI**
**Thời điểm**: Mỗi sáng hoặc realtime khi có đơn mới

**Hành động**:
1. Vào trang "Quản lý đơn hàng"
2. Xem danh sách đơn "Chờ xử lý"
3. Kiểm tra:
   - ✅ Thông tin khách hàng (tên, SĐT, địa chỉ)
   - ✅ Sản phẩm đặt mua
   - ✅ Tổng tiền
   - ✅ Phương thức thanh toán
   - ✅ Trạng thái thanh toán

**Quyết định**:
- ✅ **XÁC NHẬN**: Nếu đơn hợp lệ → chuyển sang "Đã xác nhận"
- ❌ **TỪ CHỐI**: Nếu hết hàng, thông tin sai → "Đã hủy" + hoàn tiền

---

### 📦 **BƯỚC 2: CHUẨN BỊ HÀNG**
**Thời điểm**: Sau khi xác nhận đơn

**Hành động**:
1. Vào kho kiểm tra tồn kho thực tế
2. Lấy sản phẩm theo đơn hàng
3. Kiểm tra chất lượng sản phẩm:
   - ✅ Còn mới, không lỗi
   - ✅ Đầy đủ phụ kiện (nếu có)
   - ✅ Hạn sử dụng còn lâu (với đồ chơi có pin)
4. Cập nhật trạng thái → "Đang đóng gói"

**Lưu ý**:
- ❌ Nếu phát hiện hết hàng → Gọi khách đề xuất đổi sản phẩm hoặc hủy đơn
- 📞 Gọi điện xác nhận lại địa chỉ nếu thấy không rõ ràng

---

### 🎁 **BƯỚC 3: ĐÓNG GÓI**
**Thời điểm**: Sau khi đã kiểm tra hàng

**Hành động**:
1. Đóng gói cẩn thận:
   - 📦 Dùng thùng carton phù hợp
   - 🫧 Lót bọt khí để bảo vệ
   - 🎀 Dán băng keo cẩn thận
2. Dán thông tin:
   - 🏷️ Phiếu giao hàng (tên, SĐT, địa chỉ)
   - ⚠️ Ghi chú "DỄ VỠ" nếu là đồ chơi dễ hỏng
3. Chụp ảnh sản phẩm trước khi gửi (để chứng minh nếu có tranh chấp)
4. In hóa đơn VAT (nếu khách yêu cầu)

**Thêm quà tặng** (tùy chọn):
- 🎁 Sticker
- 🎁 Đồ chơi nhỏ
- 🎁 Voucher giảm giá cho lần mua tiếp theo

---

### 🚚 **BƯỚC 4: BÀN GIAO SHIPPER**
**Thời điểm**: Sau khi đóng gói xong

**Hành động**:
1. Tạo đơn giao hàng trên hệ thống vận chuyển (GHN, GHTK, J&T...)
2. In mã vận đơn và dán lên thùng
3. Chụp ảnh bưu kiện đã đóng gói
4. Bàn giao cho shipper đến lấy hàng
5. **QUAN TRỌNG**: Cập nhật trạng thái đơn hàng → "Đang giao hàng"
6. **QUAN TRỌNG**: Nhập mã vận đơn vào hệ thống để khách theo dõi

**Thông tin cần nhập**:
```json
{
  "trangThai": "Đang giao hàng",
  "maVanDon": "GHNXXXXX",
  "donViVanChuyen": "Giao Hàng Nhanh",
  "ngayGuiHang": "2025-11-15",
  "ghiChu": "Đã giao cho shipper lúc 10:00"
}
```

---

### 📱 **BƯỚC 5: THEO DÕI VẬN CHUYỂN**
**Thời điểm**: Trong quá trình giao hàng (1-3 ngày)

**Hành động**:
1. Theo dõi trạng thái vận đơn hàng ngày
2. Nhận thông báo từ đơn vị vận chuyển:
   - 🚚 "Đang lấy hàng"
   - 🚚 "Đang giao hàng"
   - ✅ "Giao hàng thành công"
   - ❌ "Giao hàng thất bại"
3. Cập nhật trạng thái trong hệ thống

**Xử lý khi giao thất bại**:
- 📞 Gọi khách hàng hỏi lý do
- 📅 Hẹn lịch giao lại
- Cập nhật trạng thái → "Giao hàng thất bại"
- Gửi thông báo cho đơn vị VC giao lại

**Giới hạn**: Tối đa giao lại 3 lần, sau đó hủy đơn

---

### ✅ **BƯỚC 6: XÁC NHẬN GIAO THÀNH CÔNG**
**Thời điểm**: Khi nhận thông báo "Giao hàng thành công" từ đơn vị VC

**Hành động**:
1. Cập nhật trạng thái → "Đã giao hàng"
2. Thu tiền COD từ đơn vị vận chuyển (nếu là đơn COD)
3. Gửi email cảm ơn và yêu cầu đánh giá cho khách
4. Đợi 7 ngày để khách kiểm tra hàng

**Nếu có khiếu nại**:
- 📞 Gọi khách xác minh vấn đề
- 🔄 Xử lý đổi/trả hàng
- 💰 Hoàn tiền (nếu cần)

**Nếu không có khiếu nại sau 7 ngày**:
- ✅ Tự động chuyển sang "Hoàn thành"

---

### 🎉 **BƯỚC 7: HOÀN TẤT ĐƠN HÀNG**
**Thời điểm**: Sau 7 ngày kể từ khi giao hàng thành công

**Hành động**:
1. Cập nhật trạng thái → "Hoàn thành"
2. Tính doanh thu vào báo cáo
3. Tích điểm cho khách hàng (nếu có)
4. Lưu trữ đơn hàng vào lịch sử

---

## ⚙️ TRIỂN KHAI KỸ THUẬT - STATE PATTERN

Tôi sẽ tạo file implementation để bạn áp dụng State Pattern:

### **Ưu điểm của State Pattern**:
- ✅ Quản lý trạng thái rõ ràng
- ✅ Dễ thêm trạng thái mới
- ✅ Validate chuyển trạng thái tự động
- ✅ Log lịch sử thay đổi
- ✅ Xử lý nghiệp vụ theo từng trạng thái

---

## 📊 BÁO CÁO VÀ THỐNG KÊ

### **Các chỉ số cần theo dõi**:
1. **Tỷ lệ hủy đơn**: Số đơn hủy / Tổng đơn (< 5% là tốt)
2. **Thời gian xử lý**: Từ "Chờ xử lý" → "Đang giao hàng" (< 24h)
3. **Tỷ lệ giao thất bại**: Số lần giao thất bại / Tổng đơn giao (< 10%)
4. **Thời gian giao hàng trung bình**: 2-3 ngày
5. **Tỷ lệ hoàn thành**: Số đơn "Hoàn thành" / Tổng đơn (> 90%)

### **Dashboard Admin cần có**:
- 📊 Số đơn hàng mới (Chờ xử lý)
- 📊 Số đơn đang xử lý (Đã xác nhận, Đang đóng gói)
- 📊 Số đơn đang giao (Đang giao hàng)
- 📊 Số đơn hoàn thành hôm nay
- 📊 Doanh thu hôm nay
- ⚠️ Cảnh báo đơn quá hạn xử lý

---

## 🔔 HỆ THỐNG THÔNG BÁO

### **Thông báo cho Admin**:
- 📧 Email: Có đơn hàng mới
- 🔔 Popup: Đơn hàng cần xử lý gấp
- ⚠️ Cảnh báo: Đơn hàng quá 24h chưa xử lý

### **Thông báo cho Khách hàng**:
- 📧 Email: Xác nhận đặt hàng
- 📧 Email: Đơn hàng đã được xác nhận
- 📧 Email: Đơn hàng đang giao (kèm mã vận đơn)
- 📧 Email: Đơn hàng đã giao thành công
- 📱 SMS: Shipper sắp đến (trước 30 phút)

---

## 🛡️ XỬ LÝ CÁC TRƯỜNG HỢP ĐẶC BIỆT

### **1. Khách đặt nhầm đơn**:
- Nếu ở trạng thái "Chờ xử lý" → Khách tự hủy được
- Nếu ở trạng thái "Đã xác nhận" → Phải liên hệ shop để hủy

### **2. Hết hàng sau khi xác nhận**:
- Gọi điện cho khách đề xuất:
  - Đổi sản phẩm tương tự
  - Hoặc hủy đơn + hoàn tiền

### **3. Địa chỉ sai/không rõ**:
- Gọi điện xác nhận lại trước khi giao
- Cập nhật địa chỉ trong hệ thống

### **4. Khách không nhận hàng**:
- Giao lại tối đa 3 lần
- Sau 3 lần → Hủy đơn + Khách chịu phí ship

### **5. Hàng bị hỏng khi giao**:
- Yêu cầu khách chụp ảnh
- Đổi hàng mới hoặc hoàn tiền
- Khiếu nại với đơn vị vận chuyển

---

## 📚 KẾT LUẬN

Hệ thống quản lý trạng thái đơn hàng cần:
- ✅ **Rõ ràng**: Mỗi trạng thái có ý nghĩa cụ thể
- ✅ **Tự động hóa**: Giảm thao tác thủ công
- ✅ **Minh bạch**: Khách hàng biết đơn hàng đang ở đâu
- ✅ **An toàn**: Không mất đơn, không nhầm lẫn
- ✅ **Có thể mở rộng**: Dễ thêm trạng thái mới

**Mục tiêu cuối cùng**: Khách hàng hài lòng, shop hiệu quả!
