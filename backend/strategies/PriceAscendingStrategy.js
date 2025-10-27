/**
 * 📝 PriceAscendingStrategy - Sắp xếp sản phẩm theo giá tăng dần
 * 
 * Strategy này sắp xếp danh sách sản phẩm từ giá thấp đến giá cao.
 * 
 * 🎯 Use case: Người dùng muốn tìm sản phẩm rẻ nhất, tiết kiệm chi phí
 */

const ProductFilterStrategy = require('./ProductFilterStrategy');

class PriceAscendingStrategy extends ProductFilterStrategy {
  /**
   * Lọc và sắp xếp sản phẩm theo giá tăng dần (thấp → cao)
   * 
   * @param {Array} products - Danh sách sản phẩm gốc
   * @param {Object} query - Tham số query (minPrice, maxPrice, categoryId)
   * @returns {Array} - Sản phẩm đã sắp xếp theo giá tăng dần
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

    // Bước 2: Sắp xếp theo giá tăng dần
    filtered.sort((a, b) => {
      const priceA = parseFloat(a.GiaBan) || 0;
      const priceB = parseFloat(b.GiaBan) || 0;
      return priceA - priceB; // Tăng dần: a - b
    });

    return filtered;
  }
}

module.exports = PriceAscendingStrategy;
