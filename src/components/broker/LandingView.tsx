import React, { useState } from "react";
import { translations, Language } from "../../lib/i18n";
import { brokerStore } from "../../lib/brokerStore";
import { 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Percent, 
  Globe2, 
  ChevronRight, 
  ArrowUpRight,
  CreditCard,
  Building,
  CheckCircle2,
  Lock,
  Layers,
  Award
} from "lucide-react";

interface LandingViewProps {
  lang: Language;
  onOpenTrading: () => void;
  onOpenCabinet: () => void;
  onOpenRegister: () => void;
}

export function LandingView({ lang, onOpenTrading, onOpenCabinet, onOpenRegister }: LandingViewProps) {
  const t = translations[lang];
  const symbols = brokerStore.getSymbols();
  const [calcLot, setCalcLot] = useState<number>(1.0);
  const [calcPip, setCalcPip] = useState<number>(25);

  const estimatedProfit = (calcLot * 10 * calcPip).toFixed(2);

  return (
    <div className="flex flex-col gap-12 sm:gap-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/[0.07] via-white/[0.02] to-transparent p-6 sm:p-12 lg:p-16">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* License Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary mb-6">
            <ShieldCheck className="size-4" />
            <span>{t.licenseBadge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {t.heroTitle}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenRegister}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-black shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]"
            >
              <span>{t.startTradingBtn}</span>
              <ChevronRight className="size-4" />
            </button>

            <button
              onClick={onOpenTrading}
              className="glass-soft inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              <span>{t.webTraderTitle}</span>
              <ArrowUpRight className="size-4 text-primary" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/10">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{t.liveSpreads}</span>
              <span className="text-xl sm:text-2xl font-black text-white mt-1">0.0 Pips</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{t.leverageUpTo}</span>
              <span className="text-xl sm:text-2xl font-black text-primary mt-1">1:500</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{t.zeroCommission}</span>
              <span className="text-xl sm:text-2xl font-black text-white mt-1">0% Komissiya</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{t.fastExecution}</span>
              <span className="text-xl sm:text-2xl font-black text-primary mt-1">&lt; 15 ms</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE MARKET TICKER CAROUSEL */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              <span>{t.liveSpreads}</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {lang === 'uz' ? "Barcha mashhur Forex va tovar aktivlarida eng past spredlar" : "Ultra-low spreads on major Forex & commodities"}
            </p>
          </div>
          <button
            onClick={onOpenTrading}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>{t.webTraderTitle}</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {symbols.map((sym) => {
            const isPositive = sym.change24h >= 0;
            return (
              <div
                key={sym.symbol}
                onClick={onOpenTrading}
                className="glass-soft rounded-2xl p-4 flex items-center justify-between hover:border-primary/40 cursor-pointer transition-all hover:bg-white/[0.08]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                    {sym.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{sym.symbol}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">
                        {sym.spread} pip
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{sym.name}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-white">
                    {sym.bid.toFixed(sym.digitPrecision)}
                  </div>
                  <div className={`text-xs font-medium ${isPositive ? 'text-primary' : 'text-rose-400'}`}>
                    {isPositive ? '+' : ''}{sym.change24h}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. ACCOUNT TIERS COMPARISON */}
      <section className="flex flex-col gap-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.accountTypesTitle}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.accountTypesSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {/* Standard */}
          <div className="glass rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-white/10 hover:border-white/20 transition-all">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {lang === 'uz' ? "Boshlang'ichlar uchun" : "For Starters"}
              </div>
              <h3 className="text-2xl font-black text-white mt-1">{t.standardAccount}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">$50</span>
                <span className="text-xs text-muted-foreground">min. depozit</span>
              </div>

              <ul className="mt-6 flex flex-col gap-3 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                  <span>Spred: 1.0 pipdan</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                  <span>Kaldıraç (Leverage): <strong>1:500 gacha</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                  <span>Komissiya: <strong>$0 (Mutlaqo bepul)</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                  <span>Ijro: Instant / Market Execution</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenRegister}
              className="glass-soft mt-8 w-full rounded-2xl py-3 text-xs sm:text-sm font-bold text-white hover:bg-white/10 transition-all"
            >
              Standard Ochish
            </button>
          </div>

          {/* Pro (Highlighted) */}
          <div className="relative glass rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-2 border-primary/60 bg-gradient-to-b from-primary/10 via-white/[0.03] to-transparent shadow-2xl shadow-primary/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-[11px] font-black uppercase text-black">
              {lang === 'uz' ? "Eng Ommabop" : "Most Popular"}
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-primary">
                {lang === 'uz' ? "Tajribali Treyderlar" : "Active Traders"}
              </div>
              <h3 className="text-2xl font-black text-white mt-1">{t.proAccount}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">$500</span>
                <span className="text-xs text-muted-foreground">min. depozit</span>
              </div>

              <ul className="mt-6 flex flex-col gap-3 text-xs sm:text-sm text-white/90">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                  <span>Spred: <strong>0.5 pipdan</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                  <span>Kaldıraç (Leverage): <strong>1:200 gacha</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                  <span>Komissiya: $3.5 / lot</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                  <span>Shaxsiy hisob menejeri</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                  <span>VPS bepul taqdim etiladi</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenRegister}
              className="mt-8 w-full rounded-2xl bg-primary py-3 text-xs sm:text-sm font-bold text-black shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
            >
              Pro Hisob Ochish
            </button>
          </div>

          {/* ECN */}
          <div className="glass rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-white/10 hover:border-white/20 transition-all">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {lang === 'uz' ? "Institutsional Daraja" : "Institutional"}
              </div>
              <h3 className="text-2xl font-black text-white mt-1">{t.ecnAccount}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">$2,000</span>
                <span className="text-xs text-muted-foreground">min. depozit</span>
              </div>

              <ul className="mt-6 flex flex-col gap-3 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                  <span>Spred: <strong>0.0 Pip (Xom spredlar)</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                  <span>Kaldıraç (Leverage): <strong>1:100 gacha</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                  <span>Komissiya: $6.0 / round lot</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                  <span>To'g'ridan-to'g'ri LMAX & Currenex likvidligi</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenRegister}
              className="glass-soft mt-8 w-full rounded-2xl py-3 text-xs sm:text-sm font-bold text-white hover:bg-white/10 transition-all"
            >
              ECN Ochish
            </button>
          </div>
        </div>
      </section>

      {/* 4. PROFIT CALCULATOR & LOCAL PAYMENTS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interactive Pip / Profit Calculator */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10">
          <div className="flex items-center gap-2.5 text-primary font-bold text-sm">
            <Zap className="size-4" />
            <span>Foyda & Pip Kalkulyatori</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-2">
            Savdo foydasini hisoblang
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            EUR/USD standarti bo'yicha 1 lotdagi 1 pip qiymati = $10.00
          </p>

          <div className="mt-6 flex flex-col gap-5">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-muted-foreground">Lot hajmi:</span>
                <span className="text-white font-mono">{calcLot} Lot</span>
              </div>
              <input
                type="range"
                min={0.01}
                max={5}
                step={0.01}
                value={calcLot}
                onChange={(e) => setCalcLot(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-muted-foreground">Bozor harakati (Pip):</span>
                <span className="text-white font-mono">{calcPip} Pips</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                step={1}
                value={calcPip}
                onChange={(e) => setCalcPip(parseInt(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between mt-2">
              <div>
                <span className="text-xs text-muted-foreground">Taxminiy Foyda (Profit):</span>
                <div className="text-2xl sm:text-3xl font-black text-primary font-mono">
                  +${estimatedProfit}
                </div>
              </div>
              <button
                onClick={onOpenTrading}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-black hover:opacity-90"
              >
                Savdoni Boshlash
              </button>
            </div>
          </div>
        </div>

        {/* Local & Crypto Deposit Methods */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-primary font-bold text-sm">
              <CreditCard className="size-4" />
              <span>O'zbekiston & Xalqaro To'lovlar</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-2">
              Tezkor va 0% Komissiyali To'lovlar
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Payme, Click, Uzcard, Humo yoki USDT orqali 1 daqiqada hisobingizni to'ldiring va sarmoyangizni yeching.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#00CCCC]/20 flex items-center justify-center font-black text-xs text-[#00CCCC]">
                  P
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Payme</div>
                  <div className="text-[10px] text-muted-foreground">Avto 12,850 UZS</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#008AE6]/20 flex items-center justify-center font-black text-xs text-[#008AE6]">
                  C
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Click</div>
                  <div className="text-[10px] text-muted-foreground">Bir zumda o'tadi</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center font-black text-xs text-primary">
                  UZ
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Uzcard / Humo</div>
                  <div className="text-[10px] text-muted-foreground">Milliy kartalar</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#26A17B]/20 flex items-center justify-center font-black text-xs text-[#26A17B]">
                  ₮
                </div>
                <div>
                  <div className="font-bold text-xs text-white">USDT Crypto</div>
                  <div className="text-[10px] text-muted-foreground">TRC-20 & ERC-20</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Lock className="size-3.5 text-primary" />
              <span>256-bit Shifrlangan Xavfsiz Tranzaksiyalar</span>
            </span>
            <button
              onClick={onOpenCabinet}
              className="text-primary font-bold hover:underline"
            >
              Kabinetga o'tish &rarr;
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
