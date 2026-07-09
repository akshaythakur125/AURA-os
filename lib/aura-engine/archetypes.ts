import type { Audit, ImageMetrics } from "@/types";
import type { DeepAuditInput, StatusArchetype, PersonalizationResult } from "@/types/personalization";

function pickArchetype(input: DeepAuditInput, metrics: ImageMetrics, audit: Audit): StatusArchetype {
  const intent = input.styleIntent;
  const signals = input.currentSignals || [];
  const concern = input.biggestConcern;
  const context = input.occasionContext;
  const goal = audit.goal;

  const signalCount = signals.filter((s) => s !== "none").length;
  const hasStatusSignals = signals.some((s) => ["phone_visible", "watch_visible", "shoes_visible", "branded_item_visible", "bike_car_visible"].includes(s));
  const weakLighting = metrics.lightingScore < 55;
  const weakClarity = metrics.clarityScore < 55;
  const weakComposition = metrics.compositionScore < 55;
  const busyBg = metrics.backgroundComplexityEstimate > 70;
  const strongMetrics = !weakLighting && !weakClarity && !weakComposition && !busyBg;

  if (goal === "office" && intent === "professional") return "Corporate Sharp";
  if (goal === "college" && (!intent || intent === "college" || intent === "clean")) return "College Casual";
  if (intent === "creator" || context === "creator_content") return "Creator Vibe";
  if (intent === "premium" || intent === "understated") {
    if (strongMetrics) return "Premium Minimalist";
    if (busyBg || weakClarity) return "Mismatched Flex";
    return "Soft Luxury";
  }
  if (intent === "bold" || intent === "confident") {
    if (hasStatusSignals && signalCount >= 2) return "Loud Flex";
    if (weakLighting || weakClarity) return "Try-Hard Signal";
    return "Urban Aspirational";
  }
  if (intent === "attractive" || goal === "dating") {
    if (strongMetrics) return "Soft Luxury";
    if (busyBg) return "Mismatched Flex";
    return "Urban Aspirational";
  }
  if (hasStatusSignals && (weakClarity || busyBg || weakComposition)) return "Mismatched Flex";
  if (weakLighting || weakClarity || weakComposition) return "Low-Clarity Potential";
  if (concern === "looking_tryhard" || concern === "outfit_confusion") return "Try-Hard Signal";
  if (hasStatusSignals && signalCount >= 3) return "Loud Flex";
  if (strongMetrics && hasStatusSignals) return "Urban Aspirational";

  return "Clean Basic";
}

function generateArchetypeExplanation(archetype: StatusArchetype): string {
  const explanations: Record<StatusArchetype, string> = {
    "Clean Basic": "Your presentation is clean and understated. You are not trying too hard, which reads as confidence. A few intentional upgrades — better lighting, a more structured outfit — can take this from basic to memorable without losing the effortless vibe.",
    "Urban Aspirational": "You present yourself as someone who is aware of trends and signals. Your photo includes lifestyle cues that suggest ambition. Strengthen the visual fundamentals so the signals land consistently.",
    "Premium Minimalist": "Your presentation is refined and intentional. Nothing in the frame is accidental. This is a strong archetype for dating, professional, and social contexts — the goal is to maintain consistency across all photos.",
    "Loud Flex": "You are signaling multiple status indicators. This can work in specific contexts, but the risk is that no single signal stands out. Simplify the frame to let one or two elements do the work.",
    "Soft Luxury": "Your presentation suggests taste without shouting. The signals are subtle — good materials, clean lines, controlled environment. This is one of the strongest archetypes for first impressions.",
    "Creator Vibe": "Your presentation suggests you understand visual media. Strong composition and style coherence. The key is ensuring the technical quality (lighting, sharpness) matches the creative intent.",
    "College Casual": "Your presentation reads as authentic and relaxed — appropriate for campus life. A bit more attention to grooming and background control can elevate the signal without losing the casual feel.",
    "Corporate Sharp": "Your presentation signals professionalism and readiness. Clean, structured, appropriate. This archetype works well for workplace and networking contexts.",
    "Try-Hard Signal": "Your presentation may be trying to signal premium value, but too many elements compete for attention. The fix is not to add more — it is to subtract. One less item per frame will make the overall impression stronger.",
    "Mismatched Flex": "You have status signals in your presentation, but the fundamentals — lighting, clarity, or background — are not supporting them. Once you fix the basics, the same signals will land much harder.",
    "Low-Clarity Potential": "The intent and potential are visible, but technical quality is holding your presentation back. Improving lighting and sharpness will unlock the underlying signal without changing anything else.",
  };
  return explanations[archetype] || explanations["Clean Basic"];
}

function generateUserPriority(input: DeepAuditInput, archetype: StatusArchetype, metrics: ImageMetrics): string {
  if (input.biggestConcern === "weak_photos" || input.biggestConcern === "background_issue") {
    return "Improve photo quality — lighting and background";
  }
  if (input.biggestConcern === "grooming_issue") return "Upgrade grooming routine";
  if (input.biggestConcern === "outfit_confusion") return "Simplify and coordinate your wardrobe";
  if (archetype === "Mismatched Flex" || archetype === "Low-Clarity Potential") {
    if (metrics.lightingScore < 55) return "Fix lighting first — it affects everything else";
    if (metrics.clarityScore < 55) return "Improve image sharpness — clean lens and stabilize frame";
    if (metrics.backgroundComplexityEstimate > 70) return "Clean up background clutter";
  }
  if (archetype === "Loud Flex" || archetype === "Try-Hard Signal") return "Simplify the frame — remove one or two visible signals";
  if (archetype === "Clean Basic") return "Add one intentional upgrade — better lighting or a structured outfit";
  return "Strengthen consistency across all your photos";
}

function generateRecommendedFocus(input: DeepAuditInput, archetype: StatusArchetype, metrics: ImageMetrics): string[] {
  const focus: string[] = [];

  if (metrics.lightingScore < 55) focus.push("Improve lighting — face natural light");
  if (metrics.backgroundComplexityEstimate > 70) focus.push("Simplify background");
  if (metrics.clarityScore < 55) focus.push("Sharpen image quality");
  if (metrics.compositionScore < 55) focus.push("Improve framing and crop");

  if (archetype === "Loud Flex" || archetype === "Try-Hard Signal") focus.push("Reduce visible signal count per photo");
  if (archetype === "Clean Basic") focus.push("Add one intentional style element");
  if (archetype === "Mismatched Flex") focus.push("Fix visual fundamentals before adding more signals");

  if (input.biggestConcern === "grooming_issue") focus.push("Focus on grooming — haircut, skin, nails");
  if (input.biggestConcern === "outfit_confusion") focus.push("Build a 3-outfit capsule wardrobe");
  if (input.biggestConcern === "weak_photos") focus.push("Take 20 test shots and pick the best 3");

  if (focus.length === 0) focus.push("Maintain consistency across all photos");
  return focus.slice(0, 4);
}

export function generateStatusArchetype(audit: Audit, metrics: ImageMetrics): PersonalizationResult {
  const input = audit.deepInput;
  if (!input) {
    return {
      archetype: "Clean Basic",
      archetypeExplanation: "Complete the personalization questionnaire to get a more detailed archetype analysis.",
      signalMismatches: [],
      goalStrategy: "",
      tonePreference: "soft",
      userPriority: "Complete the personalization questionnaire for a tailored recommendation.",
      recommendedFocus: ["Take the personalization quiz to unlock deeper insights"],
    };
  }

  const archetype = pickArchetype(input, metrics, audit);
  const archetypeExplanation = generateArchetypeExplanation(archetype);
  const tonePreference = input.wantsDirectFeedback ? "direct" : "soft";
  const userPriority = generateUserPriority(input, archetype, metrics);
  const recommendedFocus = generateRecommendedFocus(input, archetype, metrics);

  return {
    archetype,
    archetypeExplanation,
    signalMismatches: [],
    goalStrategy: "",
    tonePreference,
    userPriority,
    recommendedFocus,
  };
}
