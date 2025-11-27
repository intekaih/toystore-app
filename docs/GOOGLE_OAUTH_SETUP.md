# 🔐 Hướng Dẫn Cấu Hình Google OAuth

## 📋 Bước 1: Tạo OAuth Credentials trong Google Cloud Console

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project hoặc tạo project mới
3. Vào **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
5. Nếu chưa có OAuth consent screen, bạn sẽ được yêu cầu cấu hình:
   - **User Type**: Chọn "External" (cho development)
   - **App name**: Nhập tên ứng dụng (ví dụ: "Toystore")
   - **User support email**: Email của bạn
   - **Developer contact information**: Email của bạn
   - Click **Save and Continue**
   - **Scopes**: Chọn "Save and Continue" (không cần thêm scope)
   - **Test users**: Thêm email Google của bạn để test
   - Click **Save and Continue** > **Back to Dashboard**

6. Tạo OAuth Client ID:
   - **Application type**: Chọn "Web application"
   - **Name**: Nhập tên (ví dụ: "Toystore Web Client")
   - **Authorized JavaScript origins**: 
     - `http://localhost:5000` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:5000/api/auth/google/callback` (development)
     - `https://yourdomain.com/api/auth/google/callback` (production)
   - Click **Create**

7. Copy **Client ID** và **Client Secret**

## 📋 Bước 2: Cấu Hình File .env

1. Tạo file `.env` trong thư mục `backend/`:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Mở file `.env` và thêm thông tin Google OAuth:
   ```env
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   FRONTEND_URL=http://localhost:3000
   ```

3. Thay thế các giá trị:
   - `your-google-client-id.apps.googleusercontent.com` → Client ID bạn đã copy
   - `your-google-client-secret` → Client Secret bạn đã copy

## 📋 Bước 3: Khởi Động Lại Server

```bash
# Dừng server hiện tại (Ctrl + C)
# Khởi động lại
npm start
# hoặc
npm run dev
```

## ✅ Kiểm Tra

1. Mở browser và truy cập: `http://localhost:5000/api/auth/google`
2. Nếu cấu hình đúng, bạn sẽ được redirect đến Google login page
3. Nếu vẫn thấy lỗi, kiểm tra:
   - File `.env` có đúng tên không (không có extension)
   - Các giá trị `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` đã được điền chưa
   - Không có khoảng trắng thừa trong file `.env`
   - Server đã được khởi động lại sau khi thêm config

## 🔍 Troubleshooting

### Lỗi: "redirect_uri_mismatch"
- Kiểm tra **Authorized redirect URIs** trong Google Console phải khớp chính xác với `GOOGLE_CALLBACK_URL` trong `.env`
- Đảm bảo không có khoảng trắng thừa

### Lỗi: "invalid_client"
- Kiểm tra `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` đã đúng chưa
- Đảm bảo không có dấu ngoặc kép hoặc khoảng trắng thừa

### Lỗi: "access_denied"
- Kiểm tra OAuth consent screen đã được publish hoặc bạn đã được thêm vào test users chưa

## 📝 Lưu Ý

- **Development**: Có thể dùng OAuth consent screen ở chế độ "Testing"
- **Production**: Cần publish OAuth consent screen và verify domain
- **Security**: Không commit file `.env` lên Git (đã có trong `.gitignore`)

## 🚀 Production Setup

Khi deploy lên production:

1. Cập nhật **Authorized redirect URIs** trong Google Console:
   - Thêm: `https://yourdomain.com/api/auth/google/callback`

2. Cập nhật `.env`:
   ```env
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   FRONTEND_URL=https://yourdomain.com
   ```

3. Đảm bảo sử dụng HTTPS (Google OAuth yêu cầu HTTPS trong production)

