/**
 * 📝 NewestStrategy - Sắp xếp sản phẩm theo ngày thêm mới nhất
 * 
 * Strategy này sắp xếp danh sách sản phẩm theo thứ tự thời gian thêm vào,
 * sản phẩm mới nhất sẽ được hiển thị trước.
 * 
 * 🎯 Use case: Trang "Hàng mới về", "Sản phẩm mới nhất"
 */

const ProductFilterStrategy = require('./ProductFilterStrategy');

class NewestStrategy extends ProductFilterStrategy {
  /**
   * Lọc và sắp xếp sản phẩm theo ngày thêm mới nhất
   * 
   * @param {Array} products - Danh sách sản phẩm gốc
   * @param {Object} query - Tham số query (minPrice, maxPrice, categoryId)
   * @returns {Array} - Sản phẩm đã sắp xếp theo ngày mới nhất
   */
  filter(products, query = {}) {
    // Bước 1: Áp dụng các filter cơ bản (giá, danh mục) nếu có
    let filtered = [...products]; // Clone array để tránh mutate original

    // Lọc theo khoảng giá
    filtered = this.filterByPriceRange(
      filtered, 
      query.minPrice, 
      query.maxPrice
    );

    // Lọc theo danh mục
    filtered = this.filterByCategory(filtered, query.categoryId);

    // Bước 2: Sắp xếp theo ngày thêm (NgayTao) - mới nhất trước
    filtered.sort((a, b) => {
      // Nếu có trường NgayTao trong database
      if (a.NgayTao && b.NgayTao) {
        return new Date(b.NgayTao) - new Date(a.NgayTao);
      }
      // Fallback: sắp xếp theo ID (giả định ID tăng dần theo thời gian)
      return b.ID - a.ID;
    });

    return filtered;
  }
}

module.exports = NewestStrategy;
