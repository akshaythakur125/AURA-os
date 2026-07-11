// ponytail: TF.js body segmentation — dynamic import, loaded only when needed

export type SegmentationResult = {
  foregroundMask: ImageData | null;
  confidence: number;
  width: number;
  height: number;
};

let model: Awaited<ReturnType<typeof import("@tensorflow-models/body-segmentation").createSegmenter>> | null = null;

async function getModel() {
  if (model) return model;
  const tf = await import("@tensorflow/tfjs");
  await tf.setBackend("webgl");
  await tf.ready();
  const bodySegmentation = await import("@tensorflow-models/body-segmentation");
  model = await bodySegmentation.createSegmenter(
    bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation,
    { runtime: "tfjs" }
  );
  return model;
}

/** Segment foreground (person) from background */
export async function segmentBody(img: HTMLImageElement): Promise<SegmentationResult> {
  try {
    const detector = await getModel();
    const segmentations = await detector.segmentPeople(img, {
      flipHorizontal: false,
      multiSegmentation: false,
    });

    if (!segmentations.length || !segmentations[0].mask) {
      return { foregroundMask: null, confidence: 0, width: img.naturalWidth, height: img.naturalHeight };
    }

    const mask = await segmentations[0].mask.toCanvasImageSource();
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(mask as CanvasImageSource, 0, 0, canvas.width, canvas.height);
    const maskData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    return {
      foregroundMask: maskData,
      confidence: 0.8,
      width: canvas.width,
      height: canvas.height,
    };
  } catch {
    return { foregroundMask: null, confidence: 0, width: img.naturalWidth, height: img.naturalHeight };
  }
}

/** Check if a pixel at (x,y) is foreground based on mask */
export function isForeground(mask: ImageData | null, x: number, y: number): boolean {
  if (!mask) return false;
  const idx = (Math.round(y) * mask.width + Math.round(x)) * 4;
  return (mask.data[idx] ?? 0) > 128;
}

export function disposeSegmentationModel() {
  if (model) {
    model.dispose();
    model = null;
  }
}
