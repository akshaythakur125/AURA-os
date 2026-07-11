// ponytail: shared dataset types

export type DatasetPurpose =
  | "image-quality"
  | "smartphone-quality"
  | "face-detection"
  | "landmarks"
  | "head-pose"
  | "segmentation"
  | "composition"
  | "screenshot-detection"
  | "custom-validation";

export type DatasetLicenceStatus =
  | "approved"
  | "research-only"
  | "commercial-review-required"
  | "redistribution-restricted"
  | "unknown"
  | "rejected";

export type NormalizedAnnotation = {
  imageId: string;
  datasetId: string;
  relativePath: string;
  width: number;
  height: number;
  split: "train" | "validation" | "test" | "unknown";
  quality?: {
    mos?: number;
    normalizedMos?: number;
    blur?: number | string;
    exposure?: number | string;
  };
  faces?: Array<{
    x: number; y: number; width: number; height: number;
    occlusion?: string; pose?: string; invalid?: boolean;
  }>;
  metadata: Record<string, string | number | boolean | null>;
};

export type BenchmarkGroup = {
  id: string;
  label: string;
  inclusionRules: string[];
  exclusionRules: string[];
  minSamples: number;
};
