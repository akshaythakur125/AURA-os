"use client";

import { getItem, setItem } from "@/lib/storage/localStore";

const SOURCE_KEY = "auracheck:v1:attribution";
const LANDING_KEY = "auracheck:v1:landing_page";

interface StoredAttribution {
  firstSource: string | null;
  firstCampaign: string | null;
  firstMedium: string | null;
  firstLandingPage: string | null;
  firstReferrer: string | null;
  lastSource: string | null;
  lastCampaign: string | null;
  lastMedium: string | null;
  lastLandingPage: string | null;
  lastReferrer: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
}

export function captureSourceParams(): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");
  const ref = params.get("ref");
  const landingPage = window.location.pathname;
  const referrer = document.referrer || undefined;

  const existing = getItem<StoredAttribution | null>(SOURCE_KEY, null);
  const now = new Date().toISOString();

  const touchValue = utmSource || ref || "direct";
  const campaignValue = utmCampaign || "";
  const mediumValue = utmMedium || "";

  if (!existing) {
    const attr: StoredAttribution = {
      firstSource: touchValue,
      firstCampaign: campaignValue,
      firstMedium: mediumValue,
      firstLandingPage: landingPage,
      firstReferrer: referrer || null,
      lastSource: touchValue,
      lastCampaign: campaignValue,
      lastMedium: mediumValue,
      lastLandingPage: landingPage,
      lastReferrer: referrer || null,
      firstSeenAt: now,
      lastSeenAt: now,
    };
    setItem(SOURCE_KEY, attr);
    setItem(LANDING_KEY, landingPage);
  } else {
    existing.lastSource = touchValue;
    existing.lastCampaign = campaignValue;
    existing.lastMedium = mediumValue;
    existing.lastLandingPage = landingPage;
    if (referrer) existing.lastReferrer = referrer;
    existing.lastSeenAt = now;
    setItem(SOURCE_KEY, existing);
  }
}

export function getAttribution(): StoredAttribution | null {
  if (typeof window === "undefined") return null;
  return getItem<StoredAttribution | null>(SOURCE_KEY, null);
}

export function getFirstTouchSource(): string {
  return getAttribution()?.firstSource || "direct";
}

export function getLastTouchSource(): string {
  return getAttribution()?.lastSource || "direct";
}

export function getLandingPage(): string {
  if (typeof window === "undefined") return "/";
  return getItem<string>(LANDING_KEY, "/");
}
