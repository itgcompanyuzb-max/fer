import { WebSocketServer, WebSocket } from "ws";
import { tradingEngine } from "./tradingEngine.js";
function initTradingWebSocket(server) {
  const wss = new WebSocketServer({ server, path: "/ws/trading" });
  const clientSubs = /* @__PURE__ */ new Map();
  wss.on("connection", (ws) => {
    const initialSubs = /* @__PURE__ */ new Set(["XAUUSD", "EURUSD", "BTCUSD", "GBPUSD", "USDJPY"]);
    clientSubs.set(ws, initialSubs);
    const defaultAcc = Array.from(tradingEngine.accounts.values())[0];
    const openPositions = Array.from(tradingEngine.positions.values()).filter((p) => p.status === "OPEN");
    const symbolList = Array.from(tradingEngine.symbols.values());
    ws.send(
      JSON.stringify({
        type: "INIT_SNAPSHOT",
        account: defaultAcc,
        positions: openPositions,
        symbols: symbolList,
        serverTime: Date.now()
      })
    );
    ws.on("message", (message) => {
      try {
        const payload = JSON.parse(message.toString());
        if (payload.action === "SUBSCRIBE" && Array.isArray(payload.symbols)) {
          const current = clientSubs.get(ws) || /* @__PURE__ */ new Set();
          payload.symbols.forEach((s) => current.add(s.toUpperCase()));
          clientSubs.set(ws, current);
        } else if (payload.action === "REQUEST_CANDLES" && payload.symbol) {
          const candles = tradingEngine.candles.get(payload.symbol.toUpperCase()) || [];
          ws.send(
            JSON.stringify({
              type: "CANDLE_HISTORY",
              symbol: payload.symbol,
              data: candles
            })
          );
        }
      } catch (err) {
        console.error("Invalid WS payload received:", err);
      }
    });
    ws.on("close", () => {
      clientSubs.delete(ws);
    });
  });
  tradingEngine.subscribeTicks((tick) => {
    const payload = JSON.stringify({ type: "TICK", data: tick });
    for (const [ws, subs] of clientSubs.entries()) {
      if (ws.readyState === WebSocket.OPEN && subs.has(tick.symbol)) {
        ws.send(payload);
      }
    }
  });
  tradingEngine.subscribeAccountUpdates((acc) => {
    const payload = JSON.stringify({ type: "ACCOUNT_UPDATE", data: acc });
    for (const [ws] of clientSubs.entries()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  });
  tradingEngine.subscribePositionUpdates((pos) => {
    const payload = JSON.stringify({ type: "POSITION_UPDATE", data: pos });
    for (const [ws] of clientSubs.entries()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  });
  console.log("[WebSocket] Trading WebSocket Server mounted at /ws/trading");
}
export {
  initTradingWebSocket
};
