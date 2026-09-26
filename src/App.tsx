import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { translations, Language } from "./lib/i18n";
import { brokerStore } from "./lib/brokerStore";
import { BrokerUser } from "./types/broker";
import { LandingView } from "./components/broker/LandingView";
import { WebTraderView } from "./components/broker/WebTraderView";
import { ClientCabinetView } from "./components/broker/ClientCabinetView";
import { KycVerificationView } from "./components/broker/KycVerificationView";
import { EducationAndSupportView } from "./components/broker/EducationAndSupportView";
import { AdminPortalView } from "./components/broker/AdminPortalView";
import { AuthModal } from "./components/broker/AuthModal";
import { 
  ShieldCheck, 
  TrendingUp, 
  Wallet, 
  Layers, 
  BookOpen, 
  HelpCircle, 
  Lock, 
  Globe, 
  Menu, 
  X, 
  ChevronDown,
  User,
  LogOut,
  ArrowUpRight
} from "lucide-react";

export default function App() {
  const [lang, setLang] = useState<Language>('uz');
  const t = translations[lang];
  const [currentUser, setCurrentUser] = useState<BrokerUser>(brokerStore.getActiveUser());
  const [activeTab, setActiveTab] = useState<'landing' | 'webtrader' | 'cabinet' | 'kyc' | 'support' | 'admin'>('cabinet');

  // Auth Modal State
  const [authOpen, setAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('register');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = brokerStore.subscribe(() => {
      setCurrentUser(brokerStore.getActiveUser());
    });
    return unsub;
  }, []);

  function handleOpenAuth(mode: 'login' | 'register') {
    setAuthInitialMode(mode);
    setAuthOpen(true);
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#0e110f] text-[#f4f7f2] font-sans antialiased selection:bg-primary selection:text-black flex flex-col justify-between">
      <Toaster position="top-right" theme="dark" richColors />

      {/* 2. PRIMARY NAVBAR (Only displayed on landing page before login/register) */}
      {activeTab === 'landing' && (
        <header className="sticky top-0 z-40 bg-[#0e110f]/90 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
            {/* Brand Logo */}
            <div 
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary via-[#b9ef40] to-white flex items-center justify-center text-black font-black text-lg shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                EX
              </div>
              <div>
                <div className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                  <span>EXORA</span>
                  <span className="text-primary font-black">PRIME</span>
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider -mt-1">
                  Forex & CFD Broker
                </div>
              </div>
            </div>

            {/* Center Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 bg-white/[0.04] p-1.5 rounded-2xl border border-white/10 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('landing')}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  activeTab === 'landing' ? 'bg-white/10 text-white font-bold' : 'text-muted-foreground hover:text-white'
                }`}
              >
                {t.home}
              </button>
              <button
                onClick={() => setActiveTab('webtrader')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'webtrader' ? 'bg-primary text-black font-bold shadow-md' : 'text-muted-foreground hover:text-white'
                }`}
              >
                <TrendingUp className="size-3.5" />
                <span>{t.webTraderTitle}</span>
              </button>
              <button
                onClick={() => setActiveTab('cabinet')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'cabinet' ? 'bg-white/10 text-white font-bold' : 'text-muted-foreground hover:text-white'
                }`}
              >
                <Wallet className="size-3.5 text-primary" />
                <span>{t.clientCabinet}</span>
              </button>
              <button
                onClick={() => setActiveTab('kyc')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'kyc' ? 'bg-white/10 text-white font-bold' : 'text-muted-foreground hover:text-white'
                }`}
              >
                <ShieldCheck className="size-3.5 text-emerald-400" />
                <span>{t.kycStatus}</span>
              </button>
              <button
                onClick={() => setActiveTab('support')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'support' ? 'bg-white/10 text-white font-bold' : 'text-muted-foreground hover:text-white'
                }`}
              >
                <HelpCircle className="size-3.5 text-blue-400" />
                <span>{t.support}</span>
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin' ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40' : 'text-rose-400/80 hover:text-rose-300'
                }`}
              >
                <Lock className="size-3.5" />
                <span>Admin Panel</span>
              </button>
            </nav>

            {/* Right: Language Selector & Auth Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Language Dropdown */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                {(['uz', 'ru', 'en'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2 py-1 rounded-lg uppercase font-bold text-[11px] transition-all ${
                      lang === l ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {/* User Profile or Login/Register */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all"
                >
                  {t.login}
                </button>
                <button
                  onClick={() => handleOpenAuth('register')}
                  className="px-4 py-2 rounded-xl bg-primary text-black text-xs font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all"
                >
                  {t.register}
                </button>
              </div>
            </div>

            {/* Mobile Menu Trigger */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
              >
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-white/10 bg-[#0e110f] p-4 flex flex-col gap-3">
              <div className="flex gap-2 pb-3 border-b border-white/10">
                {(['uz', 'ru', 'en'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`flex-1 py-1.5 rounded-lg uppercase font-bold text-xs ${
                      lang === l ? 'bg-primary text-black' : 'bg-white/5 text-muted-foreground'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <button
                onClick={() => { setActiveTab('landing'); setMobileMenuOpen(false); }}
                className="text-left py-2 text-sm font-semibold text-white"
              >
                {t.home}
              </button>
              <button
                onClick={() => { setActiveTab('webtrader'); setMobileMenuOpen(false); }}
                className="text-left py-2 text-sm font-bold text-primary flex items-center gap-2"
              >
                <TrendingUp className="size-4" />
                <span>{t.webTraderTitle}</span>
              </button>
              <button
                onClick={() => { setActiveTab('cabinet'); setMobileMenuOpen(false); }}
                className="text-left py-2 text-sm font-semibold text-white flex items-center gap-2"
              >
                <Wallet className="size-4 text-primary" />
                <span>{t.clientCabinet}</span>
              </button>
              <button
                onClick={() => { setActiveTab('kyc'); setMobileMenuOpen(false); }}
                className="text-left py-2 text-sm font-semibold text-white flex items-center gap-2"
              >
                <ShieldCheck className="size-4 text-emerald-400" />
                <span>{t.kycStatus}</span>
              </button>
              <button
                onClick={() => { setActiveTab('support'); setMobileMenuOpen(false); }}
                className="text-left py-2 text-sm font-semibold text-white flex items-center gap-2"
              >
                <HelpCircle className="size-4 text-blue-400" />
                <span>{t.support}</span>
              </button>
              <button
                onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                className="text-left py-2 text-sm font-bold text-rose-400 flex items-center gap-2"
              >
                <Lock className="size-4" />
                <span>Admin Panel</span>
              </button>

              <div className="flex gap-2 pt-3 border-t border-white/10">
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold"
                >
                  {t.login}
                </button>
                <button
                  onClick={() => handleOpenAuth('register')}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-black text-xs font-bold"
                >
                  {t.register}
                </button>
              </div>
            </div>
          )}
        </header>
      )}

      {/* 3. MAIN WORKSPACE CONTAINER */}
      {activeTab === 'cabinet' ? (
        <div className="flex-1 w-full flex flex-col">
          <ClientCabinetView
            lang={lang}
            onOpenKyc={() => setActiveTab('kyc')}
            onOpenTrade={() => setActiveTab('webtrader')}
            onLogout={() => setActiveTab('landing')}
          />
        </div>
      ) : activeTab === 'webtrader' ? (
        <div className="flex-1 w-full h-full flex flex-col">
          <WebTraderView
            lang={lang}
            onOpenDeposit={() => setActiveTab('cabinet')}
            onReturnToCabinet={() => setActiveTab('cabinet')}
          />
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex-1 w-full">
          {activeTab === 'landing' && (
            <LandingView
              lang={lang}
              onOpenTrading={() => setActiveTab('webtrader')}
              onOpenCabinet={() => setActiveTab('cabinet')}
              onOpenRegister={() => handleOpenAuth('register')}
            />
          )}

          {activeTab === 'kyc' && (
            <div className="space-y-4">
              <button
                onClick={() => setActiveTab('cabinet')}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white inline-flex items-center gap-1.5 border border-white/10"
              >
                &larr; Kabinetga qaytish
              </button>
              <KycVerificationView lang={lang} />
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-4">
              <button
                onClick={() => setActiveTab('cabinet')}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white inline-flex items-center gap-1.5 border border-white/10"
              >
                &larr; Kabinetga qaytish
              </button>
              <EducationAndSupportView lang={lang} />
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-4">
              <button
                onClick={() => setActiveTab('cabinet')}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white inline-flex items-center gap-1.5 border border-white/10"
              >
                &larr; Kabinetga qaytish
              </button>
              <AdminPortalView lang={lang} />
            </div>
          )}
        </main>
      )}

      {/* 4. FOOTER WITH REGULATORY & RISK WARNING (Only shown on public landing page) */}
      {activeTab === 'landing' && (
        <footer className="mt-16 border-t border-white/10 bg-black/40 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                EX
              </div>
              <span className="font-bold text-white text-sm">EXORA PRIME GLOBAL</span>
            </div>
            <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
              <button onClick={() => setActiveTab('landing')} className="hover:text-white">Asosiy</button>
              <button onClick={() => setActiveTab('webtrader')} className="hover:text-white">WebTrader</button>
              <button onClick={() => setActiveTab('cabinet')} className="hover:text-white">Kabinet</button>
              <button onClick={() => setActiveTab('kyc')} className="hover:text-white">KYC</button>
              <button onClick={() => setActiveTab('support')} className="hover:text-white">Yordam</button>
              <button onClick={() => setActiveTab('admin')} className="text-rose-400 hover:text-rose-300">Admin</button>
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground leading-relaxed flex flex-col gap-2">
            <p>
              <strong>Xavf to'g'risida ogohlantirish (Risk Warning):</strong> Forex va CFD (narxlar farqi bo'yicha shartnomalar) marjali vositalar bo'lib, yuqori darajadagi risk bilan bog'liq. Kaldıraç (leverage) ham foydangizni, ham zararingizni bir necha barobar oshirishi mumkin. Savdoni boshlashdan oldin moliyaviy imkoniyatlaringizni to'g'ri baholang va xavflarni to'liq tushunganingizga ishonch hosil qiling.
            </p>
            <p>
              Exora Prime Financial Services Authority (FSA-SVG) tomonidan litsenziyalangan va xalqaro AML/KYC qoidalariga to'liq amal qiladi. Ro'yxatdan o'tish raqami: 26842 IBC 2024. Barcha mijoz mablag'lari Tier-1 xalqaro banklarida ajratilgan (segregated) hisoblarda saqlanadi.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-4 border-t border-white/5">
            <div>&copy; {new Date().getFullYear()} Exora Prime. Barcha huquqlar himoyalangan.</div>
            <div className="font-mono text-[11px]">Secure Connection: TLS 1.3 &bull; AES-256</div>
          </div>
        </div>
      </footer>
      )}

      {/* Auth Modal (Register + OTP & Login + 2FA) */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setActiveTab('cabinet');
          setCurrentUser(brokerStore.getActiveUser());
        }}
        lang={lang}
        initialMode={authInitialMode}
      />
    </div>
  );
}
