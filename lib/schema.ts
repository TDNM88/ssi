import { pgTable, serial, text, timestamp, numeric, boolean, integer, pgEnum, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Re-export types for ES modules
export * from 'drizzle-orm';
export * from 'drizzle-zod';

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const transactionTypeEnum = pgEnum('transaction_type', ['deposit', 'withdrawal', 'trade']);
export const tradeDirectionEnum = pgEnum('trade_direction', ['UP', 'DOWN']);
export const tradeStatusEnum = pgEnum('trade_status', ['PENDING', 'WON', 'LOST', 'CANCELED']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  phone: text('phone'),
  balance: numeric('balance', { precision: 20, scale: 2 }).default('0').notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User verification tokens
export const verificationTokens = pgTable('verification_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  expires: timestamp('expires').notNull(),
});

// Password reset tokens
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  expires: timestamp('expires').notNull(),
});

// Transactions table
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 20, scale: 2 }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  status: text('status').notNull().default('PENDING'),
  description: text('description'),
  reference: text('reference').unique(),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Trades table
export const trades = pgTable('trades', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 20, scale: 2 }).notNull(),
  symbol: text('symbol').notNull(),
  direction: tradeDirectionEnum('direction').notNull(),
  entryPrice: numeric('entry_price', { precision: 20, scale: 6 }).notNull(),
  closePrice: numeric('close_price', { precision: 20, scale: 6 }),
  payout: numeric('payout', { precision: 20, scale: 2 }),
  status: tradeStatusEnum('status').default('PENDING').notNull(),
  result: text('result'),
  profit: numeric('profit', { precision: 20, scale: 2 }),
  duration: integer('duration').notNull(), // in seconds
  openTime: timestamp('open_time').defaultNow().notNull(),
  closeTime: timestamp('close_time'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// API Key for external services
export const apiKeys = pgTable('api_keys', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  expiresAt: timestamp('expires_at'),
  lastUsedAt: timestamp('last_used_at'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Login attempts tracking
export const loginAttempts = pgTable('login_attempts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  ipAddress: text('ip_address').notNull(),
  userAgent: text('user_agent'),
  success: boolean('success').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Define indexes directly in the table definition
  userIdIdx: index('login_attempts_user_id_idx').on(table.userId),
  ipAddressIdx: index('login_attempts_ip_address_idx').on(table.ipAddress),
  createdAtIdx: index('login_attempts_created_at_idx').on(table.createdAt),
}));

// Zod schemas for API validation
// Base user schema without validations
const baseUserSchema = createInsertSchema(users);

export const createUserSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  name: z.string().min(1, 'Vui lòng nhập họ tên'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  balance: z.number().optional().default(0)
});

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu')
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(10).optional()
}).partial();

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const depositWithdrawSchema = z.object({
  amount: z.number().positive(),
  method: z.string(),
  transactionDetails: z.record(z.any()).optional(),
});

export const placeTradeSchema = z.object({
  symbol: z.string(),
  amount: z.number().positive(),
  direction: z.enum(['UP', 'DOWN']),
  duration: z.number().positive(),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Trade = typeof trades.$inferSelect;
export type NewTrade = typeof trades.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
