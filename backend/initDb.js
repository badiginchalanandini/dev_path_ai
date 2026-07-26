const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const initDatabase = async () => {
  console.log('🔄 Initializing DevPath AI MySQL Database...');

  // 1. Connect without database parameter first
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    multipleStatements: true
  });

  try {
    // 2. Create Database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'devpath_ai'}\`;`);
    console.log(`✅ Database "${process.env.DB_NAME || 'devpath_ai'}" verified/created successfully.`);

    // 3. Switch to the database
    await connection.changeUser({ database: process.env.DB_NAME || 'devpath_ai' });

    // 4. Load and run schema files in order
    const schemaFiles = [
      'schema.sql',
      'schema_career_mentor.sql',
      'schema_project_mentor.sql',
      'schema_history.sql',
      'schema_profile_updates.sql'
    ];

    for (const file of schemaFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`⏳ Executing schema: ${file}...`);
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        try {
          await connection.query(sqlContent);
          console.log(`✅ Finished executing: ${file}`);
        } catch (error) {
          if (error.errno === 1060 || error.code === 'ER_DUP_FIELDNAME') {
            console.log(`ℹ️ Column already exists, skipped executing: ${file}`);
          } else {
            throw error;
          }
        }
      } else {
        console.warn(`⚠️ Schema file not found: ${file}. Skipping.`);
      }
    }

    console.log('\n🎉 DevPath AI MySQL Database schema initialized successfully!');
  } catch (error) {
    console.error('❌ Database Initialization Failed:', error.message);
  } finally {
    await connection.end();
  }
};

initDatabase();
