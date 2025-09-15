"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function hashPassword(password) {
    const saltRounds = 12;
    return await bcryptjs_1.default.hash(password, saltRounds);
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
    // Create demo user
    const demoPassword = await hashPassword('Demo123!');
    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@example.com' },
        update: {},
        create: {
            email: 'demo@example.com',
            password: demoPassword,
            firstName: 'Demo',
            lastName: 'User',
            role: 'USER',
            plan: 'PRO',
            generationsLimit: 500
        }
    });
    console.log('✅ Database seeded successfully!');
    console.log('🔑 Admin user: admin@example.com / Admin123!');
    console.log('🔑 Demo user: demo@example.com / Demo123!');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map