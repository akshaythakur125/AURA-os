import type { ProfileTextInput, ProfileTextMetrics, BioFeedback, PromptFeedback } from "@/types/profileAudit";

const CLICHÉ_PHRASES = [
  "sapiosexual", "wanderlust", "foodie", "gym freak", "just ask",
  "here for a good time", "no drama", "vibes only", "king", "queen",
  "sigma", "high value", "entrepreneur", "work hard play hard",
  "love to laugh", "looking for my partner in crime", "adventure seeker",
  "coffee addict", "dog mom", "dog dad", "living my best life",
  "fluent in sarcasm", "good vibes only", "travel enthusiast",
  "netflix and chill", "chill vibes", "positive vibes only",
];

const NEGATIVITY_WORDS = [
  "hate", "awful", "terrible", "worst", "boring", "dull",
  "annoying", "drama", "toxic", "broken", "ugly", "stupid",
  "lame", "pathetic", "sucks", "trash",
];

const FLEX_WORDS = [
  "lamborghini", "mercedes", "bmw", "rolex", "gucci", "louis vuitton",
  "prada", "versace", "dior", "fendi", "balenciaga", "supreme",
  "private jet", "yacht", "penthouse", "exclusive", "vip",
  "rich", "wealthy", "millionaire", "billionaire",
];

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function checkClichés(text: string): string[] {
  const lower = text.toLowerCase();
  return CLICHÉ_PHRASES.filter((c) => lower.includes(c));
}

function countEmojis(text: string): number {
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const matches = text.match(emojiRegex);
  return matches ? matches.length : 0;
}

function checkNegativity(text: string): number {
  const lower = text.toLowerCase();
  return NEGATIVITY_WORDS.filter((w) => lower.includes(w)).length;
}

function checkStatusOverload(text: string): number {
  const lower = text.toLowerCase();
  return FLEX_WORDS.filter((w) => lower.includes(w)).length;
}

function assessClarity(text: string): number {
  const words = countWords(text);
  if (words === 0) return 50;
  if (words < 5) return 30;
  if (words < 15) return 50;
  if (words > 100) return 60;
  return 75;
}

function assessOriginality(text: string, clichéCount: number): number {
  const words = countWords(text);
  if (words === 0) return 50;
  const clichéDensity = clichéCount / Math.max(1, words);
  if (clichéDensity > 0.3) return 20;
  if (clichéDensity > 0.15) return 40;
  if (clichéDensity > 0.05) return 60;
  return 80;
}

function assessWarmth(text: string): number {
  const lower = text.toLowerCase();
  const warmWords = ["love", "kind", "warm", "smile", "laugh", "fun", "joy", "happy", "care", "gentle", "sweet", "nice", "wonderful", "great"];
  const count = warmWords.filter((w) => lower.includes(w)).length;
  return Math.min(100, 40 + count * 10);
}

function assessConfidence(text: string): number {
  const lower = text.toLowerCase();
  const confidentWords = ["confident", "sure", "know", "build", "create", "lead", "driven", "ambitious", "goal", "growth"];
  const tentativeWords = ["maybe", "kinda", "sort of", "i guess", "not sure", "perhaps", "hopefully"];
  const confident = confidentWords.filter((w) => lower.includes(w)).length;
  const tentative = tentativeWords.filter((w) => lower.includes(w)).length;
  return Math.max(0, Math.min(100, 50 + confident * 10 - tentative * 15));
}

function assessReadability(text: string): number {
  const words = countWords(text);
  if (words === 0) return 50;
  const avgWordLength = text.replace(/[^a-zA-Z ]/g, "").split(/\s+/).filter(Boolean).reduce((sum, w) => sum + w.length, 0) / Math.max(1, words);
  if (avgWordLength > 8) return 40;
  if (avgWordLength > 6) return 65;
  return 85;
}

function assessTryHardRisk(text: string): number {
  const lower = text.toLowerCase();
  let risk = 0;
  const flexCount = FLEX_WORDS.filter((w) => lower.includes(w)).length;
  risk += flexCount * 15;
  if (lower.includes("influencer")) risk += 10;
  if (lower.includes("hustle") || lower.includes("grind")) risk += 10;
  if (countEmojis(text) > 5) risk += 10;
  const hashtagCount = (text.match(/#/g) || []).length;
  if (hashtagCount > 3) risk += 10;
  if (lower.split("!").length > 3) risk += 5;
  return Math.min(100, risk);
}

function generateLengthAssessment(words: number): string {
  if (words === 0) return "No bio provided.";
  if (words < 10) return "Very short — consider adding more context.";
  if (words < 25) return "Concise and clear — well within effective range.";
  if (words < 50) return "Good length with enough detail.";
  if (words < 80) return "Detailed but may lose attention — trim slightly.";
  return "Quite long — risk of losing reader interest.";
}

function generateImprovementFlags(text: string, bio: boolean): string[] {
  const flags: string[] = [];
  const lower = text.toLowerCase();
  const words = countWords(text);
  const emojiCount = countEmojis(text);
  if (bio && words < 5 && words > 0) flags.push("Bio is very short — add more personality.");
  if (emojiCount > 5) flags.push("High emoji density — consider reducing.");
  if (text.includes("...")) flags.push("Avoid trailing ellipses — they can seem uncertain.");
  if (text === text.toUpperCase() && words > 3) flags.push("Avoid all-caps — it reads as shouting.");
  if (checkNegativity(text) > 0) flags.push("Contains negativity words — keep tone positive.");
  if (checkStatusOverload(text) > 0) flags.push("Status mentions may overwhelm — consider reducing.");
  if (lower.includes("dm me") || lower.includes("slide into")) flags.push("Avoid direct 'DM me' calls — let the profile speak.");
  return flags;
}

export function analyzeProfileText(input: ProfileTextInput): ProfileTextMetrics {
  const bio = input.bio || "";
  const allPrompts = (input.prompts || []).join(" ");
  const allCaptions = (input.captions || []).join(" ");
  const combined = [bio, allPrompts, allCaptions].join(" ");
  const clichéFlags = checkClichés(combined);
  const improvementFlags = generateImprovementFlags(combined, !!bio);
  const clichéCount = clichéFlags.length;

  return {
    bioLength: countWords(bio),
    promptCount: input.prompts?.length || 0,
    captionCount: input.captions?.length || 0,
    clarityScore: assessClarity(combined),
    originalityScore: assessOriginality(combined, clichéCount),
    tryHardRiskScore: assessTryHardRisk(combined),
    negativityRiskScore: Math.min(100, checkNegativity(combined) * 20),
    statusOverloadScore: Math.min(100, checkStatusOverload(combined) * 15),
    warmthScore: assessWarmth(combined),
    confidenceSignalScore: assessConfidence(combined),
    readabilityScore: assessReadability(combined),
    clichéFlags,
    improvementFlags,
  };
}

export function analyzeBio(input: ProfileTextInput): BioFeedback | null {
  const bio = input.bio || "";
  if (!bio.trim()) return null;
  const words = countWords(bio);
  const clichés = checkClichés(bio);
  const emojiCount = countEmojis(bio);
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (words >= 15 && words <= 50) strengths.push("Good length — enough to express personality without losing attention.");
  if (words > 50) weaknesses.push("Bio may be too long — consider trimming to keep impact.");
  if (emojiCount === 0) strengths.push("No emojis — clean presentation.");
  if (emojiCount > 3) weaknesses.push("High emoji count may distract from your words.");
  if (clichés.length === 0) strengths.push("Original phrasing — no overused clichés detected.");
  if (clichés.length > 0) weaknesses.push(`Contains clichés: ${clichés.join(", ")}`);
  if (assessOriginality(bio, clichés.length) < 40) weaknesses.push("Bio reads as generic — add personal specifics.");
  if (assessWarmth(bio) < 30) weaknesses.push("Bio may feel cold — consider warmer language.");
  if (checkNegativity(bio) > 0) weaknesses.push("Negativity detected — keep the tone positive.");

  return {
    overall: weaknesses.length > 0
      ? "Your bio has room for improvement."
      : "Your bio reads well and is effective.",
    strengths,
    weaknesses,
    clichéCount: clichés.length,
    emojiDensity: words > 0 ? `${(emojiCount / words * 100).toFixed(0)}%` : "0%",
    lengthAssessment: generateLengthAssessment(words),
  };
}

export function analyzePrompts(input: ProfileTextInput): PromptFeedback[] {
  return (input.prompts || []).map((prompt) => {
    const lower = prompt.toLowerCase();
    const clichés = checkClichés(prompt);
    const originalityScore = assessOriginality(prompt, clichés.length);
    const words = countWords(prompt);
    let feedback = "";
    let suggestion = "";

    if (words < 3) {
      feedback = "Very short — expand to show more personality.";
    } else if (clichés.length > 0) {
      feedback = `Contains cliché phrasing (${clichés.join(", ")}). Try rewriting in your own words.`;
    } else if (originalityScore < 40) {
      feedback = "Feels generic — add a specific detail unique to you.";
    } else {
      feedback = "Good — feels authentic and readable.";
    }

    if (lower.includes("just ask")) {
      suggestion = 'Replace "just ask" with something specific about yourself.';
    } else if (lower.includes("travel") || lower.includes("adventure")) {
      suggestion = "Instead of general travel mention, share one specific memorable experience.";
    } else {
      suggestion = "Consider ending with a conversation hook.";
    }

    return { prompt, feedback, originalityScore, suggestion };
  });
}

export function analyzeCaptions(input: ProfileTextInput): string[] {
  return (input.captions || []).map((caption) => {
    const words = countWords(caption);
    const clichés = checkClichés(caption);
    if (words < 2) return "Too short to evaluate — add at least some context.";
    if (clichés.length > 0) return `Contains clichés (${clichés.join(", ")}). Try something original.`;
    if (words > 40) return "Caption is long — consider tightening.";
    return "Clear and readable.";
  });
}
