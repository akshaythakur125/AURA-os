export interface FunnelEvent {
  id: string;
  eventName: string;
  anonymousId: string;
  userId?: string;
  sessionId: string;
  auditId?: string;
  orderId?: string;
  productType?: string;
  sourcePage?: string;
  landingPage?: string;
  referrer?: string;
  utmSource?: string;
  utmCampaign?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface FunnelStep {
  name: string;
  count: number;
  conversionRate: number | null;
}

export interface ProductFunnel {
  productType: string;
  paywallViews: number;
  unlockStarts: number;
  paymentStarts: number;
  paymentSuccess: number;
  unlocks: number;
  revenue: number;
  conversionRate: number;
}

export interface CommerceFunnel {
  wardrobePageViews: number;
  searchResultViews: number;
  productClicks: number;
  affiliateClickouts: number;
  savedProducts: number;
  estimatedGMV: number;
  estimatedAffiliateRevenue: number;
}

export interface SeoFunnel {
  seoPageViews: number;
  ctaClicks: number;
  auditStarts: number;
  wardrobeSearches: number;
  commerceClickouts: number;
  revenue: number;
}

export interface FunnelLeak {
  stage: string;
  dropoffCount: number;
  dropoffPercent: number;
  suggestion: string;
}
