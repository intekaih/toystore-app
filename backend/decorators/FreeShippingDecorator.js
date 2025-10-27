const CartItemDecorator = require('./CartItemDecorator');

/**
 * 🚚 FREE SHIPPING DECORATOR
 * 
 * Miễn phí vận chuyển khi đơn hàng đạt điều kiện
 */
class FreeShippingDecorator extends CartItemDecorator {
  /**
   * @param {BaseCartItem|CartItemDecorator} cartItem - Item được bọc
   * @param {number} shippingDiscount - Số tiền giảm phí ship (mặc định 20000đ)
   * @param {number} minOrderValue - Giá trị đơn hàng tối thiểu để được miễn phí ship (mặc định 500000đ)
   */
  constructor(cartItem, shippingDiscount = 20000, minOrderValue = 500000) {
    super(cartItem);
    this.shippingDiscount = shippingDiscount;
    this.minOrderValue = minOrderValue;
  }

  /**
   * Tính giá sau khi áp dụng miễn phí ship
   * @returns {number}
   */
  getPrice() {
    const originalPrice = this.cartItem.getPrice();
    
    // Chỉ giảm giá ship nếu đơn hàng đạt điều kiện
    if (originalPrice >= this.minOrderValue) {
      return Math.max(0, originalPrice - this.shippingDiscount);
    }
    
    return originalPrice;
  }

  /**
   * Kiểm tra xem có đủ điều kiện miễn phí ship không
   * @returns {boolean}
   */
  isEligibleForFreeShipping() {
    return this.cartItem.getPrice() >= this.minOrderValue;
  }

  /**
   * Thêm mô tả về free shipping
   */
  getDescription() {
    const originalDesc = this.cartItem.getDescription();
    
    if (this.isEligibleForFreeShipping()) {
      return `${originalDesc} - Miễn phí ship (-${this.shippingDiscount.toLocaleString('vi-VN')}đ)`;
    }
    
    const remaining = this.minOrderValue - this.cartItem.getPrice();
    return `${originalDesc} (Mua thêm ${remaining.toLocaleString('vi-VN')}đ để được miễn phí ship)`;
  }

  /**
   * Chi tiết bao gồm thông tin free shipping
   */
  getDetails() {
    const baseDetails = super.getDetails();
    return {
      ...baseDetails,
      shippingDiscount: this.shippingDiscount,
      minOrderValue: this.minOrderValue,
      isEligible: this.isEligibleForFreeShipping(),
      savedAmount: this.isEligibleForFreeShipping() ? this.shippingDiscount : 0
    };
  }
}

module.exports = FreeShippingDecorator;
