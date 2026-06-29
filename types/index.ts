export type AuditType = "photo" | "profile" | "dating" | "full";

export interface Audit {
  id: string;
  type: AuditType;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  displayName?: string;
  city?: string;
}
