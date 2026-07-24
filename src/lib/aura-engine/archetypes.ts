import type { Audit, ImageSignalMetrics } from "@/types/audit";
import type {
  PersonalizationResult,
  StatusArchetype,
} from "@/types/personalization";
import { detectSignalMismatches } from "./signalMismatch";
import { generateGoalStrategy } from "./goalStrategy";

function pickArchetype(
  audit: Audit,
  metrics?: ImageSignalMetrics
): { archetype: StatusArchetype; explanation: string; priority: string; focus: string } {
  const d = audit.deepInput;
  const goal = audit.goal;
  const style = d?.styleIntent;
  const signals = d?.currentSignals || [];
  const concern = d?.biggestConcern;

  const hasManySignals = signals.length >= 3 && !signals.includes("none");
  const hasStatusSignals =
    signals.includes("phone_visible") ||
    signals.includes("watch_visible") ||
    signals.includes("bike_car_visible") ||
    signals.includes("branded_item_visible");
  const hasCafeTravel =
    signals.includes("cafe_signal") || signals.includes("travel_signal");
  const conservativeStyle =
    style === "clean" || style === "understated" || style === "professional";
  const premiumStyle = style === "premium";
  const boldStyle = style === "bold";
  const creatorStyle = style === "creator";

  const lowLight = metrics ? metrics.lightingScore < 45 : false;
  const lowClarity = metrics ? metrics.clarityScore < 40 : false;
  const highBg = metrics ? metrics.backgroundComplexityEstimate > 65 : false;
  const decentClarity = metrics ? metrics.clarityScore >= 55 : false;
  const decentLight = metrics ? metrics.lightingScore >= 55 : false;
  const lowBg = metrics ? metrics.backgroundComplexityEstimate <= 45 : false;
  const balancedColor = metrics
    ? metrics.saturation >= 35 && metrics.saturation <= 60
    : false;

  // Low-Clarity Potential: poor image quality
  if ((lowLight && lowClarity) || (lowLight && highBg)) {
    return {
      archetype: "Low-Clarity Potential",
      explanation:
        "Real talk — the photo quality is what's holding you back rn. Lighting's off and it's a bit blurry. Fix that and your actual vibe finally shows up.",
      priority: "Sort the lighting and get a sharp shot first. Cheapest fix, biggest aura jump.",
      focus: "Lighting, sharpness, framing",
    };
  }

  // College Casual — driven by goal/context, NOT budget (a small shopping
  // budget shouldn't decide someone's presentation archetype).
  if (
    goal === "college" ||
    d?.occasionContext === "college_daily"
  ) {
    return {
      archetype: "College Casual",
      explanation:
        "You give relaxed, everyday energy — which totally works for campus. A little grooming and a cleaner frame and you instantly look more put-together, no cap.",
      priority: "Tidy the grooming, pick the fit on purpose. Small moves, real difference.",
      focus: "Grooming, outfit fit, clean backgrounds",
    };
  }

  // Corporate Sharp
  if (
    goal === "office" ||
    d?.occasionContext === "office_profile" ||
    style === "professional"
  ) {
    return {
      archetype: "Corporate Sharp",
      explanation:
        "You already read sharp and put-together. Keep the background clean, stick to solid neutral colours, and frame it the same way every time — that's a lock.",
      priority: "Clean background + consistent lighting = polished. That's the move.",
      focus: "Clean backgrounds, steady lighting, neutral colours",
    };
  }

  // Creator Vibe
  if (
    creatorStyle ||
    goal === "instagram" ||
    d?.occasionContext === "creator_content"
  ) {
    const qualityNote =
      decentClarity && decentLight
        ? "Your photo quality's already there — now keep the exact same look every post so the feed's cohesive."
        : "Better lighting and sharper shots and your content instantly levels up — feed starts looking curated.";
    return {
      archetype: "Creator Vibe",
      explanation:
        "You've got that content-creator eye. " + qualityNote,
      priority: "Lock a colour palette and photo style, then run it back every post.",
      focus: "Consistent look, lighting, colour palette",
    };
  }

  // Premium Minimalist
  if (
    (premiumStyle || style === "understated") &&
    lowBg &&
    balancedColor &&
    decentLight
  ) {
    return {
      archetype: "Premium Minimalist",
      explanation:
        "Clean, minimal, kinda expensive-looking — that's the read. Simple background, balanced colours, high quality. Just keep that same energy everywhere.",
      priority: "Keep it clean and make every photo hit the same bar.",
      focus: "Consistency, tight colour palette, intentional framing",
    };
  }

  // Soft Luxury
  if (
    (premiumStyle || conservativeStyle) &&
    lowBg &&
    !boldStyle &&
    decentLight
  ) {
    return {
      archetype: "Soft Luxury",
      explanation:
        "Your vibe is quiet luxury — substance over flash. You're not trying too hard and it reads as confident. Keep it minimal and let the little details do the talking.",
      priority: "Fix up the grooming, add one or two nice pieces. Quality over quantity, always.",
      focus: "Grooming, a couple of nice pieces, clean backgrounds",
    };
  }

  // Loud Flex
  if (
    (boldStyle || hasManySignals) &&
    hasStatusSignals &&
    (highBg || !conservativeStyle)
  ) {
    return {
      archetype: "Loud Flex",
      explanation:
        "There's a LOT going on in the frame — like five flexes at once. Each might be nice but together they're fighting for attention. Cut it down so one or two things actually hit.",
      priority: "Kill the clutter. Let one or two pieces be the main character, not all of them.",
      focus: "Cutting clutter, one hero piece, cleaner frame",
    };
  }

  // Mismatched Flex
  if (
    hasStatusSignals &&
    ((lowLight && highBg) || (lowClarity && highBg))
  ) {
    return {
      archetype: "Mismatched Flex",
      explanation:
        "Nice pieces, but the lighting and background aren't matching the energy. Premium stuff in a dim, messy shot just looks accidental. Fix the setting and it finally looks intentional.",
      priority: "Fix the background and lighting before adding anything else to the frame.",
      focus: "Cleaner background, better lighting, fewer items",
    };
  }

  // Try-Hard Signal
  if (
    hasManySignals &&
    boldStyle &&
    (concern === "looking_tryhard" || concern === "outfit_confusion")
  ) {
    return {
      archetype: "Try-Hard Signal",
      explanation:
        "The photo's trying to scream 'premium', but too much is competing. Confidence is simplicity — less effort on show actually reads as more aura.",
      priority: "Take 2-3 things out the frame. Let quality talk, not quantity.",
      focus: "Keep it simple, intentional picks, less effort on show",
    };
  }

  // Urban Aspirational
  if (
    hasCafeTravel ||
    (style === "attractive" || style === "confident") ||
    (decentLight && !lowBg)
  ) {
    return {
      archetype: "Urban Aspirational",
      explanation:
        "You've got that modern, in-the-mix, main-character energy. It already works — dial in one thing, like a cleaner background or steadier light, and it hits way harder.",
      priority: "Pick one thing — background or lighting — and fix it. That alone carries the whole shot.",
      focus: "Cleaner background, lighting, real settings",
    };
  }

  // Default: Clean Basic
  return {
    archetype: "Clean Basic",
    explanation:
      "Simple, no-nonsense — a solid base to build on. Fastest glow-up? Better lighting and framing, and both are free.",
    priority: "Lighting and framing first. Free changes that instantly make you look like you meant it.",
    focus: "Lighting, framing, basic grooming",
  };
}

function determineTone(audit: Audit): "direct" | "balanced" | "soft" {
  if (audit.deepInput?.wantsBrutalFeedback) return "direct";
  if (audit.deepInput?.selfRatedConfidence === "low") return "soft";
  return "balanced";
}

export function generateStatusArchetype(
  audit: Audit,
  metrics?: ImageSignalMetrics
): PersonalizationResult {
  const { archetype, explanation, priority, focus } = pickArchetype(audit, metrics);
  const mismatches = detectSignalMismatches(audit, metrics);
  const goalStrategy = generateGoalStrategy(audit, {
    archetype,
    archetypeExplanation: explanation,
    signalMismatches: mismatches,
    goalStrategy: {
      goal: audit.goal,
      strategyTitle: "",
      whatToOptimize: "",
      whatToAvoid: "",
      bestNextMove: "",
      suggestedPhotoDirection: "",
      suggestedStyleDirection: "",
    },
    tonePreference: "balanced",
    userPriority: priority,
    recommendedFocus: focus,
  });

  return {
    archetype,
    archetypeExplanation: explanation,
    signalMismatches: mismatches,
    goalStrategy,
    tonePreference: determineTone(audit),
    userPriority: priority,
    recommendedFocus: focus,
  };
}
