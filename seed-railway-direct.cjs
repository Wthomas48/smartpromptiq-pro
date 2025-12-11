/**
 * Direct seed script for Railway PostgreSQL database
 * This bypasses the backend/.env and seeds directly to Railway
 */

const { execSync } = require('child_process');

// Set Railway DATABASE_URL
process.env.DATABASE_URL = 'postgresql://postgres:xYiuuCchtQPUaaKVejYWcUSuSBiqCsIM@metro.proxy.rlwy.net:36720/railway';

console.log('🌱 Seeding Railway PostgreSQL database...\n');
console.log('📍 Database:', process.env.DATABASE_URL.substring(0, 30) + '...\n');

try {
  // Run the seed script with the DATABASE_URL environment variable
  execSync('cd backend && npm run seed', {
    env: { ...process.env },
    stdio: 'inherit',
    maxBuffer: 10 * 1024 * 1024
  });

  console.log('\n✅ Railway database seeded successfully!');
} catch (error) {
  console.error('\n❌ Seeding failed:', error.message);
  process.exit(1);
}
