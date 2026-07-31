#!/usr/bin/env node
/**
 * Self-host the CLIP weights for the on-device Photo Ranker / AI photo read.
 *
 * Downloads Xenova/clip-vit-base-patch32 (q8 / quantized build — matches the
 * dtype pinned in src/lib/aura-engine/localVision.ts) into
 *   public/models/Xenova/clip-vit-base-patch32/
 * so Transformers.js serves the model from YOUR domain instead of the Hugging
 * Face CDN. The user's photo still never leaves the browser — this only changes
 * where the one-time model download comes from.
 *
 * Usage:
 *   node scripts/fetch-clip-model.mjs        (or: npm run clip:fetch)
 * then set NEXT_PUBLIC_LOCAL_CLIP=1 in your env and rebuild.
 *
 * The weights are gitignored (they're large) — run this in your deploy/build
 * step (e.g. a Vercel build command or prebuild hook), not committed to git.
 *
 * Flags:
 *   --configs-only   download just the small config/tokenizer files (for a
 *                    quick end-to-end check without pulling ~300MB of weights).
 */
import { mkdir, stat, rename, rm } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { dirname, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const MODEL = "Xenova/clip-vit-base-patch32";
const BASE = `https://huggingface.co/${MODEL}/resolve/main`;
const OUT = join(process.cwd(), "public", "models", MODEL);
const CONFIGS_ONLY = process.argv.includes("--configs-only");

// Small config/tokenizer files (always needed).
const CONFIG_FILES = [
  "config.json",
  "preprocessor_config.json",
  "tokenizer.json",
  "tokenizer_config.json",
  "vocab.json",
  "merges.txt",
  "special_tokens_map.json",
];

// q8 weights. Both the merged model and the split vision/text encoders are
// fetched so whichever load path Transformers.js takes for CLIP is covered —
// the browser still only downloads the variant it actually uses.
const WEIGHT_FILES = [
  "onnx/model_quantized.onnx",
  "onnx/vision_model_quantized.onnx",
  "onnx/text_model_quantized.onnx",
];

const FILES = CONFIGS_ONLY ? CONFIG_FILES : [...CONFIG_FILES, ...WEIGHT_FILES];

async function fileSize(p) {
  try {
    return (await stat(p)).size;
  } catch {
    return -1;
  }
}

async function download(rel) {
  const dest = join(OUT, rel);
  await mkdir(dirname(dest), { recursive: true });
  if ((await fileSize(dest)) > 0) {
    console.log("  skip (exists) ", rel);
    return;
  }
  const url = `${BASE}/${rel}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status} for ${rel}`);
  const tmp = `${dest}.part`;
  try {
    await pipeline(Readable.fromWeb(res.body), createWriteStream(tmp));
    await rename(tmp, dest);
  } catch (err) {
    await rm(tmp, { force: true });
    throw err;
  }
  const mb = ((await fileSize(dest)) / 1e6).toFixed(1);
  console.log("  ok            ", rel, `${mb}MB`);
}

console.log(`Fetching ${MODEL}${CONFIGS_ONLY ? " (configs only)" : ""}`);
console.log(`  → ${OUT}\n`);
let failed = 0;
for (const f of FILES) {
  try {
    await download(f);
  } catch (err) {
    failed++;
    console.error("  FAILED        ", f, "—", err.message);
  }
}
if (failed) {
  console.error(`\n${failed} file(s) failed. Re-run to resume (existing files are skipped).`);
  process.exit(1);
}
console.log(`\nDone.${CONFIGS_ONLY ? " (configs only — re-run without --configs-only for the weights)" : ""}`);
console.log("Next: set NEXT_PUBLIC_LOCAL_CLIP=1 and rebuild to serve CLIP from /models.");
