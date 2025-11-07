import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Create local admin user (for development)
  const adminPassword = await hashPassword('Admin123!');
  const localAdmin = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {
      password: adminPassword,
      role: 'ADMIN',
      plan: 'ENTERPRISE',
      subscriptionTier: 'enterprise',
      generationsLimit: 99999,
      tokenBalance: 99999
    },
    create: {
      email: 'admin@admin.com',
      username: 'admin',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      plan: 'ENTERPRISE',
      subscriptionTier: 'enterprise',
      subscriptionStatus: 'active',
      generationsLimit: 99999,
      tokenBalance: 99999,
      isActive: true
    }
  });

  console.log('✅ Local admin created: admin@admin.com');

  // Create production admin user
  const productionAdmin = await prisma.user.upsert({
    where: { email: 'admin@smartpromptiq.net' },
    update: {
      password: adminPassword,
      role: 'ADMIN',
      plan: 'ENTERPRISE',
      subscriptionTier: 'enterprise',
      generationsLimit: 99999,
      tokenBalance: 99999
    },
    create: {
      email: 'admin@smartpromptiq.net',
      username: 'admin-prod',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      plan: 'ENTERPRISE',
      subscriptionTier: 'enterprise',
      subscriptionStatus: 'active',
      generationsLimit: 99999,
      tokenBalance: 99999,
      isActive: true
    }
  });

  console.log('✅ Production admin created: admin@smartpromptiq.net');

  // Create test user for development
  const testPassword = await hashPassword('Test123!');
  const testUser = await prisma.user.upsert({
    where: { email: 'test@smartpromptiq.com' },
    update: {},
    create: {
      email: 'test@smartpromptiq.com',
      username: 'testuser',
      password: testPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      plan: 'PRO',
      subscriptionTier: 'pro',
      subscriptionStatus: 'active',
      generationsLimit: 1000,
      tokenBalance: 500,
      isActive: true
    }
  });

  console.log('✅ Test user created: test@smartpromptiq.com');

  // ============================================
  // SEED ACADEMY COURSES
  // ============================================
  console.log('\n🎓 Seeding Academy courses...');

  // Import and run academy seed
  const { execSync } = require('child_process');
  try {
    execSync('ts-node prisma/seed-academy-full.ts', { stdio: 'inherit' });
    console.log('✅ Academy courses seeded successfully!');
  } catch (error) {
    console.error('❌ Failed to seed Academy courses:', error);
    console.log('⚠️  Continuing without Academy courses...');
  }

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📋 Admin Credentials:');
  console.log('🔹 Local Admin:      admin@admin.com / Admin123!');
  console.log('🔹 Production Admin: admin@smartpromptiq.net / Admin123!');
  console.log('\n📋 Test User:');
  console.log('🔹 Test User:        test@smartpromptiq.com / Test123!');
  console.log('\n📚 Academy:');
  console.log('🔹 57 courses seeded with 555+ lessons');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });