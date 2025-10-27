import { CartItemDecorator } from './CartItemDecorator';

/**
 * 🚚 FREE SHIPPING DECORATOR (Frontend)
 * 
 * Miễn phí vận chuyển khi đơn hàng đủ điều kiện
 */
export class FreeShippingDecorator extends CartItemDecorator {
  /**
   * @param {BaseCartItem|CartItemDecorator} cartItem
   * @param {number} shippingDiscount - Số tiền giảm phí ship (mặc định 20000đ)
   * @param {number} minOrderValue - Giá trị đơn tối thiểu (mặc định 500000đ)
   */
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

  getRemainingForFreeShip() {
    if (this.isEligibleForFreeShipping()) {
      return 0;
    }
    return this.minOrderValue - this.cartItem.getPrice();
  }

  getDescription() {
    const originalDesc = this.cartItem.getDescription();
    
    if (this.isEligibleForFreeShipping()) {
      return `${originalDesc} - Miễn phí ship`;
    }
    
    const remaining = this.getRemainingForFreeShip();
    return `${originalDesc} (Mua thêm ${this.formatPrice(remaining)} để được miễn phí ship)`;
  }

  getDetails() {
    const baseDetails = this.cartItem.getDetails();
    const isEligible = this.isEligibleForFreeShipping();
    
    const details = {
      ...baseDetails,
      finalPrice: this.getPrice(),
      description: this.getDescription(),
      freeShipping: {
        isEligible,
        minOrderValue: this.minOrderValue,
        remaining: this.getRemainingForFreeShip(),
        savedAmount: isEligible ? this.shippingDiscount : 0
      }
    };

    if (isEligible) {
      details.priceBreakdown = [
        ...baseDetails.priceBreakdown,
        {
          type: 'shipping',
          label: 'Miễn phí vận chuyển',
          amount: this.shippingDiscount,
          isAddition: false
        }
      ];
    }

    return details;
  }
}

export default FreeShippingDecorator;
