import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import nodemailer, { type Transporter } from "nodemailer";
import dotenv from "dotenv";
import { brokerRouter } from "./server/brokerApi.js";
import { initTradingWebSocket } from "./server/tradingWs.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

let resendInstance: Resend | null = null;
function getResendClient(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY || "";
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

function getGmailTransporter(): Transporter | null {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim().replace(/\s+/g, "");
  if (!user || !pass) {
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}


async function startServer() {
  const app = express();
  app.use(express.json());

  // Forex Broker API v1 router
  app.use("/api/v1", brokerRouter);

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Telegram Gateway OTP endpoint (@VerificationCodes)
  app.post("/api/send-telegram-otp", async (req, res) => {
    try {
      const { phone, code, purpose } = req.body;
      if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      let cleaned = phone.trim().replace(/[^\d+]/g, "");
      if (!cleaned.startsWith("+")) {
        if (cleaned.startsWith("998")) cleaned = "+" + cleaned;
        else if (cleaned.length === 9) cleaned = "+998" + cleaned;
        else cleaned = "+" + cleaned;
      }

      const otpCode = code || Math.floor(100000 + Math.random() * 900000).toString();
      const token = process.env.TELEGRAM_GATEWAY_TOKEN || "AAHPTAAA_1YQtpEN3y1DdEEPbvTebkGOUwni1ZYUYTrffw";

      // Call Telegram Gateway API
      const tgRes = await fetch("https://gatewayapi.telegram.org/sendVerificationMessage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: cleaned,
          code: otpCode,
          ttl: 300,
        }),
      });

      const tgData: any = await tgRes.json();
      console.log(`[Telegram Gateway API] To: ${cleaned} Code: ${otpCode} Res:`, tgData);

      if (tgData.ok) {
        return res.json({
          success: true,
          provider: "telegram_gateway",
          sender: "@VerificationCodes",
          formattedPhone: cleaned,
          requestId: tgData.result?.request_id,
          delivered: true,
        });
      }

      // Handle balance or test response gracefully
      const isLowBalance = tgData.error === "BALANCE_NOT_ENOUGH";
      return res.json({
        success: true,
        provider: "telegram_gateway",
        sender: "@VerificationCodes",
        formattedPhone: cleaned,
        delivered: false,
        error: tgData.error,
        code: otpCode,
        notice: isLowBalance
          ? "Telegram Gateway balansida mablag' yetarli emas (gateway.telegram.org da to'ldirish kerak). Sinov kodi taqdim etildi."
          : `Telegram Gateway xatosi: ${tgData.error}`,
      });
    } catch (err: any) {
      console.error("Telegram Gateway error:", err);
      res.status(500).json({ success: false, error: err?.message || "Failed to send Telegram verification" });
    }
  });

  // Direct test email endpoint
  app.post("/api/send-test-email", async (req, res) => {
    try {
      const recipient = (req.body?.to || "itgcompanyuzb@gmail.com").trim();
      const resend = getResendClient();

      const result = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: recipient,
        subject: "Hello World - Exora verification",
        html: `
          <div style="background-color: #0d1117; color: #ffffff; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-radius: 16px; max-width: 500px; margin: auto; border: 1px solid #30363d;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #8ef000; margin: 0; font-size: 28px; letter-spacing: 2px;">EXORA</h1>
              <p style="color: #8b949e; font-size: 14px; margin-top: 4px;">Professional Crypto Trading Platform</p>
            </div>
            <p style="font-size: 16px; line-height: 1.5; color: #c9d1d9;">
              Tabriklaymiz! <strong>Resend API</strong> tizimi Exora platformasiga muvaffaqiyatli ulandi.
            </p>
            <p style="font-size: 14px; color: #8b949e;">
              Ushbu xabar <strong>${recipient}</strong> manziliga to'g'ridan-to'g'ri yuborildi.
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #21262d; text-align: center; font-size: 12px; color: #8b949e;">
              © ${new Date().getFullYear()} Exora Trading Corp. Barcha huquqlar himoyalangan.
            </div>
          </div>
        `,
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("Resend test email error:", error);
      res.status(500).json({ success: false, error: error?.message || "Failed to send email" });
    }
  });

  // OTP Verification Code Email API
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { email, code, purpose } = req.body;

      if (!email || !code) {
        return res.status(400).json({ error: "Email and code are required" });
      }

      const resend = getResendClient();

      let subject = "Exora: Tasdiqlash kodi";
      let title = "Tasdiqlash kodi";
      let description = "Exora hisobingiz uchun 6 xonali tasdiqlash kodi:";

      if (purpose === "signup") {
        subject = "Exora: Ro'yxatdan o'tish kodi";
        title = "Ro'yxatdan o'tish";
        description = "Exora platformasida yangi hisob ochish uchun tasdiqlash kodi:";
      } else if (purpose === "signin") {
        subject = "Exora: Tizimga kirish kodi";
        title = "Tizimga kirish";
        description = "Exora hisobingizga xavfsiz kirish uchun tasdiqlash kodi:";
      } else if (purpose === "reset_password") {
        subject = "Exora: Parolni tiklash kodi";
        title = "Parolni tiklash";
        description = "Exora hisobingiz parolini yangilash uchun bir martalik tasdiqlash kodi:";
      }

      const userCleanEmail = email.trim().toLowerCase();
      const gmailTransporter = getGmailTransporter();

      const emailSubject = `Sizning Exora tasdiqlash kodingiz: ${code}`;
      const emailText = `Sizning Exora tasdiqlash kodingiz: ${code}\n\nUshbu kod 10 daqiqa davomida amal qiladi. Hech kimga oshkor qilmang.\n\nExora Platformasi`;
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: 1px;">EXORA</span>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Xavfsiz tasdiqlash xizmati</p>
          </div>

          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; text-align: center; border: 1px solid #e2e8f0;">
            <h2 style="font-size: 17px; color: #0f172a; margin: 0 0 8px 0; font-weight: 600;">
              ${title}
            </h2>
            <p style="font-size: 14px; color: #475569; line-height: 1.5; margin: 0 0 16px 0;">
              ${description}
            </p>

            <div style="background: #0f172a; border-radius: 12px; padding: 18px; margin: 12px 0;">
              <span style="font-family: 'SF Mono', Menlo, Consolas, Monaco, monospace; font-size: 34px; font-weight: 700; letter-spacing: 8px; color: #8ef000; display: inline-block;">
                ${code}
              </span>
            </div>

            <p style="font-size: 12px; color: #64748b; margin: 12px 0 0 0;">
              Kod 10 daqiqa davomida amal qiladi.
            </p>
          </div>

          <div style="margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
            Agar siz ushbu kodni so'ramagan bo'lsangiz, xatni e'tiborsiz qoldiring.<br />
            © ${new Date().getFullYear()} Exora. Barcha huquqlar himoyalangan.
          </div>
        </div>
      `;

      // 1. Try Gmail SMTP if credentials provided (NO domain required, 100% free)
      if (gmailTransporter) {
        try {
          const gmailUser = process.env.GMAIL_USER?.trim();
          const info = await gmailTransporter.sendMail({
            from: `"Exora" <${gmailUser}>`,
            to: userCleanEmail,
            subject: emailSubject,
            text: emailText,
            html: emailHtml,
          });
          console.log(`[Gmail SMTP OTP Sent] Code: ${code} to ${userCleanEmail} (MessageID: ${info.messageId})`);
          return res.json({ success: true, id: info.messageId, deliveredTo: userCleanEmail, provider: "gmail" });
        } catch (gmailErr: any) {
          console.error("Gmail SMTP error, falling back to Resend:", gmailErr);
        }
      }

      // 2. Resend API
      const fromEmail = process.env.RESEND_FROM_EMAIL || "Exora <onboarding@resend.dev>";
      const result = await resend.emails.send({
        from: fromEmail,
        to: userCleanEmail,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
      });

      if (result.error) {
        console.error("Resend send error:", result.error);
        const isRestricted =
          (result.error as any).statusCode === 403 ||
          result.error.message?.includes("only send testing emails");

        return res.status(400).json({
          success: false,
          errorType: isRestricted ? "DOMAIN_NOT_VERIFIED" : "SEND_FAILED",
          error: isRestricted
            ? `Resend bepul rejimida domensiz faqat hisob egasiga (${userCleanEmail === "itgcompanyuzb@gmail.com" ? "" : "itgcompanyuzb@gmail.com ga"}) yuboradi. Har qanday emailga bepul domensiz yuborish uchun Google Ilova Paroli (Gmail App Password) ni ulang.`
            : result.error.message,
        });
      }

      console.log(`[Resend OTP Sent] Code: ${code} to ${userCleanEmail} (ID: ${result.data?.id})`);
      res.json({ success: true, id: result.data?.id, deliveredTo: userCleanEmail, provider: "resend" });
    } catch (error: any) {
      console.error("Resend OTP send error:", error);
      res.status(500).json({ success: false, error: error?.message || "Failed to send email" });
    }
  });

  // Local sent email audit log
  const sentEmailsLog: Array<{
    id: string;
    from: string;
    to: string | string[];
    subject: string;
    createdAt: string;
    scheduledAt?: string;
    status: string;
  }> = [];

  // 1. Send Single Email
  app.post("/api/emails/send", async (req, res) => {
    try {
      const { from = "onboarding@resend.dev", to, subject, html, text, scheduledAt } = req.body;
      if (!to || !subject || (!html && !text)) {
        return res.status(400).json({ error: "Missing required fields: to, subject, and html or text" });
      }

      const resend = getResendClient();
      const payload: any = {
        from: from.includes("<") ? from : `Exora <${from}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html || `<p>${text}</p>`,
      };
      if (text) payload.text = text;
      if (scheduledAt) payload.scheduledAt = scheduledAt;

      const result = await resend.emails.send(payload);

      if (result.data?.id) {
        sentEmailsLog.unshift({
          id: result.data.id,
          from: payload.from,
          to: payload.to,
          subject,
          createdAt: new Date().toISOString(),
          scheduledAt,
          status: scheduledAt ? "scheduled" : "delivered",
        });
      }

      res.json({ success: true, data: result.data, error: result.error });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || "Failed to send email" });
    }
  });

  // 2. Send Batch Emails
  app.post("/api/emails/batch", async (req, res) => {
    try {
      const emails = req.body.emails || req.body;
      if (!Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ error: "Emails array is required" });
      }

      const formatted = emails.map((item: any) => ({
        from: item.from || "onboarding@resend.dev",
        to: Array.isArray(item.to) ? item.to : [item.to],
        subject: item.subject || "No Subject",
        html: item.html || `<p>${item.text || ""}</p>`,
        text: item.text,
      }));

      const resend = getResendClient();
      const result = await resend.batch.send(formatted);

      if (result.data?.data) {
        result.data.data.forEach((entry, idx) => {
          if (entry.id) {
            sentEmailsLog.unshift({
              id: entry.id,
              from: formatted[idx].from,
              to: formatted[idx].to,
              subject: formatted[idx].subject,
              createdAt: new Date().toISOString(),
              status: "delivered",
            });
          }
        });
      }

      res.json({ success: true, data: result.data, error: result.error });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || "Batch send failed" });
    }
  });

  // 3. List Emails (Resend API + Local fallback if Sending-Only key)
  app.get("/api/emails/list", async (_req, res) => {
    try {
      const resend = getResendClient();
      const result = await resend.emails.list();

      if (result.error && (result.error as any).name === "restricted_api_key") {
        // Fallback to locally recorded emails when key is restricted to sending
        return res.json({
          success: true,
          permission: "sending_access",
          notice: "API kalit faqat yuborish huquqiga ega. Mahalliy yuborilgan xatlar ro'yxati:",
          data: { data: sentEmailsLog },
        });
      }

      res.json({ success: true, data: result.data, error: result.error });
    } catch (err: any) {
      res.json({ success: true, data: { data: sentEmailsLog } });
    }
  });

  // 4. Retrieve Email Details
  app.get("/api/emails/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const resend = getResendClient();
      const result = await resend.emails.get(id);

      if (result.error && (result.error as any).name === "restricted_api_key") {
        const local = sentEmailsLog.find((e) => e.id === id);
        return res.json({
          success: true,
          permission: "sending_access",
          data: local || { id, status: "sent", note: "Sent via Resend" },
        });
      }

      res.json({ success: true, data: result.data, error: result.error });
    } catch (err: any) {
      const local = sentEmailsLog.find((e) => e.id === req.params.id);
      res.json({ success: true, data: local || null });
    }
  });

  // 5. Update Email (e.g., schedule time)
  app.patch("/api/emails/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { scheduledAt } = req.body;
      const resend = getResendClient();
      const result = await resend.emails.update({ id, scheduledAt });
      res.json({ success: true, data: result.data, error: result.error });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // 6. Cancel Email
  app.post("/api/emails/:id/cancel", async (req, res) => {
    try {
      const { id } = req.params;
      const resend = getResendClient();
      const result = await resend.emails.cancel(id);
      res.json({ success: true, data: result.data, error: result.error });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // 7. Share Email
  app.get("/api/emails/:id/share", async (req, res) => {
    try {
      const { id } = req.params;
      const resend = getResendClient();
      const result = await resend.emails.share(id);
      res.json({ success: true, data: result.data, error: result.error });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // 8. List Attachments
  app.get("/api/emails/:id/attachments", async (req, res) => {
    try {
      const { id } = req.params;
      const resend = getResendClient();
      const result = await resend.emails.attachments.list({ emailId: id });
      res.json({ success: true, data: result.data, error: result.error });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // 9. Retrieve Metrics
  app.get("/api/emails/metrics/stats", async (req, res) => {
    try {
      const resend = getResendClient();
      const startDate = (req.query.startDate as string) || new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
      const endDate = (req.query.endDate as string) || new Date().toISOString().split("T")[0];
      const result = await (resend.emails as any).metrics({
        startDate,
        endDate,
      });
      res.json({ success: true, data: result.data, error: result.error });
    } catch (err: any) {
      res.json({ success: true, data: { sent_total: sentEmailsLog.length, log: sentEmailsLog } });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = http.createServer(app);
  initTradingWebSocket(server);

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Exora server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
