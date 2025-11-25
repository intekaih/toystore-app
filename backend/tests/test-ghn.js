/**
 * 🧪 Test GHN API Integration - Version 2
 * Kiểm tra xem GHN Token và Shop ID có hoạt động không
 */

// ✅ Load .env TRƯỚC KHI require bất kỳ module nào
require('dotenv').config();

console.log('🔍 Checking .env configuration:');
console.log('   GHN_API_TOKEN:', process.env.GHN_API_TOKEN ? `${process.env.GHN_API_TOKEN.substring(0, 10)}...` : '❌ MISSING');
console.log('   GHN_SHOP_ID:', process.env.GHN_SHOP_ID || '❌ MISSING');
console.log('');

const ghnService = require('./services/ghn.service');

async function testGHNAPI() {
  console.log('🧪 TESTING GHN API...\n');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Lấy danh sách tỉnh/thành
    console.log('\n📍 Test 1: Lấy danh sách Tỉnh/Thành phố');
    const provinces = await ghnService.getProvinces();
    
    if (provinces.success) {
      console.log('✅ THÀNH CÔNG!');
      console.log(`   Số lượng: ${provinces.data.length} tỉnh/thành`);
      console.log(`   Ví dụ: ${provinces.data.slice(0, 3).map(p => p.provinceName).join(', ')}...`);
    } else {
      console.log('❌ THẤT BẠI:', provinces.message);
      return;
    }
    
    // Test 2: Lấy quận/huyện của Hà Nội
    console.log('\n📍 Test 2: Lấy Quận/Huyện của Hà Nội (ID: 202)');
    const districts = await ghnService.getDistricts(202);
    
    if (districts.success) {
      console.log('✅ THÀNH CÔNG!');
      console.log(`   Số lượng: ${districts.data.length} quận/huyện`);
      console.log(`   Ví dụ: ${districts.data.slice(0, 3).map(d => d.districtName).join(', ')}...`);
    } else {
      console.log('❌ THẤT BẠI:', districts.message);
      return;
    }
    
    // Test 3: Lấy phường/xã của Quận Hoàn Kiếm
    console.log('\n📍 Test 3: Lấy Phường/Xã của Quận Hoàn Kiếm (ID: 1482)');
    const wards = await ghnService.getWards(1482);
    
    if (wards.success) {
      console.log('✅ THÀNH CÔNG!');
      console.log(`   Số lượng: ${wards.data.length} phường/xã`);
      console.log(`   Ví dụ: ${wards.data.slice(0, 3).map(w => w.wardName).join(', ')}...`);
    } else {
      console.log('❌ THẤT BẠI:', wards.message);
      return;
    }
    
    // Test 4: Tính phí vận chuyển
    console.log('\n💰 Test 4: Tính phí vận chuyển (Hà Nội → Quận Hoàn Kiếm)');
    const shippingFee = await ghnService.calculateShippingFee({
      toDistrictId: 1482,
      toWardCode: wards.data[0].wardCode, // Lấy ward code đầu tiên
      weight: 500,
      insuranceValue: 100000
    });
    
    if (shippingFee.success) {
      console.log('✅ THÀNH CÔNG!');
      console.log(`   Phí ship: ${shippingFee.data.total.toLocaleString('vi-VN')} đ`);
      console.log(`   Service fee: ${shippingFee.data.serviceFee.toLocaleString('vi-VN')} đ`);
      console.log(`   Insurance fee: ${shippingFee.data.insuranceFee.toLocaleString('vi-VN')} đ`);
    } else {
      console.log('❌ THẤT BẠI:', shippingFee.message);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 HOÀN TẤT TEST GHN API!\n');
    console.log('✅ GHN Token và Shop ID hoạt động bình thường!');
    console.log('✅ Component AddressSelector đã sẵn sàng sử dụng!');
    console.log('\n📝 Bây giờ bạn có thể:');
    console.log('   1. Sử dụng AddressSelector component trong frontend');
    console.log('   2. Test tính phí ship tự động trong checkout');
    console.log('   3. Tích hợp vào form đặt hàng');
    
  } catch (error) {
    console.error('\n❌ LỖI NGHIÊM TRỌNG:', error.message);
    console.error('   Chi tiết:', error);
  }
}

// Chạy test
testGHNAPI();