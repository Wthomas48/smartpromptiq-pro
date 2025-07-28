import { pgTable, text, timestamp, integer, boolean, decimal, jsonb, uuid, varchar, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'), // 'user', 'admin', 'premium'
  isEmailVerified: boolean('is_email_verified').notNull().default(false),
  emailVerificationToken: text('email_verification_token'),
  resetPasswordToken: text('reset_password_token'),
  resetPasswordExpires: timestamp('reset_password_expires'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
  profileImage: text('profile_image'),
  preferences: jsonb('preferences').default('{}'),
});

// Subscription plans
export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(), // 'Free', 'Pro', 'Enterprise'
  description: text('description'),
  priceMonthly: decimal('price_monthly', { precision: 10, scale: 2 }).notNull(),
  priceYearly: decimal('price_yearly', { precision: 10, scale: 2 }),
  stripeMonthlyPriceId: text('stripe_monthly_price_id'),
  stripeYearlyPriceId: text('stripe_yearly_price_id'),
  features: jsonb('features').notNull(), // Array of feature names
  limits: jsonb('limits').notNull(), // { promptsPerMonth: 100, templatesAccess: true }
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// User subscriptions
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planId: uuid('plan_id').notNull().references(() => subscriptionPlans.id),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  status: varchar('status', { length: 50 }).notNull(), // 'active', 'canceled', 'past_due', 'trialing'
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  billingInterval: varchar('billing_interval', { length: 20 }).notNull(), // 'month', 'year'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Prompt categories
export const promptCategories = pgTable('prompt_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }), // Emoji or icon name
  color: varchar('color', { length: 20 }), // Hex color
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Prompt templates
export const promptTemplates = pgTable('prompt_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  content: text('content').notNull(),
  categoryId: uuid('category_id').references(() => promptCategories.id),
  createdBy: uuid('created_by').references(() => users.id),
  isPublic: boolean('is_public').notNull().default(false),
  isPremium: boolean('is_premium').notNull().default(false),
  tags: jsonb('tags').default('[]'), // Array of tag strings
  variables: jsonb('variables').default('[]'), // Array of variable definitions
  usageCount: integer('usage_count').default(0),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  ratingCount: integer('rating_count').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// User-generated prompts
export const prompts = pgTable('prompts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  templateId: uuid('template_id').references(() => promptTemplates.id),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  aiModel: varchar('ai_model', { length: 50 }), // 'gpt-4', 'claude-3', etc.
  generatedOutput: text('generated_output'),
  inputVariables: jsonb('input_variables').default('{}'),
  metadata: jsonb('metadata').default('{}'), // Additional data like tokens used, etc.
  isPublic: boolean('is_public').default(false),
  isFavorite: boolean('is_favorite').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// API usage tracking
export const apiUsage = pgTable('api_usage', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  promptId: uuid('prompt_id').references(() => prompts.id),
  aiProvider: varchar('ai_provider', { length: 50 }).notNull(), // 'openai', 'anthropic'
  model: varchar('model', { length: 50 }).notNull(),
  tokensUsed: integer('tokens_used').notNull(),
  cost: decimal('cost', { precision: 10, scale: 6 }), // Cost in USD
  requestDuration: integer('request_duration'), // Duration in milliseconds
  success: boolean('success').notNull().default(true),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// User teams/organizations
export const teams = pgTable('teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
  settings: jsonb('settings').default('{}'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Team memberships
export const teamMembers = pgTable('team_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).notNull().default('member'), // 'owner', 'admin', 'member'
  permissions: jsonb('permissions').default('[]'), // Array of permission strings
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  invitedBy: uuid('invited_by').references(() => users.id),
});

// Analytics events
export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  teamId: uuid('team_id').references(() => teams.id),
  eventType: varchar('event_type', { length: 100 }).notNull(), // 'prompt_generated', 'template_used', etc.
  eventData: jsonb('event_data').default('{}'),
  sessionId: varchar('session_id', { length: 255 }),
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  subscriptions: many(subscriptions),
  prompts: many(prompts),
  promptTemplates: many(promptTemplates),
  apiUsage: many(apiUsage),
  ownedTeams: many(teams),
  teamMemberships: many(teamMembers),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
}));

export const promptsRelations = relations(prompts, ({ one }) => ({
  user: one(users, {
    fields: [prompts.userId],
    references: [users.id],
  }),
  template: one(promptTemplates, {
    fields: [prompts.templateId],
    references: [promptTemplates.id],
  }),
}));

export const promptTemplatesRelations = relations(promptTemplates, ({ one, many }) => ({
  category: one(promptCategories, {
    fields: [promptTemplates.categoryId],
    references: [promptCategories.id],
  }),
  creator: one(users, {
    fields: [promptTemplates.createdBy],
    references: [users.id],
  }),
  prompts: many(prompts),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  owner: one(users, {
    fields: [teams.ownerId],
    references: [users.id],
  }),
  members: many(teamMembers),
  subscription: one(subscriptions, {
    fields: [teams.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));