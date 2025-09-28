require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./models');

async function resetAdmin() {
  try {
    await db.sequelize.sync();
    
    // Xóa admin cũ nếu có
    await db.TaiKhoan.destroy({
      where: { TenDangNhap: 'admin' }
    });
    
    console.log('🗑️ Đã xóa admin cũ');
    
    // Tạo admin mới
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await db.TaiKhoan.create({
      TenDangNhap: 'admin',
      MatKhau: hashedPassword,
      HoTen: 'Administrator',
      Email: 'admin@toystore.com',
      VaiTro: 'admin',
      Enable: true
    });
    
    console.log('✅ Tạo admin mới thành công:', {
      ID: admin.ID,
      TenDangNhap: admin.TenDangNhap,
      VaiTro: admin.VaiTro,
      Password: 'admin123'
    });
    
  } catch (error) {
    console.error('❌ Lỗi reset admin:', error);
  } finally {
    await db.sequelize.close();
  }
}

resetAdmin();