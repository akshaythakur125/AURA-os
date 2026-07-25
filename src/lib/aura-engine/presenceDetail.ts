/**
 * "How you're showing up" — expression, eye contact and head pose, plus a hair
 * neatness read.
 *
 * Expression and gaze come from MediaPipe's *trained* blendshapes (smile, eye
 * blink/squint, eyeLook*), so they're reliable — unlike guessing emotion from
 * raw pixels. Head tilt/turn is landmark geometry. Hair neatness is an edge
 * density read on the hair region, reported as a soft signal, not a verdict.
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
  /** Head tilt in degrees (0 = level). */
  tiltDeg: number;
  /** Head turn away from camera, roughly -1..1 (0 = straight on). */
  turned: number;
  /** 0–100 hair neatness (higher = neater), null when unavailable. */
  hairNeatness: number | null;
  /** Positive things worth keeping. */
  strengths: string[];
  /** Specific, actionable coaching. */
  coaching: string[];
  /** The single highest-impact presence fix. */
  topFix: string;
}

export function analyzePresence(
  read: {
    expression: { smile: number; eyesOpen: number; genuineSmile: boolean };
    pose: { rollDeg: number; turned: number };
    gaze: { lookIn: number; lookOut: number; lookUp: number; lookDown: number; atCamera: boolean };
  },
  hairNeatness?: number | null
): PresenceDetail {
  const { smile, eyesOpen, genuineSmile } = read.expression;
  const tiltDeg = read.pose.rollDeg;
  const turned = read.pose.turned;
  const absTilt = Math.abs(tiltDeg);
  const absTurn = Math.abs(turned);
  const eyeContact = read.gaze.atCamera;

  const strengths: string[] = [];
  const coaching: string[] = [];

  // ── Smile ──
  if (genuineSmile) strengths.push(`Genuine smile — your eyes are in on it, which is what actually reads as warm (${smile}/100).`);
  else if (smile >= 30) coaching.push(`You're smiling (${smile}/100) but it's mostly the mouth — think of something that actually makes you laugh and the eyes follow.`);
  else if (smile >= 12) coaching.push(`Soft, neutral expression (${smile}/100). A slight smile reads noticeably warmer on dating and social profiles.`);
  else coaching.push("Flat expression — even a small smile lifts approachability a lot. Try a half-smile just before the shutter.");

  // ── Eyes ──
  if (eyesOpen >= 75) strengths.push("Eyes wide open and alert — no mid-blink issues.");
  else if (eyesOpen >= 55) coaching.push(`Eyes are a bit narrowed (${eyesOpen}/100) — shoot a burst and pick the frame where they're fully open.`);
  else coaching.push(`Your eyes read half-closed (${eyesOpen}/100) — worth a reshoot; this is the most common photo killer.`);

  // ── Eye contact / gaze ──
  if (eyeContact) strengths.push("You're looking at the camera — direct gaze builds trust instantly.");
  else if (read.gaze.lookDown >= 32) coaching.push("Your gaze is angled downward — lift your eyes to the lens; looking down reads as low confidence.");
  else if (read.gaze.lookUp >= 32) coaching.push("You're looking up/away from the lens — bring your eyes level with the camera.");
  else coaching.push("Your eyes are off to the side — looking straight down the lens is the single easiest confidence upgrade.");

  // ── Head pose ──
  if (absTilt <= 4 && absTurn <= 0.12) strengths.push("Head is straight and level — clean, deliberate framing.");
  else {
    if (absTilt > 9) coaching.push(`Your head is tilted about ${Math.round(absTilt)}° — level it out unless the tilt is intentional.`);
    if (absTurn > 0.3) coaching.push("You're turned quite far from the camera — a slight angle is flattering, but this much hides your face.");
  }

  // ── Hair ──
  const hair = typeof hairNeatness === "number" ? Math.round(hairNeatness) : null;
  if (hair != null) {
    if (hair >= 70) strengths.push(`Hair reads neat and controlled (${hair}/100).`);
    else if (hair >= 50) coaching.push(`Hair is slightly messy in this shot (${hair}/100) — a quick tidy and a smoothing product sharpen it fast.`);
    else coaching.push(`Hair reads unkempt or frizzy here (${hair}/100) — this is one of the quickest visible wins.`);
  }

  // ── Prioritised single fix ──
  let topFix: string;
  if (eyesOpen < 55) topFix = "Reshoot with your eyes fully open — take a burst and pick the best frame.";
  else if (!eyeContact) topFix = "Look straight down the lens. Direct eye contact is the fastest confidence upgrade in any photo.";
  else if (!genuineSmile && smile < 30) topFix = "Give a real half-smile — think of something genuinely funny right before the shot.";
  else if (hair != null && hair < 50) topFix = "Tidy your hair before the next shot — it's the most visible quick win here.";
  else if (absTilt > 9) topFix = "Level your head — a straight, square shot reads more deliberate.";
  else topFix = "Your presence reads well — keep the direct gaze and natural smile.";

  return {
    smile, genuineSmile, eyesOpen, eyeContact,
    tiltDeg, turned, hairNeatness: hair,
    strengths, coaching, topFix,
  };
}
