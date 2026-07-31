import { buildSystemPrompt, type CoachMode, type CoachContext } from "@/lib/voice/coachPrompts";

export const dynamic = "force-dynamic";

/**
 * Voice dating-coach brain. Proxies to any OpenAI-compatible chat endpoint
 * (Gemini Flash / Groq free tier / GPT-4o-mini) configured by env:
 *   LLM_API_URL   base url, e.g. https://api.groq.com/openai/v1
 *   LLM_API_KEY   the key (feature is OFF until this is set — costs nothing)
 *   LLM_MODEL     model id, e.g. llama-3.1-8b-instant or gemini-2.0-flash
 *   VOICE_COACH_DISABLED=1  global kill-switch
 *
 * Cost is bounded here, not trusted to the client:
 *   - only the last MAX_HISTORY messages are sent (flat cost per turn),
 *   - each message is truncated (bounds input tokens),
 *   - replies are capped at MAX_TOKENS (short, spoken),
 *   - a per-IP rate limit blocks abuse/bots.
 */

const MAX_HISTORY = 12; // messages sent to the model (keeps per-turn cost flat)
const MAX_MSG_CHARS = 600; // truncate any single message
const MAX_TOKENS = 120; // spoken replies are short
const RATE_LIMIT = 40; // requests…
const RATE_WINDOW_MS = 10 * 60 * 1000; // …per 10 min per IP

type Msg = { role: "user" | "assistant"; content: string };

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
  if (process.env.VOICE_COACH_DISABLED === "1") {
    return Response.json({ error: "disabled" }, { status: 503 });
  }
  const API_KEY = process.env.LLM_API_KEY || "";
  const API_URL = (process.env.LLM_API_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const MODEL = process.env.LLM_MODEL || "gpt-4o-mini";
  if (!API_KEY) {
    // Not configured — the feature is dormant and costs nothing.
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (rateLimited(ip)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { messages?: Msg[]; mode?: CoachMode; context?: CoachContext };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const mode: CoachMode = body.mode === "coach" ? "coach" : "date";
  const raw = Array.isArray(body.messages) ? body.messages : [];
  const history = raw
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MSG_CHARS) }));

  const messages = [{ role: "system", content: buildSystemPrompt(mode, body.context) }, ...history];

  try {
    const res = await fetch(`${API_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({ model: MODEL, messages, max_tokens: MAX_TOKENS, temperature: 0.8 }),
    });
    if (!res.ok) {
      return Response.json({ error: "upstream" }, { status: 502 });
    }
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) return Response.json({ error: "empty" }, { status: 502 });
    return Response.json({ reply });
  } catch {
    return Response.json({ error: "upstream" }, { status: 502 });
  }
}
