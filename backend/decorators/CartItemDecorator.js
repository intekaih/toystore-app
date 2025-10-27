/**
 * 🎨 DECORATOR PATTERN - BASE DECORATOR
 * 
 * CartItemDecorator: Lớp trừu tượng cho tất cả decorators
 * Đây là Decorator cơ sở trong Decorator Pattern
 */

class CartItemDecorator {
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

  /**
   * Delegate getName() cho component được bọc
   */
  getName() {
    return this.cartItem.getName();
  }

  /**
   * Delegate getQuantity() cho component được bọc
   */
  getQuantity() {
    return this.cartItem.getQuantity();
  }

  /**
   * Delegate getDescription() cho component được bọc
   * Các decorator con có thể override để thêm mô tả
   */
  getDescription() {
    return this.cartItem.getDescription();
  }

  /**
   * Lấy thông tin chi tiết
   */
  getDetails() {
    return {
      name: this.getName(),
      quantity: this.getQuantity(),
      finalPrice: this.getPrice(),
      description: this.getDescription()
    };
  }
}

module.exports = CartItemDecorator;
