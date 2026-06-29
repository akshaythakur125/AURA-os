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
  hasProfile: boolean;
  referralCode: string;
  displayName: string | null;
  totalInvitesLocal: number;
  totalClaimsLocal: number;
  createdAt: string | null;
}
