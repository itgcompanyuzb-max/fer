export type UserRole = 'client' | 'super_admin' | 'finance_admin' | 'compliance_admin' | 'support_admin';
export type UserStatus = 'active' | 'suspended' | 'pending_verification' | 'closed';
export type KycStatus = 'unsubmitted' | 'pending' | 'approved' | 'rejected';
export type AccountType = 'standard' | 'pro' | 'ecn';
export type PositionSide = 'buy' | 'sell';
export type PositionStatus = 'open' | 'closed' | 'liquidated';
export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'rebate';
export type PaymentMethod = 'payme' | 'click' | 'uzcard_humo' | 'crypto_usdt' | 'bank_wire';
export type TransactionStatus = 'pending' | 'approved_maker' | 'completed' | 'rejected' | 'cancelled';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface BrokerUser {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  country: string;
  role: UserRole;
  status: UserStatus;
  is2faEnabled: boolean;
  kycStatus: KycStatus;
  addressVerified?: boolean;
  addressVerificationNotice?: {
    status: 'needed' | 'under_review' | 'rejected_unclear' | 'verified';
    message: string;
  };
  residentialAddress?: {
    country: string;
    city: string;
    addressLine: string;
    postalCode: string;
    documentType?: string;
    documentUrl?: string;
    submittedAt?: string;
  };
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
}

export interface KycRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  documentType: 'passport' | 'id_card' | 'drivers_license';
  documentNumber: string;
  idFrontUrl: string;
  idBackUrl?: string;
  selfieUrl: string;
  status: KycStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface TradingAccount {
  id: string;
  userId: string;
  accountNumber: string;
  accountType: AccountType;
  currency: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  leverage: number;
  server: string;
  isDemo: boolean;
  isArchived?: boolean;
  archivedAt?: string;
  platform?: 'MT4' | 'MT5' | 'WebTrader' | 'Exora Terminal';
  nickname?: string;
  createdAt: string;
}

export interface Position {
  id: string;
  accountId: string;
  symbol: string;
  side: PositionSide;
  lotSize: number;
  openPrice: number;
  currentPrice: number;
  closePrice?: number;
  sl?: number;
  tp?: number;
  commission: number;
  swap: number;
  pnl: number;
  status: PositionStatus;
  openedAt: string;
  closedAt?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  accountId?: string;
  accountNumber?: string;
  type: TransactionType;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentDetails?: {
    cardMask?: string;
    txHash?: string;
    cryptoNetwork?: string;
    orderId?: string;
  };
  status: TransactionStatus;
  makerAdmin?: string;
  checkerAdmin?: string;
  rejectionReason?: string;
  createdAt: string;
  processedAt?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  messagesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'agent';
  message: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  targetEntity: string;
  targetId?: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface ForexSymbolRate {
  symbol: string;
  name: string;
  category: 'forex' | 'commodities' | 'crypto' | 'indices';
  bid: number;
  ask: number;
  spread: number; // in pips
  change24h: number;
  high24h: number;
  low24h: number;
  digitPrecision: number;
}

export interface EconomicEvent {
  id: string;
  date: string;
  time: string;
  country: string;
  countryCode: 'US' | 'EU' | 'GB' | 'JP' | 'UZ' | 'CN';
  title: string;
  impact: 'high' | 'medium' | 'low';
  actual: string;
  forecast: string;
  previous: string;
  relatedSymbol?: string;
}

export type DrawingToolType = 
  | 'cursor'
  | 'crosshair' 
  | 'trendline' 
  | 'ray'
  | 'horizontal' 
  | 'vertical'
  | 'fibonacci' 
  | 'rectangle' 
  | 'brush' 
  | 'ruler' 
  | 'text'
  | 'eraser';

export interface DrawingElement {
  id: string;
  tool: DrawingToolType;
  points: Array<{ x: number; y: number; price?: number; time?: number }>;
  color: string;
  text?: string;
  lineWidth?: number;
}

export interface PendingOrder {
  id: string;
  accountId: string;
  symbol: string;
  type: 'buy_limit' | 'sell_limit' | 'buy_stop' | 'sell_stop';
  lotSize: number;
  targetPrice: number;
  currentPrice: number;
  sl?: number;
  tp?: number;
  createdAt: string;
  status: 'active' | 'triggered' | 'cancelled';
}
