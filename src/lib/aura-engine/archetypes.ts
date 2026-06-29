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
  const budget = audit.budgetRange;
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
        "The image quality signals suggest room for improvement in lighting and clarity. Once these basics are addressed, your natural presentation style will become much clearer.",
      priority: "Improve lighting and clarity first — these are the cheapest and highest-impact fixes.",
      focus: "Lighting, clarity, framing",
    };
  }

  // College Casual
  if (
    goal === "college" ||
    d?.occasionContext === "college_daily" ||
    (budget <= 2000 && !premiumStyle && !boldStyle)
  ) {
    return {
      archetype: "College Casual",
      explanation:
        "Your presentation reads as relaxed and everyday, which is appropriate for college contexts. Small improvements in grooming and intentional framing can elevate your signal without losing authenticity.",
      priority: "Improve grooming basics and choose intentional outfits — even small upgrades increase perceived effort.",
      focus: "Grooming, outfit fit, background simplicity",
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
        "Your presentation signals professionalism and intentionality. To strengthen this, focus on clean backgrounds, solid neutral colors, and consistent framing across all profile photos.",
      priority: "Refine background control and lighting consistency for a polished professional look.",
      focus: "Background simplicity, lighting consistency, neutral tones",
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
        ? "Your image quality supports content creation well. Focus on maintaining a consistent visual theme across posts."
        : "Improving lighting and sharpness will significantly boost your content quality and feed cohesion.";
    return {
      archetype: "Creator Vibe",
      explanation:
        "Your presentation signals a content-aware, visually intentional style. " + qualityNote,
      priority: "Build a consistent color palette and photo style across your feed.",
      focus: "Visual consistency, lighting, color palette",
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
        "Your presentation reads as intentionally minimal and premium. The controlled background and balanced colors support a high-quality visual signal. The key is maintaining this consistency across all touchpoints.",
      priority: "Sustain the clean aesthetic and ensure every photo reflects the same quality standard.",
      focus: "Consistency, controlled palette, intentional framing",
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
        "Your presentation leans toward understated quality. The controlled environment and balanced approach suggest a preference for substance over flash. This signals confidence without trying too hard.",
      priority: "Refine grooming and accessory choices to match the understated premium tone.",
      focus: "Grooming, quality-over-quantity accessories, intentional backgrounds",
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
        "Your presentation includes multiple visible status signals. While each item may be premium individually, the combined effect can feel overwhelming. The most impactful upgrade is editing — reducing visual noise so each signal lands clearly.",
      priority: "Reduce competing elements. Let one or two items stand out instead of everything at once.",
      focus: "Visual editing, reducing clutter, intentional minimalism",
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
        "There is a gap between the status items in your frame and the overall presentation quality. Premium items surrounded by weak lighting or a cluttered background create a signal mismatch. Fixing the background and lighting will make the items look intentional, not accidental.",
      priority: "Fix the background and lighting before adding more items to the frame.",
      focus: "Background cleanup, lighting improvement, reducing visible items",
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
        "The presentation may be trying to signal premium value, but too many elements compete for attention. The strongest signal comes from confidence in simplicity — reducing visible effort actually increases perceived status.",
      priority: "Remove 2-3 elements from the frame. Let quality speak over quantity.",
      focus: "Minimalism, intentional choices, reducing visible effort",
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
        "Your presentation fits the urban aspirational style — socially aware, visually engaged, and contextually modern. The signal is positive but can be strengthened by improving one or two key areas like background control or lighting consistency.",
      priority: "Choose one area (background or lighting) and improve it — this alone lifts the overall signal.",
      focus: "Background control, lighting, authentic context",
    };
  }

  // Default: Clean Basic
  return {
    archetype: "Clean Basic",
    explanation:
      "Your presentation reads as straightforward and unpretentious. This is a solid foundation. The fastest upgrade comes from improving lighting and framing — these are free changes that immediately elevate how intentional you look.",
    priority: "Improve lighting and framing first. These free changes create the most visible upgrade.",
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
