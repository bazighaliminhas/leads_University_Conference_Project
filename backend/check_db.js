const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDb() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'univ_conference_db',
      connectTimeout: 3000
    });
    console.log('✅ MySQL Database is CONNECTED!');
    const [tables] = await conn.query('SHOW TABLES');
    console.log('Tables in database:', tables);
    await conn.end();
  } catch (err) {
    console.log('❌ MySQL Connection Failed:', err.message);
  }
}

checkDb();
