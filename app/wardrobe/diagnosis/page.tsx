"use client";

import { useState, useRef } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VisualWardrobeSection } from "@/components/visual-wardrobe/VisualWardrobeSection";
import type { VisualWardrobeDiagnosis } from "@/types/visualWardrobe";

export default function WardrobeDiagnosisPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<VisualWardrobeDiagnosis | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const url = reader.result as string;
      setImageDataUrl(url);
      await runDiagnosis(url);
    };
    reader.readAsDataURL(file);
  }

  async function runDiagnosis(url: string, goal?: string) {
    setLoading(true);
    setProgress("Starting diagnosis...");
    try {
      const { generateVisualWardrobeDiagnosis } = await import("@/lib/visual-wardrobe/visualWardrobeDiagnosis");
      const result = await generateVisualWardrobeDiagnosis(url, {
        goal,
        onProgress: setProgress,
      });
      setDiagnosis(result);
    } catch (err) {
      setProgress("Error: " + (err instanceof Error ? err.message : "Diagnosis failed"));
    }
    setLoading(false);
  }

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-white">Visual Wardrobe Diagnosis</h1>
          <p className="mx-auto max-w-xl text-sm text-gray-400">
            Upload a photo to analyze your current visual palette, detect wardrobe gaps, and get personalized clothing recommendations.
            AuraCheck analyzes presentation — not human worth.
          </p>
        </div>

        {/* Upload */}
        {!imageDataUrl && (
          <Card>
            <div className="py-12 text-center">
              <div className="mb-4 text-4xl">📷</div>
              <p className="mb-4 text-sm text-gray-400">Upload a full-body or upper-body photo</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
              <Button onClick={() => fileRef.current?.click()}>Choose Photo</Button>
            </div>
          </Card>
        )}

        {/* Image preview */}
        {imageDataUrl && (
          <Card className="mb-6">
            <div className="flex items-start gap-4">
              <img
                src={imageDataUrl}
                alt="Uploaded"
                className="h-32 w-24 rounded-lg object-cover"
              />
              <div>
                <p className="text-xs text-gray-400">Photo uploaded</p>
                <label className="mt-2 inline-block cursor-pointer text-xs text-purple-400 hover:underline">
                  <span onClick={() => fileRef.current?.click()}>Choose different photo</span>
                </label>
              </div>
            </div>
          </Card>
        )}

        {/* Progress */}
        {loading && (
          <Card>
            <div className="py-8 text-center">
              <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-purple-500" />
              </div>
              <p className="text-xs text-gray-400">{progress}</p>
            </div>
          </Card>
        )}

        {/* Diagnosis result */}
        {diagnosis && !loading && (
          <VisualWardrobeSection diagnosis={diagnosis} />
        )}

        {/* Error */}
        {!loading && progress.startsWith("Error") && (
          <Card className="border-red-500/20">
            <p className="text-sm text-red-400">{progress}</p>
          </Card>
        )}

        {/* Disclaimer */}
        <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center text-[10px] text-gray-600">
          <p>AuraCheck analyzes presentation signals (colors, contrast, composition) — not human worth.</p>
          <p className="mt-1">No face recognition, body rating, or protected trait inference is used.</p>
          <p className="mt-1">All analysis runs locally in your browser. No image data is sent to any server.</p>
        </div>
      </div>
    </Container>
  );
}
