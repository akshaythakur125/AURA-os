// Multi-face detection for Group mode. Uses its own MediaPipe FaceLandmarker
// (numFaces > 1) and scores each face on how well it READS in the photo —
// lighting, sharpness, prominence. Honest readability, not "attractiveness".

interface FLType {
  detect: (img: HTMLImageElement | HTMLCanvasElement) => { faceLandmarks?: Array<Array<{ x: number; y: number }>> };
}

let _lm: FLType | null = null;
let _loading: Promise<FLType> | null = null;

async function getGroupLandmarker(): Promise<FLType> {
  if (_lm) return _lm;
  if (_loading) return _loading;
  _loading = (async () => {
    const vision = await import("@mediapipe/tasks-vision");
    const fileset = await vision.FilesetResolver.forVisionTasks("/mediapipe/wasm");
    const lm = await vision.FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: "/mediapipe/face_landmarker.task", delegate: "CPU" },
      runningMode: "IMAGE",
      numFaces: 6,
    });
    _lm = lm as unknown as FLType;
    return _lm;
  })();
  return _loading;
}

export interface GroupFace {
  x0: number; y0: number; x1: number; y1: number; // normalized 0..1
  cx: number; // normalized centre x (for left→right ordering)
  score: number;
  lit: boolean;
  sharp: boolean;
}

/** Detect all faces (normalized boxes), time-boxed and graceful. */
export async function detectGroupBoxes(
  img: HTMLImageElement
): Promise<Array<{ x0: number; y0: number; x1: number; y1: number }> | null> {
  try {
    const lm = await Promise.race([
      getGroupLandmarker(),
      new Promise<null>((r) => setTimeout(() => r(null), 15000)),
    ]);
    if (!lm) return null;
    const res = lm.detect(img);
    const faces = res.faceLandmarks || [];
    return faces.map((f) => {
      let x0 = 1, x1 = 0, y0 = 1, y1 = 0;
      for (const p of f) { if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x; if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y; }
      const padX = (x1 - x0) * 0.12, padY = (y1 - y0) * 0.15;
      return { x0: Math.max(0, x0 - padX), y0: Math.max(0, y0 - padY), x1: Math.min(1, x1 + padX), y1: Math.min(1, y1 + padY) };
    }).filter((b) => b.x1 - b.x0 > 0.02 && b.y1 - b.y0 > 0.02);
  } catch {
    return null;
  }
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

/** Score one face box from the pixels: lighting + sharpness + prominence. */
export function scoreFaceBox(
  data: Uint8ClampedArray,
  W: number,
  H: number,
  b: { x0: number; y0: number; x1: number; y1: number }
): { score: number; lit: boolean; sharp: boolean } {
  const x0 = Math.floor(b.x0 * W), x1 = Math.ceil(b.x1 * W);
  const y0 = Math.floor(b.y0 * H), y1 = Math.ceil(b.y1 * H);
  let sum = 0, n = 0, grad = 0, gn = 0;
  for (let y = y0; y < y1; y += 2) {
    for (let x = x0; x < x1; x += 2) {
      const i = (y * W + x) * 4;
      const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      sum += lum; n++;
      if (x + 2 < x1) {
        const j = (y * W + (x + 2)) * 4;
        const lum2 = 0.2126 * data[j] + 0.7152 * data[j + 1] + 0.0722 * data[j + 2];
        grad += Math.abs(lum - lum2); gn++;
      }
    }
  }
  const bright = n ? sum / n : 128;
  const sharp = gn ? grad / gn : 0;
  const brightComp = clamp(100 - Math.abs(bright - 140) * 0.8);
  const sharpComp = clamp(sharp * 3.2);
  const areaFrac = ((x1 - x0) * (y1 - y0)) / (W * H);
  const sizeComp = clamp(areaFrac * 420);
  const score = Math.round(clamp(brightComp * 0.42 + sharpComp * 0.4 + sizeComp * 0.18));
  return { score, lit: brightComp >= 55, sharp: sharpComp >= 45 };
}
