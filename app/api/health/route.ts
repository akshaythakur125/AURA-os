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

  // Determine host mode
  let hostMode = "unknown";
  try {
    const url = new URL(appUrl);
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") hostMode = "local";
    else if (host.includes("vercel.app")) hostMode = "preview";
    else if (host.includes("fixmyaura.shop")) hostMode = "production";
    else hostMode = "custom";
  } catch { hostMode = "unknown"; }

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
      hostMode,
      timestamp: new Date().toISOString(),
      appUrl,
    },
    { status: 200 }
  );
}
