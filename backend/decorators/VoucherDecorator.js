const CartItemDecorator = require('./CartItemDecorator');

/**
 * 🎫 VOUCHER DECORATOR
 * 
 * Áp dụng mã giảm giá (voucher) cho sản phẩm
 */
class VoucherDecorator extends CartItemDecorator {
  /**
   * @param {BaseCartItem|CartItemDecorator} cartItem - Item được bọc
   * @param {number} discountAmount - Số tiền giảm giá (VNĐ)
   * @param {string} voucherCode - Mã voucher (optional)
   */
  constructor(cartItem, discountAmount, voucherCode = 'DISCOUNT') {
    super(cartItem);
    this.discountAmount = discountAmount;
    this.voucherCode = voucherCode;
  }

  /**
   * Tính giá sau khi trừ voucher
   * @returns {number} Giá gốc - Giảm giá (không âm)
   */
  getPrice() {
    const originalPrice = this.cartItem.getPrice();
    const finalPrice = originalPrice - this.discountAmount;
    // Đảm bảo giá không âm
    return Math.max(0, finalPrice);
  }

  /**
   * Thêm mô tả về voucher
   */
  getDescription() {
    const originalDesc = this.cartItem.getDescription();
    return `${originalDesc} - Voucher ${this.voucherCode} (-${this.discountAmount.toLocaleString('vi-VN')}đ)`;
  }

  /**
   * Lấy số tiền giảm giá thực tế
   * @returns {number}
   */
  getActualDiscount() {
    const originalPrice = this.cartItem.getPrice();
    return Math.min(this.discountAmount, originalPrice);
  }

  /**
   * Chi tiết bao gồm thông tin voucher
   */
  getDetails() {
    const baseDetails = super.getDetails();
    return {
      ...baseDetails,
      voucherCode: this.voucherCode,
      discountAmount: this.discountAmount,
      actualDiscount: this.getActualDiscount()
    };
  }
}

module.exports = VoucherDecorator;
