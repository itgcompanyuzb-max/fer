// server/tradingWs.ts
// Real-time WebSocket Gateway for Quotes, Candlesticks & Order State
import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { tradingEngine, SymbolConfig, AccountEntity, PositionEntity } from './tradingEngine.js';

export function initTradingWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: '/ws/trading' });

  const clientSubs = new Map<WebSocket, Set<string>>();

  wss.on('connection', (ws: WebSocket) => {
    // Default subscription: all instruments
    const initialSubs = new Set(['XAUUSD', 'EURUSD', 'BTCUSD', 'GBPUSD', 'USDJPY']);
    clientSubs.set(ws, initialSubs);

    // 1. Send initial handshake and state snapshot
    const defaultAcc = Array.from(tradingEngine.accounts.values())[0];
    const openPositions = Array.from(tradingEngine.positions.values()).filter((p) => p.status === 'OPEN');
    const symbolList = Array.from(tradingEngine.symbols.values());

    ws.send(
      JSON.stringify({
        type: 'INIT_SNAPSHOT',
        account: defaultAcc,
        positions: openPositions,
        symbols: symbolList,
        serverTime: Date.now(),
      })
    );

    // 2. Client incoming messages
    ws.on('message', (message: string) => {
      try {
        const payload = JSON.parse(message.toString());
        if (payload.action === 'SUBSCRIBE' && Array.isArray(payload.symbols)) {
          const current = clientSubs.get(ws) || new Set();
          payload.symbols.forEach((s: string) => current.add(s.toUpperCase()));
          clientSubs.set(ws, current);
        } else if (payload.action === 'REQUEST_CANDLES' && payload.symbol) {
          const candles = tradingEngine.candles.get(payload.symbol.toUpperCase()) || [];
          ws.send(
            JSON.stringify({
              type: 'CANDLE_HISTORY',
              symbol: payload.symbol,
              data: candles,
            })
          );
        }
      } catch (err) {
        console.error('Invalid WS payload received:', err);
      }
    });

    ws.on('close', () => {
      clientSubs.delete(ws);
    });
  });

  // Broadcast ticks from Trading Engine
  tradingEngine.subscribeTicks((tick: SymbolConfig) => {
    const payload = JSON.stringify({ type: 'TICK', data: tick });
    for (const [ws, subs] of clientSubs.entries()) {
      if (ws.readyState === WebSocket.OPEN && subs.has(tick.symbol)) {
        ws.send(payload);
      }
    }
  });

  // Broadcast account metrics
  tradingEngine.subscribeAccountUpdates((acc: AccountEntity) => {
    const payload = JSON.stringify({ type: 'ACCOUNT_UPDATE', data: acc });
    for (const [ws] of clientSubs.entries()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  });

  // Broadcast position changes
  tradingEngine.subscribePositionUpdates((pos: PositionEntity) => {
    const payload = JSON.stringify({ type: 'POSITION_UPDATE', data: pos });
    for (const [ws] of clientSubs.entries()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  });

  console.log('[WebSocket] Trading WebSocket Server mounted at /ws/trading');
}
