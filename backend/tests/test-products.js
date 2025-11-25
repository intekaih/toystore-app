/**
 * ==========================================
 * TEST SCRIPT - PRODUCTS MODULE (PUBLIC)
 * ==========================================
 * Test các chức năng:
 * 1. Lấy danh sách sản phẩm (GET /api/products)
 * 2. Lấy chi tiết sản phẩm (GET /api/products/:id)
 * 3. Tìm kiếm sản phẩm
 * 4. Lọc sản phẩm (Filter Strategy Pattern)
 * 5. Phân trang
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Helper functions
function logSection(title) {
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.blue}${title}${colors.reset}`);
  console.log('='.repeat(80));
}

function logTest(testName) {
  totalTests++;
  console.log(`\n${colors.yellow}Test ${totalTests}: ${testName}${colors.reset}`);
}

function logSuccess(message) {
  passedTests++;
  console.log(`${colors.green}✓ PASS: ${message}${colors.reset}`);
}

function logError(message, error = null) {
  failedTests++;
  console.log(`${colors.red}✗ FAIL: ${message}${colors.reset}`);
  if (error) {
    console.log(`${colors.red}  Error: ${error.message || error}${colors.reset}`);
    if (error.response?.data) {
      console.log(`${colors.red}  Response: ${JSON.stringify(error.response.data, null, 2)}${colors.reset}`);
    }
  }
}

function logInfo(message) {
  console.log(`${colors.magenta}ℹ ${message}${colors.reset}`);
}

function printSummary() {
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.blue}📊 TEST SUMMARY${colors.reset}`);
  console.log('='.repeat(80));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
  console.log('='.repeat(80) + '\n');
}

// Test Functions

/**
 * TEST 1: Lấy danh sách sản phẩm
 */
async function testGetAllProducts() {
  logSection('TEST 1: LẤY DANH SÁCH SẢN PHẨM');

  // Test 1.1: Lấy danh sách sản phẩm mặc định (không có params)
  logTest('Lấy danh sách sản phẩm mặc định');
  try {
    const response = await axios.get(`${API_URL}/products`);
    
    if (response.data.success && 
        response.data.data.products && 
        Array.isArray(response.data.data.products)) {
      logSuccess('Lấy danh sách sản phẩm thành công');
      logInfo(`Số sản phẩm: ${response.data.data.products.length}`);
      logInfo(`Total products: ${response.data.data.pagination.totalProducts}`);
      logInfo(`Current page: ${response.data.data.pagination.currentPage}`);
    } else {
      logError('Response không đúng format');
    }
  } catch (error) {
    logError('Lấy danh sách sản phẩm thất bại', error);
  }

  // Test 1.2: Kiểm tra cấu trúc dữ liệu sản phẩm
  logTest('Kiểm tra cấu trúc dữ liệu sản phẩm');
  try {
    const response = await axios.get(`${API_URL}/products?limit=1`);
    
    if (response.data.data.products.length > 0) {
      const product = response.data.data.products[0];
      const requiredFields = ['ID', 'Ten', 'GiaBan', 'SoLuongTon', 'HinhAnhURL'];
      const hasAllFields = requiredFields.every(field => product.hasOwnProperty(field));
      
      if (hasAllFields) {
        logSuccess('Cấu trúc sản phẩm đúng format');
        logInfo(`Sample product: ${product.Ten} - ${product.GiaBan} VNĐ`);
      } else {
        logError('Thiếu một số trường bắt buộc trong sản phẩm');
      }
    } else {
      logError('Không có sản phẩm nào trong database');
    }
  } catch (error) {
    logError('Kiểm tra cấu trúc thất bại', error);
  }

  // Test 1.3: Kiểm tra URL hình ảnh
  logTest('Kiểm tra URL hình ảnh sản phẩm');
  try {
    const response = await axios.get(`${API_URL}/products?limit=1`);
    
    if (response.data.data.products.length > 0) {
      const product = response.data.data.products[0];
      if (product.HinhAnhURL) {
        const hasFullUrl = product.HinhAnhURL.startsWith('http');
        if (hasFullUrl) {
          logSuccess('URL hình ảnh có đầy đủ base URL');
          logInfo(`Image URL: ${product.HinhAnhURL.substring(0, 50)}...`);
        } else {
          logError('URL hình ảnh không có base URL');
        }
      } else {
        logInfo('Sản phẩm không có hình ảnh (NULL)');
        passedTests++;
      }
    }
  } catch (error) {
    logError('Kiểm tra URL hình ảnh thất bại', error);
  }
}

/**
 * TEST 2: Phân trang
 */
async function testPagination() {
  logSection('TEST 2: PHÂN TRANG');

  // Test 2.1: Phân trang với page=1, limit=5
  logTest('Phân trang với page=1, limit=5');
  try {
    const response = await axios.get(`${API_URL}/products?page=1&limit=5`);
    
    if (response.data.success) {
      const products = response.data.data.products;
      const pagination = response.data.data.pagination;
      
      if (products.length <= 5 && 
          pagination.currentPage === 1 && 
          pagination.productsPerPage === 5) {
        logSuccess('Phân trang hoạt động đúng');
        logInfo(`Products returned: ${products.length}`);
        logInfo(`Total pages: ${pagination.totalPages}`);
      } else {
        logError('Phân trang không đúng');
      }
    } else {
      logError('Response không thành công');
    }
  } catch (error) {
    logError('Test phân trang thất bại', error);
  }

  // Test 2.2: Phân trang với page không hợp lệ (page=0)
  logTest('Phân trang với page=0 (expect 400)');
  try {
    await axios.get(`${API_URL}/products?page=0`);
    logError('Không phát hiện được page không hợp lệ');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Hệ thống từ chối page không hợp lệ (400)');
    } else {
      logError('Sai error code', error);
    }
  }

  // Test 2.3: Phân trang với limit vượt quá giới hạn (limit=101)
  logTest('Phân trang với limit=101 (expect 400)');
  try {
    await axios.get(`${API_URL}/products?page=1&limit=101`);
    logError('Không phát hiện được limit vượt quá');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Hệ thống từ chối limit vượt quá (400)');
    } else {
      logError('Sai error code', error);
    }
  }

  // Test 2.4: Kiểm tra thông tin hasNextPage và hasPrevPage
  logTest('Kiểm tra thông tin hasNextPage và hasPrevPage');
  try {
    const response = await axios.get(`${API_URL}/products?page=1&limit=2`);
    
    if (response.data.success) {
      const pagination = response.data.data.pagination;
      
      if (pagination.hasPrevPage === false && 
          (pagination.totalProducts > 2 ? pagination.hasNextPage === true : true)) {
        logSuccess('Thông tin phân trang chính xác');
        logInfo(`hasPrevPage: ${pagination.hasPrevPage}, hasNextPage: ${pagination.hasNextPage}`);
      } else {
        logError('Thông tin phân trang không chính xác');
      }
    }
  } catch (error) {
    logError('Test thông tin phân trang thất bại', error);
  }
}

/**
 * TEST 3: Tìm kiếm sản phẩm
 */
async function testSearchProducts() {
  logSection('TEST 3: TÌM KIẾM SẢN PHẨM');

  // Test 3.1: Tìm kiếm với từ khóa hợp lệ
  logTest('Tìm kiếm sản phẩm với từ khóa "gấu"');
  try {
    const response = await axios.get(`${API_URL}/products?search=gấu`);
    
    if (response.data.success) {
      const products = response.data.data.products;
      logSuccess('Tìm kiếm thành công');
      logInfo(`Tìm thấy ${products.length} sản phẩm`);
      
      if (products.length > 0) {
        logInfo(`Sample: ${products[0].Ten}`);
      }
    } else {
      logError('Response không thành công');
    }
  } catch (error) {
    logError('Tìm kiếm thất bại', error);
  }

  // Test 3.2: Tìm kiếm với từ khóa không tồn tại
  logTest('Tìm kiếm với từ khóa không tồn tại');
  try {
    const response = await axios.get(`${API_URL}/products?search=xyzabc12345`);
    
    if (response.data.success && response.data.data.products.length === 0) {
      logSuccess('Tìm kiếm từ khóa không tồn tại trả về mảng rỗng');
      logInfo('Products: []');
    } else {
      logError('Response không đúng cho từ khóa không tồn tại');
    }
  } catch (error) {
    logError('Tìm kiếm thất bại', error);
  }

  // Test 3.3: Tìm kiếm với từ khóa rỗng
  logTest('Tìm kiếm với từ khóa rỗng (trả về tất cả)');
  try {
    const response = await axios.get(`${API_URL}/products?search=`);
    
    if (response.data.success) {
      logSuccess('Tìm kiếm với từ khóa rỗng trả về tất cả sản phẩm');
      logInfo(`Total products: ${response.data.data.pagination.totalProducts}`);
    } else {
      logError('Response không thành công');
    }
  } catch (error) {
    logError('Tìm kiếm thất bại', error);
  }
}

/**
 * TEST 4: Lọc sản phẩm (Strategy Pattern)
 */
async function testFilterProducts() {
  logSection('TEST 4: LỌC SẢN PHẨM (STRATEGY PATTERN)');

  // Test 4.1: Filter newest (mặc định)
  logTest('Lọc sản phẩm mới nhất (filter=newest)');
  try {
    const response = await axios.get(`${API_URL}/products?filter=newest&limit=5`);
    
    if (response.data.success) {
      const filters = response.data.data.filters;
      logSuccess('Filter newest hoạt động');
      logInfo(`Filter type: ${filters.filterType}`);
      logInfo(`Products returned: ${response.data.data.products.length}`);
    } else {
      logError('Response không thành công');
    }
  } catch (error) {
    logError('Filter newest thất bại', error);
  }

  // Test 4.2: Filter priceAsc (giá tăng dần)
  logTest('Lọc theo giá tăng dần (filter=priceAsc)');
  try {
    const response = await axios.get(`${API_URL}/products?filter=priceAsc&limit=3`);
    
    if (response.data.success) {
      const products = response.data.data.products;
      
      // Kiểm tra giá có tăng dần không
      let isAscending = true;
      for (let i = 0; i < products.length - 1; i++) {
        if (products[i].GiaBan > products[i + 1].GiaBan) {
          isAscending = false;
          break;
        }
      }
      
      if (isAscending) {
        logSuccess('Sắp xếp giá tăng dần đúng');
        logInfo(`Giá: ${products.map(p => p.GiaBan).join(' -> ')}`);
      } else {
        logError('Sắp xếp giá không đúng');
      }
    }
  } catch (error) {
    logError('Filter priceAsc thất bại', error);
  }

  // Test 4.3: Filter priceDesc (giá giảm dần)
  logTest('Lọc theo giá giảm dần (filter=priceDesc)');
  try {
    const response = await axios.get(`${API_URL}/products?filter=priceDesc&limit=3`);
    
    if (response.data.success) {
      const products = response.data.data.products;
      
      // Kiểm tra giá có giảm dần không
      let isDescending = true;
      for (let i = 0; i < products.length - 1; i++) {
        if (products[i].GiaBan < products[i + 1].GiaBan) {
          isDescending = false;
          break;
        }
      }
      
      if (isDescending) {
        logSuccess('Sắp xếp giá giảm dần đúng');
        logInfo(`Giá: ${products.map(p => p.GiaBan).join(' -> ')}`);
      } else {
        logError('Sắp xếp giá không đúng');
      }
    }
  } catch (error) {
    logError('Filter priceDesc thất bại', error);
  }

  // Test 4.4: Filter với minPrice và maxPrice
  logTest('Lọc theo khoảng giá (minPrice=100000, maxPrice=500000)');
  try {
    const response = await axios.get(`${API_URL}/products?minPrice=100000&maxPrice=500000`);
    
    if (response.data.success) {
      const products = response.data.data.products;
      
      // Kiểm tra tất cả sản phẩm có trong khoảng giá không
      const allInRange = products.every(p => p.GiaBan >= 100000 && p.GiaBan <= 500000);
      
      if (allInRange) {
        logSuccess('Lọc theo khoảng giá đúng');
        logInfo(`Found ${products.length} products in price range`);
      } else {
        logError('Có sản phẩm ngoài khoảng giá');
      }
    }
  } catch (error) {
    logError('Filter price range thất bại', error);
  }

  // Test 4.5: Filter bestSeller
  logTest('Lọc sản phẩm bán chạy (filter=bestSeller)');
  try {
    const response = await axios.get(`${API_URL}/products?filter=bestSeller&limit=5`);
    
    if (response.data.success) {
      const products = response.data.data.products;
      logSuccess('Filter bestSeller hoạt động');
      logInfo(`Top ${products.length} sản phẩm bán chạy`);
      
      if (products.length > 0 && products[0].SoLuongBan !== undefined) {
        logInfo(`Best seller: ${products[0].Ten} - Sold: ${products[0].SoLuongBan}`);
      }
    }
  } catch (error) {
    logError('Filter bestSeller thất bại', error);
  }

  // Test 4.6: Kiểm tra danh sách filters có sẵn
  logTest('Kiểm tra danh sách filters có sẵn');
  try {
    const response = await axios.get(`${API_URL}/products?limit=1`);
    
    if (response.data.success && response.data.data.filters.availableFilters) {
      const availableFilters = response.data.data.filters.availableFilters;
      logSuccess('Danh sách filters có sẵn');
      logInfo(`Available filters: ${availableFilters.join(', ')}`);
    } else {
      logError('Không có danh sách filters');
    }
  } catch (error) {
    logError('Kiểm tra filters thất bại', error);
  }
}

/**
 * TEST 5: Lấy chi tiết sản phẩm
 */
async function testGetProductById() {
  logSection('TEST 5: LẤY CHI TIẾT SẢN PHẨM');

  let validProductId = null;

  // Lấy một ID sản phẩm hợp lệ trước
  try {
    const response = await axios.get(`${API_URL}/products?limit=1`);
    if (response.data.data.products.length > 0) {
      validProductId = response.data.data.products[0].ID;
    }
  } catch (error) {
    console.log('Không thể lấy product ID để test');
  }

  // Test 5.1: Lấy chi tiết sản phẩm với ID hợp lệ
  if (validProductId) {
    logTest(`Lấy chi tiết sản phẩm với ID hợp lệ (ID=${validProductId})`);
    try {
      const response = await axios.get(`${API_URL}/products/${validProductId}`);
      
      if (response.data.success && response.data.data.product) {
        const product = response.data.data.product;
        logSuccess('Lấy chi tiết sản phẩm thành công');
        logInfo(`Product: ${product.Ten}`);
        logInfo(`Price: ${product.GiaBan} VNĐ`);
        logInfo(`Stock: ${product.SoLuongTon}`);
        
        if (product.LoaiSP) {
          logInfo(`Category: ${product.LoaiSP.Ten}`);
        }
      } else {
        logError('Response không đúng format');
      }
    } catch (error) {
      logError('Lấy chi tiết sản phẩm thất bại', error);
    }
  }

  // Test 5.2: Lấy chi tiết với ID không tồn tại
  logTest('Lấy chi tiết sản phẩm với ID không tồn tại (expect 404)');
  try {
    await axios.get(`${API_URL}/products/999999`);
    logError('Không phát hiện được ID không tồn tại');
  } catch (error) {
    if (error.response?.status === 404) {
      logSuccess('Hệ thống trả về 404 cho ID không tồn tại');
    } else {
      logError('Sai error code', error);
    }
  }

  // Test 5.3: Lấy chi tiết với ID không hợp lệ
  logTest('Lấy chi tiết sản phẩm với ID không hợp lệ (expect 400)');
  try {
    await axios.get(`${API_URL}/products/abc`);
    logError('Không phát hiện được ID không hợp lệ');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Hệ thống từ chối ID không hợp lệ (400)');
    } else {
      logError('Sai error code', error);
    }
  }

  // Test 5.4: Lấy chi tiết với ID âm
  logTest('Lấy chi tiết sản phẩm với ID âm (expect 400)');
  try {
    await axios.get(`${API_URL}/products/-1`);
    logError('Không phát hiện được ID âm');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Hệ thống từ chối ID âm (400)');
    } else {
      logError('Sai error code', error);
    }
  }
}

/**
 * TEST 6: Filter theo categoryId
 */
async function testFilterByCategory() {
  logSection('TEST 6: LỌC THEO DANH MỤC');

  // Test 6.1: Lọc theo categoryId hợp lệ
  logTest('Lọc sản phẩm theo categoryId=1');
  try {
    const response = await axios.get(`${API_URL}/products?categoryId=1`);
    
    if (response.data.success) {
      const products = response.data.data.products;
      
      // Kiểm tra tất cả sản phẩm có cùng categoryId
      const allSameCategory = products.every(p => p.LoaiID === 1);
      
      if (allSameCategory || products.length === 0) {
        logSuccess('Lọc theo categoryId đúng');
        logInfo(`Found ${products.length} products in category 1`);
      } else {
        logError('Có sản phẩm không thuộc category được lọc');
      }
    }
  } catch (error) {
    logError('Filter by category thất bại', error);
  }

  // Test 6.2: Kết hợp filter và categoryId
  logTest('Kết hợp filter=priceAsc và categoryId=1');
  try {
    const response = await axios.get(`${API_URL}/products?filter=priceAsc&categoryId=1&limit=3`);
    
    if (response.data.success) {
      const products = response.data.data.products;
      
      // Kiểm tra category và giá tăng dần
      const allSameCategory = products.every(p => p.LoaiID === 1);
      let isAscending = true;
      for (let i = 0; i < products.length - 1; i++) {
        if (products[i].GiaBan > products[i + 1].GiaBan) {
          isAscending = false;
          break;
        }
      }
      
      if (allSameCategory && (isAscending || products.length <= 1)) {
        logSuccess('Kết hợp filter và category đúng');
        logInfo(`Found ${products.length} products`);
      } else {
        logError('Kết hợp filter và category không đúng');
      }
    }
  } catch (error) {
    logError('Test kết hợp thất bại', error);
  }
}

// Main test runner
async function runAllTests() {
  console.log(`\n${colors.magenta}╔═══════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}║                   🧪 TOYSTORE - PRODUCTS MODULE TEST (PUBLIC)                ║${colors.reset}`);
  console.log(`${colors.magenta}╚═══════════════════════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  logInfo(`Server URL: ${BASE_URL}`);
  logInfo(`API Endpoint: ${API_URL}/products`);
  
  try {
    // Check if server is running
    logInfo('Checking server connection...');
    await axios.get(BASE_URL);
    logSuccess('Server is running ✓\n');

    // Run tests
    await testGetAllProducts();
    await testPagination();
    await testSearchProducts();
    await testFilterProducts();
    await testGetProductById();
    await testFilterByCategory();

    // Print summary
    printSummary();

    if (failedTests === 0) {
      console.log(`${colors.green}🎉 ALL TESTS PASSED! 🎉${colors.reset}\n`);
      process.exit(0);
    } else {
      console.log(`${colors.red}❌ SOME TESTS FAILED ❌${colors.reset}\n`);
      process.exit(1);
    }

  } catch (error) {
    console.error(`${colors.red}❌ Cannot connect to server at ${BASE_URL}${colors.reset}`);
    console.error(`${colors.red}Please make sure the server is running!${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runAllTests();
