"use client";

import { useState } from "react";
import { buildDailyBrief, type BriefTraits, type Weather } from "@/lib/daily/dailyBrief";

/**
 * Daily Aura Brief — the ecosystem's daily companion. Uses the visitor's
 * location to pull today's weather + sun times, then turns them into one
 * contextual plan (what to wear from their palette, the grooming nudge that
 * matters today, and the golden-hour windows to shoot in). Fresh every day, so
 * it's a reason to open the app each morning. Location is used only in-browser
 * for the weather lookup; nothing is stored.
 */
export function DailyAuraBrief(traits: BriefTraits) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "denied" | "error">("idle");
  const [brief, setBrief] = useState<ReturnType<typeof buildDailyBrief> | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);

  function start() {
    if (!navigator.geolocation) { setState("error"); return; }
    setState("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`/api/weather?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
          if (!res.ok) { setState("error"); return; }
          const w: Weather = await res.json();
          setWeather(w);
          setBrief(buildDailyBrief(w, traits));
          setState("done");
        } catch {
          setState("error");
        }
      },
      () => setState("denied"),
      { timeout: 8000 },
    );
  }

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="mb-8 rounded-2xl border border-[#E14434]/20 bg-gradient-to-b from-[#E14434]/[0.05] to-transparent p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B23A25]">Your Daily Aura Brief</p>
          <h3 className="mt-0.5 text-sm font-bold text-[#1C1917]">{today}</h3>
        </div>
        {state === "done" && weather && (
          <div className="shrink-0 text-right">
            <p className="text-sm font-bold text-[#1C1917]">{weather.tempC != null ? `${weather.tempC}°` : ""}</p>
            <p className="text-[11px] text-[#857b6e]">{weather.label}</p>
          </div>
        )}
      </div>

      {state === "idle" && (
        <div className="mt-3">
          <p className="text-xs text-[#6f675e]">Today&apos;s outfit, grooming and the best light to shoot in — tuned to your look and today&apos;s weather.</p>
          <button onClick={start} className="mt-2.5 rounded-lg bg-gradient-to-r from-[#E14434] to-[#c0341f] px-4 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5">
            ☀️ Get today&apos;s brief
          </button>
        </div>
      )}
      {state === "loading" && <p className="mt-3 text-xs text-[#857b6e]">Reading today&apos;s light…</p>}
      {(state === "denied" || state === "error") && (
        <p className="mt-3 text-xs text-[#857b6e]">{state === "denied" ? "Allow location to get your weather-tuned daily brief." : "Couldn't load today's brief — try again shortly."}</p>
      )}

      {state === "done" && brief && (
        <div className="mt-3 space-y-2">
          <Row icon="👕" label="Wear today" text={brief.outfit} />
          <Row icon="🧴" label="Grooming" text={brief.grooming} />
          <Row icon="📸" label="Best light" text={brief.photoLine} />
        </div>
      )}
    </div>
  );
}

function Row({ icon, label, text }: { icon: string; label: string; text: string }) {
  return (
    <div className="flex gap-2.5 rounded-xl border border-[#1c1917]/[0.06] bg-white/50 p-3">
      <span className="text-base leading-none">{icon}</span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#857b6e]">{label}</p>
        <p className="text-xs text-[#33302b]">{text}</p>
      </div>
    </div>
  );
}
