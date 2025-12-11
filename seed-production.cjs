/**
 * Seed Production Database on Railway
 *
 * This script seeds the production database with:
 * - Admin users
 * - 57 Academy courses
 * - 555+ lessons
 *
 * Run this ONCE after deploying to Railway:
 * node seed-production.cjs
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function seedProduction() {
  console.log('🌱 Starting production database seed...\n');

  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
      console.log('💡 Make sure you\'re running this on Railway or have .env configured');
      process.exit(1);
    }

    console.log('✅ DATABASE_URL found');
    console.log('📍 Database:', process.env.DATABASE_URL.substring(0, 30) + '...\n');

    // Run the backend seed script
    console.log('🎬 Running seed script...\n');
    const { stdout, stderr } = await execPromise('cd backend && npm run seed', {
      env: { ...process.env },
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });

    console.log(stdout);
    if (stderr && !stderr.includes('Warning')) {
      console.error('⚠️ Warnings:', stderr);
    }

    console.log('\n✅ Production database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log('  ✓ Admin users created');
    console.log('  ✓ 57 Academy courses');
    console.log('  ✓ 555+ lessons');
    console.log('  ✓ Test data');
    console.log('\n🚀 Your Academy is now live!');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);

    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Database connection refused. Check:');
      console.log('  1. DATABASE_URL is correct');
      console.log('  2. Database is running');
      console.log('  3. Firewall/network allows connection');
    }

    if (error.message.includes('Permission denied')) {
      console.log('\n💡 Permission error. Make sure:');
      console.log('  1. Database user has write permissions');
      console.log('  2. Tables can be created');
    }

    process.exit(1);
  }
}

// Run the seed
seedProduction();
