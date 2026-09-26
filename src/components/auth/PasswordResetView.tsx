import { useState, type FormEvent } from "react";
import { ArrowLeft, KeyRound, Mail, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { GlassButton } from "@/components/site/GlassButton";
import { toast } from "sonner";
import { isUserRegistered, updateUserPassword } from "@/lib/userStore";
import { sendVerificationCode } from "@/lib/emailVerification";
import { OtpVerificationView } from "@/components/auth/OtpVerificationView";

interface PasswordResetViewProps {
  initialEmail?: string;
  onBackToSignIn: () => void;
  onSuccessReset: () => void;
}

export function PasswordResetView({
  initialEmail = "",
  onBackToSignIn,
  onSuccessReset,
}: PasswordResetViewProps) {
  const [resetStep, setResetStep] = useState<"enter_email" | "verify_otp" | "new_password">("enter_email");
  const [email, setEmail] = useState(initialEmail);
  const [sentCode, setSentCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // New password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSendResetCode(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Iltimos, to'g'ri email manzilini kiriting.");
      return;
    }

    // CRITICAL: Check if account exists in Exora
    const exists = isUserRegistered(cleanEmail);
    if (!exists) {
      const notFoundMsg = "Bu hisob Exora'dan ro'yxatdan o'tmagan";
      setErrorMsg(notFoundMsg);
      toast.error(notFoundMsg);
      return;
    }

    setBusy(true);
    try {
      const res = await sendVerificationCode(cleanEmail, "reset_password");
      setSentCode(res.code);
      setResetStep("verify_otp");
      toast.success(`6 xonali tasdiqlash kodi ${cleanEmail} manziliga yuborildi!`);
    } catch {
      setErrorMsg("Kodni yuborishda xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveNewPassword(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Kiritilgan parollar bir-biriga mos kelmadi.");
      return;
    }

    setBusy(true);
    try {
      const ok = updateUserPassword(email, newPassword);
      if (!ok) {
        throw new Error("Parolni saqlashda xatolik yuz berdi.");
      }

      toast.success("Parol muvaffaqiyatli o'zgartirildi! Yangi parol bilan tizimga kiring.");
      onSuccessReset();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setBusy(false);
    }
  }

  // STEP 2: Verify OTP
  if (resetStep === "verify_otp") {
    return (
      <OtpVerificationView
        email={email}
        purpose="reset_password"
        initialCode={sentCode}
        onBack={() => setResetStep("enter_email")}
        onSuccess={() => setResetStep("new_password")}
        onResetVerified={() => setResetStep("new_password")}
      />
    );
  }

  // STEP 3: Enter New Password
  if (resetStep === "new_password") {
    return (
      <div className="flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-3">
          <KeyRound className="size-6" />
        </div>

        <h2 className="text-2xl font-bold text-foreground">
          Yangi parol o'rnatish
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{email}</span> hisobi uchun yangi xavfsiz parol kiriting.
        </p>

        <form onSubmit={handleSaveNewPassword} className="mt-5 flex flex-col gap-3">
          <div className="relative">
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Yangi parol (kamida 6 ta belgi)"
              className="glass-soft h-11 sm:h-12 w-full rounded-2xl px-4 pr-10 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
            />
            <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative">
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Yangi parolni qayta kiriting"
              className="glass-soft h-11 sm:h-12 w-full rounded-2xl px-4 pr-10 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
            />
            <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <GlassButton
            type="submit"
            variant="lime"
            size="lg"
            disabled={busy || newPassword.length < 6}
            className="mt-2 w-full"
          >
            {busy ? "Saqlanmoqda..." : "Parolni saqlash va yangilash"}
          </GlassButton>
        </form>
      </div>
    );
  }

  // STEP 1: Enter Email
  return (
    <div className="flex flex-col animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onBackToSignIn}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Kirishga qaytish</span>
        </button>
        <span className="text-[11px] font-mono text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
          Tiklash
        </span>
      </div>

      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-3">
        <KeyRound className="size-6" />
      </div>

      <h2 className="text-2xl font-bold text-foreground">
        Parolni tiklash
      </h2>
      <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
        Exora hisobingiz email manzilini kiriting. Agar hisobingiz mavjud bo'lsa, sizga 6 xonali tasdiqlash kodi yuboriladi.
      </p>

      <form onSubmit={handleSendResetCode} className="mt-5 flex flex-col gap-3">
        <div className="relative">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMsg(null);
            }}
            placeholder="Email manzili (masalan: itgcompanyuzb@gmail.com)"
            autoComplete="email"
            className="glass-soft h-11 sm:h-12 w-full rounded-2xl px-4 pr-10 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
          />
          <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive font-medium animate-in fade-in">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <GlassButton
          type="submit"
          variant="lime"
          size="lg"
          disabled={busy || !email}
          className="mt-2 w-full"
        >
          {busy ? "Tekshirilmoqda..." : "Tasdiqlash kodini yuborish"}
        </GlassButton>
      </form>

      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-center">
        <button
          type="button"
          onClick={onBackToSignIn}
          className="text-xs text-primary font-medium hover:underline"
        >
          Parolni esladingizmi? Tizimga kirish
        </button>
      </div>
    </div>
  );
}
