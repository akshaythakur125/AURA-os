"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { FadeInView } from "@/components/ui/FadeInView";
import { compressImageToDataUrl } from "@/lib/image/processImage";
import { detectGroupBoxes, scoreFaceBox } from "@/lib/face/groupFaces";
import { trackEvent } from "@/lib/storage/analyticsStore";

type Stage = "idle" | "analyzing" | "result" | "error";

interface Person {
  n: number; // left→right position (1-based)
  cx: number; cy: number; // normalized centre
  score: number; lit: boolean; sharp: boolean;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = src; });
}

export default function GroupCheckPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [url, setUrl] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStage("analyzing"); setError(null);
    try {
      const compressed = await compressImageToDataUrl(file);
      const img = await loadImage(compressed.dataUrl);
      // canvas for pixel scoring
      const scale = Math.min(900 / img.width, 1);
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) { setError("Couldn't process that image."); setStage("error"); return; }
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;

      const boxes = await detectGroupBoxes(img);
      if (!boxes || boxes.length < 2) {
        setError(boxes && boxes.length === 1 ? "Only spotted one face — this mode is for group photos (2+ people). Try Post or Not for a solo pic." : "Couldn't find clear faces. Use a well-lit group photo where everyone's face is visible.");
        setStage("error"); return;
      }
      const ordered = boxes
        .map((b) => ({ b, cx: (b.x0 + b.x1) / 2, cy: (b.y0 + b.y1) / 2 }))
        .sort((a, z) => a.cx - z.cx);
      const persons: Person[] = ordered.map((o, i) => {
        const s = scoreFaceBox(data, w, h, o.b);
        return { n: i + 1, cx: o.cx, cy: o.cy, score: s.score, lit: s.lit, sharp: s.sharp };
      });
      setUrl(compressed.dataUrl);
      setPeople(persons);
      setStage("result");
      trackEvent({ eventName: "group_check_result", metadata: { faces: String(persons.length) } });
    } catch {
      setError("Something went wrong reading that image. Try an original JPEG or PNG.");
      setStage("error");
    }
  }

  const ranked = [...people].sort((a, b) => b.score - a.score);
  const best = ranked[0];

  function copyText() {
    if (!best) return;
    navigator.clipboard.writeText(`AuraCheck says Person ${best.n} reads best in our group pic 👑 Check yours free at fixmyaura.shop`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }
  function reset() { setStage("idle"); setPeople([]); setUrl(null); setError(null); if (ref.current) ref.current.value = ""; }

  const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`);
  const note = (p: Person) => (p.lit && p.sharp ? "well-lit & sharp" : p.lit ? "nicely lit" : p.sharp ? "sharp & clear" : "a touch soft/dim");

  return (
    <>
      <div className="aurora-mesh" />
      <Container className="relative py-10 sm:py-14">
        <GlowOrb color="rgba(225, 68, 52, 0.10)" size={320} className="top-[8%] right-[6%]" delay={0} />
        <div className="mx-auto max-w-lg">
          {stage !== "result" && (
            <FadeInView>
              <div className="mb-8 text-center">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E14434]/25 bg-[#E14434]/[0.07] px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E14434]" />
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#B23A25]">Free · Instant · Private</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-[#1C1917] sm:text-5xl">Group Check <span className="text-[#E14434]">👥</span></h1>
                <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[#6F675E]">Drop a group photo and see who reads clearest — best-lit, sharpest, most in-frame. Great for settling debates.</p>
              </div>
            </FadeInView>
          )}

          {stage === "idle" && (
            <FadeInView delay={100}>
              <div onClick={() => ref.current?.click()} className="cursor-pointer rounded-3xl border-2 border-dashed border-[#1c1917]/15 bg-[#1c1917]/[0.02] p-10 text-center transition-colors hover:border-[#E14434]/40">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E14434]/10 text-3xl">👥</div>
                <p className="text-lg font-semibold text-[#1C1917]">Drop a group photo</p>
                <p className="mt-1 text-sm text-[#857b6e]">2+ visible faces · analyzed on your device</p>
                <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
            </FadeInView>
          )}

          {stage === "analyzing" && (
            <FadeInView><Card className="py-14 text-center"><div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#E14434]/20 border-t-[#E14434]" /><p className="text-lg font-semibold text-[#1C1917]">Finding everyone…</p></Card></FadeInView>
          )}

          {stage === "error" && (
            <FadeInView><Card className="py-10 text-center"><div className="mb-3 text-4xl">🫥</div><p className="mb-2 text-lg font-semibold text-[#1C1917]">Couldn&apos;t do a group read</p><p className="mx-auto mb-6 max-w-sm text-sm text-[#6f675e]">{error}</p><Button onClick={reset}>Try another</Button></Card></FadeInView>
          )}

          {stage === "result" && url && best && (
            <div className="space-y-6">
              <FadeInView>
                <Card>
                  <div className="relative overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="Group" className="w-full" />
                    {people.map((p) => {
                      const isBest = p.n === best.n;
                      return (
                        <div key={p.n} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.cx * 100}%`, top: `${p.cy * 100}%` }}>
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold shadow ${isBest ? "border-white bg-emerald-500 text-white" : "border-white bg-[#1c1917]/70 text-white"}`}>{isBest ? "👑" : p.n}</div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-center text-lg font-bold text-[#1C1917]">Person {best.n} reads best 👑</p>
                  <p className="mx-auto mt-1 max-w-sm text-center text-sm text-[#4a443d]">{note(best).replace(/^\w/, (c) => c.toUpperCase())} — clearest read in the frame.</p>
                </Card>
              </FadeInView>

              <FadeInView delay={100}>
                <Card>
                  <h3 className="mb-3 text-sm font-semibold text-[#1C1917]">The ranking</h3>
                  <div className="space-y-2">
                    {ranked.map((p, i) => (
                      <div key={p.n} className="flex items-center gap-3 rounded-xl border border-[#1c1917]/[0.06] bg-[#1c1917]/[0.02] p-3">
                        <span className="w-8 text-center text-lg">{medal(i)}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#1C1917]">Person {p.n}</p>
                          <p className="text-xs text-[#857b6e]">{note(p)}</p>
                        </div>
                        <span className="text-lg font-bold text-[#1C1917]">{p.score}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Button size="sm" variant="ghost" onClick={copyText}>{copied ? "Copied!" : "Copy caption"}</Button>
                  </div>
                </Card>
              </FadeInView>

              <FadeInView delay={180}>
                <div className="rounded-2xl border border-[#E14434]/20 bg-gradient-to-b from-[#E14434]/[0.06] to-transparent p-5 text-center">
                  <p className="text-sm font-semibold text-[#1C1917]">Want your solo verdict?</p>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-[#6f675e]">Run your own pic through Post or Not for a full read and the one fix.</p>
                  <div className="mt-4 flex justify-center"><Link href="/post-or-not"><Button size="sm">Try Post or Not</Button></Link></div>
                </div>
              </FadeInView>
              <div className="flex justify-center pb-4"><button onClick={reset} className="text-sm text-[#857b6e] underline-offset-2 hover:text-[#4a443d] hover:underline">← Check another group</button></div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
