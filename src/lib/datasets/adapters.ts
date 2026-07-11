/**
 * ponytail: dataset adapters — download, verify, index, normalize annotations.
 * One adapter per dataset. Manual-download datasets just verify + index.
 */

import type { DatasetPurpose, DatasetLicenceStatus } from "./types";

// ─── Types ───

export type DownloadResult = { success: boolean; path: string; fileCount: number; error?: string };
export type VerifyResult = { valid: boolean; fileCount: number; missing: string[]; corrupted: string[] };
export type IndexResult = { indexed: number; skipped: number; errors: string[] };

export type DatasetAdapter = {
  id: string;
  name: string;
  purpose: DatasetPurpose[];
  licenceStatus: DatasetLicenceStatus;
  downloadMethod: "automatic" | "manual" | "authenticated";
  download?(dest: string): Promise<DownloadResult>;
  verify(dest: string): Promise<VerifyResult>;
  index(dest: string): Promise<IndexResult>;
};

// ─── Generic manual-download adapter ───

function manualAdapter(config: {
  id: string; name: string; purpose: DatasetPurpose[];
  licenceStatus: DatasetLicenceStatus;
  expectedFiles?: string[];
}): DatasetAdapter {
  return {
    id: config.id,
    name: config.name,
    purpose: config.purpose,
    licenceStatus: config.licenceStatus,
    downloadMethod: "manual",
    async verify(dest: string): Promise<VerifyResult> {
      // ponytail: just check if directory exists and has files
      try {
        const { readdirSync, statSync } = await import("fs");
        const entries = readdirSync(dest);
        const fileCount = entries.filter(e => statSync(`${dest}/${e}`).isFile()).length;
        return { valid: fileCount > 0, fileCount, missing: [], corrupted: [] };
      } catch {
        return { valid: false, fileCount: 0, missing: config.expectedFiles || [], corrupted: [] };
      }
    },
    async index(dest: string): Promise<IndexResult> {
      // ponytail: count files, return basic index
      try {
        const { readdirSync, statSync } = await import("fs");
        const entries = readdirSync(dest);
        const files = entries.filter(e => statSync(`${dest}/${e}`).isFile());
        return { indexed: files.length, skipped: 0, errors: [] };
      } catch {
        return { indexed: 0, skipped: 0, errors: ["Directory not found"] };
      }
    },
  };
}

// ─── Concrete adapters ───

export const SPAQAdapter: DatasetAdapter = manualAdapter({
  id: "spaqp",
  name: "SPAQ — Smartphone Photography Attribute and Quality",
  purpose: ["smartphone-quality"],
  licenceStatus: "research-only",
  expectedFiles: ["SPAQ_test", "SPAQ_train"],
});

export const KonIQ10kAdapter: DatasetAdapter = manualAdapter({
  id: "koniq-10k",
  name: "KonIQ-10k",
  purpose: ["image-quality"],
  licenceStatus: "research-only",
  expectedFiles: ["images"],
});

export const LIVEWildAdapter: DatasetAdapter = manualAdapter({
  id: "live-in-the-wild",
  name: "LIVE In the Wild",
  purpose: ["image-quality"],
  licenceStatus: "research-only",
  expectedFiles: ["images"],
});

export const WIDERFACEAdapter: DatasetAdapter = manualAdapter({
  id: "wider-face",
  name: "WIDER FACE",
  purpose: ["face-detection"],
  licenceStatus: "research-only",
  expectedFiles: ["WIDER_test", "WIDER_train", "wider_face_split"],
});

export const SyntheticAdapter: DatasetAdapter = {
  id: "synthetic-fixtures",
  name: "Synthetic Distortion Fixtures",
  purpose: ["screenshot-detection", "custom-validation"],
  licenceStatus: "approved",
  downloadMethod: "automatic",
  async download(dest: string): Promise<DownloadResult> {
    // ponytail: synthetic fixtures are generated, not downloaded
    try {
      const { mkdirSync, existsSync } = await import("fs");
      mkdirSync(dest, { recursive: true });
      return { success: true, path: dest, fileCount: 0 };
    } catch (e) {
      return { success: false, path: dest, fileCount: 0, error: String(e) };
    }
  },
  async verify(dest: string): Promise<VerifyResult> {
    try {
      const { readdirSync } = await import("fs");
      const entries = readdirSync(dest);
      return { valid: true, fileCount: entries.length, missing: [], corrupted: [] };
    } catch {
      return { valid: true, fileCount: 0, missing: [], corrupted: [] };
    }
  },
  async index(dest: string): Promise<IndexResult> {
    return { indexed: 0, skipped: 0, errors: [] };
  },
};

// ─── Registry ───

export const ALL_ADAPTERS: DatasetAdapter[] = [
  SPAQAdapter,
  KonIQ10kAdapter,
  LIVEWildAdapter,
  WIDERFACEAdapter,
  SyntheticAdapter,
];

export function getAdapter(id: string): DatasetAdapter | undefined {
  return ALL_ADAPTERS.find(a => a.id === id);
}
