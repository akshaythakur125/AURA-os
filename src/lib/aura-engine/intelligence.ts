/**
 * Aura Intelligence Engine — Localized AI for photo analysis.
 *
 * Combines:
 * 1. CLIP zero-shot classification (semantic understanding)
 * 2. Pixel-level metrics (technical quality)
 * 3. Goal-aware scoring (context-specific weights)
 * 4. Indian market context (skin tones, fashion, cultural norms)
 * 5. Feedback loop (learns from user interactions)
 *
 * No external APIs. Everything runs locally.
 */

import type { AuditGoal, ImageSignalMetrics } from "@/types/audit";
import { calculateAuraScore } from "./scoring";

// ─── Goal-Specific Weight Profiles ───
// Each goal emphasizes different aspects of the photo

interface DimensionWeight {
  lighting: number;
  background: number;
  outfit: number;
  grooming: number;
  expression: number;
  composition: number;
  colorHarmony: number;
  sharpness: number;
}

const GOAL_PROFILES: Record<AuditGoal, DimensionWeight> = {
  dating: {
    lighting: 0.20,      // Warm, inviting light is critical
    background: 0.10,    // Simple, not distracting
    outfit: 0.15,        // Shows personality but not overdone
    grooming: 0.15,      // Well-groomed = trustworthy
    expression: 0.25,    // Genuine smile = #1 signal for dating
    composition: 0.10,   // Good framing
    colorHarmony: 0.03,  // Pleasant colors
    sharpness: 0.02,     // Must be in focus
  },
  instagram: {
    lighting: 0.18,      // Aesthetic lighting
    background: 0.15,    // Visual identity matters
    outfit: 0.18,        // Style is content
    grooming: 0.10,      // Polished look
    expression: 0.12,    // Mood/aesthetic expression
    composition: 0.15,   // Grid-worthy framing
    colorHarmony: 0.08,  // Cohesive color palette
    sharpness: 0.04,     // Sharp for feed
  },
  college: {
    lighting: 0.15,      // Natural light preferred
    background: 0.12,    // Campus life context
    outfit: 0.20,        // Casual but put-together
    grooming: 0.18,      // Clean, approachable
    expression: 0.15,    // Friendly, authentic
    composition: 0.10,   // Relaxed framing
    colorHarmony: 0.05,  // Works with skin tone
    sharpness: 0.05,     // Clear enough
  },
  office: {
    lighting: 0.18,      // Professional, even lighting
    background: 0.18,    // Clean, neutral background
    outfit: 0.22,        // Professional attire is key
    grooming: 0.15,      // Polished grooming
    expression: 0.10,    // Confident, approachable
    composition: 0.10,   // Standard headshot framing
    colorHarmony: 0.04,  // Neutral, professional
    sharpness: 0.03,     // Clear
  },
  glowup: {
    lighting: 0.18,      // Good light = instant upgrade
    background: 0.12,    // Clean canvas
    outfit: 0.18,        // Style upgrade potential
    grooming: 0.20,      // Grooming is the glow-up
    expression: 0.12,    // Confidence boost
    composition: 0.10,   // Better framing
    colorHarmony: 0.05,  // Color coordination
    sharpness: 0.05,     // Quality upgrade
  },
  content: {
    lighting: 0.18,
    background: 0.15,
    outfit: 0.18,
    grooming: 0.10,
    expression: 0.12,
    composition: 0.15,
    colorHarmony: 0.08,
    sharpness: 0.04,
  },
  linkedin: {
    lighting: 0.18,
    background: 0.18,
    outfit: 0.22,
    grooming: 0.15,
    expression: 0.10,
    composition: 0.10,
    colorHarmony: 0.04,
    sharpness: 0.03,
  },
  festival: {
    lighting: 0.15,
    background: 0.08,
    outfit: 0.22,
    grooming: 0.12,
    expression: 0.18,
    composition: 0.10,
    colorHarmony: 0.08,
    sharpness: 0.07,
  },
  travel: {
    lighting: 0.18,
    background: 0.18,
    outfit: 0.15,
    grooming: 0.12,
    expression: 0.15,
    composition: 0.12,
    colorHarmony: 0.05,
    sharpness: 0.05,
  },
  confidence: {
    lighting: 0.18,
    background: 0.12,
    outfit: 0.18,
    grooming: 0.20,
    expression: 0.12,
    composition: 0.10,
    colorHarmony: 0.05,
    sharpness: 0.05,
  },
};

// ─── Indian Market Context ───
// Skin tone ranges, common fashion patterns, cultural context

interface SkinToneContext {
  undertone: "warm" | "cool" | "neutral";
  bestLighting: string;
  bestColors: string[];
  avoidColors: string[];
  groomingNotes: string[];
}

const INDIAN_SKIN_TONE_GUIDE: SkinToneContext[] = [
  {
    undertone: "warm",
    bestLighting: "Golden hour or warm window light (2700K-3500K)",
    bestColors: ["Earth tones", "Mustard", "Teal", "Rust", "Olive", "Warm white", "Coral"],
    avoidColors: ["Neon pink", "Electric blue", "Cool grey", "Stark white"],
    groomingNotes: [
      "Warm-toned moisturizer prevents ashiness",
      "Avoid over-tweezing eyebrows — thicker brows frame warm skin better",
      "Sunscreen with matte finish prevents shine in photos",
    ],
  },
  {
    undertone: "cool",
    bestLighting: "Soft diffused light (5000K-6500K)",
    bestColors: ["Jewel tones", "Navy", "Burgundy", "Emerald", "Cool white", "Lavender"],
    avoidColors: ["Orange", "Yellow", "Warm beige", "Brass"],
    groomingNotes: [
      "Cool-toned moisturizer evens out skin appearance",
      "Well-defined eyebrows contrast well with cool skin",
      "Matte foundation for shine control in photos",
    ],
  },
  {
    undertone: "neutral",
    bestLighting: "Balanced natural light (4000K-5500K)",
    bestColors: ["Most colors work", "White", "Black", "Navy", "Burgundy", "Forest green"],
    avoidColors: ["Extreme neons", "Washed-out pastels"],
    groomingNotes: [
      "Most grooming styles work with neutral undertones",
      "Focus on skin texture and clarity",
      "Clean, well-maintained facial hair or clean-shaven",
    ],
  },
];

// ─── Observation Templates (Dynamic, Not Static) ───
// These are generated based on actual analysis results

interface IntelligentObservation {
  category: string;
  dimension: string;
  severity: "critical" | "major" | "minor" | "positive";
  title: string;
  insight: string;
  action: string;
  impact: number; // 0-100, how much this affects the overall score
  confidence: number;
}

// ─── Feedback Loop ───
// Track which suggestions users follow to improve over time

interface FeedbackEntry {
  auditId: string;
  goal: AuditGoal;
  dimension: string;
  suggestion: string;
  rating: number; // 1-5
  timestamp: number;
}

let feedbackStore: FeedbackEntry[] = [];

export function addFeedback(entry: FeedbackEntry) {
  feedbackStore.push(entry);
  // Keep last 1000 entries
  if (feedbackStore.length > 1000) {
    feedbackStore = feedbackStore.slice(-1000);
  }
}

export function getFeedbackInsights(goal: AuditGoal) {
  const goalFeedback = feedbackStore.filter((f) => f.goal === goal);
  if (goalFeedback.length < 10) return null;

  // Average rating per dimension
  const dimRatings: Record<string, { total: number; count: number }> = {};
  for (const f of goalFeedback) {
    if (!dimRatings[f.dimension]) dimRatings[f.dimension] = { total: 0, count: 0 };
    dimRatings[f.dimension].total += f.rating;
    dimRatings[f.dimension].count += 1;
  }

  const insights: Record<string, number> = {};
  for (const [dim, data] of Object.entries(dimRatings)) {
    insights[dim] = data.total / data.count;
  }

  return insights;
}

// ─── Main Intelligence Engine ───

export interface IntelligenceInput {
  goal: AuditGoal;
  metrics: ImageSignalMetrics;
  visionScores?: {
    lighting: number;
    background: number;
    outfit: number;
    grooming: number;
    expression: number;
    overall: number;
  };
  skinToneHint?: "warm" | "cool" | "neutral";
}

export interface IntelligenceResult {
  auraScore: number;
  dimensionScores: {
    lighting: number;
    background: number;
    outfit: number;
    grooming: number;
    expression: number;
    composition: number;
    colorHarmony: number;
    sharpness: number;
  };
  observations: IntelligentObservation[];
  topLeak: string;
  quickWins: Array<{
    title: string;
    description: string;
    impact: number;
    effort: "easy" | "medium" | "hard";
  }>;
  personalizedInsights: string[];
  goalSpecificAdvice: string;
  skinToneAdvice: string | null;
  confidenceScore: number;
}

/**
 * Run the full intelligence analysis on a photo.
 *
 * Combines pixel metrics + CLIP vision scores + goal context + skin tone
 * to produce a holistic, intelligent assessment.
 */
export function runIntelligenceAnalysis(input: IntelligenceInput): IntelligenceResult {
  const { goal, metrics, visionScores, skinToneHint } = input;
  const profile = GOAL_PROFILES[goal];

  // ─── Step 1: Normalize all scores to 0-100 ───
  const pixelScores = {
    lighting: metrics.lightingScore,
    background: Math.max(0, 100 - metrics.backgroundComplexityEstimate * 0.8),
    outfit: clamp((metrics.colorHarmony + metrics.contrast) / 2, 0, 100),
    grooming: clamp(metrics.saturation * 0.6 + metrics.sharpness * 0.4, 0, 100),
    expression: metrics.faceDetected ? clamp(metrics.symmetryScore * 1.1, 0, 100) : 50,
    composition: metrics.compositionScore,
    colorHarmony: metrics.colorHarmony,
    sharpness: metrics.sharpness,
  };

  // ─── Step 2: Blend pixel + vision scores ───
  // If CLIP scores are available, give them 60% weight (they're smarter)
  const blendedScores = { ...pixelScores };
  if (visionScores) {
    const CLIP_WEIGHT = 0.6;
    const PIXEL_WEIGHT = 0.4;
    blendedScores.lighting = Math.round(
      visionScores.lighting * CLIP_WEIGHT + pixelScores.lighting * PIXEL_WEIGHT
    );
    blendedScores.background = Math.round(
      visionScores.background * CLIP_WEIGHT + pixelScores.background * PIXEL_WEIGHT
    );
    blendedScores.outfit = Math.round(
      visionScores.outfit * CLIP_WEIGHT + pixelScores.outfit * PIXEL_WEIGHT
    );
    blendedScores.grooming = Math.round(
      visionScores.grooming * CLIP_WEIGHT + pixelScores.grooming * PIXEL_WEIGHT
    );
    blendedScores.expression = Math.round(
      visionScores.expression * CLIP_WEIGHT + pixelScores.expression * PIXEL_WEIGHT
    );
  }

  // ─── Step 3: Use authoritative score from scoring.ts ───
  // ponytail: one scoring path — intelligence.ts no longer calculates its own overall score
  const auraScore = calculateAuraScore({ auditType: 'photo', goal, budgetRange: 0, metrics });

  // ─── Step 4: Generate intelligent observations ───
  const observations = generateObservations(blendedScores, goal, metrics, skinToneHint);

  // ─── Step 5: Identify top leak and quick wins ───
  const dims = Object.entries(blendedScores)
    .map(([dim, score]) => ({
      dim,
      score,
      weight: profile[dim as keyof typeof profile] || 0,
      impact: (100 - score) * (profile[dim as keyof typeof profile] || 0),
    }))
    .sort((a, b) => b.impact - a.impact);

  const topLeak = dims[0].dim;
  const quickWins = dims
    .slice(0, 3)
    .map((d) => ({
      title: getQuickWinTitle(d.dim, d.score, goal),
      description: getQuickWinDescription(d.dim, d.score, goal, metrics),
      impact: Math.round(d.impact),
      effort: getEffortLevel(d.dim, d.score) as "easy" | "medium" | "hard",
    }));

  // ─── Step 6: Personalized insights ───
  const personalizedInsights = generatePersonalizedInsights(blendedScores, goal, metrics, skinToneHint);

  // ─── Step 7: Goal-specific advice ───
  const goalSpecificAdvice = getGoalSpecificAdvice(goal, blendedScores);

  // ─── Step 8: Skin tone advice ───
  const skinToneAdvice = skinToneHint ? getSkinToneAdvice(skinToneHint, metrics) : null;

  // ─── Step 9: Confidence score ───
  const confidenceScore = calculateConfidence(metrics, visionScores);

  return {
    auraScore,
    dimensionScores: blendedScores,
    observations,
    topLeak,
    quickWins,
    personalizedInsights,
    goalSpecificAdvice,
    skinToneAdvice,
    confidenceScore,
  };
}

// ─── Helper Functions ───

function generateObservations(
  scores: Record<string, number>,
  goal: AuditGoal,
  metrics: ImageSignalMetrics,
  skinTone?: string
): IntelligentObservation[] {
  const observations: IntelligentObservation[] = [];

  // Lighting analysis
  if (scores.lighting < 40) {
    observations.push({
      category: "lighting",
      dimension: "lighting",
      severity: "critical",
      title: "Lighting is significantly hurting your first impression",
      insight: `Your lighting score is ${scores.lighting}/100. ${
        goal === "dating"
          ? "In dating profiles, poor lighting makes you look less approachable and hides your best features."
          : goal === "office"
            ? "Professional photos need even, flattering lighting to signal competence."
            : "Good lighting is the single easiest upgrade for any photo."
      }`,
      action: getLightingAction(metrics, goal),
      impact: Math.round((100 - scores.lighting) * 0.25),
      confidence: 0.85,
    });
  } else if (scores.lighting >= 75) {
    observations.push({
      category: "lighting",
      dimension: "lighting",
      severity: "positive",
      title: "Your lighting is working well",
      insight: "The lighting in this photo creates good depth and makes you look approachable.",
      action: "Maintain this lighting setup for future photos.",
      impact: 0,
      confidence: 0.9,
    });
  }

  // Expression analysis
  if (scores.expression < 45) {
    observations.push({
      category: "expression",
      dimension: "expression",
      severity: goal === "dating" ? "critical" : "major",
      title: "Your expression isn't connecting",
      insight: `Expression score: ${scores.expression}/100. ${
        goal === "dating"
          ? "A genuine, warm expression is the #1 factor in dating profile success. People swipe based on how your expression makes them feel."
          : goal === "instagram"
            ? "Your expression sets the mood for the entire photo. A natural, confident look performs better than a forced smile."
            : "A confident, approachable expression makes people want to engage with you."
      }`,
      action: getExpressionAction(goal),
      impact: Math.round((100 - scores.expression) * (goal === "dating" ? 0.3 : 0.15)),
      confidence: 0.8,
    });
  }

  // Background analysis
  if (scores.background < 45) {
    observations.push({
      category: "background",
      dimension: "background",
      severity: "major",
      title: "Background is competing with you",
      insight: `Background score: ${scores.background}/100. ${
        metrics.backgroundComplexityEstimate > 65
          ? "Your background is cluttered — objects, patterns, or people are pulling attention away from you."
          : "The background doesn't complement your presentation."
      }`,
      action: "Stand 3-4 feet in front of a plain wall, or use portrait mode to blur the background.",
      impact: Math.round((100 - scores.background) * 0.15),
      confidence: 0.75,
    });
  }

  // Outfit analysis
  if (scores.outfit < 50) {
    observations.push({
      category: "outfit",
      dimension: "outfit",
      severity: "major",
      title: "Your outfit isn't supporting your goal",
      insight: `Outfit score: ${scores.outfit}/100. ${
        goal === "dating"
          ? "In dating, clothing signals personality and effort. Well-fitted, color-coordinated outfits show intentionality."
          : goal === "office"
            ? "Professional attire signals competence and attention to detail."
            : "Your clothing should complement your skin tone and look intentional."
      }`,
      action: getOutfitAction(goal, metrics),
      impact: Math.round((100 - scores.outfit) * 0.2),
      confidence: 0.7,
    });
  }

  // Grooming analysis
  if (scores.grooming < 50) {
    observations.push({
      category: "grooming",
      dimension: "grooming",
      severity: "major",
      title: "Grooming is holding back your potential",
      insight: `Grooming score: ${scores.grooming}/100. Well-groomed appearance signals self-respect and attention to detail.`,
      action: getGroomingAction(metrics),
      impact: Math.round((100 - scores.grooming) * 0.18),
      confidence: 0.75,
    });
  }

  // Color harmony (if very low)
  if (scores.colorHarmony < 40) {
    observations.push({
      category: "color",
      dimension: "colorHarmony",
      severity: "minor",
      title: "Color coordination could be better",
      insight: `Color harmony score: ${scores.colorHarmony}/100. The colors in your photo don't create a cohesive visual impression.`,
      action: skinTone === "warm"
        ? "Try earth tones: mustard, teal, rust, olive. These complement warm Indian skin tones."
        : skinTone === "cool"
          ? "Try jewel tones: navy, burgundy, emerald. These complement cool undertones."
          : "Stick to solid neutral colors (white, black, navy) for a clean, cohesive look.",
      impact: Math.round((100 - scores.colorHarmony) * 0.05),
      confidence: 0.65,
    });
  }

  return observations.sort((a, b) => {
    const severityOrder = { critical: 0, major: 1, minor: 2, positive: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

function getLightingAction(metrics: ImageSignalMetrics, goal: AuditGoal): string {
  if (metrics.brightness < 30) {
    return "Move closer to a window during daylight hours. Face the window directly — this alone can boost your lighting score by 20+ points.";
  }
  if (metrics.brightness > 75) {
    return "Move away from direct light or reduce exposure. Overexposure washes out your features and makes the photo look amateur.";
  }
  if (goal === "dating") {
    return "Stand near a window with warm light (golden hour is ideal). The light should hit your face at a 45° angle for flattering shadows.";
  }
  return "Use soft, diffused natural light. Avoid overhead fluorescent lighting or direct flash.";
}

function getExpressionAction(goal: AuditGoal): string {
  switch (goal) {
    case "dating":
      return "Think of something genuinely funny, then smile naturally. A real smile reaches your eyes — that's what makes you look approachable. Practice in the mirror: relax your face completely, then smile on count of 3.";
    case "instagram":
      return "Match your expression to your intended mood. For aesthetic content, a relaxed, slightly serious expression often works better than a big smile.";
    case "office":
      return "Maintain eye contact with the camera lens. A slight, confident smile signals approachability without being too casual.";
    case "college":
      return "Be yourself — a genuine, relaxed expression reads as confident. Avoid forced poses or exaggerated expressions.";
    default:
      return "Relax your face completely for 10 seconds, then smile naturally on count of 3. The transition from relaxed to smile creates the most genuine expression.";
  }
}

function getOutfitAction(goal: AuditGoal, metrics: ImageSignalMetrics): string {
  if (goal === "office") {
    return "Wear a well-fitted solid shirt or blazer in neutral tones (navy, grey, white). Avoid patterns and loud colors for professional photos.";
  }
  if (goal === "dating") {
    return "Choose a solid-color top that complements your skin tone. Avoid logos, busy patterns, or overly casual clothing. A clean, well-fitted tee or shirt works better than expensive but ill-fitting clothes.";
  }
  if (goal === "instagram") {
    return "Pick one color palette and stick with it. Solid colors photograph better than patterns. Make sure your outfit contrasts with the background.";
  }
  return "Wear well-fitted basics in solid colors. Make sure clothes are wrinkle-free and fit properly — fit matters more than brand.";
}

function getGroomingAction(metrics: ImageSignalMetrics): string {
  if (metrics.sharpness < 40) {
    return "First, fix photo quality: clean your camera lens, hold steady, and ensure good lighting. Then focus on grooming details.";
  }
  return "Book a grooming session: haircut, eyebrow cleanup, and skincare. These three changes create the biggest visual upgrade for the least effort.";
}

function getQuickWinTitle(dim: string, score: number, goal: AuditGoal): string {
  const titles: Record<string, string> = {
    lighting: "Fix your lighting",
    background: "Clean up your background",
    outfit: "Upgrade your outfit choice",
    grooming: "Polish your grooming",
    expression: "Nail your expression",
    composition: "Improve your framing",
    colorHarmony: "Coordinate your colors",
    sharpness: "Sharpen your photo",
  };
  return titles[dim] || `Improve your ${dim}`;
}

function getQuickWinDescription(dim: string, score: number, goal: AuditGoal, metrics: ImageSignalMetrics): string {
  const gap = 100 - score;
  if (dim === "lighting") {
    return `Your lighting score is ${score}/100. Improving lighting could add ${Math.round(gap * 0.25)} points to your overall score.`;
  }
  if (dim === "expression") {
    return `Expression is the ${
      goal === "dating" ? "highest-impact" : "second-highest-impact"
    } factor for ${goal} photos. Your current score is ${score}/100.`;
  }
  if (dim === "outfit") {
    return `Outfit contributes ${Math.round(GOAL_PROFILES[goal].outfit * 100)}% to your ${goal} score. Current: ${score}/100.`;
  }
  return `Your ${dim} score is ${score}/100. This is one of the easiest areas to improve.`;
}

function getEffortLevel(dim: string, score: number): string {
  if (dim === "expression") return "easy"; // Just retake with better expression
  if (dim === "lighting") return "easy"; // Move to window
  if (dim === "background") return "easy"; // Clear clutter or move
  if (dim === "sharpness") return "easy"; // Clean lens, hold steady
  if (dim === "outfit") return "medium"; // Need to change clothes
  if (dim === "grooming") return "medium"; // Need grooming session
  if (dim === "composition") return "medium"; // Need to reframe
  if (dim === "colorHarmony") return "medium"; // Need color-coordinated outfit
  return "medium";
}

function generatePersonalizedInsights(
  scores: Record<string, number>,
  goal: AuditGoal,
  metrics: ImageSignalMetrics,
  skinTone?: string
): string[] {
  const insights: string[] = [];

  // Find the biggest gap between score and goal importance
  const profile = GOAL_PROFILES[goal];
  const gaps = Object.entries(scores)
    .map(([dim, score]) => ({
      dim,
      score,
      weight: profile[dim as keyof typeof profile] || 0,
      gap: (profile[dim as keyof typeof profile] || 0) * (100 - score),
    }))
    .sort((a, b) => b.gap - a.gap);

  if (gaps.length > 0) {
    const top = gaps[0];
    insights.push(
      `Your biggest opportunity for ${goal} is ${top.dim} — it has high importance for your goal but your score is ${top.score}/100.`
    );
  }

  // Context-specific insights
  if (goal === "dating" && scores.expression > 70 && scores.lighting < 50) {
    insights.push("Your expression is strong, but the lighting is hiding it. Better lighting would make your natural warmth visible.");
  }

  if (goal === "instagram" && scores.colorHarmony < 50) {
    insights.push("Instagram feeds perform best with a consistent color palette. Consider using the same editing preset across photos.");
  }

  if (goal === "office" && scores.outfit < 60) {
    insights.push("For professional photos, attire is the first signal people read. A well-fitted blazer or solid shirt instantly upgrades your professional image.");
  }

  if (metrics.faceDetected && metrics.symmetryScore > 80) {
    insights.push("Your facial symmetry is above average — this is a strong natural asset. Good lighting will highlight this.");
  }

  return insights;
}

function getGoalSpecificAdvice(goal: AuditGoal, scores: Record<string, number>): string {
  const weakDims = Object.entries(scores)
    .filter(([, score]) => score < 60)
    .sort(([, a], [, b]) => a - b);

  if (weakDims.length === 0) {
    return `Your ${goal} photo is already strong across all dimensions. Focus on maintaining consistency.`;
  }

  const topWeak = weakDims[0][0];

  switch (goal) {
    case "dating":
      return `For dating profiles, focus on ${topWeak} first. Dating apps are visual-first — you have 0.3 seconds to make an impression. ${
        topWeak === "expression"
          ? "A genuine smile is the #1 factor in match rates."
          : topWeak === "lighting"
            ? "Warm, flattering light makes you look more approachable."
            : "This is one of the easiest areas to fix."
      }`;
    case "instagram":
      return `For Instagram, ${topWeak} is your biggest gap. Instagram rewards visual consistency — fix this across your next 5 posts for maximum impact.`;
    case "college":
      return `For college social presence, ${topWeak} needs attention. College settings reward authenticity over perfection — focus on looking put-together, not overdone.`;
    case "office":
      return `For professional photos, ${topWeak} is holding you back. Professional images signal competence — every detail matters.`;
    default:
      return `For your glow-up, ${topWeak} is the highest-impact area to fix first. Start here before moving to other areas.`;
  }
}

function getSkinToneAdvice(undertone: string, metrics: ImageSignalMetrics): string | null {
  const guide = INDIAN_SKIN_TONE_GUIDE.find((g) => g.undertone === undertone);
  if (!guide) return null;

  const colorAdvice =
    metrics.colorHarmony < 50
      ? `Your current colors don't complement your ${undertone} undertone. Try ${guide.bestColors.slice(0, 3).join(", ")} — these work best with your skin.`
      : `Your color choices are working well with your ${undertone} undertone.`;

  return `${colorAdvice} For lighting, ${guide.bestLighting}. Grooming tip: ${guide.groomingNotes[0]}`;
}

function calculateConfidence(
  metrics: ImageSignalMetrics,
  visionScores?: { lighting: number; background: number; outfit: number; grooming: number; expression: number; overall: number }
): number {
  let confidence = 0.5; // Base confidence

  // Higher resolution = more confidence
  if (metrics.width > 800 && metrics.height > 800) confidence += 0.15;
  else if (metrics.width > 400 && metrics.height > 400) confidence += 0.08;

  // Face detected = more confidence for expression/grooming
  if (metrics.faceDetected) confidence += 0.15;

  // CLIP scores available = much higher confidence
  if (visionScores) confidence += 0.15;

  // Good sharpness = more confidence
  if (metrics.sharpness > 60) confidence += 0.05;

  return Math.min(confidence, 0.95);
}

function clamp(value: number, min: number, max: number): number {
  return Math.round(Math.min(max, Math.max(min, value)));
}
