// ponytail: unified vision provider — combines face landmarks, segmentation, pose

import { detectFaceLandmarks, disposeFaceModel, type FaceDetection } from "./faceLandmarks";
import { segmentBody, disposeSegmentationModel, isForeground, type SegmentationResult } from "./bodySegmentation";
import { estimatePose, type PoseResult } from "./poseEstimation";

export type VisionAnalysis = {
  faceDetection: FaceDetection | null;
  segmentation: SegmentationResult;
  pose: PoseResult | null;
  processingTime: number;
};

/** Run all vision providers on an image. Dynamic — only loads TF.js when called. */
export async function analyzeImage(img: HTMLImageElement): Promise<VisionAnalysis> {
  const start = performance.now();

  // Run face detection and segmentation in parallel
  const [faceDetection, segmentation] = await Promise.all([
    detectFaceLandmarks(img).catch(() => null),
    segmentBody(img).catch(() => ({ foregroundMask: null, confidence: 0, width: img.naturalWidth, height: img.naturalHeight })),
  ]);

  // Derive pose from face detection
  const pose = faceDetection ? estimatePose(faceDetection, img.naturalWidth, img.naturalHeight) : null;

  return {
    faceDetection,
    segmentation,
    pose,
    processingTime: performance.now() - start,
  };
}

/** Dispose all models to free memory */
export function disposeAll() {
  disposeFaceModel();
  disposeSegmentationModel();
}

export type { FaceDetection, SegmentationResult, PoseResult, isForeground };
