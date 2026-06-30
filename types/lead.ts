import type { ProductType } from "./index";

export interface Lead {
  id: string;
  name?: string;
  contact?: string;
  interestProduct?: ProductType;
  note?: string;
  source: string;
  createdAt: string;
}
