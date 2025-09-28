require('dotenv').config();
const { Sequelize } = require('sequelize');

async function checkTable() {
  const sequelize = new Sequelize({
    dialect: 'mssql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    },
    logging: console.log
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Check if TaiKhoan table exists
    const [results] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'TaiKhoan'
    `);

    console.log('📋 Table check result:', results);

    // Show table structure
    if (results.length > 0) {
      const [columns] = await sequelize.query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'TaiKhoan'
        ORDER BY ORDINAL_POSITION
      `);
      console.log('📊 Table structure:', columns);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkTable();