/**
 * Trained accessory detector (on-device, TF.js).
 *
 * Replaces the old edge-density guesses ("lots of edges near the eyes =>
 * glasses"), which were unreliable. This is a MobileNetV3-Small multi-label
 * model trained on CelebA attributes — see ml/accessory-classifier/RESULTS.md.
 *
 * We ONLY expose labels that cleared a precision bar of 0.85 in the threshold
 * sweep, at their own tuned threshold. Missing an accessory is harmless;
 * claiming a wrong one is not — so these are precision-first.
 *
 *   Eyeglasses  t=0.40  P=0.86 R=0.81
 *   Hat         t=0.30  P=0.91 R=0.94
 *   Necktie     t=0.60  P=0.86 R=0.82
 *
 * Deliberately NOT exposed (failed the bar): earrings (P≤0.67), necklace
 * (P≤0.42), bags-under-eyes (P≤0.59 — our geometric measure is better).
 */

// Model output order must match LABELS in ml/accessory-classifier/train_accessories.py
const OUT = ["Eyeglasses", "Wearing_Earrings", "Wearing_Hat", "Wearing_Necklace", "Wearing_Necktie", "Bags_Under_Eyes"] as const;

const SHIP: Record<string, { idx: number; threshold: number }> = {
  glasses: { idx: 0, threshold: 0.40 },
  hat: { idx: 2, threshold: 0.30 },
  necktie: { idx: 4, threshold: 0.60 },
};

export interface AccessoryResult {
  glasses: boolean;
  hat: boolean;
  necktie: boolean;
  /** Raw probabilities for the shipped labels (for debugging/telemetry). */
  scores: { glasses: number; hat: number; necktie: number };
}

type GraphModel = { predict: (t: unknown) => unknown; dispose?: () => void };

let _model: GraphModel | null = null;
let _loading: Promise<GraphModel | null> | null = null;

async function getModel(): Promise<GraphModel | null> {
  if (_model) return _model;
  if (_loading) return _loading;
  _loading = (async () => {
    try {
      const tf = await import("@tensorflow/tfjs");
      await tf.ready();
      const m = (await tf.loadGraphModel("/models/accessories/model.json")) as unknown as GraphModel;
      _model = m;
      return m;
    } catch {
      return null;
    }
  })();
  return _loading;
}

/**
 * Run the detector on a face-ish crop of the image.
 *
 * `box` is the normalized MediaPipe face box; we expand it (more above for
 * hats, more below for neckties) to roughly match the CelebA framing the model
 * was trained on. Returns null if the model is unavailable — callers must
 * degrade gracefully.
 */
export async function detectAccessories(
  img: HTMLImageElement | HTMLCanvasElement,
  box?: { x0: number; y0: number; x1: number; y1: number }
): Promise<AccessoryResult | null> {
  // A face box is REQUIRED. The model is trained on tight CelebA face crops; on
  // a full scene the face is a fraction of the frame and predictions degrade
  // badly (measured: a real pair of glasses missed at 0.30 and a phantom hat at
  // 0.88 — both corrected to 0.84 / 0.02 once the crop was applied). Returning
  // null here is the honest answer: we simply don't report accessories.
  if (!box) return null;
  try {
    const model = await Promise.race([
      getModel(),
      new Promise<null>((r) => setTimeout(() => r(null), 8000)),
    ]);
    if (!model) return null;

    const tf = await import("@tensorflow/tfjs");
    const iw = "naturalWidth" in img ? img.naturalWidth || img.width : img.width;
    const ih = "naturalHeight" in img ? img.naturalHeight || img.height : img.height;

    // Crop rect in pixels — expand the face box to include hat + collar area.
    let sx = 0, sy = 0, sw = iw, sh = ih;
    if (box) {
      const bw = (box.x1 - box.x0) * iw;
      const bh = (box.y1 - box.y0) * ih;
      sx = Math.max(0, box.x0 * iw - bw * 0.45);
      sy = Math.max(0, box.y0 * ih - bh * 0.75); // headroom for hats
      const ex = Math.min(iw, box.x1 * iw + bw * 0.45);
      const ey = Math.min(ih, box.y1 * ih + bh * 0.85); // neck/collar for ties
      sw = Math.max(8, ex - sx);
      sh = Math.max(8, ey - sy);
    }

    const c = document.createElement("canvas");
    c.width = 128; c.height = 128;
    const cx = c.getContext("2d");
    if (!cx) return null;
    cx.drawImage(img as CanvasImageSource, sx, sy, sw, sh, 0, 0, 128, 128);

    // MobileNetV3 was built with include_preprocessing=True → feed raw 0-255.
    const probs = tf.tidy(() => {
      const t = tf.browser.fromPixels(c).toFloat().expandDims(0);
      const out = model.predict(t) as { dataSync: () => Float32Array };
      return Array.from(out.dataSync());
    });
    if (!probs || probs.length < OUT.length) return null;

    const g = probs[SHIP.glasses.idx] ?? 0;
    const h = probs[SHIP.hat.idx] ?? 0;
    const n = probs[SHIP.necktie.idx] ?? 0;
    return {
      glasses: g >= SHIP.glasses.threshold,
      hat: h >= SHIP.hat.threshold,
      necktie: n >= SHIP.necktie.threshold,
      scores: { glasses: +g.toFixed(3), hat: +h.toFixed(3), necktie: +n.toFixed(3) },
    };
  } catch {
    return null;
  }
}
