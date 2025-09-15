const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testUser() {
  try {
    // Find the admin user
    const user = await prisma.user.findUnique({
      where: { email: 'admin@admin.com' }
    });

    console.log('Admin user found:', user ? 'Yes' : 'No');

    if (user) {
      console.log('User details:', {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0
      });

      // Test password comparison
      const isPasswordValid = await bcrypt.compare('Admin123!', user.password);
      console.log('Password valid for Admin123!:', isPasswordValid);

      // Also try other variations
      const testPasswords = ['admin', 'Admin123', 'admin123', 'password', '123456'];
      for (const testPass of testPasswords) {
        const isValid = await bcrypt.compare(testPass, user.password);
        if (isValid) {
          console.log(`Password "${testPass}" is valid!`);
        }
      }
    } else {
      console.log('No admin user found, creating one...');

      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      const newUser = await prisma.user.create({
        data: {
          email: 'admin@admin.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN'
        }
      });

      console.log('Created admin user:', newUser);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUser();