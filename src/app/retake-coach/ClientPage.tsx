"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Scene3DAccent } from "@/components/hero/Scene3DAccent";
import { analyzeImageDataUrl } from "@/lib/aura-engine/imageMetrics";
import { hasAnyUnlock } from "@/lib/storage/unlockStore";

interface Hint {
  id: string;
  ok: boolean;
  text: string;
}

export default function RetakeCoachClient() {
  const [paid, setPaid] = useState<boolean | null>(null);
  const [camState, setCamState] = useState<"idle" | "starting" | "live" | "denied" | "unsupported">("idle");
  const [score, setScore] = useState<number | null>(null);
  const [hints, setHints] = useState<Hint[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    try { setPaid(hasAnyUnlock()); } catch { setPaid(false); }
  }, []);

  const analyseFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;
    const w = 256;
    const h = Math.round((video.videoHeight / video.videoWidth) * 256) || 256;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    let dataUrl: string;
    try { dataUrl = canvas.toDataURL("image/jpeg", 0.7); } catch { return; }
    try {
      const m = (await analyzeImageDataUrl(dataUrl)) as unknown as Record<string, any>;
      const light = m.lightingScore ?? 50;
      const clarity = m.clarityScore ?? 50;
      const faceArea = m.faceDetected ? (m.faceAreaPct ?? m.qualityGate?.faceAreaPercent ?? 10) : 0;
      const bgComplex = m.backgroundComplexityEstimate ?? 50;
      const comp = m.compositionScore ?? 50;

      const next: Hint[] = [
        { id: "face", ok: m.faceDetected && faceArea >= 6 && faceArea <= 45,
          text: !m.faceDetected ? "Get your face in frame" : faceArea < 6 ? "Move closer — fill more of the frame" : faceArea > 45 ? "Back up slightly" : "Framing looks good" },
        { id: "light", ok: light >= 55,
          text: light >= 55 ? "Lighting is good" : "Find more light — face a window" },
        { id: "clarity", ok: clarity >= 55,
          text: clarity >= 55 ? "Nice and sharp" : "Hold steady & clean your lens" },
        { id: "bg", ok: bgComplex <= 55,
          text: bgComplex <= 55 ? "Clean background" : "Simplify your background" },
      ];
      setHints(next);
      setScore(Math.round(0.3 * light + 0.3 * clarity + 0.25 * comp + 0.15 * (100 - bgComplex)));
    } catch { /* transient */ }
  }, []);

  // Poll frames while live
  useEffect(() => {
    if (camState !== "live") return;
    let active = true;
    const loop = async () => {
      if (!active) return;
      await analyseFrame();
      if (active) rafRef.current = window.setTimeout(loop, 1400) as unknown as number;
    };
    loop();
    return () => {
      active = false;
      if (rafRef.current) clearTimeout(rafRef.current);
    };
  }, [camState, analyseFrame]);

  const start = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCamState("unsupported");
      return;
    }
    setCamState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 1280 }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCamState("live");
    } catch {
      setCamState("denied");
    }
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const ring = score ?? 0;

  return (
    <Container className="py-12">
      <div className="mb-8 text-center">
        <div className="mb-3 flex justify-center">
          <Scene3DAccent size={120} shape="model" />
        </div>
        <h1 className="text-2xl font-bold text-[#1C1917] sm:text-3xl">Retake Coach</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[#6f675e]">
          Live camera guidance. We read your framing, light, sharpness, and background in real time and nudge you
          until the shot is dialed in — then you take it.
        </p>
      </div>

      {paid === false ? (
        <Card className="mx-auto max-w-md text-center">
          <div className="mb-3 text-3xl">🔒</div>
          <h2 className="text-base font-semibold text-[#1C1917]">A Pro perk</h2>
          <p className="mx-auto mt-1 max-w-xs text-xs text-[#857b6e]">
            Real-time retake coaching is part of the full report. Unlock once, use it anytime.
          </p>
          <Link href="/pricing"><Button className="mt-4">Unlock Retake Coach</Button></Link>
        </Card>
      ) : (
        <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
          {/* Camera */}
          <Card className="overflow-hidden">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#1c1917]">
              <video ref={videoRef} playsInline muted className="h-full w-full object-cover" style={{ transform: "scaleX(-1)" }} />
              {/* rule-of-thirds guide */}
              {camState === "live" && (
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute left-1/3 top-0 h-full w-px bg-white/20" />
                  <div className="absolute left-2/3 top-0 h-full w-px bg-white/20" />
                  <div className="absolute left-0 top-1/3 h-px w-full bg-white/20" />
                  <div className="absolute left-0 top-2/3 h-px w-full bg-white/20" />
                </div>
              )}
              {camState !== "live" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  {camState === "denied" && <p className="text-sm text-white/80">Camera access was blocked. Enable it in your browser, or <Link href="/audit/new" className="underline">upload a photo instead</Link>.</p>}
                  {camState === "unsupported" && <p className="text-sm text-white/80">Your browser doesn&apos;t support live camera. <Link href="/audit/new" className="underline">Upload a photo instead</Link>.</p>}
                  {(camState === "idle" || camState === "starting") && (
                    <Button onClick={start} disabled={camState === "starting"}>
                      {camState === "starting" ? "Starting camera…" : "Start camera"}
                    </Button>
                  )}
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </Card>

          {/* Live coaching */}
          <div>
            <Card className="mb-4 text-center">
              <p className="text-xs text-[#857b6e]">Live shot score</p>
              <p className="text-4xl font-bold text-[#1C1917]">{score !== null ? score : "—"}</p>
              <div className="mx-auto mt-2 h-1.5 max-w-[200px] overflow-hidden rounded-full bg-[#1c1917]/[0.06]">
                <div className="h-full rounded-full bg-gradient-to-r from-[#E14434] to-[#c0341f] transition-all duration-500" style={{ width: `${ring}%` }} />
              </div>
              <p className="mt-2 text-[11px] text-[#9c9184]">
                {camState === "live" ? (ring >= 75 ? "Great — take the shot!" : "Adjust until the bar fills") : "Start the camera to begin"}
              </p>
            </Card>

            <div className="space-y-2">
              {(hints.length ? hints : [
                { id: "face", ok: false, text: "Get your face in frame" },
                { id: "light", ok: false, text: "Find good, even light" },
                { id: "clarity", ok: false, text: "Hold steady & clean your lens" },
                { id: "bg", ok: false, text: "Keep the background clean" },
              ]).map((h) => (
                <div key={h.id} className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition-colors ${h.ok ? "border-emerald-500/25 bg-emerald-500/[0.06]" : "border-[#1c1917]/10 bg-[#1c1917]/[0.02]"}`}>
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${h.ok ? "bg-emerald-500 text-white" : "bg-[#1c1917]/10 text-[#857b6e]"}`}>
                    {h.ok ? "✓" : "•"}
                  </span>
                  <span className={`text-xs ${h.ok ? "text-emerald-700" : "text-[#4a443d]"}`}>{h.text}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[10px] text-[#9c9184]">
              Frames are analyzed in your browser and never uploaded or stored.
            </p>
          </div>
        </div>
      )}
    </Container>
  );
}
