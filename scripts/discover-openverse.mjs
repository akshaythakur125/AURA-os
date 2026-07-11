#!/usr/bin/env node
/**
 * ponytail: Openverse adapter — discover CC0/CC-BY images via official API.
 * Run: node scripts/discover-openverse.mjs --query "portrait photograph" --limit 50
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import { createHash } from "crypto";
import { join } from "path";

const QUARANTINE = "datasets/real-photos/quarantined";
const MANIFEST = "datasets/real-photos/manifests/openverse-candidates.json";
mkdirSync(QUARANTINE, { recursive: true });
mkdirSync("datasets/real-photos/manifests", { recursive: true });

const API = "https://api.openverse.org/v1/images/";
const UA = "AuraCheck-Benchmark/1.0 (https://fixmyaura.shop; research evaluation)";
const ALLOWED = ["cc0", "pdm", "by", "by-sa"];

function parseArgs() {
  const a = process.argv.slice(2);
  const o = { query: "person photograph", limit: 50, dryRun: false };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--query" && a[i + 1]) o.query = a[++i];
    if (a[i] === "--limit" && a[i + 1]) o.limit = parseInt(a[++i]) || 50;
    if (a[i] === "--dry-run") o.dryRun = true;
  }
  return o;
}

function allowed(lic) {
  const l = (lic || "").toLowerCase();
  // Must match exactly or with version suffix, not partial like "by-nc"
  return ALLOWED.some(a => l === a || l.startsWith(a + " "));
}

function safeName(t) { return (t || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80); }

async function discover(query, limit) {
  const results = [];
  let page = 1;
  while (results.length < limit) {
    const sz = Math.min(20, limit - results.length);
    const res = await fetch(`${API}?q=${encodeURIComponent(query)}&page=${page}&page_size=${sz}&license=cc0,by,by-sa&format=json`, { headers: { "User-Agent": UA } });
    if (!res.ok) break;
    const data = await res.json();
    if (!data.results?.length) break;
    results.push(...data.results);
    page++;
    if (data.results.length < sz) break;
    await new Promise(r => setTimeout(r, 200));
  }
  return results;
}

async function run() {
  const opts = parseArgs();
  console.log(`\n🔍 Openverse — "${opts.query}" (limit: ${opts.limit})\n`);
  const discovered = await discover(opts.query, opts.limit);
  console.log(`  Discovered: ${discovered.length}`);

  const candidates = [];
  let downloaded = 0, skipped = 0;

  for (const r of discovered) {
    if (!allowed(r.license)) { skipped++; continue; }
    if (!r.url) { skipped++; continue; }

    const filename = `${safeName(r.title)}_${r.id}.jpg`;
    if (!opts.dryRun) {
      try {
        const res = await fetch(r.url, { headers: { "User-Agent": UA } });
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          const hash = createHash("sha256").update(buf).digest("hex").slice(0, 16);
          const outName = `${hash}_${filename}`;
          writeFileSync(join(QUARANTINE, outName), buf);
          downloaded++;
          candidates.push({ sourceId: `openverse-${r.id}`, title: r.title, filename: outName, creator: r.creator, license: r.license, licenseVersion: r.license_version, source: r.source, originalUrl: r.url, width: r.width, height: r.height, status: "downloaded-quarantined", checksum: hash, discoveredAt: new Date().toISOString(), licenceReviewRequired: true, privacyReviewRequired: true });
        } else { skipped++; }
      } catch { skipped++; }
    } else {
      candidates.push({ sourceId: `openverse-${r.id}`, title: r.title, filename, status: "discovered" });
    }
    await new Promise(r => setTimeout(r, 200));
  }

  writeFileSync(MANIFEST, JSON.stringify({ source: "openverse", query: opts.query, discovered: discovered.length, candidates: candidates.length, downloaded, skipped, candidates }, null, 2));
  console.log(`\n📊 ${candidates.length} candidates, ${downloaded} downloaded, ${skipped} skipped`);
}

run().catch(e => { console.error("❌", e.message); process.exit(1); });
