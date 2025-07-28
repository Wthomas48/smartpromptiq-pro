import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

interface UsageLimits {
  free: { daily: number; monthly: number };
  pro: { daily: number; monthly: number };
  enterprise: { daily: number; monthly: number };
}

interface ApiUsageRecord {
  userId: string;
  date: string;
  promptCount: number;
  tokenUsage: number;
  lastReset: Date;
}

export class ApiUsageController {
  private readonly USAGE_LIMITS: UsageLimits = {
    free: { daily: 3, monthly: 10 },
    pro: { daily: 100, monthly: 1000 },
    enterprise: { daily: 1000, monthly: 10000 }
  };

  private usageCache = new Map<string, ApiUsageRecord>();

  constructor() {
    // Reset daily counters at midnight
    this.startDailyReset();
  }

  async checkApiAccess(userId: string): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
    try {
      // Get user subscription tier
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        return { allowed: false, reason: "User not found" };
      }

      const tier = this.getUserTier(user);
      const limits = this.USAGE_LIMITS[tier];
      const usage = await this.getUserUsage(userId);

      // Check daily limit
      if (usage.promptCount >= limits.daily) {
        return { 
          allowed: false, 
          reason: `Daily limit reached (${limits.daily} prompts per day for ${tier} tier)`,
          remaining: 0
        };
      }

      return { 
        allowed: true, 
        remaining: limits.daily - usage.promptCount 
      };
    } catch (error) {
      console.error("Error checking API access:", error);
      return { allowed: false, reason: "Internal error" };
    }
  }

  async recordApiUsage(userId: string, tokenCount: number = 1): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const usage = await this.getUserUsage(userId);

      // Update usage record
      const updatedUsage: ApiUsageRecord = {
        userId,
        date: today,
        promptCount: usage.promptCount + 1,
        tokenUsage: usage.tokenUsage + tokenCount,
        lastReset: new Date()
      };

      // Update cache
      this.usageCache.set(userId, updatedUsage);

      // Store in database (you can implement persistent storage)
      await this.persistUsage(updatedUsage);

      console.log(`API usage recorded for user ${userId}: ${updatedUsage.promptCount} prompts today`);
    } catch (error) {
      console.error("Error recording API usage:", error);
    }
  }

  async getUserUsage(userId: string): Promise<ApiUsageRecord> {
    const today = new Date().toISOString().split('T')[0];
    
    // Check cache first
    const cached = this.usageCache.get(userId);
    if (cached && cached.date === today) {
      return cached;
    }

    // Initialize new daily usage record
    const usage: ApiUsageRecord = {
      userId,
      date: today,
      promptCount: 0,
      tokenUsage: 0,
      lastReset: new Date()
    };

    this.usageCache.set(userId, usage);
    return usage;
  }

  async getUsageStats(userId: string): Promise<{
    daily: { used: number; limit: number; remaining: number };
    monthly: { used: number; limit: number; remaining: number };
    tier: string;
  }> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        throw new Error("User not found");
      }

      const tier = this.getUserTier(user);
      const limits = this.USAGE_LIMITS[tier];
      const usage = await this.getUserUsage(userId);

      // Calculate monthly usage (simplified - you may want to implement proper monthly tracking)
      const monthlyUsed = usage.promptCount; // This would need proper monthly calculation

      return {
        daily: {
          used: usage.promptCount,
          limit: limits.daily,
          remaining: Math.max(0, limits.daily - usage.promptCount)
        },
        monthly: {
          used: monthlyUsed,
          limit: limits.monthly,
          remaining: Math.max(0, limits.monthly - monthlyUsed)
        },
        tier
      };
    } catch (error) {
      console.error("Error getting usage stats:", error);
      throw error;
    }
  }

  private getUserTier(user: any): keyof UsageLimits {
    // This would check the user's subscription status
    // For now, returning 'free' as default
    if (user.subscriptionTier) {
      return user.subscriptionTier as keyof UsageLimits;
    }
    return 'free';
  }

  private async persistUsage(usage: ApiUsageRecord): Promise<void> {
    // You can implement database storage here
    // For now, we're using in-memory cache
    // In production, you'd want to store this in a separate usage table
  }

  private startDailyReset(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.resetDailyUsage();
      // Set up daily reset interval
      setInterval(() => {
        this.resetDailyUsage();
      }, 24 * 60 * 60 * 1000); // 24 hours
    }, timeUntilMidnight);
  }

  private resetDailyUsage(): void {
    console.log("Resetting daily API usage counters");
    this.usageCache.clear();
  }

  async upgradeUserTier(userId: string, newTier: keyof UsageLimits): Promise<void> {
    try {
      // Update user's subscription tier in database
      await db.update(users)
        .set({ subscriptionTier: newTier })
        .where(eq(users.id, userId));

      console.log(`User ${userId} upgraded to ${newTier} tier`);
    } catch (error) {
      console.error("Error upgrading user tier:", error);
      throw error;
    }
  }

  // Method to check if prompt can be served from cache
  async shouldUseCache(userId: string): Promise<boolean> {
    const usage = await this.getUserUsage(userId);
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) return true; // Default to cache for unknown users

    const tier = this.getUserTier(user);
    const limits = this.USAGE_LIMITS[tier];

    // Use cache more aggressively for users approaching limits
    const usagePercent = usage.promptCount / limits.daily;
    
    if (tier === 'free' && usagePercent > 0.8) {
      return Math.random() < 0.7; // 70% chance to use cache
    }
    
    if (tier === 'pro' && usagePercent > 0.9) {
      return Math.random() < 0.5; // 50% chance to use cache
    }

    return Math.random() < 0.3; // 30% base chance to use cache
  }
}

export const apiUsageController = new ApiUsageController();