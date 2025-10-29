# 🎓 GIẢI THÍCH CHI TIẾT STRATEGY PATTERN - DỄ HIỂU

## 📚 MỤC LỤC
1. [Strategy Pattern là gì?](#strategy-pattern-là-gì)
2. [Tại sao cần Strategy Pattern?](#tại-sao-cần-strategy-pattern)
3. [Giải thích từng dòng code ProductFilterStrategy.js](#giải-thích-productfilterstrategyjs)
4. [Giải thích từng dòng code các Concrete Strategy](#giải-thích-concrete-strategy)
5. [Giải thích từng dòng code FilterContext.js](#giải-thích-filtercontextjs)
6. [Giải thích cách sử dụng trong Controller](#giải-thích-trong-controller)
7. [Luồng hoạt động chi tiết](#luồng-hoạt-động-chi-tiết)

---

## 🎯 Strategy Pattern là gì?

### Ví dụ đời thường:
Hãy tưởng tượng bạn đi từ nhà đến trường, có **nhiều cách di chuyển**:
- 🚶 Đi bộ: Chậm nhưng rẻ, tốt cho sức khỏe
- 🚌 Xe buýt: Vừa phải, tiết kiệm
- 🏍️ Xe máy: Nhanh, linh hoạt
- 🚗 Ô tô: Thoải mái nhưng tốn kém

**Mỗi cách = 1 Strategy (Chiến lược)**
- Tùy tình huống (thời tiết, thời gian, tiền bạc) → **Chọn strategy phù hợp**
- Đích đến giống nhau (đến trường) nhưng **cách thức khác nhau**

**Strategy Pattern = Hệ thống chọn phương án**
- Có nhiều cách giải quyết 1 vấn đề (nhiều thuật toán)
- Chọn cách nào dựa vào tình huống cụ thể
- Dễ dàng thêm cách mới mà không sửa code cũ

### Lợi ích:
✅ Linh hoạt (dễ thay đổi thuật toán)
✅ Mở rộng dễ dàng (thêm strategy mới không ảnh hưởng code cũ)
✅ Code sạch (tách biệt logic các thuật toán)
✅ Dễ test (test từng strategy riêng biệt)

---

## 🔍 Tại sao cần Strategy Pattern?

### ❌ Không dùng Strategy Pattern (Vấn đề):

```javascript
// Controller lộn xộn với nhiều if-else
exports.getAllProducts = async (req, res) => {
  const filterType = req.query.filter;
  let products = await SanPham.findAll();
  
  // ❌ Code rất dài và phức tạp!
  if (filterType === 'priceAsc') {
    // Sắp xếp theo giá tăng dần
    products.sort((a, b) => a.GiaBan - b.GiaBan);
    
  } else if (filterType === 'priceDesc') {
    // Sắp xếp theo giá giảm dần
    products.sort((a, b) => b.GiaBan - a.GiaBan);
    
  } else if (filterType === 'bestSeller') {
    // Tính tổng số lượng bán
    products = products.map(p => {
      let total = 0;
      if (p.chiTietHoaDons) {
        total = p.chiTietHoaDons.reduce((sum, ct) => sum + ct.SoLuong, 0);
      }
      return { ...p, totalSold: total };
    });
    products.sort((a, b) => b.totalSold - a.totalSold);
    
  } else if (filterType === 'newest') {
    // Sắp xếp theo ngày tạo mới nhất
    products.sort((a, b) => new Date(b.NgayTao) - new Date(a.NgayTao));
    
  } else if (filterType === 'discount') {
    // TODO: Thêm logic cho discount...
  }
  // ... còn nhiều else if nữa!
  
  res.json({ data: products });
};

// ❌ Vấn đề:
// 1. Controller quá dài, khó đọc
// 2. Thêm filter mới phải sửa controller
// 3. Khó test từng logic riêng
// 4. Vi phạm nguyên tắc Single Responsibility
```

### ✅ Dùng Strategy Pattern (Giải pháp):

```javascript
// Controller gọn gàng, dễ hiểu
const FilterContext = require('../strategies/FilterContext');

exports.getAllProducts = async (req, res) => {
  const filterType = req.query.filter || 'newest';
  let products = await SanPham.findAll();
  
  // ✅ Chỉ 1 dòng code!
  const filteredProducts = FilterContext.applyFilter(
    products, 
    filterType, 
    req.query
  );
  
  res.json({ data: filteredProducts });
};

// ✅ Lợi ích:
// 1. Controller ngắn gọn, dễ đọc
// 2. Thêm filter mới không cần sửa controller
// 3. Mỗi strategy test riêng được
// 4. Tuân thủ SOLID principles
```

---

## 📖 Giải thích ProductFilterStrategy.js

### 🧩 Đây là Base Class (Abstract Class)

```javascript
class ProductFilterStrategy {
  filter(products, query) {
    throw new Error('Method filter() must be implemented by subclass');
  }
```

**Giải thích từng dòng:**

1. **`class ProductFilterStrategy`** = Class cơ sở cho tất cả strategy
   - Giống như "khuôn mẫu" mà các class con phải tuân theo
   - Không dùng trực tiếp, chỉ để kế thừa

2. **`filter(products, query)`** = Phương thức BẮT BUỘC phải có
   - `products` = Danh sách sản phẩm cần lọc/sắp xếp
   - `query` = Tham số (minPrice, maxPrice, categoryId...)
   - Trả về danh sách đã được xử lý

3. **`throw new Error(...)`** = Ném lỗi nếu class con không implement
   ```javascript
   // Nếu tạo strategy mới mà quên override filter()
   class MyStrategy extends ProductFilterStrategy {
     // ❌ Quên implement filter()
   }
   
   const strategy = new MyStrategy();
   strategy.filter(products, {}); 
   // ❌ LỖI: Method filter() must be implemented by subclass
   ```

**Ví dụ so sánh với đời thường:**
```javascript
// Giống như quy định:
// "Mọi phương tiện di chuyển PHẢI CÓ hàm move()"

class Vehicle {
  move() {
    throw new Error('Phải implement move()!');
  }
}

class Car extends Vehicle {
  move() { console.log('Lái xe'); }  // ✅ OK
}

class Bike extends Vehicle {
  move() { console.log('Đạp xe'); }  // ✅ OK
}

class Plane extends Vehicle {
  // ❌ Quên implement move() → sẽ lỗi khi gọi
}
```

---

```javascript
  filterByPriceRange(products, minPrice, maxPrice) {
    if (!minPrice && !maxPrice) return products;
```

**Giải thích:**

1. **`filterByPriceRange(...)`** = Helper method (phương thức hỗ trợ)
   - Lọc sản phẩm theo khoảng giá
   - Dùng chung cho nhiều strategy (tránh lặp code)

2. **`if (!minPrice && !maxPrice)`** = Kiểm tra có tham số lọc không
   - `!minPrice` = Không có giá tối thiểu
   - `&&` = VÀ
   - `!maxPrice` = Không có giá tối đa
   - → Nếu cả 2 đều không có → trả về nguyên bản (không lọc)

**Ví dụ:**
```javascript
// Case 1: Không có tham số
filterByPriceRange(products, null, null);
// → Trả về tất cả products (không lọc)

// Case 2: Chỉ có minPrice
filterByPriceRange(products, 100000, null);
// → Lọc sản phẩm >= 100,000đ

// Case 3: Chỉ có maxPrice
filterByPriceRange(products, null, 500000);
// → Lọc sản phẩm <= 500,000đ

// Case 4: Có cả 2
filterByPriceRange(products, 100000, 500000);
// → Lọc sản phẩm từ 100,000đ đến 500,000đ
```

---

```javascript
    return products.filter(product => {
      const price = parseFloat(product.GiaBan) || 0;
      if (minPrice && price < minPrice) return false;
      if (maxPrice && price > maxPrice) return false;
      return true;
    });
  }
```

**Giải thích từng dòng:**

1. **`products.filter(product => {...})`** = Lọc mảng
   - `filter()` = Hàm built-in của JavaScript
   - Duyệt qua từng sản phẩm
   - Nếu return `true` → giữ lại
   - Nếu return `false` → loại bỏ

2. **`const price = parseFloat(product.GiaBan) || 0;`** = Chuyển giá sang số
   - `product.GiaBan` = Giá bán (có thể là string: "150000")
   - `parseFloat()` = Chuyển thành số thực: 150000
   - `|| 0` = Nếu lỗi (undefined, null) → gán = 0

3. **`if (minPrice && price < minPrice) return false;`** = Kiểm tra giá tối thiểu
   - `minPrice` = Có giá tối thiểu không? (true/false)
   - `&&` = VÀ
   - `price < minPrice` = Giá nhỏ hơn giá tối thiểu?
   - → Nếu đúng → return `false` (loại bỏ sản phẩm này)

4. **`if (maxPrice && price > maxPrice) return false;`** = Kiểm tra giá tối đa
   - Tương tự: Nếu giá > tối đa → loại bỏ

5. **`return true;`** = Giữ lại sản phẩm
   - Nếu vượt qua 2 điều kiện trên → sản phẩm hợp lệ

**Ví dụ minh họa:**
```javascript
const products = [
  { Ten: 'Búp bê', GiaBan: 50000 },
  { Ten: 'Xe mô hình', GiaBan: 150000 },
  { Ten: 'Lego', GiaBan: 500000 },
  { Ten: 'Robot', GiaBan: 800000 }
];

// Lọc từ 100,000 đến 600,000
const filtered = filterByPriceRange(products, 100000, 600000);
// Kết quả:
// [
//   { Ten: 'Xe mô hình', GiaBan: 150000 },  ✅ OK
//   { Ten: 'Lego', GiaBan: 500000 }         ✅ OK
// ]
// Búp bê: 50,000 < 100,000 → ❌ Loại
// Robot: 800,000 > 600,000 → ❌ Loại
```

---

```javascript
  filterByCategory(products, categoryId) {
    if (!categoryId) return products;
    return products.filter(product => product.LoaiID == categoryId);
  }
```

**Giải thích:**

1. **`if (!categoryId)`** = Nếu không có categoryId → trả về tất cả
2. **`product.LoaiID == categoryId`** = So sánh danh mục
   - `==` (so sánh lỏng): "1" == 1 → true
   - Tại sao không dùng `===`? Vì categoryId có thể là string từ query

**Ví dụ:**
```javascript
const products = [
  { Ten: 'Búp bê Barbie', LoaiID: 1 },    // Búp bê
  { Ten: 'Xe Ferrari', LoaiID: 2 },       // Xe đồ chơi
  { Ten: 'Búp bê Elsa', LoaiID: 1 },      // Búp bê
  { Ten: 'Lego City', LoaiID: 3 }         // Lego
];

filterByCategory(products, 1);
// Kết quả:
// [
//   { Ten: 'Búp bê Barbie', LoaiID: 1 },
//   { Ten: 'Búp bê Elsa', LoaiID: 1 }
// ]
```

---

## 📖 Giải thích Concrete Strategy

### 🎯 PriceAscendingStrategy.js - Sắp xếp giá tăng dần

```javascript
class PriceAscendingStrategy extends ProductFilterStrategy {
  filter(products, query = {}) {
```

**Giải thích:**

1. **`extends ProductFilterStrategy`** = Kế thừa Base Class
   - Phải implement method `filter()`
   - Có thể dùng helper methods: `filterByPriceRange()`, `filterByCategory()`

2. **`filter(products, query = {})`** = Override method bắt buộc
   - `query = {}` = Giá trị mặc định là object rỗng (nếu không truyền)

---

```javascript
    let filtered = [...products];
```

**Giải thích:**

1. **`[...products]`** = Clone mảng (Spread operator)
   - Tạo bản copy của `products`
   - Tại sao clone? Để không làm thay đổi mảng gốc

**Ví dụ so sánh:**
```javascript
// ❌ KHÔNG clone - Nguy hiểm!
let filtered = products;
filtered.sort(...);  // Sắp xếp filtered
// → products GỐC cũng bị sắp xếp theo! (vì cùng tham chiếu)

// ✅ Clone - An toàn
let filtered = [...products];
filtered.sort(...);  // Chỉ sắp xếp filtered
// → products GỐC không bị ảnh hưởng
```

---

```javascript
    filtered = this.filterByPriceRange(
      filtered, 
      query.minPrice, 
      query.maxPrice
    );
```

**Giải thích:**

1. **`this.filterByPriceRange(...)`** = Gọi helper method từ Base Class
   - `this` = instance hiện tại của PriceAscendingStrategy
   - Lọc sản phẩm theo khoảng giá

2. **`query.minPrice`** = Lấy giá trị từ object query
   - Ví dụ: `query = { minPrice: 100000, maxPrice: 500000 }`
   - `query.minPrice` = 100000

**Luồng xử lý:**
```javascript
// Input:
products = [50k, 150k, 500k, 800k]
query = { minPrice: 100000, maxPrice: 600000 }

// Sau filterByPriceRange:
filtered = [150k, 500k]  // Đã loại bỏ 50k và 800k
```

---

```javascript
    filtered = this.filterByCategory(filtered, query.categoryId);
```

**Giải thích:**
- Tiếp tục lọc theo danh mục (nếu có)
- Áp dụng lên kết quả đã lọc giá ở trên

**Luồng xử lý:**
```javascript
// Sau filterByPriceRange:
filtered = [
  { Ten: 'Xe Ferrari', GiaBan: 150000, LoaiID: 2 },
  { Ten: 'Búp bê', GiaBan: 200000, LoaiID: 1 },
  { Ten: 'Lego', GiaBan: 500000, LoaiID: 3 }
]

// Lọc theo categoryId = 2:
filtered = [
  { Ten: 'Xe Ferrari', GiaBan: 150000, LoaiID: 2 }
]
```

---

```javascript
    filtered.sort((a, b) => {
      const priceA = parseFloat(a.GiaBan) || 0;
      const priceB = parseFloat(b.GiaBan) || 0;
      return priceA - priceB;
    });
```

**Giải thích chi tiết:**

1. **`filtered.sort((a, b) => {...})`** = Sắp xếp mảng
   - `sort()` = Hàm built-in của JavaScript
   - `(a, b)` = So sánh 2 phần tử liền kề
   - Return số âm → a đứng trước b
   - Return số dương → b đứng trước a
   - Return 0 → giữ nguyên

2. **`parseFloat(a.GiaBan) || 0`** = Chuyển giá sang số
   - Tương tự như đã giải thích ở trên

3. **`return priceA - priceB`** = Công thức sắp xếp TĂNG DẦN
   - Nếu `priceA < priceB` → `priceA - priceB` = số âm → a trước b ✅
   - Nếu `priceA > priceB` → `priceA - priceB` = số dương → b trước a
   - Kết quả: Thấp nhất đến cao nhất

**Ví dụ minh họa:**
```javascript
// Input:
[
  { Ten: 'Lego', GiaBan: 500000 },
  { Ten: 'Búp bê', GiaBan: 200000 },
  { Ten: 'Xe', GiaBan: 150000 }
]

// Quá trình sort:
// So sánh Lego (500k) vs Búp bê (200k):
//   500000 - 200000 = 300000 (dương) → Búp bê trước Lego

// So sánh Búp bê (200k) vs Xe (150k):
//   200000 - 150000 = 50000 (dương) → Xe trước Búp bê

// Kết quả cuối cùng (TĂNG DẦN):
[
  { Ten: 'Xe', GiaBan: 150000 },       // Thấp nhất
  { Ten: 'Búp bê', GiaBan: 200000 },
  { Ten: 'Lego', GiaBan: 500000 }      // Cao nhất
]
```

**So sánh TĂNG DẦN vs GIẢM DẦN:**
```javascript
// TĂNG DẦN (Ascending):
return priceA - priceB;  // Thấp → Cao

// GIẢM DẦN (Descending):
return priceB - priceA;  // Cao → Thấp
```

---

```javascript
    return filtered;
  }
}
```

**Giải thích:**
- Trả về mảng đã được lọc và sắp xếp
- Controller sẽ nhận kết quả này để trả về client

---

### 🎯 BestSellerStrategy.js - Sắp xếp theo bán chạy

```javascript
  filter(products, query = {}) {
    let filtered = [...products];
    
    filtered = this.filterByPriceRange(filtered, query.minPrice, query.maxPrice);
    filtered = this.filterByCategory(filtered, query.categoryId);
```

**Giải thích:**
- Tương tự PriceAscendingStrategy
- Bước 1: Clone mảng
- Bước 2: Lọc theo giá
- Bước 3: Lọc theo danh mục

---

```javascript
    const productsWithSalesCount = filtered.map(product => {
      let totalSold = 0;
      
      if (product.chiTietHoaDons && Array.isArray(product.chiTietHoaDons)) {
```

**Giải thích từng dòng:**

1. **`filtered.map(product => {...})`** = Transform mỗi sản phẩm
   - `map()` = Duyệt qua từng phần tử, biến đổi và trả về mảng mới
   - Khác với `filter()` (lọc), `map()` biến đổi

2. **`let totalSold = 0;`** = Khởi tạo biến đếm số lượng bán

3. **`if (product.chiTietHoaDons && ...)`** = Kiểm tra có dữ liệu không
   - `product.chiTietHoaDons` = Mảng chi tiết hóa đơn (include từ Sequelize)
   - `&&` = VÀ
   - `Array.isArray(...)` = Kiểm tra có phải mảng không

**Tại sao phải kiểm tra?**
```javascript
// Case 1: Sản phẩm chưa bán
product.chiTietHoaDons = []  // Mảng rỗng

// Case 2: Không include (quên include)
product.chiTietHoaDons = undefined  // Lỗi nếu không kiểm tra

// Case 3: Sản phẩm có bán
product.chiTietHoaDons = [
  { SoLuong: 5 },
  { SoLuong: 3 }
]
```

---

```javascript
        totalSold = product.chiTietHoaDons.reduce((sum, detail) => {
          return sum + (detail.SoLuong || 0);
        }, 0);
      }
```

**Giải thích chi tiết:**

1. **`reduce((sum, detail) => {...}, 0)`** = Tính tổng
   - `reduce()` = Hàm tích lũy (accumulator)
   - `sum` = Tổng tích lũy (bắt đầu từ 0)
   - `detail` = Mỗi chi tiết hóa đơn
   - `0` = Giá trị khởi đầu của sum

2. **`sum + (detail.SoLuong || 0)`** = Cộng dồn số lượng
   - `detail.SoLuong` = Số lượng bán trong 1 đơn hàng
   - `|| 0` = Nếu null/undefined → dùng 0

**Ví dụ minh họa:**
```javascript
product.chiTietHoaDons = [
  { SoLuong: 5 },   // Đơn hàng 1: bán 5 cái
  { SoLuong: 3 },   // Đơn hàng 2: bán 3 cái
  { SoLuong: 7 }    // Đơn hàng 3: bán 7 cái
];

// Quá trình reduce:
// Bước 1: sum = 0, detail = {SoLuong: 5} → sum = 0 + 5 = 5
// Bước 2: sum = 5, detail = {SoLuong: 3} → sum = 5 + 3 = 8
// Bước 3: sum = 8, detail = {SoLuong: 7} → sum = 8 + 7 = 15

totalSold = 15  // Tổng đã bán 15 cái
```

---

```javascript
      return {
        ...(product.toJSON ? product.toJSON() : product),
        totalSold
      };
    });
```

**Giải thích:**

1. **`product.toJSON ? product.toJSON() : product`** = Chuyển Sequelize model → plain object
   - `product.toJSON` = Method của Sequelize Model
   - Nếu có → gọi `toJSON()` để lấy plain object
   - Nếu không (đã là plain object) → dùng luôn

2. **`...(...)` = Spread object** = Copy tất cả properties
   ```javascript
   // Ví dụ:
   const product = { ID: 1, Ten: 'Búp bê', GiaBan: 100000 };
   const newProduct = { ...product, totalSold: 10 };
   // Kết quả:
   // { ID: 1, Ten: 'Búp bê', GiaBan: 100000, totalSold: 10 }
   ```

3. **`totalSold`** = Thêm property mới (ES6 shorthand)
   - Tương đương: `{ totalSold: totalSold }`

**Kết quả:**
```javascript
// Input:
{
  ID: 1,
  Ten: 'Búp bê Barbie',
  GiaBan: 150000,
  chiTietHoaDons: [
    { SoLuong: 5 },
    { SoLuong: 3 }
  ]
}

// Output:
{
  ID: 1,
  Ten: 'Búp bê Barbie',
  GiaBan: 150000,
  chiTietHoaDons: [...],
  totalSold: 8  // ← Thêm property mới
}
```

---

```javascript
    productsWithSalesCount.sort((a, b) => {
      return b.totalSold - a.totalSold;
    });
```

**Giải thích:**

1. **`b.totalSold - a.totalSold`** = Sắp xếp GIẢM DẦN
   - Ngược với tăng dần (`a - b`)
   - Bán nhiều nhất → đứng đầu

**Ví dụ:**
```javascript
// Input:
[
  { Ten: 'Búp bê', totalSold: 5 },
  { Ten: 'Xe', totalSold: 15 },
  { Ten: 'Lego', totalSold: 10 }
]

// So sánh:
// Búp bê (5) vs Xe (15): 15 - 5 = 10 (dương) → Xe trước
// Xe (15) vs Lego (10): 10 - 15 = -5 (âm) → Xe vẫn trước
// Lego (10) vs Búp bê (5): 5 - 10 = -5 (âm) → Lego trước Búp bê

// Output (GIẢM DẦN - Bán chạy nhất trước):
[
  { Ten: 'Xe', totalSold: 15 },        // #1 Bán chạy nhất
  { Ten: 'Lego', totalSold: 10 },      // #2
  { Ten: 'Búp bê', totalSold: 5 }      // #3
]
```

---

## 📖 Giải thích FilterContext.js

### 🧩 Phần 1: Constructor - Đăng ký Strategies

```javascript
class FilterContext {
  constructor() {
    this.strategies = {
      newest: new NewestStrategy(),
      priceAsc: new PriceAscendingStrategy(),
      priceDesc: new PriceDescendingStrategy(),
      bestSeller: new BestSellerStrategy(),
    };
```

**Giải thích:**

1. **`this.strategies = {...}`** = Object lưu trữ tất cả strategy instances
   - Key = Tên filter (string)
   - Value = Instance của Strategy class

2. **`newest: new NewestStrategy()`** = Tạo instance ngay trong constructor
   - Mỗi strategy được tạo 1 lần duy nhất
   - Tái sử dụng trong suốt vòng đời app

**Ví dụ tương tự:**
```javascript
// Giống như menu nhà hàng:
const menu = {
  pho: new PhoRecipe(),        // Công thức nấu phở
  banhMi: new BanhMiRecipe(),  // Công thức làm bánh mì
  cafe: new CafeRecipe()       // Công thức pha cà phê
};

// Khách hàng gọi món:
const dish = menu['pho'];  // Lấy công thức phở
dish.cook();               // Nấu món
```

---

```javascript
    this.defaultStrategy = 'newest';
  }
```

**Giải thích:**
- Strategy mặc định nếu client không chỉ định
- Ví dụ: `GET /api/products` (không có `?filter=...`)
  → Dùng `newest` strategy

---

### 🧩 Phần 2: applyFilter() - Phương thức chính

```javascript
  applyFilter(products, filterType, queryParams = {}) {
    const strategy = this.getStrategy(filterType);
```

**Giải thích:**

1. **`applyFilter(...)`** = Method public, được Controller gọi
   - `products` = Danh sách sản phẩm từ database
   - `filterType` = Loại filter ('newest', 'priceAsc'...)
   - `queryParams` = Tham số khác (minPrice, maxPrice...)

2. **`this.getStrategy(filterType)`** = Lấy strategy tương ứng
   - Gọi method `getStrategy()` (giải thích ở dưới)

---

```javascript
    const filteredProducts = strategy.filter(products, queryParams);
    return filteredProducts;
  }
```

**Giải thích:**

1. **`strategy.filter(products, queryParams)`** = Thực thi strategy
   - Gọi method `filter()` của strategy đã chọn
   - Strategy tự xử lý logic lọc/sắp xếp

2. **`return filteredProducts`** = Trả về kết quả
   - Controller nhận kết quả này

**Luồng hoạt động:**
```javascript
// 1. Controller gọi:
FilterContext.applyFilter(products, 'priceAsc', { minPrice: 100000 });

// 2. FilterContext chọn strategy:
strategy = this.strategies['priceAsc']  // PriceAscendingStrategy instance

// 3. Gọi filter():
filteredProducts = strategy.filter(products, { minPrice: 100000 });

// 4. Trả về cho Controller
return filteredProducts;
```

---

### 🧩 Phần 3: getStrategy() - Chọn Strategy

```javascript
  getStrategy(filterType) {
    const selectedStrategy = this.strategies[filterType] || this.strategies[this.defaultStrategy];
```

**Giải thích chi tiết:**

1. **`this.strategies[filterType]`** = Lấy strategy theo key
   ```javascript
   // Ví dụ:
   filterType = 'priceAsc'
   this.strategies['priceAsc']  // → PriceAscendingStrategy instance
   ```

2. **`|| this.strategies[this.defaultStrategy]`** = Fallback nếu không tìm thấy
   ```javascript
   // Case 1: filterType hợp lệ
   filterType = 'priceAsc'
   → this.strategies['priceAsc']  ✅ Tồn tại

   // Case 2: filterType không hợp lệ
   filterType = 'xyz123'
   → this.strategies['xyz123']  ❌ undefined
   → Dùng this.strategies['newest']  ✅ Default
   ```

---

```javascript
    if (!this.strategies[filterType]) {
      console.warn(`⚠️ FilterType '${filterType}' không tồn tại. Sử dụng strategy mặc định: ${this.defaultStrategy}`);
    }
```

**Giải thích:**
- In cảnh báo nếu dùng filterType không hợp lệ
- Giúp developer debug dễ dàng

**Ví dụ output:**
```javascript
// Client gửi: GET /api/products?filter=discount
// Nhưng chưa có DiscountStrategy

// Console output:
// ⚠️ FilterType 'discount' không tồn tại. Sử dụng strategy mặc định: newest
```

---

```javascript
    return selectedStrategy;
  }
```

**Giải thích:**
- Trả về strategy instance đã chọn
- `applyFilter()` sẽ dùng strategy này

---

### 🧩 Phần 4: Các phương thức tiện ích

```javascript
  getAvailableFilters() {
    return Object.keys(this.strategies);
  }
```

**Giải thích:**

1. **`Object.keys(this.strategies)`** = Lấy tất cả key của object
   ```javascript
   this.strategies = {
     newest: ...,
     priceAsc: ...,
     priceDesc: ...,
     bestSeller: ...
   };
   
   Object.keys(this.strategies);
   // → ['newest', 'priceAsc', 'priceDesc', 'bestSeller']
   ```

2. **Ứng dụng:**
   - Trả về cho client danh sách filter hợp lệ
   - Client tạo dropdown/menu filter

**Ví dụ response:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "filters": {
      "current": "priceAsc",
      "available": ["newest", "priceAsc", "priceDesc", "bestSeller"]
    }
  }
}
```

---

```javascript
  registerStrategy(filterType, strategyInstance) {
    this.strategies[filterType] = strategyInstance;
    console.log(`✅ Strategy '${filterType}' đã được đăng ký`);
  }
```

**Giải thích:**

1. **`registerStrategy(...)`** = Đăng ký strategy mới động
   - `filterType` = Tên filter (ví dụ: 'discount')
   - `strategyInstance` = Instance của strategy class

2. **Ứng dụng:**
   - Thêm strategy mới mà không cần restart server
   - Plugin system

**Ví dụ sử dụng:**
```javascript
// Tạo strategy mới
class DiscountStrategy extends ProductFilterStrategy {
  filter(products, query) {
    // Logic lọc sản phẩm giảm giá
    return products.filter(p => p.GiamGia > 0);
  }
}

// Đăng ký động
FilterContext.registerStrategy('discount', new DiscountStrategy());

// Sử dụng ngay
const filtered = FilterContext.applyFilter(products, 'discount', {});
```

---

```javascript
// Export singleton instance để dùng chung trong toàn app
module.exports = new FilterContext();
```

**Giải thích:**

1. **`new FilterContext()`** = Tạo instance ngay khi import
   - Khác với Singleton pattern trước (dùng `getInstance()`)
   - Đây là cách đơn giản hơn trong Node.js

2. **`module.exports`** = Export instance
   - Mọi file import đều nhận CÙNG 1 instance
   - Node.js cache module sau lần import đầu tiên

**Tại sao hoạt động như Singleton?**
```javascript
// File A
const FilterContext = require('./FilterContext');
// → Lần đầu: Tạo instance mới

// File B
const FilterContext = require('./FilterContext');
// → Lần 2: Dùng lại instance từ cache (cùng với File A)

// File C
const FilterContext = require('./FilterContext');
// → Lần 3: Vẫn dùng instance đó
```

---

## 📖 Giải thích trong Controller

### 🧩 Import và Setup

```javascript
const FilterContext = require('../strategies/FilterContext');
```

**Giải thích:**
- Import FilterContext singleton instance
- Sẵn sàng sử dụng ngay, không cần `new` hay `getInstance()`

---

### 🧩 Lấy tham số từ Request

```javascript
exports.getAllProducts = async (req, res) => {
  try {
    const filterType = req.query.filter || 'newest';
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : null;
```

**Giải thích:**

1. **`req.query.filter`** = Lấy tham số từ query string
   ```javascript
   // Request: GET /api/products?filter=priceAsc&minPrice=100000
   req.query = {
     filter: 'priceAsc',
     minPrice: '100000'  // ← String!
   }
   ```

2. **`|| 'newest'`** = Giá trị mặc định nếu không có
3. **`parseFloat(req.query.minPrice)`** = Chuyển string → số
4. **`? ... : null`** = Ternary operator
   ```javascript
   // Nếu có → parse
   req.query.minPrice ? parseFloat(req.query.minPrice) : null
   
   // Nếu không có → null
   ```

---

### 🧩 Query Database

```javascript
    const includeOptions = [
      {
        model: LoaiSP,
        as: 'loaiSP',
        attributes: ['ID', 'Ten', 'MoTa'],
        where: { Enable: true }
      }
    ];

    if (filterType === 'bestSeller') {
      includeOptions.push({
        model: ChiTietHoaDon,
        as: 'chiTietHoaDons',
        attributes: ['SoLuong'],
        required: false
      });
    }
```

**Giải thích:**

1. **`includeOptions`** = Mảng các bảng cần JOIN
   - Sequelize sử dụng include để JOIN bảng

2. **`if (filterType === 'bestSeller')`** = Điều kiện đặc biệt
   - Chỉ khi filter là bestSeller mới cần ChiTietHoaDon
   - Tại sao? Vì cần tính tổng số lượng bán

3. **`required: false`** = LEFT JOIN (không bắt buộc)
   - Lấy cả sản phẩm chưa có đơn hàng nào
   - `chiTietHoaDons = []` (mảng rỗng)

**Tại sao quan trọng?**
```javascript
// Với required: true (INNER JOIN)
→ Chỉ lấy sản phẩm ĐÃ có đơn hàng
→ Sản phẩm mới chưa bán → KHÔNG hiển thị

// Với required: false (LEFT JOIN)
→ Lấy TẤT CẢ sản phẩm
→ Sản phẩm chưa bán → totalSold = 0
```

---

```javascript
    const { count, rows } = await SanPham.findAndCountAll({
      where: whereCondition,
      include: includeOptions,
      attributes: ['ID', 'Ten', 'MoTa', 'GiaBan', 'Ton', 'HinhAnhURL', 'LoaiID', 'NgayTao', 'Enable'],
      distinct: true
    });
```

**Giải thích:**

1. **`findAndCountAll()`** = Lấy dữ liệu + đếm tổng số
   - `count` = Tổng số sản phẩm
   - `rows` = Mảng sản phẩm

2. **`distinct: true`** = Loại bỏ duplicate
   - Khi JOIN → có thể bị trùng
   - Ví dụ: 1 sản phẩm có 5 đơn hàng → 5 dòng trùng
   - `distinct` → chỉ lấy 1 dòng

---

### 🧩 Áp dụng Strategy Pattern

```javascript
    const plainProducts = rows.map(p => p.toJSON());
```

**Giải thích:**
- **`p.toJSON()`** = Chuyển Sequelize Model → Plain Object
- Tại sao? Strategy làm việc với plain object, không phải Sequelize Model

---

```javascript
    const filteredProducts = FilterContext.applyFilter(
      plainProducts,
      filterType,
      queryParams
    );
```

**Giải thích:**

1. **`FilterContext.applyFilter(...)`** = Gọi Strategy Pattern
2. **Đây là ĐIỂM QUAN TRỌNG NHẤT:**
   - Controller không biết strategy nào đang chạy
   - FilterContext tự động chọn và thực thi
   - Kết quả đã được lọc, sắp xếp theo yêu cầu

**Luồng bên trong:**
```javascript
// filterType = 'bestSeller'

// 1. FilterContext.applyFilter() được gọi
// 2. getStrategy('bestSeller') → BestSellerStrategy instance
// 3. BestSellerStrategy.filter() thực thi:
//    - Lọc theo giá
//    - Lọc theo danh mục
//    - Tính tổng số lượng bán
//    - Sắp xếp theo bán chạy
// 4. Trả về kết quả cho Controller
```

---

### 🧩 Phân trang và Response

```javascript
    const totalProducts = filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);
```

**Giải thích:**

1. **`filteredProducts.length`** = Tổng số sau khi lọc
2. **`slice(offset, offset + limit)`** = Cắt mảng để phân trang
   ```javascript
   // Ví dụ:
   offset = 10, limit = 5
   filteredProducts.slice(10, 15)
   // → Lấy phần tử từ index 10 đến 14 (5 phần tử)
   ```

---

```javascript
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách sản phẩm thành công',
      data: {
        products: products,
        pagination: { ... },
        filters: {
          filterType: filterType,
          availableFilters: FilterContext.getAvailableFilters()
        }
      }
    });
```

**Giải thích:**
- **`availableFilters`** = Danh sách filter có thể dùng
- Client hiển thị dropdown với các option này

---

## 🔄 Luồng hoạt động chi tiết

### 📋 Kịch bản: Client muốn lấy sản phẩm bán chạy

```
1️⃣ CLIENT (Frontend):
   GET /api/products?filter=bestSeller&minPrice=100000&maxPrice=500000&page=1&limit=12

2️⃣ CONTROLLER (product.controller.js):
   - Nhận request
   - Parse tham số:
     * filterType = 'bestSeller'
     * minPrice = 100000
     * maxPrice = 500000
   
3️⃣ DATABASE QUERY:
   - Include ChiTietHoaDon (vì bestSeller cần)
   - Lấy TẤT CẢ sản phẩm thỏa điều kiện WHERE
   
4️⃣ STRATEGY PATTERN:
   Controller gọi: FilterContext.applyFilter(products, 'bestSeller', {minPrice, maxPrice})
   
   ↓
   
   FilterContext.getStrategy('bestSeller')
   → Trả về BestSellerStrategy instance
   
   ↓
   
   BestSellerStrategy.filter(products, {minPrice: 100000, maxPrice: 500000})
   
   ↓
   
   Bước a) Clone products
   Bước b) filterByPriceRange(products, 100000, 500000)
           → Loại bỏ sản phẩm < 100k và > 500k
   
   Bước c) filterByCategory(products, null)
           → Không lọc (không có categoryId)
   
   Bước d) Tính tổng số lượng bán:
           products.map(p => {
             totalSold = p.chiTietHoaDons.reduce(...)
             return { ...p, totalSold }
           })
   
   Bước e) Sắp xếp giảm dần theo totalSold:
           products.sort((a, b) => b.totalSold - a.totalSold)
   
   ↓
   
   Trả về mảng đã xử lý
   
5️⃣ CONTROLLER (tiếp):
   - Nhận filteredProducts
   - Phân trang: slice(0, 12) → Lấy 12 sản phẩm đầu
   - Format response
   
6️⃣ RESPONSE gửi về CLIENT:
   {
     success: true,
     data: {
       products: [
         { ID: 5, Ten: 'Xe Ferrari', totalSold: 150, ... },  // Bán chạy #1
         { ID: 2, Ten: 'Búp bê Elsa', totalSold: 120, ... }, // Bán chạy #2
         ...
       ],
       pagination: { currentPage: 1, totalPages: 3, ... },
       filters: {
         current: 'bestSeller',
         available: ['newest', 'priceAsc', 'priceDesc', 'bestSeller']
       }
     }
   }

7️⃣ CLIENT nhận và hiển thị:
   - Render danh sách sản phẩm
   - Hiển thị badge "Bán chạy"
   - Pagination buttons
```

---

## 🎯 So sánh: Có Strategy vs Không có Strategy

### ❌ KHÔNG dùng Strategy (Khi cần thêm filter mới):

```javascript
// ❌ Phải sửa Controller (nguy hiểm!)
exports.getAllProducts = async (req, res) => {
  // ... 200 dòng code hiện tại
  
  // Thêm filter mới:
  } else if (filterType === 'discount') {
    // Thêm 50 dòng code mới ở đây
    // → Controller càng ngày càng dài
    // → Khó maintain
    // → Dễ gây bug cho code cũ
  }
};
```

### ✅ DÙNG Strategy (Khi cần thêm filter mới):

```javascript
// ✅ Tạo file mới: DiscountStrategy.js
class DiscountStrategy extends ProductFilterStrategy {
  filter(products, query) {
    let filtered = [...products];
    filtered = this.filterByPriceRange(filtered, query.minPrice, query.maxPrice);
    
    // Logic riêng cho discount
    filtered = filtered.filter(p => p.GiamGia > 0);
    filtered.sort((a, b) => b.GiamGia - a.GiamGia);
    
    return filtered;
  }
}

// ✅ Thêm vào FilterContext.js:
this.strategies = {
  // ...existing strategies...
  discount: new DiscountStrategy()  // ← Chỉ thêm 1 dòng!
};

// ✅ Controller KHÔNG CẦN SỬA GÌ!
// Tự động hoạt động với filter=discount
```

---

## 📝 Tóm tắt các điểm quan trọng

| Khái niệm | Giải thích đơn giản |
|-----------|-------------------|
| **Base Class** | ProductFilterStrategy - Khuôn mẫu chung |
| **Concrete Strategy** | PriceAscendingStrategy, BestSellerStrategy... - Cách thức cụ thể |
| **Context** | FilterContext - Người quản lý và chọn strategy |
| **filter()** | Method bắt buộc mỗi strategy phải có |
| **Helper methods** | filterByPriceRange(), filterByCategory() - Dùng chung |
| **map()** | Biến đổi mỗi phần tử trong mảng |
| **reduce()** | Tính tổng/tích lũy |
| **sort()** | Sắp xếp mảng |
| **spread (...)** | Clone array/object |

---

## 💡 Câu hỏi thường gặp

### Q1: Tại sao không dùng `if-else` trong Controller?

**Trả lời:**
```javascript
// ❌ Với if-else (tệ):
// - Controller dài 500+ dòng
// - Thêm filter → sửa Controller → nguy hiểm
// - Khó test từng logic riêng
// - Vi phạm Open/Closed Principle

// ✅ Với Strategy (tốt):
// - Controller ngắn gọn
// - Thêm filter → tạo file mới → an toàn
// - Test từng strategy độc lập
// - Tuân thủ SOLID principles
```

---

### Q2: `map()` khác `filter()` như thế nào?

**Trả lời:**
```javascript
const numbers = [1, 2, 3, 4, 5];

// filter() - LỌC phần tử (số lượng giảm)
const filtered = numbers.filter(n => n > 3);
// → [4, 5]  (chỉ giữ lại số > 3)

// map() - BIẾN ĐỔI phần tử (số lượng giữ nguyên)
const mapped = numbers.map(n => n * 2);
// → [2, 4, 6, 8, 10]  (nhân đôi mỗi số)

// Kết hợp cả 2:
const result = numbers
  .filter(n => n > 2)     // → [3, 4, 5]
  .map(n => n * 10);      // → [30, 40, 50]
```

---

### Q3: `reduce()` hoạt động như thế nào?

**Trả lời:**
```javascript
const numbers = [1, 2, 3, 4, 5];

// Tính tổng:
const sum = numbers.reduce((total, num) => {
  console.log(`total: ${total}, num: ${num}`);
  return total + num;
}, 0);  // 0 = giá trị khởi đầu

// Output từng bước:
// total: 0, num: 1  → return 0 + 1 = 1
// total: 1, num: 2  → return 1 + 2 = 3
// total: 3, num: 3  → return 3 + 3 = 6
// total: 6, num: 4  → return 6 + 4 = 10
// total: 10, num: 5 → return 10 + 5 = 15

// sum = 15
```

---

### Q4: Tại sao phải clone mảng `[...products]`?

**Trả lời:**
```javascript
// ❌ KHÔNG clone - Nguy hiểm!
let filtered = products;
filtered.sort(...);
// → products GỐC cũng bị sắp xếp! (vì cùng tham chiếu)

// ✅ Clone - An toàn
let filtered = [...products];
filtered.sort(...);
// → Chỉ filtered bị sắp xếp, products GỐC không đổi

// Ví dụ minh họa:
const original = [3, 1, 2];

// Không clone:
const ref = original;
ref.sort();
console.log(original);  // [1, 2, 3] ← Đã thay đổi!

// Clone:
const copy = [...original];
copy.sort();
console.log(original);  // [3, 1, 2] ← Không đổi ✅
```

---

### Q5: Khi nào dùng `required: true` vs `required: false` trong Sequelize?

**Trả lời:**
```javascript
// required: true (INNER JOIN)
include: {
  model: ChiTietHoaDon,
  required: true  // Chỉ lấy sản phẩm CÓ đơn hàng
}
// → Sản phẩm chưa bán → KHÔNG hiển thị

// required: false (LEFT JOIN)
include: {
  model: ChiTietHoaDon,
  required: false  // Lấy TẤT CẢ sản phẩm
}
// → Sản phẩm chưa bán → Vẫn hiển thị (chiTietHoaDons = [])
```

---

## 🎓 Bài tập thực hành

Hãy tự tạo một Strategy mới: **HighRatingStrategy** (sản phẩm đánh giá cao)

```javascript
// TODO: Tạo file HighRatingStrategy.js

class HighRatingStrategy extends ProductFilterStrategy {
  filter(products, query = {}) {
    // Bước 1: Clone products
    
    // Bước 2: Lọc theo giá (dùng helper method)
    
    // Bước 3: Lọc theo danh mục (dùng helper method)
    
    // Bước 4: Sắp xếp theo Rating giảm dần
    // Giả sử mỗi product có thuộc tính Rating (1-5 sao)
    
    // Bước 5: Trả về kết quả
  }
}

module.exports = HighRatingStrategy;
```

**Sau đó đăng ký vào FilterContext:**
```javascript
// FilterContext.js
this.strategies = {
  // ...existing...
  highRating: new HighRatingStrategy()  // ← Thêm dòng này
};
```

**Test:**
```
GET /api/products?filter=highRating&minPrice=50000
→ Sản phẩm >= 50k, sắp xếp theo rating cao nhất
```

---

Hy vọng tài liệu này giúp bạn hiểu rõ Strategy Pattern! 🎉
