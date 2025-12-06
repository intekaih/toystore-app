# 🚀 ToyStore - Hướng Dẫn Cài Đặt

## 📋 Yêu cầu hệ thống

- **Node.js** >= 14.x
- **SQL Server** 2019 hoặc mới hơn
- **npm** hoặc **yarn**

---

## 🔧 Cài đặt và Chạy

### Bước 1: Clone Repository

```bash
git clone <repository-url>
cd toystore-app
```

### Bước 2: Setup Database

1. Mở **SQL Server Management Studio (SSMS)**
2. Chạy file `db/toystore.sql` để tạo database và các bảng
3. Database sẽ được tạo với tên: `toystore`

### Bước 3: Setup Backend

```bash
cd backend
npm install
```

**Cấu hình Database:**

Tạo file `.env` trong thư mục `backend/` với nội dung:

```env
DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=your_password
DB_NAME=toystore
DB_PORT=1433

JWT_SECRET=your_jwt_secret_key
PORT=5000
```

**Chạy Backend:**

```bash
npm start
# Backend chạy tại: http://localhost:5000
```

**Tạo tài khoản Admin:**

```bash
node create-default-admin.js
```

### Bước 4: Setup Frontend

```bash
cd frontend
npm install
npm start
# Frontend chạy tại: http://localhost:3000
```

---

## 🔑 Tài khoản mặc định

**Admin:**
- Username: `admin`
- Password: `admin123`

**User:**
- Username: `user1`
- Password: `user123`

---

## 📝 Lưu ý

- Đảm bảo SQL Server đang chạy trước khi start backend
- File `db/toystore.sql` đã bao gồm tất cả bảng và dữ liệu mẫu
- Backend mặc định chạy tại port **5000**
- Frontend mặc định chạy tại port **3000**
