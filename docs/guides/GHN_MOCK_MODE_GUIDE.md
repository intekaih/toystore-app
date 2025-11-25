# 🎭 GHN Mock Mode - Hướng Dẫn Sử Dụng

## Tổng Quan

GHN Mock Mode cho phép bạn test hệ thống tracking đơn hàng mà không cần gọi API thật của GHN. Điều này giúp:
- Tiết kiệm chi phí API calls
- Test nhanh chóng không phụ thuộc vào GHN
- Phát triển frontend mà không cần đợi API thật

## Cách Bật Mock Mode

Thêm vào file `.env` hoặc set environment variable:

```bash
GHN_MOCK_MODE=true
```

## Các Trạng Thái Đơn Hàng

Mock service quản lý các trạng thái theo thứ tự:

1. `ready_to_pick` - Chờ lấy hàng
2. `picking` - Đang lấy hàng
3. `picked` - Đã lấy hàng
4. `storing` - Nhập kho
5. `transporting` - Đang luân chuyển
6. `sorting` - Đang phân loại
7. `delivering` - Đang giao hàng
8. `delivered` - Đã giao hàng

## API Endpoints

### 1. Chuyển Trạng Thái Sang Bước Tiếp Theo

**POST** `/api/shipping/mock/advance-status/:ghnOrderCode`

Chuyển đơn hàng sang trạng thái tiếp theo trong flow.

**Ví dụ:**
```bash
POST http://localhost:5000/api/shipping/mock/advance-status/MOCK1763911245206
```

**Response:**
```json
{
  "success": true,
  "message": "Đã chuyển trạng thái thành công",
  "data": {
    "ghnOrderCode": "MOCK1763911245206",
    "oldStatus": "ready_to_pick",
    "newStatus": "picking",
    "newStatusText": "Đang lấy hàng",
    "statusIndex": 1,
    "timeline": [...]
  }
}
```

### 2. Đặt Trạng Thái Cụ Thể

**POST** `/api/shipping/mock/set-status/:ghnOrderCode`

Đặt đơn hàng về một trạng thái cụ thể.

**Body:**
```json
{
  "status": "delivered"
}
```

**Ví dụ:**
```bash
POST http://localhost:5000/api/shipping/mock/set-status/MOCK1763911245206
Content-Type: application/json

{
  "status": "delivered"
}
```

### 3. Lấy Danh Sách Đơn Hàng Mock

**GET** `/api/shipping/mock/orders`

Lấy tất cả đơn hàng đang được quản lý bởi mock service.

**Ví dụ:**
```bash
GET http://localhost:5000/api/shipping/mock/orders
```

## Quy Trình Test

### Bước 1: Tạo Đơn Hàng GHN

Khi admin tạo đơn GHN trong mock mode, hệ thống sẽ:
- Tạo mã vận đơn dạng `MOCK{timestamp}`
- Tự động tạo mock order trong mock service với trạng thái `ready_to_pick`
- Lưu mã vận đơn vào database

### Bước 2: Test Tracking

1. Vào trang `/admin/ghn-tracking`
2. Tìm đơn hàng có mã vận đơn GHN
3. Click "Xem tracking" để xem trạng thái hiện tại
4. Click "Cập nhật" để đồng bộ từ mock service

### Bước 3: Chuyển Trạng Thái

Có 2 cách:

**Cách 1: Dùng API (Postman/curl)**
```bash
# Chuyển sang bước tiếp theo
POST /api/shipping/mock/advance-status/MOCK1763911245206

# Hoặc đặt trạng thái cụ thể
POST /api/shipping/mock/set-status/MOCK1763911245206
{
  "status": "delivered"
}
```

**Cách 2: Thêm nút trong Frontend (tùy chọn)**
Có thể thêm nút "Chuyển trạng thái" trong trang quản lý GHN để test dễ dàng hơn.

### Bước 4: Xem Timeline

Sau mỗi lần chuyển trạng thái:
- Timeline được cập nhật tự động
- Database được cập nhật
- Frontend có thể reload để xem thay đổi

## Lưu Ý

1. **Chỉ dùng trong Development**: Mock endpoints sẽ bị chặn trong production mode
2. **Dữ liệu tạm thời**: Mock orders chỉ tồn tại trong memory, sẽ mất khi restart server
3. **Database vẫn được cập nhật**: Trạng thái trong database sẽ được cập nhật khi chuyển trạng thái

## Troubleshooting

### Lỗi: "Không tìm thấy đơn hàng mock"

- Đảm bảo đơn hàng đã được tạo trong mock mode
- Kiểm tra mã vận đơn có đúng format `MOCK{timestamp}` không
- Có thể tạo lại đơn hàng hoặc dùng `set-status` để tạo mới

### Lỗi: "Trạng thái không hợp lệ"

- Kiểm tra trạng thái có trong danh sách `statusFlow` không
- Xem danh sách trạng thái hợp lệ ở phần "Các Trạng Thái Đơn Hàng"

### Timeline không hiển thị

- Đảm bảo đã chuyển trạng thái ít nhất 1 lần
- Kiểm tra response từ API có chứa `timeline` không

