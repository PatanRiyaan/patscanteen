// Dummy "email OTP" helper.
// We don't actually send email — this generates a 6-digit code and shows it
// in a toast so the demo flow stays self-contained. Swap `deliver()` for a
// real edge-function email send when wiring this to production.
import { toast } from "sonner";

const STORE_KEY = "pats_otp";
type OtpRecord = { email: string; code: string; sentAt: number; expiresAt: number };

const ttlMs = 5 * 60 * 1000;        // OTP expires after 5 minutes
const throttleMs = 60 * 1000;       // Minimum 60 seconds between resends

export type SendOtpResult =
  | { ok: true; code: string }
  | { ok: false; error: string; retryAfterSec: number };

export function sendOtp(email: string): SendOtpResult {
  const now = Date.now();
  const raw = sessionStorage.getItem(STORE_KEY);

  // Throttle: same email + within cooldown window
  if (raw) {
    const prev = JSON.parse(raw) as OtpRecord;
    const elapsed = now - prev.sentAt;
    if (prev.email === email.toLowerCase() && elapsed < throttleMs) {
      const retryAfterSec = Math.ceil((throttleMs - elapsed) / 1000);
      return {
        ok: false,
        error: `Please wait ${retryAfterSec}s before requesting a new code.`,
        retryAfterSec,
      };
    }
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const rec: OtpRecord = {
    email: email.toLowerCase(),
    code,
    sentAt: now,
    expiresAt: now + ttlMs,
  };
  sessionStorage.setItem(STORE_KEY, JSON.stringify(rec));

  // 👇 Replace this toast with a real email API call when you have one.
  toast.success(`OTP sent to ${email}`, {
    description: `Demo code: ${code} (valid 5 min)`,
    duration: 8000,
  });
  return { ok: true, code };
}

export function verifyOtp(email: string, code: string): { ok: boolean; error?: string } {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (!raw) return { ok: false, error: "No OTP requested." };
    const rec = JSON.parse(raw) as OtpRecord;
    if (rec.email !== email.toLowerCase()) return { ok: false, error: "OTP was sent to a different email." };
    if (Date.now() > rec.expiresAt) return { ok: false, error: "OTP expired — please request a new one." };
    if (rec.code !== code.trim()) return { ok: false, error: "Incorrect OTP." };
    sessionStorage.removeItem(STORE_KEY);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not verify OTP." };
  }
}
