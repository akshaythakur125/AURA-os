import { chatLLM, llmConfigured } from "@/lib/voice/llmClient";

export const dynamic = "force-dynamic";

/**
 * AI dating rewrite — takes the user's own bio/prompts and returns genuinely
 * personalised bios + openers, replacing the heuristic templates with something
 * that actually reads their voice. One LLM call per request (cheap), gated to
 * the env-configured free-tier model, rate-limited. Dormant until a key is set.
 */
const MAX_INPUT = 1200;
const hits = new Map<string, { count: number; resetAt: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now > rec.resetAt) { hits.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 }); return false; }
  rec.count++;
  return rec.count > 20;
}

function extractJson(text: string): unknown | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!llmConfigured()) return Response.json({ error: "not_configured" }, { status: 503 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (rateLimited(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  let body: { bio?: string; prompts?: { prompt: string; answer: string }[]; context?: { goal?: string; gender?: string } };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const bio = (body.bio || "").slice(0, MAX_INPUT).trim();
  const prompts = (body.prompts || []).slice(0, 5).map((p) => `Q: ${String(p.prompt).slice(0, 120)}\nA: ${String(p.answer).slice(0, 240)}`).join("\n");
  if (!bio && !prompts) return Response.json({ error: "empty" }, { status: 400 });

  const ctx = body.context?.goal ? ` Their goal is ${body.context.goal}.` : "";
  const system =
    "You are an elite dating-profile writer. You write specific, funny-when-it-fits, cliché-free bios in the user's own voice — never generic 'I love travel and food' filler. " +
    "Given their current bio and prompt answers, return STRICT JSON only, no prose, in this exact shape: " +
    '{"bios":[{"label":"...","text":"...","why":"..."}],"openers":["...","...","..."],"critique":"..."} ' +
    "Rules: 3 bios, each under 240 characters and distinctly different in angle; each 'why' one short sentence. 3 openers = lines they can add so a match messages first (specific hooks, a light question, or a fill-in-the-blank). 'critique' = one honest sentence on the biggest weakness in their current text." +
    ctx;
  const user = `Current bio:\n${bio || "(none)"}\n\nPrompt answers:\n${prompts || "(none)"}`;

  const raw = await chatLLM([{ role: "system", content: system }, { role: "user", content: user }], { maxTokens: 650, temperature: 0.85 });
  if (!raw) return Response.json({ error: "upstream" }, { status: 502 });

  const parsed = extractJson(raw) as { bios?: unknown; openers?: unknown; critique?: unknown } | null;
  if (parsed && Array.isArray(parsed.bios)) {
    return Response.json({
      bios: (parsed.bios as any[]).slice(0, 3),
      openers: Array.isArray(parsed.openers) ? (parsed.openers as any[]).slice(0, 3).map(String) : [],
      critique: typeof parsed.critique === "string" ? parsed.critique : "",
    });
  }
  // Model didn't return clean JSON — hand back the raw text so nothing is lost.
  return Response.json({ raw });
}
