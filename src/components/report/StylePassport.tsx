"use client";

import { useMemo, useState } from "react";
import { buildStylePassport, type FaceShape, type Undertone } from "@/lib/style/passport";
import { buildStylePassportHtml } from "@/lib/share/passportArtifact";
import { downloadTextFile } from "@/lib/share/download";

const SHAPES: { id: FaceShape; label: string }[] = [
  { id: "oval", label: "Oval" },
  { id: "round", label: "Round" },
  { id: "square", label: "Square" },
  { id: "oblong", label: "Oblong" },
  { id: "heart", label: "Heart" },
  { id: "diamond", label: "Diamond" },
];

function Chips({ items, accent }: { items: string[]; accent?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span
          key={i}
          className={`rounded-full border px-2.5 py-1 text-[11px] ${accent ? "border-[#E14434]/30 bg-[#E14434]/[0.05] text-[#B23A25]" : "border-[#1c1917]/10 bg-[#1c1917]/[0.03] text-[#4a443d]"}`}
        >
          {i}
        </span>
      ))}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#857b6e] first:mt-0">{children}</p>;
}

/**
 * The Style Passport — one card that consolidates the permanent style facts a
 * user would otherwise google across half a dozen sites (face shape → haircuts/
 * glasses/necklines, undertone → power colours + metals + frames, archetype,
 * scent, grooming), and lets them download it to carry whenever they shop, get
 * a haircut, or buy glasses. All from data the scan already produced.
 */
export function StylePassport({
  imageDataUrl,
  undertone,
  undertoneConfident = true,
  paletteName,
  powerColors,
  avoidColors,
  archetype,
  detectedStyle,
  scentFamilies,
  scentReason,
  groomingFocus,
  goal,
  initialFaceShape,
}: {
  imageDataUrl?: string;
  undertone?: Undertone;
  undertoneConfident?: boolean;
  paletteName?: string;
  powerColors?: string[];
  avoidColors?: string[];
  archetype?: string;
  detectedStyle?: string;
  scentFamilies?: string[];
  scentReason?: string;
  groomingFocus?: string;
  goal?: string;
  initialFaceShape?: FaceShape;
}) {
  const [faceShape, setFaceShape] = useState<FaceShape | undefined>(initialFaceShape);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "no-face" | "error">("idle");

  const data = useMemo(
    () =>
      buildStylePassport({
        faceShape,
        undertone,
        undertoneConfident,
        paletteName,
        powerColors,
        avoidColors,
        archetype,
        detectedStyle,
        scentFamilies,
        scentReason,
        groomingFocus,
        goal,
      }),
    [faceShape, undertone, undertoneConfident, paletteName, powerColors, avoidColors, archetype, detectedStyle, scentFamilies, scentReason, groomingFocus, goal],
  );

  async function runScan() {
    if (!imageDataUrl) return;
    setScanState("scanning");
    try {
      const { scanFace, loadImage } = await import("@/lib/face/faceScan");
      const img = await loadImage(imageDataUrl);
      const res = await scanFace(img);
      if (!res) { setScanState("no-face"); return; }
      setFaceShape(res.shape as FaceShape);
      setScanState("idle");
    } catch {
      setScanState("error");
    }
  }

  return (
    <div className="rounded-2xl border border-[#E14434]/20 bg-gradient-to-b from-[#E14434]/[0.05] to-transparent p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B23A25]">Aura Style Passport</p>
          <h3 className="mt-0.5 text-base font-bold text-[#1C1917]">Your style, in one card you keep</h3>
          <p className="mt-1 text-xs text-[#6f675e]">The answers you&apos;d otherwise hunt across six sites — face shape, colours, frames, scent, grooming — saved in one place. Pull it up whenever you shop or get a haircut.</p>
        </div>
      </div>

      {data.headline && (
        <div className="mt-4 rounded-xl border border-[#1c1917]/[0.08] bg-white/60 px-3.5 py-2.5">
          <p className="text-sm font-semibold text-[#1C1917]">{data.headline}</p>
        </div>
      )}

      {/* Face shape — detect or pick */}
      <div className="mt-4">
        <Label>Face shape {faceShape ? `— ${faceShape}` : ""}</Label>
        {imageDataUrl && !faceShape && (
          <button
            onClick={runScan}
            disabled={scanState === "scanning"}
            className="mb-2 w-full rounded-xl bg-gradient-to-r from-[#E14434] to-[#c0341f] px-4 py-2.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {scanState === "scanning" ? "Scanning your face…" : "✨ Scan my face to complete the passport"}
          </button>
        )}
        {scanState === "no-face" && <p className="mb-1.5 text-[11px] text-[#857b6e]">Couldn&apos;t find a clear face — pick your shape below.</p>}
        {scanState === "error" && <p className="mb-1.5 text-[11px] text-[#857b6e]">Scan unavailable — pick your shape below.</p>}
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              onClick={() => setFaceShape(s.id)}
              className={`rounded-lg border px-2 py-1.5 text-center text-[11px] font-semibold transition-all ${faceShape === s.id ? "border-[#E14434]/50 bg-[#E14434]/[0.08] text-[#B23A25]" : "border-[#1c1917]/10 bg-[#1c1917]/[0.02] text-[#1C1917] hover:border-[#1c1917]/20"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        {imageDataUrl && <p className="mt-1.5 text-[10px] text-[#9c9184]">Runs in your browser — your photo never leaves your device.</p>}
      </div>

      {data.face && (
        <div className="mt-3 rounded-xl border border-[#1c1917]/[0.06] bg-white/40 p-3.5">
          <Label>💇 Haircuts</Label>
          <Chips items={data.face.haircuts} />
          <Label>👓 Glasses shapes</Label>
          <Chips items={data.face.glasses} />
          <Label>👕 Necklines that suit you</Label>
          <Chips items={data.face.necklines} />
          <Label>🧔 Beard / facial hair</Label>
          <Chips items={data.face.beard} />
          <p className="mt-2.5 text-[11px] text-[#9c9184]">✕ {data.face.avoid}</p>
        </div>
      )}

      {/* Colour */}
      {(data.powerColors.length > 0 || data.metals.length > 0) && (
        <div className="mt-3 rounded-xl border border-[#1c1917]/[0.06] bg-white/40 p-3.5">
          <p className="text-xs font-semibold text-[#1C1917]">Colour{data.undertone ? ` — ${data.undertone}${data.undertoneConfident ? "" : "-leaning"} undertone` : ""}</p>
          {data.powerColors.length > 0 && (<><Label>Wear these — your power colours</Label><Chips items={data.powerColors} accent /></>)}
          {data.avoidColors.length > 0 && (<><Label>Skip these near your face</Label><Chips items={data.avoidColors} /></>)}
          {data.metals.length > 0 && (<><Label>Metals & jewellery</Label><Chips items={data.metals} /></>)}
          {data.frameColors.length > 0 && (<><Label>Frame colours</Label><Chips items={data.frameColors} /></>)}
        </div>
      )}

      {/* Identity */}
      {(data.archetype || data.scent || data.groomingFocus) && (
        <div className="mt-3 rounded-xl border border-[#1c1917]/[0.06] bg-white/40 p-3.5">
          {data.archetype && (<><Label>Style archetype</Label><p className="text-sm font-semibold text-[#1C1917]">{data.archetype}</p></>)}
          {data.scent && (<><Label>Signature scent family</Label><p className="text-sm font-semibold text-[#1C1917]">{data.scent.label}</p><p className="mt-0.5 text-[11px] text-[#857b6e]">{data.scent.note}</p></>)}
          {data.groomingFocus && (<><Label>Grooming focus</Label><p className="text-sm font-semibold text-[#1C1917]">{data.groomingFocus}</p></>)}
        </div>
      )}

      <button
        onClick={() => downloadTextFile(buildStylePassportHtml(data), "my-style-passport.html", "text/html")}
        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#1C1917] px-4 py-2.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5"
      >
        ⬇ Save my passport (keep it on your phone)
      </button>
    </div>
  );
}
