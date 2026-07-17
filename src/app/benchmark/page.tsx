"use client";

import { useState, useRef } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { runAnalysis, type AnalysisOutput } from "@/lib/aura-engine/analyser";

// ponytail: browser-based benchmark runner — upload test images, see analyser output

type BenchmarkResult = {
  fileName: string;
  output: AnalysisOutput;
  duration: number;
};

export default function BenchmarkPage() {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [running, setRunning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setRunning(true);
    const newResults: BenchmarkResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dataUrl = await file.arrayBuffer().then((buf) => {
        const blob = new Blob([buf], { type: file.type });
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      });

      const start = performance.now();
      const output = await runAnalysis({ imageDataUrl: dataUrl, goal: "general" as any });
      newResults.push({ fileName: file.name, output, duration: performance.now() - start });
    }

    setResults(newResults);
    setRunning(false);
  }

  return (
    <Container className="py-8">
      <h1 className="mb-2 text-xl font-bold text-[#1C1917]">Analyser Benchmark</h1>
      <p className="mb-6 text-xs text-[#857b6e]">Upload test images to evaluate analyser output.</p>

      <div className="mb-6">
        <label className="inline-block cursor-pointer">
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          <Button size="sm" disabled={running}>
            {running ? "Running..." : `Upload Test Images (${results.length} loaded)`}
          </Button>
        </label>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#1C1917]">Results</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-[#6f675e]">
              <thead>
                <tr className="border-b border-[#1c1917]/10">
                  <th className="p-2 text-left">File</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Score</th>
                  <th className="p-2 text-left">Quality Gate</th>
                  <th className="p-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    <td className="p-2 text-[#1C1917]">{r.fileName}</td>
                    <td className="p-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        r.output.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                        r.output.status === "rejected" ? "bg-red-500/10 text-red-400" :
                        "bg-yellow-500/10 text-yellow-400"
                      }`}>
                        {r.output.status}
                      </span>
                    </td>
                    <td className="p-2 font-medium text-[#1C1917]">{r.output.overallScore ?? "N/A"}</td>
                    <td className="p-2">
                      {r.output.qualityGate.canProceed ? "✅ Passed" : "❌ Blocked"}
                      {r.output.qualityGate.issues.length > 0 && (
                        <span className="ml-1 text-[10px] text-[#857b6e]">({r.output.qualityGate.issues.join(", ")})</span>
                      )}
                    </td>
                    <td className="p-2">{Math.round(r.duration)}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <Card className="p-4">
            <h3 className="mb-2 text-xs font-semibold text-[#1C1917]">Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-[#857b6e]">Total</p>
                <p className="text-lg font-bold text-[#1C1917]">{results.length}</p>
              </div>
              <div>
                <p className="text-[#857b6e]">Passed</p>
                <p className="text-lg font-bold text-emerald-400">{results.filter(r => r.output.status === "completed").length}</p>
              </div>
              <div>
                <p className="text-[#857b6e]">Rejected</p>
                <p className="text-lg font-bold text-red-400">{results.filter(r => r.output.status === "rejected").length}</p>
              </div>
              <div>
                <p className="text-[#857b6e]">Avg Duration</p>
                <p className="text-lg font-bold text-[#1C1917]">{Math.round(results.reduce((s, r) => s + r.duration, 0) / results.length)}ms</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Container>
  );
}
