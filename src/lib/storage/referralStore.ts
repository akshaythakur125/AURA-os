import type { ReferralProfile, ReferralClaim, ReferralStats, ReferralRewardTier } from "@/types/referral";
import { REFERRAL_REWARD_TIERS, FRIEND_DISCOUNT_CODE } from "@/types/referral";
import { createLocalId } from "@/types/audit";
import { getItem, setItem } from "./localStore";

const PROFILE_KEY = "auracheck:v1:referral_profile";
const CLAIMS_KEY = "auracheck:v1:referral_claims";

function getProfile(): ReferralProfile | null {
  return getItem<ReferralProfile | null>(PROFILE_KEY, null);
}

function setProfile(profile: ReferralProfile): void {
  setItem(PROFILE_KEY, profile);
}

function getClaims(): ReferralClaim[] {
  return getItem<ReferralClaim[]>(CLAIMS_KEY, []);
}

function setClaims(claims: ReferralClaim[]): void {
  setItem(CLAIMS_KEY, claims);
}

export function getReferralProfile(): ReferralProfile | null {
  return getProfile();
}

export function createReferralProfile(displayName?: string): ReferralProfile {
  const code = generateCode(displayName);
  const profile: ReferralProfile = {
    referralCode: code,
    displayName: displayName || undefined,
    createdAt: new Date().toISOString(),
    totalInvitesLocal: 0,
    totalClaimsLocal: 0,
  };
  setProfile(profile);
  return profile;
}

export function getOrCreateReferralProfile(displayName?: string): ReferralProfile {
  const existing = getProfile();
  if (existing) return existing;
  return createReferralProfile(displayName);
}

export function updateReferralProfile(updates: Partial<ReferralProfile>): ReferralProfile | null {
  const profile = getProfile();
  if (!profile) return null;
  const updated = { ...profile, ...updates };
  setProfile(updated);
  return updated;
}

export function getReferralClaims(): ReferralClaim[] {
  return getClaims().sort(
    (a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime()
  );
}

export function recordReferralClaim(referralCode: string, source?: string): ReferralClaim {
  const claim: ReferralClaim = {
    id: createLocalId(),
    referralCode,
    source: source || undefined,
    claimedAt: new Date().toISOString(),
  };
  const claims = getClaims();
  claims.push(claim);
  setClaims(claims);

  const profile = getProfile();
  if (profile) {
    profile.totalClaimsLocal = claims.filter((c) => c.referralCode === referralCode).length;
    setProfile(profile);
  }

  return claim;
}

export function getReferralStats(): ReferralStats {
  const profile = getProfile();
  const claims = getClaims();
  const totalClaims = claims.length;

  const earnedRewards: string[] = [];
  let nextReward: ReferralRewardTier | null = null;
  let claimsToNextReward = 0;

  for (const tier of REFERRAL_REWARD_TIERS) {
    if (totalClaims >= tier.claimsNeeded) {
      earnedRewards.push(tier.reward);
    } else if (!nextReward) {
      nextReward = tier;
      claimsToNextReward = tier.claimsNeeded - totalClaims;
    }
  }

  return {
    hasProfile: !!profile,
    referralCode: profile?.referralCode || "",
    displayName: profile?.displayName || null,
    totalInvitesLocal: profile?.totalInvitesLocal ?? 0,
    totalClaimsLocal: totalClaims,
    createdAt: profile?.createdAt || null,
    nextReward,
    claimsToNextReward,
    earnedRewards,
  };
}

export function getFriendDiscountCode(): string {
  return FRIEND_DISCOUNT_CODE;
}

export function clearReferralData(): void {
  setItem(PROFILE_KEY, null);
  setItem(CLAIMS_KEY, []);
}

function generateCode(displayName?: string): string {
  const prefix = displayName
    ? displayName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase()
    : "AURA";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}${suffix}`;
}
