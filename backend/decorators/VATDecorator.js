const CartItemDecorator = require('./CartItemDecorator');

/**
 * 💰 VAT DECORATOR
 * 
 * Thêm thuế VAT (10%) vào giá sản phẩm
 */
class VATDecorator extends CartItemDecorator {
  /**
   * @param {BaseCartItem|CartItemDecorator} cartItem - Item được bọc
   * @param {number} vatRate - Tỷ lệ VAT (mặc định 0.1 = 10%)
   */
  constructor(cartItem, vatRate = 0.1) {
    super(cartItem);
    this.vatRate = vatRate;
  }

  /**
   * Tính giá sau khi cộng VAT
   * @returns {number} Giá gốc + (Giá gốc × VAT%)
   */
  getPrice() {
    const originalPrice = this.cartItem.getPrice();
    const vatAmount = originalPrice * this.vatRate;
    return originalPrice + vatAmount;
  }

  /**
   * Thêm mô tả về VAT
   */
  getDescription() {
    const originalDesc = this.cartItem.getDescription();
    return `${originalDesc} + VAT ${this.vatRate * 100}%`;
  }

  /**
   * Lấy số tiền VAT
   * @returns {number}
   */
  getVATAmount() {
    return this.cartItem.getPrice() * this.vatRate;
  }

  /**
   * Chi tiết bao gồm thông tin VAT
   */
  getDetails() {
    const baseDetails = super.getDetails();
    return {
      ...baseDetails,
      vatRate: `${this.vatRate * 100}%`,
      vatAmount: this.getVATAmount()
    };
  }
}

module.exports = VATDecorator;
