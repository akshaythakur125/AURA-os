import type { VisualWardrobeDiagnosis } from "@/types/visualWardrobe";
import { getItem, setItem } from "./localStore";

const DIAGNOSES_KEY = "auracheck:v1:visual_wardrobe_diagnoses";

export function getVisualWardrobeDiagnoses(): VisualWardrobeDiagnosis[] {
  return getItem<VisualWardrobeDiagnosis[]>(DIAGNOSES_KEY, []);
}

export function saveVisualWardrobeDiagnosis(diagnosis: VisualWardrobeDiagnosis): void {
  const diagnoses = getVisualWardrobeDiagnoses();
  const existing = diagnoses.findIndex((d) => d.id === diagnosis.id);
  if (existing >= 0) {
    diagnoses[existing] = { ...diagnoses[existing], ...diagnosis, updatedAt: new Date().toISOString() };
  } else {
    diagnoses.push(diagnosis);
  }
  setItem(DIAGNOSES_KEY, diagnoses.slice(-50));
}

export function getDiagnosisByAudit(auditId: string): VisualWardrobeDiagnosis | undefined {
  return getVisualWardrobeDiagnoses().find((d) => d.auditId === auditId);
}

export function getLatestDiagnosis(): VisualWardrobeDiagnosis | undefined {
  const diagnoses = getVisualWardrobeDiagnoses();
  return diagnoses.length > 0 ? diagnoses[diagnoses.length - 1] : undefined;
}

export function getDiagnosisStats(): {
  total: number;
  topGaps: Record<string, number>;
  topDirections: Record<string, number>;
  topPalettes: Record<string, number>;
} {
  const diagnoses = getVisualWardrobeDiagnoses();
  const topGaps: Record<string, number> = {};
  const topDirections: Record<string, number> = {};
  const topPalettes: Record<string, number> = {};

  for (const d of diagnoses) {
    for (const g of d.wardrobeGaps) {
      topGaps[g.type] = (topGaps[g.type] || 0) + 1;
    }
    topDirections[d.recommendedStyleDirection] = (topDirections[d.recommendedStyleDirection] || 0) + 1;
    topPalettes[d.paletteType] = (topPalettes[d.paletteType] || 0) + 1;
  }

  return { total: diagnoses.length, topGaps, topDirections, topPalettes };
}
