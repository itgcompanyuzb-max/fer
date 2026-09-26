// src/components/trading/RealTimeTradingTerminal.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  DollarSign, 
  ShieldAlert, 
  RefreshCw, 
  CheckCircle2, 
  X, 
  Zap, 
  Globe2, 
  BarChart2, 
  Activity,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { TradingViewChart } from './TradingViewChart';

export interface SymbolTick {
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

export interface PositionRow {
  id: string;
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  lots: number;
  openPrice: number;
  currentPrice: number;
  sl?: number;
  tp?: number;
  pnl: number;
  lockedMargin: number;
  commission: number;
  swap: number;
  status: 'OPEN' | 'CLOSED' | 'LIQUIDATED';
  openedAt: string;
}

export interface AccountState {
  id: string;
  accountNumber: string;
  currency: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  leverage: number;
}

export function RealTimeTradingTerminal() {
  const [symbols, setSymbols] = useState<Map<string, SymbolTick>>(new Map());
  const [selectedSymbolKey, setSelectedSymbolKey] = useState<string>('XAUUSD');
  const [account, setAccount] = useState<AccountState>({
    id: 'acc_demo_3201288',
    accountNumber: '3201288',
    currency: 'USD',
    balance: 10000.0,
    equity: 10000.0,
    margin: 0.0,
    freeMargin: 10000.0,
    marginLevel: 0.0,
    leverage: 100,
  });
  const [positions, setPositions] = useState<PositionRow[]>([]);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [chartMode, setChartMode] = useState<'tradingview' | 'canvas'>('tradingview');

  // Order Placement Form state
  const [lots, setLots] = useState<number>(0.1);
  const [sl, setSl] = useState<string>('');
  const [tp, setTp] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [depositModalOpen, setDepositModalOpen] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<number>(1000);

  const wsRef = useRef<WebSocket | null>(null);

  // 1. CONNECT WEBSOCKET SERVER
  useEffect(() => {
    let reconnectTimeout: any;

    function connectWs() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/trading`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setWsConnected(true);
        console.log('[WS] Connected to Trading Engine at', wsUrl);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'INIT_SNAPSHOT') {
            if (msg.account) setAccount(msg.account);
            if (Array.isArray(msg.positions)) setPositions(msg.positions);
            if (Array.isArray(msg.symbols)) {
              const map = new Map<string, SymbolTick>();
              msg.symbols.forEach((s: SymbolTick) => map.set(s.symbol, s));
              setSymbols(map);
            }
          } else if (msg.type === 'TICK' && msg.data) {
            setSymbols((prev) => {
              const next = new Map(prev);
              next.set(msg.data.symbol, msg.data);
              return next;
            });
          } else if (msg.type === 'ACCOUNT_UPDATE' && msg.data) {
            setAccount(msg.data);
          } else if (msg.type === 'POSITION_UPDATE' && msg.data) {
            setPositions((prev) => {
              const idx = prev.findIndex((p) => p.id === msg.data.id);
              if (idx !== -1) {
                const updated = [...prev];
                updated[idx] = msg.data;
                return updated;
              } else {
                return [msg.data, ...prev];
              }
            });
          }
        } catch (err) {
          console.error('[WS] Parse error', err);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connectWs, 2000);
      };

      wsRef.current = ws;
    }

    connectWs();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const activeSymbol = symbols.get(selectedSymbolKey) || {
    symbol: 'XAUUSD',
    name: 'Gold / US Dollar',
    contractSize: 100,
    digits: 2,
    pipSize: 0.01,
    bid: 2685.5,
    ask: 2685.85,
    spread: 0.35,
    high24h: 2698.0,
    low24h: 2670.0,
  };

  // Required Margin Calculation Formula
  const requiredMargin = useMemo(() => {
    const notional = lots * activeSymbol.contractSize * activeSymbol.ask;
    return Number((notional / account.leverage).toFixed(2));
  }, [lots, activeSymbol, account.leverage]);

  const isMarginExceeded = requiredMargin > account.freeMargin;

  // 2. ORDER EXECUTION API (OPEN)
  const handleOpenOrder = async (type: 'BUY' | 'SELL') => {
    if (isMarginExceeded || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/v1/trading/order/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account.id,
          symbol: activeSymbol.symbol,
          type,
          lots,
          sl: sl ? parseFloat(sl) : undefined,
          tp: tp ? parseFloat(tp) : undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Buyurtma ochishda xatolik yuz berdi');
      } else {
        toast.success(`Buyurtma #${data.position?.ticket} muvaffaqiyatli ochildi!`);
        if (data.position) {
          setPositions((prev) => [data.position, ...prev]);
        }
        if (data.account) setAccount(data.account);
      }
    } catch {
      toast.error('Tarmoq xatosi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. ORDER CLOSE API
  const handleCloseOrder = async (posId: string) => {
    try {
      const res = await fetch('/api/v1/trading/order/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionId: posId }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Yopishda xatolik');
      } else {
        const pnl = data.realizedPnl ?? 0;
        toast.success(`Pozitsiya yopildi. Yakuniy PnL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`);
        setPositions((prev) => prev.filter((p) => p.id !== posId));
        if (data.newBalance !== undefined) {
          setAccount((prev) => ({ ...prev, balance: data.newBalance }));
        }
      }
    } catch {
      toast.error('Tarmoq xatosi');
    }
  };

  // 4. DEPOSIT API
  const handleDeposit = async () => {
    try {
      const res = await fetch('/api/v1/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: account.id, amount: depositAmount }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Hisobga $${depositAmount.toFixed(2)} muvaffaqiyatli kiritildi!`);
        if (data.account) setAccount(data.account);
        setDepositModalOpen(false);
      } else {
        toast.error(data.error || 'Depozit xatosi');
      }
    } catch {
      toast.error('Depozit amalga oshmadi');
    }
  };

  const totalFloatingPnl = positions.reduce((sum, p) => sum + (p.status === 'OPEN' ? p.pnl : 0), 0);

  return (
    <div className="w-full bg-[#0a0d0b] text-[#f4f7f2] font-mono text-xs select-none flex flex-col min-h-screen">
      {/* ===================================================================== */}
      {/* 1. TOP ACCOUNT & METRICS HEADER                                       */}
      {/* ===================================================================== */}
      <header className="h-14 bg-[#111613] border-b border-white/10 px-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-[#b9ef40] text-black font-black flex items-center justify-center text-sm shadow-md">
            EX
          </div>
          <div>
            <div className="font-bold text-white text-xs flex items-center gap-1.5">
              <span>STANDART HISOB #{account.accountNumber}</span>
              <span className="text-[10px] text-gray-400 bg-white/10 px-1.5 py-0.5 rounded">1:{account.leverage}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-gray-400">{wsConnected ? 'Jonli WebSocket Birja (Connected)' : 'Ulanmoqda...'}</span>
            </div>
          </div>
        </div>

        {/* Real-time Account Balance Ribbon */}
        <div className="hidden lg:flex items-center gap-6 text-xs">
          <div>
            <span className="text-[10px] text-gray-400 block">Balans:</span>
            <span className="font-bold text-white text-sm">${account.balance.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block">Ekvit:</span>
            <span className={`font-bold text-sm ${totalFloatingPnl >= 0 ? 'text-primary' : 'text-rose-400'}`}>
              ${account.equity.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block">Band Marja:</span>
            <span className="font-bold text-white text-sm">${account.margin.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block">Erkin Marja:</span>
            <span className="font-bold text-white text-sm">${account.freeMargin.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block">Marja Darajasi:</span>
            <span
              className={`font-black text-sm ${
                account.marginLevel < 20
                  ? 'text-rose-500 animate-pulse'
                  : account.marginLevel < 60
                  ? 'text-amber-400'
                  : 'text-primary'
              }`}
            >
              {account.margin > 0 ? `${account.marginLevel.toFixed(1)}%` : '∞'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Simulated Deposit Button */}
          <button
            onClick={() => setDepositModalOpen(true)}
            className="px-3.5 py-1.5 bg-[#ffde00] hover:bg-[#ebd000] text-black font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <Plus className="size-3.5 stroke-[3]" />
            <span>Depozit</span>
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. MAIN TRADING WORKSPACE: Market Watch + Chart + Execution Panel      */}
      {/* ===================================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* A. LEFT MARKET WATCH (Instruments List) */}
        <aside className="w-64 bg-[#111613] border-r border-white/10 flex flex-col shrink-0">
          <div className="p-3 border-b border-white/10 flex items-center justify-between text-xs font-bold text-white">
            <span>Bozor Kuzatuvi (Market Watch)</span>
            <span className="text-[10px] text-primary">LIVE</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {Array.from(symbols.values()).map((sym: SymbolTick) => {
              const isSelected = sym.symbol === selectedSymbolKey;
              return (
                <div
                  key={sym.symbol}
                  onClick={() => setSelectedSymbolKey(sym.symbol)}
                  className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary/15 border-l-2 border-primary text-white font-bold' : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-white">{sym.symbol}</div>
                    <div className="text-[10px] text-gray-400">{sym.name}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-white text-xs">{sym.bid.toFixed(sym.digits)}</div>
                    <div className="text-[10px] text-gray-400">Spred: {sym.spread.toFixed(sym.digits)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* B. CENTER CHART AREA (TradingView Engine) */}
        <main className="flex-1 flex flex-col bg-[#0a0d0b] relative overflow-hidden">
          <TradingViewChart symbol={activeSymbol.symbol} interval="15" className="flex-1 w-full h-full" />
        </main>

        {/* C. RIGHT ORDER EXECUTION PANEL */}
        <aside className="w-80 bg-[#111613] border-l border-white/10 p-4 flex flex-col justify-between shrink-0 gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-black text-sm text-white">{activeSymbol.symbol}</span>
              <span className="text-gray-400 text-xs">Spred: {activeSymbol.spread.toFixed(activeSymbol.digits)}</span>
            </div>

            {/* Live Dual Execution Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={isMarginExceeded || isSubmitting}
                onClick={() => handleOpenOrder('SELL')}
                className="p-3 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-xl text-center transition-all disabled:opacity-40 cursor-pointer"
              >
                <div className="flex items-center justify-center gap-1 text-rose-400 font-bold text-xs">
                  <TrendingDown className="size-3.5" />
                  <span>SELL</span>
                </div>
                <div className="text-base font-black text-white mt-1">
                  {activeSymbol.bid.toFixed(activeSymbol.digits)}
                </div>
              </button>

              <button
                disabled={isMarginExceeded || isSubmitting}
                onClick={() => handleOpenOrder('BUY')}
                className="p-3 bg-primary/20 hover:bg-primary/30 border border-primary/40 rounded-xl text-center transition-all disabled:opacity-40 cursor-pointer"
              >
                <div className="flex items-center justify-center gap-1 text-primary font-bold text-xs">
                  <TrendingUp className="size-3.5" />
                  <span>BUY</span>
                </div>
                <div className="text-base font-black text-white mt-1">
                  {activeSymbol.ask.toFixed(activeSymbol.digits)}
                </div>
              </button>
            </div>

            {/* Lot Size Selector */}
            <div className="space-y-1">
              <div className="flex justify-between text-gray-400 text-xs">
                <span>Hajm (Lot Size):</span>
                <span className="text-white font-bold">{lots.toFixed(2)} Lot</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setLots((prev) => Math.max(0.01, Number((prev - 0.1).toFixed(2))))}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
                >
                  -0.1
                </button>
                <button
                  onClick={() => setLots((prev) => Math.max(0.01, Number((prev - 0.01).toFixed(2))))}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
                >
                  -0.01
                </button>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={lots}
                  onChange={(e) => setLots(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg py-1.5 text-center text-white font-bold outline-none text-xs"
                />
                <button
                  onClick={() => setLots((prev) => Number((prev + 0.01).toFixed(2)))}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
                >
                  +0.01
                </button>
                <button
                  onClick={() => setLots((prev) => Number((prev + 0.1).toFixed(2)))}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
                >
                  +0.1
                </button>
              </div>

              {/* Quick Lot Chips */}
              <div className="grid grid-cols-4 gap-1 pt-1">
                {[0.01, 0.10, 0.50, 1.00].map((v) => (
                  <button
                    key={v}
                    onClick={() => setLots(v)}
                    className={`py-1 rounded text-[10px] font-bold ${
                      lots === v ? 'bg-primary text-black' : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {v} Lot
                  </button>
                ))}
              </div>
            </div>

            {/* Stop Loss & Take Profit */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Stop Loss</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={sl}
                  onChange={(e) => setSl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Take Profit</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={tp}
                  onChange={(e) => setTp(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none text-xs"
                />
              </div>
            </div>

            {/* Margin Calculation Summary */}
            <div className="rounded-xl bg-white/5 p-3 border border-white/5 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-400">Zaruriy Marja:</span>
                <span className={isMarginExceeded ? 'text-rose-400 font-bold' : 'text-white font-bold'}>
                  ${requiredMargin.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Erkin Marja:</span>
                <span className="text-gray-200">${account.freeMargin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Kaldıraç (Leverage):</span>
                <span className="text-white">1:{account.leverage}</span>
              </div>
            </div>

            {isMarginExceeded && (
              <div className="flex items-center gap-1.5 text-rose-400 text-[10px]">
                <ShieldAlert className="size-4 shrink-0" />
                <span>Mablag' yetarli emas (Yetarli erkin marja yo'q).</span>
              </div>
            )}
          </div>

          <div className="text-[10px] text-gray-500 text-center">
            Exness Hybrid Execution Engine • Auto Stop-Out: 20%
          </div>
        </aside>
      </div>

      {/* ===================================================================== */}
      {/* 3. BOTTOM POSITIONS TABLE & METRICS BAR                               */}
      {/* ===================================================================== */}
      <footer className="h-60 bg-[#111613] border-t border-white/10 flex flex-col shrink-0">
        <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs font-bold text-white bg-[#141916]">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            <span>Ochiq Pozitsiyalar (Open Orders: {positions.length})</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-gray-400">Jami Suzuvchi PnL: </span>
              <strong className={totalFloatingPnl >= 0 ? 'text-primary' : 'text-rose-400'}>
                {totalFloatingPnl >= 0 ? '+' : ''}${totalFloatingPnl.toFixed(2)}
              </strong>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          {positions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-1">
              <CheckCircle2 className="size-6 text-primary opacity-60" />
              <div className="text-xs">Hozirda ochiq pozitsiyalar yo'q</div>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-gray-400 border-b border-white/10 pb-1 text-[11px]">
                  <th className="py-1">Ticket</th>
                  <th className="py-1">Vaqt</th>
                  <th className="py-1">Simvol</th>
                  <th className="py-1">Turi</th>
                  <th className="py-1">Lot</th>
                  <th className="py-1">Ochilish Narxi</th>
                  <th className="py-1">Joriy Narx</th>
                  <th className="py-1">Band Marja</th>
                  <th className="py-1">Suzuvchi PnL</th>
                  <th className="py-1 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {positions.map((pos) => {
                  const isProfit = pos.pnl >= 0;
                  return (
                    <tr key={pos.id} className="hover:bg-white/[0.02]">
                      <td className="py-2 text-gray-400 font-bold">#{pos.ticket}</td>
                      <td className="py-2 text-gray-400">{new Date(pos.openedAt).toLocaleTimeString()}</td>
                      <td className="py-2 font-black text-white">{pos.symbol}</td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pos.type === 'BUY' ? 'bg-primary/20 text-primary' : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {pos.type}
                        </span>
                      </td>
                      <td className="py-2 font-bold text-white">{pos.lots.toFixed(2)}</td>
                      <td className="py-2 text-white">{pos.openPrice}</td>
                      <td className="py-2 font-bold text-white">{pos.currentPrice}</td>
                      <td className="py-2 text-gray-400">${pos.lockedMargin.toFixed(2)}</td>
                      <td className={`py-2 font-black text-sm ${isProfit ? 'text-primary' : 'text-rose-400'}`}>
                        {isProfit ? '+' : ''}${pos.pnl.toFixed(2)}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => handleCloseOrder(pos.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-[11px] cursor-pointer"
                        >
                          Yopish
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </footer>

      {/* ===================================================================== */}
      {/* 4. SIMULATED DEPOSIT MODAL                                            */}
      {/* ===================================================================== */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#141916] rounded-2xl border border-white/10 p-5 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <span className="font-extrabold text-sm text-white">Hisobni To'ldirish (Deposit)</span>
              <button onClick={() => setDepositModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-gray-400 block mb-1">Depozit summasi (USD):</label>
                <input
                  type="number"
                  min="10"
                  step="100"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setDepositAmount(amt)}
                    className="py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold"
                  >
                    +${amt}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setDepositModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleDeposit}
                  className="flex-1 py-2 rounded-xl bg-primary text-black font-extrabold"
                >
                  To'ldirish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
