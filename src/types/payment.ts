export type ProductType = "aura_report" | "dating_audit" | "glowup_plan";

export interface UnlockRecord {
  id: string;
  auditId: string;
  productType: ProductType;
  amount: number;
  status: "pending" | "unlocked" | "failed";
  transactionReference?: string;
  unlockCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnlockRecordInput {
  auditId: string;
  productType: ProductType;
  transactionReference?: string;
  unlockCode?: string;
}

export interface UnlockRequest {
  auditId: string;
  name: string;
  email: string;
  upiTransactionId: string;
}

export interface UnlockResult {
  success: boolean;
  code?: string;
  message: string;
}

export interface PaymentInfo {
  upiId: string;
  amount: number;
  currency: string;
  note: string;
}
