// utils/redisCache.ts
import { createClient, RedisClientType } from 'redis';

// Types for our data structures
interface BlueprintData {
  id: string;
  title: string;
  content: string;
  category: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // Allow additional properties
}

interface OnboardingState {
  userId: string;
  currentStep: number;
  completedSteps: string[];
  preferences: Record<string, any>;
  lastActiveAt: string;
}

// Redis client instance
let redisClient: RedisClientType | null = null;

// Key prefixes for namespace separation
const PREFIXES = {
  BLUEPRINT: 'blueprint:',
  ONBOARDING: 'onboarding:',
} as const;

// TTL values in seconds
const TTL = {
  BLUEPRINT: 60 * 60, // 1 hour
  ONBOARDING: 30 * 60, // 30 minutes
} as const;

/**
 * Initialize Redis connection using Redis Cloud credentials
 * @returns Promise<boolean> - true if connection successful, false otherwise
 */
export async function initializeRedis(): Promise<boolean> {
  try {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      console.error('❌ Redis: REDIS_URL environment variable not found');
      return false;
    }

    // Create Redis client with connection options
    redisClient = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000, // 5 seconds
        lazyConnect: true,
        reconnectStrategy: (retries) => {
          // Exponential backoff with max delay of 30 seconds
          const delay = Math.min(retries * 100, 30000);
          console.log(`🔄 Redis: Reconnection attempt ${retries}, waiting ${delay}ms`);
          return delay;
        },
      },
    });

    // Set up error event handlers
    redisClient.on('error', (error) => {
      console.error('❌ Redis connection error:', error.message);
    });

    redisClient.on('connect', () => {
      console.log('🔗 Redis: Connection established');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis: Client ready for operations');
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis: Attempting to reconnect...');
    });

    redisClient.on('end', () => {
      console.log('📴 Redis: Connection closed');
    });

    // Connect to Redis
    await redisClient.connect();

    // Test the connection with a ping
    const pong = await redisClient.ping();
    if (pong === 'PONG') {
      console.log('🏓 Redis: Connection test successful');
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Redis initialization failed:', error);
    redisClient = null;
    return false;
  }
}

/**
 * Get Redis client instance, initialize if not connected
 * @returns Promise<RedisClientType | null>
 */
async function getRedisClient(): Promise<RedisClientType | null> {
  if (!redisClient) {
    const initialized = await initializeRedis();
    if (!initialized) {
      return null;
    }
  }

  // Check if client is ready
  if (redisClient && !redisClient.isReady) {
    try {
      await redisClient.connect();
    } catch (error) {
      console.error('❌ Redis: Failed to reconnect:', error);
      return null;
    }
  }

  return redisClient;
}

/**
 * Cache blueprint data by ID with 1-hour TTL
 * @param blueprintId - Unique blueprint identifier
 * @param data - Blueprint data to cache
 * @returns Promise<boolean> - true if cached successfully
 */
export async function cacheBlueprintData(
  blueprintId: string,
  data: BlueprintData
): Promise<boolean> {
  try {
    const client = await getRedisClient();
    if (!client) {
      console.warn('⚠️ Redis: Client not available, skipping cache');
      return false;
    }

    const key = `${PREFIXES.BLUEPRINT}${blueprintId}`;
    const serializedData = JSON.stringify({
      ...data,
      cachedAt: new Date().toISOString(),
    });

    // Set with TTL
    await client.setEx(key, TTL.BLUEPRINT, serializedData);

    console.log(`📦 Redis: Blueprint cached - ID: ${blueprintId}`);
    return true;
  } catch (error) {
    console.error('❌ Redis: Failed to cache blueprint data:', error);
    return false;
  }
}

/**
 * Retrieve cached blueprint data by ID
 * @param blueprintId - Unique blueprint identifier
 * @returns Promise<BlueprintData | null> - Blueprint data or null if not found
 */
export async function getCachedBlueprintData(
  blueprintId: string
): Promise<BlueprintData | null> {
  try {
    const client = await getRedisClient();
    if (!client) {
      console.warn('⚠️ Redis: Client not available, skipping cache lookup');
      return null;
    }

    const key = `${PREFIXES.BLUEPRINT}${blueprintId}`;
    const cachedData = await client.get(key);

    if (!cachedData) {
      console.log(`📭 Redis: Blueprint cache miss - ID: ${blueprintId}`);
      return null;
    }

    const parsedData = JSON.parse(cachedData) as BlueprintData & { cachedAt: string };
    console.log(`📫 Redis: Blueprint cache hit - ID: ${blueprintId}`);

    // Remove the cachedAt timestamp before returning
    const { cachedAt, ...blueprintData } = parsedData;
    return blueprintData as BlueprintData;
  } catch (error) {
    console.error('❌ Redis: Failed to retrieve blueprint data:', error);
    return null;
  }
}

/**
 * Store onboarding progress per user with 30-minute TTL
 * @param userId - Unique user identifier
 * @param state - Onboarding state data
 * @returns Promise<boolean> - true if stored successfully
 */
export async function storeOnboardingProgress(
  userId: string,
  state: OnboardingState
): Promise<boolean> {
  try {
    const client = await getRedisClient();
    if (!client) {
      console.warn('⚠️ Redis: Client not available, skipping onboarding cache');
      return false;
    }

    const key = `${PREFIXES.ONBOARDING}${userId}`;
    const serializedState = JSON.stringify({
      ...state,
      cachedAt: new Date().toISOString(),
    });

    // Set with TTL
    await client.setEx(key, TTL.ONBOARDING, serializedState);

    console.log(`👤 Redis: Onboarding state cached - User: ${userId}, Step: ${state.currentStep}`);
    return true;
  } catch (error) {
    console.error('❌ Redis: Failed to store onboarding progress:', error);
    return false;
  }
}

/**
 * Retrieve onboarding state for a user
 * @param userId - Unique user identifier
 * @returns Promise<OnboardingState | null> - Onboarding state or null if not found
 */
export async function getOnboardingState(
  userId: string
): Promise<OnboardingState | null> {
  try {
    const client = await getRedisClient();
    if (!client) {
      console.warn('⚠️ Redis: Client not available, skipping onboarding lookup');
      return null;
    }

    const key = `${PREFIXES.ONBOARDING}${userId}`;
    const cachedState = await client.get(key);

    if (!cachedState) {
      console.log(`👥 Redis: Onboarding cache miss - User: ${userId}`);
      return null;
    }

    const parsedState = JSON.parse(cachedState) as OnboardingState & { cachedAt: string };
    console.log(`👤 Redis: Onboarding cache hit - User: ${userId}, Step: ${parsedState.currentStep}`);

    // Remove the cachedAt timestamp before returning
    const { cachedAt, ...onboardingState } = parsedState;
    return onboardingState as OnboardingState;
  } catch (error) {
    console.error('❌ Redis: Failed to retrieve onboarding state:', error);
    return null;
  }
}

/**
 * BONUS: Clear blueprint cache manually by ID
 * @param blueprintId - Unique blueprint identifier
 * @returns Promise<boolean> - true if cleared successfully
 */
export async function clearBlueprintCache(blueprintId: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    if (!client) {
      console.warn('⚠️ Redis: Client not available, skipping cache clear');
      return false;
    }

    const key = `${PREFIXES.BLUEPRINT}${blueprintId}`;
    const result = await client.del(key);

    if (result === 1) {
      console.log(`🗑️ Redis: Blueprint cache cleared - ID: ${blueprintId}`);
      return true;
    } else {
      console.log(`📭 Redis: Blueprint cache not found for clearing - ID: ${blueprintId}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Redis: Failed to clear blueprint cache:', error);
    return false;
  }
}

/**
 * BONUS: Clear onboarding state manually by user ID
 * @param userId - Unique user identifier
 * @returns Promise<boolean> - true if cleared successfully
 */
export async function clearOnboardingState(userId: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    if (!client) {
      console.warn('⚠️ Redis: Client not available, skipping onboarding clear');
      return false;
    }

    const key = `${PREFIXES.ONBOARDING}${userId}`;
    const result = await client.del(key);

    if (result === 1) {
      console.log(`🗑️ Redis: Onboarding state cleared - User: ${userId}`);
      return true;
    } else {
      console.log(`👥 Redis: Onboarding state not found for clearing - User: ${userId}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Redis: Failed to clear onboarding state:', error);
    return false;
  }
}

/**
 * Get cache statistics and health information
 * @returns Promise<object> - Redis connection info and cache stats
 */
export async function getCacheHealth(): Promise<{
  connected: boolean;
  keyCount?: number;
  memoryUsage?: string;
  uptime?: number;
}> {
  try {
    const client = await getRedisClient();
    if (!client || !client.isReady) {
      return { connected: false };
    }

    // Get basic Redis info
    const info = await client.info('memory');
    const keyCount = await client.dbSize();

    // Parse memory usage from info string
    const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
    const memoryUsage = memoryMatch ? memoryMatch[1].trim() : 'Unknown';

    console.log('📊 Redis: Cache health check completed');

    return {
      connected: true,
      keyCount,
      memoryUsage,
      uptime: Date.now(), // Simplified - could parse actual uptime from info
    };
  } catch (error) {
    console.error('❌ Redis: Health check failed:', error);
    return { connected: false };
  }
}

/**
 * Gracefully close Redis connection
 * @returns Promise<void>
 */
export async function closeRedisConnection(): Promise<void> {
  try {
    if (redisClient && redisClient.isReady) {
      await redisClient.quit();
      console.log('👋 Redis: Connection closed gracefully');
    }
  } catch (error) {
    console.error('❌ Redis: Error closing connection:', error);
  } finally {
    redisClient = null;
  }
}

// Export types for use in other modules
export type { BlueprintData, OnboardingState };

// Export constants for external use
export { PREFIXES, TTL };