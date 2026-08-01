import { photoshootConfigured } from "@/lib/photoshoot/imageGenClient";

export const dynamic = "force-dynamic";

/**
 * Lightweight availability probe for the AI Glow-Up Photoshoot. The flow page
 * checks this before ever showing a purchase CTA, so we never take money for the
 * product while its image-gen provider is dormant (no key set). Returns only a
 * boolean — no secrets, no provider details.
 */
export async function GET() {
  return Response.json({ available: photoshootConfigured() });
}
