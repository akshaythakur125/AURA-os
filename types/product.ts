import type { AuditType, Goal, BudgetRange } from "@/types";

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
  | "service";

export interface Product {
  id: string;
  title: string;
  category: ProductCategory;
  price: number;
  priceLabel: string;
  description: string;
  whyItWorks: string;
  visualSignalImproved: string;
  statusLeakTags: string[];
  goalTags: Goal[];
  auditTypeTags: AuditType[];
  budgetTags: BudgetRange[];
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
  budgetRange: BudgetRange;
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

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  grooming: "Grooming",
  shoes: "Shoes",
  outfit: "Outfit",
  accessory: "Accessory",
  fragrance: "Fragrance",
  photo_setup: "Photo Setup",
  room: "Room",
  phone_accessory: "Phone Accessory",
  bag: "Bag",
  service: "Service",
};

export const CATEGORY_GRADIENTS: Record<ProductCategory, string> = {
  grooming: "from-emerald-600 to-teal-500",
  shoes: "from-blue-600 to-indigo-500",
  outfit: "from-purple-600 to-pink-500",
  accessory: "from-amber-600 to-orange-500",
  fragrance: "from-violet-600 to-purple-500",
  photo_setup: "from-cyan-600 to-blue-500",
  room: "from-teal-600 to-emerald-500",
  phone_accessory: "from-gray-600 to-slate-500",
  bag: "from-rose-600 to-pink-500",
  service: "from-indigo-600 to-violet-500",
};
