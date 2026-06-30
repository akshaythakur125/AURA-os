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

export interface ReferralStats {
  totalInvitesLocal: number;
  totalClaimsLocal: number;
  claimRate: number;
}
