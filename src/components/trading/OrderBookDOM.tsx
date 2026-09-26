import React, { useState, useEffect } from 'react';
import { 
  OrderBookEntry, 
  LiveTradeEntry, 
  liveMarketFeed 
} from '../../lib/liveMarketFeed';
import { ForexSymbolRate } from '../../types/broker';
import { ArrowDown, ArrowUp, Activity, Layers, History } from 'lucide-react';

interface OrderBookDOMProps {
  selectedSymbol: ForexSymbolRate;
  onSelectPrice?: (price: number) => void;
}

export function OrderBookDOM({ selectedSymbol, onSelectPrice }: OrderBookDOMProps) {
  const [tab, setTab] = useState<'orderbook' | 'trades'>('orderbook');
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [spread, setSpread] = useState<number>(0.1);
  const [trades, setTrades] = useState<LiveTradeEntry[]>([]);

  useEffect(() => {
    liveMarketFeed.setActiveSymbol(selectedSymbol.symbol);

    const unsubDOM = liveMarketFeed.subscribeOrderBook((depth) => {
      setBids(depth.bids.slice(0, 8));
      setAsks(depth.asks.slice(-8));
      setSpread(depth.spread);
    });

    const unsubTrades = liveMarketFeed.subscribeTrades((liveTrades) => {
      setTrades(liveTrades.slice(0, 12));
    });

    return () => {
      unsubDOM();
      unsubTrades();
    };
  }, [selectedSymbol.symbol]);

  // Calculate max volume for visual depth bars
  const maxAskTotal = asks.length ? Math.max(...asks.map(a => a.total)) : 1;
  const maxBidTotal = bids.length ? Math.max(...bids.map(b => b.total)) : 1;
  const maxTotal = Math.max(maxAskTotal, maxBidTotal, 1);

  return (
    <div className="flex flex-col h-full bg-[#111613] text-xs font-mono select-none">
      {/* Tab Switcher: Order Book vs Recent Trades */}
      <div className="flex items-center border-b border-white/10 px-2 py-1.5 bg-[#141916] text-[11px] font-bold">
        <button
          onClick={() => setTab('orderbook')}
          className={`flex-1 py-1 rounded-md text-center transition-all flex items-center justify-center gap-1.5 ${
            tab === 'orderbook' ? 'bg-white/10 text-white font-extrabold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="size-3 text-primary" />
          <span>Order Book (DOM)</span>
        </button>
        <button
          onClick={() => setTab('trades')}
          className={`flex-1 py-1 rounded-md text-center transition-all flex items-center justify-center gap-1.5 ${
            tab === 'trades' ? 'bg-white/10 text-white font-extrabold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <History className="size-3 text-amber-400" />
          <span>Jonli Bitimlar</span>
        </button>
      </div>

      {tab === 'orderbook' ? (
        <div className="flex-1 flex flex-col justify-between p-2 overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-3 text-[10px] text-gray-400 pb-1 border-b border-white/5 font-semibold">
            <span>Narx (USD)</span>
            <span className="text-right">Hajm</span>
            <span className="text-right">Jami</span>
          </div>

          {/* Asks (Sell Orders) - Red */}
          <div className="flex-1 flex flex-col justify-end space-y-0.5 overflow-hidden py-1">
            {asks.map((ask, idx) => {
              const depthPct = Math.min(100, Math.round((ask.total / maxTotal) * 100));
              return (
                <div
                  key={`ask-${idx}-${ask.price}`}
                  onClick={() => onSelectPrice?.(ask.price)}
                  className="relative grid grid-cols-3 text-[11px] py-0.5 px-1 rounded cursor-pointer hover:bg-rose-500/15 transition-colors group"
                >
                  {/* Depth Background Bar */}
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-rose-500/15 pointer-events-none transition-all rounded-r"
                    style={{ width: `${depthPct}%` }}
                  />
                  <span className="font-bold text-rose-400 group-hover:underline">
                    {ask.price.toFixed(selectedSymbol.digitPrecision)}
                  </span>
                  <span className="text-right text-gray-300 font-normal">
                    {ask.amount.toFixed(3)}
                  </span>
                  <span className="text-right text-gray-400 font-normal">
                    {ask.total.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mid Spread Indicator */}
          <div className="py-1 px-2 my-1 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-[11px] font-bold">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 text-[10px]">Spred:</span>
              <span className="text-primary font-mono">${spread.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-white">
              <span>{selectedSymbol.bid.toFixed(selectedSymbol.digitPrecision)}</span>
              {selectedSymbol.change24h >= 0 ? (
                <ArrowUp className="size-3 text-primary" />
              ) : (
                <ArrowDown className="size-3 text-rose-400" />
              )}
            </div>
          </div>

          {/* Bids (Buy Orders) - Green */}
          <div className="flex-1 flex flex-col justify-start space-y-0.5 overflow-hidden py-1">
            {bids.map((bid, idx) => {
              const depthPct = Math.min(100, Math.round((bid.total / maxTotal) * 100));
              return (
                <div
                  key={`bid-${idx}-${bid.price}`}
                  onClick={() => onSelectPrice?.(bid.price)}
                  className="relative grid grid-cols-3 text-[11px] py-0.5 px-1 rounded cursor-pointer hover:bg-primary/15 transition-colors group"
                >
                  {/* Depth Background Bar */}
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-primary/15 pointer-events-none transition-all rounded-r"
                    style={{ width: `${depthPct}%` }}
                  />
                  <span className="font-bold text-primary group-hover:underline">
                    {bid.price.toFixed(selectedSymbol.digitPrecision)}
                  </span>
                  <span className="text-right text-gray-300 font-normal">
                    {bid.amount.toFixed(3)}
                  </span>
                  <span className="text-right text-gray-400 font-normal">
                    {bid.total.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TAB 2: RECENT REAL-TIME TRADES TAPE */
        <div className="flex-1 flex flex-col p-2 overflow-hidden">
          <div className="grid grid-cols-3 text-[10px] text-gray-400 pb-1 border-b border-white/5 font-semibold">
            <span>Narx (USD)</span>
            <span className="text-right">Hajm</span>
            <span className="text-right">Vaqt</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-0.5 py-1">
            {trades.map((trade) => {
              const isBuy = trade.side === 'buy';
              return (
                <div
                  key={trade.id}
                  onClick={() => onSelectPrice?.(trade.price)}
                  className="grid grid-cols-3 text-[11px] py-0.5 px-1 rounded cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <span className={`font-bold ${isBuy ? 'text-primary' : 'text-rose-400'}`}>
                    {trade.price.toFixed(selectedSymbol.digitPrecision)}
                  </span>
                  <span className="text-right text-gray-200">
                    {trade.amount.toFixed(3)}
                  </span>
                  <span className="text-right text-gray-400 text-[10px]">
                    {trade.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
