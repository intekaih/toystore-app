require('dotenv').config();
const { Sequelize } = require('sequelize');

async function testConnection() {
  console.log('🔧 Đang test kết nối SQL Server...');
  console.log('Config:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME
  });

  const sequelize = new Sequelize({
    dialect: 'mssql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'master', // Kết nối vào master trước
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        requestTimeout: 30000,
        connectionTimeout: 30000
      }
    },
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });

  try {
    // Test kết nối
    await sequelize.authenticate();
    console.log('✅ Kết nối SQL Server thành công!');

    // Tạo database nếu chưa có
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${process.env.DB_NAME}')
      BEGIN
        CREATE DATABASE [${process.env.DB_NAME}]
        PRINT 'Database ${process.env.DB_NAME} đã được tạo!'
      END
      ELSE
        PRINT 'Database ${process.env.DB_NAME} đã tồn tại!'
    `);

    console.log('✅ Database đã sẵn sàng!');
    
  } catch (error) {
    console.error('❌ Lỗi kết nối:', error.message);
    console.error('Chi tiết lỗi:', error.original?.message || error);
  } finally {
    await sequelize.close();
  }
}

testConnection();