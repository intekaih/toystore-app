/**
 * ==========================================
 * TEST SCRIPT - AUTHENTICATION MODULE
 * ==========================================
 * Test các chức năng:
 * 1. Đăng ký tài khoản mới (POST /api/auth/register)
 * 2. Đăng nhập user (POST /api/auth/login)
 * 3. Đăng nhập admin (POST /api/auth/admin/login)
 * 4. Xác thực token (middleware)
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
const testUser = {
  TenDangNhap: `testuser_${Date.now()}`,
  MatKhau: 'Test123456',
  HoTen: 'Nguyễn Văn Test',
  Email: `test${Date.now()}@example.com`,
  DienThoai: '0987654321'
};

const existingAdmin = {
  username: 'admin',
  password: 'admin123'
};

let userToken = '';
let adminToken = '';

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
async function testRegister() {
  logSection('TEST 1: ĐĂNG KÝ TÀI KHOẢN MỚI');

  // Test 1.1: Đăng ký thành công
  logTest('Đăng ký tài khoản với đầy đủ thông tin');
  try {
    const response = await axios.post(`${API_URL}/auth/register`, testUser);
    
    if (response.data.success && response.data.data.ID) {
      logSuccess('Đăng ký thành công');
      logInfo(`User ID: ${response.data.data.ID}`);
      logInfo(`Username: ${response.data.data.TenDangNhap}`);
      logInfo(`Email: ${response.data.data.Email}`);
    } else {
      logError('Response không đúng format');
    }
  } catch (error) {
    logError('Đăng ký thất bại', error);
  }

  // Test 1.2: Đăng ký với username đã tồn tại
  logTest('Đăng ký với username đã tồn tại (expect 409)');
  try {
    await axios.post(`${API_URL}/auth/register`, testUser);
    logError('Không phát hiện được username trùng lặp');
  } catch (error) {
    if (error.response?.status === 409) {
      logSuccess('Hệ thống từ chối username trùng lặp (409)');
    } else {
      logError('Sai error code', error);
    }
  }

  // Test 1.3: Đăng ký thiếu thông tin bắt buộc
  logTest('Đăng ký thiếu thông tin bắt buộc (expect 400)');
  try {
    await axios.post(`${API_URL}/auth/register`, {
      TenDangNhap: 'testuser2',
      MatKhau: '123456'
      // Thiếu HoTen
    });
    logError('Không phát hiện được thiếu thông tin');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Hệ thống từ chối do thiếu thông tin (400)');
    } else {
      logError('Sai error code', error);
    }
  }

  // Test 1.4: Đăng ký với mật khẩu quá ngắn
  logTest('Đăng ký với mật khẩu < 6 ký tự (expect 400)');
  try {
    await axios.post(`${API_URL}/auth/register`, {
      TenDangNhap: `user_${Date.now()}`,
      MatKhau: '12345',
      HoTen: 'Test User'
    });
    logError('Không phát hiện được mật khẩu quá ngắn');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Hệ thống từ chối mật khẩu quá ngắn (400)');
    } else {
      logError('Sai error code', error);
    }
  }

  // Test 1.5: Đăng ký với email không hợp lệ
  logTest('Đăng ký với email không hợp lệ (expect 400)');
  try {
    await axios.post(`${API_URL}/auth/register`, {
      TenDangNhap: `user_${Date.now()}`,
      MatKhau: '123456',
      HoTen: 'Test User',
      Email: 'invalid-email'
    });
    logError('Không phát hiện được email không hợp lệ');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Hệ thống từ chối email không hợp lệ (400)');
    } else {
      logError('Sai error code', error);
    }
  }
}

async function testUserLogin() {
  logSection('TEST 2: ĐĂNG NHẬP USER');

  // Test 2.1: Đăng nhập thành công
  logTest('Đăng nhập user với thông tin đúng');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      TenDangNhap: testUser.TenDangNhap,
      MatKhau: testUser.MatKhau
    });
    
    if (response.data.success && response.data.data.token) {
      userToken = response.data.data.token;
      logSuccess('Đăng nhập thành công');
      logInfo(`Token: ${userToken.substring(0, 30)}...`);
      logInfo(`User: ${response.data.data.user.tenDangNhap}`);
      logInfo(`Role: ${response.data.data.user.vaiTro}`);
    } else {
      logError('Response không đúng format');
    }
  } catch (error) {
    logError('Đăng nhập thất bại', error);
  }

  // Test 2.2: Đăng nhập với username không tồn tại
  logTest('Đăng nhập với username không tồn tại (expect 401)');
  try {
    await axios.post(`${API_URL}/auth/login`, {
      TenDangNhap: 'nonexistent_user',
      MatKhau: 'password123'
    });
    logError('Không phát hiện được user không tồn tại');
  } catch (error) {
    if (error.response?.status === 401) {
      logSuccess('Hệ thống từ chối user không tồn tại (401)');
    } else {
      logError('Sai error code', error);
    }
  }

  // Test 2.3: Đăng nhập với mật khẩu sai
  logTest('Đăng nhập với mật khẩu sai (expect 401)');
  try {
    await axios.post(`${API_URL}/auth/login`, {
      TenDangNhap: testUser.TenDangNhap,
      MatKhau: 'wrongpassword'
    });
    logError('Không phát hiện được mật khẩu sai');
  } catch (error) {
    if (error.response?.status === 401) {
      logSuccess('Hệ thống từ chối mật khẩu sai (401)');
    } else {
      logError('Sai error code', error);
    }
  }

  // Test 2.4: Đăng nhập thiếu thông tin
  logTest('Đăng nhập thiếu thông tin (expect 400)');
  try {
    await axios.post(`${API_URL}/auth/login`, {
      TenDangNhap: testUser.TenDangNhap
      // Thiếu MatKhau
    });
    logError('Không phát hiện được thiếu thông tin');
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Hệ thống từ chối do thiếu thông tin (400)');
    } else {
      logError('Sai error code', error);
    }
  }
}

async function testAdminLogin() {
  logSection('TEST 3: ĐĂNG NHẬP ADMIN');

  // Test 3.1: Đăng nhập admin thành công
  logTest('Đăng nhập admin với thông tin đúng');
  try {
    const response = await axios.post(`${API_URL}/auth/admin/login`, existingAdmin);
    
    if (response.data.success && response.data.data.token) {
      adminToken = response.data.data.token;
      logSuccess('Đăng nhập admin thành công');
      logInfo(`Token: ${adminToken.substring(0, 30)}...`);
      logInfo(`Admin: ${response.data.data.admin.username}`);
      logInfo(`Role: ${response.data.data.admin.role}`);
    } else {
      logError('Response không đúng format');
    }
  } catch (error) {
    logError('Đăng nhập admin thất bại', error);
  }

  // Test 3.2: User thường không thể đăng nhập vào admin
  logTest('User thường cố đăng nhập admin (expect 401)');
  try {
    await axios.post(`${API_URL}/auth/admin/login`, {
      username: testUser.TenDangNhap,
      password: testUser.MatKhau
    });
    logError('User thường được phép đăng nhập admin');
  } catch (error) {
    if (error.response?.status === 401) {
      logSuccess('Hệ thống từ chối user thường vào admin (401)');
    } else {
      logError('Sai error code', error);
    }
  }

  // Test 3.3: Đăng nhập admin với mật khẩu sai
  logTest('Đăng nhập admin với mật khẩu sai (expect 401)');
  try {
    await axios.post(`${API_URL}/auth/admin/login`, {
      username: existingAdmin.username,
      password: 'wrongpassword'
    });
    logError('Không phát hiện được mật khẩu sai');
  } catch (error) {
    if (error.response?.status === 401) {
      logSuccess('Hệ thống từ chối mật khẩu sai (401)');
    } else {
      logError('Sai error code', error);
    }
  }
}

async function testTokenValidation() {
  logSection('TEST 4: XÁC THỰC TOKEN');

  // Test 4.1: Truy cập endpoint cần auth với token hợp lệ
  logTest('Truy cập /api/users/profile với token hợp lệ');
  try {
    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    });
    
    if (response.data.success) {
      logSuccess('Token hợp lệ được chấp nhận');
      logInfo(`User: ${response.data.data.TenDangNhap}`);
    } else {
      logError('Response không đúng format');
    }
  } catch (error) {
    logError('Không thể truy cập với token hợp lệ', error);
  }

  // Test 4.2: Truy cập endpoint cần auth không có token
  logTest('Truy cập /api/users/profile không có token (expect 401)');
  try {
    await axios.get(`${API_URL}/users/profile`);
    logError('Cho phép truy cập không có token');
  } catch (error) {
    if (error.response?.status === 401) {
      logSuccess('Hệ thống từ chối request không có token (401)');
    } else {
      logError('Sai error code', error);
    }
  }

  // Test 4.3: Truy cập endpoint cần auth với token không hợp lệ
  logTest('Truy cập /api/users/profile với token không hợp lệ (expect 401)');
  try {
    await axios.get(`${API_URL}/users/profile`, {
      headers: {
        Authorization: 'Bearer invalid_token_123'
      }
    });
    logError('Token không hợp lệ được chấp nhận');
  } catch (error) {
    if (error.response?.status === 401) {
      logSuccess('Hệ thống từ chối token không hợp lệ (401)');
    } else {
      logError('Sai error code', error);
    }
  }

  // Test 4.4: User thường không thể truy cập admin endpoint
  logTest('User thường truy cập /api/admin/users (expect 403)');
  try {
    await axios.get(`${API_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    });
    logError('User thường được truy cập admin endpoint');
  } catch (error) {
    if (error.response?.status === 403) {
      logSuccess('Hệ thống từ chối user thường vào admin (403)');
    } else {
      logError('Sai error code', error);
    }
  }

  // Test 4.5: Admin có thể truy cập admin endpoint
  logTest('Admin truy cập /api/admin/users');
  try {
    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    
    if (response.data.success) {
      logSuccess('Admin truy cập thành công');
      logInfo(`Total users: ${response.data.pagination?.total || 'N/A'}`);
    } else {
      logError('Response không đúng format');
    }
  } catch (error) {
    logError('Admin không thể truy cập admin endpoint', error);
  }
}

// Main test runner
async function runAllTests() {
  console.log(`\n${colors.magenta}╔═══════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}║                   🧪 TOYSTORE - AUTHENTICATION MODULE TEST                   ║${colors.reset}`);
  console.log(`${colors.magenta}╚═══════════════════════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  logInfo(`Server URL: ${BASE_URL}`);
  logInfo(`Test User: ${testUser.TenDangNhap}`);
  logInfo(`Test Admin: ${existingAdmin.username}`);
  
  try {
    // Check if server is running
    logInfo('Checking server connection...');
    await axios.get(BASE_URL);
    logSuccess('Server is running ✓\n');

    // Run tests
    await testRegister();
    await testUserLogin();
    await testAdminLogin();
    await testTokenValidation();

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
