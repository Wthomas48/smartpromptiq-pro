"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = exports.prisma = void 0;
const client_1 = require("@prisma/client");
/**
 * Global Prisma Client Singleton
 *
 * IMPORTANT: All files should import from this module instead of creating
 * their own PrismaClient instances. Multiple instances cause:
 * - Excessive database connections
 * - Connection pool exhaustion
 * - "bursts of 3" connection errors
 *
 * Usage:
 *   import { prisma } from '@/config/database';
 *   // or
 *   import prisma from '@/config/database';
 */
const globalForPrisma = globalThis;
// Create client with proper pool settings for Supabase/PgBouncer
exports.prisma = globalForPrisma.prisma ?? new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
    // Connection pool settings optimized for Supabase pooler
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});
// Prevent multiple instances in development (hot reload)
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
// Connect to database with retry logic
const connectDatabase = async (retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await exports.prisma.$connect();
            console.log('✅ Database connected successfully');
            return true;
        }
        catch (error) {
            console.error(`❌ Database connection attempt ${attempt}/${retries} failed:`, error.message);
            if (attempt < retries) {
                console.log(`⏳ Retrying in ${attempt * 2} seconds...`);
                await new Promise(resolve => setTimeout(resolve, attempt * 2000));
            }
        }
    }
    console.log('⚠️ Continuing without database connection for development...');
    return false;
};
exports.connectDatabase = connectDatabase;
// Disconnect from database
const disconnectDatabase = async () => {
    await exports.prisma.$disconnect();
    console.log('📴 Database disconnected');
};
exports.disconnectDatabase = disconnectDatabase;
// Graceful shutdown handler
const shutdownHandler = async () => {
    console.log('🔄 Graceful shutdown initiated...');
    await (0, exports.disconnectDatabase)();
    process.exit(0);
};
process.on('SIGINT', shutdownHandler);
process.on('SIGTERM', shutdownHandler);
exports.default = exports.prisma;
