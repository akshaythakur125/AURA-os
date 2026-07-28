import type {
  Audit,
  ImageSignalMetrics,
  FullAuraReportContent,
  FullStatusLeak,
  PriorityUpgradeMap,
  TieredBudgetPlan,
  PhotoGuidance,
  GoalSpecificAdvice,
  Observation,
} from "@/types/audit";
import { analyzeImageDataUrl } from "./imageMetrics";
import {
  calculateAuraScore,
  determineCategory,
  generateVerdict,
} from "./scoring";
import { calculateImprovementScore, getBeforeAfter } from "./productLinks";
import { composeVerdict } from "./verdictComposer";
import { runIntelligenceAnalysis } from "./intelligence";
import type { IntelligenceResult } from "./intelligence";

function clamp(value: number, min = 0, max = 100): number {
  return Math.round(Math.min(max, Math.max(min, value)));
}

// ─── Personalized photo-quality issue generation ───
// Each leak is now specific to what the analysis actually found

function generateFullStatusLeaks(
  metrics: ImageSignalMetrics,
  goal: string
): FullStatusLeak[] {
  const leaks: FullStatusLeak[] = [];

  // ─── 1. Lighting analysis (face-aware) ───
  if (metrics.lightingScore < 65) {
    const faceDark = metrics.faceDetected && metrics.faceBrightness < 45;
    const flatLight = metrics.lightingDirection === "flat";
    const overheadLight = metrics.lightingDirection === "top";

    if (faceDark) {
      leaks.push({
        title: "Your face is underexposed",
        explanation: `The subject area is ${metrics.faceBrightness < 30 ? "significantly" : "noticeably"} darker than the background (face: ${metrics.faceBrightness}%, background: ${metrics.backgroundBrightness}%). This makes your features hard to read and weakens your first impression.`,
        fix: "Face a window or light source directly. The light should hit your face, not your back. If indoors, turn on a desk lamp at face height, 3 feet away, angled 45 degrees to the side.",
        severity: "high",
        impactScore: clamp(Math.round((45 - metrics.faceBrightness) * 1.2)),
        estimatedCost: "free",
      });
    } else if (flatLight) {
      leaks.push({
        title: "Lighting is flat — no dimension on your face",
        explanation: "Your photo was taken in even, diffused light with no directional shadows. This makes your features look two-dimensional and reduces the perceived quality of the image.",
        fix: "Move to a window and face it at a 45-degree angle. One side of your face should be brighter than the other — this creates natural contour and depth. Golden hour (1hr after sunrise / before sunset) gives the best flat-to-directional ratio.",
        severity: metrics.lightingScore < 45 ? "high" : "medium",
        impactScore: clamp(Math.round((65 - metrics.lightingScore) * 1.0)),
        estimatedCost: "free",
      });
    } else if (overheadLight) {
      leaks.push({
        title: "Overhead lighting is casting shadows under your eyes",
        explanation: "Top-down lighting creates unflattering shadows under the brow ridge, nose, and chin. This is the most common lighting mistake in indoor photos.",
        fix: "Move to face a window at eye level, or hold a light source (phone flashlight, desk lamp) at your eye level, 2-3 feet away. Avoid ceiling lights as your primary source.",
        severity: "medium",
        impactScore: clamp(Math.round((65 - metrics.lightingScore) * 0.9)),
        estimatedCost: "free",
      });
    } else {
      leaks.push({
        title: "Lighting could be more intentional",
        explanation: `Your lighting score is ${metrics.lightingScore}/100. ${metrics.brightness < 40 ? "The image is too dark overall." : metrics.brightness > 70 ? "The image is slightly overexposed, washing out details." : "There's room for improvement in how light falls on the subject."}`,
        fix: "Use natural window light as your primary source. Position yourself so light hits your face from the side at roughly 45 degrees. Avoid mixing warm (incandescent) and cool (daylight) sources.",
        severity: "medium",
        impactScore: clamp(Math.round((65 - metrics.lightingScore) * 0.8)),
        estimatedCost: "free",
      });
    }
  }

  // ─── 2. Clarity / sharpness ───
  if (metrics.sharpness < 55) {
    const veryBlurry = metrics.sharpness < 35;
    leaks.push({
      title: veryBlurry ? "Image is significantly blurry" : "Image lacks crispness",
      explanation: veryBlurry
        ? `Your sharpness score is ${metrics.sharpness}/100 — the image has noticeable blur that makes details unreadable. This could be from camera shake, missed focus, or low resolution.`
        : `Your sharpness score is ${metrics.sharpness}/100. The image is soft, which reduces the perceived quality and makes the photo feel less intentional.`,
      fix: "Use the rear camera (better lens quality). Wipe the lens with a clean cloth before shooting. Tap the screen to lock focus on your face. Use a tripod or lean against a wall for stability.",
      severity: veryBlurry ? "high" : "medium",
      impactScore: clamp(Math.round((55 - metrics.sharpness) * 1.3)),
      estimatedCost: "free",
    });
  }

  // ─── 3. Background analysis ───
  if (metrics.backgroundComplexityEstimate > 55) {
    const veryBusy = metrics.backgroundComplexityEstimate > 70;
    const bgBright = metrics.backgroundBrightness > metrics.faceBrightness + 15;

    if (bgBright) {
      leaks.push({
        title: "Background is brighter than your face",
        explanation: `The background (${metrics.backgroundBrightness}%) is pulling attention away from you (${metrics.faceBrightness}% face brightness). The viewer's eye goes to the brightest part of an image first — right now, that's not you.`,
        fix: "Move to a location where the background is darker than your face. A plain wall, a shaded area, or standing with your back to a bright window (backlight) all work. Alternatively, use portrait mode to blur the background.",
        severity: "high",
        impactScore: clamp(Math.round((metrics.backgroundBrightness - metrics.faceBrightness) * 0.8)),
        estimatedCost: "free",
      });
    } else {
      leaks.push({
        title: veryBusy ? "Background is very cluttered" : "Background is competing for attention",
        explanation: veryBusy
          ? `Background complexity: ${metrics.backgroundComplexityEstimate}/100. There are many competing elements behind you — patterns, objects, or visual noise that split the viewer's focus.`
          : `Background complexity: ${metrics.backgroundComplexityEstimate}/100. There are some distracting elements in the background that reduce the focus on you.`,
        fix: "Stand 3-4 feet away from any background objects. Use a plain wall, open doorway, or outdoor space with minimal visual noise behind you. Portrait mode can help blur busy backgrounds.",
        severity: veryBusy ? "high" : "medium",
        impactScore: clamp(Math.round((metrics.backgroundComplexityEstimate - 55) * 1.0)),
        estimatedCost: "free",
      });
    }
  }

  // ─── 4. Composition & framing ───
  if (metrics.compositionScore < 60) {
    const offCenter = Math.abs(metrics.subjectCenterX - 0.5) > 0.2;
    const badAspect = metrics.aspectRatio < 0.7 || metrics.aspectRatio > 1.6;

    if (offCenter) {
      leaks.push({
        title: `Subject is ${metrics.subjectCenterX < 0.4 ? "shifted left" : "shifted right"} in the frame`,
        explanation: `Your subject center is at ${Math.round(metrics.subjectCenterX * 100)}% width. ${badAspect ? "Combined with the " + (metrics.aspectRatio < 0.7 ? "portrait" : "landscape") + " orientation, this creates an unbalanced composition." : "This off-center placement can work for creative shots, but for profile photos, a centered subject reads more intentionally."}`,
        fix: badAspect
          ? "Switch to portrait (vertical) orientation for profile photos. Center yourself in the frame with equal space on both sides."
          : "Center yourself in the frame, or use the rule of thirds — place your eyes at the top-third line. Keep equal space on both sides of your body.",
        severity: "medium",
        impactScore: clamp(Math.round((60 - metrics.compositionScore) * 0.9)),
        estimatedCost: "free",
      });
    } else if (badAspect) {
      leaks.push({
        title: `Orientation doesn't match your goal${goal === "instagram" ? " (Instagram prefers squares or portraits)" : ""}`,
        explanation: `Aspect ratio is ${metrics.aspectRatio}:1. ${metrics.aspectRatio < 0.7 ? "This is a very tall portrait — good for Stories but may crop awkwardly on profile grids." : "Landscape orientation works for group shots or scenes, but portrait photos perform better for individual profiles."}`,
        fix: goal === "instagram"
          ? "Use 1:1 (square) for grid posts and 4:5 for feed posts. For Stories, 9:16 vertical works best."
          : "Use portrait (4:5 or 3:4) orientation for profile photos. This fills more of the frame with your face and looks intentional.",
        severity: "low",
        impactScore: clamp(Math.round((60 - metrics.compositionScore) * 0.6)),
        estimatedCost: "free",
      });
    } else {
      leaks.push({
        title: "Framing needs refinement",
        explanation: `Composition score: ${metrics.compositionScore}/100. The crop, subject placement, or framing doesn't feel profile-optimized. ${metrics.symmetryScore < 50 ? "The image also lacks symmetry — this can make it feel less polished." : ""}`,
        fix: "Use the rule of thirds: place your eyes at the top-third line. Leave headroom above. Frame from mid-chest up for profile photos. Avoid cutting off the top of your head.",
        severity: "medium",
        impactScore: clamp(Math.round((60 - metrics.compositionScore) * 0.8)),
        estimatedCost: "free",
      });
    }
  }

  // ─── 5. Color / saturation ───
  const satDiff = Math.abs(metrics.saturation - 45);
  if (satDiff > 18) {
    const tooDull = metrics.saturation < 30;
    const tooSaturated = metrics.saturation > 65;

    leaks.push({
      title: tooDull
        ? "Colors look washed out and flat"
        : tooSaturated
          ? "Colors are oversaturated — looks heavily filtered"
          : "Color balance could be more natural",
      explanation: tooDull
        ? `Saturation is ${metrics.saturation}/100 — the image looks desaturated and lifeless. This can happen with bad white balance, low-quality cameras, or heavy desaturation filters.`
        : tooSaturated
          ? `Saturation is ${metrics.saturation}/100 — the colors are pushed too far. Over-saturated photos can look artificial and reduce trust signals.`
          : `Saturation is ${metrics.saturation}/100. ${metrics.saturation < 45 ? "Slightly desaturated — adding a bit of warmth could help." : "Slightly warm — cooling the tones slightly could improve naturalness."}`,
      fix: tooDull
        ? "Shoot in natural daylight. If editing, boost saturation by 10-15% and add slight warmth (orange/yellow tint). Avoid heavy desaturation filters."
        : "Reduce filter intensity by at least 50%. If using a preset, dial back the saturation slider. Natural-looking color performs better than stylized color for profile photos.",
      severity: satDiff > 30 ? "medium" : "low",
      impactScore: clamp(Math.round(satDiff * 0.7)),
      estimatedCost: "free",
    });
  }

  // ─── 6. Color harmony ───
  if (metrics.colorHarmony < 45) {
    leaks.push({
      title: "Color palette feels inconsistent",
      explanation: `Color harmony score: ${metrics.colorHarmony}/100. ${metrics.dominantHue === "greenish" ? "There's a greenish cast — this can happen with fluorescent lighting or certain backgrounds." : metrics.dominantHue === "cool" ? "The image has a cool (blue) cast — this can feel cold and uninviting for profile photos." : "The dominant colors don't work together harmoniously."}`,
      fix: metrics.dominantHue === "greenish"
        ? "Avoid fluorescent lighting. Shoot in natural daylight or use warm-toned artificial light. In post, add a slight orange/warm filter to counteract the green."
        : "Stick to 2-3 color tones in your outfit and background. Neutral colors (white, grey, navy, black) work universally. Match warm skin tones with warm clothing colors.",
      severity: "low",
      impactScore: clamp(Math.round((45 - metrics.colorHarmony) * 0.6)),
      estimatedCost: "free",
    });
  }

  // ─── 7. Image dullness ───
  if (metrics.imageDullness > 50) {
    leaks.push({
      title: "Image lacks visual energy",
      explanation: `The image reads as visually flat — ${metrics.imageDullness > 65 ? "very" : "moderately"} low saturation and contrast combine to make it feel lifeless. Profile photos need visual pop to stand out in a feed.`,
      fix: "Add one element of visual interest: a colored accessory, a textured background, or slightly enhanced contrast. Even a small boost in post-processing can make a significant difference.",
      severity: "low",
      impactScore: clamp(Math.round((metrics.imageDullness - 50) * 0.5)),
      estimatedCost: "free",
    });
  }

  // ─── 8. Resolution ───
  if (metrics.resolutionScore < 50) {
    leaks.push({
      title: "Image resolution is below standard",
      explanation: `Resolution: ${metrics.width}×${metrics.height}px. This looks ${metrics.resolutionScore < 30 ? "very" : ""} compressed or low-quality. On larger screens or when zoomed, the image will appear pixelated.`,
      fix: "Upload the original photo file (not a screenshot). Use the highest resolution setting on your phone camera. Avoid sending photos through WhatsApp/social media — they compress heavily.",
      severity: "low",
      impactScore: clamp(Math.round((50 - metrics.resolutionScore) * 0.6)),
      estimatedCost: "free",
    });
  }

  // ─── 9. Contrast ───
  if (metrics.contrast < 30) {
    leaks.push({
      title: "Image has very flat contrast",
      explanation: `Contrast is ${metrics.contrast}/100 — the difference between the lightest and darkest areas is too small. This makes the image look washed out and reduces depth perception.`,
      fix: "Add directional lighting (window light from the side). In post-processing, increase contrast by 15-20%. Avoid shooting in foggy, overcast, or heavily diffused light.",
      severity: "low",
      impactScore: clamp(Math.round((30 - metrics.contrast) * 0.8)),
      estimatedCost: "free",
    });
  }

  // ─── 10. Subject-background contrast ───
  if (metrics.faceDetected && metrics.subjectBgContrast < 10) {
    leaks.push({
      title: "Subject blends into the background",
      explanation: `The contrast between your face and the background is only ${metrics.subjectBgContrast}/100. When the subject and background have similar brightness, the viewer's eye has no clear focal point.`,
      fix: "Wear a top that contrasts with your background (dark top on light wall, or vice versa). Move to a location where the background is a different tone than your clothing/skin.",
      severity: "medium",
      impactScore: clamp(Math.round((10 - metrics.subjectBgContrast) * 2)),
      estimatedCost: "free",
    });
  }

  // ─── Fallback: if no leaks found ───
  if (leaks.length === 0) {
    leaks.push({
      title: "Minor polish opportunity",
      explanation: "Your presentation is already strong across all metrics. The remaining improvements are subtle refinements that push from good to premium.",
      fix: "Consider updating your profile photo every 3-6 months. Experiment with golden hour outdoor light. Test different backgrounds to see what resonates with your audience.",
      severity: "low",
      impactScore: 10,
      estimatedCost: "free",
    });
  }

  return leaks.slice(0, 8);
}

function generatePriorityMap(
  metrics: ImageSignalMetrics,
  goal: string
): PriorityUpgradeMap {
  // Each dimension carries its measured score, a weak-state line that names the
  // number and the concrete first move, and a strong-state line for the "don't
  // spend here" slot. Sorted weakest-first so effort follows measured impact.
  const bgControl = 100 - metrics.backgroundComplexityEstimate;
  const colorBalance = 100 - Math.abs(metrics.saturation - 45);
  const dims: { label: string; score: number; weak: string; strong: string }[] = [
    {
      label: "lighting", score: metrics.lightingScore,
      weak: `Lighting (${metrics.lightingScore}/100) — ${metrics.faceDetected && metrics.faceBrightness < 45 ? "your face is darker than the background; face a window so the light lands on you" : metrics.lightingDirection === "top" ? "it's coming from above and shadowing your eyes; drop it to eye level" : "flat and even; turn to a window at 45° for depth"}`,
      strong: `lighting (${metrics.lightingScore}/100)`,
    },
    {
      label: "clarity", score: metrics.sharpness,
      weak: `Image clarity (${metrics.sharpness}/100) — wipe the lens, tap-to-focus on your face, and shoot on the rear camera to kill the softness`,
      strong: `clarity (${metrics.sharpness}/100)`,
    },
    {
      label: "framing", score: metrics.compositionScore,
      weak: `Framing (${metrics.compositionScore}/100) — centre yourself chest-up with your eyes on the top-third line`,
      strong: `framing (${metrics.compositionScore}/100)`,
    },
    {
      label: "background", score: bgControl,
      weak: `Background (${bgControl}/100 control) — it's competing for attention; step 3–4 ft in front of a plain wall`,
      strong: `background control (${bgControl}/100)`,
    },
    {
      label: "colour", score: colorBalance,
      weak: `Colour balance (saturation ${metrics.saturation}/100) — ${metrics.saturation < 30 ? "too washed out; add warmth and a touch of saturation" : metrics.saturation > 65 ? "over-filtered; dial the saturation back by half" : "slightly off-neutral; a small warmth tweak fixes it"}`,
      strong: `colour balance (${colorBalance}/100)`,
    },
    {
      label: "contrast", score: metrics.contrast,
      weak: `Contrast (${metrics.contrast}/100) — the image reads flat; add side light or +15% contrast in edit`,
      strong: `contrast (${metrics.contrast}/100)`,
    },
    {
      label: "separation", score: metrics.subjectBgContrast,
      weak: `Subject separation (${metrics.subjectBgContrast}/100) — you blend into the background; wear a tone that contrasts it`,
      strong: `subject separation (${metrics.subjectBgContrast}/100)`,
    },
  ].sort((a, b) => a.score - b.score);

  const first = dims[0];
  const second = dims[1];
  // Colour balance is derived from distance-to-ideal-saturation and reads ~99
  // for most normal photos — and it isn't something you *buy* — so it's a poor
  // "stop spending here" target. Pick the strongest tangible dimension instead.
  const strongest = dims.filter((d) => d.label !== "colour").sort((a, b) => b.score - a.score)[0];

  // "Don't waste money on" — if something is genuinely strong, steer spend away
  // from it toward the real gap; otherwise fall back to the goal-specific trap.
  const avoidForNow = strongest && strongest.score >= 68
    ? `Your ${strongest.strong} is already strong — don't spend money trying to improve it. Put that effort into ${first.label} instead.`
    : goal === "dating"
      ? "Don't buy accessories or new outfits before fixing lighting and framing — they won't move a dating photo that's lit wrong."
      : goal === "instagram"
        ? "Don't chase trendy presets before you've nailed natural light and a clean background — filters can't rescue those."
        : goal === "office"
          ? "Don't invest in a blazer or props before the lighting and framing read clean — a sharp basic shot beats a styled blurry one."
          : "Don't spend on new clothes or gear before improving how the current photo is shot — presentation first, purchases second.";

  return {
    firstPriority: first.weak,
    secondPriority: second.weak,
    avoidForNow,
  };
}

/**
 * Budget plan built from THIS photo's weakest signals — every rupee is pointed
 * at a measured gap, ordered so money follows impact. No generic lists.
 */
function generateTieredBudgetPlan(metrics: ImageSignalMetrics, goal: string): TieredBudgetPlan {
  const lightingWeak = metrics.lightingScore < 60;
  const faceDark = metrics.faceDetected && metrics.faceBrightness < 45;
  const blurry = metrics.sharpness < 55;
  const busyBg = metrics.backgroundComplexityEstimate > 55;
  const groomingWeak = metrics.hairRegion.neatnessScore < 55 || metrics.skinRegion.evenness < 50;
  const outfitWeak = metrics.clothingRegion.styleSignal === "varied" || metrics.clothingRegion.contrastWithSkin < 15;
  const dull = metrics.imageDullness > 50 || metrics.contrast < 30;

  const immediateFree: string[] = [];
  if (faceDark) immediateFree.push(`Reshoot facing a window — your face reads ${metrics.faceBrightness}% brightness vs ${metrics.backgroundBrightness}% background; flipping that is your single biggest free gain`);
  else if (lightingWeak) immediateFree.push(`Reshoot with side window light at 45° — lighting scored ${metrics.lightingScore}/100 and is your top measured gap`);
  if (blurry) immediateFree.push(`Wipe the lens + tap-to-focus on your face — sharpness scored ${metrics.sharpness}/100; lean on a wall or prop the phone to kill shake`);
  if (busyBg) immediateFree.push(`Move 3–4 ft in front of a plain wall — background complexity is ${metrics.backgroundComplexityEstimate}/100 and it's stealing attention from you`);
  if (outfitWeak) immediateFree.push(metrics.clothingRegion.contrastWithSkin < 15 ? "Swap to a top that contrasts your skin tone — right now you and your shirt blend into one shape" : "Swap the patterned top for one solid colour — your outfit is splitting the viewer's focus");
  if (groomingWeak) immediateFree.push("15-minute grooming pass before the reshoot: comb/settle hair, moisturise, tidy brows — costs nothing, shows immediately");
  if (dull) immediateFree.push(`In your phone editor: +15% contrast, +10% warmth — the image reads flat (dullness ${metrics.imageDullness}/100)`);
  if (immediateFree.length < 3) immediateFree.push("Retake at golden hour (hour after sunrise / before sunset) — warm directional light upgrades every metric at once");

  const under2000: string[] = [];
  if (lightingWeak || faceDark) under2000.push("Clip-on ring light or ₹600–900 desk LED at eye level — directly fixes your measured lighting gap, reusable for every future photo");
  if (blurry) under2000.push("Phone tripod (₹300–600) — eliminates the hand-shake behind your soft focus and lets you use the sharper rear camera");
  if (groomingWeak) under2000.push("Fresh haircut (₹200–500) + basic brow/skin tidy-up — your grooming signals scored below average and this is the cheapest visible fix");
  under2000.push(goal === "office" ? "One well-fitted solid shirt in white or light blue (₹700–1,200) — the professional baseline that photographs cleanly" : "One well-fitted solid tee/top in navy, white, or black (₹400–800) — solid colours photograph cleaner than anything patterned");

  const under5000: string[] = [];
  under5000.push(...under2000.slice(0, 2));
  if (groomingWeak) under5000.push("Full grooming session (₹800–1,500): cut, brows, basic facial — resets every below-par grooming signal in one go");
  under5000.push(outfitWeak ? "Two-piece photo outfit: solid top + one layering piece like an overshirt (₹1,500–2,500) — layers add depth without pattern noise" : "A layering piece — overshirt or light jacket (₹1,200–2,000) — instantly makes a basic outfit look styled");
  if (busyBg) under5000.push("Plain backdrop solution: 5ft neutral curtain or paper roll (₹500–900) — a controlled background you can reuse for every shot");

  const under10000: string[] = [];
  under10000.push("Everything in the ₹5,000 tier — it covers your measured gaps first");
  under10000.push(goal === "dating" || goal === "instagram" ? "Complete photo outfit — top, bottom, clean shoes (₹3,000–5,000), coordinated in 2–3 solid tones" : "Complete outfit set in coordinated neutrals (₹3,000–5,000) — top, bottom, shoes that all photograph well");
  under10000.push("One quality accessory — minimal watch or clean frames (₹1,500–3,000). One statement piece, not five");
  under10000.push("A 1-hour shoot with a friend who can operate your phone + your new light — 100 frames beats 5 selfies every time");

  const under25000: string[] = [];
  under25000.push("Professional photoshoot (₹5,000–10,000) — after fixing lighting/grooming/outfit above, a pro session multiplies everything");
  under25000.push("Capsule wardrobe: 3–5 coordinated outfits (₹8,000–12,000) so every future photo has a working look");
  under25000.push(groomingWeak ? "3-month grooming programme — skin routine + monthly cuts (₹3,000–6,000): compounds every future photo" : "Premium grooming kit + routine (₹2,000–4,000) to keep your strongest signals strong");
  under25000.push(goal === "instagram" || goal === "content" ? "Content kit: phone gimbal + LED panel (₹6,000–10,000) for consistent feed quality" : "Keep ₹5,000 in reserve — retest your score after the fixes; spend the rest only on what's still weakest");

  return {
    immediateFree: immediateFree.slice(0, 5),
    under2000: under2000.slice(0, 4),
    under5000: under5000.slice(0, 4),
    under10000: under10000.slice(0, 4),
    under25000: under25000.slice(0, 4),
  };
}

/**
 * 7-day action plan — turns the leaks into a concrete schedule. Day order
 * follows measured impact: prep → groom → outfit → reshoot → edit → verify →
 * deploy. Every task cites the user's own numbers so it reads as *their* plan.
 */
function generateActionPlan(
  metrics: ImageSignalMetrics,
  leaks: FullStatusLeak[],
  goal: string,
  potentialScore: number,
): { day: number; focus: string; tasks: string[] }[] {
  const topLeaks = [...leaks].sort((a, b) => b.impactScore - a.impactScore);
  const lightingWeak = metrics.lightingScore < 65;
  const groomingWeak = metrics.hairRegion.neatnessScore < 55 || metrics.skinRegion.evenness < 50;
  const outfitWeak = metrics.clothingRegion.styleSignal === "varied" || metrics.clothingRegion.contrastWithSkin < 15;

  const day1: string[] = [];
  if (lightingWeak) {
    day1.push(metrics.lightingDirection === "top" ? "Find your light: stand facing a window at eye level — your current shot is lit from above, which shadows your eyes" : `Find your light: face a window at 45° and check one side of your face is brighter than the other (your lighting scored ${metrics.lightingScore}/100)`);
    day1.push("Test 3 spots in your home at different times; pick the one where your face looks brightest on the front camera");
  } else {
    day1.push("Your lighting already works — lock in the spot and time of day you used, you'll reshoot there");
  }
  day1.push(metrics.backgroundComplexityEstimate > 55 ? `Clear your background: pick a plain wall and stand 3–4 ft in front of it (yours measured ${metrics.backgroundComplexityEstimate}/100 complexity)` : "Confirm your background: plain, darker than your face, nothing competing");

  const day2: string[] = groomingWeak
    ? [
        "Grooming pass: haircut or tidy-up, brows, moisturise tonight and tomorrow morning",
        metrics.hairRegion.neatnessScore < 55 ? "Hair is pulling focus in the current shot — comb through with a small amount of product before any photo" : "Skin evenness is the gap — hydrate and use the window light to even it out",
      ]
    : ["Grooming maintenance: quick tidy-up so the reshoot captures you at 100%", "Lip balm + moisturiser the night before — small, visible difference on camera"];

  const day3: string[] = outfitWeak
    ? [
        metrics.clothingRegion.contrastWithSkin < 15 ? "Pick a top that contrasts your skin tone — lay 3 options against your arm and photograph them; keep the one that separates most" : "Pick ONE solid-colour top (navy/white/black) — your current outfit's mixed signals are splitting attention",
        "Iron it. Wrinkles read as carelessness at thumbnail size",
      ]
    : ["Your outfit signal is solid — prep the same style top, ironed and ready", "Optional: add one layer (overshirt/jacket) for depth"];

  const reshootChecklist = topLeaks.slice(0, 3).map((l) => `${l.title} → ${l.fix.split(".")[0]}.`);
  const day4: string[] = [
    "Reshoot day. Rear camera, lens wiped, tap-to-focus on your face",
    ...reshootChecklist,
    "Take 30+ frames: straight-on, slight angle, chin slightly forward. Pick later, not in the moment",
  ];

  const day5: string[] = [
    metrics.imageDullness > 50 ? `Edit pass: +15% contrast, +10% warmth, slight saturation lift — your original read flat (${metrics.imageDullness}/100 dullness)` : "Edit pass: minor contrast and warmth only — your colour balance is already natural, don't over-process",
    "Hard rule: if an edit is noticeable, it's too much. Natural beats filtered for trust",
  ];

  const day6: string[] = [
    `Run the best frame through AuraCheck again — your measured ceiling is ~${potentialScore}/100 if the top leaks are fixed`,
    "Compare the breakdown: every dimension that was red should have moved. If one didn't, that's your next reshoot note",
  ];

  const deploy: Record<string, string[]> = {
    dating: ["Set the new shot as your primary profile photo", "Order the rest: one full-body, one hobby/context, one social — no group shot first"],
    instagram: ["Post the new shot; pin it if score jumped", "Apply the same light + background recipe to your next 3 posts — consistency is the algorithm's love language"],
    office: ["Update LinkedIn/work avatars everywhere at once — inconsistent avatars read as neglect", "Keep the frame chest-up, slight smile, plain background"],
    college: ["Update your main profiles with the new shot", "Save your light/background recipe in notes — repeat it monthly"],
    glowup: ["Update every profile that still shows the old photo", "Book a 30-day recheck: same light, same spot — track the score trend, not one-offs"],
  };
  const day7 = deploy[goal] || deploy.glowup;

  return [
    { day: 1, focus: "Light & location", tasks: day1 },
    { day: 2, focus: "Grooming", tasks: day2 },
    { day: 3, focus: "Outfit", tasks: day3 },
    { day: 4, focus: "The reshoot", tasks: day4 },
    { day: 5, focus: "The edit", tasks: day5 },
    { day: 6, focus: "Verify the jump", tasks: day6 },
    { day: 7, focus: "Deploy it", tasks: day7 },
  ];
}

/**
 * Posing/presentation advice built from the measured presence read (expression,
 * eye contact, head tilt/turn, shoulder line, brow tension) rather than a
 * generic "keep shoulders relaxed" line. Prioritises the biggest measured
 * issue first, then closes on the mechanical basics. Falls back gracefully when
 * no face/presence was detected.
 */
function generatePosingAdvice(metrics: ImageSignalMetrics, goal: string): string {
  const p = metrics.presenceDetail;
  const base = "Face your light at a slight angle for natural contour, roll your shoulders back and down, and bring your chin slightly forward and down to sharpen the jawline.";

  if (!p) {
    // No face read — keep it mechanical but sound.
    return `${base} ${metrics.symmetryScore < 50 ? "The frame looks a little off-balance — centre yourself and keep your eyeline level." : "Look straight into the lens and let your expression settle into something relaxed."}`;
  }

  const fixes: string[] = [];
  // 1. Eye contact — the single biggest trust signal for a face photo.
  if (!p.eyeContact) {
    fixes.push("you're not quite looking at the lens — direct eye contact is the biggest trust signal a photo has, so look straight down the barrel");
  }
  // 2. Head tilt (measured degrees).
  if (p.tiltDeg >= 9) {
    fixes.push(`your head is tilted about ${Math.round(p.tiltDeg)}° — ${goal === "office" || goal === "linkedin" ? "straighten it level for a professional shot" : "ease it back toward level (a slight ≤5° tilt reads friendly, more starts to read unsure)"}`);
  }
  // 3. Shoulder line (from the pose model, when present).
  if (p.shoulderNote) {
    fixes.push(p.shoulderNote.replace(/\.$/, "").toLowerCase());
  } else if (typeof p.turned === "number" && p.turned > 22) {
    fixes.push("you're turned fairly far from the camera — square your shoulders up a little more");
  }
  // 4. Expression tension vs warmth.
  if (p.browTension >= 45) {
    fixes.push(`your brow is doing some work (tension ${p.browTension}/100) — consciously soften it, it's reading as tense`);
  } else if (p.smile < 25 && !p.genuineSmile) {
    fixes.push("the expression is flat — think of something genuinely funny right before the shutter so the smile reaches your eyes, not just your mouth");
  }

  if (fixes.length === 0) {
    // Presence is already strong — reinforce, don't invent a problem.
    const strength = p.genuineSmile
      ? "Your expression already lands genuine and your eyeline is on the lens — that's the hard part done."
      : "Your posture and eyeline are already working.";
    return `${strength} ${base}`;
  }

  const lead = fixes.slice(0, 2).map((f, i) => (i === 0 ? f.charAt(0).toUpperCase() + f.slice(1) : f)).join("; and ");
  return `${lead}. ${base}`;
}

function generatePhotoGuidance(metrics: ImageSignalMetrics, goal: string): PhotoGuidance {
  // Now personalized based on actual analysis findings
  const lightingAdvice = metrics.lightingScore < 60
    ? metrics.lightingDirection === "flat"
      ? "Your lighting is flat and even. Move to face a window at 45 degrees — one side of your face should be brighter than the other. This creates natural contour and depth that reads as intentional."
      : metrics.lightingDirection === "top"
        ? "Overhead lighting is creating unflattering shadows. Bring the light source to eye level — a desk lamp, phone flashlight, or window at face height works. Light should hit your face from the side, not above."
        : metrics.faceDetected && metrics.faceBrightness < 40
          ? "Your face is in shadow. Turn toward the light source — face the window or lamp directly. The light should illuminate your face, not your back or the background."
          : "Use natural window light at 45 degrees. Avoid mixing warm and cool light sources. A simple ring light at face height can dramatically improve quality."
    : "Your lighting is solid. For even better results, experiment with golden hour outdoor light (sunrise/sunset) for a warm, premium feel.";

  const framingAdvice = metrics.compositionScore < 60
    ? metrics.subjectCenterX !== 0.5
      ? `Your subject is off-center (at ${Math.round(metrics.subjectCenterX * 100)}% width). ${Math.abs(metrics.subjectCenterX - 0.5) > 0.2 ? "This creates an unbalanced feel for a profile photo." : "A slight off-center can be creative, but centering reads more intentionally for profiles."} Center yourself or use the rule of thirds — eyes at the top-third line.`
      : metrics.aspectRatio < 0.7 || metrics.aspectRatio > 1.6
        ? `Your image is ${metrics.aspectRatio < 0.7 ? "very tall" : "wide"} (${metrics.aspectRatio}:1). ${goal === "instagram" ? "For Instagram, use 1:1 square for grid, 4:5 for feed." : "For profile photos, use portrait (4:5 or 3:4) to fill the frame with your face."}`
        : "Use vertical (portrait) orientation. Place the subject slightly off-center with headroom above. Avoid cutting off the top of the head."
    : "Your framing is good. Try the rule of thirds for more dynamic composition in your next shot.";

  const bgAdvice = metrics.backgroundComplexityEstimate > 55
    ? `Your background is ${metrics.backgroundComplexityEstimate > 70 ? "very busy" : "somewhat cluttered"} (complexity: ${metrics.backgroundComplexityEstimate}/100). ${metrics.backgroundBrightness > metrics.faceBrightness + 10 ? "It's also brighter than your face, pulling attention away from you." : "It's competing for the viewer's attention."} Choose a plain wall, open doorway, or outdoor space with minimal clutter at least 4 feet behind you.`
    : "Your background is clean. Textured walls or subtle gradients can add visual interest without distraction.";

  const editingAdvice = metrics.imageDullness > 50
    ? `Your image looks ${metrics.imageDullness > 65 ? "noticeably" : "slightly"} dull (dullness: ${metrics.imageDullness}/100). Boost saturation by 10-15% and add slight warmth (orange tint) for a more vibrant, inviting look. Avoid heavy filters — subtle adjustments work best.`
    : metrics.saturation > 65
      ? "Your colors are slightly oversaturated. Reduce filter intensity by 50% for a more natural look. Natural skin tones and colors perform better than heavily processed ones."
      : "Your color balance is natural. Minor brightness and contrast tweaks are all you need.";

  return {
    lighting: lightingAdvice,
    framing: framingAdvice,
    background: bgAdvice,
    posingOrPresentation: generatePosingAdvice(metrics, goal),
    editing: editingAdvice,
  };
}

function generateGoalAdvice(goal: string, metrics: ImageSignalMetrics): GoalSpecificAdvice {
  // A short measured lead so the "Do this" reads like it's about THIS photo,
  // not a generic goal template — it names the one thing to prioritise given
  // what we actually saw, then hands off to the goal-specific tactics.
  const faceDark = metrics.faceDetected && metrics.faceBrightness < 45;
  const lightWeak = metrics.lightingScore < 55;
  const lightStrong = metrics.lightingScore >= 68;
  const busyBg = metrics.backgroundComplexityEstimate > 58;
  const overFiltered = metrics.saturation > 65;
  const genuineSmile = !!metrics.presenceDetail?.genuineSmile;
  const lead = faceDark
    ? `First, the fix that matters most for this shot: your face is under-lit (${metrics.faceBrightness}/100) — get it properly lit before anything else, because for this goal a clearly-lit face is non-negotiable. `
    : lightWeak
      ? `Start with the light — it scored ${metrics.lightingScore}/100 here and it caps every other signal for this goal. `
      : lightStrong
        ? `Your lighting is already an asset (${metrics.lightingScore}/100) — keep that exact setup and build the rest of the shot around it. `
        : busyBg
          ? `Clean the background first (${100 - metrics.backgroundComplexityEstimate}/100 control) — for this goal a distraction-free frame is doing more than you think. `
          : "";

  const goalSpecific: Record<string, GoalSpecificAdvice> = {
    dating: {
      goal: "Dating profile — read as warm, real, and worth a swipe",
      strategy:
        "On dating apps the first photo decides everything in under a second. It has to read warm, high-trust, and unmistakably you — a clearly-lit face, real eye contact, and an expression that looks like you'd be easy to talk to. Your grid then tells a story: one clean face shot, one full-body, one that shows a life.",
      doThis:
        lead +
        `Lead with a well-lit chest-up shot where your face is the brightest thing in frame and you're looking at the lens. ${genuineSmile ? "Your smile already lands genuine — use a frame like this one as the primary." : "Aim for a real, relaxed smile (think of something actually funny right before the shot) — a posed grin reads as trying too hard."} Follow it with one full-body and one hobby/context photo so you look like a person, not a profile.`,
      avoidThis:
        "Never use a group photo as your primary — people can't find you and swipe left. Skip mirror selfies, heavy filters, sunglasses on the face shot, and anything blurry. Over-editing quietly tanks trust, which is the one thing a dating photo can't afford to lose.",
    },
    instagram: {
      goal: "Instagram — a feed that reads as one intentional profile",
      strategy:
        "Instagram rewards cohesion. A profile that repeats a colour story, a lighting style, and a framing rhythm reads as intentional and gets the follow; a grid of mismatched one-offs reads as a camera roll. Pick a visual signature and let every post reinforce it.",
      doThis:
        lead +
        (metrics.dominantHue === "neutral" || !metrics.dominantHue
          ? "You don't have a colour signature locked in yet — choose 2–3 tones (pull them from your best outfit and background) and commit to them across your next posts. "
          : `Your dominant tone here is ${metrics.dominantHue} — make it your signature. Build a 2–3 colour palette around it and repeat it. `) +
        "Keep lighting consistent (all natural or all indoor, not a mix) and shoot for the grid crop (4:5 feed, 1:1 tile) so nothing important gets cut.",
      avoidThis:
        "Don't mix heavily-filtered shots with natural ones — the inconsistency is what makes a feed look amateur. Avoid low-res uploads and screenshots (Instagram compresses them further), and don't post a great photo with a cluttered background that breaks your colour story.",
    },
    office: {
      goal: "LinkedIn / professional — understated, sharp, credible",
      strategy:
        "A professional headshot sells reliability, not personality. The signal you want is 'competent and approachable': clean solid background, well-fitted neutral clothing, even soft light, steady eye contact, and a slight smile. Every extra element (busy background, loud outfit, hard filter) subtracts credibility.",
      doThis:
        lead +
        "Frame chest-up against a plain wall in white, grey, or muted tone. Wear a solid, well-fitted top in a neutral colour, keep the light even and soft (window light works), hold eye contact with the lens, and give a small genuine smile. That combination reads senior and trustworthy at thumbnail size.",
      avoidThis:
        "Avoid busy or 'fun' backgrounds, cropped party photos, strong filters, sunglasses, or a stiff unsmiling stare. And don't run mismatched avatars across LinkedIn, email, and Slack — inconsistent professional photos read as neglect.",
    },
    college: {
      goal: "College / campus — authentic but clearly put-together",
      strategy:
        "College profiles work best when they look effortless but aware — you don't need formal, you need intentional. Good natural light and a clean, real setting (campus, café, tidy corner) instantly separate you from the messy-bedroom-selfie crowd without looking like you tried too hard.",
      doThis:
        lead +
        "Shoot in natural daylight against a simple real backdrop — a campus wall, library, café, or clean outdoor spot. Show a bit of genuine context (a hobby, a coffee, your actual world) so it reads authentic rather than staged. One relaxed, well-lit shot beats ten heavily-edited ones.",
      avoidThis:
        "Avoid messy-room backgrounds, overcrowded group frames, and heavy beauty filters — they read as either careless or insecure. Don't over-style into someone you're not; the goal is the best real version of you.",
    },
    content: {
      goal: "Content creator — a scroll-stopping, on-brand presence",
      strategy:
        "As a creator your photo is your logo — it has to stop the scroll and be instantly recognisable across every platform. That means bold, consistent lighting, a signature colour or framing, and enough visual energy to survive a tiny thumbnail. Recognisability beats variety.",
      doThis:
        lead +
        "Lock one high-energy, well-lit look and reuse it as your avatar everywhere so people recognise you at a glance. Give the frame a clear focal pop (colour, expression, or a clean strong background) and shoot vertical-friendly so it works for Reels, Shorts, and profile tiles alike.",
      avoidThis:
        "Don't change your look and vibe every post — inconsistency kills recognition. Avoid dull flat lighting and cluttered frames that disappear at thumbnail size, and don't over-filter to the point your real face is unrecognisable off-camera.",
    },
    confidence: {
      goal: "Confidence — a photo that looks like self-assurance",
      strategy:
        "Perceived confidence in a photo is mostly mechanical: square, relaxed shoulders, a lifted chin, real eye contact, and an unforced expression. Get the posture and eye line right and the photo reads self-assured even on a day you didn't feel it.",
      doThis:
        lead +
        `Square your shoulders to the camera, roll them back and down, lift your chin slightly, and look straight into the lens. ${genuineSmile ? "Your expression already reads warm — that plus open posture is exactly the signal." : "Let the expression settle — a calm, slightly amused look reads more confident than a big forced smile."} Shoot from eye level or just above, never from below the chin.`,
      avoidThis:
        "Avoid hunched or turned-away shoulders, a dropped chin, and looking off-camera — they read as uncertainty. Skip the low-angle 'up the nose' shot and anything so heavily edited it looks like you're hiding.",
    },
    glowup: {
      goal: "Overall glow-up — upgrade every signal, in order",
      strategy:
        "A real glow-up is sequenced, not scattered: nail the free fundamentals (lighting, clarity, clean background) first, then grooming and wardrobe basics, and only then accessories or spend. Doing it in that order is what makes the score actually move and hold.",
      doThis:
        lead +
        (metrics.lightingScore < 50
          ? "Lighting is your biggest lever right now — fix it first, then move to grooming and wardrobe basics. "
          : "With lighting handled, put the next effort into grooming and one clean wardrobe upgrade. ") +
        "Re-scan every couple of weeks with the same setup so you're tracking a trend, not a one-off — the progress hub is built for exactly this.",
      avoidThis:
        "Don't skip the free fundamentals to jump straight to buying accessories or expensive changes — it's the most common way people spend money and see the score barely move. Slow, ordered upgrades compound; scattered ones don't.",
    },
  };

  // Goals that share a lens map to the closest expert profile.
  const alias: Record<string, string> = { linkedin: "office", festival: "instagram", travel: "instagram" };
  const key = goalSpecific[goal] ? goal : alias[goal] || "glowup";
  return goalSpecific[key];
}

function generateObservations(metrics: ImageSignalMetrics, goal: string): Observation[] {
  const obs: Observation[] = [];

  // ─── Hair — sounds like a real person, not a metric dump ───
  if (metrics.hairRegion.neatnessScore > 70) {
    obs.push({
      category: "hair",
      severity: "positive",
      title: "Your hair is working for you",
      detail: pick([
        "Clean edges, good texture. This reads as someone who takes care of themselves.",
        "Hair looks intentional — not overdone, not neglected. That sweet spot.",
        "The neatness here signals you put thought into your appearance. People notice.",
      ]),
      suggestion: pick([
        "Keep doing what you're doing. A trim every 3-4 weeks maintains this.",
        "Don't change anything — this is a strength. Build on it.",
      ]),
    });
  } else if (metrics.hairRegion.neatnessScore < 45) {
    obs.push({
      category: "hair",
      severity: "needs-work",
      title: "Hair is pulling focus from your face",
      detail: anchor(pick([
        "Flyaways and uneven texture are creating visual noise. Your face should be the star, not your hair.",
        "The frizz here is competing for attention. Taming it will instantly clean up the whole photo.",
        "Hair looks a bit untamed — not bad, but it's distracting from your best features.",
      ]), "neatness", metrics.hairRegion.neatnessScore),
      suggestion: pick([
        "Quick fix: brush through before the photo, apply a small amount of smoothing product. 30 seconds, big difference.",
        "A leave-in conditioner or anti-frizz serum before photos. For curly hair, a diffuser attachment works wonders.",
        "Before your next photo: dampen slightly, comb through, let it air dry. Done.",
      ]),
    });
  } else {
    obs.push({
      category: "hair",
      severity: "neutral",
      title: "Hair is fine — not a strength, not a weakness",
      detail: pick([
        "Nothing wrong here, but nothing that makes you memorable either.",
        "It works, but a fresh style could push this from neutral to a genuine asset.",
      ]),
      suggestion: pick([
        "A fresh trim or a styling product could turn this into a real positive.",
        "Ask your barber/stylist for a photo-ready look next time. Small change, big impact.",
      ]),
    });
  }

  // ─── Clothing — real talk about what works ───
  if (metrics.clothingRegion.styleSignal === "solid") {
    obs.push({
      category: "clothing",
      severity: "positive",
      title: "Solid colors = smart move",
      detail: pick([
        "Your outfit reads clean and intentional. Solid tones keep the focus on your face, exactly where it should be.",
        "No competing patterns, no visual clutter. This is how people who know what they're doing dress for photos.",
        "The solid tone here is doing its job — letting your face and expression carry the photo.",
      ]),
      suggestion: "This is ideal. Stick with it for profile photos.",
    });
  } else if (metrics.clothingRegion.styleSignal === "varied") {
    obs.push({
      category: "clothing",
      severity: "needs-work",
      title: "Your outfit is doing too much",
      detail: pick([
        "Multiple colors or patterns are splitting the viewer's attention. Your face should be the focal point, not your wardrobe.",
        "The visual noise from competing colors is pulling attention away from you. Simplify.",
        "Too many competing elements in the outfit. In a photo, less is always more.",
      ]),
      suggestion: pick([
        "Switch to one solid color. Navy, white, grey, or black — these never miss for photos.",
        "Pick ONE color for your top and commit. Everything else competes with your face.",
      ]),
    });
  }

  // Clothing-skin contrast
  if (metrics.clothingRegion.contrastWithSkin < 15) {
    obs.push({
      category: "clothing",
      severity: "needs-work",
      title: "Your top is blending into your skin",
      detail: pick([
        "The shirt color is too close to your skin tone — you're losing definition. Darker top on lighter skin, or lighter top on darker skin.",
        "No contrast between your top and face means you lose visual separation. You need that pop.",
      ]),
      suggestion: pick([
        "Wear something that contrasts your skin. It's the simplest way to make yourself stand out.",
        "This is an easy fix — one different shirt and the whole photo transforms.",
      ]),
    });
  }

  // ─── Skin — direct, not clinical ───
  if (metrics.skinRegion.evenness > 70) {
    obs.push({
      category: "skin",
      severity: "positive",
      title: "Skin looks clear and even",
      detail: pick([
        "No harsh shadows, no blotchy patches. Your skin is a genuine asset in this photo.",
        "The even tone here means you can get away with minimal editing. Natural works.",
      ]),
      suggestion: "Keep moisturizing and using SPF. This is worth protecting.",
    });
  } else if (metrics.skinRegion.evenness < 45) {
    obs.push({
      category: "skin",
      severity: "needs-work",
      title: "Uneven skin tone is showing",
      detail: anchor(pick([
        "Shadows or uneven lighting are creating patches on your face. This is usually a lighting problem, not a skin problem.",
        "Dark circles or uneven patches are visible. Good news: this is almost always fixable with better light.",
      ]), "evenness", metrics.skinRegion.evenness),
      suggestion: pick([
        "Face a window at 45°. That's it. Natural side light evens everything out.",
        "The #1 fix: move to a window. Side light at 45° does what ₹5000 of skincare can't.",
      ]),
    });
  }

  // ─── Grooming — honest assessment ───
  const groomingScore = (metrics.hairRegion.neatnessScore + metrics.skinRegion.evenness + metrics.clarityScore) / 3;
  if (groomingScore > 70) {
    obs.push({
      category: "grooming",
      severity: "positive",
      title: "You look put-together",
      detail: pick([
        "Hair, skin, and overall clarity all signal that you care. This is what 'effortless' actually looks like — effort, but hidden.",
        "The grooming here is polished without being overdone. That's the sweet spot for photos.",
      ]),
      suggestion: "Maintain this. Small upgrades (eyebrow grooming, lip balm) can push it further.",
    });
  } else if (groomingScore < 45) {
    obs.push({
      category: "grooming",
      severity: "needs-work",
      title: "A quick grooming session would change everything",
      detail: anchor(pick([
        "The basics need attention — tidy eyebrows, moisturized skin, neat hair. These are free and make a visible difference.",
        "A little grooming effort goes a long way in photos. You're leaving points on the table.",
      ]), "grooming", groomingScore),
      suggestion: pick([
        "30-minute fix: trim stray hairs, shape brows, moisturize. That's it. The photo will look completely different.",
        "Before your next photo: groom. It costs nothing and changes everything.",
      ]),
    });
  }

  // ─── Accessories — specific, not generic ───
  if (metrics.accessoryDetection.accessoryCount > 0) {
    const items = [];
    if (metrics.accessoryDetection.hasGlasses) items.push("glasses");
    if (metrics.accessoryDetection.hasWatch) items.push("a watch");
    if (metrics.accessoryDetection.hasEarring) items.push("jewelry");
    obs.push({
      category: "accessories",
      severity: "positive",
      title: items.includes("glasses") ? "Glasses are working for you" : "Good use of accessories",
      detail: items.includes("glasses")
        ? "Glasses signal intelligence and intentionality. They frame your face well — make sure they're clean and the frames suit your face shape."
        : "One or two accessories add personality without being distracting. That's the right balance.",
      suggestion: "Keep it minimal — one statement piece, not five.",
    });
  }

  // ─── Background — what it signals about you ───
  if (metrics.backgroundComplexityEstimate > 60) {
    obs.push({
      category: "background",
      severity: "needs-work",
      title: "Background is competing with your face",
      detail: anchor(pick([
        "Clutter, objects, or visual noise behind you are pulling attention. In a photo, the background either supports you or undermines you.",
        "The background is too busy. People's eyes are wandering to what's behind you instead of looking at you.",
      ]), "complexity", metrics.backgroundComplexityEstimate),
      suggestion: pick([
        "Stand in front of a plain wall, open doorway, or outdoor space with minimal clutter 4+ feet behind you.",
        "Clean background = clean signal. Move 3 feet closer to a wall or door.",
      ]),
    });
  } else if (metrics.backgroundObjects.hasPlants) {
    obs.push({
      category: "background",
      severity: "positive",
      title: "Background plants add warmth",
      detail: "Greenery in the background signals a cared-for environment. It reads as intentional and inviting.",
      suggestion: "Great choice. Keep them as a background element — don't let them compete with your face.",
    });
  }

  // ─── Posing — honest coaching ───
  if (metrics.symmetryScore > 70) {
    obs.push({
      category: "posing",
      severity: "positive",
      title: "Strong, balanced composition",
      detail: pick([
        "You're well-centered and the framing feels intentional. This reads as confident.",
        "Good balance in the frame. You look like you know what you're doing.",
      ]),
      suggestion: "Maintain this framing. You've found what works.",
    });
  } else if (metrics.symmetryScore < 45) {
    obs.push({
      category: "posing",
      severity: "needs-work",
      title: "The framing feels slightly off",
      detail: pick([
        "You're a bit off-center or tilted, which creates an unbalanced feel. Small adjustment, big difference.",
        "The composition feels tilted or off-kilter. Centering yourself would fix this instantly.",
      ]),
      suggestion: pick([
        "Center yourself. Eyes at the top-third line. That's the rule that works every time.",
        "Slight head tilt (10-15°) adds dynamism. More than that looks uncertain.",
      ]),
    });
  }

  return obs;
}

// Anchors a human-voiced observation to its measured number so a "needs-work"
// call reads as earned, not vibes — matching the rest of the report's register
// without turning the sentence into a metric dump. Kept to a light parenthetical.
function anchor(text: string, label: string, value: number): string {
  return `${text} (${label} measuring ${Math.round(value)}/100)`;
}

// ponytail: deterministic pick — same input always produces same output
let _pickSeed = 0;
function setPickSeed(seed: number) { _pickSeed = seed; }
function pick(arr: string[]): string {
  if (arr.length === 0) return "";
  return arr[_pickSeed % arr.length];
}

function hashMetrics(m: { brightness: number; contrast: number; saturation: number; sharpness: number }): number {
  return Math.round(m.brightness * 7 + m.contrast * 13 + m.saturation * 17 + m.sharpness * 23) % 10000;
}

export async function generateFullAuraReport(
  audit: Audit,
  visionResults?: {
    scores: { lighting: number; background: number; outfit: number; grooming: number; expression: number; overall: number };
    observations: Array<{ category: string; severity: string; title: string; detail: string; suggestion: string; confidence: number }>;
    topLeak?: string;
    quickFixes?: Array<{ title: string; description: string; impact: number }>;
    improvementTips?: string[];
  }
): Promise<FullAuraReportContent> {
  const metrics = audit.fullReport?.freeResult?.imageMetrics
    ? audit.fullReport.freeResult.imageMetrics
    : audit.imageDataUrl
      ? await analyzeImageDataUrl(audit.imageDataUrl)
      : null;

  if (!metrics) {
    throw new Error("No image data available to generate full report.");
  }

  // Quality gate: only hard-fail when the image never produced a scoreable
  // free result. If the free analysis already scored this photo, generate the
  // full report anyway — its whole job is telling the user how to fix these
  // exact quality problems, and paid unlocks must never dead-end here.
  if (metrics.qualityGate && !metrics.qualityGate.canProceed && !audit.fullReport?.freeResult) {
    throw new Error(metrics.qualityGate.message || "Image quality too low for analysis.");
  }

  // ponytail: seed deterministic pick from image metrics
  const pickSeed = hashMetrics({ brightness: metrics.brightness, contrast: metrics.contrast, saturation: metrics.saturation, sharpness: metrics.sharpness });
  setPickSeed(pickSeed);

  // Run intelligence analysis with vision results if available
  let intelligenceResult: IntelligenceResult | null = null;
  if (visionResults) {
    intelligenceResult = runIntelligenceAnalysis({
      goal: audit.goal,
      metrics,
      visionScores: visionResults.scores,
    });
  }

  const baseScore = calculateAuraScore({
    auditType: audit.auditType,
    goal: audit.goal,
    budgetRange: audit.budgetRange,
    metrics,
  });

  // Use intelligence score if available, otherwise use heuristic score
  const score = intelligenceResult ? intelligenceResult.auraScore : baseScore;

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
  if (lightingScore >= 65) strongestSignals.push("Lighting");
  if (clarityScore >= 65) strongestSignals.push("Clarity");
  if (compositionScore >= 65) strongestSignals.push("Composition");
  if (bgControl >= 65) strongestSignals.push("Background control");
  if (colorSignal >= 65) strongestSignals.push("Color balance");
  if (metrics.colorHarmony >= 60) strongestSignals.push("Color harmony");
  if (metrics.symmetryScore >= 65) strongestSignals.push("Symmetry");
  if (premiumSignal >= 65) strongestSignals.push("Premium signal potential");
  if (strongestSignals.length === 0) {
    strongestSignals.push("Identify quick wins — every signal can improve");
  }

  const statusLeaks = generateFullStatusLeaks(metrics, audit.goal);

  const detailedVerdict = oneLineFromFree;

  const priorityMap = generatePriorityMap(metrics, audit.goal);
  const budgetPlan = generateTieredBudgetPlan(metrics, audit.goal);
  const photoGuidance = generatePhotoGuidance(metrics, audit.goal);
  const goalAdvice = generateGoalAdvice(audit.goal, metrics);
  const observations = generateObservations(metrics, audit.goal);

  const improvementScore = calculateImprovementScore(metrics, score, statusLeaks);
  const beforeAfter = getBeforeAfter(metrics, score, improvementScore.potentialScore);
  const actionPlan = generateActionPlan(metrics, statusLeaks, audit.goal, improvementScore.potentialScore);

  // Verdict is synthesised last — it needs the measured ceiling and the ranked
  // top leak so the headline names this photo's real strongest signal, its
  // biggest cost, and the exact move to close the gap.
  const topLeak = [...statusLeaks].sort((a, b) => b.impactScore - a.impactScore)[0];
  const finalVerdict = composeVerdict({
    score,
    category,
    metrics,
    topLeak,
    ceiling: improvementScore.potentialScore,
    seed: pickSeed,
  });

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
    observations,
    actionPlan,
    improvementScore,
    beforeAfter,
    generatedAt: new Date().toISOString(),
  };
}
