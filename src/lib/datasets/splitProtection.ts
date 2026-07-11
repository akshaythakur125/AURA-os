/**
 * ponytail: split protection — no source image in both train and test.
 */

import type { NormalizedAnnotation } from "./types";

export type SplitIntegrityResult = {
  valid: boolean;
  trainCount: number;
  testCount: number;
  validationCount: number;
  leakagePairs: Array<{ trainImage: string; testImage: string; source: string }>;
  duplicateIds: string[];
};

export function checkSplitIntegrity(annotations: NormalizedAnnotation[]): SplitIntegrityResult {
  const train: Array<{ id: string; source: string }> = [];
  const test: Array<{ id: string; source: string }> = [];
  const validation: Array<{ id: string; source: string }> = [];
  const idCounts: Record<string, number> = {};
  const leakagePairs: Array<{ trainImage: string; testImage: string; source: string }> = [];
  const duplicateIds: string[] = [];

  for (const a of annotations) {
    idCounts[a.imageId] = (idCounts[a.imageId] || 0) + 1;
    const source = a.imageId.replace(/-[a-z]+-\d+$/, "");
    if (a.split === "train") train.push({ id: a.imageId, source });
    else if (a.split === "test") test.push({ id: a.imageId, source });
    else if (a.split === "validation") validation.push({ id: a.imageId, source });
  }

  for (const id of Object.keys(idCounts)) {
    if (idCounts[id] > 1) duplicateIds.push(id);
  }

  for (const t of test) {
    for (const tr of train) {
      if (tr.source === t.source) {
        leakagePairs.push({ trainImage: tr.id, testImage: t.id, source: tr.source });
      }
    }
  }

  return {
    valid: leakagePairs.length === 0 && duplicateIds.length === 0,
    trainCount: train.length,
    testCount: test.length,
    validationCount: validation.length,
    leakagePairs,
    duplicateIds,
  };
}
