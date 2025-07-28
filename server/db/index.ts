import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Create SQLite database for development
const sqlite = new Database('smartpromptiq.db');
export const db = drizzle(sqlite, { schema });

export * from './schema';

export async function checkDatabaseConnection() {
  try {
    const result = sqlite.prepare('SELECT datetime(\"now\") as current_time').get();
    console.log('✅ Database connected successfully:', result);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export async function ensureDatabaseSetup() {
  await checkDatabaseConnection();
}
