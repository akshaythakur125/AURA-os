export type ProductType = "quick_fix" | "aura_report" | "dating_audit" | "glowup_plan";

export interface ProductConfig {
  type: ProductType;
  name: string;
  amount: number;
  description: string;
  unlockCodePrefix: string;
}

const PRODUCTS: Record<ProductType, ProductConfig> = {
  quick_fix: {
    type: "quick_fix",
    name: "Quick Aura Fix",
    amount: 25,
    description: "Biggest status leak and fastest fix path",
    unlockCodePrefix: "FIX",
  },
  aura_report: {
    type: "aura_report",
    name: "Full Aura Report",
    amount: 44,
    description: "Full visual breakdown and budget upgrade plan",
    unlockCodePrefix: "AURA",
  },
  dating_audit: {
    type: "dating_audit",
    name: "Dating/Profile Audit",
    amount: 299,
    description:
      "Profile presentation score, bio/prompt feedback, and photo order strategy",
    unlockCodePrefix: "DATE",
  },
  glowup_plan: {
    type: "glowup_plan",
    name: "30-Day Reset",
    amount: 499,
    description:
      "30-day presentation upgrade system",
    unlockCodePrefix: "GLOW",
  },
};

export function getProductConfig(type: ProductType): ProductConfig {
  const product = PRODUCTS[type];
  if (!product) throw new Error(`Unknown product type: ${type}`);
  return product;
}

export function getAllProducts(): ProductConfig[] {
  return Object.values(PRODUCTS);
}

export function isValidProductType(type: string): type is ProductType {
  return type in PRODUCTS;
}
