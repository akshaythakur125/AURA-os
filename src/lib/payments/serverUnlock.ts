import { PAYMENT_PRODUCTS, type PaymentProductId } from "@/config/pricing";
import type { ProductType } from "@/types/payment";

// ponytail: bridge old ProductType to new ProductId
function toProductId(t: ProductType): PaymentProductId {
  return (t in PAYMENT_PRODUCTS ? t : "aura_report") as PaymentProductId;
}

export function getServerProductPrice(productType: ProductType): number {
  const p = PAYMENT_PRODUCTS[toProductId(productType)];
  return p ? Math.round(p.price / 100) : 0;
}

export function getServerProductName(productType: ProductType): string {
  const p = PAYMENT_PRODUCTS[toProductId(productType)];
  return p?.name || productType;
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = new TextEncoder().encode(a);
  const bBuf = new TextEncoder().encode(b);
  if (aBuf.length !== bBuf.length) return false;
  let mismatch = 0;
  for (let i = 0; i < aBuf.length; i++) {
    mismatch |= aBuf[i] ^ bBuf[i];
  }
  return mismatch === 0;
}

export function isAdminUnlockCode(code: string): boolean {
  const demoCode = process.env.ADMIN_UNLOCK_CODE || "";
  if (!demoCode) return false;
  return timingSafeEqual(normalizeCode(code), normalizeCode(demoCode));
}

/**
 * Confirm a Razorpay payment was actually captured — the server-side gate for
 * cost-incurring features (e.g. the AI photoshoot generator) so real money
 * changed hands before we spend money calling an image-gen provider.
 *
 * We verify by payment id (not order id) because that is what the unlock flow
 * reliably stores client-side (unlockStore's unlockCode = razorpay_payment_id).
 *
 * - No Razorpay credentials configured (local dev): returns true, since there is
 *   no provider to check against and the feature is dormant anyway.
 * - Credentials set: returns true only when the payment status is "captured".
 * - Any error / non-captured status: fails CLOSED (false). Unlike page-load
 *   unlock re-checks, this path spends money, so a transient failure must block
 *   rather than open a cost hole; the caller can retry.
 */
export async function verifyRazorpayPaymentCaptured(paymentId: string): Promise<boolean> {
  const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) return true;
  if (!paymentId) return false;
  try {
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
    const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!res.ok) return false;
    const payment = await res.json();
    return payment?.status === "captured";
  } catch {
    return false;
  }
}
