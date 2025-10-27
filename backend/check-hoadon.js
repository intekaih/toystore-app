const db = require('./models');

async function checkHoaDonTable() {
  try {
    console.log('🔍 Đang kiểm tra cấu trúc bảng HoaDon...\n');

    // Kiểm tra bảng có tồn tại không
    const tableCheck = await db.sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'HoaDon'
    `, { type: db.sequelize.QueryTypes.SELECT });

    if (tableCheck.length === 0) {
      console.log('❌ Bảng HoaDon không tồn tại!');
      return;
    }

    console.log('✅ Bảng HoaDon tồn tại\n');

    // Lấy cấu trúc bảng hiện tại
    const columns = await db.sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'HoaDon'
      ORDER BY ORDINAL_POSITION
    `, { type: db.sequelize.QueryTypes.SELECT });

    console.log('📊 Cấu trúc bảng HoaDon hiện tại:');
    console.table(columns);

    // Kiểm tra các cột mới của Decorator Pattern
    const requiredColumns = [
      'TienGoc',
      'TienVAT', 
      'TyLeVAT',
      'MaVoucher',
      'TienGiamGia',
      'PhiVanChuyen',
      'MiemPhiVanChuyen'
    ];

    const existingColumnNames = columns.map(col => col.COLUMN_NAME);
    const missingColumns = requiredColumns.filter(col => !existingColumnNames.includes(col));

    console.log('\n📋 Kiểm tra các cột Decorator Pattern:');
    requiredColumns.forEach(col => {
      const exists = existingColumnNames.includes(col);
      console.log(`${exists ? '✅' : '❌'} ${col}: ${exists ? 'Tồn tại' : 'THIẾU'}`);
    });

    if (missingColumns.length > 0) {
      console.log('\n⚠️  CÓ CÁC CỘT BỊ THIẾU! Cần thêm các cột sau:');
      console.log(missingColumns.join(', '));
      console.log('\n🔧 Bạn có muốn tự động thêm các cột này không?');
      console.log('Chạy lệnh: node add-decorator-columns.js');
    } else {
      console.log('\n✅ Tất cả các cột Decorator Pattern đã tồn tại!');
    }

    // Kiểm tra dữ liệu mẫu
    console.log('\n📦 Kiểm tra dữ liệu đơn hàng mới nhất:');
    const latestOrder = await db.HoaDon.findOne({
      order: [['ID', 'DESC']],
      limit: 1
    });

    if (latestOrder) {
      console.log('Đơn hàng:', latestOrder.MaHD);
      console.log('TienGoc:', latestOrder.TienGoc || 'NULL ❌');
      console.log('TienVAT:', latestOrder.TienVAT || 'NULL ❌');
      console.log('TyLeVAT:', latestOrder.TyLeVAT || 'NULL ❌');
      console.log('MaVoucher:', latestOrder.MaVoucher || 'NULL');
      console.log('TienGiamGia:', latestOrder.TienGiamGia || 'NULL ❌');
      console.log('PhiVanChuyen:', latestOrder.PhiVanChuyen || 'NULL ❌');
      console.log('MiemPhiVanChuyen:', latestOrder.MiemPhiVanChuyen !== null ? latestOrder.MiemPhiVanChuyen : 'NULL ❌');
      console.log('TongTien:', latestOrder.TongTien);

      if (!latestOrder.TienGoc || !latestOrder.PhiVanChuyen) {
        console.log('\n⚠️  Đơn hàng mới nhất CHƯA có dữ liệu Decorator Pattern!');
        console.log('💡 Hãy tạo đơn hàng MỚI để test các tính năng này.');
      }
    } else {
      console.log('Chưa có đơn hàng nào.');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await db.sequelize.close();
    process.exit(0);
  }
}

checkHoaDonTable();
