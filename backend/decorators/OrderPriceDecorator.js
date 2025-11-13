const Decimal = require('decimal.js');

/**
 * ✅ BASE COMPONENT - Order Price Calculator
 * Tính giá cơ bản của đơn hàng (chỉ tổng tiền sản phẩm)
 */
class OrderPriceCalculator {
  constructor(items) {
    this.items = items; // Array of {sanPhamId, ten, soLuong, donGia}
  }

  /**
   * Tính tổng tiền sản phẩm (chưa có phí, thuế, giảm giá)
   * @returns {Decimal}
   */
  calculate() {
    let total = new Decimal(0);
    
    for (const item of this.items) {
      const donGia = new Decimal(item.donGia);
      const soLuong = new Decimal(item.soLuong);
      const thanhTien = donGia.times(soLuong);
      total = total.plus(thanhTien);
    }
    
    return total;
  }

  /**
   * Lấy chi tiết giá (breakdown)
   * @returns {Object}
   */
  getDetails() {
    return {
      tongTienSanPham: this.calculate().toFixed(2),
      items: this.items.map(item => ({
        sanPhamId: item.sanPhamId,
        ten: item.ten,
        soLuong: item.soLuong,
        donGia: parseFloat(item.donGia),
        thanhTien: new Decimal(item.donGia).times(item.soLuong).toFixed(2)
      }))
    };
  }
}

/**
 * ✅ BASE DECORATOR - Abstract Decorator
 * Lớp cha cho tất cả các decorator (VAT, Ship, Voucher)
 */
class OrderPriceDecorator {
  constructor(calculator) {
    this.calculator = calculator; // Decorator wraps another calculator
  }

  /**
   * Tính tổng tiền (mặc định delegate cho calculator bên trong)
   * @returns {Decimal}
   */
  calculate() {
    return this.calculator.calculate();
  }

  /**
   * Lấy chi tiết giá (mặc định delegate cho calculator bên trong)
   * @returns {Object}
   */
  getDetails() {
    return this.calculator.getDetails();
  }
}

module.exports = {
  OrderPriceCalculator,
  OrderPriceDecorator
};