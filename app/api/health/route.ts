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
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return NextResponse.json(
    {
      status: "ok",
      app: "AuraCheck",
      storageMode,
      supabaseConfigured,
      razorpayConfigured,
      razorpayWebhookConfigured,
      storageBucketConfigured: supabaseConfigured,
      timestamp: new Date().toISOString(),
      appUrl,
    },
    { status: 200 }
  );
}
