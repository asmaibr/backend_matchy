import { readFileSync } from 'fs';
import mysql from 'mysql2/promise';

async function runMigration() {
  let connection;
  try {
    console.log('📊 Running auth migration...');
    
    // Create connection with multipleStatements enabled
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'matchy_db',
      multipleStatements: true
    });
    
    const sql = readFileSync('./database/auth_migration.sql', 'utf8');
    
    await connection.query(sql);
    
    console.log('✅ Auth migration completed successfully!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

runMigration();
