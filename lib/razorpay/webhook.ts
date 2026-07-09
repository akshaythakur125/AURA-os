import crypto from "crypto";

export function isRazorpayWebhookConfigured(): boolean {
  if (typeof process === "undefined") return false;
  return !!process.env.RAZORPAY_WEBHOOK_SECRET;
}

export function getRazorpayWebhookSecret(): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env.RAZORPAY_WEBHOOK_SECRET || undefined;
}

/**
 * Verify Razorpay webhook HMAC SHA256 signature.
 * The expected signature is computed over the raw request body
 * using RAZORPAY_WEBHOOK_SECRET as the HMAC key.
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const secret = getRazorpayWebhookSecret();
  if (!secret) return false;
  if (!rawBody || !signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  try {
    // Use timing-safe comparison
    const expectedBuffer = Buffer.from(expectedSignature);
    const actualBuffer = Buffer.from(signature);
    if (expectedBuffer.length !== actualBuffer.length) return false;

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch {
    return false;
  }
}

export interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        [key: string]: unknown;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        [key: string]: unknown;
      };
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function parseRazorpayWebhookEvent(rawBody: string): RazorpayWebhookPayload {
  return JSON.parse(rawBody) as RazorpayWebhookPayload;
}
