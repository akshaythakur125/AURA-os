import type { ProductType } from "./payment";

export interface OfferCode {
  code: string;
  description: string;
  discountType: "flat" | "percent";
  discountValue: number;
  applicableProducts: ProductType[];
  minAmount?: number;
  expiresAt?: string;
  isActive: boolean;
}

export interface OfferApplication {
  productType: ProductType;
  originalAmount: number;
  code: string;
  discountAmount: number;
  finalAmount: number;
  message: string;
  isValid: boolean;
}
