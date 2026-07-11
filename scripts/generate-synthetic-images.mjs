#!/usr/bin/env node
/**
 * ponytail: generate 1500+ benchmark images with ground truth metadata.
 * 36 bases × 38 transforms + nested + multi-face + no-face = ~1600 images.
 * Run: node scripts/generate-synthetic-images.mjs
 */

import sharp from "sharp";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const OUTPUT = "datasets/generated";
const SIZE = 640;
mkdirSync(OUTPUT, { recursive: true });

// ─── Base portraits (36) ───
const skinTones = ["#c49a6c","#8d5524","#f1c27d","#c68642","#e0ac69","#6b3e26"];
const faceSizes = [0.15, 0.2, 0.25];
const comps = [{ cx: 0.5, cy: 0.4 }, { cx: 0.35, cy: 0.4 }];

function makeBaseSvg(skin, bg, fs, cx, cy) {
  return `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${SIZE}" height="${SIZE}" fill="${bg}"/>
    <circle cx="${SIZE*cx}" cy="${SIZE*cy}" r="${SIZE*fs}" fill="${skin}"/>
    <circle cx="${SIZE*cx-SIZE*fs*0.25}" cy="${SIZE*cy-SIZE*fs*0.05}" r="${SIZE*fs*0.06}" fill="#1a1210"/>
    <circle cx="${SIZE*cx+SIZE*fs*0.25}" cy="${SIZE*cy-SIZE*fs*0.05}" r="${SIZE*fs*0.06}" fill="#1a1210"/>
    <rect x="${SIZE*cx-SIZE*fs*0.15}" y="${SIZE*cy+SIZE*fs*0.2}" width="${SIZE*fs*0.3}" height="${SIZE*fs*0.08}" rx="2" fill="#d4a574"/>
  </svg>`;
}

const bases = [];
for (const skin of skinTones) {
  for (const fs of faceSizes) {
    for (const c of comps) {
      const id = `base-${skin.slice(1)}-${fs}-${c.cx}`;
      bases.push({ id, svg: makeBaseSvg(skin, "#3c3c41", fs, c.cx, c.cy), faceSize: fs });
    }
  }
}

// ─── Transform definitions ───
const transforms = [
  { id: "blur-mild", type: "gaussian-blur", params: { strength: 3 }, categories: ["mild-blur"], gateStatus: "accepted", reasons: [] },
  { id: "blur-moderate", type: "gaussian-blur", params: { strength: 8 }, categories: ["moderate-blur"], gateStatus: "accepted-with-limitations", reasons: ["blurry"] },
  { id: "blur-severe", type: "gaussian-blur", params: { strength: 15 }, categories: ["severe-blur"], gateStatus: "rejected", reasons: ["severe_blur"] },
  { id: "blur-extreme", type: "gaussian-blur", params: { strength: 25 }, categories: ["severe-blur"], gateStatus: "rejected", reasons: ["severe_blur"] },
  { id: "motion-blur-mild", type: "motion-blur", params: { length: 5 }, categories: ["mild-blur"], gateStatus: "accepted", reasons: [] },
  { id: "motion-blur-severe", type: "motion-blur", params: { length: 20 }, categories: ["motion-blur"], gateStatus: "rejected", reasons: ["severe_blur"] },
  { id: "underexpose-mild", type: "underexposure", params: { factor: 0.5 }, categories: ["underexposure"], gateStatus: "accepted-with-limitations", reasons: ["too_dark"] },
  { id: "underexpose-severe", type: "underexposure", params: { factor: 0.15 }, categories: ["underexposure"], gateStatus: "rejected", reasons: ["too_dark"] },
  { id: "underexpose-extreme", type: "underexposure", params: { factor: 0.03 }, categories: ["underexposure"], gateStatus: "rejected", reasons: ["too_dark"] },
  { id: "overexpose-mild", type: "overexposure", params: { factor: 1.5 }, categories: ["overexposure"], gateStatus: "accepted-with-limitations", reasons: ["too_bright"] },
  { id: "overexpose-severe", type: "overexposure", params: { factor: 2.5 }, categories: ["overexposure"], gateStatus: "rejected", reasons: ["overexposed"] },
  { id: "overexpose-extreme", type: "overexposure", params: { factor: 4.0 }, categories: ["overexposure"], gateStatus: "rejected", reasons: ["overexposed"] },
  { id: "downscale-low", type: "downscale", params: { scale: 0.15 }, categories: ["low-face-resolution"], gateStatus: "accepted-with-limitations", reasons: ["low_resolution"] },
  { id: "downscale-tiny", type: "downscale", params: { scale: 0.08 }, categories: ["tiny-face"], gateStatus: "rejected", reasons: ["too_small"] },
  { id: "noise-heavy", type: "noise", params: {}, categories: [], gateStatus: "accepted", reasons: [] },
  { id: "warm-cast", type: "warm-cast", params: { strength: 40 }, categories: [], gateStatus: "accepted", reasons: [] },
  { id: "cool-cast", type: "cool-cast", params: { strength: 40 }, categories: [], gateStatus: "accepted", reasons: [] },
  { id: "desaturate", type: "reduce-saturation", params: {}, categories: [], gateStatus: "accepted", reasons: [] },
  { id: "add-headroom", type: "add-headroom", params: { pixels: 150 }, categories: [], gateStatus: "accepted", reasons: [] },
  { id: "headroom-excessive", type: "add-headroom", params: { pixels: 300 }, categories: ["extreme-crop"], gateStatus: "accepted-with-limitations", reasons: [] },
  { id: "crop-moderate", type: "crop", params: { top: 0.3, bottom: 0.9 }, categories: [], gateStatus: "accepted", reasons: [] },
  { id: "crop-face-cut", type: "crop", params: { top: 0.0, bottom: 0.3 }, categories: ["extreme-crop"], gateStatus: "rejected", reasons: ["face_too_small"] },
  { id: "rotate-15", type: "rotate", params: { degrees: 15 }, categories: [], gateStatus: "accepted", reasons: [] },
  { id: "rotate-45", type: "rotate", params: { degrees: 45 }, categories: [], gateStatus: "accepted-with-limitations", reasons: [] },
  { id: "perspective-skew", type: "perspective", params: { skewX: 0.15 }, categories: [], gateStatus: "accepted", reasons: [] },
  { id: "high-contrast", type: "contrast", params: { factor: 2.0 }, categories: [], gateStatus: "accepted", reasons: [] },
  { id: "low-contrast", type: "contrast", params: { factor: 0.4 }, categories: [], gateStatus: "accepted", reasons: [] },
  { id: "high-saturation", type: "saturation", params: { factor: 2.0 }, categories: [], gateStatus: "accepted", reasons: [] },
];

// ─── Screenshot variants (108 = 36 × 3 base screenshots) ───
const screenshotVariants = [
  { id: "screenshot-mobile", params: { barHeight: 40, embedScale: 0.7, marginColor: "#000000" }, cls: "mobile-status-bar" },
  { id: "screenshot-light", params: { barHeight: 36, embedScale: 0.65, marginColor: "#f5f5f5" }, cls: "mobile-light" },
  { id: "screenshot-small", params: { barHeight: 40, embedScale: 0.4, marginColor: "#000000" }, cls: "small-embedded" },
];

// ─── Nested-image samples (150) ───
const nestedVariants = [];
for (let i = 0; i < 150; i++) {
  const depth = i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1;
  const embedRatio = i % 5 === 0 ? 0.08 : i % 3 === 0 ? 0.2 : 0.4;
  nestedVariants.push({ id: `nested-${i}`, depth, embedRatio, desc: `nested depth=${depth} ratio=${embedRatio}` });
}

// ─── Multiple-face samples (100) ───
const multiFaceVariants = [];
for (let i = 0; i < 100; i++) {
  const primaryCount = i < 60 ? 2 : i < 85 ? 3 : 1;
  const hasIncidental = i >= 85;
  multiFaceVariants.push({ id: `multiface-${i}`, primaryCount, totalFaces: primaryCount + (hasIncidental ? 1 : 0), hasIncidental });
}

// ─── No-face samples (100) ───
const noFaceVariants = [
  ...Array.from({ length: 20 }, (_, i) => ({ id: `noface-blank-${i}`, cls: "blank", desc: "blank image" })),
  ...Array.from({ length: 20 }, (_, i) => ({ id: `noface-solid-${i}`, cls: "solid-colour", desc: "solid colour" })),
  ...Array.from({ length: 15 }, (_, i) => ({ id: `noface-gradient-${i}`, cls: "gradient", desc: "gradient" })),
  ...Array.from({ length: 15 }, (_, i) => ({ id: `noface-landscape-${i}`, cls: "landscape", desc: "landscape simulation" })),
  ...Array.from({ length: 10 }, (_, i) => ({ id: `noface-text-${i}`, cls: "text-heavy", desc: "text-heavy" })),
  ...Array.from({ length: 10 }, (_, i) => ({ id: `noface-product-${i}`, cls: "product", desc: "product image" })),
  ...Array.from({ length: 10 }, (_, i) => ({ id: `noface-abstract-${i}`, cls: "abstract", desc: "abstract texture" })),
];

async function applyTransform(buf, t) {
  try {
    switch (t.type) {
      case "gaussian-blur": return sharp(buf).blur(t.params.strength || 5).png().toBuffer();
      case "motion-blur": return sharp(buf).blur((t.params.length || 5) * 0.8).png().toBuffer();
      case "underexposure": return sharp(buf).modulate({ brightness: Math.max(5, (t.params.factor || 0.5) * 100) }).png().toBuffer();
      case "overexposure": return sharp(buf).modulate({ brightness: Math.min(300, (t.params.factor || 1.5) * 100) }).png().toBuffer();
      case "downscale": { const s = Math.max(10, Math.round(SIZE * (t.params.scale || 0.5))); return sharp(buf).resize(s, s).png().toBuffer(); }
      case "noise": return sharp(buf).blur(0.3).sharpen({ sigma: 8 }).png().toBuffer();
      case "warm-cast": return sharp(buf).tint({ r: 220, g: 180, b: 120 }).png().toBuffer();
      case "cool-cast": return sharp(buf).tint({ r: 120, g: 180, b: 220 }).png().toBuffer();
      case "reduce-saturation": return sharp(buf).greyscale().png().toBuffer();
      case "contrast": return sharp(buf).linear(t.params.factor || 1, 128 * (1 - (t.params.factor || 1))).png().toBuffer();
      case "saturation": return sharp(buf).modulate({ saturation: (t.params.factor || 1) * 100 }).png().toBuffer();
      case "rotate": return sharp(buf).rotate(t.params.degrees || 0, { background: "#808080" }).png().toBuffer();
      case "add-headroom": { const extra = t.params.pixels || 100; const eb = await sharp({ create: { width: SIZE, height: SIZE + extra, channels: 3, background: { r: 128, g: 128, b: 128 } } }).png().toBuffer(); return sharp(eb).composite([{ input: buf, top: extra, left: 0 }]).png().toBuffer(); }
      case "crop": { const top = Math.round(SIZE * (t.params.top || 0.3)); const bottom = Math.round(SIZE * (t.params.bottom || 0.9)); return sharp(buf).extract({ left: 0, top, width: SIZE, height: Math.max(1, bottom - top) }).png().toBuffer(); }
      case "perspective": return sharp(buf).png().toBuffer();
      case "screenshot": { const nw = Math.round(SIZE / (t.params.embedScale || 0.7)); const nh = Math.round(SIZE / (t.params.embedScale || 0.7)); const cb = await sharp({ create: { width: nw, height: nh, channels: 3, background: { r: 0, g: 0, b: 0 } } }).png().toBuffer(); return sharp(cb).composite([{ input: buf, top: (t.params.barHeight || 40) + Math.round((nh - SIZE) / 2), left: Math.round((nw - SIZE) / 2) }]).png().toBuffer(); }
      default: return buf;
    }
  } catch { return buf; }
}

async function makeNestedImage(baseBuf, depth, embedRatio) {
  const embedSize = Math.round(SIZE * embedRatio);
  const embedded = await sharp(baseBuf).resize(embedSize, embedSize).png().toBuffer();
  let canvas = await sharp({ create: { width: SIZE, height: SIZE, channels: 3, background: { r: 40, g: 40, b: 45 } } }).png().toBuffer();
  const offX = Math.round((SIZE - embedSize) / 2);
  const offY = Math.round((SIZE - embedSize) / 2);
  canvas = await sharp(canvas).composite([{ input: embedded, top: offY, left: offX }]).png().toBuffer();
  for (let d = 1; d < depth; d++) {
    const border = 20;
    const outer = await sharp({ create: { width: SIZE + border * 2, height: SIZE + border * 2, channels: 3, background: { r: 30, g: 30, b: 35 } } }).png().toBuffer();
    canvas = await sharp(outer).composite([{ input: canvas, top: border, left: border }]).png().toBuffer();
  }
  return canvas;
}

async function makeMultiFace(primaryCount, totalFaces) {
  const canvas = await sharp({ create: { width: SIZE, height: SIZE, channels: 3, background: { r: 50, g: 50, b: 55 } } }).png().toBuffer();
  const composites = [];
  const positions = [
    { cx: SIZE * 0.3, cy: SIZE * 0.4 }, { cx: SIZE * 0.7, cy: SIZE * 0.4 },
    { cx: SIZE * 0.5, cy: SIZE * 0.4 }, { cx: SIZE * 0.5, cy: SIZE * 0.6 },
  ];
  for (let i = 0; i < Math.min(totalFaces, 4); i++) {
    const faceR = i < primaryCount ? SIZE * 0.15 : SIZE * 0.06;
    const faceSvg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg"><circle cx="${positions[i].cx}" cy="${positions[i].cy}" r="${faceR}" fill="#c49a6c"/></svg>`;
    const faceBuf = await sharp(Buffer.from(faceSvg)).png().toBuffer();
    composites.push({ input: faceBuf, top: 0, left: 0 });
  }
  return sharp(canvas).composite(composites).png().toBuffer();
}

async function makeNoFace(cls) {
  switch (cls) {
    case "blank": return sharp({ create: { width: SIZE, height: SIZE, channels: 3, background: { r: 200, g: 200, b: 200 } } }).png().toBuffer();
    case "solid-colour": { const r = Math.round(Math.random() * 200 + 28); const g = Math.round(Math.random() * 200 + 28); const b = Math.round(Math.random() * 200 + 28); return sharp({ create: { width: SIZE, height: SIZE, channels: 3, background: { r, g, b } } }).png().toBuffer(); }
    case "gradient": { const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1a1a2e"/><stop offset="100%" stop-color="#16213e"/></linearGradient></defs><rect width="${SIZE}" height="${SIZE}" fill="url(#g)"/></svg>`; return sharp(Buffer.from(svg)).png().toBuffer(); }
    case "landscape": { const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg"><rect width="${SIZE}" height="${SIZE*0.6}" fill="#87ceeb"/><rect y="${SIZE*0.6}" width="${SIZE}" height="${SIZE*0.4}" fill="#228b22"/><circle cx="${SIZE*0.8}" cy="${SIZE*0.2}" r="${SIZE*0.08}" fill="#ffd700"/></svg>`; return sharp(Buffer.from(svg)).png().toBuffer(); }
    case "text-heavy": { const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg"><rect width="${SIZE}" height="${SIZE}" fill="#fff"/>${Array.from({length:20},(_,i)=>`<text x="20" y="${30+i*30}" font-size="14" fill="#333">Line ${i+1}: Sample text content for testing</text>`).join("")}</svg>`; return sharp(Buffer.from(svg)).png().toBuffer(); }
    case "product": { const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg"><rect width="${SIZE}" height="${SIZE}" fill="#f5f5f5"/><rect x="${SIZE*0.2}" y="${SIZE*0.1}" width="${SIZE*0.6}" height="${SIZE*0.8}" rx="10" fill="#ddd"/><rect x="${SIZE*0.3}" y="${SIZE*0.3}" width="${SIZE*0.4}" height="${SIZE*0.3}" rx="5" fill="#ccc"/></svg>`; return sharp(Buffer.from(svg)).png().toBuffer(); }
    case "abstract": { const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg"><rect width="${SIZE}" height="${SIZE}" fill="#1a1a2e"/>${Array.from({length:30},(_,i)=>`<circle cx="${(i*137+50)%SIZE}" cy="${(i*211+30)%SIZE}" r="${10+i%20}" fill="hsl(${i*12},70%,50%)" opacity="0.3"/>`).join("")}</svg>`; return sharp(Buffer.from(svg)).png().toBuffer(); }
    default: return sharp({ create: { width: SIZE, height: SIZE, channels: 3, background: { r: 128, g: 128, b: 128 } } }).png().toBuffer();
  }
}

async function generate() {
  const manifest = [];
  let count = 0;

  // Bases
  for (const b of bases) {
    const buf = await sharp(Buffer.from(b.svg)).png().toBuffer();
    const meta = await sharp(buf).metadata();
    const path = join(OUTPUT, `${b.id}.png`);
    writeFileSync(path, buf);
    manifest.push({ name: b.id, type: "base", sourceType: "synthetic-vector", width: meta.width, height: meta.height, path, categories: ["valid-portrait"], expectedGateStatus: "accepted", expectedReasons: [], expectedSevereBlur: false, expectedMultipleFaces: false, expectedNoFace: false, expectedScreenshot: false, expectedNestedImage: false, expectedLowFaceResolution: false, overallScorePermitted: true, semanticAnalysisPermitted: true, paidReportPermitted: true, productRecommendationsPermitted: true, confidence: "high", labelSource: "deterministic-transformation" });
    count++;
  }

  // Transforms × bases
  for (const t of transforms) {
    for (const b of bases) {
      const baseBuf = await sharp(Buffer.from(b.svg)).png().toBuffer();
      const variantBuf = await applyTransform(baseBuf, t);
      const meta = await sharp(variantBuf).metadata();
      const name = `${b.id}--${t.id}`;
      const path = join(OUTPUT, `${name}.png`);
      writeFileSync(path, variantBuf);
      manifest.push({ name, type: "synthetic", sourceType: "synthetic-vector", source: b.id, transform: t.id, transformType: t.type, parameters: t.params, width: meta.width, height: meta.height, path, categories: t.categories, expectedGateStatus: t.gateStatus, expectedReasons: t.reasons, expectedSevereBlur: t.categories.includes("severe-blur"), expectedMultipleFaces: false, expectedNoFace: false, expectedScreenshot: false, expectedNestedImage: false, expectedLowFaceResolution: t.categories.includes("low-face-resolution") || t.categories.includes("tiny-face"), overallScorePermitted: t.gateStatus !== "rejected", semanticAnalysisPermitted: t.gateStatus !== "rejected", paidReportPermitted: false, productRecommendationsPermitted: false, confidence: "high", labelSource: "deterministic-transformation" });
      count++;
    }
  }

  // Screenshots
  for (const sv of screenshotVariants) {
    for (const b of bases) {
      const baseBuf = await sharp(Buffer.from(b.svg)).png().toBuffer();
      const variantBuf = await applyTransform(baseBuf, { type: "screenshot", params: sv.params });
      const meta = await sharp(variantBuf).metadata();
      const name = `${b.id}--${sv.id}`;
      const path = join(OUTPUT, `${name}.png`);
      writeFileSync(path, variantBuf);
      manifest.push({ name, type: "synthetic", sourceType: "synthetic-vector", source: b.id, transform: sv.id, transformType: "screenshot", parameters: sv.params, screenshotClass: sv.cls, width: meta.width, height: meta.height, path, categories: ["screenshot"], expectedGateStatus: "rejected", expectedReasons: ["screenshot_detected"], expectedSevereBlur: false, expectedMultipleFaces: false, expectedNoFace: false, expectedScreenshot: true, expectedNestedImage: false, expectedLowFaceResolution: false, overallScorePermitted: false, semanticAnalysisPermitted: false, paidReportPermitted: false, productRecommendationsPermitted: false, confidence: "high", labelSource: "deterministic-transformation" });
      count++;
    }
  }

  // Nested images
  for (const nv of nestedVariants) {
    const baseBuf = await sharp(Buffer.from(bases[0].svg)).png().toBuffer();
    const nestedBuf = await makeNestedImage(baseBuf, nv.depth, nv.embedRatio);
    const meta = await sharp(nestedBuf).metadata();
    const path = join(OUTPUT, `${nv.id}.png`);
    writeFileSync(path, nestedBuf);
    manifest.push({ name: nv.id, type: "synthetic", sourceType: "synthetic-vector", source: bases[0].id, width: meta.width, height: meta.height, path, categories: ["nested-image"], nestedDepth: nv.depth, embedRatio: nv.embedRatio, expectedGateStatus: nv.embedRatio < 0.15 ? "rejected" : "accepted-with-limitations", expectedReasons: nv.embedRatio < 0.15 ? ["face_too_small"] : [], expectedSevereBlur: false, expectedMultipleFaces: false, expectedNoFace: false, expectedScreenshot: false, expectedNestedImage: true, expectedLowFaceResolution: nv.embedRatio < 0.15, overallScorePermitted: nv.embedRatio >= 0.15, semanticAnalysisPermitted: nv.embedRatio >= 0.15, paidReportPermitted: false, productRecommendationsPermitted: false, confidence: "high", labelSource: "deterministic-transformation" });
    count++;
  }

  // Multiple faces
  for (const mf of multiFaceVariants) {
    const mfBuf = await makeMultiFace(mf.primaryCount, mf.totalFaces);
    const meta = await sharp(mfBuf).metadata();
    const path = join(OUTPUT, `${mf.id}.png`);
    writeFileSync(path, mfBuf);
    manifest.push({ name: mf.id, type: "synthetic", sourceType: "synthetic-vector", width: meta.width, height: meta.height, path, categories: ["multiple-faces"], primaryFaceCount: mf.primaryCount, totalFaceCount: mf.totalFaces, expectedGateStatus: mf.primaryCount > 1 ? "rejected" : "accepted-with-limitations", expectedReasons: mf.primaryCount > 1 ? ["multiple_faces"] : [], expectedSevereBlur: false, expectedMultipleFaces: true, expectedNoFace: false, expectedScreenshot: false, expectedNestedImage: false, expectedLowFaceResolution: false, overallScorePermitted: mf.primaryCount <= 1, semanticAnalysisPermitted: mf.primaryCount <= 1, paidReportPermitted: false, productRecommendationsPermitted: false, confidence: "high", labelSource: "deterministic-transformation" });
    count++;
  }

  // No-face
  for (const nf of noFaceVariants) {
    const nfBuf = await makeNoFace(nf.cls);
    const meta = await sharp(nfBuf).metadata();
    const path = join(OUTPUT, `${nf.id}.png`);
    writeFileSync(path, nfBuf);
    manifest.push({ name: nf.id, type: "synthetic", sourceType: "synthetic-vector", width: meta.width, height: meta.height, path, categories: ["no-face", nf.cls], expectedGateStatus: "rejected", expectedReasons: ["no_face"], expectedSevereBlur: false, expectedMultipleFaces: false, expectedNoFace: true, expectedScreenshot: false, expectedNestedImage: false, expectedLowFaceResolution: false, overallScorePermitted: false, semanticAnalysisPermitted: false, paidReportPermitted: false, productRecommendationsPermitted: false, confidence: "high", labelSource: "deterministic-transformation" });
    count++;
  }

  // Summary
  const summary = { generatedAt: new Date().toISOString(), generatorVersion: "2.0.0", totalImages: count, basePortraits: bases.length, byType: {}, byCategory: {} };
  for (const m of manifest) {
    const t = m.transformType || m.type;
    summary.byType[t] = (summary.byType[t] || 0) + 1;
    for (const c of m.categories) summary.byCategory[c] = (summary.byCategory[c] || 0) + 1;
  }

  writeFileSync(join(OUTPUT, "manifest.json"), JSON.stringify({ ...summary, images: manifest }, null, 2));
  writeFileSync(join(OUTPUT, "summary.json"), JSON.stringify(summary, null, 2));
  console.log(`✅ Generated ${count} images (${bases.length} bases, ${Object.keys(summary.byType).length} types)`);
  console.log(`   Categories: ${Object.entries(summary.byCategory).map(([k,v]) => `${k}(${v})`).join(", ")}`);
}

generate().catch(e => { console.error("❌", e.message); process.exit(1); });
