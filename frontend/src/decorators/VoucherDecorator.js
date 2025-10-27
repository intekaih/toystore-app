import { CartItemDecorator } from './CartItemDecorator';

/**
 * 🎫 VOUCHER DECORATOR (Frontend)
 * 
 * Áp dụng mã giảm giá
 */
export class VoucherDecorator extends CartItemDecorator {
  /**
   * @param {BaseCartItem|CartItemDecorator} cartItem
   * @param {number} discountAmount - Số tiền giảm giá (VNĐ)
   * @param {string} voucherCode - Mã voucher
   */
  constructor(cartItem, discountAmount, voucherCode = 'DISCOUNT') {
    super(cartItem);
    this.discountAmount = discountAmount;
    this.voucherCode = voucherCode;
  }

  getPrice() {
    const originalPrice = this.cartItem.getPrice();
    const finalPrice = originalPrice - this.discountAmount;
    return Math.max(0, finalPrice);
  }

  getDescription() {
    const originalDesc = this.cartItem.getDescription();
    return `${originalDesc} - Voucher ${this.voucherCode}`;
  }

  getActualDiscount() {
    const originalPrice = this.cartItem.getPrice();
    return Math.min(this.discountAmount, originalPrice);
  }

  getVoucherCode() {
    return this.voucherCode;
  }

  getDetails() {
    const baseDetails = this.cartItem.getDetails();
    const actualDiscount = this.getActualDiscount();
    
    return {
      ...baseDetails,
      finalPrice: this.getPrice(),
      description: this.getDescription(),
      priceBreakdown: [
        ...baseDetails.priceBreakdown,
        {
          type: 'voucher',
          label: `Voucher ${this.voucherCode}`,
          amount: actualDiscount,
          isAddition: false
        }
      ]
    };
  }
}

export default VoucherDecorator;
