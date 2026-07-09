import type { ProductType } from "./index";

export type DiscountType = "percentage" | "fixed" | "free";

export interface OfferCode {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  label: string;
  expiresAt?: string;
  minAmount?: number;
  productTypes: ProductType[];
  maxUses?: number;
  currentUses?: number;
  isActive: boolean;
}

export interface OfferApplyResult {
  valid: boolean;
  message: string;
  offer?: OfferCode;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
}
