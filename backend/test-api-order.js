const http = require('http');

async function testOrderDetailAPI() {
  try {
    console.log('🔍 Testing Order Detail API...\n');

    const orderId = 11; // Đơn hàng HD20251027011

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/orders/${orderId}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          console.log('✅ API Response Status:', res.statusCode);
          console.log('\n📦 Dữ liệu đơn hàng từ API:');
          console.log(JSON.stringify(response, null, 2));

          if (response.success && response.data.hoaDon) {
            const order = response.data.hoaDon;
            console.log('\n💰 Chi tiết giá:');
            console.log('TienGoc:', order.tienGoc);
            console.log('TienVAT:', order.tienVAT);
            console.log('TyLeVAT:', order.tyLeVAT);
            console.log('MaVoucher:', order.maVoucher);
            console.log('TienGiamGia:', order.tienGiamGia);
            console.log('PhiVanChuyen:', order.phiVanChuyen);
            console.log('MiemPhiVanChuyen:', order.miemPhiVanChuyen);
            console.log('TongTien:', order.tongTien);

            if (order.tienGoc !== undefined && order.tienVAT !== undefined) {
              console.log('\n✅ Backend ĐÃ TRẢ VỀ đầy đủ dữ liệu Decorator Pattern!');
            } else {
              console.log('\n❌ Backend CHƯA TRẢ VỀ dữ liệu Decorator Pattern!');
              console.log('Các trường bị thiếu:');
              if (order.tienGoc === undefined) console.log('- tienGoc');
              if (order.tienVAT === undefined) console.log('- tienVAT');
            }
          }
        } catch (error) {
          console.error('❌ Error parsing response:', error.message);
          console.log('Raw response:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request Error:', error.message);
    });

    req.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testOrderDetailAPI();
