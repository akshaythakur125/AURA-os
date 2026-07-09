import { getItem, setItem } from "@/lib/storage/localStore";
import type { ReferralProfile, ReferralClaim, ReferralStats } from "@/types/referral";

const PROFILE_KEY = "auracheck:v1:referral_profile";
const CLAIMS_KEY = "auracheck:v1:referral_claims";

function generateReferralCode(): string {
  const prefix = "AURA";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 5; i++) suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  return `${prefix}${suffix}`;
}

export function getReferralProfile(): ReferralProfile | null {
  return getItem<ReferralProfile | null>(PROFILE_KEY, null);
}

export function createReferralProfile(displayName?: string): ReferralProfile {
  const profile: ReferralProfile = {
    referralCode: generateReferralCode(),
    displayName,
    createdAt: new Date().toISOString(),
    totalInvitesLocal: 0,
    totalClaimsLocal: 0,
  };
  setItem(PROFILE_KEY, profile);
  return profile;
}

export function getOrCreateReferralProfile(displayName?: string): ReferralProfile {
  const existing = getReferralProfile();
  if (existing) return existing;
  return createReferralProfile(displayName);
}

export function updateReferralProfile(updates: Partial<ReferralProfile>): ReferralProfile | null {
  const current = getReferralProfile();
  if (!current) return null;
  const updated = { ...current, ...updates };
  setItem(PROFILE_KEY, updated);
  return updated;
}

export function getReferralClaims(): ReferralClaim[] {
  return getItem<ReferralClaim[]>(CLAIMS_KEY, []);
}

export function recordReferralClaim(referralCode: string, source?: string): ReferralClaim {
  const claim: ReferralClaim = {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    referralCode,
    source,
    claimedAt: new Date().toISOString(),
  };
  const claims = getReferralClaims();
  claims.unshift(claim);
  setItem(CLAIMS_KEY, claims);

  const profile = getReferralProfile();
  if (profile && profile.referralCode === referralCode) {
    updateReferralProfile({ totalClaimsLocal: profile.totalClaimsLocal + 1 });
  }

  return claim;
}

export function getReferralStats(): ReferralStats {
  const profile = getReferralProfile();
  const claims = getReferralClaims();
  return {
    totalInvitesLocal: profile?.totalInvitesLocal ?? 0,
    totalClaimsLocal: profile?.totalClaimsLocal ?? 0,
    claimRate: (profile?.totalInvitesLocal ?? 0) > 0
      ? ((profile?.totalClaimsLocal ?? 0) / (profile?.totalInvitesLocal ?? 1)) * 100
      : 0,
  };
}

export function clearReferralData(): void {
  setItem(PROFILE_KEY, null);
  setItem(CLAIMS_KEY, []);
}

export function hasReferralEarnedFreeFix(): boolean {
  const profile = getReferralProfile();
  if (!profile) return false;
  const claims = getReferralClaims();
  const myClaims = claims.filter((c) => c.referralCode === profile.referralCode);
  return myClaims.length >= 3;
}

export function getReferralClaimsCount(): number {
  const profile = getReferralProfile();
  if (!profile) return 0;
  return getReferralClaims().filter((c) => c.referralCode === profile.referralCode).length;
}
