"use client";

import type { RevenueAttribution, RevenueSummary } from "@/types/revenueAnalytics";
import { getAnonymousId } from "@/lib/identity/anonymousId";
import { getFirstTouchSource, getLastTouchSource, getLandingPage } from "./sourceTracking";
import { getItem, setItem } from "@/lib/storage/localStore";

const REVENUE_KEY = "auracheck:v1:revenue_attribution";

export function recordRevenue(params: {
  orderId: string;
  productType: string;
  amount: number;
  paymentMethod: "razorpay" | "manual_upi" | "admin_code";
  verificationMethod: "razorpay_signature" | "admin_unlock" | "manual_review";
  auditId?: string;
  conversionPage?: string;
}): void {
  if (typeof window === "undefined") return;

  const record: RevenueAttribution = {
    orderId: params.orderId,
    productType: params.productType,
    amount: params.amount,
    paymentMethod: params.paymentMethod,
    verificationMethod: params.verificationMethod,
    anonymousId: getAnonymousId(),
    firstTouchSource: getFirstTouchSource(),
    lastTouchSource: getLastTouchSource(),
    landingPage: getLandingPage(),
    conversionPage: params.conversionPage || window.location.pathname,
    auditId: params.auditId,
    createdAt: new Date().toISOString(),
  };

  const records = getRevenueRecords();
  records.push(record);
  setItem(REVENUE_KEY, records.slice(-200));
}

export function getRevenueRecords(): RevenueAttribution[] {
  if (typeof window === "undefined") return [];
  return getItem<RevenueAttribution[]>(REVENUE_KEY, []);
}

export function getRevenueSummary(): RevenueSummary {
  const records = getRevenueRecords();
  const byProduct: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const byLandingPage: Record<string, number> = {};
  const byCampaign: Record<string, number> = {};
  const byPaymentMethod: Record<string, number> = {};

  let totalRevenue = 0;
  let razorpayRevenue = 0;
  let manualRevenue = 0;
  let verifiedRevenue = 0;

  for (const r of records) {
    totalRevenue += r.amount;
    byProduct[r.productType] = (byProduct[r.productType] || 0) + r.amount;
    bySource[r.firstTouchSource] = (bySource[r.firstTouchSource] || 0) + r.amount;
    byLandingPage[r.landingPage] = (byLandingPage[r.landingPage] || 0) + r.amount;

    if (r.paymentMethod === "razorpay") razorpayRevenue += r.amount;
    else manualRevenue += r.amount;

    if (r.verificationMethod !== "manual_review") verifiedRevenue += r.amount;
  }

  return {
    totalRevenue,
    byProduct,
    bySource,
    byLandingPage,
    byCampaign,
    byPaymentMethod,
    razorpayRevenue,
    manualRevenue,
    verifiedRevenue,
    pendingRevenue: records.filter((r) => r.verificationMethod === "manual_review").reduce((s, r) => s + r.amount, 0),
    estimatedAffiliateRevenue: Math.round(totalRevenue * 0.05),
    totalOrders: records.length,
    successfulOrders: records.filter((r) => r.verificationMethod !== "manual_review").length,
  };
}
