import React, { useMemo, useState } from 'react';
import { toTradingViewSymbol } from '../../lib/liveMarketFeed';
import { RefreshCw, Activity, Globe, BarChart2 } from 'lucide-react';

interface TradingViewChartProps {
  symbol: string;
  interval?: string;
  theme?: 'dark' | 'light';
  className?: string;
}

export function TradingViewChart({
  symbol,
  interval = '15',
  theme = 'dark',
  className = '',
}: TradingViewChartProps) {
  const [currentInterval, setCurrentInterval] = useState(interval);
  const [key, setKey] = useState(0);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  const tvSymbol = useMemo(() => toTradingViewSymbol(symbol), [symbol]);

  // Map interval to TradingView interval format
  const tvInterval = useMemo(() => {
    switch (currentInterval) {
      case '1m': return '1';
      case '5m': return '5';
      case '15m': return '15';
      case '1h': return '60';
      case '4h': return '240';
      case '1D': return 'D';
      case '1W': return 'W';
      default: return currentInterval;
    }
  }, [currentInterval]);

  const embedUrl = useMemo(() => {
    const params = new URLSearchParams({
      frameElementId: 'exora_live_widget',
      symbol: tvSymbol,
      interval: tvInterval,
      hidesidetoolbar: '0',
      symboledit: '1',
      saveimage: '0',
      toolbarbg: '0a0d0b',
      theme: theme,
      style: '1', // 1 = Candles, 2 = Line, 3 = Area, 8 = Heikin Ashi
      timezone: 'Etc/UTC',
      withdateranges: '1',
      showpopupbutton: '0',
      locale: 'en',
    });
    return `https://s.tradingview.com/widgetembed/?${params.toString()}`;
  }, [tvSymbol, tvInterval, theme]);

  return (
    <div className={`relative w-full h-full flex flex-col bg-[#0a0d0b] select-none ${className}`}>
      {/* Top Controls Ribbon */}
      <div className="h-10 bg-[#0e120f] border-b border-white/10 px-3 flex items-center justify-between text-xs shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-primary font-mono font-bold text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>LIVE CANDLES</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-gray-300 bg-white/5 px-2 py-0.5 rounded border border-white/5">
            <Globe className="size-3 text-gray-400" />
            <span className="font-bold text-white">{symbol.toUpperCase()}</span>
          </div>
        </div>

        {/* Intervals & Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Timeframe Switcher */}
          <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
            {[
              { label: '1m', val: '1m' },
              { label: '5m', val: '5m' },
              { label: '15m', val: '15m' },
              { label: '1H', val: '1h' },
              { label: '4H', val: '4h' },
              { label: '1D', val: '1D' },
            ].map(tf => (
              <button
                key={tf.val}
                onClick={() => {
                  setCurrentInterval(tf.val);
                  setKey(k => k + 1);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  currentInterval === tf.val
                    ? 'bg-primary text-black shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setKey(k => k + 1)}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
            title="Grafikni yangilash (Refresh)"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Embedded Real-Time Chart Container */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-[#0a0d0b]">
        {!isIframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0d0b] z-0 text-gray-500 gap-2 font-mono text-xs">
            <Activity className="size-6 text-primary animate-pulse" />
            <span>Jonli birja grafiki yuklanmoqda ({symbol})...</span>
          </div>
        )}

        <div className="w-full h-full relative overflow-hidden">
          <iframe
            key={`${tvSymbol}-${tvInterval}-${key}`}
            title={`Chart-${tvSymbol}`}
            src={embedUrl}
            className="w-full h-[calc(100%+32px)] border-none relative z-1 -mb-8"
            allow="fullscreen"
            allowTransparency
            scrolling="no"
            onLoad={() => setIsIframeLoaded(true)}
          />

          {/* Clean neutral bottom-left mask with no logos or text */}
          <div className="absolute bottom-0 left-0 h-8 w-44 bg-[#0a0d0b] z-20 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
