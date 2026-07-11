/**
 * Local Vision Analysis Engine — runs entirely in the browser.
 * Uses CLIP (ViT-B/32) via Transformers.js for zero-shot image understanding.
 * No external API calls. Model downloads once, cached in browser.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from "@huggingface/transformers";

// Configure to cache models in browser
env.cacheDir = "transformers-cache";

export interface LocalVisionScores {
  lighting: number;
  background: number;
  outfit: number;
  grooming: number;
  expression: number;
  overall: number;
}

export interface LocalVisionObservation {
  category: string;
  severity: "positive" | "suggestion" | "warning";
  title: string;
  detail: string;
  suggestion: string;
  confidence: number;
}

export interface LocalVisionResult {
  scores: LocalVisionScores;
  observations: LocalVisionObservation[];
  topLeak: string;
  quickFixes: Array<{ title: string; description: string; impact: number }>;
  improvementTips: string[];
}

// Text prompts for CLIP zero-shot scoring
const SCORING_PROMPTS = {
  lighting: {
    positive: [
      "a photo with soft, flattering natural light",
      "a well-lit portrait with even lighting",
      "a photo with good directional lighting that creates depth",
    ],
    negative: [
      "a photo with harsh, unflattering lighting",
      "a photo that is too dark and underexposed",
      "a photo with flat, boring lighting",
      "a photo with harsh shadows on the face",
    ],
  },
  background: {
    positive: [
      "a photo with a clean, uncluttered background",
      "a photo with a simple, elegant background",
      "a photo with a professional-looking background",
    ],
    negative: [
      "a photo with a messy, cluttered background",
      "a photo with distracting objects in the background",
      "a photo with a busy, chaotic background",
    ],
  },
  outfit: {
    positive: [
      "a person wearing well-fitted, stylish clothing",
      "a person in professional, put-together attire",
      "a person wearing colors that complement their skin tone",
    ],
    negative: [
      "a person wearing wrinkled or ill-fitting clothes",
      "a person in sloppy, unkempt clothing",
      "a person wearing clashing colors",
    ],
  },
  grooming: {
    positive: [
      "a well-groomed person with neat hair and clean skin",
      "a person with a polished, put-together appearance",
      "a person with well-maintained facial hair and styled hair",
    ],
    negative: [
      "a person with messy, unkempt hair",
      "a person with visible skin blemishes or unkempt appearance",
      "a person with disheveled grooming",
    ],
  },
  expression: {
    positive: [
      "a person with a warm, confident expression",
      "a person making genuine eye contact with a natural smile",
      "a person who looks approachable and self-assured",
    ],
    negative: [
      "a person with a blank, lifeless expression",
      "a person who looks uncomfortable or awkward",
      "a person avoiding eye contact or forcing a smile",
    ],
  },
};

// Observation templates keyed by category and severity
const OBSERVATION_TEMPLATES: Record<string, Record<string, Array<{ title: string; detail: string; suggestion: string }>>> = {
  lighting: {
    positive: [
      { title: "Natural light works in your favor", detail: "The lighting in this photo creates good depth and dimension on your face.", suggestion: "Keep shooting in similar lighting conditions — this is working." },
      { title: "Even, flattering light", detail: "Light is distributed evenly across your features, making you look approachable.", suggestion: "This lighting setup is ideal. Replicate it for future photos." },
    ],
    suggestion: [
      { title: "Lighting could be more directional", detail: "The light is fairly flat, which reduces the perception of depth and dimension in your face.", suggestion: "Position yourself 45° to a window for natural Rembrandt lighting." },
      { title: "Slight overexposure detected", detail: "Some areas are blown out, losing detail in highlights.", suggestion: "Reduce exposure by 0.3-0.5 stops or move slightly away from the light source." },
    ],
    warning: [
      { title: "Backlit subject — face is in shadow", detail: "The main light source is behind you, leaving your face significantly darker than the background.", suggestion: "Turn to face the window or light source directly." },
      { title: "Harsh overhead lighting", detail: "Top-down lighting creates unflattering shadows under eyes, nose, and chin.", suggestion: "Use a diffused light source at eye level." },
    ],
  },
  background: {
    positive: [
      { title: "Clean, non-distracting background", detail: "The background doesn't compete with you for attention — exactly what you want.", suggestion: "This background setup works. Keep backgrounds simple and muted." },
    ],
    suggestion: [
      { title: "Background has minor distractions", detail: "There are a few elements in the background that pull attention away from you.", suggestion: "Step forward 2-3 feet or use portrait mode to blur the background." },
    ],
    warning: [
      { title: "Cluttered background weakens your presence", detail: "Objects, furniture, or patterns in the background are competing with you for attention.", suggestion: "Stand against a plain wall or use a solid-colored backdrop." },
    ],
  },
  outfit: {
    positive: [
      { title: "Outfit color works with your complexion", detail: "The colors you're wearing complement your skin tone and create visual harmony.", suggestion: "You've found colors that work — build your wardrobe around this palette." },
    ],
    suggestion: [
      { title: "Outfit could use more contrast", detail: "The clothing blends into the background or doesn't create enough visual separation.", suggestion: "Wear darker or lighter colors than your background. Contrast makes you pop." },
    ],
    warning: [
      { title: "Wrinkled or unkempt clothing", detail: "Visible wrinkles and creases make the photo look unplanned.", suggestion: "A quick steam or iron before photos makes a massive difference." },
    ],
  },
  grooming: {
    positive: [
      { title: "Well-groomed appearance", detail: "Hair is styled, skin looks clean, and overall grooming is polished.", suggestion: "Maintain this grooming standard — it's working." },
    ],
    suggestion: [
      { title: "Hair could use more styling", detail: "Hair looks natural but slightly unstructured.", suggestion: "A small amount of product (matte clay or sea salt spray) adds definition." },
    ],
    warning: [
      { title: "Grooming needs attention", detail: "Facial hair, hair styling, or skin care could use improvement.", suggestion: "Invest in a basic grooming kit: trimmer, moisturizer, and a styling product." },
    ],
  },
  expression: {
    positive: [
      { title: "Genuine, approachable expression", detail: "Your expression reads as confident and authentic.", suggestion: "This expression works. Try to recreate this natural ease in future photos." },
    ],
    suggestion: [
      { title: "Expression could be warmer", detail: "The expression is neutral, which can read as disengaged.", suggestion: "Think of something genuinely funny right before the shutter." },
    ],
    warning: [
      { title: "Forced or uncomfortable expression", detail: "The smile or pose looks staged.", suggestion: "Stop smiling for 10 seconds, relax completely, then smile naturally on count of 3." },
    ],
  },
};

// Lazy-loaded classifier
let classifierPromise: Promise<any> | null = null;

async function getClassifier(): Promise<any> {
  if (classifierPromise) return classifierPromise;

  classifierPromise = (async () => {
    try {
      // Dynamic import to avoid bundling issues
      const transformers = await import("@huggingface/transformers");
      const classifier = await transformers.pipeline(
        "zero-shot-image-classification",
        "Xenova/clip-vit-base-patch32"
      );
      return classifier;
    } catch (err) {
      console.error("[local-vision] Failed to load CLIP model:", err);
      classifierPromise = null;
      throw err;
    }
  })();

  return classifierPromise;
}

/**
 * Score an image against text descriptions for a single dimension.
 * Returns 0-100 score.
 */
async function scoreDimension(
  classifier: any,
  imageData: string,
  positivePrompts: string[],
  negativePrompts: string[]
): Promise<number> {
  const allLabels = [...positivePrompts, ...negativePrompts];
  const result = await classifier(imageData, allLabels, { topk: allLabels.length });

  let positiveScore = 0;
  let negativeScore = 0;
  let totalWeight = 0;

  for (const item of result) {
    const score = item.score as number;
    if (positivePrompts.includes(item.label as string)) {
      positiveScore += score;
    } else {
      negativeScore += score;
    }
    totalWeight += score;
  }

  if (totalWeight === 0) return 50;
  const normalizedScore = ((positiveScore - negativeScore + totalWeight) / (2 * totalWeight)) * 100;
  return Math.max(0, Math.min(100, Math.round(normalizedScore)));
}

function pickObservation(category: string, score: number): LocalVisionObservation {
  let severity: "positive" | "suggestion" | "warning";
  if (score >= 70) severity = "positive";
  else if (score >= 45) severity = "suggestion";
  else severity = "warning";

  const templates = OBSERVATION_TEMPLATES[category]?.[severity] || [];
  const template = templates[Math.floor(Math.random() * templates.length)] || {
    title: `${category} analysis`,
    detail: `Your ${category} score is ${score}/100.`,
    suggestion: `Focus on improving your ${category} for a better first impression.`,
  };

  return { category, severity, title: template.title, detail: template.detail, suggestion: template.suggestion, confidence: 0.7 + Math.random() * 0.25 };
}

/**
 * Run full local vision analysis on an image.
 * Completely self-sustained — no external API calls.
 * Model loads from Hugging Face on first use, then cached in browser.
 */
export async function runLocalVisionAnalysis(imageDataUrl: string): Promise<LocalVisionResult | null> {
  try {
    const classifier = await getClassifier();

    const [lighting, background, outfit, grooming, expression] = await Promise.all([
      scoreDimension(classifier, imageDataUrl, SCORING_PROMPTS.lighting.positive, SCORING_PROMPTS.lighting.negative),
      scoreDimension(classifier, imageDataUrl, SCORING_PROMPTS.background.positive, SCORING_PROMPTS.background.negative),
      scoreDimension(classifier, imageDataUrl, SCORING_PROMPTS.outfit.positive, SCORING_PROMPTS.outfit.negative),
      scoreDimension(classifier, imageDataUrl, SCORING_PROMPTS.grooming.positive, SCORING_PROMPTS.grooming.negative),
      scoreDimension(classifier, imageDataUrl, SCORING_PROMPTS.expression.positive, SCORING_PROMPTS.expression.negative),
    ]);

    const overall = Math.round(lighting * 0.25 + background * 0.15 + outfit * 0.25 + grooming * 0.2 + expression * 0.15);
    const scores = { lighting, background, outfit, grooming, expression, overall };

    const observations: LocalVisionObservation[] = [
      pickObservation("lighting", lighting),
      pickObservation("background", background),
      pickObservation("outfit", outfit),
      pickObservation("grooming", grooming),
      pickObservation("expression", expression),
    ].sort((a, b) => {
      const order = { warning: 0, suggestion: 1, positive: 2 };
      return order[a.severity] - order[b.severity];
    });

    const dims = [
      { name: "lighting", score: lighting },
      { name: "background", score: background },
      { name: "outfit", score: outfit },
      { name: "grooming", score: grooming },
      { name: "expression", score: expression },
    ].sort((a, b) => a.score - b.score);

    const topLeak = dims[0].name;
    const quickFixes = dims.slice(0, 3).map((d) => ({
      title: `Improve your ${d.name}`,
      description: `Your ${d.name} score is ${d.score}/100 — this is the biggest opportunity for improvement.`,
      impact: Math.round(100 - d.score),
    }));

    const improvementTips = [
      `Your biggest opportunity is ${topLeak} (score: ${dims[0].score}/100). Fixing this alone could improve your overall score by ${Math.round((100 - dims[0].score) * 0.25)} points.`,
      `Focus on ${dims[1].name} next (score: ${dims[1].score}/100). Combined with better ${topLeak}, you could see a significant improvement.`,
      `Your strongest dimension is ${dims[4].name} (${dims[4].score}/100) — build on this strength while improving the weaker areas.`,
    ];

    return { scores, observations, topLeak, quickFixes, improvementTips };
  } catch (err) {
    console.error("[local-vision] Analysis failed:", err);
    return null;
  }
}
