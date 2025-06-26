import { dbPool } from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  const client = await dbPool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Execute the migration SQL
    const migrationPath = path.join(__dirname, '..', 'db', 'migrations', '20240626_add_last_login_to_users.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('Running migration...');
    await client.query(migrationSQL);
    
    await client.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

runMigration();
