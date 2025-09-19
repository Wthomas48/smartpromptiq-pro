import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await hashPassword('Admin123!');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      plan: 'ENTERPRISE',
      generationsLimit: 10000
    }
  });

  // Create test user for development
  const testPassword = await hashPassword('Test123!');
  const testUser = await prisma.user.upsert({
    where: { email: 'test@smartpromptiq.com' },
    update: {},
    create: {
      email: 'test@smartpromptiq.com',
      password: testPassword,
      firstName: 'Alex',
      lastName: 'Johnson',
      role: 'USER',
      plan: 'PRO',
      generationsLimit: 1000
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log('🔑 Admin user: admin@example.com / Admin123!');
  console.log('🔑 Test user: test@smartpromptiq.com / Test123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });