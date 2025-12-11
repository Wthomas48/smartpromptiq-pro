// Create admin user directly in SQLite database
const sqlite3 = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');
const { randomUUID } = require('crypto');

async function createAdmin() {
  const dbPath = path.join(__dirname, 'backend', 'prisma', 'dev.db');
  console.log('📍 Database path:', dbPath);

  const db = sqlite3(dbPath);

  try {
    console.log('✅ Connected to database');

    // Hash the password
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    // Check if admin already exists
    const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@admin.com');

    if (existingAdmin) {
      // Update existing admin
      const updateStmt = db.prepare(`
        UPDATE users
        SET password = ?, role = ?, subscriptionTier = ?, plan = ?
        WHERE email = ?
      `);

      updateStmt.run(hashedPassword, 'ADMIN', 'enterprise', 'ENTERPRISE', 'admin@admin.com');

      console.log('✅ Admin user updated successfully!');
      console.log('📧 Email: admin@admin.com');
      console.log('🔑 Password: Admin123!');
      console.log('🔗 Login URL: http://localhost:5176/admin/login');
      console.log('👤 User ID:', existingAdmin.id);
    } else {
      // Create new admin
      const userId = randomUUID();
      const now = new Date().toISOString();

      const insertStmt = db.prepare(`
        INSERT INTO users (
          id, email, username, password, firstName, lastName,
          role, subscriptionTier, subscriptionStatus, plan,
          tokenBalance, generationsLimit, createdAt, updatedAt, isActive
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?
        )
      `);

      insertStmt.run(
        userId,
        'admin@admin.com',
        'admin',
        hashedPassword,
        'Admin',
        'User',
        'ADMIN',
        'enterprise',
        'active',
        'ENTERPRISE',
        99999,
        99999,
        now,
        now,
        1
      );

      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@admin.com');
      console.log('🔑 Password: Admin123!');
      console.log('🔗 Login URL: http://localhost:5176/admin/login');
      console.log('👤 User ID:', userId);
    }

    // Verify the admin user exists
    const adminUser = db.prepare('SELECT id, email, role, firstName, lastName FROM users WHERE email = ?').get('admin@admin.com');
    console.log('\n✅ Admin user verified in database:');
    console.log(adminUser);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    db.close();
  }
}

createAdmin();
