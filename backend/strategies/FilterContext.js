/**
 * 📝 FilterContext - Context Class
 * 
 * Class này chịu trách nhiệm:
 * 1. Quản lý mapping giữa filterType và Strategy tương ứng
 * 2. Chọn strategy phù hợp dựa trên filterType từ request
 * 3. Thực thi strategy đã chọn
 * 
 * 🎯 Đây là trung tâm của Strategy Pattern:
 * - Controller chỉ cần gọi FilterContext.applyFilter()
 * - Không cần biết strategy nào đang được sử dụng
 * - Dễ dàng thêm strategy mới mà không sửa controller
 */

const NewestStrategy = require('./NewestStrategy');
const PriceAscendingStrategy = require('./PriceAscendingStrategy');
const PriceDescendingStrategy = require('./PriceDescendingStrategy');
const BestSellerStrategy = require('./BestSellerStrategy');

class FilterContext {
  constructor() {
    /**
     * 📋 Strategy Registry - Mapping giữa filterType và Strategy instance
     * 
     * Khi thêm strategy mới:
     * 1. Tạo file strategy mới (ví dụ: DiscountStrategy.js)
     * 2. Import ở đầu file này
     * 3. Thêm vào registry này
     * 
     * ✅ Không cần sửa logic ở nơi khác!
     */
    this.strategies = {
      newest: new NewestStrategy(),
      priceAsc: new PriceAscendingStrategy(),
      priceDesc: new PriceDescendingStrategy(),
      bestSeller: new BestSellerStrategy(),
      // Thêm strategy mới ở đây, ví dụ:
      // discount: new DiscountStrategy(),
      // rating: new HighestRatingStrategy(),
    };

    /**
     * Strategy mặc định khi không chỉ định filterType
     */
    this.defaultStrategy = 'newest';
  }

  /**
   * 🎯 Phương thức chính: Áp dụng filter strategy
   * 
   * @param {Array} products - Danh sách sản phẩm cần lọc
   * @param {String} filterType - Loại filter (newest, priceAsc, priceDesc, bestSeller)
   * @param {Object} queryParams - Các tham số query khác (minPrice, maxPrice, categoryId)
   * @returns {Array} - Danh sách sản phẩm đã được lọc và sắp xếp
   */
  applyFilter(products, filterType, queryParams = {}) {
    // Bước 1: Chọn strategy dựa trên filterType
    const strategy = this.getStrategy(filterType);

    // Bước 2: Thực thi strategy
    const filteredProducts = strategy.filter(products, queryParams);

    // Bước 3: Trả về kết quả
    return filteredProducts;
  }

  /**
   * 🔍 Lấy strategy instance dựa trên filterType
   * 
   * @param {String} filterType - Loại filter
   * @returns {ProductFilterStrategy} - Strategy instance
   */
  getStrategy(filterType) {
    // Nếu filterType không hợp lệ hoặc không tồn tại, dùng strategy mặc định
    const selectedStrategy = this.strategies[filterType] || this.strategies[this.defaultStrategy];

    // Log để debug (có thể bỏ trong production)
    if (!this.strategies[filterType]) {
      console.warn(`⚠️ FilterType '${filterType}' không tồn tại. Sử dụng strategy mặc định: ${this.defaultStrategy}`);
    }

    return selectedStrategy;
  }

  /**
   * 📋 Lấy danh sách tất cả filterType có sẵn
   * 
   * @returns {Array} - Mảng các filterType
   */
  getAvailableFilters() {
    return Object.keys(this.strategies);
  }

  /**
   * ➕ Đăng ký strategy mới động (nếu cần mở rộng runtime)
   * 
   * @param {String} filterType - Tên filter type
   * @param {ProductFilterStrategy} strategyInstance - Instance của strategy
   */
  registerStrategy(filterType, strategyInstance) {
    this.strategies[filterType] = strategyInstance;
    console.log(`✅ Strategy '${filterType}' đã được đăng ký`);
  }
}

// Export singleton instance để dùng chung trong toàn app
module.exports = new FilterContext();
