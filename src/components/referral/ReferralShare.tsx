"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getReferralStats, getFriendDiscountCode } from "@/lib/storage/referralStore";
import { buildReferralUrl } from "@/lib/referrals/referralUtils";
import { trackEvent, EVENTS } from "@/lib/analytics/events";

interface Props {
  auditId?: string;
  variant?: "inline" | "card";
}

export function ReferralShare({ auditId, variant = "card" }: Props) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const stats = useMemo(() => getReferralStats(), []);
  const discountCode = useMemo(() => getFriendDiscountCode(), []);

  useState(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  });

  if (!stats.hasProfile || !stats.referralCode) return null;

  const shareUrl = buildReferralUrl(stats.referralCode);
  const shareText = `I just got my Aura Score checked — find out what your photo says about your first impression. Use my link for 20% off your first unlock:\n\n${shareUrl}`;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "AuraCheck Referral", text: shareText, url: shareUrl });
        trackEvent(EVENTS.REFERRAL_SHARED, { referralCode: stats.referralCode });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      trackEvent(EVENTS.REFERRAL_LINK_COPIED, { referralCode: stats.referralCode });
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    trackEvent(EVENTS.REFERRAL_LINK_COPIED, { referralCode: stats.referralCode });
    setTimeout(() => setCopied(false), 2000);
  }

  if (variant === "inline") {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white">Share with friends</h4>
            <p className="mt-0.5 text-xs text-gray-500">
              They get <span className="text-amber-400">20% off</span> — you earn a free unlock at 3 claims
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleShare} className="flex-1">
            {canShare ? "Share" : "Copy Invite"}
          </Button>
          <Button size="sm" variant="secondary" onClick={handleCopyLink}>
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>
        <div className="text-[10px] text-gray-600">
          Code: <span className="font-mono text-gray-500">{discountCode}</span> auto-applied for friends
        </div>
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">Invite friends, earn unlocks</h3>
          <p className="mt-1 text-xs text-gray-400">
            Your friend gets <span className="text-amber-400">20% off</span> their first unlock. 
            At 3 claims, you get a free Full Report.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={handleShare}>
              {canShare ? "Share to Friends" : "Copy Invite"}
            </Button>
            <Button size="sm" variant="secondary" onClick={handleCopyLink}>
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-600">
            <span>Friend&apos;s discount code:</span>
            <span className="font-mono text-gray-500">{discountCode}</span>
            <span>(auto-applied)</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
