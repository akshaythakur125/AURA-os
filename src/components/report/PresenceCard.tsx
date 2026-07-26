"use client";

import { Card } from "@/components/ui/Card";

interface Props {
  presence: {
    smile: number;
    genuineSmile: boolean;
    eyesOpen: number;
    eyeContact: boolean;
    tiltDeg: number;
    turned: number;
    hairNeatness: number | null;
    accessories?: { glasses: boolean; hat: boolean; necktie: boolean } | null;
    strengths: string[];
    coaching: string[];
    topFix: string;
  };
}

function Chip({ ok, label, value }: { ok: boolean; label: string; value: string }) {
  return (
    <div className={`rounded-xl border p-3 ${ok ? "border-emerald-400/25 bg-emerald-500/[0.06]" : "border-amber-400/25 bg-amber-500/[0.06]"}`}>
      <div className="flex items-center gap-1.5">
        <span className={`text-xs ${ok ? "text-emerald-500" : "text-amber-600"}`}>{ok ? "✓" : "!"}</span>
        <span className="text-[11px] font-medium text-[#4a443d]">{label}</span>
      </div>
      <p className="mt-0.5 text-sm font-semibold text-[#1C1917]">{value}</p>
    </div>
  );
}

export function PresenceCard({ presence: p }: Props) {
  const tilt = Math.abs(p.tiltDeg);
  return (
    <Card className="mb-6">
      <h3 className="text-sm font-semibold text-[#1C1917]">🙂 How you&apos;re showing up</h3>
      <p className="mb-4 text-xs text-[#857b6e]">
        Expression, eye contact and head position — read from the face model, not guessed.
      </p>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Chip
          ok={p.genuineSmile || p.smile >= 30}
          label="Smile"
          value={p.genuineSmile ? "Genuine" : p.smile >= 30 ? "Present" : p.smile >= 12 ? "Subtle" : "Flat"}
        />
        <Chip ok={p.eyesOpen >= 70} label="Eyes open" value={`${p.eyesOpen}/100`} />
        <Chip ok={p.eyeContact} label="Eye contact" value={p.eyeContact ? "At camera" : "Looking away"} />
        <Chip ok={tilt <= 9} label="Head tilt" value={`${Math.round(tilt)}°`} />
      </div>

      {p.hairNeatness != null && (
        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-[#4a443d]">Hair neatness</span>
            <span className="text-xs tabular-nums text-[#857b6e]">{p.hairNeatness}/100</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#1c1917]/[0.06]">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${p.hairNeatness >= 70 ? "from-emerald-500 to-emerald-400" : p.hairNeatness >= 50 ? "from-amber-500 to-amber-400" : "from-red-500 to-red-400"}`}
              style={{ width: `${Math.max(3, p.hairNeatness)}%` }}
            />
          </div>
        </div>
      )}

      {p.accessories && (p.accessories.glasses || p.accessories.hat || p.accessories.necktie) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium text-[#857b6e]">Spotted:</span>
          {p.accessories.glasses && <span className="rounded-full border border-[#1c1917]/10 bg-[#1c1917]/[0.04] px-2.5 py-0.5 text-[11px] text-[#4a443d]">👓 Glasses</span>}
          {p.accessories.hat && <span className="rounded-full border border-[#1c1917]/10 bg-[#1c1917]/[0.04] px-2.5 py-0.5 text-[11px] text-[#4a443d]">🧢 Hat</span>}
          {p.accessories.necktie && <span className="rounded-full border border-[#1c1917]/10 bg-[#1c1917]/[0.04] px-2.5 py-0.5 text-[11px] text-[#4a443d]">👔 Tie</span>}
        </div>
      )}

      {p.strengths.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Working for you</p>
          <ul className="mt-1.5 space-y-1">
            {p.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2 text-xs leading-relaxed text-[#4a443d]">
                <span className="mt-0.5 text-emerald-500">✓</span><span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {p.coaching.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#B23A25]">Dial this in</p>
          <ul className="mt-1.5 space-y-1">
            {p.coaching.map((c) => (
              <li key={c} className="flex items-start gap-2 text-xs leading-relaxed text-[#4a443d]">
                <span className="mt-0.5 text-[#B23A25]">→</span><span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 rounded-xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-3">
        <div className="text-xs font-medium text-[#B23A25]">Do this first</div>
        <p className="mt-0.5 text-sm text-[#4a443d]">{p.topFix}</p>
      </div>
    </Card>
  );
}
