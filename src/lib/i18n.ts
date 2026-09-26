export type Language = 'uz' | 'ru' | 'en';

export interface TranslationDict {
  // Navigation & Brand
  brandName: string;
  tagline: string;
  navMarkets: string;
  navTrading: string;
  navAccounts: string;
  navKyc: string;
  navEducation: string;
  navSupport: string;
  navAdminPortal: string;
  navClientPortal: string;
  navDashboard: string;
  signIn: string;
  signUp: string;
  login: string;
  register: string;
  home: string;
  clientCabinet: string;
  kycStatus: string;
  support: string;
  logout: string;

  // Landing Page
  heroTitle: string;
  heroSubtitle: string;
  startTradingBtn: string;
  openDemoBtn: string;
  licenseBadge: string;
  liveSpreads: string;
  leverageUpTo: string;
  zeroCommission: string;
  fastExecution: string;
  accountTypesTitle: string;
  accountTypesSub: string;

  // Account types
  standardAccount: string;
  proAccount: string;
  ecnAccount: string;

  // Trading WebTrader
  webTraderTitle: string;
  buy: string;
  sell: string;
  lotSize: string;
  stopLoss: string;
  takeProfit: string;
  marginReq: string;
  openOrderBtn: string;
  activePositions: string;
  orderHistory: string;
  closePosition: string;
  pnl: string;

  // Wallet & Payments
  deposit: string;
  withdraw: string;
  walletBalance: string;
  equity: string;
  freeMargin: string;
  paymentMethod: string;
  payme: string;
  click: string;
  uzcardHumo: string;
  cryptoUsdt: string;
  confirmDeposit: string;
  requestWithdrawal: string;

  // KYC
  kycVerificationTitle: string;
  kycDesc: string;
  documentType: string;
  passport: string;
  idCard: string;
  driversLicense: string;
  documentNumber: string;
  uploadIdFront: string;
  uploadSelfie: string;
  submitKyc: string;
  kycPending: string;
  kycApproved: string;
  kycRejected: string;

  // Admin
  adminPanel: string;
  adminStats: string;
  usersManagement: string;
  kycQueue: string;
  financialApproval: string;
  systemSettings: string;
  auditLogs: string;
}

export const translations: Record<Language, TranslationDict> = {
  uz: {
    brandName: "Exora Prime",
    tagline: "Global Forex & CFD Broker Platformasi",
    navMarkets: "Bozorlar",
    navTrading: "WebTrader",
    navAccounts: "Hisob turlari",
    navKyc: "KYC Tekshiruv",
    navEducation: "Ta'lim",
    navSupport: "Yordam (24/7)",
    navAdminPortal: "Admin Panel",
    navClientPortal: "Mijoz Kabineti",
    navDashboard: "Boshqaruv paneli",
    signIn: "Kirish",
    signUp: "Ro'yxatdan o'tish",
    login: "Kirish",
    register: "Ro'yxatdan o'tish",
    home: "Asosiy",
    clientCabinet: "Mijoz Kabineti",
    kycStatus: "KYC Tekshiruv",
    support: "Qo'llab-quvvatlash",
    logout: "Chiqish",

    heroTitle: "Institutsional Darajadagi Forex & CFD Savdosi",
    heroSubtitle: "0.0 pipdan boshlanuvchi xom spredlar, 1:500 gacha kaldıraç (leverage) va Payme, Click, Kripto orqali tezkor hisob to'ldirish.",
    startTradingBtn: "Real Hisob Ochish",
    openDemoBtn: "$10,000 Demo Sinov",
    licenseBadge: "Litsenziya: FSA-SVG No. 26842-IBC | Tier-1 Bank Kafolati",
    liveSpreads: "Jonli Spredlar",
    leverageUpTo: "1:500 gacha kaldıraç",
    zeroCommission: "0% depozit komissiyasi",
    fastExecution: "15ms o'rtacha ijro tezligi",
    accountTypesTitle: "Savdo Strategiyangizga Mos Hisob Turlari",
    accountTypesSub: "Boshlang'ich treyderlardan professional algoritmik fondlargacha",

    standardAccount: "Standard Hisob",
    proAccount: "Pro Trader",
    ecnAccount: "Raw ECN",

    webTraderTitle: "Exora WebTrader Terminali",
    buy: "BUY (Xarid)",
    sell: "SELL (Sotish)",
    lotSize: "Lot hajmi",
    stopLoss: "Stop Loss (SL)",
    takeProfit: "Take Profit (TP)",
    marginReq: "Zaruriy marja",
    openOrderBtn: "Pozitsiya Ochish",
    activePositions: "Ochiq Pozitsiyalar",
    orderHistory: "Savdolar Tarixi",
    closePosition: "Yopish",
    pnl: "Foyda / Zarar (P&L)",

    deposit: "Depozit qilish",
    withdraw: "Pul yechib olish",
    walletBalance: "Hisob balansi",
    equity: "Ekvit (Equity)",
    freeMargin: "Erkin marja",
    paymentMethod: "To'lov usulini tanlang",
    payme: "Payme (So'm)",
    click: "Click (So'm)",
    uzcardHumo: "Uzcard / Humo",
    cryptoUsdt: "USDT (TRC-20 / ERC-20)",
    confirmDeposit: "Hisobni to'ldirish",
    requestWithdrawal: "Yechib olish so'rovini yuborish",

    kycVerificationTitle: "KYC Shaxsni Tasdiqlash",
    kycDesc: "Moliyaviy xavfsizlik va xalqaro AML/CTF standartlariga muvofiq shaxsingizni tasdiqlang.",
    documentType: "Hujjat turi",
    passport: "Xorijiy / Fuqarolik Pasporti",
    idCard: "ID Karta",
    driversLicense: "Haydovchilik guvohnomasi",
    documentNumber: "Hujjat seriya va raqami",
    uploadIdFront: "Hujjat oldi nusxasi",
    uploadSelfie: "Selfi (hujjat bilan birga)",
    submitKyc: "Tasdiqlashga yuborish",
    kycPending: "Tekshirilmoqda",
    kycApproved: "Tasdiqlangan",
    kycRejected: "Rad etilgan",

    adminPanel: "Boshqaruv (Admin) Markazi",
    adminStats: "Umumiy ko'rsatkichlar",
    usersManagement: "Foydalanuvchilar",
    kycQueue: "KYC Hujjatlar Navbati",
    financialApproval: "Moliya & Tranzaksiyalar",
    systemSettings: "Spred & Leverage Sozlamalari",
    auditLogs: "Xavfsizlik Audit Loglari",
  },
  ru: {
    brandName: "Exora Prime",
    tagline: "Глобальная Forex & CFD Брокерская Платформа",
    navMarkets: "Рынки",
    navTrading: "WebTrader",
    navAccounts: "Типы счетов",
    navKyc: "Верификация KYC",
    navEducation: "Обучение",
    navSupport: "Поддержка (24/7)",
    navAdminPortal: "Панель администратора",
    navClientPortal: "Личный кабинет",
    navDashboard: "Дашборд",
    signIn: "Вход",
    signUp: "Регистрация",
    login: "Вход",
    register: "Регистрация",
    home: "Главная",
    clientCabinet: "Личный кабинет",
    kycStatus: "Верификация KYC",
    support: "Поддержка",
    logout: "Выйти",

    heroTitle: "Институциональный уровень торговли Forex & CFD",
    heroSubtitle: "Сырые спреды от 0.0 пипсов, плечо до 1:500, мгновенный ввод средств через Payme, Click, Uzcard и Криптовалюту.",
    startTradingBtn: "Открыть Реальный Счет",
    openDemoBtn: "Демо-счет на $10,000",
    licenseBadge: "Лицензия: FSA-SVG No. 26842-IBC | Сегрегированные счета Tier-1",
    liveSpreads: "Живые спреды",
    leverageUpTo: "Кредитное плечо до 1:500",
    zeroCommission: "0% комиссия на ввод",
    fastExecution: "Скорость исполнения 15 мс",
    accountTypesTitle: "Торговые счета под любую стратегию",
    accountTypesSub: "От начинающих трейдеров до институциональных инвесторов",

    standardAccount: "Standard Счет",
    proAccount: "Pro Trader",
    ecnAccount: "Raw ECN",

    webTraderTitle: "Терминал Exora WebTrader",
    buy: "BUY (Купить)",
    sell: "SELL (Продать)",
    lotSize: "Объем (Лоты)",
    stopLoss: "Stop Loss",
    takeProfit: "Take Profit",
    marginReq: "Маржинальные требования",
    openOrderBtn: "Открыть ордер",
    activePositions: "Открытые позиции",
    orderHistory: "История сделок",
    closePosition: "Закрыть",
    pnl: "Прибыль / Убыток (P&L)",

    deposit: "Пополнить баланс",
    withdraw: "Вывод средств",
    walletBalance: "Баланс счета",
    equity: "Средства (Equity)",
    freeMargin: "Свободная маржа",
    paymentMethod: "Способ оплаты",
    payme: "Payme (UZS)",
    click: "Click (UZS)",
    uzcardHumo: "Uzcard / Humo",
    cryptoUsdt: "USDT (TRC-20 / ERC-20)",
    confirmDeposit: "Пополнить счет",
    requestWithdrawal: "Запросить вывод средств",

    kycVerificationTitle: "Верификация личности (KYC)",
    kycDesc: "В соответствии с международными стандартами AML/CTF, подтвердите свою личность.",
    documentType: "Тип документа",
    passport: "Заграничный / Гражданский паспорт",
    idCard: "ID Карта",
    driversLicense: "Водительское удостоверение",
    documentNumber: "Серия и номер документа",
    uploadIdFront: "Лицевая сторона документа",
    uploadSelfie: "Селфи с документом",
    submitKyc: "Отправить на проверку",
    kycPending: "На рассмотрении",
    kycApproved: "Подтверждено",
    kycRejected: "Отклонено",

    adminPanel: "Центр управления (Admin)",
    adminStats: "Общая статистика",
    usersManagement: "Пользователи",
    kycQueue: "Очередь KYC",
    financialApproval: "Финансы и Выводы",
    systemSettings: "Настройки спредов и плеча",
    auditLogs: "Неизменяемый журнал аудита",
  },
  en: {
    brandName: "Exora Prime",
    tagline: "Global Forex & CFD Brokerage Platform",
    navMarkets: "Markets",
    navTrading: "WebTrader",
    navAccounts: "Account Types",
    navKyc: "KYC Verification",
    navEducation: "Education",
    navSupport: "Support (24/7)",
    navAdminPortal: "Admin Portal",
    navClientPortal: "Client Cabinet",
    navDashboard: "Dashboard",
    signIn: "Sign In",
    signUp: "Register",
    login: "Login",
    register: "Register",
    home: "Home",
    clientCabinet: "Client Cabinet",
    kycStatus: "KYC Verification",
    support: "Support",
    logout: "Sign Out",

    heroTitle: "Institutional Grade Forex & CFD Trading",
    heroSubtitle: "Raw spreads from 0.0 pips, leverage up to 1:500, ultra-fast order execution and instant local & crypto deposits.",
    startTradingBtn: "Open Live Account",
    openDemoBtn: "$10,000 Demo Account",
    licenseBadge: "Regulated: FSA-SVG No. 26842-IBC | Tier-1 Segregated Accounts",
    liveSpreads: "Live Spreads",
    leverageUpTo: "Leverage up to 1:500",
    zeroCommission: "0% deposit fees",
    fastExecution: "15ms avg execution speed",
    accountTypesTitle: "Trading Accounts Built for Every Strategy",
    accountTypesSub: "From day traders to algorithmic hedge funds",

    standardAccount: "Standard Account",
    proAccount: "Pro Trader",
    ecnAccount: "Raw ECN",

    webTraderTitle: "Exora WebTrader Terminal",
    buy: "BUY",
    sell: "SELL",
    lotSize: "Volume (Lots)",
    stopLoss: "Stop Loss",
    takeProfit: "Take Profit",
    marginReq: "Required Margin",
    openOrderBtn: "Place Order",
    activePositions: "Open Positions",
    orderHistory: "Trade History",
    closePosition: "Close",
    pnl: "Profit / Loss (P&L)",

    deposit: "Deposit Funds",
    withdraw: "Withdrawal",
    walletBalance: "Account Balance",
    equity: "Equity",
    freeMargin: "Free Margin",
    paymentMethod: "Payment Method",
    payme: "Payme (UZS)",
    click: "Click (UZS)",
    uzcardHumo: "Uzcard / Humo",
    cryptoUsdt: "USDT (TRC-20 / ERC-20)",
    confirmDeposit: "Deposit Now",
    requestWithdrawal: "Submit Withdrawal Request",

    kycVerificationTitle: "KYC Identity Verification",
    kycDesc: "Comply with international AML/CTF standards and unlock full trading and unlimited withdrawals.",
    documentType: "Document Type",
    passport: "International / National Passport",
    idCard: "ID Card",
    driversLicense: "Driver's License",
    documentNumber: "Document Number",
    uploadIdFront: "Document Front Image",
    uploadSelfie: "Selfie holding document",
    submitKyc: "Submit for Verification",
    kycPending: "Under Review",
    kycApproved: "Approved",
    kycRejected: "Rejected",

    adminPanel: "Broker Admin Center",
    adminStats: "Broker Overview",
    usersManagement: "User Management",
    kycQueue: "KYC Queue",
    financialApproval: "Finance & Withdrawals",
    systemSettings: "Spreads & Leverage Config",
    auditLogs: "Immutable Audit Logs",
  },
};
