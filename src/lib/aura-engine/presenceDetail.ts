/**
 * "How you're showing up" — a professional-grade read of expression and
 * posture, built ONLY from measured signals: MediaPipe's *trained* blendshapes
 * (smile, brow, lips, jaw, cheek raise, eye engagement, gaze) and landmark
 * geometry (head tilt/turn) plus the measured face-box framing. Every line
 * cites the number it came from, so this reads like a coach who actually looked
 * at your photo — not generic advice.
 */

export interface PresenceDetail {
  /** 0–100 smile strength. */
  smile: number;
  /** True when the eyes are engaged too (Duchenne-style), not just the mouth. */
  genuineSmile: boolean;
  /** 0–100 how open the eyes are. */
  eyesOpen: number;
  /** True when the gaze reads as directed at the camera. */
  eyeContact: boolean;
  /** 0–100 furrowed-brow tension. */
  browTension: number;
  /** 0–100 pressed/stretched lip tension. */
  lipTension: number;
  /** 0–100 jaw openness (very low + lip tension = clenched). */
  jawOpen: number;
  /** 0–100 cheek raise — the true marker of a genuine smile. */
  cheekRaise: number;
  /** Head tilt in degrees (0 = level). */
  tiltDeg: number;
  /** Head turn away from camera, roughly -1..1 (0 = straight on). */
  turned: number;
  /** One-line framing note from the measured face box, or null. */
  framingNote: string | null;
  /** Shoulder-line tilt in degrees from the body-pose model, or null when
   *  shoulders weren't clearly visible. */
  shoulderTiltDeg: number | null;
  /** One-line shoulder/torso posture note, or null. */
  shoulderNote: string | null;
  /** 0–100 hair neatness (higher = neater), null when unavailable. */
  hairNeatness: number | null;
  /** Detected accessories (trained model, precision-first). */
  accessories: { glasses: boolean; hat: boolean; necktie: boolean } | null;
  /** Positive things worth keeping. */
  strengths: string[];
  /** Specific, actionable coaching. */
  coaching: string[];
  /** The single highest-impact presence fix. */
  topFix: string;
}

interface Framing {
  centerX: number;
  centerY: number;
  faceHeight: number;
  headroom: number;
}

export function analyzePresence(
  read: {
    expression: {
      smile: number; eyesOpen: number; genuineSmile: boolean;
      browTension: number; innerBrowRaise: number; lipTension: number;
      jawOpen: number; cheekRaise: number; negative: number;
    };
    pose: { rollDeg: number; turned: number };
    gaze: { lookIn: number; lookOut: number; lookUp: number; lookDown: number; atCamera: boolean };
  },
  hairNeatness?: number | null,
  accessories?: { glasses: boolean; hat: boolean; necktie: boolean } | null,
  framing?: Framing | null,
  shoulders?: { shoulderTiltDeg: number; headOffset: number } | null
): PresenceDetail {
  const e = read.expression;
  const { smile, eyesOpen, genuineSmile, browTension, innerBrowRaise, lipTension, jawOpen, cheekRaise, negative } = e;
  const tiltDeg = read.pose.rollDeg;
  const turned = read.pose.turned;
  const absTilt = Math.abs(tiltDeg);
  const absTurn = Math.abs(turned);
  const eyeContact = read.gaze.atCamera;

  const strengths: string[] = [];
  const coaching: string[] = [];

  // ── Smile: mouth vs. genuine (Duchenne) ──
  if (genuineSmile || (smile >= 25 && cheekRaise >= 20)) {
    strengths.push(`Genuine smile — your cheeks lift and your eyes crease (Duchenne markers, cheek-raise ${cheekRaise}/100). That's the real signal of warmth, not just a mouth-smile.`);
  } else if (smile >= 30) {
    coaching.push(`You're smiling (${smile}/100) but it's mostly the mouth — the cheeks aren't lifting (${cheekRaise}/100). Think of something that genuinely makes you laugh; a smile that reaches the eyes photographs as warm, one that doesn't reads as posed.`);
  } else if (smile >= 12) {
    coaching.push(`Soft, near-neutral expression (${smile}/100). For dating and social profiles a slight, real smile reads noticeably more approachable — try a half-smile the instant before the shutter.`);
  } else {
    coaching.push("Flat expression — even a small, genuine smile lifts approachability a lot. Don't hold a smile; trigger a fresh one right as the photo is taken.");
  }

  // ── Brow tension ──
  if (browTension >= 25) {
    coaching.push(`Your brow is furrowed (tension ${browTension}/100) — consciously drop and relax your eyebrows. A furrow reads as stress, worry or squinting-into-light on camera; softening it instantly looks calmer and more open.`);
  } else if (innerBrowRaise >= 40) {
    coaching.push(`Your inner brows are raised (${innerBrowRaise}/100), which reads slightly worried or pleading. Let the forehead settle to neutral for a more grounded, confident look.`);
  } else if (browTension <= 10 && innerBrowRaise <= 20) {
    strengths.push("Forehead and brow are relaxed — no tension lines, which reads calm and confident.");
  }

  // ── Mouth / jaw tension ──
  if (jawOpen <= 6 && lipTension >= 25) {
    coaching.push(`Your jaw looks clenched and lips pressed (tension ${lipTension}/100). Exhale and let your jaw hang a hair before the shot — clenching carries tension into the whole expression and reads as guarded.`);
  } else if (lipTension >= 30) {
    coaching.push(`Your lips are pressed tight (${lipTension}/100). Part them very slightly and relax the corners; a soft mouth photographs as confident, a pressed one as tense.`);
  }

  // ── Residual negativity (sneer / downturn) ──
  if (negative >= 22 && smile < 25) {
    coaching.push(`A faint downturn/sneer is registering (${negative}/100) — reset your face fully to neutral, then build the expression fresh. Small negative micro-expressions read as unfriendly even when you don't feel it.`);
  }

  // ── Eyes open ──
  if (eyesOpen >= 75) strengths.push("Eyes are wide open and alert — no mid-blink softness.");
  else if (eyesOpen >= 55) coaching.push(`Eyes are a bit narrowed (${eyesOpen}/100) — shoot a burst and keep the frame where they're fully open.`);
  else coaching.push(`Your eyes read half-closed (${eyesOpen}/100) — reshoot; a caught-mid-blink frame is the most common photo-killer and an instant redo.`);

  // ── Eye contact / gaze direction ──
  if (eyeContact) strengths.push("You're looking straight down the lens — direct gaze builds trust and presence instantly.");
  else if (read.gaze.lookDown >= 32) coaching.push("Your gaze is angled downward — lift your eyes to the lens. Looking down reads as low confidence or disengagement.");
  else if (read.gaze.lookUp >= 32) coaching.push("You're looking up/away from the lens — bring your eyes level with the camera so you're meeting the viewer.");
  else coaching.push("Your eyes are drifting off to the side — locking onto the lens is the single easiest confidence upgrade in any portrait.");

  // ── Head posture: tilt + turn ──
  if (absTilt <= 4 && absTurn <= 0.12) {
    strengths.push("Head is square and level — clean, deliberate, professional framing.");
  } else {
    if (absTilt > 9) coaching.push(`Your head is tilted about ${Math.round(absTilt)}° — a small tilt reads friendly, but this much looks unposed; level it for LinkedIn or formal shots.`);
    else if (absTilt > 4) coaching.push(`Slight ${Math.round(absTilt)}° head tilt — fine for casual/dating, but square it up for professional photos.`);
    if (absTurn > 0.3) coaching.push("You're turned well off the camera — a slight angle is flattering, but this much hides half your face; bring your shoulders and chin back toward the lens.");
    else if (absTurn > 0.15) coaching.push("You're angled slightly off the lens — a touch of angle is good; just make sure both eyes stay clearly visible.");
  }

  // ── Framing / positioning (measured from the face box) ──
  let framingNote: string | null = null;
  if (framing) {
    const offX = Math.abs(framing.centerX - 0.5);
    if (framing.faceHeight > 0.82) framingNote = "You're very close to the lens — back up a step and zoom slightly; extreme closeness distorts features (the nose enlarges).";
    else if (framing.faceHeight < 0.17) framingNote = "You're far from the camera — move in or crop tighter so your face fills the frame; distant faces lose all detail at thumbnail size.";
    else if (framing.centerY > 0.62) framingNote = "You're sitting low in the frame — raise the camera to eye level and place your eyes on the upper third; low placement makes you look smaller.";
    else if (framing.headroom > 0.28) framingNote = "Too much empty headroom above you — crop closer; the space should be around your face, not over it.";
    else if (offX > 0.16) framingNote = `You're off-centre (${Math.round(framing.centerX * 100)}% across) — recentre, or commit to the rule-of-thirds deliberately rather than by accident.`;
    else framingNote = "Framing is well-judged — face fills the frame, eyes near the upper third, balanced left-to-right.";
    // Shown in its own dedicated card slot — not duplicated into the lists.
  }

  // ── Shoulder / torso posture (body-pose model; only when shoulders visible) ──
  let shoulderTiltDeg: number | null = null;
  let shoulderNote: string | null = null;
  if (shoulders) {
    shoulderTiltDeg = shoulders.shoulderTiltDeg;
    const absOffset = Math.abs(shoulders.headOffset);
    if (shoulders.shoulderTiltDeg >= 7) {
      shoulderNote = `Your shoulders aren't level (about ${shoulders.shoulderTiltDeg}° off) — square them and consciously drop the higher one. An uneven shoulder line reads as slouching or an off-balance stance.`;
    } else if (absOffset >= 0.28) {
      shoulderNote = "Your head is leaning off to one side of your shoulders — bring it back over your spine. A head centred over the torso reads grounded and confident; off-centre reads unsure.";
    } else {
      shoulderNote = `Shoulders are level (${shoulders.shoulderTiltDeg}° off) and your head sits centred over them — grounded, confident posture.`;
    }
    // Shown in its own dedicated card slot — not duplicated into the lists.
  }

  // ── Hair ──
  const hair = typeof hairNeatness === "number" ? Math.round(hairNeatness) : null;
  if (hair != null) {
    if (hair >= 70) strengths.push(`Hair reads neat and controlled (${hair}/100).`);
    else if (hair >= 50) coaching.push(`Hair is slightly messy in this shot (${hair}/100) — a quick tidy and a smoothing product sharpen it fast.`);
    else coaching.push(`Hair reads unkempt or frizzy here (${hair}/100) — one of the quickest visible wins before a reshoot.`);
  }

  // ── Accessories (only ever mentioned when the model is confident) ──
  const acc = accessories ?? null;
  if (acc) {
    if (acc.hat) coaching.push("You're wearing a hat — great for casual shots, but it shadows your eyes. For dating or LinkedIn, try one without it.");
    if (acc.glasses) strengths.push("Glasses are part of your look — keep them clean and angle slightly to avoid lens glare.");
    if (acc.necktie) strengths.push("Formal tie detected — this reads well for LinkedIn, interviews and placement photos.");
  }

  // ── Prioritised single fix (most impactful first) ──
  let topFix: string;
  if (eyesOpen < 55) topFix = "Reshoot with your eyes fully open — take a burst and pick the sharpest, widest-eyed frame.";
  else if (browTension >= 35 || (jawOpen <= 6 && lipTension >= 30)) topFix = "Relax your face before the shutter: drop your brow, unclench your jaw, exhale. Facial tension is the #1 thing hurting your expression here.";
  else if (!eyeContact) topFix = "Look straight down the lens — direct eye contact is the fastest confidence upgrade in any photo.";
  else if (!genuineSmile && smile < 30) topFix = "Give a real half-smile — trigger it (think of something funny) right as the photo is taken so it reaches your eyes.";
  else if (framing && (framing.faceHeight > 0.82 || framing.faceHeight < 0.17 || framing.centerY > 0.62)) topFix = framingNote || "Fix your framing — face at eye level, filling the frame, eyes on the upper third.";
  else if (hair != null && hair < 50) topFix = "Tidy your hair before the next shot — it's the most visible quick win here.";
  else if (absTilt > 9) topFix = "Level your head — a straight, square shot reads more deliberate and professional.";
  else if (shoulders && shoulders.shoulderTiltDeg >= 8) topFix = "Level your shoulders — square them and drop the higher one for a grounded, balanced posture.";
  else topFix = "Your expression and posture read well — keep the direct gaze, relaxed face and square framing.";

  return {
    smile, genuineSmile, eyesOpen, eyeContact,
    browTension, lipTension, jawOpen, cheekRaise,
    tiltDeg, turned, framingNote,
    shoulderTiltDeg, shoulderNote,
    hairNeatness: hair, accessories: acc,
    strengths, coaching, topFix,
  };
}
