// ponytail: pose estimation from face landmarks — derive head pose from face mesh

import type { FaceDetection } from "./faceLandmarks";

export type PoseResult = {
  headTilt: number; // roll in degrees
  headYaw: number; // left-right rotation
  headPitch: number; // up-down tilt
  eyeLineAngle: number; // angle of eye line relative to horizontal
  faceCenterX: number; // normalized 0-1
  faceCenterY: number; // normalized 0-1
  faceSizeRatio: number; // face area / image area (0-1)
  shoulderVisible: boolean;
  confidence: number;
};

/** Derive pose from face detection results */
export function estimatePose(
  detection: FaceDetection,
  imageWidth: number,
  imageHeight: number
): PoseResult {
  const { bbox, headPose, eyeDirection } = detection;

  // Eye line angle
  const dx = eyeDirection.right.x - eyeDirection.left.x;
  const dy = eyeDirection.right.y - eyeDirection.left.y;
  const eyeLineAngle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Face center normalized
  const faceCenterX = (bbox.x + bbox.width / 2) / imageWidth;
  const faceCenterY = (bbox.y + bbox.height / 2) / imageHeight;

  // Face size ratio
  const faceArea = bbox.width * bbox.height;
  const imageArea = imageWidth * imageHeight;
  const faceSizeRatio = faceArea / imageArea;

  // Shoulder visibility heuristic: if face is in upper 60% and not too high
  const shoulderVisible = faceCenterY > 0.25 && faceCenterY < 0.65 && faceSizeRatio > 0.02;

  return {
    headTilt: headPose.roll,
    headYaw: headPose.yaw,
    headPitch: headPose.pitch,
    eyeLineAngle,
    faceCenterX,
    faceCenterY,
    faceSizeRatio,
    shoulderVisible,
    confidence: detection.confidence,
  };
}
