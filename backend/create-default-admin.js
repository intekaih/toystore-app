const bcrypt = require('bcryptjs');
const db = require('./models');
const TaiKhoan = db.TaiKhoan;

/**
 * Script tạo/cập nhật tài khoản admin mặc định
 * Mật khẩu sẽ được mã hóa bằng bcrypt
 */

const createOrUpdateAdmin = async () => {
  try {
    console.log('🔧 Đang kết nối database...');
    
    // Đồng bộ database
    await db.sequelize.sync();
    console.log('✅ Kết nối database thành công');

    // Thông tin admin mặc định
    const adminData = {
      TenDangNhap: 'admin',
      MatKhau: 'admin123', // Mật khẩu mặc định (sẽ được mã hóa)
      HoTen: 'Quản Trị Viên',
      Email: 'admin@toystore.com',
      DienThoai: '0123456789',
      VaiTro: 'Admin',  // Changed from 'admin' to 'Admin'
      TrangThai: true   // Changed from Enable to TrangThai
    };

    // Kiểm tra xem admin đã tồn tại chưa
    console.log(`🔍 Kiểm tra tài khoản admin "${adminData.TenDangNhap}"...`);
    const existingAdmin = await TaiKhoan.findOne({
      where: { TenDangNhap: adminData.TenDangNhap }
    });

    // Mã hóa mật khẩu
    console.log('🔐 Đang mã hóa mật khẩu...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminData.MatKhau, saltRounds);
    console.log('✅ Mã hóa mật khẩu thành công');

    if (existingAdmin) {
      console.log('⚠️  Tài khoản admin đã tồn tại! Đang cập nhật...');
      
      // Cập nhật thông tin admin
      await existingAdmin.update({
        MatKhau: hashedPassword,
        HoTen: adminData.HoTen,
        Email: adminData.Email,
        DienThoai: adminData.DienThoai,
        VaiTro: adminData.VaiTro,
        TrangThai: adminData.TrangThai
      });

      console.log('\n✅ CẬP NHẬT TÀI KHOẢN ADMIN THÀNH CÔNG!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 THÔNG TIN TÀI KHOẢN:');
      console.log(`   - ID: ${existingAdmin.ID}`);
      console.log(`   - Tên đăng nhập: ${existingAdmin.TenDangNhap}`);
      console.log(`   - Mật khẩu: ${adminData.MatKhau}`);
      console.log(`   - Họ tên: ${existingAdmin.HoTen}`);
      console.log(`   - Email: ${existingAdmin.Email}`);
      console.log(`   - Điện thoại: ${existingAdmin.DienThoai}`);
      console.log(`   - Vai trò: ${existingAdmin.VaiTro}`);
      console.log(`   - Trạng thái: ${existingAdmin.TrangThai ? 'Kích hoạt' : 'Vô hiệu hóa'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      // Tạo tài khoản admin mới
      console.log('📝 Đang tạo tài khoản admin...');
      const newAdmin = await TaiKhoan.create({
        TenDangNhap: adminData.TenDangNhap,
        MatKhau: hashedPassword,
        HoTen: adminData.HoTen,
        Email: adminData.Email,
        DienThoai: adminData.DienThoai,
        VaiTro: adminData.VaiTro,
        TrangThai: adminData.TrangThai
      });

      console.log('\n✅ TẠO TÀI KHOẢN ADMIN THÀNH CÔNG!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 THÔNG TIN TÀI KHOẢN:');
      console.log(`   - ID: ${newAdmin.ID}`);
      console.log(`   - Tên đăng nhập: ${newAdmin.TenDangNhap}`);
      console.log(`   - Mật khẩu: ${adminData.MatKhau}`);
      console.log(`   - Họ tên: ${newAdmin.HoTen}`);
      console.log(`   - Email: ${newAdmin.Email}`);
      console.log(`   - Điện thoại: ${newAdmin.DienThoai}`);
      console.log(`   - Vai trò: ${newAdmin.VaiTro}`);
      console.log(`   - Trạng thái: ${newAdmin.TrangThai ? 'Kích hoạt' : 'Vô hiệu hóa'}`);
      console.log(`   - Ngày tạo: ${newAdmin.NgayTao}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    
    console.log('\n⚠️  LƯU Ý: Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu!');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ LỖI:', error.message);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('⚠️  Email đã tồn tại trong hệ thống');
    } else if (error.name === 'SequelizeValidationError') {
      console.error('⚠️  Dữ liệu không hợp lệ:', error.errors.map(e => e.message).join(', '));
    } else {
      console.error('Chi tiết lỗi:', error);
    }
    
    process.exit(1);
  }
};

// Chạy script
console.log('🚀 BẮT ĐẦU TẠO/CẬP NHẬT TÀI KHOẢN ADMIN');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
createOrUpdateAdmin();
