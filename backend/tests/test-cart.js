/**
 * ==========================================
 * TEST SCRIPT - SHOPPING CART MODULE
 * ==========================================
 * Test các chức năng:
 * 1. Thêm sản phẩm vào giỏ hàng
 * 2. Xem giỏ hàng
 * 3. Cập nhật số lượng sản phẩm
 * 4. Tăng/giảm số lượng
 * 5. Xóa sản phẩm khỏi giỏ hàng
 * 6. Xóa toàn bộ giỏ hàng
 * 7. Chọn/bỏ chọn sản phẩm
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

// Test data
let userToken = '';
let testProductId = null;

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

/**
 * Setup: Tạo user và đăng nhập để lấy token
 */
async function setupTestUser() {
  logSection('SETUP: TẠO USER VÀ ĐĂNG NHẬP');
  
  try {
    // Tạo user mới
    const username = `testcart_${Date.now()}`;
    const password = 'Test123456';
    
    logInfo(`Tạo user: ${username}`);
    
    try {
      await axios.post(`${API_URL}/auth/register`, {
        TenDangNhap: username,
        MatKhau: password,
        HoTen: 'Test Cart User',
        Email: `${username}@test.com`
      });
      logInfo('✓ Tạo user thành công');
    } catch (error) {
      if (error.response?.status === 409) {
        logInfo('⚠ User đã tồn tại, tiếp tục đăng nhập');
      } else {
        throw error;
      }
    }
    
    // Đăng nhập
    logInfo('Đăng nhập...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      TenDangNhap: username,
      MatKhau: password
    });
    
    userToken = loginResponse.data.data.token;
    logSuccess(`Đăng nhập thành công - Token: ${userToken.substring(0, 20)}...`);
    
    // Lấy một sản phẩm để test (nếu có)
    const productsResponse = await axios.get(`${API_URL}/products?limit=1`);
    if (productsResponse.data.data.products.length > 0) {
      testProductId = productsResponse.data.data.products[0].ID;
      logInfo(`Sử dụng sản phẩm test: ID=${testProductId}`);
    } else {
      logInfo('⚠ Không có sản phẩm trong database - một số test sẽ bị skip');
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Setup thất bại:${colors.reset}`, error.message);
    process.exit(1);
  }
}

/**
 * TEST 1: Xem giỏ hàng trống
 */
async function testGetEmptyCart() {
  logSection('TEST 1: XEM GIỎ HÀNG TRỐNG');
  
  logTest('Lấy giỏ hàng khi chưa có sản phẩm');
  try {
    const response = await axios.get(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success && 
        response.data.data.items && 
        Array.isArray(response.data.data.items) &&
        response.data.data.totalItems === 0 &&
        response.data.data.totalAmount === 0) {
      logSuccess('Giỏ hàng trống đúng format');
      logInfo(`Total items: ${response.data.data.totalItems}`);
      logInfo(`Total amount: ${response.data.data.totalAmount}`);
    } else {
      logError('Response không đúng format');
    }
  } catch (error) {
    logError('Lấy giỏ hàng trống thất bại', error);
  }
}

/**
 * TEST 2: Thêm sản phẩm vào giỏ hàng
 */
async function testAddToCart() {
  logSection('TEST 2: THÊM SẢN PHẨM VÀO GIỎ HÀNG');
  
  if (!testProductId) {
    logInfo('⚠ Skip test - Không có sản phẩm trong database');
    return;
  }
  
  // Test 2.1: Thêm sản phẩm thành công
  logTest('Thêm sản phẩm vào giỏ hàng');
  try {
    const response = await axios.post(`${API_URL}/cart/add`, {
      sanPhamId: testProductId,
      soLuong: 2
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      logSuccess('Thêm sản phẩm thành công');
      logInfo(`Product ID: ${testProductId}`);
      logInfo(`Quantity: 2`);
    } else {
      logError('Response không thành công');
    }
  } catch (error) {
    logError('Thêm sản phẩm thất bại', error);
  }
  
  // Test 2.2: Thêm sản phẩm thiếu thông tin
  logTest('Thêm sản phẩm thiếu thông tin (expect 400)');
  try {
    await axios.post(`${API_URL}/cart/add`, {
      soLuong: 1
      // Thiếu sanPhamId
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    logError('Không phát hiện được thiếu thông tin');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Hệ thống từ chối do thiếu thông tin (400)');
    } else {
      logError('Sai error code', error);
    }
  }
  
  // Test 2.3: Thêm sản phẩm với số lượng không hợp lệ
  logTest('Thêm sản phẩm với số lượng = 0 (expect 400)');
  try {
    await axios.post(`${API_URL}/cart/add`, {
      sanPhamId: testProductId,
      soLuong: 0
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    logError('Không phát hiện được số lượng không hợp lệ');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Hệ thống từ chối số lượng không hợp lệ (400)');
    } else {
      logError('Sai error code', error);
    }
  }
  
  // Test 2.4: Thêm sản phẩm không tồn tại
  logTest('Thêm sản phẩm không tồn tại (expect 404)');
  try {
    await axios.post(`${API_URL}/cart/add`, {
      sanPhamId: 999999,
      soLuong: 1
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    logError('Không phát hiện được sản phẩm không tồn tại');
  } catch (error) {
    if (error.response?.status === 404) {
      logSuccess('Hệ thống từ chối sản phẩm không tồn tại (404)');
    } else {
      logError('Sai error code', error);
    }
  }
}

/**
 * TEST 3: Xem giỏ hàng có sản phẩm
 */
async function testGetCart() {
  logSection('TEST 3: XEM GIỎ HÀNG CÓ SẢN PHẨM');
  
  if (!testProductId) {
    logInfo('⚠ Skip test - Không có sản phẩm trong giỏ hàng');
    return;
  }
  
  logTest('Lấy giỏ hàng sau khi thêm sản phẩm');
  try {
    const response = await axios.get(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success && 
        response.data.data.items.length > 0 &&
        response.data.data.totalItems > 0 &&
        response.data.data.totalAmount > 0) {
      logSuccess('Lấy giỏ hàng thành công');
      logInfo(`Total items: ${response.data.data.totalItems}`);
      logInfo(`Total amount: ${response.data.data.totalAmount.toLocaleString()} VNĐ`);
      
      // Kiểm tra cấu trúc item
      const item = response.data.data.items[0];
      if (item.SanPhamID && item.SoLuong && item.DonGia) {
        logInfo('✓ Cấu trúc item đúng format');
      }
    } else {
      logError('Giỏ hàng vẫn trống hoặc sai format');
    }
  } catch (error) {
    logError('Lấy giỏ hàng thất bại', error);
  }
}

/**
 * TEST 4: Cập nhật số lượng sản phẩm
 */
async function testUpdateCartItem() {
  logSection('TEST 4: CẬP NHẬT SỐ LƯỢNG SẢN PHẨM');
  
  if (!testProductId) {
    logInfo('⚠ Skip test - Không có sản phẩm trong giỏ hàng');
    return;
  }
  
  // Test 4.1: Cập nhật số lượng thành công
  logTest('Cập nhật số lượng sản phẩm thành 5');
  try {
    const response = await axios.put(`${API_URL}/cart/update`, {
      sanPhamId: testProductId,
      soLuong: 5
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      logSuccess('Cập nhật số lượng thành công');
      logInfo('New quantity: 5');
    } else {
      logError('Response không thành công');
    }
  } catch (error) {
    logError('Cập nhật số lượng thất bại', error);
  }
  
  // Test 4.2: Cập nhật với số lượng không hợp lệ
  logTest('Cập nhật số lượng = 0 (expect 400)');
  try {
    await axios.put(`${API_URL}/cart/update`, {
      sanPhamId: testProductId,
      soLuong: 0
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    logError('Không phát hiện được số lượng không hợp lệ');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Hệ thống từ chối số lượng không hợp lệ (400)');
    } else {
      logError('Sai error code', error);
    }
  }
}

/**
 * TEST 5: Tăng/giảm số lượng sản phẩm
 */
async function testIncrementDecrement() {
  logSection('TEST 5: TĂNG/GIẢM SỐ LƯỢNG SẢN PHẨM');
  
  if (!testProductId) {
    logInfo('⚠ Skip test - Không có sản phẩm trong giỏ hàng');
    return;
  }
  
  // Test 5.1: Tăng số lượng
  logTest('Tăng số lượng sản phẩm (+1)');
  try {
    const response = await axios.patch(`${API_URL}/cart/increment/${testProductId}`, {}, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      logSuccess('Tăng số lượng thành công');
      logInfo(`New quantity: ${response.data.data.SoLuong}`);
    } else {
      logError('Response không thành công');
    }
  } catch (error) {
    logError('Tăng số lượng thất bại', error);
  }
  
  // Test 5.2: Giảm số lượng
  logTest('Giảm số lượng sản phẩm (-1)');
  try {
    const response = await axios.patch(`${API_URL}/cart/decrement/${testProductId}`, {}, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      logSuccess('Giảm số lượng thành công');
      if (response.data.data.removed) {
        logInfo('Sản phẩm đã được xóa (quantity = 0)');
      } else {
        logInfo(`New quantity: ${response.data.data.SoLuong}`);
      }
    } else {
      logError('Response không thành công');
    }
  } catch (error) {
    logError('Giảm số lượng thất bại', error);
  }
  
  // Test 5.3: Tăng số lượng với productId không hợp lệ
  logTest('Tăng số lượng với productId không hợp lệ (expect 400)');
  try {
    await axios.patch(`${API_URL}/cart/increment/abc`, {}, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    logError('Không phát hiện được productId không hợp lệ');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Hệ thống từ chối productId không hợp lệ (400)');
    } else {
      logError('Sai error code', error);
    }
  }
}

/**
 * TEST 6: Chọn/bỏ chọn sản phẩm
 */
async function testSelectItems() {
  logSection('TEST 6: CHỌN/BỎ CHỌN SẢN PHẨM');
  
  if (!testProductId) {
    logInfo('⚠ Skip test - Không có sản phẩm trong giỏ hàng');
    return;
  }
  
  // Thêm lại sản phẩm nếu đã bị xóa
  try {
    await axios.post(`${API_URL}/cart/add`, {
      sanPhamId: testProductId,
      soLuong: 1
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
  } catch (error) {
    // Ignore error if product already in cart
  }
  
  // Test 6.1: Chọn sản phẩm
  logTest('Chọn sản phẩm trong giỏ hàng');
  try {
    const response = await axios.put(`${API_URL}/cart/select/${testProductId}`, {
      selected: true
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success && response.data.data.selected === true) {
      logSuccess('Chọn sản phẩm thành công');
    } else {
      logError('Response không đúng');
    }
  } catch (error) {
    logError('Chọn sản phẩm thất bại', error);
  }
  
  // Test 6.2: Bỏ chọn sản phẩm
  logTest('Bỏ chọn sản phẩm trong giỏ hàng');
  try {
    const response = await axios.put(`${API_URL}/cart/select/${testProductId}`, {
      selected: false
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success && response.data.data.selected === false) {
      logSuccess('Bỏ chọn sản phẩm thành công');
    } else {
      logError('Response không đúng');
    }
  } catch (error) {
    logError('Bỏ chọn sản phẩm thất bại', error);
  }
  
  // Test 6.3: Chọn tất cả sản phẩm
  logTest('Chọn tất cả sản phẩm');
  try {
    const response = await axios.put(`${API_URL}/cart/select-all`, {
      selected: true
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      logSuccess('Chọn tất cả thành công');
      logInfo(`Updated: ${response.data.data.updatedCount} items`);
    } else {
      logError('Response không thành công');
    }
  } catch (error) {
    logError('Chọn tất cả thất bại', error);
  }
  
  // Test 6.4: Lấy danh sách sản phẩm đã chọn
  logTest('Lấy danh sách sản phẩm đã chọn');
  try {
    const response = await axios.get(`${API_URL}/cart/selected`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      logSuccess('Lấy danh sách đã chọn thành công');
      logInfo(`Selected items: ${response.data.data.totalItems}`);
      logInfo(`Total amount: ${response.data.data.totalAmount.toLocaleString()} VNĐ`);
    } else {
      logError('Response không thành công');
    }
  } catch (error) {
    logError('Lấy danh sách đã chọn thất bại', error);
  }
}

/**
 * TEST 7: Xóa sản phẩm khỏi giỏ hàng
 */
async function testRemoveFromCart() {
  logSection('TEST 7: XÓA SẢN PHẨM KHỎI GIỎ HÀNG');
  
  if (!testProductId) {
    logInfo('⚠ Skip test - Không có sản phẩm trong giỏ hàng');
    return;
  }
  
  // Test 7.1: Xóa sản phẩm thành công
  logTest('Xóa sản phẩm khỏi giỏ hàng');
  try {
    const response = await axios.delete(`${API_URL}/cart/remove/${testProductId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      logSuccess('Xóa sản phẩm thành công');
    } else {
      logError('Response không thành công');
    }
  } catch (error) {
    logError('Xóa sản phẩm thất bại', error);
  }
  
  // Test 7.2: Xóa sản phẩm không tồn tại trong giỏ
  logTest('Xóa sản phẩm không tồn tại trong giỏ (expect 404)');
  try {
    await axios.delete(`${API_URL}/cart/remove/999999`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    logError('Không phát hiện được sản phẩm không tồn tại');
  } catch (error) {
    if (error.response?.status === 404) {
      logSuccess('Hệ thống từ chối xóa sản phẩm không tồn tại (404)');
    } else {
      logError('Sai error code', error);
    }
  }
}

/**
 * TEST 8: Xóa toàn bộ giỏ hàng
 */
async function testClearCart() {
  logSection('TEST 8: XÓA TOÀN BỘ GIỎ HÀNG');
  
  // Thêm sản phẩm trước khi test clear
  if (testProductId) {
    try {
      await axios.post(`${API_URL}/cart/add`, {
        sanPhamId: testProductId,
        soLuong: 1
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
    } catch (error) {
      // Ignore error
    }
  }
  
  logTest('Xóa toàn bộ giỏ hàng');
  try {
    const response = await axios.delete(`${API_URL}/cart/clear`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      logSuccess('Xóa toàn bộ giỏ hàng thành công');
      
      // Verify giỏ hàng đã trống
      const cartResponse = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      if (cartResponse.data.data.totalItems === 0) {
        logInfo('✓ Verified: Giỏ hàng đã trống');
      }
    } else {
      logError('Response không thành công');
    }
  } catch (error) {
    logError('Xóa giỏ hàng thất bại', error);
  }
}

/**
 * TEST 9: Truy cập giỏ hàng không có token
 */
async function testUnauthorizedAccess() {
  logSection('TEST 9: TRUY CẬP KHÔNG CÓ TOKEN');
  
  logTest('Truy cập giỏ hàng không có token (expect 401)');
  try {
    await axios.get(`${API_URL}/cart`);
    logError('Cho phép truy cập không có token');
  } catch (error) {
    if (error.response?.status === 401) {
      logSuccess('Hệ thống từ chối request không có token (401)');
    } else {
      logError('Sai error code', error);
    }
  }
  
  logTest('Thêm vào giỏ không có token (expect 401)');
  try {
    await axios.post(`${API_URL}/cart/add`, {
      sanPhamId: 1,
      soLuong: 1
    });
    logError('Cho phép thêm vào giỏ không có token');
  } catch (error) {
    if (error.response?.status === 401) {
      logSuccess('Hệ thống từ chối request không có token (401)');
    } else {
      logError('Sai error code', error);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log(`\n${colors.magenta}╔═══════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}║                   🧪 TOYSTORE - SHOPPING CART MODULE TEST                    ║${colors.reset}`);
  console.log(`${colors.magenta}╚═══════════════════════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  logInfo(`Server URL: ${BASE_URL}`);
  logInfo(`API Endpoint: ${API_URL}/cart`);
  
  try {
    // Check if server is running
    logInfo('Checking server connection...');
    await axios.get(BASE_URL);
    logSuccess('Server is running ✓\n');

    // Setup test user
    await setupTestUser();

    // Run tests
    await testGetEmptyCart();
    await testAddToCart();
    await testGetCart();
    await testUpdateCartItem();
    await testIncrementDecrement();
    await testSelectItems();
    await testRemoveFromCart();
    await testClearCart();
    await testUnauthorizedAccess();

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
