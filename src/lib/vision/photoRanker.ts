/**
 * CLIP-powered profile photo ranker — the "upload your photos, we pick the lead"
 * feature. Runs entirely in the browser (photos never leave the device): each
 * photo is scored by CLIP zero-shot against dating-relevant prompt buckets, then
 * ranked into a lead photo, supporting shots, and ones to cut.
 *
 * Deliberately NOT an "attractiveness" score — that's biased and unimprovable.
 * We score how well a photo COMMUNICATES (is it a clear solo shot, well lit,
 * warm, sharp, uncluttered), which is fair across faces and actually actionable.
 *
 * `scorer` is injectable so the ranking logic is unit-testable without loading
 * the model; in production it defaults to the shared CLIP classifier.
 */
import { getClassifier, scoreDimensionWith } from "@/lib/aura-engine/localVision";

export type DimScorer = (image: string, positive: string[], negative: string[]) => Promise<number>;

export interface PhotoBreakdown {
  lead: number; // solo, clear, face-forward — lead-photo worthiness
  approachability: number; // warm, genuine, eye contact
  lighting: number;
  clarity: number;
  background: number;
}

export interface RankedPhoto {
  index: number; // original upload order
  src: string; // data URL — stays local
  score: number; // 0-100 composite profile strength
  breakdown: PhotoBreakdown;
  role: "lead" | "supporting" | "cut";
  verdict: string;
  strengths: string[];
  fixes: string[];
}

const PROMPTS: Record<keyof PhotoBreakdown, { positive: string[]; negative: string[] }> = {
  lead: {
    positive: [
      "a clear solo portrait of one person looking at the camera",
      "a sharp close-up headshot of a single person",
      "one person facing the camera with the face clearly visible",
    ],
    negative: [
      "a group photo with several people",
      "a photo where the face is small, far away or turned away",
      "a photo with sunglasses or a hat hiding the eyes",
    ],
  },
  approachability: {
    positive: [
      "a person with a warm, genuine smile making eye contact",
      "a friendly, relaxed and approachable expression",
    ],
    negative: [
      "a blank, cold or serious expression",
      "a forced, stiff or awkward expression",
    ],
  },
  lighting: {
    positive: ["a well-lit photo with soft, flattering, even light"],
    negative: ["a dark, underexposed photo", "a photo with harsh unflattering lighting"],
  },
  clarity: {
    positive: ["a sharp, in-focus, high quality photo"],
    negative: ["a blurry, grainy or low-resolution photo", "a heavily filtered, over-smoothed photo"],
  },
  background: {
    positive: ["a clean, uncluttered background"],
    negative: ["a messy, cluttered, distracting background"],
  },
};

// A lead photo lives or dies on being a clear solo shot + warmth; supporting
// dimensions matter but weigh less. Sums to 1.
const WEIGHTS: Record<keyof PhotoBreakdown, number> = {
  lead: 0.34,
  approachability: 0.22,
  lighting: 0.18,
  clarity: 0.14,
  background: 0.12,
};

function verdictFor(b: PhotoBreakdown, role: RankedPhoto["role"]): { verdict: string; strengths: string[]; fixes: string[] } {
  const strengths: string[] = [];
  const fixes: string[] = [];
  if (b.lead >= 65) strengths.push("Clear solo shot — easy to see it's you");
  else fixes.push("Crop closer / use a solo photo — this one doesn't read as a clear headshot");
  if (b.approachability >= 62) strengths.push("Warm, approachable expression");
  else fixes.push("Aim for a genuine smile with eye contact — it's the biggest swipe driver");
  if (b.lighting >= 60) strengths.push("Well lit");
  else fixes.push("Shoot toward a window — the lighting is holding this photo back");
  if (b.clarity >= 60) strengths.push("Sharp and clean");
  else fixes.push("Wipe the lens and use the rear camera — it reads soft");
  if (b.background >= 60) strengths.push("Clean background");
  else fixes.push("Simplify the background — it's competing with you");

  const verdict =
    role === "lead"
      ? "Your strongest photo — lead with this one."
      : role === "supporting"
        ? "Solid supporting photo — keep it later in the set."
        : "Weakest of the set — cut it or reshoot before it drags the profile down.";
  return { verdict, strengths, fixes };
}

/**
 * Ranks profile photos. Returns null if the model can't load (caller should fall
 * back to generic advice). `scorer` overrides the CLIP scorer for testing.
 */
export async function rankProfilePhotos(images: string[], scorer?: DimScorer): Promise<RankedPhoto[] | null> {
  if (images.length === 0) return [];

  let score: DimScorer;
  if (scorer) {
    score = scorer;
  } else {
    const classifier = await getClassifier();
    if (!classifier) return null;
    score = (img, pos, neg) => scoreDimensionWith(classifier, img, pos, neg);
  }

  const dims = Object.keys(PROMPTS) as (keyof PhotoBreakdown)[];
  const scored: { index: number; src: string; score: number; breakdown: PhotoBreakdown }[] = [];

  for (let i = 0; i < images.length; i++) {
    const breakdown = {} as PhotoBreakdown;
    for (const d of dims) breakdown[d] = await score(images[i], PROMPTS[d].positive, PROMPTS[d].negative);
    const composite = Math.round(dims.reduce((s, d) => s + breakdown[d] * WEIGHTS[d], 0));
    scored.push({ index: i, src: images[i], score: composite, breakdown });
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.map((p, rank) => {
    const role: RankedPhoto["role"] = rank === 0 ? "lead" : p.score >= 45 ? "supporting" : "cut";
    const { verdict, strengths, fixes } = verdictFor(p.breakdown, role);
    return { ...p, role, verdict, strengths, fixes };
  });
}
