/**
 * Provider-agnostic client for the AI Glow-Up Photoshoot's image generation.
 *
 * Mirrors the voice coach's llmClient pattern: returns null when no key is set
 * or on any error, so the feature stays DORMANT and costs nothing until an
 * IMAGE_GEN_API_KEY is configured.
 *
 * Wire it to any identity-preserving (face-conditioned) image endpoint —
 * InstantID / PhotoMaker / IP-Adapter-FaceID hosted on fal.ai, Replicate, or
 * your own box. We POST a generic JSON body and normalise a few common response
 * shapes; adapt the provider to this contract (or extend extractImages below):
 *
 *   Request : { model, prompt, image, num_images }
 *   Response: { images: [ "<url>" | "<dataURL>" | { url } | { b64_json } ] }
 */

const REQUEST_TIMEOUT_MS = 120_000; // identity-preserving renders can be slow

export interface GeneratePortraitsOptions {
  /** The buyer's reference selfie as a data URL or https URL. */
  image: string;
  /** The style prompt (see stylePresets.ts). */
  prompt: string;
  /** How many variations to return. */
  count?: number;
}

/** Normalise the provider response into a flat list of image src strings. */
function extractImages(data: unknown): string[] {
  const out: string[] = [];
  const push = (v: unknown) => {
    if (typeof v === "string" && v.trim()) {
      out.push(v.trim());
    } else if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      if (typeof o.url === "string") out.push(o.url);
      else if (typeof o.b64_json === "string") out.push(`data:image/png;base64,${o.b64_json}`);
      else if (typeof o.image === "string") out.push(o.image);
    }
  };
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    const arr = Array.isArray(d.images) ? d.images : Array.isArray(d.data) ? d.data : null;
    if (arr) arr.forEach(push);
    else if (typeof d.image === "string") push(d.image);
  }
  return out;
}

export async function generatePortraits(
  opts: GeneratePortraitsOptions,
): Promise<string[] | null> {
  if (process.env.PHOTOSHOOT_DISABLED === "1") return null;
  const API_KEY = process.env.IMAGE_GEN_API_KEY || "";
  const API_URL = (process.env.IMAGE_GEN_API_URL || "").replace(/\/$/, "");
  if (!API_KEY || !API_URL) return null; // dormant — nothing configured, nothing billed
  const MODEL = process.env.IMAGE_GEN_MODEL || "";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        prompt: opts.prompt,
        image: opts.image,
        num_images: opts.count ?? 4,
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const images = extractImages(data);
    return images.length ? images : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** True only when a provider key + url are set and the kill-switch is off. */
export function photoshootConfigured(): boolean {
  return (
    !!process.env.IMAGE_GEN_API_KEY &&
    !!process.env.IMAGE_GEN_API_URL &&
    process.env.PHOTOSHOOT_DISABLED !== "1"
  );
}
