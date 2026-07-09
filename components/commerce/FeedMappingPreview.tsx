"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import type { ImportPreviewResult } from "@/types/feedImport";

interface Props {
  preview: ImportPreviewResult;
}

export function FeedMappingPreview({ preview }: Props) {
  const [tab, setTab] = useState<"valid" | "warnings" | "invalid">("valid");

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-white/5 p-3 text-center">
          <div className="text-xl font-bold text-white">{preview.totalRows}</div>
          <div className="text-[10px] text-gray-500">Total Rows</div>
        </div>
        <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
          <div className="text-xl font-bold text-emerald-400">{preview.validRows.length}</div>
          <div className="text-[10px] text-gray-500">Valid</div>
        </div>
        <div className="rounded-lg bg-amber-500/10 p-3 text-center">
          <div className="text-xl font-bold text-amber-400">{preview.warningRows.length}</div>
          <div className="text-[10px] text-gray-500">With Warnings</div>
        </div>
        <div className="rounded-lg bg-red-500/10 p-3 text-center">
          <div className="text-xl font-bold text-red-400">{preview.invalidRows.length}</div>
          <div className="text-[10px] text-gray-500">Invalid</div>
        </div>
      </div>

      {/* Field Mappings */}
      <div>
        <h4 className="mb-2 text-xs font-semibold text-gray-400">Detected Field Mappings</h4>
        <div className="flex flex-wrap gap-1.5">
          {preview.mappings.map((m) => (
            <span
              key={m.sourceColumn}
              className={`rounded px-2 py-0.5 text-[10px] ${
                m.required
                  ? "bg-purple-500/20 text-purple-300"
                  : "bg-white/5 text-gray-400"
              }`}
              title={`→ ${m.targetField}${m.required ? " (required)" : ""}`}
            >
              {m.sourceColumn}
              <span className="ml-1 text-gray-600">→ {m.targetField}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setTab("valid")}
          className={`text-xs ${tab === "valid" ? "text-white font-semibold" : "text-gray-500"}`}
        >
          Valid ({preview.validRows.length})
        </button>
        <button
          onClick={() => setTab("warnings")}
          className={`text-xs ${tab === "warnings" ? "text-amber-400 font-semibold" : "text-gray-500"}`}
        >
          Warnings ({preview.warningRows.length})
        </button>
        <button
          onClick={() => setTab("invalid")}
          className={`text-xs ${tab === "invalid" ? "text-red-400 font-semibold" : "text-gray-500"}`}
        >
          Invalid ({preview.invalidRows.length})
        </button>
      </div>

      {/* Valid Rows Preview */}
      {tab === "valid" && (
        <div className="max-h-60 overflow-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-white/10 text-left text-gray-500">
                <th className="py-1 pr-2">#</th>
                <th className="py-1 pr-2">Title</th>
                <th className="py-1 pr-2">Store</th>
                <th className="py-1 pr-2">Price</th>
                <th className="py-1 pr-2">MRP</th>
              </tr>
            </thead>
            <tbody>
              {preview.validRows.slice(0, 20).map((row, i) => (
                <tr key={i} className="border-b border-white/5 text-gray-300">
                  <td className="py-1 pr-2 text-gray-500">{i + 1}</td>
                  <td className="py-1 pr-2">{row.title}</td>
                  <td className="py-1 pr-2">{row.storeName || row.storeKey}</td>
                  <td className="py-1 pr-2">₹{row.price}</td>
                  <td className="py-1 pr-2">{row.mrp ? `₹${row.mrp}` : "—"}</td>
                </tr>
              ))}
              {preview.validRows.length > 20 && (
                <tr>
                  <td colSpan={5} className="py-2 text-center text-gray-500">
                    ... and {preview.validRows.length - 20} more
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Warning Rows */}
      {tab === "warnings" && (
        <div className="space-y-2">
          {preview.warningRows.map((w, i) => (
            <div key={i} className="rounded-lg bg-amber-500/5 p-2">
              <div className="flex items-start justify-between">
                <span className="text-xs text-gray-300">Row {w.row}</span>
                <Badge variant="default" className="bg-amber-500/20 text-[10px]">
                  {w.warnings.length} warnings
                </Badge>
              </div>
              <ul className="mt-1 list-inside list-disc text-[10px] text-amber-400/80">
                {w.warnings.map((msg, j) => (
                  <li key={j}>{msg}</li>
                ))}
              </ul>
            </div>
          ))}
          {preview.warningRows.length === 0 && (
            <p className="text-center text-xs text-gray-500">No warnings</p>
          )}
        </div>
      )}

      {/* Invalid Rows */}
      {tab === "invalid" && (
        <div className="space-y-2">
          {preview.invalidRows.map((iv, i) => (
            <div key={i} className="rounded-lg bg-red-500/5 p-2">
              <div className="flex items-start justify-between">
                <span className="text-xs text-gray-300">Row {iv.row}</span>
                <Badge variant="danger" className="text-[10px]">
                  {iv.errors.length} errors
                </Badge>
              </div>
              <ul className="mt-1 list-inside list-disc text-[10px] text-red-400/80">
                {iv.errors.map((err, j) => (
                  <li key={j}>{err}</li>
                ))}
              </ul>
            </div>
          ))}
          {preview.invalidRows.length === 0 && (
            <p className="text-center text-xs text-gray-500">No invalid rows</p>
          )}
        </div>
      )}
    </div>
  );
}
