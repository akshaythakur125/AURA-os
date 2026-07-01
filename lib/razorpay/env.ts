export function isRazorpayConfigured(): boolean {
  if (typeof process === "undefined") return false;
  return !!(
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET
  );
}

export function getPublicRazorpayKeyId(): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || undefined;
}

export function getRazorpayKeyId(): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env.RAZORPAY_KEY_ID || undefined;
}

export function getRazorpaySecret(): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env.RAZORPAY_KEY_SECRET || undefined;
}
