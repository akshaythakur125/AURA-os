"use client";

import { useState } from "react";
import { runAnalysis, type AnalysisOutput } from "@/lib/aura-engine/analyser";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// ponytail: dev-only debug route — shows raw measurements, scores, versions
// Must be excluded from production builds and sitemap

export default function AnalyserDebugPage() {
  const [result, setResult] = useState<AnalysisOutput | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRunning(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const output = await runAnalysis({
          imageDataUrl: reader.result as string,
          goal: "general" as any,
        });
        setResult(output);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed");
      } finally {
        setRunning(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <Container className="py-8">
      <h1 className="mb-2 text-xl font-bold text-white">Analyser Debug</h1>
      <p className="mb-6 text-xs text-gray-500">Development only. Upload an image to inspect raw analysis output.</p>

      <div className="mb-6">
        <label className="inline-block cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <Button size="sm" disabled={running}>
            {running ? "Analysing..." : "Upload Test Image"}
          </Button>
        </label>
      </div>

      {error && <Card className="mb-4 border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">{error}</Card>}

      {result && (
        <div className="space-y-4">
          {/* Versions */}
          <Card>
            <h3 className="mb-2 text-xs font-semibold text-white">Versions</h3>
            <pre className="text-[10px] text-gray-400 overflow-x-auto">{JSON.stringify(result.versions, null, 2)}</pre>
          </Card>

          {/* Quality Gate */}
          <Card>
            <h3 className="mb-2 text-xs font-semibold text-white">Quality Gate</h3>
            <pre className="text-[10px] text-gray-400 overflow-x-auto">{JSON.stringify(result.qualityGate, null, 2)}</pre>
          </Card>

          {/* Score */}
          <Card>
            <h3 className="mb-2 text-xs font-semibold text-white">Score</h3>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-white">{result.overallScore ?? "N/A"}</span>
              <div>
                <p className="text-xs text-gray-400">Category: {result.category}</p>
                <p className="text-xs text-gray-500">Status: {result.status}</p>
                <p className="text-xs text-gray-500">Duration: {Math.round(result.durationMs)}ms</p>
              </div>
            </div>
          </Card>

          {/* Raw Measurements */}
          {result.imageMetrics && (
            <Card>
              <h3 className="mb-2 text-xs font-semibold text-white">Raw Measurements</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(result.imageMetrics)
                  .filter(([k, v]) => typeof v === "number" || typeof v === "string" || typeof v === "boolean")
                  .map(([key, value]) => (
                    <div key={key} className="rounded-lg bg-white/[0.03] p-2">
                      <p className="text-[10px] text-gray-500">{key}</p>
                      <p className="text-xs font-medium text-white">{String(value).slice(0, 50)}</p>
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {/* Verdict */}
          <Card>
            <h3 className="mb-2 text-xs font-semibold text-white">Verdict</h3>
            <p className="text-sm text-gray-300">{result.verdict}</p>
          </Card>
        </div>
      )}
    </Container>
  );
}
