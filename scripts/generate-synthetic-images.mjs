#!/usr/bin/env node
/**
 * ponytail: generate synthetic test images using sharp operations only.
 * No raw pixel manipulation — sharp handles all format conversion.
 * Run: node scripts/generate-synthetic-images.mjs
 */

import sharp from "sharp";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const OUTPUT_DIR = "datasets/generated";
const SIZE = 640;

mkdirSync(OUTPUT_DIR, { recursive: true });

async function generateVariants() {
  // Base: solid grey with a lighter center circle (simulates face region)
  const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${SIZE}" height="${SIZE}" fill="#3c3c41"/>
    <circle cx="${SIZE/2}" cy="${SIZE*0.4}" r="${SIZE*0.2}" fill="#b48c78"/>
    <circle cx="${SIZE*0.47}" cy="${SIZE*0.38}" r="${SIZE*0.02}" fill="#281e19"/>
    <circle cx="${SIZE*0.53}" cy="${SIZE*0.38}" r="${SIZE*0.02}" fill="#281e19"/>
  </svg>`;

  const base = sharp(Buffer.from(svg)).png();
  const baseBuf = await base.toBuffer();

  const variants = [
    { name: "portrait-normal", desc: "Valid portrait, good quality" },
    { name: "portrait-blur-mild", desc: "Mild blur", fn: b => sharp(b).blur(3).png().toBuffer() },
    { name: "portrait-blur-severe", desc: "Severe blur", fn: b => sharp(b).blur(15).png().toBuffer() },
    { name: "portrait-dark", desc: "Underexposed", fn: async () => { const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg"><rect width="${SIZE}" height="${SIZE}" fill="#0a0a0a"/><circle cx="${SIZE/2}" cy="${SIZE*0.4}" r="${SIZE*0.2}" fill="#2a1a15"/></svg>`; return sharp(Buffer.from(svg)).png().toBuffer(); } },
    { name: "portrait-bright", desc: "Overexposed", fn: async () => { const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg"><rect width="${SIZE}" height="${SIZE}" fill="#ffffff"/><circle cx="${SIZE/2}" cy="${SIZE*0.4}" r="${SIZE*0.2}" fill="#ffeedd"/></svg>`; return sharp(Buffer.from(svg)).png().toBuffer(); } },
    { name: "portrait-blank", desc: "Near-blank solid colour", fn: async () => {
      const s = sharp({ create: { width: SIZE, height: SIZE, channels: 3, background: { r: 200, g: 200, b: 200 } } });
      return s.png().toBuffer();
    }},
    { name: "portrait-tiny", desc: "Very low resolution (80x80)", fn: b => sharp(b).resize(80, 80).png().toBuffer() },
    { name: "portrait-noise", desc: "Heavy noise", fn: b => sharp(b).blur(0.5).sharpen({ sigma: 10 }).png().toBuffer() },
    { name: "portrait-warm", desc: "Warm colour cast", fn: b => sharp(b).tint({ r: 220, g: 180, b: 140 }).png().toBuffer() },
    { name: "portrait-cool", desc: "Cool colour cast", fn: b => sharp(b).tint({ r: 140, g: 180, b: 220 }).png().toBuffer() },
    { name: "portrait-desaturated", desc: "Low saturation", fn: b => sharp(b).greyscale().png().toBuffer() },
    { name: "portrait-high-contrast", desc: "High contrast", fn: b => sharp(b).linear(2.0, -128).png().toBuffer() },
  ];

  const manifest = [];

  for (const v of variants) {
    const outPath = join(OUTPUT_DIR, `${v.name}.png`);
    let buf;
    if (v.fn) {
      buf = await v.fn(baseBuf);
    } else {
      buf = baseBuf;
    }
    writeFileSync(outPath, buf);
    const meta = await sharp(buf).metadata();
    manifest.push({ name: v.name, desc: v.desc, width: meta.width, height: meta.height, path: outPath });
    console.log(`  ✅ ${v.name} (${meta.width}x${meta.height})`);
  }

  writeFileSync(join(OUTPUT_DIR, "manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), count: manifest.length, images: manifest }, null, 2));
  console.log(`\n✅ Generated ${manifest.length} images in ${OUTPUT_DIR}/`);
}

generateVariants().catch(e => { console.error("❌", e.message); process.exit(1); });
