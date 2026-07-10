"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let _initialized = false;

export function initPostHog(): void {
  if (_initialized || !POSTHOG_KEY || typeof window === "undefined") return;
  _initialized = true;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: false,
    persistence: "localStorage+cookie",
  });
}

export function posthogIdentify(anonymousId: string, properties?: Record<string, unknown>): void {
  if (!_initialized) return;
  posthog.identify(anonymousId, properties);
}

export function posthogCapture(event: string, properties?: Record<string, unknown>): void {
  if (!_initialized) return;
  posthog.capture(event, properties);
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return <>{children}</>;
}
