#!/usr/bin/env node
/**
 * ponytail: fixture generation metadata — catalogs all transformations, generates manifest.
 * Run: node scripts/fixture-generate.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";

// Import transformation definitions (parse from source)
const src = readFileSync("tests/fixtures/analyser/syntheticTransformations.ts", "utf-8");

// Extract all transformation IDs and parameters via regex
const transforms = [];
const idRegex = /\{\s*id:\s*"([^"]+)"[^}]*type:\s*"([^"]+)"[^}]*parameters:\s*\{([^}]*)\}/g;
let match;
while ((match = idRegex.exec(src)) !== null) {
  const params = {};
  const paramStr = match[3];
  const paramRegex = /(\w+):\s*([^,\s}]+)/g;
  let pm;
  while ((pm = paramRegex.exec(paramStr)) !== null) {
    params[pm[1]] = isNaN(Number(pm[2])) ? pm[2] : Number(pm[2]);
  }
  transforms.push({
    id: match[1],
    type: match[2],
    parameters: params,
    sourceImageId: "source-1",
    generationVersion: "1.0.0",
  });
}

// Generate expected behaviour labels
const labels = transforms.map((t) => {
  const expected = { passQualityGate: true, rejectionReasons: [], blockedDimensions: [], allowedDimensions: ["all"] };

  // Label based on transformation type and severity
  if (t.type === "gaussian-blur" && (t.parameters.strength || 0) >= 12) {
    expected.passQualityGate = false;
    expected.rejectionReasons.push("severe_blur");
    expected.blockedDimensions = ["all"];
    expected.allowedDimensions = [];
  } else if (t.type === "underexposure" && (t.parameters.factor || 1) < 0.1) {
    expected.passQualityGate = false;
    expected.rejectionReasons.push("severe_underexposure");
    expected.blockedDimensions = ["all"];
    expected.allowedDimensions = [];
  } else if (t.type === "overexposure" && (t.parameters.factor || 1) > 2.5) {
    expected.passQualityGate = false;
    expected.rejectionReasons.push("severe_overexposure");
    expected.blockedDimensions = ["all"];
    expected.allowedDimensions = [];
  } else if (t.type === "downscale" && (t.parameters.scale || 1) < 0.1) {
    expected.passQualityGate = false;
    expected.rejectionReasons.push("resolution_too_low");
    expected.blockedDimensions = ["all"];
    expected.allowedDimensions = [];
  } else if (t.type === "crop" && (t.parameters.top || 0) < 0.1) {
    expected.passQualityGate = false;
    expected.rejectionReasons.push("face_cut_off");
    expected.blockedDimensions = ["expression", "grooming"];
    expected.allowedDimensions = ["lighting", "background"];
  }

  return { ...t, expected };
});

// Write manifest
mkdirSync("tests/fixtures/analyser/generated", { recursive: true });
const manifest = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  totalTransformations: labels.length,
  byType: {},
  transformations: labels,
};

for (const t of labels) {
  manifest.byType[t.type] = (manifest.byType[t.type] || 0) + 1;
}

writeFileSync("tests/fixtures/analyser/generated/manifest.json", JSON.stringify(manifest, null, 2));

console.log(`✅ Generated manifest: ${labels.length} transformations`);
console.log(`   Types: ${Object.entries(manifest.byType).map(([k, v]) => `${k}(${v})`).join(", ")}`);
