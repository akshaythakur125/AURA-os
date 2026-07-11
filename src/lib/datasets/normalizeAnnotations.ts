/**
 * ponytail: annotation normalization — converts dataset-specific annotations to common schema.
 */

import type { NormalizedAnnotation } from "./types";

/** Normalize SPAQ annotations (MOS scores + device info) */
export function normalizeSPAQ(rows: Array<Record<string, string | number>>): NormalizedAnnotation[] {
  return rows.map((r) => ({
    imageId: String(r.image_name || r.id || ""),
    datasetId: "spaqp",
    relativePath: String(r.image_path || r.image_name || ""),
    width: Number(r.width || 0),
    height: Number(r.height || 0),
    split: "unknown" as const,
    quality: {
      mos: Number(r.MOS || r.mos || 0),
      normalizedMos: Number(r.MOS || r.mos || 0) / 100,
    },
    metadata: {
      device: r.device_name || r.device || null,
      scene: r.scene_name || r.scene || null,
    },
  }));
}

/** Normalize KonIQ-10k annotations (MOS + distribution) */
export function normalizeKonIQ(rows: Array<Record<string, string | number>>): NormalizedAnnotation[] {
  return rows.map((r) => ({
    imageId: String(r.image_name || r.id || ""),
    datasetId: "koniq-10k",
    relativePath: String(r.image_path || ""),
    width: Number(r.width || 0),
    height: Number(r.height || 0),
    split: "unknown" as const,
    quality: {
      mos: Number(r.MOS || r.mos || 0),
      normalizedMos: Number(r.MOS || r.mos || 0) / 5,
    },
    metadata: {},
  }));
}

/** Normalize WIDER FACE annotations (face bounding boxes) */
export function normalizeWIDERFACE(
  annotations: Record<string, Array<{ x: number; y: number; w: number; h: number; invalid?: number }>>
): NormalizedAnnotation[] {
  const results: NormalizedAnnotation[] = [];
  for (const [imagePath, faces] of Object.entries(annotations)) {
    results.push({
      imageId: imagePath.replace(/\.[^.]+$/, ""),
      datasetId: "wider-face",
      relativePath: imagePath,
      width: 0,
      height: 0,
      split: imagePath.includes("test") ? "test" : imagePath.includes("train") ? "train" : "unknown",
      faces: faces.map((f) => ({
        x: f.x, y: f.y, width: f.w, height: f.h,
        invalid: f.invalid === 1,
      })),
      metadata: { faceCount: faces.length },
    });
  }
  return results;
}

/** Generic CSV normalizer for simple MOS datasets */
export function normalizeCSV(
  rows: Array<Record<string, string>>,
  config: { datasetId: string; imageCol: string; mosCol: string; widthCol?: string; heightCol?: string }
): NormalizedAnnotation[] {
  return rows.map((r) => ({
    imageId: String(r[config.imageCol] || ""),
    datasetId: config.datasetId,
    relativePath: String(r[config.imageCol] || ""),
    width: config.widthCol ? Number(r[config.widthCol] || 0) : 0,
    height: config.heightCol ? Number(r[config.heightCol] || 0) : 0,
    split: "unknown" as const,
    quality: { mos: Number(r[config.mosCol] || 0) },
    metadata: {},
  }));
}

/** Normalize LIVE In the Wild annotations (MOS scores from CSV) */
export function normalizeLIVEWild(rows: Array<Record<string, string>>): NormalizedAnnotation[] {
  // ponytail: LIVE Wild CSV typically has columns: filename, MOS, width, height
  return normalizeCSV(rows, { datasetId: "live-in-the-wild", imageCol: "filename", mosCol: "MOS", widthCol: "width", heightCol: "height" });
}
