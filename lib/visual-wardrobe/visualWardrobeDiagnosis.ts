import type { VisualWardrobeDiagnosis, PaletteType } from "@/types/visualWardrobe";
import type { Audit } from "@/types";
import { extractDominantColors, extractCenterColors, extractEdgeColors } from "./extractDominantColors";
import { estimateOutfitRegion } from "./estimateOutfitRegion";
import { analyzeColorHarmony } from "./analyzeColorHarmony";
import { detectWardrobeGaps } from "./detectWardrobeGaps";
import { detectPaletteType, buildColorPaletteAdvice } from "./buildColorPaletteAdvice";
import { buildCommerceSearchIntents } from "./buildCommerceSearchIntent";
import { saveVisualWardrobeDiagnosis } from "@/lib/storage/visualWardrobeStore";

export interface DiagnosisInput {
  audit?: Audit;
  goal?: string;
  onProgress?: (step: string) => void;
}

export async function generateVisualWardrobeDiagnosis(imageDataUrl: string, input?: DiagnosisInput): Promise<VisualWardrobeDiagnosis> {
  input?.onProgress?.("Loading image...");

  const img = await loadImage(imageDataUrl);
  const canvas = document.createElement("canvas");
  const scale = 256 / Math.max(img.width, img.height);
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  ctx.drawImage(img, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);

  input?.onProgress?.("Extracting colors...");

  const fullColors = extractDominantColors(imageData);
  const centerColors = extractCenterColors(imageData);
  const edgeColors = extractEdgeColors(imageData);

  input?.onProgress?.("Estimating outfit region...");

  const { outfitRegion, backgroundRegion } = estimateOutfitRegion(imageData);

  input?.onProgress?.("Analyzing harmony...");

  const harmony = analyzeColorHarmony(
    fullColors, centerColors, edgeColors,
    outfitRegion?.brightness || 128,
    outfitRegion?.saturation || 30,
    outfitRegion?.estimatedClutter || 20
  );

  input?.onProgress?.("Detecting wardrobe gaps...");

  const gaps = detectWardrobeGaps({
    fullColors, centerColors, edgeColors, harmony,
    avgBrightness: outfitRegion?.brightness || 128,
    avgSaturation: outfitRegion?.saturation || 30,
    estimatedClutter: outfitRegion?.estimatedClutter || 20,
    confidence: outfitRegion?.confidenceScore || 50,
    goal: input?.goal || input?.audit?.goal,
  });

  input?.onProgress?.("Building palette advice...");

  const paletteType = detectPaletteType(fullColors, harmony, outfitRegion?.saturation || 30);
  const paletteAdvice = buildColorPaletteAdvice(paletteType, fullColors, harmony);

  input?.onProgress?.("Building search intents...");

  const intents = buildCommerceSearchIntents(gaps, input?.goal || input?.audit?.goal);

  const diagnosis: VisualWardrobeDiagnosis = {
    id: `vw_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    auditId: input?.audit?.id,
    sourceImageId: input?.audit?.id,
    dominantColors: fullColors,
    outfitRegionEstimate: outfitRegion,
    backgroundRegionEstimate: backgroundRegion,
    paletteType,
    colorHarmonyScore: harmony.overallHarmonyScore,
    outfitBackgroundContrastScore: harmony.outfitBackgroundContrast,
    premiumPaletteScore: harmony.premiumMinimalPotential,
    visualNoiseScore: outfitRegion?.estimatedClutter || 20,
    wardrobeGaps: gaps,
    recommendedStyleDirection: getRecommendedDirection(paletteType, gaps),
    recommendedColorPalette: paletteAdvice.recommendedPalette,
    recommendedCategories: getRecommendedCategories(gaps, intents),
    avoidCategories: getAvoidCategories(paletteType),
    commerceSearchIntents: intents,
    finalAdvice: buildFinalAdvice(gaps, paletteAdvice),
    safetyNote: "AuraCheck analyzes presentation, not human worth. This is guidance based on visual signals, not objective truth.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  input?.onProgress?.("Saving...");
  saveVisualWardrobeDiagnosis(diagnosis);

  return diagnosis;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

function getRecommendedDirection(paletteType: PaletteType, gaps: VisualWardrobeDiagnosis["wardrobeGaps"]): string {
  if (gaps.some((g) => g.type === "weak_professional_signal")) return "corporate_sharp";
  if (gaps.some((g) => g.type === "weak_dating_warmth")) return "dating_warm";
  if (gaps.some((g) => g.type === "weak_creator_energy")) return "creator_bold";
  if (gaps.some((g) => g.type === "weak_premium_signal")) return "premium_minimal";

  const dirMap: Record<string, string> = {
    premium_minimal: "premium_minimal",
    dating_warm: "dating_warm",
    corporate_sharp: "corporate_sharp",
    college_casual: "college_casual",
    creator_bold: "creator_bold",
    street_smart: "street_smart",
    soft_luxury: "soft_luxury",
  };
  return dirMap[paletteType] || "clean_basic";
}

function getRecommendedCategories(gaps: VisualWardrobeDiagnosis["wardrobeGaps"], intents: VisualWardrobeDiagnosis["commerceSearchIntents"]): string[] {
  const cats = new Set<string>();
  for (const g of gaps) cats.add(g.recommendedCategory);
  for (const i of intents) i.categories.forEach((c) => cats.add(c));
  return Array.from(cats).slice(0, 6);
}

function getAvoidCategories(paletteType: PaletteType): string[] {
  const map: Record<string, string[]> = {
    premium_minimal: ["hoodie", "kurta", "sunglasses"],
    dating_warm: ["hoodie", "sunglasses"],
    corporate_sharp: ["hoodie", "sneakers", "tshirt"],
    college_casual: ["formal_shoes", "kurta"],
    creator_bold: ["tshirt", "formal_shoes", "belt"],
    street_smart: ["formal_shoes", "kurta"],
    soft_luxury: ["hoodie", "tshirt"],
  };
  return map[paletteType] || [];
}

function buildFinalAdvice(
  gaps: VisualWardrobeDiagnosis["wardrobeGaps"],
  paletteAdvice: ReturnType<typeof buildColorPaletteAdvice>
): string {
  const top = gaps[0];
  if (!top) return "Your visual presentation looks balanced. Focus on maintaining clean basics with intentional styling.";

  const parts = [
    `Your main visual gap is "${top.type.replace(/_/g, " ")}".`,
    top.fix,
    `Palette: ${paletteAdvice.recommendedPalette.join(", ")}.`,
    paletteAdvice.explanation,
  ];
  return parts.join(" ");
}
