# 📚 HƯỚNG DẪN SỬ DỤNG DTO MAPPER

## 🎯 Mục đích

DTOMapper giải quyết vấn đề **inconsistent naming convention** giữa:
- **Database SQL Server**: PascalCase (`ID`, `Ten`, `GiaBan`, `HoTen`...)
- **Frontend JavaScript**: camelCase (`id`, `ten`, `giaBan`, `hoTen`...)

## 📦 Import

```javascript
const DTOMapper = require('../utils/DTOMapper');
```

## 🔧 Cách sử dụng

### 1️⃣ Chuyển đổi response từ Database → Frontend

**Use case**: Trả dữ liệu từ controller về frontend

```javascript
// ❌ TRƯỚC KHI DÙNG DTO MAPPER
exports.getProduct = async (req, res) => {
  const product = await db.SanPham.findByPk(req.params.id);
  
  res.json({
    success: true,
    data: {
      // Frontend phải xử lý PascalCase
      ID: product.ID,
      Ten: product.Ten,
      GiaBan: product.GiaBan,
      Ton: product.Ton
    }
  });
};

// ✅ SAU KHI DÙNG DTO MAPPER
exports.getProduct = async (req, res) => {
  const product = await db.SanPham.findByPk(req.params.id);
  
  // Tự động convert PascalCase → camelCase
  const productDTO = DTOMapper.toCamelCase(product.toJSON());
  
  res.json({
    success: true,
    data: productDTO // { id, ten, giaBan, ton }
  });
};
```

### 2️⃣ Chuyển đổi request từ Frontend → Database

**Use case**: Nhận dữ liệu từ frontend để insert/update database

```javascript
// ❌ TRƯỚC KHI DÙNG DTO MAPPER
exports.createProduct = async (req, res) => {
  // Frontend gửi camelCase
  const { ten, giaBan, ton, loaiId } = req.body;
  
  // Phải manually convert sang PascalCase
  const product = await db.SanPham.create({
    Ten: ten,
    GiaBan: giaBan,
    Ton: ton,
    LoaiID: loaiId
  });
  
  res.json({ success: true, data: product });
};

// ✅ SAU KHI DÙNG DTO MAPPER
exports.createProduct = async (req, res) => {
  // Tự động convert camelCase → PascalCase
  const productData = DTOMapper.toPascalCase(req.body);
  
  const product = await db.SanPham.create(productData);
  
  const productDTO = DTOMapper.toCamelCase(product.toJSON());
  res.json({ success: true, data: productDTO });
};
```

### 3️⃣ Sử dụng mapToDTO với options

**Use case**: Ẩn thông tin nhạy cảm, custom mapping

```javascript
// Ví dụ: Trả thông tin user nhưng ẩn password
exports.getProfile = async (req, res) => {
  const user = await db.TaiKhoan.findByPk(req.user.id);
  
  const userDTO = DTOMapper.mapToDTO(user.toJSON(), {
    excludeFields: ['matKhau', 'refreshToken'], // Ẩn fields nhạy cảm
    customMapping: {
      'hoTen': 'fullName',  // Đổi tên field
      'dienThoai': 'phone'
    }
  });
  
  res.json({ success: true, data: userDTO });
};
```

### 4️⃣ Xử lý Array và Nested Objects

```javascript
// ✅ DTOMapper tự động xử lý array và nested objects
exports.getOrders = async (req, res) => {
  const orders = await db.HoaDon.findAll({
    include: [
      { model: db.ChiTietHoaDon, as: 'chiTiet' },
      { model: db.KhachHang, as: 'khachHang' }
    ]
  });
  
  // Tự động convert toàn bộ nested data
  const ordersDTO = DTOMapper.toCamelCase(
    orders.map(o => o.toJSON())
  );
  
  res.json({
    success: true,
    data: ordersDTO
    // Output: [{ id, maHD, chiTiet: [...], khachHang: {...} }]
  });
};
```

## 📋 API Methods

### `DTOMapper.toCamelCase(obj)`
Chuyển PascalCase → camelCase (Database → Frontend)

### `DTOMapper.toPascalCase(obj)`
Chuyển camelCase → PascalCase (Frontend → Database)

### `DTOMapper.mapToDTO(data, options)`
Map response với options:
- `excludeFields`: Array - Ẩn fields
- `includeFields`: Array - Chỉ trả về fields này
- `customMapping`: Object - Custom field names

### `DTOMapper.mapFromDTO(data, options)`
Map request với custom mapping

## 🎨 Best Practices

### ✅ DO:
```javascript
// 1. Luôn convert khi trả về frontend
const data = DTOMapper.toCamelCase(dbResult);

// 2. Convert khi nhận từ frontend
const dbData = DTOMapper.toPascalCase(req.body);

// 3. Ẩn thông tin nhạy cảm
const userDTO = DTOMapper.mapToDTO(user, {
  excludeFields: ['matKhau']
});
```

### ❌ DON'T:
```javascript
// 1. Không trả raw database data
res.json({ data: dbResult }); // ❌ PascalCase cho frontend

// 2. Không manually convert từng field
const data = {
  id: dbResult.ID,
  ten: dbResult.Ten,
  giaBan: dbResult.GiaBan
}; // ❌ Tốn thời gian và dễ sai sót
```

## 🔄 Migration Plan

### Phase 1: Áp dụng cho Controllers mới
Tất cả controllers mới **BẮT BUỘC** sử dụng DTOMapper

### Phase 2: Refactor controllers cũ (Khuyến nghị)
Dần dần refactor các controllers hiện tại để sử dụng DTOMapper

### Phase 3: Middleware tự động (Tương lai)
Có thể tạo middleware tự động convert toàn bộ responses

## 📝 Examples

### Example 1: Product Controller
```javascript
const DTOMapper = require('../utils/DTOMapper');

exports.getAllProducts = async (req, res) => {
  const products = await db.SanPham.findAll({
    include: [{ model: db.LoaiSP, as: 'loaiSP' }]
  });
  
  const productsDTO = DTOMapper.toCamelCase(
    products.map(p => p.toJSON())
  );
  
  res.json({ success: true, data: productsDTO });
};
```

### Example 2: User Controller
```javascript
exports.updateProfile = async (req, res) => {
  // Convert request từ frontend
  const updateData = DTOMapper.toPascalCase(req.body);
  
  await db.TaiKhoan.update(updateData, {
    where: { ID: req.user.id }
  });
  
  const user = await db.TaiKhoan.findByPk(req.user.id);
  
  // Convert response về frontend
  const userDTO = DTOMapper.mapToDTO(user.toJSON(), {
    excludeFields: ['matKhau']
  });
  
  res.json({ success: true, data: userDTO });
};
```

## 🚀 Performance

- **Fast**: Chỉ loop qua object keys một lần
- **Memory efficient**: Không tạo unnecessary copies
- **Recursive**: Tự động xử lý nested objects
- **Type safe**: Giữ nguyên Date, null, undefined

## ⚠️ Lưu ý

1. **Sequelize toJSON()**: Nhớ gọi `.toJSON()` trước khi convert
   ```javascript
   // ✅ Correct
   DTOMapper.toCamelCase(product.toJSON())
   
   // ❌ Wrong - Sequelize instance có thêm nhiều properties
   DTOMapper.toCamelCase(product)
   ```

2. **Date objects**: Tự động được preserve
3. **Null/Undefined**: Được giữ nguyên
4. **Arrays**: Tự động convert từng element

## 📞 Support

Nếu gặp vấn đề, liên hệ team backend hoặc tạo issue.

---
**Version**: 1.0.0  
**Last Updated**: January 2025  
**Author**: Backend Team

