import type { Audit, ImageSignalMetrics } from "@/types/audit";
import type { SignalMismatch } from "@/types/personalization";

export function detectSignalMismatches(
  audit: Audit,
  metrics?: ImageSignalMetrics
): SignalMismatch[] {
  const mismatches: SignalMismatch[] = [];
  const d = audit.deepInput;
  const signals = d?.currentSignals || [];
  const goal = audit.goal;
  const style = d?.styleIntent;
  const hasStatusSignals =
    signals.includes("phone_visible") ||
    signals.includes("watch_visible") ||
    signals.includes("bike_car_visible") ||
    signals.includes("branded_item_visible");
  const hasRoomSignal = signals.includes("room_signal");

  // Status items vs background complexity
  if (hasStatusSignals && metrics && metrics.backgroundComplexityEstimate > 60) {
    mismatches.push({
      title: "Status item vs background mismatch",
      explanation:
        "Premium items in your frame lose impact when surrounded by visual clutter. The background distracts from the items you want to highlight.",
      severity: metrics.backgroundComplexityEstimate > 75 ? "high" : "medium",
      correction:
        "Simplify the background before including status items. A clean wall or uncluttered space makes each item stand out more.",
      priorityScore: Math.round(metrics.backgroundComplexityEstimate * 0.8),
    });
  }

  // Dating goal vs heavy presentation
  if (
    goal === "dating" &&
    metrics &&
    metrics.backgroundComplexityEstimate > 60 &&
    metrics.saturation > 55
  ) {
    mismatches.push({
      title: "Attention split in dating profile",
      explanation:
        "Dating profile photos perform best when the focus is clearly on you. Busy backgrounds and high saturation can split viewer attention and reduce warmth.",
      severity: "medium",
      correction:
        "Use simpler backgrounds and reduce filter intensity. Let your face and expression be the main focus.",
      priorityScore: 65,
    });
  }

  // Office goal vs loud style
  if (
    (goal === "office" || d?.occasionContext === "office_profile") &&
    (style === "bold" || (signals.length >= 3 && !signals.includes("none")))
  ) {
    mismatches.push({
      title: "Professional signal mismatch",
      explanation:
        "For professional contexts, understated presentation signals reliability. Bold or busy styling can contradict the professional signal you want to send.",
      severity: "high",
      correction:
        "Tone down visible accessories and bold style choices for profile photos. Neutral colors and clean framing perform better in professional settings.",
      priorityScore: 80,
    });
  }

  // Instagram goal vs low composition
  if (
    goal === "instagram" &&
    metrics &&
    metrics.compositionScore < 50
  ) {
    mismatches.push({
      title: "Feed-readiness mismatch",
      explanation:
        "Instagram rewards consistent visual quality. Current framing and composition may not meet the standard needed for a cohesive feed.",
      severity: metrics.compositionScore < 40 ? "high" : "medium",
      correction:
        "Improve framing by centering the subject, using vertical orientation, and maintaining consistent headroom across photos.",
      priorityScore: Math.round((60 - metrics.compositionScore) * 1.2),
    });
  }

  // Creator intent vs poor quality
  if (
    style === "creator" &&
    metrics &&
    (metrics.lightingScore < 50 || metrics.sharpness < 45)
  ) {
    mismatches.push({
      title: "Content quality mismatch",
      explanation:
        "Creator-style presentation requires strong technical foundations. Current lighting or sharpness levels may not support the content quality you want to project.",
      severity: metrics.lightingScore < 40 ? "high" : "medium",
      correction:
        "Invest in a simple lighting setup (window light or basic ring light) and ensure sharp focus before creating content.",
      priorityScore: Math.round((100 - Math.min(metrics.lightingScore, metrics.sharpness)) * 0.9),
    });
  }

  // Premium intent vs low quality
  if (
    (style === "premium" || style === "attractive") &&
    metrics &&
    (metrics.lightingScore < 50 || metrics.backgroundComplexityEstimate > 65)
  ) {
    mismatches.push({
      title: "Premium intent mismatch",
      explanation:
        "A premium presentation goal requires premium technical basics. Current lighting or background quality does not yet support a premium signal.",
      severity: metrics.lightingScore < 40 ? "high" : "medium",
      correction:
        "Prioritize lighting and background control before adding premium accessories or styling. The foundation determines how premium the final image looks.",
      priorityScore: Math.round((100 - metrics.lightingScore) * 0.7 + metrics.backgroundComplexityEstimate * 0.3),
    });
  }

  // Room signal vs room audit
  if (
    (hasRoomSignal || audit.auditType === "room") &&
    metrics &&
    metrics.backgroundComplexityEstimate > 60
  ) {
    mismatches.push({
      title: "Room presentation leak",
      explanation:
        "If the room or background is part of your presentation, its current complexity level may distract from you. A clean, intentional background signals control.",
      severity: metrics.backgroundComplexityEstimate > 75 ? "high" : "medium",
      correction:
        "Declutter visible surfaces and use softer, indirect lighting to make the room feel intentional.",
      priorityScore: Math.round(metrics.backgroundComplexityEstimate * 0.7),
    });
  }

  // Low confidence vs wanting brutal feedback
  if (
    d?.selfRatedConfidence === "low" &&
    d?.wantsBrutalFeedback
  ) {
    mismatches.push({
      title: "Feedback style consideration",
      explanation:
        "You requested direct feedback but rated your confidence as low. Direct feedback is most useful when paired with clear, actionable steps — which this report provides.",
      severity: "low",
      correction:
        "Focus on the specific fixes rather than the severity labels. Every suggestion here is designed to be achievable within your budget.",
      priorityScore: 30,
    });
  }

  // No-spend comfort guide
  if (audit.budgetRange === 0 && metrics) {
    const lowScoreItems: string[] = [];
    if (metrics.lightingScore < 55) lowScoreItems.push("lighting");
    if (metrics.sharpness < 55) lowScoreItems.push("clarity");
    if (metrics.backgroundComplexityEstimate > 65) lowScoreItems.push("background");

    if (lowScoreItems.length > 0) {
      mismatches.push({
        title: "Zero-budget opportunity",
        explanation:
          `Your selected budget is zero, but your biggest improvement areas (${lowScoreItems.join(", ")}) can all be improved for free. No purchase needed.`,
        severity: "low",
        correction:
          `Focus on ${lowScoreItems.join(" and ")} improvements — these are all achievable with free adjustments to your current setup.`,
        priorityScore: 40 + lowScoreItems.length * 10,
      });
    }
  }

  return mismatches.slice(0, 5);
}
