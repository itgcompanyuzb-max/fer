import { useState } from "react";
import { X, ShieldCheck, ArrowRight, Fingerprint } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { registerOrUpdateUser } from "@/lib/userStore";
import { LimeAppleIcon } from "@/components/icons/LimeAppleIcon";

interface AppleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { email: string; name: string }) => void;
}

export function AppleAuthModal({
  isOpen,
  onClose,
  onSuccess,
}: AppleAuthModalProps) {
  const [appleId, setAppleId] = useState("");
  const [hideEmail, setHideEmail] = useState(true);
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  async function handleAppleSignIn(emailToUse: string, nameToUse: string) {
    setBusy(true);
    try {
      const email = emailToUse.trim().toLowerCase();
      const name = nameToUse || "Apple Trader";

      registerOrUpdateUser({
        email,
        name,
        provider: "apple",
        avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`,
      });

      await supabase.auth.setSession({
        access_token: "apple-token-" + Date.now(),
        provider: "apple",
        user: {
          id: "apple-" + btoa(email).replace(/=/g, ""),
          email,
          user_metadata: {
            display_name: name,
            avatar_url: "",
            provider: "apple",
            email_verified: true,
          },
        },
      });

      toast.success(`Apple orqali Exora hisobiga kirildi: ${email}`);
      onSuccess({ email, name });
      onClose();
    } catch {
      toast.error("Apple orqali kirishda xatolik yuz berdi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-3xl bg-[#1c1c1e] p-6 sm:p-8 text-white shadow-2xl border border-white/15 z-10 animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="size-5" />
        </button>

        <div className="text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/5 border border-primary/20 mx-auto mb-3 shadow-lg">
            <LimeAppleIcon className="size-8" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight text-white">
            Continue with Apple
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Apple hisobingiz yordamida Exora ilovasiga kiring
          </p>
        </div>

        {/* Apple quick accounts */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              handleAppleSignIn(
                "trader.apple@apple.com",
                "Apple Trader"
              )
            }
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-white/10 font-bold text-white text-sm">
                <LimeAppleIcon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                  Apple Trader
                </p>
                <p className="text-xs text-gray-400">trader.apple@icloud.com</p>
              </div>
            </div>
            <span className="text-xs text-primary font-medium flex items-center gap-1">
              Ulanish <ArrowRight className="size-3.5" />
            </span>
          </button>

          {/* Touch ID / Face ID simulation button */}
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              handleAppleSignIn(
                "apple.user@icloud.com",
                "Apple Trader"
              )
            }
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white text-black hover:bg-gray-100 transition-all font-semibold text-sm shadow-md"
          >
            <Fingerprint className="size-5" />
            <span>Face ID / Touch ID bilan kirish</span>
          </button>

          {/* Manual Apple ID input */}
          <div className="mt-2 p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2.5">
            <label className="text-xs text-gray-300 font-medium">
              Boshqa Apple ID emaili:
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={appleId}
                onChange={(e) => setAppleId(e.target.value)}
                placeholder="masalan: user@icloud.com"
                className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-gray-500 outline-none focus:border-white"
              />
              <button
                type="button"
                disabled={busy || !appleId.includes("@")}
                onClick={() =>
                  handleAppleSignIn(
                    appleId,
                    appleId.split("@")[0]
                  )
                }
                className="bg-white text-black font-semibold text-xs px-3.5 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-opacity"
              >
                Kirish
              </button>
            </div>

            <label className="flex items-center gap-2 text-[11px] text-gray-400 mt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hideEmail}
                onChange={(e) => setHideEmail(e.target.checked)}
                className="rounded border-white/20 bg-black/40 text-primary"
              />
              <span>Mening emailimni yashirish (Hide My Email)</span>
            </label>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-blue-400" />
            Apple ID maxfiyligi bilan himoyalangan
          </span>
          <button
            type="button"
            onClick={onClose}
            className="hover:text-white transition-colors"
          >
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  );
}
