"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getReferralStats } from "@/lib/storage/referralStore";
import { REFERRAL_REWARD_TIERS } from "@/types/referral";

export function ReferralProgress() {
  const stats = useMemo(() => getReferralStats(), []);

  if (!stats.hasProfile) return null;

  const { totalClaimsLocal, nextReward, claimsToNextReward, earnedRewards } = stats;

  const maxTier = REFERRAL_REWARD_TIERS[REFERRAL_REWARD_TIERS.length - 1];
  const progressPercent = Math.min((totalClaimsLocal / (maxTier?.claimsNeeded || 10)) * 100, 100);

  return (
    <Card className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[#1C1917]">Referral Progress</h3>
          <p className="mt-1 text-xs text-[#857b6e]">
            {totalClaimsLocal === 0
              ? "Share your link to start earning rewards"
              : `${totalClaimsLocal} friend${totalClaimsLocal !== 1 ? "s" : ""} have claimed so far`}
          </p>
        </div>
        <Link href="/dashboard">
          <Button size="sm" variant="secondary">View</Button>
        </Link>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] text-[#9c9184]">
          <span>0</span>
          <span>{maxTier?.claimsNeeded || 10}</span>
        </div>
        <div className="relative mt-1 h-2 overflow-hidden rounded-full bg-[#1c1917]/[0.04]">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
          {REFERRAL_REWARD_TIERS.map((tier) => (
            <div
              key={tier.claimsNeeded}
              className="absolute top-1/2 -translate-y-1/2"
              style={{ left: `${(tier.claimsNeeded / (maxTier?.claimsNeeded || 10)) * 100}%` }}
            >
              <div
                className={`h-3 w-0.5 ${
                  totalClaimsLocal >= tier.claimsNeeded ? "bg-emerald-400" : "bg-[#1c1917]/[0.06]"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Next reward */}
      {nextReward && (
        <div className="mt-4 rounded-lg border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.02] p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-[#9c9184]">Next reward in {claimsToNextReward} more</div>
              <div className="mt-0.5 text-xs text-[#1C1917]">{nextReward.reward}</div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-300">
              {nextReward.claimsNeeded}
            </div>
          </div>
        </div>
      )}

      {/* Earned rewards */}
      {earnedRewards.length > 0 && (
        <div className="mt-3 space-y-2">
          {earnedRewards.map((reward, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-emerald-400">
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {reward}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
