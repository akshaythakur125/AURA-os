"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent, EVENTS } from "@/lib/analytics/events";

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent(EVENTS.PAGE_LANDING, { path: pathname });
  }, [pathname]);

  return null;
}
