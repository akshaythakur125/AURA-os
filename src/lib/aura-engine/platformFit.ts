/**
 * Platform Fit — scores the SAME photo for how well it works as a lead image on
 * each platform, from metrics already measured on-device. No API, no cost.
 *
 * Different platforms reward different signals: LinkedIn and matrimony want a
 * clean, well-lit, sharp frame; dating apps reward warm light and a little real
 * context over a sterile studio look; Instagram rewards composition and colour.
 * So the same photo can be a strong LinkedIn shot and a weak Hinge one — this
 * tells the buyer where to actually post it.
 */

export interface PlatformFitInput {
  lightingScore: number;
  clarityScore: number;
  compositionScore: number;
  backgroundComplexityEstimate: number;
  colorHarmony: number;
}

export interface PlatformFit {
  platform: string;
  emoji: string;
  /** 0–100 fit for this photo as a lead image on this platform. */
  score: number;
  tier: "Strong fit" | "Good fit" | "Workable" | "Weak fit";
  /** One-line, specific reason grounded in the dominant driver. */
  why: string;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function tierFor(score: number): PlatformFit["tier"] {
  if (score >= 75) return "Strong fit";
  if (score >= 60) return "Good fit";
  if (score >= 45) return "Workable";
  return "Weak fit";
}

export function computePlatformFit(m: PlatformFitInput): PlatformFit[] {
  const light = m.lightingScore ?? 50;
  const clarity = m.clarityScore ?? 50;
  const comp = m.compositionScore ?? 50;
  const harmony = m.colorHarmony ?? 50;
  const complexity = m.backgroundComplexityEstimate ?? 50;
  const bgClean = 100 - complexity; // higher = cleaner backdrop
  // Dating rewards *some* context but punishes chaos — peaks around mid.
  const bgModerate = clamp(100 - Math.abs(complexity - 40) * 2);

  const linkedin = clamp(0.3 * bgClean + 0.28 * light + 0.22 * clarity + 0.2 * comp);
  const matrimony = clamp(0.28 * bgClean + 0.27 * light + 0.25 * clarity + 0.2 * comp);
  const dating = clamp(0.3 * light + 0.24 * comp + 0.2 * clarity + 0.16 * harmony + 0.1 * bgModerate);
  const instagram = clamp(0.3 * comp + 0.26 * harmony + 0.24 * clarity + 0.2 * light);

  const cleanBg = bgClean >= 55;
  const goodLight = light >= 60;
  const sharp = clarity >= 60;

  const fits: PlatformFit[] = [
    {
      platform: "LinkedIn",
      emoji: "💼",
      score: linkedin,
      tier: tierFor(linkedin),
      why: cleanBg
        ? "Clean backdrop and even light read as competent and trustworthy."
        : "Busy background undercuts the professional read — crop tighter or reshoot on a plain wall.",
    },
    {
      platform: "Dating (Hinge/Bumble)",
      emoji: "❤️",
      score: dating,
      tier: tierFor(dating),
      why: goodLight
        ? "Warm, well-lit and approachable — the tone that earns first messages."
        : "Flatter, dim light reads as low-effort here — shoot in soft daylight for warmth.",
    },
    {
      platform: "Instagram",
      emoji: "📸",
      score: instagram,
      tier: tierFor(instagram),
      why: comp >= 60
        ? "Strong composition and colour give it scroll-stopping pop."
        : "Composition is doing the least work here — use the rule-of-thirds and stronger colour.",
    },
    {
      platform: "Matrimony",
      emoji: "💍",
      score: matrimony,
      tier: tierFor(matrimony),
      why: sharp && cleanBg
        ? "Sharp, clean and clear — exactly the respectable, honest read families look for."
        : "Aim for a sharper frame on a plain background — clarity signals sincerity here.",
    },
  ];

  return fits.sort((a, b) => b.score - a.score);
}
