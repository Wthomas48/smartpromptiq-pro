#!/usr/bin/env node
/**
 * Production Admin User Setup Script
 *
 * This script creates admin users in the production PostgreSQL database.
 * It can be run on Railway or any PostgreSQL database.
 *
 * Usage:
 *   node setup-production-admin.cjs
 *
 * Or set DATABASE_URL environment variable:
 *   DATABASE_URL=postgresql://... node setup-production-admin.cjs
 */

const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function setupProductionAdmin() {
  // Get database URL from environment or use default Supabase URL
  const databaseUrl = process.env.DATABASE_URL ||
    'postgresql://postgres:z4PU4HU0qL8o33fv@db.ycpvdoktcoejmywqfwwy.supabase.co:5432/postgres';

  console.log('🚀 Setting up production admin users...');
  console.log('📍 Database:', databaseUrl.split('@')[1]?.split('/')[0] || 'Unknown');

  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('supabase.co') || databaseUrl.includes('railway.app')
      ? { rejectUnauthorized: false }
      : false
  });

  try {
    await client.connect();
    console.log('✅ Connected to production database');

    // Hash the password
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    console.log('🔐 Password hashed');

    // Admin users to create
    const admins = [
      {
        email: 'admin@admin.com',
        username: 'admin-local',
        firstName: 'Admin',
        lastName: 'Local'
      },
      {
        email: 'admin@smartpromptiq.net',
        username: 'admin-prod',
        firstName: 'Admin',
        lastName: 'Production'
      },
      {
        email: 'admin@smartpromptiq.com',
        username: 'admin-main',
        firstName: 'Admin',
        lastName: 'Main'
      }
    ];

    for (const admin of admins) {
      // Check if admin already exists
      const checkQuery = 'SELECT id, email, role FROM users WHERE email = $1';
      const checkResult = await client.query(checkQuery, [admin.email]);

      if (checkResult.rows.length > 0) {
        // Update existing admin
        const updateQuery = `
          UPDATE users
          SET password = $1,
              role = $2,
              "subscriptionTier" = $3,
              plan = $4,
              "tokenBalance" = $5,
              "generationsLimit" = $6,
              "subscriptionStatus" = $7,
              "isActive" = $8
          WHERE email = $9
          RETURNING id, email, role
        `;

        const result = await client.query(updateQuery, [
          hashedPassword,
          'ADMIN',
          'enterprise',
          'ENTERPRISE',
          99999,
          99999,
          'active',
          true,
          admin.email
        ]);

        console.log(`✅ Updated admin: ${admin.email} (ID: ${result.rows[0].id})`);
      } else {
        // Create new admin
        const insertQuery = `
          INSERT INTO users (
            id, email, username, password, "firstName", "lastName",
            role, "subscriptionTier", "subscriptionStatus", plan,
            "tokenBalance", "generationsLimit", "isActive",
            "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid()::text, $1, $2, $3, $4, $5,
            $6, $7, $8, $9,
            $10, $11, $12,
            NOW(), NOW()
          )
          RETURNING id, email, role
        `;

        const result = await client.query(insertQuery, [
          admin.email,
          admin.username,
          hashedPassword,
          admin.firstName,
          admin.lastName,
          'ADMIN',
          'enterprise',
          'active',
          'ENTERPRISE',
          99999,
          99999,
          true
        ]);

        console.log(`✅ Created admin: ${admin.email} (ID: ${result.rows[0].id})`);
      }
    }

    console.log('\n✅ All admin users configured successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('🔹 admin@admin.com');
    console.log('🔹 admin@smartpromptiq.net');
    console.log('🔹 admin@smartpromptiq.com');
    console.log('\n🔑 Password (all): Admin123!');
    console.log('\n🔗 Login URLs:');
    console.log('   Local:      http://localhost:5176/admin/login');
    console.log('   Production: https://smartpromptiq.com/admin/login');

    // Verify admin users
    const verifyQuery = 'SELECT id, email, role, "firstName", "lastName" FROM users WHERE role = $1 ORDER BY email';
    const verifyResult = await client.query(verifyQuery, ['ADMIN']);

    console.log('\n👥 All Admin Users in Database:');
    verifyResult.rows.forEach(user => {
      console.log(`   ${user.email} - ${user.firstName} ${user.lastName}`);
    });

  } catch (error) {
    console.error('\n❌ Error setting up admin users:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the setup
setupProductionAdmin()
  .then(() => {
    console.log('\n✨ Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
