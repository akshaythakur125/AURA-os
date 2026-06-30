"use client";

import { useState } from "react";
import { recordReferralClaim } from "@/lib/storage/referralStore";
import { trackEvent } from "@/lib/storage/analyticsStore";

let didRun = false;

export function ReferralBanner() {
  const [referrer] = useState(() => {
    if (didRun || typeof window === "undefined") return null;
    didRun = true;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && ref.trim()) {
      recordReferralClaim(ref.trim(), "url");
      trackEvent("referral_claimed", { code: ref.trim(), source: "url" });
      return ref.trim();
    }
    return null;
  });

  if (!referrer) return null;

  return (
    <div className="border-b border-purple-500/15 bg-purple-500/5 py-2 text-center">
      <p className="text-xs text-purple-300">
        <span className="font-medium">Welcome!</span>{" "}
        <span className="text-gray-500">You were invited. Your referral helps the community grow.</span>
      </p>
    </div>
  );
}
