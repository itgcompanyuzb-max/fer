import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  numeric, 
  integer, 
  boolean, 
  pgEnum 
} from 'drizzle-orm/pg-core';

// 1. ENUMS
export const kycStatusEnum = pgEnum('kyc_status', ['unsubmitted', 'pending', 'verified', 'rejected']);
export const userRoleEnum = pgEnum('user_role', ['client', 'super_admin', 'finance_admin', 'compliance_admin', 'support_admin']);
export const orderSideEnum = pgEnum('order_side', ['BUY', 'SELL']);
export const orderStatusEnum = pgEnum('order_status', ['OPEN', 'CLOSED', 'LIQUIDATED', 'CANCELLED']);
export const transactionTypeEnum = pgEnum('transaction_type', ['deposit', 'withdrawal', 'transfer', 'credit']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'rejected', 'cancelled']);

// 2. USERS TABLE
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 32 }),
  role: userRoleEnum('role').default('client').notNull(),
  kycStatus: kycStatusEnum('kyc_status').default('unsubmitted').notNull(),
  is2faEnabled: boolean('is_2fa_enabled').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. TRADING ACCOUNTS / WALLETS TABLE
export const tradingAccounts = pgTable('trading_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  accountNumber: varchar('account_number', { length: 16 }).notNull().unique(), // e.g. "3201288"
  currency: varchar('currency', { length: 8 }).default('USD').notNull(),
  balance: numeric('balance', { precision: 15, scale: 2 }).default('10000.00').notNull(),
  equity: numeric('equity', { precision: 15, scale: 2 }).default('10000.00').notNull(),
  margin: numeric('margin', { precision: 15, scale: 2 }).default('0.00').notNull(),
  freeMargin: numeric('free_margin', { precision: 15, scale: 2 }).default('10000.00').notNull(),
  marginLevel: numeric('margin_level', { precision: 8, scale: 2 }).default('0.00').notNull(), // Equity / Margin * 100
  leverage: integer('leverage').default(100).notNull(), // 1:100, 1:500, 1:2000
  isDemo: boolean('is_demo').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. POSITIONS / ORDERS TABLE
export const positions = pgTable('positions', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketNumber: integer('ticket_number').notNull().unique(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  accountId: uuid('account_id').references(() => tradingAccounts.id, { onDelete: 'cascade' }).notNull(),
  symbol: varchar('symbol', { length: 32 }).notNull(), // e.g., 'XAUUSD', 'EURUSD', 'BTCUSD'
  type: orderSideEnum('type').notNull(), // 'BUY' | 'SELL'
  volume: numeric('volume', { precision: 10, scale: 2 }).notNull(), // lot size e.g., 0.10, 1.00
  openPrice: numeric('open_price', { precision: 18, scale: 5 }).notNull(),
  currentPrice: numeric('current_price', { precision: 18, scale: 5 }).notNull(),
  closePrice: numeric('close_price', { precision: 18, scale: 5 }),
  sl: numeric('sl', { precision: 18, scale: 5 }),
  tp: numeric('tp', { precision: 18, scale: 5 }),
  status: orderStatusEnum('status').default('OPEN').notNull(),
  pnl: numeric('pnl', { precision: 15, scale: 2 }).default('0.00').notNull(), // Realized or Floating PnL
  lockedMargin: numeric('locked_margin', { precision: 15, scale: 2 }).notNull(),
  commission: numeric('commission', { precision: 10, scale: 2 }).default('0.00').notNull(),
  swap: numeric('swap', { precision: 10, scale: 2 }).default('0.00').notNull(),
  openedAt: timestamp('opened_at').defaultNow().notNull(),
  closedAt: timestamp('closed_at'),
});

// 5. TRANSACTIONS / LEDGER TABLE
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id').references(() => tradingAccounts.id, { onDelete: 'cascade' }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 32 }).default('payme').notNull(),
  status: transactionStatusEnum('status').default('completed').notNull(),
  referenceId: varchar('reference_id', { length: 64 }),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type TradingAccount = typeof tradingAccounts.$inferSelect;
export type Position = typeof positions.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
