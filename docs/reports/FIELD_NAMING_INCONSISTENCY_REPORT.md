# 🔍 Báo Cáo Lỗi Không Nhất Quán Tên Trường (Field Naming Inconsistency)

## 📅 Ngày: 17/11/2025

## 🎯 Tóm Tắt
Backend đang sử dụng **PascalCase** trong database models nhưng chuyển đổi sang **camelCase** khi trả về response. Frontend một số nơi còn đang tìm tên **PascalCase** gốc, gây ra lỗi dữ liệu không hiển thị đúng.

---

## ✅ ĐÃ SỬA

### 1. LoaiSP (Category)
- ❌ **Lỗi cũ**: Frontend dùng `Enable` nhưng backend trả về `TrangThai`
- ✅ **Đã sửa**: 
  - `backend/controllers/category.controller.js` - Đổi `Enable` → `TrangThai`
  - `frontend/src/pages/CategoryManagementPage.js` - Đổi `cat.Enable` → `cat.TrangThai`
  - `frontend/src/components/CategoryTable.js` - Đổi `category.Enable` → `category.TrangThai`

---

## ❌ VẪN CÒN VẤN ĐỀ

### 2. TaiKhoan (User/Account)
**Backend Model:** `TrangThai` (BOOLEAN)

**Backend Controller Response:** `enable` (camelCase)
```javascript
// backend/controllers/admin.user.controller.js
{
  enable: user.TrangThai  // ✅ Đúng
}
```

**Frontend Issues:**
```javascript
// ❌ LỖI: Một số nơi dùng Enable (PascalCase)
// frontend/src/contexts/AuthContext.js:26-28
const enableValue = userData.Enable !== undefined 
  ? userData.Enable 
  : (userData.enable !== undefined ? userData.enable : true);

// frontend/src/pages/EditProfilePage.js:63
enable: userData.Enable !== undefined ? userData.Enable : userData.enable

// frontend/src/pages/ProfilePage.js:200,204
(user.enable !== undefined ? user.enable : user.Enable)
```

**✅ Nơi đúng:** 
- `UserManagementPage.js` - Dùng `user.enable` ✅
- `UserTable.js` - Dùng `user.enable` ✅

---

### 3. SanPham (Product)
**Backend Model:** `TrangThai` (BOOLEAN)

**Backend Controller:** Trả về `enable` (camelCase)

**Frontend:** ✅ Tất cả đều dùng `product.enable` (nhất quán)

---

### 4. Voucher
**Backend Model:** `TrangThai` (STRING: 'HoatDong', 'TamDung', 'HetHan')

**Backend Controller:** Trả về `trangThai` (camelCase)

**Frontend:** ✅ Tất cả đều dùng `voucher.trangThai` (nhất quán)

---

### 5. HoaDon (Order)
**Backend Model:** 
- `ThanhTien` (DECIMAL) - Tổng tiền cuối
- `TrangThai` (STRING) - Trạng thái đơn hàng

**Backend Controller:** Trả về `thanhTien`, `tongTien`, `trangThai` (camelCase)

**Frontend:** ✅ Tất cả đều dùng camelCase (nhất quán)

---

### 6. ChiTietHoaDon (Order Detail)
**Backend Model:** `ThanhTien` (DECIMAL)

**Backend Controller:** Trả về `thanhTien` (camelCase)

**Frontend:** ✅ Tất cả đều dùng `item.thanhTien` (nhất quán)

---

## 🔧 HÀNH ĐỘNG CẦN THIẾT

### Sửa Frontend - TaiKhoan (User)
Cần sửa 3 files để loại bỏ việc tìm `Enable` (PascalCase):

1. **`frontend/src/contexts/AuthContext.js`** - Dòng 26-28
2. **`frontend/src/pages/EditProfilePage.js`** - Dòng 63
3. **`frontend/src/pages/ProfilePage.js`** - Dòng 200, 204

**Giải pháp:** Bỏ fallback `userData.Enable` và `user.Enable`, chỉ dùng `enable` (camelCase)

---

## 📝 QUY TẮC ĐẶT TÊN THỐNG NHẤT

### Backend
- **Database Model**: Dùng **PascalCase** (theo convention SQL Server)
  ```javascript
  TrangThai: { type: Sequelize.BOOLEAN }
  ThanhTien: { type: Sequelize.DECIMAL(18, 2) }
  ```

- **Controller Response**: Chuyển sang **camelCase** cho frontend
  ```javascript
  {
    trangThai: model.TrangThai,
    thanhTien: model.ThanhTien,
    enable: model.TrangThai  // Alias cho boolean status
  }
  ```

### Frontend
- **Luôn dùng camelCase** nhận từ backend
  ```javascript
  user.enable      // ✅ Đúng
  user.Enable      // ❌ Sai
  
  order.thanhTien  // ✅ Đúng
  order.ThanhTien  // ❌ Sai
  ```

---

## 🎯 KẾT LUẬN

**Vấn đề gốc rễ:** Thiếu quy ước đặt tên nhất quán giữa backend và frontend.

**Giải pháp:** 
1. ✅ Backend đã làm đúng - chuyển đổi sang camelCase
2. ❌ Frontend một số nơi còn dùng PascalCase cũ
3. 🔧 Cần sửa 3 files frontend để hoàn tất

**Ưu tiên sửa:** TaiKhoan (User) vì ảnh hưởng đến authentication và profile
