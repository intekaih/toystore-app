/**
 * 📝 BestSellerStrategy - Sắp xếp sản phẩm theo độ bán chạy
 * 
 * Strategy này sắp xếp danh sách sản phẩm theo số lượng đã bán,
 * sản phẩm bán nhiều nhất sẽ được hiển thị trước.
 * 
 * 🎯 Use case: Trang "Bán chạy nhất", "Top sản phẩm"
 * 
 * 📊 Logic: 
 * - Tính tổng số lượng bán của mỗi sản phẩm từ bảng ChiTietHoaDon
 * - Sắp xếp theo số lượng bán giảm dần
 */

const ProductFilterStrategy = require('./ProductFilterStrategy');

class BestSellerStrategy extends ProductFilterStrategy {
  /**
   * Lọc và sắp xếp sản phẩm theo số lượng bán
   * 
   * @param {Array} products - Danh sách sản phẩm (phải include chiTietHoaDons)
   * @param {Object} query - Tham số query (minPrice, maxPrice, categoryId)
   * @returns {Array} - Sản phẩm đã sắp xếp theo bán chạy
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

    // Bước 2: Tính tổng số lượng bán cho mỗi sản phẩm
    const productsWithSalesCount = filtered.map(product => {
      // Kiểm tra xem có dữ liệu chiTietHoaDons không
      let totalSold = 0;
      
      if (product.chiTietHoaDons && Array.isArray(product.chiTietHoaDons)) {
        // Tính tổng SoLuong từ tất cả các đơn hàng
        totalSold = product.chiTietHoaDons.reduce((sum, detail) => {
          return sum + (detail.SoLuong || 0);
        }, 0);
      }

      // Thêm thuộc tính totalSold vào product
      return {
        ...(product.toJSON ? product.toJSON() : product),
        totalSold
      };
    });

    // Bước 3: Sắp xếp theo số lượng bán giảm dần
    productsWithSalesCount.sort((a, b) => {
      return b.totalSold - a.totalSold; // Giảm dần: bán nhiều nhất trước
    });

    return productsWithSalesCount;
  }
}

module.exports = BestSellerStrategy;
