import { LRUCache } from "lru-cache";

// AI response cache to reduce API costs
const aiCache = new LRUCache<string, any>({
 max: 1000, // Maximum 1000 cached responses
 ttl: 1000 * 60 * 60 * 24, // 24 hours TTL
 sizeCalculation: (value, key) => {
   return JSON.stringify(value).length + key.length;
 },
 maxSize: 1024 * 1024 * 10, // 10MB max cache size
});

// User session cache for frequently accessed data
const userCache = new LRUCache<string, any>({
 max: 500,
 ttl: 1000 * 60 * 15, // 15 minutes TTL
});

// Template cache for popular templates
const templateCache = new LRUCache<string, any>({
 max: 200,
 ttl: 1000 * 60 * 60 * 4, // 4 hours TTL
});

// Generate cache key for AI prompts
export function generateAICacheKey(
 category: string,
 answers: Record<string, any>,
 customization: Record<string, any> = {}
): string {
 const normalizedAnswers = Object.keys(answers)
   .sort()
   .reduce((acc, key) => {
     acc[key] = answers[key];
     return acc;
   }, {} as Record<string, any>);

 const cacheInput = {
   category,
   answers: normalizedAnswers,
   customization,
 };

 return `ai:${Buffer.from(JSON.stringify(cacheInput)).toString("base64")}`;
}

// Generate cache key for refinement
export function generateRefinementCacheKey(
 currentPrompt: string,
 refinementQuery: string,
 category: string
): string {
 const cacheInput = {
   prompt: currentPrompt.slice(0, 200), // First 200 chars to avoid huge keys
   query: refinementQuery,
   category,
 };

 return `refine:${Buffer.from(JSON.stringify(cacheInput)).toString("base64")}`;
}

// AI Cache operations
export const AICache = {
 get: (key: string) => aiCache.get(key),
 set: (key: string, value: any) => aiCache.set(key, value),
 has: (key: string) => aiCache.has(key),
 clear: () => aiCache.clear(),
 size: () => aiCache.size,
};

// User Cache operations
export const UserCache = {
 get: (key: string) => userCache.get(key),
 set: (key: string, value: any) => userCache.set(key, value),
 has: (key: string) => userCache.has(key),
 delete: (key: string) => userCache.delete(key),
 getUserKey: (userId: string, dataType: string) => `user:${userId}:${dataType}`,
};

// Template Cache operations
export const TemplateCache = {
 get: (key: string) => templateCache.get(key),
 set: (key: string, value: any) => templateCache.set(key, value),
 has: (key: string) => templateCache.has(key),
 clear: () => templateCache.clear(),
 getPopularTemplatesKey: () => "templates:popular",
 getCategoryTemplatesKey: (category: string) => `templates:category:${category}`,
};

// Cache statistics for monitoring
export function getCacheStats() {
 return {
   ai: {
     size: aiCache.size,
     calculatedSize: aiCache.calculatedSize,
     hitRate: aiCache.calculatedSize > 0 ? (aiCache.size / aiCache.calculatedSize) : 0,
   },
   user: {
     size: userCache.size,
     calculatedSize: userCache.calculatedSize,
   },
   template: {
     size: templateCache.size,
     calculatedSize: templateCache.calculatedSize,
   },
 };
}

// Warm up cache with popular templates and common queries
export async function warmUpCache() {
 // This would be called on server startup to pre-populate cache
 console.log("Cache warming initiated...");
 
 // Add popular prompt patterns to cache
 const popularPatterns = [
   { category: "business", type: "marketing_email" },
   { category: "creative", type: "story_prompt" },
   { category: "technical", type: "code_documentation" },
 ];

 // Pre-cache common responses (would integrate with actual AI service)
 for (const pattern of popularPatterns) {
   const cacheKey = `popular:${pattern.category}:${pattern.type}`;
   // Would populate with actual AI responses in production
 }

 console.log("Cache warming completed");
}

// Cache invalidation strategies
export function invalidateUserCache(userId: string) {
 const keysToDelete: string[] = [];
 userCache.forEach((value, key) => {
   if (key.startsWith(`user:${userId}:`)) {
     keysToDelete.push(key);
   }
 });
 keysToDelete.forEach(key => userCache.delete(key));
}

export function invalidateTemplateCache() {
 templateCache.clear();
}

// Intelligent cache preloading based on user behavior
export function preloadUserCache(userId: string, recentCategories: string[]) {
 // Pre-load user's subscription data
 const userKey = UserCache.getUserKey(userId, "subscription");
 
 // Pre-load templates for categories the user frequently uses
 recentCategories.forEach(category => {
   const templateKey = TemplateCache.getCategoryTemplatesKey(category);
   // Would fetch and cache popular templates for this category
 });
}