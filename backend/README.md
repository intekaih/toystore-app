# Toystore - Backend Setup

## Environment Variables Setup

### Bước 1: Tạo file `.env`

Copy file `.env.example` và đổi tên thành `.env`:

```bash
cp .env.example .env
```

### Bước 2: Cấu hình các biến môi trường

Mở file `.env` và điền các thông tin thực tế của bạn:

#### Database Configuration
- `DB_HOST`: Địa chỉ SQL Server của bạn
- `DB_PORT`: Cổng SQL Server (mặc định: 1433)
- `DB_USER`: Username SQL Server
- `DB_PASSWORD`: Password SQL Server
- `DB_NAME`: Tên database (toystore)

#### JWT Secret
- `JWT_SECRET`: Chuỗi bí mật để mã hóa JWT token (nên dùng chuỗi ngẫu nhiên mạnh)

#### VNPay Configuration (Sandbox)
- Đăng ký tài khoản sandbox tại: https://sandbox.vnpayment.vn/
- Điền các thông tin `VNP_TMNCODE` và `VNP_HASHSECRET` từ VNPay

### ⚠️ Quan trọng

**KHÔNG BAO GIỜ** commit file `.env` lên Git! File này chứa thông tin nhạy cảm.

File `.env.example` có thể commit để làm mẫu cho các developer khác.

## Cài đặt Dependencies

```bash
npm install
```

## Chạy Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Tạo Admin Account

```bash
npm run create-admin
```

Thông tin đăng nhập admin mặc định:
- Username: `admin`
- Password: `admin123`
