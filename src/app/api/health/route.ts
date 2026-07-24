import { NextResponse } from "next/server";

// ponytail: launch-readiness probe. Reports whether each revenue path and paid
// feature is actually wired in this environment — WITHOUT leaking secret values
// (only "set" / "missing"). Hit /api/health before going live: if a revenue
// path is "blocked", customers see a complete UI but no payment can complete.

export const dynamic = "force-dynamic";

function present(...keys: string[]): boolean {
  return keys.every((k) => Boolean(process.env[k] && String(process.env[k]).trim()));
}

export async function GET() {
  // ── Revenue path A: Razorpay instant checkout ──
  const razorpayReady = present("RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET");

  // ── Revenue path B: manual UPI + unlock code ──
  // Needs a real UPI id to collect payment AND a way to validate the code the
  // owner issues (static admin code OR a configured Supabase RPC).
  const upiReady = present("NEXT_PUBLIC_MANUAL_UPI_ID");
  const codeValidationReady =
    present("ADMIN_UNLOCK_CODE") ||
    present("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY");
  const manualReady = upiReady && codeValidationReady;

  // At least ONE full revenue path must work or the site cannot make money.
  const canMakeMoney = razorpayReady || manualReady;

  const revenue = {
    canMakeMoney,
    razorpay: {
      ready: razorpayReady,
      RAZORPAY_KEY_ID: present("RAZORPAY_KEY_ID") ? "set" : "missing",
      RAZORPAY_KEY_SECRET: present("RAZORPAY_KEY_SECRET") ? "set" : "missing",
    },
    manualUpi: {
      ready: manualReady,
      NEXT_PUBLIC_MANUAL_UPI_ID: present("NEXT_PUBLIC_MANUAL_UPI_ID") ? "set" : "missing",
      codeValidation: codeValidationReady ? "set" : "missing (need ADMIN_UNLOCK_CODE or Supabase)",
    },
  };

  // ── Paid-feature value dependencies (not blockers, but "value for money") ──
  const features = {
    nearbySalons: present("GOOGLE_MAPS_API_KEY") ? "set" : "missing",
    entitlementSync: present("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY")
      ? "set"
      : "missing",
    supportEmail: present("NEXT_PUBLIC_SUPPORT_EMAIL") ? "set" : "using default",
    ownerWhatsApp: present("NEXT_PUBLIC_OWNER_WHATSAPP") ? "set" : "missing",
  };

  const body = {
    status: canMakeMoney ? "ok" : "revenue-blocked",
    timestamp: new Date().toISOString(),
    node: process.version,
    revenue,
    features,
  };

  // 503 if NEITHER revenue path works — this is a hard launch blocker.
  return NextResponse.json(body, { status: canMakeMoney ? 200 : 503 });
}
