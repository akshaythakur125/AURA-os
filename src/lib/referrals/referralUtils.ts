export function generateReferralCode(displayName?: string): string {
  const prefix = displayName
    ? displayName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase()
    : "AURA";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}${suffix}`;
}

export function buildReferralUrl(referralCode: string): string {
  if (typeof window === "undefined") return `/?ref=${referralCode}`;
  const base = window.location.origin;
  return `${base}/?ref=${referralCode}`;
}

export function buildReferralShareText(referralCode: string): string {
  const url = buildReferralUrl(referralCode);
  return `Check your Aura Score — find out what your photo says about your first impression. Free, no login.\n\n${url}`;
}

export function parseReferralFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("ref");
}

export function normalizeReferralCode(code: string): string {
  return code.trim().toUpperCase();
}
