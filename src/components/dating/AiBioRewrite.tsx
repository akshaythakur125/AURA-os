"use client";

import { useState } from "react";

type Bio = { label?: string; text?: string; why?: string };
type Result = { bios?: Bio[]; openers?: string[]; critique?: string; raw?: string };

/**
 * AI bio rewrite — regenerates the user's bios and openers personalised to their
 * ACTUAL words via the env-configured LLM, replacing the heuristic templates
 * with something in their own voice. Dormant/free until a key is set.
 */
export function AiBioRewrite({ bio, prompts, context }: {
  bio: string;
  prompts?: { prompt: string; answer: string }[];
  context?: { goal?: string; gender?: string };
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "not_configured" | "error">("idle");
  const [result, setResult] = useState<Result | null>(null);

  async function run() {
    setState("loading");
    try {
      const res = await fetch("/api/dating-rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, prompts, context }),
      });
      if (res.status === 503) { setState("not_configured"); return; }
      if (!res.ok) throw new Error(String(res.status));
      setResult(await res.json());
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "not_configured") {
    return (
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-3 text-xs text-[#4a443d]">
        AI rewrite isn&apos;t switched on yet — it needs an AI key configured. Your bio suggestions above still apply.
      </div>
    );
  }

  return (
    <div>
      {state !== "done" && (
        <button
          onClick={run}
          disabled={state === "loading"}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E14434] to-[#c0341f] px-4 py-2.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {state === "loading" ? "Writing your bios…" : "✨ AI rewrite — personalised to your words"}
        </button>
      )}
      {state === "error" && <p className="mt-2 text-[11px] text-[#B23A25]">Couldn&apos;t generate right now — try again.</p>}

      {state === "done" && result && (
        <div className="space-y-3">
          {result.critique && (
            <p className="rounded-lg border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-3 text-xs text-[#4a443d]"><span className="font-semibold text-[#1C1917]">The honest note: </span>{result.critique}</p>
          )}
          {result.bios?.map((b, i) => (
            <div key={i} className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              {b.label && <div className="text-[11px] font-semibold uppercase tracking-wide text-[#B23A25]">{b.label}</div>}
              <p className="mt-1 text-xs text-[#33302b]">{b.text}</p>
              {b.why && <p className="mt-1 text-[10px] text-[#857b6e]">{b.why}</p>}
            </div>
          ))}
          {result.openers && result.openers.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-[#1C1917]">Openers that get replies</p>
              <ul className="space-y-1.5">
                {result.openers.map((o, i) => <li key={i} className="rounded-lg border border-[#1c1917]/[0.08] bg-white/60 p-2.5 text-xs text-[#4a443d]">{o}</li>)}
              </ul>
            </div>
          )}
          {result.raw && !result.bios && <p className="whitespace-pre-wrap rounded-lg border border-[#1c1917]/[0.08] bg-white/60 p-3 text-xs text-[#4a443d]">{result.raw}</p>}
          <button onClick={run} className="text-[11px] font-semibold text-[#B23A25] hover:underline">Regenerate →</button>
        </div>
      )}
    </div>
  );
}
