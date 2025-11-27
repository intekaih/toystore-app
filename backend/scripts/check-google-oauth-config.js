/**
 * Script kiểm tra cấu hình Google OAuth
 * Chạy: node scripts/check-google-oauth-config.js
 */

require('dotenv').config();
const ConfigService = require('../utils/ConfigService');

const config = ConfigService.getInstance();

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('🔍 KIỂM TRA CẤU HÌNH GOOGLE OAUTH');
console.log('═══════════════════════════════════════════════════════════════════\n');

const clientId = config.getValue('google', 'clientId');
const clientSecret = config.getValue('google', 'clientSecret');
const callbackUrl = config.getValue('google', 'callbackUrl');

console.log('📋 Thông tin cấu hình:');
console.log('─────────────────────────────────────────────────────────────────');
console.log(`Client ID: ${clientId || '❌ CHƯA CẤU HÌNH'}`);
console.log(`Client Secret: ${clientSecret ? '✅ Đã cấu hình' : '❌ CHƯA CẤU HÌNH'}`);
console.log(`Callback URL: ${callbackUrl || '❌ CHƯA CẤU HÌNH'}`);
console.log('─────────────────────────────────────────────────────────────────\n');

if (!clientId || !clientSecret || !callbackUrl) {
  console.log('❌ THIẾU CẤU HÌNH!');
  console.log('Vui lòng thêm vào file .env:');
  console.log('  GOOGLE_CLIENT_ID=your-client-id');
  console.log('  GOOGLE_CLIENT_SECRET=your-client-secret');
  console.log('  GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback');
  process.exit(1);
}

console.log('✅ Đã có đầy đủ cấu hình!\n');

console.log('📝 HƯỚNG DẪN KIỂM TRA TRONG GOOGLE CLOUD CONSOLE:');
console.log('─────────────────────────────────────────────────────────────────');
console.log('1. Truy cập: https://console.cloud.google.com/');
console.log('2. Vào APIs & Services > Credentials');
console.log('3. Click vào OAuth 2.0 Client ID của bạn');
console.log('4. Kiểm tra "Authorized redirect URIs" phải có:');
console.log(`   ✅ ${callbackUrl}`);
console.log('\n⚠️  LƯU Ý QUAN TRỌNG:');
console.log('   • URL phải khớp CHÍNH XÁC (không có khoảng trắng, đúng protocol)');
console.log('   • Không có dấu "/" ở cuối (trừ khi cần thiết)');
console.log('   • Phải đúng port (5000 cho development)');
console.log('   • Phải đúng path (/api/auth/google/callback)');
console.log('\n🔧 NẾU URL KHÔNG KHỚP:');
console.log('   1. Copy callback URL ở trên');
console.log('   2. Paste vào "Authorized redirect URIs" trong Google Console');
console.log('   3. Click "Save"');
console.log('   4. Đợi vài phút để Google cập nhật');
console.log('   5. Thử lại đăng nhập\n');

console.log('═══════════════════════════════════════════════════════════════════\n');

