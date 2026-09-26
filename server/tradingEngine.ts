// server/tradingEngine.ts
// FinTech Core Trading Engine & OMS (Order Management System)

export interface SymbolConfig {
  symbol: string;
  name: string;
  contractSize: number;
  digits: number;
  pipSize: number;
  bid: number;
  ask: number;
  spread: number;
  high24h: number;
  low24h: number;
}

export interface PositionEntity {
  id: string;
  ticket: number;
  userId: string;
  accountId: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  lots: number;
  openPrice: number;
  currentPrice: number;
  closePrice?: number;
  sl?: number;
  tp?: number;
  pnl: number;
  lockedMargin: number;
  commission: number;
  swap: number;
  status: 'OPEN' | 'CLOSED' | 'LIQUIDATED';
  openedAt: string;
  closedAt?: string;
}

export interface AccountEntity {
  id: string;
  userId: string;
  accountNumber: string;
  currency: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number; // in percent, e.g. 500%
  leverage: number; // e.g. 100, 500
  isDemo: boolean;
  tier: 'Standard' | 'Pro' | 'Raw';
}

export interface Candle {
  time: number; // UNIX timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

class TradingEngineService {
  public symbols: Map<string, SymbolConfig> = new Map();
  public accounts: Map<string, AccountEntity> = new Map();
  public positions: Map<string, PositionEntity> = new Map();
  public candles: Map<string, Candle[]> = new Map();
  private nextTicket = 100010;

  // Listeners for WebSocket broadcast
  private onTickListeners: Array<(tick: SymbolConfig) => void> = [];
  private onAccountUpdateListeners: Array<(acc: AccountEntity) => void> = [];
  private onPositionUpdateListeners: Array<(pos: PositionEntity) => void> = [];

  constructor() {
    this.initSymbols();
    this.initDefaultAccount();
    this.initCandleHistories();
    this.startLivePriceFeed();
    this.startStopOutMonitor();
  }

  private initSymbols() {
    const list: SymbolConfig[] = [
      {
        symbol: 'XAUUSD',
        name: 'Gold / US Dollar',
        contractSize: 100,
        digits: 2,
        pipSize: 0.01,
        bid: 2685.50,
        ask: 2685.85,
        spread: 0.35,
        high24h: 2698.00,
        low24h: 2670.00,
      },
      {
        symbol: 'EURUSD',
        name: 'Euro / US Dollar',
        contractSize: 100000,
        digits: 5,
        pipSize: 0.0001,
        bid: 1.08450,
        ask: 1.08462,
        spread: 0.00012,
        high24h: 1.08800,
        low24h: 1.08200,
      },
      {
        symbol: 'BTCUSD',
        name: 'Bitcoin / US Dollar',
        contractSize: 1,
        digits: 2,
        pipSize: 0.01,
        bid: 84050.00,
        ask: 84065.00,
        spread: 15.00,
        high24h: 85200.00,
        low24h: 83100.00,
      },
      {
        symbol: 'GBPUSD',
        name: 'Great Britain Pound / USD',
        contractSize: 100000,
        digits: 5,
        pipSize: 0.0001,
        bid: 1.27210,
        ask: 1.27225,
        spread: 0.00015,
        high24h: 1.27600,
        low24h: 1.26900,
      },
      {
        symbol: 'USDJPY',
        name: 'US Dollar / Japanese Yen',
        contractSize: 100000,
        digits: 3,
        pipSize: 0.01,
        bid: 154.600,
        ask: 154.615,
        spread: 0.015,
        high24h: 155.200,
        low24h: 154.100,
      },
    ];

    list.forEach((s) => this.symbols.set(s.symbol, s));
  }

  private initDefaultAccount() {
    const defaultAcc: AccountEntity = {
      id: 'acc_demo_3201288',
      userId: 'usr_default',
      accountNumber: '3201288',
      currency: 'USD',
      balance: 10000.00,
      equity: 10000.00,
      margin: 0.00,
      freeMargin: 10000.00,
      marginLevel: 0.00,
      leverage: 100, // 1:100 leverage
      isDemo: true,
      tier: 'Standard',
    };
    this.accounts.set(defaultAcc.id, defaultAcc);
  }

  private initCandleHistories() {
    const now = Math.floor(Date.now() / 1000);
    const step = 60; // 1-minute candles

    for (const [sym, config] of this.symbols.entries()) {
      const arr: Candle[] = [];
      let cur = config.bid * 0.99;
      for (let i = 120; i >= 0; i--) {
        const time = now - i * step;
        const delta = (Math.random() - 0.49) * (config.bid * 0.001);
        const open = cur;
        const close = open + delta;
        const high = Math.max(open, close) + Math.random() * (config.bid * 0.0005);
        const low = Math.min(open, close) - Math.random() * (config.bid * 0.0005);
        const volume = Math.floor(10 + Math.random() * 90);
        arr.push({
          time,
          open: Number(open.toFixed(config.digits)),
          high: Number(high.toFixed(config.digits)),
          low: Number(low.toFixed(config.digits)),
          close: Number(close.toFixed(config.digits)),
          volume,
        });
        cur = close;
      }
      this.candles.set(sym, arr);
    }
  }

  // 1. LIVE MARKET FEED GENERATOR & STREAMER
  private startLivePriceFeed() {
    setInterval(() => {
      for (const [sym, config] of this.symbols.entries()) {
        // Micro-walk volatility simulation
        const factor = (Math.random() - 0.49) * 0.0003;
        const delta = config.bid * factor;
        const newBid = Number((config.bid + delta).toFixed(config.digits));
        const newAsk = Number((newBid + config.spread).toFixed(config.digits));

        config.bid = newBid;
        config.ask = newAsk;
        config.high24h = Math.max(config.high24h, newAsk);
        config.low24h = Math.min(config.low24h, newBid);

        // Update latest candle
        const candleList = this.candles.get(sym);
        if (candleList && candleList.length > 0) {
          const last = candleList[candleList.length - 1];
          last.close = newBid;
          last.high = Math.max(last.high, newBid);
          last.low = Math.min(last.low, newBid);
          last.volume += 1;
        }

        // Notify ticker subscribers
        this.onTickListeners.forEach((cb) => cb(config));
      }

      // Re-evaluate open positions floating PnL
      this.recalculateAllPositions();
    }, 1000);
  }

  // 2. STOP-OUT AND RISK MANAGEMENT WORKER
  private startStopOutMonitor() {
    setInterval(() => {
      this.checkStopOutThresholds();
    }, 1500);
  }

  private recalculateAllPositions() {
    let positionChanged = false;

    for (const pos of this.positions.values()) {
      if (pos.status !== 'OPEN') continue;

      const sym = this.symbols.get(pos.symbol);
      if (!sym) continue;

      const currentPrice = pos.type === 'BUY' ? sym.bid : sym.ask;
      pos.currentPrice = currentPrice;

      // PnL Formula: (Current - Open) * Lots * ContractSize (for BUY)
      const diff = pos.type === 'BUY' ? currentPrice - pos.openPrice : pos.openPrice - currentPrice;
      const grossPnl = diff * pos.lots * sym.contractSize;
      pos.pnl = Number((grossPnl - pos.commission + pos.swap).toFixed(2));
      positionChanged = true;

      // Check SL / TP automated hit
      if (pos.sl && ((pos.type === 'BUY' && currentPrice <= pos.sl) || (pos.type === 'SELL' && currentPrice >= pos.sl))) {
        this.closePosition(pos.id, 'SL hit');
      } else if (pos.tp && ((pos.type === 'BUY' && currentPrice >= pos.tp) || (pos.type === 'SELL' && currentPrice <= pos.tp))) {
        this.closePosition(pos.id, 'TP hit');
      }
    }

    // Update account metrics
    for (const acc of this.accounts.values()) {
      this.recalculateAccountMetrics(acc.id);
    }

    if (positionChanged) {
      this.onPositionUpdateListeners.forEach((cb) => {
        for (const p of this.positions.values()) {
          if (p.status === 'OPEN') cb(p);
        }
      });
    }
  }

  private recalculateAccountMetrics(accountId: string) {
    const acc = this.accounts.get(accountId);
    if (!acc) return;

    let totalFloatingPnL = 0;
    let totalLockedMargin = 0;

    for (const pos of this.positions.values()) {
      if (pos.accountId === accountId && pos.status === 'OPEN') {
        totalFloatingPnL += pos.pnl;
        totalLockedMargin += pos.lockedMargin;
      }
    }

    acc.equity = Number((acc.balance + totalFloatingPnL).toFixed(2));
    acc.margin = Number(totalLockedMargin.toFixed(2));
    acc.freeMargin = Number((acc.equity - acc.margin).toFixed(2));
    acc.marginLevel = acc.margin > 0 ? Number(((acc.equity / acc.margin) * 100).toFixed(2)) : 0;

    this.onAccountUpdateListeners.forEach((cb) => cb(acc));
  }

  /**
   * STOP-OUT AUTOMATION (< 20% Margin Level)
   * Liquidates open positions starting from the largest losing position
   */
  private checkStopOutThresholds() {
    for (const acc of this.accounts.values()) {
      if (acc.margin <= 0) continue;

      // When Margin Level drops below 20%
      if (acc.marginLevel > 0 && acc.marginLevel < 20.0) {
        console.warn(`[STOP-OUT WARNING] Account #${acc.accountNumber} margin level is ${acc.marginLevel}%. Liquidating positions...`);

        // Find worst losing position
        const accountOpenPositions = Array.from(this.positions.values()).filter(
          (p) => p.accountId === acc.id && p.status === 'OPEN'
        );

        if (accountOpenPositions.length === 0) continue;

        // Sort ascending by PnL (most negative first)
        accountOpenPositions.sort((a, b) => a.pnl - b.pnl);
        const worstPosition = accountOpenPositions[0];

        this.closePosition(worstPosition.id, 'Stop-Out Auto Liquidation (<20%)', true);
      }
    }
  }

  // 3. CORE OMS API METHODS

  /**
   * Open New Market / Pending Order
   */
  public openOrder(params: {
    accountId: string;
    symbol: string;
    type: 'BUY' | 'SELL';
    lots: number;
    sl?: number;
    tp?: number;
  }): { success: boolean; position?: PositionEntity; error?: string } {
    const acc = this.accounts.get(params.accountId);
    if (!acc) return { success: false, error: 'Trading account not found' };

    const sym = this.symbols.get(params.symbol.toUpperCase());
    if (!sym) return { success: false, error: 'Symbol not supported' };

    if (params.lots <= 0 || params.lots > 100) {
      return { success: false, error: 'Invalid lot size (0.01 to 100)' };
    }

    const execPrice = params.type === 'BUY' ? sym.ask : sym.bid;

    // Margin Calculation Formula:
    // Margin = (Lots * ContractSize * ExecutionPrice) / Leverage
    const requiredMargin = Number(((params.lots * sym.contractSize * execPrice) / acc.leverage).toFixed(2));

    if (requiredMargin > acc.freeMargin) {
      return {
        success: false,
        error: `Insufficient margin! Required: $${requiredMargin.toFixed(2)}, Available Free Margin: $${acc.freeMargin.toFixed(2)}`,
      };
    }

    const ticket = ++this.nextTicket;
    const newPosition: PositionEntity = {
      id: `pos_${Date.now()}_${ticket}`,
      ticket,
      userId: acc.userId,
      accountId: acc.id,
      symbol: sym.symbol,
      type: params.type,
      lots: params.lots,
      openPrice: execPrice,
      currentPrice: execPrice,
      sl: params.sl,
      tp: params.tp,
      pnl: 0.00,
      lockedMargin: requiredMargin,
      commission: Number((params.lots * 3.5).toFixed(2)), // standard $3.5/lot commission
      swap: 0.00,
      status: 'OPEN',
      openedAt: new Date().toISOString(),
    };

    this.positions.set(newPosition.id, newPosition);
    this.recalculateAccountMetrics(acc.id);

    return { success: true, position: newPosition };
  }

  /**
   * Close Order & Settle Realized PnL to Balance
   */
  public closePosition(positionId: string, reason = 'Client Close', isLiquidated = false): {
    success: boolean;
    realizedPnl?: number;
    newBalance?: number;
    error?: string;
  } {
    const pos = this.positions.get(positionId);
    if (!pos || pos.status !== 'OPEN') {
      return { success: false, error: 'Position not found or already closed' };
    }

    const sym = this.symbols.get(pos.symbol);
    const closePrice = pos.type === 'BUY' ? (sym?.bid || pos.currentPrice) : (sym?.ask || pos.currentPrice);

    // Final PnL
    const diff = pos.type === 'BUY' ? closePrice - pos.openPrice : pos.openPrice - closePrice;
    const contractSize = sym?.contractSize || 100000;
    const finalPnl = Number((diff * pos.lots * contractSize - pos.commission + pos.swap).toFixed(2));

    pos.status = isLiquidated ? 'LIQUIDATED' : 'CLOSED';
    pos.closePrice = closePrice;
    pos.pnl = finalPnl;
    pos.closedAt = new Date().toISOString();

    // Settle to account balance
    const acc = this.accounts.get(pos.accountId);
    if (acc) {
      acc.balance = Number((acc.balance + finalPnl).toFixed(2));
      this.recalculateAccountMetrics(acc.id);
    }

    return {
      success: true,
      realizedPnl: finalPnl,
      newBalance: acc?.balance,
    };
  }

  /**
   * Deposit Funds to Account (Simulated or Real Gateway)
   */
  public depositFunds(accountId: string, amount: number): { success: boolean; newBalance?: number; error?: string } {
    const acc = this.accounts.get(accountId);
    if (!acc) return { success: false, error: 'Account not found' };
    if (amount <= 0) return { success: false, error: 'Invalid deposit amount' };

    acc.balance = Number((acc.balance + amount).toFixed(2));
    this.recalculateAccountMetrics(acc.id);
    return { success: true, newBalance: acc.balance };
  }

  // 4. WEBSOCKET SUBSCRIPTION HELPERS
  public subscribeTicks(cb: (tick: SymbolConfig) => void): () => void {
    this.onTickListeners.push(cb);
    return () => {
      this.onTickListeners = this.onTickListeners.filter((l) => l !== cb);
    };
  }

  public subscribeAccountUpdates(cb: (acc: AccountEntity) => void): () => void {
    this.onAccountUpdateListeners.push(cb);
    return () => {
      this.onAccountUpdateListeners = this.onAccountUpdateListeners.filter((l) => l !== cb);
    };
  }

  public subscribePositionUpdates(cb: (pos: PositionEntity) => void): () => void {
    this.onPositionUpdateListeners.push(cb);
    return () => {
      this.onPositionUpdateListeners = this.onPositionUpdateListeners.filter((l) => l !== cb);
    };
  }
}

export const tradingEngine = new TradingEngineService();
