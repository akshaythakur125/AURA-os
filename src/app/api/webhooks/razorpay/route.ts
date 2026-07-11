import crypto from "crypto";
import { NextResponse } from "next/server";
import { finalizeOrder } from "@/lib/billing/orders";

// ponytail: Razorpay webhook handler — verifies signature, processes payment events
// No database yet — logs events and returns 200. Add DB when Supabase schema is ready.

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return false;
  const expected = crypto.createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex");
  return expected === signature;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";

  // Verify signature
  if (WEBHOOK_SECRET && !verifyWebhookSignature(rawBody, signature)) {
    console.error("[webhook] Invalid Razorpay webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event: string; payload?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event: eventType, payload } = event;

  // ponytail: idempotent — same event logged once, no side effects yet
  // When DB is ready: upsert by provider event ID, finalize order, create entitlement
  // Safe logging — extract payment entity safely
  const pe = payload && typeof payload === "object" && "payment" in payload
    ? (payload as Record<string, unknown>).payment
    : null;
  const entity = pe && typeof pe === "object" && "entity" in pe
    ? (pe as Record<string, unknown>).entity
    : null;
  const payData = entity && typeof entity === "object" ? entity as Record<string, unknown> : null;
  console.info(`[webhook] ${eventType}`, JSON.stringify({
    orderId: payData?.order_id,
    paymentId: payData?.id,
    amount: payData?.amount,
  }));

  // Handle payment events
  switch (eventType) {
    case "payment.authorized":
    case "payment.captured": {
      // ponytail: finalize order + create entitlement via billing lib (Supabase when configured)
      const pe = payData;
      if (pe?.order_id && pe?.id) {
        await finalizeOrder(pe.order_id as string, pe.id as string);
      }
      break;
    }
    case "payment.failed":
      // Mark order as failed
      break;
    case "refund.created":
    case "refund.processed":
      // Update entitlement status
      break;
    default:
      // Unknown event — acknowledge but no action
      break;
  }

  return NextResponse.json({ status: "ok" });
}
