/**
 * 🎯 DECORATOR PATTERN - BASE COMPONENT (Frontend)
 * 
 * BaseCartItem: Lớp gốc đại diện cho một sản phẩm trong giỏ hàng
 * Tương thích với React và cấu trúc dữ liệu từ API
 */

export class BaseCartItem {
  /**
   * @param {Object} cartData - Dữ liệu từ GioHangChiTiet API
   * Hỗ trợ 2 cấu trúc:
   * 1. Từ API giỏ hàng: { ID, sanPham: { Ten, HinhAnhURL }, DonGia, SoLuong }
   * 2. Dạng đơn giản: { MaSP, TenSP, Gia, SoLuong, HinhAnh }
   */
  constructor(cartData) {
    // Xử lý cấu trúc từ API thực tế
    if (cartData.sanPham) {
      // Cấu trúc từ API: { ID, sanPham: {...}, DonGia, SoLuong }
      this.id = cartData.ID || cartData.id;
      this.name = cartData.sanPham.Ten;
      this.basePrice = parseFloat(cartData.DonGia) || 0;
      this.quantity = parseInt(cartData.SoLuong) || 1;
      this.image = cartData.sanPham.HinhAnhURL;
    } else {
      // Cấu trúc đơn giản: { MaSP, TenSP, Gia, SoLuong }
      this.id = cartData.MaSP || cartData.id;
      this.name = cartData.TenSP || cartData.name;
      this.basePrice = parseFloat(cartData.Gia) || 0;
      this.quantity = parseInt(cartData.SoLuong) || 1;
      this.image = cartData.HinhAnh || cartData.image;
    }
    
    this.originalData = cartData; // Giữ nguyên data gốc
  }

  /**
   * Tính tổng giá = giá gốc × số lượng
   * @returns {number}
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
   * Lấy URL hình ảnh
   * @returns {string}
   */
  getImage() {
    return this.image;
  }

  /**
   * Mô tả sản phẩm
   * @returns {string}
   */
  getDescription() {
    return `${this.name} (x${this.quantity})`;
  }

  /**
   * Lấy thông tin chi tiết (dùng cho React component)
   * @returns {Object}
   */
  getDetails() {
    return {
      id: this.id,
      name: this.getName(),
      quantity: this.getQuantity(),
      basePrice: this.basePrice,
      finalPrice: this.getPrice(),
      image: this.getImage(),
      description: this.getDescription(),
      priceBreakdown: [] // Sẽ được override bởi decorators
    };
  }

  /**
   * Format giá theo VNĐ
   * @param {number} price
   * @returns {string}
   */
  formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }
}

export default BaseCartItem;
