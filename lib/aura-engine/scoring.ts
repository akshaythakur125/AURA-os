import type { ImageMetrics, StatusLeak, Category } from "@/types";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeAuraScore(metrics: ImageMetrics): number {
  const raw =
    metrics.lightingScore * 0.25 +
    metrics.clarityScore * 0.25 +
    metrics.compositionScore * 0.20 +
    (metrics.contrast * 0.5 + metrics.saturation * 0.5) * 0.15 +
    ((100 - metrics.backgroundComplexityEstimate) * 0.5 + (metrics.overallImageQualityScore) * 0.5) * 0.15;
  return clamp(Math.round(raw), 35, 92);
}

export function getCategory(score: number): Category {
  if (score <= 45) return "Low-Clarity Presentation";
  if (score <= 55) return "Clean but Basic";
  if (score <= 65) return "Urban Aspirational";
  if (score <= 75) return "Premium Potential";
  if (score <= 85) return "Strong Visual Signal";
  return "Overdone / Busy Signal";
}

export function getVerdict(score: number, metrics: ImageMetrics): string {
  const issues = getTopIssues(metrics);

  if (score <= 45) {
    if (issues.length >= 3) return `Multiple issues are pulling your photo down — ${issues.slice(0, 2).join(" and ")}. Fix these two first and you could jump 15-20 points.`;
    return `Your photo has potential but ${issues[0] || "the technical quality"} is holding it back. One reshoot in better conditions changes everything.`;
  }
  if (score <= 55) {
    return `Decent foundation, but ${issues[0] || "a few details"} ${issues.length > 1 ? `and ${issues[1]}` : ""} are keeping this from landing. A small reshoot fixes it.`;
  }
  if (score <= 65) {
    if (issues.length > 0) return `You are close — ${issues[0]} is the main thing between you and a genuinely strong photo. Worth one more take.`;
    return "Solid effort. The basics are right but it reads as casual rather than intentional. A few tweaks make it profile-ready.";
  }
  if (score <= 75) {
    if (issues.length > 0) return `Strong photo. ${issues[0]} is the only thing I'd flag — fix that and this is genuinely top-tier.`;
    return "This reads well. Clean lighting, good clarity, minimal distractions. Ready for use with minor polish.";
  }
  if (score <= 85) return "Technically very clean. Consistent lighting, sharp subject, controlled background. This is what intentional looks like.";
  return "Visually intense — strong technically but risks feeling over-produced. Consider dialling back for a more natural read.";
}

function getTopIssues(metrics: ImageMetrics): string[] {
  const issues: { label: string; severity: number }[] = [];

  if (metrics.lightingDirection === "overhead") {
    issues.push({ label: "the overhead lighting is casting harsh shadows on your face", severity: 85 });
  } else if (metrics.lightingDirection === "backlit") {
    issues.push({ label: "you are backlit so your face is in shadow", severity: 90 });
  } else if (metrics.lightingDirection === "underlit") {
    issues.push({ label: "the upward lighting is creating an unflattering look", severity: 75 });
  } else if (metrics.lightingScore < 50) {
    issues.push({ label: "the lighting is too dim for a clear read", severity: 70 });
  }

  if (metrics.backgroundClutterZone === "full") {
    issues.push({ label: "the background is cluttered and pulls attention away from you", severity: 80 });
  } else if (metrics.backgroundClutterZone && metrics.backgroundClutterZone !== "none") {
    issues.push({ label: `there is visual clutter in the ${metrics.backgroundClutterZone} of the frame`, severity: 65 });
  } else if (metrics.backgroundComplexityEstimate > 70) {
    issues.push({ label: "the background is busy and distracting", severity: 70 });
  }

  if (metrics.sharpness < 45) {
    issues.push({ label: "the image is noticeably soft — it looks like camera shake or a dirty lens", severity: 75 });
  } else if (metrics.sharpness < 55) {
    issues.push({ label: "the image could be sharper — it does not look fully crisp", severity: 50 });
  }

  if ((metrics.faceRegionBrightness ?? metrics.centerBrightness ?? 128) < 90) {
    issues.push({ label: "your face is underexposed — too dark to read clearly", severity: 70 });
  }

  if (metrics.contrast < 30) {
    issues.push({ label: "the image looks washed out with very low contrast", severity: 55 });
  }

  if (metrics.saturation < 25) {
    issues.push({ label: "the colours are flat and lifeless", severity: 40 });
  }

  return issues.sort((a, b) => b.severity - a.severity).map((i) => i.label);
}

export function getStrongestSignals(metrics: ImageMetrics): string[] {
  const signals: { name: string; value: number; detail: string }[] = [];

  if (metrics.lightingDirection === "even" && metrics.lightingScore >= 60) {
    signals.push({ name: "Even Lighting", value: metrics.lightingScore + 10, detail: "Light falls evenly across the frame" });
  } else if (metrics.lightingScore >= 55) {
    signals.push({ name: "Adequate Lighting", value: metrics.lightingScore, detail: "Sufficient light on the subject" });
  }

  if (metrics.centerSharpness !== undefined && metrics.centerSharpness > 50) {
    signals.push({ name: "Sharp Subject", value: metrics.centerSharpness, detail: "Subject area is in focus" });
  } else if (metrics.clarityScore >= 55) {
    signals.push({ name: "Reasonable Clarity", value: metrics.clarityScore, detail: "Overall image clarity is acceptable" });
  }

  if (metrics.backgroundComplexityEstimate < 40) {
    signals.push({ name: "Clean Background", value: 100 - metrics.backgroundComplexityEstimate, detail: "Minimal distractions behind subject" });
  }

  if (metrics.subjectContrast !== undefined && metrics.subjectContrast > 20) {
    signals.push({ name: "Subject Separation", value: Math.min(100, metrics.subjectContrast * 2), detail: "Subject stands out from background" });
  }

  if (metrics.compositionScore >= 70) {
    signals.push({ name: "Good Framing", value: metrics.compositionScore, detail: "Frame dimensions suit profile use" });
  }

  if (metrics.warmth !== undefined && metrics.warmth >= 40 && metrics.warmth <= 65) {
    signals.push({ name: "Natural Colour", value: 75, detail: "Colour temperature reads natural" });
  }

  if (metrics.contrast >= 40 && metrics.contrast <= 70) {
    signals.push({ name: "Balanced Contrast", value: 70, detail: "Neither washed out nor over-processed" });
  }

  if (metrics.saturation >= 30 && metrics.saturation <= 70) {
    signals.push({ name: "Healthy Saturation", value: metrics.saturation + 20, detail: "Colours are present without being oversaturated" });
  }

  return signals
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((s) => s.name);
}

export function generateStatusLeaks(metrics: ImageMetrics): StatusLeak[] {
  const leaks: StatusLeak[] = [];

  if (metrics.lightingDirection === "overhead") {
    leaks.push({
      title: "Harsh overhead light creating shadows",
      explanation:
        "The light source is above you, casting hard shadows under your eyes, nose, and chin. This makes you look tired and older than you are. It is the single most common selfie mistake.",
      fix: "Face a window directly, or stand under open shade outdoors. If indoors at night, hold a lamp or phone flashlight at eye level about an arm's length away. Never shoot directly under a ceiling tube light.",
      severity: "high",
      impactScore: Math.round((55 - metrics.lightingScore) * 1.8 + 15),
    });
  } else if (metrics.lightingDirection === "backlit") {
    leaks.push({
      title: "Backlit — your face is in shadow",
      explanation:
        "The brightest light is behind you, turning your face into a silhouette. The camera exposes for the bright background and underexposes you.",
      fix: "Flip 180 degrees so the light source (window, sun) is in front of you, not behind. If you want a backlit vibe, use a fill light or reflector to bounce light onto your face.",
      severity: "high",
      impactScore: 40,
    });
  } else if (metrics.lightingDirection === "underlit") {
    leaks.push({
      title: "Unflattering upward light",
      explanation:
        "Light coming from below creates an eerie, unnatural look — like holding a torch under your chin. It reverses the shadows your face naturally creates.",
      fix: "Raise the light source to eye level or slightly above. Natural window light at face height is the easiest fix.",
      severity: "medium",
      impactScore: 25,
    });
  } else if (metrics.lightingScore < 55) {
    leaks.push({
      title: "Insufficient lighting on your face",
      explanation:
        "The frame is too dark for a clean read. Low light forces the camera to increase noise and reduce sharpness, making the whole image look unintentional.",
      fix: "Move to a brighter spot — near a large window during daytime is ideal. Avoid shooting in rooms with only a single dim bulb.",
      severity: metrics.lightingScore < 40 ? "high" : "medium",
      impactScore: Math.round((55 - metrics.lightingScore) * 1.5),
    });
  }

  if ((metrics.faceRegionBrightness ?? metrics.centerBrightness ?? 128) < 90 && metrics.lightingDirection !== "backlit") {
    leaks.push({
      title: "Face is underexposed",
      explanation:
        "Your face — the most important part of any profile photo — is darker than it should be. People subconsciously read dark faces as less approachable.",
      fix: "Tap your face on the phone screen before shooting to lock exposure on your face. Or move closer to the light source so more light falls directly on you.",
      severity: "high",
      impactScore: 30,
    });
  }

  if (metrics.backgroundClutterZone === "full") {
    leaks.push({
      title: "Cluttered background pulling focus",
      explanation:
        "There are objects, textures, and edges competing for attention across the entire background. The viewer's eye bounces around instead of staying on you. This is the most common environment mistake — kitchens, messy rooms, and busy streets all do this.",
      fix: "Find a plain wall — white, muted colour, or exposed brick all work. Stand 3-4 feet in front of it so the background softly blurs. A clean bedsheet pinned to a wall works in a pinch.",
      severity: "high",
      impactScore: Math.round((metrics.backgroundComplexityEstimate - 60) * 1.5),
    });
  } else if (metrics.backgroundClutterZone === "top") {
    leaks.push({
      title: "Visual clutter above your head",
      explanation:
        "The area above you has distracting elements — shelves, wires, ceiling fixtures, or doorframes. In a head-and-shoulders crop, the top third of the frame is prime real estate and clutter there competes directly with your face.",
      fix: "Angle the camera slightly downward, or move so the space above your head is a clean wall or sky. Cropping tighter can also eliminate upper-frame distractions.",
      severity: "medium",
      impactScore: 22,
    });
  } else if (metrics.backgroundClutterZone === "bottom") {
    leaks.push({
      title: "Distracting elements in the lower frame",
      explanation:
        "The bottom of the image has visual noise — a messy desk, scattered items, or patterned flooring that pulls the eye downward.",
      fix: "Crop to a tighter head-and-shoulders frame, or clear the surface in front of you before shooting.",
      severity: "medium",
      impactScore: 18,
    });
  } else if (metrics.backgroundClutterZone === "sides") {
    leaks.push({
      title: "Distractions on the edges of the frame",
      explanation:
        "Objects on one or both sides of the frame create visual weight that unbalances the composition. The eye drifts sideways instead of staying centred on you.",
      fix: "Step sideways so you are centred against a cleaner section of the background. Or crop the image tighter to exclude the side clutter.",
      severity: "medium",
      impactScore: 18,
    });
  } else if (metrics.backgroundComplexityEstimate > 70) {
    leaks.push({
      title: "Busy background",
      explanation:
        "The background has enough visual activity to split the viewer's attention between you and the surroundings.",
      fix: "Use a cleaner wall, increase your distance from background objects, or shoot with portrait mode to blur the background.",
      severity: metrics.backgroundComplexityEstimate > 80 ? "high" : "medium",
      impactScore: Math.round((metrics.backgroundComplexityEstimate - 70) * 1.2),
    });
  }

  if (metrics.sharpness < 45) {
    leaks.push({
      title: "Image is noticeably blurry",
      explanation:
        "The photo lacks sharpness — this usually means camera shake, a dirty lens, or the autofocus locked onto the background instead of you. Blurry photos read as low-effort regardless of everything else.",
      fix: "Wipe the camera lens with a soft cloth (front camera lenses collect finger oil constantly). Stabilise the phone against a surface or use a tripod. In low light, prop the phone on a stack of books rather than hand-holding.",
      severity: "high",
      impactScore: Math.round((55 - metrics.sharpness) * 1.8),
    });
  } else if (metrics.sharpness < 55) {
    leaks.push({
      title: "Image could be sharper",
      explanation:
        "Details are slightly soft. It is not distractingly blurry, but it does not look crisp the way a well-lit, stable shot would.",
      fix: "Clean the lens, ensure good light (sharpness drops dramatically in dim rooms), and tap the screen to focus on your face before shooting.",
      severity: "medium",
      impactScore: Math.round((55 - metrics.sharpness) * 1.2),
    });
  }

  if (metrics.contrast < 30) {
    leaks.push({
      title: "Flat, washed-out look",
      explanation:
        "The image has very little contrast — the darks are not dark and the lights are not light. This makes everything look grey and lifeless, like a foggy window.",
      fix: "Shoot in directional light (a window to one side creates natural contrast). If editing, push the contrast slider up slightly — even +10 to +15 helps.",
      severity: "medium",
      impactScore: 22,
    });
  }

  if (metrics.saturation < 25) {
    leaks.push({
      title: "Colours look drained",
      explanation:
        "The image has almost no colour energy. Desaturated photos feel cold and clinical rather than warm and inviting.",
      fix: "Ensure your light source has a warm colour temperature (sunlight or warm-white LEDs, not cool fluorescent). Wearing one piece with a pop of colour also helps.",
      severity: "low",
      impactScore: 15,
    });
  }

  if (metrics.warmth !== undefined && metrics.warmth < 30) {
    leaks.push({
      title: "Cool, clinical colour cast",
      explanation:
        "The image has a blue/cool tone that makes skin look pale and unapproachable. Cool tones work for product photography but not for people.",
      fix: "Shoot in warmer light — golden hour sunlight or warm-white indoor bulbs. Avoid fluorescent and cool-white LED panels. A slight warmth boost in editing also helps.",
      severity: "low",
      impactScore: 12,
    });
  } else if (metrics.warmth !== undefined && metrics.warmth > 75) {
    leaks.push({
      title: "Overly warm / orange colour cast",
      explanation:
        "The image has a strong yellow-orange tint, often from incandescent bulbs or heavy warm filters. It can make skin look unnatural.",
      fix: "Set your phone's white balance to auto, or shoot in mixed/natural light rather than under a single warm bulb. Reduce warmth slightly in editing.",
      severity: "low",
      impactScore: 12,
    });
  }

  if (metrics.compositionScore < 55) {
    leaks.push({
      title: "Awkward framing",
      explanation:
        "The crop or aspect ratio does not suit a profile photo. Either too much dead space, or the subject feels cramped.",
      fix: "Shoot in portrait orientation (vertical). Leave a palm's width of space above your head. Centre yourself in the frame or use the rule of thirds — place your eyes on the upper third line.",
      severity: metrics.compositionScore < 40 ? "high" : "medium",
      impactScore: Math.round((55 - metrics.compositionScore) * 1.3),
    });
  }

  return leaks.sort((a, b) => b.impactScore - a.impactScore);
}

export function generateQuickFixes(metrics: ImageMetrics): string[] {
  const fixes: string[] = [];

  if (metrics.lightingDirection === "overhead") {
    fixes.push("Face a window or hold a light at eye level — get out from under that ceiling light");
  } else if (metrics.lightingDirection === "backlit") {
    fixes.push("Turn around so the light source is in front of you, not behind");
  } else if (metrics.lightingScore < 55) {
    fixes.push("Move to a brighter spot — stand near a large window during the day");
  }

  if (metrics.backgroundClutterZone && metrics.backgroundClutterZone !== "none") {
    fixes.push("Find a clean wall or step outside — remove the visual clutter behind you");
  } else if (metrics.backgroundComplexityEstimate > 70) {
    fixes.push("Simplify the background — move to a plain wall or increase distance from objects behind you");
  }

  if (metrics.sharpness < 50) {
    fixes.push("Wipe the camera lens and stabilise the phone — prop it on something solid");
  }

  if ((metrics.faceRegionBrightness ?? metrics.centerBrightness ?? 128) < 90) {
    fixes.push("Tap your face on the phone screen before shooting to brighten exposure on your face");
  }

  if (metrics.contrast < 30) {
    fixes.push("Add some directional light — a window to one side creates natural contrast");
  }

  if (fixes.length === 0) {
    fixes.push("Technically solid — now focus on expression, outfit, and location to level up further");
  }

  return fixes;
}
