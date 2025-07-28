import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Subscription and billing fields
  subscriptionTier: varchar("subscription_tier").default("free"), // free, pro, enterprise
  tokenBalance: integer("token_balance").default(10), // Free tier gets 10 tokens
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status"), // active, canceled, past_due
  subscriptionEndDate: timestamp("subscription_end_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team/Workspace tables for collaboration
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role").notNull().default("member"), // owner, admin, member, viewer
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => [
  index("idx_team_members_team_user").on(table.teamId, table.userId),
]);

export const promptTemplates = pgTable("prompt_templates", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  content: text("content").notNull(),
  tags: jsonb("tags").default([]),
  isPublic: boolean("is_public").default(false),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  teamId: integer("team_id").references(() => teams.id),
  usageCount: integer("usage_count").default(0),
  tokensUsed: integer("tokens_used").default(1), // Track token consumption per prompt
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  teamId: integer("team_id").references(() => teams.id),
  title: varchar("title").notNull(),
  category: varchar("category").notNull(), // business, creative, technical
  content: text("content").notNull(),
  questionnaire: jsonb("questionnaire").notNull(), // Store Q&A responses
  customization: jsonb("customization"), // tone, detail level, format
  templateId: integer("template_id").references(() => promptTemplates.id),
  isFavorite: boolean("is_favorite").default(false),
  isShared: boolean("is_shared").default(false),
  usageCount: integer("usage_count").default(0),
  tokensUsed: integer("tokens_used").default(1), // Track token consumption per prompt
  collaborators: jsonb("collaborators").default([]), // Array of user IDs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const promptHistory = pgTable("prompt_history", {
  id: serial("id").primaryKey(),
  promptId: integer("prompt_id").notNull().references(() => prompts.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  content: text("content").notNull(),
  changes: text("changes"), // Description of what changed
  modifiedBy: varchar("modified_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_prompt_history_prompt").on(table.promptId),
]);

// Subscription tiers and pricing
export const subscriptionTiers = pgTable("subscription_tiers", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(), // free, pro, enterprise
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // in cents
  currency: varchar("currency").default("usd"),
  billingInterval: varchar("billing_interval").notNull(), // month, year
  tokenLimit: integer("token_limit"), // null for unlimited
  features: jsonb("features").notNull(), // Array of feature names
  stripePriceId: varchar("stripe_price_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Token purchases for pay-per-use
export const tokenPurchases = pgTable("token_purchases", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  tokenAmount: integer("token_amount").notNull(),
  priceInCents: integer("price_in_cents").notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  status: varchar("status").notNull(), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

// Track token usage for billing
export const tokenUsage = pgTable("token_usage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  promptId: integer("prompt_id").references(() => prompts.id),
  tokensUsed: integer("tokens_used").notNull(),
  operation: varchar("operation").notNull(), // generation, refinement, template_use
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTemplateSchema = createInsertSchema(promptTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true,
});

export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type PromptTemplate = typeof promptTemplates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type PromptHistory = typeof promptHistory.$inferSelect;

// Billing and subscription types
export type SubscriptionTier = typeof subscriptionTiers.$inferSelect;
export type InsertSubscriptionTier = typeof subscriptionTiers.$inferInsert;
export type TokenPurchase = typeof tokenPurchases.$inferSelect;
export type InsertTokenPurchase = typeof tokenPurchases.$inferInsert;
export type TokenUsage = typeof tokenUsage.$inferSelect;
export type InsertTokenUsage = typeof tokenUsage.$inferInsert;


