const mysql = require('mysql2/promise');

const candidates = [
  { host: '127.0.0.1', port: 3306, user: 'root', password: '' },
  { host: '127.0.0.1', port: 3306, user: 'root', password: 'root' },
  { host: '127.0.0.1', port: 3306, user: 'root', password: 'password' },
  { host: '127.0.0.1', port: 3306, user: 'root', password: 'sql123' },
  { host: '127.0.0.1', port: 3306, user: 'crm_user', password: 'sql123' },
  { host: '127.0.0.1', port: 3307, user: 'root', password: '' },
  { host: '127.0.0.1', port: 3307, user: 'root', password: 'root' },
  { host: '127.0.0.1', port: 3307, user: 'root', password: 'password' },
  { host: '127.0.0.1', port: 3307, user: 'root', password: 'sql123' },
  { host: '127.0.0.1', port: 3307, user: 'crm_user', password: 'sql123' },
];

(async () => {
  for (const option of candidates) {
    const label = `${option.user}@${option.host}:${option.port}`;
    try {
      const conn = await mysql.createConnection({
        host: option.host,
        port: option.port,
        user: option.user,
        password: option.password,
        connectTimeout: 10000,
      });
      const [rows] = await conn.query("SELECT USER() AS user, CURRENT_USER() AS current_user, VERSION() AS version");
      console.log(`OK   ${label} password='${option.password}' ->`, rows[0]);
      await conn.end();
    } catch (err) {
      console.error(`FAIL ${label} password='${option.password}' ->`, err.message);
    }
  }
})();
