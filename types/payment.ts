export interface UnlockRecord {
  id: string;
  auditId: string;
  product: string;
  transactionRef?: string;
  unlockCode: string;
  status: "unlocked";
  unlockedAt: string;
}
