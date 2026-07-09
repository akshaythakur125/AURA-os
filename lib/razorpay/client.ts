import Razorpay from "razorpay";
import { getRazorpayKeyId, getRazorpaySecret, isRazorpayConfigured } from "./env";

let instance: Razorpay | null = null;

export function getRazorpayInstance(): Razorpay {
  if (typeof window !== "undefined") {
    throw new Error(
      "getRazorpayInstance() is server-only. Do not import into client components."
    );
  }

  if (!isRazorpayConfigured()) {
    throw new Error(
      "Razorpay is not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID, RAZORPAY_KEY_ID, and RAZORPAY_KEY_SECRET."
    );
  }

  if (instance) return instance;

  const keyId = getRazorpayKeyId()!;
  const keySecret = getRazorpaySecret()!;

  instance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return instance;
}
