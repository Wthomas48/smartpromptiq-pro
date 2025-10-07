// examples/redisUsage.ts
// Usage examples for Redis caching utility

import {
  initializeRedis,
  cacheBlueprintData,
  getCachedBlueprintData,
  clearBlueprintCache,
  storeOnboardingProgress,
  getOnboardingState,
  clearOnboardingState,
  getCacheHealth,
  closeRedisConnection,
  type BlueprintData,
  type OnboardingState,
} from '../utils/redisCache';

// Example usage in your application
async function exampleUsage() {
  // Initialize Redis connection (call this once during app startup)
  const redisConnected = await initializeRedis();
  if (!redisConnected) {
    console.log('Redis not available, falling back to direct database queries');
    return;
  }

  // Example 1: Caching blueprint data
  const blueprintData: BlueprintData = {
    id: 'bp-123',
    title: 'E-commerce Marketing Strategy',
    content: 'Comprehensive marketing blueprint for online stores...',
    category: 'marketing',
    userId: 'user-456',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
    tags: ['e-commerce', 'marketing', 'strategy'],
    isPublic: true,
  };

  // Cache the blueprint (1-hour TTL)
  await cacheBlueprintData('bp-123', blueprintData);

  // Retrieve cached blueprint
  const cachedBlueprint = await getCachedBlueprintData('bp-123');
  if (cachedBlueprint) {
    console.log('Using cached blueprint:', cachedBlueprint.title);
    // Use cached data instead of querying Supabase
  } else {
    console.log('Cache miss, querying database...');
    // Fallback to Supabase query
  }

  // Example 2: Managing onboarding state
  const onboardingState: OnboardingState = {
    userId: 'user-456',
    currentStep: 3,
    completedSteps: ['welcome', 'profile-setup', 'first-blueprint'],
    preferences: {
      preferredCategories: ['marketing', 'business'],
      emailNotifications: true,
      dashboardLayout: 'grid',
    },
    lastActiveAt: new Date().toISOString(),
  };

  // Store onboarding progress (30-minute TTL)
  await storeOnboardingProgress('user-456', onboardingState);

  // Retrieve onboarding state
  const currentOnboarding = await getOnboardingState('user-456');
  if (currentOnboarding) {
    console.log(`User is on step ${currentOnboarding.currentStep}`);
    // Use cached onboarding state for faster dashboard loading
  } else {
    console.log('No cached onboarding state, using default');
    // Initialize default onboarding state
  }

  // Example 3: Manual cache management
  // Clear specific blueprint cache when updated
  await clearBlueprintCache('bp-123');

  // Clear onboarding state when user completes onboarding
  await clearOnboardingState('user-456');

  // Example 4: Health monitoring
  const health = await getCacheHealth();
  console.log('Redis health:', health);

  // Gracefully close connection when app shuts down
  process.on('SIGTERM', async () => {
    await closeRedisConnection();
    process.exit(0);
  });
}

// Example integration with your existing API routes
export async function getBlueprintWithCache(blueprintId: string) {
  try {
    // Try cache first
    const cached = await getCachedBlueprintData(blueprintId);
    if (cached) {
      return { data: cached, source: 'cache' };
    }

    // Cache miss - query Supabase
    console.log('Cache miss, querying Supabase for blueprint:', blueprintId);

    // Simulate Supabase query (replace with your actual Supabase call)
    const freshData = await querySupabaseForBlueprint(blueprintId);

    // Cache the fresh data for next time
    if (freshData) {
      await cacheBlueprintData(blueprintId, freshData);
    }

    return { data: freshData, source: 'database' };
  } catch (error) {
    console.error('Error fetching blueprint:', error);
    return { data: null, source: 'error' };
  }
}

// Example onboarding progress API with caching
export async function getOnboardingWithCache(userId: string) {
  try {
    // Try cache first
    const cached = await getOnboardingState(userId);
    if (cached) {
      return { data: cached, source: 'cache' };
    }

    // Cache miss - query Supabase
    console.log('Cache miss, querying Supabase for onboarding:', userId);

    // Simulate Supabase query (replace with your actual Supabase call)
    const freshData = await querySupabaseForOnboarding(userId);

    // Cache the fresh data for next time
    if (freshData) {
      await storeOnboardingProgress(userId, freshData);
    }

    return { data: freshData, source: 'database' };
  } catch (error) {
    console.error('Error fetching onboarding state:', error);
    return { data: null, source: 'error' };
  }
}

// Mock functions - replace with your actual Supabase queries
async function querySupabaseForBlueprint(blueprintId: string): Promise<BlueprintData | null> {
  // Replace with actual Supabase query
  // const { data, error } = await supabase
  //   .from('blueprints')
  //   .select('*')
  //   .eq('id', blueprintId)
  //   .single();

  console.log('Querying Supabase for blueprint:', blueprintId);
  return null; // Placeholder
}

async function querySupabaseForOnboarding(userId: string): Promise<OnboardingState | null> {
  // Replace with actual Supabase query
  // const { data, error } = await supabase
  //   .from('onboarding_states')
  //   .select('*')
  //   .eq('user_id', userId)
  //   .single();

  console.log('Querying Supabase for onboarding:', userId);
  return null; // Placeholder
}

// Run example if this file is executed directly
if (require.main === module) {
  exampleUsage().catch(console.error);
}