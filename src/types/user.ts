export type AgeRange = "under-18" | "18-21" | "22-25" | "26-30" | "31-plus";

export interface LocalUser {
  id: string;
  displayName?: string;
  city?: string;
  ageRange?: AgeRange;
  createdAt: string;
  updatedAt: string;
}
