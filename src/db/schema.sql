-- =========================================================================
-- EXORA PRIME FX & CFD BROKER PLATFORM - DATABASE SCHEMA (PostgreSQL)
-- Multi-asset Trading, KYC, Payment Gateway, RBAC Admin & Audit Log
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('client', 'super_admin', 'finance_admin', 'compliance_admin', 'support_admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending_verification', 'closed');
CREATE TYPE kyc_status AS ENUM ('unsubmitted', 'pending', 'approved', 'rejected');
CREATE TYPE account_type AS ENUM ('standard', 'pro', 'ecn');
CREATE TYPE position_side AS ENUM ('buy', 'sell');
CREATE TYPE position_status AS ENUM ('open', 'closed', 'liquidated');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'transfer', 'rebate');
CREATE TYPE payment_method AS ENUM ('payme', 'click', 'uzcard_humo', 'crypto_usdt', 'bank_wire');
CREATE TYPE transaction_status AS ENUM ('pending', 'approved_maker', 'completed', 'rejected', 'cancelled');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(32) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    country VARCHAR(3) DEFAULT 'UZB',
    role user_role DEFAULT 'client',
    status user_status DEFAULT 'active',
    is_2fa_enabled BOOLEAN DEFAULT false,
    two_fa_secret VARCHAR(64),
    referral_code VARCHAR(16) UNIQUE,
    referred_by VARCHAR(16),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip VARCHAR(45)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- 3. KYC VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS kyc_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(32) NOT NULL, -- 'passport', 'id_card', 'drivers_license'
    document_number VARCHAR(64) NOT NULL,
    id_front_url TEXT NOT NULL,
    id_back_url TEXT,
    selfie_url TEXT NOT NULL,
    proof_of_address_url TEXT,
    status kyc_status DEFAULT 'pending',
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES users(id),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_kyc_user_id ON kyc_verifications(user_id);
CREATE INDEX idx_kyc_status ON kyc_verifications(status);

-- 4. TRADING ACCOUNTS (Standard, Pro, ECN)
CREATE TABLE IF NOT EXISTS trading_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(16) UNIQUE NOT NULL,
    account_type account_type DEFAULT 'standard',
    currency VARCHAR(4) DEFAULT 'USD',
    balance DECIMAL(15, 2) DEFAULT 0.00,
    equity DECIMAL(15, 2) DEFAULT 0.00,
    margin DECIMAL(15, 2) DEFAULT 0.00,
    free_margin DECIMAL(15, 2) DEFAULT 0.00,
    margin_level DECIMAL(8, 2) DEFAULT 0.00,
    leverage INT DEFAULT 500, -- 1:500 standard, 1:200 pro, 1:100 ecn
    server VARCHAR(32) DEFAULT 'ExoraPrime-Live01',
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trading_accounts_user ON trading_accounts(user_id);
CREATE INDEX idx_trading_accounts_num ON trading_accounts(account_number);

-- 5. POSITIONS / TRADES
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    symbol VARCHAR(16) NOT NULL, -- e.g. 'EUR/USD', 'GBP/USD', 'XAU/USD'
    side position_side NOT NULL,
    lot_size DECIMAL(8, 2) NOT NULL,
    open_price DECIMAL(15, 5) NOT NULL,
    current_price DECIMAL(15, 5) NOT NULL,
    close_price DECIMAL(15, 5),
    sl DECIMAL(15, 5),
    tp DECIMAL(15, 5),
    commission DECIMAL(10, 2) DEFAULT 0.00,
    swap DECIMAL(10, 2) DEFAULT 0.00,
    pnl DECIMAL(15, 2) DEFAULT 0.00,
    status position_status DEFAULT 'open',
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_positions_account ON positions(account_id);
CREATE INDEX idx_positions_status ON positions(status);
CREATE INDEX idx_positions_symbol ON positions(symbol);

-- 6. TRANSACTIONS (Deposits, Withdrawals)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES trading_accounts(id),
    type transaction_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    fee DECIMAL(10, 2) DEFAULT 0.00,
    net_amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(4) DEFAULT 'USD',
    payment_method payment_method NOT NULL,
    payment_details JSONB, -- { card_mask, tx_hash, uzcard_order_id, crypto_wallet }
    status transaction_status DEFAULT 'pending',
    maker_admin_id UUID REFERENCES users(id), -- Maker-checker approval 1
    checker_admin_id UUID REFERENCES users(id), -- Maker-checker approval 2
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(type);

-- 7. SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticket_number VARCHAR(16) UNIQUE NOT NULL,
    subject VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority ticket_priority DEFAULT 'medium',
    status ticket_status DEFAULT 'open',
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    sender_role VARCHAR(32) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. AUDIT LOGS (Immutable security logs)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id),
    actor_role VARCHAR(32) NOT NULL,
    action VARCHAR(64) NOT NULL, -- e.g. 'APPROVE_KYC', 'UPDATE_SPREAD', 'APPROVE_WITHDRAWAL'
    target_entity VARCHAR(32) NOT NULL, -- 'user', 'kyc', 'transaction', 'settings'
    target_id VARCHAR(64),
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- 9. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(64) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial broker configurations
INSERT INTO system_settings (key, value, description) VALUES
('spread_config', '{"EUR/USD": 0.8, "GBP/USD": 1.2, "USD/JPY": 0.9, "XAU/USD": 15.0, "BTC/USD": 25.0}', 'Default broker spreads in pips/points'),
('leverage_limits', '{"standard": 500, "pro": 200, "ecn": 100}', 'Maximum leverage ratio by tier'),
('commission_rates', '{"standard": 0.0, "pro": 3.5, "ecn": 6.0}', 'Round-turn commission per standard lot ($)'),
('broker_info', '{"company": "Exora Prime Ltd", "license": "FSA-SVG No. 26842-IBC-2024", "registered_address": "Financial Services Centre, Kingstown"}', 'Company credentials')
ON CONFLICT (key) DO NOTHING;
