#!/usr/bin/env node
/**
 * ponytail: Wikimedia Commons adapter — discover + download portraits to quarantine.
 * Run: node scripts/discover-commons.mjs --query "portrait photograph" --limit 50
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";

const QUARANTINE = "datasets/real-photos/quarantined";
const CACHE = "datasets/real-photos/acquisition-cache";
const MANIFEST = "datasets/real-photos/manifests/commons-candidates.json";
mkdirSync(QUARANTINE, { recursive: true });
mkdirSync(CACHE, { recursive: true });
mkdirSync("datasets/real-photos/manifests", { recursive: true });

const API = "https://commons.wikimedia.org/w/api.php";
const UA = "AuraCheck-Benchmark/1.0 (https://fixmyaura.shop; research evaluation)";

function parseArgs() {
  const a = process.argv.slice(2);
  const o = { query: "portrait photograph person", limit: 50, dryRun: false };
  for (let i = 0; i < a.length; i += 2) {
    if (a[i] === "--query") o.query = a[i + 1];
    if (a[i] === "--limit") o.limit = parseInt(a[i + 1]) || 50;
    if (a[i] === "--dry-run") { o.dryRun = true; i--; }
  }
  return o;
}

async function apiFetch(params) {
  const url = new URL(API);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

async function discover(query, limit) {
  const results = [];
  let offset = 0;
  while (results.length < limit) {
    const batch = Math.min(50, limit - results.length);
    const data = await apiFetch({ action: "query", list: "search", srsearch: query, srlimit: batch, srnamespace: 6, sroffset: offset, format: "json" });
    if (!data.query?.search?.length) break;
    for (const item of data.query.search) {
      results.push({ title: item.title, pageid: item.pageid, snippet: item.snippet });
    }
    offset += batch;
    if (data.query.search.length < batch) break;
    await new Promise(r => setTimeout(r, 200)); // rate limit
  }
  return results;
}

async function getFileInfo(title) {
  const data = await apiFetch({ action: "query", titles: title, prop: "imageinfo", iiprop: "url|mime|size|extmetadata|user|timestamp", format: "json" });
  const pages = data.query?.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0];
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  const ext = info.extmetadata || {};
  return {
    title,
    pageid: page.pageid,
    url: info.url,
    mime: info.mime,
    width: info.width,
    height: info.height,
    size: info.size,
    user: info.user,
    timestamp: info.timestamp,
    licence: ext.LicenseShortName?.value || "unknown",
    licenceUrl: ext.LicenseUrl?.value || "",
    description: ext.ImageDescription?.value || "",
    attribution: ext.Attribution?.value || "",
    copyright: ext.Copyrighted?.value || "",
    categories: ext.Categories?.value || "",
  };
}

function isPermittedLicence(licence) {
  const l = licence.toLowerCase();
  return l.includes("cc0") || l.includes("public domain") || l.includes("cc by") && !l.includes("nc") && !l.includes("nd");
}

function safeFilename(title) {
  return title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
}

async function run() {
  const opts = parseArgs();
  console.log(`\n🔍 Wikimedia Commons Discovery — "${opts.query}" (limit: ${opts.limit})\n`);

  const discovered = await discover(opts.query, opts.limit);
  console.log(`  Discovered: ${discovered.length}`);

  const candidates = [];
  let downloaded = 0, skipped = 0, errors = 0;

  for (const item of discovered) {
    try {
      const info = await getFileInfo(item.title);
      if (!info) { skipped++; continue; }
      if (!info.mime?.startsWith("image/")) { skipped++; continue; }
      if (!isPermittedLicence(info.licence)) { skipped++; continue; }

      const filename = `${safeFilename(info.title)}.jpg`;
      const quarantinePath = join(QUARANTINE, filename);

      if (!opts.dryRun && info.url) {
        const res = await fetch(info.url, { headers: { "User-Agent": UA } });
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          writeFileSync(quarantinePath, buf);
          downloaded++;
        } else { errors++; continue; }
      }

      candidates.push({
        sourceId: `commons-${info.pageid}`,
        source: "wikimedia-commons",
        title: info.title,
        filename,
        url: info.url,
        mime: info.mime,
        width: info.width,
        height: info.height,
        creator: info.user,
        licence: info.licence,
        licenceUrl: info.licenceUrl,
        attribution: info.attribution,
        description: info.description.slice(0, 200),
        status: "downloaded-quarantined",
        discoveredAt: new Date().toISOString(),
        licenceReviewRequired: true,
        privacyReviewRequired: true,
      });
    } catch (e) { errors++; }
    await new Promise(r => setTimeout(r, 200));
  }

  // Write manifest
  writeFileSync(MANIFEST, JSON.stringify({ source: "wikimedia-commons", query: opts.query, discovered: discovered.length, candidates: candidates.length, downloaded, skipped, errors, candidates }, null, 2));
  console.log(`\n📊 Results: ${candidates.length} candidates, ${downloaded} downloaded, ${skipped} skipped, ${errors} errors`);
  console.log(`  Manifest: ${MANIFEST}`);
}

run().catch(e => { console.error("❌", e.message); process.exit(1); });
