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
        "Right now the photo quality is holding you back — the lighting and sharpness need work. Fix those basics and your real style comes through instantly.",
      priority: "Sort your lighting and get a sharper shot first — cheapest fixes, biggest jump.",
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
        "You read relaxed and everyday — which fits campus. A little grooming and a cleaner frame instantly make you look more put-together, without losing the chill.",
      priority: "Tidy your grooming and pick an outfit on purpose — small upgrades, real difference.",
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
        "You come across sharp and put-together. To level it up, keep backgrounds clean, stick to solid neutral colours, and frame every shot the same way.",
      priority: "Clean up your background and keep your lighting consistent for a polished look.",
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
        ? "Your photo quality already works for content — now keep the same look across every post."
        : "Better lighting and sharper shots will instantly lift your content and make your feed feel cohesive.";
    return {
      archetype: "Creator Vibe",
      explanation:
        "You've got a content-aware, visual eye. " + qualityNote,
      priority: "Lock in a colour palette and photo style, then keep it consistent across your feed.",
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
        "Clean, minimal, premium — that's your read. The simple background and balanced colours look high-quality. The trick now is keeping that same standard everywhere.",
      priority: "Keep it clean and make sure every photo hits the same quality bar.",
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
        "Your vibe is quiet and clean — substance over flash. You're not trying too hard, and it reads as confident. Keep it minimal and let the details do the talking.",
      priority: "Tidy your grooming and add one or two nice pieces — quality over quantity.",
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
        "There's a lot going on in your frame — several flex pieces at once. Each might be nice, but together they compete. The biggest upgrade is cutting it down so one or two things actually land.",
      priority: "Cut the clutter. Let one or two pieces stand out instead of everything at once.",
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
        "Nice pieces, but the lighting and background aren't matching their level. Premium stuff in a dim or messy shot looks accidental. Fix the setting and it'll finally look intentional.",
      priority: "Fix your background and lighting before adding anything else to the frame.",
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
        "The photo's trying to say 'premium', but too much is competing for attention. Confidence looks like simplicity — less visible effort actually reads as more.",
      priority: "Take 2–3 things out of the frame. Let quality speak, not quantity.",
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
        "You've got that modern, social, in-the-mix look. It already works — dialing in one thing, like a cleaner background or steadier lighting, makes it hit harder.",
      priority: "Pick one thing — background or lighting — and fix it. That alone lifts the whole shot.",
      focus: "Cleaner background, lighting, real settings",
    };
  }

  // Default: Clean Basic
  return {
    archetype: "Clean Basic",
    explanation:
      "Simple and no-nonsense — a solid base to build on. The fastest glow-up is better lighting and framing, and both are free.",
    priority: "Fix your lighting and framing first — free changes that instantly make you look more intentional.",
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
