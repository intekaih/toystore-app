/**
 * 🎨 DECORATOR PATTERN - BASE DECORATOR (Frontend)
 * 
 * CartItemDecorator: Lớp trừu tượng cho tất cả decorators
 */

export class CartItemDecorator {
  /**
   * @param {BaseCartItem|CartItemDecorator} cartItem - Item hoặc decorator được bọc
   */
  constructor(cartItem) {
    if (!cartItem) {
      throw new Error('CartItem is required for decorator');
    }
    this.cartItem = cartItem;
  }

  /**
   * Delegate getPrice() cho component được bọc
   * Các decorator con sẽ override phương thức này
   */
  getPrice() {
    return this.cartItem.getPrice();
  }

  getName() {
    return this.cartItem.getName();
  }

  getQuantity() {
    return this.cartItem.getQuantity();
  }

  getImage() {
    return this.cartItem.getImage();
  }

  getDescription() {
    return this.cartItem.getDescription();
  }

  getDetails() {
    return this.cartItem.getDetails();
  }

  formatPrice(price) {
    return this.cartItem.formatPrice(price);
  }
}

export default CartItemDecorator;
