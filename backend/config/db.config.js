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
      useUTC: false, // sử dụng múi giờ địa phương thay vì UTC
      dateFirst: 1 // đặt ngày đầu tiên trong tuần là Thứ Hai (1)
    }
  },
  port: parseInt(process.env.DB_PORT), // chuyển đổi cổng từ chuỗi sang số nguyên
  timezone: '+07:00', // đặt múi giờ cho kết nối (UTC+7)
  pool: {   
    max: 5, // số kết nối tối đa trong pool
    min: 0, // số kết nối tối thiểu trong pool
    acquire: 30000, // thời gian tối đa (ms) để lấy kết nối từ pool
    idle: 10000  // thời gian tối đa (ms) một kết nối có thể không hoạt động trước khi bị đóng
  }
};
