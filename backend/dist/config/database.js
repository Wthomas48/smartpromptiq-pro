"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ?? new client_1.PrismaClient();
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
// Connect to database
const connectDatabase = async () => {
    try {
        await exports.prisma.$connect();
        console.log('✅ Database connected successfully');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        console.log('⚠️ Continuing without database connection for development...');
    }
};
exports.connectDatabase = connectDatabase;
// Disconnect from database
const disconnectDatabase = async () => {
    await exports.prisma.$disconnect();
    console.log('📴 Database disconnected');
};
exports.disconnectDatabase = disconnectDatabase;
exports.default = exports.prisma;
