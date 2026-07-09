export interface RevenueAttribution {
  orderId: string;
  productType: string;
  amount: number;
  paymentMethod: "razorpay" | "manual_upi" | "admin_code";
  verificationMethod: "razorpay_signature" | "admin_unlock" | "manual_review";
  anonymousId: string;
  userId?: string;
  firstTouchSource: string;
  lastTouchSource: string;
  landingPage: string;
  conversionPage: string;
  auditId?: string;
  createdAt: string;
}

export interface RevenueSummary {
  totalRevenue: number;
  byProduct: Record<string, number>;
  bySource: Record<string, number>;
  byLandingPage: Record<string, number>;
  byCampaign: Record<string, number>;
  byPaymentMethod: Record<string, number>;
  razorpayRevenue: number;
  manualRevenue: number;
  verifiedRevenue: number;
  pendingRevenue: number;
  estimatedAffiliateRevenue: number;
  totalOrders: number;
  successfulOrders: number;
}

export interface ConversionMetrics {
  overall: {
    visitors: number;
    audits: number;
    freeScores: number;
    paywallViews: number;
    checkoutStarts: number;
    payments: number;
    unlocks: number;
  };
  rates: {
    auditToFreeScore: number;
    freeScoreToPaywall: number;
    paywallToCheckout: number;
    checkoutToPayment: number;
    paymentToUnlock: number;
    visitorToUnlock: number;
  };
}
