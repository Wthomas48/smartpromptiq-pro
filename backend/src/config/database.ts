import { PrismaClient } from '@prisma/client';

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

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create client with proper pool settings for Supabase/PgBouncer
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
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
  globalForPrisma.prisma = prisma;
}

// Connect to database with retry logic
export const connectDatabase = async (retries = 3): Promise<boolean> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
      return true;
    } catch (error: any) {
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

// Disconnect from database
export const disconnectDatabase = async () => {
  await prisma.$disconnect();
  console.log('📴 Database disconnected');
};

// Graceful shutdown handler
const shutdownHandler = async () => {
  console.log('🔄 Graceful shutdown initiated...');
  await disconnectDatabase();
  process.exit(0);
};

process.on('SIGINT', shutdownHandler);
process.on('SIGTERM', shutdownHandler);

export default prisma;
