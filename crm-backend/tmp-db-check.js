require('dotenv').config();
const sequelize = require('./config/db');

(async () => {
  try {
    console.log('DB env:');
    console.log('  DB_DIALECT=', process.env.DB_DIALECT || '(unset)');
    console.log('  DB_HOST=', process.env.DB_HOST);
    console.log('  DB_PORT=', process.env.DB_PORT);
    console.log('  DB_USER=', process.env.DB_USER);
    console.log('  DB_NAME=', process.env.DB_NAME);

    await sequelize.authenticate();
    console.log('DB auth OK ->', sequelize.getDialect());

    const [results] = await sequelize.query("SELECT DATABASE() AS dbName, @@hostname AS host, @@port AS port;");
    console.log('SQL connected to:', results[0]);
  } catch (err) {
    console.error('DB auth failed ->', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
