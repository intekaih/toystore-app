/**
 * 📝 PriceDescendingStrategy - Sắp xếp sản phẩm theo giá giảm dần
 * 
 * Strategy này sắp xếp danh sách sản phẩm từ giá cao đến giá thấp.
 * 
 * 🎯 Use case: Hiển thị sản phẩm cao cấp, đắt tiền trước
 */

const ProductFilterStrategy = require('./ProductFilterStrategy');

class PriceDescendingStrategy extends ProductFilterStrategy {
  /**
   * Lọc và sắp xếp sản phẩm theo giá giảm dần (cao → thấp)
   * 
   * @param {Array} products - Danh sách sản phẩm gốc
   * @param {Object} query - Tham số query (minPrice, maxPrice, categoryId)
   * @returns {Array} - Sản phẩm đã sắp xếp theo giá giảm dần
   */
  filter(products, query = {}) {
    // Bước 1: Clone và áp dụng các filter cơ bản
    let filtered = [...products];

    // Lọc theo khoảng giá
    filtered = this.filterByPriceRange(
      filtered, 
      query.minPrice, 
      query.maxPrice
    );

    // Lọc theo danh mục
    filtered = this.filterByCategory(filtered, query.categoryId);

    // Bước 2: Sắp xếp theo giá giảm dần
    filtered.sort((a, b) => {
      const priceA = parseFloat(a.GiaBan) || 0;
      const priceB = parseFloat(b.GiaBan) || 0;
      return priceB - priceA; // Giảm dần: b - a
    });

    return filtered;
  }
}

module.exports = PriceDescendingStrategy;
