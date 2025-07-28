import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get database URL
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set in .env file');
  throw new Error('DATABASE_URL is not set. Please configure it in your .env file');
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  // SSL config for production databases (Neon, Supabase, etc.)
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : undefined,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Create drizzle database instance
export const db = drizzle(pool, { schema });

// Re-export schema
export * from '../shared/schema';

// Database health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT current_timestamp');
      console.log('✅ Database connected successfully at:', result.rows[0].current_timestamp);
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Initialize database
export async function ensureDatabaseSetup(): Promise<void> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Could not establish database connection');
    }
    console.log('📦 Database setup complete');
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await pool.end();
    console.log('🔌 Database connection pool closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

// Export pool for direct queries if needed
export { pool };
