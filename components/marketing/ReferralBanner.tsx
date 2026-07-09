"use client";

import { useState, useEffect } from "react";
import { recordReferralClaim } from "@/lib/storage/referralStore";
import { trackEvent } from "@/lib/storage/analyticsStore";

let didRun = false;

export function ReferralBanner() {
  // Reading window.location.search and recording the claim can only happen
  // client-side, so this must start at null (matching the server) and
  // resolve inside an effect -- doing it in the useState initializer runs
  // during the client's first render too, before hydration reconciles
  // against the server's null-returning render, causing a mismatch on
  // every referral-link visit (the banner element itself is present vs
  // absent), plus it wrote the claim as a render side-effect.
  const [referrer, setReferrer] = useState<string | null>(null);

  useEffect(() => {
    if (didRun) return;
    didRun = true;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && ref.trim()) {
      recordReferralClaim(ref.trim(), "url");
      trackEvent("referral_claimed", { code: ref.trim(), source: "url" });
      setReferrer(ref.trim());
    }
  }, []);

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
