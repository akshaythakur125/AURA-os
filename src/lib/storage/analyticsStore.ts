import type { ProductType } from "@/types/payment";
import { createLocalId } from "@/types/audit";
import { getItem, setItem } from "./localStore";
import { STORAGE_KEYS } from "./storageKeys";

export interface AnalyticsEvent {
  id: string;
  eventName: string;
  auditId?: string;
  productType?: ProductType;
  metadata?: Record<string, string>;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalEvents: number;
  auditCreated: number;
  freeScoreGenerated: number;
  unlockPageViewed: number;
  paymentRequestSaved: number;
  productUnlocked: number;
  shareCardDownloaded: number;
  affiliateClicked: number;
  reportPrinted: number;
  referralLinkCopied: number;
  referralShared: number;
  referralClaimed: number;
  challengeViewed: number;
  challengeEntered: number;
  progressComparisonCreated: number;
  pwaInstallPageViewed: number;
  leadCreated: number;
  offerApplied: number;
  conversionEstimate: {
    paymentRequestsPerFreeScore: number | null;
    unlocksPerPaymentRequest: number | null;
  };
}

function getAll(): AnalyticsEvent[] {
  return getItem<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS, []);
}

function persist(events: AnalyticsEvent[]): void {
  setItem(STORAGE_KEYS.ANALYTICS, events);
}

export function trackEvent(input: {
  eventName: string;
  auditId?: string;
  productType?: ProductType;
  metadata?: Record<string, string>;
}): AnalyticsEvent {
  const event: AnalyticsEvent = {
    id: createLocalId(),
    eventName: input.eventName,
    auditId: input.auditId,
    productType: input.productType,
    metadata: input.metadata,
    createdAt: new Date().toISOString(),
  };
  const events = getAll();
  events.push(event);
  persist(events);
  return event;
}

export function getEvents(): AnalyticsEvent[] {
  return getAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const events = getAll();

  const auditCreated = events.filter((e) => e.eventName === "audit_created").length;
  const freeScoreGenerated = events.filter((e) => e.eventName === "free_score_generated").length;
  const unlockPageViewed = events.filter((e) => e.eventName === "unlock_page_viewed").length;
  const paymentRequestSaved = events.filter((e) => e.eventName === "payment_request_saved").length;
  const productUnlocked = events.filter((e) => e.eventName === "product_unlocked").length;
  const shareCardDownloaded = events.filter((e) => e.eventName === "share_card_downloaded").length;
  const affiliateClicked = events.filter((e) => e.eventName === "affiliate_clicked").length;
  const reportPrinted = events.filter((e) => e.eventName === "report_printed").length;
  const referralLinkCopied = events.filter((e) => e.eventName === "referral_link_copied").length;
  const referralShared = events.filter((e) => e.eventName === "referral_shared").length;
  const referralClaimed = events.filter((e) => e.eventName === "referral_claimed").length;
  const challengeViewed = events.filter((e) => e.eventName === "challenge_viewed").length;
  const challengeEntered = events.filter((e) => e.eventName === "challenge_entered").length;
  const progressComparisonCreated = events.filter((e) => e.eventName === "progress_comparison_created").length;
  const pwaInstallPageViewed = events.filter((e) => e.eventName === "pwa_install_page_viewed").length;
  const leadCreated = events.filter((e) => e.eventName === "lead_created").length;
  const offerApplied = events.filter((e) => e.eventName === "offer_applied").length;

  return {
    totalEvents: events.length,
    auditCreated,
    freeScoreGenerated,
    unlockPageViewed,
    paymentRequestSaved,
    productUnlocked,
    shareCardDownloaded,
    affiliateClicked,
    reportPrinted,
    referralLinkCopied,
    referralShared,
    referralClaimed,
    challengeViewed,
    challengeEntered,
    progressComparisonCreated,
    pwaInstallPageViewed,
    leadCreated,
    offerApplied,
    conversionEstimate: {
      paymentRequestsPerFreeScore:
        freeScoreGenerated > 0
          ? Math.round((paymentRequestSaved / freeScoreGenerated) * 100) / 100
          : null,
      unlocksPerPaymentRequest:
        paymentRequestSaved > 0
          ? Math.round((productUnlocked / paymentRequestSaved) * 100) / 100
          : null,
    },
  };
}

export function clearAnalytics(): void {
  setItem(STORAGE_KEYS.ANALYTICS, []);
}
