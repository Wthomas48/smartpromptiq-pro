/**
 * Admin User Seed Script
 * Run with: npx ts-node scripts/seed-admin.ts
 * Or: npm run seed:admin
 */

import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdmin() {
  console.log('🌱 Starting admin seed...\n');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@smartpromptiq.net';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminLocal123!';

  console.log(`📧 Admin email: ${adminEmail}`);
  console.log(`🔐 Password length: ${adminPassword.length} characters\n`);

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');

    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    if (existingAdmin) {
      // Update existing admin
      const updated = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          role: 'ADMIN',
          password: hashedPassword,
          plan: 'ENTERPRISE',
          subscriptionTier: 'enterprise',
          subscriptionStatus: 'active',
          tokenBalance: 999999,
          isActive: true
        }
      });

      console.log('✅ Admin user UPDATED:');
      console.log(`   ID: ${updated.id}`);
      console.log(`   Email: ${updated.email}`);
      console.log(`   Role: ${updated.role}`);
      console.log(`   Plan: ${updated.plan}`);
    } else {
      // Create new admin
      const created = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          plan: 'ENTERPRISE',
          subscriptionTier: 'enterprise',
          subscriptionStatus: 'active',
          tokenBalance: 999999,
          generationsUsed: 0,
          generationsLimit: 999999,
          isActive: true
        }
      });

      console.log('✅ Admin user CREATED:');
      console.log(`   ID: ${created.id}`);
      console.log(`   Email: ${created.email}`);
      console.log(`   Role: ${created.role}`);
      console.log(`   Plan: ${created.plan}`);
    }

    console.log('\n🎉 Admin seed completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n🔗 Admin login URL: http://localhost:5173/admin/login');

  } catch (error: any) {
    console.error('\n❌ Seed failed:', error.message);

    if (error.code === 'P1001') {
      console.error('\n💡 Database connection failed. Check your DATABASE_URL in .env');
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
