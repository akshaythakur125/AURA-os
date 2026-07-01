import type { CommerceProduct } from "@/types/commerce";
import type { CommerceSearchItem } from "@/types/commerceSearch";
import type { ConnectorSourceType } from "@/types/storeConnector";
import { computeFreshness } from "@/types/priceFreshness";
import { computeFreshnessFromSource } from "@/types/priceFreshness";
import { buildSearchTokensForItem } from "./tokenizeProduct";
import { buildComparableGroupKey } from "./similarProductGrouping";

export interface ProductSource {
  type: "commerce_product" | "commerce_offer" | "raw";
}

export function normalizeCommerceProduct(
  product: CommerceProduct,
  sourceType: ConnectorSourceType = "manual",
  sourceName: string = "AuraCheck Catalog"
): CommerceSearchItem[] {
  if (!product.offers || product.offers.length === 0) {
    const freshness = sourceType === "manual" ? computeFreshnessFromSource("manual") : computeFreshness(null);
    const normalized: CommerceSearchItem = {
      id: `${product.id}__no_offer`,
      sourceProductId: product.id,
      normalizedTitle: product.title.toLowerCase().trim(),
      originalTitle: product.title,
      category: product.category,
      storeKey: "other",
      storeName: "Unknown Store",
      brand: undefined,
      colorTags: product.colorTags || [],
      styleTags: product.styleDirections || [],
      auraLeakTags: product.auraLeakTags || [],
      goalTags: product.goalTags || [],
      fitTags: product.fitTags || [],
      materialTags: undefined,
      genderPresentationTags: product.genderPresentationTags,
      price: 0,
      mrp: undefined,
      discountPercent: undefined,
      currency: "INR",
      productUrl: "#",
      affiliateUrl: undefined,
      imageUrl: undefined,
      availabilityStatus: "unknown",
      sourceType,
      sourceName,
      priceFreshness: freshness.status,
      lastCheckedAt: undefined,
      lastCheckedText: freshness.lastCheckedText,
      confidenceScore: 50,
      searchTokens: [],
      comparableGroupKey: "",
      isSponsored: product.isSponsored || false,
      isAffiliate: false,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
    normalized.searchTokens = buildSearchTokensForItem(normalized);
    normalized.comparableGroupKey = buildComparableGroupKey(normalized);
    return [normalized];
  }

  return product.offers.map((offer) => {
    const freshness = offer.lastCheckedText
      ? computeFreshness(offer.updatedAt)
      : computeFreshnessFromSource(sourceType);

    const discount = offer.discountPercent !== undefined
      ? offer.discountPercent
      : (offer.mrp && offer.mrp > offer.price
        ? Math.round(((offer.mrp - offer.price) / offer.mrp) * 100)
        : undefined);

    const normalized: CommerceSearchItem = {
      id: `${product.id}__${offer.id}`,
      sourceProductId: product.id,
      normalizedTitle: product.title.toLowerCase().trim(),
      originalTitle: product.title,
      category: product.category,
      subCategory: undefined,
      storeKey: offer.storeKey,
      storeName: offer.storeName,
      brand: undefined,
      colorTags: product.colorTags || [],
      styleTags: product.styleDirections || [],
      auraLeakTags: product.auraLeakTags || [],
      goalTags: product.goalTags || [],
      fitTags: product.fitTags || [],
      materialTags: undefined,
      genderPresentationTags: product.genderPresentationTags,
      price: offer.price,
      mrp: offer.mrp,
      discountPercent: discount,
      currency: "INR",
      productUrl: offer.url,
      affiliateUrl: offer.affiliateUrl,
      imageUrl: undefined,
      availabilityStatus: offer.availabilityStatus,
      sourceType,
      sourceName,
      priceFreshness: freshness.status,
      lastCheckedAt: offer.updatedAt,
      lastCheckedText: freshness.lastCheckedText,
      confidenceScore: 80,
      searchTokens: [],
      comparableGroupKey: "",
      isSponsored: product.isSponsored || offer.isSponsored || false,
      isAffiliate: offer.isAffiliate || false,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    normalized.searchTokens = buildSearchTokensForItem(normalized);
    normalized.comparableGroupKey = buildComparableGroupKey(normalized);
    return normalized;
  });
}

export function normalizeRawProduct(input: {
  sourceProductId: string;
  normalizedTitle: string;
  originalTitle: string;
  category: string;
  subCategory?: string;
  storeKey: string;
  storeName: string;
  brand?: string;
  colorTags?: string[];
  styleTags?: string[];
  auraLeakTags?: string[];
  goalTags?: string[];
  fitTags?: string[];
  materialTags?: string[];
  genderPresentationTags?: string[];
  price: number;
  mrp?: number;
  currency?: string;
  productUrl: string;
  affiliateUrl?: string;
  imageUrl?: string;
  availabilityStatus?: string;
  isSponsored?: boolean;
  isAffiliate?: boolean;
  sourceType?: string;
  sourceName?: string;
  lastCheckedAt?: string;
}): CommerceSearchItem | null {
  try {
    const price = Math.round(input.price);
    const mrp = input.mrp ? Math.round(input.mrp) : undefined;
    const discount = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : undefined;

    const freshness = input.lastCheckedAt
      ? computeFreshness(input.lastCheckedAt)
      : computeFreshnessFromSource(input.sourceType || "manual");

    const item: CommerceSearchItem = {
      id: `raw__${input.sourceProductId}__${input.storeKey}__${Date.now()}`,
      sourceProductId: input.sourceProductId,
      normalizedTitle: input.normalizedTitle.toLowerCase().trim(),
      originalTitle: input.originalTitle,
      category: input.category as CommerceSearchItem["category"],
      subCategory: input.subCategory,
      storeKey: input.storeKey as CommerceSearchItem["storeKey"],
      storeName: input.storeName,
      brand: input.brand,
      colorTags: input.colorTags || [],
      styleTags: input.styleTags || [],
      auraLeakTags: input.auraLeakTags as CommerceSearchItem["auraLeakTags"] || [],
      goalTags: input.goalTags || [],
      fitTags: input.fitTags || [],
      materialTags: input.materialTags,
      genderPresentationTags: input.genderPresentationTags,
      price,
      mrp,
      discountPercent: discount,
      currency: "INR",
      productUrl: input.productUrl,
      affiliateUrl: input.affiliateUrl,
      imageUrl: input.imageUrl,
      availabilityStatus: (input.availabilityStatus as CommerceSearchItem["availabilityStatus"]) || "unknown",
      sourceType: (input.sourceType as ConnectorSourceType) || "manual",
      sourceName: input.sourceName || input.storeName,
      priceFreshness: freshness.status,
      lastCheckedAt: input.lastCheckedAt,
      lastCheckedText: freshness.lastCheckedText,
      confidenceScore: input.sourceType === "official_api" ? 90 : 60,
      searchTokens: [],
      comparableGroupKey: "",
      isSponsored: input.isSponsored || false,
      isAffiliate: input.isAffiliate || false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    item.searchTokens = buildSearchTokensForItem(item);
    item.comparableGroupKey = buildComparableGroupKey(item);
    return item;
  } catch {
    return null;
  }
}
