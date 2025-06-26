import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { config } from '../config';

// Database connection configuration
const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

// Create a single connection to the database
export const db = drizzle(pool, { 
  schema,
  logger: config.nodeEnv === 'development',
});

/**
 * Get a database connection
 * @returns A promise that resolves to the database connection
 */
export async function getDb() {
  return db;
}

// Export the pool for direct access if needed
export { pool as dbPool };
