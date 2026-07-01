export interface AttributionData {
  firstTouch: TouchPoint | null;
  lastTouch: TouchPoint | null;
  sessionId: string;
  anonymousId: string;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface TouchPoint {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  ref?: string;
  landingPage: string;
  referrer?: string;
  timestamp: string;
}

export interface SourceBreakdown {
  source: string;
  visitors: number;
  audits: number;
  freeScores: number;
  unlocks: number;
  revenue: number;
  conversionRate: number;
}
