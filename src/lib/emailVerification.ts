export interface VerificationState {
  email: string;
  phone?: string;
  channel?: "email" | "telegram";
  code: string;
  expiresAt: number;
  purpose: "signin" | "signup" | "reset_password";
  payload?: {
    name?: string;
    password?: string;
  };
}

const STORAGE_KEY = "exora_email_verification";

/**
 * Normalizes an email or phone number for robust comparison
 */
export function normalizeContact(contact: string): string {
  if (!contact) return "";
  const trimmed = contact.trim().toLowerCase();
  if (trimmed.includes("@")) {
    return trimmed;
  }
  // Strip all non-digits for phone numbers
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length >= 7) {
    if (digits.startsWith("998")) return "+" + digits;
    if (digits.length === 9) return "+998" + digits;
    return "+" + digits;
  }
  return trimmed;
}

/**
 * Generates a random 6-digit verification code
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Creates and sends a verification code to the given email
 */
export async function sendVerificationCode(
  email: string,
  purpose: "signin" | "signup" | "reset_password",
  payload?: { name?: string; password?: string }
): Promise<{ success: boolean; code: string; expiresAt: number; deliveredTo?: string; error?: string; errorType?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const code = generateOtpCode();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes valid

  try {
    const response = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: cleanEmail,
        code,
        purpose,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("[Exora Mail Service] Resend dispatch failed:", data);
      return {
        success: false,
        code: "",
        expiresAt: 0,
        error: data.error || "Email yuborishda xatolik yuz berdi",
        errorType: data.errorType || "SEND_FAILED",
      };
    }

    const record: VerificationState = {
      email: cleanEmail,
      channel: "email",
      code,
      expiresAt,
      purpose,
      payload,
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {}

    console.log(`[Exora Mail Service] Resend OTP successfully dispatched to ${cleanEmail}:`, data);

    return {
      success: true,
      code,
      expiresAt,
      deliveredTo: data.deliveredTo || cleanEmail,
    };
  } catch (err: any) {
    console.error("Failed to call /api/send-otp:", err);
    return {
      success: false,
      code: "",
      expiresAt: 0,
      error: err?.message || "Server bilan aloqa uzildi",
      errorType: "NETWORK_ERROR",
    };
  }
}

/**
 * Creates and sends a verification code via official Telegram Gateway (@VerificationCodes)
 */
export async function sendTelegramVerificationCode(
  phone: string,
  purpose: "signin" | "signup" | "reset_password",
  payload?: { name?: string; password?: string }
): Promise<{ success: boolean; code: string; expiresAt: number; phone: string; delivered: boolean; notice?: string; error?: string }> {
  const code = generateOtpCode();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min valid

  try {
    const response = await fetch("/api/send-telegram-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        code,
        purpose,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      return {
        success: false,
        code: "",
        expiresAt: 0,
        phone,
        delivered: false,
        error: data.error || "Telegram Gateway xatosi yuz berdi",
      };
    }

    const formattedPhone = data.formattedPhone || normalizeContact(phone);
    const finalCode = data.code || code;

    const record: VerificationState = {
      email: formattedPhone,
      phone: formattedPhone,
      channel: "telegram",
      code: finalCode,
      expiresAt,
      purpose,
      payload,
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {}

    return {
      success: true,
      code: finalCode,
      expiresAt,
      phone: formattedPhone,
      delivered: !!data.delivered,
      notice: data.notice,
    };
  } catch (err: any) {
    console.error("Failed to call /api/send-telegram-otp:", err);
    return {
      success: false,
      code: "",
      expiresAt: 0,
      phone,
      delivered: false,
      error: err?.message || "Server bilan aloqa uzildi",
    };
  }
}

/**
 * Gets the current active verification request from storage
 */
export function getStoredVerification(): VerificationState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: VerificationState = JSON.parse(raw);
    if (Date.now() > parsed.expiresAt + 120000) { // allow 2 min clock drift
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Validates the entered code against the stored code or fallback expected code
 */
export function verifyOtpCode(
  contact: string,
  enteredCode: string,
  fallbackExpectedCode?: string
): { success: boolean; error?: string; record?: VerificationState } {
  const cleanEnteredCode = (enteredCode || "").trim().replace(/\D/g, "");
  if (cleanEnteredCode.length !== 6) {
    return {
      success: false,
      error: "Iltimos, 6 xonali tasdiqlash kodini to'liq kiriting.",
    };
  }

  const record = getStoredVerification();
  const normalizedInput = normalizeContact(contact);

  // If fallbackExpectedCode matches the entered code, verify immediately
  if (fallbackExpectedCode && fallbackExpectedCode.trim().replace(/\D/g, "") === cleanEnteredCode) {
    clearVerification();
    return {
      success: true,
      record: record || {
        email: normalizedInput,
        phone: normalizedInput,
        channel: normalizedInput.includes("@") ? "email" : "telegram",
        code: cleanEnteredCode,
        expiresAt: Date.now() + 600000,
        purpose: "signup",
      },
    };
  }

  if (!record) {
    return {
      success: false,
      error: "Tasdiqlash kodi topilmadi yoki muddati o'tgan. Iltimos, kodni qayta so'rang.",
    };
  }

  // Compare contacts with normalization
  const normRecordEmail = normalizeContact(record.email || "");
  const normRecordPhone = normalizeContact(record.phone || "");

  const contactMatches =
    !contact ||
    normRecordEmail === normalizedInput ||
    normRecordPhone === normalizedInput ||
    (contact.replace(/\D/g, "").length >= 7 &&
      (record.email.replace(/\D/g, "") === contact.replace(/\D/g, "") ||
        record.phone?.replace(/\D/g, "") === contact.replace(/\D/g, "")));

  // If contact didn't match and code doesn't match either
  if (!contactMatches && record.code !== cleanEnteredCode) {
    return {
      success: false,
      error: "Tasdiqlash kodi topilmadi yoki boshqa raqam/email uchun so'ralgan.",
    };
  }

  if (Date.now() > record.expiresAt + 120000) {
    clearVerification();
    return {
      success: false,
      error: "Kodni amal qilish muddati tugagan. Yangi kod oling.",
    };
  }

  if (record.code !== cleanEnteredCode) {
    return {
      success: false,
      error: "Noto'g'ri tasdiqlash kodi kiritildi. Qaytadan tekshirib ko'ring.",
    };
  }

  clearVerification();
  return {
    success: true,
    record,
  };
}

/**
 * Clears any pending verification
 */
export function clearVerification(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
