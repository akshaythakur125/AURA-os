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

export interface StoredUnlock {
  auditId: string;
  code: string;
  email: string;
  createdAt: string;
  verified: boolean;
}
