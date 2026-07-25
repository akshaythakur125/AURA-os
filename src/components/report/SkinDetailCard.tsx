"use client";

import { Card } from "@/components/ui/Card";

interface Props {
  skin: {
    clarity: number;
    evenness: number;
    shine: number;
    underEye: number;
    texture: number;
    notes: string[];
    topFix: string;
    lowConfidence: boolean;
  };
}

function Bar({ label, value, invert = false, hint }: { label: string; value: number; invert?: boolean; hint: string }) {
  // For "shine" and "under-eye", higher is worse — invert the colour logic.
  const good = invert ? value <= 35 : value >= 65;
  const mid = invert ? value <= 55 : value >= 45;
  const colour = good ? "from-emerald-500 to-emerald-400" : mid ? "from-amber-500 to-amber-400" : "from-red-500 to-red-400";
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-[#4a443d]">{label}</span>
        <span className="text-xs tabular-nums text-[#857b6e]">{value}/100</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#1c1917]/[0.06]">
        <div className={`h-full rounded-full bg-gradient-to-r ${colour}`} style={{ width: `${Math.max(3, value)}%` }} />
      </div>
      <p className="mt-1 text-[10px] leading-snug text-[#9c9184]">{hint}</p>
    </div>
  );
}

export function SkinDetailCard({ skin }: Props) {
  return (
    <Card className="mb-6">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1C1917]">✨ Skin, close up</h3>
        <span className="rounded-full border border-[#E14434]/25 bg-[#E14434]/[0.06] px-2 py-0.5 text-[10px] font-medium text-[#B23A25]">
          {skin.clarity}/100 clarity
        </span>
      </div>
      <p className="mb-4 text-xs text-[#857b6e]">
        Measured on your cheeks, under-eyes and T-zone — located with face landmarks, not guessed.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Bar label="Even tone" value={skin.evenness} hint="How uniform your skin reads across the face" />
        <Bar label="Smoothness" value={skin.texture} hint="Fine texture — lighting affects this a lot" />
        <Bar label="T-zone shine" value={skin.shine} invert hint="Lower is matter; very high reads oily on camera" />
        <Bar label="Under-eye shadow" value={skin.underEye} invert hint="Lower is brighter; usually caused by overhead light" />
      </div>

      {skin.notes.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {skin.notes.map((n) => (
            <li key={n} className="flex items-start gap-2 text-xs leading-relaxed text-[#4a443d]">
              <span className="mt-0.5 text-[#B23A25]">•</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 rounded-xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-3">
        <div className="text-xs font-medium text-[#B23A25]">Biggest skin win</div>
        <p className="mt-0.5 text-sm text-[#4a443d]">{skin.topFix}</p>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-[#9c9184]">
        This reads how your skin <em>photographs</em> — lighting, shine and shadow. It isn&apos;t a
        medical or dermatological assessment.
      </p>
    </Card>
  );
}
