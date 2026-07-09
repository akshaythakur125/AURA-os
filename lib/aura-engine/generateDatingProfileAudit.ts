import type { Audit } from "@/types";
import type { ProfileTextInput, ProfileAuditResult, PreferredTone } from "@/types/profileAudit";
import { analyzeProfileText, analyzeBio, analyzePrompts, analyzeCaptions } from "@/lib/aura-engine/profileTextAnalysis";

const BIO_VERSION_TEMPLATES: Record<string, string[]> = {
  clean: [
    "Clean/confident: '[your field]. [activity]. Looking for someone who actually wants to [shared activity].'",
    "Clean/confident: '[trait] + [interest]. That's basically it.'",
    "Clean/confident: 'I make [thing]. I enjoy [thing]. I'm looking for [quality].'",
  ],
  witty: [
    "Warm/witty: 'Professionally good at [skill]. Personally bad at [funny flaw]. Let's balance each other out.'",
    "Warm/witty: 'My friends say I'm [trait]. My mom says I'm [trait]. Both are true.'",
    "Warm/witty: 'I'll bring [thing] if you bring [thing]. We'll figure the rest out.'",
  ],
  premium: [
    "Premium/minimal: '[quality]. [profession]. [interest]. That's all you need to know.'",
    "Premium/minimal: 'Simple. Intentional. Looking for the same.'",
    "Premium/minimal: 'I value [quality]. I invest in [interest]. I'm looking for [quality].'",
  ],
};

const PROMPT_IDEAS: string[] = [
  "A perfect day for me looks like...",
  "My go-to conversation starter is...",
  "The most spontaneous thing I've done recently...",
  "Two truths and a lie:",
  "I'm looking for someone who...",
  "My therapist says I need...",
  "The best compliment I've ever received...",
  "Something I'm genuinely proud of...",
  "My comfort meal is...",
  "I feel most myself when...",
];

const PHOTO_ORDER_STRATEGY: string[] = [
  "1. Clear solo photo — well-lit, face visible, no sunglasses",
  "2. Lifestyle/context photo — doing an activity you genuinely enjoy",
  "3. Interest/activity photo — hobby or skill that shows personality",
  "4. Social proof photo — with friends (if appropriate), showing you are social",
  "5. Polished casual shot — clean, intentional, relaxed",
];

const DO_THIS: string[] = [
  "Keep your bio between 15–50 words for maximum impact.",
  "Use specific details instead of generic adjectives.",
  "End prompts with a conversation hook.",
  "Lead with your strongest photo — smiling, well-lit, clear.",
  "Keep your profile consistent in tone.",
];

const AVOID_THIS: string[] = [
  "Avoid cliché phrases like 'wanderlust' or 'just ask'.",
  "Avoid negativity — no 'no drama' or complaints.",
  "Do not overuse emojis — 1–3 max for the entire profile.",
  "Avoid listing demands or dealbreakers.",
  "Do not flex status items — let your photos show them naturally.",
];

function getOverallScore(metrics: ReturnType<typeof analyzeProfileText>, input: ProfileTextInput): number {
  let score = 70;
  score += (metrics.clarityScore - 50) * 0.15;
  score += (metrics.originalityScore - 50) * 0.2;
  score += (metrics.warmthScore - 50) * 0.15;
  score += (metrics.confidenceSignalScore - 50) * 0.1;
  score += (metrics.readabilityScore - 50) * 0.1;
  score -= metrics.tryHardRiskScore * 0.15;
  score -= metrics.negativityRiskScore * 0.1;
  score -= metrics.statusOverloadScore * 0.1;
  score -= metrics.clichéFlags.length * 3;
  if (input.bio && metrics.bioLength < 5) score -= 5;
  if (input.bio && metrics.bioLength > 80) score -= 5;
  if ((input.prompts?.length || 0) === 0 && (input.captions?.length || 0) === 0) score -= 5;
  return Math.max(20, Math.min(100, Math.round(score)));
}

function generateFrictionSummary(metrics: ReturnType<typeof analyzeProfileText>): string {
  const issues: string[] = [];
  if (metrics.clichéFlags.length > 0) issues.push(`${metrics.clichéFlags.length} cliché phrases`);
  if (metrics.originalityScore < 40) issues.push("low originality");
  if (metrics.tryHardRiskScore > 40) issues.push("may appear try-hard");
  if (metrics.negativityRiskScore > 30) issues.push("negativity detected");
  if (metrics.statusOverloadScore > 30) issues.push("status overload risk");
  if (metrics.improvementFlags.length > 0) issues.push(`${metrics.improvementFlags.length} improvement areas`);
  if (issues.length === 0) return "Minimal friction — your profile text reads well.";
  return `Main friction sources: ${issues.join(", ")}.`;
}

function getRedFlags(input: ProfileTextInput, metrics: ReturnType<typeof analyzeProfileText>): string[] {
  const flags: string[] = [];
  if ((input.prompts?.length || 0) === 0 && (input.captions?.length || 0) === 0 && input.bio) {
    flags.push("No prompts or captions provided — bio alone limits depth.");
  }
  if (metrics.clichéFlags.length > 2) flags.push(`Multiple cliché phrases (${metrics.clichéFlags.slice(0, 3).join(", ")}) — reduces originality.`);
  if (metrics.negativityRiskScore > 40) flags.push("Negativity detected in text — may be off-putting.");
  if (metrics.tryHardRiskScore > 50) flags.push("High try-hard risk — let confidence speak naturally.");
  if (input.bio && metrics.bioLength > 80) flags.push("Bio is quite long — may lose reader attention.");
  return flags;
}

function pickBioTemplates(input: ProfileTextInput, preferredTone?: PreferredTone): string[] {
  if (preferredTone && BIO_VERSION_TEMPLATES[preferredTone]) {
    return BIO_VERSION_TEMPLATES[preferredTone];
  }
  const tones = Object.values(BIO_VERSION_TEMPLATES);
  return tones.flat().slice(0, 3);
}

function generateFinalStrategy(score: number): string {
  if (score >= 80) return "Your profile text is already strong. Focus on photo quality and consistency to complete the presentation.";
  if (score >= 60) return "Your profile has good foundations. Removing clichés and adding more specific details will elevate it to the next level.";
  if (score >= 40) return "Your profile needs work. Start by rewriting your bio without clichés, adding at least one original prompt, and removing any negativity.";
  return "Your profile text needs significant improvement. Focus on writing a clean, original bio (15–30 words), adding 2–3 authentic prompts, and removing all negativity and clichés.";
}

export function generateDatingProfileAudit(audit: Audit): ProfileAuditResult {
  const input: ProfileTextInput = audit.profileTextInput || {};
  const preferredTone: PreferredTone | undefined = input.preferredTone;
  const metrics = analyzeProfileText(input);
  const score = getOverallScore(metrics, input);
  const bioFeedback = analyzeBio(input);
  const promptFeedback = analyzePrompts(input);
  const captionFeedback = analyzeCaptions(input);
  const redFlags = getRedFlags(input, metrics);

  return {
    profileScore: score,
    profileFrictionSummary: generateFrictionSummary(metrics),
    textMetrics: metrics,
    bioFeedback,
    promptFeedback,
    captionFeedback,
    redFlags,
    suggestedBioVersions: pickBioTemplates(input, preferredTone),
    suggestedPromptIdeas: PROMPT_IDEAS.slice(0, 5),
    photoOrderStrategy: PHOTO_ORDER_STRATEGY,
    doThis: DO_THIS,
    avoidThis: AVOID_THIS,
    finalProfileStrategy: generateFinalStrategy(score),
    generatedAt: new Date().toISOString(),
  };
}
