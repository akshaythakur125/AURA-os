"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";
import { Scene3DAccent } from "@/components/hero/Scene3DAccent";
import { analyzeImageDataUrl } from "@/lib/aura-engine/imageMetrics";
import { hasAnyUnlock } from "@/lib/storage/unlockStore";

interface Scored {
  id: string;
  dataUrl: string;
  dating: number;
  weakest: string;
  fix: string;
}

// Suggested role for each slot in a dating lineup (best-first).
const ROLES = [
  { title: "Lead shot", note: "Clear face, genuine smile, great light. This gets the swipe." },
  { title: "Second look", note: "A different angle or outfit so you don't look one-note." },
  { title: "Full-body", note: "Shows your build and style head-to-toe — builds trust." },
  { title: "Social / candid", note: "You in your element (hobby, travel, with friends cropped)." },
  { title: "Personality", note: "One that hints at a story and invites an opener." },
  { title: "Bonus", note: "Only keep it if it's as strong as the rest — quality over quantity." },
];

const BIO_STARTERS = [
  "Two truths and a lie, but I'm terrible at lying — so good luck.",
  "Here for good coffee, better conversation, and someone to argue about pizza toppings with.",
  "I'll show you my camera roll of sunsets if you show me your most-used emoji.",
  "Fluent in sarcasm, decent at cooking, dangerously competitive at board games.",
  "Looking for a partner-in-crime for weekend plans and weekday takeout.",
];

const WEAK_FIX: Record<string, string> = {
  lighting: "shoot facing a window — soft natural light instantly lifts this one",
  clarity: "use the rear camera and hold steady; it's a touch soft",
  background: "crop tighter or move to a cleaner backdrop",
  composition: "reframe chest-up with your eyes on the top third",
  grooming: "a quick grooming pass would push this higher",
};

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result as string);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}

function score(m: Record<string, any>): { dating: number; weakest: string } {
  const dims: Record<string, number> = {
    lighting: m.lightingScore ?? 50,
    clarity: m.clarityScore ?? 50,
    background: 100 - (m.backgroundComplexityEstimate ?? 50),
    composition: m.compositionScore ?? 50,
    grooming: m.groomingResult?.overallScore ?? 55,
  };
  const dating = Math.round(0.24 * dims.clarity + 0.22 * dims.lighting + 0.2 * dims.grooming + 0.18 * dims.composition + 0.16 * dims.background);
  const weakest = Object.entries(dims).sort((a, b) => a[1] - b[1])[0][0];
  return { dating, weakest };
}

export default function DatingPackClient() {
  const [paid, setPaid] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Scored[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { try { setPaid(hasAnyUnlock()); } catch { setPaid(false); } }, []);

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    const picked = Array.from(files).slice(0, 6);
    const out: Scored[] = [];
    for (const f of picked) {
      try {
        const dataUrl = await readAsDataUrl(f);
        const m = (await analyzeImageDataUrl(dataUrl)) as unknown as Record<string, any>;
        const { dating, weakest } = score(m);
        out.push({ id: `${f.name}-${out.length}`, dataUrl, dating, weakest, fix: WEAK_FIX[weakest] || "" });
      } catch { /* skip */ }
    }
    out.sort((a, b) => b.dating - a.dating);
    setResults(out);
    setBusy(false);
  };

  return (
    <Container className="py-12">
      <div className="mb-8 text-center">
        <div className="mb-3 flex justify-center"><Scene3DAccent size={120} shape="model" /></div>
        <h1 className="text-2xl font-bold text-[#1C1917] sm:text-3xl">Dating Profile Teardown</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[#6f675e]">
          Upload your candidate photos. We score them, put them in the right order, and hand you bio starters — a
          full profile, ready to paste.
        </p>
      </div>

      {paid === false ? (
        <Card className="mx-auto max-w-md text-center">
          <div className="mb-3 text-3xl">🔒</div>
          <h2 className="text-base font-semibold text-[#1C1917]">A Pro perk</h2>
          <p className="mx-auto mt-1 max-w-xs text-xs text-[#857b6e]">The full profile teardown is part of the report. Unlock once, use it anytime.</p>
          <Link href="/pricing"><Button className="mt-4">Unlock the Teardown</Button></Link>
        </Card>
      ) : (
        <>
          <Card className="mx-auto max-w-xl text-center">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
            <button onClick={() => fileRef.current?.click()} disabled={busy}
              className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#1c1917]/12 bg-[#1c1917]/[0.02] p-8 transition-all hover:border-[#E14434]/30 disabled:opacity-50">
              <span className="text-sm text-[#6f675e]">{busy ? "Scoring your lineup…" : "Drop or browse — up to 6 photos"}</span>
              <span className="mt-1 text-xs text-[#9c9184]">Analyzed in your browser · nothing uploaded</span>
            </button>
          </Card>

          {results.length > 0 && (
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {/* Ordered lineup */}
              <div className="lg:col-span-2">
                <p className="mb-3 text-sm font-semibold text-[#1C1917]">Your lineup — in this order</p>
                <div className="space-y-3">
                  {results.map((r, i) => {
                    const role = ROLES[i] || ROLES[ROLES.length - 1];
                    return (
                      <FadeInView key={r.id} delay={i * 40}>
                        <Card className="flex items-center gap-4">
                          <div className="relative shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={r.dataUrl} alt="" className="h-20 w-20 rounded-xl object-cover" />
                            <span className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#1c1917] text-xs font-bold text-white">{i + 1}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-[#1C1917]">{role.title}</span>
                              <span className="text-xs text-[#E14434]">{r.dating}/100</span>
                            </div>
                            <p className="text-[11px] text-[#857b6e]">{role.note}</p>
                            {r.fix && <p className="mt-1 text-[11px] text-[#6f675e]">Tip: {r.fix}.</p>}
                          </div>
                        </Card>
                      </FadeInView>
                    );
                  })}
                </div>
              </div>

              {/* Bio starters + rules */}
              <div className="space-y-4">
                <Card>
                  <p className="mb-2 text-sm font-semibold text-[#1C1917]">✍️ Bio starters</p>
                  <div className="space-y-2">
                    {BIO_STARTERS.map((b, i) => (
                      <p key={i} className="rounded-lg border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.02] p-2.5 text-[11px] text-[#4a443d]">{b}</p>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-[#9c9184]">Swap in a real detail — specifics beat clever.</p>
                </Card>
                <Card>
                  <p className="mb-2 text-sm font-semibold text-[#1C1917]">The lineup rules</p>
                  <ul className="space-y-1.5 text-[11px] text-[#6f675e]">
                    <li>• Lead with your clearest, warmest face shot.</li>
                    <li>• Vary angle, outfit, and setting across the set.</li>
                    <li>• Include one full-body — it builds trust.</li>
                    <li>• 4–6 strong photos beat 9 mediocre ones.</li>
                    <li>• No sunglasses or group photos as your lead.</li>
                  </ul>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
