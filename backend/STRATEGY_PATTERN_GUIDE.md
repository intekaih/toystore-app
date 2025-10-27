# 🎯 Strategy Pattern - Hướng Dẫn Chi Tiết

## 📋 Mục lục
1. [Giới thiệu Strategy Pattern](#giới-thiệu)
2. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
3. [Cơ chế hoạt động](#cơ-chế-hoạt-động)
4. [Giải thích từng file](#giải-thích-từng-file)
5. [Cách sử dụng thực tế](#cách-sử-dụng)
6. [Lợi ích của Strategy Pattern](#lợi-ích)
7. [Mở rộng strategy mới](#mở-rộng)

---

## 🎯 Giới thiệu Strategy Pattern {#giới-thiệu}

**Strategy Pattern** là một trong những Design Pattern thuộc nhóm **Behavioral Patterns** (Mẫu hành vi).

### Định nghĩa:
> Strategy Pattern cho phép định nghĩa một họ các thuật toán (algorithms), đóng gói từng thuật toán thành các class riêng biệt, và làm cho chúng có thể thay thế lẫn nhau. Strategy giúp thuật toán thay đổi độc lập với client sử dụng nó.

### Khi nào sử dụng:
- ✅ Khi bạn có nhiều cách xử lý khác nhau cho cùng một tác vụ
- ✅ Khi muốn tránh sử dụng nhiều câu lệnh if-else/switch-case
- ✅ Khi muốn dễ dàng thêm cách xử lý mới mà không sửa code cũ
- ✅ Khi muốn tách biệt logic nghiệp vụ ra khỏi controller

### Trong dự án này:
Chúng ta áp dụng Strategy Pattern để xử lý **nhiều kiểu lọc/sắp xếp sản phẩm**:
- 📅 Sắp xếp theo ngày mới nhất
- 💰 Sắp xếp theo giá (tăng/giảm)
- 🔥 Sắp xếp theo bán chạy nhất

---

## 📁 Cấu trúc thư mục {#cấu-trúc-thư-mục}

```
backend/
├── strategies/                          # Thư mục chứa tất cả strategies
│   ├── ProductFilterStrategy.js         # ⭐ Base class (Abstract/Interface)
│   ├── NewestStrategy.js                # 📅 Chiến lược sắp xếp theo mới nhất
│   ├── PriceAscendingStrategy.js        # 💰 Chiến lược sắp xếp giá tăng dần
│   ├── PriceDescendingStrategy.js       # 💰 Chiến lược sắp xếp giá giảm dần
│   ├── BestSellerStrategy.js            # 🔥 Chiến lược sắp xếp theo bán chạy
│   └── FilterContext.js                 # 🎯 Context - Chọn và thực thi strategy
│
└── controllers/
    └── product.controller.js            # 🎮 Controller sử dụng strategies
```

---

## 🧠 Cơ chế hoạt động {#cơ-chế-hoạt-động}

### Luồng xử lý:

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. Client gửi request                                               │
│    GET /api/products?filter=newest&minPrice=100&maxPrice=500        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. Controller nhận request                                          │
│    - Lấy filterType = 'newest'                                      │
│    - Lấy queryParams = { minPrice: 100, maxPrice: 500 }             │
│    - Query database lấy tất cả sản phẩm                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. Controller gọi FilterContext                                     │
│    FilterContext.applyFilter(products, 'newest', queryParams)       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. FilterContext chọn Strategy                                      │
│    - Tra cứu trong registry: strategies['newest']                   │
│    - Trả về instance của NewestStrategy                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. FilterContext thực thi Strategy                                  │
│    strategy.filter(products, queryParams)                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 6. NewestStrategy xử lý                                             │
│    - Lọc theo khoảng giá (100-500)                                  │
│    - Sắp xếp theo ngày thêm mới nhất                                │
│    - Trả về danh sách sản phẩm đã lọc                               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 7. Controller nhận kết quả                                          │
│    - Áp dụng phân trang                                             │
│    - Format response                                                │
│    - Trả về cho client                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Điểm mạnh của luồng này:
- ✅ **Controller không cần biết** strategy nào đang được sử dụng
- ✅ **Không có if-else** để chọn thuật toán
- ✅ **Dễ dàng thêm mới** strategy mà không sửa controller
- ✅ **Tách biệt trách nhiệm**: Controller lo phân trang/response, Strategy lo lọc/sắp xếp

---

## 📝 Giải thích từng file {#giải-thích-từng-file}

### 1️⃣ ProductFilterStrategy.js - Base Class

**Vai trò:** Định nghĩa interface chung cho tất cả strategies

```javascript
class ProductFilterStrategy {
  // Phương thức bắt buộc phải implement
  filter(products, query) {
    throw new Error('Method filter() must be implemented');
  }
  
  // Helper methods dùng chung
  filterByPriceRange(products, minPrice, maxPrice) { ... }
  filterByCategory(products, categoryId) { ... }
}
```

**Giải thích:**
- **Line 1-4:** Định nghĩa class cơ sở với phương thức `filter()` abstract
- **Line 3:** Throw error để bắt buộc class con phải override phương thức này
- **Line 7-14:** Helper method lọc theo khoảng giá - dùng chung cho nhiều strategy
- **Line 16-20:** Helper method lọc theo danh mục - tái sử dụng code

**Tại sao cần Base Class?**
- Đảm bảo mọi strategy đều có phương thức `filter()`
- Tạo tính đồng nhất (consistency) khi sử dụng
- Chia sẻ code chung (DRY principle)

---

### 2️⃣ NewestStrategy.js - Sắp xếp theo mới nhất

**Vai trò:** Sắp xếp sản phẩm từ mới đến cũ

```javascript
class NewestStrategy extends ProductFilterStrategy {
  filter(products, query = {}) {
    // Bước 1: Clone array để tránh mutate original
    let filtered = [...products];
    
    // Bước 2: Áp dụng các filter cơ bản
    filtered = this.filterByPriceRange(filtered, query.minPrice, query.maxPrice);
    filtered = this.filterByCategory(filtered, query.categoryId);
    
    // Bước 3: Sắp xếp theo ngày thêm (mới nhất trước)
    filtered.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return b.MaSP - a.MaSP; // Fallback
    });
    
    return filtered;
  }
}
```

**Giải thích từng bước:**

1. **Line 3-4:** Clone array bằng spread operator `[...products]`
   - Tránh thay đổi mảng gốc (immutability)
   - Đảm bảo side-effect free

2. **Line 7-8:** Gọi helper methods từ base class
   - Lọc theo giá nếu có `minPrice` hoặc `maxPrice`
   - Lọc theo danh mục nếu có `categoryId`

3. **Line 11-16:** Sắp xếp theo thời gian
   - Ưu tiên sort theo `createdAt` nếu có
   - Fallback: sort theo `MaSP` (giả định MaSP tăng dần theo thời gian)
   - `b - a` = giảm dần (mới nhất trước)

---

### 3️⃣ PriceAscendingStrategy.js - Giá tăng dần

**Vai trò:** Sắp xếp từ rẻ đến đắt

```javascript
filtered.sort((a, b) => {
  const priceA = parseFloat(a.Gia) || 0;
  const priceB = parseFloat(b.Gia) || 0;
  return priceA - priceB; // Tăng dần: a - b
});
```

**Giải thích:**
- **Line 2-3:** Parse giá về số, fallback về 0 nếu null/undefined
- **Line 4:** `a - b` = sắp xếp tăng dần (ascending)
  - Nếu `priceA < priceB` → trả về số âm → a đứng trước b
  - Nếu `priceA > priceB` → trả về số dương → b đứng trước a

---

### 4️⃣ PriceDescendingStrategy.js - Giá giảm dần

**Vai trò:** Sắp xếp từ đắt đến rẻ

```javascript
return priceB - priceA; // Giảm dần: b - a
```

**Khác biệt:** Đảo ngược thứ tự so với PriceAscendingStrategy

---

### 5️⃣ BestSellerStrategy.js - Bán chạy nhất

**Vai trò:** Sắp xếp theo số lượng đã bán

```javascript
filter(products, query = {}) {
  let filtered = [...products];
  
  // Bước 1: Lọc cơ bản
  filtered = this.filterByPriceRange(filtered, query.minPrice, query.maxPrice);
  filtered = this.filterByCategory(filtered, query.categoryId);
  
  // Bước 2: Tính tổng số lượng bán
  const productsWithSalesCount = filtered.map(product => {
    let totalSold = 0;
    
    if (product.ChiTietHoaDons && Array.isArray(product.ChiTietHoaDons)) {
      totalSold = product.ChiTietHoaDons.reduce((sum, detail) => {
        return sum + (detail.SoLuong || 0);
      }, 0);
    }
    
    return {
      ...product.toJSON ? product.toJSON() : product,
      totalSold
    };
  });
  
  // Bước 3: Sắp xếp theo số lượng bán
  productsWithSalesCount.sort((a, b) => b.totalSold - a.totalSold);
  
  return productsWithSalesCount;
}
```

**Giải thích chi tiết:**

1. **Line 9-16:** Tính tổng số lượng bán
   - Kiểm tra xem sản phẩm có dữ liệu `ChiTietHoaDons` không
   - Dùng `reduce()` để tính tổng `SoLuong` từ tất cả các đơn hàng
   - `reduce((sum, detail) => sum + detail.SoLuong, 0)`:
     - `sum`: tổng tích lũy
     - `detail`: mỗi phần tử ChiTietHoaDon
     - `0`: giá trị khởi đầu

2. **Line 18-21:** Thêm thuộc tính `totalSold` vào product
   - Spread operator `...product` để giữ nguyên các thuộc tính cũ
   - Thêm thuộc tính mới `totalSold`

3. **Line 25:** Sắp xếp giảm dần theo `totalSold`
   - `b.totalSold - a.totalSold` = bán nhiều nhất trước

**Lưu ý quan trọng:**
- Controller phải **include ChiTietHoaDon** khi query database
- Nếu không có data → `totalSold = 0`

---

### 6️⃣ FilterContext.js - Context Class ⭐ QUAN TRỌNG NHẤT

**Vai trò:** Trung tâm điều phối strategies

```javascript
class FilterContext {
  constructor() {
    // Strategy Registry - Mapping filterType → Strategy instance
    this.strategies = {
      newest: new NewestStrategy(),
      priceAsc: new PriceAscendingStrategy(),
      priceDesc: new PriceDescendingStrategy(),
      bestSeller: new BestSellerStrategy(),
    };
    
    this.defaultStrategy = 'newest';
  }
  
  // Phương thức chính
  applyFilter(products, filterType, queryParams = {}) {
    const strategy = this.getStrategy(filterType);
    return strategy.filter(products, queryParams);
  }
  
  // Chọn strategy dựa trên filterType
  getStrategy(filterType) {
    return this.strategies[filterType] || this.strategies[this.defaultStrategy];
  }
  
  // Lấy danh sách filters có sẵn
  getAvailableFilters() {
    return Object.keys(this.strategies);
  }
}

// Export singleton instance
module.exports = new FilterContext();
```

**Giải thích từng phần:**

1. **Constructor (Line 2-12):**
   - Khởi tạo `strategies` object chứa tất cả strategy instances
   - **Key** = filterType (string): `'newest'`, `'priceAsc'`, etc.
   - **Value** = Strategy instance: `new NewestStrategy()`
   - Định nghĩa strategy mặc định

2. **applyFilter() (Line 15-18):**
   - **Input:**
     - `products`: mảng sản phẩm từ database
     - `filterType`: loại filter client yêu cầu
     - `queryParams`: các tham số bổ sung (minPrice, maxPrice, categoryId)
   - **Xử lý:**
     - Gọi `getStrategy()` để lấy strategy phù hợp
     - Gọi `strategy.filter()` để thực thi
   - **Output:** Mảng sản phẩm đã lọc/sắp xếp

3. **getStrategy() (Line 21-23):**
   - Tra cứu trong registry: `this.strategies[filterType]`
   - Nếu không tìm thấy → dùng strategy mặc định
   - **Pattern:** Dictionary/Map lookup (O(1) time complexity)

4. **getAvailableFilters() (Line 26-28):**
   - Trả về danh sách tất cả filterType có sẵn
   - Hữu ích cho frontend hiển thị dropdown/select options

5. **Singleton Pattern (Line 32):**
   - Export **instance** thay vì class
   - Đảm bảo toàn app dùng chung 1 instance
   - Tiết kiệm memory, dễ quản lý state

**Tại sao đây là trung tâm của Strategy Pattern?**
- ✅ **Tách biệt logic chọn strategy** ra khỏi controller
- ✅ **Không cần if-else** để chọn strategy
- ✅ **Dễ dàng mở rộng**: chỉ cần thêm vào `strategies` object
- ✅ **Single Responsibility**: chỉ lo việc chọn và thực thi strategy

---

### 7️⃣ product.controller.js - Sử dụng Strategy

**Những thay đổi quan trọng:**

```javascript
// 1. Import FilterContext
const FilterContext = require('../strategies/FilterContext');

// 2. Trong getAllProducts()
exports.getAllProducts = async (req, res) => {
  // Lấy filterType từ query string
  const filterType = req.query.filter || 'newest';
  const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
  const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : null;
  
  // ... Query database ...
  
  // Áp dụng Strategy Pattern
  const queryParams = { minPrice, maxPrice, categoryId };
  const plainProducts = rows.map(p => p.toJSON());
  
  const filteredProducts = FilterContext.applyFilter(
    plainProducts,
    filterType,
    queryParams
  );
  
  // Phân trang sau khi lọc
  const paginatedProducts = filteredProducts.slice(offset, offset + limit);
  
  // Trả về response với filter info
  res.json({
    success: true,
    data: {
      products: paginatedProducts,
      pagination: { ... },
      filters: {
        filterType: filterType,
        availableFilters: FilterContext.getAvailableFilters()
      }
    }
  });
};
```

**Giải thích luồng xử lý:**

1. **Line 7-10:** Parse query parameters
   - `filter`: loại sắp xếp
   - `minPrice`, `maxPrice`: khoảng giá
   - `categoryId`: lọc theo danh mục

2. **Line 15-16:** Chuẩn bị dữ liệu
   - Chuyển Sequelize models → plain objects bằng `toJSON()`
   - Tạo object `queryParams` chứa các tham số lọc

3. **Line 18-22:** Áp dụng Strategy
   - Gọi `FilterContext.applyFilter()`
   - **Không có if-else, không có switch-case**
   - FilterContext tự động chọn strategy phù hợp

4. **Line 25:** Phân trang sau khi lọc
   - Lọc/sắp xếp TRƯỚC
   - Phân trang SAU
   - Đảm bảo kết quả đúng

5. **Line 34:** Trả về danh sách filters có sẵn
   - Frontend có thể hiển thị các option filter
   - Tự động cập nhật khi thêm strategy mới

---

## 🚀 Cách sử dụng thực tế {#cách-sử-dụng}

### 1. Sắp xếp theo mới nhất (mặc định)

```bash
GET /api/products?filter=newest
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      { "id": 10, "tenSP": "Búp bê Elsa 2024", "ngayTao": "2024-01-15" },
      { "id": 9, "tenSP": "Lego Star Wars", "ngayTao": "2024-01-10" },
      { "id": 8, "tenSP": "Robot biến hình", "ngayTao": "2024-01-05" }
    ],
    "filters": {
      "filterType": "newest",
      "availableFilters": ["newest", "priceAsc", "priceDesc", "bestSeller"]
    }
  }
}
```

---

### 2. Sắp xếp theo giá tăng dần

```bash
GET /api/products?filter=priceAsc
```

**Kết quả:** Sản phẩm rẻ nhất hiển thị trước

---

### 3. Sắp xếp theo giá giảm dần

```bash
GET /api/products?filter=priceDesc
```

**Kết quả:** Sản phẩm đắt nhất hiển thị trước

---

### 4. Sắp xếp theo bán chạy nhất

```bash
GET /api/products?filter=bestSeller
```

**Kết quả:** Sản phẩm có `totalSold` cao nhất trước

**Response bao gồm số lượng bán:**
```json
{
  "products": [
    { 
      "id": 5, 
      "tenSP": "Búp bê Barbie", 
      "soLuongBan": 150 
    },
    { 
      "id": 3, 
      "tenSP": "Lego City", 
      "soLuongBan": 120 
    }
  ]
}
```

---

### 5. Kết hợp nhiều filters

```bash
GET /api/products?filter=priceAsc&minPrice=100&maxPrice=500&categoryId=2
```

**Ý nghĩa:**
- Lọc sản phẩm có giá từ 100-500
- Thuộc danh mục ID = 2
- Sắp xếp theo giá tăng dần

---

### 6. Kết hợp với phân trang và tìm kiếm

```bash
GET /api/products?filter=bestSeller&search=barbie&page=1&limit=10
```

**Ý nghĩa:**
- Tìm sản phẩm có tên chứa "barbie"
- Sắp xếp theo bán chạy nhất
- Trang 1, mỗi trang 10 sản phẩm

---

## 💡 Lợi ích của Strategy Pattern {#lợi-ích}

### 1️⃣ Tránh If-Else Hell

**❌ TRƯỚC KHI dùng Strategy Pattern:**

```javascript
// Controller rất phức tạp và khó bảo trì
if (filterType === 'newest') {
  products.sort((a, b) => b.NgayTao - a.NgayTao);
} else if (filterType === 'priceAsc') {
  products.sort((a, b) => a.Gia - b.Gia);
} else if (filterType === 'priceDesc') {
  products.sort((a, b) => b.Gia - a.Gia);
} else if (filterType === 'bestSeller') {
  // Logic phức tạp tính toán bán chạy
  products = products.map(p => {
    // ...
  }).sort(...);
}
// Thêm filter mới = thêm else if = sửa controller
```

**✅ SAU KHI dùng Strategy Pattern:**

```javascript
// Controller gọn gàng, dễ hiểu
const filteredProducts = FilterContext.applyFilter(
  products,
  filterType,
  queryParams
);
// Thêm filter mới = thêm file strategy = KHÔNG sửa controller
```

---

### 2️⃣ Open/Closed Principle (SOLID)

> "Open for extension, closed for modification"

- ✅ **Open for extension:** Dễ dàng thêm strategy mới
- ✅ **Closed for modification:** Không cần sửa code cũ

**Ví dụ thêm strategy mới:**

```javascript
// 1. Tạo file DiscountStrategy.js
class DiscountStrategy extends ProductFilterStrategy {
  filter(products, query) {
    // Lọc sản phẩm đang giảm giá
    return products.filter(p => p.GiamGia > 0)
                   .sort((a, b) => b.GiamGia - a.GiamGia);
  }
}

// 2. Đăng ký trong FilterContext.js
this.strategies = {
  // ...existing strategies...
  discount: new DiscountStrategy(), // ← Chỉ thêm 1 dòng này
};

// 3. Sử dụng ngay
GET /api/products?filter=discount
```

**Không cần sửa:**
- ❌ Controller
- ❌ Routes
- ❌ Các strategy khác
- ❌ Database

---

### 3️⃣ Single Responsibility Principle

Mỗi class chỉ có 1 trách nhiệm:

| Class | Trách nhiệm |
|-------|-------------|
| **ProductFilterStrategy** | Định nghĩa interface |
| **NewestStrategy** | Sắp xếp theo mới nhất |
| **PriceAscendingStrategy** | Sắp xếp theo giá tăng |
| **BestSellerStrategy** | Sắp xếp theo bán chạy |
| **FilterContext** | Chọn và thực thi strategy |
| **ProductController** | Xử lý HTTP request/response |

---

### 4️⃣ Testability (Dễ test)

Mỗi strategy có thể test độc lập:

```javascript
// test/strategies/NewestStrategy.test.js
const NewestStrategy = require('../strategies/NewestStrategy');

describe('NewestStrategy', () => {
  it('should sort products by newest first', () => {
    const strategy = new NewestStrategy();
    const products = [
      { MaSP: 1, NgayTao: '2024-01-01' },
      { MaSP: 3, NgayTao: '2024-01-15' },
      { MaSP: 2, NgayTao: '2024-01-10' }
    ];
    
    const result = strategy.filter(products, {});
    
    expect(result[0].MaSP).toBe(3); // Mới nhất
    expect(result[1].MaSP).toBe(2);
    expect(result[2].MaSP).toBe(1);
  });
});
```

---

### 5️⃣ Reusability (Tái sử dụng)

Strategies có thể dùng ở nhiều nơi:

```javascript
// Dùng trong Controller khác
const FilterContext = require('../strategies/FilterContext');

// Admin controller
exports.getTopSellingProducts = async (req, res) => {
  const products = await SanPham.findAll({ include: ChiTietHoaDon });
  const topProducts = FilterContext.applyFilter(products, 'bestSeller', {});
  // ...
};

// Report controller
exports.getProductReport = async (req, res) => {
  const products = await SanPham.findAll();
  const sortedProducts = FilterContext.applyFilter(products, 'priceDesc', {});
  // ...
};
```

---

## 🔧 Mở rộng Strategy mới {#mở-rộng}

### Ví dụ: Thêm strategy "Đánh giá cao nhất"

**Bước 1:** Tạo file `HighestRatingStrategy.js`

```javascript
const ProductFilterStrategy = require('./ProductFilterStrategy');

class HighestRatingStrategy extends ProductFilterStrategy {
  filter(products, query = {}) {
    let filtered = [...products];
    
    // Lọc cơ bản
    filtered = this.filterByPriceRange(filtered, query.minPrice, query.maxPrice);
    filtered = this.filterByCategory(filtered, query.categoryId);
    
    // Sắp xếp theo rating
    filtered.sort((a, b) => {
      const ratingA = a.DanhGiaTrungBinh || 0;
      const ratingB = b.DanhGiaTrungBinh || 0;
      return ratingB - ratingA; // Cao nhất trước
    });
    
    return filtered;
  }
}

module.exports = HighestRatingStrategy;
```

**Bước 2:** Đăng ký trong `FilterContext.js`

```javascript
const HighestRatingStrategy = require('./HighestRatingStrategy');

class FilterContext {
  constructor() {
    this.strategies = {
      // ...existing...
      rating: new HighestRatingStrategy(), // ← Thêm dòng này
    };
  }
}
```

**Bước 3:** Sử dụng ngay!

```bash
GET /api/products?filter=rating
```

---

### Ví dụ: Thêm strategy "Sản phẩm đang giảm giá"

```javascript
// DiscountStrategy.js
class DiscountStrategy extends ProductFilterStrategy {
  filter(products, query = {}) {
    let filtered = [...products];
    
    // Chỉ lấy sản phẩm có giảm giá
    filtered = filtered.filter(p => p.PhanTramGiamGia > 0);
    
    // Lọc theo khoảng giá
    filtered = this.filterByPriceRange(filtered, query.minPrice, query.maxPrice);
    
    // Sắp xếp theo % giảm giá cao nhất
    filtered.sort((a, b) => b.PhanTramGiamGia - a.PhanTramGiamGia);
    
    return filtered;
  }
}
```

---

## 📊 So sánh Before/After

### ❌ TRƯỚC (Without Strategy Pattern)

**Nhược điểm:**
- Controller quá dài, khó đọc
- Logic nghiệp vụ lẫn lộn với xử lý HTTP
- Thêm filter mới = sửa controller (vi phạm Open/Closed)
- Khó test từng logic lọc riêng lẻ
- Duplicate code (lọc giá, danh mục lặp lại nhiều nơi)

### ✅ SAU (With Strategy Pattern)

**Ưu điểm:**
- Controller gọn gàng, chỉ lo HTTP
- Logic lọc tách biệt, dễ bảo trì
- Thêm filter mới = thêm file, không sửa controller
- Test dễ dàng, coverage cao
- DRY (Don't Repeat Yourself) - helper methods trong base class

---

## 🎯 Kết luận

**Strategy Pattern giúp:**
1. ✅ Tách biệt logic lọc ra khỏi controller
2. ✅ Loại bỏ if-else dài dòng
3. ✅ Dễ dàng mở rộng (thêm strategy mới)
4. ✅ Tuân thủ SOLID principles
5. ✅ Code dễ test, dễ bảo trì

**Khi nào nên dùng:**
- Có nhiều cách xử lý khác nhau cho cùng 1 tác vụ
- Muốn tránh if-else/switch-case phức tạp
- Cần linh hoạt thêm cách xử lý mới
- Muốn code clean, dễ đọc, dễ maintain

---

## 📚 Tài liệu tham khảo

- **Design Patterns: Elements of Reusable Object-Oriented Software** (Gang of Four)
- **Head First Design Patterns**
- **Refactoring Guru:** https://refactoring.guru/design-patterns/strategy

---

*Tạo bởi: Strategy Pattern Implementation*  
*Ngày: 2024*
