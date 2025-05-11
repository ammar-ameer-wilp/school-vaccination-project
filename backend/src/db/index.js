const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool
  .connect()
  .then(() => console.log('DB Connection successful'))
  .catch((err) => console.error('DB connection failed! error:', err));

module.exports = pool;
