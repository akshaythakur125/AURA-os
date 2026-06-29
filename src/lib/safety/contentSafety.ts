"use client";

const UNSAFE_PATTERNS: RegExp[] = [
  /shame\s+(him|her|them|this\s+person|this\s+girl|this\s+boy|someone)/i,
  /harass\s+(him|her|them|this\s+person)/i,
  /uploading\s+(someone|another|my\s+(friend|ex|crush|colleague|classmate|sibling|partner))\s+(else'?s?|without|photo)/i,
  /(nude|naked|explicit|pornographic|sexual)\s+(photo|image|content|pic)/i,
  /judge\s+(caste|religion|race|ethnicity|sexuality|income|medical|health)/i,
  /rank\s+(these|these\s+(girls|boys|people|photos|profiles))/i,
  /which\s+one\s+(is\s+better|looks\s+better|should\s+I\s+pick|has\s+higher)/i,
  /guarantee\s+(me\s+)?(matches|dates|girlfriend|boyfriend|relationship|job|success)/i,
  /(make\s+me\s+look|help\s+me\s+look)\s+(more\s+)?(rich|wealthy|money)/i,
];

const SELF_HARM_PATTERNS: RegExp[] = [
  /(i\s+(feel\s+)?(ugly|worthless|hopeless|like\s+giving\s+up))|(i\s+(want\s+to\s+)?(hurt|harm)\s+(myself|me))/i,
];

export interface SafetyResult {
  unsafe: boolean;
  reasons: string[];
  selfHarmDetected: boolean;
}

export function sanitizeUserText(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

export function detectUnsafePromptText(input: string): SafetyResult {
  const reasons: string[] = [];
  let selfHarmDetected = false;

  const cleaned = input.trim();
  if (!cleaned) return { unsafe: false, reasons: [], selfHarmDetected: false };

  for (const pattern of UNSAFE_PATTERNS) {
    if (pattern.test(cleaned)) {
      reasons.push("Your text appears to request analysis for purposes AuraCheck does not support.");
    }
  }

  for (const pattern of SELF_HARM_PATTERNS) {
    if (pattern.test(cleaned)) {
      selfHarmDetected = true;
      reasons.push("It sounds like you may be going through a difficult time. AuraCheck is for presentation guidance only, not personal evaluation of worth.");
    }
  }

  return {
    unsafe: reasons.length > 0,
    reasons: [...new Set(reasons)],
    selfHarmDetected,
  };
}

export function getSafetyWarningForAudit(auditType: string): string {
  const warnings: Record<string, string> = {
    photo: "AuraCheck analyzes your own photo for presentation signals only. Do not upload someone else's photo without their consent.",
    instagram: "This audit evaluates your own Instagram profile for presentation coherence. Do not use it to judge or shame others.",
    dating: "AuraCheck evaluates your own dating profile for self-improvement. It cannot guarantee matches, dates, or relationships.",
    outfit: "This audit evaluates your own outfit choices. It does not judge body type or physical appearance.",
    room: "This audit evaluates your own environment. It does not judge lifestyle or economic status.",
  };
  return warnings[auditType] || "AuraCheck analyzes your own presentation for self-improvement purposes only.";
}

export function validateProfileTextSafety(profileText: string): SafetyResult {
  return detectUnsafePromptText(profileText);
}
