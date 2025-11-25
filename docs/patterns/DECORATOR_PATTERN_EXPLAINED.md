# 🎨 DECORATOR PATTERN - PRICE CALCULATION SYSTEM

## 📋 **GIỚI THIỆU**

Decorator Pattern là một structural design pattern cho phép thêm các tính năng mới vào object một cách động mà không cần thay đổi cấu trúc của object gốc.

Trong hệ thống ToyStore, chúng ta sử dụng Decorator Pattern để tính giá đơn hàng với nhiều lớp phí:
- **Tổng tiền sản phẩm** (Base)
- **+ VAT** (Thuế GTGT)
- **+ Phí ship** (Shipping)
- **- Giảm giá** (Voucher)

---

## 🏗️ **KIẾN TRÚC**

```
┌─────────────────────────────────────┐
│   OrderPriceCalculator (Base)      │
│   - Tính tổng tiền sản phẩm         │
└─────────────────────────────────────┘
                 ↑
                 │ wraps
┌────────────────┴──────────────────┐
│   OrderPriceDecorator (Abstract)  │
│   - calculate()                   │
│   - getDetails()                  │
└───────────────────────────────────┘
         ↑           ↑           ↑
         │           │           │
    ┌────┴───┐  ┌───┴────┐  ┌───┴─────┐
    │  VAT   │  │ Ship   │  │ Voucher │
    │Decorator│  │Decorator│  │Decorator│
    └────────┘  └────────┘  └─────────┘
```

---

## 💡 **CÁCH SỬ DỤNG**

### **Ví dụ 1: Tính giá cơ bản**

```javascript
const { OrderPriceCalculator } = require('./decorators/OrderPriceDecorator');

// Tạo calculator cơ bản
const items = [
  { sanPhamId: 1, ten: 'Xe đồ chơi', soLuong: 2, donGia: 100000 },
  { sanPhamId: 2, ten: 'Búp bê', soLuong: 1, donGia: 150000 }
];

const calculator = new OrderPriceCalculator(items);
const total = calculator.calculate(); // 350000
console.log(total.toFixed(2)); // "350000.00"
```

### **Ví dụ 2: Thêm VAT 10%**

```javascript
const VATDecorator = require('./decorators/VATDecorator');

// Wrap calculator với VAT decorator
const calculatorWithVAT = new VATDecorator(calculator, 0.1); // 10%
const totalWithVAT = calculatorWithVAT.calculate(); // 385000
console.log(totalWithVAT.toFixed(2)); // "385000.00"

// Lấy chi tiết
const details = calculatorWithVAT.getDetails();
console.log(details);
/*
{
  tongTienSanPham: "350000.00",
  items: [...],
  vat: {
    rate: "0.1000",
    ratePercent: "10.00%",
    amount: "35000.00",
    subtotalBeforeVAT: "350000.00",
    totalWithVAT: "385000.00"
  },
  tongTien: "385000.00"
}
*/
```

### **Ví dụ 3: Thêm phí ship**

```javascript
const ShippingDecorator = require('./decorators/ShippingDecorator');

// Wrap với shipping decorator
const calculatorWithShipping = new ShippingDecorator(
  calculatorWithVAT, 
  30000, // 30k phí ship
  { method: 'Express', estimatedDays: '1-2' }
);

const totalWithShipping = calculatorWithShipping.calculate(); // 415000
console.log(totalWithShipping.toFixed(2)); // "415000.00"
```

### **Ví dụ 4: Áp dụng voucher giảm 20%**

```javascript
const VoucherDecorator = require('./decorators/VoucherDecorator');

// Wrap với voucher decorator
const calculatorWithVoucher = new VoucherDecorator(
  calculatorWithShipping,
  {
    code: 'SALE20',
    type: 'PERCENT',
    value: 20,
    maxDiscount: 50000,
    minOrderValue: 300000
  }
);

const finalTotal = calculatorWithVoucher.calculate(); // 365000 (415000 - 50000)
console.log(finalTotal.toFixed(2)); // "365000.00"
```

### **Ví dụ 5: Tổng hợp tất cả (Chain of Decorators)**

```javascript
// Tạo calculator với TẤT CẢ các decorator
const items = [
  { sanPhamId: 1, ten: 'Xe đồ chơi', soLuong: 2, donGia: 100000 },
  { sanPhamId: 2, ten: 'Búp bê', soLuông: 1, donGia: 150000 }
];

// 1. Base calculator
let calculator = new OrderPriceCalculator(items); // 350000

// 2. Thêm VAT 10%
calculator = new VATDecorator(calculator, 0.1); // 385000

// 3. Thêm phí ship 30k
calculator = new ShippingDecorator(calculator, 30000); // 415000

// 4. Áp dụng voucher giảm 20% (max 50k)
calculator = new VoucherDecorator(calculator, {
  code: 'SALE20',
  type: 'PERCENT',
  value: 20,
  maxDiscount: 50000
}); // 365000

// Lấy tổng tiền cuối cùng
const finalTotal = calculator.calculate();
console.log('Tổng tiền cuối:', finalTotal.toFixed(2)); // "365000.00"

// Lấy chi tiết đầy đủ
const details = calculator.getDetails();
console.log(details);
```

---

## 📊 **BREAKDOWN CALCULATION**

```
Tổng tiền sản phẩm:     350,000đ
+ VAT 10%:              + 35,000đ
─────────────────────────────────
Subtotal:               385,000đ
+ Phí ship:             + 30,000đ
─────────────────────────────────
Subtotal:               415,000đ
- Voucher SALE20 (20%): - 50,000đ (max)
─────────────────────────────────
TỔNG CỘNG:              365,000đ
```

---

## 🎯 **LỢI ÍCH**

### **1. Open/Closed Principle**
- ✅ Mở rộng tính năng mới (thêm decorator mới) mà không cần sửa code cũ
- ✅ Đóng với sửa đổi - không phá vỡ code hiện tại

### **2. Single Responsibility**
- ✅ Mỗi decorator chịu trách nhiệm cho 1 tính năng duy nhất
- ✅ VATDecorator chỉ xử lý VAT, ShippingDecorator chỉ xử lý ship

### **3. Linh hoạt**
- ✅ Có thể bật/tắt từng tính năng dễ dàng
- ✅ Thay đổi thứ tự tính toán linh hoạt
- ✅ Kết hợp các decorator theo nhiều cách khác nhau

### **4. Dễ test**
- ✅ Test từng decorator độc lập
- ✅ Mock các dependency dễ dàng
- ✅ Unit test đơn giản và rõ ràng

---

## 🔧 **MỞ RỘNG**

### **Thêm decorator mới (ví dụ: Point Discount)**

```javascript
class PointDiscountDecorator extends OrderPriceDecorator {
  constructor(calculator, points = 0) {
    super(calculator);
    this.points = points;
    this.conversionRate = 1000; // 1 point = 1000đ
  }

  calculate() {
    const subtotal = this.calculator.calculate();
    const discount = new Decimal(this.points).times(this.conversionRate);
    return subtotal.minus(discount);
  }

  getDetails() {
    const previousDetails = this.calculator.getDetails();
    const subtotal = this.calculator.calculate();
    const discount = new Decimal(this.points).times(this.conversionRate);
    
    return {
      ...previousDetails,
      pointDiscount: {
        points: this.points,
        discount: discount.toFixed(2),
        conversionRate: this.conversionRate
      },
      tongTien: subtotal.minus(discount).toFixed(2)
    };
  }
}
```

---

## ⚡ **PERFORMANCE**

- ✅ **O(n)** complexity - n là số decorator
- ✅ Sử dụng **Decimal.js** để tính toán chính xác
- ✅ Không có side effects
- ✅ Immutable calculations

---

## 📝 **BEST PRACTICES**

1. **Luôn wrap theo thứ tự logic:**
   ```
   Base → VAT → Shipping → Voucher
   ```

2. **Sử dụng Decimal.js cho tất cả phép tính tiền:**
   ```javascript
   new Decimal(100).times(1.1) // ✅ ĐÚNG
   100 * 1.1                    // ❌ SAI (floating point error)
   ```

3. **Validate input trước khi tính toán:**
   ```javascript
   if (!items || items.length === 0) {
     throw new Error('Items cannot be empty');
   }
   ```

4. **Log chi tiết cho debugging:**
   ```javascript
   console.log('Calculator details:', calculator.getDetails());
   ```

---

## 🧪 **TESTING**

```javascript
describe('VATDecorator', () => {
  it('should add 10% VAT correctly', () => {
    const items = [{ sanPhamId: 1, ten: 'Test', soLuong: 1, donGia: 100000 }];
    const calculator = new OrderPriceCalculator(items);
    const vatCalculator = new VATDecorator(calculator, 0.1);
    
    expect(vatCalculator.calculate().toFixed(2)).toBe('110000.00');
  });
});
```

---

## 📚 **TÀI LIỆU THAM KHẢO**

- [Decorator Pattern - Refactoring Guru](https://refactoring.guru/design-patterns/decorator)
- [Decimal.js Documentation](https://mikemcl.github.io/decimal.js/)
- Clean Code by Robert C. Martin

---

**Ngày tạo:** 11/11/2025  
**Phiên bản:** 1.0  
**Tác giả:** ToyStore Development Team