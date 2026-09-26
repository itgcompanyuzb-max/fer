import React, { useState, useEffect, useRef } from "react";
import { brokerStore } from "../../lib/brokerStore";
import { translations, Language } from "../../lib/i18n";
import { TradingAccount, Transaction, AccountType, PaymentMethod } from "../../types/broker";
import { 
  CreditCard, 
  ArrowDownLeft, 
  ArrowDownRight,
  ArrowUpRight, 
  Wallet, 
  Layers, 
  Copy, 
  Check, 
  ShieldCheck, 
  Clock, 
  Users, 
  Plus, 
  QrCode,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sun,
  Moon,
  Globe,
  HelpCircle,
  Bell,
  User as UserIcon,
  RotateCcw,
  FileText,
  TrendingUp,
  History,
  Send,
  Download,
  X,
  Lock,
  Eye,
  EyeOff,
  MoreVertical,
  CheckCircle2,
  Calendar,
  DollarSign,
  ArrowRightLeft,
  Shield,
  MessageSquare,
  Sparkles,
  Search,
  List,
  Grid,
  LogOut
} from "lucide-react";
import { toast } from "sonner";

interface ClientCabinetViewProps {
  lang: Language;
  onOpenKyc: () => void;
  onOpenTrade: () => void;
  onLogout?: () => void;
}

export function ClientCabinetView({ lang, onOpenKyc, onOpenTrade, onLogout }: ClientCabinetViewProps) {
  const t = translations[lang];
  const [currentUser, setCurrentUser] = useState(brokerStore.getActiveUser());
  const [accounts, setAccounts] = useState<TradingAccount[]>(brokerStore.getAccounts());
  const [transactions, setTransactions] = useState<Transaction[]>(brokerStore.getTransactions());

  // Navigation state for broker cabinet sidebar
  const [currentNav, setCurrentNav] = useState<
    'accounts' | 'performance' | 'history' | 'deposit' | 'withdraw' | 'transfer' | 
    'tx_history' | 'funding_wallet' | 'crypto_wallet' | 'insights' | 'benefits' | 
    'support_hub' | 'profile' | 'referrals'
  >('accounts');

  // Sidebar collapsible sections
  const [tradingOpen, setTradingOpen] = useState(true);
  const [paymentsOpen, setPaymentsOpen] = useState(true);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [benefitsOpen, setBenefitsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Accounts view state
  const [accountTypeTab, setAccountTypeTab] = useState<'real' | 'demo'>('real');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [hideArchived, setHideArchived] = useState(false);

  // Theme mode: dark by default as in user screenshot
  const [cabinetTheme, setCabinetTheme] = useState<'light' | 'dark'>('dark');

  // Modals & Popups
  const [showBalanceDropdown, setShowBalanceDropdown] = useState(false);
  const [hideBalance, setHideBalance] = useState<boolean>(() => {
    try {
      return localStorage.getItem('exora_hide_balance') === 'true';
    } catch {
      return false;
    }
  });
  const balanceDropdownRef = useRef<HTMLDivElement>(null);

  // Close balance dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (balanceDropdownRef.current && !balanceDropdownRef.current.contains(event.target as Node)) {
        setShowBalanceDropdown(false);
      }
    }
    if (showBalanceDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBalanceDropdown]);

  const toggleHideBalance = () => {
    setHideBalance(prev => {
      const next = !prev;
      try {
        localStorage.setItem('exora_hide_balance', String(next));
      } catch {}
      return next;
    });
  };
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [legalModalType, setLegalModalType] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<'NEWEST' | 'HIGHEST BALANCE' | 'LOWEST BALANCE' | 'NICKNAME'>('NEWEST');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [summaryDays, setSummaryDays] = useState(365);
  const [historyOrderType, setHistoryOrderType] = useState<'closed' | 'open' | 'pending'>('closed');
  const [historySelectedAcc, setHistorySelectedAcc] = useState<string>('all');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [supportTab, setSupportTab] = useState<'chat' | 'faq'>('chat');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);
  const [showOpenAccountModal, setShowOpenAccountModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState<TradingAccount | null>(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPwaBanner, setShowPwaBanner] = useState(true);

  // Address verification form state
  const [addressCountry, setAddressCountry] = useState('Uzbekistan');
  const [addressCity, setAddressCity] = useState('Tashkent');
  const [addressLine, setAddressLine] = useState('Amir Temur Avenue 42, Apt 18');
  const [addressZip, setAddressZip] = useState('100000');
  const [addressDocType, setAddressDocType] = useState('bank_statement');
  const [uploadedDocName, setUploadedDocName] = useState('Bank_Statement_Aug2026.pdf');
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);

  // Open new account form state
  const [newAccType, setNewAccType] = useState<AccountType>('standard');
  const [newAccPlatform, setNewAccPlatform] = useState<'MT5' | 'MT4'>('MT5');
  const [newAccIsDemo, setNewAccIsDemo] = useState(false);
  const [newAccLeverage, setNewAccLeverage] = useState(2000);
  const [newAccNickname, setNewAccNickname] = useState('');

  // Deposit state
  const [depositAccId, setDepositAccId] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<number>(250);
  const [depositMethod, setDepositMethod] = useState<'payme' | 'click' | 'uzcard_humo' | 'crypto_usdt'>('payme');
  const [cardOrWallet, setCardOrWallet] = useState<string>('8600 1482 9901 4412');

  // Withdraw state
  const [withdrawAccId, setWithdrawAccId] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100);
  const [withdrawMethod, setWithdrawMethod] = useState<PaymentMethod>('uzcard_humo');
  const [withdrawDestination, setWithdrawDestination] = useState<string>('8600 1482 9901 4412');

  // Internal transfer state
  const [transferFromId, setTransferFromId] = useState<string>('');
  const [transferToId, setTransferToId] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(50);

  // Live chat messages
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    { sender: 'bot', text: 'Hello AVAZJON! Welcome to Exora 24/7 Support Desk. How can we assist you today with your trading accounts or verification?', time: '10:00' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    const unsub = brokerStore.subscribe(() => {
      const u = brokerStore.getActiveUser();
      setCurrentUser(u);
      const accs = brokerStore.getAccounts();
      setAccounts(accs);
      setTransactions(brokerStore.getTransactions());
    });
    return unsub;
  }, []);

  // Filter accounts for current user
  const userAccounts = accounts.filter(a => a.userId === currentUser.id || !a.userId || currentUser.role === 'super_admin');
  const rawActiveAccounts = userAccounts.filter(a => !a.isArchived && (accountTypeTab === 'real' ? !a.isDemo : a.isDemo));
  const activeAccounts = [...rawActiveAccounts].sort((a, b) => {
    if (sortOption === 'HIGHEST BALANCE') return (b.balance || 0) - (a.balance || 0);
    if (sortOption === 'LOWEST BALANCE') return (a.balance || 0) - (b.balance || 0);
    if (sortOption === 'NICKNAME') return (a.nickname || a.accountNumber).localeCompare(b.nickname || b.accountNumber);
    return Number(b.accountNumber || 0) - Number(a.accountNumber || 0);
  });
  const archivedAccounts = userAccounts.filter(a => a.isArchived);

  // Total balance calculations
  const totalRealBalance = userAccounts
    .filter(a => !a.isDemo && !a.isArchived)
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedText(null), 2000);
  }

  function handleRestoreAccount(account: TradingAccount) {
    try {
      brokerStore.restoreAccount(account.id);
      toast.success(`Account #${account.accountNumber} has been successfully restored!`);
      if (account.isDemo) {
        setAccountTypeTab('demo');
      } else {
        setAccountTypeTab('real');
      }
    } catch (e) {
      toast.error("Failed to restore account");
    }
  }

  function handleArchiveAccount(account: TradingAccount) {
    try {
      brokerStore.archiveAccount(account.id);
      toast.info(`Account #${account.accountNumber} moved to archived`);
    } catch (e) {
      toast.error("Failed to archive account");
    }
  }

  function handleCreateAccount() {
    try {
      const created = brokerStore.openNewTradingAccount({
        accountType: newAccType,
        platform: newAccPlatform,
        isDemo: newAccIsDemo,
        leverage: newAccLeverage,
        currency: 'USD',
        nickname: newAccNickname || (newAccType.toUpperCase() + ' ' + newAccPlatform),
        initialBalance: newAccIsDemo ? 10000 : 0
      });
      toast.success(`New ${created.platform} ${created.accountType} account #${created.accountNumber} created!`);
      setShowOpenAccountModal(false);
      setAccountTypeTab(newAccIsDemo ? 'demo' : 'real');
    } catch (err) {
      toast.error("Error creating account");
    }
  }

  function handleSubmitAddressVerification(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmittingAddress(true);
    setTimeout(() => {
      brokerStore.submitAddressVerification({
        country: addressCountry,
        city: addressCity,
        addressLine: addressLine,
        postalCode: addressZip,
        documentType: addressDocType,
      });
      setIsSubmittingAddress(false);
      setShowAddressModal(false);
      toast.success("Residential address confirmation submitted! Our compliance team will review your document within 1-2 hours.");
    }, 900);
  }

  function handleSendChatMessage() {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, time: now }]);
    setChatInput('');

    setTimeout(() => {
      let reply = "Thank you for reaching out, AVAZJON. A dedicated support agent has been notified and will assist you shortly.";
      if (userMsg.toLowerCase().includes('address') || userMsg.toLowerCase().includes('residence') || userMsg.toLowerCase().includes('kyc')) {
        reply = "Regarding address verification: Please make sure your utility bill or bank statement has been issued within the last 6 months, displays your full name AVAZJON and residential address clearly. You can upload it via the 'Complete' button in your Personal Area.";
      } else if (userMsg.toLowerCase().includes('restore') || userMsg.toLowerCase().includes('archive')) {
        reply = "You can restore any of your archived MT5 accounts by clicking the 'Restore' button next to the account number. The account will immediately become active again.";
      } else if (userMsg.toLowerCase().includes('deposit') || userMsg.toLowerCase().includes('payme') || userMsg.toLowerCase().includes('click')) {
        reply = "Local deposits via Payme, Click, and Uzcard/Humo are processed instantly at the current Central Bank exchange rate (12,850 UZS/USD) with 0% commission.";
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 700);
  }

  // Theme styling helpers
  const isDark = cabinetTheme === 'dark';
  const bgMain = isDark ? 'bg-[#0f1210] text-[#f4f7f2]' : 'bg-[#f7f9fb] text-[#1a1e24]';
  const bgCard = isDark ? 'bg-[#181c19] border-white/10' : 'bg-white border-[#e6eaf0]';
  const bgHeader = isDark ? 'bg-[#131714]/95 border-white/10' : 'bg-white border-[#e6eaf0]';
  const bgSidebar = isDark ? 'bg-[#131714] border-white/10' : 'bg-white border-[#e6eaf0]';
  const textMuted = isDark ? 'text-[#8a928c]' : 'text-[#626d7c]';
  const textPrimary = isDark ? 'text-white' : 'text-[#10141a]';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${bgMain}`}>
      {/* 1. PERSONAL AREA HEADER BAR */}
      <header className={`sticky top-0 z-30 h-16 border-b px-4 sm:px-6 flex items-center justify-between ${bgHeader}`}>
        {/* Left: Logo + Mobile menu toggle */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setCurrentNav('accounts')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-[#ffde00] text-black font-black flex items-center justify-center text-xs tracking-tight shadow-sm">
              EX
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#10141a] dark:text-white flex items-center">
              EXORA<span className="text-[#ffde00]">.</span>
            </span>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* 1. Interactive Balance Display with Exness-style Quick Actions Popover */}
          <div className="relative" ref={balanceDropdownRef}>
            <button
              onClick={() => setShowBalanceDropdown(!showBalanceDropdown)}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-sans select-none ${
                showBalanceDropdown
                  ? 'bg-gray-200 dark:bg-[#20252f] border-gray-300 dark:border-[#323946] text-gray-900 dark:text-white shadow-xs'
                  : 'bg-gray-100/80 dark:bg-[#1a1e26] hover:bg-gray-200/70 dark:hover:bg-[#222731] border-gray-200/70 dark:border-white/5 text-gray-900 dark:text-white'
              }`}
              title="Hisob balansi va tezkor amallar"
            >
              <span className="font-bold text-sm tracking-tight font-mono">
                {hideBalance ? '•••••• USD' : `${totalRealBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`}
              </span>
              <ChevronDown className={`size-3.5 text-gray-400 transition-transform duration-200 ${showBalanceDropdown ? 'rotate-180 text-[#ffde00]' : ''}`} />
            </button>

            {/* Balance Dropdown Popover (Exness Style) */}
            {showBalanceDropdown && (
              <div className="absolute right-0 mt-2.5 w-80 sm:w-88 rounded-2xl shadow-2xl border p-4 sm:p-5 z-50 animate-in fade-in zoom-in-95 duration-150 bg-white dark:bg-[#181a20] border-gray-200 dark:border-[#2b313d] text-gray-900 dark:text-white">
                {/* 3 Circular Action Buttons: Deposit, Withdrawal, Transfer */}
                <div className="grid grid-cols-3 gap-2 pb-4 pt-1">
                  {/* Deposit button */}
                  <button
                    onClick={() => { setCurrentNav('deposit'); setShowBalanceDropdown(false); }}
                    className="flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#232832] group-hover:bg-[#ffde00] group-hover:text-black dark:group-hover:bg-[#ffde00] dark:group-hover:text-black border border-gray-200/60 dark:border-[#2f3542] flex items-center justify-center text-gray-800 dark:text-gray-200 transition-all duration-150 shadow-xs group-active:scale-95">
                      <ArrowDownRight className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      Deposit
                    </span>
                  </button>

                  {/* Withdrawal button */}
                  <button
                    onClick={() => { setCurrentNav('withdraw'); setShowBalanceDropdown(false); }}
                    className="flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#232832] group-hover:bg-[#ffde00] group-hover:text-black dark:group-hover:bg-[#ffde00] dark:group-hover:text-black border border-gray-200/60 dark:border-[#2f3542] flex items-center justify-center text-gray-800 dark:text-gray-200 transition-all duration-150 shadow-xs group-active:scale-95">
                      <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      Withdrawal
                    </span>
                  </button>

                  {/* Transfer button */}
                  <button
                    onClick={() => { setCurrentNav('transfer'); setShowBalanceDropdown(false); }}
                    className="flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#232832] group-hover:bg-[#ffde00] group-hover:text-black dark:group-hover:bg-[#ffde00] dark:group-hover:text-black border border-gray-200/60 dark:border-[#2f3542] flex items-center justify-center text-gray-800 dark:text-gray-200 transition-all duration-150 shadow-xs group-active:scale-95">
                      <ArrowRightLeft className="size-5 transition-transform group-hover:rotate-180" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      Transfer
                    </span>
                  </button>
                </div>

                {/* Hide balance toggle row */}
                <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 dark:border-[#272b35]">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hide balance
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={hideBalance}
                    onClick={toggleHideBalance}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      hideBalance ? 'bg-[#ffde00]' : 'bg-gray-300 dark:bg-[#343a46]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        hideBalance ? 'translate-x-5 !bg-black' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Funding wallet card */}
                <div
                  onClick={() => { setCurrentNav('funding_wallet'); setShowBalanceDropdown(false); }}
                  className="mt-3 p-3.5 rounded-xl bg-gray-50 dark:bg-[#20252f] hover:bg-gray-100 dark:hover:bg-[#272d38] border border-gray-200/70 dark:border-[#2b313d] transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white font-mono">
                      {hideBalance ? '•••••• USD' : '0.00 USD'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                      Funding wallet
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* Trading accounts card */}
                <div
                  onClick={() => { setCurrentNav('accounts'); setShowBalanceDropdown(false); }}
                  className="mt-2.5 p-3.5 rounded-xl bg-gray-50 dark:bg-[#20252f] hover:bg-gray-100 dark:hover:bg-[#272d38] border border-gray-200/70 dark:border-[#2b313d] transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white font-mono">
                      {hideBalance ? '•••••• USD' : `${totalRealBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium flex items-center gap-1.5">
                      <span>Trading accounts</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-semibold font-mono">
                        {userAccounts.filter(a => !a.isArchived).length} accounts
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* Transaction history & Manage accounts shortcuts */}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#272b35] flex items-center justify-between text-xs">
                  <button
                    onClick={() => { setCurrentNav('tx_history'); setShowBalanceDropdown(false); }}
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                  >
                    <History className="size-3.5" />
                    <span>Transaction history</span>
                  </button>
                  <button
                    onClick={() => { setCurrentNav('accounts'); setShowBalanceDropdown(false); }}
                    className="text-[#ffde00] hover:underline font-semibold cursor-pointer"
                  >
                    Manage accounts
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Search Icon (Qidiruv) */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/10"
            title="Qidiruv (Aktivlar, hisoblar, xizmatlar)"
          >
            <Search className="size-4" />
          </button>

          {/* 3. Theme Toggle (Sun/Moon) */}
          <button
            onClick={() => setCabinetTheme(isDark ? 'light' : 'dark')}
            title="Mavzuni o'zgartirish (Tun / Kun)"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          {/* 4. Help & Support Icon (?) */}
          <button
            onClick={() => setShowSupportModal(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            title="Yordam markazi & Live Chat"
          >
            <HelpCircle className="size-4" />
          </button>

          {/* 5. Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all relative"
              title="Bildirishnomalar"
            >
              <Bell className="size-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#f59e0b]" />
            </button>

            {showNotificationDrawer && (
              <div className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border p-4 z-50 ${bgCard}`}>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
                  <span className="font-bold text-sm">Bildirishnomalar</span>
                  <span className="text-[11px] text-[#f59e0b] font-semibold">1 ta Muhim Harakat</span>
                </div>
                <div className="py-3 flex flex-col gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs">
                    <p className="font-bold text-amber-900 dark:text-amber-200">Yashash Manzilini Tasdiqlash</p>
                    <p className="text-amber-700 dark:text-amber-300/80 mt-1">Hisobingiz to'liq faollashishi uchun yashash joyingiz hujjatini tasdiqlang.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 text-xs text-gray-600 dark:text-gray-300">
                    <p className="font-semibold text-gray-900 dark:text-white">MT5 Server Profilaktikasi</p>
                    <p className="text-muted-foreground mt-0.5">Haftalik rejaviy server yangilanishi muvaffaqiyatli yakunlandi.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 6. User Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ffde00] to-amber-500 text-black font-black flex items-center justify-center text-xs transition-all shadow-sm cursor-pointer hover:scale-105"
              title={currentUser.fullName}
            >
              {currentUser.fullName.charAt(0)}
            </button>

            {showProfileMenu && (
              <div className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl border p-4 z-50 ${bgCard}`}>
                <div className="pb-3 border-b border-gray-100 dark:border-white/10">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{currentUser.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    KYC: {currentUser.kycStatus === 'approved' ? 'Tasdiqlangan' : 'Kutilmoqda'}
                  </div>
                </div>
                <div className="py-2 flex flex-col gap-1 text-xs">
                  <button 
                    onClick={() => { onOpenKyc(); setShowProfileMenu(false); }}
                    className="text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 font-semibold text-primary flex items-center gap-2"
                  >
                    <ShieldCheck className="size-3.5" />
                    <span>KYC Verifikatsiyasi</span>
                  </button>
                  <button 
                    onClick={() => { setCurrentNav('profile'); setShowProfileMenu(false); }}
                    className="text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 font-medium"
                  >
                    Profil Sozlamalari
                  </button>
                  <button 
                    onClick={() => { setShowAddressModal(true); setShowProfileMenu(false); }}
                    className="text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 font-medium text-amber-600 dark:text-amber-400"
                  >
                    Manzilni Tasdiqlash
                  </button>
                  <button 
                    onClick={() => { setCurrentNav('referrals'); setShowProfileMenu(false); }}
                    className="text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 font-medium"
                  >
                    Hamkorlik Dasturi
                  </button>

                  <div className="pt-2 border-t border-gray-100 dark:border-white/10 mt-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout?.();
                        toast.info("Tizimdan muvaffaqiyatli chiqildi");
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-500/10 text-rose-500 font-bold flex items-center gap-2"
                    >
                      <LogOut className="size-3.5" />
                      <span>Tizimdan chiqish</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT: SIDEBAR + MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR (Matching Screenshot 1 & 2) */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} shrink-0 border-r flex flex-col justify-between transition-all duration-200 select-none ${bgSidebar}`}>
          {/* Scrollable menu items */}
          <div className="p-3 overflow-y-auto space-y-1">
            {/* SECTION 1: TRADING */}
            <div>
              <button
                onClick={() => setTradingOpen(!tradingOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                  sidebarCollapsed ? 'justify-center' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="size-4 text-gray-500 dark:text-gray-400" />
                  {!sidebarCollapsed && <span>Trading</span>}
                </div>
                {!sidebarCollapsed && (
                  tradingOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />
                )}
              </button>

              {tradingOpen && !sidebarCollapsed && (
                <div className="pl-7 pr-1 space-y-0.5 mt-0.5">
                  <button
                    onClick={() => setCurrentNav('accounts')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      currentNav === 'accounts'
                        ? 'bg-[#edf2f7] dark:bg-white/10 text-gray-900 dark:text-white font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    Accounts
                  </button>
                  <button
                    onClick={() => setCurrentNav('performance')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      currentNav === 'performance'
                        ? 'bg-[#edf2f7] dark:bg-white/10 text-gray-900 dark:text-white font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    Performance
                  </button>
                  <button
                    onClick={() => setCurrentNav('history')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      currentNav === 'history'
                        ? 'bg-[#edf2f7] dark:bg-white/10 text-gray-900 dark:text-white font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    History of orders
                  </button>
                </div>
              )}
            </div>

            {/* Exora Terminal link */}
            <button
              onClick={onOpenTrade}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="size-4 text-gray-500 dark:text-gray-400" />
                {!sidebarCollapsed && <span>Exora Terminal</span>}
              </div>
              {!sidebarCollapsed && <ExternalLink className="size-3 text-gray-400" />}
            </button>

            {/* SECTION 2: PAYMENTS & WALLET */}
            <div className="pt-1">
              <button
                onClick={() => setPaymentsOpen(!paymentsOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                  sidebarCollapsed ? 'justify-center' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wallet className="size-4 text-gray-500 dark:text-gray-400" />
                  {!sidebarCollapsed && <span>Payments & wallet</span>}
                </div>
                {!sidebarCollapsed && (
                  paymentsOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />
                )}
              </button>

              {paymentsOpen && !sidebarCollapsed && (
                <div className="pl-7 pr-1 space-y-0.5 mt-0.5">
                  <button
                    onClick={() => setCurrentNav('deposit')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      currentNav === 'deposit'
                        ? 'bg-[#edf2f7] dark:bg-white/10 text-gray-900 dark:text-white font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    Deposit
                  </button>
                  <button
                    onClick={() => setCurrentNav('withdraw')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      currentNav === 'withdraw'
                        ? 'bg-[#edf2f7] dark:bg-white/10 text-gray-900 dark:text-white font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    Withdraw
                  </button>
                  <button
                    onClick={() => setCurrentNav('transfer')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      currentNav === 'transfer'
                        ? 'bg-[#edf2f7] dark:bg-white/10 text-gray-900 dark:text-white font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>Transfer</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#e0f2fe] text-[#0284c7] dark:bg-sky-950 dark:text-sky-300">New</span>
                  </button>
                  <button
                    onClick={() => setCurrentNav('tx_history')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      currentNav === 'tx_history'
                        ? 'bg-[#edf2f7] dark:bg-white/10 text-gray-900 dark:text-white font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    Transaction history
                  </button>
                  <button
                    onClick={() => setCurrentNav('funding_wallet')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      currentNav === 'funding_wallet'
                        ? 'bg-[#edf2f7] dark:bg-white/10 text-gray-900 dark:text-white font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>Funding wallet</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#e0f2fe] text-[#0284c7] dark:bg-sky-950 dark:text-sky-300">New</span>
                  </button>
                  <button
                    onClick={() => setCurrentNav('crypto_wallet')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      currentNav === 'crypto_wallet'
                        ? 'bg-[#edf2f7] dark:bg-white/10 text-gray-900 dark:text-white font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    Crypto wallet
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 3: INSIGHTS */}
            <div className="pt-1">
              <button
                onClick={() => setInsightsOpen(!insightsOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                  sidebarCollapsed ? 'justify-center' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="size-4 text-gray-500 dark:text-gray-400" />
                  {!sidebarCollapsed && <span>Insights</span>}
                </div>
                {!sidebarCollapsed && (
                  insightsOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />
                )}
              </button>

              {insightsOpen && !sidebarCollapsed && (
                <div className="pl-7 pr-1 space-y-0.5 mt-0.5">
                  <button
                    onClick={() => setCurrentNav('insights')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    Market Analysis & Calendar
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 4: TRADING BENEFITS */}
            <div className="pt-1">
              <button
                onClick={() => setBenefitsOpen(!benefitsOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                  sidebarCollapsed ? 'justify-center' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Shield className="size-4 text-gray-500 dark:text-gray-400" />
                  {!sidebarCollapsed && <span>Trading benefits</span>}
                </div>
                {!sidebarCollapsed && (
                  benefitsOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />
                )}
              </button>

              {benefitsOpen && !sidebarCollapsed && (
                <div className="pl-7 pr-1 space-y-0.5 mt-0.5">
                  <button
                    onClick={() => setCurrentNav('benefits')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    VPS Hosting & Premier
                  </button>
                </div>
              )}
            </div>

            {/* Support Hub */}
            <button
              onClick={() => setCurrentNav('support_hub')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                currentNav === 'support_hub' ? 'bg-[#edf2f7] dark:bg-white/10 text-gray-900 dark:text-white font-bold' : ''
              } ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <HelpCircle className="size-4 text-gray-500 dark:text-gray-400" />
              {!sidebarCollapsed && <span>Support hub</span>}
            </button>

            {/* SECTION 5: PROFILE */}
            <div className="pt-1">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                  sidebarCollapsed ? 'justify-center' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserIcon className="size-4 text-gray-500 dark:text-gray-400" />
                  {!sidebarCollapsed && <span>Profile</span>}
                </div>
                {!sidebarCollapsed && (
                  profileOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />
                )}
              </button>

              {profileOpen && !sidebarCollapsed && (
                <div className="pl-7 pr-1 space-y-0.5 mt-0.5">
                  <button
                    onClick={() => setCurrentNav('profile')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                      currentNav === 'profile' ? 'bg-[#edf2f7] dark:bg-white/10 text-gray-900 dark:text-white font-bold' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Account verification
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Sidebar: Lavender Referral Banner + Collapse Button */}
          <div className="p-3 space-y-2 border-t border-gray-100 dark:border-white/5">
            {!sidebarCollapsed && (
              <div 
                onClick={() => setCurrentNav('referrals')}
                className="cursor-pointer p-3 rounded-2xl bg-[#f4f0fd] hover:bg-[#ebe4fb] dark:bg-purple-950/40 dark:hover:bg-purple-950/60 transition-all border border-[#e5dcf9] dark:border-purple-800/40"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#e3d7fa] dark:bg-purple-900/60 flex items-center justify-center text-purple-700 dark:text-purple-300">
                    <Users className="size-4" />
                  </div>
                  <div className="text-xs font-bold text-gray-900 dark:text-purple-200 leading-tight">
                    Refer traders, earn commission
                  </div>
                </div>
              </div>
            )}

            {/* Collapse toggle icon << */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full py-1.5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs transition-colors"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
            </button>
          </div>
        </aside>

        {/* RIGHT MAIN WORKSPACE */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-6xl">
          {/* ======================= TAB 1: ACCOUNTS (DEFAULT SCREEN) ======================= */}
          {currentNav === 'accounts' && (
            <div className="space-y-6">
              {/* RESIDENTIAL ADDRESS VERIFICATION BANNER (Matching Screenshot 3) */}
              {currentUser.addressVerificationNotice && (
                <div className="rounded-2xl border border-[#fde68a] bg-[#fffbeb] dark:bg-[#2b2410] dark:border-[#785412] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-start gap-4">
                    {/* Circle user avatar with yellow ring */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full border-2 border-[#f59e0b] p-0.5 flex items-center justify-center bg-white dark:bg-black">
                        <UserIcon className="size-6 text-[#d97706] dark:text-[#fbbf24]" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                        {currentUser.fullName}, you need to confirm your residential address
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                        Full address not detected. Please make sure the document contains your full name and address and has been issued within the last 6 months. Follow the instructions on the next screen to{' '}
                        <button
                          onClick={() => setShowAddressModal(true)}
                          className="text-[#0284c7] dark:text-[#38bdf8] font-semibold underline hover:opacity-80"
                        >
                          try again
                        </button>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => setShowLearnMoreModal(true)}
                      className="px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-all"
                    >
                      Learn more
                    </button>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="px-5 py-2 rounded-xl bg-[#ffde00] hover:bg-[#f2d200] text-black text-xs font-extrabold shadow-sm transition-all"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              )}

              {/* TOP PROMO BANNER (Exness all-in-one trading platform) */}
              <div className="rounded-2xl border border-amber-300/40 dark:border-amber-500/20 bg-gradient-to-r from-amber-100/70 via-amber-50/40 to-white dark:from-amber-950/30 dark:via-black/20 dark:to-transparent p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#ffde00] text-black flex items-center justify-center font-black shadow-sm shrink-0">
                    <TrendingUp className="size-5 text-black" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">
                      New all-in-one trading platform
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                      Funding, analysis, and trading in one place.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenTrade}
                    className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white dark:bg-[#ffde00] dark:hover:bg-[#f2d200] dark:text-black font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Open Terminal</span>
                    <ExternalLink className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* SECTION HEADER: My accounts */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  My accounts
                </h1>

                {/* + Open account button */}
                <button
                  onClick={() => setShowOpenAccountModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-bold text-gray-900 dark:text-white transition-all border border-gray-200 dark:border-white/10"
                >
                  <Plus className="size-4" />
                  <span>Open account</span>
                </button>
              </div>

              {/* TABS & CONTROLS TOOLBAR */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-3">
                {/* Real / Demo Tabs */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAccountTypeTab('real')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      accountTypeTab === 'real'
                        ? 'bg-gray-200 dark:bg-white/15 text-gray-900 dark:text-white'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Real
                  </button>
                  <button
                    onClick={() => setAccountTypeTab('demo')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      accountTypeTab === 'demo'
                        ? 'bg-gray-200 dark:bg-white/15 text-gray-900 dark:text-white'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Demo
                  </button>
                </div>

                {/* Sort dropdown & Grid/List toggle */}
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <div className="relative">
                    <button
                      onClick={() => setShowSortMenu(!showSortMenu)}
                      className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <span>{sortOption}</span>
                      <ChevronDown className="size-3.5" />
                    </button>
                    {showSortMenu && (
                      <div className={`absolute right-0 mt-1 w-44 rounded-xl shadow-xl border p-1 z-30 ${bgCard}`}>
                        {(['NEWEST', 'HIGHEST BALANCE', 'LOWEST BALANCE', 'NICKNAME'] as const).map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setSortOption(opt);
                              setShowSortMenu(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                              sortOption === opt
                                ? 'bg-[#ffde00]/20 text-[#d97706] dark:text-[#ffde00]'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                            }`}
                          >
                            <span>{opt}</span>
                            {sortOption === opt && <Check className="size-3.5" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="h-4 w-px bg-gray-200 dark:bg-white/10" />
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-0.5 rounded-md">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1 rounded ${viewMode === 'list' ? 'bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-xs' : ''}`}
                    >
                      <List className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-xs' : ''}`}
                    >
                      <Grid className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ACTIVE ACCOUNTS LIST (OR EXACT EMPTY STATE) */}
              <div>
                {activeAccounts.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400">
                      <Wallet className="size-6" />
                    </div>
                    <p className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                      {accountTypeTab === 'demo' ? 'No demo accounts yet' : 'No active accounts'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                      {accountTypeTab === 'demo'
                        ? 'Open a demo account to practice trading with virtual funds risk-free.'
                        : 'Create a new account or restore an archived account to get started.'}
                    </p>
                    <button
                      onClick={() => {
                        setNewAccIsDemo(accountTypeTab === 'demo');
                        setShowOpenAccountModal(true);
                      }}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-[#ffde00] hover:bg-[#f2d200] text-black text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                    >
                      {accountTypeTab === 'demo' ? '+ Open demo account' : '+ Open account'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeAccounts.map((acc) => (
                      <div 
                        key={acc.id}
                        className={`rounded-2xl border p-5 transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
                          isDark ? 'bg-[#181d19] border-white/10' : 'bg-white border-[#e6eaf0]'
                        }`}
                      >
                        {/* Account Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 uppercase">
                              {acc.platform || 'MT5'}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 capitalize">
                              {acc.accountType === 'pro' ? 'Pro' : acc.accountType}
                            </span>
                            <span className="font-mono font-bold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-1.5">
                              # {acc.accountNumber}
                              <button
                                onClick={() => copyToClipboard(acc.accountNumber, 'Account number')}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                                title="Copy account number"
                              >
                                <Copy className="size-3.5" />
                              </button>
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">
                              {acc.nickname || 'Standard'}
                            </span>
                          </div>

                          <div className="flex items-center gap-6 text-xs text-muted-foreground font-mono">
                            <span>Server: <strong className="text-gray-800 dark:text-gray-200">{acc.server}</strong></span>
                            <span>Leverage: <strong className="text-gray-800 dark:text-gray-200">1:{acc.leverage}</strong></span>
                          </div>
                        </div>

                        {/* Balance & Actions */}
                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                          <div className="text-right">
                            <div className="text-[11px] text-muted-foreground uppercase font-mono tracking-wider font-medium">Balance</div>
                            <div className="text-xl sm:text-2xl font-black font-mono text-gray-900 dark:text-white">
                              {hideBalance ? '••••••' : acc.balance.toFixed(2)} <span className="text-xs sm:text-sm font-bold text-muted-foreground">USD</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={() => { setDepositAccId(acc.id); setCurrentNav('deposit'); }}
                              className="px-4 py-2 rounded-xl bg-[#ffde00] hover:bg-[#ebd000] text-black text-xs font-bold shadow-xs transition-all cursor-pointer"
                            >
                              Deposit
                            </button>
                            <button
                              onClick={onOpenTrade}
                              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#272d28] dark:hover:bg-[#323933] text-gray-900 dark:text-white text-xs font-bold transition-all border border-transparent dark:border-white/5 cursor-pointer"
                            >
                              Trade
                            </button>
                            <button
                              onClick={() => handleArchiveAccount(acc)}
                              className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-gray-200 px-1 py-1 transition-colors cursor-pointer"
                              title="Archive account"
                            >
                              Archive
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ARCHIVED ACCOUNTS SECTION (Matching user's prompt & Screenshot 3) */}
              <div className="pt-6 border-t border-gray-200 dark:border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Archived accounts
                  </h2>
                  <button
                    onClick={() => setHideArchived(!hideArchived)}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <span>{hideArchived ? 'Show accounts' : 'Hide accounts'}</span>
                    {hideArchived ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
                  </button>
                </div>

                {!hideArchived && (
                  <div className="space-y-3">
                    {archivedAccounts.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No archived accounts.</p>
                    ) : (
                      archivedAccounts.map((acc) => (
                        <div
                          key={acc.id}
                          className={`rounded-2xl border p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${bgCard}`}
                        >
                          {/* Account metadata & Archive date */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300">
                                {acc.platform || 'MT5'}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 capitalize">
                                {acc.accountType}
                              </span>
                              <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">
                                # {acc.accountNumber}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {acc.nickname || (acc.accountType.charAt(0).toUpperCase() + acc.accountType.slice(1))}
                              </span>
                            </div>

                            <div className="text-xs flex items-center gap-3 text-muted-foreground">
                              <span className="font-medium text-gray-800 dark:text-gray-300">Balance unavailable</span>
                              <span>&bull;</span>
                              <span>
                                This account was archived automatically on{' '}
                                {acc.archivedAt || '9 Jul 2026 at 04:20 (UTC+5)'}
                              </span>
                            </div>
                          </div>

                          {/* Restore & Manage statements buttons */}
                          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                            <button
                              onClick={() => handleRestoreAccount(acc)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-bold text-gray-900 dark:text-white transition-all"
                            >
                              <RotateCcw className="size-3.5" />
                              <span>Restore</span>
                            </button>
                            <button
                              onClick={() => setShowStatementModal(acc)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-bold text-gray-900 dark:text-white transition-all"
                            >
                              <FileText className="size-3.5" />
                              <span>Manage statements</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================= TAB 2: PERFORMANCE (EXNESS SUMMARY) ======================= */}
          {currentNav === 'performance' && (
            <div className="space-y-6">
              {/* Header & Range Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Summary
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Updated on: 09/25/2026, 06:23 PM (UTC). For real-time statistics, check{' '}
                    <button
                      onClick={onOpenTrade}
                      className="text-[#0284c7] dark:text-[#38bdf8] font-bold underline hover:opacity-80 inline cursor-pointer"
                    >
                      Terminal
                    </button>
                    .
                  </p>
                </div>

                {/* Range Selector: 0 - 365 days */}
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300">
                  {[
                    { label: 'Today', days: 0 },
                    { label: '7d', days: 7 },
                    { label: '30d', days: 30 },
                    { label: '90d', days: 90 },
                    { label: '365d', days: 365 },
                  ].map(p => (
                    <button
                      key={p.label}
                      onClick={() => setSummaryDays(p.days)}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        summaryDays === p.days
                          ? 'bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-xs font-black'
                          : 'hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Range slider indicator: 0 to 365 */}
              <div className="flex items-center gap-3 px-1 text-xs text-muted-foreground font-mono">
                <span className="font-bold text-gray-900 dark:text-white">0</span>
                <input
                  type="range"
                  min="0"
                  max="365"
                  value={summaryDays}
                  onChange={(e) => setSummaryDays(Number(e.target.value))}
                  className="flex-1 accent-[#ffde00] h-1.5 bg-gray-200 dark:bg-white/10 rounded-lg cursor-pointer"
                />
                <span className="font-bold text-gray-900 dark:text-white">365</span>
              </div>

              {/* 6 Key Stat Cards matching Exness Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Net profit */}
                <div className={`p-5 rounded-2xl border ${bgCard} space-y-2`}>
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>Net profit</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                      Closed
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-rose-600 dark:text-rose-400">
                    -195.65 USD
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      Profit: +109.32 USD
                    </span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">
                      Loss: -304.97 USD
                    </span>
                  </div>
                </div>

                {/* 2. Trading cost */}
                <div className={`p-5 rounded-2xl border ${bgCard} space-y-2`}>
                  <div className="text-xs text-muted-foreground font-medium">
                    Trading cost
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-gray-900 dark:text-white">
                    0 USD
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-white/5 text-xs text-muted-foreground">
                    0% overnight commission / zero swap on majors
                  </div>
                </div>

                {/* 3. Unrealised P/L */}
                <div className={`p-5 rounded-2xl border ${bgCard} space-y-2`}>
                  <div className="text-xs text-muted-foreground font-medium">
                    Unrealised P/L
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-gray-900 dark:text-white">
                    0 USD
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-white/5 text-xs text-muted-foreground">
                    No open floating positions currently
                  </div>
                </div>

                {/* 4. Closed orders */}
                <div className={`p-5 rounded-2xl border ${bgCard} space-y-2`}>
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>Closed orders</span>
                    <span className="font-bold text-gray-900 dark:text-white">543</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-gray-900 dark:text-white">
                    543
                  </div>
                  {/* Progress bar: 162 profitable vs 381 unprofitable */}
                  <div className="space-y-1.5 pt-1">
                    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden flex">
                      <div style={{ width: '29.8%' }} className="h-full bg-emerald-500" title="Profitable: 162 (29.8%)" />
                      <div style={{ width: '70.2%' }} className="h-full bg-rose-500" title="Unprofitable: 381 (70.2%)" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        Profitable: 162
                      </span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold">
                        Unprofitable: 381
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Trading volume */}
                <div className={`p-5 rounded-2xl border ${bgCard} space-y-2`}>
                  <div className="text-xs text-muted-foreground font-medium">
                    Trading volume
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-gray-900 dark:text-white">
                    2,308,808.08 USD
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-white/5 text-xs font-mono text-muted-foreground flex items-center justify-between">
                    <span>Lifetime:</span>
                    <span className="font-bold text-gray-900 dark:text-white">2,308,808.08 USD</span>
                  </div>
                </div>

                {/* 6. Equity */}
                <div className={`p-5 rounded-2xl border ${bgCard} space-y-2`}>
                  <div className="text-xs text-muted-foreground font-medium">
                    Equity
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-gray-900 dark:text-white">
                    0.00 USD
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-white/5 text-xs font-mono text-muted-foreground flex items-center justify-between">
                    <span>Current:</span>
                    <span className="font-bold text-gray-900 dark:text-white">0 USD</span>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className={`p-6 rounded-2xl border ${bgCard} space-y-6`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Charts</h2>
                    <p className="text-xs text-muted-foreground">Monthly breakdown of Net Profit & Loss (USD)</p>
                  </div>
                  {/* Legend */}
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-500" />
                      <span>Profit</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-rose-500" />
                      <span>Loss</span>
                    </div>
                  </div>
                </div>

                {/* Monthly Chart visualization */}
                <div className="relative pt-6 pb-2">
                  {/* Grid Lines with Y-Axis Labels: 0, -50, -100, -150, -200 */}
                  <div className="h-60 relative flex flex-col justify-between border-l border-gray-200 dark:border-white/10 pl-2">
                    {[0, -50, -100, -150, -200].map((level) => (
                      <div key={level} className="w-full flex items-center gap-2 -my-2.5">
                        <span className="w-10 text-[11px] font-mono text-right text-gray-400 shrink-0">
                          {level}
                        </span>
                        <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
                      </div>
                    ))}

                    {/* Columns for 13 months: Sep Oct Nov Dec Jan Feb Mar Apr May Jun Jul Aug Sep */}
                    <div className="absolute inset-0 left-12 flex items-start justify-between gap-1 sm:gap-2">
                      {[
                        { month: 'Sep', profit: 12.4, loss: -24.5, net: -12.1 },
                        { month: 'Oct', profit: 8.5, loss: -35.2, net: -26.7 },
                        { month: 'Nov', profit: 15.3, loss: -18.4, net: -3.1 },
                        { month: 'Dec', profit: 4.2, loss: -42.8, net: -38.6 },
                        { month: 'Jan', profit: 18.9, loss: -14.2, net: 4.7 },
                        { month: 'Feb', profit: 6.1, loss: -28.9, net: -22.8 },
                        { month: 'Mar', profit: 14.5, loss: -31.2, net: -16.7 },
                        { month: 'Apr', profit: 9.2, loss: -19.4, net: -10.2 },
                        { month: 'May', profit: 11.8, loss: -25.6, net: -13.8 },
                        { month: 'Jun', profit: 7.4, loss: -16.3, net: -8.9 },
                        { month: 'Jul', profit: 5.12, loss: -22.47, net: -17.35 },
                        { month: 'Aug', profit: 11.3, loss: -26.0, net: -14.7 },
                        { month: 'Sep', profit: 10.6, loss: -24.0, net: -13.4 },
                      ].map((item, idx) => {
                        const lossH = Math.min(100, (Math.abs(item.loss) / 200) * 100);
                        const profitH = Math.min(100, (item.profit / 200) * 100);
                        return (
                          <div key={idx} className="flex-1 h-full flex flex-col justify-start items-center pt-2 group relative">
                            {/* Hover Tooltip */}
                            <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-gray-900 text-white text-[10px] p-2 rounded-lg shadow-xl pointer-events-none whitespace-nowrap">
                              <span className="font-bold">{item.month}: Net {item.net > 0 ? `+$${item.net}` : `-$${Math.abs(item.net)}`}</span>
                              <span className="text-emerald-400">+{item.profit} / <span className="text-rose-400">{item.loss}</span></span>
                            </div>

                            {/* Bar segment downwards from 0 */}
                            <div className="w-full max-w-[24px] flex flex-col items-center gap-0.5">
                              {/* Profit bar */}
                              <div
                                style={{ height: `${profitH * 0.8}px` }}
                                className="w-full bg-emerald-500 rounded-xs group-hover:opacity-90 transition-all"
                              />
                              {/* Loss bar */}
                              <div
                                style={{ height: `${lossH * 1.5}px` }}
                                className="w-full bg-rose-500 rounded-b group-hover:opacity-90 transition-all"
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono mt-2 select-none">
                              {item.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Disclaimer banner */}
                <div className="pt-4 border-t border-gray-100 dark:border-white/5 text-xs text-muted-foreground leading-relaxed flex items-center justify-between flex-wrap gap-2">
                  <p>
                    Please keep in mind that only closed position count. Updated on: 09/25/2026, 06:23 PM (UTC). For real-time statistics, check{' '}
                    <button
                      onClick={onOpenTrade}
                      className="text-[#0284c7] dark:text-[#38bdf8] font-bold underline hover:opacity-80 inline cursor-pointer"
                    >
                      Terminal
                    </button>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ======================= TAB 3: HISTORY OF ORDERS ======================= */}
          {currentNav === 'history' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    History of orders
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Updated on: 09/25/2026, 06:23 PM (UTC). For real-time statistics, check{' '}
                    <button
                      onClick={onOpenTrade}
                      className="text-[#0284c7] dark:text-[#38bdf8] font-bold underline hover:opacity-80 inline cursor-pointer"
                    >
                      Terminal
                    </button>
                    .
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toast.success("Exported order history CSV (543 orders)")}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <Download className="size-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={onOpenTrade}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ffde00] hover:bg-[#f2d200] text-black text-xs font-extrabold shadow-xs cursor-pointer transition-all"
                  >
                    <span>Terminal</span>
                    <ExternalLink className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Order Type Tabs & Search Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHistoryOrderType('closed')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      historyOrderType === 'closed'
                        ? 'bg-gray-200 dark:bg-white/15 text-gray-900 dark:text-white'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Closed orders (543)
                  </button>
                  <button
                    onClick={() => setHistoryOrderType('open')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      historyOrderType === 'open'
                        ? 'bg-gray-200 dark:bg-white/15 text-gray-900 dark:text-white'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Open orders (0)
                  </button>
                  <button
                    onClick={() => setHistoryOrderType('pending')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      historyOrderType === 'pending'
                        ? 'bg-gray-200 dark:bg-white/15 text-gray-900 dark:text-white'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Pending orders (0)
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-60">
                    <Search className="size-3.5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search symbol, ID..."
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* ORDERS CONTENT OR EMPTY STATE */}
              {historyOrderType !== 'closed' ? (
                /* Empty state matching user request for no active orders */
                <div className={`p-12 rounded-2xl border text-center space-y-3 ${bgCard}`}>
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 mx-auto">
                    <History className="size-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    No active accounts
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    There are currently no active orders in your selected account. Switch to Closed orders or open a trade in Terminal.
                  </p>
                  <button
                    onClick={onOpenTrade}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-[#ffde00] hover:bg-[#f2d200] text-black font-extrabold text-xs shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Trade in Terminal</span>
                    <ExternalLink className="size-3.5" />
                  </button>
                </div>
              ) : (
                /* Closed Orders Table (matching the 543 orders) */
                <div className={`rounded-2xl border overflow-hidden ${bgCard}`}>
                  <div className="p-3 border-b border-gray-100 dark:border-white/10 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Showing recent closed orders from total of <strong>543</strong> positions</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">162 profitable / 381 loss</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-50 dark:bg-white/5 text-muted-foreground font-mono border-b border-gray-100 dark:border-white/10">
                        <tr>
                          <th className="p-3">Order ID</th>
                          <th className="p-3">Symbol</th>
                          <th className="p-3">Side</th>
                          <th className="p-3">Volume</th>
                          <th className="p-3">Open Price</th>
                          <th className="p-3">Close Price</th>
                          <th className="p-3">Close Time</th>
                          <th className="p-3 text-right">Profit (USD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-mono">
                        {[
                          { id: '#8941201', symbol: 'XAU/USD', side: 'BUY', lot: 0.50, open: 2650.40, close: 2675.80, time: '2026-09-24 14:20', pnl: 109.32 },
                          { id: '#8941198', symbol: 'EUR/USD', side: 'SELL', lot: 1.00, open: 1.0880, close: 1.0925, time: '2026-09-24 11:05', pnl: -145.00 },
                          { id: '#8940985', symbol: 'BTC/USD', side: 'BUY', lot: 0.10, open: 84200.0, close: 83520.0, time: '2026-09-23 18:45', pnl: -68.00 },
                          { id: '#8939841', symbol: 'GBP/USD', side: 'BUY', lot: 0.80, open: 1.2690, close: 1.2642, time: '2026-09-22 09:30', pnl: -91.97 },
                          { id: '#8938742', symbol: 'USD/JPY', side: 'SELL', lot: 0.40, open: 154.20, close: 154.60, time: '2026-09-21 16:15', pnl: -40.00 },
                          { id: '#8937612', symbol: 'NAS100', side: 'BUY', lot: 0.20, open: 20150.0, close: 20185.0, time: '2026-09-20 20:00', pnl: 35.00 },
                          { id: '#8936410', symbol: 'US30', side: 'SELL', lot: 0.10, open: 42100.0, close: 42080.0, time: '2026-09-19 15:30', pnl: 20.00 },
                          { id: '#8935299', symbol: 'ETH/USD', side: 'BUY', lot: 0.50, open: 3420.0, close: 3410.0, time: '2026-09-18 12:10', pnl: -15.00 },
                        ]
                        .filter(o => !historySearchQuery || o.symbol.toLowerCase().includes(historySearchQuery.toLowerCase()) || o.id.includes(historySearchQuery))
                        .map((o) => (
                          <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                            <td className="p-3 font-semibold text-gray-900 dark:text-white">{o.id}</td>
                            <td className="p-3 font-bold text-gray-900 dark:text-white">{o.symbol}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                o.side === 'BUY' 
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}>
                                {o.side}
                              </span>
                            </td>
                            <td className="p-3">{o.lot.toFixed(2)}</td>
                            <td className="p-3">{o.open.toFixed(2)}</td>
                            <td className="p-3">{o.close.toFixed(2)}</td>
                            <td className="p-3 text-muted-foreground">{o.time}</td>
                            <td className={`p-3 text-right font-bold ${
                              o.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}>
                              {o.pnl >= 0 ? `+${o.pnl.toFixed(2)} USD` : `${o.pnl.toFixed(2)} USD`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination footer */}
                  <div className="p-3 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Page 1 of 68 (543 orders)</span>
                    <div className="flex items-center gap-1">
                      <button className="px-2.5 py-1 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 disabled:opacity-40" disabled>
                        &larr; Prev
                      </button>
                      <button className="px-2.5 py-1 rounded bg-[#ffde00] text-black font-bold">1</button>
                      <button className="px-2.5 py-1 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">2</button>
                      <button className="px-2.5 py-1 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">3</button>
                      <span>...</span>
                      <button className="px-2.5 py-1 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">68</button>
                      <button className="px-2.5 py-1 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
                        Next &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 text-xs text-muted-foreground">
                <p>
                  Please keep in mind that only closed position count. Updated on: 09/25/2026, 06:23 PM (UTC). For real-time statistics, check{' '}
                  <button
                    onClick={onOpenTrade}
                    className="text-[#0284c7] dark:text-[#38bdf8] font-bold underline hover:opacity-80 inline cursor-pointer"
                  >
                    Terminal
                  </button>
                  .
                </p>
              </div>
            </div>
          )}

          {/* ======================= TAB 4: DEPOSIT ======================= */}
          {currentNav === 'deposit' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deposit Funds</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Method selector */}
                <div className="md:col-span-2 space-y-4">
                  <div className={`p-5 rounded-2xl border ${bgCard} space-y-4`}>
                    <label className="text-xs font-bold uppercase text-muted-foreground font-mono">1. Select Account</label>
                    <select
                      value={depositAccId}
                      onChange={(e) => setDepositAccId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-sm font-semibold"
                    >
                      {activeAccounts.length === 0 ? (
                        <option value="">No active accounts - restore an account first</option>
                      ) : (
                        activeAccounts.map(a => (
                          <option key={a.id} value={a.id} className="bg-white dark:bg-[#181c19]">
                            {a.platform} {a.accountType.toUpperCase()} #{a.accountNumber} — Balance: ${a.balance.toFixed(2)}
                          </option>
                        ))
                      )}
                    </select>

                    <label className="text-xs font-bold uppercase text-muted-foreground font-mono pt-2 block">2. Payment Method</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'payme', name: 'Payme', badge: '0% fee' },
                        { id: 'click', name: 'Click', badge: 'Instant' },
                        { id: 'uzcard_humo', name: 'Uzcard/Humo', badge: '12,850 UZS' },
                        { id: 'crypto_usdt', name: 'USDT TRC20', badge: 'Fast Crypto' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setDepositMethod(m.id as any)}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                            depositMethod === m.id
                              ? 'border-[#ffde00] bg-[#fffbeb] dark:bg-amber-950/20 text-gray-900 dark:text-white shadow-xs'
                              : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                          }`}
                        >
                          <span className="font-bold text-xs">{m.name}</span>
                          <span className="text-[10px] text-muted-foreground mt-1">{m.badge}</span>
                        </button>
                      ))}
                    </div>

                    <label className="text-xs font-bold uppercase text-muted-foreground font-mono pt-2 block">3. Amount (USD)</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">$</span>
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(Number(e.target.value))}
                          className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-sm font-bold font-mono"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        ≈ {(depositAmount * 12850).toLocaleString()} UZS
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (!depositAccId) {
                          toast.error("Please select or restore an active account first");
                          return;
                        }
                        brokerStore.createDeposit({
                          accountId: depositAccId,
                          amount: depositAmount,
                          paymentMethod: depositMethod,
                          details: { cardMask: cardOrWallet },
                        });
                        toast.success(`Deposit of $${depositAmount} successful!`);
                        setCurrentNav('accounts');
                      }}
                      className="w-full py-3 rounded-xl bg-[#ffde00] hover:bg-[#f2d200] text-black font-extrabold text-sm shadow-md transition-all"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>

                {/* Summary Info */}
                <div className={`p-5 rounded-2xl border ${bgCard} space-y-3 h-fit text-xs`}>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">Deposit Terms</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>&bull; Commission: <strong>0%</strong> (Exora covers payment fees)</p>
                    <p>&bull; Processing time: <strong>Instant (under 2 minutes)</strong></p>
                    <p>&bull; Central Bank UZS conversion rate applied transparently.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================= TAB 5: WITHDRAW ======================= */}
          {currentNav === 'withdraw' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Withdraw Funds</h1>
              <div className={`max-w-xl p-6 rounded-2xl border ${bgCard} space-y-4`}>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">From Trading Account</label>
                  <select
                    value={withdrawAccId}
                    onChange={(e) => setWithdrawAccId(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-sm font-semibold"
                  >
                    {activeAccounts.map(a => (
                      <option key={a.id} value={a.id} className="bg-white dark:bg-[#181c19]">
                        #{a.accountNumber} — Available: ${a.freeMargin.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground">Withdrawal Amount ($)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-sm font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground">Destination Card / Address</label>
                  <input
                    type="text"
                    value={withdrawDestination}
                    onChange={(e) => setWithdrawDestination(e.target.value)}
                    placeholder="8600 0000 0000 0000 or USDT address"
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-sm"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!withdrawAccId) {
                      toast.error("Please select an active trading account");
                      return;
                    }
                    try {
                      brokerStore.createWithdrawal({
                        accountId: withdrawAccId,
                        amount: withdrawAmount,
                        paymentMethod: withdrawMethod,
                        details: { destination: withdrawDestination },
                      });
                      toast.success(`Withdrawal request for $${withdrawAmount} submitted for automated processing!`);
                      setCurrentNav('accounts');
                    } catch (err: any) {
                      toast.error(err?.message || "Withdrawal error");
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-extrabold text-sm transition-all"
                >
                  Submit Withdrawal
                </button>
              </div>
            </div>
          )}

          {/* ======================= TAB 6: INTERNAL TRANSFER ======================= */}
          {currentNav === 'transfer' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Internal Transfer</h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#e0f2fe] text-[#0284c7] dark:bg-sky-950 dark:text-sky-300">New</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Move funds instantly between your trading accounts and funding wallets with zero fees.
              </p>

              <div className={`max-w-xl p-6 rounded-2xl border ${bgCard} space-y-4`}>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">From Account</label>
                  <select
                    value={transferFromId}
                    onChange={(e) => setTransferFromId(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-sm font-semibold"
                  >
                    <option value="">Select source account</option>
                    {activeAccounts.map(a => (
                      <option key={a.id} value={a.id} className="bg-white dark:bg-[#181c19]">
                        #{a.accountNumber} — Available: ${a.freeMargin.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground">To Account</label>
                  <select
                    value={transferToId}
                    onChange={(e) => setTransferToId(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-sm font-semibold"
                  >
                    <option value="">Select destination account</option>
                    {activeAccounts.map(a => (
                      <option key={a.id} value={a.id} className="bg-white dark:bg-[#181c19]">
                        #{a.accountNumber} ({a.platform} {a.accountType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground">Transfer Amount ($)</label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-sm font-bold font-mono"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!transferFromId || !transferToId) {
                      toast.error("Select both source and destination accounts");
                      return;
                    }
                    if (transferFromId === transferToId) {
                      toast.error("Source and destination cannot be identical");
                      return;
                    }
                    try {
                      brokerStore.transferFunds({
                        fromAccountId: transferFromId,
                        toAccountId: transferToId,
                        amount: transferAmount,
                      });
                      toast.success(`Successfully transferred $${transferAmount}!`);
                      setCurrentNav('accounts');
                    } catch (err: any) {
                      toast.error(err?.message || "Transfer error");
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-[#ffde00] hover:bg-[#f2d200] text-black font-extrabold text-sm transition-all"
                >
                  Transfer Instantly
                </button>
              </div>
            </div>
          )}

          {/* ======================= TAB 7: REFERRALS ======================= */}
          {currentNav === 'referrals' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Partner Partnership & Rebates</h1>
              <div className={`p-6 rounded-2xl border ${bgCard} space-y-4`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Your Personal Partner Link</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Active Tier 1 (40% spread share)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={`https://exora.com/register?ib=${currentUser.referralCode}`}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-mono text-xs"
                  />
                  <button
                    onClick={() => copyToClipboard(`https://exora.com/register?ib=${currentUser.referralCode}`, "Referral Link")}
                    className="px-4 py-2.5 rounded-xl bg-[#ffde00] hover:bg-[#f2d200] text-black font-bold text-xs"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================= TAB 8: SUPPORT HUB ======================= */}
          {currentNav === 'support_hub' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Hub & Help Center</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-5 rounded-2xl border ${bgCard} space-y-2`}>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-[#d97706]">
                    <ShieldCheck className="size-5" />
                  </div>
                  <h3 className="font-bold text-sm">Account Verification FAQ</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Accepted documents include bank statements, utility bills (electricity, water, gas), tax returns, and local registration certificates issued within 6 months.
                  </p>
                </div>
                <div className={`p-5 rounded-2xl border ${bgCard} space-y-2`}>
                  <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-[#0284c7]">
                    <RotateCcw className="size-5" />
                  </div>
                  <h3 className="font-bold text-sm">Restoring Archived Accounts</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Inactive MT5 accounts are archived after 90 days of inactivity. You can restore them anytime with zero data loss or penalty.
                  </p>
                </div>
                <div className={`p-5 rounded-2xl border ${bgCard} space-y-2`}>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                    <MessageSquare className="size-5" />
                  </div>
                  <h3 className="font-bold text-sm">24/7 Live Agent Chat</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Our multilingual support desk is always online to resolve payment issues, verification requests, or technical MT5 questions.
                  </p>
                  <button
                    onClick={() => setShowSupportModal(true)}
                    className="text-xs font-bold text-primary hover:underline block pt-1"
                  >
                    Open Live Chat &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* EXNESS OFFICIAL LEGAL FOOTER                                              */}
          {/* ========================================================================= */}
          <footer className="mt-14 pt-8 border-t border-gray-200 dark:border-white/10 space-y-6 text-xs text-gray-500 dark:text-gray-400">
            {/* 1. Registration & Licensing Text */}
            <p className="leading-relaxed">
              <strong>Exness (SC) LTD</strong> is a Securities Dealer registered in Seychelles with registration number <strong>8423606-1</strong> and authorised by the Financial Services Authority (FSA) with licence number <strong>SD025</strong>. The registered office of Exness (SC) LTD is at 9A CT House, 2nd floor, Providence, Mahe, Seychelles.
            </p>

            {/* 2. Risk Warning & Copyright Notice */}
            <p className="leading-relaxed">
              The information on this website may only be copied with the express written permission of Exness. <strong>General Risk Warning:</strong> CFDs are leveraged products. Trading in CFDs carries a high level of risk thus may not be appropriate for all investors. The investment value can both increase and decrease and the investors may lose all their invested capital. Under no circumstances shall the Company have any liability to any person or entity for any loss or damage in whole or part caused by, resulting from, or relating to any transactions related to CFDs.{' '}
              <button 
                onClick={() => setLegalModalType('risk')} 
                className="text-[#0284c7] dark:text-[#38bdf8] font-semibold underline hover:opacity-80 inline cursor-pointer"
              >
                Learn more
              </button>
            </p>

            {/* 3. PCI DSS Security Compliance */}
            <div className="flex items-start sm:items-center gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10">
              <div className="px-2.5 py-1 rounded-md bg-[#ffde00] text-black font-black text-[11px] shrink-0">
                PCI DSS
              </div>
              <p className="text-[11px] leading-relaxed">
                Exness complies with the <strong>Payment Card Industry Data Security Standard (PCI DSS)</strong> to ensure your security and privacy. We conduct regular vulnerability scans and penetration tests in accordance with the PCI DSS requirements for our business model.
              </p>
            </div>

            {/* 4. 12 Legal Documents Grid / Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2.5 pt-2 text-[11px] font-medium border-t border-gray-100 dark:border-white/10">
              <button onClick={() => setLegalModalType('agreement')} className="text-left hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                Client Agreement
              </button>
              <button onClick={() => setLegalModalType('general_terms')} className="text-left hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                General Business Terms
              </button>
              <button onClick={() => setLegalModalType('partnership')} className="text-left hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                Partnership Agreement
              </button>
              <button onClick={() => setLegalModalType('bonus')} className="text-left hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                Bonus terms and Conditions
              </button>
              <button onClick={() => setLegalModalType('confidentiality')} className="text-left hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                Confidentiality Policy
              </button>
              <button onClick={() => setLegalModalType('key_facts')} className="text-left hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                Key Facts Statement
              </button>
              <button onClick={() => setLegalModalType('conflicts')} className="text-left hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                Conflicts of Interest
              </button>
              <button onClick={() => setLegalModalType('privacy')} className="text-left hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                Privacy Agreement
              </button>
              <button onClick={() => setLegalModalType('risk')} className="text-left hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                Risk Disclosure
              </button>
              <button onClick={() => setLegalModalType('aml')} className="text-left hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                Preventing Money Laundering
              </button>
              <button onClick={() => setLegalModalType('complaints')} className="text-left hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                Complaints Handling Policy
              </button>
              <button onClick={() => setLegalModalType('contact')} className="text-left hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer font-bold text-primary">
                Contact
              </button>
            </div>

            {/* 5. Copyright, Version, 0, Aug */}
            <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 text-[11px] text-gray-400">
              <div className="flex items-center gap-2">
                <span>&copy; 2008 - 2026. Exness</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 font-bold">
                  3.4.3
                </span>
                <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  0
                </span>
                <span className="text-gray-400 font-sans">
                  Aug
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* 3. FLOATING PWA HOME SCREEN BANNER */}
      {showPwaBanner && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-[#1e221f] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 text-xs font-semibold">
          <div className="w-5 h-5 rounded-full bg-[#ffde00] text-black font-black flex items-center justify-center text-[10px]">
            EX
          </div>
          <span>Add Exora App to Home screen</span>
          <button 
            onClick={() => setShowPwaBanner(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white ml-2"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* 4. FLOATING 24/7 LIVE CHAT BUTTON */}
      <button
        onClick={() => setShowSupportModal(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#ffde00] hover:bg-[#f2d200] text-black shadow-2xl flex items-center justify-center hover:scale-105 transition-all"
        title="Exora Live Chat"
      >
        <MessageSquare className="size-6 fill-black" />
      </button>



      {/* ========================================================================= */}
      {/* MODAL 1: RESIDENTIAL ADDRESS CONFIRMATION (When clicking "Complete" / "try again") */}
      {/* ========================================================================= */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 relative ${bgCard}`}>
            <button
              onClick={() => setShowAddressModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ffde00]/20 flex items-center justify-center text-[#ca8a04]">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                    Confirm Residential Address
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Name on account: <strong>{currentUser.fullName}</strong>
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200">
                <p className="font-semibold">Verification requirement:</p>
                <p className="mt-1 text-[11px] leading-relaxed">
                  Your uploaded document must clearly display your full name (<strong>{currentUser.fullName}</strong>) and residential address, and must have been issued within the last 6 months.
                </p>
              </div>

              <form onSubmit={handleSubmitAddressVerification} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Country</label>
                    <input
                      type="text"
                      value={addressCountry}
                      onChange={(e) => setAddressCountry(e.target.value)}
                      required
                      className="w-full mt-1 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">City</label>
                    <input
                      type="text"
                      value={addressCity}
                      onChange={(e) => setAddressCity(e.target.value)}
                      required
                      className="w-full mt-1 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Street Address & Apartment</label>
                  <input
                    type="text"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    required
                    placeholder="e.g. 14 Bunyodkor Street, Apt 5"
                    className="w-full mt-1 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Postal / Zip Code</label>
                    <input
                      type="text"
                      value={addressZip}
                      onChange={(e) => setAddressZip(e.target.value)}
                      required
                      className="w-full mt-1 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Document Type</label>
                    <select
                      value={addressDocType}
                      onChange={(e) => setAddressDocType(e.target.value)}
                      className="w-full mt-1 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-xs font-medium"
                    >
                      <option value="bank_statement" className="bg-white dark:bg-[#181c19]">Bank Statement</option>
                      <option value="utility_bill" className="bg-white dark:bg-[#181c19]">Utility Bill (Gas/Water/Electricity)</option>
                      <option value="tax_invoice" className="bg-white dark:bg-[#181c19]">Tax Return / Invoice</option>
                      <option value="residence_cert" className="bg-white dark:bg-[#181c19]">Government Residence Certificate</option>
                    </select>
                  </div>
                </div>

                {/* Upload Zone */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Upload Document File (PDF, PNG, JPG)</label>
                  <div className="mt-1.5 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 text-center flex flex-col items-center justify-center gap-1.5 bg-gray-50/50 dark:bg-white/5">
                    <FileText className="size-6 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{uploadedDocName}</span>
                    <span className="text-[11px] text-muted-foreground">Click or drop new file to replace (Max 15MB)</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAddress}
                    className="px-6 py-2.5 rounded-xl bg-[#ffde00] hover:bg-[#f2d200] text-black text-xs font-extrabold shadow-sm transition-all"
                  >
                    {isSubmittingAddress ? "Submitting..." : "Submit Address Document"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LEARN MORE (Explaining Accepted Residence Documents) */}
      {/* ========================================================================= */}
      {showLearnMoreModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 relative ${bgCard} space-y-4`}>
            <button
              onClick={() => setShowLearnMoreModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="size-5" />
            </button>
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
              Residential Address Requirements
            </h3>
            <div className="text-xs space-y-2.5 text-muted-foreground leading-relaxed">
              <p>Under international anti-money laundering (AML) and Seychelles FSA regulatory directives, Exora verifies the residential address of all account holders.</p>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 space-y-1.5">
                <strong className="text-gray-900 dark:text-white block">Accepted documents:</strong>
                <p>&bull; Bank account or credit card statement</p>
                <p>&bull; Utility bill (electricity, water, landline telephone, gas)</p>
                <p>&bull; Municipal tax bill or government registry certificate</p>
              </div>
              <p>Documents must have been issued within the last 6 calendar months and display the full name <strong>AVAZJON</strong> with complete street address.</p>
            </div>
            <button
              onClick={() => { setShowLearnMoreModal(false); setShowAddressModal(true); }}
              className="w-full py-2.5 rounded-xl bg-[#ffde00] text-black font-extrabold text-xs"
            >
              Confirm Address Now
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: OPEN NEW TRADING ACCOUNT */}
      {/* ========================================================================= */}
      {showOpenAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 relative ${bgCard} space-y-4`}>
            <button
              onClick={() => setShowOpenAccountModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="size-5" />
            </button>

            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
              Open New Trading Account
            </h3>

            {/* Real / Demo Toggle */}
            <div className="flex gap-2 p-1 rounded-xl bg-gray-100 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setNewAccIsDemo(false)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  !newAccIsDemo ? 'bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500'
                }`}
              >
                Real Account
              </button>
              <button
                type="button"
                onClick={() => setNewAccIsDemo(true)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  newAccIsDemo ? 'bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500'
                }`}
              >
                Demo ($10,000 Virtual)
              </button>
            </div>

            {/* Account Type Selection */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'standard', name: 'Standard', desc: 'Spreads from 0.2, 0 commission' },
                { id: 'pro', name: 'Pro', desc: 'Spreads from 0.1, instant execution' },
                { id: 'ecn', name: 'Raw Spread', desc: '0.0 spread, low fixed commission' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setNewAccType(t.id as any)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    newAccType === t.id
                      ? 'border-[#ffde00] bg-[#fffbeb] dark:bg-amber-950/20 text-gray-900 dark:text-white'
                      : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="font-bold text-xs">{t.name}</span>
                  <span className="text-[10px] text-muted-foreground mt-1">{t.desc}</span>
                </button>
              ))}
            </div>

            {/* Platform Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Trading Platform</label>
                <select
                  value={newAccPlatform}
                  onChange={(e) => setNewAccPlatform(e.target.value as any)}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-xs font-semibold"
                >
                  <option value="MT5" className="bg-white dark:bg-[#181c19]">MetaTrader 5 (MT5)</option>
                  <option value="MT4" className="bg-white dark:bg-[#181c19]">MetaTrader 4 (MT4)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Maximum Leverage</label>
                <select
                  value={newAccLeverage}
                  onChange={(e) => setNewAccLeverage(Number(e.target.value))}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-xs font-semibold"
                >
                  <option value={2000} className="bg-white dark:bg-[#181c19]">1:2000 (Recommended)</option>
                  <option value={500} className="bg-white dark:bg-[#181c19]">1:500</option>
                  <option value={200} className="bg-white dark:bg-[#181c19]">1:200</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Account Nickname (Optional)</label>
              <input
                type="text"
                value={newAccNickname}
                onChange={(e) => setNewAccNickname(e.target.value)}
                placeholder="e.g. My Swing Trading"
                className="w-full mt-1 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-xs font-medium"
              />
            </div>

            <button
              onClick={handleCreateAccount}
              className="w-full py-3 rounded-xl bg-[#ffde00] hover:bg-[#f2d200] text-black font-extrabold text-sm shadow-md transition-all"
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: MANAGE STATEMENTS */}
      {/* ========================================================================= */}
      {showStatementModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 relative ${bgCard} space-y-4`}>
            <button
              onClick={() => setShowStatementModal(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                Account Statement
              </h3>
              <p className="text-xs text-muted-foreground">
                Account #{showStatementModal.accountNumber} &bull; {showStatementModal.platform || 'MT5'} {showStatementModal.accountType}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Realized P&L:</span>
                <span className="font-bold text-emerald-600">+$1,420.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Deposits:</span>
                <span className="font-bold">$2,500.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Withdrawals:</span>
                <span className="font-bold">$1,080.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Closed Traded Volume:</span>
                <span className="font-bold">14.80 Lots</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  toast.success(`Statement for #${showStatementModal.accountNumber} downloaded as PDF!`);
                  setShowStatementModal(null);
                }}
                className="py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Download className="size-3.5" />
                <span>PDF Statement</span>
              </button>
              <button
                onClick={() => {
                  toast.success(`Statement for #${showStatementModal.accountNumber} downloaded as Excel (XLSX)!`);
                  setShowStatementModal(null);
                }}
                className="py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Download className="size-3.5" />
                <span>Excel (CSV)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: 24/7 LIVE SUPPORT & FAQ HUB */}
      {/* ========================================================================= */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4">
          <div className={`w-full sm:max-w-lg h-[580px] rounded-t-3xl sm:rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${bgCard}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-[#ffde00] text-black">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-black text-[#ffde00] font-black flex items-center justify-center text-xs">
                  EX
                </div>
                <div>
                  <h4 className="font-extrabold text-xs">Exora Yordam Markazi (24/7 Support)</h4>
                  <span className="text-[10px] text-black/70 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Online &bull; O'zbek, Rus va Ingliz tillarida
                  </span>
                </div>
              </div>
              <button onClick={() => setShowSupportModal(false)} className="text-black hover:opacity-70 p-1">
                <X className="size-5" />
              </button>
            </div>

            {/* Support Tab Switcher (Live Chat vs FAQ) */}
            <div className="flex border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-xs font-bold p-1">
              <button
                onClick={() => setSupportTab('chat')}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  supportTab === 'chat' ? 'bg-[#ffde00] text-black shadow-xs font-extrabold' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="size-3.5" />
                <span>Jonli Chat (24/7 Live)</span>
              </button>
              <button
                onClick={() => setSupportTab('faq')}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  supportTab === 'faq' ? 'bg-[#ffde00] text-black shadow-xs font-extrabold' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <HelpCircle className="size-3.5" />
                <span>FAQ & Qo'llanmalar</span>
              </button>
            </div>

            {/* Content: Tab 1 (Chat) or Tab 2 (FAQ) */}
            {supportTab === 'chat' ? (
              <>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#ffde00] text-black rounded-tr-xs font-medium'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-tl-xs'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono mt-0.5 px-1">{msg.time}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-gray-100 dark:border-white/10 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                    placeholder="Savolingizni yozing..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-xs"
                  />
                  <button
                    onClick={handleSendChatMessage}
                    className="p-2.5 rounded-xl bg-[#ffde00] hover:bg-[#f2d200] text-black font-bold cursor-pointer"
                  >
                    <Send className="size-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 space-y-1">
                  <div className="font-bold text-gray-900 dark:text-white">1. Uzcard, Humo, Payme yoki Click orqali qanday to'ldiriladi?</div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Kabinetning "Deposit" bo'limiga o'ting, Uzcard/Humo yoki Payme usulini tanlang. Mablag'lar Markaziy Bankning joriy kursi (12,850 UZS/USD) bo'yicha 0% komissiya bilan 3 soniya ichida hisobingizga tushadi.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 space-y-1">
                  <div className="font-bold text-gray-900 dark:text-white">2. Shaxsni tasdiqlash (KYC) qanday amalga oshiriladi?</div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Pasport, ID karta yoki Haydovchilik guvohnomasi fotosuratini yuklang. O'zbekiston fuqarolari uchun OneID orqali avtomatik 5 daqiqada tasdiqlanadi.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 space-y-1">
                  <div className="font-bold text-gray-900 dark:text-white">3. Leveraj (Kaldıraç) nima va uni qanday oshirish mumkin?</div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Leveraj — savdo hisobingizdagi marja imkoniyatini oshiruvchi vosita. Exora da 1:200 dan 1:2000 gacha cheksiz leveraj mavjud bo'lib, uni hisob sozlamalaridan xohlagan payt o'zgartirish mumkin.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 space-y-1">
                  <div className="font-bold text-gray-900 dark:text-white">4. MT4 / MT5 yoki WebTrader terminaliga qanday ulaniladi?</div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Chap menyudagi "Exora Terminal" tugmasini bosing va brauzerning o'zida to'g'ridan-to'g'ri savdoni boshlang. MT5 dasturi uchun esa Server: <strong>ExoraPrime-Live01</strong> va hisob raqamingizdan foydalaning.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: QUICK COMMAND SEARCH PALETTE                                    */}
      {/* ========================================================================= */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-5 relative ${bgCard} space-y-4`}>
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/10">
              <Search className="size-5 text-primary" />
              <input
                type="text"
                autoFocus
                placeholder="Aktivlar, hisoblar, to'lovlar yoki yordam mavzularini qidiring..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 font-medium"
              />
              <button onClick={() => setShowSearchModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
              <div>
                <div className="text-[10px] uppercase font-mono text-muted-foreground mb-1.5 font-bold">Bozorlar & Savdo vositalari:</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { sym: 'BTC/USD', name: 'Bitcoin 24/7', spread: '10.0p' },
                    { sym: 'XAU/USD', name: 'Oltin (Gold)', spread: '1.2p' },
                    { sym: 'EUR/USD', name: 'Yevro / Dollar', spread: '0.8p' },
                    { sym: 'GBP/USD', name: 'Funt / Dollar', spread: '1.2p' },
                  ].map(m => (
                    <button
                      key={m.sym}
                      onClick={() => { setShowSearchModal(false); onOpenTrade(); }}
                      className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-primary/20 flex items-center justify-between text-left transition-all"
                    >
                      <div>
                        <div className="font-bold font-mono text-gray-900 dark:text-white">{m.sym}</div>
                        <div className="text-[10px] text-muted-foreground">{m.name}</div>
                      </div>
                      <span className="text-[10px] font-mono text-primary font-semibold">{m.spread}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-mono text-muted-foreground mb-1.5 font-bold">Tezkor Yo'nalishlar:</div>
                <div className="space-y-1">
                  <button
                    onClick={() => { setCurrentNav('deposit'); setShowSearchModal(false); }}
                    className="w-full text-left p-2 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200">Depozit qilish (Uzcard, Humo, Payme, Click)</span>
                    <span className="text-primary font-bold">&rarr;</span>
                  </button>
                  <button
                    onClick={() => { setCurrentNav('withdraw'); setShowSearchModal(false); }}
                    className="w-full text-left p-2 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200">Mablag'ni yechib olish (Withdrawal)</span>
                    <span className="text-primary font-bold">&rarr;</span>
                  </button>
                  <button
                    onClick={() => { onOpenKyc(); setShowSearchModal(false); }}
                    className="w-full text-left p-2 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200">Shaxsni tasdiqlash (KYC Verifikatsiya)</span>
                    <span className="text-primary font-bold">&rarr;</span>
                  </button>
                  <button
                    onClick={() => { setShowSupportModal(true); setShowSearchModal(false); }}
                    className="w-full text-left p-2 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200">Qo'llab-quvvatlash xizmati (24/7 Live Support)</span>
                    <span className="text-primary font-bold">&rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: LEGAL DOCUMENTS & CONTACT MODAL                                  */}
      {/* ========================================================================= */}
      {legalModalType && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 relative ${bgCard} max-h-[85vh] flex flex-col`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  {legalModalType === 'agreement' && 'Client Agreement'}
                  {legalModalType === 'general_terms' && 'General Business Terms'}
                  {legalModalType === 'partnership' && 'Partnership Agreement'}
                  {legalModalType === 'bonus' && 'Bonus terms and Conditions'}
                  {legalModalType === 'confidentiality' && 'Confidentiality Policy'}
                  {legalModalType === 'key_facts' && 'Key Facts Statement'}
                  {legalModalType === 'conflicts' && 'Conflicts of Interest'}
                  {legalModalType === 'privacy' && 'Privacy Agreement & Data Protection'}
                  {legalModalType === 'risk' && 'Risk Disclosure & Warning'}
                  {legalModalType === 'aml' && 'Preventing Money Laundering (AML/CFT)'}
                  {legalModalType === 'complaints' && 'Complaints Handling Policy'}
                  {legalModalType === 'contact' && 'Contact & Registered Office'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Official Legal Document &bull; Exness (SC) LTD &bull; FSA Licence SD025
                </p>
              </div>
              <button 
                onClick={() => setLegalModalType(null)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto py-4 text-xs leading-relaxed text-gray-600 dark:text-gray-300 space-y-3 font-normal">
              {legalModalType === 'agreement' && (
                <>
                  <p>
                    <strong>1. Scope of Agreement:</strong> This Client Agreement is entered into between Exness (SC) LTD ("Company"), a Securities Dealer registered in Seychelles (Reg. 8423606-1, FSA Licence SD025), and the client ("Trader").
                  </p>
                  <p>
                    <strong>2. Segregated Client Funds:</strong> All client balances and operational margins are kept in segregated Tier-1 banking accounts, strictly isolated from the Company's operational funds.
                  </p>
                  <p>
                    <strong>3. Order Execution:</strong> Orders are executed via electronic communications network (ECN) and market makers at prevailing market Bid/Ask quotes with negative balance protection.
                  </p>
                  <p>
                    <strong>4. Deposits and Withdrawals:</strong> Instant deposits and automated withdrawals are supported with 0% provider fees across accepted regional and international rails.
                  </p>
                </>
              )}

              {legalModalType === 'general_terms' && (
                <>
                  <p>
                    <strong>1. Account Opening:</strong> Access to trading terminals is subject to successful client identification and compliance with FSA regulatory standards.
                  </p>
                  <p>
                    <strong>2. Trading Hours & Maintenance:</strong> Markets operate 24/5 for Forex and Indices, and 24/7 for Cryptocurrencies. Rehearsal server checks occur on weekends.
                  </p>
                  <p>
                    <strong>3. Margin Calls & Stop Out:</strong> Stop out thresholds are calibrated at 30% margin level to safeguard accounts against excessive market exposure.
                  </p>
                </>
              )}

              {legalModalType === 'partnership' && (
                <>
                  <p>
                    <strong>1. Introducing Broker (IB) Framework:</strong> Partners receive up to 40% spread rebate on all qualified traded volumes by referred clients.
                  </p>
                  <p>
                    <strong>2. Real-time Commission Payouts:</strong> Rebates are credited in real-time to partner accounts and available for instant withdrawal without volume limits.
                  </p>
                </>
              )}

              {legalModalType === 'bonus' && (
                <>
                  <p>
                    <strong>1. Deposit Bonuses:</strong> Promotional bonus credits provide additional trading margin and cannot be withdrawn directly without fulfilling volume milestones.
                  </p>
                  <p>
                    <strong>2. Fair Trading:</strong> Latency arbitrage or multi-account bonus abuse will result in disqualification and cancellation of promotional balances.
                  </p>
                </>
              )}

              {legalModalType === 'confidentiality' && (
                <>
                  <p>
                    <strong>1. Confidentiality Obligation:</strong> Exness maintains absolute confidentiality regarding client account transactions, personal data, and trading strategies.
                  </p>
                  <p>
                    <strong>2. Non-Disclosure:</strong> No confidential client information is disclosed to non-affiliated commercial entities under any circumstances.
                  </p>
                </>
              )}

              {legalModalType === 'key_facts' && (
                <>
                  <p>
                    <strong>1. Entity:</strong> Exness (SC) LTD, authorized and regulated by the Seychelles Financial Services Authority (FSA).
                  </p>
                  <p>
                    <strong>2. Products:</strong> Contracts for Difference (CFDs) on Forex, Metals, Cryptocurrencies, Energies, Indices, and Stocks.
                  </p>
                  <p>
                    <strong>3. Leverage:</strong> Up to 1:2000 dynamically adjusted based on instrument volatility and market conditions.
                  </p>
                </>
              )}

              {legalModalType === 'conflicts' && (
                <>
                  <p>
                    <strong>1. Conflict Management:</strong> Exness takes all reasonable steps to prevent and manage conflicts of interest between the Company, affiliates, and clients.
                  </p>
                  <p>
                    <strong>2. Best Execution Policy:</strong> Systematic order routing ensures competitive execution without preferential treatment.
                  </p>
                </>
              )}

              {legalModalType === 'privacy' && (
                <>
                  <p>
                    <strong>1. Data Collection & GDPR:</strong> Exness collects verified identifying documents and contact credentials exclusively to fulfill legal KYC and security requirements.
                  </p>
                  <p>
                    <strong>2. Encryption Standards:</strong> AES-256 and TLS 1.3 protocol encryption protect all stored biometric data, documents, and transactional records.
                  </p>
                </>
              )}

              {legalModalType === 'risk' && (
                <>
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold mb-2">
                    General Risk Warning: CFDs are leveraged products. Trading in CFDs carries a high level of risk thus may not be appropriate for all investors.
                  </div>
                  <p>
                    <strong>Leverage Risk:</strong> Trading with leverage can result in rapid financial loss as well as gain. You may lose all of your invested capital.
                  </p>
                  <p>
                    <strong>Market Volatility:</strong> Market prices can gap sharply due to geopolitical events, macroeconomic announcements, and sudden liquidity shortages.
                  </p>
                  <p>
                    Under no circumstances shall the Company have any liability to any person or entity for any loss or damage caused by CFD transactions.
                  </p>
                </>
              )}

              {legalModalType === 'aml' && (
                <>
                  <p>
                    <strong>1. Anti-Money Laundering (AML):</strong> Exness strictly adheres to Financial Action Task Force (FATF) standards and FSA Anti-Money Laundering legislation.
                  </p>
                  <p>
                    <strong>2. Source of Funds:</strong> All deposits and withdrawals must be made using payment methods registered in the account holder's legal name. Third-party transfers are prohibited.
                  </p>
                </>
              )}

              {legalModalType === 'complaints' && (
                <>
                  <p>
                    <strong>1. Submitting a Complaint:</strong> Clients may submit formal complaints via email to compliance@exness.com or through customer support tickets.
                  </p>
                  <p>
                    <strong>2. Resolution Timeframe:</strong> Complaints receive preliminary acknowledgment within 24 hours and formal resolution within 5 business days.
                  </p>
                </>
              )}

              {legalModalType === 'contact' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 space-y-1">
                      <div className="text-[11px] text-muted-foreground uppercase font-mono font-bold">Client Support Desk:</div>
                      <div className="font-bold text-gray-900 dark:text-white">+998 71 200 45 45</div>
                      <div className="text-[11px] text-muted-foreground">+248 437 3800 (Seychelles HQ)</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 space-y-1">
                      <div className="text-[11px] text-muted-foreground uppercase font-mono font-bold">Official Inquiries:</div>
                      <div className="font-bold text-gray-900 dark:text-white">support@exness.com</div>
                      <div className="text-[11px] text-muted-foreground">compliance@exness.com</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 space-y-1">
                    <div className="text-[11px] text-muted-foreground uppercase font-mono font-bold">Registered Office:</div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      Exness (SC) LTD, 9A CT House, 2nd floor, Providence, Mahe, Seychelles.
                    </div>
                    <div className="text-[11px] text-muted-foreground">Securities Dealer Licence SD025 &bull; Reg: 8423606-1</div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex justify-end">
              <button
                onClick={() => setLegalModalType(null)}
                className="px-6 py-2 rounded-xl bg-[#ffde00] hover:bg-[#f2d200] text-black font-extrabold text-xs shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

