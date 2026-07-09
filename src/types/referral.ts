export interface ReferralProfile {
  referralCode: string;
  displayName?: string;
  createdAt: string;
  totalInvitesLocal: number;
  totalClaimsLocal: number;
}

export interface ReferralClaim {
  id: string;
  referralCode: string;
  source?: string;
  claimedAt: string;
}

export interface ReferralShareData {
  referralCode: string;
  shareUrl: string;
  shareText: string;
  title: string;
}

export interface ReferralRewardTier {
  claimsNeeded: number;
  reward: string;
  rewardType: "unlock" | "discount" | "badge";
  productType?: string;
  discountPercent?: number;
}

export const REFERRAL_REWARD_TIERS: ReferralRewardTier[] = [
  { claimsNeeded: 1, reward: "Your friend gets 20% off their first unlock", rewardType: "discount", discountPercent: 20 },
  { claimsNeeded: 3, reward: "You unlock a Free Full Report", rewardType: "unlock", productType: "aura_report" },
  { claimsNeeded: 5, reward: "You unlock a Dating Audit", rewardType: "unlock", productType: "dating_audit" },
  { claimsNeeded: 10, reward: "You unlock a Glow-Up Plan", rewardType: "unlock", productType: "glowup_plan" },
];

export const FRIEND_DISCOUNT_CODE = "FRIEND20";

export interface ReferralStats {
  hasProfile: boolean;
  referralCode: string;
  displayName: string | null;
  totalInvitesLocal: number;
  totalClaimsLocal: number;
  createdAt: string | null;
  nextReward: ReferralRewardTier | null;
  claimsToNextReward: number;
  earnedRewards: string[];
}
