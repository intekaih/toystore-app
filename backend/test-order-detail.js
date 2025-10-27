/**
 * ============================================
 * TEST ORDER DETAIL - DECORATOR PATTERN
 * ============================================
 * File này test toàn bộ luồng tạo đơn hàng và hiển thị chi tiết
 * để phát hiện lỗi giá không đồng bộ
 */

const db = require('./models');
const { HoaDon, ChiTietHoaDon, SanPham, KhachHang, PhuongThucThanhToan } = db;

// Màu sắc cho console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`),
  title: (msg) => console.log(`${colors.bright}${colors.magenta}${msg}${colors.reset}`)
};

// Test Case 1: Kiểm tra đơn hàng mới nhất trong DB
async function testLatestOrder() {
  log.header();
  log.title('TEST 1: KIỂM TRA ĐỚN HÀNG MỚI NHẤT TRONG DB');
  log.header();

  try {
    const latestOrder = await HoaDon.findOne({
      order: [['ID', 'DESC']],
      include: [
        {
          model: ChiTietHoaDon,
          as: 'chiTiet',
          include: [{
            model: SanPham,
            as: 'sanPham',
            attributes: ['ID', 'Ten', 'GiaBan']
          }]
        }
      ]
    });

    if (!latestOrder) {
      log.error('Không tìm thấy đơn hàng nào trong DB');
      return;
    }

    log.info(`Mã đơn hàng: ${latestOrder.MaHD}`);
    console.log('\n📊 CHI TIẾT GIÁ TRONG DB:');
    console.log('┌─────────────────────────┬──────────────────┐');
    console.log('│ Trường                  │ Giá trị          │');
    console.log('├─────────────────────────┼──────────────────┤');
    console.log(`│ TongTien                │ ${formatPrice(latestOrder.TongTien)} │`);
    console.log(`│ TienGoc                 │ ${formatPrice(latestOrder.TienGoc || 0)} │`);
    console.log(`│ TienVAT                 │ ${formatPrice(latestOrder.TienVAT || 0)} │`);
    console.log(`│ TyLeVAT                 │ ${(latestOrder.TyLeVAT || 0) * 100}%        │`);
    console.log(`│ MaVoucher               │ ${latestOrder.MaVoucher || 'N/A'}       │`);
    console.log(`│ TienGiamGia             │ ${formatPrice(latestOrder.TienGiamGia || 0)} │`);
    console.log(`│ PhiVanChuyen            │ ${formatPrice(latestOrder.PhiVanChuyen || 0)} │`);
    console.log(`│ MiemPhiVanChuyen        │ ${latestOrder.MiemPhiVanChuyen ? 'Có' : 'Không'}        │`);
    console.log('└─────────────────────────┴──────────────────┘');

    // Kiểm tra công thức
    const tienGoc = parseFloat(latestOrder.TienGoc) || 0;
    const tienVAT = parseFloat(latestOrder.TienVAT) || 0;
    const tienGiamGia = parseFloat(latestOrder.TienGiamGia) || 0;
    const phiVanChuyen = parseFloat(latestOrder.PhiVanChuyen) || 0;
    const tongTien = parseFloat(latestOrder.TongTien);

    const calculated = tienGoc + tienVAT - tienGiamGia + phiVanChuyen;

    console.log('\n🧮 CÔNG THỨC TÍNH:');
    console.log(`TongTien = TienGoc + TienVAT - TienGiamGia + PhiVanChuyen`);
    console.log(`${formatPrice(tongTien)} = ${formatPrice(tienGoc)} + ${formatPrice(tienVAT)} - ${formatPrice(tienGiamGia)} + ${formatPrice(phiVanChuyen)}`);
    console.log(`${formatPrice(tongTien)} = ${formatPrice(calculated)}`);

    if (Math.abs(tongTien - calculated) < 1) {
      log.success('Công thức tính ĐÚNG!');
    } else {
      log.error(`Công thức tính SAI! Chênh lệch: ${formatPrice(Math.abs(tongTien - calculated))}`);
    }

    // Kiểm tra chi tiết sản phẩm
    console.log('\n📦 CHI TIẾT SẢN PHẨM:');
    latestOrder.chiTiet.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.sanPham.Ten}`);
      console.log(`   - Giá gốc (DB):        ${formatPrice(item.sanPham.GiaBan)}`);
      console.log(`   - DonGia (lưu):        ${formatPrice(item.DonGia)}`);
      console.log(`   - SoLuong:             ${item.SoLuong}`);
      console.log(`   - ThanhTien:           ${formatPrice(item.ThanhTien)}`);
      
      const expectedThanhTien = parseFloat(item.DonGia) * item.SoLuong;
      if (Math.abs(parseFloat(item.ThanhTien) - expectedThanhTien) < 1) {
        log.success(`   ThanhTien = DonGia × SoLuong (ĐÚNG)`);
      } else {
        log.error(`   ThanhTien ≠ DonGia × SoLuong (SAI)`);
      }
    });

  } catch (error) {
    log.error(`Lỗi: ${error.message}`);
    console.error(error);
  }
}

// Test Case 2: Mô phỏng API getOrderDetail
async function testGetOrderDetailAPI() {
  log.header();
  log.title('TEST 2: MÔ PHỎNG API getOrderDetail');
  log.header();

  try {
    const latestOrder = await HoaDon.findOne({
      order: [['ID', 'DESC']],
      include: [
        {
          model: KhachHang,
          as: 'khachHang',
          attributes: ['ID', 'HoTen', 'Email', 'DienThoai', 'DiaChi']
        },
        {
          model: PhuongThucThanhToan,
          as: 'phuongThucThanhToan',
          attributes: ['ID', 'Ten', 'MoTa']
        },
        {
          model: ChiTietHoaDon,
          as: 'chiTiet',
          include: [{
            model: SanPham,
            as: 'sanPham',
            attributes: ['ID', 'Ten', 'HinhAnhURL', 'GiaBan']
          }]
        }
      ]
    });

    if (!latestOrder) {
      log.error('Không tìm thấy đơn hàng');
      return;
    }

    // Tạo response giống API
    const apiResponse = {
      success: true,
      message: 'Lấy chi tiết đơn hàng thành công',
      data: {
        hoaDon: {
          id: latestOrder.ID,
          maHD: latestOrder.MaHD,
          ngayLap: latestOrder.NgayLap,
          tongTien: parseFloat(latestOrder.TongTien),
          
          // ✨ TRƯỜNG MỚI - CHI TIẾT DECORATOR PATTERN
          tienGoc: parseFloat(latestOrder.TienGoc) || 0,
          tienVAT: parseFloat(latestOrder.TienVAT) || 0,
          tyLeVAT: parseFloat(latestOrder.TyLeVAT) || 0,
          maVoucher: latestOrder.MaVoucher,
          tienGiamGia: parseFloat(latestOrder.TienGiamGia) || 0,
          phiVanChuyen: parseFloat(latestOrder.PhiVanChuyen) || 0,
          miemPhiVanChuyen: latestOrder.MiemPhiVanChuyen || false,
          
          trangThai: latestOrder.TrangThai,
          ghiChu: latestOrder.GhiChu,
          chiTiet: latestOrder.chiTiet.map(item => ({
            id: item.ID,
            sanPhamId: item.SanPhamID,
            tenSanPham: item.sanPham.Ten,
            hinhAnh: item.sanPham.HinhAnhURL,
            soLuong: item.SoLuong,
            donGia: parseFloat(item.DonGia),
            thanhTien: parseFloat(item.ThanhTien)
          }))
        }
      }
    };

    log.info('Response từ API:');
    console.log(JSON.stringify(apiResponse, null, 2));

    // Validate response
    console.log('\n🔍 KIỂM TRA DỮ LIỆU API:');
    
    if (apiResponse.data.hoaDon.tienGoc > 0) {
      log.success(`TienGoc có giá trị: ${formatPrice(apiResponse.data.hoaDon.tienGoc)}`);
    } else {
      log.error('TienGoc = 0 hoặc NULL (SAI)');
    }

    if (apiResponse.data.hoaDon.tienVAT > 0) {
      log.success(`TienVAT có giá trị: ${formatPrice(apiResponse.data.hoaDon.tienVAT)}`);
    } else {
      log.warning('TienVAT = 0 (có thể không áp dụng VAT)');
    }

    if (apiResponse.data.hoaDon.maVoucher) {
      log.success(`MaVoucher: ${apiResponse.data.hoaDon.maVoucher}`);
    } else {
      log.warning('Không có voucher');
    }

  } catch (error) {
    log.error(`Lỗi: ${error.message}`);
    console.error(error);
  }
}

// Test Case 3: Kiểm tra Frontend sẽ hiển thị như thế nào
async function testFrontendDisplay() {
  log.header();
  log.title('TEST 3: MÔ PHỎNG HIỂN THỊ FRONTEND');
  log.header();

  try {
    const latestOrder = await HoaDon.findOne({
      order: [['ID', 'DESC']],
      include: [
        {
          model: ChiTietHoaDon,
          as: 'chiTiet',
          include: [{
            model: SanPham,
            as: 'sanPham'
          }]
        }
      ]
    });

    if (!latestOrder) {
      log.error('Không tìm thấy đơn hàng');
      return;
    }

    console.log('\n🖥️  HIỂN THỊ TRÊN FRONTEND (OrderDetailPage):');
    console.log('\n┌─────────────────────────────────────────────────┐');
    console.log('│  📦 Danh Sách Sản Phẩm                          │');
    console.log('├─────────────────────────────────────────────────┤');
    
    latestOrder.chiTiet.forEach(item => {
      console.log(`│  ${item.sanPham.Ten.padEnd(30)} │`);
      console.log(`│  Đơn giá: ${formatPrice(item.DonGia).padEnd(25)} │`);
      console.log(`│  Số lượng: x${item.SoLuong}                              │`);
      console.log(`│  Thành tiền: ${formatPrice(item.ThanhTien).padEnd(22)} │`);
      console.log('├─────────────────────────────────────────────────┤');
    });

    console.log('│                                                 │');
    console.log(`│  Tạm tính: ${formatPrice(latestOrder.TienGoc || 0).padEnd(30)} │`);
    
    if (latestOrder.TienVAT > 0) {
      console.log(`│  VAT (${(latestOrder.TyLeVAT * 100).toFixed(0)}%): +${formatPrice(latestOrder.TienVAT).padEnd(25)} │`);
    }
    
    if (latestOrder.TienGiamGia > 0) {
      console.log(`│  Giảm giá (${latestOrder.MaVoucher}): -${formatPrice(latestOrder.TienGiamGia).padEnd(18)} │`);
    }
    
    console.log(`│  Phí vận chuyển: ${latestOrder.MiemPhiVanChuyen ? 'Miễn phí 🎉'.padEnd(23) : formatPrice(latestOrder.PhiVanChuyen).padEnd(23)} │`);
    console.log('│  ───────────────────────────────────────────    │');
    console.log(`│  Tổng cộng: ${formatPrice(latestOrder.TongTien).padEnd(28)} │`);
    console.log('└─────────────────────────────────────────────────┘');

  } catch (error) {
    log.error(`Lỗi: ${error.message}`);
    console.error(error);
  }
}

// Test Case 4: So sánh giá trong ChiTietHoaDon vs SanPham
async function testPriceComparison() {
  log.header();
  log.title('TEST 4: SO SÁNH GIÁ ChiTietHoaDon vs SanPham');
  log.header();

  try {
    const latestOrder = await HoaDon.findOne({
      order: [['ID', 'DESC']],
      include: [
        {
          model: ChiTietHoaDon,
          as: 'chiTiet',
          include: [{
            model: SanPham,
            as: 'sanPham',
            attributes: ['ID', 'Ten', 'GiaBan']
          }]
        }
      ]
    });

    if (!latestOrder) {
      log.error('Không tìm thấy đơn hàng');
      return;
    }

    console.log('\n📊 SO SÁNH GIÁ:');
    console.log('┌────────────────────────┬──────────────┬──────────────┬───────────┐');
    console.log('│ Sản phẩm               │ Giá gốc (DB) │ Giá lưu (CT) │ Trạng thái│');
    console.log('├────────────────────────┼──────────────┼──────────────┼───────────┤');

    let hasError = false;
    latestOrder.chiTiet.forEach(item => {
      const giaGoc = parseFloat(item.sanPham.GiaBan);
      const giaLuu = parseFloat(item.DonGia);
      const isEqual = giaGoc === giaLuu;
      
      const status = isEqual ? '⚠️  BẰNG' : '✅ KHÁC';
      if (isEqual) hasError = true;

      console.log(`│ ${item.sanPham.Ten.substring(0, 20).padEnd(22)} │ ${formatPrice(giaGoc).padEnd(12)} │ ${formatPrice(giaLuu).padEnd(12)} │ ${status}     │`);
    });

    console.log('└────────────────────────┴──────────────┴──────────────┴───────────┘');

    if (hasError) {
      log.error('\n❌ PHÁT HIỆN LỖI: Giá lưu BẰNG giá gốc!');
      log.warning('→ Backend CHƯA áp dụng tỷ lệ VAT + Voucher vào ChiTietHoaDon');
      log.info('→ Cần kiểm tra lại logic tính giá trong order.controller.js');
    } else {
      log.success('\n✅ OK: Giá đã được điều chỉnh theo khuyến mãi');
    }

  } catch (error) {
    log.error(`Lỗi: ${error.message}`);
    console.error(error);
  }
}

// Hàm format giá
function formatPrice(price) {
  if (!price) return '0 ₫';
  return new Intl.NumberFormat('vi-VN').format(Math.round(price)) + ' ₫';
}

// Chạy tất cả test
async function runAllTests() {
  console.log('\n');
  log.title('╔═══════════════════════════════════════════════════════════╗');
  log.title('║   TEST ORDER DETAIL - DECORATOR PATTERN INTEGRATION      ║');
  log.title('╚═══════════════════════════════════════════════════════════╝');

  await testLatestOrder();
  await testGetOrderDetailAPI();
  await testFrontendDisplay();
  await testPriceComparison();

  log.header();
  log.title('✅ HOÀN THÀNH TẤT CẢ TEST');
  log.header();
  console.log('\n');

  process.exit(0);
}

// Chạy test
runAllTests().catch(error => {
  log.error(`Lỗi nghiêm trọng: ${error.message}`);
  console.error(error);
  process.exit(1);
});

async function testOrderDetailFromDB() {
  try {
    console.log('🔍 Testing Order Detail từ Database...\n');

    const orderId = 11;

    // Giả lập code trong getOrderDetail API
    const hoaDon = await db.HoaDon.findOne({
      where: {
        ID: orderId,
        Enable: true
      },
      include: [
        {
          model: db.KhachHang,
          as: 'khachHang',
          attributes: ['ID', 'HoTen', 'Email', 'DienThoai', 'DiaChi']
        },
        {
          model: db.PhuongThucThanhToan,
          as: 'phuongThucThanhToan',
          attributes: ['ID', 'Ten', 'MoTa']
        },
        {
          model: db.ChiTietHoaDon,
          as: 'chiTiet',
          include: [{
            model: db.SanPham,
            as: 'sanPham',
            attributes: ['ID', 'Ten', 'HinhAnhURL', 'GiaBan']
          }]
        }
      ]
    });

    if (!hoaDon) {
      console.log('❌ Không tìm thấy đơn hàng');
      return;
    }

    console.log('✅ Tìm thấy đơn hàng:', hoaDon.MaHD);
    console.log('\n📊 Dữ liệu RAW từ Sequelize:');
    console.log('TienGoc:', hoaDon.TienGoc, '(type:', typeof hoaDon.TienGoc + ')');
    console.log('TienVAT:', hoaDon.TienVAT, '(type:', typeof hoaDon.TienVAT + ')');
    console.log('TyLeVAT:', hoaDon.TyLeVAT, '(type:', typeof hoaDon.TyLeVAT + ')');
    console.log('MaVoucher:', hoaDon.MaVoucher);
    console.log('TienGiamGia:', hoaDon.TienGiamGia, '(type:', typeof hoaDon.TienGiamGia + ')');
    console.log('PhiVanChuyen:', hoaDon.PhiVanChuyen, '(type:', typeof hoaDon.PhiVanChuyen + ')');
    console.log('MiemPhiVanChuyen:', hoaDon.MiemPhiVanChuyen, '(type:', typeof hoaDon.MiemPhiVanChuyen + ')');
    console.log('TongTien:', hoaDon.TongTien);

    // Giả lập code format response như trong API
    const responseData = {
      id: hoaDon.ID,
      maHD: hoaDon.MaHD,
      ngayLap: hoaDon.NgayLap,
      tongTien: parseFloat(hoaDon.TongTien),
      trangThai: hoaDon.TrangThai,
      ghiChu: hoaDon.GhiChu,
      // ✨ CÁC TRƯỜNG DECORATOR PATTERN
      tienGoc: parseFloat(hoaDon.TienGoc || 0),
      tienVAT: parseFloat(hoaDon.TienVAT || 0),
      tyLeVAT: parseFloat(hoaDon.TyLeVAT || 0),
      maVoucher: hoaDon.MaVoucher,
      tienGiamGia: parseFloat(hoaDon.TienGiamGia || 0),
      phiVanChuyen: parseFloat(hoaDon.PhiVanChuyen || 0),
      miemPhiVanChuyen: hoaDon.MiemPhiVanChuyen || false,
    };

    console.log('\n💰 Dữ liệu SAU KHI FORMAT (như API sẽ trả về):');
    console.log(JSON.stringify(responseData, null, 2));

    console.log('\n🔍 Kiểm tra:');
    if (responseData.tienGoc > 0 && responseData.tienVAT >= 0) {
      console.log('✅ Dữ liệu hợp lệ! Backend SẼ TRẢ VỀ đúng.');
    } else {
      console.log('❌ Dữ liệu KHÔNG hợp lệ!');
      if (responseData.tienGoc === 0) console.log('  - TienGoc = 0 (có thể là NULL trong DB)');
      if (responseData.tienVAT === 0) console.log('  - TienVAT = 0 (có thể là NULL trong DB)');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
  } finally {
    await db.sequelize.close();
    process.exit(0);
  }
}

testOrderDetailFromDB();
