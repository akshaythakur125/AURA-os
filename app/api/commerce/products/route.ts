import { NextResponse } from "next/server";
import { WARDROBE_CATALOG } from "@/config/auraWardrobeCatalog";
import type { AuraStyleDirection, AuraLeakTag } from "@/types/commerce";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const style = url.searchParams.get("style");
  const leak = url.searchParams.get("leak");
  const maxBudget = url.searchParams.get("maxBudget");
  const query = url.searchParams.get("query")?.toLowerCase();

  let products = WARDROBE_CATALOG.filter((p) => p.isActive);

  if (category) {
    products = products.filter((p) => p.category === category);
  }
  if (style) {
    products = products.filter((p) => p.styleDirections.includes(style as AuraStyleDirection));
  }
  if (leak) {
    products = products.filter((p) => p.auraLeakTags.includes(leak as AuraLeakTag));
  }
  if (maxBudget) {
    const budget = parseInt(maxBudget, 10);
    if (!isNaN(budget)) {
      products = products.filter((p) => Math.min(...p.offers.map((o) => o.price)) <= budget);
    }
  }
  if (query) {
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({
    products: products.slice(0, 50),
    totalCount: products.length,
  });
}
