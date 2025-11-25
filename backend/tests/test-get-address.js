/**
 * 🔍 SCRIPT LẤY MÃ ĐỊA CHỈ THẬT TỪ GHN API
 * Chạy: node test-get-address.js
 */

const ghnService = require('./services/ghn.service');

async function getShopAddress() {
  console.log('🔍 Lấy danh sách địa chỉ cho Shop...\n');
  
  try {
    // 1. Lấy danh sách tỉnh
    console.log('📍 Bước 1: Lấy tỉnh/thành...');
    const provinces = await ghnService.getProvinces();
    
    if (!provinces.success) {
      console.error('❌ Lỗi lấy danh sách tỉnh:', provinces.message);
      return;
    }
    
    const hanoi = provinces.data.find(p => p.provinceName.includes('Hà Nội'));
    console.log('✅ Hà Nội - ID:', hanoi.provinceId);
    
    // 2. Lấy quận/huyện của Hà Nội
    console.log('\n📍 Bước 2: Lấy quận/huyện...');
    const districts = await ghnService.getDistricts(hanoi.provinceId);
    
    if (!districts.success) {
      console.error('❌ Lỗi lấy danh sách quận:', districts.message);
      return;
    }
    
    const hoanKiem = districts.data.find(d => d.districtName.includes('Hoàn Kiếm'));
    console.log('✅ Quận Hoàn Kiếm - ID:', hoanKiem.districtId);
    
    // 3. Lấy phường/xã của Hoàn Kiếm
    console.log('\n📍 Bước 3: Lấy phường/xã...');
    const wards = await ghnService.getWards(hoanKiem.districtId);
    
    if (!wards.success) {
      console.error('❌ Lỗi lấy danh sách phường:', wards.message);
      return;
    }
    
    console.log('\n📍 Danh sách 10 phường/xã đầu tiên ở Quận Hoàn Kiếm:');
    wards.data.slice(0, 10).forEach(w => {
      console.log('  -', w.wardName, '| Code:', w.wardCode);
    });
    
    const hangBac = wards.data.find(w => w.wardName.includes('Hàng Bạc'));
    
    if (hangBac) {
      console.log('\n✅ Phường Hàng Bạc - Code:', hangBac.wardCode);
      console.log('\n' + '='.repeat(60));
      console.log('📋 CẤU HÌNH ĐÚNG CHO ghn.config.js:');
      console.log('='.repeat(60));
      console.log('DEFAULT_FROM_ADDRESS: {');
      console.log('  provinceId: ' + hanoi.provinceId + ',');
      console.log('  districtId: ' + hoanKiem.districtId + ',');
      console.log('  wardCode: "' + hangBac.wardCode + '",');
      console.log('  address: "Số 1, Phường Hàng Bạc, Quận Hoàn Kiếm, Hà Nội"');
      console.log('}');
      console.log('='.repeat(60));
    } else {
      console.log('\n⚠️ Không tìm thấy Phường Hàng Bạc');
      console.log('📝 Vui lòng chọn phường khác từ danh sách trên');
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

// Chạy script
getShopAddress()
  .then(() => {
    console.log('\n✅ Hoàn tất!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });
