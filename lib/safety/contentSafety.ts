import type { Audit } from "@/types";

const UNSAFE_PATTERNS = [
  /\b(kill|die|suicide|self-harm|hurt myself|end my life)\b/i,
  /\b(rate me|judge me|am i ugly|do i look bad|am i unattractive)\b/i,
  /\b(shame|humiliate|embarrass|bully|make fun of)\b/i,
  /\b(caste|religion|ethnicity|race|tribe)\s*(rating|score|judge|rate)\b/i,
  /\b(sexual|nude|naked|explicit|porn)\b/i,
  /\b(without them knowing|secretly|without consent|hidden camera)\b/i,
  /\b(manipulate|gaslight|trick|deceive)\b/i,
];

export interface SafetyCheckResult {
  safe: boolean;
  flags: string[];
  message?: string;
}

export function sanitizeUserText(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

export function detectUnsafePromptText(input: string): SafetyCheckResult {
  const flags: string[] = [];
  const lower = input.toLowerCase();

  for (const pattern of UNSAFE_PATTERNS) {
    if (pattern.test(lower)) {
      flags.push(pattern.source);
    }
  }

  if (flags.length > 0) {
    return {
      safe: false,
      flags,
      message: "AuraCheck can analyze presentation for self-improvement, but it cannot be used to shame, harass, or judge protected traits.",
    };
  }

  return { safe: true, flags: [] };
}

export function getSafetyWarningForAudit(audit: Audit): string | null {
  if (audit.profileTextInput?.bio && !detectUnsafePromptText(audit.profileTextInput.bio).safe) {
    return "Please review your bio text for unsafe content.";
  }
  if (audit.profileTextInput?.captions) {
    for (const c of audit.profileTextInput.captions) {
      if (!detectUnsafePromptText(c).safe) return "Please review your captions for unsafe content.";
    }
  }
  return null;
}

export function validateProfileTextSafety(input: {
  bio?: string;
  prompts?: string[];
  captions?: string[];
}): SafetyCheckResult {
  const allFlags: string[] = [];
  const texts = [input.bio || "", ...(input.prompts || []), ...(input.captions || [])];

  for (const text of texts) {
    const result = detectUnsafePromptText(text);
    if (!result.safe) {
      allFlags.push(...result.flags);
    }
  }

  if (allFlags.length > 0) {
    return {
      safe: false,
      flags: [...new Set(allFlags)],
      message: "AuraCheck can analyze presentation for self-improvement, but it cannot be used to shame, harass, or judge protected traits.",
    };
  }

  return { safe: true, flags: [] };
}

export function getConsentText(): { label: string; items: string[] } {
  return {
    label: "Before you proceed, please confirm:",
    items: [
      "I own this image or have permission to use it.",
      "I am using AuraCheck for self-improvement and presentation guidance.",
      "I understand that scores are guidance, not objective truth.",
    ],
  };
}
