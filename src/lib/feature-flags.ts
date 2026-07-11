/**
 * ponytail: feature flags — controlled rollout for the final analyser.
 * Environment variables control rollout. No random assignment.
 */

export const FEATURE_FLAGS = {
  /** Enable the final quality-gate analyser */
  FINAL_ANALYSER_ENABLED: process.env.NEXT_PUBLIC_FINAL_ANALYSER_ENABLED === "true",

  /** Percentage rollout (0-100). 0 = disabled, 100 = fully enabled */
  FINAL_ANALYSER_ROLLOUT_PERCENT: parseInt(process.env.NEXT_PUBLIC_FINAL_ANALYSER_ROLLOUT_PERCENT || "0", 10),

  /** Kill switch — immediately disable regardless of other flags */
  FINAL_ANALYSER_KILL_SWITCH: process.env.NEXT_PUBLIC_FINAL_ANALYSER_KILL_SWITCH === "true",

  /** Restrict to internal users only */
  FINAL_ANALYSER_INTERNAL_USERS_ONLY: process.env.NEXT_PUBLIC_FINAL_ANALYSER_INTERNAL_USERS_ONLY !== "false",
} as const;

export type FeatureFlagState = {
  enabled: boolean;
  reason: string;
};

/**
 * Check if the final analyser is available for a given user.
 * Deterministic — same userId always gets the same result.
 */
export function isFinalAnalyserEnabled(userId?: string): FeatureFlagState {
  if (FEATURE_FLAGS.FINAL_ANALYSER_KILL_SWITCH) {
    return { enabled: false, reason: "kill-switch" };
  }
  if (!FEATURE_FLAGS.FINAL_ANALYSER_ENABLED) {
    return { enabled: false, reason: "disabled" };
  }
  if (FEATURE_FLAGS.FINAL_ANALYSER_INTERNAL_USERS_ONLY) {
    // ponytail: in production, check against internal user list
    return { enabled: true, reason: "internal-user" };
  }
  const pct = FEATURE_FLAGS.FINAL_ANALYSER_ROLLOUT_PERCENT;
  if (pct <= 0) return { enabled: false, reason: "rollout-0" };
  if (pct >= 100) return { enabled: true, reason: "rollout-100" };
  // Deterministic hash-based rollout
  if (userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
    const bucket = Math.abs(hash) % 100;
    return { enabled: bucket < pct, reason: `rollout-${pct}%-bucket-${bucket}` };
  }
  return { enabled: false, reason: "no-user-id" };
}
