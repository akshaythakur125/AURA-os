import type {
  Audit,
  ImageSignalMetrics,
  FullAuraReportContent,
  FullStatusLeak,
  PriorityUpgradeMap,
  TieredBudgetPlan,
  PhotoGuidance,
  GoalSpecificAdvice,
} from "@/types/audit";
import { analyzeImageDataUrl } from "./imageMetrics";
import {
  calculateAuraScore,
  determineCategory,
  generateVerdict,
} from "./scoring";

function clamp(value: number, min = 0, max = 100): number {
  return Math.round(Math.min(max, Math.max(min, value)));
}

function generateFullStatusLeaks(
  metrics: ImageSignalMetrics,
  _goal: string
): FullStatusLeak[] {
  void _goal;
  const leaks: FullStatusLeak[] = [];

  if (metrics.lightingScore < 60) {
    leaks.push({
      title: "Lighting is weakening the frame",
      explanation:
        "The image does not project a premium first impression because lighting is flat or insufficient. Good lighting signals intentionality.",
      fix: "Use window light at a 45-degree angle. Avoid overhead ceiling lights. A simple ring light or phone flashlight diffused with a tissue can help.",
      severity: metrics.lightingScore < 40 ? "high" : "medium",
      impactScore: clamp(Math.round((60 - metrics.lightingScore) * 1.5)),
      estimatedCost: "free",
    });
  }

  if (metrics.sharpness < 55) {
    leaks.push({
      title: "Clarity is below premium threshold",
      explanation:
        "Details in the frame are not crisp enough for a profile-ready look. Blurry or soft images reduce perceived effort.",
      fix: "Always use the rear camera. Wipe the lens with a clean cloth before shooting. Lock focus by tapping the screen. Keep your hands steady or use a surface.",
      severity: metrics.sharpness < 40 ? "high" : "medium",
      impactScore: clamp(Math.round((55 - metrics.sharpness) * 1.5)),
      estimatedCost: "free",
    });
  }

  if (metrics.backgroundComplexityEstimate > 60) {
    leaks.push({
      title: "Background is competing for attention",
      explanation:
        "A busy or cluttered background splits the viewer's focus. Clean backgrounds signal control and intentionality.",
      fix: "Stand at least 3-4 feet away from background objects. Use a plain wall, open doorway, or outdoor setting with minimal visual noise.",
      severity: metrics.backgroundComplexityEstimate > 75 ? "high" : "medium",
      impactScore: clamp(
        Math.round((metrics.backgroundComplexityEstimate - 60) * 1.2)
      ),
      estimatedCost: "free",
    });
  }

  if (metrics.compositionScore < 55) {
    leaks.push({
      title: "Framing needs improvement",
      explanation:
        "The crop or subject placement does not feel profile-optimized. Strong framing makes the image feel intentional.",
      fix: "Use a vertical (portrait) orientation. Keep the subject slightly off-center with headroom above. Avoid cutting off the top of the head.",
      severity: metrics.compositionScore < 40 ? "high" : "medium",
      impactScore: clamp(Math.round((55 - metrics.compositionScore) * 1.3)),
      estimatedCost: "free",
    });
  }

  const satDiff = Math.abs(metrics.saturation - 45);
  if (satDiff > 20) {
    leaks.push({
      title: "Color balance feels off",
      explanation:
        "Either too dull or over-saturated. Natural-looking color signals a more premium and trustworthy presentation.",
      fix: "Shoot in natural daylight. If using filters, reduce intensity by at least 50%. Avoid heavy preset filters for profile photos.",
      severity: satDiff > 35 ? "medium" : "low",
      impactScore: clamp(Math.round(satDiff * 0.8)),
      estimatedCost: "free",
    });
  }

  if (metrics.resolutionScore < 50) {
    leaks.push({
      title: "Image resolution is below standard",
      explanation:
        "Low resolution can make the image look dated or low-effort when viewed on larger screens.",
      fix: "Use the highest resolution setting on your phone camera. Avoid screenshots of photos. Upload original files when possible.",
      severity: "low",
      impactScore: clamp(Math.round((50 - metrics.resolutionScore) * 0.8)),
      estimatedCost: "free",
    });
  }

  if (metrics.contrast < 35) {
    leaks.push({
      title: "Flat contrast reduces visual impact",
      explanation:
        "Low contrast makes the image look washed out and lowers perceived energy.",
      fix: "Add directional lighting (window light from the side). Avoid shooting in foggy or heavily diffused light.",
      severity: "low",
      impactScore: clamp(Math.round((35 - metrics.contrast) * 1.2)),
      estimatedCost: "free",
    });
  }

  if (leaks.length === 0) {
    leaks.push({
      title: "Minor polish opportunity",
      explanation:
        "Your presentation is already strong. Premium signals come from consistent refinement across all touchpoints.",
      fix: "Consider updating your profile photo every 3-6 months and experimenting with different lighting setups.",
      severity: "low",
      impactScore: 10,
      estimatedCost: "free",
    });
  }

  return leaks.slice(0, 6);
}

function generatePriorityMap(
  metrics: ImageSignalMetrics,
  goal: string
): PriorityUpgradeMap {
  const issues: { key: string; score: number }[] = [
    { key: "Improve lighting setup", score: metrics.lightingScore },
    { key: "Improve image clarity", score: metrics.sharpness },
    { key: "Improve composition and framing", score: metrics.compositionScore },
    { key: "Simplify background", score: 100 - metrics.backgroundComplexityEstimate },
    { key: "Balance color tones", score: 100 - Math.abs(metrics.saturation - 45) },
    { key: "Improve contrast", score: metrics.contrast },
  ].sort((a, b) => a.score - b.score);

  if (issues.length >= 3) {
    return {
      firstPriority: issues[0].key,
      secondPriority: issues[1].key,
      avoidForNow:
        goal === "dating"
          ? "Don't invest in expensive accessories before fixing lighting and framing"
          : goal === "instagram"
            ? "Don't chase trendy edits before mastering natural light and clean backgrounds"
            : "Don't buy new outfits before improving how current photos are presented",
    };
  }

  return {
    firstPriority: "Improve lighting",
    secondPriority: "Improve clarity",
    avoidForNow: "Avoid spending on accessories before fixing basic presentation",
  };
}

function generateTieredBudgetPlan(_budget: number): TieredBudgetPlan {
  void _budget;
  return {
    immediateFree: [
      "Retake photo in natural window light",
      "Clean camera lens before shooting",
      "Use a plain wall or simple background",
      "Wear a solid neutral-colored top",
      "Use vertical framing with subject centered",
    ],
    under2000: [
      "Basic grooming — haircut, clean nails, brows",
      "Solid-color shirt or t-shirt in neutral tones",
      "Simple phone tripod for steady shots",
      "Basic grooming kit",
    ],
    under5000: [
      "Overshirt or lightweight jacket",
      "Reliable deodorant or mild perfume",
      "Simple watch or minimal accessory",
      "Full grooming session — hair, face, nails",
    ],
    under10000: [
      "Complete outfit set — top, bottom, shoes",
      "Upgraded watch or accessory",
      "Room background refresh — curtains, clean wall setup",
      "Professional photo session with a friend or local photographer",
    ],
    under25000: [
      "Small wardrobe capsule — 3-5 coordinated outfits",
      "Professional photoshoot for profile photos",
      "Premium grooming — skin, hair, nails, fragrance",
      "Fitness or grooming program (3-month commitment)",
    ],
  };
}

function generatePhotoGuidance(metrics: ImageSignalMetrics): PhotoGuidance {
  return {
    lighting:
      metrics.lightingScore < 60
        ? "Use natural window light at 45 degrees. Avoid mixing warm and cool light sources. A simple ring light at face height can dramatically improve quality."
        : "Your lighting is solid. For even better results, experiment with golden hour outdoor light (sunrise/sunset).",
    framing:
      metrics.compositionScore < 60
        ? "Use vertical (portrait) orientation. Place the subject slightly off-center. Keep at least 20% headroom above. Avoid wide-angle distortion."
        : "Your framing is good. Try the rule of thirds for more dynamic composition in your next shot.",
    background:
      metrics.backgroundComplexityEstimate > 60
        ? "Choose a plain wall, open doorway, or outdoor space with minimal clutter at least 4 feet behind you."
        : "Your background is clean. Textured walls or subtle gradients can add visual interest without distraction.",
    posingOrPresentation:
      "Face the light source at a slight angle for natural contour. Keep shoulders relaxed and chin slightly forward. A genuine smile signals confidence.",
    editing:
      metrics.saturation < 30 || metrics.saturation > 65
        ? "Avoid heavy filters. If you must edit, keep adjustments subtle — reduce filter intensity by 50% for a more natural look."
        : "Your color balance is natural. Minor brightness and contrast tweaks are all you need.",
  };
}

function generateGoalAdvice(goal: string, _metrics: ImageSignalMetrics): GoalSpecificAdvice {
  void _metrics;
  switch (goal) {
    case "dating":
      return {
        goal: "Dating Profile Optimization",
        strategy:
          "Dating profile photos should feel warm, approachable, and intentional. Prioritize clear face visibility, genuine smile, and a background that suggests a social or interesting lifestyle without trying too hard.",
        doThis:
          "Use a well-lit chest-up shot as your primary photo. Add one full-body shot and one hobby/context photo. Keep editing minimal — natural skin tone and lighting perform best.",
        avoidThis:
          "Avoid group photos as primary, heavy filters, mirror selfies, or anything that looks like it was taken in a hurry. Over-edited photos reduce trust signals significantly.",
      };
    case "instagram":
      return {
        goal: "Instagram Profile Cohesion",
        strategy:
          "Instagram is about visual consistency. Your feed should tell a story through repeated colors, lighting styles, and framing choices. Each photo should feel like it belongs to the same profile.",
        doThis:
          "Establish 2-3 color tones and stick to them. Use consistent lighting (all indoor or all natural). Keep backgrounds clean and on-brand. Plan your grid layout before posting.",
        avoidThis:
          "Avoid posting random photo qualities, mixing heavy filters with natural shots, or inconsistent backgrounds. Don't post low-resolution images or screenshots.",
      };
    case "office":
      return {
        goal: "Professional / LinkedIn Presentation",
        strategy:
          "For professional contexts, the signal should be understated, clean, and confident. Less is more — neutral backgrounds, solid colors, and clear framing signal reliability.",
        doThis:
          "Use a simple solid background (white, grey, or muted). Wear solid, well-fitted clothing in neutral colors. Use even, soft lighting. A slight smile conveys approachability.",
        avoidThis:
          "Avoid busy backgrounds, casual outfit details, extreme filters, or any frame that looks like a casual selfie. Maintain eye contact with the camera.",
      };
    case "college":
      return {
        goal: "College / University Social Presence",
        strategy:
          "College profiles should feel authentic but intentional. You don't need to look formal — just put-together and aware. Clean framing and good lighting set you apart.",
        doThis:
          "Use natural light. Keep backgrounds simple (campus wall, library, outdoor). Show genuine context — a hobby, a coffee shop, or a clean dorm corner works well.",
        avoidThis:
          "Avoid overcrowded frames, messy room backgrounds, or heavily filtered photos. Don't try too hard to look like someone you're not.",
      };
    case "glowup":
    default:
      return {
        goal: "Overall Glow-Up / Personal Upgrade",
        strategy:
          "A glow-up is about improving across the board — lighting, grooming, wardrobe, and confidence. Start with the basics (lighting, clarity, background) before spending on accessories.",
        doThis:
          "Fix lighting first — it makes the biggest difference. Then improve grooming and wardrobe basics. Document your progress with weekly photos to track improvement.",
        avoidThis:
          "Avoid skipping the fundamentals (lighting, clarity) to jump straight to accessories or expensive changes. Slow, consistent upgrades create lasting results.",
      };
  }
}

function generateFinalVerdict(
  score: number,
  category: string,
  metrics: ImageSignalMetrics
): string {
  if (score >= 75) {
    const refineTarget = metrics.lightingScore < 70 ? "lighting" : metrics.sharpness < 70 ? "clarity" : "framing";
    return `Your presentation is already sending a strong ${category.toLowerCase()} signal. With targeted refinements in ${refineTarget}, you can elevate your visual presence to a premium tier. The foundation is solid — now it's about polish and consistency.`;
  }
  if (score >= 60) {
    return `You have a good baseline, but there are clear areas where your visual signal can be strengthened. Start with the first priority in your upgrade map — fixing this alone can shift how people perceive your presentation. The upgrades here are achievable within your budget.`;
  }
  return `Your presentation has room to grow, and the good news is that the highest-impact changes are also the most affordable. Improving lighting and clarity alone can significantly change how your first impression reads. Start with the free fixes and build up from there.`;
}

export async function generateFullAuraReport(
  audit: Audit
): Promise<FullAuraReportContent> {
  const metrics = audit.fullReport?.freeResult?.imageMetrics
    ? audit.fullReport.freeResult.imageMetrics
    : audit.imageDataUrl
      ? await analyzeImageDataUrl(audit.imageDataUrl)
      : null;

  if (!metrics) {
    throw new Error("No image data available to generate full report.");
  }

  const score = calculateAuraScore({
    auditType: audit.auditType,
    goal: audit.goal,
    budgetRange: audit.budgetRange,
    metrics,
  });

  const category = determineCategory(score, metrics);
  const oneLineFromFree = audit.fullReport?.freeResult?.oneLineVerdict || generateVerdict(score, category || "Clean but Basic");

  const lightingScore = metrics.lightingScore;
  const clarityScore = metrics.clarityScore;
  const compositionScore = metrics.compositionScore;
  const bgControl = clamp(100 - metrics.backgroundComplexityEstimate);
  const colorSignal = clamp(100 - Math.abs(metrics.saturation - 45));
  const premiumSignal = clamp(
    Math.round(
      (lightingScore * 0.25 +
        clarityScore * 0.25 +
        compositionScore * 0.2 +
        bgControl * 0.15 +
        colorSignal * 0.15)
    )
  );
  const overallConsistency = clamp(
    Math.round(
      (lightingScore + clarityScore + compositionScore + bgControl + colorSignal) / 5
    )
  );

  const strongestSignals: string[] = [];
  if (lightingScore >= 60) strongestSignals.push("Lighting");
  if (clarityScore >= 60) strongestSignals.push("Clarity");
  if (compositionScore >= 60) strongestSignals.push("Composition");
  if (bgControl >= 60) strongestSignals.push("Background control");
  if (colorSignal >= 60) strongestSignals.push("Color balance");
  if (premiumSignal >= 60) strongestSignals.push("Premium signal potential");
  if (strongestSignals.length === 0) {
    strongestSignals.push("Identify quick wins — every signal can improve");
  }

  const statusLeaks = generateFullStatusLeaks(metrics, audit.goal);

  const detailedVerdict = oneLineFromFree;

  const priorityMap = generatePriorityMap(metrics, audit.goal);
  const budgetPlan = generateTieredBudgetPlan(audit.budgetRange);
  const photoGuidance = generatePhotoGuidance(metrics);
  const goalAdvice = generateGoalAdvice(audit.goal, metrics);
  const finalVerdict = generateFinalVerdict(score, category, metrics);

  return {
    fullScore: score,
    category,
    detailedVerdict,
    visualBreakdown: {
      lighting: lightingScore,
      clarity: clarityScore,
      composition: compositionScore,
      backgroundControl: bgControl,
      colorSignal,
      premiumSignal,
      overallConsistency,
    },
    strongestSignals,
    biggestStatusLeaks: statusLeaks,
    priorityUpgradeMap: priorityMap,
    budgetUpgradePlan: budgetPlan,
    photoGuidance,
    goalSpecificAdvice: goalAdvice,
    finalVerdict,
    generatedAt: new Date().toISOString(),
  };
}
