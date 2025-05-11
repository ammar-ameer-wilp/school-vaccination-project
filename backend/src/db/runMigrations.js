const fs = require('fs');
const path = require('path');
const pool = require('./index');

const migrate = async () => {
  try {
    const filePath = path.join(__dirname, 'migrations', 'init.sql');
    const sql = fs.readFileSync(filePath, 'utf8');
    await pool.query(sql);
    console.log('Database migration completed.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
