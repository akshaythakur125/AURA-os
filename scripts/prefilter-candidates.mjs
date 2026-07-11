#!/usr/bin/env node
/**
 * ponytail: prefilter quarantined candidates — reject artwork, classify media type.
 * Run: node scripts/prefilter-candidates.mjs
 */

import { readdirSync, readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const QUARANTINE = "datasets/real-photos/quarantined";
const REJECTED = "datasets/real-photos/rejected";
const PENDING = "datasets/real-photos/pending-licence-review";
const MANIFEST = "datasets/real-photos/manifests/commons-candidates.json";
mkdirSync(REJECTED, { recursive: true });
mkdirSync(PENDING, { recursive: true });

// Artwork exclusion keywords (case-insensitive)
const ARTWORK_TERMS = [
  "painting", "oil painting", "watercolour", "watercolor", "self-portrait painting",
  "sculpture", "bust", "statue", "drawing", "sketch", "engraving", "lithograph",
  "etching", "illustration", "artwork", "museum object", "manuscript", "document scan",
  "book scan", "digital rendering", "ai-generated", "portrait by", "painted by",
  "oil on canvas", "tempera", "fresco", "woodcut", "print", "plate",
];

// ponytail: no name-based rejection — media type must come from metadata, not names

function isArtwork(candidate) {
  const title = (candidate.title || "").toLowerCase();
  const desc = (candidate.description || "").toLowerCase();
  const creator = (candidate.creator || "").toLowerCase();
  const cats = (candidate.categories || "").toLowerCase();

  // Check title for artwork terms
  for (const term of ARTWORK_TERMS) {
    if (title.includes(term)) return { yes: true, reason: `title contains "${term}"` };
  }



  // Check categories for artwork
  const artworkCats = ["paintings", "sculptures", "drawings", "engravings", "illustrations", "artwork", "museum", "gallery", "canvas"];
  for (const cat of artworkCats) {
    if (cats.includes(cat)) return { yes: true, reason: `category contains "${cat}"` };
  }

  // Check description for artwork terms
  for (const term of ["oil on canvas", "painting by", "sculpted by", "drawn by", "engraved by"]) {
    if (desc.includes(term)) return { yes: true, reason: `description contains "${term}"` };
  }



  return { yes: false, reason: "" };
}

function isLikelyPhotograph(candidate) {
  const title = (candidate.title || "").toLowerCase();
  const desc = (candidate.description || "").toLowerCase();
  const cats = (candidate.categories || "").toLowerCase();

  // Positive signals for photographs
  const photoSignals = ["photograph", "photo", "camera", "portrait photograph", "headshot", "photographer"];
  for (const sig of photoSignals) {
    if (title.includes(sig) || desc.includes(sig) || cats.includes(sig)) return true;
  }

  // Has MIME type image/jpeg and is not flagged as artwork → likely photograph
  if (candidate.mime?.includes("jpeg") || candidate.mime?.includes("png")) {
    // If no artwork flags found, treat as potentially photographic
    return true;
  }

  return false;
}

function run() {
  if (!existsSync(MANIFEST)) { console.error("❌ No manifest. Run discover first."); process.exit(1); }

  const manifest = JSON.parse(readFileSync(MANIFEST, "utf-8"));
  const candidates = manifest.candidates || [];

  let artwork = 0, photo = 0, uncertain = 0, moved = 0;

  console.log(`\n🔍 Prefiltering ${candidates.length} candidates\n`);

  for (const c of candidates) {
    const check = isArtwork(c);
    if (check.yes) {
      artwork++;
      // Move to rejected
      const src = join(QUARANTINE, c.filename);
      const dst = join(REJECTED, c.filename);
      if (existsSync(src)) renameSync(src, dst);
      c.status = "automated-prefilter-rejected";
      c.rejectionReason = check.reason;
    } else if (isLikelyPhotograph(c)) {
      photo++;
      c.status = "pending-licence-review";
      // Move to pending
      const src = join(QUARANTINE, c.filename);
      const dst = join(PENDING, c.filename);
      if (existsSync(src) && !existsSync(dst)) renameSync(src, dst);
      moved++;
    } else {
      uncertain++;
      c.status = "pending-licence-review";
    }
  }

  manifest.candidates = candidates;
  manifest.prefilter = { artworkRejected: artwork, photoRetained: photo, uncertain, movedToPending: moved };
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

  console.log(`📊 Results:`);
  console.log(`   Artwork rejected: ${artwork}`);
  console.log(`   Likely photographs: ${photo}`);
  console.log(`   Uncertain: ${uncertain}`);
  console.log(`   Moved to pending: ${moved}`);
}

run();
