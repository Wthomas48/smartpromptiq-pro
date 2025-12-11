// Create admin user directly using PostgreSQL connection
const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function createAdmin() {
  const client = new Client({
    connectionString: 'postgresql://postgres:z4PU4HU0qL8o33fv@db.ycpvdoktcoejmywqfwwy.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Hash the password
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    // Check if admin already exists
    const checkQuery = 'SELECT * FROM "User" WHERE email = $1';
    const checkResult = await client.query(checkQuery, ['admin@admin.com']);

    if (checkResult.rows.length > 0) {
      // Update existing admin
      const updateQuery = `
        UPDATE "User"
        SET password = $1, role = $2, "subscriptionTier" = $3, plan = $4
        WHERE email = $5
        RETURNING id, email, role
      `;
      const result = await client.query(updateQuery, [
        hashedPassword,
        'ADMIN',
        'enterprise',
        'ENTERPRISE',
        'admin@admin.com'
      ]);

      console.log('✅ Admin user updated successfully!');
      console.log('📧 Email: admin@admin.com');
      console.log('🔑 Password: Admin123!');
      console.log('🔗 Login URL: http://localhost:5173/admin/login');
      console.log('👤 User ID:', result.rows[0].id);
    } else {
      // Create new admin
      const insertQuery = `
        INSERT INTO "User" (
          id, email, username, password, "firstName", "lastName",
          role, "subscriptionTier", "subscriptionStatus", plan,
          "tokenBalance", "generationsLimit", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, $5,
          $6, $7, $8, $9,
          $10, $11, NOW(), NOW()
        )
        RETURNING id, email, role
      `;

      const result = await client.query(insertQuery, [
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
        99999
      ]);

      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@admin.com');
      console.log('🔑 Password: Admin123!');
      console.log('🔗 Login URL: http://localhost:5173/admin/login');
      console.log('👤 User ID:', result.rows[0].id);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
  }
}

createAdmin();
