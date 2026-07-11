"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FadeInView } from "@/components/ui/FadeInView";
import { BeforeAfterViewer } from "./BeforeAfterViewer";
import { applyTransform, TRANSFORM_PRESETS, type TransformParams } from "@/lib/aura-twin/transforms";

type Props = {
  imageDataUrl: string;
  auditId?: string;
  topFinding?: string;
  findingCategory?: string;
};

export function AuraTwinWorkspace({ imageDataUrl, auditId, topFinding, findingCategory }: Props) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [history, setHistory] = useState<{ id: string; label: string; url: string; params: TransformParams }[]>([]);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load original image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { imgRef.current = img; };
    img.src = imageDataUrl;
  }, [imageDataUrl]);

  // Find recommended preset based on audit finding
  const recommended = TRANSFORM_PRESETS.find(
    (p) => findingCategory && p.category === findingCategory
  ) || TRANSFORM_PRESETS[0];

  const handleApply = useCallback((presetId: string) => {
    if (!imgRef.current) return;
    const preset = TRANSFORM_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setProcessing(true);
    // ponytail: setTimeout so UI updates before heavy canvas work
    setTimeout(() => {
      const result = applyTransform(imgRef.current!, preset.params);
      setResultUrl(result);
      setSelectedPreset(presetId);
      setProcessing(false);
      setHistory((prev) => [...prev, { id: presetId + Date.now(), label: preset.label, url: result, params: preset.params }]);
    }, 50);
  }, []);

  const handleReset = useCallback(() => {
    setResultUrl(null);
    setSelectedPreset(null);
  }, []);

  const activePreset = TRANSFORM_PRESETS.find((p) => p.id === selectedPreset);

  return (
    <Container className="py-8 sm:py-12">
      <FadeInView>
        <Link href={auditId ? `/audit/${auditId}` : "/"} className="mb-6 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-white">
          ← Back to {auditId ? "report" : "home"}
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Aura Twin Studio</h1>
          <p className="mt-2 text-sm text-gray-400">
            Preview improvements to your photo before making changes in real life.
          </p>
          <p className="mt-1 text-[10px] text-gray-600">
            All processing happens locally in your browser. Your image never leaves your device.
          </p>
        </div>
      </FadeInView>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Preview area */}
        <FadeInView delay={100}>
          <div>
            {resultUrl ? (
              <BeforeAfterViewer
                beforeSrc={imageDataUrl}
                afterSrc={resultUrl}
                width={600}
                height={400}
              />
            ) : (
              <div className="relative overflow-hidden rounded-xl border border-white/[0.06]">
                <img src={imageDataUrl} alt="Your uploaded photo" className="w-full max-h-[400px] object-contain" />
              </div>
            )}

            {/* Limitation notice */}
            <p className="mt-3 text-[10px] text-gray-600 text-center">
              This preview estimates how the change may affect the image. Real results depend on your camera, environment, and actual adjustments.
            </p>

            {/* Action buttons */}
            <div className="mt-4 flex gap-2">
              {resultUrl && (
                <Button variant="secondary" size="sm" onClick={handleReset}>
                  Reset to Original
                </Button>
              )}
              {resultUrl && (
                <a href={resultUrl} download="aura-twin-preview.jpg">
                  <Button variant="secondary" size="sm">Save Preview</Button>
                </a>
              )}
            </div>
          </div>
        </FadeInView>

        {/* Controls sidebar */}
        <FadeInView delay={200}>
          <div className="space-y-4">
            {/* Recommended transformation */}
            {recommended && (
              <Card className="border-violet-500/20 bg-violet-500/[0.04]">
                <p className="mb-2 text-xs font-semibold text-violet-300">Preview My Top Improvement</p>
                <p className="mb-2 text-xs text-gray-400">{recommended.description}</p>
                {topFinding && (
                  <p className="mb-3 text-[10px] text-gray-500">Addresses: {topFinding}</p>
                )}
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleApply(recommended.id)}
                  disabled={processing}
                >
                  {processing ? "Processing..." : "Preview This Improvement"}
                </Button>
              </Card>
            )}

            {/* All transformations */}
            <Card>
              <p className="mb-3 text-xs font-semibold text-white">Choose Another Change</p>
              <div className="space-y-2">
                {TRANSFORM_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApply(preset.id)}
                    disabled={processing}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                      selectedPreset === preset.id
                        ? "border-violet-500/30 bg-violet-500/10 text-white"
                        : "border-white/[0.06] bg-white/[0.02] text-gray-400 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="font-medium">{preset.label}</div>
                    <div className="mt-0.5 text-[10px] text-gray-500">{preset.category} · {preset.confidence} confidence</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Active transformation details */}
            {activePreset && (
              <Card>
                <p className="mb-2 text-xs font-semibold text-white">What this does</p>
                <p className="mb-2 text-xs text-gray-400">{activePreset.description}</p>
                <div className="rounded-lg bg-emerald-500/[0.04] border border-emerald-500/15 p-2">
                  <p className="text-[10px] font-medium text-emerald-400">Real-world action:</p>
                  <p className="text-[10px] text-gray-400">{activePreset.action}</p>
                </div>
                <p className="mt-2 text-[10px] text-gray-600">
                  Processing: Local (Canvas API) · Confidence: {activePreset.confidence}
                </p>
              </Card>
            )}

            {/* History */}
            {history.length > 1 && (
              <Card>
                <p className="mb-2 text-xs font-semibold text-white">Variants ({history.length})</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {history.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setResultUrl(h.url)}
                      className="shrink-0 rounded-lg border border-white/[0.06] bg-white/[0.02] p-1 hover:bg-white/[0.06]"
                    >
                      <img src={h.url} alt={h.label} className="h-12 w-12 rounded-md object-cover" />
                      <p className="mt-1 text-[9px] text-gray-500">{h.label}</p>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </FadeInView>
      </div>
    </Container>
  );
}
