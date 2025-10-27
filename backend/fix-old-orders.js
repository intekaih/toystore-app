const db = require('./models');

async function fixOldOrders() {
  try {
    console.log('🔧 Bắt đầu sửa dữ liệu đơn hàng cũ...\n');

    // Cập nhật TienGiamGia NULL -> 0
    const [affectedRows1] = await db.sequelize.query(`
      UPDATE HoaDon 
      SET TienGiamGia = 0 
      WHERE TienGiamGia IS NULL
    `);

    console.log(`✅ Đã cập nhật ${affectedRows1} đơn hàng: TienGiamGia NULL -> 0`);

    // Cập nhật TienVAT NULL -> 0
    const [affectedRows2] = await db.sequelize.query(`
      UPDATE HoaDon 
      SET TienVAT = 0 
      WHERE TienVAT IS NULL
    `);

    console.log(`✅ Đã cập nhật ${affectedRows2} đơn hàng: TienVAT NULL -> 0`);

    // Cập nhật TyLeVAT NULL -> 0.10
    const [affectedRows3] = await db.sequelize.query(`
      UPDATE HoaDon 
      SET TyLeVAT = 0.10 
      WHERE TyLeVAT IS NULL
    `);

    console.log(`✅ Đã cập nhật ${affectedRows3} đơn hàng: TyLeVAT NULL -> 0.10`);

    // Cập nhật PhiVanChuyen NULL -> 30000
    const [affectedRows4] = await db.sequelize.query(`
      UPDATE HoaDon 
      SET PhiVanChuyen = 30000 
      WHERE PhiVanChuyen IS NULL
    `);

    console.log(`✅ Đã cập nhật ${affectedRows4} đơn hàng: PhiVanChuyen NULL -> 30000`);

    // Cập nhật MiemPhiVanChuyen NULL -> 0
    const [affectedRows5] = await db.sequelize.query(`
      UPDATE HoaDon 
      SET MiemPhiVanChuyen = 0 
      WHERE MiemPhiVanChuyen IS NULL
    `);

    console.log(`✅ Đã cập nhật ${affectedRows5} đơn hàng: MiemPhiVanChuyen NULL -> 0`);

    // Cập nhật TienGoc NULL -> TongTien (ước lượng)
    const [affectedRows6] = await db.sequelize.query(`
      UPDATE HoaDon 
      SET TienGoc = ROUND(TongTien / 1.1, 0)
      WHERE TienGoc IS NULL AND TongTien > 0
    `);

    console.log(`✅ Đã cập nhật ${affectedRows6} đơn hàng: TienGoc NULL -> ước tính từ TongTien`);

    console.log('\n📊 Kiểm tra lại dữ liệu...\n');

    // Kiểm tra lại đơn hàng mới nhất
    const latestOrder = await db.HoaDon.findOne({
      order: [['ID', 'DESC']],
      limit: 1
    });

    if (latestOrder) {
      console.log('Đơn hàng:', latestOrder.MaHD);
      console.log('TienGoc:', latestOrder.TienGoc, '✅');
      console.log('TienVAT:', latestOrder.TienVAT, '✅');
      console.log('TyLeVAT:', latestOrder.TyLeVAT, '✅');
      console.log('MaVoucher:', latestOrder.MaVoucher || 'NULL');
      console.log('TienGiamGia:', latestOrder.TienGiamGia, '✅');
      console.log('PhiVanChuyen:', latestOrder.PhiVanChuyen, '✅');
      console.log('MiemPhiVanChuyen:', latestOrder.MiemPhiVanChuyen, '✅');
      console.log('TongTien:', latestOrder.TongTien);
    }

    console.log('\n✅ Hoàn thành! Giờ bạn có thể xem chi tiết đơn hàng trên Frontend.');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await db.sequelize.close();
    process.exit(0);
  }
}

fixOldOrders();
