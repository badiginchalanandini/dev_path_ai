const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // Required for TiDB Cloud
  ssl: {
    rejectUnauthorized: true
  }
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ TiDB Database connected successfully!');
    connection.release();
  } catch (error) {
    console.error('❌ Database Connection Error:', error.message);
  }
};

module.exports = {
  pool,
  testConnection
};