# 🎯 HƯỚNG DẪN SỬ DỤNG STRATEGY PATTERN - DỰ ÁN TOYSTORE

## ✅ ĐÃ HOÀN THÀNH

Strategy Pattern đã được áp dụng thành công vào dự án **ToyStore**!

---

## 📁 CẤU TRÚC FILE ĐÃ TẠO

```
backend/
├── strategies/                          ✅ Thư mục mới
│   ├── ProductFilterStrategy.js         ✅ Base class
│   ├── NewestStrategy.js                ✅ Sắp xếp mới nhất
│   ├── PriceAscendingStrategy.js        ✅ Giá tăng dần
│   ├── PriceDescendingStrategy.js       ✅ Giá giảm dần
│   ├── BestSellerStrategy.js            ✅ Bán chạy nhất
│   └── FilterContext.js                 ✅ Context quản lý
│
├── controllers/
│   └── product.controller.js            ✅ Đã cập nhật
│
└── STRATEGY_PATTERN_GUIDE.md            ✅ Tài liệu chi tiết
```

---

## 🚀 CÁCH SỬ DỤNG

### 1️⃣ **Sắp xếp theo mới nhất** (mặc định)

```bash
GET http://localhost:5000/api/products?filter=newest
```

**Kết quả:** Sản phẩm có `NgayTao` mới nhất hiển thị trước

---

### 2️⃣ **Sắp xếp giá tăng dần** (rẻ → đắt)

```bash
GET http://localhost:5000/api/products?filter=priceAsc
```

**Kết quả:** Sản phẩm có `GiaBan` thấp nhất hiển thị trước

---

### 3️⃣ **Sắp xếp giá giảm dần** (đắt → rẻ)

```bash
GET http://localhost:5000/api/products?filter=priceDesc
```

**Kết quả:** Sản phẩm có `GiaBan` cao nhất hiển thị trước

---

### 4️⃣ **Sắp xếp theo bán chạy nhất**

```bash
GET http://localhost:5000/api/products?filter=bestSeller
```

**Kết quả:** Sản phẩm có tổng `SoLuong` bán ra nhiều nhất hiển thị trước

**Response sẽ bao gồm:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "tenSP": "Búp bê Barbie",
        "giaBan": 250000,
        "soLuongBan": 150,  ← Thêm field này
        ...
      }
    ]
  }
}
```

---

### 5️⃣ **Kết hợp nhiều filters**

#### Lọc theo giá + sắp xếp:
```bash
GET http://localhost:5000/api/products?filter=priceAsc&minPrice=100000&maxPrice=500000
```

#### Lọc theo danh mục + sắp xếp:
```bash
GET http://localhost:5000/api/products?filter=bestSeller&categoryId=2
```

#### Tìm kiếm + lọc + sắp xếp + phân trang:
```bash
GET http://localhost:5000/api/products?filter=priceDesc&search=lego&minPrice=200000&categoryId=1&page=1&limit=10
```

---

## 📊 RESPONSE FORMAT

Mọi request đều trả về format chuẩn:

```json
{
  "success": true,
  "message": "Lấy danh sách sản phẩm thành công",
  "data": {
    "products": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProducts": 48,
      "productsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "filterType": "priceAsc",
      "search": null,
      "minPrice": 100000,
      "maxPrice": 500000,
      "categoryId": null,
      "availableFilters": [
        "newest",
        "priceAsc",
        "priceDesc",
        "bestSeller"
      ]
    }
  }
}
```

---

## 🧪 TEST NGAY

### Bước 1: Khởi động server
```bash
cd backend
npm start
```

### Bước 2: Test bằng Postman hoặc curl

#### Test 1: Sản phẩm mới nhất
```bash
curl "http://localhost:5000/api/products?filter=newest&limit=5"
```

#### Test 2: Giá tăng dần
```bash
curl "http://localhost:5000/api/products?filter=priceAsc&limit=5"
```

#### Test 3: Bán chạy nhất
```bash
curl "http://localhost:5000/api/products?filter=bestSeller&limit=5"
```

#### Test 4: Kết hợp filters
```bash
curl "http://localhost:5000/api/products?filter=priceDesc&minPrice=100000&maxPrice=500000&categoryId=1"
```

---

## 🎯 MAPPING QUERY PARAMETERS

| Query Parameter | Ý nghĩa | Giá trị hợp lệ | Mặc định |
|----------------|---------|----------------|----------|
| `filter` | Loại sắp xếp | `newest`, `priceAsc`, `priceDesc`, `bestSeller` | `newest` |
| `search` | Tìm kiếm theo tên | String | null |
| `minPrice` | Giá tối thiểu | Number | null |
| `maxPrice` | Giá tối đa | Number | null |
| `categoryId` | ID danh mục (LoaiID) | Number | null |
| `page` | Trang hiện tại | Number (>= 1) | 1 |
| `limit` | Số sản phẩm/trang | Number (1-100) | 10 |

---

## 🔧 THÊM STRATEGY MỚI

### Ví dụ: Thêm "Sản phẩm đang giảm giá"

**Bước 1:** Tạo `backend/strategies/DiscountStrategy.js`

```javascript
const ProductFilterStrategy = require('./ProductFilterStrategy');

class DiscountStrategy extends ProductFilterStrategy {
  filter(products, query = {}) {
    let filtered = [...products];
    
    // Lọc cơ bản
    filtered = this.filterByPriceRange(filtered, query.minPrice, query.maxPrice);
    filtered = this.filterByCategory(filtered, query.categoryId);
    
    // TODO: Thêm logic lọc sản phẩm giảm giá
    // Ví dụ: filtered = filtered.filter(p => p.PhanTramGiamGia > 0);
    
    // Sắp xếp theo % giảm giá cao nhất
    // filtered.sort((a, b) => b.PhanTramGiamGia - a.PhanTramGiamGia);
    
    return filtered;
  }
}

module.exports = DiscountStrategy;
```

**Bước 2:** Cập nhật `backend/strategies/FilterContext.js`

```javascript
const DiscountStrategy = require('./DiscountStrategy');

// Trong constructor:
this.strategies = {
  newest: new NewestStrategy(),
  priceAsc: new PriceAscendingStrategy(),
  priceDesc: new PriceDescendingStrategy(),
  bestSeller: new BestSellerStrategy(),
  discount: new DiscountStrategy(), // ← Thêm dòng này
};
```

**Bước 3:** Sử dụng ngay!

```bash
GET http://localhost:5000/api/products?filter=discount
```

**✅ Không cần sửa:**
- Controller
- Routes
- Models
- Database

---

## 💡 LỢI ÍCH ĐÃ ĐẠT ĐƯỢC

### ✅ Trước khi dùng Strategy Pattern:
```javascript
// Controller phức tạp, khó bảo trì
if (filterType === 'newest') {
  products.sort((a, b) => b.NgayTao - a.NgayTao);
} else if (filterType === 'priceAsc') {
  products.sort((a, b) => a.GiaBan - b.GiaBan);
} else if (filterType === 'priceDesc') {
  products.sort((a, b) => b.GiaBan - a.GiaBan);
} else if (filterType === 'bestSeller') {
  // Logic phức tạp...
}
// Thêm filter mới = sửa controller = NGUY HIỂM!
```

### ✅ Sau khi dùng Strategy Pattern:
```javascript
// Controller gọn gàng, 1 dòng code
const filteredProducts = FilterContext.applyFilter(
  plainProducts,
  filterType,
  queryParams
);
// Thêm filter mới = thêm file = AN TOÀN!
```

---

## 🎓 KIẾN THỨC ĐÃ ÁP DỤNG

1. ✅ **Strategy Pattern** - Behavioral Design Pattern
2. ✅ **Singleton Pattern** - FilterContext là singleton
3. ✅ **Inheritance** - Tất cả strategies extends ProductFilterStrategy
4. ✅ **Polymorphism** - Các strategy khác nhau cùng interface filter()
5. ✅ **SOLID Principles**:
   - **S**ingle Responsibility
   - **O**pen/Closed
   - **D**ependency Inversion

---

## 📚 TÀI LIỆU CHI TIẾT

Xem file **STRATEGY_PATTERN_GUIDE.md** để hiểu rõ hơn về:
- Cơ chế hoạt động Strategy Pattern
- Giải thích code từng dòng
- So sánh Before/After
- Hướng dẫn mở rộng chi tiết

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. BestSellerStrategy cần dữ liệu ChiTietHoaDon

Controller tự động include `chiTietHoaDons` khi `filter=bestSeller`:

```javascript
if (filterType === 'bestSeller') {
  includeOptions.push({
    model: ChiTietHoaDon,
    as: 'chiTietHoaDons',
    attributes: ['SoLuong'],
    required: false
  });
}
```

### 2. Phân trang áp dụng SAU khi lọc

```
Query DB → Lấy tất cả sản phẩm
    ↓
Áp dụng Strategy → Lọc & sắp xếp
    ↓
Phân trang → Slice theo page/limit
```

### 3. Tên trường database

Đảm bảo sử dụng đúng tên trường:
- ✅ `GiaBan` (không phải `Gia`)
- ✅ `LoaiID` (không phải `MaLoai`)
- ✅ `NgayTao` (không phải `createdAt`)
- ✅ `chiTietHoaDons` (alias trong model)

---

## 🐛 TROUBLESHOOTING

### Lỗi: "filterType không tồn tại"

**Nguyên nhân:** Gửi filter type không hợp lệ

**Giải pháp:** Kiểm tra danh sách filters có sẵn:

```bash
GET /api/products?filter=invalid
```

Response sẽ có:
```json
"availableFilters": ["newest", "priceAsc", "priceDesc", "bestSeller"]
```

### Lỗi: "Cannot read property 'chiTietHoaDons'"

**Nguyên nhân:** Dùng `bestSeller` nhưng không include ChiTietHoaDon

**Giải pháp:** Controller đã xử lý tự động, kiểm tra lại code

---

## 🎉 KẾT LUẬN

**Strategy Pattern đã được áp dụng thành công!**

- ✅ Code sạch hơn, dễ đọc hơn
- ✅ Dễ bảo trì, dễ mở rộng
- ✅ Tuân thủ SOLID principles
- ✅ Không cần if-else dài dòng
- ✅ Thêm strategy mới chỉ cần thêm file

**Hãy test ngay và trải nghiệm sức mạnh của Design Pattern!** 🚀

---

*Tạo bởi: ToyStore Development Team*  
*Ngày: October 26, 2025*
