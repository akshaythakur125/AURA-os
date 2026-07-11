/**
 * Semantic Visual Analysis — uses CLIP (already in localVision.ts)
 * for goal-specific contextual interpretation.
 *
 * Same model, no new dependency. Answers semantic questions about the image.
 */

import { env, pipeline } from "@huggingface/transformers";

env.cacheDir = "transformers-cache";

type SemanticQuestion = {
  id: string;
  category: string;
  prompt: string;
  positiveLabels: string[];
  negativeLabels: string[];
};

// Goal-specific questions
const QUESTIONS: SemanticQuestion[] = [
  {
    id: "professional_suitability",
    category: "goal",
    prompt: "Does this photo look appropriate for a professional profile?",
    positiveLabels: ["professional headshot", "business portrait", "formal photo"],
    negativeLabels: ["selfie in bed", "party photo", "bathroom mirror selfie"],
  },
  {
    id: "background_clutter",
    category: "background",
    prompt: "Is the background clean and uncluttered?",
    positiveLabels: ["clean plain background", "simple solid color background", "minimalist backdrop"],
    negativeLabels: ["cluttered messy background", "busy distracting background", "messy room"],
  },
  {
    id: "lighting_quality",
    category: "lighting",
    prompt: "Is the lighting in this photo good?",
    positiveLabels: ["soft natural lighting", "even flattering light", "good portrait lighting"],
    negativeLabels: ["harsh overhead lighting", "backlit silhouette", "dark underexposed photo"],
  },
  {
    id: "clothing_formality",
    category: "style",
    prompt: "How formal is the clothing in this photo?",
    positiveLabels: ["formal business attire", "professional clothing", "dress shirt and blazer"],
    negativeLabels: ["casual t-shirt", "tank top", "pajamas"],
  },
  {
    id: "subject_prominence",
    category: "composition",
    prompt: "Is the person the main focus of this photo?",
    positiveLabels: ["portrait centered on person", "person fills most of frame", "clear subject focus"],
    negativeLabels: ["tiny person in large scene", "person too far away", "group photo with no clear subject"],
  },
  {
    id: "color_harmony",
    category: "colour",
    prompt: "Do the colors in this photo work well together?",
    positiveLabels: ["harmonious color palette", "coordinated colors", "pleasing color tones"],
    negativeLabels: ["clashing colors", "overly saturated neon colors", "washed out colors"],
  },
  {
    id: "expression_natural",
    category: "expression",
    prompt: "Does the person have a natural, approachable expression?",
    positiveLabels: ["natural smile", "friendly expression", "warm approachable look"],
    negativeLabels: ["awkward forced smile", "angry or upset expression", "blank expressionless face"],
  },
  {
    id: "platform_suitability",
    category: "goal",
    prompt: "Would this photo work well on social media?",
    positiveLabels: ["good social media photo", "instagram worthy", "visually appealing portrait"],
    negativeLabels: ["low quality phone photo", "blurry social media photo", "poorly composed selfie"],
  },
];

let clipModel: any = null;

async function getClipModel() {
  if (clipModel) return clipModel;
  clipModel = await pipeline("zero-shot-image-classification", "Xenova/clip-vit-base-patch32", {
    device: "webgpu" as any,
  });
  return clipModel;
}

/**
 * Run semantic analysis on an image.
 * Returns structured observations from CLIP zero-shot classification.
 */
export async function runSemanticAnalysis(
  img: HTMLImageElement,
  goal: string
): Promise<Array<{
  id: string;
  category: string;
  observation: string;
  positiveScore: number;
  negativeScore: number;
  confidence: number;
}>> {
  try {
    const model = await getClipModel();
    // Select relevant questions based on goal
    const relevantQuestions = QUESTIONS.filter((q) => {
      if (q.category === "goal") return true;
      if (goal === "linkedin" || goal === "office" || goal === "content") return true;
      return true;
    });

    const results = [];

    for (const question of relevantQuestions) {
      try {
        const allLabels = [...question.positiveLabels, ...question.negativeLabels];
        const output = await model(img, allLabels, { topk: allLabels.length });

        let positiveScore = 0;
        let negativeScore = 0;
        for (const item of output) {
          if (question.positiveLabels.includes(item.label)) {
            positiveScore += item.score;
          } else {
            negativeScore += item.score;
          }
        }

        const netScore = positiveScore - negativeScore;
        const confidence = Math.abs(netScore) > 0.1 ? 0.8 : 0.5;

        results.push({
          id: question.id,
          category: question.category,
          observation: netScore > 0.1
            ? `Positive signal detected for ${question.category}`
            : netScore < -0.1
            ? `Area for improvement in ${question.category}`
            : `Neutral — ${question.category} is acceptable`,
          positiveScore,
          negativeScore,
          confidence,
        });
      } catch {
        // Skip failed questions
      }
    }

    return results;
  } catch {
    return [];
  }
}

/** Dispose model */
export function disposeSemanticModel() {
  clipModel = null;
}
