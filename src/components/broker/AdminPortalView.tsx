import React, { useState, useEffect } from "react";
import { brokerStore } from "../../lib/brokerStore";
import { translations, Language } from "../../lib/i18n";
import { BrokerUser, KycRecord, Transaction, AuditLogItem, ForexSymbolRate, UserRole } from "../../types/broker";
import { 
  ShieldCheck, 
  Users, 
  FileCheck, 
  DollarSign, 
  Sliders, 
  History, 
  Search, 
  Check, 
  X, 
  AlertCircle, 
  Lock, 
  KeyRound, 
  ChevronRight,
  TrendingUp,
  Download,
  Building
} from "lucide-react";
import { toast } from "sonner";

interface AdminPortalViewProps {
  lang: Language;
}

export function AdminPortalView({ lang }: AdminPortalViewProps) {
  const t = translations[lang];
  const [currentUser, setCurrentUser] = useState<BrokerUser>(brokerStore.getActiveUser());
  const [allUsers, setAllUsers] = useState<BrokerUser[]>(brokerStore.getAllUsers());
  const [kycList, setKycList] = useState<KycRecord[]>(brokerStore.getKycList());
  const [transactions, setTransactions] = useState<Transaction[]>(brokerStore.getTransactions());
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(brokerStore.getAuditLogs());
  const [symbols, setSymbols] = useState<ForexSymbolRate[]>(brokerStore.getSymbols());

  const [adminTab, setAdminTab] = useState<'dashboard' | 'users' | 'kyc' | 'finance' | 'settings' | 'audit'>('dashboard');

  // Search & Filter state
  const [searchUser, setSearchUser] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [activeRejectKycId, setActiveRejectKycId] = useState<string | null>(null);

  // Settings State
  const [editingSpreadSymbol, setEditingSpreadSymbol] = useState<string>('EUR/USD');
  const [newSpreadVal, setNewSpreadVal] = useState<number>(0.8);

  useEffect(() => {
    const unsub = brokerStore.subscribe(() => {
      setCurrentUser(brokerStore.getActiveUser());
      setAllUsers(brokerStore.getAllUsers());
      setKycList(brokerStore.getKycList());
      setTransactions(brokerStore.getTransactions());
      setAuditLogs(brokerStore.getAuditLogs());
      setSymbols(brokerStore.getSymbols());
    });
    return unsub;
  }, []);

  // Check RBAC permissions
  const role = currentUser.role;
  const isSuperAdmin = role === 'super_admin';
  const isFinance = isSuperAdmin || role === 'finance_admin';
  const isCompliance = isSuperAdmin || role === 'compliance_admin';
  const isSupport = isSuperAdmin || role === 'support_admin';

  // Metrics
  const pendingKycCount = kycList.filter((k) => k.status === 'pending').length;
  const pendingWithdrawals = transactions.filter((t) => t.type === 'withdrawal' && t.status === 'pending');
  const total24hDeposits = transactions
    .filter((t) => t.type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const total24hWithdrawals = transactions
    .filter((t) => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  function handleApproveKyc(kycId: string) {
    brokerStore.reviewKyc(kycId, true);
    toast.success("KYC muvaffaqiyatli tasdiqlandi!");
  }

  function handleRejectKyc(kycId: string) {
    brokerStore.reviewKyc(kycId, false, rejectReason || "Hujjat talablarga to'liq mos kelmadi");
    setActiveRejectKycId(null);
    setRejectReason('');
    toast.info("KYC rad etildi va foydalanuvchiga xabar yuborildi.");
  }

  function handleApproveWithdrawal(txId: string) {
    brokerStore.processWithdrawal(txId, 'approve');
    toast.success("Pul yechib olish so'rovi tasdiqlandi va to'lov amalga oshirildi!");
  }

  function handleRejectWithdrawal(txId: string) {
    brokerStore.processWithdrawal(txId, 'reject', "Mablag' yoki rekvizit xatosi");
    toast.info("So'rov rad etildi va mablag' treyder hisobiga qaytarildi.");
  }

  function handleToggleUserStatus(userId: string) {
    brokerStore.toggleUserStatus(userId);
    toast.info("Foydalanuvchi statusi o'zgartirildi.");
  }

  function handleUpdateSpread() {
    brokerStore.updateSymbolSpread(editingSpreadSymbol, newSpreadVal);
    toast.success(`${editingSpreadSymbol} spredi ${newSpreadVal} pip ga yangilandi!`);
  }

  function handleSwitchRole(userId: string) {
    brokerStore.switchUser(userId);
    toast.success(`Foydalanuvchi almashtirildi: ${userId}`);
  }

  // Filtered users
  const filteredUsers = allUsers.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* 1. ADMIN HEADER WITH RBAC SELECTOR */}
      <div className="glass rounded-3xl p-6 sm:p-7 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">
            <Lock className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Exora Broker Boshqaruv Paneli (Admin)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold uppercase font-mono">
                {currentUser.role}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Faol administrator: <strong className="text-white">{currentUser.fullName}</strong> ({currentUser.email})
            </div>
          </div>
        </div>

        {/* Quick RBAC Role Switcher for live testing */}
        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 text-xs">
          <span className="text-muted-foreground px-2">Rolni sinash:</span>
          {allUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => handleSwitchRole(u.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                currentUser.id === u.id
                  ? 'bg-primary text-black shadow-md'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              {u.role === 'super_admin' ? 'Super Admin' : u.role === 'compliance_admin' ? 'Compliance' : u.role === 'finance_admin' ? 'Moliya' : 'Mijoz (Client)'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. ADMIN TABS NAVIGATION */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setAdminTab('dashboard')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            adminTab === 'dashboard' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <Building className="size-4" />
          <span>Statistika (Overview)</span>
        </button>

        {isSupport && (
          <button
            onClick={() => setAdminTab('users')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              adminTab === 'users' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'
            }`}
          >
            <Users className="size-4" />
            <span>Foydalanuvchilar ({allUsers.length})</span>
          </button>
        )}

        {isCompliance && (
          <button
            onClick={() => setAdminTab('kyc')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              adminTab === 'kyc' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'
            }`}
          >
            <FileCheck className="size-4" />
            <span>KYC Navbati ({pendingKycCount})</span>
          </button>
        )}

        {isFinance && (
          <button
            onClick={() => setAdminTab('finance')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              adminTab === 'finance' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'
            }`}
          >
            <DollarSign className="size-4" />
            <span>Moliya & Withdrawals ({pendingWithdrawals.length})</span>
          </button>
        )}

        {isSuperAdmin && (
          <button
            onClick={() => setAdminTab('settings')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              adminTab === 'settings' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'
            }`}
          >
            <Sliders className="size-4" />
            <span>Spred & Risk Sozlamalari</span>
          </button>
        )}

        <button
          onClick={() => setAdminTab('audit')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            adminTab === 'audit' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <History className="size-4" />
          <span>Audit Loglari ({auditLogs.length})</span>
        </button>
      </div>

      {/* 3. TAB CONTENT MODULES */}

      {/* DASHBOARD TAB */}
      {adminTab === 'dashboard' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass rounded-2xl p-5 border border-white/10">
              <span className="text-xs text-muted-foreground">Jami Foydalanuvchilar</span>
              <div className="text-3xl font-black text-white font-mono mt-1">
                {allUsers.length}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="size-3" /> +14 yangi bugun
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-white/10">
              <span className="text-xs text-muted-foreground">24s Depozit Hajmi</span>
              <div className="text-3xl font-black text-primary font-mono mt-1">
                ${total24hDeposits.toLocaleString()}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                Payme, Click, Uzcard, USDT
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-white/10">
              <span className="text-xs text-muted-foreground">Kutilayotgan Chiqimlar (Withdrawals)</span>
              <div className="text-3xl font-black text-amber-400 font-mono mt-1">
                {pendingWithdrawals.length} so'rov
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                Maker-checker tasdiqlashi kutilmoqda
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-white/10">
              <span className="text-xs text-muted-foreground">Kutilayotgan KYC Hujjatlar</span>
              <div className="text-3xl font-black text-blue-400 font-mono mt-1">
                {pendingKycCount} nafar
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                Compliance navbatida
              </div>
            </div>
          </div>

          {/* Quick Action Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-5 border border-white/10">
              <h3 className="font-bold text-sm text-white mb-3 flex items-center justify-between">
                <span>Oxirgi Xavfsizlik Harakatlari</span>
                <span className="text-[10px] text-muted-foreground">Jonli</span>
              </h3>
              <div className="flex flex-col gap-2">
                {auditLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="text-xs p-2.5 rounded-xl bg-white/5 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-primary">{log.action}</span>
                      <span className="text-muted-foreground ml-2">{log.details}</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-white/10">
              <h3 className="font-bold text-sm text-white mb-3">
                Likvidlik & Server Holati
              </h3>
              <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
                <div className="flex justify-between p-2.5 rounded-xl bg-white/5">
                  <span>Asosiy Server:</span>
                  <span className="font-bold text-emerald-400">ExoraPrime-Live01 (Online 99.98%)</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-white/5">
                  <span>Likvidlik provayderlari:</span>
                  <span className="font-bold text-white">LMAX Global, Currenex, Swissquote</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-white/5">
                  <span>Buyurtma ijrosi o'rtacha kechikishi:</span>
                  <span className="font-mono font-bold text-primary">12.4 ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {adminTab === 'users' && (
        <div className="glass rounded-2xl p-6 border border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
            <h3 className="text-base font-bold text-white">Foydalanuvchilarni Boshqarish</h3>
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Ism yoki email bo'yicha qidiruv..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-primary/50"
              />
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-muted-foreground border-b border-white/10 pb-2">
                  <th className="py-2">Foydalanuvchi</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Rol</th>
                  <th className="py-2">KYC</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.03]">
                    <td className="py-3 font-bold text-white font-sans">{u.fullName}</td>
                    <td className="py-3 text-muted-foreground">{u.email}</td>
                    <td className="py-3 uppercase text-primary font-bold">{u.role}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        u.kycStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {u.kycStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(u.id)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          u.status === 'active'
                            ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                        }`}
                      >
                        {u.status === 'active' ? 'Bloklash' : 'Faollashtirish'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KYC QUEUE TAB */}
      {adminTab === 'kyc' && (
        <div className="glass rounded-2xl p-6 border border-white/10">
          <h3 className="text-base font-bold text-white pb-3 border-b border-white/10">
            KYC Hujjatlarini Tekshirish Navbati ({kycList.length})
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {kycList.map((kyc) => (
              <div key={kyc.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{kyc.userName}</div>
                      <div className="text-xs text-muted-foreground">{kyc.userEmail}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                      kyc.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : kyc.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {kyc.status}
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground font-mono">
                    Hujjat: <strong className="text-white">{kyc.documentType.toUpperCase()}</strong> (#{kyc.documentNumber})
                  </div>

                  {/* Document previews */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="h-32 rounded-xl overflow-hidden border border-white/10">
                      <img src={kyc.idFrontUrl} alt="Hujjat oldi" className="w-full h-full object-cover" />
                    </div>
                    <div className="h-32 rounded-xl overflow-hidden border border-white/10">
                      <img src={kyc.selfieUrl} alt="Selfi" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {kyc.status === 'pending' && (
                  <div className="mt-5 pt-3 border-t border-white/10 flex gap-2">
                    <button
                      onClick={() => handleApproveKyc(kyc.id)}
                      className="flex-1 rounded-xl bg-emerald-500 text-black py-2 text-xs font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-1"
                    >
                      <Check className="size-3.5" />
                      <span>Tasdiqlash</span>
                    </button>
                    <button
                      onClick={() => handleRejectKyc(kyc.id)}
                      className="flex-1 rounded-xl bg-rose-500/20 text-rose-400 py-2 text-xs font-bold hover:bg-rose-500/30 transition-all flex items-center justify-center gap-1"
                    >
                      <X className="size-3.5" />
                      <span>Rad etish</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FINANCE TAB */}
      {adminTab === 'finance' && (
        <div className="glass rounded-2xl p-6 border border-white/10">
          <h3 className="text-base font-bold text-white pb-3 border-b border-white/10">
            Pul Yechib Olish So'rovlari (Maker-Checker Nazorati)
          </h3>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-muted-foreground border-b border-white/10 pb-2">
                  <th className="py-2">TX ID</th>
                  <th className="py-2">Mijoz</th>
                  <th className="py-2">Summa</th>
                  <th className="py-2">Usul / Rekvizit</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Moliya Tasdig'i</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions
                  .filter((t) => t.type === 'withdrawal')
                  .map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.03]">
                      <td className="py-3 text-muted-foreground font-mono">#{tx.id.slice(-6)}</td>
                      <td className="py-3 font-bold text-white font-sans">{tx.userName}</td>
                      <td className="py-3 font-bold text-rose-400 font-mono">${tx.amount.toFixed(2)}</td>
                      <td className="py-3 text-muted-foreground">
                        {tx.paymentMethod.toUpperCase()} ({tx.paymentDetails?.destination || 'Rekvizit mavjud'})
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          tx.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : tx.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {tx.status === 'pending' ? (
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleApproveWithdrawal(tx.id)}
                              className="px-3 py-1 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400"
                            >
                              Tasdiqlash
                            </button>
                            <button
                              onClick={() => handleRejectWithdrawal(tx.id)}
                              className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/30"
                            >
                              Rad
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">Yakunlangan</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {adminTab === 'settings' && (
        <div className="max-w-xl glass rounded-3xl p-6 sm:p-8 border border-white/10">
          <h3 className="text-lg font-bold text-white pb-3 border-b border-white/10">
            Broker Spred & Risk Boshqaruvi
          </h3>

          <div className="mt-5 flex flex-col gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Aktivni tanlang:</label>
              <select
                value={editingSpreadSymbol}
                onChange={(e) => {
                  setEditingSpreadSymbol(e.target.value);
                  const s = symbols.find((x) => x.symbol === e.target.value);
                  if (s) setNewSpreadVal(s.spread);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-primary/50"
              >
                {symbols.map((s) => (
                  <option key={s.symbol} value={s.symbol} className="bg-neutral-900">
                    {s.symbol} ({s.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">Yangi Spred (Pips / Points):</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={newSpreadVal}
                onChange={(e) => setNewSpreadVal(parseFloat(e.target.value) || 0.1)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold font-mono text-white outline-none focus:border-primary/50"
              />
            </div>

            <button
              onClick={handleUpdateSpread}
              className="mt-2 rounded-xl bg-primary text-black py-3 text-xs font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20"
            >
              Spredni Yangilash
            </button>
          </div>
        </div>
      )}

      {/* AUDIT LOG TAB */}
      {adminTab === 'audit' && (
        <div className="glass rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">Xavfsizlik Audit Logi (Immutable Security Logs)</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Barcha admin amallari, IP manzillar va vaqt belgilari o'zgarmas holatda saqlanadi.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-mono text-primary font-bold">
              TLS 1.3 / AES-256
            </span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-muted-foreground border-b border-white/10 pb-2">
                  <th className="py-2">Vaqt</th>
                  <th className="py-2">Admin / Actor</th>
                  <th className="py-2">Rol</th>
                  <th className="py-2">Amal (Action)</th>
                  <th className="py-2">Tafsilot</th>
                  <th className="py-2 text-right">IP Manzil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.03]">
                    <td className="py-3 text-muted-foreground">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 font-bold text-white font-sans">{log.actorEmail}</td>
                    <td className="py-3 uppercase text-primary">{log.actorRole}</td>
                    <td className="py-3 font-bold text-white">{log.action}</td>
                    <td className="py-3 text-muted-foreground font-sans">{log.details}</td>
                    <td className="py-3 text-right text-muted-foreground">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
