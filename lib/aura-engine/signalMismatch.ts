import type { Audit, ImageMetrics } from "@/types";
import type { DeepAuditInput, SignalMismatch } from "@/types/personalization";

export function detectSignalMismatches(audit: Audit, metrics: ImageMetrics): SignalMismatch[] {
  const mismatches: SignalMismatch[] = [];
  const input: DeepAuditInput | undefined | null = audit.deepInput;

  const signals = input?.currentSignals || [];
  const hasStatusSignals = signals.some((s) =>
    ["phone_visible", "watch_visible", "shoes_visible", "branded_item_visible", "bike_car_visible"].includes(s)
  );
  const busyBg = metrics.backgroundComplexityEstimate > 70;
  const weakLighting = metrics.lightingScore < 55;
  const weakClarity = metrics.clarityScore < 55;
  const weakComposition = metrics.compositionScore < 55;

  if (hasStatusSignals && busyBg) {
    mismatches.push({
      title: "Status item vs background mismatch",
      explanation: "You have visible status signals, but the background is busy or cluttered. The background distracts from the signals you want people to notice.",
      severity: "high",
      correction: "Simplify the background first — a clean wall makes every signal in the frame more effective.",
      priorityScore: 90,
    });
  }

  if (audit.goal === "dating" && busyBg) {
    mismatches.push({
      title: "Dating profile attention split",
      explanation: "Dating profile photos need to keep attention on you. A busy background splits focus and reduces perceived warmth.",
      severity: "high",
      correction: "Use plain backgrounds or soft out-of-focus environments for dating profile photos.",
      priorityScore: 85,
    });
  }

  if (audit.goal === "office" && input?.styleIntent === "bold") {
    mismatches.push({
      title: "Professional signal mismatch",
      explanation: "Your goal is professional, but your style intent is bold. These can conflict in workplace-appropriate presentation.",
      severity: "medium",
      correction: "Consider a more restrained style for professional profile photos. Save bold expressions for social contexts.",
      priorityScore: 70,
    });
  }

  if (audit.goal === "instagram" && weakComposition) {
    mismatches.push({
      title: "Feed-readiness mismatch",
      explanation: "Instagram is a visual-first platform. Weak composition reduces engagement and feed coherence.",
      severity: "medium",
      correction: "Use grid-friendly framing — consistent crop ratios and centered subjects work best.",
      priorityScore: 75,
    });
  }

  if (input?.styleIntent === "creator" && (weakLighting || weakClarity)) {
    mismatches.push({
      title: "Content quality mismatch",
      explanation: "Your intent is creator-level content, but lighting or sharpness is holding back the production value.",
      severity: "high",
      correction: "Improve lighting and stability before focusing on creative elements. Good lighting makes every frame look intentional.",
      priorityScore: 88,
    });
  }

  if ((input?.styleIntent === "premium" || input?.styleIntent === "understated") && (weakClarity || busyBg)) {
    mismatches.push({
      title: "Premium intent mismatch",
      explanation: "Your style intent is premium or refined, but the technical quality does not support it yet.",
      severity: "medium",
      correction: "Premium presentation requires clean backgrounds and sharp images. Fix these before investing in more visible upgrades.",
      priorityScore: 82,
    });
  }

  if (audit.goal === "dating" && input?.styleIntent === "bold" && hasStatusSignals) {
    mismatches.push({
      title: "Dating profile signal overload",
      explanation: "Dating profiles benefit from warmth and approachability. Multiple status signals can feel intimidating rather than attractive.",
      severity: "medium",
      correction: "Reduce visible signals in dating photos — one intentional signal is more effective than three competing ones.",
      priorityScore: 72,
    });
  }

  if (input?.biggestConcern === "looking_tryhard" && hasStatusSignals) {
    mismatches.push({
      title: "Try-hard concern with visible signals",
      explanation: "You said you are worried about looking try-hard, and you are displaying multiple status signals. This combination can create the exact impression you want to avoid.",
      severity: "high",
      correction: "Remove half the visible signals — the goal is to look like you are not trying.",
      priorityScore: 86,
    });
  }

  if (input?.biggestConcern === "background_issue" && !busyBg) {
    mismatches.push({
      title: "Background concern — perception gap",
      explanation: "You flagged background as a concern, but the metrics do not show it as a major issue. Focus on your next priority.",
      severity: "low",
      correction: "Your background is better than you think. Focus on lighting or grooming instead.",
      priorityScore: 40,
    });
  }

  if (input?.biggestConcern === "grooming_issue" && metrics.lightingScore < 55) {
    mismatches.push({
      title: "Grooming visibility gap",
      explanation: "You are concerned about grooming, but poor lighting may be hiding your grooming efforts. Good lighting makes grooming visible.",
      severity: "medium",
      correction: "Improve lighting first — it will make your existing grooming routine more noticeable in photos.",
      priorityScore: 78,
    });
  }

  if (input?.selfRatedConfidence === "low" && weakLighting) {
    mismatches.push({
      title: "Confidence vs lighting mismatch",
      explanation: "Low confidence combined with poor lighting can compound each other in photos. Better lighting naturally improves how you appear without changing anything about you.",
      severity: "medium",
      correction: "Improve lighting — it is the cheapest way to look more confident in photos without changing your expression or posture.",
      priorityScore: 75,
    });
  }

  if (input?.selfRatedConfidence === "low" && input?.wantsDirectFeedback) {
    mismatches.push({
      title: "Confidence vs direct feedback",
      explanation: "You rated your confidence low but asked for direct feedback. This requires a balance — the feedback is honest but never about your worth.",
      severity: "low",
      correction: "Focus on actionable fixes one at a time. Small wins build confidence faster than trying everything at once.",
      priorityScore: 50,
    });
  }

  if (audit.auditType === "background" && hasStatusSignals) {
    mismatches.push({
      title: "Background audit with foreground signals",
      explanation: "You are auditing your background, but your photo includes visible signals that may distract from the background assessment.",
      severity: "low",
      correction: "For the most accurate background audit, take a photo without visible branded items or accessories.",
      priorityScore: 35,
    });
  }

  return mismatches.sort((a, b) => b.priorityScore - a.priorityScore);
}
