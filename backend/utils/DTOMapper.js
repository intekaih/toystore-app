/**
 * DTO Mapper - Chuyển đổi giữa PascalCase (Database) và camelCase (Frontend)
 * 
 * Giải quyết vấn đề inconsistent naming convention:
 * - Database SQL Server: PascalCase (ID, Ten, GiaBan, HoTen...)
 * - Frontend JavaScript: camelCase (id, ten, giaBan, hoTen...)
 * 
 * Usage:
 * - DTOMapper.toCamelCase(data) - Convert PascalCase to camelCase
 * - DTOMapper.toPascalCase(data) - Convert camelCase to PascalCase
 */

class DTOMapper {
  /**
   * Chuyển string từ PascalCase sang camelCase
   * VD: "TenSanPham" -> "tenSanPham"
   */
  static toCamelCaseString(str) {
    if (!str || typeof str !== 'string') return str;
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /**
   * Chuyển string từ camelCase sang PascalCase
   * VD: "tenSanPham" -> "TenSanPham"
   */
  static toPascalCaseString(str) {
    if (!str || typeof str !== 'string') return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Chuyển đổi object keys từ PascalCase sang camelCase
   * Sử dụng khi trả dữ liệu từ database về frontend
   */
  static toCamelCase(obj) {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Nếu là array, transform từng phần tử
    if (Array.isArray(obj)) {
      return obj.map(item => this.toCamelCase(item));
    }

    // Nếu là Date object, giữ nguyên
    if (obj instanceof Date) {
      return obj;
    }

    // Nếu không phải object, trả về nguyên giá trị
    if (typeof obj !== 'object') {
      return obj;
    }

    // Transform object keys
    const result = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelKey = this.toCamelCaseString(key);
        const value = obj[key];
        
        // Recursive transform cho nested objects
        if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
          result[camelKey] = this.toCamelCase(value);
        } else {
          result[camelKey] = value;
        }
      }
    }

    return result;
  }

  /**
   * Chuyển đổi object keys từ camelCase sang PascalCase
   * Sử dụng khi nhận dữ liệu từ frontend để query database
   */
  static toPascalCase(obj) {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Nếu là array, transform từng phần tử
    if (Array.isArray(obj)) {
      return obj.map(item => this.toPascalCase(item));
    }

    // Nếu là Date object, giữ nguyên
    if (obj instanceof Date) {
      return obj;
    }

    // Nếu không phải object, trả về nguyên giá trị
    if (typeof obj !== 'object') {
      return obj;
    }

    // Transform object keys
    const result = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const pascalKey = this.toPascalCaseString(key);
        const value = obj[key];
        
        // Recursive transform cho nested objects
        if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
          result[pascalKey] = this.toPascalCase(value);
        } else {
          result[pascalKey] = value;
        }
      }
    }

    return result;
  }

  /**
   * Map response data từ database sang DTO format cho frontend
   * Tự động chuyển PascalCase thành camelCase
   */
  static mapToDTO(data, options = {}) {
    const { 
      excludeFields = [], // Các field không muốn trả về
      includeFields = [], // Chỉ trả về các field này (nếu có)
      customMapping = {}  // Custom mapping cho các field đặc biệt
    } = options;

    if (!data) return null;

    // Convert to camelCase
    let dto = this.toCamelCase(data);

    // Apply custom mapping
    if (Object.keys(customMapping).length > 0) {
      for (const [oldKey, newKey] of Object.entries(customMapping)) {
        if (dto.hasOwnProperty(oldKey)) {
          dto[newKey] = dto[oldKey];
          delete dto[oldKey];
        }
      }
    }

    // Exclude fields
    if (excludeFields.length > 0) {
      excludeFields.forEach(field => {
        delete dto[field];
      });
    }

    // Include only specific fields
    if (includeFields.length > 0) {
      const filtered = {};
      includeFields.forEach(field => {
        if (dto.hasOwnProperty(field)) {
          filtered[field] = dto[field];
        }
      });
      dto = filtered;
    }

    return dto;
  }

  /**
   * Map request data từ frontend sang database format
   * Tự động chuyển camelCase thành PascalCase
   */
  static mapFromDTO(data, options = {}) {
    const { 
      customMapping = {}  // Custom mapping cho các field đặc biệt
    } = options;

    if (!data) return null;

    // Convert to PascalCase
    let dbData = this.toPascalCase(data);

    // Apply custom mapping
    if (Object.keys(customMapping).length > 0) {
      for (const [oldKey, newKey] of Object.entries(customMapping)) {
        if (dbData.hasOwnProperty(oldKey)) {
          dbData[newKey] = dbData[oldKey];
          delete dbData[oldKey];
        }
      }
    }

    return dbData;
  }
}

module.exports = DTOMapper;

