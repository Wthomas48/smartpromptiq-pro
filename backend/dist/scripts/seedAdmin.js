"use strict";
/**
 * Admin User Seed Script
 *
 * Creates the admin user for SmartPromptIQ admin dashboard
 *
 * Usage: npx ts-node src/scripts/seedAdmin.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Load environment variables
const envLocalPath = path_1.default.resolve(__dirname, '../../.env.local');
const envPath = path_1.default.resolve(__dirname, '../../.env');
dotenv_1.default.config({ path: envPath });
if (fs_1.default.existsSync(envLocalPath)) {
    dotenv_1.default.config({ path: envLocalPath, override: true });
}
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function seedAdmin() {
    const adminEmail = 'admin@smartpromptiq.net';
    const adminPassword = 'Admin123!';
    console.log('🔐 SmartPromptIQ Admin Seed Script');
    console.log('================================');
    try {
        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail }
        });
        if (existingAdmin) {
            console.log(`\n✅ Admin user already exists: ${adminEmail}`);
            // Check if role is ADMIN
            if (existingAdmin.role !== 'ADMIN') {
                console.log(`⚠️  Current role: ${existingAdmin.role}`);
                console.log('📝 Updating role to ADMIN...');
                await prisma.user.update({
                    where: { email: adminEmail },
                    data: { role: 'ADMIN' }
                });
                console.log('✅ Role updated to ADMIN');
            }
            else {
                console.log('✅ Role is already ADMIN');
            }
            // Update password to ensure it matches
            const hashedPassword = await bcryptjs_1.default.hash(adminPassword, 12);
            await prisma.user.update({
                where: { email: adminEmail },
                data: { password: hashedPassword }
            });
            console.log('✅ Password reset to: Admin123!');
        }
        else {
            console.log(`\n📝 Creating admin user: ${adminEmail}`);
            const hashedPassword = await bcryptjs_1.default.hash(adminPassword, 12);
            const admin = await prisma.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    firstName: 'Admin',
                    lastName: 'User',
                    role: 'ADMIN',
                    plan: 'ENTERPRISE',
                    subscriptionTier: 'ENTERPRISE',
                    tokenBalance: 999999,
                    generationsUsed: 0,
                    generationsLimit: 999999,
                    isActive: true
                }
            });
            console.log('✅ Admin user created successfully!');
            console.log(`   ID: ${admin.id}`);
            console.log(`   Email: ${admin.email}`);
            console.log(`   Role: ${admin.role}`);
        }
        console.log('\n================================');
        console.log('🎉 Admin setup complete!');
        console.log('\n📋 Login Credentials:');
        console.log(`   URL: http://localhost:5173/admin-login`);
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log('================================\n');
    }
    catch (error) {
        console.error('\n❌ Error seeding admin:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run the seed
seedAdmin()
    .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
