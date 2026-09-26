import { 
  BrokerUser, 
  TradingAccount, 
  Position, 
  Transaction, 
  KycRecord, 
  SupportTicket, 
  TicketMessage, 
  AuditLogItem, 
  ForexSymbolRate,
  UserRole,
  KycStatus,
  AccountType,
  EconomicEvent,
  PendingOrder
} from '../types/broker';

// INITIAL FOREX AND MULTI-ASSET RATES WITH SPREADS (Matching screenshot tabs)
export const INITIAL_SYMBOLS: ForexSymbolRate[] = [
  { symbol: 'BTC', name: 'Bitcoin vs US Dollar', category: 'crypto', bid: 79719.47, ask: 79729.47, spread: 10.0, change24h: -0.01, high24h: 79737.27, low24h: 79714.65, digitPrecision: 2 },
  { symbol: 'ETH', name: 'Ethereum vs US Dollar', category: 'crypto', bid: 3140.25, ask: 3141.55, spread: 1.3, change24h: 1.15, high24h: 3185.00, low24h: 3110.00, digitPrecision: 2 },
  { symbol: 'BTC/USDT', name: 'Bitcoin / Tether', category: 'crypto', bid: 79720.00, ask: 79725.00, spread: 5.0, change24h: 0.05, high24h: 79750.00, low24h: 79690.00, digitPrecision: 2 },
  { symbol: 'XAU/USD247', name: 'Gold / US Dollar 24/7', category: 'commodities', bid: 2684.50, ask: 2686.00, spread: 1.5, change24h: 0.85, high24h: 2695.00, low24h: 2670.00, digitPrecision: 2 },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'forex', bid: 1.08425, ask: 1.08433, spread: 0.8, change24h: 0.24, high24h: 1.08710, low24h: 1.08150, digitPrecision: 5 },
  { symbol: 'GBP/USD', name: 'Great Britain Pound / USD', category: 'forex', bid: 1.27180, ask: 1.27192, spread: 1.2, change24h: -0.15, high24h: 1.27600, low24h: 1.26900, digitPrecision: 5 },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', category: 'forex', bid: 154.620, ask: 154.629, spread: 0.9, change24h: 0.42, high24h: 155.100, low24h: 154.200, digitPrecision: 3 },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', category: 'forex', bid: 0.89510, ask: 0.89522, spread: 1.2, change24h: -0.08, high24h: 0.89800, low24h: 0.89350, digitPrecision: 5 },
  { symbol: 'XAU/USD', name: 'Gold / US Dollar', category: 'commodities', bid: 2685.40, ask: 2685.75, spread: 3.5, change24h: 1.15, high24h: 2698.00, low24h: 2670.50, digitPrecision: 2 },
  { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', category: 'crypto', bid: 79719.47, ask: 79729.47, spread: 10.0, change24h: -0.01, high24h: 79737.27, low24h: 79714.65, digitPrecision: 2 },
  { symbol: 'US30', name: 'Wall Street 30 Index', category: 'indices', bid: 43810.0, ask: 43812.5, spread: 2.5, change24h: 0.35, high24h: 44050.0, low24h: 43620.0, digitPrecision: 1 },
];

export const DEFAULT_ECONOMIC_EVENTS: EconomicEvent[] = [
  {
    id: 'eco_1',
    date: 'September 8',
    time: '5:00 AM',
    country: 'United States',
    countryCode: 'US',
    title: 'Consumer Inflation Expectations',
    impact: 'high',
    actual: '-',
    forecast: '3.6%',
    previous: '3.6%',
    relatedSymbol: 'BTC'
  },
  {
    id: 'eco_2',
    date: 'September 8',
    time: '5:30 AM',
    country: 'United States',
    countryCode: 'US',
    title: '6-Month Bill Auction',
    impact: 'medium',
    actual: '-',
    forecast: '-',
    previous: '3.89%',
    relatedSymbol: 'USD/JPY'
  },
  {
    id: 'eco_3',
    date: 'September 8',
    time: '5:30 AM',
    country: 'United States',
    countryCode: 'US',
    title: '3-Month Bill Auction',
    impact: 'medium',
    actual: '-',
    forecast: '3.7%',
    previous: '3.77%',
    relatedSymbol: 'EUR/USD'
  },
  {
    id: 'eco_4',
    date: 'September 8',
    time: '7:00 AM',
    country: 'United States',
    countryCode: 'US',
    title: '6-Week Bill Auction',
    impact: 'low',
    actual: '-',
    forecast: '-',
    previous: '3.74%',
    relatedSymbol: 'BTC'
  },
  {
    id: 'eco_5',
    date: 'September 8',
    time: '7:00 AM',
    country: 'United States',
    countryCode: 'US',
    title: '3-Year Note Auction',
    impact: 'medium',
    actual: '-',
    forecast: '-',
    previous: '4.29%',
    relatedSymbol: 'US30'
  },
  {
    id: 'eco_6',
    date: 'September 8',
    time: '9:00 AM',
    country: 'United States',
    countryCode: 'US',
    title: 'Consumer Credit Change',
    impact: 'high',
    actual: '-',
    forecast: '$11.3B',
    previous: '$14.17B',
    relatedSymbol: 'BTC'
  },
  {
    id: 'eco_7',
    date: 'September 9',
    time: '1:00 AM',
    country: 'United States',
    countryCode: 'US',
    title: 'MBA 30-Year Mortgage Rate',
    impact: 'medium',
    actual: '-',
    forecast: '-',
    previous: '6.79%',
    relatedSymbol: 'USD/CHF'
  },
  {
    id: 'eco_8',
    date: 'September 9',
    time: '1:00 AM',
    country: 'United States',
    countryCode: 'US',
    title: 'MBA Purchase Index',
    impact: 'low',
    actual: '-',
    forecast: '-',
    previous: '157.8',
    relatedSymbol: 'EUR/USD'
  },
  {
    id: 'eco_9',
    date: 'September 9',
    time: '1:30 AM',
    country: 'Uzbekistan',
    countryCode: 'UZ',
    title: 'CBU Inflation Expectation Survey & UZS Interbank Rate',
    impact: 'high',
    actual: '9.2%',
    forecast: '9.1%',
    previous: '8.9%',
    relatedSymbol: 'UZS'
  }
];

const STORAGE_PREFIX = 'exora_broker_';

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage write error', err);
  }
}

// Initial Admin and Client Users
const DEFAULT_USERS: BrokerUser[] = [
  {
    id: 'usr_avazjon',
    email: 'itgcompanyuzb@gmail.com',
    phone: '+998 90 123 45 67',
    fullName: 'AVAZJON',
    country: 'Uzbekistan',
    role: 'client',
    status: 'active',
    is2faEnabled: true,
    kycStatus: 'pending',
    addressVerified: true,
    addressVerificationNotice: null,
    referralCode: 'EXO3201',
    createdAt: '2024-01-10T10:00:00Z',
    lastLoginAt: new Date().toISOString(),
    lastLoginIp: '185.139.137.21',
  },
  {
    id: 'usr_super_admin',
    email: 'admin@exorafx.com',
    fullName: 'Exora Master Admin',
    country: 'UZB',
    role: 'super_admin',
    status: 'active',
    is2faEnabled: true,
    kycStatus: 'approved',
    referralCode: 'EXORA001',
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: new Date().toISOString(),
    lastLoginIp: '195.158.2.14',
  },
  {
    id: 'usr_compliance',
    email: 'compliance@exorafx.com',
    fullName: 'Sarvar Compliance Officer',
    country: 'UZB',
    role: 'compliance_admin',
    status: 'active',
    is2faEnabled: true,
    kycStatus: 'approved',
    referralCode: 'COMP001',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'usr_finance',
    email: 'finance@exorafx.com',
    fullName: 'Dilshod Finance Manager',
    country: 'UZB',
    role: 'finance_admin',
    status: 'active',
    is2faEnabled: true,
    kycStatus: 'approved',
    referralCode: 'FIN001',
    createdAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'usr_client_demo',
    email: 'client@exorafx.com',
    phone: '+998901234567',
    fullName: 'Azizbek Rahimov',
    country: 'UZB',
    role: 'client',
    status: 'active',
    is2faEnabled: false,
    kycStatus: 'approved',
    referralCode: 'AZIZ2024',
    referredBy: 'EXORA001',
    createdAt: '2024-02-01T10:00:00Z',
    lastLoginAt: new Date().toISOString(),
    lastLoginIp: '84.54.120.45',
  },
];

const DEFAULT_ACCOUNTS: TradingAccount[] = [
  // User AVAZJON active account matching image.png
  {
    id: 'acc_3201288',
    userId: 'usr_avazjon',
    accountNumber: '3201288',
    accountType: 'pro',
    platform: 'MT5',
    nickname: 'Standard',
    currency: 'USD',
    balance: 152.40,
    equity: 152.40,
    margin: 0,
    freeMargin: 152.40,
    marginLevel: 0,
    leverage: 200,
    server: 'ExoraPrime-Live01',
    isDemo: false,
    isArchived: false,
    createdAt: '2026-03-01T10:00:00Z',
  },
  // User AVAZJON accounts: 3 archived accounts as shown in user screenshot
  {
    id: 'acc_250521801',
    userId: 'usr_avazjon',
    accountNumber: '250521801',
    accountType: 'pro',
    platform: 'MT5',
    nickname: 'Pro',
    currency: 'USD',
    balance: 0,
    equity: 0,
    margin: 0,
    freeMargin: 0,
    marginLevel: 0,
    leverage: 2000,
    server: 'ExoraPrime-Live01',
    isDemo: false,
    isArchived: true,
    archivedAt: '9 Jul 2026 at 04:20 (UTC+5)',
    createdAt: '2025-05-12T10:00:00Z',
  },
  {
    id: 'acc_249043214',
    userId: 'usr_avazjon',
    accountNumber: '249043214',
    accountType: 'standard',
    platform: 'MT5',
    nickname: 'Standard',
    currency: 'USD',
    balance: 0,
    equity: 0,
    margin: 0,
    freeMargin: 0,
    marginLevel: 0,
    leverage: 2000,
    server: 'ExoraPrime-Live02',
    isDemo: false,
    isArchived: true,
    archivedAt: '15 Jun 2026 at 04:45 (UTC+5)',
    createdAt: '2025-04-18T10:00:00Z',
  },
  {
    id: 'acc_249043464',
    userId: 'usr_avazjon',
    accountNumber: '249043464',
    accountType: 'standard',
    platform: 'MT5',
    nickname: 'Standard',
    currency: 'USD',
    balance: 0,
    equity: 0,
    margin: 0,
    freeMargin: 0,
    marginLevel: 0,
    leverage: 2000,
    server: 'ExoraPrime-Live02',
    isDemo: false,
    isArchived: true,
    archivedAt: '10 Sep 2025 at 04:22 (UTC+5)',
    createdAt: '2025-02-11T10:00:00Z',
  },
  // Other demo/live accounts
  {
    id: 'acc_standard_live',
    userId: 'usr_client_demo',
    accountNumber: '1088241',
    accountType: 'standard',
    platform: 'MT5',
    currency: 'USD',
    balance: 5420.50,
    equity: 5612.30,
    margin: 320.00,
    freeMargin: 5292.30,
    marginLevel: 1753.84,
    leverage: 500,
    server: 'ExoraPrime-Live01',
    isDemo: false,
    createdAt: '2024-02-02T12:00:00Z',
  },
  {
    id: 'acc_pro_live',
    userId: 'usr_client_demo',
    accountNumber: '2094115',
    accountType: 'pro',
    platform: 'MT5',
    currency: 'USD',
    balance: 15000.00,
    equity: 15000.00,
    margin: 0,
    freeMargin: 15000.00,
    marginLevel: 0,
    leverage: 200,
    server: 'ExoraPrime-Live02',
    isDemo: false,
    createdAt: '2024-02-10T15:00:00Z',
  },
  {
    id: 'acc_demo_standard',
    userId: 'usr_client_demo',
    accountNumber: '9901423',
    accountType: 'standard',
    platform: 'MT5',
    currency: 'USD',
    balance: 10000.00,
    equity: 10000.00,
    margin: 0,
    freeMargin: 10000.00,
    marginLevel: 0,
    leverage: 500,
    server: 'ExoraPrime-Demo01',
    isDemo: true,
    createdAt: '2024-02-01T10:00:00Z',
  }
];

const DEFAULT_POSITIONS: Position[] = [
  {
    id: 'pos_hist_01',
    accountId: 'acc_3201288',
    symbol: 'EUR/USD',
    side: 'buy',
    lotSize: 0.10,
    openPrice: 1.08210,
    currentPrice: 1.08450,
    closePrice: 1.08450,
    sl: 1.08000,
    tp: 1.08600,
    pnl: 24.00,
    swap: -0.45,
    commission: 0,
    openedAt: '2026-08-30T10:15:00Z',
    closedAt: '2026-08-30T14:40:00Z',
    status: 'closed',
  },
  {
    id: 'pos_hist_02',
    accountId: 'acc_3201288',
    symbol: 'XAU/USD',
    side: 'buy',
    lotSize: 0.05,
    openPrice: 2650.20,
    currentPrice: 2678.50,
    closePrice: 2678.50,
    sl: 2640.00,
    tp: 2685.00,
    pnl: 141.50,
    swap: -1.20,
    commission: 0,
    openedAt: '2026-08-31T08:20:00Z',
    closedAt: '2026-08-31T16:10:00Z',
    status: 'closed',
  },
  {
    id: 'pos_hist_03',
    accountId: 'acc_3201288',
    symbol: 'GBP/USD',
    side: 'sell',
    lotSize: 0.10,
    openPrice: 1.27800,
    currentPrice: 1.27450,
    closePrice: 1.27450,
    sl: 1.28200,
    tp: 1.27300,
    pnl: 35.00,
    swap: -0.60,
    commission: 0,
    openedAt: '2026-09-01T11:00:00Z',
    closedAt: '2026-09-01T15:30:00Z',
    status: 'closed',
  },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_dep_01',
    userId: 'usr_client_demo',
    userEmail: 'client@exorafx.com',
    userName: 'Azizbek Rahimov',
    accountId: 'acc_standard_live',
    accountNumber: '1088241',
    type: 'deposit',
    amount: 5000,
    fee: 0,
    netAmount: 5000,
    currency: 'USD',
    paymentMethod: 'payme',
    paymentDetails: { cardMask: '8600 **** **** 4129', orderId: 'PM-99214' },
    status: 'completed',
    createdAt: '2024-02-02T12:05:00Z',
    processedAt: '2024-02-02T12:06:00Z',
  },
  {
    id: 'tx_with_02',
    userId: 'usr_client_demo',
    userEmail: 'client@exorafx.com',
    userName: 'Azizbek Rahimov',
    accountId: 'acc_standard_live',
    accountNumber: '1088241',
    type: 'withdrawal',
    amount: 1200,
    fee: 0,
    netAmount: 1200,
    currency: 'USD',
    paymentMethod: 'crypto_usdt',
    paymentDetails: { cryptoNetwork: 'TRC-20', txHash: 'TY1892...k9x1' },
    status: 'pending',
    createdAt: '2024-05-19T09:00:00Z',
  }
];

const DEFAULT_KYC_LIST: KycRecord[] = [
  {
    id: 'kyc_01',
    userId: 'usr_client_demo',
    userEmail: 'client@exorafx.com',
    userName: 'Azizbek Rahimov',
    documentType: 'passport',
    documentNumber: 'FA 1948201',
    idFrontUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    selfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    status: 'approved',
    reviewedBy: 'Sarvar Compliance Officer',
    submittedAt: '2024-02-01T11:00:00Z',
    reviewedAt: '2024-02-01T11:45:00Z',
  },
  {
    id: 'kyc_02',
    userId: 'usr_client_02',
    userEmail: 'jasur.trader@mail.uz',
    userName: 'Jasur Saidov',
    documentType: 'id_card',
    documentNumber: 'AA 9812450',
    idFrontUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    selfieUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    status: 'pending',
    submittedAt: '2024-05-18T16:20:00Z',
  }
];

const DEFAULT_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'aud_1',
    actorId: 'usr_super_admin',
    actorEmail: 'admin@exorafx.com',
    actorRole: 'super_admin',
    action: 'SYSTEM_BOOT',
    targetEntity: 'system',
    details: 'Broker engine initialized with Tier-1 liquidity bridge and risk checks',
    ipAddress: '195.158.2.14',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'aud_2',
    actorId: 'usr_compliance',
    actorEmail: 'compliance@exorafx.com',
    actorRole: 'compliance_admin',
    action: 'APPROVE_KYC',
    targetEntity: 'kyc',
    targetId: 'kyc_01',
    details: 'Passport verification approved for Azizbek Rahimov',
    ipAddress: '195.158.2.19',
    createdAt: '2024-02-01T11:45:00Z',
  }
];

class BrokerStoreManager {
  private users: BrokerUser[] = getStored('users', DEFAULT_USERS);
  private accounts: TradingAccount[] = getStored('accounts', DEFAULT_ACCOUNTS);
  private positions: Position[] = getStored('positions', DEFAULT_POSITIONS);
  private transactions: Transaction[] = getStored('transactions', DEFAULT_TRANSACTIONS);
  private kycList: KycRecord[] = getStored('kyc', DEFAULT_KYC_LIST);
  private auditLogs: AuditLogItem[] = getStored('audit_logs', DEFAULT_AUDIT_LOGS);
  private symbols: ForexSymbolRate[] = getStored('symbols', INITIAL_SYMBOLS);
  private pendingOrders: PendingOrder[] = getStored('pending_orders', []);
  private economicEvents: EconomicEvent[] = getStored('economic_events', DEFAULT_ECONOMIC_EVENTS);
  private oneClickTradingEnabled: boolean = getStored('one_click_trading', false);
  private activeUser: BrokerUser = getStored('active_user', DEFAULT_USERS[0]); // Default to AVAZJON
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Ensure AVAZJON exists in users
    const hasAvazjon = this.users.some(u => u.id === 'usr_avazjon' || u.fullName === 'AVAZJON');
    if (!hasAvazjon) {
      this.users.unshift(DEFAULT_USERS[0]);
      setStored('users', this.users);
    }
    
    // Ensure primary active account #3201288 exists
    const has3201288 = this.accounts.some(a => a.accountNumber === '3201288');
    if (!has3201288) {
      const primaryAcc = DEFAULT_ACCOUNTS.find(a => a.accountNumber === '3201288') || {
        id: 'acc_3201288',
        userId: 'usr_avazjon',
        accountNumber: '3201288',
        accountType: 'pro',
        platform: 'MT5',
        nickname: 'Standard',
        currency: 'USD',
        balance: 152.40,
        equity: 152.40,
        margin: 0,
        freeMargin: 152.40,
        marginLevel: 0,
        leverage: 200,
        server: 'ExoraPrime-Live01',
        isDemo: false,
        isArchived: false,
        createdAt: '2026-03-01T10:00:00Z',
      };
      // Put primary account first
      this.accounts = [primaryAcc, ...this.accounts.filter(a => a.accountNumber !== '3201288')];
      setStored('accounts', this.accounts);
    } else {
      // Ensure #3201288 is unarchived and has 152.40 balance
      this.accounts = this.accounts.map(a => {
        if (a.accountNumber === '3201288') {
          return {
            ...a,
            server: 'ExoraPrime-Live01',
            leverage: 200,
            nickname: 'Standard',
            accountType: 'pro',
            platform: 'MT5',
            balance: 152.40,
            equity: 152.40,
            freeMargin: 152.40,
            margin: 0,
            marginLevel: 0,
            isArchived: false,
          };
        }
        return a;
      });
      setStored('accounts', this.accounts);
    }

    // Set positions to default (0 open positions as requested, 3 closed history for Savdolar Tarixi)
    this.positions = DEFAULT_POSITIONS;
    setStored('positions', this.positions);

    // Set active user to AVAZJON
    const avaz = this.users.find(u => u.id === 'usr_avazjon') || DEFAULT_USERS[0];
    this.activeUser = avaz;
    setStored('active_user', this.activeUser);

    // Periodically update live prices realistically
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.tickMarketRates();
      }, 3000);
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  private tickMarketRates(): void {
    let changed = false;
    this.symbols = this.symbols.map((sym) => {
      // Small random walk between -0.05% and +0.05%
      const delta = (Math.random() - 0.49) * 0.0006 * sym.bid;
      const newBid = Number((sym.bid + delta).toFixed(sym.digitPrecision));
      const spreadVal = sym.spread * (sym.digitPrecision === 5 ? 0.0001 : sym.digitPrecision === 3 ? 0.01 : 0.1);
      const newAsk = Number((newBid + spreadVal).toFixed(sym.digitPrecision));
      changed = true;
      return {
        ...sym,
        bid: newBid,
        ask: newAsk,
        high24h: Math.max(sym.high24h, newAsk),
        low24h: Math.min(sym.low24h, newBid),
      };
    });

    // Recalculate open positions P&L
    this.positions = this.positions.map((pos) => {
      if (pos.status !== 'open') return pos;
      const sym = this.symbols.find((s) => s.symbol === pos.symbol);
      if (!sym) return pos;

      const currentPrice = pos.side === 'buy' ? sym.bid : sym.ask;
      const pointDiff = pos.side === 'buy' ? (currentPrice - pos.openPrice) : (pos.openPrice - currentPrice);
      
      let multiplier = 100000; // Standard 1 lot in forex
      if (pos.symbol === 'XAU/USD') multiplier = 100;
      if (pos.symbol === 'BTC/USD' || pos.symbol === 'US30') multiplier = 1;

      const calculatedPnl = Number((pointDiff * pos.lotSize * multiplier + pos.swap + pos.commission).toFixed(2));

      return {
        ...pos,
        currentPrice,
        pnl: calculatedPnl,
      };
    });

    if (changed) {
      this.recalculateAccountsEquity();
      this.notify();
    }
  }

  private recalculateAccountsEquity(): void {
    this.accounts = this.accounts.map((acc) => {
      const openPositions = this.positions.filter((p) => p.accountId === acc.id && p.status === 'open');
      const totalPnl = openPositions.reduce((sum, p) => sum + p.pnl, 0);
      const equity = Number((acc.balance + totalPnl).toFixed(2));
      const freeMargin = Number(Math.max(0, equity - acc.margin).toFixed(2));
      const marginLevel = acc.margin > 0 ? Number(((equity / acc.margin) * 100).toFixed(2)) : 0;

      return {
        ...acc,
        equity,
        freeMargin,
        marginLevel,
      };
    });
    setStored('accounts', this.accounts);
  }

  // GETTERS
  getActiveUser(): BrokerUser {
    return this.activeUser;
  }

  getAllUsers(): BrokerUser[] {
    return this.users;
  }

  getAccounts(userId?: string): TradingAccount[] {
    const uid = userId || this.activeUser.id;
    return this.accounts.filter((a) => a.userId === uid);
  }

  getPositions(accountId?: string): Position[] {
    if (!accountId) {
      const userAccounts = this.getAccounts();
      const ids = new Set(userAccounts.map((a) => a.id));
      return this.positions.filter((p) => ids.has(p.accountId));
    }
    return this.positions.filter((p) => p.accountId === accountId);
  }

  getTransactions(userId?: string): Transaction[] {
    if (!userId && this.activeUser.role !== 'client') {
      return this.transactions;
    }
    const uid = userId || this.activeUser.id;
    return this.transactions.filter((t) => t.userId === uid);
  }

  getKycList(): KycRecord[] {
    return this.kycList;
  }

  getUserKyc(userId?: string): KycRecord | undefined {
    const uid = userId || this.activeUser.id;
    return this.kycList.find((k) => k.userId === uid);
  }

  getAuditLogs(): AuditLogItem[] {
    return this.auditLogs;
  }

  getSymbols(): ForexSymbolRate[] {
    return this.symbols;
  }

  getEconomicEvents(): EconomicEvent[] {
    return this.economicEvents;
  }

  getPendingOrders(accountId?: string): PendingOrder[] {
    if (!accountId) {
      const userAccounts = this.getAccounts();
      const ids = new Set(userAccounts.map((a) => a.id));
      return this.pendingOrders.filter((o) => ids.has(o.accountId));
    }
    return this.pendingOrders.filter((o) => o.accountId === accountId);
  }

  isOneClickTrading(): boolean {
    return this.oneClickTradingEnabled;
  }

  setOneClickTrading(enabled: boolean): void {
    this.oneClickTradingEnabled = enabled;
    setStored('one_click_trading', enabled);
    this.notify();
  }

  // ACTIONS
  switchUser(userId: string): void {
    const target = this.users.find((u) => u.id === userId);
    if (target) {
      this.activeUser = target;
      setStored('active_user', target);
      this.addAuditLog(target.id, target.email, target.role, 'USER_SWITCH', 'user', target.id, `Switched context to ${target.fullName} (${target.role})`);
      this.notify();
    }
  }

  createTradingAccount(accountType: 'standard' | 'pro' | 'ecn', isDemo: boolean): TradingAccount {
    const newAcc: TradingAccount = {
      id: `acc_${Date.now()}`,
      userId: this.activeUser.id,
      accountNumber: String(Math.floor(1000000 + Math.random() * 9000000)),
      accountType,
      currency: 'USD',
      balance: isDemo ? 10000 : 0,
      equity: isDemo ? 10000 : 0,
      margin: 0,
      freeMargin: isDemo ? 10000 : 0,
      marginLevel: 0,
      leverage: accountType === 'standard' ? 500 : accountType === 'pro' ? 200 : 100,
      server: isDemo ? 'ExoraPrime-Demo' : 'ExoraPrime-Live01',
      isDemo,
      createdAt: new Date().toISOString(),
    };

    this.accounts.push(newAcc);
    setStored('accounts', this.accounts);
    this.addAuditLog(this.activeUser.id, this.activeUser.email, this.activeUser.role, 'CREATE_ACCOUNT', 'trading_account', newAcc.id, `Created ${accountType} account #${newAcc.accountNumber}`);
    this.notify();
    return newAcc;
  }

  openPosition(params: {
    accountId: string;
    symbol: string;
    side: 'buy' | 'sell';
    lotSize: number;
    sl?: number;
    tp?: number;
  }): Position {
    const sym = this.symbols.find((s) => s.symbol === params.symbol);
    const openPrice = sym ? (params.side === 'buy' ? sym.ask : sym.bid) : 1.08433;
    const account = this.accounts.find((a) => a.id === params.accountId);
    const leverage = account?.leverage || 500;

    // Margin estimation: (lotSize * 100,000 / leverage)
    let contract = 100000;
    if (params.symbol === 'XAU/USD') contract = 100;
    if (params.symbol === 'BTC/USD' || params.symbol === 'US30') contract = 1;
    const requiredMargin = Number(((params.lotSize * contract * openPrice) / leverage).toFixed(2));

    const newPosition: Position = {
      id: `pos_${Date.now()}`,
      accountId: params.accountId,
      symbol: params.symbol,
      side: params.side,
      lotSize: params.lotSize,
      openPrice,
      currentPrice: openPrice,
      sl: params.sl,
      tp: params.tp,
      commission: account?.accountType === 'ecn' ? Number((params.lotSize * 6).toFixed(2)) : 0,
      swap: 0,
      pnl: 0,
      status: 'open',
      openedAt: new Date().toISOString(),
    };

    if (account) {
      account.margin += requiredMargin;
      account.freeMargin = Math.max(0, account.equity - account.margin);
      setStored('accounts', this.accounts);
    }

    this.positions.unshift(newPosition);
    setStored('positions', this.positions);
    this.notify();
    return newPosition;
  }

  closePosition(positionId: string): void {
    const pos = this.positions.find((p) => p.id === positionId);
    if (!pos || pos.status !== 'open') return;

    pos.status = 'closed';
    pos.closePrice = pos.currentPrice;
    pos.closedAt = new Date().toISOString();

    const account = this.accounts.find((a) => a.id === pos.accountId);
    if (account) {
      account.balance = Number((account.balance + pos.pnl).toFixed(2));
      // Release margin
      let contract = 100000;
      if (pos.symbol === 'XAU/USD') contract = 100;
      if (pos.symbol === 'BTC/USD' || pos.symbol === 'US30') contract = 1;
      const marginReleased = (pos.lotSize * contract * pos.openPrice) / (account.leverage || 500);
      account.margin = Math.max(0, Number((account.margin - marginReleased).toFixed(2)));
    }

    setStored('positions', this.positions);
    setStored('accounts', this.accounts);
    this.recalculateAccountsEquity();
    this.notify();
  }

  closeAllPositions(accountId?: string): number {
    const openList = this.positions.filter(p => p.status === 'open' && (!accountId || p.accountId === accountId));
    openList.forEach(pos => {
      this.closePosition(pos.id);
    });
    return openList.length;
  }

  partialClosePosition(posId: string, closeLot: number): void {
    const pos = this.positions.find(p => p.id === posId && p.status === 'open');
    if (!pos) return;

    if (closeLot >= pos.lotSize) {
      this.closePosition(posId);
      return;
    }

    const ratio = closeLot / pos.lotSize;
    const partialPnl = Number((pos.pnl * ratio).toFixed(2));

    // Record closed part into history
    const closedPart: Position = {
      ...pos,
      id: `pos_part_${Date.now()}`,
      lotSize: closeLot,
      pnl: partialPnl,
      status: 'closed',
      closedAt: new Date().toISOString(),
    };
    this.positions.unshift(closedPart);

    // Update remaining position
    pos.lotSize = Number((pos.lotSize - closeLot).toFixed(2));
    pos.pnl = Number((pos.pnl - partialPnl).toFixed(2));

    const account = this.accounts.find(a => a.id === pos.accountId);
    if (account) {
      account.balance = Number((account.balance + partialPnl).toFixed(2));
      let contract = 100000;
      if (pos.symbol === 'XAU/USD' || pos.symbol === 'XAU/USD247') contract = 100;
      if (pos.symbol === 'BTC' || pos.symbol === 'BTC/USD' || pos.symbol === 'BTC/USDT' || pos.symbol === 'US30') contract = 1;
      const marginReleased = (closeLot * contract * pos.openPrice) / (account.leverage || 500);
      account.margin = Math.max(0, Number((account.margin - marginReleased).toFixed(2)));
    }

    setStored('positions', this.positions);
    setStored('accounts', this.accounts);
    this.recalculateAccountsEquity();
    this.notify();
  }

  updatePositionSlTp(posId: string, sl?: number, tp?: number): void {
    const pos = this.positions.find(p => p.id === posId && p.status === 'open');
    if (pos) {
      pos.sl = sl;
      pos.tp = tp;
      setStored('positions', this.positions);
      this.notify();
    }
  }

  createPendingOrder(params: {
    accountId: string;
    symbol: string;
    type: 'buy_limit' | 'sell_limit' | 'buy_stop' | 'sell_stop';
    lotSize: number;
    targetPrice: number;
    sl?: number;
    tp?: number;
  }): PendingOrder {
    const sym = this.symbols.find(s => s.symbol === params.symbol);
    const newOrder: PendingOrder = {
      id: `pend_${Date.now()}`,
      accountId: params.accountId,
      symbol: params.symbol,
      type: params.type,
      lotSize: params.lotSize,
      targetPrice: params.targetPrice,
      currentPrice: sym ? (params.type.includes('buy') ? sym.ask : sym.bid) : 0,
      sl: params.sl,
      tp: params.tp,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    this.pendingOrders.unshift(newOrder);
    setStored('pending_orders', this.pendingOrders);
    this.notify();
    return newOrder;
  }

  cancelPendingOrder(orderId: string): void {
    this.pendingOrders = this.pendingOrders.filter(o => o.id !== orderId);
    setStored('pending_orders', this.pendingOrders);
    this.notify();
  }

  createDeposit(params: {
    accountId: string;
    amount: number;
    paymentMethod: 'payme' | 'click' | 'uzcard_humo' | 'crypto_usdt';
    details?: any;
  }): Transaction {
    const account = this.accounts.find((a) => a.id === params.accountId);
    const tx: Transaction = {
      id: `tx_dep_${Date.now()}`,
      userId: this.activeUser.id,
      userEmail: this.activeUser.email,
      userName: this.activeUser.fullName,
      accountId: params.accountId,
      accountNumber: account?.accountNumber,
      type: 'deposit',
      amount: params.amount,
      fee: 0,
      netAmount: params.amount,
      currency: 'USD',
      paymentMethod: params.paymentMethod,
      paymentDetails: params.details || {},
      status: 'completed', // Instant deposit
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    };

    if (account) {
      account.balance += params.amount;
      account.equity += params.amount;
      account.freeMargin += params.amount;
      setStored('accounts', this.accounts);
    }

    this.transactions.unshift(tx);
    setStored('transactions', this.transactions);
    this.addAuditLog(this.activeUser.id, this.activeUser.email, this.activeUser.role, 'DEPOSIT', 'transaction', tx.id, `Deposited $${params.amount} via ${params.paymentMethod}`);
    this.notify();
    return tx;
  }

  createWithdrawal(params: {
    accountId: string;
    amount: number;
    paymentMethod: 'payme' | 'click' | 'uzcard_humo' | 'crypto_usdt' | 'bank_wire';
    details?: any;
  }): Transaction {
    const account = this.accounts.find((a) => a.id === params.accountId);
    if (!account || account.freeMargin < params.amount) {
      throw new Error("Mablag' yetarli emas yoki erkin marja cheklovi mavjud");
    }

    const tx: Transaction = {
      id: `tx_with_${Date.now()}`,
      userId: this.activeUser.id,
      userEmail: this.activeUser.email,
      userName: this.activeUser.fullName,
      accountId: params.accountId,
      accountNumber: account.accountNumber,
      type: 'withdrawal',
      amount: params.amount,
      fee: 0,
      netAmount: params.amount,
      currency: 'USD',
      paymentMethod: params.paymentMethod,
      paymentDetails: params.details || {},
      status: 'pending', // Requires maker-checker admin approval
      createdAt: new Date().toISOString(),
    };

    // Hold funds
    account.balance = Number((account.balance - params.amount).toFixed(2));
    account.equity = Number((account.equity - params.amount).toFixed(2));
    account.freeMargin = Math.max(0, account.equity - account.margin);
    setStored('accounts', this.accounts);

    this.transactions.unshift(tx);
    setStored('transactions', this.transactions);
    this.addAuditLog(this.activeUser.id, this.activeUser.email, this.activeUser.role, 'WITHDRAWAL_REQUEST', 'transaction', tx.id, `Requested withdrawal of $${params.amount}`);
    this.notify();
    return tx;
  }

  submitKyc(data: {
    documentType: 'passport' | 'id_card' | 'drivers_license';
    documentNumber: string;
    idFrontUrl: string;
    selfieUrl: string;
  }): KycRecord {
    const existingIndex = this.kycList.findIndex((k) => k.userId === this.activeUser.id);
    const newKyc: KycRecord = {
      id: `kyc_${Date.now()}`,
      userId: this.activeUser.id,
      userEmail: this.activeUser.email,
      userName: this.activeUser.fullName,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      idFrontUrl: data.idFrontUrl,
      selfieUrl: data.selfieUrl,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.kycList[existingIndex] = newKyc;
    } else {
      this.kycList.unshift(newKyc);
    }

    this.activeUser.kycStatus = 'pending';
    setStored('kyc', this.kycList);
    setStored('active_user', this.activeUser);
    this.addAuditLog(this.activeUser.id, this.activeUser.email, this.activeUser.role, 'SUBMIT_KYC', 'kyc', newKyc.id, `Submitted KYC documents for verification`);
    this.notify();
    return newKyc;
  }

  // ADMIN OPERATIONS
  reviewKyc(kycId: string, approve: boolean, reason?: string): void {
    const kyc = this.kycList.find((k) => k.id === kycId);
    if (!kyc) return;

    kyc.status = approve ? 'approved' : 'rejected';
    kyc.reviewedBy = this.activeUser.fullName;
    kyc.reviewedAt = new Date().toISOString();
    kyc.rejectionReason = reason;

    const targetUser = this.users.find((u) => u.id === kyc.userId);
    if (targetUser) {
      targetUser.kycStatus = kyc.status;
      setStored('users', this.users);
      if (this.activeUser.id === targetUser.id) {
        this.activeUser.kycStatus = kyc.status;
        setStored('active_user', this.activeUser);
      }
    }

    setStored('kyc', this.kycList);
    this.addAuditLog(this.activeUser.id, this.activeUser.email, this.activeUser.role, approve ? 'APPROVE_KYC' : 'REJECT_KYC', 'kyc', kyc.id, `${approve ? 'Approved' : 'Rejected'} KYC for ${kyc.userName}. Reason: ${reason || 'Compliant'}`);
    this.notify();
  }

  processWithdrawal(txId: string, action: 'approve' | 'reject', note?: string): void {
    const tx = this.transactions.find((t) => t.id === txId);
    if (!tx || tx.type !== 'withdrawal') return;

    if (action === 'approve') {
      tx.status = 'completed';
      tx.processedAt = new Date().toISOString();
      tx.checkerAdmin = this.activeUser.fullName;
      this.addAuditLog(this.activeUser.id, this.activeUser.email, this.activeUser.role, 'APPROVE_WITHDRAWAL', 'transaction', tx.id, `Approved withdrawal $${tx.amount} to ${tx.paymentMethod}`);
    } else {
      tx.status = 'rejected';
      tx.rejectionReason = note || 'Admin rejection';
      tx.processedAt = new Date().toISOString();

      // Refund to account
      if (tx.accountId) {
        const account = this.accounts.find((a) => a.id === tx.accountId);
        if (account) {
          account.balance = Number((account.balance + tx.amount).toFixed(2));
          account.equity = Number((account.equity + tx.amount).toFixed(2));
          account.freeMargin = Math.max(0, account.equity - account.margin);
          setStored('accounts', this.accounts);
        }
      }
      this.addAuditLog(this.activeUser.id, this.activeUser.email, this.activeUser.role, 'REJECT_WITHDRAWAL', 'transaction', tx.id, `Rejected withdrawal $${tx.amount}. Refunded.`);
    }

    setStored('transactions', this.transactions);
    this.notify();
  }

  registerUser(payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    referralCode?: string;
  }): BrokerUser {
    const existing = this.users.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());
    if (existing) {
      throw new Error("Bu email bilan foydalanuvchi allaqachon mavjud");
    }

    const newUser: BrokerUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: payload.email,
      fullName: payload.fullName,
      phone: payload.phone,
      country: 'Uzbekistan',
      role: 'client',
      is2faEnabled: true,
      kycStatus: 'unsubmitted',
      status: 'active',
      referralCode: `EXORA${Math.floor(1000 + Math.random() * 9000)}`,
      referredBy: payload.referralCode,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    setStored('users', this.users);

    // Automatically create default Demo and Standard Live trading accounts for the new client
    const demoAcc: TradingAccount = {
      id: `acc_${Date.now()}_demo`,
      userId: newUser.id,
      accountNumber: Math.floor(1000000 + Math.random() * 9000000).toString(),
      accountType: 'standard',
      isDemo: true,
      balance: 10000,
      equity: 10000,
      margin: 0,
      freeMargin: 10000,
      marginLevel: 0,
      leverage: 500,
      currency: 'USD',
      server: 'ExoraPrime-Demo01',
      createdAt: new Date().toISOString(),
    };

    const liveAcc: TradingAccount = {
      id: `acc_${Date.now()}_live`,
      userId: newUser.id,
      accountNumber: Math.floor(1000000 + Math.random() * 9000000).toString(),
      accountType: 'standard',
      isDemo: false,
      balance: 0,
      equity: 0,
      margin: 0,
      freeMargin: 0,
      marginLevel: 0,
      leverage: 500,
      currency: 'USD',
      server: 'ExoraPrime-Live01',
      createdAt: new Date().toISOString(),
    };

    this.accounts.push(demoAcc, liveAcc);
    setStored('accounts', this.accounts);

    this.activeUser = newUser;
    setStored('active_user', this.activeUser);

    this.addAuditLog(newUser.id, newUser.email, newUser.role, 'REGISTER_USER', 'user', newUser.id, `User ${newUser.fullName} registered with 2FA and default accounts`);
    this.notify();
    return newUser;
  }

  toggleUserStatus(userId: string): void {
    const target = this.users.find((u) => u.id === userId);
    if (!target) return;

    target.status = target.status === 'active' ? 'suspended' : 'active';
    setStored('users', this.users);
    this.addAuditLog(this.activeUser.id, this.activeUser.email, this.activeUser.role, 'TOGGLE_USER_STATUS', 'user', target.id, `Changed ${target.fullName} status to ${target.status}`);
    this.notify();
  }

  restoreAccount(accountIdOrNumber: string): TradingAccount {
    const acc = this.accounts.find((a) => a.id === accountIdOrNumber || a.accountNumber === accountIdOrNumber);
    if (!acc) {
      throw new Error("Account not found");
    }

    acc.isArchived = false;
    // Set active initial balance if it was unavailable
    if (acc.balance === 0) {
      acc.balance = acc.isDemo ? 10000 : 250.00;
      acc.equity = acc.balance;
      acc.freeMargin = acc.balance;
    }

    setStored('accounts', this.accounts);
    this.addAuditLog(this.activeUser.id, this.activeUser.email, this.activeUser.role, 'RESTORE_ACCOUNT', 'account', acc.id, `Restored account #${acc.accountNumber}`);
    this.notify();
    return acc;
  }

  archiveAccount(accountIdOrNumber: string): void {
    const acc = this.accounts.find((a) => a.id === accountIdOrNumber || a.accountNumber === accountIdOrNumber);
    if (!acc) return;

    acc.isArchived = true;
    acc.archivedAt = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ` at ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} (UTC+5)`;
    setStored('accounts', this.accounts);
    this.addAuditLog(this.activeUser.id, this.activeUser.email, this.activeUser.role, 'ARCHIVE_ACCOUNT', 'account', acc.id, `Archived account #${acc.accountNumber}`);
    this.notify();
  }

  openNewTradingAccount(payload: {
    accountType: AccountType;
    platform?: 'MT4' | 'MT5' | 'Exora Terminal';
    isDemo: boolean;
    leverage?: number;
    currency?: string;
    nickname?: string;
    initialBalance?: number;
  }): TradingAccount {
    const isDemo = payload.isDemo;
    const initialBal = isDemo ? (payload.initialBalance || 10000) : (payload.initialBalance || 0);

    // Realistic account number (e.g., 250xxxxxx)
    const newAccountNumber = Math.floor(250000000 + Math.random() * 9999999).toString();
    const newAcc: TradingAccount = {
      id: `acc_${newAccountNumber}`,
      userId: this.activeUser.id,
      accountNumber: newAccountNumber,
      accountType: payload.accountType,
      platform: payload.platform || 'MT5',
      nickname: payload.nickname || (payload.accountType.charAt(0).toUpperCase() + payload.accountType.slice(1)),
      currency: payload.currency || 'USD',
      balance: initialBal,
      equity: initialBal,
      margin: 0,
      freeMargin: initialBal,
      marginLevel: 0,
      leverage: payload.leverage || 2000,
      server: isDemo ? 'ExoraPrime-Demo01' : 'ExoraPrime-Live01',
      isDemo: isDemo,
      isArchived: false,
      createdAt: new Date().toISOString(),
    };

    this.accounts.unshift(newAcc);
    setStored('accounts', this.accounts);
    this.addAuditLog(this.activeUser.id, this.activeUser.email, this.activeUser.role, 'OPEN_ACCOUNT', 'account', newAcc.id, `Opened new ${newAcc.platform} ${newAcc.accountType} account #${newAcc.accountNumber}`);
    this.notify();
    return newAcc;
  }

  submitAddressVerification(payload: {
    country: string;
    city: string;
    addressLine: string;
    postalCode: string;
    documentType?: string;
    documentUrl?: string;
  }): void {
    const user = this.users.find(u => u.id === this.activeUser.id) || this.activeUser;
    user.residentialAddress = {
      ...payload,
      submittedAt: new Date().toISOString(),
    };
    user.addressVerificationNotice = {
      status: 'under_review',
      message: 'Address document has been submitted and is currently being verified by compliance.',
    };
    user.addressVerified = false;

    setStored('users', this.users);
    this.activeUser = { ...user };
    setStored('active_user', this.activeUser);
    this.addAuditLog(this.activeUser.id, this.activeUser.email, this.activeUser.role, 'SUBMIT_ADDRESS_KYC', 'user', user.id, `Submitted residential address in ${payload.city}, ${payload.country}`);
    this.notify();
  }

  dismissAddressNotice(): void {
    if (this.activeUser.addressVerificationNotice) {
      delete this.activeUser.addressVerificationNotice;
      setStored('active_user', this.activeUser);
      const u = this.users.find(x => x.id === this.activeUser.id);
      if (u) {
        delete u.addressVerificationNotice;
        setStored('users', this.users);
      }
      this.notify();
    }
  }

  transferFunds(payload: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
  }): void {
    const fromAcc = this.accounts.find(a => a.id === payload.fromAccountId);
    const toAcc = this.accounts.find(a => a.id === payload.toAccountId);
    if (!fromAcc || !toAcc) {
      throw new Error("One of the accounts was not found");
    }
    if (fromAcc.freeMargin < payload.amount) {
      throw new Error("Insufficient free margin in source account");
    }

    fromAcc.balance = Number((fromAcc.balance - payload.amount).toFixed(2));
    fromAcc.equity = Number((fromAcc.equity - payload.amount).toFixed(2));
    fromAcc.freeMargin = Math.max(0, fromAcc.equity - fromAcc.margin);

    toAcc.balance = Number((toAcc.balance + payload.amount).toFixed(2));
    toAcc.equity = Number((toAcc.equity + payload.amount).toFixed(2));
    toAcc.freeMargin = Math.max(0, toAcc.equity - toAcc.margin);

    const tx: Transaction = {
      id: `tx_trf_${Date.now()}`,
      userId: this.activeUser.id,
      userEmail: this.activeUser.email,
      userName: this.activeUser.fullName,
      accountId: fromAcc.id,
      accountNumber: fromAcc.accountNumber,
      type: 'transfer',
      amount: payload.amount,
      fee: 0,
      netAmount: payload.amount,
      currency: fromAcc.currency,
      paymentMethod: 'payme',
      status: 'completed',
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    };
    this.transactions.unshift(tx);

    setStored('accounts', this.accounts);
    setStored('transactions', this.transactions);
    this.addAuditLog(this.activeUser.id, this.activeUser.email, this.activeUser.role, 'TRANSFER_FUNDS', 'transaction', tx.id, `Transferred $${payload.amount} from #${fromAcc.accountNumber} to #${toAcc.accountNumber}`);
    this.notify();
  }

  updateSymbolSpread(symbol: string, newSpread: number): void {
    const sym = this.symbols.find((s) => s.symbol === symbol);
    if (sym) {
      sym.spread = newSpread;
      setStored('symbols', this.symbols);
      this.addAuditLog(this.activeUser.id, this.activeUser.email, this.activeUser.role, 'UPDATE_SPREAD', 'settings', symbol, `Adjusted ${symbol} spread to ${newSpread} pips`);
      this.notify();
    }
  }

  private addAuditLog(actorId: string, actorEmail: string, actorRole: UserRole, action: string, targetEntity: string, targetId?: string, details = ''): void {
    const log: AuditLogItem = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId,
      actorEmail,
      actorRole,
      action,
      targetEntity,
      targetId,
      details,
      ipAddress: '195.158.2.14',
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    // Keep max 200 logs
    if (this.auditLogs.length > 200) this.auditLogs.pop();
    setStored('audit_logs', this.auditLogs);
  }
}

export const brokerStore = new BrokerStoreManager();
