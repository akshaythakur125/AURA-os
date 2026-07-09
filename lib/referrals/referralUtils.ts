import { updateReferralProfile, getReferralProfile } from "@/lib/storage/referralStore";
import type { ReferralShareData } from "@/types/referral";

export function getShareUrl(referralCode: string): string {
  if (typeof window === "undefined") return `/?ref=${referralCode}`;
  const base = window.location.origin;
  return `${base}/?ref=${referralCode}`;
}

export function getShareText(referralCode: string): string {
  const url = getShareUrl(referralCode);
  return `Check your Aura Score for free — no signup needed. Find your biggest status leak in 2 minutes. ${url}`;
}

export function getShareData(referralCode: string): ReferralShareData {
  return {
    referralCode,
    shareUrl: getShareUrl(referralCode),
    shareText: getShareText(referralCode),
    title: "AuraCheck — Find Your Biggest Status Leak",
  };
}

export function incrementInviteCount(): void {
  const profile = getReferralProfile();
  if (profile) {
    updateReferralProfile({ totalInvitesLocal: profile.totalInvitesLocal + 1 });
  }
}

export function copyInviteLink(referralCode: string): Promise<void> {
  const url = getShareUrl(referralCode);
  return navigator.clipboard.writeText(url);
}

export function copyInviteMessage(referralCode: string): Promise<void> {
  return navigator.clipboard.writeText(getShareText(referralCode));
}

export function nativeShare(referralCode: string): Promise<void> {
  const data = getShareData(referralCode);
  if (typeof navigator !== "undefined" && navigator.share) {
    return navigator.share({ title: data.title, text: data.shareText, url: data.shareUrl });
  }
  return Promise.reject(new Error("Share not available"));
}
