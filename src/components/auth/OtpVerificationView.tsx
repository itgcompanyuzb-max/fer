import { useState, useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import {
  Mail,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { GlassButton } from "@/components/site/GlassButton";
import { toast } from "sonner";
import {
  verifyOtpCode,
  sendVerificationCode,
  sendTelegramVerificationCode,
  type VerificationState,
} from "@/lib/emailVerification";
import { supabase } from "@/integrations/supabase/client";
import { registerOrUpdateUser } from "@/lib/userStore";

interface OtpVerificationViewProps {
  email: string;
  channel?: "email" | "telegram";
  purpose: "signin" | "signup" | "reset_password";
  initialCode?: string;
  name?: string;
  password?: string;
  notice?: string;
  onBack: () => void;
  onSuccess: () => void;
  onResetVerified?: () => void;
}

export function OtpVerificationView({
  email,
  channel = "email",
  purpose,
  initialCode = "",
  name = "",
  password = "",
  notice,
  onBack,
  onSuccess,
  onResetVerified,
}: OtpVerificationViewProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeCode, setActiveCode] = useState<string>(initialCode);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle single digit input
  function handleDigitChange(index: number, val: string) {
    setErrorMsg(null);
    const cleaned = val.replace(/\D/g, "");

    if (cleaned.length === 0) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    // If pasted or typed multiple digits
    if (cleaned.length > 1) {
      handlePastedCode(cleaned);
      return;
    }

    const next = [...digits];
    next[index] = cleaned[0];
    setDigits(next);

    // Auto-advance
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else {
      // If last digit filled, attempt auto-submit
      const fullCode = next.join("");
      if (fullCode.length === 6) {
        submitCode(fullCode);
      }
    }
  }

  // Handle backspace
  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  }

  // Handle paste
  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pasted) {
      handlePastedCode(pasted);
    }
  }

  function handlePastedCode(codeStr: string) {
    const chars = codeStr.slice(0, 6).split("");
    const next = ["", "", "", "", "", ""];
    chars.forEach((c, i) => {
      next[i] = c;
    });
    setDigits(next);

    const targetIdx = Math.min(chars.length, 5);
    inputRefs.current[targetIdx]?.focus();

    if (chars.length === 6) {
      submitCode(next.join(""));
    }
  }

  // Auto-fill from simulated incoming email
  function autoFillCode(codeToFill: string) {
    handlePastedCode(codeToFill);
    toast.success("Kod avtomatik kiritildi");
  }

  // Copy code
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.info("Kod nusxalandi: " + text);
    setTimeout(() => setCopied(false), 2000);
  }

  // Submit code
  async function submitCode(fullCode: string) {
    if (fullCode.length !== 6) {
      setErrorMsg("Iltimos, 6 xonali tasdiqlash kodini to'liq kiriting");
      return;
    }

    setBusy(true);
    setErrorMsg(null);

    try {
      // Pass activeCode as fallback expected code for ultra-reliable validation
      const result = verifyOtpCode(email, fullCode, activeCode);

      if (!result.success) {
        setErrorMsg(result.error || "Noto'g'ri tasdiqlash kodi");
        setBusy(false);
        return;
      }

      if (purpose === "reset_password") {
        toast.success("Tasdiqlash kodi qabul qilindi.");
        if (onResetVerified) {
          onResetVerified();
        } else {
          onSuccess();
        }
        return;
      }

      // Successful verification! Create or update session
      const cleanEmailOrPhone = email.trim().toLowerCase();
      const displayName =
        name ||
        result.record?.payload?.name ||
        (channel === "telegram" ? `Trader ${cleanEmailOrPhone.slice(-4)}` : cleanEmailOrPhone.split("@")[0]) ||
        "Trader";

      // Register or update in user database
      registerOrUpdateUser({
        email: cleanEmailOrPhone,
        name: displayName,
        password: password || "user12345",
        provider: channel === "telegram" ? "email" : "email",
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmailOrPhone)}`,
      });

      await supabase.auth.setSession({
        access_token: "token-" + Date.now(),
        user: {
          id: "usr-" + Date.now(),
          email: cleanEmailOrPhone,
          user_metadata: {
            display_name: displayName,
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmailOrPhone)}`,
            email_verified: true,
            provider: channel === "telegram" ? "telegram_otp" : "email_otp",
          },
        },
      });

      toast.success(
        channel === "telegram"
          ? "Telegram orqali hisobingiz tasdiqlandi va kirildi!"
          : purpose === "signup"
          ? "Muvaffaqiyatli ro'yxatdan o'tildi!"
          : "Exora hisobiga muvaffaqiyatli kirildi!"
      );

      onSuccess();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Tasdiqlashda xatolik yuz berdi"
      );
    } finally {
      setBusy(false);
    }
  }

  // Resend OTP code
  async function handleResend() {
    if (!canResend) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      if (channel === "telegram") {
        const res = await sendTelegramVerificationCode(email, purpose, { name, password });
        if (!res.success) {
          setErrorMsg(res.error || "Telegram kodini qayta yuborib bo'lmadi");
          toast.error(res.error || "Telegram kodini qayta yuborib bo'lmadi");
          return;
        }
        setActiveCode(res.code);
        setCountdown(60);
        setCanResend(false);
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        toast.success(`Telegram @VerificationCodes orqali kod yuborildi: ${email}`);
        return;
      }

      const res = await sendVerificationCode(email, purpose, { name, password });
      if (!res.success) {
        setErrorMsg(res.error || "Kodni qayta yuborib bo'lmadi");
        toast.error(res.error || "Kodni qayta yuborib bo'lmadi");
        return;
      }
      setActiveCode(res.code);
      setCountdown(60);
      setCanResend(false);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      toast.success(`Yangi tasdiqlash kodi ${email} manziliga yuborildi!`);
    } catch {
      toast.error("Kodni qayta yuborishda xatolik yuz berdi");
    } finally {
      setBusy(false);
    }
  }

  const currentEnteredCode = digits.join("");

  return (
    <div className="flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Ortga</span>
        </button>
        <span className="text-[11px] font-mono text-primary/80 bg-primary/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          {channel === "telegram" ? "Telegram @VerificationCodes" : "Email OTP"}
        </span>
      </div>

      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-3">
        {channel === "telegram" ? (
          <svg className="size-6 text-[#229ED9]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
          </svg>
        ) : (
          <Mail className="size-6" />
        )}
      </div>

      <h2 className="text-2xl font-bold sm:text-2xl text-foreground">
        {channel === "telegram" ? "Telegram kodni tasdiqlang" : "Emailni tasdiqlang"}
      </h2>
      <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
        Tasdiqlash kodi quyidagi {channel === "telegram" ? "raqamga" : "manzilga"} yuborildi:
      </p>
      <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-foreground bg-white/5 py-1.5 px-3 rounded-xl border border-white/5 w-fit max-w-full truncate">
        <span className="truncate">{email}</span>
        <button
          type="button"
          onClick={onBack}
          className="text-[11px] text-primary hover:underline ml-1 shrink-0 font-normal"
        >
          O'zgartirish
        </button>
      </div>

      {/* Telegram or Email Notification Info Box */}
      <div className="mt-4 rounded-2xl border border-primary/25 bg-primary/5 p-3.5 shadow-sm">
        <div className="flex items-start gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary mt-0.5">
            {channel === "telegram" ? (
              <svg className="size-4 text-[#229ED9]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
            ) : (
              <Mail className="size-3.5" />
            )}
          </div>
          <div className="flex-1 text-xs">
            <p className="font-semibold text-foreground">
              {channel === "telegram" ? "Telegram @VerificationCodes orqali yuborildi" : "Tasdiqlash xati yuborildi"}
            </p>
            <p className="mt-0.5 text-muted-foreground leading-relaxed">
              {channel === "telegram" ? (
                <>
                  Telegram ilovangizdagi rasmiy <strong>@VerificationCodes</strong> botiga bir martalik 6 xonali tasdiqlash kodi jo'natildi. Telegramni ochib, kelgan kodni kiriting.
                </>
              ) : (
                <>
                  <strong>{email}</strong> pochtangizga 6 xonali tasdiqlash kodi yuborildi. Pochtani ochib, kelgan kodni kiriting.
                </>
              )}
            </p>
            {channel === "telegram" && (
              <a
                href="https://t.me/VerificationCodes"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#229ED9] hover:underline"
              >
                Telegram @VerificationCodes botini ochish &rarr;
              </a>
            )}
            {notice && (
              <p className="mt-1.5 text-[11px] text-amber-400/90 font-mono">
                {notice}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 6-box OTP input */}
      <div className="mt-5">
        <label className="block text-xs font-medium text-muted-foreground mb-2 text-center">
          6 xonali kodni kiriting
        </label>
        <div className="flex items-center justify-center gap-2 sm:gap-2.5">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className={`size-11 sm:size-12 rounded-xl text-center font-mono text-xl font-bold outline-none transition-all ${
                digit
                  ? "bg-primary/15 border-2 border-primary text-foreground shadow-[0_0_12px_rgba(208,253,62,0.2)]"
                  : "bg-white/5 border border-white/15 text-foreground hover:border-white/30 focus:border-primary/60 focus:bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Button */}
      <GlassButton
        type="button"
        variant="lime"
        size="lg"
        disabled={busy || currentEnteredCode.length !== 6}
        onClick={() => submitCode(currentEnteredCode)}
        className="mt-5 w-full"
      >
        {busy ? "Tekshirilmoqda..." : "Tasdiqlash va kirish"}
      </GlassButton>

      {/* Resend & Timer */}
      <div className="mt-4 flex items-center justify-center text-xs text-muted-foreground">
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={busy}
            className="flex items-center gap-1.5 font-semibold text-primary hover:underline"
          >
            <RefreshCw className="size-3.5" />
            <span>Kodni qayta yuborish</span>
          </button>
        ) : (
          <span>
            Kodni qayta yuborish:{" "}
            <span className="font-mono font-semibold text-foreground">
              00:{countdown < 10 ? `0${countdown}` : countdown}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
