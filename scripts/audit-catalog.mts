/**
 * Catalog integrity guard — run before deploy to guarantee no product
 * image/name/catalogue mismatch reaches users.
 *
 * Runs verifyCatalog() over the entire shop and exits non-zero if any HARD
 * issue exists (image out of category, colour mismatch, malformed or
 * category-less buy-link). Soft signals (colour gaps, where a named colour has
 * no exact photo and the resolver returns the closest in-category image) are
 * reported but never fail the build.
 *
 *   npm run shop:audit
 */
import { getAllLooks } from "@/lib/shop/catalog";
import { verifyCatalog } from "@/lib/shop/integrity";

const looks = getAllLooks();
const r = verifyCatalog(looks);

console.log(`Catalog integrity — ${looks.length} products`);
console.log(`  hard issues : ${r.issues.length}`);
console.log(`  colour gaps : ${r.colourGaps} (soft — closest in-category image)`);
console.log(`  no keywords : ${r.noKeywords} (soft)`);

if (r.issues.length > 0) {
  console.error(`\n❌ ${r.issues.length} hard mismatch issue(s) — these must be fixed before deploy:`);
  for (const i of r.issues.slice(0, 50)) {
    console.error(`  · [${i.kind}] ${i.id} "${i.title}" (${i.category}) — ${i.detail}`);
  }
  process.exit(1);
}

console.log("\n✅ No image/name/catalogue mismatches. Every product image is in-category and every buy-link carries its category.");
