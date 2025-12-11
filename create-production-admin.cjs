// Create admin user in production PostgreSQL database
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function createProductionAdmin() {
  const client = new Client({
    connectionString: 'postgresql://postgres:z4PU4HU0qL8o33fv@db.ycpvdoktcoejmywqfwwy.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to production database');

    // Hash the password
    const hashedPassword = await bcrypt.hashSync('Admin123!', 10);

    // Check if admin already exists
    const checkQuery = 'SELECT * FROM users WHERE email = $1';
    const checkResult = await client.query(checkQuery, ['admin@smartpromptiq.net']);

    if (checkResult.rows.length > 0) {
      // Update existing admin
      const updateQuery = `
        UPDATE users
        SET password = $1, role = $2, "subscriptionTier" = $3
        WHERE email = $4
        RETURNING id, email, role
      `;
      const result = await client.query(updateQuery, [
        hashedPassword,
        'ADMIN',
        'enterprise',
        'admin@smartpromptiq.net'
      ]);

      console.log('✅ Admin user updated successfully!');
      console.log('📧 Email: admin@smartpromptiq.net');
      console.log('🔑 Password: Admin123!');
      console.log('🌐 Production Login: https://smartpromptiq.com/admin/login');
      console.log('👤 User ID:', result.rows[0].id);
    } else {
      // Create new admin
      const insertQuery = `
        INSERT INTO users (
          id, email, username, password, "firstName", "lastName",
          role, "subscriptionTier", "subscriptionStatus",
          "tokenBalance", "generationsLimit", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, $5,
          $6, $7, $8,
          $9, $10, NOW(), NOW()
        )
        RETURNING id, email, role
      `;

      const result = await client.query(insertQuery, [
        'admin@smartpromptiq.net',
        'admin',
        hashedPassword,
        'Admin',
        'User',
        'ADMIN',
        'enterprise',
        'active',
        99999,
        99999
      ]);

      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@smartpromptiq.net');
      console.log('🔑 Password: Admin123!');
      console.log('🌐 Production Login: https://smartpromptiq.com/admin/login');
      console.log('👤 User ID:', result.rows[0].id);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
  }
}

createProductionAdmin();
