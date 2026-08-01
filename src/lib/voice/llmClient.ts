/**
 * Tiny shared client for the env-configured, OpenAI-compatible LLM (the same one
 * that powers the voice coach). Returns null when no key is set or on any error,
 * so callers degrade gracefully — the feature stays dormant and free until an
 * LLM_API_KEY is configured.
 */
export async function chatLLM(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  opts?: { maxTokens?: number; temperature?: number },
): Promise<string | null> {
  if (process.env.VOICE_COACH_DISABLED === "1") return null;
  const API_KEY = process.env.LLM_API_KEY || "";
  if (!API_KEY) return null;
  const API_URL = (process.env.LLM_API_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const MODEL = process.env.LLM_MODEL || "gpt-4o-mini";
  try {
    const res = await fetch(`${API_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: opts?.maxTokens ?? 400,
        temperature: opts?.temperature ?? 0.8,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    return typeof content === "string" ? content.trim() : null;
  } catch {
    return null;
  }
}

export function llmConfigured(): boolean {
  return !!process.env.LLM_API_KEY && process.env.VOICE_COACH_DISABLED !== "1";
}
