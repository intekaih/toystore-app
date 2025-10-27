/**
 * 📝 ProductFilterStrategy - Base Class (Abstract Strategy)
 * 
 * Đây là interface/class cơ sở cho tất cả các chiến lược lọc sản phẩm.
 * Mỗi strategy cụ thể sẽ kế thừa class này và implement phương thức filter().
 * 
 * 🎯 Mục đích:
 * - Định nghĩa contract chung cho tất cả các strategy
 * - Đảm bảo mỗi strategy đều có phương thức filter()
 * - Tạo tính đồng nhất khi sử dụng các strategy khác nhau
 */

class ProductFilterStrategy {
  /**
   * Phương thức filter - phải được override bởi các class con
   * 
   * @param {Array} products - Danh sách sản phẩm cần lọc/sắp xếp
   * @param {Object} query - Các tham số query từ request (giá min/max, category, v.v.)
   * @returns {Array} - Danh sách sản phẩm đã được lọc/sắp xếp
   * @throws {Error} - Nếu method không được implement
   */
  filter(products, query) {
    throw new Error('Method filter() must be implemented by subclass');
  }

  /**
   * Helper method: Lọc theo khoảng giá (dùng chung cho nhiều strategy)
   * 
   * @param {Array} products - Danh sách sản phẩm
   * @param {Number} minPrice - Giá tối thiểu
   * @param {Number} maxPrice - Giá tối đa
   * @returns {Array} - Sản phẩm trong khoảng giá
   */
  filterByPriceRange(products, minPrice, maxPrice) {
    if (!minPrice && !maxPrice) return products;

    return products.filter(product => {
      const price = parseFloat(product.GiaBan) || 0;
      if (minPrice && price < minPrice) return false;
      if (maxPrice && price > maxPrice) return false;
      return true;
    });
  }

  /**
   * Helper method: Lọc theo danh mục
   * 
   * @param {Array} products - Danh sách sản phẩm
   * @param {Number} categoryId - ID danh mục
   * @returns {Array} - Sản phẩm thuộc danh mục
   */
  filterByCategory(products, categoryId) {
    if (!categoryId) return products;
    return products.filter(product => product.LoaiID == categoryId);
  }
}

module.exports = ProductFilterStrategy;
