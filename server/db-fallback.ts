import { drizzle } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || '';
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('localhost') ? undefined : { rejectUnauthorized: false }
});

// Type assertion to handle adapter compatibility
export const db = drizzle(pool as any, { schema });

export * from '../shared/schema';

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connected');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export async function ensureDatabaseSetup(): Promise<void> {
  await checkDatabaseConnection();
}

export async function closeDatabaseConnection(): Promise<void> {
  await pool.end();
}
