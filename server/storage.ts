import {
  users,
  prompts,
  subscriptionTiers,
  tokenPurchases,
  tokenUsage,
  type User,
  type UpsertUser,
  type Prompt,
  type InsertPrompt,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, or, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Prompt operations
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  getPromptsByUserId(userId: string, filters?: {
    category?: string;
    search?: string;
    favorites?: boolean;
  }): Promise<Prompt[]>;
  getPromptById(id: number, userId: string): Promise<Prompt | undefined>;
  updatePrompt(id: number, userId: string, updates: Partial<InsertPrompt>): Promise<Prompt | undefined>;
  deletePrompt(id: number, userId: string): Promise<boolean>;
  toggleFavorite(id: number, userId: string): Promise<boolean>;
  incrementUsage(id: number, userId: string): Promise<void>;
  getUserStats(userId: string): Promise<{
    totalPrompts: number;
    favorites: number;
    usesThisMonth: number;
  }>;

  // Team collaboration operations
  getUserTeams(userId: string): Promise<any[]>;
  createTeam(team: any): Promise<any>;
  getTeamMembers(teamId: number): Promise<any[]>;

  // Template operations
  getTemplates(userId: string, filters?: {
    search?: string;
    category?: string;
  }): Promise<any[]>;
  createTemplate(template: any): Promise<any>;
  deleteTemplate(templateId: number, userId: string): Promise<void>;

  // Billing and subscription operations
  getUserSubscription(userId: string): Promise<any>;
  updateUserSubscription(userId: string, subscriptionData: any): Promise<any>;
  deductTokens(userId: string, tokenAmount: number): Promise<boolean>;
  addTokens(userId: string, tokenAmount: number): Promise<void>;
  recordTokenUsage(usage: any): Promise<void>;
  getSubscriptionTiers(): Promise<any[]>;
  createTokenPurchase(purchase: any): Promise<any>;
  updateTokenPurchaseStatus(purchaseId: number, status: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Prompt operations
  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    const [newPrompt] = await db
      .insert(prompts)
      .values(prompt)
      .returning();
    return newPrompt;
  }

  async getPromptsByUserId(userId: string, filters?: {
    category?: string;
    search?: string;
    favorites?: boolean;
  }): Promise<Prompt[]> {
    let query = db.select().from(prompts).where(eq(prompts.userId, userId));

    const conditions = [eq(prompts.userId, userId)];

    if (filters?.category) {
      conditions.push(eq(prompts.category, filters.category));
    }

    if (filters?.search) {
      conditions.push(
        or(
          ilike(prompts.title, `%${filters.search}%`),
          ilike(prompts.content, `%${filters.search}%`)
        )!
      );
    }

    if (filters?.favorites) {
      conditions.push(eq(prompts.isFavorite, true));
    }

    return await db
      .select()
      .from(prompts)
      .where(and(...conditions))
      .orderBy(desc(prompts.createdAt));
  }

  async getPromptById(id: number, userId: string): Promise<Prompt | undefined> {
    const [prompt] = await db
      .select()
      .from(prompts)
      .where(and(eq(prompts.id, id), eq(prompts.userId, userId)));
    return prompt;
  }

  async updatePrompt(id: number, userId: string, updates: Partial<InsertPrompt>): Promise<Prompt | undefined> {
    const [prompt] = await db
      .update(prompts)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(prompts.id, id), eq(prompts.userId, userId)))
      .returning();
    return prompt;
  }

  async deletePrompt(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(prompts)
      .where(and(eq(prompts.id, id), eq(prompts.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async toggleFavorite(id: number, userId: string): Promise<boolean> {
    const prompt = await this.getPromptById(id, userId);
    if (!prompt) return false;

    await db
      .update(prompts)
      .set({ isFavorite: !prompt.isFavorite, updatedAt: new Date() })
      .where(and(eq(prompts.id, id), eq(prompts.userId, userId)));
    
    return true;
  }

  async incrementUsage(id: number, userId: string): Promise<void> {
    const prompt = await this.getPromptById(id, userId);
    if (!prompt) return;

    await db
      .update(prompts)
      .set({ 
        usageCount: (prompt.usageCount || 0) + 1,
        updatedAt: new Date() 
      })
      .where(and(eq(prompts.id, id), eq(prompts.userId, userId)));
  }

  async getUserStats(userId: string): Promise<{
    totalPrompts: number;
    favorites: number;
    usesThisMonth: number;
  }> {
    const userPrompts = await this.getPromptsByUserId(userId);
    const favorites = userPrompts.filter(p => p.isFavorite).length;
    const usesThisMonth = userPrompts.reduce((sum, p) => sum + (p.usageCount || 0), 0);

    return {
      totalPrompts: userPrompts.length,
      favorites,
      usesThisMonth,
    };
  }

  // Team collaboration operations
  async getUserTeams(userId: string): Promise<any[]> {
    // Return empty array for now - teams feature ready for future implementation
    return [];
  }

  async createTeam(team: any): Promise<any> {
    // Return placeholder for now - teams feature ready for future implementation
    return { id: 1, ...team };
  }

  async getTeamMembers(teamId: number): Promise<any[]> {
    // Return empty array for now - teams feature ready for future implementation
    return [];
  }

  // Template operations
  async getTemplates(userId: string, filters?: {
    search?: string;
    category?: string;
  }): Promise<any[]> {
    // Return empty array for now - templates feature ready for future implementation
    return [];
  }

  async createTemplate(template: any): Promise<any> {
    // Return placeholder for now - templates feature ready for future implementation
    return { id: 1, ...template };
  }

  async deleteTemplate(templateId: number, userId: string): Promise<void> {
    // No-op for now - templates feature ready for future implementation
  }

  // Billing and subscription operations
  async getUserSubscription(userId: string): Promise<any> {
    const [user] = await db.select({
      subscriptionTier: users.subscriptionTier,
      tokenBalance: users.tokenBalance,
      stripeCustomerId: users.stripeCustomerId,
      stripeSubscriptionId: users.stripeSubscriptionId,
      subscriptionStatus: users.subscriptionStatus,
      subscriptionEndDate: users.subscriptionEndDate,
    }).from(users).where(eq(users.id, userId));
    
    return user;
  }

  async updateUserSubscription(userId: string, subscriptionData: any): Promise<any> {
    const [user] = await db.update(users)
      .set({
        subscriptionTier: subscriptionData.tier,
        stripeCustomerId: subscriptionData.stripeCustomerId,
        stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
        subscriptionStatus: subscriptionData.status,
        subscriptionEndDate: subscriptionData.endDate,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  async deductTokens(userId: string, tokenAmount: number): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user || (user.tokenBalance ?? 0) < tokenAmount) {
      return false;
    }

    await db.update(users)
      .set({ 
        tokenBalance: (user.tokenBalance ?? 0) - tokenAmount,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    return true;
  }

  async addTokens(userId: string, tokenAmount: number): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (user) {
      await db.update(users)
        .set({ 
          tokenBalance: (user.tokenBalance ?? 0) + tokenAmount,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }
  }

  async recordTokenUsage(usage: any): Promise<void> {
    // For now, just track in user's token balance - full usage tracking ready for implementation
  }

  async getSubscriptionTiers(): Promise<any[]> {
    // Return predefined tiers for now - database implementation ready
    return [
      {
        id: 1,
        name: "free",
        displayName: "Free",
        description: "Perfect for getting started",
        price: 0,
        tokenLimit: 10,
        features: ["10 prompts per month", "Basic templates", "Community support"]
      },
      {
        id: 2,
        name: "pro",
        displayName: "Pro",
        description: "For professionals and creators",
        price: 1999, // $19.99
        tokenLimit: 500,
        features: ["500 prompts per month", "Premium templates", "Priority support", "Team collaboration"]
      },
      {
        id: 3,
        name: "enterprise",
        displayName: "Enterprise",
        description: "For agencies and large teams",
        price: 9999, // $99.99
        tokenLimit: null,
        features: ["Unlimited prompts", "Custom templates", "Dedicated support", "Advanced analytics", "Custom integrations"]
      }
    ];
  }

  async createTokenPurchase(purchase: any): Promise<any> {
    // For now, return placeholder - ready for Stripe integration
    return { id: Date.now(), ...purchase };
  }

  async updateTokenPurchaseStatus(purchaseId: number, status: string): Promise<void> {
    // No-op for now - ready for database implementation
  }
}

export const storage = new DatabaseStorage();
