// scripts/db-utils.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';
import path from 'path';

// Load environment
const envFile = process.env.ENV_FILE || '.env.local';
dotenv.config({ path: path.resolve(envFile) });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function checkTables() {
  console.log('📊 Checking database tables...\n');
  
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No tables found in database');
    } else {
      console.log('✅ Tables in database:');
      result.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }
}

async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      await checkTables();
      break;
    
    case 'seed':
      console.log('🌱 Seeding database...');
      // Add your seed logic here
      console.log('✅ Seeding complete');
      break;
    
    default:
      console.log(`
Database Utilities:
  npm run db:utils check  - Check database tables
  npm run db:utils seed   - Seed database with sample data
      `);
  }
  
  await pool.end();
}

main().catch(console.error);
