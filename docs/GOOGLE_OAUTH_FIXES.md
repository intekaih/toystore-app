# 🔧 Các Lỗi Đã Sửa - Google OAuth Implementation

## ✅ Đã Sửa

### 1. **Auth Controller - Login Function**
**Vấn đề:** Nếu user có `MatKhau = NULL` (tài khoản Google-only), `bcrypt.compare()` sẽ bị lỗi.

**Giải pháp:**
- Kiểm tra `user.MatKhau` trước khi so sánh
- Kiểm tra `LoginMethod === 'Google'` để báo lỗi rõ ràng
- Trả về thông báo: "Tài khoản này chỉ đăng nhập được bằng Google"

### 2. **Auth Controller - Register Function**
**Vấn đề:** Không set `LoginMethod = 'Password'` khi đăng ký bằng password.

**Giải pháp:**
- Thêm `LoginMethod: 'Password'` khi tạo tài khoản mới

### 3. **Auth Controller - Response Data**
**Vấn đề:** Không include `GoogleID` và `LoginMethod` trong response.

**Giải pháp:**
- Thêm `GoogleID` và `LoginMethod` vào DTO response cho:
  - `login()` function
  - `register()` function
  - `adminLogin()` function

### 4. **User Controller - Get Profile**
**Vấn đề:** Không include `GoogleID` và `LoginMethod` trong profile response.

**Giải pháp:**
- Thêm `GoogleID` và `LoginMethod` vào attributes query
- Thêm vào DTO response

### 5. **Admin Login**
**Vấn đề:** Không kiểm tra `MatKhau = NULL` cho admin login.

**Giải pháp:**
- Thêm kiểm tra tương tự như user login
- Thêm `GoogleID` và `LoginMethod` vào response

## 📋 Test Cases Cần Kiểm Tra

### ✅ Test Case 1: Đăng nhập bằng Password (tài khoản Password-only)
- User có `LoginMethod = 'Password'` và `MatKhau != NULL`
- ✅ Phải đăng nhập được bằng username/password
- ✅ Không thể đăng nhập bằng Google (nếu chưa liên kết)

### ✅ Test Case 2: Đăng nhập bằng Google (tài khoản Google-only)
- User có `LoginMethod = 'Google'` và `MatKhau = NULL`
- ✅ Phải đăng nhập được bằng Google
- ✅ Không thể đăng nhập bằng username/password (trả về lỗi rõ ràng)

### ✅ Test Case 3: Đăng nhập bằng cả hai (tài khoản Both)
- User có `LoginMethod = 'Both'` và `MatKhau != NULL` và `GoogleID != NULL`
- ✅ Phải đăng nhập được bằng username/password
- ✅ Phải đăng nhập được bằng Google

### ✅ Test Case 4: Liên kết Google với tài khoản hiện có
- User đã có tài khoản với password
- Đăng nhập bằng Google với email trùng
- ✅ Tự động liên kết Google
- ✅ `LoginMethod` chuyển thành `'Both'`
- ✅ Vẫn đăng nhập được bằng password

### ✅ Test Case 5: Profile Response
- Kiểm tra `/api/users/profile` trả về đầy đủ:
  - `googleId` (hoặc `null`)
  - `loginMethod` ('Password', 'Google', hoặc 'Both')

## 🔍 Các Trường Hợp Edge Case

### 1. User đăng ký bằng password, sau đó đăng nhập bằng Google
- ✅ Tự động liên kết
- ✅ `LoginMethod` = 'Both'

### 2. User đăng ký bằng Google, sau đó thử đăng nhập bằng password
- ✅ Trả về lỗi: "Tài khoản này chỉ đăng nhập được bằng Google"

### 3. User có email trùng nhưng GoogleID khác
- ✅ Trả về lỗi: "Email đã được sử dụng bởi tài khoản Google khác"

### 4. User profile không có GoogleID/LoginMethod
- ✅ Trả về `null` hoặc giá trị mặc định

## 📝 Lưu Ý

1. **DTOMapper**: Tự động convert `GoogleID` → `googleId`, `LoginMethod` → `loginMethod`
2. **Database**: Đảm bảo đã chạy migration để thêm các cột mới
3. **Frontend**: Có thể sử dụng `user.googleId` và `user.loginMethod` để hiển thị UI phù hợp

## 🚀 Next Steps (Optional)

1. **UI Enhancement**: Hiển thị badge "Đăng nhập bằng Google" cho user có `loginMethod = 'Google'`
2. **Account Linking**: Cho phép user liên kết Google với tài khoản password hiện có từ profile page
3. **Account Unlinking**: Cho phép user hủy liên kết Google (nếu có password backup)

