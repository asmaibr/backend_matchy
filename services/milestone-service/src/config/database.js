import mysql from 'mysql2/promise';

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'matchy_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL Connected Successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Error:', err.message);
    console.log('⚠️  Please make sure MySQL is running and database "matchy_db" exists');
    console.log('   Run: mysql -u root -p < database/matchy_schema.sql');
  });

export default pool;
