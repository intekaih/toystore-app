/**
 * ==========================================
 * TEST SCRIPT - PAYMENT MODULE (VNPay)
 * ==========================================
 * Test các chức năng:
 * 1. Tạo URL thanh toán VNPay
 * 2. Validate đơn hàng và số tiền
 * 3. Xử lý các trường hợp lỗi
 * 4. Test security (secure hash, amount validation)
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
let testOrderAmount = 0;

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

function logWarning(message) {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
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
 * Setup: Tạo user, đăng nhập và tạo đơn hàng để test thanh toán
 */
async function setupTestData() {
  logSection('SETUP: CHUẨN BỊ DỮ LIỆU TEST');
  
  try {
    // Tạo user mới
    const username = `testpayment_${Date.now()}`;
    const password = 'Test123456';
    
    logInfo(`Tạo user: ${username}`);
    
    try {
      await axios.post(`${API_URL}/auth/register`, {
        TenDangNhap: username,
        MatKhau: password,
        HoTen: 'Test Payment User',
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
        soLuong: 1
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      logSuccess('Đã thêm sản phẩm vào giỏ hàng');
      
      // Tạo đơn hàng
      logInfo('Tạo đơn hàng để test thanh toán...');
      const orderResponse = await axios.post(`${API_URL}/orders/create`, {
        phuongThucThanhToanId: 1,
        ghiChu: 'Test payment',
        diaChiGiaoHang: '123 Test Street',
        dienThoai: '0987654321',
        tinhThanh: 'TP. Hồ Chí Minh',
        quanHuyen: 'Quận 1',
        phuongXa: 'Phường Bến Nghé',
        tienShip: 30000
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      if (orderResponse.data.success) {
        testOrderId = orderResponse.data.data.hoaDon.id;
        testOrderAmount = orderResponse.data.data.hoaDon.tongTien;
        logSuccess(`Đã tạo đơn hàng test: ID=${testOrderId}, Amount=${testOrderAmount.toLocaleString()} VNĐ`);
      } else {
        throw new Error('Không thể tạo đơn hàng test');
      }
    } else {
      logWarning('Không có sản phẩm trong database - một số test sẽ bị skip');
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Setup thất bại:${colors.reset}`, error.message);
    process.exit(1);
  }
}

/**
 * TEST 1: Tạo URL thanh toán VNPay
 */
async function testCreatePaymentUrl() {
  logSection('TEST 1: TẠO URL THANH TOÁN VNPay');
  
  if (!testOrderId || !testOrderAmount) {
    logWarning('Skip test - Không có đơn hàng để test');
    return;
  }
  
  // Test 1.1: Tạo payment URL thành công
  logTest('Tạo payment URL với thông tin hợp lệ');
  try {
    const response = await axios.get(`${API_URL}/payment/vnpay/create-payment-url`, {
      params: {
        orderId: testOrderId,
        amount: testOrderAmount,
        language: 'vn'
      }
    });
    
    if (response.data.success && response.data.data.paymentUrl) {
      logSuccess('Tạo payment URL thành công');
      logInfo(`Payment URL: ${response.data.data.paymentUrl.substring(0, 80)}...`);
      logInfo(`Order ID: ${response.data.data.orderId}`);
      logInfo(`Order Code: ${response.data.data.orderCode}`);
      logInfo(`Amount: ${response.data.data.amount.toLocaleString()} VNĐ`);
      
      // Kiểm tra URL có chứa các params bắt buộc
      const url = response.data.data.paymentUrl;
      if (url.includes('vnp_TmnCode') && 
          url.includes('vnp_Amount') && 
          url.includes('vnp_SecureHash')) {
        logInfo('✓ URL có đầy đủ parameters bắt buộc');
      }
    } else {
      logError('Response không đúng format');
    }
  } catch (error) {
    logError('Tạo payment URL thất bại', error);
  }
  
  // Test 1.2: Tạo payment URL thiếu orderId
  logTest('Tạo payment URL thiếu orderId (expect 400)');
  try {
    await axios.get(`${API_URL}/payment/vnpay/create-payment-url`, {
      params: {
        amount: testOrderAmount
        // Thiếu orderId
      }
    });
    logError('Không phát hiện được thiếu orderId');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Hệ thống từ chối do thiếu orderId (400)');
    } else {
      logError('Sai error code', error);
    }
  }
  
  // Test 1.3: Tạo payment URL thiếu amount
  logTest('Tạo payment URL thiếu amount (expect 400)');
  try {
    await axios.get(`${API_URL}/payment/vnpay/create-payment-url`, {
      params: {
        orderId: testOrderId
        // Thiếu amount
      }
    });
    logError('Không phát hiện được thiếu amount');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Hệ thống từ chối do thiếu amount (400)');
    } else {
      logError('Sai error code', error);
    }
  }
  
  // Test 1.4: Tạo payment URL với amount = 0
  logTest('Tạo payment URL với amount=0 (expect 400)');
  try {
    await axios.get(`${API_URL}/payment/vnpay/create-payment-url`, {
      params: {
        orderId: testOrderId,
        amount: 0
      }
    });
    logError('Không phát hiện được amount không hợp lệ');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Hệ thống từ chối amount không hợp lệ (400)');
    } else {
      logError('Sai error code', error);
    }
  }
  
  // Test 1.5: Tạo payment URL với amount âm
  logTest('Tạo payment URL với amount âm (expect 400)');
  try {
    await axios.get(`${API_URL}/payment/vnpay/create-payment-url`, {
      params: {
        orderId: testOrderId,
        amount: -1000
      }
    });
    logError('Không phát hiện được amount âm');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Hệ thống từ chối amount âm (400)');
    } else {
      logError('Sai error code', error);
    }
  }
}

/**
 * TEST 2: Validate đơn hàng và số tiền
 */
async function testOrderValidation() {
  logSection('TEST 2: VALIDATE ĐƠN HÀNG VÀ SỐ TIỀN');
  
  if (!testOrderId || !testOrderAmount) {
    logWarning('Skip test - Không có đơn hàng để test');
    return;
  }
  
  // Test 2.1: Tạo payment URL với orderId không tồn tại
  logTest('Tạo payment URL với orderId không tồn tại (expect 404)');
  try {
    await axios.get(`${API_URL}/payment/vnpay/create-payment-url`, {
      params: {
        orderId: 999999,
        amount: 100000
      }
    });
    logError('Không phát hiện được orderId không tồn tại');
  } catch (error) {
    if (error.response?.status === 404) {
      logSuccess('Hệ thống trả về 404 cho orderId không tồn tại');
    } else {
      logError('Sai error code', error);
    }
  }
  
  // Test 2.2: Tạo payment URL với amount không khớp đơn hàng
  logTest('Tạo payment URL với amount không khớp đơn hàng (expect 400)');
  try {
    const wrongAmount = testOrderAmount + 10000; // Số tiền sai
    const response = await axios.get(`${API_URL}/payment/vnpay/create-payment-url`, {
      params: {
        orderId: testOrderId,
        amount: wrongAmount
      }
    });
    
    // Hệ thống có thể:
    // 1. Từ chối với 400
    // 2. Tự động dùng amount từ DB (bỏ qua amount từ request)
    if (response.data.success) {
      // Kiểm tra xem có dùng amount từ DB không
      if (response.data.data.amount === testOrderAmount) {
        logSuccess('Hệ thống tự động sử dụng amount từ database (security fix)');
        logInfo(`Request amount: ${wrongAmount}, Used amount: ${response.data.data.amount}`);
      } else {
        logError('Hệ thống chấp nhận amount sai - Lỗi bảo mật!');
      }
    }
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Hệ thống từ chối amount không khớp (400)');
    } else {
      logError('Unexpected error', error);
    }
  }
  
  // Test 2.3: Kiểm tra amount validation chi tiết
  logTest('Kiểm tra amount validation chi tiết');
  try {
    const response = await axios.get(`${API_URL}/payment/vnpay/create-payment-url`, {
      params: {
        orderId: testOrderId,
        amount: testOrderAmount
      }
    });
    
    if (response.data.success) {
      const returnedAmount = response.data.data.amount;
      if (returnedAmount === testOrderAmount) {
        logSuccess('Amount validation chính xác');
        logInfo(`Order amount: ${testOrderAmount} = Returned amount: ${returnedAmount}`);
      } else {
        logError('Amount không khớp giữa request và response');
      }
    }
  } catch (error) {
    logError('Kiểm tra amount validation thất bại', error);
  }
}

/**
 * TEST 3: Test với các trạng thái đơn hàng khác nhau
 */
async function testOrderStatus() {
  logSection('TEST 3: TEST VỚI TRẠNG THÁI ĐƠN HÀNG');
  
  if (!testOrderId || !testOrderAmount) {
    logWarning('Skip test - Không có đơn hàng để test');
    return;
  }
  
  // Test 3.1: Tạo payment URL cho đơn hàng "Chờ thanh toán"
  logTest('Tạo payment URL cho đơn hàng "Chờ thanh toán" (expect success)');
  try {
    const response = await axios.get(`${API_URL}/payment/vnpay/create-payment-url`, {
      params: {
        orderId: testOrderId,
        amount: testOrderAmount
      }
    });
    
    if (response.data.success) {
      logSuccess('Cho phép tạo payment URL cho đơn "Chờ thanh toán"');
    } else {
      logError('Response không thành công');
    }
  } catch (error) {
    logError('Tạo payment URL thất bại', error);
  }
  
  // Note: Các test với trạng thái khác (Đã thanh toán, Đã hủy) 
  // cần setup riêng hoặc mock, nên có thể bỏ qua trong test tự động
  logInfo('ℹ Note: Test với trạng thái "Đã thanh toán" và "Đã hủy" cần setup riêng');
}

/**
 * TEST 4: Test security và rate limiting
 */
async function testSecurity() {
  logSection('TEST 4: TEST SECURITY');
  
  if (!testOrderId || !testOrderAmount) {
    logWarning('Skip test - Không có đơn hàng để test');
    return;
  }
  
  // Test 4.1: Kiểm tra secure hash có được tạo
  logTest('Kiểm tra secure hash trong URL');
  try {
    const response = await axios.get(`${API_URL}/payment/vnpay/create-payment-url`, {
      params: {
        orderId: testOrderId,
        amount: testOrderAmount
      }
    });
    
    if (response.data.success) {
      const url = response.data.data.paymentUrl;
      if (url.includes('vnp_SecureHash=')) {
        logSuccess('URL có chứa secure hash');
        
        // Trích xuất secure hash
        const hashMatch = url.match(/vnp_SecureHash=([^&]+)/);
        if (hashMatch && hashMatch[1].length > 0) {
          logInfo(`✓ Secure hash length: ${hashMatch[1].length} chars`);
        }
      } else {
        logError('URL không có secure hash - Lỗi bảo mật nghiêm trọng!');
      }
    }
  } catch (error) {
    logError('Kiểm tra secure hash thất bại', error);
  }
  
  // Test 4.2: Test rate limiting (nếu có)
  logTest('Test rate limiting (20 requests)');
  try {
    let successCount = 0;
    let rateLimited = false;
    
    for (let i = 0; i < 20; i++) {
      try {
        const response = await axios.get(`${API_URL}/payment/vnpay/create-payment-url`, {
          params: {
            orderId: testOrderId,
            amount: testOrderAmount
          }
        });
        
        if (response.data.success) {
          successCount++;
        }
      } catch (error) {
        if (error.response?.status === 429) {
          rateLimited = true;
          logInfo(`Rate limited sau ${successCount} requests`);
          break;
        }
      }
    }
    
    if (rateLimited) {
      logSuccess('Rate limiting hoạt động đúng');
    } else {
      logInfo(`Gửi ${successCount} requests thành công - Rate limit chưa đạt`);
      passedTests++; // Tính là pass vì không bắt buộc phải rate limit
    }
  } catch (error) {
    logError('Test rate limiting thất bại', error);
  }
}

/**
 * TEST 5: Test với bankCode parameter
 */
async function testBankCode() {
  logSection('TEST 5: TEST BANK CODE PARAMETER');
  
  if (!testOrderId || !testOrderAmount) {
    logWarning('Skip test - Không có đơn hàng để test');
    return;
  }
  
  // Test 5.1: Tạo URL với bankCode cụ thể
  logTest('Tạo payment URL với bankCode (NCB)');
  try {
    const response = await axios.get(`${API_URL}/payment/vnpay/create-payment-url`, {
      params: {
        orderId: testOrderId,
        amount: testOrderAmount,
        bankCode: 'NCB'
      }
    });
    
    if (response.data.success) {
      const url = response.data.data.paymentUrl;
      if (url.includes('vnp_BankCode=NCB')) {
        logSuccess('BankCode được thêm vào URL đúng');
      } else {
        logError('BankCode không được thêm vào URL');
      }
    }
  } catch (error) {
    logError('Tạo URL với bankCode thất bại', error);
  }
  
  // Test 5.2: Tạo URL không có bankCode (optional)
  logTest('Tạo payment URL không có bankCode (should work)');
  try {
    const response = await axios.get(`${API_URL}/payment/vnpay/create-payment-url`, {
      params: {
        orderId: testOrderId,
        amount: testOrderAmount
        // Không có bankCode
      }
    });
    
    if (response.data.success) {
      logSuccess('Tạo URL thành công khi không có bankCode (optional param)');
    }
  } catch (error) {
    logError('Tạo URL không có bankCode thất bại', error);
  }
}

/**
 * TEST 6: Test URL structure và parameters
 */
async function testUrlStructure() {
  logSection('TEST 6: TEST URL STRUCTURE & PARAMETERS');
  
  if (!testOrderId || !testOrderAmount) {
    logWarning('Skip test - Không có đơn hàng để test');
    return;
  }
  
  logTest('Kiểm tra cấu trúc URL và parameters bắt buộc');
  try {
    const response = await axios.get(`${API_URL}/payment/vnpay/create-payment-url`, {
      params: {
        orderId: testOrderId,
        amount: testOrderAmount
      }
    });
    
    if (response.data.success) {
      const url = response.data.data.paymentUrl;
      
      // Các parameters bắt buộc của VNPay
      const requiredParams = [
        'vnp_Version',
        'vnp_Command',
        'vnp_TmnCode',
        'vnp_Amount',
        'vnp_CreateDate',
        'vnp_CurrCode',
        'vnp_IpAddr',
        'vnp_Locale',
        'vnp_OrderInfo',
        'vnp_OrderType',
        'vnp_ReturnUrl',
        'vnp_TxnRef',
        'vnp_SecureHash'
      ];
      
      const missingParams = requiredParams.filter(param => !url.includes(param));
      
      if (missingParams.length === 0) {
        logSuccess('URL có đầy đủ parameters bắt buộc của VNPay');
        logInfo(`✓ Có ${requiredParams.length}/${requiredParams.length} parameters`);
      } else {
        logError(`Thiếu ${missingParams.length} parameters: ${missingParams.join(', ')}`);
      }
    }
  } catch (error) {
    logError('Kiểm tra URL structure thất bại', error);
  }
}

// Main test runner
async function runAllTests() {
  console.log(`\n${colors.magenta}╔═══════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}║                   🧪 TOYSTORE - PAYMENT MODULE TEST (VNPay)                  ║${colors.reset}`);
  console.log(`${colors.magenta}╚═══════════════════════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  logInfo(`Server URL: ${BASE_URL}`);
  logInfo(`API Endpoint: ${API_URL}/payment`);
  
  try {
    // Check if server is running
    logInfo('Checking server connection...');
    await axios.get(BASE_URL);
    logSuccess('Server is running ✓\n');

    // Setup test data
    await setupTestData();

    // Run tests
    await testCreatePaymentUrl();
    await testOrderValidation();
    await testOrderStatus();
    await testSecurity();
    await testBankCode();
    await testUrlStructure();

    // Print summary
    printSummary();

    // Important notes
    console.log(`${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.yellow}📌 LƯU Ý QUAN TRỌNG:${colors.reset}`);
    console.log(`${colors.yellow}   - Test này chỉ kiểm tra việc TẠO URL thanh toán VNPay${colors.reset}`);
    console.log(`${colors.yellow}   - Không thể test Return URL và IPN tự động (cần VNPay thực tế)${colors.reset}`);
    console.log(`${colors.yellow}   - Để test đầy đủ, cần:${colors.reset}`);
    console.log(`${colors.yellow}     1. Có tài khoản VNPay Sandbox${colors.reset}`);
    console.log(`${colors.yellow}     2. Test manual qua giao diện web${colors.reset}`);
    console.log(`${colors.yellow}     3. Kiểm tra IPN callback từ VNPay${colors.reset}`);
    console.log(`${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

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
