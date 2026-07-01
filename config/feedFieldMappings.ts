import type { FeedMapping } from "@/types/feedImport";

export const COMMON_COLUMN_MAPPINGS: Record<string, string[]> = {
  title: ["title", "product_name", "name", "item_name", "product_title", "productname"],
  price: ["price", "selling_price", "sale_price", "current_price", "final_price", "offer_price", "discounted_price"],
  mrp: ["mrp", "original_price", "list_price", "maximum_retail_price", "full_price", "strike_price", "was_price"],
  productUrl: ["url", "product_url", "link", "deeplink", "product_link", "producturl"],
  affiliateUrl: ["affiliate_url", "affiliate_link", "tracking_link", "deeplink", "pixel_link", "click_url"],
  imageUrl: ["image", "image_url", "image_link", "thumbnail", "img_url", "product_image"],
  storeKey: ["store", "merchant", "retailer", "platform", "seller", "vendor"],
  storeName: ["store_name", "merchant_name", "retailer_name", "seller_name"],
  category: ["category", "product_category", "cat", "item_category", "product_type"],
  subCategory: ["subcategory", "sub_category", "subcat", "item_subcategory"],
  brand: ["brand", "brand_name", "brandname", "manufacturer"],
  availabilityStatus: ["availability", "stock_status", "stock", "in_stock", "quantity"],
  sourceProductId: ["id", "product_id", "sku", "item_id", "variant_id", "offer_id"],
  color: ["color", "colour", "product_color"],
  fit: ["fit", "fit_type", "size_fit"],
  material: ["material", "fabric", "fabric_type", "composition"],
  styleTags: ["style", "style_tags", "style_direction", "tags"],
  auraLeakTags: ["aura_leak", "aura_leak_tags", "leak_tags"],
  goalTags: ["goal", "goal_tags", "use_case"],
};

export function detectFieldMapping(headers: string[]): FeedMapping[] {
  const mappings: FeedMapping[] = [];
  const matchedColumns = new Set<string>();

  for (const header of headers) {
    const lower = header.toLowerCase().trim();
    let matched = false;

    for (const [targetField, aliases] of Object.entries(COMMON_COLUMN_MAPPINGS)) {
      if (aliases.includes(lower)) {
        mappings.push({
          sourceColumn: header,
          targetField,
          required: targetField === "title" || targetField === "price" || targetField === "productUrl",
        });
        matchedColumns.add(header);
        matched = true;
        break;
      }
    }

    if (!matched) {
      mappings.push({
        sourceColumn: header,
        targetField: header.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
        required: false,
      });
    }
  }

  return mappings;
}

export function getRequiredFields(): string[] {
  return ["title", "price"];
}

export function getRecommendedFields(): string[] {
  return ["productUrl", "storeKey", "category", "brand", "mrp", "imageUrl"];
}
