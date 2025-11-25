require('dotenv').config(); // nhập thư viện dotenv

module.exports = {
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME,
  dialect: "mssql", // xác định loại CSDL SQL Server
  dialectOptions: {
    options: {
      encrypt: false, // tắt chức năng mã hóa 
      trustServerCertificate: true, // tin tưởng chứng chỉ máy chủ
      // ✅ THÊM: Bỏ timezone offset để tránh lỗi với SQL Server DATETIME
      useUTC: false, // Không sử dụng UTC
      dateFirst: 1 // đặt ngày đầu tiên trong tuần là Thứ Hai (1)
    }
  },
  // ✅ FIX: Đổi sang local timezone để tránh lỗi "Conversion failed when converting date and/or time"
  timezone: 'local', // Sử dụng múi giờ local của server
  port: parseInt(process.env.DB_PORT), // chuyển đổi cổng từ chuỗi sang số nguyên
  pool: {   
    max: 5, // số kết nối tối đa trong pool
    min: 0, // số kết nối tối thiểu trong pool
    acquire: 30000, // thời gian tối đa (ms) để lấy kết nối từ pool
    idle: 10000  // thời gian tối đa (ms) một kết nối có thể không hoạt động trước khi bị đóng
  },
  // ✅ FIX: Cấu hình transaction cho MSSQL
  transactionType: 'IMMEDIATE', // MSSQL transaction type
  isolationLevel: 'READ_COMMITTED' // Transaction isolation level
};
