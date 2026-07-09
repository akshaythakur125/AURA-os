import type { ImageMetrics, StatusLeak, Category } from "@/types";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ─── Professional sub-scores ───

export function computePhotographerScore(metrics: ImageMetrics): number {
  // Photographer's eye: lighting quality, composition, sharpness, exposure
  let score = metrics.lightingScore * 0.3
    + metrics.compositionScore * 0.2
    + (metrics.centerSharpness ?? metrics.sharpness) * 0.15
    + (metrics.faceRegionBrightness ?? metrics.centerBrightness ?? 128) / 2.55 * 0.15
    + (metrics.colorTemperature !== undefined ? (100 - Math.abs(metrics.colorTemperature - 50)) : 50) * 0.1
    + (metrics.ruleOfThirdsScore ?? 50) * 0.1;
  return clamp(Math.round(score), 30, 95);
}

export function computeDesignerScore(metrics: ImageMetrics): number {
  // Designer's eye: color harmony, balance, saturation, visual weight
  let score = (metrics.colorHarmonyScore ?? 50) * 0.25
    + clamp(metrics.saturation * 0.6 + 30, 0, 100) * 0.2
    + clamp(100 - Math.abs((metrics.warmth ?? 50) - 50) * 1.5, 0, 100) * 0.2
    + (metrics.visualWeightBalance ?? 70) * 0.15
    + clamp(100 - metrics.backgroundComplexityEstimate * 0.5, 0, 100) * 0.1
    + (metrics.styleArchetype ? 75 : 50) * 0.1;
  return clamp(Math.round(score), 30, 95);
}

export function computeStylistScore(metrics: ImageMetrics): number {
  // Stylist's eye: outfit contrast, color coordination, overall polish
  let score = (metrics.outfitColorContrast ?? 50) * 0.3
    + (metrics.upperBodyColor?.name ? 80 : 40) * 0.2
    + (metrics.colorMood ? (metrics.colorMood === "neutral" || metrics.colorMood === "warm" ? 80 : 60) : 50) * 0.2
    + clamp(metrics.overallImageQualityScore * 0.7 + 20, 0, 100) * 0.15
    + clamp(100 - metrics.backgroundComplexityEstimate * 0.4, 0, 100) * 0.15;
  return clamp(Math.round(score), 30, 95);
}

export function computeCompositeScore(metrics: ImageMetrics): number {
  const photo = computePhotographerScore(metrics);
  const design = computeDesignerScore(metrics);
  const style = computeStylistScore(metrics);
  return clamp(Math.round(photo * 0.4 + design * 0.3 + style * 0.3), 35, 92);
}

// ─── Original `computeAuraScore` — now aliases composite ───
export function computeAuraScore(metrics: ImageMetrics): number {
  return computeCompositeScore(metrics);
}

// ─── Professional categories ───

export function getCategory(score: number): Category {
  if (score <= 40) return "Underexposed / Needs Work";
  if (score <= 48) return "Rough Draft — Immediate Fixes";
  if (score <= 55) return "Decent Start — Polish Needed";
  if (score <= 62) return "Solid Casual — Nearly Intentional";
  if (score <= 70) return "Intentional Look — Minor Tweaks";
  if (score <= 78) return "Premium Signal — Profile Ready";
  if (score <= 86) return "Editorial Grade — Very Strong";
  return "Polished / Styled — Elite Level";
}

// ─── Professional verdict ───

export function getVerdict(score: number, metrics: ImageMetrics): string {
  const leaks = generateStatusLeaks(metrics).slice(0, 2);
  const topLeak = leaks[0];
  const ar = metrics.aspectRatio;
  const cat = getCategory(score);

  // Photographer perspective
  const photo = computePhotographerScore(metrics);
  const design = computeDesignerScore(metrics);
  const style = computeStylistScore(metrics);

  // Photographer feedback
  let photographerFeedback = "";
  if (metrics.lightingDirection === "overhead") photographerFeedback = "Your lighting reads as utilitarian — overhead sources create unflattering shadows under the eyes and nose, which any photographer would flag immediately.";
  else if (metrics.lightingDirection === "backlit") photographerFeedback = "The backlighting leaves your face underexposed. A photographer would tell you to flip your position so the window or key light hits your face at a 45° angle — classic Rembrandt placement.";
  else if (metrics.lightingScore < 50) photographerFeedback = "The scene is underexposed. In photography terms, you're losing detail in the shadows and the camera is compensating with noise. A brighter key light would instantly lift the whole image.";
  else if (photo >= 75) photographerFeedback = "The lighting shows real intention — even exposure across the face, minimal noise, and good tonal range. This is what a skilled portrait photographer aims for.";
  else photographerFeedback = "Lighting is adequate but flat. A photographer would look for more directional quality — a single window at 45° creates natural contouring (chiaroscuro) that adds depth.";

  // Designer feedback
  let designerFeedback = "";
  if (metrics.saturation < 25) designerFeedback = "From a design perspective, your colour saturation is too low — the palette looks desaturated, almost monochrome. A designer would suggest adding one accent colour (a navy blazer, a warm accessory) to create visual interest.";
  else if ((metrics.colorHarmonyScore ?? 50) < 45) designerFeedback = "The colour palette feels scattered. A designer would recommend limiting your visible colours to 2-3 tones for a more curated, cohesive frame. Think: one neutral base, one accent, one skin tone.";
  else if (metrics.colorMood === "high_energy") designerFeedback = "The colour energy is very high. A designer would say this signals excitement or boldness — great for creative profiles, but could read as chaotic for professional contexts. Dialling back saturation 15% calms the frame.";
  else if (design >= 70) designerFeedback = "Strong colour sense — the palette reads intentional and composed. Good saturation, balanced temperature, and the visual weight sits where it should. A designer would call this 'curated.'";
  else designerFeedback = "Your colour story is neutral and safe. A designer would recommend adding a subtle colour accent — a pocket square, a coloured accessory, or a warm-toned background — to give the image more personality.";

  // Stylist feedback
  let stylistFeedback = "";
  if (metrics.upperBodyColor?.name && metrics.upperBodyColor.name !== "unknown") {
    const upper = metrics.upperBodyColor.name;
    stylistFeedback = `Your upper body reads as ${upper}. ${upper === "black" || upper === "charcoal" ? "That's a strong signal — it says authority and minimal effort. A stylist might say add a textured layer or a subtle accessory to soften the look." : upper === "white" || upper === "cream" ? "Clean and fresh. A stylist would approve — white and cream read as intentional in photos." : `A stylist would note that ${upper} makes a statement. Make sure the rest of the outfit tones it down to keep the frame balanced.`}`;
  } else {
    stylistFeedback = "Your outfit doesn't register strongly in the frame. A stylist would suggest a structured neckline (a collared shirt, a blazer lapel, or a clean crew neck) to anchor the upper body visually.";
  }

  // Combine into a single verdict
  let verdict = photographerFeedback + " " + designerFeedback + " " + stylistFeedback;

  // Score-specific opening
  if (score <= 48) {
    verdict = "There are a few fundamentals that need attention before this photo works. " + photographerFeedback + " " + designerFeedback;
  } else if (score <= 62) {
    verdict = "You have a decent starting point. Here's what a pro would say about each layer: " + photographerFeedback + " " + designerFeedback + " " + stylistFeedback;
  } else if (score <= 78) {
    verdict = "This is already quite intentional. A few refinements take it from good to great. " + photographerFeedback + " " + (topLeak ? "One thing to fix: " + topLeak.fix : "");
  } else {
    verdict = "This reads as intentional and well-considered. " + photographerFeedback + " " + (topLeak ? "If you want to nitpick: " + topLeak.fix : "Nothing major to fix here — this is already above average.");
  }

  return verdict.substring(0, 800);
}

// ─── Enhanced status leaks with product recommendations ───

export function generateStatusLeaks(metrics: ImageMetrics): StatusLeak[] {
  const leaks: StatusLeak[] = [];

  if (metrics.lightingDirection === "overhead") {
    leaks.push({
      title: "Harsh overhead shadows — lose 10-15 pts",
      explanation: "Ceiling light creates raccoon shadows under your eyes and nose. A professional photographer would use a 45° key light (Rembrandt setup) to sculpt facial contours instead of flattening them.",
      fix: "Face a window at 45° — this creates natural Rembrandt lighting. Pro tip: if the room has a ceiling light, turn it off and use a desk lamp at face height instead. A ₹499 ring light from Amazon creates instant studio-quality lighting.",
      severity: "high", impactScore: 50,
    });
  } else if (metrics.lightingDirection === "backlit") {
    leaks.push({
      title: "Backlit = your face is in shadow",
      explanation: "The brightest source is behind you, so your face is underexposed. A pro photographer always ensures the key light hits the subject's face first.",
      fix: "180° flip: put the light in front of you. If you want the window behind you for vibe, place a reflector or second light on your face (a ₹299 laptop ring light works).",
      severity: "high", impactScore: 45,
    });
  } else if (metrics.lightingDirection === "underlit") {
    leaks.push({
      title: "Upward light = horror-movie shadows",
      explanation: "Light from below inverts natural shadows and looks unnatural. It's the most common phone-at-chin-height mistake.",
      fix: "Raise the phone to eye level. If you're reading this at night: hold any lamp at face height, an arm's length away. A ring light on a stand (₹599 on Amazon) eliminates this problem permanently.",
      severity: "medium", impactScore: 28,
    });
  } else if (metrics.lightingScore < 55) {
    leaks.push({
      title: "Underexposed — too dim for impact",
      explanation: "Low light forces the camera sensor to create noise, which softens detail and adds grain. Every professional portrait photographer's #1 rule: more light = better photo.",
      fix: "Move next to a large window during daytime — north-facing windows give the softest, most even light. At night, a ring light (₹499) is the cheapest upgrade you can make to your photography setup.",
      severity: "high", impactScore: 35,
    });
  }

  if ((metrics.faceRegionBrightness ?? metrics.centerBrightness ?? 128) < 90 && metrics.lightingDirection !== "backlit") {
    leaks.push({
      title: "Face is too dark — the most important part",
      explanation: "Your face carries 90% of the first-impression weight. If it's underexposed, you're wasting every other thing you did right. Pro portrait photographers always expose for the face first.",
      fix: "Tap your face on screen before shooting to lock exposure. If it's still dark, move closer to the light. A ₹299 LED panel from Amazon clips to your phone and guarantees perfect face exposure.",
      severity: "high", impactScore: 32,
    });
  }

  if (metrics.backgroundClutterZone === "full") {
    leaks.push({
      title: "Cluttered background — viewer can't focus on you",
      explanation: "The full background has competing visual elements. A photographer would say 'the background should disappear' — your eye should go straight to the subject, not bounce around.",
      fix: "Stand 3-4 feet in front of a plain wall. White, grey, or warm beige all work. In a pinch, hang a ₹200 bedsheet behind you — it's the cheapest backdrop you'll ever buy.",
      severity: "high", impactScore: 40,
    });
  } else if (metrics.backgroundClutterZone && metrics.backgroundClutterZone !== "none") {
    leaks.push({
      title: `Clutter in ${metrics.backgroundClutterZone} of frame`,
      explanation: "Visual noise in specific zones distracts from the subject. A designer would flag this as a composition issue — every element in the frame should support the focal point.",
      fix: `Clear the ${metrics.backgroundClutterZone} area or frame tighter. Portrait mode helps by blurring distractions.`,
      severity: "medium", impactScore: 20,
    });
  } else if (metrics.backgroundComplexityEstimate > 70) {
    leaks.push({
      title: "Busy background competes for attention",
      explanation: "Too much going on behind you. A stylist would say the background should complement, not compete.",
      fix: "Move to a simpler setting — a clean wall, open sky, or out-of-focus greenery. Portrait mode on most phones costs nothing and fixes this instantly.",
      severity: "medium", impactScore: 25,
    });
  }

  if (metrics.sharpness < 45) {
    leaks.push({
      title: "Blurry — camera shake or dirty lens",
      explanation: "A soft/out-of-focus image reads as low-effort immediately. Professional photographers always check focus priority on the subject's eyes.",
      fix: "Wipe the lens (front cameras are always greasy). Rest the phone on a stack of books or use a ₹499 tripod — steady phone = sharp photo every time.",
      severity: "high", impactScore: 38,
    });
  } else if (metrics.sharpness < 55) {
    leaks.push({
      title: "Slightly soft — not fully crisp",
      explanation: "Details lack the micro-contrast that makes a photo look polished. A pro would say 'you're losing the texture that signals quality.'",
      fix: "Tap to focus on your face before shooting. Use the rear camera (it's always sharper). A ₹299 lens cleaning kit is the cheapest sharpness upgrade.",
      severity: "medium", impactScore: 18,
    });
  }

  if (metrics.contrast < 30) {
    leaks.push({
      title: "Washed out — flat tonal range",
      explanation: "The image lacks contrast — a photographer would say it has 'low dynamic range.' Without proper darks and lights, the photo looks faded and unintentional.",
      fix: "Shoot with directional window light (side lighting creates natural contrast). In editing, push contrast +15-20. A ₹699 softbox creates pro-level contrast regardless of room lighting.",
      severity: "medium", impactScore: 22,
    });
  }

  if (metrics.saturation < 25) {
    leaks.push({
      title: "Desaturated — colours feel cold",
      explanation: "A designer would say the colour story reads as 'clinical' rather than 'inviting'. Desaturated images signal low energy, which subconsciously affects how viewers perceive your personality.",
      fix: "Wear one piece with a warm accent colour (navy, burgundy, forest green). A coloured shirt or jacket costs ₹500-1500 and immediately adds visual warmth to any photo.",
      severity: "low", impactScore: 14,
    });
  }

  if (metrics.warmth !== undefined && metrics.warmth < 30) {
    leaks.push({
      title: "Cool blue cast — skin looks cold",
      explanation: "A cool colour temperature reads as 'hospital lighting' to most viewers. A photographer always sets white balance to ensure skin tones look natural first.",
      fix: "Shoot in warm natural light (golden hour is ideal). Avoid fluorescent lights. A ₹300 warming filter for your phone lens fixes white balance instantly.",
      severity: "low", impactScore: 12,
    });
  } else if (metrics.warmth !== undefined && metrics.warmth > 75) {
    leaks.push({
      title: "Too warm — orange tint on skin",
      explanation: "Heavy yellow-orange cast from indoor bulbs. Skin looks artificially tanned, which signals over-processing.",
      fix: "Switch to auto white balance or mix natural light with your indoor source. A ₹200 white balance card removes guesswork from colour correction.",
      severity: "low", impactScore: 10,
    });
  }

  if (metrics.compositionScore < 55) {
    leaks.push({
      title: "Awkward framing — crop hurts the photo",
      explanation: "A photographer would recompose this shot. Portrait orientation with proper headroom (palm's width above the head) is the standard for profile photos. The rule of thirds isn't a suggestion — it's a shortcut to balanced composition.",
      fix: "Shoot vertical (portrait mode). Keep your eyes on the upper third line. Leave space above your head but crop out dead space below the chest. A ₹499 phone tripod helps frame consistently.",
      severity: metrics.compositionScore < 40 ? "high" : "medium",
      impactScore: Math.round((55 - metrics.compositionScore) * 1.3),
    });
  }

  // New: outfit-related leaks
  if (metrics.styleArchetype && metrics.outfitColorContrast !== undefined && metrics.outfitColorContrast < 30) {
    leaks.push({
      title: "Outfit blends into background",
      explanation: "Your clothing has low contrast against the background. A stylist would say you're missing the opportunity to create 'separation' — the visual distinction between subject and environment that makes a photo pop.",
      fix: "Wear a colour that contrasts with your background. Dark background → light top. Light background → dark top. A ₹599 basic crew-neck tee in a contrasting colour fixes this instantly.",
      severity: "medium", impactScore: 20,
    });
  }

  return leaks.sort((a, b) => b.impactScore - a.impactScore);
}

// ─── Enhanced strong signals ───

export function getStrongestSignals(metrics: ImageMetrics): string[] {
  const signals: { name: string; value: number }[] = [];
  const photo = computePhotographerScore(metrics);
  const design = computeDesignerScore(metrics);
  const style = computeStylistScore(metrics);

  if (photo >= 70) signals.push({ name: "Strong Lighting & Composition", value: photo });
  if (design >= 70) signals.push({ name: "Curated Colour Story", value: design });
  if (style >= 70) signals.push({ name: "Intentional Styling", value: style });
  if (metrics.lightingDirection === "even" && metrics.lightingScore >= 60)
    signals.push({ name: "Even, Flattering Light", value: metrics.lightingScore + 10 });
  if (metrics.backgroundComplexityEstimate < 35)
    signals.push({ name: "Clean, Controlled Background", value: 90 });
  if (metrics.sharpness >= 60)
    signals.push({ name: "Crisp Focus", value: metrics.sharpness + 10 });
  if (metrics.saturation >= 30 && metrics.saturation <= 60)
    signals.push({ name: "Natural Colour Depth", value: 75 });
  if ((metrics.warmth ?? 50) >= 40 && (metrics.warmth ?? 50) <= 65)
    signals.push({ name: "Natural Skin Tone", value: 78 });
  if (metrics.styleArchetype === "minimal" || metrics.styleArchetype === "classic")
    signals.push({ name: "Clean, Timeless Style", value: 80 });
  if (metrics.ruleOfThirdsScore !== undefined && metrics.ruleOfThirdsScore >= 60)
    signals.push({ name: "Well-Composed Frame", value: metrics.ruleOfThirdsScore });

  return signals.sort((a, b) => b.value - a.value).slice(0, 3).map((s) => s.name);
}

// ─── Enhanced quick fixes ───

export function generateQuickFixes(metrics: ImageMetrics): string[] {
  const fixes: string[] = [];

  if (metrics.lightingDirection === "overhead")
    fixes.push("Face a window at 45° (Rembrandt lighting) instead of ceiling lights. Ring light ₹499 on Amazon.");
  else if (metrics.lightingDirection === "backlit")
    fixes.push("Flip around — put the window/light in front of you. ₹299 reflector from Amazon fills shadows.");
  else if (metrics.lightingScore < 55)
    fixes.push("Move to a bright window. ₹599 ring light stand = permanent fix for dim photos.");

  if (metrics.backgroundClutterZone === "full")
    fixes.push("Plain wall + 3ft distance. ₹200 bedsheet = cheapest backdrop upgrade.");
  else if (metrics.backgroundClutterZone && metrics.backgroundClutterZone !== "none")
    fixes.push(`Clear the ${metrics.backgroundClutterZone} area or use portrait mode to blur distractions.`);

  if (metrics.sharpness < 45)
    fixes.push("Wipe lens, rest phone on solid surface. ₹499 tripod from Amazon = instant sharpness fix.");
  else if (metrics.sharpness < 55)
    fixes.push("Tap to focus on face. Use rear camera — it's 3x sharper than the front cam.");

  if ((metrics.faceRegionBrightness ?? metrics.centerBrightness ?? 128) < 90)
    fixes.push("Tap face on screen to lock exposure. ₹299 clip-on LED brightens any shot.");

  if (metrics.contrast < 30)
    fixes.push("Side window lighting creates natural contrast. Edit: push contrast +15.");

  if (metrics.saturation < 25)
    fixes.push("Wear one warm accent colour (navy/burgundy). A ₹599 tee in a saturated colour = instant upgrade.");

  if (metrics.styleArchetype && metrics.outfitColorContrast !== undefined && metrics.outfitColorContrast < 30)
    fixes.push("Wear a colour that contrasts with your background for 'separation' effect.");

  if (fixes.length === 0)
    fixes.push("Technically solid. Next level: expression, location, and one intentional style piece.");

  return fixes.slice(0, 4);
}
