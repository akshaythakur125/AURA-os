export type ClearTarget =
  | "all"
  | "audits"
  | "orders"
  | "analytics"
  | "leads"
  | "referral"
  | "challenges"
  | "progress"
  | "preferences"
  | "onboarding"
  | "founder";

const CLEAR_MAP: Record<ClearTarget, string[]> = {
  all: [
    "auracheck:v1:audits",
    "auracheck:v1:orders",
    "auracheck:v1:unlocks",
    "auracheck:v1:leads",
    "auracheck:v1:referral_profile",
    "auracheck:v1:referral_claims",
    "auracheck:v1:challenge_entries",
    "auracheck:v1:progress_comparisons",
    "auracheck:v1:analytics",
    "auracheck:v1:affiliate_clicks",
    "auracheck:v1:user_preferences",
    "auracheck:v1:onboarding",
    "auracheck:v1:founder_checklist",
  ],
  audits: ["auracheck:v1:audits", "auracheck:v1:unlocks"],
  orders: ["auracheck:v1:orders"],
  analytics: ["auracheck:v1:analytics", "auracheck:v1:affiliate_clicks"],
  leads: ["auracheck:v1:leads"],
  referral: ["auracheck:v1:referral_profile", "auracheck:v1:referral_claims"],
  challenges: ["auracheck:v1:challenge_entries"],
  progress: ["auracheck:v1:progress_comparisons"],
  preferences: ["auracheck:v1:user_preferences"],
  onboarding: ["auracheck:v1:onboarding"],
  founder: ["auracheck:v1:founder_checklist"],
};

export function clearLocalData(target: ClearTarget): { cleared: number } {
  if (typeof window === "undefined") return { cleared: 0 };
  const keys = CLEAR_MAP[target];
  let cleared = 0;
  for (const key of keys) {
    try {
      localStorage.removeItem(key);
      cleared++;
    } catch {
      // skip
    }
  }
  return { cleared };
}
