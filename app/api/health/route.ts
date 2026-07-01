import { NextResponse } from "next/server";
import { isSupabaseConfigured, getStorageMode } from "@/lib/storage/storageMode";
import { isRazorpayConfigured } from "@/lib/razorpay/env";
import { isRazorpayWebhookConfigured } from "@/lib/razorpay/webhook";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseConfigured = isSupabaseConfigured();
  const razorpayConfigured = isRazorpayConfigured();
  const razorpayWebhookConfigured = isRazorpayWebhookConfigured();
  const storageMode = getStorageMode();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const refreshSecret = !!process.env.COMMERCE_REFRESH_SECRET;
  const affiliateDisclosure = process.env.NEXT_PUBLIC_AFFILIATE_DISCLOSURE_ENABLED !== "false";

  return NextResponse.json(
    {
      status: "ok",
      app: "AuraCheck",
      appVersion: process.env.npm_package_version || "0.1.0",
      storageMode,
      supabaseConfigured,
      razorpayConfigured,
      razorpayWebhookConfigured,
      commerceRefreshConfigured: refreshSecret,
      affiliateDisclosureEnabled: affiliateDisclosure,
      timestamp: new Date().toISOString(),
      appUrl,
    },
    { status: 200 }
  );
}
