class TradingEngineService {
  constructor() {
    this.symbols = /* @__PURE__ */ new Map();
    this.accounts = /* @__PURE__ */ new Map();
    this.positions = /* @__PURE__ */ new Map();
    this.candles = /* @__PURE__ */ new Map();
    this.nextTicket = 100010;
    // Listeners for WebSocket broadcast
    this.onTickListeners = [];
    this.onAccountUpdateListeners = [];
    this.onPositionUpdateListeners = [];
    this.initSymbols();
    this.initDefaultAccount();
    this.initCandleHistories();
    this.startLivePriceFeed();
    this.startStopOutMonitor();
  }
  initSymbols() {
    const list = [
      {
        symbol: "XAUUSD",
        name: "Gold / US Dollar",
        contractSize: 100,
        digits: 2,
        pipSize: 0.01,
        bid: 2685.5,
        ask: 2685.85,
        spread: 0.35,
        high24h: 2698,
        low24h: 2670
      },
      {
        symbol: "EURUSD",
        name: "Euro / US Dollar",
        contractSize: 1e5,
        digits: 5,
        pipSize: 1e-4,
        bid: 1.0845,
        ask: 1.08462,
        spread: 12e-5,
        high24h: 1.088,
        low24h: 1.082
      },
      {
        symbol: "BTCUSD",
        name: "Bitcoin / US Dollar",
        contractSize: 1,
        digits: 2,
        pipSize: 0.01,
        bid: 84050,
        ask: 84065,
        spread: 15,
        high24h: 85200,
        low24h: 83100
      },
      {
        symbol: "GBPUSD",
        name: "Great Britain Pound / USD",
        contractSize: 1e5,
        digits: 5,
        pipSize: 1e-4,
        bid: 1.2721,
        ask: 1.27225,
        spread: 15e-5,
        high24h: 1.276,
        low24h: 1.269
      },
      {
        symbol: "USDJPY",
        name: "US Dollar / Japanese Yen",
        contractSize: 1e5,
        digits: 3,
        pipSize: 0.01,
        bid: 154.6,
        ask: 154.615,
        spread: 0.015,
        high24h: 155.2,
        low24h: 154.1
      }
    ];
    list.forEach((s) => this.symbols.set(s.symbol, s));
  }
  initDefaultAccount() {
    const defaultAcc = {
      id: "acc_demo_3201288",
      userId: "usr_default",
      accountNumber: "3201288",
      currency: "USD",
      balance: 1e4,
      equity: 1e4,
      margin: 0,
      freeMargin: 1e4,
      marginLevel: 0,
      leverage: 100,
      // 1:100 leverage
      isDemo: true,
      tier: "Standard"
    };
    this.accounts.set(defaultAcc.id, defaultAcc);
  }
  initCandleHistories() {
    const now = Math.floor(Date.now() / 1e3);
    const step = 60;
    for (const [sym, config] of this.symbols.entries()) {
      const arr = [];
      let cur = config.bid * 0.99;
      for (let i = 120; i >= 0; i--) {
        const time = now - i * step;
        const delta = (Math.random() - 0.49) * (config.bid * 1e-3);
        const open = cur;
        const close = open + delta;
        const high = Math.max(open, close) + Math.random() * (config.bid * 5e-4);
        const low = Math.min(open, close) - Math.random() * (config.bid * 5e-4);
        const volume = Math.floor(10 + Math.random() * 90);
        arr.push({
          time,
          open: Number(open.toFixed(config.digits)),
          high: Number(high.toFixed(config.digits)),
          low: Number(low.toFixed(config.digits)),
          close: Number(close.toFixed(config.digits)),
          volume
        });
        cur = close;
      }
      this.candles.set(sym, arr);
    }
  }
  // 1. LIVE MARKET FEED GENERATOR & STREAMER
  startLivePriceFeed() {
    setInterval(() => {
      for (const [sym, config] of this.symbols.entries()) {
        const factor = (Math.random() - 0.49) * 3e-4;
        const delta = config.bid * factor;
        const newBid = Number((config.bid + delta).toFixed(config.digits));
        const newAsk = Number((newBid + config.spread).toFixed(config.digits));
        config.bid = newBid;
        config.ask = newAsk;
        config.high24h = Math.max(config.high24h, newAsk);
        config.low24h = Math.min(config.low24h, newBid);
        const candleList = this.candles.get(sym);
        if (candleList && candleList.length > 0) {
          const last = candleList[candleList.length - 1];
          last.close = newBid;
          last.high = Math.max(last.high, newBid);
          last.low = Math.min(last.low, newBid);
          last.volume += 1;
        }
        this.onTickListeners.forEach((cb) => cb(config));
      }
      this.recalculateAllPositions();
    }, 1e3);
  }
  // 2. STOP-OUT AND RISK MANAGEMENT WORKER
  startStopOutMonitor() {
    setInterval(() => {
      this.checkStopOutThresholds();
    }, 1500);
  }
  recalculateAllPositions() {
    let positionChanged = false;
    for (const pos of this.positions.values()) {
      if (pos.status !== "OPEN") continue;
      const sym = this.symbols.get(pos.symbol);
      if (!sym) continue;
      const currentPrice = pos.type === "BUY" ? sym.bid : sym.ask;
      pos.currentPrice = currentPrice;
      const diff = pos.type === "BUY" ? currentPrice - pos.openPrice : pos.openPrice - currentPrice;
      const grossPnl = diff * pos.lots * sym.contractSize;
      pos.pnl = Number((grossPnl - pos.commission + pos.swap).toFixed(2));
      positionChanged = true;
      if (pos.sl && (pos.type === "BUY" && currentPrice <= pos.sl || pos.type === "SELL" && currentPrice >= pos.sl)) {
        this.closePosition(pos.id, "SL hit");
      } else if (pos.tp && (pos.type === "BUY" && currentPrice >= pos.tp || pos.type === "SELL" && currentPrice <= pos.tp)) {
        this.closePosition(pos.id, "TP hit");
      }
    }
    for (const acc of this.accounts.values()) {
      this.recalculateAccountMetrics(acc.id);
    }
    if (positionChanged) {
      this.onPositionUpdateListeners.forEach((cb) => {
        for (const p of this.positions.values()) {
          if (p.status === "OPEN") cb(p);
        }
      });
    }
  }
  recalculateAccountMetrics(accountId) {
    const acc = this.accounts.get(accountId);
    if (!acc) return;
    let totalFloatingPnL = 0;
    let totalLockedMargin = 0;
    for (const pos of this.positions.values()) {
      if (pos.accountId === accountId && pos.status === "OPEN") {
        totalFloatingPnL += pos.pnl;
        totalLockedMargin += pos.lockedMargin;
      }
    }
    acc.equity = Number((acc.balance + totalFloatingPnL).toFixed(2));
    acc.margin = Number(totalLockedMargin.toFixed(2));
    acc.freeMargin = Number((acc.equity - acc.margin).toFixed(2));
    acc.marginLevel = acc.margin > 0 ? Number((acc.equity / acc.margin * 100).toFixed(2)) : 0;
    this.onAccountUpdateListeners.forEach((cb) => cb(acc));
  }
  /**
   * STOP-OUT AUTOMATION (< 20% Margin Level)
   * Liquidates open positions starting from the largest losing position
   */
  checkStopOutThresholds() {
    for (const acc of this.accounts.values()) {
      if (acc.margin <= 0) continue;
      if (acc.marginLevel > 0 && acc.marginLevel < 20) {
        console.warn(`[STOP-OUT WARNING] Account #${acc.accountNumber} margin level is ${acc.marginLevel}%. Liquidating positions...`);
        const accountOpenPositions = Array.from(this.positions.values()).filter(
          (p) => p.accountId === acc.id && p.status === "OPEN"
        );
        if (accountOpenPositions.length === 0) continue;
        accountOpenPositions.sort((a, b) => a.pnl - b.pnl);
        const worstPosition = accountOpenPositions[0];
        this.closePosition(worstPosition.id, "Stop-Out Auto Liquidation (<20%)", true);
      }
    }
  }
  // 3. CORE OMS API METHODS
  /**
   * Open New Market / Pending Order
   */
  openOrder(params) {
    const acc = this.accounts.get(params.accountId);
    if (!acc) return { success: false, error: "Trading account not found" };
    const sym = this.symbols.get(params.symbol.toUpperCase());
    if (!sym) return { success: false, error: "Symbol not supported" };
    if (params.lots <= 0 || params.lots > 100) {
      return { success: false, error: "Invalid lot size (0.01 to 100)" };
    }
    const execPrice = params.type === "BUY" ? sym.ask : sym.bid;
    const requiredMargin = Number((params.lots * sym.contractSize * execPrice / acc.leverage).toFixed(2));
    if (requiredMargin > acc.freeMargin) {
      return {
        success: false,
        error: `Insufficient margin! Required: $${requiredMargin.toFixed(2)}, Available Free Margin: $${acc.freeMargin.toFixed(2)}`
      };
    }
    const ticket = ++this.nextTicket;
    const newPosition = {
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
      pnl: 0,
      lockedMargin: requiredMargin,
      commission: Number((params.lots * 3.5).toFixed(2)),
      // standard $3.5/lot commission
      swap: 0,
      status: "OPEN",
      openedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.positions.set(newPosition.id, newPosition);
    this.recalculateAccountMetrics(acc.id);
    return { success: true, position: newPosition };
  }
  /**
   * Close Order & Settle Realized PnL to Balance
   */
  closePosition(positionId, reason = "Client Close", isLiquidated = false) {
    const pos = this.positions.get(positionId);
    if (!pos || pos.status !== "OPEN") {
      return { success: false, error: "Position not found or already closed" };
    }
    const sym = this.symbols.get(pos.symbol);
    const closePrice = pos.type === "BUY" ? sym?.bid || pos.currentPrice : sym?.ask || pos.currentPrice;
    const diff = pos.type === "BUY" ? closePrice - pos.openPrice : pos.openPrice - closePrice;
    const contractSize = sym?.contractSize || 1e5;
    const finalPnl = Number((diff * pos.lots * contractSize - pos.commission + pos.swap).toFixed(2));
    pos.status = isLiquidated ? "LIQUIDATED" : "CLOSED";
    pos.closePrice = closePrice;
    pos.pnl = finalPnl;
    pos.closedAt = (/* @__PURE__ */ new Date()).toISOString();
    const acc = this.accounts.get(pos.accountId);
    if (acc) {
      acc.balance = Number((acc.balance + finalPnl).toFixed(2));
      this.recalculateAccountMetrics(acc.id);
    }
    return {
      success: true,
      realizedPnl: finalPnl,
      newBalance: acc?.balance
    };
  }
  /**
   * Deposit Funds to Account (Simulated or Real Gateway)
   */
  depositFunds(accountId, amount) {
    const acc = this.accounts.get(accountId);
    if (!acc) return { success: false, error: "Account not found" };
    if (amount <= 0) return { success: false, error: "Invalid deposit amount" };
    acc.balance = Number((acc.balance + amount).toFixed(2));
    this.recalculateAccountMetrics(acc.id);
    return { success: true, newBalance: acc.balance };
  }
  // 4. WEBSOCKET SUBSCRIPTION HELPERS
  subscribeTicks(cb) {
    this.onTickListeners.push(cb);
    return () => {
      this.onTickListeners = this.onTickListeners.filter((l) => l !== cb);
    };
  }
  subscribeAccountUpdates(cb) {
    this.onAccountUpdateListeners.push(cb);
    return () => {
      this.onAccountUpdateListeners = this.onAccountUpdateListeners.filter((l) => l !== cb);
    };
  }
  subscribePositionUpdates(cb) {
    this.onPositionUpdateListeners.push(cb);
    return () => {
      this.onPositionUpdateListeners = this.onPositionUpdateListeners.filter((l) => l !== cb);
    };
  }
}
const tradingEngine = new TradingEngineService();
export {
  tradingEngine
};
