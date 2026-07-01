import type { CommerceProduct, WardrobeCategory, StoreKey, ProductOffer } from "@/types/commerce";
import type { ValidationWarning } from "@/types/commerceAdmin";

const VALID_CATEGORIES: WardrobeCategory[] = [
  "tshirt", "shirt", "overshirt", "jeans", "trousers", "chinos",
  "sneakers", "formal_shoes", "watch", "belt", "sunglasses",
  "jacket", "hoodie", "kurta", "perfume", "grooming",
  "background_item", "photo_accessory", "jewellery", "wallet",
];

const VALID_STORE_KEYS: StoreKey[] = [
  "myntra", "ajio", "amazon_fashion", "flipkart_fashion", "tata_cliq",
  "nykaa_fashion", "meesho", "snitch", "souled_store", "bewakoof",
  "hm_india", "narzo_manual", "other",
];

export function validateProduct(product: CommerceProduct): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (!product.title?.trim()) {
    warnings.push({ productId: product.id, title: product.id, field: "title", message: "Product must have a title", severity: "error" });
  }

  if (!VALID_CATEGORIES.includes(product.category as WardrobeCategory)) {
    warnings.push({ productId: product.id, title: product.title, field: "category", message: `Invalid category "${product.category}"`, severity: "error" });
  }

  if (!product.styleDirections || product.styleDirections.length === 0) {
    warnings.push({ productId: product.id, title: product.title, field: "styleDirections", message: "At least one style direction required", severity: "error" });
  }

  if ((!product.auraLeakTags || product.auraLeakTags.length === 0) && (!product.goalTags || product.goalTags.length === 0)) {
    warnings.push({ productId: product.id, title: product.title, field: "auraLeakTags", message: "At least one auraLeakTag or goalTag required", severity: "warning" });
  }

  if (!product.offers || product.offers.length === 0) {
    warnings.push({ productId: product.id, title: product.title, field: "offers", message: "Product has no offers", severity: "warning" });
  }

  for (const offer of product.offers || []) {
    if (typeof offer.price !== "number" || offer.price <= 0) {
      warnings.push({ productId: product.id, title: product.title, field: "offers", message: `Offer "${offer.productName}" has invalid price ${offer.price}`, severity: "error" });
    }

    if (offer.mrp !== undefined && offer.mrp > 0 && offer.price > offer.mrp) {
      warnings.push({ productId: product.id, title: product.title, field: "offers", message: `Offer "${offer.productName}" price (₹${offer.price}) exceeds MRP (₹${offer.mrp})`, severity: "warning" });
    }

    if (!VALID_STORE_KEYS.includes(offer.storeKey)) {
      warnings.push({ productId: product.id, title: product.title, field: "offers", message: `Invalid storeKey "${offer.storeKey}"`, severity: "error" });
    }

    if (offer.affiliateUrl && offer.affiliateUrl !== "#") {
      try { new URL(offer.affiliateUrl); } catch {
        warnings.push({ productId: product.id, title: product.title, field: "offers", message: `Invalid affiliateUrl "${offer.affiliateUrl}"`, severity: "warning" });
      }
    }

    if (offer.url && offer.url !== "#") {
      try { new URL(offer.url); } catch {
        warnings.push({ productId: product.id, title: product.title, field: "offers", message: `Invalid url "${offer.url}"`, severity: "warning" });
      }
    }
  }

  if (product.isSponsored && (!product.auraLeakTags || product.auraLeakTags.length === 0) && (!product.goalTags || product.goalTags.length === 0)) {
    warnings.push({ productId: product.id, title: product.title, field: "isSponsored", message: "Sponsored product lacks relevance tags for matching", severity: "warning" });
  }

  return warnings;
}

export function validateCatalog(products: CommerceProduct[]): ValidationWarning[] {
  return products.flatMap(validateProduct);
}

export function getInactiveProducts(products: CommerceProduct[]): CommerceProduct[] {
  return products.filter((p) => !p.isActive);
}

export function getProductsWithBrokenLinks(products: CommerceProduct[]): { product: CommerceProduct; offer: ProductOffer }[] {
  const result: { product: CommerceProduct; offer: ProductOffer }[] = [];
  for (const p of products) {
    for (const o of p.offers || []) {
      if (!o.url || o.url === "#") {
        result.push({ product: p, offer: o });
      }
    }
  }
  return result;
}

export function getProductsWithPriceIssues(products: CommerceProduct[]): { product: CommerceProduct; offer: ProductOffer }[] {
  const result: { product: CommerceProduct; offer: ProductOffer }[] = [];
  for (const p of products) {
    for (const o of p.offers || []) {
      if (o.mrp && o.mrp > 0 && o.price > o.mrp) {
        result.push({ product: p, offer: o });
      }
    }
  }
  return result;
}
