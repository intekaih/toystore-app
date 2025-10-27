/**
 * 🎮 DECORATOR PATTERN - DEMO
 * 
 * File này demo cách sử dụng Decorator Pattern cho giỏ hàng
 * Chạy: node backend/decorators/demo.js
 */

const BaseCartItem = require('./BaseCartItem');
const VATDecorator = require('./VATDecorator');
const VoucherDecorator = require('./VoucherDecorator');
const FreeShippingDecorator = require('./FreeShippingDecorator');

console.log('🎯 DECORATOR PATTERN - DEMO GIỎ HÀNG\n');
console.log('='.repeat(80));

// ============================================================
// DEMO 1: Sản phẩm cơ bản (không decorator)
// ============================================================
console.log('\n📦 DEMO 1: Sản phẩm cơ bản\n');

let item1 = new BaseCartItem('Xe đồ chơi điều khiển', 200000, 1);
console.log(`Tên: ${item1.getName()}`);
console.log(`Giá gốc: ${item1.getPrice().toLocaleString('vi-VN')}đ`);
console.log(`Mô tả: ${item1.getDescription()}`);

// ============================================================
// DEMO 2: Áp dụng VAT (10%)
// ============================================================
console.log('\n' + '='.repeat(80));
console.log('\n💰 DEMO 2: Áp dụng VAT 10%\n');

let item2 = new BaseCartItem('Búp bê Barbie', 300000, 1);
item2 = new VATDecorator(item2);

console.log(`Giá gốc: 300,000đ`);
console.log(`VAT (10%): ${item2.getVATAmount().toLocaleString('vi-VN')}đ`);
console.log(`Giá cuối: ${item2.getPrice().toLocaleString('vi-VN')}đ`);
console.log(`Mô tả: ${item2.getDescription()}`);

// ============================================================
// DEMO 3: Áp dụng Voucher
// ============================================================
console.log('\n' + '='.repeat(80));
console.log('\n🎫 DEMO 3: Áp dụng Voucher giảm 50,000đ\n');

let item3 = new BaseCartItem('Lego Star Wars', 500000, 1);
item3 = new VoucherDecorator(item3, 50000, 'NEWYEAR2024');

console.log(`Giá gốc: 500,000đ`);
console.log(`Voucher: -50,000đ`);
console.log(`Giá cuối: ${item3.getPrice().toLocaleString('vi-VN')}đ`);
console.log(`Mô tả: ${item3.getDescription()}`);

// ============================================================
// DEMO 4: Kết hợp VAT + Voucher (theo yêu cầu của bạn)
// ============================================================
console.log('\n' + '='.repeat(80));
console.log('\n🎯 DEMO 4: Kết hợp VAT + Voucher (VÍ DỤ TRONG ĐỀ BÀI)\n');

let item4 = new BaseCartItem('Xe đồ chơi', 200000, 1);
console.log(`Bước 1 - Giá gốc: ${item4.getPrice().toLocaleString('vi-VN')}đ`);

item4 = new VATDecorator(item4);
console.log(`Bước 2 - Sau khi + VAT 10%: ${item4.getPrice().toLocaleString('vi-VN')}đ`);

item4 = new VoucherDecorator(item4, 30000, 'DISCOUNT30K');
console.log(`Bước 3 - Sau khi - Voucher 30K: ${item4.getPrice().toLocaleString('vi-VN')}đ`);

item4 = new FreeShippingDecorator(item4);
console.log(`Bước 4 - Kiểm tra Free Shipping: ${item4.isEligibleForFreeShipping() ? 'Không đủ điều kiện' : 'Đủ điều kiện'}`);
console.log(`Giá cuối cùng: ${item4.getPrice().toLocaleString('vi-VN')}đ`);
console.log(`\nMô tả đầy đủ:\n${item4.getDescription()}`);

// ============================================================
// DEMO 5: Đơn hàng lớn - Được miễn phí ship
// ============================================================
console.log('\n' + '='.repeat(80));
console.log('\n🚚 DEMO 5: Đơn hàng lớn - Miễn phí ship\n');

let item5 = new BaseCartItem('Bộ đồ chơi cao cấp', 600000, 1);
console.log(`Giá gốc: ${item5.getPrice().toLocaleString('vi-VN')}đ`);

item5 = new VATDecorator(item5);
console.log(`Sau VAT: ${item5.getPrice().toLocaleString('vi-VN')}đ`);

item5 = new FreeShippingDecorator(item5, 20000, 500000);
console.log(`Đủ điều kiện free ship: ${item5.isEligibleForFreeShipping() ? 'CÓ ✅' : 'KHÔNG ❌'}`);
console.log(`Tiết kiệm được: ${item5.getDetails().savedAmount.toLocaleString('vi-VN')}đ`);
console.log(`Giá cuối: ${item5.getPrice().toLocaleString('vi-VN')}đ`);

// ============================================================
// DEMO 6: Nhiều sản phẩm - Bọc nhiều lớp decorator
// ============================================================
console.log('\n' + '='.repeat(80));
console.log('\n🔥 DEMO 6: Combo - Tất cả decorators\n');

let item6 = new BaseCartItem('Robot biến hình Transformers', 800000, 2);
console.log(`Sản phẩm: ${item6.getName()}`);
console.log(`Số lượng: ${item6.getQuantity()}`);
console.log(`Giá gốc (x2): ${item6.getPrice().toLocaleString('vi-VN')}đ`);

// Bọc lần 1: VAT
item6 = new VATDecorator(item6, 0.1);
console.log(`\n→ Sau khi + VAT 10%: ${item6.getPrice().toLocaleString('vi-VN')}đ`);

// Bọc lần 2: Voucher
item6 = new VoucherDecorator(item6, 100000, 'MEGA100K');
console.log(`→ Sau khi - Voucher 100K: ${item6.getPrice().toLocaleString('vi-VN')}đ`);

// Bọc lần 3: Free Shipping
item6 = new FreeShippingDecorator(item6, 30000, 500000);
console.log(`→ Sau khi miễn phí ship: ${item6.getPrice().toLocaleString('vi-VN')}đ`);

console.log(`\n📋 Thông tin chi tiết:`);
console.log(JSON.stringify(item6.getDetails(), null, 2));

// ============================================================
// DEMO 7: So sánh trước và sau
// ============================================================
console.log('\n' + '='.repeat(80));
console.log('\n📊 DEMO 7: Bảng so sánh\n');

const compareItem = new BaseCartItem('Búp bê Elsa Frozen', 450000, 1);
const originalPrice = compareItem.getPrice();

let decoratedItem = new BaseCartItem('Búp bê Elsa Frozen', 450000, 1);
decoratedItem = new VATDecorator(decoratedItem);
decoratedItem = new VoucherDecorator(decoratedItem, 80000, 'FLASH80K');
decoratedItem = new FreeShippingDecorator(decoratedItem);

console.log('┌─────────────────────────────────────────────────────────┐');
console.log('│                    SO SÁNH GIÁ                          │');
console.log('├─────────────────────────────────────────────────────────┤');
console.log(`│ Giá gốc:                    ${originalPrice.toLocaleString('vi-VN').padStart(20)}đ │`);
console.log(`│ Giá sau decorators:         ${decoratedItem.getPrice().toLocaleString('vi-VN').padStart(20)}đ │`);
console.log(`│ Tiết kiệm:                  ${(originalPrice - decoratedItem.getPrice()).toLocaleString('vi-VN').padStart(20)}đ │`);
console.log('└─────────────────────────────────────────────────────────┘');

console.log('\n' + '='.repeat(80));
console.log('\n✅ HOÀN THÀNH! Decorator Pattern hoạt động hoàn hảo!\n');
