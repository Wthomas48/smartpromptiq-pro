const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:xYiuuCchtQPUaaKVejYWcUSuSBiqCsIM@metro.proxy.rlwy.net:36720/railway',
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT id FROM academy_lessons LIMIT 1')
  .then(r => {
    console.log(r.rows[0].id);
    pool.end();
  });
