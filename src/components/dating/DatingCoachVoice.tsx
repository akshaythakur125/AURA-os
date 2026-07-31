"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { openingLine, type CoachMode, type CoachContext } from "@/lib/voice/coachPrompts";

type Msg = { role: "user" | "assistant"; content: string };
const MAX_TURNS = 15; // hard session cap — bounds cost + keeps practice focused

function getRecognition(): any | null {
  if (typeof window === "undefined") return null;
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = "en-IN";
  r.interimResults = false;
  r.maxAlternatives = 1;
  r.continuous = false;
  return r;
}

function speak(text: string) {
  try {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.02;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  } catch {
    /* TTS unavailable — transcript still shows the reply */
  }
}

export function DatingCoachVoice({ context }: { context?: CoachContext }) {
  const [mode, setMode] = useState<CoachMode | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState<"ok" | "not_configured" | "error">("ok");
  const recRef = useRef<any>(null);
  const speechSupported = typeof window !== "undefined" && !!getRecognition();

  const userTurns = messages.filter((m) => m.role === "user").length;
  const capped = userTurns >= MAX_TURNS;

  useEffect(() => () => { try { window.speechSynthesis?.cancel(); recRef.current?.abort?.(); } catch {} }, []);

  function start(m: CoachMode) {
    setMode(m);
    const first = openingLine(m);
    setMessages([{ role: "assistant", content: first }]);
    speak(first);
  }

  async function sendTurn(text: string) {
    const clean = text.trim();
    if (!clean || thinking || capped || !mode) return;
    const next = [...messages, { role: "user" as const, content: clean }];
    setMessages(next);
    setTyped("");
    setThinking(true);
    try {
      const res = await fetch("/api/voice-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, mode, context }),
      });
      if (res.status === 503) { setStatus("not_configured"); setThinking(false); return; }
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const reply = (data.reply as string) || "Sorry, I lost my train of thought — say that again?";
      setMessages((cur) => [...cur, { role: "assistant", content: reply }]);
      speak(reply);
    } catch {
      setStatus("error");
    } finally {
      setThinking(false);
    }
  }

  function toggleMic() {
    if (listening) { recRef.current?.stop?.(); return; }
    const rec = getRecognition();
    if (!rec) return;
    recRef.current = rec;
    rec.onresult = (e: any) => sendTurn(e.results?.[0]?.[0]?.transcript || "");
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    try { rec.start(); } catch { setListening(false); }
  }

  function reset() {
    try { window.speechSynthesis?.cancel(); } catch {}
    setMessages([]);
    setMode(null);
    setStatus("ok");
  }

  // ── Not configured (owner hasn't added an LLM key) ──
  if (status === "not_configured") {
    return (
      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-5 text-sm text-[#4a443d]">
        The voice coach isn&apos;t switched on yet. It needs an AI key configured — once that&apos;s set, practice conversations work right here in your browser.
      </div>
    );
  }

  // ── Mode picker ──
  if (!mode) {
    return (
      <div className="rounded-2xl border border-[#1c1917]/[0.1] bg-[#fbf8f2]/60 p-5">
        <p className="text-sm font-bold text-[#1C1917]">🎙️ Practice out loud</p>
        <p className="mt-1 text-xs text-[#6f675e]">Rehearse a real conversation with your voice — pick who you want to talk to. Runs in your browser.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button onClick={() => start("date")} className="rounded-xl border border-[#1c1917]/12 bg-white/70 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#E14434]/40">
            <p className="text-sm font-semibold text-[#1C1917]">💬 Practice date</p>
            <p className="mt-0.5 text-xs text-[#6f675e]">Talk to a realistic match and see how the conversation flows.</p>
          </button>
          <button onClick={() => start("coach")} className="rounded-xl border border-[#1c1917]/12 bg-white/70 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#E14434]/40">
            <p className="text-sm font-semibold text-[#1C1917]">🧠 Coach me</p>
            <p className="mt-0.5 text-xs text-[#6f675e]">A wingman gives live feedback and better lines as you go.</p>
          </button>
        </div>
      </div>
    );
  }

  // ── Live conversation ──
  return (
    <div className="rounded-2xl border border-[#1c1917]/[0.1] bg-[#fbf8f2]/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-[#E14434]/10 px-2.5 py-1 text-[11px] font-semibold text-[#B23A25]">{mode === "date" ? "Practice date" : "Coach"}</span>
        <button onClick={reset} className="text-xs text-[#857b6e] underline-offset-2 hover:underline">Start fresh</button>
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <span className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${m.role === "user" ? "bg-[#1C1917] text-white" : "bg-white text-[#1C1917] border border-[#1c1917]/[0.08]"}`}>{m.content}</span>
          </div>
        ))}
        {thinking && <div className="flex justify-start"><span className="rounded-2xl border border-[#1c1917]/[0.08] bg-white px-3 py-2 text-xs text-[#857b6e]">…</span></div>}
      </div>

      {status === "error" && <p className="mt-2 text-[11px] text-[#B23A25]">Connection hiccup — try again.</p>}

      {capped ? (
        <div className="mt-3 rounded-xl bg-emerald-500/10 px-3 py-2.5 text-center text-xs text-emerald-700">
          Nice practice run! <button onClick={reset} className="font-semibold underline">Start a fresh one</button> to keep going.
        </div>
      ) : (
        <div className="mt-3">
          {speechSupported && (
            <button
              onClick={toggleMic}
              disabled={thinking}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 ${listening ? "bg-[#E14434]" : "bg-[#1C1917]"}`}
            >
              {listening ? "● Listening… tap to stop" : "🎙️ Tap and speak"}
            </button>
          )}
          {/* Typing fallback — works even without mic support */}
          <form onSubmit={(e) => { e.preventDefault(); sendTurn(typed); }} className="mt-2 flex gap-2">
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={speechSupported ? "…or type instead" : "Type your reply (voice not supported in this browser)"}
              className="flex-1 rounded-xl border border-[#1c1917]/12 bg-white/70 px-3 py-2 text-xs text-[#1C1917] focus:border-[#E14434]/40 focus:outline-none"
            />
            <button type="submit" disabled={thinking || !typed.trim()} className="rounded-xl bg-[#1C1917] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Send</button>
          </form>
          <p className="mt-2 text-center text-[10px] text-[#9c9184]">{MAX_TURNS - userTurns} turns left this session · speech runs in your browser</p>
        </div>
      )}
    </div>
  );
}
