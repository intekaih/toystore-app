/**
 * 🎯 DECORATOR PATTERN - BASE COMPONENT
 * 
 * BaseCartItem: Lớp gốc đại diện cho một sản phẩm trong giỏ hàng
 * Đây là Component trong Decorator Pattern
 */

class BaseCartItem {
  /**
   * @param {string} name - Tên sản phẩm
   * @param {number} basePrice - Giá gốc của sản phẩm
   * @param {number} quantity - Số lượng (mặc định = 1)
   */
  constructor(name, basePrice, quantity = 1) {
    this.name = name;
    this.basePrice = basePrice;
    this.quantity = quantity;
  }

  /**
   * Phương thức cơ bản trả về giá gốc
   * @returns {number} Tổng giá = giá gốc × số lượng
   */
  getPrice() {
    return this.basePrice * this.quantity;
  }

  /**
   * Lấy tên sản phẩm
   * @returns {string}
   */
  getName() {
    return this.name;
  }

  /**
   * Lấy số lượng
   * @returns {number}
   */
  getQuantity() {
    return this.quantity;
  }

  /**
   * Mô tả chi tiết sản phẩm
   * @returns {string}
   */
  getDescription() {
    return `${this.name} (x${this.quantity})`;
  }

  /**
   * Hiển thị thông tin chi tiết
   * @returns {object}
   */
  getDetails() {
    return {
      name: this.getName(),
      quantity: this.getQuantity(),
      basePrice: this.basePrice,
      finalPrice: this.getPrice(),
      description: this.getDescription()
    };
  }
}

module.exports = BaseCartItem;
