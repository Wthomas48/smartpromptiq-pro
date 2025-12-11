const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@admin.com' },
      update: {
        password: hashedPassword,
        role: 'ADMIN'
      },
      create: {
        email: 'admin@admin.com',
        username: 'admin',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        subscriptionTier: 'enterprise',
        subscriptionStatus: 'active',
        generationsLimit: 99999
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@admin.com');
    console.log('🔑 Password: Admin123!');
    console.log('🔗 Login URL: http://localhost:5173/admin/login');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();