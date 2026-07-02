"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FeedMappingPreview } from "./FeedMappingPreview";
import type { ImportPreviewResult } from "@/types/feedImport";

type Step = "choose" | "upload" | "preview" | "importing" | "result";
type SourceType = "manual_csv" | "manual_json" | "affiliate_csv" | "affiliate_json";

interface Props {
  onImportComplete?: (result: { importedCount: number; updatedCount: number; warnings: string[] }) => void;
}

export function FeedImportWizard({ onImportComplete }: Props) {
  const [step, setStep] = useState<Step>("choose");
  const [sourceType, setSourceType] = useState<SourceType>("manual_csv");
  const [storeKey, setStoreKey] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [importResult, setImportResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setStep("choose");
    setFile(null);
    setPreview(null);
    setImportResult(null);
    setError(null);
  }

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sourceType", sourceType);
      formData.append("sourceName", storeKey || sourceType);
      if (storeKey) formData.append("storeKey", storeKey);
      formData.append("preview", "true");

      const res = await fetch("/api/commerce/feed/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setPreview(data.preview);
        setStep("preview");
      } else {
        setError(data.error || "Preview failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setStep("importing");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sourceType", sourceType);
      formData.append("sourceName", storeKey || sourceType);
      if (storeKey) formData.append("storeKey", storeKey);

      const res = await fetch("/api/commerce/feed/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setImportResult(data.result);
        setStep("result");
        onImportComplete?.({
          importedCount: data.result.importedCount,
          updatedCount: data.result.updatedCount,
          warnings: data.result.warnings,
        });
      } else {
        setError(data.error || "Import failed");
        setStep("preview");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
      setStep("preview");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Step 1: Choose */}
      {step === "choose" && (
        <Card>
          <h3 className="mb-4 text-lg font-bold text-white">Import Products</h3>
          <div className="mb-4">
            <div className="mb-2 text-xs font-medium text-gray-500">Source Type</div>
            <div className="flex flex-wrap gap-2">
              {(["manual_csv", "manual_json", "affiliate_csv", "affiliate_json"] as SourceType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSourceType(type)}
                  className={`rounded-full px-4 py-1.5 text-xs transition-all ${
                    sourceType === type
                      ? "bg-purple-500/20 text-purple-300"
                      : "bg-white/5 text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {type.replace(/_/g, " ").toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-xs text-gray-500">Store (optional, for store-specific feeds)</label>
            <select
              value={storeKey}
              onChange={(e) => setStoreKey(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
            >
              <option value="">Auto-detect from feed</option>
              <option value="myntra">Myntra</option>
              <option value="ajio">AJIO</option>
              <option value="amazon_fashion">Amazon Fashion</option>
              <option value="flipkart_fashion">Flipkart Fashion</option>
              <option value="tata_cliq">Tata CLiQ</option>
              <option value="nykaa_fashion">Nykaa Fashion</option>
              <option value="meesho">Meesho</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setStep("upload")}>Continue</Button>
            <Button variant="outline" onClick={() => window.open("/api/commerce/feed/template?format=csv", "_blank")}>
              Download CSV Template
            </Button>
            <Button variant="outline" onClick={() => window.open("/api/commerce/feed/template?format=json", "_blank")}>
              Download JSON Template
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Upload */}
      {step === "upload" && (
        <Card>
          <h3 className="mb-4 text-lg font-bold text-white">Upload Feed File</h3>
          <p className="mb-4 text-xs text-gray-500">
            Upload a {sourceType.includes("csv") ? "CSV" : "JSON"} file with product data.
            Fields are auto-detected from column/field names.
          </p>
          <div className="mb-4">
            <input
              type="file"
              accept={sourceType.includes("csv") ? ".csv" : ".json"}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-400 file:mr-3 file:rounded-xl file:border-0 file:bg-purple-500/10 file:px-4 file:py-2 file:text-xs file:text-purple-300"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={!file || loading}>
              {loading ? "Detecting..." : "Preview"}
            </Button>
            <Button variant="ghost" onClick={reset}>Cancel</Button>
          </div>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </Card>
      )}

      {/* Step 3: Preview */}
      {step === "preview" && preview && (
        <Card>
          <h3 className="mb-4 text-lg font-bold text-white">Import Preview</h3>
          <FeedMappingPreview preview={preview} />
          <div className="mt-4 flex gap-2">
            <Button onClick={handleImport} disabled={loading || preview.validRows.length === 0}>
              {loading ? "Importing..." : `Import ${preview.validRows.length} valid rows`}
            </Button>
            <Button variant="ghost" onClick={reset}>Cancel</Button>
          </div>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </Card>
      )}

      {/* Step 4: Result */}
      {step === "result" && importResult && (
        <Card>
          <h3 className="mb-4 text-lg font-bold text-white">Import Complete</h3>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
              <div className="text-2xl font-bold text-emerald-400">{importResult.importedCount as number}</div>
              <div className="text-xs text-gray-500">Imported</div>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{importResult.updatedCount as number}</div>
              <div className="text-xs text-gray-500">Updated</div>
            </div>
            <div className="rounded-lg bg-amber-500/10 p-3 text-center">
              <div className="text-2xl font-bold text-amber-400">{importResult.skippedCount as number}</div>
              <div className="text-xs text-gray-500">Skipped</div>
            </div>
            <div className="rounded-lg bg-red-500/10 p-3 text-center">
              <div className="text-2xl font-bold text-red-400">{importResult.invalidCount as number}</div>
              <div className="text-xs text-gray-500">Invalid</div>
            </div>
          </div>
          {(importResult.warnings as string[]).length > 0 && (
            <div className="mt-3 rounded-lg bg-amber-500/5 p-2">
              <p className="text-xs text-amber-400 font-medium">Warnings:</p>
              <ul className="mt-1 list-inside list-disc text-[10px] text-gray-400">
                {(importResult.warnings as string[]).slice(0, 10).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
          {(importResult.errors as string[]).length > 0 && (
            <div className="mt-3 rounded-lg bg-red-500/5 p-2">
              <p className="text-xs text-red-400 font-medium">Errors:</p>
              <ul className="mt-1 list-inside list-disc text-[10px] text-gray-400">
                {(importResult.errors as string[]).slice(0, 10).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <Button onClick={reset}>Import Another</Button>
            <Button variant="outline" onClick={() => window.location.href = "/admin/commerce/search"}>
              View Search Admin
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
