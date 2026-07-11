// ponytail: TF.js face landmarks — dynamic import, loaded only when needed



export type FaceLandmark = {
  x: number;
  y: number;
  z?: number;
};

export type FaceDetection = {
  bbox: { x: number; y: number; width: number; height: number };
  landmarks: FaceLandmark[];
  mesh: FaceLandmark[][];
  eyeDirection: { left: FaceLandmark; right: FaceLandmark; nose: FaceLandmark };
  confidence: number;
  headPose: { yaw: number; pitch: number; roll: number };
};

let model: Awaited<ReturnType<typeof import("@tensorflow-models/face-landmarks-detection").createDetector>> | null = null;

async function getModel() {
  if (model) return model;
  const tf = await import("@tensorflow/tfjs");
  await tf.setBackend("webgl");
  await tf.ready();
  const faceLandmarksDetection = await import("@tensorflow-models/face-landmarks-detection");
  model = await faceLandmarksDetection.createDetector(
    faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
    {
      runtime: "tfjs",
      refineLandmarks: true,
      maxFaces: 1,
    }
  );
  return model;
}

/** Detect face landmarks in an image element */
export async function detectFaceLandmarks(
  img: HTMLImageElement
): Promise<FaceDetection | null> {
  try {
    const detector = await getModel();
    const predictions = await detector.estimateFaces(img, { flipHorizontal: false });
    if (!predictions.length) return null;

    const pred = predictions[0];
    const bbox = pred.box;
    const keypoints = pred.keypoints;

    // MediaPipe FaceMesh 478 landmarks
    // Key indices: left eye outer=33, right eye outer=262, nose tip=1, chin=152, left mouth=61, right mouth=291
    const leftEye = keypoints[33];
    const rightEye = keypoints[262];
    const nose = keypoints[1];
    const chin = keypoints[152];

    // Head pose estimation from key landmarks
    const dx = rightEye.x - leftEye.x;
    const dy = rightEye.y - leftEye.y;
    const roll = Math.atan2(dy, dx) * (180 / Math.PI);

    // Simplified yaw from nose position relative to eye midpoint
    const eyeMidX = (leftEye.x + rightEye.x) / 2;
    const noseOffsetX = nose.x - eyeMidX;
    const yaw = Math.atan2(noseOffsetX, dx * 0.5) * (180 / Math.PI);

    // Pitch from chin-to-nose vs eye-to-nose ratio
    const noseEyeDist = Math.abs(nose.y - (leftEye.y + rightEye.y) / 2);
    const noseChinDist = Math.abs(chin.y - nose.y);
    const pitch = Math.atan2(noseChinDist - noseEyeDist, noseEyeDist) * (180 / Math.PI);

    return {
      bbox: { x: bbox.xMin, y: bbox.yMin, width: bbox.width, height: bbox.height },
      landmarks: keypoints.map((kp) => ({ x: kp.x, y: kp.y, z: kp.z })),
      mesh: [keypoints.map((kp) => ({ x: kp.x, y: kp.y, z: kp.z }))],
      eyeDirection: {
        left: { x: leftEye.x, y: leftEye.y },
        right: { x: rightEye.x, y: rightEye.y },
        nose: { x: nose.x, y: nose.y },
      },
      confidence: pred.keypoints.length >= 460 ? 0.9 : 0.7,
      headPose: { yaw, pitch, roll },
    };
  } catch {
    return null;
  }
}

/** Dispose model to free memory */
export function disposeFaceModel() {
  if (model) {
    model.dispose();
    model = null;
  }
}
