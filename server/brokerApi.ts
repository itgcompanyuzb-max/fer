import { Router, Request, Response } from "express";

export const brokerRouter = Router();

// In-memory rate limiting map for security
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function rateLimiter(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: () => void) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };

    if (now > entry.resetAt) {
      entry.count = 1;
      entry.resetAt = now + windowMs;
    } else {
      entry.count++;
    }
    rateLimitMap.set(ip, entry);

    if (entry.count > limit) {
      return res.status(429).json({
        success: false,
        error: "Too many requests. Rate limit exceeded (Brute-force protection).",
      });
    }
    next();
  };
}

// 1. AUTH & 2FA ENDPOINTS
brokerRouter.post("/auth/register", rateLimiter(10, 60000), (req, res) => {
  const { email, phone, fullName, password, referralCode } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ success: false, error: "Email, fullName and password are required" });
  }

  // Password length & strength check
  if (password.length < 8) {
    return res.status(400).json({ success: false, error: "Parol kamida 8 ta belgidan iborat bo'lishi shart" });
  }

  const userId = `usr_${Date.now()}`;
  return res.json({
    success: true,
    message: "Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi",
    user: {
      id: userId,
      email,
      phone,
      fullName,
      role: "client",
      kycStatus: "unsubmitted",
      is2faEnabled: false,
      token: `jwt_exora_${Date.now()}_secure_session`,
    },
  });
});

brokerRouter.post("/auth/login", rateLimiter(15, 60000), (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password required" });
  }

  // Admin login check
  const isAdmin = email.toLowerCase().includes("admin") || email.toLowerCase().includes("compliance") || email.toLowerCase().includes("finance");

  return res.json({
    success: true,
    message: "Kirish muvaffaqiyatli",
    requires2fa: isAdmin, // Admins require mandatory 2FA
    user: {
      id: isAdmin ? "usr_admin_session" : "usr_client_session",
      email,
      fullName: isAdmin ? "Exora Administrator" : "Azizbek Rahimov",
      role: isAdmin ? "super_admin" : "client",
      token: `jwt_exora_${Date.now()}`,
    },
  });
});

brokerRouter.post("/auth/2fa/verify", (req, res) => {
  const { code } = req.body;
  if (!code || code.length !== 6) {
    return res.status(400).json({ success: false, error: "6 xonali 2FA kodini kiriting" });
  }
  // Simulate TOTP verification
  return res.json({
    success: true,
    message: "2FA muvaffaqiyatli tasdiqlandi",
    verified: true,
  });
});

// 2. LIVE FOREX MARKET FEED
brokerRouter.get("/rates/live", (_req, res) => {
  return res.json({
    success: true,
    timestamp: new Date().toISOString(),
    rates: [
      { symbol: "EUR/USD", bid: 1.08425, ask: 1.08433, spread: 0.8, change24h: 0.24 },
      { symbol: "GBP/USD", bid: 1.27180, ask: 1.27192, spread: 1.2, change24h: -0.15 },
      { symbol: "USD/JPY", bid: 154.620, ask: 154.629, spread: 0.9, change24h: 0.42 },
      { symbol: "XAU/USD", bid: 2685.40, ask: 2685.75, spread: 3.5, change24h: 1.15 },
      { symbol: "BTC/USD", bid: 87450.0, ask: 87465.0, spread: 15.0, change24h: 3.82 },
      { symbol: "US30", bid: 43810.0, ask: 43812.5, spread: 2.5, change24h: 0.35 },
    ],
  });
});

// 3. ADMIN STATS & RBAC OVERVIEW
brokerRouter.get("/admin/dashboard", (_req, res) => {
  return res.json({
    success: true,
    data: {
      totalUsers: 1482,
      activeTradingAccounts: 2190,
      totalDeposited24h: 84500.0,
      totalWithdrawn24h: 31200.0,
      openTradedVolumeLots: 412.5,
      pendingKycCount: 4,
      pendingWithdrawalsCount: 2,
      brokerHealth: "Tier-1 Prime Liquidity Online",
    },
  });
});
