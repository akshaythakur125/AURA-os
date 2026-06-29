export type ProductCategory =
  | "grooming"
  | "shoes"
  | "outfit"
  | "accessory"
  | "fragrance"
  | "photo_setup"
  | "room"
  | "phone_accessory"
  | "bag"
  | "service"
  | "vendor";

export type StatusLeakTag =
  | "lighting"
  | "clarity"
  | "background"
  | "framing"
  | "color"
  | "resolution"
  | "grooming"
  | "outfit_fit"
  | "accessories"
  | "fragrance"
  | "phone_condition"
  | "room_clutter"
  | "posture";

export type GoalTag = "dating" | "instagram" | "college" | "office" | "glowup";

export type AuditTypeTag = "photo" | "instagram" | "dating" | "outfit" | "room";

export type BudgetTag = 0 | 2000 | 5000 | 10000 | 25000;

export interface Product {
  id: string;
  title: string;
  category: ProductCategory;
  price: number;
  priceLabel: string;
  description: string;
  whyItWorks: string;
  visualSignalImproved: string;
  statusLeakTags: StatusLeakTag[];
  goalTags: GoalTag[];
  auditTypeTags: AuditTypeTag[];
  budgetTags: BudgetTag[];
  priorityScore: number;
  affiliateUrl?: string;
  imageUrl?: string;
  isSponsored: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecommendedProduct {
  product: Product;
  matchScore: number;
  reason: string;
  linkedStatusLeak: string;
  estimatedImpact: string;
  priority: "high" | "medium" | "low";
}

export interface UpgradeBundle {
  budgetRange: number;
  totalEstimatedCost: number;
  products: RecommendedProduct[];
  freeActions: string[];
  expectedUpgradeText: string;
  statusRoiScore: number;
  avoidForNow: string[];
}

export interface AffiliateClick {
  id: string;
  productId: string;
  auditId?: string;
  source: string;
  clickedAt: string;
}

export interface AffiliateStats {
  totalClicks: number;
  clicksByProduct: Record<string, number>;
  clicksBySource: Record<string, number>;
  latestClickDate: string | null;
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  grooming: "Grooming",
  shoes: "Shoes",
  outfit: "Outfit Basics",
  accessory: "Accessories",
  fragrance: "Fragrance",
  photo_setup: "Photo Setup",
  room: "Room / Background",
  phone_accessory: "Phone Accessories",
  bag: "Bags",
  service: "Services",
  vendor: "Local Vendors",
};

export const CATEGORY_COLORS: Record<ProductCategory, string> = {
  grooming: "emerald",
  shoes: "blue",
  outfit: "purple",
  accessory: "amber",
  fragrance: "pink",
  photo_setup: "cyan",
  room: "orange",
  phone_accessory: "slate",
  bag: "violet",
  service: "rose",
  vendor: "indigo",
};
