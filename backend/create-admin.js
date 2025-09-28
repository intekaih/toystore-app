require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./models');

async function createAdmin() {
  try {
    await db.sequelize.sync();
    
    const adminExists = await db.TaiKhoan.findOne({
      where: { TenDangNhap: 'admin' }
    });
    
    if (adminExists) {
      console.log('👤 Admin đã tồn tại');
      return;
    }
    
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await db.TaiKhoan.create({
      TenDangNhap: 'admin',
      MatKhau: hashedPassword,
      HoTen: 'Administrator',
      Email: 'admin@toystore.com',
      VaiTro: 'admin',
      Enable: true
    });
    
    console.log('✅ Tạo admin thành công:', {
      ID: admin.ID,
      TenDangNhap: admin.TenDangNhap,
      VaiTro: admin.VaiTro
    });
    
  } catch (error) {
    console.error('❌ Lỗi tạo admin:', error);
  } finally {
    await db.sequelize.close();
  }
}

createAdmin();