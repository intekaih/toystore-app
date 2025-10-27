# 🎨 Decorator Pattern - Hướng Dẫn Chi Tiết

## 📋 Mục lục
1. [Giới thiệu Decorator Pattern](#giới-thiệu)
2. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
3. [Cơ chế hoạt động](#cơ-chế-hoạt-động)
4. [Giải thích từng file](#giải-thích-từng-file)
5. [Cách sử dụng thực tế](#cách-sử-dụng)
6. [Lợi ích của Decorator Pattern](#lợi-ích)
7. [Mở rộng decorator mới](#mở-rộng)
8. [So sánh với Strategy Pattern](#so-sánh)

---

## 🎯 Giới thiệu Decorator Pattern {#giới-thiệu}

**Decorator Pattern** là một trong những Design Pattern thuộc nhóm **Structural Patterns** (Mẫu cấu trúc).

### Định nghĩa:
> Decorator Pattern cho phép thêm chức năng mới vào đối tượng một cách linh hoạt bằng cách "bọc" (wrap) đối tượng đó trong một lớp decorator. Decorator cung cấp một giải pháp thay thế linh hoạt cho việc kế thừa để mở rộng chức năng.

### Đặc điểm chính:
- 🧅 **Bọc lớp:** Mỗi decorator bọc lấy component hoặc decorator khác
- 🔗 **Kết hợp linh hoạt:** Có thể bọc nhiều lớp decorator theo thứ tự bất kỳ
- 🎭 **Trong suốt:** Client sử dụng decorator giống như sử dụng component gốc
- ➕ **Thêm chức năng:** Mỗi decorator thêm một chức năng cụ thể

### Khi nào sử dụng:
- ✅ Cần thêm chức năng cho đối tượng tại runtime (không phải compile time)
- ✅ Muốn tránh tạo quá nhiều subclass (explosion of subclasses)
- ✅ Các chức năng có thể kết hợp theo nhiều cách khác nhau
- ✅ Cần tuân thủ Open/Closed Principle (SOLID)

### Trong dự án này:
Chúng ta áp dụng Decorator Pattern để **tính giá cuối cùng của sản phẩm trong giỏ hàng** với các yếu tố:
- 💰 **VAT (10%)** - Thuế giá trị gia tăng
- 🎫 **Voucher** - Mã giảm giá
- 🚚 **Free Shipping** - Miễn phí vận chuyển khi đủ điều kiện

---

## 📁 Cấu trúc thư mục {#cấu-trúc-thư-mục}

```
backend/
└── decorators/                          # Thư mục chứa tất cả decorators
    ├── BaseCartItem.js                  # ⭐ Component gốc
    ├── CartItemDecorator.js             # 🎨 Base Decorator (Abstract)
    ├── VATDecorator.js                  # 💰 Decorator: Cộng thuế VAT
    ├── VoucherDecorator.js              # 🎫 Decorator: Trừ voucher
    ├── FreeShippingDecorator.js         # 🚚 Decorator: Miễn phí ship
    └── demo.js                          # 🎮 File demo sử dụng
```

---

## 🧠 Cơ chế hoạt động {#cơ-chế-hoạt-động}

### Sơ đồ cấu trúc Decorator Pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT CODE                             │
│                    item.getPrice()                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │    FreeShippingDecorator              │ ← Decorator 3
         │    - cartItem: VoucherDecorator       │
         │    + getPrice() {                     │
         │        return cartItem.getPrice() - 20K │
         │      }                                 │
         └──────────────┬────────────────────────┘
                        │ wraps
                        ▼
         ┌───────────────────────────────────────┐
         │    VoucherDecorator                   │ ← Decorator 2
         │    - cartItem: VATDecorator           │
         │    + getPrice() {                     │
         │        return cartItem.getPrice() - 30K │
         │      }                                 │
         └──────────────┬────────────────────────┘
                        │ wraps
                        ▼
         ┌───────────────────────────────────────┐
         │    VATDecorator                       │ ← Decorator 1
         │    - cartItem: BaseCartItem           │
         │    + getPrice() {                     │
         │        return cartItem.getPrice() * 1.1 │
         │      }                                 │
         └──────────────┬────────────────────────┘
                        │ wraps
                        ▼
         ┌───────────────────────────────────────┐
         │    BaseCartItem                       │ ← Component gốc
         │    - name: "Xe đồ chơi"               │
         │    - basePrice: 200000                │
         │    + getPrice() {                     │
         │        return 200000                  │
         │      }                                 │
         └───────────────────────────────────────┘
```

### Luồng tính giá (từ ngoài vào trong):

```
Client gọi: item.getPrice()
    │
    ├─→ FreeShippingDecorator.getPrice()
    │       │ Lấy giá từ decorator bên trong
    │       ├─→ VoucherDecorator.getPrice()
    │       │       │ Lấy giá từ decorator bên trong
    │       │       ├─→ VATDecorator.getPrice()
    │       │       │       │ Lấy giá từ component gốc
    │       │       │       ├─→ BaseCartItem.getPrice()
    │       │       │       │       └─→ return 200000
    │       │       │       │
    │       │       │       └─→ return 200000 * 1.1 = 220000
    │       │       │
    │       │       └─→ return 220000 - 30000 = 190000
    │       │
    │       └─→ return 190000 - 0 = 190000 (không đủ điều kiện ship)
    │
    └─→ Kết quả cuối: 190000đ
```

---

## 📝 Giải thích từng file {#giải-thích-từng-file}

### 1️⃣ BaseCartItem.js - Component Gốc

**Vai trò:** Đại diện cho một sản phẩm trong giỏ hàng (không có decorator)

```javascript
class BaseCartItem {
  constructor(name, basePrice, quantity = 1) {
    this.name = name;
    this.basePrice = basePrice;
    this.quantity = quantity;
  }

  getPrice() {
    return this.basePrice * this.quantity;
  }

  getName() {
    return this.name;
  }

  getDescription() {
    return `${this.name} (x${this.quantity})`;
  }
}
```

**Giải thích:**
- **Line 2-6:** Constructor nhận tên, giá gốc, số lượng
- **Line 8-10:** `getPrice()` trả về giá = giá gốc × số lượng
- **Line 12-14:** Lấy tên sản phẩm
- **Line 16-18:** Tạo mô tả kèm số lượng

**Ví dụ sử dụng:**
```javascript
const item = new BaseCartItem('Xe đồ chơi', 200000, 2);
console.log(item.getPrice()); // 400000 (200K × 2)
console.log(item.getDescription()); // "Xe đồ chơi (x2)"
```

---

### 2️⃣ CartItemDecorator.js - Base Decorator

**Vai trò:** Lớp trừu tượng cho tất cả decorators

```javascript
class CartItemDecorator {
  constructor(cartItem) {
    if (!cartItem) {
      throw new Error('CartItem is required for decorator');
    }
    this.cartItem = cartItem; // Lưu reference đến component được bọc
  }

  // Delegate các phương thức cho component bên trong
  getPrice() {
    return this.cartItem.getPrice();
  }

  getName() {
    return this.cartItem.getName();
  }

  getDescription() {
    return this.cartItem.getDescription();
  }
}
```

**Giải thích:**
- **Line 2-6:** Constructor nhận component cần bọc (BaseCartItem hoặc Decorator khác)
- **Line 3-5:** Validation - bắt buộc phải có cartItem
- **Line 10-12:** `getPrice()` mặc định delegate cho component bên trong
- **Line 14-19:** Các phương thức khác cũng delegate

**Tại sao cần Base Decorator?**
- ✅ Tạo interface chung cho tất cả decorators
- ✅ Implement delegation logic (ủy quyền)
- ✅ Đảm bảo mọi decorator đều có cùng phương thức với BaseCartItem
- ✅ Tránh lặp code trong các decorator con

---

### 3️⃣ VATDecorator.js - Decorator Thuế VAT

**Vai trò:** Cộng thêm 10% VAT vào giá

```javascript
class VATDecorator extends CartItemDecorator {
  constructor(cartItem, vatRate = 0.1) {
    super(cartItem);
    this.vatRate = vatRate;
  }

  getPrice() {
    const originalPrice = this.cartItem.getPrice();
    const vatAmount = originalPrice * this.vatRate;
    return originalPrice + vatAmount;
  }

  getDescription() {
    const originalDesc = this.cartItem.getDescription();
    return `${originalDesc} + VAT ${this.vatRate * 100}%`;
  }

  getVATAmount() {
    return this.cartItem.getPrice() * this.vatRate;
  }
}
```

**Giải thích từng bước:**

1. **Constructor (Line 2-5):**
   - Gọi `super(cartItem)` để lưu reference
   - Lưu tỷ lệ VAT (mặc định 10%)

2. **getPrice() - OVERRIDE (Line 7-11):**
   - **Line 8:** Lấy giá từ component bên trong
   - **Line 9:** Tính số tiền VAT = giá × tỷ lệ
   - **Line 10:** Trả về giá đã cộng VAT

3. **getDescription() - OVERRIDE (Line 13-16):**
   - Lấy mô tả gốc từ component bên trong
   - Thêm thông tin VAT vào mô tả

4. **getVATAmount() - NEW METHOD (Line 18-20):**
   - Phương thức mới chỉ có trong VATDecorator
   - Trả về số tiền VAT

**Ví dụ sử dụng:**
```javascript
let item = new BaseCartItem('Búp bê', 300000);
item = new VATDecorator(item);

console.log(item.getPrice()); // 330000 (300K + 30K VAT)
console.log(item.getVATAmount()); // 30000
```

---

### 4️⃣ VoucherDecorator.js - Decorator Voucher

**Vai trò:** Trừ đi giá trị voucher

```javascript
class VoucherDecorator extends CartItemDecorator {
  constructor(cartItem, discountAmount, voucherCode = 'DISCOUNT') {
    super(cartItem);
    this.discountAmount = discountAmount;
    this.voucherCode = voucherCode;
  }

  getPrice() {
    const originalPrice = this.cartItem.getPrice();
    const finalPrice = originalPrice - this.discountAmount;
    return Math.max(0, finalPrice); // Không cho phép giá âm
  }

  getActualDiscount() {
    const originalPrice = this.cartItem.getPrice();
    return Math.min(this.discountAmount, originalPrice);
  }
}
```

**Giải thích:**

1. **Constructor (Line 2-6):**
   - Nhận số tiền giảm giá (VNĐ)
   - Nhận mã voucher (optional, mặc định 'DISCOUNT')

2. **getPrice() - OVERRIDE (Line 8-12):**
   - **Line 9:** Lấy giá từ component bên trong
   - **Line 10:** Trừ đi giảm giá
   - **Line 11:** `Math.max(0, ...)` đảm bảo giá không âm

3. **getActualDiscount() (Line 14-17):**
   - Tính giảm giá thực tế
   - Nếu voucher > giá gốc → chỉ giảm bằng giá gốc

**Ví dụ:**
```javascript
let item = new BaseCartItem('Lego', 500000);
item = new VoucherDecorator(item, 50000, 'SALE50K');

console.log(item.getPrice()); // 450000
console.log(item.getActualDiscount()); // 50000
```

**Edge case:**
```javascript
let item = new BaseCartItem('Nhỏ', 10000);
item = new VoucherDecorator(item, 50000);

console.log(item.getPrice()); // 0 (không âm)
console.log(item.getActualDiscount()); // 10000 (không phải 50000)
```

---

### 5️⃣ FreeShippingDecorator.js - Decorator Miễn Phí Ship

**Vai trò:** Giảm phí ship khi đơn hàng đủ điều kiện

```javascript
class FreeShippingDecorator extends CartItemDecorator {
  constructor(cartItem, shippingDiscount = 20000, minOrderValue = 500000) {
    super(cartItem);
    this.shippingDiscount = shippingDiscount;
    this.minOrderValue = minOrderValue;
  }

  getPrice() {
    const originalPrice = this.cartItem.getPrice();
    
    if (originalPrice >= this.minOrderValue) {
      return Math.max(0, originalPrice - this.shippingDiscount);
    }
    
    return originalPrice;
  }

  isEligibleForFreeShipping() {
    return this.cartItem.getPrice() >= this.minOrderValue;
  }

  getDescription() {
    const originalDesc = this.cartItem.getDescription();
    
    if (this.isEligibleForFreeShipping()) {
      return `${originalDesc} - Miễn phí ship (-${this.shippingDiscount.toLocaleString('vi-VN')}đ)`;
    }
    
    const remaining = this.minOrderValue - this.cartItem.getPrice();
    return `${originalDesc} (Mua thêm ${remaining.toLocaleString('vi-VN')}đ để được miễn phí ship)`;
  }
}
```

**Giải thích logic:**

1. **Constructor (Line 2-6):**
   - `shippingDiscount`: số tiền giảm (mặc định 20K)
   - `minOrderValue`: đơn tối thiểu (mặc định 500K)

2. **getPrice() - OVERRIDE (Line 8-16):**
   - **Line 11:** Kiểm tra điều kiện: giá >= 500K?
   - **Line 12:** Nếu đủ → trừ phí ship
   - **Line 15:** Nếu không đủ → giữ nguyên giá

3. **isEligibleForFreeShipping() (Line 18-20):**
   - Helper method kiểm tra điều kiện
   - Trả về boolean

4. **getDescription() - OVERRIDE (Line 22-31):**
   - **Line 25-26:** Nếu đủ điều kiện → hiển thị "Miễn phí ship"
   - **Line 29-30:** Nếu chưa đủ → hiển thị "Mua thêm XXđ"

**Ví dụ:**
```javascript
// Case 1: Đủ điều kiện
let item1 = new BaseCartItem('Đồ chơi cao cấp', 600000);
item1 = new FreeShippingDecorator(item1, 20000, 500000);
console.log(item1.getPrice()); // 580000 (600K - 20K)
console.log(item1.isEligibleForFreeShipping()); // true

// Case 2: Chưa đủ điều kiện
let item2 = new BaseCartItem('Đồ chơi nhỏ', 300000);
item2 = new FreeShippingDecorator(item2);
console.log(item2.getPrice()); // 300000 (không giảm)
console.log(item2.isEligibleForFreeShipping()); // false
```

---

## 🚀 Cách sử dụng thực tế {#cách-sử-dụng}

### Ví dụ 1: Sản phẩm cơ bản (không decorator)

```javascript
const BaseCartItem = require('./decorators/BaseCartItem');

const item = new BaseCartItem('Xe đồ chơi', 200000, 1);
console.log(item.getPrice()); // 200000
console.log(item.getDescription()); // "Xe đồ chơi (x1)"
```

**Kết quả:**
- Giá: 200,000đ
- Không có VAT, không giảm giá

---

### Ví dụ 2: Áp dụng chỉ VAT

```javascript
const BaseCartItem = require('./decorators/BaseCartItem');
const VATDecorator = require('./decorators/VATDecorator');

let item = new BaseCartItem('Búp bê', 300000);
item = new VATDecorator(item); // Bọc lớp VAT

console.log(item.getPrice()); // 330000
```

**Công thức:**
```
Giá gốc:     300,000đ
VAT (10%):  + 30,000đ
─────────────────────
Giá cuối:    330,000đ
```

---

### Ví dụ 3: Kết hợp VAT + Voucher (theo đề bài)

```javascript
let item = new BaseCartItem('Xe đồ chơi', 200000);
item = new VATDecorator(item);
item = new VoucherDecorator(item, 30000, 'DISCOUNT30K');
item = new FreeShippingDecorator(item);

console.log(item.getPrice()); // 190000
```

**Công thức từng bước:**
```
Bước 1 - Giá gốc:              200,000đ
Bước 2 - + VAT 10%:            220,000đ  (200K × 1.1)
Bước 3 - - Voucher 30K:        190,000đ  (220K - 30K)
Bước 4 - Free Ship?            190,000đ  (chưa đủ 500K → không giảm)
─────────────────────────────────────────
Giá cuối cùng:                 190,000đ
```

---

### Ví dụ 4: Đơn hàng lớn - Được miễn phí ship

```javascript
let item = new BaseCartItem('Bộ đồ chơi cao cấp', 600000);
item = new VATDecorator(item);
item = new FreeShippingDecorator(item, 20000, 500000);

console.log(item.getPrice()); // 640000
```

**Công thức:**
```
Giá gốc:                600,000đ
+ VAT 10%:              660,000đ
- Free Ship (đủ DK):   - 20,000đ
─────────────────────────────────
Giá cuối:               640,000đ
```

---

### Ví dụ 5: Combo đầy đủ - Nhiều sản phẩm

```javascript
let item = new BaseCartItem('Robot Transformers', 800000, 2);
item = new VATDecorator(item, 0.1);
item = new VoucherDecorator(item, 100000, 'MEGA100K');
item = new FreeShippingDecorator(item, 30000, 500000);

console.log(item.getPrice()); // 1630000
```

**Công thức chi tiết:**
```
Giá gốc:               800,000đ × 2 = 1,600,000đ
+ VAT 10%:             1,600,000 × 1.1 = 1,760,000đ
- Voucher 100K:        1,760,000 - 100,000 = 1,660,000đ
- Free Ship:           1,660,000 - 30,000 = 1,630,000đ (đủ điều kiện)
────────────────────────────────────────────────────────
Giá cuối cùng:         1,630,000đ
Tiết kiệm:             130,000đ (100K voucher + 30K ship)
```

---

### Ví dụ 6: Thứ tự decorator ảnh hưởng kết quả

**Cách 1: VAT trước → Voucher sau**
```javascript
let item1 = new BaseCartItem('Sản phẩm', 100000);
item1 = new VATDecorator(item1);        // 110000
item1 = new VoucherDecorator(item1, 20000); // 90000

console.log(item1.getPrice()); // 90000
```

**Cách 2: Voucher trước → VAT sau**
```javascript
let item2 = new BaseCartItem('Sản phẩm', 100000);
item2 = new VoucherDecorator(item2, 20000); // 80000
item2 = new VATDecorator(item2);        // 88000

console.log(item2.getPrice()); // 88000
```

**Kết luận:** Thứ tự decorator quan trọng! Nên áp dụng theo logic nghiệp vụ.

---

## 💡 Lợi ích của Decorator Pattern {#lợi-ích}

### 1️⃣ Tránh Explosion of Subclasses

**❌ TRƯỚC (Không dùng Decorator):**

Nếu dùng kế thừa, cần tạo vô số class:

```javascript
class CartItem { ... }
class CartItemWithVAT extends CartItem { ... }
class CartItemWithVoucher extends CartItem { ... }
class CartItemWithFreeShip extends CartItem { ... }
class CartItemWithVATAndVoucher extends CartItem { ... }
class CartItemWithVATAndFreeShip extends CartItem { ... }
class CartItemWithVoucherAndFreeShip extends CartItem { ... }
class CartItemWithVATAndVoucherAndFreeShip extends CartItem { ... }
// 2^n class cho n decorators!
```

**✅ SAU (Dùng Decorator):**

```javascript
// Chỉ cần 4 class:
class BaseCartItem { ... }
class VATDecorator { ... }
class VoucherDecorator { ... }
class FreeShippingDecorator { ... }

// Kết hợp linh hoạt tại runtime:
let item = new BaseCartItem(...);
item = new VATDecorator(item);
item = new VoucherDecorator(item, ...);
item = new FreeShippingDecorator(item);
```

---

### 2️⃣ Open/Closed Principle (SOLID)

> "Open for extension, closed for modification"

**Thêm decorator mới mà không sửa code cũ:**

```javascript
// Tạo decorator mới: GiftWrapDecorator
class GiftWrapDecorator extends CartItemDecorator {
  constructor(cartItem, wrapPrice = 10000) {
    super(cartItem);
    this.wrapPrice = wrapPrice;
  }

  getPrice() {
    return this.cartItem.getPrice() + this.wrapPrice;
  }

  getDescription() {
    return `${this.cartItem.getDescription()} + Gói quà (+10Kđ)`;
  }
}

// Sử dụng ngay mà không sửa BaseCartItem hay các decorator khác:
let item = new BaseCartItem('Gấu bông', 150000);
item = new VATDecorator(item);
item = new GiftWrapDecorator(item); // ← Decorator mới!
```

---

### 3️⃣ Single Responsibility Principle

Mỗi decorator chỉ có 1 trách nhiệm:

| Class | Trách nhiệm |
|-------|-------------|
| **BaseCartItem** | Đại diện sản phẩm gốc |
| **VATDecorator** | Cộng thuế VAT |
| **VoucherDecorator** | Trừ voucher |
| **FreeShippingDecorator** | Xử lý miễn phí ship |

---

### 4️⃣ Flexibility (Linh hoạt)

**Kết hợp tùy ý:**

```javascript
// Khách hàng A: Chỉ cần VAT
let itemA = new BaseCartItem('Sản phẩm A', 100000);
itemA = new VATDecorator(itemA);

// Khách hàng B: VAT + Voucher
let itemB = new BaseCartItem('Sản phẩm B', 100000);
itemB = new VATDecorator(itemB);
itemB = new VoucherDecorator(itemB, 20000);

// Khách hàng C: Tất cả
let itemC = new BaseCartItem('Sản phẩm C', 600000);
itemC = new VATDecorator(itemC);
itemC = new VoucherDecorator(itemC, 50000);
itemC = new FreeShippingDecorator(itemC);
```

---

### 5️⃣ Runtime Modification

Thêm/bớt chức năng tại runtime:

```javascript
// Tạo item cơ bản
let item = new BaseCartItem('Sản phẩm', 200000);

// Khách hàng nhập mã voucher sau:
if (userHasVoucher) {
  item = new VoucherDecorator(item, voucherAmount, voucherCode);
}

// Nếu đơn hàng đạt điều kiện:
if (cartTotal >= 500000) {
  item = new FreeShippingDecorator(item);
}
```

---

## 🔧 Mở rộng Decorator mới {#mở-rộng}

### Ví dụ 1: ExpressShippingDecorator - Ship nhanh

```javascript
const CartItemDecorator = require('./CartItemDecorator');

class ExpressShippingDecorator extends CartItemDecorator {
  constructor(cartItem, expressPrice = 50000) {
    super(cartItem);
    this.expressPrice = expressPrice;
  }

  getPrice() {
    return this.cartItem.getPrice() + this.expressPrice;
  }

  getDescription() {
    return `${this.cartItem.getDescription()} + Ship nhanh (+${this.expressPrice.toLocaleString('vi-VN')}đ)`;
  }
}

module.exports = ExpressShippingDecorator;
```

**Sử dụng:**
```javascript
let item = new BaseCartItem('Đồ chơi khẩn cấp', 300000);
item = new VATDecorator(item);
item = new ExpressShippingDecorator(item, 50000);

console.log(item.getPrice()); // 380000 (300K + 30K VAT + 50K ship nhanh)
```

---

### Ví dụ 2: LoyaltyPointsDecorator - Tích điểm

```javascript
class LoyaltyPointsDecorator extends CartItemDecorator {
  constructor(cartItem, pointsRate = 0.01) {
    super(cartItem);
    this.pointsRate = pointsRate; // 1% = 0.01
  }

  getPrice() {
    return this.cartItem.getPrice(); // Không thay đổi giá
  }

  getPoints() {
    return Math.floor(this.cartItem.getPrice() * this.pointsRate);
  }

  getDescription() {
    return `${this.cartItem.getDescription()} [Tích ${this.getPoints()} điểm]`;
  }
}
```

**Sử dụng:**
```javascript
let item = new BaseCartItem('Lego', 500000);
item = new VATDecorator(item);
item = new LoyaltyPointsDecorator(item, 0.02); // 2%

console.log(item.getPrice()); // 550000 (500K + VAT)
console.log(item.getPoints()); // 11 điểm (550K × 2%)
```

---

### Ví dụ 3: InsuranceDecorator - Bảo hiểm sản phẩm

```javascript
class InsuranceDecorator extends CartItemDecorator {
  constructor(cartItem, insuranceRate = 0.05) {
    super(cartItem);
    this.insuranceRate = insuranceRate; // 5% giá trị
  }

  getPrice() {
    const originalPrice = this.cartItem.getPrice();
    const insuranceFee = originalPrice * this.insuranceRate;
    return originalPrice + insuranceFee;
  }

  getInsuranceFee() {
    return this.cartItem.getPrice() * this.insuranceRate;
  }

  getDescription() {
    return `${this.cartItem.getDescription()} + Bảo hiểm (+${this.getInsuranceFee().toLocaleString('vi-VN')}đ)`;
  }
}
```

---

## 📊 So sánh với Strategy Pattern {#so-sánh}

### Decorator Pattern vs Strategy Pattern

| Tiêu chí | **Decorator Pattern** | **Strategy Pattern** |
|----------|----------------------|---------------------|
| **Loại** | Structural (Cấu trúc) | Behavioral (Hành vi) |
| **Mục đích** | Thêm chức năng cho đối tượng | Thay đổi thuật toán |
| **Cách hoạt động** | Bọc (wrap) đối tượng | Chọn strategy |
| **Số lượng** | Có thể bọc nhiều lớp | Chỉ dùng 1 strategy tại 1 thời điểm |
| **Thay đổi** | Thêm chức năng động | Thay đổi hành vi |
| **Ví dụ** | VAT, Voucher, FreeShip | Sắp xếp: newest, priceAsc, bestSeller |

### Khi nào dùng cái nào?

**Dùng Decorator khi:**
- ✅ Cần **thêm/bớt** chức năng tại runtime
- ✅ Kết hợp **nhiều chức năng** cùng lúc
- ✅ Tránh tạo nhiều subclass

**Dùng Strategy khi:**
- ✅ Có **nhiều cách** làm cùng 1 việc
- ✅ Chỉ chọn **1 cách** tại 1 thời điểm
- ✅ Tránh if-else/switch-case

### Ví dụ trong dự án:

```javascript
// DECORATOR: Tính giá sản phẩm (kết hợp nhiều yếu tố)
let item = new BaseCartItem('Sản phẩm', 200000);
item = new VATDecorator(item);          // Thêm VAT
item = new VoucherDecorator(item, ...); // Thêm voucher
item = new FreeShippingDecorator(item); // Thêm free ship
// → Cả 3 cùng hoạt động

// STRATEGY: Sắp xếp sản phẩm (chỉ chọn 1 kiểu)
const products = await SanPham.findAll();
const sorted = FilterContext.applyFilter(products, 'newest', {});
// → Chỉ dùng NewestStrategy (không thể vừa newest vừa priceAsc)
```

---

## 🎯 Kết luận

**Decorator Pattern giúp:**
1. ✅ Thêm chức năng linh hoạt cho đối tượng tại runtime
2. ✅ Tránh explosion of subclasses
3. ✅ Tuân thủ Open/Closed Principle
4. ✅ Kết hợp nhiều chức năng theo thứ tự bất kỳ
5. ✅ Code dễ test, dễ mở rộng

**Khi nào nên dùng:**
- Cần thêm chức năng động cho đối tượng
- Muốn kết hợp nhiều chức năng
- Tránh tạo quá nhiều class kế thừa
- Cần tuân thủ SOLID principles

**Trong giỏ hàng:**
- BaseCartItem = sản phẩm gốc
- VATDecorator = cộng thuế
- VoucherDecorator = giảm giá
- FreeShippingDecorator = miễn phí ship
- → Kết hợp linh hoạt để tính giá cuối cùng

---

## 📚 Tài liệu tham khảo

- **Design Patterns: Elements of Reusable Object-Oriented Software** (Gang of Four)
- **Head First Design Patterns**
- **Refactoring Guru:** https://refactoring.guru/design-patterns/decorator

---

*Tạo bởi: Decorator Pattern Implementation*  
*Ngày: 2024*
