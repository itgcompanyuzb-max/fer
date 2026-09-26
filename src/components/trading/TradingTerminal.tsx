import { useState, useEffect, useMemo, useRef, type FormEvent } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  DollarSign,
  Maximize2,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { GlassButton } from "@/components/site/GlassButton";
import { toast } from "sonner";

export interface MarketItem {
  pair: string;
  base: string;
  quote: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  decimals: number;
  tickSize: number;
}

export const MARKETS_DATA: MarketItem[] = [
  {
    pair: "BTC/USDT",
    base: "BTC",
    quote: "USDT",
    price: 68412.2,
    change24h: 3.42,
    high24h: 69250.0,
    low24h: 66180.5,
    volume24h: "$1.84B",
    decimals: 2,
    tickSize: 0.1,
  },
  {
    pair: "ETH/USDT",
    base: "ETH",
    quote: "USDT",
    price: 3584.9,
    change24h: 1.86,
    high24h: 3640.0,
    low24h: 3490.0,
    volume24h: "$892M",
    decimals: 2,
    tickSize: 0.05,
  },
  {
    pair: "SOL/USDT",
    base: "SOL",
    quote: "USDT",
    price: 182.44,
    change24h: -0.94,
    high24h: 189.5,
    low24h: 178.2,
    volume24h: "$420M",
    decimals: 2,
    tickSize: 0.01,
  },
  {
    pair: "TON/USDT",
    base: "TON",
    quote: "USDT",
    price: 7.28,
    change24h: 5.11,
    high24h: 7.45,
    low24h: 6.82,
    volume24h: "$138M",
    decimals: 3,
    tickSize: 0.001,
  },
  {
    pair: "XRP/USDT",
    base: "XRP",
    quote: "USDT",
    price: 0.6142,
    change24h: 0.72,
    high24h: 0.632,
    low24h: 0.598,
    volume24h: "$310M",
    decimals: 4,
    tickSize: 0.0001,
  },
  {
    pair: "BNB/USDT",
    base: "BNB",
    quote: "USDT",
    price: 604.1,
    change24h: 0.38,
    high24h: 612.0,
    low24h: 598.5,
    volume24h: "$240M",
    decimals: 2,
    tickSize: 0.1,
  },
];

export interface Position {
  id: string;
  pair: string;
  side: "long" | "short";
  entryPrice: number;
  currentPrice: number;
  size: number;
  margin: number;
  leverage: number;
  liquidationPrice: number;
  pnl: number;
  pnlPercentage: number;
  timestamp: number;
}

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function generateInitialCandles(basePrice: number, count = 36): Candle[] {
  const candles: Candle[] = [];
  let current = basePrice * 0.96;
  const now = Date.now();

  for (let i = count; i >= 0; i--) {
    const timeStr = new Date(now - i * 15 * 60 * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const delta = (Math.random() - 0.48) * (basePrice * 0.008);
    const open = current;
    const close = Math.max(open + delta, basePrice * 0.5);
    const high = Math.max(open, close) + Math.random() * (basePrice * 0.004);
    const low = Math.min(open, close) - Math.random() * (basePrice * 0.004);
    const volume = Math.round(5 + Math.random() * 45);

    candles.push({
      time: timeStr,
      open,
      high,
      low,
      close,
      volume,
    });
    current = close;
  }
  return candles;
}

interface TradingTerminalProps {
  initialPair?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export function TradingTerminal({
  initialPair = "BTC/USDT",
  onClose,
  isModal = false,
}: TradingTerminalProps) {
  const [selectedPairName, setSelectedPairName] = useState(initialPair);
  const activeMarket = useMemo(
    () =>
      MARKETS_DATA.find((m) => m.pair === selectedPairName) || MARKETS_DATA[0],
    [selectedPairName],
  );

  const [currentPrice, setCurrentPrice] = useState(activeMarket.price);
  const [priceFlash, setPriceFlash] = useState<"up" | "down" | null>(null);
  const [timeframe, setTimeframe] = useState<"1m" | "5m" | "15m" | "1h" | "1D">(
    "15m",
  );
  const [chartType, setChartType] = useState<"candles" | "line">("candles");

  // Candles
  const [candles, setCandles] = useState<Candle[]>(() =>
    generateInitialCandles(activeMarket.price),
  );

  // Order state
  const [orderSide, setOrderSide] = useState<"long" | "short">("long");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState(activeMarket.price.toString());
  const [orderAmount, setOrderAmount] = useState("0.1");
  const [leverage, setLeverage] = useState(20);
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");

  // Account balance & positions state (saved to localStorage)
  const [balance, setBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("exora_demo_balance");
      return saved ? parseFloat(saved) : 10000;
    } catch {
      return 10000;
    }
  });

  const [positions, setPositions] = useState<Position[]>(() => {
    try {
      const saved = localStorage.getItem("exora_positions");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // When switching market pair
  useEffect(() => {
    setCurrentPrice(activeMarket.price);
    setLimitPrice(activeMarket.price.toString());
    setCandles(generateInitialCandles(activeMarket.price));
  }, [activeMarket]);

  // Live simulation ticks
  useEffect(() => {
    const interval = setInterval(() => {
      const volatility = activeMarket.price * 0.0006;
      const change = (Math.random() - 0.49) * volatility;
      setCurrentPrice((prev) => {
        const next = Math.max(0.0001, prev + change);
        setPriceFlash(change >= 0 ? "up" : "down");
        setTimeout(() => setPriceFlash(null), 600);
        return Number(next.toFixed(activeMarket.decimals));
      });

      // Update the last candle
      setCandles((prev) => {
        if (!prev.length) return prev;
        const last = { ...prev[prev.length - 1] };
        last.close = currentPrice;
        last.high = Math.max(last.high, currentPrice);
        last.low = Math.min(last.low, currentPrice);
        last.volume += 0.2;
        return [...prev.slice(0, -1), last];
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [activeMarket, currentPrice]);

  // Persist balance & positions
  useEffect(() => {
    try {
      localStorage.setItem("exora_demo_balance", balance.toString());
      localStorage.setItem("exora_positions", JSON.stringify(positions));
    } catch {}
  }, [balance, positions]);

  // Update live PnL of open positions
  useEffect(() => {
    setPositions((prev) =>
      prev.map((pos) => {
        if (pos.pair !== activeMarket.pair) return pos;
        const priceDiff =
          pos.side === "long"
            ? currentPrice - pos.entryPrice
            : pos.entryPrice - currentPrice;
        const pnl = priceDiff * pos.size;
        const pnlPercentage = (pnl / pos.margin) * 100;
        return {
          ...pos,
          currentPrice,
          pnl,
          pnlPercentage,
        };
      }),
    );
  }, [currentPrice, activeMarket.pair]);

  // Calculations for order placement
  const amountNum = parseFloat(orderAmount) || 0;
  const executionPrice =
    orderType === "market" ? currentPrice : parseFloat(limitPrice) || currentPrice;
  const notionalValue = amountNum * executionPrice;
  const requiredMargin = leverage > 0 ? notionalValue / leverage : 0;
  const fee = notionalValue * 0.0002; // 0.02% fee

  const estLiquidation = useMemo(() => {
    if (!executionPrice || !leverage) return 0;
    const maintenanceRate = 0.005; // 0.5%
    if (orderSide === "long") {
      return executionPrice * (1 - 1 / leverage + maintenanceRate);
    } else {
      return executionPrice * (1 + 1 / leverage - maintenanceRate);
    }
  }, [executionPrice, leverage, orderSide]);

  const handlePlaceOrder = (e: FormEvent) => {
    e.preventDefault();
    if (amountNum <= 0) {
      toast.error("Please enter a valid position amount");
      return;
    }
    if (requiredMargin > balance) {
      toast.error("Insufficient demo balance for this margin");
      return;
    }

    const newPosition: Position = {
      id: "pos-" + Date.now(),
      pair: activeMarket.pair,
      side: orderSide,
      entryPrice: executionPrice,
      currentPrice: executionPrice,
      size: amountNum,
      margin: Number(requiredMargin.toFixed(2)),
      leverage,
      liquidationPrice: Number(estLiquidation.toFixed(activeMarket.decimals)),
      pnl: 0,
      pnlPercentage: 0,
      timestamp: Date.now(),
    };

    setBalance((prev) => Math.max(0, prev - requiredMargin - fee));
    setPositions((prev) => [newPosition, ...prev]);

    toast.success(
      `${orderSide.toUpperCase()} ${amountNum} ${activeMarket.base} opened at $${executionPrice}`,
    );
  };

  const handleClosePosition = (posId: string) => {
    const pos = positions.find((p) => p.id === posId);
    if (!pos) return;
    const returnedEquity = pos.margin + pos.pnl;
    setBalance((prev) => Number((prev + returnedEquity).toFixed(2)));
    setPositions((prev) => prev.filter((p) => p.id !== posId));
    toast.success(`Position closed. PnL: ${pos.pnl >= 0 ? "+" : ""}$${pos.pnl.toFixed(2)}`);
  };

  const handleAddDemoFunds = () => {
    setBalance((prev) => prev + 5000);
    toast.success("Added 5,000 USDT demo funds to wallet");
  };

  const handleResetDemo = () => {
    setBalance(10000);
    setPositions([]);
    toast.success("Demo terminal reset to 10,000 USDT");
  };

  // Mock order book bids and asks
  const orderBook = useMemo(() => {
    const asks = [];
    const bids = [];
    const p = currentPrice;
    const tick = activeMarket.tickSize;

    for (let i = 6; i >= 1; i--) {
      const askP = p + i * tick * 2.5;
      const sz = Number((0.15 + (i * 0.38) % 2.1).toFixed(3));
      asks.push({ price: askP, size: sz, total: sz * askP });
    }

    for (let i = 1; i <= 6; i++) {
      const bidP = p - i * tick * 2.5;
      const sz = Number((0.18 + (i * 0.42) % 2.3).toFixed(3));
      bids.push({ price: bidP, size: sz, total: sz * bidP });
    }
    return { asks, bids };
  }, [currentPrice, activeMarket.tickSize]);

  // Chart min / max
  const chartStats = useMemo(() => {
    if (!candles.length) return { min: 0, max: 100, span: 100 };
    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);
    const max = Math.max(...highs);
    const min = Math.min(...lows);
    const span = max - min || 1;
    return { min, max, span };
  }, [candles]);

  return (
    <div
      className={`flex flex-col text-foreground ${
        isModal
          ? "fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-2xl p-3 sm:p-6"
          : "w-full"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        {/* Terminal Header */}
        <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-4">
            {/* Pair Selector */}
            <div className="flex items-center gap-2">
              <select
                id="market-pair-select"
                value={selectedPairName}
                onChange={(e) => setSelectedPairName(e.target.value)}
                className="glass-soft rounded-xl px-3 py-1.5 font-display text-base font-bold text-foreground outline-none transition-colors hover:border-primary/40 focus:border-primary"
              >
                {MARKETS_DATA.map((m) => (
                  <option key={m.pair} value={m.pair} className="bg-card text-foreground">
                    {m.pair}
                  </option>
                ))}
              </select>
            </div>

            {/* Price badge */}
            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-2xl font-extrabold tracking-tight transition-colors duration-300 ${
                  priceFlash === "up"
                    ? "text-primary"
                    : priceFlash === "down"
                    ? "text-destructive"
                    : activeMarket.change24h >= 0
                    ? "text-primary"
                    : "text-destructive"
                }`}
              >
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: activeMarket.decimals })}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-mono text-xs font-semibold ${
                  activeMarket.change24h >= 0
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {activeMarket.change24h >= 0 ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {activeMarket.change24h >= 0 ? "+" : ""}
                {activeMarket.change24h}%
              </span>
            </div>

            {/* Quick stats */}
            <div className="hidden items-center gap-4 border-l border-white/10 pl-4 text-xs lg:flex">
              <div>
                <span className="text-muted-foreground">24h High: </span>
                <span className="font-mono text-foreground">${activeMarket.high24h.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">24h Low: </span>
                <span className="font-mono text-foreground">${activeMarket.low24h.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">24h Vol: </span>
                <span className="font-mono text-foreground">{activeMarket.volume24h}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Funding / 8h: </span>
                <span className="font-mono text-primary">0.0100%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Demo Balance Indicator */}
            <div className="glass-soft hidden items-center gap-2 rounded-xl px-3 py-1.5 text-xs sm:flex">
              <span className="text-muted-foreground">Demo Balance:</span>
              <span className="font-mono font-bold text-foreground">
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
              </span>
              <button
                type="button"
                onClick={handleAddDemoFunds}
                className="ml-1 text-primary hover:underline font-semibold"
                title="Add demo funds"
              >
                +Deposit
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetDemo}
              className="glass-soft rounded-xl p-2 text-muted-foreground hover:text-foreground transition-colors"
              title="Reset demo state"
              aria-label="Reset demo state"
            >
              <RefreshCw className="size-4" />
            </button>

            {isModal && onClose && (
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-xl px-3"
                aria-label="Close terminal"
              >
                <X className="size-5" />
              </GlassButton>
            )}
          </div>
        </div>

        {/* Main 3-Column Layout: Chart & Stats | Order Book | Trade Execution Form */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Chart Panel (7 cols on desktop) */}
          <div className="glass flex flex-col rounded-3xl p-5 lg:col-span-7 xl:col-span-8">
            {/* Chart Toolbar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div className="flex items-center gap-1">
                {(["1m", "5m", "15m", "1h", "1D"] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                      timeframe === tf
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="glass-soft flex rounded-lg p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setChartType("candles")}
                    className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                      chartType === "candles"
                        ? "bg-white/10 text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Candles
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartType("line")}
                    className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                      chartType === "line"
                        ? "bg-white/10 text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Line
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-amber-400/80" /> MA(7)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-cyan-400/80" /> MA(25)
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive SVG Chart Area */}
            <div className="relative h-72 w-full sm:h-96">
              {/* Background grid lines */}
              <div className="pointer-events-none absolute inset-0 grid grid-rows-4 divide-y divide-white/5">
                <div />
                <div />
                <div />
                <div />
              </div>

              <svg
                viewBox="0 0 800 360"
                preserveAspectRatio="none"
                className="h-full w-full overflow-visible"
              >
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Candles or Line */}
                {chartType === "candles" ? (
                  candles.map((c, i) => {
                    const total = candles.length;
                    const candleW = Math.max(4, 700 / total - 4);
                    const x = 30 + (i / total) * 730;
                    const isUp = c.close >= c.open;
                    const color = isUp ? "var(--primary)" : "var(--destructive)";

                    // Y mapping (0 at top, 360 at bottom)
                    const openY =
                      320 - ((c.open - chartStats.min) / chartStats.span) * 280;
                    const closeY =
                      320 - ((c.close - chartStats.min) / chartStats.span) * 280;
                    const highY =
                      320 - ((c.high - chartStats.min) / chartStats.span) * 280;
                    const lowY =
                      320 - ((c.low - chartStats.min) / chartStats.span) * 280;

                    const bodyTop = Math.min(openY, closeY);
                    const bodyH = Math.max(2, Math.abs(closeY - openY));

                    return (
                      <g key={i} className="transition-all duration-300">
                        {/* High/Low wick line */}
                        <line
                          x1={x}
                          y1={highY}
                          x2={x}
                          y2={lowY}
                          stroke={color}
                          strokeWidth="1.2"
                          opacity="0.75"
                        />
                        {/* Candle body */}
                        <rect
                          x={x - candleW / 2}
                          y={bodyTop}
                          width={candleW}
                          height={bodyH}
                          fill={color}
                          rx="1.5"
                          opacity={isUp ? "0.9" : "0.85"}
                        />
                      </g>
                    );
                  })
                ) : (
                  <>
                    {/* Area fill */}
                    <path
                      d={
                        candles
                          .map((c, i) => {
                            const x = 30 + (i / candles.length) * 730;
                            const y =
                              320 -
                              ((c.close - chartStats.min) / chartStats.span) *
                                280;
                            return `${i === 0 ? "M" : "L"}${x},${y}`;
                          })
                          .join(" ") + " L760,340 L30,340 Z"
                      }
                      fill="url(#lineGrad)"
                    />
                    {/* Line stroke */}
                    <path
                      d={candles
                        .map((c, i) => {
                          const x = 30 + (i / candles.length) * 730;
                          const y =
                            320 -
                            ((c.close - chartStats.min) / chartStats.span) *
                              280;
                          return `${i === 0 ? "M" : "L"}${x},${y}`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  </>
                )}

                {/* Current price horizontal line */}
                {(() => {
                  const currentY =
                    320 -
                    ((currentPrice - chartStats.min) / chartStats.span) * 280;
                  return (
                    <g>
                      <line
                        x1="20"
                        y1={currentY}
                        x2="780"
                        y2={currentY}
                        stroke="var(--primary)"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                        opacity="0.8"
                      />
                      <rect
                        x="720"
                        y={currentY - 10}
                        width="70"
                        height="20"
                        fill="var(--primary)"
                        rx="4"
                      />
                      <text
                        x="755"
                        y={currentY + 4}
                        fill="var(--primary-foreground)"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        ${currentPrice.toLocaleString()}
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Quick Chart Stats Bar */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3 text-xs text-muted-foreground">
              <span className="font-mono">
                Range: ${chartStats.min.toFixed(2)} - ${chartStats.max.toFixed(2)}
              </span>
              <span className="flex items-center gap-1.5 text-primary">
                <Activity className="size-3.5" /> High-frequency tick feed active
              </span>
            </div>
          </div>

          {/* Trade Execution Panel (5 cols on desktop, 4 on xl) */}
          <div className="glass flex flex-col justify-between rounded-3xl p-5 lg:col-span-5 xl:col-span-4">
            <form onSubmit={handlePlaceOrder} className="flex flex-col gap-4">
              {/* Buy / Sell Tabs */}
              <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-black/40 p-1">
                <button
                  type="button"
                  onClick={() => setOrderSide("long")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold tracking-tight transition-all duration-200 ${
                    orderSide === "long"
                      ? "bg-primary text-primary-foreground glow-lime shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ArrowUpRight className="size-4" />
                  Long (Buy)
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSide("short")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold tracking-tight transition-all duration-200 ${
                    orderSide === "short"
                      ? "bg-destructive text-destructive-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ArrowDownRight className="size-4" />
                  Short (Sell)
                </button>
              </div>

              {/* Order Type Tabs */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex rounded-lg bg-white/5 p-0.5">
                  <button
                    type="button"
                    onClick={() => setOrderType("market")}
                    className={`rounded-md px-3 py-1 font-medium transition-colors ${
                      orderType === "market"
                        ? "bg-white/10 text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Market
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType("limit")}
                    className={`rounded-md px-3 py-1 font-medium transition-colors ${
                      orderType === "limit"
                        ? "bg-white/10 text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Limit
                  </button>
                </div>

                {/* Leverage selector */}
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Lev:</span>
                  {[5, 10, 20, 50].map((lev) => (
                    <button
                      key={lev}
                      type="button"
                      onClick={() => setLeverage(lev)}
                      className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-bold ${
                        leverage === lev
                          ? "bg-primary/20 text-primary border border-primary/40"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {lev}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Limit Price Input if Limit Order */}
              {orderType === "limit" && (
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Limit Price (USDT)
                  </label>
                  <div className="glass-soft flex items-center justify-between rounded-xl px-3 py-2">
                    <input
                      type="number"
                      step={activeMarket.tickSize}
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      className="w-full bg-transparent font-mono text-sm outline-none text-foreground"
                      placeholder="0.00"
                    />
                    <span className="text-xs font-semibold text-muted-foreground">USDT</span>
                  </div>
                </div>
              )}

              {/* Order Amount */}
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Amount ({activeMarket.base})</span>
                  <span>
                    Avail: $
                    {balance.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="glass-soft flex items-center justify-between rounded-xl px-3 py-2">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    className="w-full bg-transparent font-mono text-sm outline-none text-foreground"
                    placeholder="0.00"
                  />
                  <span className="text-xs font-semibold text-muted-foreground">
                    {activeMarket.base}
                  </span>
                </div>

                {/* Quick percentage buttons */}
                <div className="mt-2 grid grid-cols-4 gap-1.5 text-xs">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        const maxNotional = balance * leverage;
                        const targetAmt = (maxNotional * (pct / 100)) / executionPrice;
                        setOrderAmount(Number(targetAmt.toFixed(4)).toString());
                      }}
                      className="glass-soft rounded-lg py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground hover:border-primary/40"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Financial Metrics Summary */}
              <div className="glass-soft flex flex-col gap-1.5 rounded-2xl p-3 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Order Value</span>
                  <span className="font-mono text-foreground">
                    ${notionalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Required Margin ({leverage}x)</span>
                  <span className="font-mono font-bold text-foreground">
                    ${requiredMargin.toFixed(2)} USDT
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Est. Liquidation</span>
                  <span className="font-mono text-destructive">
                    ${estLiquidation.toLocaleString(undefined, { maximumFractionDigits: activeMarket.decimals })}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Maker Fee (0.02%)</span>
                  <span className="font-mono text-primary">${fee.toFixed(3)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <GlassButton
                type="submit"
                variant={orderSide === "long" ? "lime" : "glass"}
                size="lg"
                className={`w-full rounded-2xl py-3 text-base font-bold ${
                  orderSide === "short" ? "bg-destructive text-white hover:bg-destructive/90" : ""
                }`}
              >
                {orderSide === "long" ? "Open Long" : "Open Short"} {activeMarket.base}
              </GlassButton>
            </form>

            <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
              <Sparkles className="size-3 text-primary" /> Zero slippage execution in pilot environment
            </div>
          </div>
        </div>

        {/* Bottom Section: Order Book & Positions */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Order Book (4 cols) */}
          <div className="glass flex flex-col rounded-3xl p-5 lg:col-span-4">
            <h3 className="mb-3 font-display text-base font-bold">Order Book</h3>
            <div className="grid grid-cols-3 text-xs text-muted-foreground pb-2 border-b border-white/5">
              <span>Price (USDT)</span>
              <span className="text-right">Size ({activeMarket.base})</span>
              <span className="text-right">Total ($)</span>
            </div>

            {/* Asks (Sells) */}
            <div className="flex flex-col gap-1 py-2">
              {orderBook.asks.map((ask, idx) => (
                <div
                  key={idx}
                  className="relative grid grid-cols-3 items-center text-xs font-mono"
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-destructive/10 -z-0 rounded"
                    style={{ width: `${Math.min(100, ask.size * 50)}%` }}
                  />
                  <span className="text-destructive relative z-10">
                    {ask.price.toFixed(activeMarket.decimals)}
                  </span>
                  <span className="text-right text-foreground relative z-10">
                    {ask.size}
                  </span>
                  <span className="text-right text-muted-foreground relative z-10">
                    {Math.round(ask.total).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Spread Indicator */}
            <div className="my-1.5 flex items-center justify-between border-y border-white/10 py-1.5 text-xs">
              <span className="font-mono font-bold text-primary">
                ${currentPrice.toFixed(activeMarket.decimals)}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Spread: ${(activeMarket.tickSize * 2).toFixed(activeMarket.decimals)} (0.003%)
              </span>
            </div>

            {/* Bids (Buys) */}
            <div className="flex flex-col gap-1 py-2">
              {orderBook.bids.map((bid, idx) => (
                <div
                  key={idx}
                  className="relative grid grid-cols-3 items-center text-xs font-mono"
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-primary/10 -z-0 rounded"
                    style={{ width: `${Math.min(100, bid.size * 50)}%` }}
                  />
                  <span className="text-primary relative z-10">
                    {bid.price.toFixed(activeMarket.decimals)}
                  </span>
                  <span className="text-right text-foreground relative z-10">
                    {bid.size}
                  </span>
                  <span className="text-right text-muted-foreground relative z-10">
                    {Math.round(bid.total).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Open Positions & History Table (8 cols) */}
          <div className="glass flex flex-col rounded-3xl p-5 lg:col-span-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-display text-base font-bold">
                  Open Positions ({positions.length})
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                Total Unrealized PnL:{" "}
                <span
                  className={`font-mono font-bold ${
                    positions.reduce((acc, p) => acc + p.pnl, 0) >= 0
                      ? "text-primary"
                      : "text-destructive"
                  }`}
                >
                  ${positions.reduce((acc, p) => acc + p.pnl, 0).toFixed(2)}
                </span>
              </span>
            </div>

            {positions.length === 0 ? (
              <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-muted-foreground">
                <Layers className="mb-2 size-8 opacity-40" />
                <p>No open positions yet.</p>
                <p className="mt-1 text-xs text-muted-foreground/80">
                  Select a pair, choose Long or Short, and open a position to see live PnL.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-muted-foreground">
                      <th className="pb-3 font-semibold">Position</th>
                      <th className="pb-3 font-semibold text-right">Size</th>
                      <th className="pb-3 font-semibold text-right">Entry Price</th>
                      <th className="pb-3 font-semibold text-right">Mark Price</th>
                      <th className="pb-3 font-semibold text-right">Margin</th>
                      <th className="pb-3 font-semibold text-right">PnL</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {positions.map((pos) => (
                      <tr key={pos.id} className="transition-colors hover:bg-white/5">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                                pos.side === "long"
                                  ? "bg-primary/20 text-primary"
                                  : "bg-destructive/20 text-destructive"
                              }`}
                            >
                              {pos.side} {pos.leverage}x
                            </span>
                            <span className="font-sans font-bold text-foreground">
                              {pos.pair}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-right text-foreground">{pos.size}</td>
                        <td className="py-3 text-right text-muted-foreground">
                          ${pos.entryPrice.toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-foreground">
                          ${pos.currentPrice.toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-muted-foreground">
                          ${pos.margin.toFixed(2)}
                        </td>
                        <td
                          className={`py-3 text-right font-bold ${
                            pos.pnl >= 0 ? "text-primary" : "text-destructive"
                          }`}
                        >
                          {pos.pnl >= 0 ? "+" : ""}${pos.pnl.toFixed(2)} (
                          {pos.pnlPercentage >= 0 ? "+" : ""}
                          {pos.pnlPercentage.toFixed(1)}%)
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleClosePosition(pos.id)}
                            className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-sans font-semibold text-foreground transition-colors hover:bg-destructive hover:text-white"
                          >
                            Close
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
