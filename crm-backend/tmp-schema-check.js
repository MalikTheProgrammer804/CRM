require('dotenv').config();
const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root123',
      database: process.env.DB_NAME || 'crm_db',
    });

    const [rows] = await conn.query(`SELECT TABLE_NAME, COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_TYPE, EXTRA FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND COLUMN_NAME = ?`, [process.env.DB_NAME || 'crm_db', 'name']);
    console.log('INFO_SCHEMA columns named name:');
    console.log(JSON.stringify(rows, null, 2));

    const [tables] = await conn.query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`, [process.env.DB_NAME || 'crm_db']);
    console.log('tables:', tables.map((r) => r.TABLE_NAME));
    await conn.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();