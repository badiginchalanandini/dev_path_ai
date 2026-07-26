const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'devpath_ai',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to test DB connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully!');
    connection.release();
  } catch (error) {
    console.warn('⚠️ MySQL Connection Notice:', error.message);
    console.warn('💡 Ensure your MySQL server is running and database "devpath_ai" is created using schema.sql');
  }
};

module.exports = {
  pool,
  testConnection
};
