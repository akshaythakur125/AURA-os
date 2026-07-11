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
import { runIntelligenceAnalysis } from "./intelligence";
import type { IntelligenceResult } from "./intelligence";

function clamp(value: number, min = 0, max = 100): number {
  return Math.round(Math.min(max, Math.max(min, value)));
}

// ─── Personalized status leak generation ───
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
  const issues: { key: string; score: number }[] = [
    { key: "Improve lighting setup", score: metrics.lightingScore },
    { key: "Improve image clarity", score: metrics.sharpness },
    { key: "Improve composition and framing", score: metrics.compositionScore },
    { key: "Simplify background", score: 100 - metrics.backgroundComplexityEstimate },
    { key: "Balance color tones", score: 100 - Math.abs(metrics.saturation - 45) },
    { key: "Improve contrast", score: metrics.contrast },
    { key: "Fix subject-background separation", score: metrics.subjectBgContrast },
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
      "Grooming basics — skincare, hair products",
      "Simple watch or minimal accessory",
      "Full grooming — haircut, skincare, styling",
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
    posingOrPresentation: `Face the light source at a slight angle for natural contour. Keep shoulders relaxed and chin slightly forward. ${metrics.faceDetected && metrics.symmetryScore < 50 ? "Your image shows some asymmetry — a slight head tilt can help balance the composition." : "A genuine smile signals confidence and warmth."}`,
    editing: editingAdvice,
  };
}

function generateGoalAdvice(goal: string, metrics: ImageSignalMetrics): GoalSpecificAdvice {
  const goalSpecific = {
    dating: {
      goal: "Dating Profile Optimization",
      strategy:
        "Dating profile photos should feel warm, approachable, and intentional. Prioritize clear face visibility, genuine smile, and a background that suggests a social or interesting lifestyle without trying too hard.",
      doThis: metrics.faceDetected && metrics.faceBrightness > 60
        ? "Your face lighting is good — build on this with a well-lit chest-up shot as your primary photo. Add one full-body shot and one hobby/context photo. Keep editing minimal."
        : "Use a well-lit chest-up shot as your primary photo. Make sure your face is clearly visible and well-lit. Add one full-body shot and one hobby/context photo.",
      avoidThis: "Avoid group photos as primary, heavy filters, mirror selfies, or anything that looks like it was taken in a hurry. Over-edited photos reduce trust signals significantly.",
    },
    instagram: {
      goal: "Instagram Profile Cohesion",
      strategy:
        "Instagram is about visual consistency. Your feed should tell a story through repeated colors, lighting styles, and framing choices. Each photo should feel like it belongs to the same profile.",
      doThis: metrics.dominantHue === "neutral"
        ? "You don't have a strong color signature yet. Pick 2-3 color tones (based on your best outfit colors) and stick to them. Use consistent lighting and keep backgrounds on-brand."
        : `Your dominant tone is ${metrics.dominantHue} — build on this. Establish 2-3 color tones around it and stick to them. Use consistent lighting (all indoor or all natural). Keep backgrounds clean and on-brand.`,
      avoidThis: "Avoid posting random photo qualities, mixing heavy filters with natural shots, or inconsistent backgrounds. Don't post low-resolution images or screenshots.",
    },
    office: {
      goal: "Professional / LinkedIn Presentation",
      strategy:
        "For professional contexts, the signal should be understated, clean, and confident. Less is more — neutral backgrounds, solid colors, and clear framing signal reliability.",
      doThis: "Use a simple solid background (white, grey, or muted). Wear solid, well-fitted clothing in neutral colors. Use even, soft lighting. A slight smile conveys approachability.",
      avoidThis: "Avoid busy backgrounds, casual outfit details, extreme filters, or any frame that looks like a casual selfie. Maintain eye contact with the camera.",
    },
    college: {
      goal: "College / University Social Presence",
      strategy:
        "College profiles should feel authentic but intentional. You don't need to look formal — just put-together and aware. Clean framing and good lighting set you apart.",
      doThis: "Use natural light. Keep backgrounds simple (campus wall, library, outdoor). Show genuine context — a hobby, a coffee shop, or a clean dorm corner works well.",
      avoidThis: "Avoid overcrowded frames, messy room backgrounds, or heavily filtered photos. Don't try too hard to look like someone you're not.",
    },
    glowup: {
      goal: "Overall Glow-Up / Personal Upgrade",
      strategy:
        "A glow-up is about improving across the board — lighting, grooming, wardrobe, and confidence. Start with the basics (lighting, clarity, background) before spending on accessories.",
      doThis: metrics.lightingScore < 50
        ? "Start with lighting — it's your biggest gap and makes the biggest difference. Fix that first, then improve grooming and wardrobe basics. Document progress with weekly photos."
        : "Fix lighting first — it makes the biggest difference. Then improve grooming and wardrobe basics. Document your progress with weekly photos to track improvement.",
      avoidThis: "Avoid skipping the fundamentals (lighting, clarity) to jump straight to accessories or expensive changes. Slow, consistent upgrades create lasting results.",
    },
  };

  return goalSpecific[goal as keyof typeof goalSpecific] || goalSpecific.glowup;
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
      detail: pick([
        "Flyaways and uneven texture are creating visual noise. Your face should be the star, not your hair.",
        "The frizz here is competing for attention. Taming it will instantly clean up the whole photo.",
        "Hair looks a bit untamed — not bad, but it's distracting from your best features.",
      ]),
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
      detail: pick([
        "Shadows or uneven lighting are creating patches on your face. This is usually a lighting problem, not a skin problem.",
        "Dark circles or uneven patches are visible. Good news: this is almost always fixable with better light.",
      ]),
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
      detail: pick([
        "The basics need attention — tidy eyebrows, moisturized skin, neat hair. These are free and make a visible difference.",
        "A little grooming effort goes a long way in photos. You're leaving points on the table.",
      ]),
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
      detail: pick([
        "Clutter, objects, or visual noise behind you are pulling attention. In a photo, the background either supports you or undermines you.",
        "The background is too busy. People's eyes are wandering to what's behind you instead of looking at you.",
      ]),
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

// ponytail: deterministic pick — same input always produces same output
let _pickSeed = 0;
function setPickSeed(seed: number) { _pickSeed = seed; }
function pick(arr: string[]): string {
  if (arr.length === 0) return "";
  return arr[_pickSeed % arr.length];
}

function generateFinalVerdict(
  score: number,
  category: string,
  metrics: ImageSignalMetrics
): string {
  if (score >= 75) {
    const refineTarget = metrics.lightingScore < 70 ? "lighting" : metrics.sharpness < 70 ? "clarity" : "framing";
    return pick([
      `You're already in the top tier. The ${refineTarget} tweak is the last 10% that separates good from exceptional.`,
      `Strong photo. One targeted fix in ${refineTarget} and you're at a professional level.`,
      `This is a solid 75+. The ${refineTarget} adjustment is polish, not a rebuild.`,
    ]);
  }
  if (score >= 60) {
    return pick([
      "Good foundation, clear weak spots. Fix the #1 issue in your roadmap and watch the score jump.",
      "You're closer than you think. Two or three targeted changes and this becomes a genuinely strong photo.",
      "Above average, but you're leaving easy points on the table. The roadmap shows exactly what to fix.",
    ]);
  }
  return pick([
    "Honest take: this needs work. But the good news is the biggest improvements are free — lighting and clarity alone can transform this.",
    "Room to grow, and most of it costs nothing. Start with the free fixes, then build from there.",
    "This isn't your best photo — but it shows your baseline. Fix the basics and retake. You'll be surprised.",
  ]);
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

  // ponytail: quality gate — reject unusable images before scoring
  if (metrics.qualityGate && !metrics.qualityGate.canProceed) {
    throw new Error(metrics.qualityGate.message || "Image quality too low for analysis.");
  }

  // ponytail: seed deterministic pick from image metrics
  setPickSeed(hashMetrics({ brightness: metrics.brightness, contrast: metrics.contrast, saturation: metrics.saturation, sharpness: metrics.sharpness }));

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
  const budgetPlan = generateTieredBudgetPlan(audit.budgetRange);
  const photoGuidance = generatePhotoGuidance(metrics, audit.goal);
  const goalAdvice = generateGoalAdvice(audit.goal, metrics);
  const finalVerdict = generateFinalVerdict(score, category, metrics);
  const observations = generateObservations(metrics, audit.goal);

  const improvementScore = calculateImprovementScore(metrics, score, statusLeaks);
  const beforeAfter = getBeforeAfter(metrics, score, improvementScore.potentialScore);

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
    improvementScore,
    beforeAfter,
    generatedAt: new Date().toISOString(),
  };
}
