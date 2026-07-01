import type { CommerceProduct, ProductOffer, WardrobeCategory, AuraStyleDirection, AuraLeakTag, StoreKey, AvailabilityStatus } from "@/types/commerce";
import type { ImportResult } from "@/types/commerceAdmin";
import { validateProduct } from "./catalogValidation";

function generateId(title: string): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "");
  const ts = Date.now().toString(36);
  return `${slug}_${ts}`;
}

function parseBool(val: string | undefined | boolean): boolean {
  if (typeof val === "boolean") return val;
  if (!val) return false;
  return ["true", "1", "yes"].includes(val.toLowerCase().trim());
}

function parseArray(val: string | undefined): string[] {
  if (!val) return [];
  return val.split(",").map((s) => s.trim()).filter(Boolean);
}

export function parseCSVRow(row: Record<string, string | undefined>, lineNum: number): { product: CommerceProduct | null; errors: string[] } {
  const errors: string[] = [];
  const title = row.title?.trim();
  if (!title) {
    errors.push(`Line ${lineNum}: Missing title`);
    return { product: null, errors };
  }

  const category = (row.category?.trim() || "tshirt") as WardrobeCategory;
  const styleDirections = parseArray(row.styleDirections) as AuraStyleDirection[];
  const auraLeakTags = parseArray(row.auraLeakTags) as AuraLeakTag[];
  const goalTags = parseArray(row.goalTags);
  const colorTags = parseArray(row.colorTags);
  const fitTags = parseArray(row.fitTags);

  const price = parseInt(row.price || "0", 10);
  if (isNaN(price) || price <= 0) {
    errors.push(`Line ${lineNum}: Invalid price`);
  }

  const mrp = row.mrp ? parseInt(row.mrp, 10) : undefined;
  const storeKey = (row.storeKey?.trim() || "other") as StoreKey;
  const storeName = row.storeName?.trim() || storeKey;
  const productName = row.productName?.trim() || title;
  const url = row.url?.trim() || "#";
  const affiliateUrl = row.affiliateUrl?.trim() || undefined;
  const availabilityStatus: AvailabilityStatus = (row.availabilityStatus?.trim() as AvailabilityStatus) || "available";
  const isAffiliate = parseBool(row.isAffiliate);
  const offerSponsored = parseBool(row.offerSponsored);

  const discountPercent = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : undefined;

  const id = generateId(title);
  const now = new Date().toISOString();

  const offer: ProductOffer = {
    id: `${id}_offer`,
    storeKey,
    storeName,
    productName,
    price,
    mrp,
    discountPercent,
    url,
    affiliateUrl,
    availabilityStatus,
    sizeNotes: row.sizeNotes || undefined,
    colorNotes: row.colorNotes || undefined,
    lastCheckedText: "Imported from CSV",
    isAffiliate,
    isSponsored: offerSponsored,
    updatedAt: now,
  };

  const product: CommerceProduct = {
    id,
    title,
    category,
    styleDirections: styleDirections.length > 0 ? styleDirections : ["clean_basic"],
    auraLeakTags,
    goalTags,
    colorTags,
    fitTags,
    description: row.description || "",
    whyItImprovesAura: row.whyItImprovesAura || "",
    stylingTip: row.stylingTip || "",
    avoidIf: row.avoidIf || undefined,
    priorityScore: parseInt(row.priorityScore || "50", 10) || 50,
    isSponsored: parseBool(row.isSponsored),
    isActive: parseBool(row.isActive ?? true),
    offers: [offer],
    createdAt: now,
    updatedAt: now,
  };

  if (errors.length > 0) return { product: null, errors };

  const validationErrors = validateProduct(product);
  for (const ve of validationErrors) {
    if (ve.severity === "error") errors.push(`Line ${lineNum}: ${ve.message}`);
  }

  if (errors.length > 0) return { product: null, errors };

  return { product, errors: [] };
}

export function parseJSONImport(data: string): ImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const products: CommerceProduct[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch (e) {
    return { success: false, importedCount: 0, skippedCount: 0, errors: [`Invalid JSON: ${(e as Error).message}`], warnings: [], products: [] };
  }

  const input = Array.isArray(parsed) ? parsed : [parsed];
  const now = new Date().toISOString();

  for (let i = 0; i < input.length; i++) {
    const item = input[i] as Record<string, unknown>;
    if (!item || typeof item !== "object") {
      errors.push(`Item ${i}: invalid object`);
      continue;
    }

    try {
      const id = (item.id as string) || generateId((item.title as string) || `imported_${i}`);
      const product: CommerceProduct = {
        id,
        title: (item.title as string) || `Imported Product ${i}`,
        category: (item.category as WardrobeCategory) || "tshirt",
        styleDirections: (item.styleDirections as AuraStyleDirection[]) || ["clean_basic"],
        auraLeakTags: (item.auraLeakTags as AuraLeakTag[]) || [],
        goalTags: (item.goalTags as string[]) || [],
        colorTags: (item.colorTags as string[]) || [],
        fitTags: (item.fitTags as string[]) || [],
        description: (item.description as string) || "",
        whyItImprovesAura: (item.whyItImprovesAura as string) || "",
        stylingTip: (item.stylingTip as string) || "",
        avoidIf: item.avoidIf as string | undefined,
        priorityScore: (item.priorityScore as number) || 50,
        isSponsored: !!(item.isSponsored),
        isActive: item.isActive !== false,
        offers: ((item.offers as ProductOffer[]) || []).map((o: ProductOffer) => ({
          ...o,
          discountPercent: o.mrp && o.mrp > o.price ? Math.round(((o.mrp - o.price) / o.mrp) * 100) : undefined,
          updatedAt: o.updatedAt || now,
          lastCheckedText: o.lastCheckedText || "Imported",
        })),
        createdAt: (item.createdAt as string) || now,
        updatedAt: now,
      };

      const pErrors = validateProduct(product);
      const fatal = pErrors.filter((e) => e.severity === "error");
      if (fatal.length > 0) {
        errors.push(`Item ${i} "${product.title}": ${fatal.map((e) => e.message).join("; ")}`);
        continue;
      }

      for (const w of pErrors.filter((e) => e.severity === "warning")) {
        warnings.push(`Item ${i} "${product.title}": ${w.message}`);
      }

      products.push(product);
    } catch (e) {
      errors.push(`Item ${i}: ${(e as Error).message}`);
    }
  }

  return {
    success: true,
    importedCount: products.length,
    skippedCount: input.length - products.length,
    errors,
    warnings,
    products,
  };
}

export function exportToJSON(products: CommerceProduct[]): string {
  return JSON.stringify(products, null, 2);
}

export function exportToCSV(products: CommerceProduct[]): string {
  const headers = [
    "title", "category", "styleDirections", "auraLeakTags", "goalTags",
    "colorTags", "fitTags", "description", "whyItImprovesAura", "stylingTip",
    "avoidIf", "priorityScore", "isSponsored", "isActive",
    "storeKey", "storeName", "productName", "price", "mrp", "url",
    "affiliateUrl", "availabilityStatus", "sizeNotes", "colorNotes",
    "isAffiliate", "offerSponsored",
  ];

  const rows: string[] = [headers.join(",")];

  for (const p of products) {
    for (const o of p.offers || []) {
      const row = [
        csvEscape(p.title),
        p.category,
        csvEscape(p.styleDirections.join(",")),
        csvEscape(p.auraLeakTags.join(",")),
        csvEscape(p.goalTags.join(",")),
        csvEscape(p.colorTags.join(",")),
        csvEscape(p.fitTags.join(",")),
        csvEscape(p.description),
        csvEscape(p.whyItImprovesAura),
        csvEscape(p.stylingTip),
        csvEscape(p.avoidIf || ""),
        p.priorityScore.toString(),
        p.isSponsored ? "true" : "false",
        p.isActive ? "true" : "false",
        o.storeKey,
        csvEscape(o.storeName),
        csvEscape(o.productName),
        o.price.toString(),
        o.mrp ? o.mrp.toString() : "",
        csvEscape(o.url),
        csvEscape(o.affiliateUrl || ""),
        o.availabilityStatus,
        csvEscape(o.sizeNotes || ""),
        csvEscape(o.colorNotes || ""),
        o.isAffiliate ? "true" : "false",
        o.isSponsored ? "true" : "false",
      ];
      rows.push(row.join(","));
    }
  }

  return rows.join("\n");
}

export function exportAffiliateLinksCSV(products: CommerceProduct[]): string {
  const headers = ["productId", "title", "category", "storeKey", "storeName", "affiliateUrl", "isActive"];
  const rows: string[] = [headers.join(",")];

  for (const p of products) {
    for (const o of p.offers || []) {
      if (o.affiliateUrl) {
        rows.push([p.id, csvEscape(p.title), p.category, o.storeKey, csvEscape(o.storeName), csvEscape(o.affiliateUrl), p.isActive ? "true" : "false"].join(","));
      }
    }
  }

  return rows.join("\n");
}

export function exportSponsoredCSV(products: CommerceProduct[]): string {
  const headers = ["productId", "title", "category", "priorityScore", "storeKey", "storeName", "price", "url", "isActive"];
  const rows: string[] = [headers.join(",")];

  for (const p of products.filter((p) => p.isSponsored)) {
    for (const o of p.offers || []) {
      rows.push([p.id, csvEscape(p.title), p.category, p.priorityScore.toString(), o.storeKey, csvEscape(o.storeName), o.price.toString(), csvEscape(o.url), p.isActive ? "true" : "false"].join(","));
    }
  }

  return rows.join("\n");
}

function csvEscape(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function mergeProducts(existing: CommerceProduct[], incoming: CommerceProduct[], mergeByTitle: boolean = true): CommerceProduct[] {
  const merged = [...existing];

  for (const inc of incoming) {
    const match = merged.find((p) => {
      if (mergeByTitle) return p.title.toLowerCase() === inc.title.toLowerCase();
      return p.id === inc.id;
    });

    if (match) {
      for (const offer of inc.offers) {
        const existingOffer = match.offers.find((o) => o.storeKey === offer.storeKey && o.productName === offer.productName);
        if (!existingOffer) {
          match.offers.push(offer);
        }
      }
      if (!match.description && inc.description) match.description = inc.description;
      if (!match.whyItImprovesAura && inc.whyItImprovesAura) match.whyItImprovesAura = inc.whyItImprovesAura;
      if (!match.stylingTip && inc.stylingTip) match.stylingTip = inc.stylingTip;
    } else {
      merged.push(inc);
    }
  }

  return merged;
}
