// ponytail: analyser version constants — single source of truth
// Change these when the analyser changes. Old audits retain their versions.

export const ANALYSER_VERSION = "1.0.0-baseline";
export const SCHEMA_VERSION = "1.0.0";
export const PREPROCESSING_VERSION = "1.0.0";
export const MEASUREMENT_VERSION = "1.0.0";
export const QUALITY_GATE_VERSION = "1.0.0";
export const SCORING_VERSION = "1.0.0";
export const CONFIDENCE_VERSION = "1.0.0";
export const FINDING_VERSION = "1.0.0";
export const RECOMMENDATION_VERSION = "1.0.0";

/** All versions bundled for easy persistence */
export function getAllVersions() {
  return {
    analyserVersion: ANALYSER_VERSION,
    schemaVersion: SCHEMA_VERSION,
    preprocessingVersion: PREPROCESSING_VERSION,
    measurementVersion: MEASUREMENT_VERSION,
    qualityGateVersion: QUALITY_GATE_VERSION,
    scoringVersion: SCORING_VERSION,
    confidenceVersion: CONFIDENCE_VERSION,
    findingVersion: FINDING_VERSION,
    recommendationVersion: RECOMMENDATION_VERSION,
  };
}
