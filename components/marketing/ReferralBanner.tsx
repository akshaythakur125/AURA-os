"use client";

import { useEffect, useRef } from "react";
import { recordReferralClaim } from "@/lib/storage/referralStore";
import { trackEvent } from "@/lib/storage/analyticsStore";

export function ReferralBanner() {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && ref.trim()) {
      recordReferralClaim(ref.trim(), "url");
      trackEvent("referral_claimed", { code: ref.trim(), source: "url" });
      tracked.current = true;
    }
  }, []);

  return null;
}
