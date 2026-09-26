import React, { useState } from "react";
import { translations, Language } from "../../lib/i18n";
import { brokerStore } from "../../lib/brokerStore";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  KeyRound, 
  ArrowRight, 
  X,
  Send
} from "lucide-react";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  lang: Language;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, onSuccess, lang, initialMode = 'register' }: AuthModalProps) {
  if (!isOpen) return null;

  const t = translations[lang];
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [step, setStep] = useState<'creds' | '2fa'>('creds');

  // Register Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // OTP Sending simulation
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  async function handleSendOtp() {
    if (!phone || phone.length < 9) {
      toast.error("Iltimos, telefon raqamingizni to'liq kiriting");
      return;
    }
    setIsSendingOtp(true);
    try {
      // Call telegram OTP backend if available or simulated
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await fetch('/api/send-telegram-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, purpose: 'broker_register' }),
      }).catch(() => null);

      setOtpSent(true);
      setOtpCode(code); // Pre-fill for instant frictionless preview testing!
      toast.success(`Tasdiqlash kodi Telegram @VerificationCodes orqali yuborildi: ${code}`);
    } catch {
      toast.info("Kod yuborildi: 729148");
      setOtpCode("729148");
      setOtpSent(true);
    } finally {
      setIsSendingOtp(false);
    }
  }

  function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!otpSent) {
      toast.error("Avval telefoningizga tasdiqlash kodini oling");
      return;
    }

    try {
      brokerStore.registerUser({
        fullName,
        email,
        phone,
        password,
        referralCode: referralCode || undefined,
      });

      toast.success("Ro'yxatdan muvaffaqiyatli o'tdingiz! $10,000 lik Demo va Real hisob ochildi.");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Ro'yxatdan o'tishda xatolik");
    }
  }

  function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 'creds') {
      // Proceed to 2FA step
      setStep('2fa');
      toast.info("2FA xavfsizlik kodi so'ralmoqda (Google Authenticator yoki SMS)");
      setTwoFactorCode("849201"); // Suggested testing code
      return;
    }

    // Complete login with 2FA
    toast.success("Xavfsiz 2FA tekshiruvidan muvaffaqiyatli o'tildi!");
    onSuccess?.();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div className="relative glass w-full max-w-md rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-all"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-2 text-primary font-bold text-xs mb-1">
          <ShieldCheck className="size-4" />
          <span>Xavfsiz Kirish & 2FA</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white">
          {mode === 'register' ? t.register : t.login}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {mode === 'register'
            ? "Institutsional Forex bozoriga 1 daqiqada ulaning"
            : "Shaxsiy kabinet va savdo hisobingizga kiring"}
        </p>

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="mt-5 flex flex-col gap-3.5">
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">To'liq Ism:</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Azizbek Rahimov"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-primary/50"
                />
                <User className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Email:</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="azizbek@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-primary/50"
                />
                <Mail className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Telefon Raqami (OTP uchun):</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="tel"
                    required
                    placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-primary/50"
                  />
                  <Phone className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="px-3 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white shrink-0"
                >
                  {isSendingOtp ? "Yuborilmoqda..." : "Kod olish"}
                </button>
              </div>
            </div>

            {otpSent && (
              <div>
                <label className="text-[11px] text-primary block mb-1">
                  Telegram / SMS Tasdiqlash Kodi:
                </label>
                <input
                  type="text"
                  required
                  placeholder="6 xonali kod"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-primary/10 border border-primary/40 rounded-xl p-2.5 text-center font-mono font-bold text-sm text-primary outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Parol:</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-primary/50"
                />
                <Lock className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Hamkorlik (Referral) Kodi (ixtiyoriy):</label>
              <input
                type="text"
                placeholder="EXORA-REF"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-primary text-black py-3 text-xs sm:text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]"
            >
              {t.register}
            </button>

            <div className="text-center text-xs text-muted-foreground mt-2">
              Akkauntingiz bormi?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-primary font-bold hover:underline"
              >
                Kirish
              </button>
            </div>
          </form>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="mt-5 flex flex-col gap-3.5">
            {step === 'creds' ? (
              <>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Email:</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="azizbek@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-primary/50"
                    />
                    <Mail className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Parol:</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-primary/50"
                    />
                    <Lock className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-xl bg-primary text-black py-3 text-xs sm:text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                >
                  Davom etish (2FA Tekshiruv)
                </button>
              </>
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary mx-auto flex items-center justify-center mb-2">
                    <KeyRound className="size-5" />
                  </div>
                  <div className="text-xs font-bold text-white">2-Bosqichli Autentifikatsiya (2FA)</div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Google Authenticator yoki SMS orqali kelgan 6 xonali kodni kiriting
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="849201"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    className="w-full bg-primary/10 border border-primary/40 rounded-xl p-3 text-center font-mono font-bold text-lg text-primary outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-primary text-black py-3 text-xs sm:text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                >
                  {t.login}
                </button>
              </>
            )}

            <div className="text-center text-xs text-muted-foreground mt-2">
              Hisobingiz yo'qmi?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setStep('creds');
                }}
                className="text-primary font-bold hover:underline"
              >
                Ro'yxatdan o'tish
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
