const Decimal = require('decimal.js');
const { OrderPriceDecorator } = require('./OrderPriceDecorator');

/**
 * ✅ CONCRETE DECORATOR - Shipping Fee (Phí vận chuyển)
 * Thêm phí ship vào giá đơn hàng
 * 
 * Công thức: TongTien = TongTienTruoc + PhiShip
 */
class ShippingDecorator extends OrderPriceDecorator {
  constructor(calculator, shippingFee = 0, shippingInfo = {}) {
    super(calculator);
    this.shippingFee = new Decimal(shippingFee);
    this.shippingInfo = shippingInfo; // {method, distance, weight, estimatedDays}
  }

  /**
   * Tính tổng tiền bao gồm phí ship
   * @returns {Decimal}
   */
  calculate() {
    const subtotal = this.calculator.calculate();
    return subtotal.plus(this.shippingFee);
  }

  /**
   * Lấy chi tiết giá bao gồm phí ship
   * @returns {Object}
   */
  getDetails() {
    const previousDetails = this.calculator.getDetails();
    const subtotal = this.calculator.calculate();
    const totalWithShipping = subtotal.plus(this.shippingFee);

    return {
      ...previousDetails,
      shipping: {
        fee: this.shippingFee.toFixed(2),
        method: this.shippingInfo.method || 'Standard',
        distance: this.shippingInfo.distance || null,
        weight: this.shippingInfo.weight || null,
        estimatedDays: this.shippingInfo.estimatedDays || '3-5',
        subtotalBeforeShipping: subtotal.toFixed(2),
        totalWithShipping: totalWithShipping.toFixed(2)
      },
      tongTien: totalWithShipping.toFixed(2) // Cập nhật tổng tiền
    };
  }

  /**
   * Tính phí ship động dựa trên khoảng cách và trọng lượng
   * @param {number} distance - Khoảng cách (km)
   * @param {number} weight - Trọng lượng (kg)
   * @returns {Decimal}
   */
  static calculateDynamicShippingFee(distance, weight) {
    const baseShippingFee = new Decimal(15000); // 15k cơ bản
    const distanceFee = new Decimal(distance).times(1000); // 1k/km
    const weightFee = new Decimal(weight).times(5000); // 5k/kg
    
    return baseShippingFee.plus(distanceFee).plus(weightFee);
  }
}

module.exports = ShippingDecorator;