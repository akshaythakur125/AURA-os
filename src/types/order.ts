import type { ProductType } from "./payment";

export type ManualOrderStatus =
  | "draft"
  | "payment_pending"
  | "payment_submitted"
  | "code_sent"
  | "unlocked"
  | "cancelled";

export interface ManualOrder {
  id: string;
  auditId: string;
  productType: ProductType;
  productName: string;
  amount: number;
  status: ManualOrderStatus;
  customerName?: string;
  customerContact?: string;
  upiId: string;
  upiTransactionRef?: string;
  userNote?: string;
  generatedUnlockCode?: string;
  createdAt: string;
  updatedAt: string;
  unlockedAt?: string;
}

export interface PaymentRequest {
  auditId: string;
  productType: ProductType;
  amount: number;
  upiId: string;
  customerName?: string;
  customerContact?: string;
  note?: string;
}

export interface OrderStats {
  totalOrders: number;
  paymentPending: number;
  paymentSubmitted: number;
  codeSent: number;
  unlockedOrders: number;
  cancelledOrders: number;
  totalExpectedRevenue: number;
  totalUnlockedRevenue: number;
  latestOrderDate: string | null;
}
