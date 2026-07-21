"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Scene3DAccent } from "@/components/hero/Scene3DAccent";
import { hasAnyUnlock } from "@/lib/storage/unlockStore";

const FORMATS = [
  { key: "dating", label: "Dating", emoji: "🌹", w: 1080, ratioW: 4, ratioH: 5, note: "Tinder · Hinge · Bumble" },
  { key: "linkedin", label: "LinkedIn", emoji: "💼", w: 800, ratioW: 1, ratioH: 1, note: "Profile photo" },
  { key: "instagram", label: "Instagram", emoji: "📸", w: 1080, ratioW: 4, ratioH: 5, note: "Feed post" },
  { key: "story", label: "Story / Reel", emoji: "🎬", w: 1080, ratioW: 9, ratioH: 16, note: "Stories · Reels · Shorts" },
] as const;

interface Pack {
  key: string;
  label: string;
  emoji: string;
  note: string;
  dataUrl: string;
  dims: string;
}

// Center-crop with a slight upward bias so faces (usually upper-center) stay in frame.
function cropToAspect(img: HTMLImageElement, outW: number, ratioW: number, ratioH: number): string {
  const outH = Math.round((outW * ratioH) / ratioW);
  const targetRatio = ratioW / ratioH;
  const srcRatio = img.width / img.height;
  let sw: number, sh: number, sx: number, sy: number;
  if (srcRatio > targetRatio) {
    // source wider — crop sides
    sh = img.height;
    sw = sh * targetRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    // source taller — crop top/bottom, bias upward (0.35 keeps faces)
    sw = img.width;
    sh = sw / targetRatio;
    sx = 0;
    sy = (img.height - sh) * 0.35;
  }
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
  return canvas.toDataURL("image/jpeg", 0.92);
}

export default function PlatformPacksClient() {
  const [paid, setPaid] = useState<boolean | null>(null);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { setPaid(hasAnyUnlock()); } catch { setPaid(false); }
  }, []);

  const onFile = useCallback((file?: File) => {
    if (!file) return;
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const out: Pack[] = FORMATS.map((f) => ({
          key: f.key,
          label: f.label,
          emoji: f.emoji,
          note: f.note,
          dataUrl: cropToAspect(img, f.w, f.ratioW, f.ratioH),
          dims: `${f.w}×${Math.round((f.w * f.ratioH) / f.ratioW)}`,
        }));
        setPacks(out);
        setBusy(false);
      };
      img.onerror = () => setBusy(false);
      img.src = reader.result as string;
    };
    reader.onerror = () => setBusy(false);
    reader.readAsDataURL(file);
  }, []);

  return (
    <Container className="py-12">
      <div className="mb-8 text-center">
        <div className="mb-3 flex justify-center">
          <Scene3DAccent size={120} shape="phone" />
        </div>
        <h1 className="text-2xl font-bold text-[#1C1917] sm:text-3xl">Platform Packs</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[#6f675e]">
          One photo, every format. We crop your best shot to the exact sizes each platform wants — face kept in
          frame — ready to download and post.
        </p>
      </div>

      {paid === false ? (
        <Card className="mx-auto max-w-md text-center">
          <div className="mb-3 text-3xl">🔒</div>
          <h2 className="text-base font-semibold text-[#1C1917]">A Pro perk</h2>
          <p className="mx-auto mt-1 max-w-xs text-xs text-[#857b6e]">
            Platform-ready crops are part of the full report. Unlock once, use it for every photo.
          </p>
          <Link href="/pricing"><Button className="mt-4">Unlock Platform Packs</Button></Link>
        </Card>
      ) : (
        <>
          <Card className="mx-auto max-w-xl text-center">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#1c1917]/12 bg-[#1c1917]/[0.02] p-8 transition-all hover:border-[#E14434]/30 disabled:opacity-50"
            >
              <span className="text-sm text-[#6f675e]">{busy ? "Cropping…" : "Drop or browse your photo"}</span>
              <span className="mt-1 text-xs text-[#9c9184]">Cropped in your browser · nothing uploaded</span>
            </button>
          </Card>

          {packs.length > 0 && (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {packs.map((p) => (
                <Card key={p.key} className="flex flex-col">
                  <p className="mb-2 text-sm font-semibold text-[#1C1917]">{p.emoji} {p.label}</p>
                  <div className="overflow-hidden rounded-xl bg-[#1c1917]/[0.04]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.dataUrl} alt={`${p.label} crop`} className="w-full object-contain" />
                  </div>
                  <p className="mt-2 text-[11px] text-[#9c9184]">{p.note} · {p.dims}</p>
                  <a
                    href={p.dataUrl}
                    download={`aura-${p.key}.jpg`}
                    className="mt-2 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#E14434] to-[#c0341f] px-3 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5"
                  >
                    Download
                  </a>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </Container>
  );
}
