import React, { useState } from "react";
import { brokerStore } from "../../lib/brokerStore";
import { translations, Language } from "../../lib/i18n";
import { KycStatus } from "../../types/broker";
import { 
  ShieldCheck, 
  UploadCloud, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Camera, 
  AlertTriangle 
} from "lucide-react";
import { toast } from "sonner";

interface KycVerificationViewProps {
  lang: Language;
}

export function KycVerificationView({ lang }: KycVerificationViewProps) {
  const t = translations[lang];
  const user = brokerStore.getActiveUser();
  const kycRecord = brokerStore.getUserKyc(user.id);

  const [docType, setDocType] = useState<'passport' | 'id_card' | 'drivers_license'>('passport');
  const [docNumber, setDocNumber] = useState(kycRecord?.documentNumber || 'FA 1948201');
  const [frontUrl, setFrontUrl] = useState(kycRecord?.idFrontUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80');
  const [selfieUrl, setSelfieUrl] = useState(kycRecord?.selfieUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmitKyc(e: React.FormEvent) {
    e.preventDefault();
    if (!docNumber.trim()) {
      toast.error("Hujjat raqamini kiriting");
      return;
    }

    setIsSubmitting(true);
    try {
      brokerStore.submitKyc({
        documentType: docType,
        documentNumber: docNumber,
        idFrontUrl: frontUrl,
        selfieUrl: selfieUrl,
      });

      toast.success("KYC hujjatlari muvaffaqiyatli topshirildi. Compliance mutaxassisi tomonidan tekshiriladi.");
    } catch (err) {
      toast.error("Hujjat yuborishda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentStatus: KycStatus = user.kycStatus || 'unsubmitted';

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header Banner */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
            <ShieldCheck className="size-3.5" />
            <span>AML / KYC Xavfsizlik</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.kycVerificationTitle}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-lg">
            {t.kycDesc}
          </p>
        </div>

        {/* Current Status Pill */}
        <div className="flex flex-col items-start sm:items-end">
          <span className="text-[11px] text-muted-foreground mb-1">Joriy Holat:</span>
          {currentStatus === 'approved' && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 text-xs font-bold">
              <CheckCircle2 className="size-4" />
              <span>{t.kycApproved}</span>
            </div>
          )}
          {currentStatus === 'pending' && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-1.5 text-xs font-bold">
              <Clock className="size-4" />
              <span>{t.kycPending}</span>
            </div>
          )}
          {currentStatus === 'rejected' && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 px-4 py-1.5 text-xs font-bold">
              <XCircle className="size-4" />
              <span>{t.kycRejected}</span>
            </div>
          )}
          {currentStatus === 'unsubmitted' && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 text-white border border-white/20 px-4 py-1.5 text-xs font-bold">
              <AlertTriangle className="size-4 text-amber-400" />
              <span>Topshirilmagan</span>
            </div>
          )}
        </div>
      </div>

      {/* KYC Form or Approved Status Card */}
      {currentStatus === 'approved' ? (
        <div className="glass rounded-3xl p-8 border border-emerald-500/20 bg-emerald-500/5 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
            <CheckCircle2 className="size-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Shaxsingiz to'liq tasdiqlangan!</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md">
            Sizning hisobingiz xalqaro AML/CTF standartlari bo'yicha to'liq tekshirilgan. Cheklovlarsiz depozit qilish, savdo qilish va pul yechib olishingiz mumkin.
          </p>
          <div className="mt-6 font-mono text-xs text-muted-foreground bg-white/5 px-4 py-2 rounded-xl">
            Tasdiqlangan hujjat: {kycRecord?.documentType.toUpperCase()} ({kycRecord?.documentNumber})
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmitKyc} className="glass rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white">
            Shaxsni tasdiqlovchi hujjat ma'lumotlari
          </h3>

          {/* Document Type Radio Buttons */}
          <div>
            <label className="text-xs text-muted-foreground block mb-2">{t.documentType}:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'passport', label: t.passport },
                { id: 'id_card', label: t.idCard },
                { id: 'drivers_license', label: t.driversLicense },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setDocType(item.id as any)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                    docType === item.id
                      ? 'bg-primary/20 border-primary text-white font-bold'
                      : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white'
                  }`}
                >
                  <FileText className="size-4 shrink-0 text-primary" />
                  <span className="text-xs">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Document Number */}
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">{t.documentNumber}:</label>
            <input
              type="text"
              required
              placeholder="Masalan: FA 1948201 yoki AA 1234567"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 text-sm font-mono text-white outline-none focus:border-primary/50"
            />
          </div>

          {/* Two Upload Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Front Photo */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <UploadCloud className="size-4 text-primary" />
                <span>{t.uploadIdFront}</span>
              </span>
              <div className="relative h-36 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                <img
                  src={frontUrl}
                  alt="Hujjat oldi"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              <input
                type="text"
                placeholder="Rasm havolasi (URL)"
                value={frontUrl}
                onChange={(e) => setFrontUrl(e.target.value)}
                className="w-full text-[11px] font-mono bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>

            {/* Selfie with ID */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Camera className="size-4 text-primary" />
                <span>{t.uploadSelfie}</span>
              </span>
              <div className="relative h-36 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                <img
                  src={selfieUrl}
                  alt="Selfi"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              <input
                type="text"
                placeholder="Selfi havolasi (URL)"
                value={selfieUrl}
                onChange={(e) => setSelfieUrl(e.target.value)}
                className="w-full text-[11px] font-mono bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-muted-foreground flex flex-col gap-1.5">
            <div className="font-bold text-white mb-1">Talablar:</div>
            <div>• Hujjatning barcha 4 burchagi ko'rinishi va yozuvlar tiniq bo'lishi shart.</div>
            <div>• Ism-familiya hisob qaydnomangizdagi ism bilan to'liq mos kelishi zarur.</div>
            <div>• Hujjat amal qilish muddati o'tmagan bo'lishi lozim.</div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-primary text-black py-4 text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? "Yuborilmoqda..." : t.submitKyc}
          </button>
        </form>
      )}
    </div>
  );
}
