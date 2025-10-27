const db = require('./models');

async function updateOrderData() {
  try {
    console.log('🔧 Bắt đầu cập nhật dữ liệu đơn hàng...\n');

    // Lấy tất cả đơn hàng
    const orders = await db.HoaDon.findAll({
      where: { Enable: true },
      include: [{
        model: db.ChiTietHoaDon,
        as: 'chiTiet',
        where: { Enable: true },
        required: false
      }],
      order: [['ID', 'DESC']],
      limit: 10
    });

    console.log(`📦 Tìm thấy ${orders.length} đơn hàng\n`);

    for (const order of orders) {
      console.log(`\n🔍 Đang xử lý đơn hàng ${order.MaHD}...`);
      
      // Tính tổng tiền gốc từ chi tiết hóa đơn
      let tienGocCalculated = 0;
      if (order.chiTiet && order.chiTiet.length > 0) {
        tienGocCalculated = order.chiTiet.reduce((sum, item) => {
          return sum + (parseFloat(item.DonGia) * item.SoLuong);
        }, 0);
      }

      // Nếu TienGoc = 0 hoặc NULL, tính lại từ TongTien
      let tienGoc = parseFloat(order.TienGoc) || 0;
      let tienVAT = parseFloat(order.TienVAT) || 0;
      let tyLeVAT = parseFloat(order.TyLeVAT) || 0.1;
      let tienGiamGia = parseFloat(order.TienGiamGia) || 0;
      let phiVanChuyen = parseFloat(order.PhiVanChuyen) || 30000;
      let tongTien = parseFloat(order.TongTien);

      console.log('Dữ liệu cũ:', {
        TienGoc: tienGoc,
        TienVAT: tienVAT,
        TienGiamGia: tienGiamGia,
        PhiVanChuyen: phiVanChuyen,
        TongTien: tongTien
      });

      // Nếu TienGoc = 0, tính ngược lại từ TongTien
      if (tienGoc === 0) {
        if (tienGocCalculated > 0) {
          // Dùng giá từ chi tiết hóa đơn
          tienGoc = tienGocCalculated;
        } else {
          // Tính ngược: TongTien = TienGoc + VAT - GiamGia + Ship
          // => TienGoc = (TongTien - Ship + GiamGia) / (1 + TyLeVAT)
          tienGoc = Math.round((tongTien - phiVanChuyen + tienGiamGia) / (1 + tyLeVAT));
        }
        
        // Tính lại VAT
        tienVAT = Math.round(tienGoc * tyLeVAT);
      }

      console.log('Dữ liệu mới:', {
        TienGoc: tienGoc,
        TienVAT: tienVAT,
        TyLeVAT: tyLeVAT,
        TienGiamGia: tienGiamGia,
        PhiVanChuyen: phiVanChuyen
      });

      // Cập nhật vào database
      await order.update({
        TienGoc: tienGoc,
        TienVAT: tienVAT,
        TyLeVAT: tyLeVAT,
        TienGiamGia: tienGiamGia,
        PhiVanChuyen: phiVanChuyen,
        MiemPhiVanChuyen: order.MiemPhiVanChuyen || false
      });

      console.log(`✅ Đã cập nhật đơn hàng ${order.MaHD}`);
    }

    console.log('\n\n📊 Kiểm tra lại dữ liệu sau khi cập nhật:\n');

    // Lấy lại đơn hàng mới nhất
    const latestOrder = await db.HoaDon.findOne({
      order: [['ID', 'DESC']],
      raw: true
    });

    console.log('Đơn hàng mới nhất:', latestOrder.MaHD);
    console.log('TienGoc:', latestOrder.TienGoc);
    console.log('TienVAT:', latestOrder.TienVAT);
    console.log('TyLeVAT:', latestOrder.TyLeVAT);
    console.log('MaVoucher:', latestOrder.MaVoucher || 'NULL');
    console.log('TienGiamGia:', latestOrder.TienGiamGia);
    console.log('PhiVanChuyen:', latestOrder.PhiVanChuyen);
    console.log('MiemPhiVanChuyen:', latestOrder.MiemPhiVanChuyen);
    console.log('TongTien:', latestOrder.TongTien);

    console.log('\n✅ Hoàn thành! Refresh trang để xem kết quả.');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
  } finally {
    await db.sequelize.close();
    process.exit(0);
  }
}

updateOrderData();
