const Decimal = require('decimal.js');
const { OrderPriceDecorator } = require('./OrderPriceDecorator');

/**
 * ✅ CONCRETE DECORATOR - VAT (Thuế GTGT)
 * Thêm thuế VAT vào giá đơn hàng
 * 
 * Công thức: TongTien = TongTienTruoc + (TongTienTruoc * VAT%)
 */
class VATDecorator extends OrderPriceDecorator {
  constructor(calculator, vatRate = 0) {
    super(calculator);
    this.vatRate = new Decimal(vatRate); // VAT rate (e.g., 0.1 = 10%)
  }

  /**
   * Tính tổng tiền bao gồm VAT
   * @returns {Decimal}
   */
  calculate() {
    const subtotal = this.calculator.calculate();
    const vatAmount = subtotal.times(this.vatRate);
    return subtotal.plus(vatAmount);
  }

  /**
   * Lấy chi tiết giá bao gồm VAT
   * @returns {Object}
   */
  getDetails() {
    const previousDetails = this.calculator.getDetails();
    // ✅ FIX: Lấy subtotal từ decorator trước đó, không phải từ tongTienSanPham
    const subtotal = this.calculator.calculate();
    const vatAmount = subtotal.times(this.vatRate);
    const totalWithVAT = subtotal.plus(vatAmount);

    return {
      ...previousDetails,
      vat: {
        rate: this.vatRate.toFixed(4), // 0.1000 = 10%
        ratePercent: this.vatRate.times(100).toFixed(2) + '%', // "10.00%"
        amount: vatAmount.toFixed(2),
        subtotalBeforeVAT: subtotal.toFixed(2),
        totalWithVAT: totalWithVAT.toFixed(2)
      },
      tongTien: totalWithVAT.toFixed(2) // Cập nhật tổng tiền
    };
  }
}

module.exports = VATDecorator;