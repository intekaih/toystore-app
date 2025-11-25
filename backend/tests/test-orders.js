/**
 * ==========================================
 * TEST SCRIPT - ORDERS MODULE
 * ==========================================
 * Test các chức năng:
 * 1. Tạo đơn hàng từ giỏ hàng
 * 2. Xem danh sách đơn hàng
 * 3. Xem chi tiết đơn hàng
 * 4. Lịch sử đơn hàng (phân trang)
 * 5. Hủy đơn hàng
 * 6. Xem đơn hàng public (không cần đăng nhập)
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
let testOrderId = null;
let testOrderCode = null;

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
 * Setup: Tạo user, đăng nhập và thêm sản phẩm vào giỏ
 */
async function setupTestData() {
  logSection('SETUP: CHUẨN BỊ DỮ LIỆU TEST');
  
  try {
    // Tạo user mới
    const username = `testorder_${Date.now()}`;
    const password = 'Test123456';
    
    logInfo(`Tạo user: ${username}`);
    
    try {
      await axios.post(`${API_URL}/auth/register`, {
        TenDangNhap: username,
        MatKhau: password,
        HoTen: 'Test Order User',
        Email: `${username}@test.com`,
        DienThoai: '0987654321'
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
    
    // Lấy một sản phẩm để test
    const productsResponse = await axios.get(`${API_URL}/products?limit=1`);
    if (productsResponse.data.data.products.length > 0) {
      testProductId = productsResponse.data.data.products[0].ID;
      logInfo(`Sử dụng sản phẩm test: ID=${testProductId}`);
      
      // Thêm sản phẩm vào giỏ hàng
      logInfo('Thêm sản phẩm vào giỏ hàng...');
      await axios.post(`${API_URL}/cart/add`, {
        sanPhamId: testProductId,
        soLuong: 2
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      logSuccess('Đã thêm sản phẩm vào giỏ hàng');
    } else {
      logInfo('⚠ Không có sản phẩm trong database - một số test sẽ bị skip');
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Setup thất bại:${colors.reset}`, error.message);
    process.exit(1);
  }
}

/**
 * TEST 1: Tạo đơn hàng từ giỏ hàng
 */
async function testCreateOrder() {
  logSection('TEST 1: TẠO ĐỠN HÀNG TỪ GIỎ HÀNG');
  
  if (!testProductId) {
    logInfo('⚠ Skip test - Không có sản phẩm trong giỏ hàng');
    return;
  }
  
  // Test 1.1: Tạo đơn hàng thành công
  logTest('Tạo đơn hàng với đầy đủ thông tin');
  try {
    const response = await axios.post(`${API_URL}/orders/create`, {
      phuongThucThanhToanId: 1,
      ghiChu: 'Test order - Giao giờ hành chính',
      diaChiGiaoHang: '123 Nguyễn Huệ',
      dienThoai: '0987654321',
      tinhThanh: 'TP. Hồ Chí Minh',
      quanHuyen: 'Quận 1',
      phuongXa: 'Phường Bến Nghé',
      tienShip: 30000
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success && response.data.data.hoaDon) {
      const order = response.data.data.hoaDon;
      testOrderId = order.id;
      testOrderCode = order.maHD;
      
      logSuccess('Tạo đơn hàng thành công');
      logInfo(`Order ID: ${order.id}`);
      logInfo(`Mã hóa đơn: ${order.maHD}`);
      logInfo(`Tổng tiền: ${order.tongTien.toLocaleString()} VNĐ`);
      logInfo(`Trạng thái: ${order.trangThai}`);
      
      // Kiểm tra breakdown giá
      if (order.priceBreakdown) {
        logInfo('✓ Price breakdown có đầy đủ thông tin');
      }
    } else {
      logError('Response không đúng format');
    }
  } catch (error) {
    logError('Tạo đơn hàng thất bại', error);
  }
  
  // Test 1.2: Tạo đơn hàng với giỏ hàng trống
  logTest('Tạo đơn hàng với giỏ hàng trống (expect 400)');
  try {
    await axios.post(`${API_URL}/orders/create`, {
      phuongThucThanhToanId: 1,
      diaChiGiaoHang: '123 Test Street'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    logError('Không phát hiện được giỏ hàng trống');
  } catch (error) {
    if (error.response?.status === 400 && 
        error.response?.data?.message?.includes('trống')) {
      logSuccess('Hệ thống từ chối giỏ hàng trống (400)');
    } else {
      logError('Sai error code hoặc message', error);
    }
  }
  
  // Test 1.3: Tạo đơn hàng thiếu phương thức thanh toán
  logTest('Tạo đơn hàng thiếu phương thức thanh toán (expect 400)');
  
  // Thêm lại sản phẩm vào giỏ cho test này
  if (testProductId) {
    try {
      await axios.post(`${API_URL}/cart/add`, {
        sanPhamId: testProductId,
        soLuong: 1
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
    } catch (e) {
      // Ignore if already in cart
    }
  }
  
  try {
    await axios.post(`${API_URL}/orders/create`, {
      diaChiGiaoHang: '123 Test Street'
      // Thiếu phuongThucThanhToanId
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    logError('Không phát hiện được thiếu phương thức thanh toán');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Hệ thống từ chối do thiếu phương thức thanh toán (400)');
    } else {
      logError('Sai error code', error);
    }
  }
}

/**
 * TEST 2: Xem danh sách đơn hàng
 */
async function testGetMyOrders() {
  logSection('TEST 2: XEM DANH SÁCH ĐƠN HÀNG');
  
  logTest('Lấy danh sách đơn hàng của tôi');
  try {
    const response = await axios.get(`${API_URL}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success && Array.isArray(response.data.data.orders)) {
      logSuccess('Lấy danh sách đơn hàng thành công');
      logInfo(`Số đơn hàng: ${response.data.data.orders.length}`);
      
      if (response.data.data.orders.length > 0) {
        const order = response.data.data.orders[0];
        logInfo(`Đơn hàng mới nhất: ${order.maHD} - ${order.trangThai}`);
      }
    } else {
      logError('Response không đúng format');
    }
  } catch (error) {
    logError('Lấy danh sách đơn hàng thất bại', error);
  }
}

/**
 * TEST 3: Xem chi tiết đơn hàng
 */
async function testGetOrderDetail() {
  logSection('TEST 3: XEM CHI TIẾT ĐƠN HÀNG');
  
  if (!testOrderId) {
    logInfo('⚠ Skip test - Không có đơn hàng để test');
    return;
  }
  
  // Test 3.1: Xem chi tiết đơn hàng hợp lệ
  logTest(`Xem chi tiết đơn hàng ID=${testOrderId}`);
  try {
    const response = await axios.get(`${API_URL}/orders/${testOrderId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success && response.data.data.hoaDon) {
      const order = response.data.data.hoaDon;
      logSuccess('Lấy chi tiết đơn hàng thành công');
      logInfo(`Mã HD: ${order.maHD}`);
      logInfo(`Tổng tiền: ${order.tongTien.toLocaleString()} VNĐ`);
      logInfo(`Số sản phẩm: ${order.chiTiet.length}`);
      
      // Kiểm tra các thông tin bắt buộc
      if (order.khachHang && order.phuongThucThanhToan && order.chiTiet) {
        logInfo('✓ Có đầy đủ thông tin khách hàng, thanh toán, chi tiết');
      }
    } else {
      logError('Response không đúng format');
    }
  } catch (error) {
    logError('Lấy chi tiết đơn hàng thất bại', error);
  }
  
  // Test 3.2: Xem đơn hàng không tồn tại
  logTest('Xem đơn hàng không tồn tại (expect 404)');
  try {
    await axios.get(`${API_URL}/orders/999999`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    logError('Không phát hiện được đơn hàng không tồn tại');
  } catch (error) {
    if (error.response?.status === 404) {
      logSuccess('Hệ thống trả về 404 cho đơn hàng không tồn tại');
    } else {
      logError('Sai error code', error);
    }
  }
  
  // Test 3.3: Xem đơn hàng với ID không hợp lệ
  logTest('Xem đơn hàng với ID không hợp lệ (expect 400)');
  try {
    await axios.get(`${API_URL}/orders/abc`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    logError('Không phát hiện được ID không hợp lệ');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Hệ thống từ chối ID không hợp lệ (400)');
    } else {
      logError('Sai error code', error);
    }
  }
}

/**
 * TEST 4: Lịch sử đơn hàng với phân trang
 */
async function testOrderHistory() {
  logSection('TEST 4: LỊCH SỬ ĐƠN HÀNG (PHÂN TRANG)');
  
  // Test 4.1: Lấy lịch sử với phân trang
  logTest('Lấy lịch sử đơn hàng với page=1, limit=10');
  try {
    const response = await axios.get(`${API_URL}/orders/history?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success && 
        response.data.data.orders &&
        response.data.data.pagination) {
      logSuccess('Lấy lịch sử đơn hàng thành công');
      logInfo(`Total orders: ${response.data.data.pagination.totalOrders}`);
      logInfo(`Current page: ${response.data.data.pagination.currentPage}`);
      logInfo(`Total pages: ${response.data.data.pagination.totalPages}`);
    } else {
      logError('Response không đúng format');
    }
  } catch (error) {
    logError('Lấy lịch sử đơn hàng thất bại', error);
  }
  
  // Test 4.2: Lọc theo trạng thái
  logTest('Lọc đơn hàng theo trạng thái "Chờ thanh toán"');
  try {
    const response = await axios.get(`${API_URL}/orders/history?trangThai=Chờ thanh toán`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      logSuccess('Lọc theo trạng thái thành công');
      logInfo(`Số đơn: ${response.data.data.orders.length}`);
      
      // Kiểm tra tất cả đơn có đúng trạng thái
      const allCorrectStatus = response.data.data.orders.every(
        order => order.trangThai === 'Chờ thanh toán'
      );
      if (allCorrectStatus || response.data.data.orders.length === 0) {
        logInfo('✓ Tất cả đơn hàng có đúng trạng thái');
      }
    } else {
      logError('Response không thành công');
    }
  } catch (error) {
    logError('Lọc theo trạng thái thất bại', error);
  }
  
  // Test 4.3: Phân trang với page không hợp lệ
  logTest('Phân trang với page=-1 (expect có xử lý)');
  try {
    const response = await axios.get(`${API_URL}/orders/history?page=-1`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    // Hệ thống nên tự động chuyển về page 1 hoặc trả lỗi
    if (response.data.success) {
      logSuccess('Hệ thống xử lý page không hợp lệ (fallback to default)');
    } else {
      logError('Response không đúng');
    }
  } catch (error) {
    logError('Test phân trang thất bại', error);
  }
}

/**
 * TEST 5: Xem đơn hàng public (không cần đăng nhập)
 */
async function testPublicOrderDetail() {
  logSection('TEST 5: XEM ĐƠN HÀNG PUBLIC (KHÔNG CẦN ĐĂNG NHẬP)');
  
  if (!testOrderCode) {
    logInfo('⚠ Skip test - Không có mã đơn hàng để test');
    return;
  }
  
  // Test 5.1: Xem đơn hàng bằng mã hóa đơn
  logTest(`Xem đơn hàng public với mã: ${testOrderCode}`);
  try {
    const response = await axios.get(`${API_URL}/orders/public/${testOrderCode}`);
    
    if (response.data.success && response.data.data.hoaDon) {
      const order = response.data.data.hoaDon;
      logSuccess('Xem đơn hàng public thành công (không cần token)');
      logInfo(`Mã HD: ${order.maHD}`);
      logInfo(`Tổng tiền: ${order.tongTien.toLocaleString()} VNĐ`);
      logInfo(`Trạng thái: ${order.trangThai}`);
    } else {
      logError('Response không đúng format');
    }
  } catch (error) {
    logError('Xem đơn hàng public thất bại', error);
  }
  
  // Test 5.2: Xem đơn hàng với mã không tồn tại
  logTest('Xem đơn hàng public với mã không tồn tại (expect 404)');
  try {
    await axios.get(`${API_URL}/orders/public/HD99999999999`);
    logError('Không phát hiện được mã không tồn tại');
  } catch (error) {
    if (error.response?.status === 404) {
      logSuccess('Hệ thống trả về 404 cho mã không tồn tại');
    } else {
      logError('Sai error code', error);
    }
  }
}

/**
 * TEST 6: Hủy đơn hàng
 */
async function testCancelOrder() {
  logSection('TEST 6: HỦY ĐƠN HÀNG');
  
  if (!testOrderId) {
    logInfo('⚠ Skip test - Không có đơn hàng để test');
    return;
  }
  
  // Test 6.1: Hủy đơn hàng thành công
  logTest(`Hủy đơn hàng ID=${testOrderId}`);
  try {
    const response = await axios.post(`${API_URL}/orders/${testOrderId}/cancel`, {
      lyDoHuy: 'Test hủy đơn - Đặt nhầm'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      logSuccess('Hủy đơn hàng thành công');
      logInfo(`Mã HD: ${response.data.data.maHD}`);
      logInfo(`Trạng thái mới: ${response.data.data.trangThaiMoi}`);
      logInfo(`Lý do: ${response.data.data.lyDoHuy}`);
      
      // Verify đơn hàng đã bị hủy
      const verifyResponse = await axios.get(`${API_URL}/orders/${testOrderId}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      if (verifyResponse.data.data.hoaDon.trangThai === 'Đã hủy') {
        logInfo('✓ Verified: Trạng thái đã chuyển sang "Đã hủy"');
      }
    } else {
      logError('Response không thành công');
    }
  } catch (error) {
    logError('Hủy đơn hàng thất bại', error);
  }
  
  // Test 6.2: Hủy đơn hàng đã hủy (expect 400)
  logTest('Hủy đơn hàng đã hủy rồi (expect 400)');
  try {
    await axios.post(`${API_URL}/orders/${testOrderId}/cancel`, {
      lyDoHuy: 'Test hủy lần 2'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    logError('Cho phép hủy đơn hàng đã hủy');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Hệ thống từ chối hủy đơn hàng đã hủy (400)');
    } else {
      logError('Sai error code', error);
    }
  }
  
  // Test 6.3: Hủy đơn hàng không tồn tại
  logTest('Hủy đơn hàng không tồn tại (expect 404)');
  try {
    await axios.post(`${API_URL}/orders/999999/cancel`, {
      lyDoHuy: 'Test'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    logError('Không phát hiện được đơn hàng không tồn tại');
  } catch (error) {
    if (error.response?.status === 404) {
      logSuccess('Hệ thống trả về 404 cho đơn hàng không tồn tại');
    } else {
      logError('Sai error code', error);
    }
  }
}

/**
 * TEST 7: Truy cập không có token
 */
async function testUnauthorizedAccess() {
  logSection('TEST 7: TRUY CẬP KHÔNG CÓ TOKEN');
  
  logTest('Tạo đơn hàng không có token (expect 401)');
  try {
    await axios.post(`${API_URL}/orders/create`, {
      phuongThucThanhToanId: 1
    });
    logError('Cho phép tạo đơn không có token');
  } catch (error) {
    if (error.response?.status === 401) {
      logSuccess('Hệ thống từ chối request không có token (401)');
    } else {
      logError('Sai error code', error);
    }
  }
  
  logTest('Xem danh sách đơn hàng không có token (expect 401)');
  try {
    await axios.get(`${API_URL}/orders/my-orders`);
    logError('Cho phép xem đơn hàng không có token');
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
  console.log(`${colors.magenta}║                      🧪 TOYSTORE - ORDERS MODULE TEST                        ║${colors.reset}`);
  console.log(`${colors.magenta}╚═══════════════════════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  logInfo(`Server URL: ${BASE_URL}`);
  logInfo(`API Endpoint: ${API_URL}/orders`);
  
  try {
    // Check if server is running
    logInfo('Checking server connection...');
    await axios.get(BASE_URL);
    logSuccess('Server is running ✓\n');

    // Setup test data
    await setupTestData();

    // Run tests
    await testCreateOrder();
    await testGetMyOrders();
    await testGetOrderDetail();
    await testOrderHistory();
    await testPublicOrderDetail();
    await testCancelOrder();
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
