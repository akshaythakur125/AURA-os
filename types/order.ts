import type { ProductType } from "@/types";

export type OrderStatus =
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
  originalAmount?: number;
  discountCode?: string;
  discountAmount?: number;
  finalAmount?: number;
  status: OrderStatus;
  customerName?: string;
  customerContact?: string;
  upiId: string;
  upiTransactionRef?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  paymentMethod?: "upi" | "razorpay";
  userNote?: string;
  generatedUnlockCode?: string;
  createdAt: string;
  updatedAt: string;
  unlockedAt?: string;
}

export interface OrderStats {
  totalOrders: number;
  paymentPending: number;
  paymentSubmitted: number;
  unlockedOrders: number;
  cancelledOrders: number;
  totalExpectedRevenue: number;
  totalUnlockedRevenue: number;
  latestOrderDate: string | null;
}
