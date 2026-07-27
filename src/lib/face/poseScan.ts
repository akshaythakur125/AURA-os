/**
 * In-browser body-pose scan (shoulders only) — privacy-first, same as the face
 * model: the photo never leaves the device.
 *
 * Loads MediaPipe's PoseLandmarker and reads the shoulder line + head position
 * over the shoulders. It is deliberately GATED: it only returns a result when
 * both shoulders are clearly visible and actually in frame. On a tight face
 * crop (no shoulders) it returns null, so we never invent posture we can't see.
 */

import type { PoseLandmarker as PoseLandmarkerType } from "@mediapipe/tasks-vision";

export interface PoseRead {
  /** Shoulder-line tilt off level, in degrees (0 = level shoulders). */
  shoulderTiltDeg: number;
  /** Head horizontal offset over the shoulder midpoint, normalized by shoulder
   *  width (0 = head centred over the torso; ± = leaning to a side). */
  headOffset: number;
  /** 0–1 confidence the shoulders were clearly visible. */
  confidence: number;
}

let _pose: PoseLandmarkerType | null = null;
let _loading: Promise<PoseLandmarkerType | null> | null = null;

async function getPose(): Promise<PoseLandmarkerType | null> {
  if (_pose) return _pose;
  if (_loading) return _loading;
  _loading = (async () => {
    try {
      const vision = await import("@mediapipe/tasks-vision");
      const fileset = await vision.FilesetResolver.forVisionTasks("/mediapipe/wasm");
      const lm = await vision.PoseLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: "/mediapipe/pose_landmarker_lite.task",
          delegate: "CPU",
        },
        runningMode: "IMAGE",
        numPoses: 1,
      });
      _pose = lm;
      return lm;
    } catch {
      return null;
    }
  })();
  return _loading;
}

const L_SHOULDER = 11, R_SHOULDER = 12, NOSE = 0;

type LM = { x: number; y: number; z?: number; visibility?: number };

/** Scan a loaded image for shoulder posture. Null when shoulders aren't clearly visible. */
export async function scanPose(img: HTMLImageElement): Promise<PoseRead | null> {
  const lm = await getPose();
  if (!lm) return null;
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;

  let res: { landmarks?: LM[][] } | null = null;
  try {
    res = lm.detect(img) as unknown as { landmarks?: LM[][] };
  } catch {
    return null;
  }
  const pts = res?.landmarks?.[0];
  if (!pts || pts.length < 33) return null;

  const lS = pts[L_SHOULDER], rS = pts[R_SHOULDER], nose = pts[NOSE];
  if (!lS || !rS) return null;

  // Gate: both shoulders confidently visible AND wide enough to be really in
  // frame (not a sliver at the edge of a tight face crop).
  const vis = Math.min(lS.visibility ?? 0, rS.visibility ?? 0);
  const shoulderWidth = Math.abs(rS.x - lS.x);
  if (vis < 0.6 || shoulderWidth < 0.08) return null;

  // Shoulder tilt: deviation of the shoulder line from horizontal, in degrees.
  const dyPx = (rS.y - lS.y) * h;
  const dxPx = (rS.x - lS.x) * w;
  let angle = (Math.atan2(dyPx, dxPx) * 180) / Math.PI;
  if (angle > 90) angle -= 180;
  if (angle < -90) angle += 180;
  const shoulderTiltDeg = Math.abs(Math.round(angle));

  // Head over shoulders: nose vs shoulder midpoint, normalized by shoulder width.
  const midX = (lS.x + rS.x) / 2;
  const headOffset = Math.round(((nose.x - midX) / (shoulderWidth || 1e-4)) * 100) / 100;

  return { shoulderTiltDeg, headOffset, confidence: Math.round(vis * 100) / 100 };
}
