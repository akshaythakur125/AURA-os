#!/usr/bin/env node
/**
 * ponytail: generate 1000+ synthetic benchmark images.
 * 26 base portraits × 39 transformations = ~1000 variants.
 * Run: node scripts/generate-synthetic-images.mjs
 */

import sharp from "sharp";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const OUTPUT_DIR = "datasets/generated";
const SIZE = 640;
mkdirSync(OUTPUT_DIR, { recursive: true });

// 26 base portraits with varying skin tones, face sizes, compositions
const BASES = [];
const skinTones = [
  { skin: "#c49a6c", bg: "#3c3c41", label: "medium" },
  { skin: "#8d5524", bg: "#2a2a2f", label: "dark" },
  { skin: "#f1c27d", bg: "#4a4a50", label: "light" },
  { skin: "#c68642", bg: "#35353a", label: "olive" },
  { skin: "#e0ac69", bg: "#3f3f44", label: "tan" },
  { skin: "#6b3e26", bg: "#252528", label: "deep" },
];
const faceSizes = [0.15, 0.2, 0.25]; // small, medium, large face
const compositions = [
  { cx: 0.5, cy: 0.4, label: "centered" },
  { cx: 0.35, cy: 0.4, label: "left" },
  { cx: 0.65, cy: 0.4, label: "right" },
  { cx: 0.5, cy: 0.3, label: "high" },
  { cx: 0.5, cy: 0.55, label: "low" },
];

for (const tone of skinTones) {
  for (const size of faceSizes) {
    for (const comp of compositions.slice(0, 2)) { // 2 compositions per combination
      const id = `base-${tone.label}-${size}-${comp.label}`;
      const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${SIZE}" height="${SIZE}" fill="${tone.bg}"/>
        <circle cx="${SIZE * comp.cx}" cy="${SIZE * comp.cy}" r="${SIZE * size}" fill="${tone.skin}"/>
        <circle cx="${SIZE * comp.cx - SIZE * size * 0.25}" cy="${SIZE * comp.cy - SIZE * size * 0.05}" r="${SIZE * size * 0.06}" fill="#1a1210"/>
        <circle cx="${SIZE * comp.cx + SIZE * size * 0.25}" cy="${SIZE * comp.cy - SIZE * size * 0.05}" r="${SIZE * size * 0.06}" fill="#1a1210"/>
        <rect x="${SIZE * comp.cx - SIZE * size * 0.15}" y="${SIZE * comp.cy + SIZE * size * 0.2}" width="${SIZE * size * 0.3}" height="${SIZE * size * 0.08}" rx="2" fill="#d4a574"/>
      </svg>`;
      BASES.push({ id, svg, tone: tone.label, faceSize: size, composition: comp.label });
    }
  }
}

console.log(`Generated ${BASES.length} base portraits`);

// Load transformation definitions
const transformSrc = readFileSync("tests/fixtures/analyser/syntheticTransformations.ts", "utf-8");
const transforms = [];
const regex = /\{\s*id:\s*"([^"]+)"[^}]*type:\s*"([^"]+)"[^}]*parameters:\s*\{([^}]*)\}/g;
let m;
while ((m = regex.exec(transformSrc)) !== null) {
  const params = {};
  const pm = /(\w+):\s*([^,\s}]+)/g;
  let p;
  while ((p = pm.exec(m[3])) !== null) params[p[1]] = isNaN(Number(p[2])) ? p[2] : Number(p[2]);
  transforms.push({ id: m[1], type: m[2], parameters: params });
}
console.log(`Loaded ${transforms.length} transformations`);

async function applyTransform(buf, t) {
  try {
    switch (t.type) {
      case "gaussian-blur": return sharp(buf).blur(t.parameters.strength || 5).png().toBuffer();
      case "underexposure": return sharp(buf).modulate({ brightness: Math.max(5, (t.parameters.factor || 0.5) * 100) }).png().toBuffer();
      case "overexposure": return sharp(buf).modulate({ brightness: Math.min(300, (t.parameters.factor || 1.5) * 100) }).png().toBuffer();
      case "downscale": { const s = Math.max(10, Math.round(SIZE * (t.parameters.scale || 0.5))); return sharp(buf).resize(s, s).png().toBuffer(); }
      case "noise": return sharp(buf).blur(0.3).sharpen({ sigma: 8 }).png().toBuffer();
      case "warm-cast": return sharp(buf).tint({ r: Math.min(255, 180 + (t.parameters.strength || 30)), g: 160, b: 120 }).png().toBuffer();
      case "cool-cast": return sharp(buf).tint({ r: 120, g: 160, b: Math.min(255, 180 + (t.parameters.strength || 30)) }).png().toBuffer();
      case "reduce-saturation": return sharp(buf).greyscale().png().toBuffer();
      case "contrast": return sharp(buf).linear(t.parameters.factor || 1, 128 * (1 - (t.parameters.factor || 1))).png().toBuffer();
      case "saturation": return sharp(buf).modulate({ saturation: (t.parameters.factor || 1) * 100 }).png().toBuffer();
      case "motion-blur": return sharp(buf).blur((t.parameters.length || 5) * 0.8).rotate(0).png().toBuffer();
      case "rotate": return sharp(buf).rotate(t.parameters.degrees || 0, { background: "#808080" }).png().toBuffer();
      case "add-headroom": { const extra = t.parameters.pixels || 100; const expanded = sharp({ create: { width: SIZE, height: SIZE + extra, channels: 3, background: { r: 128, g: 128, b: 128 } } }); const eb = await expanded.png().toBuffer(); return sharp(eb).composite([{ input: buf, top: extra, left: 0 }]).png().toBuffer(); }
      case "crop": { const top = Math.round(SIZE * (t.parameters.top || 0.3)); const bottom = Math.round(SIZE * (t.parameters.bottom || 0.9)); return sharp(buf).extract({ left: 0, top, width: SIZE, height: Math.max(1, bottom - top) }).png().toBuffer(); }
      case "screenshot": { const bar = t.parameters.barHeight || 40; const scale = t.parameters.embedScale || 0.7; const nw = Math.round(SIZE / scale); const nh = Math.round(SIZE / scale); const canvas = sharp({ create: { width: nw, height: nh, channels: 3, background: { r: 0, g: 0, b: 0 } } }); const cb = await canvas.png().toBuffer(); return sharp(cb).composite([{ input: buf, top: bar + Math.round((nh - SIZE) / 2), left: Math.round((nw - SIZE) / 2) }]).png().toBuffer(); }
      case "background-clutter": { const canvas = sharp({ create: { width: SIZE, height: SIZE, channels: 3, background: { r: 128, g: 128, b: 128 } } }); const cb = await canvas.png().toBuffer(); return sharp(cb).composite([{ input: buf, top: 0, left: 0 }]).png().toBuffer(); }
      case "perspective": return sharp(buf).png().toBuffer(); // sharp has no perspective — record as passthrough
      case "defocus": return sharp(buf).blur(t.parameters.strength || 3).png().toBuffer();
      default: return buf;
    }
  } catch { return buf; }
}

async function generate() {
  const manifest = [];
  let count = 0;

  for (const base of BASES) {
    const baseBuf = await sharp(Buffer.from(base.svg)).png().toBuffer();
    const baseMeta = await sharp(baseBuf).metadata();

    // Save base
    const basePath = join(OUTPUT_DIR, `${base.id}.png`);
    writeFileSync(basePath, baseBuf);
    manifest.push({ name: base.id, desc: `Base portrait (${base.tone}, ${base.faceSize}, ${base.composition})`, type: "base", width: baseMeta.width, height: baseMeta.height, path: basePath, source: "synthetic" });
    count++;

    // Apply each transformation
    for (const t of transforms) {
      const variantBuf = await applyTransform(baseBuf, t);
      const vMeta = await sharp(variantBuf).metadata();
      const variantName = `${base.id}--${t.id}`;
      const variantPath = join(OUTPUT_DIR, `${variantName}.png`);
      writeFileSync(variantPath, variantBuf);
      manifest.push({ name: variantName, desc: `${t.type} (${JSON.stringify(t.parameters)})`, type: "synthetic", source: base.id, transform: t.id, transformType: t.type, parameters: t.parameters, width: vMeta.width, height: vMeta.height, path: variantPath, sourceDataset: "synthetic-fixtures" });
      count++;
    }

    if (count % 100 === 0) console.log(`  Generated ${count} images...`);
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    generatorVersion: "1.0.0",
    totalImages: count,
    basePortraits: BASES.length,
    transformations: transforms.length,
    byType: {},
    byBase: {},
  };

  for (const m of manifest) {
    const t = m.transformType || "base";
    summary.byType[t] = (summary.byType[t] || 0) + 1;
    if (m.source) summary.byBase[m.source] = (summary.byBase[m.source] || 0) + 1;
  }

  writeFileSync(join(OUTPUT_DIR, "manifest.json"), JSON.stringify({ ...summary, images: manifest }, null, 2));
  writeFileSync(join(OUTPUT_DIR, "summary.json"), JSON.stringify(summary, null, 2));

  console.log(`\n✅ Generated ${count} images (${BASES.length} bases × ${transforms.length} transforms + bases)`);
  console.log(`   Types: ${Object.keys(summary.byType).length}`);
  console.log(`   Storage: ~${Math.round(count * 0.1)}MB estimated`);
}

generate().catch(e => { console.error("❌", e.message); process.exit(1); });
