/**
 * 🔄 Middleware chuyển đổi PascalCase thành camelCase cho response
 * Áp dụng cho tất cả API responses để đồng bộ với frontend
 */

const toCamelCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
};

const transformKeys = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Nếu là array, transform từng phần tử
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item));
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
      const camelKey = toCamelCase(key);
      const value = obj[key];
      
      // Recursive transform cho nested objects
      if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
        result[camelKey] = transformKeys(value);
      } else {
        result[camelKey] = value;
      }
    }
  }

  return result;
};

/**
 * Express middleware để transform response
 */
const transformResponse = (req, res, next) => {
  // Lưu lại hàm json gốc
  const originalJson = res.json;

  // Override hàm json
  res.json = function(data) {
    // Transform data từ PascalCase sang camelCase
    const transformedData = transformKeys(data);
    
    // Gọi hàm json gốc với data đã transform
    return originalJson.call(this, transformedData);
  };

  next();
};

module.exports = transformResponse;