import { CartItemDecorator } from './CartItemDecorator';

/**
 * 💰 VAT DECORATOR (Frontend)
 * 
 * Thêm thuế VAT vào giá sản phẩm
 */
export class VATDecorator extends CartItemDecorator {
  /**
   * @param {BaseCartItem|CartItemDecorator} cartItem
   * @param {number} vatRate - Tỷ lệ VAT (mặc định 0.1 = 10%)
   */
  constructor(cartItem, vatRate = 0.1) {
    super(cartItem);
    this.vatRate = vatRate;
  }

  getPrice() {
    const originalPrice = this.cartItem.getPrice();
    const vatAmount = originalPrice * this.vatRate;
    return originalPrice + vatAmount;
  }

  getDescription() {
    const originalDesc = this.cartItem.getDescription();
    return `${originalDesc} + VAT ${this.vatRate * 100}%`;
  }

  getVATAmount() {
    return this.cartItem.getPrice() * this.vatRate;
  }

  getDetails() {
    const baseDetails = this.cartItem.getDetails();
    const vatAmount = this.getVATAmount();
    
    return {
      ...baseDetails,
      finalPrice: this.getPrice(),
      description: this.getDescription(),
      priceBreakdown: [
        ...baseDetails.priceBreakdown,
        {
          type: 'vat',
          label: `VAT (${this.vatRate * 100}%)`,
          amount: vatAmount,
          isAddition: true
        }
      ]
    };
  }
}

export default VATDecorator;
