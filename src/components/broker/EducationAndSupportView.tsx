import React, { useState } from "react";
import { translations, Language } from "../../lib/i18n";
import { brokerStore } from "../../lib/brokerStore";
import { 
  BookOpen, 
  HelpCircle, 
  Send, 
  MessageSquare, 
  PlayCircle, 
  ShieldAlert, 
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface EducationAndSupportViewProps {
  lang: Language;
}

export function EducationAndSupportView({ lang }: EducationAndSupportViewProps) {
  const t = translations[lang];
  const user = brokerStore.getActiveUser();
  const [section, setSection] = useState<'education' | 'support'>('education');

  // Support Ticket state
  const [tickets, setTickets] = useState([
    {
      id: 'TCK-1092',
      subject: 'Payme orqali depozit tasdiqlanishi',
      category: 'Finance',
      status: 'resolved',
      createdAt: '2024-05-18 10:20',
      lastMessage: 'Depozitingiz hisobingizga muvaffaqiyatli o\'tkazildi.',
    },
    {
      id: 'TCK-1104',
      subject: 'ECN hisobida spredlar va VPS sozlamasi',
      category: 'Trading',
      status: 'open',
      createdAt: '2024-05-19 14:15',
      lastMessage: 'Mutaxassisimiz VPS IP ma\'lumotlarini tayyorlamoqda.',
    }
  ]);

  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('Trading');
  const [newMessage, setNewMessage] = useState('');

  // Live Chat state
  const [chatMessages, setChatMessages] = useState([
    { sender: 'agent', text: 'Assalomu alaykum! Exora Prime qo\'llab-quvvatlash xizmati. Sizga qanday yordam bera olaman?' },
  ]);
  const [inputChat, setInputChat] = useState('');

  function handleSendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!inputChat.trim()) return;

    const userText = inputChat.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInputChat('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `Rahmat! So'rovingiz (${userText.slice(0, 20)}...) navbatga qo'shildi. Mutaxassisimiz 1-2 daqiqa ichida javob beradi.`,
        },
      ]);
    }, 1000);
  }

  function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) {
      toast.error("Iltimos, mavzu va xabarni to'liq yozing");
      return;
    }

    const created = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: newSubject,
      category: newCategory,
      status: 'open',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lastMessage: newMessage,
    };

    setTickets([created, ...tickets]);
    setNewSubject('');
    setNewMessage('');
    toast.success(`Chipta #${created.id} yaratildi. 24/7 operatorlarimiz ko'rib chiqadi.`);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Toggle Switch */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {section === 'education' ? "Treyderlar uchun Ta'lim Akademiyasi" : "Mijozlarni Qo'llab-Quvvatlash Markazi (24/7)"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {section === 'education'
              ? "Boshlang'ichdan professional darajagacha bo'lgan video darslar va strategiyalar"
              : "Jonli chat yoki rasmiy ticket tizimi orqali mutaxassislar bilan bog'laning"}
          </p>
        </div>

        <div className="flex p-1 rounded-2xl bg-white/5 border border-white/10">
          <button
            onClick={() => setSection('education')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              section === 'education' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'
            }`}
          >
            Ta'lim
          </button>
          <button
            onClick={() => setSection('support')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              section === 'support' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'
            }`}
          >
            Qo'llab-quvvatlash
          </button>
        </div>
      </div>

      {/* 1. EDUCATION CONTENT */}
      {section === 'education' && (
        <div className="flex flex-col gap-8">
          {/* Featured Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="glass rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-4">
                  <BookOpen className="size-5" />
                </div>
                <div className="text-xs font-bold uppercase text-primary">1-Modul</div>
                <h3 className="text-lg font-bold text-white mt-1">Forex Asoslari & Terminologiya</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Pip, Lot, Leverage (kaldıraç), Spred va Marja qanday hisoblanadi? Valyuta juftliklari qoidalari.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><PlayCircle className="size-3.5 text-primary" /> 6 Dars</span>
                <span className="font-bold text-white">Boshlang'ich</span>
              </div>
            </div>

            <div className="glass rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                  <Sparkles className="size-5" />
                </div>
                <div className="text-xs font-bold uppercase text-blue-400">2-Modul</div>
                <h3 className="text-lg font-bold text-white mt-1">Texnik Tahlil & Grafiklar</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Qo'llab-quvvatlash va qarshilik zonalari (Support & Resistance), yapon shamlari (Candlesticks) va trend indikatorlari.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><PlayCircle className="size-3.5 text-primary" /> 8 Dars</span>
                <span className="font-bold text-white">O'rta Daraja</span>
              </div>
            </div>

            <div className="glass rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
                  <ShieldAlert className="size-5" />
                </div>
                <div className="text-xs font-bold uppercase text-rose-400">3-Modul</div>
                <h3 className="text-lg font-bold text-white mt-1">Risk Boshqaruvi & Psixologiya</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Kapitalni saqlashning 1-2% oltin qoidasi. Stop Loss o'rnatish, drawdown kamaytirish va hissiyotlarni boshqarish.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><PlayCircle className="size-3.5 text-primary" /> 5 Dars</span>
                <span className="font-bold text-white">Professional</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUPPORT & TICKETS CONTENT */}
      {section === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Ticket System (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Create Ticket Form */}
            <form onSubmit={handleCreateTicket} className="glass rounded-3xl p-6 border border-white/10 flex flex-col gap-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="size-4 text-primary" />
                <span>Yangi Qo'llab-quvvatlash Chiptasi (Ticket)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Mavzu:</label>
                  <input
                    type="text"
                    required
                    placeholder="Muammoni qisqacha bayon qiling"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Bo'lim:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary/50"
                  >
                    <option value="Finance" className="bg-neutral-900">Moliya (Depozit / Yechib olish)</option>
                    <option value="Trading" className="bg-neutral-900">Savdo va WebTrader</option>
                    <option value="KYC" className="bg-neutral-900">KYC va Verifikatsiya</option>
                    <option value="Tech" className="bg-neutral-900">Texnik muammo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">Batafsil xabar:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Hisob raqamingiz yoki buyurtma ID sini ko'rsating..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-primary/50 resize-none"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-primary text-black py-2.5 text-xs font-bold hover:opacity-90 transition-all self-end px-6 shadow-md shadow-primary/20"
              >
                Chiptani yuborish
              </button>
            </form>

            {/* Existing Tickets List */}
            <div className="glass rounded-3xl p-6 border border-white/10">
              <h3 className="font-bold text-sm text-white mb-3">Sizning chiptalaringiz</h3>
              <div className="flex flex-col gap-2.5">
                {tickets.map((tck) => (
                  <div key={tck.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">{tck.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-muted-foreground">{tck.category}</span>
                      </div>
                      <div className="text-xs text-white font-medium mt-1">{tck.subject}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{tck.lastMessage}</div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        tck.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {tck.status}
                      </span>
                      <div className="text-[10px] text-muted-foreground mt-1">{tck.createdAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Live Chat Widget (5 cols) */}
          <div className="lg:col-span-5 glass rounded-3xl p-5 border border-white/10 flex flex-col justify-between h-[520px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                      EX
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">Exora Live Agent</div>
                    <div className="text-[10px] text-emerald-400">Onlayn (24/7)</div>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex flex-col gap-2.5 mt-4 overflow-y-auto max-h-[340px] pr-1">
                {chatMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-primary text-black font-medium self-end rounded-br-xs'
                        : 'bg-white/10 text-white self-start rounded-bl-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChat} className="flex gap-2 pt-3 border-t border-white/10">
              <input
                type="text"
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                placeholder="Savolingizni yozing..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary/50"
              />
              <button
                type="submit"
                className="rounded-xl bg-primary text-black px-3 py-2 flex items-center justify-center hover:opacity-90"
              >
                <Send className="size-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
