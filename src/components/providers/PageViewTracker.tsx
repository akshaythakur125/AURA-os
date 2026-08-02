"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent, EVENTS } from "@/lib/analytics/events";

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const attribution = Object.fromEntries(
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"]
        .map((key) => [key, searchParams.get(key)])
        .filter(([, value]) => value),
    );
    if (Object.keys(attribution).length > 0) {
      localStorage.setItem("auracheck_attribution", JSON.stringify(attribution));
    }
    trackEvent(EVENTS.PAGE_LANDING, { path: pathname, ...attribution });
  }, [pathname]);

  return null;
}
