const db = require('./models');

async function updateOrder36() {
  try {
    console.log('🔧 Cập nhật đơn hàng ID=36...\n');

    const order = await db.HoaDon.findByPk(36, {
      include: [{
        model: db.ChiTietHoaDon,
        as: 'chiTiet'
      }]
    });

    if (!order) {
      console.log('❌ Không tìm thấy đơn hàng ID=36');
      return;
    }

    console.log('📦 Đơn hàng:', order.MaHD);
    console.log('TongTien hiện tại:', order.TongTien);
    console.log('TienGoc hiện tại:', order.TienGoc);
    console.log('TienVAT hiện tại:', order.TienVAT);

    // Tính tổng từ chi tiết hóa đơn
    let tienGocCalculated = 0;
    if (order.chiTiet && order.chiTiet.length > 0) {
      tienGocCalculated = order.chiTiet.reduce((sum, item) => {
        return sum + (parseFloat(item.DonGia) * item.SoLuong);
      }, 0);
      console.log('\nTính từ ChiTietHoaDon:');
      console.log('TienGoc (tổng DonGia × SoLuong):', tienGocCalculated);
    }

    const tongTien = parseFloat(order.TongTien);
    
    // Tính TienGoc và TienVAT
    // Công thức: TongTien = TienGoc + TienVAT + PhiVanChuyen
    // Với TienVAT = TienGoc × 0.1
    // => TongTien = TienGoc + TienGoc × 0.1 + PhiVanChuyen
    // => TongTien = TienGoc × 1.1 + PhiVanChuyen
    // => TienGoc = (TongTien - PhiVanChuyen) / 1.1
    
    const phiVanChuyen = 30000;
    let tienGoc = tienGocCalculated > 0 ? tienGocCalculated : Math.round((tongTien - phiVanChuyen) / 1.1);
    let tienVAT = Math.round(tienGoc * 0.1);

    console.log('\nDữ liệu mới sẽ cập nhật:');
    console.log('TienGoc:', tienGoc);
    console.log('TienVAT:', tienVAT);
    console.log('TyLeVAT:', 0.1);
    console.log('TienGiamGia:', 0);
    console.log('PhiVanChuyen:', phiVanChuyen);
    console.log('MiemPhiVanChuyen:', false);

    // Kiểm tra công thức
    const calculated = tienGoc + tienVAT + phiVanChuyen;
    console.log('\nKiểm tra: TienGoc + TienVAT + PhiVanChuyen =', calculated);
    console.log('TongTien trong DB:', tongTien);
    console.log('Chênh lệch:', Math.abs(calculated - tongTien));

    // Cập nhật
    await order.update({
      TienGoc: tienGoc,
      TienVAT: tienVAT,
      TyLeVAT: 0.1,
      TienGiamGia: 0,
      PhiVanChuyen: phiVanChuyen,
      MiemPhiVanChuyen: false
    });

    console.log('\n✅ Đã cập nhật thành công!');
    console.log('\n🔄 Hãy REFRESH trang để xem kết quả!');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await db.sequelize.close();
    process.exit(0);
  }
}

updateOrder36();
