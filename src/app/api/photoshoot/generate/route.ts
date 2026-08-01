import { generatePortraits, photoshootConfigured } from "@/lib/photoshoot/imageGenClient";
import { getPhotoshootStyle } from "@/lib/photoshoot/stylePresets";
import { isAdminUnlockCode, verifyRazorpayOrderPaid } from "@/lib/payments/serverUnlock";

export const dynamic = "force-dynamic";

/**
 * AI Glow-Up Photoshoot generator.
 *
 * This is the one route on the site that spends real money per call (an external
 * image-gen provider), so it is gated harder than the free features:
 *   - dormant until a provider key is set (503 not_configured),
 *   - global kill-switch via PHOTOSHOOT_DISABLED (503 disabled),
 *   - requires a PAID Razorpay order (or the admin unlock code) — 402 otherwise,
 *   - explicit consent flag (the buyer's photo leaves the device to the provider),
 *   - per-IP rate limit, and bounded input size / image count.
 */

const RATE_LIMIT = 12; // generations …
const RATE_WINDOW_MS = 60 * 60 * 1000; // … per hour per IP
const MAX_IMAGE_CHARS = 12_000_000; // ~9MB decoded — one reference selfie
const DEFAULT_COUNT = 4;
const MAX_COUNT = 6;

const hits = new Map<string, { count: number; resetAt: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now > rec.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  rec.count++;
  return rec.count > RATE_LIMIT;
}

export async function POST(request: Request) {
  if (process.env.PHOTOSHOOT_DISABLED === "1") {
    return Response.json({ error: "disabled" }, { status: 503 });
  }
  if (!photoshootConfigured()) {
    // No provider key — the product is dormant and nothing is billed.
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (rateLimited(ip)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: {
    image?: string;
    styleId?: string;
    aesthetic?: string;
    count?: number;
    consent?: boolean;
    orderId?: string;
    code?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  // Consent is mandatory — the reference photo is sent to an external provider.
  if (body.consent !== true) {
    return Response.json({ error: "consent_required" }, { status: 400 });
  }

  const image = typeof body.image === "string" ? body.image : "";
  if (!image || !/^data:image\/|^https?:\/\//.test(image)) {
    return Response.json({ error: "image_required" }, { status: 400 });
  }
  if (image.length > MAX_IMAGE_CHARS) {
    return Response.json({ error: "image_too_large" }, { status: 413 });
  }

  const style = getPhotoshootStyle(body.styleId || "");
  if (!style) {
    return Response.json({ error: "invalid_style" }, { status: 400 });
  }

  // Payment gate: a real paid order, or the founder's admin code.
  const admin = typeof body.code === "string" && isAdminUnlockCode(body.code);
  if (!admin) {
    const paid = await verifyRazorpayOrderPaid(body.orderId || "");
    if (!paid) {
      return Response.json({ error: "payment_required" }, { status: 402 });
    }
  }

  const count = Math.min(Math.max(1, Math.floor(body.count ?? DEFAULT_COUNT)), MAX_COUNT);
  const prompt = style.buildPrompt(body.aesthetic);

  const images = await generatePortraits({ image, prompt, count });
  if (!images) {
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }

  return Response.json({ images, styleId: style.id });
}
