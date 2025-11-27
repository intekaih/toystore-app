# 🔧 Sửa Lỗi redirect_uri_mismatch

## ❌ Lỗi
```
Error 400: redirect_uri_mismatch
```

## 🔍 Nguyên Nhân
Callback URL trong code không khớp với URL đã đăng ký trong Google Cloud Console.

## ✅ Cách Sửa

### Bước 1: Kiểm Tra Callback URL Hiện Tại

Chạy script kiểm tra:
```bash
cd backend
node scripts/check-google-oauth-config.js
```

Script sẽ hiển thị callback URL hiện tại trong code.

### Bước 2: Kiểm Tra Trong Google Cloud Console

1. Truy cập: https://console.cloud.google.com/
2. Chọn project của bạn
3. Vào **APIs & Services** > **Credentials**
4. Click vào **OAuth 2.0 Client ID** của bạn
5. Xem phần **Authorized redirect URIs**

### Bước 3: So Sánh và Sửa

**Callback URL mặc định trong code:**
```
http://localhost:5000/api/auth/google/callback
```

**Đảm bảo trong Google Console có URL:**
```
http://localhost:5000/api/auth/google/callback
```

### ⚠️ Lưu Ý Quan Trọng

1. **Không có trailing slash**: 
   - ✅ Đúng: `http://localhost:5000/api/auth/google/callback`
   - ❌ Sai: `http://localhost:5000/api/auth/google/callback/`

2. **Đúng protocol**:
   - ✅ Development: `http://`
   - ✅ Production: `https://`

3. **Đúng port**:
   - ✅ Development: `:5000`
   - ✅ Production: không có port (hoặc port 443)

4. **Đúng path**:
   - ✅ Đúng: `/api/auth/google/callback`
   - ❌ Sai: `/auth/google/callback` (thiếu `/api`)

5. **Không có khoảng trắng**:
   - Copy-paste trực tiếp, không thêm khoảng trắng

### Bước 4: Cập Nhật Google Console

1. Trong Google Console, phần **Authorized redirect URIs**
2. **Xóa** các URL cũ không đúng
3. **Thêm** URL mới (copy từ script check):
   ```
   http://localhost:5000/api/auth/google/callback
   ```
4. Click **Save**
5. **Đợi 1-2 phút** để Google cập nhật

### Bước 5: Kiểm Tra File .env

Đảm bảo file `backend/.env` có:
```env
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

**Lưu ý:**
- Không có khoảng trắng
- Không có dấu ngoặc kép
- Không có trailing slash

### Bước 6: Khởi Động Lại Server

```bash
# Dừng server (Ctrl + C)
# Khởi động lại
npm start
```

### Bước 7: Test Lại

1. Truy cập: `http://localhost:5000/api/auth/google`
2. Nếu vẫn lỗi, đợi thêm 2-3 phút và thử lại
3. Kiểm tra lại URL trong Google Console

## 🔍 Debug

### Kiểm Tra Callback URL Trong Code

Thêm log vào `backend/strategies/google.strategy.js`:
```javascript
console.log('Callback URL:', googleCallbackUrl);
```

### Kiểm Tra Request URL

Mở Developer Tools (F12) > Network tab, xem request đến Google:
- URL sẽ có dạng: `https://accounts.google.com/o/oauth2/v2/auth?...&redirect_uri=...`
- Copy `redirect_uri` parameter và so sánh với URL trong Google Console

## 📝 Checklist

- [ ] Đã chạy script check config
- [ ] Đã kiểm tra URL trong Google Console
- [ ] URL khớp chính xác (không có trailing slash, đúng protocol, đúng port)
- [ ] Đã save trong Google Console
- [ ] Đã đợi 1-2 phút sau khi save
- [ ] Đã khởi động lại server
- [ ] Đã test lại

## 🚀 Production

Khi deploy lên production:

1. **Cập nhật .env:**
   ```env
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   ```

2. **Thêm vào Google Console:**
   - `https://yourdomain.com/api/auth/google/callback`

3. **Đảm bảo HTTPS:**
   - Google OAuth yêu cầu HTTPS trong production
   - Không dùng HTTP cho production

## ❓ Vẫn Không Được?

1. **Xóa và tạo lại OAuth Client ID:**
   - Xóa Client ID cũ
   - Tạo Client ID mới
   - Copy Client ID và Secret mới vào .env

2. **Kiểm tra OAuth Consent Screen:**
   - Đảm bảo đã cấu hình OAuth consent screen
   - Thêm email của bạn vào Test users (nếu ở chế độ Testing)

3. **Kiểm tra Domain:**
   - Production: Domain phải được verify trong Google Console

