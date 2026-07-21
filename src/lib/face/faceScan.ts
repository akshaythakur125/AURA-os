/**
 * In-browser face scanning — privacy-first.
 *
 * Loads a MediaPipe Face Landmarker (468 landmarks + blendshapes) entirely in
 * the browser from self-hosted WASM + model. The photo never leaves the device;
 * only the model downloads (once, lazily, when the user asks for a scan).
 *
 * From the landmarks we derive face geometry (forehead / cheekbone / jaw widths
 * and face length) to classify face shape, and expose blendshapes + region
 * anchors that the grooming layer uses for more precise, personal tips.
 */

import type { FaceLandmarker as FaceLandmarkerType } from "@mediapipe/tasks-vision";

export type FaceShape = "oval" | "round" | "square" | "oblong" | "heart" | "diamond";

export interface FaceScanResult {
  shape: FaceShape;
  confidence: number; // 0-1, how clearly the geometry separates
  ratios: {
    lengthToWidth: number;
    jawToCheek: number;
    foreheadToCheek: number;
    foreheadToJaw: number;
  };
  /** Selected blendshape scores (0-1), e.g. smile, eye openness — for tips. */
  blendshapes: Record<string, number>;
  /** Normalized landmark anchors used by the grooming layer. */
  anchors: {
    // normalized [0,1] points on the image
    chin: [number, number];
    forehead: [number, number];
    leftCheek: [number, number];
    rightCheek: [number, number];
    noseTip: [number, number];
  };
}

let _landmarker: FaceLandmarkerType | null = null;
let _loading: Promise<FaceLandmarkerType> | null = null;

async function getLandmarker(): Promise<FaceLandmarkerType> {
  if (_landmarker) return _landmarker;
  if (_loading) return _loading;
  _loading = (async () => {
    const vision = await import("@mediapipe/tasks-vision");
    const fileset = await vision.FilesetResolver.forVisionTasks("/mediapipe/wasm");
    const lm = await vision.FaceLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: "/mediapipe/face_landmarker.task",
        // CPU (WASM/XNNPACK) delegate runs reliably on every device, including
        // browsers with flaky GPU support.
        delegate: "CPU",
      },
      outputFaceBlendshapes: true,
      runningMode: "IMAGE",
      numFaces: 1,
    });
    _landmarker = lm;
    return lm;
  })();
  return _loading;
}

// MediaPipe FaceMesh landmark indices for the geometry we measure.
const IDX = {
  topForehead: 10,
  chin: 152,
  leftCheek: 234,
  rightCheek: 454,
  leftJaw: 172,
  rightJaw: 397,
  leftForehead: 54,
  rightForehead: 284,
  noseTip: 1,
};

type Pt = { x: number; y: number; z?: number };

function dist(a: Pt, b: Pt, w: number, h: number): number {
  const dx = (a.x - b.x) * w;
  const dy = (a.y - b.y) * h;
  return Math.sqrt(dx * dx + dy * dy);
}

function classify(ratios: FaceScanResult["ratios"]): { shape: FaceShape; confidence: number } {
  // The reference "width" is the widest face-contour span (cheek landmarks),
  // which is always the widest point — so we classify by LENGTH-to-width and the
  // forehead↔jaw relationship rather than by cheekbone prominence. Diamond isn't
  // auto-detected (unreliable from one 2D photo); it stays available manually.
  const { lengthToWidth: LW, jawToCheek: JC, foreheadToJaw: FJ } = ratios;

  // 1. Clearly longer than wide → oblong.
  if (LW >= 1.5) return { shape: "oblong", confidence: clamp01((LW - 1.5) / 0.35 + 0.55) };
  // 2. Short and wide → round vs square by jaw strength.
  if (LW <= 1.18) {
    if (JC >= 0.82) return { shape: "square", confidence: clamp01((JC - 0.82) / 0.12 + 0.5) };
    return { shape: "round", confidence: clamp01((1.18 - LW) / 0.14 + 0.45) };
  }
  // 3. Medium length, forehead clearly wider than a tapering jaw → heart.
  if (FJ >= 1.08) return { shape: "heart", confidence: clamp01((FJ - 1.08) / 0.14 + 0.45) };
  // 4. Balanced proportions → oval (the most common, most versatile shape).
  return { shape: "oval", confidence: clamp01(0.55 + (0.18 - Math.abs(LW - 1.35)) * 0.6) };
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/** Scan a loaded image element. Returns null if no face is found. */
export async function scanFace(img: HTMLImageElement): Promise<FaceScanResult | null> {
  const lm = await getLandmarker();
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const res = lm.detect(img);
  const face = res.faceLandmarks?.[0];
  if (!face || face.length < 400) return null;

  const P = (i: number) => face[i] as Pt;
  const faceLength = dist(P(IDX.topForehead), P(IDX.chin), w, h);
  const cheekWidth = dist(P(IDX.leftCheek), P(IDX.rightCheek), w, h);
  const jawWidth = dist(P(IDX.leftJaw), P(IDX.rightJaw), w, h);
  const foreheadWidth = dist(P(IDX.leftForehead), P(IDX.rightForehead), w, h);
  if (cheekWidth <= 0 || jawWidth <= 0) return null;

  const ratios = {
    lengthToWidth: faceLength / cheekWidth,
    jawToCheek: jawWidth / cheekWidth,
    foreheadToCheek: foreheadWidth / cheekWidth,
    foreheadToJaw: foreheadWidth / jawWidth,
  };
  const { shape, confidence } = classify(ratios);

  const blendshapes: Record<string, number> = {};
  const cats = res.faceBlendshapes?.[0]?.categories || [];
  for (const c of cats) {
    if (c.categoryName) blendshapes[c.categoryName] = c.score;
  }

  const anchor = (i: number): [number, number] => [P(i).x, P(i).y];
  return {
    shape,
    confidence,
    ratios,
    blendshapes,
    anchors: {
      chin: anchor(IDX.chin),
      forehead: anchor(IDX.topForehead),
      leftCheek: anchor(IDX.leftCheek),
      rightCheek: anchor(IDX.rightCheek),
      noseTip: anchor(IDX.noseTip),
    },
  };
}

/** Load a data URL into an <img> for scanning. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
