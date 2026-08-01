/**
 * Provider client for the AI Glow-Up Photoshoot's image generation.
 *
 * Mirrors the voice coach's llmClient pattern: returns null when nothing is
 * configured or on any error, so the feature stays DORMANT and costs nothing
 * until a key is set.
 *
 * Two adapters:
 *
 *  1. GEMINI (the free default) — Google's Gemini image models ("nano banana",
 *     gemini-2.5-flash-image) do reference-conditioned generation on a genuine
 *     free tier, so a buyer's selfie actually drives the likeness. Turn it on
 *     with IMAGE_GEN_PROVIDER=gemini + a free AI Studio key in IMAGE_GEN_API_KEY.
 *     NOTE: on the free tier Google may use submitted content per their terms —
 *     the checkout + privacy copy disclose this. Upgrade to a paid/no-training
 *     endpoint (via the generic adapter) for a stronger privacy posture.
 *
 *  2. GENERIC — any endpoint that takes { model, prompt, image, num_images } and
 *     returns { images: [...] } (e.g. a self-hosted InstantID / PhotoMaker box).
 *
 * Either way, no key = dormant = nothing billed.
 */

const REQUEST_TIMEOUT_MS = 120_000; // identity-preserving renders can be slow
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_DEFAULT_MODEL = "gemini-2.5-flash-image";

export interface GeneratePortraitsOptions {
  /** The buyer's reference selfie as a data URL or https URL. */
  image: string;
  /** The style prompt (see stylePresets.ts). */
  prompt: string;
  /** How many variations to return. */
  count?: number;
}

function providerIsGemini(): boolean {
  const p = (process.env.IMAGE_GEN_PROVIDER || "").toLowerCase();
  if (p === "gemini") return true;
  return /generativelanguage\.googleapis\.com/.test(process.env.IMAGE_GEN_API_URL || "");
}

/** Turn a data URL or https image into Gemini inlineData ({ mimeType, data }). */
async function toInlineData(
  image: string,
  signal: AbortSignal,
): Promise<{ mimeType: string; data: string } | null> {
  const m = image.match(/^data:([^;]+);base64,(.*)$/);
  if (m) return { mimeType: m[1], data: m[2] };
  if (/^https?:\/\//.test(image)) {
    try {
      const res = await fetch(image, { signal });
      if (!res.ok) return null;
      const mimeType = res.headers.get("content-type") || "image/jpeg";
      const buf = Buffer.from(await res.arrayBuffer());
      return { mimeType, data: buf.toString("base64") };
    } catch {
      return null;
    }
  }
  return null;
}

/** One Gemini call → one image data URL, or null. */
async function geminiOne(
  base: string,
  model: string,
  apiKey: string,
  prompt: string,
  inline: { mimeType: string; data: string },
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${base}/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inlineData: inline }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const parts: unknown[] = data?.candidates?.[0]?.content?.parts ?? [];
    for (const p of parts) {
      const part = p as { inlineData?: { mimeType?: string; data?: string } };
      const d = part.inlineData?.data;
      if (d) return `data:${part.inlineData?.mimeType || "image/png"};base64,${d}`;
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function generateWithGemini(opts: GeneratePortraitsOptions): Promise<string[] | null> {
  const apiKey = process.env.IMAGE_GEN_API_KEY || "";
  if (!apiKey) return null;
  const base = (process.env.IMAGE_GEN_API_URL || GEMINI_BASE).replace(/\/$/, "");
  const model = process.env.IMAGE_GEN_MODEL || GEMINI_DEFAULT_MODEL;

  const probe = new AbortController();
  const inline = await toInlineData(opts.image, probe.signal);
  if (!inline) return null;

  const count = Math.max(1, opts.count ?? 4);
  // Gemini returns one image per call, so fan out — partial success is fine.
  const settled = await Promise.allSettled(
    Array.from({ length: count }, () => geminiOne(base, model, apiKey, opts.prompt, inline)),
  );
  const images = settled
    .map((s) => (s.status === "fulfilled" ? s.value : null))
    .filter((v): v is string => !!v);
  return images.length ? images : null;
}

/** Normalise a generic provider response into a flat list of image src strings. */
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

async function generateWithGeneric(opts: GeneratePortraitsOptions): Promise<string[] | null> {
  const apiKey = process.env.IMAGE_GEN_API_KEY || "";
  const url = (process.env.IMAGE_GEN_API_URL || "").replace(/\/$/, "");
  if (!apiKey || !url) return null;
  const model = process.env.IMAGE_GEN_MODEL || "";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
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

export async function generatePortraits(
  opts: GeneratePortraitsOptions,
): Promise<string[] | null> {
  if (process.env.PHOTOSHOOT_DISABLED === "1") return null;
  if (!process.env.IMAGE_GEN_API_KEY) return null; // dormant — nothing billed
  return providerIsGemini() ? generateWithGemini(opts) : generateWithGeneric(opts);
}

/** True only when a provider is configured and the kill-switch is off. */
export function photoshootConfigured(): boolean {
  if (process.env.PHOTOSHOOT_DISABLED === "1") return false;
  if (!process.env.IMAGE_GEN_API_KEY) return false;
  // Gemini needs only a key (base url defaults); generic needs an explicit url.
  return !!process.env.IMAGE_GEN_API_URL || providerIsGemini();
}
