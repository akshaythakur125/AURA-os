/**
 * The specific, personal "photo read" — the thing that makes the report feel
 * like a real expert looked at THIS photo, not a template with a score plugged
 * in. It translates the rich metrics we already compute (lighting direction,
 * face-vs-background exposure, framing offset, symmetry, undertone, per-region
 * reads, and — when a face scan is present — the genuine-smile cheek-raise,
 * gaze and head tilt) into precise findings with the actual numbers and the
 * exact fix.
 *
 * This is deliberately data-grounded: every line references something measured
 * on the person's own image, so two different people get genuinely different
 * reads.
 */

export interface PhotoMetricsLike {
  lightingScore?: number;
  faceBrightness?: number;
  backgroundBrightness?: number;
  skinBrightness?: number;
  lightingDirection?: "left" | "right" | "top" | "bottom" | "flat" | "mixed";
  sharpness?: number;
  clarityScore?: number;
  backgroundComplexityEstimate?: number;
  subjectBgContrast?: number;
  symmetryScore?: number;
  subjectCenterX?: number; // 0..1
  colorWarmth?: number; // 0..100 (>55 warm)
  imageDullness?: number;
  clothingRegion?: { dominantColor?: string; contrastWithSkin?: number };
  hairRegion?: { neatnessScore?: number };
  skinRegion?: { evenness?: number; toneConsistency?: number };
  undertone?: { undertone?: "warm" | "cool" | "neutral"; confidence?: number };
}

export interface FaceReadLike {
  expression?: { smile?: number; eyesOpen?: number; genuineSmile?: boolean; cheekRaise?: number };
  pose?: { rollDeg?: number; turned?: number };
  gaze?: { left?: number; right?: number; up?: number; down?: number };
}

export interface Finding {
  zone: "lighting" | "exposure" | "framing" | "expression" | "eyes" | "clarity" | "background" | "colour" | "grooming" | "skin";
  kind: "strength" | "fix";
  title: string;
  detail: string; // the specific, measured observation
  fix?: string; // the exact action (only for fixes)
  impact: number; // 0..100 — how much fixing this moves the needle
}

export interface PhotoRead {
  strengths: Finding[];
  fixes: Finding[]; // sorted, biggest impact first
  headline: string; // "The one thing to change first"
}

const opposite = (d: string) => (d === "left" ? "right" : d === "right" ? "left" : d === "top" ? "bottom" : "top");

export function generatePhotoRead(m: PhotoMetricsLike, face?: FaceReadLike): PhotoRead {
  const F: Finding[] = [];
  const add = (f: Finding) => F.push(f);

  // ── Exposure: face darker than background (the single most common killer) ──
  if (m.faceBrightness != null && m.backgroundBrightness != null) {
    const gap = m.backgroundBrightness - m.faceBrightness;
    if (gap > 22) {
      add({
        zone: "exposure", kind: "fix", impact: 92,
        title: "Your face is darker than the room behind you",
        detail: `The camera exposed for the background, leaving your face about ${Math.round((gap / 255) * 100)}% underlit — a stranger's eye goes to the bright wall, not you.`,
        fix: "Tap your face on the screen before shooting so the camera meters for it, and face the brightest light in the room.",
      });
    } else if (gap < -25) {
      add({ zone: "exposure", kind: "strength", impact: 0, title: "You're well-separated from your background", detail: "Your face is brighter than what's behind you — exactly where a viewer's eye should land first." });
    }
  }

  // ── Lighting direction ──
  if (m.lightingDirection && m.lightingDirection !== "mixed") {
    if (m.lightingDirection === "flat") {
      add({
        zone: "lighting", kind: "fix", impact: 58,
        title: "Your lighting is flat",
        detail: "The light is hitting you head-on, so there's no shadow to shape your face — it reads a little two-dimensional.",
        fix: "Turn ~30° so a window is off to one side. That soft side-shadow adds depth and jawline.",
      });
    } else if ((m.lightingScore ?? 60) < 58) {
      add({
        zone: "lighting", kind: "fix", impact: 66,
        title: `The light's coming from your ${m.lightingDirection}`,
        detail: `One side of your face is lit and your ${opposite(m.lightingDirection)} side falls into shadow, which throws off the balance.`,
        fix: `Turn a little toward the light (your ${m.lightingDirection}) so it wraps across your whole face instead of half of it.`,
      });
    } else {
      add({ zone: "lighting", kind: "strength", impact: 0, title: "Flattering directional light", detail: `Soft light from your ${m.lightingDirection} is giving your face natural depth — keep shooting in this exact spot.` });
    }
  }

  // ── Clarity / sharpness ──
  if ((m.sharpness ?? 60) < 45 || (m.clarityScore ?? 60) < 45) {
    add({
      zone: "clarity", kind: "fix", impact: 74,
      title: "The shot reads soft",
      detail: "Fine detail (lash lines, hair strands, fabric texture) is blurring — usually a smudged lens or the front camera.",
      fix: "Wipe the lens, shoot on the rear camera, and tap your eyes to lock focus before the shot.",
    });
  } else if ((m.sharpness ?? 0) >= 68) {
    add({ zone: "clarity", kind: "strength", impact: 0, title: "Crisp and sharp", detail: "Detail is clean edge-to-edge — the photo looks intentional, not snapped in a hurry." });
  }

  // ── Framing / centering ──
  if (m.subjectCenterX != null) {
    const off = Math.round(Math.abs(m.subjectCenterX - 0.5) * 100);
    if (off > 14) {
      const side = m.subjectCenterX < 0.5 ? "left" : "right";
      add({
        zone: "framing", kind: "fix", impact: 40,
        title: `You're framed ${off}% to the ${side} of centre`,
        detail: "Off-centre framing here looks accidental rather than styled, and crops attention away from your face.",
        fix: "Recompose so your eyes sit on the upper-third line, face roughly centred — the most flattering, deliberate crop.",
      });
    }
  }

  // ── Background clutter ──
  if ((m.backgroundComplexityEstimate ?? 0) > 62) {
    add({
      zone: "background", kind: "fix", impact: 55,
      title: "Your background is competing with you",
      detail: `There's a lot going on behind you — it's pulling roughly ${Math.round((m.backgroundComplexityEstimate ?? 0) / 2)}% of the attention that should be on your face.`,
      fix: "Step 1–2 metres from the wall (throws the background soft), or find a plainer one.",
    });
  } else if ((m.backgroundComplexityEstimate ?? 100) < 35) {
    add({ zone: "background", kind: "strength", impact: 0, title: "Clean, controlled background", detail: "Nothing behind you is fighting for attention — it lets you be the whole photo." });
  }

  // ── Expression (needs the face scan) ──
  if (face?.expression) {
    const e = face.expression;
    if (e.smile != null && e.smile >= 25) {
      if (e.genuineSmile) {
        add({ zone: "expression", kind: "strength", impact: 0, title: "Your smile is genuine", detail: "The cheek-raise that only shows on a real smile is there — that's the hardest thing to fake and the most magnetic thing in a photo." });
      } else {
        add({
          zone: "expression", kind: "fix", impact: 70,
          title: "Your smile reads a touch posed",
          detail: "You're smiling with your mouth but the eye/cheek lift of a genuine smile is missing, so it looks slightly held.",
          fix: "Right before the shot, think of something actually funny — or exhale and smile on the way back in. The eyes are what sell it.",
        });
      }
    } else if (e.smile != null && e.smile < 12) {
      add({
        zone: "expression", kind: "fix", impact: 60,
        title: "You read a little serious",
        detail: "There's almost no smile signal — which can come across as guarded to a stranger deciding in half a second.",
        fix: "A soft, closed-mouth smile is enough — it instantly reads warmer and more approachable.",
      });
    }
    if (e.eyesOpen != null && e.eyesOpen < 55) {
      add({ zone: "eyes", kind: "fix", impact: 50, title: "Your eyes look half-closed", detail: "Caught mid-blink or squinting — it dulls the engagement that eye contact creates.", fix: "Take a burst and pick the frame where your eyes are fully open and on the lens." });
    }
  }

  // ── Gaze ──
  if (face?.gaze) {
    const g = face.gaze;
    const drift = Math.max(g.left ?? 0, g.right ?? 0);
    if (drift > 45) {
      const dir = (g.left ?? 0) > (g.right ?? 0) ? "your left" : "your right";
      add({ zone: "eyes", kind: "fix", impact: 45, title: "Your eyes drift off-camera", detail: `Your gaze is angled toward ${dir} rather than into the lens, which breaks the eye contact that builds trust.`, fix: "Look just above the lens — it reads as direct, confident eye contact." });
    }
  }

  // ── Head tilt ──
  if (face?.pose?.rollDeg != null && Math.abs(face.pose.rollDeg) >= 9) {
    add({ zone: "framing", kind: "fix", impact: 35, title: `Your head is tilted ~${Math.abs(Math.round(face.pose.rollDeg))}°`, detail: "A slight tilt can read as unsure or casual when you want put-together.", fix: "Level your head and square your shoulders for a more confident, intentional read." });
  }

  // ── Skin ──
  if (m.skinRegion?.evenness != null && m.skinRegion.evenness < 45) {
    add({ zone: "skin", kind: "fix", impact: 38, title: "Uneven skin tone showing", detail: "Patchiness or shine is reading on camera — mostly a lighting-and-moisture issue, not a skin one.", fix: "Softer, more even light hides most of it; a matte moisturiser handles the rest." });
  }

  // ── Hair grooming ──
  if (m.hairRegion?.neatnessScore != null && m.hairRegion.neatnessScore < 45) {
    add({ zone: "grooming", kind: "fix", impact: 42, title: "Hair reads a little unkempt", detail: "Flyaways or a lack of shape are softening an otherwise strong frame.", fix: "A small amount of matte product to define the shape lifts the whole photo." });
  }

  // ── Colour vs undertone ──
  if (m.undertone?.undertone && (m.undertone.confidence ?? 0) >= 45 && m.clothingRegion?.contrastWithSkin != null) {
    if (m.clothingRegion.contrastWithSkin < 25) {
      add({ zone: "colour", kind: "fix", impact: 33, title: "Your top blends into your skin", detail: `There's little contrast between what you're wearing and your ${m.undertone.undertone} complexion, so you flatten out.`, fix: `Wear a colour from your ${m.undertone.undertone}-undertone palette with a bit more separation near your face.` });
    }
  }

  const strengths = F.filter((f) => f.kind === "strength");
  const fixes = F.filter((f) => f.kind === "fix").sort((a, b) => b.impact - a.impact);
  const headline = fixes[0]
    ? `Fix this first: ${fixes[0].title.toLowerCase()}.`
    : "This photo is genuinely working — your fundamentals are dialled in.";

  return { strengths, fixes, headline };
}
