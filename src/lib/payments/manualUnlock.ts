import { config } from "@/config";

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

export function validateUnlockCode(code: string): boolean {
  return code === config.payments.adminUnlockCode;
}

export function createUnlockRequest(request: UnlockRequest): UnlockResult {
  if (!request.upiTransactionId || request.upiTransactionId.length < 6) {
    return {
      success: false,
      message:
        "Please provide a valid UPI transaction reference (min 6 characters).",
    };
  }

  const code = `AURA-${request.auditId.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  return {
    success: true,
    code,
    message:
      "Your unlock request has been received. Admin will verify your payment and activate your report.",
  };
}

export function getPaymentInfo() {
  return {
    upiId: config.payments.upiId,
    amount: config.pricing.premium,
    currency: config.pricing.currency,
    note: "AuraCheck Premium Report",
  };
}
